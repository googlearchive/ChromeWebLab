(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.utils');


    if (namespace.CanvasFactory === undefined) {
        var CanvasFactory = function CanvasFactory() {}

        namespace.CanvasFactory = CanvasFactory;


        CanvasFactory.create = function(width, height) {
            var canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext('2d');

            return ctx;
        }


        CanvasFactory.createFromImage = function(image, scale) {
            var scale = scale || 1;
            var ctx = CanvasFactory.create(image.width * scale, image.height * scale);
            ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);

            return ctx;
        }


        CanvasFactory.createFromImageUrl = function(url, scale, callback, id) {
            var id = id || 0;
            var scale = scale || 1;
            var image = new Image();

            image.id = id;
            image.onload = (function() {
                var ctx = CanvasFactory.create(image.width * scale, image.height * scale);
                ctx.drawImage(image, 0, 0, image.width * scale, image.height * scale);
                ctx.canvas.id = id;
                callback(ctx);
            }).bind(this);

            image.src = url;
        };


        CanvasFactory.clone = function(source, scale) {
            var scale = scale || 1;
            var ctx = CanvasFactory.create(source.width * scale, source.height * scale);
            ctx.drawImage(source, 0, 0, source.width * scale, source.height * scale);

            return ctx;
        }


        CanvasFactory.mask = function(canvas, maskCanvas, operation) {
            operation = operation || 'destination-atop';

            var ctx = canvas.getContext('2d');
            ctx.save();
            ctx.globalCompositeOperation = operation;
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.restore();
        }


        CanvasFactory.crop = function(canvas, rect, size) {
            size = size || rect;

            var temp = CanvasFactory.clone(canvas);
            canvas.width = size.width;
            canvas.height = size.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(temp.canvas, rect.x, rect.y, rect.width, rect.height, 0, 0, size.width, size.height);
        }

    }

})();
