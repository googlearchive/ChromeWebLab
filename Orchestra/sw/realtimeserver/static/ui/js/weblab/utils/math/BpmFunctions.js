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

    var namespace = WEBLAB.namespace("WEBLAB.utils.math");

    if (namespace.BpmFunctions === undefined) {

        var BpmFunctions = function BpmFunctions() {
            //MENOTE: do nothing
        };

        namespace.BpmFunctions = BpmFunctions;

        BpmFunctions.getBeatLength = function(aBpm, aNoteLength) {

            aNoteLength = (aNoteLength == null) ? 0.25 : aNoteLength;
            //console.log(aBpm, aNoteLength, 60*4*aNoteLength/aBpm);
            return 60 * 4 * aNoteLength / aBpm;
        };
    }
})();
