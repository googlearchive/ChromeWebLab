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

exports.verifyInstrumentId = function(aInstrumentId) {
    return (aInstrumentId >= 0 && aInstrumentId < 8);
};

exports.verifyInstrumentIdOrAll = function(aInstrumentId) {
    return (aInstrumentId >= -1 && aInstrumentId <= 8);
};

exports.verifyAll = function() {
    var currentArray = arguments;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentItem = currentArray[i];
        if (currentItem != true) {
            return false;
        }
    }
    return true;
}
