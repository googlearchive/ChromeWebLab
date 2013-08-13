/*
    Copyright 2013 Google Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
exports.createListenerFunction = function(aListenerObject, aListenerFunction) {
    var returnFunction = function() {
        aListenerFunction.apply(aListenerObject, arguments);
    }
    return returnFunction;
};

exports.createSecureListenerFunction = function(aListenerObject, aListenerFunction) {
    var returnFunction = function() {
        try {
            aListenerFunction.apply(aListenerObject, arguments);
        } catch (theError) {
            console.log("An error occured: " + theError.message);
            // console.log(theError.stack);
        }
    }
    return returnFunction;
};


exports.createListenerFunctionWithArguments = function(aListenerObject, aListenerFunction, aArguments) {
    var returnFunction = function() {
        var argumentsArray = aArguments.concat([]); //MENOTE: can't concat arguments. It adds an object instead of all arguments.
        var currentArray = arguments;
        var currentArrayLength = currentArray.length;
        for (var i = 0; i < currentArrayLength; i++) {
            argumentsArray.push(currentArray[i]);
        }
        //console.log(arguments, arguments.length);
        //console.log(argumentsArray);
        aListenerFunction.apply(aListenerObject, argumentsArray);
    }
    return returnFunction;
};
