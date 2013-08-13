(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.colour');



    if (namespace.PixelOps === undefined) {

        namespace.PixelOps = function() {
            this.me = this;
        };

        var p = namespace.PixelOps.prototype;


        p.useCanvas = function(canvas) {
            this.canvas = canvas;
            this.ctx = this.canvas.getContext('2d');

            this.tempCanvas = this.tempCanvas || document.createElement('canvas');
            this.tempCtx = this.tempCanvas.getContext('2d');
            this.tempData = this.tempCtx.getImageData(0, 0, 1, 1);
        }


        p.indexToCoords = function(i) {
            var x1 = i * .25 % this.canvas.width;
            var y1 = (i * .25 - x1) / this.canvas.width;
            return {
                x: x1,
                y: y1
            };
        }


        p.coordsToIndex = function(x, y) {
            return ((y * this.canvas.width) + x) * 4;
        }


        p.detectBlobs = function() {
            this.timer = new Date().getTime();
            this.blobs = [];
            this.specks = [];

            var foundBlob = false;

            this.imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var pix = this.imgData.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                foundBlob = false;

                if (pix[i + 2] == 0) // where BLUE is 0...
                {
                    var coords = this.indexToCoords(i);

                    // floodfill with colour					
                    var b = new Date().getTime() & 0xff;
                    var bounds = this.floodFill(coords, {
                        r: 0,
                        g: 0,
                        b: b
                    });

                    if (bounds.pixels.length > params.speckSize) {
                        foundBlob = true;

                        // store / draw
                        this.drawBlobBoundsRect(bounds, {
                            r: 255,
                            g: 0,
                            b: 0,
                            a: .8
                        });
                        this.blobs.push(bounds);
                        // this.createBlobInDOM(bounds);
                    } else {
                        this.specks.push(bounds);
                        // this.floodFill(coords, {r:0, g:0, b:255});
                    }

                    this.imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    pix = this.imgData.data;

                    // if (foundBlob == true) break; 
                }
            }

            var time = ((new Date().getTime() - this.timer) / 1000).toFixed(3);
            var msg = 'found ' + this.blobs.length + ' blobs + ' + this.specks.length + ' specks (area < ' + params.speckSize + 'px) in ' + time + 's';
            console.log(msg);

            readout.innerHTML = msg;
        }


        p.createBlobInDOM = function(bounds) {
            // clear temp canvas
            this.tempCanvas.width = this.canvas.width;
            this.tempCanvas.height = this.canvas.height;
            var tempData = this.tempCtx.getImageData(0, 0, this.tempCanvas.width, this.tempCanvas.height);

            // draw to temp canvas at 0,0
            var pix = bounds.pixels;
            var offset = this.coordsToIndex(bounds.x, bounds.y);

            for (var i = 0, n = pix.length; i < n; ++i) {
                this.colourPixel(pix[i] - offset, {
                    r: 255,
                    g: 0,
                    b: 0
                }, tempData);
            }

            this.tempCtx.putImageData(tempData, 0, 0);

            // create blob canvas
            var blobCanvas = document.createElement('canvas');
            blobCanvas.width = bounds.w;
            blobCanvas.height = bounds.h;

            // draw top corner to blob canvas
            var blobData = this.tempCtx.getImageData(0, 0, bounds.w, bounds.h);
            var blobCtx = blobCanvas.getContext('2d');
            blobCtx.putImageData(blobData, 0, 0);

            var c = blobCtx;
            c.strokeStyle = 'rgba(255, 0, 0, .7)';
            c.lineWidth = 1;
            c.beginPath();
            c.rect(.5, .5, bounds.w - 1, bounds.h - 1);
            c.closePath();
            c.stroke();

            blobsContainer.appendChild(blobCanvas);
        }


        p.drawBlobBoundsRect = function(bounds, col) {
            var c = faceRecogniser.faceFeatures.domElement.getContext('2d');
            faceRecogniser.faceFeatures.cleared = false;

            c.strokeStyle = 'rgba(' + col.r + ', ' + col.g + ', ' + col.b + ', ' + col.a + ')';
            c.lineWidth = 1;
            c.beginPath();
            c.rect(bounds.x - .5, bounds.y - .5, bounds.w + 1, bounds.h + 1);
            c.closePath();
            c.stroke();
        }


        p.floodFill = function(pixel, col) {
            var pixelStack = [
                [pixel.x, pixel.y]
            ];

            var canvasWidth = this.canvas.width;
            var canvasHeight = this.canvas.height;

            this.imgData = this.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            var data = this.imgData.data;

            var pixelPos = (pixel.y * canvasWidth + pixel.x) * 4;
            this.startColour = {
                r: data[pixelPos],
                g: data[pixelPos + 1],
                b: data[pixelPos + 2]
            };

            var extremes = [{
                x: pixel.x,
                y: pixel.y
            }, {
                x: 0,
                y: 0
            }];
            var pixels = [];


            while (pixelStack.length) {
                var newPos, x, y, pixelPos, hitLeft, hitRight;

                newPos = pixelStack.pop();
                x = newPos[0];
                y = newPos[1];

                pixelPos = this.coordsToIndex(x, y);

                while (--y >= 0 && this.matchStartColour(pixelPos)) {
                    pixelPos -= canvasWidth * 4;
                }

                pixelPos += canvasWidth * 4;

                ++y;

                hitLeft = false;
                hitRight = false;


                while (++y < canvasHeight && this.matchStartColour(pixelPos)) {
                    // FOUND, so colour pixel and store					
                    this.colourPixel(pixelPos, col, this.imgData);
                    pixels.push(pixelPos);

                    var coords = this.indexToCoords(pixelPos);
                    extremes[0].x = Math.min(extremes[0].x, coords.x);
                    extremes[0].y = Math.min(extremes[0].y, coords.y);
                    extremes[1].x = Math.max(extremes[1].x, coords.x);
                    extremes[1].y = Math.max(extremes[1].y, coords.y);


                    if (x > 0) {
                        if (this.matchStartColour(pixelPos - 4)) {
                            if (!hitLeft) {
                                pixelStack.push([x - 1, y]);
                                hitLeft = true;
                            }
                        } else if (hitLeft) {
                            hitLeft = false;
                        }
                    }

                    if (x < canvasWidth - 1) {
                        if (this.matchStartColour(pixelPos + 4)) {
                            if (!hitRight) {
                                pixelStack.push([x + 1, y]);
                                hitRight = true;
                            }
                        } else if (hitRight) {
                            hitRight = false;
                        }
                    }

                    pixelPos += canvasWidth * 4;
                }
            }

            var bounds = {
                x: extremes[0].x,
                y: extremes[0].y,
                w: Math.max(1, extremes[1].x - extremes[0].x),
                h: Math.max(1, extremes[1].y - extremes[0].y),
                pixels: pixels
            };

            // write back ONLY dirty area
            // var startIndex = this.coordsToIndex(bounds.x, bounds.y);
            // var endIndex = this.coordsToIndex(extremes[1].x, extremes[1].y);
            // var data = this.imgData.data;
            // 
            // this.tempCanvas.width = bounds.w;
            // this.tempCanvas.height = bounds.h;
            // var tempData = this.tempCtx.getImageData(0, 0, bounds.w, bounds.h);
            // 
            // var dirtyCounter = 0;
            // var dirty = tempData.data;
            // var canvasWidth = this.canvas.width;
            // 
            // for (var row = 0, lastRow = extremes[1].y - bounds.y; row <= lastRow; ++row)
            // {
            // 	// jump canvas width along to start of new row (data is sequential)
            // 	var newStart = startIndex + (canvasWidth*4)*row;
            // 					
            // 	for (var i = newStart, n = newStart + bounds.w*4; i < n; i+=4)
            // 	{
            // 		dirty[dirtyCounter] = data[i];
            // 		dirty[dirtyCounter+1] = data[i+1];
            // 		dirty[dirtyCounter+2] = data[i+2];
            // 		dirty[dirtyCounter+3] = data[i+3];
            // 		dirtyCounter += 4;
            // 	}
            // }
            // 
            // this.ctx.putImageData(tempData, bounds.x, bounds.y);
            this.ctx.putImageData(this.imgData, 0, 0);

            return bounds;
        }


        p.matchStartColour = function(pixelPos) {
            var data = this.imgData.data;
            var r = data[pixelPos];
            var g = data[pixelPos + 1];
            var b = data[pixelPos + 2];

            return (r == this.startColour.r && g == this.startColour.g && b == this.startColour.b);
        }


        p.colourPixel = function(pixelPos, colour, imageData) {
            var data = imageData.data;
            data[pixelPos] = colour.r;
            data[pixelPos + 1] = colour.g;
            data[pixelPos + 2] = colour.b;
            data[pixelPos + 3] = colour.a || 255;
        }

    }

})();
