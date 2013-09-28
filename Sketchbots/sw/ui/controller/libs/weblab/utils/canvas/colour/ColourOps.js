/*
 * 	ColourOps
 *
 * 	@description Simple image processing routines for canvas
 * 	@author Adam Palmer
 *
 * 	@usage :
 *
 *	// instantiate and reset the cache with a new canvas
 *	var colourOps = new ColourOps();
 *	colourOps.resetCache(canvas);
 *
 * 	// call image processing routines with a canvas to draw into
 *	colourOps.threshold(destinationCanvas, 128);
 *
 */

(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.colour');


    if (namespace.ColourOps === undefined) {

        namespace.ColourOps = function() {

        };

        var p = namespace.ColourOps.prototype;


        p.resetCache = function(canvas) {
            this.cache = document.createElement('canvas');
            this.cache.width = canvas.width;
            this.cache.height = canvas.height;

            var ctx = this.cache.getContext('2d');
            ctx.drawImage(canvas, 0, 0);
        }


        /**
         * @param edge Clips the threshold in the range 0-255.
         */

        p.threshold = function(canvas, level, rect) {
            var w = this.cache.width;
            var imgData = this.cache.getContext('2d').getImageData(0, 0, w, this.cache.height);
            var pix = imgData.data;
            var blackTally = 0;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                average = (pix[i] + pix[i + 1] + pix[i + 2]) / 3;
                bw = average >= level ? 255 : 0;

                pix[i] = bw;
                pix[i + 1] = bw;
                pix[i + 2] = bw;

                var isInRect = this.coordIsWithinRect(this.indexToCoords(i, w), rect);
                if (bw == 0 && isInRect)++blackTally;
            }

            if (canvas) {
                canvas.getContext('2d').putImageData(imgData, 0, 0);
                // this.drawFaceRect(rect, canvas.getContext('2d'));
            }

            return blackTally / (rect.width * rect.height);
        }


        p.drawFaceRect = function(rect, ctx) {
            ctx.save();

            ctx.beginPath();
            ctx.rect(rect.x, rect.y, rect.width, rect.height);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }


        p.coordIsWithinRect = function(coord, rect) {
            if (coord.x > rect.x && coord.x < rect.x + rect.width && coord.y > rect.y && coord.y < rect.y + rect.height) return true;
            else return false;
        }


        p.getThresholdWithBlackPercentage = function(perc, rect) {
            var level = 0;

            while (this.threshold(null, level, rect) < perc) {
                level += 5;
            }

            return level;
        }


        /**
         *
         */

        p.adaptiveThreshold = function(canvas, s, t) {
            var w = this.cache.width;
            var h = this.cache.height;

            var outContext = canvas.getContext('2d');

            var data = this.cache.getContext('2d').getImageData(0, 0, w, h).data;
            var outImageData = outContext.getImageData(0, 0, w, h);
            var outData = outImageData.data;

            // var s = 24; 	// s*s window around pixel
            // var t = 20; 	// set to black if t or more % less than the average


            // get integral image

            var sum, intImg = [];

            for (var i = 0; i < w; ++i) {
                sum = 0;

                for (var j = 0; j < h; ++j) {
                    var index = this.coordsToIndex(i, j, w);
                    sum += data[index];

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

                    if (data[index] * count <= sum * (100 - t) / 100) outData[index] = outData[index + 1] = outData[index + 2] = 0;
                    else outData[index] = outData[index + 1] = outData[index + 2] = 255;

                    outData[index + 3] = data[index + 3];
                }
            }


            outContext.putImageData(outImageData, 0, 0);
        }



        /**
         * @param sat sets the saturation in the range -1 (b&w) - 0 (normal colour).
         */

        p.saturation = function(canvas, sat) {
            var imgData = this.cache.getContext('2d').getImageData(0, 0, this.cache.width, this.cache.height);
            var pix = imgData.data;

            for (var i = 0, n = pix.length; i < n; i += 4) {
                average = (pix[i] + pix[i + 1] + pix[i + 2]) / 3;

                if (sat > 0) {

                    pix[i] += (average - pix[i]) * (1 - 1 / (1.001 - sat));
                    pix[i + 1] += (average - pix[i + 1]) * (1 - 1 / (1.001 - sat));
                    pix[i + 2] += (average - pix[i + 2]) * (1 - 1 / (1.001 - sat));

                } else {

                    pix[i] += (average - pix[i]) * (-sat);
                    pix[i + 1] += (average - pix[i + 1]) * (-sat);
                    pix[i + 2] += (average - pix[i + 2]) * (-sat);

                }
            }

            canvas.getContext('2d').putImageData(imgData, 0, 0);
        }


        p.indexToCoords = function(i, w) {
            var x = i * .25 % w;
            var y = (i * .25 - x) / w;
            return {
                x: x,
                y: y
            };
        }


        p.coordsToIndex = function(x, y, w) {
            return ((y * w) + x) * 4;
        }

    }

})();
