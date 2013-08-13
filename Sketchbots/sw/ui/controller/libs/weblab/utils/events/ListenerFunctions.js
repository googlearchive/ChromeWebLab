(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.events");

    if (namespace.ListenerFunctions === undefined) {

        var ListenerFunctions = function ListenerFunctions() {
            //MENOTE: do nothing
        };

        namespace.ListenerFunctions = ListenerFunctions;

        ListenerFunctions.createListenerFunction = function(aListenerObject, aListenerFunction) {

            if (aListenerFunction === undefined) {
                throw new Error("ERROR ListenerFunctions :: createListenerFunction :: callback function was null when called by :: ", aListenerObject);
            }

            var returnFunction = function dynamicListenerFunction() {
                aListenerFunction.apply(aListenerObject, arguments);
            };
            return returnFunction;
        };

        ListenerFunctions.createListenerFunctionWithArguments = function(aListenerObject, aListenerFunction, aArguments) {

            if (aListenerFunction === undefined) {
                throw new Error("ERROR ListenerFunctions :: createListenerFunction :: callback function was null when called by :: ", aListenerObject);
            }

            var returnFunction = function dynamicListenerFunction() {
                var argumentsArray = aArguments.concat([]); //MENOTE: can't concat arguments. It adds an object instead of all arguments.
                var currentArray = arguments;
                var currentArrayLength = currentArray.length;
                for (var i = 0; i < currentArrayLength; i++) {
                    argumentsArray.push(currentArray[i]);
                }
                aListenerFunction.apply(aListenerObject, argumentsArray);
            };
            return returnFunction;
        };

        ListenerFunctions.createListenerFunctionWithReturn = function(aListenerObject, aListenerFunction) {

            if (aListenerFunction === undefined) {
                throw new Error("ERROR ListenerFunctions :: createListenerFunctionWithReturn :: callback function was null when called by :: ", aListenerObject);
            }

            var returnFunction = function dynamicListenerFunction() {
                return aListenerFunction.apply(aListenerObject, arguments);
            };
            return returnFunction;
        };
    }
})();
