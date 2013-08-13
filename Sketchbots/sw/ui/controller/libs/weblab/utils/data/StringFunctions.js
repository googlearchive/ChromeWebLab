(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.data");

    var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;

    if (namespace.StringFunctions === undefined) {

        var StringFunctions = function StringFunctions() {
            //MENOTE: do nothing
        };

        namespace.StringFunctions = StringFunctions;

        StringFunctions.trim = function(aString) {
            return aString.replace(new RegExp("^[\\s]+", "g"), "").replace(new RegExp("[\\s]+$", "g"), "");
        }

        StringFunctions.createPointFromString = function(aString) {
            var tempArray = aString.split(",");
            var returnPoint = Point.create(parseFloat(StringFunctions.trim(tempArray[0]), 10), parseFloat(StringFunctions.trim(tempArray[1]), 10));
            return returnPoint;
        };
    }
})();
