(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.utils');



    if (namespace.ImageDataTools === undefined) {
        var ImageDataTools = function ImageDataTools() {}

        namespace.ImageDataTools = ImageDataTools;


        ImageDataTools.indexToCoords = function(i, canvas) {
            var x = i * .25 % canvas.width;
            var y = (i * .25 - x) / canvas.width;
            return {
                x: x,
                y: y
            };
        }


        ImageDataTools.coordsToIndex = function(x, y, canvas) {
            return ((y * canvas.width) + x) * 4;
        }

    }

})();
