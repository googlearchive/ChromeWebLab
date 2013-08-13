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

(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.data");

    if (namespace.ArrayFunctions === undefined) {

        var ArrayFunctions = function ArrayFunctions() {
            //MENOTE: do nothing
        };

        namespace.ArrayFunctions = ArrayFunctions;

        ArrayFunctions.indexOfInArray = function(aArray, aData) {
            if (aArray === null || aArray === undefined) {
                return -1;
            }
            if (aArray.indexOf) {
                return aArray.indexOf(aData);
            } else {
                //MENOTE: ie doesn't have the indexOf function
                var currentArray = aArray;
                var currentArrayLength = currentArray.length;
                for (var i = 0; i < currentArrayLength; i++) {
                    var currentData = currentArray[i];
                    if (currentData == aData) {
                        return i;
                    }
                }
            }
            return -1;
        };

        ArrayFunctions.copyArray = function(aArray) {
            var currentArray = new Array(aArray.length);
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                currentArray[i] = aArray[i];
            }
            return currentArray;
        };

        ArrayFunctions.create2DimensionalArray = function create2DimensionalArray(aFirstDimension, aSecondDimension) {
            var returnArray = new Array(aFirstDimension);
            for (var i = 0; i < aFirstDimension; i++) {
                returnArray[i] = new Array(aSecondDimension);
            }

            return returnArray;
        };

        ArrayFunctions.generateList = function generateList(aPrefix, aStartNumber, aEndNumber, aSuffix, aReturnArray) {
            for (var i = aStartNumber; i < aEndNumber; i++) {
                aReturnArray.push(aPrefix + "" + i + "" + aSuffix);
            }
        };

        ArrayFunctions.generateReverseList = function generateReverseList(aPrefix, aStartNumber, aEndNumber, aSuffix, aReturnArray) {
            for (var i = aEndNumber; --i >= aStartNumber;) {
                aReturnArray.push(aPrefix + "" + i + "" + aSuffix);
            }
        };
    }
})();
