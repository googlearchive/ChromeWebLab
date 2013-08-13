/*
    Copyright 2013 Google Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
var Canvas = require('canvas'),
    Image = Canvas.Image;
var mootools = require('mootools');
var net = require('net');
var sys = require('sys');
var ConfigParams = require('./ConfigParams').ConfigParams;
var labqueueClient = ConfigParams.LABQUEUE_USE_HTTPS ? require('https') : require('http');
var url = require('url');
var fs = require('fs');

var BezierTracer = require('./BezierTracer').BezierTracer;

var ColourOps = require('./ColourOps').ColourOps;
var SimpleTrig = require('./SimpleTrig').SimpleTrig;

exports.BitmapImageProcessor = new Class({

    Implements: [Options, Events, process.EventEmitter],

    options: {
        maxWidth: 200,
        maxHeight: 200,

        tolerance: 18,
        surround: 24,
    },

    //
    // public methods
    //
    initialize: function(options) {
        this.setOptions(options);

        this.bezierTracer = new BezierTracer();

        this.colourOps = new ColourOps();
        this.polyLines = null;

        this.horizontalBezierFlip = false;
    },

    processDiskFile: function(imageLoc) {
        fs.readFile(imageLoc, function(err, fileRef) {
            if (err) throw err;

            this.useImg = new Image;
            this.useImg.src = fileRef;

            console.log("Setting up canvas with initial image");
            this.starterCanvas = new Canvas(this.useImg.width, this.useImg.height);
            this.ctx = this.starterCanvas.getContext('2d');
            this.ctx.drawImage(this.useImg, 0, 0);

            console.log("desaturating image");
            this._processSource_desaturate(this.starterCanvas);

            console.log("scaling down image");
            this.scaleTarget = new Canvas(ConfigParams.DRAWING_WIDTH_PX, ConfigParams.DRAWING_HEIGHT_PX);
            this.scaled = this._processSource_scale(this.starterCanvas, this.scaleTarget);

            this._processSource_adaptThresholds(this.scaled, this.options.tolerance, this.options.surround);

            this._processSource_thresholdedImages();

            /*
			// debug - dump poly lines to console
			console.log('============================================');
			console.dir(this.polyLines);
			console.log('============================================');
			*/

            console.log("BitmapImageProcessor: produced " + this.polyLines.length + " lines");
            var prog_str = this.bezierTracer.getBezierPreMachineCode(this.polyLines); //convert poly lines to sketchbot-compatible command string

            /*
			// debug - dump machine code
			console.log('============================================');
			console.dir(prog_str);
			console.log('============================================');
			*/

            this.emit('processComplete', prog_str, this); // all done!

        }.bind(this));
    },

    setHorizontalBezierFlip: function(flip) {
        this.horizontalBezierFlip = flip;
    },

    //
    // private methods
    //

    _processSource_desaturate: function(img) {
        //desaturate the image
        this.colourOps.resetCache(img);
        this.colourOps.saturation(img, -1);
    },

    _processSource_scale: function(canvasToScale, canvasWithDimensions) {
        /////////////////////////////////////////
        //Scaling down image
        ////////////////////////////////////////
        this.scaleRatio = 1;

        if (canvasWithDimensions.width > this.options.maxWidth) {
            this.scaleRatio = this.options.maxWidth / canvasWithDimensions.width;
        } else if (canvasWithDimensions.height > canvasToScale.maxHeight) {
            this.scaleRatio = this.options.maxHeight / canvasWithDimensions.height;
        }

        var original = new Canvas(canvasToScale.width, canvasToScale.height);
        var originalCtx = original.getContext('2d');

        var scaled = new Canvas(canvasToScale.width * this.scaleRatio, canvasToScale.height * this.scaleRatio);
        var scaledCtx = scaled.getContext('2d');

        originalCtx.drawImage(canvasToScale, 0, 0, canvasToScale.width, canvasToScale.height);

        scaledCtx.scale(1, -1);
        scaledCtx.translate(0, -scaled.height);

        scaledCtx.drawImage(original, 0, 0, original.width, original.height, 0, 0, scaled.width, scaled.height);
        scaledCtx.restore();
        return scaled;
    },

    _processSource_thresholdedImages: function() {
        //////////////////////////////////////////////////////////////////////////////////////////
        //send the oval 2 thresholded canvases and compute code for them
        //////////////////////////////////////////////////////////////////////////////////////////			
        console.log("Starting processing of thresholded images");
        var ctx1 = this.scaled.getContext('2d'); //was this.cropped, but that I think is wrong (ASM)

        // var preserveAreas = this.getPreserveRects();
        var polyResult = this.bezierTracer.getPolyPaths(ctx1, [{
            x: 0,
            y: 0,
            w: 1000,
            h: 1000
        }]);
        this.polyLines = polyResult.polyPathData;
        console.log("PolyPathData has " + this.polyLines.length + " lines after _processSource_thresholdedImages()");

        this.polyLines = this.removeEggPoints(this.polyLines, ctx1);

        if (this.horizontalBezierFlip) {
            //console.log("Flipping the drawing horizontally because drawing is from museum");
            console.log("Flipping the drawing horizontally.");
            this.applyPathFlip(this.polyLines, true, false);
        }

        //this.drawPolyPath.delay(1000, this, [polyLines, '#ec967b', 500]);
    },

    applyPathFlip: function(polyPath, xflip, yflip) {

        var widest = 0;
        var tallest = 0;
        //find the dimensions of this image	
        for (var i = 0; i < polyPath.length; i++) {
            var path = polyPath[i];
            for (var j = 0; j < path.length; j++) {
                var point = path[j];
                if (point.x > widest) widest = point.x;
                if (point.y > tallest) tallest = point.y;
            }
        }
        for (var i = 0; i < polyPath.length; i++) {
            var path = polyPath[i];
            for (var j = 0; j < path.length; j++) {
                var point = path[j];
                if (xflip) point.x = widest - point.x;
                if (yflip) point.y = tallest - point.y;
            }
        }
        console.log("done flipping");
    },

    removeEggPoints: function(paths, ctx) {
        // find points on a circle
        var p, yRatio = ctx.canvas.height / ctx.canvas.width;
        var edgePoints = SimpleTrig.getPointsOnACircle(ctx.canvas.width / 2, {
            x: ctx.canvas.width / 2,
            y: ctx.canvas.width / 2
        }, 200);

        // scale points to oval
        for (var i = 0, n = edgePoints.length; i < n; ++i) {
            edgePoints[i].y *= yRatio;
            //if (this.elipseY<0) edgePoints[i].y -= this.elipseY*yRatio;
        }

        // cycle through paths, only keeping points not within the radius
        var rad = 4; // radius in pixels
        var tempPaths = [];

        for (var i = 0, n = paths.length; i < n; ++i) {
            var path = paths[i];
            tempPaths[i] = [];

            for (var j = 0, m = path.length; j < m; ++j) {
                var point = path[j];
                var keep = true;

                // cycle through all oval points to check against (brute force?)
                for (var l = 0, o = edgePoints.length; l < o; ++l) {
                    var nearX = edgePoints[l].x > point.x - rad && edgePoints[l].x < point.x + rad;
                    var nearY = edgePoints[l].y > point.y - rad && edgePoints[l].y < point.y + rad;

                    if (nearX && nearY) {
                        keep = false;
                        // console.log('point:', point.x.toFixed(2), ',', point.y.toFixed(2), 'near:', edgePoints[l].x.toFixed(2), edgePoints[l].y.toFixed(2), 'within', rad);
                        break;
                    }
                }

                if (keep) {
                    var newPoint = {
                        x: paths[i][j].x,
                        y: paths[i][j].y
                    };
                    tempPaths[i].push(newPoint);
                }
            }
        }

        // var elipsePath = [];
        // for (var i=0, n=edgePoints.length; i < n; ++i) {  elipsePath.push(edgePoints[i]);  }
        // tempPaths.push(elipsePath);

        paths = tempPaths.slice();


        // cycle through paths, splitting paths when distances from one point to the next
        // are large (fixes straggly "noodles" issue)

        for (var i = 0, n = paths.length; i < n; ++i) {
            var path = paths[i];
            var j = 1;
            var m = path.length;

            while (j < m) {
                var point = path[j];
                var prevPoint = path[j - 1];
                var distance = SimpleTrig.getDistance(prevPoint, point);

                if (distance > 100) {
                    // splice to *next* position, so gets checked again
                    paths.splice(i + 1, 0, path.splice(j));
                    break;
                } else {
                    ++j;
                }
            }
        }


        // keep long enough paths (>= 3 points)
        var tempPaths = [];
        var shortPaths = 0;

        for (var i = 0, n = paths.length; i < n; ++i) {
            var path = paths[i];
            if (path.length >= 3) tempPaths.push(paths[i].slice());
            else ++shortPaths;
        }

        // console.log('dropped', shortPaths, 'short paths');

        return tempPaths;
    },



    coordsToIndex: function(x, y, w) {
        return ((y * w) + x) * 4;
    },

    _processSource_adaptThresholds: function(canvas, s, t) {

        console.log('adapting thresholds');



        ctx = canvas.getContext('2d');



        this.cacheImageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        this.cacheData = this.cacheImageData.data;
        this.cacheDataArray = [];
        for (var i in this.cacheData) {
            this.cacheDataArray[i] = this.cacheData[i];
        }
        var _data = this.cacheDataArray
        var _width = canvas.width;
        var _height = canvas.height;

        var w = _width;
        var h = _height;

        var outData = [];

        // get integral image
        var sum, intImg = [];
        for (var i = 0; i < w; ++i) {
            sum = 0;

            for (var j = 0; j < h; ++j) {
                var index = this.coordsToIndex(i, j, w);
                sum += _data[index];

                if (i == 0) intImg[index] = sum;
                else intImg[index] = intImg[index - 4] + sum;
            }
        }


        // find thresholds
        for (var i = 0; i < w; ++i) {
            for (var j = 0; j < h; ++j) {
                var x1 = i - s * .5;
                var x2 = i + s * .5;
                var y1 = j - s * .5;
                var y2 = j + s * .5;

                var count = (x2 - x1) * (y2 - y1);
                var sum = intImg[this.coordsToIndex(x2, y2, w)] - intImg[this.coordsToIndex(x2, y1 - 1, w)] - intImg[this.coordsToIndex(x1 - 1, y2, w)] + intImg[this.coordsToIndex(x1 - 1, y1 - 1, w)];

                var index = this.coordsToIndex(i, j, w);

                if (_data[index] * count <= sum * (100 - t) / 100) outData[index] = outData[index + 1] = outData[index + 2] = 0;
                else outData[index] = outData[index + 1] = outData[index + 2] = 255;

                outData[index + 3] = _data[index + 3];
            }
        }

        //console.log(outData);
        //return outData;

        var imgData = canvas.getContext('2d').createImageData(canvas.width, canvas.height);
        var imgDataData = imgData.data;

        for (var i in outData) {
            imgDataData[i] = outData[i];
        }
        //this.finalParams[e.data.id].data = imgData;

        //var test = new Element('img', {src: canvas.toDataURL()}).inject(document.body);


        ctx.putImageData(imgData, 0, 0);
    },



});
