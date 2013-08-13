(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.math");

    var NumberFunctions = WEBLAB.namespace("WEBLAB.utils.data").NumberFunctions;

    if (namespace.ColorBlender === undefined) {

        var ColorBlender = function ColorBlender() {
            //MENOTE: do nothing
        };

        namespace.ColorBlender = ColorBlender;

        ColorBlender.getBlendedHexColor = function(aParameter, aBeginColor, aEndColor) {

            var beginR = parseInt(aBeginColor.substring(1, 3), 16);
            var beginG = parseInt(aBeginColor.substring(3, 5), 16);
            var beginB = parseInt(aBeginColor.substring(5, 7), 16);

            var endR = parseInt(aEndColor.substring(1, 3), 16);
            var endG = parseInt(aEndColor.substring(3, 5), 16);
            var endB = parseInt(aEndColor.substring(5, 7), 16);

            var returnString = "#";
            returnString += NumberFunctions.getPaddedNumber(Math.round((1 - aParameter) * beginR + (aParameter) * endR).toString(16), 2);
            returnString += NumberFunctions.getPaddedNumber(Math.round((1 - aParameter) * beginG + (aParameter) * endG).toString(16), 2);
            returnString += NumberFunctions.getPaddedNumber(Math.round((1 - aParameter) * beginB + (aParameter) * endB).toString(16), 2);

            return returnString;
        };
    }
})();
