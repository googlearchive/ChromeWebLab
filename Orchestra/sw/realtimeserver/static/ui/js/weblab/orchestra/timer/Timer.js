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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.timer");

    // var MessageEncoder = namespace.MessageEncoder;
    // var MuseumMessageEncoder = namespace.MuseumMessageEncoder;
    // var MessageIds = WEBLAB.namespace("WEBLAB.orchestra.constants").MessageIds;
    // var WebSocketFunctions = WEBLAB.namespace("WEBLAB.utils.websocket").WebSocketFunctions;
    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.Timer === undefined) {

        var Timer = function Timer() {
            this._init();
        };

        namespace.Timer = Timer;

        var p = Timer.prototype = new EventDispatcher();

        p._init = function() {

            this._loopTimes = new Array();
            this._currentLoop = 0;
            this._diffRange = 1000;

            return this;
        };

        p.reset = function() {
            this._currentLoop = 0;
            this._loopTimes.splice(0, this._loopTimes.length);
        };

        p.updateLoops = function(aLoopTimes) {

            var firstLoopTime = aLoopTimes[0].valueOf() - this._diffRange;
            var currentArray = this._loopTimes;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentValue = currentArray[i].valueOf();
                if (firstLoopTime <= currentValue) {
                    currentArray.splice(i, currentArrayLength - i);
                    break;
                }
            }
            //console.log(currentArray.length, aLoopTimes[0], currentArray);

            this._loopTimes = currentArray.concat(aLoopTimes);

            //METODO: offset this time to server time
            var currentTime = (new Date()).valueOf();

            var currentArray = this._loopTimes;
            var currentArrayLength = currentArray.length;
            for (var i = 1; i < currentArrayLength - 1; i++) { //MENOTE: skip the first value and the last so that there is always data
                var currentValue = currentArray[1].valueOf();
                if (currentTime >= currentValue) {
                    currentArray.shift();
                    currentArrayLength--;
                    this._currentLoop++;
                } else {
                    break;
                }
            }

            //console.log(this._loopTimes);
        };

        p.getCurrentTime = function() {

            if (this._loopTimes.length === 0) {
                return -1;
            }

            var currentTime = (new Date()).valueOf();

            var currentIndex = 0

            var currentArray = this._loopTimes;
            var currentArrayLength = currentArray.length;
            for (var i = 1; i < currentArrayLength - 1; i++) { //MENOTE: skip the first value and the last so that there is always data
                var currentValue = currentArray[i].valueOf();
                if (currentTime >= currentValue) {
                    currentIndex++;
                } else {
                    break;
                }
            }

            var startTime = currentArray[currentIndex].valueOf();
            var endTime = currentArray[currentIndex + 1].valueOf();

            var currentPosition = (currentTime - startTime) / (endTime - startTime);

            currentPosition -= Math.floor(currentPosition);

            return currentPosition;
        };

        p.getAbsoluteTime = function() {

            if (this._loopTimes.length === 0) {
                return -1;
            }

            var currentTime = (new Date()).valueOf();

            var currentIndex = 0;

            var currentArray = this._loopTimes;
            var currentArrayLength = currentArray.length;
            for (var i = 1; i < currentArrayLength - 1; i++) { //MENOTE: skip the first value and the last so that there is always data
                var currentValue = currentArray[i].valueOf();
                if (currentTime >= currentValue) {
                    currentIndex++;
                } else {
                    break;
                }
            }

            var startTime = currentArray[currentIndex].valueOf();
            var endTime = currentArray[currentIndex + 1].valueOf();

            var currentPosition = (currentTime - startTime) / (endTime - startTime);

            var newTime = this._currentLoop + currentIndex + currentPosition;
            return newTime;
        };

        p.getGlobalTime = function() {
            var currentTime = (new Date()).valueOf();
            return currentTime;
        };

        p.destroy = function() {
            this._loopTimes = null;

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        Timer.create = function() {
            var newTimer = new Timer();
            return newTimer;
        };
    }
})();
