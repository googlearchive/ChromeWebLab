(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.data");

    if (namespace.NumberFunctions === undefined) {

        var NumberFunctions = function NumberFunctions() {
            //MENOTE: do nothing
        };

        namespace.NumberFunctions = NumberFunctions;

        NumberFunctions.getPaddedNumber = function(aNumber, aPaddingLength) {
            var returnString = aNumber.toString();
            for (var i = returnString.length; i < aPaddingLength; i++) {
                returnString = "0" + returnString;
            }
            return returnString;
        };
    }
})();
