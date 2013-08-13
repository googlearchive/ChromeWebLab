(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.utils');

    var math = WEBLAB.utils.math;
    var SimpleTrig = math.SimpleTrig;


    if (namespace.Drawing === undefined) {
        var Drawing = function Drawing() {}

        namespace.Drawing = Drawing;


        Drawing.drawLinesEllipse = function(ctx, x, y, w, h, complete, fill, stroke) {
            // complete is between 0 and 1 = how far round to draw

            h *= .5;
            w *= .5;
            var rotation = Math.PI * 1.5;

            ctx.beginPath();

            for (var i = 0 * Math.PI; i < (complete * 2) * Math.PI; i += 0.01) {
                var nextX = x - (w * Math.sin(i)) * Math.sin(rotation) + (h * Math.cos(i)) * Math.cos(rotation);
                var nextY = y + (h * Math.cos(i)) * Math.sin(rotation) + (w * Math.sin(i)) * Math.cos(rotation);

                i == 0 ? ctx.moveTo(nextX, nextY) : ctx.lineTo(nextX, nextY);
            }

            if (stroke) ctx.stroke();
            if (fill) ctx.fill();
        }


        Drawing.drawBezierEllipse = function(ctx, x, y, w, h, fill, stroke) {
            x -= w / 2;
            y -= h / 2;

            var kappa = .5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w, // x-end
                ye = y + h, // y-end
                xm = x + w / 2, // x-middle
                ym = y + h / 2; // y-middle

            ctx.beginPath();
            ctx.moveTo(x, ym);
            ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            ctx.closePath();

            if (stroke) ctx.stroke();
            if (fill) ctx.fill();
        }


        Drawing.drawDottedEllipse = function(ctx, x, y, w, h, dotSize, numDots) {
            var p, yRatio = h / w;
            var points = SimpleTrig.getPointsOnACircle(w / 2, {
                x: x,
                y: y
            }, numDots);

            // scale points
            for (var i = 0, n = points.length; i < n; ++i) {
                p = points[i];
                p.y *= yRatio;
            }

            // draw points
            for (var i = 0, n = points.length; i < n; ++i) {
                p = points[i];
                ctx.beginPath();
                Drawing.drawCircle(ctx, p.x, p.y, dotSize);
                ctx.fill();
            }
        }


        Drawing.drawCircle = function(ctx, x, y, w) {
            ctx.arc(x, y, w, 0, Math.PI * 2, true);
        }


        CanvasRenderingContext2D.prototype.dashedLineFromTo = function(x1, y1, x2, y2, dashLength) {
            var params = {
                isDrawing: true,
                unFinishedPixelsFromLastDash: 0
            }

            var x = x1,
                y = y1,
                dx = (x2 - x) + .00000001,
                dy = y2 - y,
                slope = dy / dx,
                distanceRemaining = Math.sqrt(dx * dx + dy * dy),
                bUnfinishedPixels = false,
                theDashLength,
                xStep;

            this.moveTo(x, y);

            while (distanceRemaining >= 0.1) {
                if (params.unFinishedPixelsFromLastDash === 0) {
                    theDashLength = dashLength;
                } else {
                    theDashLength = params.unFinishedPixelsFromLastDash;
                    params.unFinishedPixelsFromLastDash = 0;
                    params.isDrawing = !params.isDrawing
                }

                if (dashLength > distanceRemaining) {
                    dashLength = distanceRemaining;
                    bUnfinishedPixels = true;
                }

                xStep = Math.sqrt(theDashLength * theDashLength / (1 + slope * slope));

                x += xStep;
                y += slope * xStep;

                this[params.isDrawing ? 'lineTo' : 'moveTo'](x, y);

                distanceRemaining -= theDashLength;
                params.isDrawing = !params.isDrawing;
            }

            if (bUnfinishedPixels) {
                params.unFinishedPixelsFromLastDash = theDashLength;
            }
        }

    }

})();
