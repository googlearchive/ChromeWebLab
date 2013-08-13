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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player.copy");

    if (namespace.StandAloneCopyGenerator === undefined) {

        var StandAloneCopyGenerator = function StandAloneCopyGenerator() {
            this._init();
        };

        namespace.StandAloneCopyGenerator = StandAloneCopyGenerator;

        var p = StandAloneCopyGenerator.prototype;

        p._init = function() {

            this._copyObject = new Object();

            return this;
        };

        p.addCopy = function(aId, aCopy) {

            this._copyObject[aId] = aCopy;

            return this;
        };

        p.setCopyObject = function(aObject) {
            this._copyObject = aObject;

            return this;
        };

        p.getCopy = function(aId) {
            if (this._copyObject[aId] === undefined) {
                return "Copy not found (" + aId + ")";
            }
            return this._copyObject[aId];
        };

        p.destroy = function() {
            this._copyObject = null;
        };

        StandAloneCopyGenerator.create = function() {
            var newStandAloneCopyGenerator = new StandAloneCopyGenerator();
            return newStandAloneCopyGenerator;
        }
    }
})();
