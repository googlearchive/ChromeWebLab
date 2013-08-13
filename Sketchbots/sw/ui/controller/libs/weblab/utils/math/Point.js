(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.math");

    if (namespace.Point === undefined) {

        var Point = function Point() {
            this.x = 0;
            this.y = 0;
        };

        namespace.Point = Point;

        var p = Point.prototype;

        Point.create = function create(aX, aY) {
            var newPoint = new Point();
            newPoint.x = (aX != null) ? aX : 0;
            newPoint.y = (aY != null) ? aY : 0;
            return newPoint;
        };
    }
})();
