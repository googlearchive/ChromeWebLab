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
    "use strict";

    var namespace = WEBLAB.namespace("WEBLAB.utils.timer");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.TimedCommands === undefined) {

        var TimedCommands = function TimedCommands() {
            this._init();
        };

        namespace.TimedCommands = TimedCommands;

        var p = TimedCommands.prototype = new EventDispatcher();
        var s = EventDispatcher.prototype;

        p._init = function() {
            this._commandsArray = new Array();

            this._autoStart = false;
            this._selfUpdatingIntervalId = -1;
            this._selfUpdateTimeCallback = ListenerFunctions.createListenerFunction(this, this._selfUpdateTime);
        };

        p.updateTime = function(aTime) {
            //console.log("WEBLAB.utils.timer.TimedCommands::updateTime");
            var currentArray = this._commandsArray;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentCommand = currentArray[i];
                if (currentCommand.time <= aTime) {
                    currentArray.shift();
                    currentArrayLength--;
                    i--;
                    this.dispatchCustomEvent(currentCommand.type, currentCommand.data);
                }
            }

            if (this._autoStart && this._commandsArray.length === 0) {
                this.stopSelfUpdating();
            }
        };

        p.addCommand = function(aType, aTime, aData) {
            //console.log("WEBLAB.utils.timer.TimedCommands::addCommand");
            //console.log(this);
            var newCommand = {
                "type": aType,
                "time": aTime,
                "data": aData
            };

            var currentArray = this._commandsArray;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentCommand = currentArray[i];
                if (currentCommand.time > aTime) {
                    currentArray.splice(i, 0, newCommand);
                    return;
                }
            }
            currentArray.push(newCommand);

            if (this._autoStart && this._commandsArray.length === 1) {
                this.startSelfUpdating();
            }
        };

        p.clearAllCommandsByType = function(aType) {
            var currentArray = this._commandsArray;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentCommand = currentArray[i];
                if (currentCommand.type === aType) {
                    currentArray.splice(i, 1);
                    i--;
                    currentArrayLength--;
                }
            }

            if (this._autoStart && this._commandsArray.length === 0) {
                this.stopSelfUpdating();
            }
        };

        p.clearAllCommands = function() {
            var currentArray = this._commandsArray;
            var currentArrayLength = currentArray.length;
            currentArray.splice(0, currentArrayLength);

            if (this._autoStart && this._commandsArray.length === 0) {
                this.stopSelfUpdating();
            }
        };

        p._selfUpdateTime = function() {
            var currentTime = 0.001 * Date.now();
            this.updateTime(currentTime);
        };

        p.startSelfUpdating = function() {
            if (this._selfUpdatingIntervalId === -1) {
                this._selfUpdatingIntervalId = setInterval(this._selfUpdateTimeCallback, 40);
            }
        };

        p.stopSelfUpdating = function() {
            if (this._selfUpdatingIntervalId !== -1) {
                clearInterval(this._selfUpdatingIntervalId);
                this._selfUpdatingIntervalId = -1;
            }
        };

        p.setAutoStart = function(aStart) {
            this._autoStart = aStart;

            if (this._autoStart && this._commandsArray.length > 0) {
                this.startSelfUpdating();
            }

            return this;
        };

        p.destroy = function() {
            this.stopSelfUpdating();
            if (this._commandsArray != null) {
                var currentArray = this._commandsArray;
                var currentArrayLength = currentArray.length;
                for (var i = 0; i < currentArrayLength; i++) {
                    var currentCommand = currentArray[i];
                    currentCommand.data = null;
                    currentArray[i] = null;
                }
                this._commandsArray.splice(i, this._commandsArray.length);
            }
            this._commandsArray = null;

            this._autoStart = false;
            this._selfUpdateTimeCallback = null;

            s.destroy.call(this);

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        TimedCommands.create = function() {
            return new TimedCommands();
        }
    }
})();
