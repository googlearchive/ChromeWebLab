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
var leftTrim = function(aText) {
    return aText.replace(new RegExp("^[\\s]+", "g"), "");
};
exports.leftTrim = leftTrim;

var rightTrim = function(aText) {
    return aText.replace(new RegExp("[\\s]+$", "g"), "");
};
exports.rightTrim = rightTrim;

var trim = function(aText) {
    return leftTrim(rightTrim(aText));
};
exports.trim = trim;

var splitSeparatedString = function(aText, aSeparator, aTrimLeft, aTrimRight) {

    aSeparator = (aSeparator != undefined) ? aSeparator : ",";
    aTrimLeft = (aTrimLeft != undefined) ? aTrimLeft : true;
    aTrimRight = (aTrimRight != undefined) ? aTrimRight : true;

    var currentArray = aText.split(aSeparator);
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentText = currentArray[i];
        if (aTrimLeft) {
            currentText = leftTrim(currentText);
        }
        if (aTrimRight) {
            currentText = rightTrim(currentText);
        }
        currentArray[i] = currentText;
    }

    return currentArray;
};
exports.splitSeparatedString = splitSeparatedString;
