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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra");

    var OrchestraConfiguration = WEBLAB.namespace("WEBLAB.orchestra").OrchestraConfiguration;

    var PlayerLayout = WEBLAB.namespace("WEBLAB.orchestra.data").PlayerLayout;
    var MessageEncoder = WEBLAB.namespace("WEBLAB.orchestra.websocket").MessageEncoder;
    var UserWebSocketConnection = WEBLAB.namespace("WEBLAB.orchestra.websocket").UserWebSocketConnection;

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var MessageIds = WEBLAB.namespace("WEBLAB.orchestra.constants").MessageIds;
    var PlayerChangeEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").PlayerChangeEventTypes;

    if (namespace.MuseumLiveManager === undefined) {

        var MuseumLiveManager = function MuseumLiveManager() {
            this._init();
        };

        namespace.MuseumLiveManager = MuseumLiveManager;

        var p = MuseumLiveManager.prototype = new EventDispatcher();
        var s = EventDispatcher.prototype;

        p._init = function() {

            this._webSocketConnection = UserWebSocketConnection.create(this);
            this._playerLayout = PlayerLayout.create();
            this._instrumentId = -1;
            this._playerDisplay = null;
            this._timer = null;
            this._currentUserId = null;
            this._isStarted = false;

            this._updateInterval = -1;
            this._updateCallback = ListenerFunctions.createListenerFunction(this, this._update);

            this._webSocketConnection.addEventListener("open", ListenerFunctions.createListenerFunction(this, this._connectionOpened));
            this._webSocketConnection.addEventListener("close", ListenerFunctions.createListenerFunction(this, this._connectionClosed));

            return this;
        };

        p.setInstrumentId = function(aInstrumentId) {
            //console.log("weblab.orchestra.MuseumLiveManager::setInstrumentId");

            this._instrumentId = aInstrumentId;

            return this;
        };

        p.setPlayerDisplay = function(aPlayer) {
            //console.log("weblab.orchestra.MuseumLiveManager::setPlayerDisplay");

            this._playerDisplay = aPlayer;
            this._playerDisplay.onNoteChanged = ListenerFunctions.createListenerFunction(this, this._onNoteChanged);
            this._playerDisplay.onNoteAdded = ListenerFunctions.createListenerFunction(this, this._onNoteAdded);
            this._playerDisplay.onNoteRemoved = ListenerFunctions.createListenerFunction(this, this._onNoteRemoved);

            return this;
        };

        p.getPlayerDisplay = function() {
            return this._playerDisplay;
        }

        p.setTimer = function(aTimer) {
            //console.log("weblab.orchestra.MuseumLiveManager::setTimer");

            this._timer = aTimer;

            return this;
        };

        p.updateLoops = function(aLoopTimes) {
            console.log("weblab.orchestra.MuseumLiveManager::updateLoops");
            console.log(aLoopTimes);
            //var traceArray = new Array(aLoopTimes.length);
            //for(var i = 0; i < traceArray.length; i++) {
            //	traceArray[i] = aLoopTimes[i].valueOf();
            //}
            //console.log(traceArray);

            this._timer.updateLoops(aLoopTimes);

            if (!this._isStarted) {
                this._isStarted = true;
                this.dispatchCustomEvent(PlayerChangeEventTypes.READY_FOR_TUTORIAL, null);
            }
        };

        p.connect = function() {

            var url = OrchestraConfiguration.REALTIME_SERVER_HOST + "/orchestra/connection/userJoin?instrumentId=" + this._instrumentId;

            this._webSocketConnection.connect(url);

        };

        p._doWebSocketConnect = function() {
            var url = OrchestraConfiguration.REALTIME_SERVER_HOST + "/orchestra/connection/userJoin?instrumentId=" + this._instrumentId;

            this._webSocketConnection.connect(url);
        };

        p._connectionOpened = function() {
            console.log("weblab.orchestra.MuseumLiveManager::_connectionOpened");

            this._updateInterval = setInterval(this._updateCallback, 40);
            this._update();

            this.dispatchCustomEvent(PlayerChangeEventTypes.CONNECTION_ESTABLISHED, null);
        };

        p._connectionClosed = function() {
            console.log("weblab.orchestra.MuseumLiveManager::_connectionClosed");

            clearInterval(this._updateInterval);
            this._updateInterval = -1;

            this.dispatchCustomEvent(PlayerChangeEventTypes.CONNECTION_LOST, null);

            alert("Your session has been closed by the server. Another user may have started using this instrument, or the server may have shut down. Please wait a moment and then try selecting a different instrument.");
        };

        p._update = function() {
            //console.log("weblab.orchestra.MuseumLiveManager::_update");

            var currentTime = this._timer.getCurrentTime();
            //console.log(currentTime);

            if (currentTime != -1) {
                this._playerDisplay.updateTime(currentTime, this._timer.getGlobalTime());
            }
        };

        p.setCurrentLayout = function(aLayoutMessage) {
            console.log("weblab.orchestra.MuseumLiveManager::setCurrentLayout");
            console.log(aLayoutMessage);

            MessageEncoder.decodePlayerLayoutMessage(aLayoutMessage, this._playerLayout);
            this._playerDisplay.setToPlayerLayout(this._playerLayout);

        };

        p.clearAllUserNotes = function() {
            //console.log("weblab.orchestra.MuseumLiveManager::clearAllUserNotes");

            var currentArray = this._playerLayout.instruments[this._instrumentId].notes;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentNote = currentArray[i];
                if (currentNote !== null && currentNote !== undefined) {
                    this._onNoteRemoved(this._instrumentId, i);
                }
            }
        };

        p.addNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
            console.log("weblab.orchestra.MuseumLiveManager::addNote");
            console.log(aInstrumentId, aNoteId, aPosition, aPitch);

            //METODO: update player layout
            this._playerDisplay.prepareAddNote(aInstrumentId, aNoteId, aPosition, aPitch);

            return false;
        };

        p.noteAdded = function(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp) {
            console.log("weblab.orchestra.MuseumLiveManager::noteAdded");
            console.log(aInstrumentId, aNoteId, aPosition, aPitch);

            this._playerLayout.addNote(aInstrumentId, aNoteId, aPosition, aPitch);
            this._playerDisplay.addNote(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp.valueOf());

            return false;
        };

        p.changeNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
            console.log("weblab.orchestra.MuseumLiveManager::changeNote");
            console.log(aInstrumentId, aNoteId, aPosition, aPitch);

            //METODO: update player layout
            this._playerDisplay.prepareChangeNote(aInstrumentId, aNoteId, aPosition, aPitch);

            return false;
        };

        p.noteChanged = function(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp) {
            console.log("weblab.orchestra.MuseumLiveManager::noteChanged");
            console.log(aInstrumentId, aNoteId, aPosition, aPitch);

            //METODO: update player layout
            this._playerDisplay.changeNote(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp.valueOf());

            return false;
        };

        p.removeNote = function(aInstrumentId, aNoteId) {
            console.log("weblab.orchestra.MuseumLiveManager::removeNote");
            console.log(aInstrumentId, aNoteId);

            //METODO: update player layout
            this._playerDisplay.prepareRemoveNote(aInstrumentId, aNoteId);

            return false;
        };

        p.noteRemoved = function(aInstrumentId, aNoteId, aTimeStamp) {
            console.log("weblab.orchestra.MuseumLiveManager::noteRemoved");
            console.log(aInstrumentId, aNoteId);

            this._playerLayout.removeNote(aInstrumentId, aNoteId);
            this._playerDisplay.removeNote(aInstrumentId, aNoteId, aTimeStamp.valueOf());

            return false;
        };

        p.customMessage = function(aMessageId, aData) {
            console.log("weblab.orchestra.MuseumLiveManager::customMessage");
            console.log(aMessageId, aData);

            switch (aMessageId) {
                case MessageIds.INSTRUMENT_CHANGED:
                    var instrumentId = aData.charCodeAt(0);
                    var userId = aData.substring(1, aData.length);
                    var eventData = {
                        "instrumentId": instrumentId,
                        "userId": userId
                    };
                    this.dispatchCustomEvent(PlayerChangeEventTypes.INSTRUMENT_CHANGED, eventData);
                    break;
                case MessageIds.USER_JOINED:
                    var instrumentId = aData.charCodeAt(0);
                    var userId = aData.substring(1, aData.length);
                    var eventData = {
                        "instrumentId": instrumentId,
                        "userId": userId
                    };
                    this.dispatchCustomEvent(PlayerChangeEventTypes.USER_JOINED, eventData);
                    break;
                case MessageIds.USER_LEFT:
                    var instrumentId = aData.charCodeAt(0);
                    var userId = aData.substring(1, aData.length);
                    var eventData = {
                        "instrumentId": instrumentId,
                        "userId": userId
                    };
                    this.dispatchCustomEvent(PlayerChangeEventTypes.USER_LEFT, eventData);
                    break;
                case MessageIds.CURRENT_PLAYERS:
                    var playerList = aData.split(",");
                    this.dispatchCustomEvent(PlayerChangeEventTypes.CURRENT_PLAYERS, playerList);
                    break;
            }
        };

        p._onNoteChanged = function(aInstrumentId, aNoteId, aPosition, aPitch) {
            console.log("weblab.orchestra.MuseumLiveManager::_onNoteChanged");

            this._webSocketConnection.sendMessage(MessageEncoder.encodeChangeNote(aInstrumentId, aNoteId, aPosition, aPitch));
        };

        p._onNoteAdded = function(aInstrumentId, aNoteId, aPosition, aPitch) {
            console.log("weblab.orchestra.MuseumLiveManager::_addNoteMoved");

            this._webSocketConnection.sendMessage(MessageEncoder.encodeAddNote(aInstrumentId, aNoteId, aPosition, aPitch));
        };

        p._onNoteRemoved = function(aInstrumentId, aNoteId) {
            console.log("weblab.orchestra.MuseumLiveManager::_onNoteRemoved");

            this._webSocketConnection.sendMessage(MessageEncoder.encodeRemoveNote(aInstrumentId, aNoteId));
        };

        p.userSignedIn = function(aUserId) {

            if (this._currentUserId !== null) {
                this.userSignedOut();
            }

            this._currentUserId = aUserId + "_AA";

            this._webSocketConnection.sendMessage(MessageEncoder.encodeUserJoined(this._instrumentId, this._currentUserId));
        };

        p.userSignedOut = function() {

            if (this._currentUserId !== null && this._currentUserId !== undefined) {
                this._webSocketConnection.sendMessage(MessageEncoder.encodeUserLeft(this._instrumentId, this._currentUserId));
            }

            this._currentUserId = null;
        };

        p.requestRecording = function(aStartTime, aEndTime) {
            if (this._currentUserId !== null && this._currentUserId !== undefined) {
                this._webSocketConnection.sendMessage(MessageEncoder.encodeRequestRecording(this._instrumentId, this._currentUserId, aStartTime, aEndTime));
            } else {
                console.error("There is no user signed in");
            }
        };

        p.destroy = function() {
            //METODO
        };

        MuseumLiveManager.create = function() {
            return new MuseumLiveManager();
        };
    }
})();
