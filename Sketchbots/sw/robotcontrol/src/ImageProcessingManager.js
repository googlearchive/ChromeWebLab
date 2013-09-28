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

// image processor classes take care of the dirty work:
var BitmapImageProcessor = require('./BitmapImageProcessor').BitmapImageProcessor;
var GCodeImageProcessor = require('./GCodeImageProcessor').GCodeImageProcessor;

exports.ImageProcessingManager = new Class({

    Implements: [Options, Events, process.EventEmitter],

    options: {
        imageLoc: './downloaded_images/activeImage',
    },

    imageContentType: null,
    processor: null,


    initialize: function(options) {
        this.setOptions(options);

        this.invertDrawingPng = true;
        this.imageLoc = this.options.imageLoc;

    },

    //this should only be called when this file is run in node.js
    //it downloads the image from the server into a directory
    //and then it passes the image to the appropriate ImageProcessor class
    downloadAndProcessImage: function(imageUrl) {

        this.currentImageUrl = imageUrl;

        var host = url.parse(imageUrl).hostname;
        var pathname = url.parse(imageUrl).pathname;
        var port = url.parse(imageUrl).port;

        var options = {
            host: host,
            port: ConfigParams.LABQUEUE_PORT,
            path: pathname,
            method: 'GET'
        };
        console.log('creating request to download image from server');
        console.dir(options);
        var req = labqueueClient.get(options, this.imageRequestResponse.bind(this));
    },

    getPolyLines: function() {
        return this.processor.polyLines;
    },

    setHorizontalBezierFlip: function(flip) {
        // delegate to this.processor
        this.horizontalBezierFlip = flip;
        if (this.processor != null) this.processor.setHorizontalBezierFlip(this.horizontalBezierFlip);
    },

    imageRequestResponse: function(response) {
        this.imagedata = ''
        response.setEncoding('binary')
        console.log('downloading image from server');

        try {
            this.imageContentType = response.headers['content-type'];
        } catch (e) {
            this.imageContentType = null;
        }

        response.on('data', this.imageRequestData.bind(this));
        response.on('end', this.imageRequestEnd.bind(this));
        response.on('error', this.imageRequestError.bind(this));
    },

    imageRequestError: function(e) {
        console.log('problem with request: ' + e.message);
    },

    imageRequestData: function(chunk) {
        var size = 0;

        size += chunk.length;
        this.imagedata += chunk;
        console.log('Additional ' + size + ' bytes received... ' + this.imagedata.length + ' bytes total data');
    },

    imageRequestEnd: function() {

        console.log('Image received from server. Saving a copy to ' + this.imageLoc + ' (look at this file if you need to debug)');

        fs.writeFile(this.imageLoc, this.imagedata, 'binary', function(err) {
            if (err) throw err;

            console.log('File saved.');

            //downloaded. now open the file and process it
            //we could also use the data right from memory, but this
            //has the added benefit of ensuring that we are using
            //excatly the same data as is stored in the file on disk
            if (this.imageContentType && this.imageContentType.substr(0, 6) == 'image/') {
                //try to parse the image as a bitmap (something understood by ImageProcessor)
                console.log('Interpreting source image as bitmap data using BitmapImageProcessor');
                this.processor = new BitmapImageProcessor();
            } else {
                //try to parse the image as g-code
                console.log('Interpreting source image as g-code data using GCodeImageProcessor');
                this.processor = new GCodeImageProcessor();
            }
            if (this.processor == null)
                throw new Error('Unsupported source image type: ' + this.imageContentType + ' - this robot does not understand how to make a drawing based on this type of image');

            this.processor.setHorizontalBezierFlip(this.horizontalBezierFlip);

            this.processor.once('processComplete', function(e) {
                this.emit('processComplete', e, this);
            }.bind(this));
            this.processor.processDiskFile(this.imageLoc);

        }.bind(this));

    },


    //this draws the image of the paths to be included in the artifact
    getBitmapRepresentation: function(color, width) {

        var polyPath = this.getPolyLines();

        var widest = 0;
        var tallest = 0;

        //find the dimensions of this drawing	
        for (var i = 0; i < polyPath.length; i++) {
            var path = polyPath[i];


            for (var j = 0; j < path.length; j++) {
                var point = path[j];

                if (point.x > widest) widest = point.x;
                if (point.y > tallest) tallest = point.y;
            }
        }

        if (this.invertDrawingPng) {
            for (var i = 0; i < polyPath.length; i++) {
                var path = polyPath[i];
                for (var j = 0; j < path.length; j++) {
                    var point = path[j];
                    point.y = tallest - point.y;
                    point.x = widest - point.x;
                }
            }
        }

        //scale up or down to needed png size
        var scale = width / widest;
        var canvas = new Canvas(width + 5, (tallest * scale) + 5);


        var ctx = canvas.getContext('2d');
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;

        this.margin = 5;

        for (var i = 0; i < polyPath.length; i++) {
            for (var j = 0; j < polyPath[i].length; j++) {
                this.drawBezierLine(ctx, {
                    x: scale,
                    y: scale
                }, {
                    x: 0,
                    y: 0
                }, polyPath[i], j);
            }
        }

        //var img = new Element('img', {src: canvas.toDataURL()}).inject(document.body);
        //console.log(img);
        var dataURL = canvas.toDataURL('image/png');
        return dataURL;
    },

    getSVGRepresentation: function(color, width) {
        var polyPath = this.getPolyLines();
        var svgStr = '';

        var widest = 0;
        var tallest = 0;

        var svgNS = 'http://www.w3.org/2000/svg';
        var quadPath = null;

        var stroke = color;

        function addElement(str) {
            svgStr += str + "\n";
        }

        function addLine(x, y, toX, toY) {
            x *= scale;
            y *= scale;
            toX *= scale;
            toY *= scale;
            addElement('<path id="lineBC" stroke="' + stroke + '" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" fill="none" d="M' + x + ' ' + y + ' L ' + toX + ' ' + toY + '" />');
        }

        function addToQuadPath(x, y, ctrlX, ctrlY, toX, toY) {
            x *= scale;
            y *= scale;
            ctrlX *= scale;
            ctrlY *= scale;
            toX *= scale;
            toY *= scale;

            if (!quadPath) quadPath = 'M ' + x + ' ' + y + ' Q ' + ctrlX + ' ' + ctrlY + ' ' + toX + ' ' + toY;
            else quadPath += ' Q ' + ctrlX + ' ' + ctrlY + ' ' + toX + ' ' + toY;

        }

        function addQuadraticCurvesPath() {
            addElement('<path id="lineBC" stroke="' + stroke + '" stroke-width="1" stroke-linejoin="miter" stroke-linecap="round" fill="none" d="' + quadPath + '" />');
        }


        // build the SVG in a totally brute-force fashion
        // this is crude, but does not depend on complicated external libraries

        //find the dimensions of this drawing
        for (var i = 0, n = polyPath.length; i < n; i++) {
            var path = polyPath[i];


            for (var j = 0; j < path.length; j++) {
                var point = path[j];

                if (point.x > widest) widest = point.x;
                if (point.y > tallest) tallest = point.y;
            }
        }

        //scale up or down to needed png size
        var scale = width / widest;
        var height = widest
        width += 5;
        var height = (tallest * scale) + 5;

        addElement('<?xml version="1.0" encoding="utf-8"?>');
        addElement('<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">');
        addElement('<svg xmlns="' + svgNS + '" width="' + width + '" height="' + height + '" version="1.1" viewBox="0 0 ' + width + ' ' + height + '" style="width:' + width + 'px; height:' + height + 'px">');
        // addElement('<defs>');
        // addElement('</defs>');

        for (var i = 0, n = polyPath.length; i < n; ++i) {
            var path = polyPath[i];

            for (var counter = 0, m = path.length; counter < m; ++counter) {
                var point = path[counter];

                if (counter == 0) // start of path
                {
                    quadPath = null;

                    var nextPoint = path[counter + 1];
                    addLine(point.x, point.y, (point.x + nextPoint.x) / 2, (point.y + nextPoint.y) / 2);
                } else if (counter == path.length - 1) // end of path
                {
                    if (quadPath) {
                        addQuadraticCurvesPath();
                        quadPath = null;
                    }

                    var prevPoint = path[counter - 1];
                    addLine((point.x + prevPoint.x) / 2, (point.y + prevPoint.y) / 2, point.x, point.y);
                } else { // within path (uses ßeziers)

                    var nextPoint = path[counter + 1];
                    var prevPoint = path[counter - 1];

                    addToQuadPath(

                        (point.x + prevPoint.x) / 2, (point.y + prevPoint.y) / 2,

                        point.x, point.y,

                        (point.x + nextPoint.x) / 2, (point.y + nextPoint.y) / 2

                    );
                }

            }
        }
        addElement('</svg>');

        return svgStr;
    },

    getGCodeRepresentation: function() {
        var polyPath = this.getPolyLines();
        var gcode = '';

        function appendLine(str) {
            gcode += str + '\n';
        }

        function appendComment(str) {
            appendLine('( ' + str + ' )');
        }

        function appendCommand(args) {
            var cmdStr = args.cmd;
            for (var n in args) {
                if (n != 'cmd') {
                    cmdStr += ' ' + n;
                    if (Math.round(args[n]).toString() == args[n].toString())
                        cmdStr += (args[n] + '.0');
                    else
                        cmdStr += args[n].toString();
                }
            }
            appendLine(cmdStr);
        }

        var xOffset = 0; - 1 * (ConfigParams.CAM_X / 2);
        var yOffset = 0; - 1 * (ConfigParams.CAM_Y / 2);

        appendComment('Generated by NodeJsDrawMachine');
        appendComment('');

        var fDrawing = ConfigParams.GCODE_CONVERSION_TOOL_DRAW_FEED_RATE; // feed rate while drawing
        var fTraveling = ConfigParams.GCODE_CONVERSION_TOOL_TRAVEL_FEED_RATE; // feed rate while traveling

        var zDrawing = 0; // Z axis for drawing moves (mm)
        var zTraveling = ConfigParams.GCODE_CONVERSION_TOOL_TRAVEL_Z; // Z axis for travel moves (mm)

        var eDrawing = 1; // (e)xtruder setting while drawing
        var eTraveling = 0; // (e)xtruder setting while traveling

        // preamble
        appendComment('prepare machine state');

        appendCommand({
            cmd: 'G92',
            e: 0
        }); // reset extruder
        appendCommand({
            cmd: 'G90'
        }); // absolute coordinate system
        appendCommand({
            cmd: 'M82'
        }); // absolute mode for extruder, too
        appendCommand({
            cmd: 'G21'
        }); // units are mm
        appendCommand({
            cmd: 'G92',
            e: 0.0
        }); // reset extruder again... not sure why this is needed, but most gcode does this

        appendComment('beginning of drawing');
        for (var i = 0; i < polyPath.length; i++) {
            appendComment('beginning of line segment ' + i + ' of ' + polyPath.length);
            var path = polyPath[i];
            appendCommand({
                cmd: 'G1',
                z: zTraveling,
                f: fTraveling
            });
            var point = null;
            for (var j = 0; j < path.length; j++) {
                point = path[j];
                // if (this.invertDrawingPng) {
                // 	//point.x = ConfigParams.CAM_X - point.x;
                // 	point.y = ConfigParams.CAM_Y - point.y;
                // }

                if (j == 0) {
                    //first point on a new path, so move the tool above the drawing point but above the workpiece
                    appendCommand({
                        cmd: 'G1',
                        x: (point.x + xOffset),
                        y: (point.y + yOffset),
                        z: zTraveling,
                        f: fTraveling
                    });
                }
                appendCommand({
                    cmd: 'G1',
                    x: (point.x + xOffset),
                    y: (point.y + yOffset),
                    z: zDrawing,
                    f: fDrawing
                });
            }
            if (point != null) {
                //end of line, raise the tool
                appendCommand({
                    cmd: 'G1',
                    x: (point.x + xOffset),
                    y: (point.y + yOffset),
                    z: zTraveling,
                    f: fTraveling
                });
            }
            appendComment('end of line segment ' + i + ' of ' + polyPath.length);
        }
        appendComment('end of drawing');
        return gcode;
    },

    drawBezierLine: function(ctx, ratio, offset, path, counter) {
        var scalePoint = (function(point) {
            return {
                x: (point.x * ratio.x) + this.margin,
                y: (point.y * ratio.y) + this.margin
            };
        }).bind(this);

        var point = scalePoint(path[counter]);

        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.beginPath();

        if (counter == 0) // start of path
        {
            var nextPoint = scalePoint(path[counter + 1]);

            ctx.moveTo(point.x, point.y);
            ctx.lineTo((point.x + nextPoint.x) / 2, (point.y + nextPoint.y) / 2);
            ctx.stroke();
        } else if (counter == path.length - 1) // end of path
        {
            var prevPoint = scalePoint(path[counter - 1]);

            ctx.moveTo((point.x + prevPoint.x) / 2, (point.y + prevPoint.y) / 2);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        } else { // within path (uses ßeziers)

            var nextPoint = scalePoint(path[counter + 1]);
            var prevPoint = scalePoint(path[counter - 1]);

            ctx.moveTo((point.x + prevPoint.x) / 2, (point.y + prevPoint.y) / 2);

            ctx.quadraticCurveTo(

                point.x,
                point.y,

                (point.x + nextPoint.x) / 2, (point.y + nextPoint.y) / 2

            );

            ctx.stroke();
        }

        ctx.restore();
    },


});
