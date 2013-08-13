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

var http = require("http");
var webSocketFunctions = require("../utils/webSocketFunctions");
var webSocketEncoding = require("../utils/webSocketEncoding");
var listenerFunctions = require('../utils/listenerFunctions');
var PlayerLayout = require("./data/PlayerLayout");
var MuseumUser = require("./user/MuseumUser");
var MuseumClient = require("./user/MuseumClient");
var MessageEncoder = require("./utils/MessageEncoder");
var MessageIds = require("./constants/MessageIds");
var HttpGetRequest = require("../utils/loading/HttpGetRequest");
var HttpPostRequest = require("../utils/loading/HttpPostRequest");
var WebSocketRequest = require("../utils/loading/WebSocketRequest");

var weblabPaths = require("../paths");
var weblabConfiguration = require("../configuration");

var url = require("url");
var os = require("os");
var net = require("net");
var crypto = require("crypto");

var LiveManager = function LiveManager() {

    this._museumClient = null;
    this._numberOfUsers = weblabConfiguration.NUMBER_OF_INSTRUMENTS;

    this._requestedPlayerLayout = PlayerLayout.create();
    this._confirmedPlayerLayout = PlayerLayout.create();

    this._currentPlayerIds = new Array(this._numberOfUsers);
    this._museumUsers = new Array(this._numberOfUsers);
    this._lastRegistrationTimes = new Array(this._numberOfUsers);

    for (var i = 0; i < this._numberOfUsers; i++) {
        this._lastRegistrationTimes[i] = new Date();
    }

    this._handledInstruments = new Array();

    this._heartBeatCallback = listenerFunctions.createSecureListenerFunction(this, this._heartBeat);
    this._heartBeatInterval = -1;

    this._updateLayoutDuringPlayCallback = listenerFunctions.createSecureListenerFunction(this, this._updateLayoutDuringPlay);
    this._updateLayoutDuringPlayInterval = -1;
}

var p = LiveManager.prototype;

p.startUpdating = function() {
    console.log("weblab.orchestra.LiveManager::startUpdating");
    this._heartBeatInterval = setInterval(this._heartBeatCallback, 4000);

    this._updateLayoutDuringPlayInterval = setInterval(this._updateLayoutDuringPlayCallback, 1000 * 60 * 60);
};

p.assumeControl = function(aInstrumentIds) {
    console.log("weblab.orchestra.LiveManager::assumeControl");

    var newInstruments = new Array();

    var currentArray = aInstrumentIds;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentId = currentArray[i];
        var currentIndex = this._handledInstruments.indexOf(currentId);
        if (currentIndex == -1) {
            this._handledInstruments.push(currentId);
        }
    }

    this._numberOfUsers = this._handledInstruments.length;

    this._currentPlayerIds = new Array(this._numberOfUsers);
    this._museumUsers = new Array(this._numberOfUsers);
    this._lastRegistrationTimes = new Array(this._numberOfUsers);

    for (var i = 0; i < this._numberOfUsers; i++) {
        this._lastRegistrationTimes[i] = new Date();
    }
};

p.handleDebugResetRequest = function(aRequest, aResponse) {
    //console.log("weblab.orchestra.LiveManager::handleDebugResetRequest");

    this._requestedPlayerLayout.reset();
    this._confirmedPlayerLayout.reset();

    if (this._museumClient != null) {
        this._museumClient.closeConnection();
        this._museumClient = null;
    }

    var currentArray = this._museumUsers;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentUser = currentArray[i];
        if (currentUser != null) {
            currentUser.closeConnection();
        }
    }

    this._currentPlayerIds = new Array(this._numberOfUsers);
    this._museumUsers = new Array(this._numberOfUsers);
    this._lastRegistrationTimes = new Array();

    for (var i = 0; i < this._numberOfUsers; i++) {
        this._lastRegistrationTimes[i] = new Date();
    }

    aResponse.writeHead(200, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*"
    });
    aResponse.end("Player reset");
};

p.handleMuseumUserJoinUpgrade = function(aRequest, aSocket, aBody) {
    console.log("weblab.orchestra.LiveManager::handleMuseumUserJoinUpgrade");

    if (webSocketFunctions.isWebSocketUpgrade(aRequest)) {

        var parsedUrl = url.parse(aRequest.url, true);
        var instrumentId = parseInt(parsedUrl.query["instrumentId"], 10);

        console.log(instrumentId, this._museumUsers, this._museumUsers[instrumentId]);
        if (this._museumUsers[instrumentId] != null) {
            console.log(">Close");
            this._museumUsers[instrumentId].closeConnection();
            this._museumUsers[instrumentId] = null;
        }

        var connectionType = webSocketFunctions.connectUpgrade(aRequest, aSocket, aBody, webSocketFunctions.getOrigin(aRequest), webSocketFunctions.getLocation(aRequest));

        var newUser = MuseumUser.create(aSocket, this);
        newUser.setInstrumentId(instrumentId);
        newUser.connectionType = connectionType;
        this._museumUsers[instrumentId] = newUser;

        var playerLayoutMessage = MessageEncoder.encodePlayerLayout(this._confirmedPlayerLayout);
        var playerLayoutFrame;
        switch (connectionType) {
            case 0:
                playerLayoutFrame = webSocketEncoding.encodeUtf8MessageHybi00(playerLayoutMessage.toString("utf8"));
                break;
            case 1:
                playerLayoutFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(playerLayoutMessage.toString("utf8"));
                break;
        }
        newUser.sendMessage(playerLayoutFrame);

        var currentPlayersMessage = MessageEncoder.encodeCurrentPlayerIds(this._currentPlayerIds);
        var currentPlayersFrame;
        switch (connectionType) {
            case 0:
                currentPlayersFrame = webSocketEncoding.encodeUtf8MessageHybi00(currentPlayersMessage.toString("utf8"));
                break;
            case 1:
                currentPlayersFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(currentPlayersMessage.toString("utf8"));
                break;
        }
        newUser.sendMessage(currentPlayersFrame);
    } else {
        aSocket.end();
        aSocket.destroy();
    }
};

p.handleMuseumUpgrade = function(aRequest, aSocket, aBody) {
    console.log("weblab.orchestra.LiveManager::handleMuseumUpgrade");

    if (webSocketFunctions.isWebSocketUpgrade(aRequest)) {

        var parsedUrl = url.parse(aRequest.url, true);

        var connectionType = webSocketFunctions.connectUpgrade(aRequest, aSocket, aBody, webSocketFunctions.getOrigin(aRequest), webSocketFunctions.getLocation(aRequest, false));

        if (this._museumClient != null) {
            this._museumClient.closeConnection();
            this._museumClient = null;
        }

        this._museumClient = MuseumClient.create(aSocket, this);
        this._museumClient.connectionType = connectionType;

        var playerLayoutMessage = MessageEncoder.encodePlayerLayout(this._confirmedPlayerLayout);
        var playerLayoutFrame;
        switch (connectionType) {
            case 0:
                playerLayoutFrame = webSocketEncoding.encodeUtf8MessageHybi00(playerLayoutMessage.toString("utf8"));
                break;
            case 1:
                playerLayoutFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(playerLayoutMessage.toString("utf8"));
                break;
        }
        this._museumClient.sendMessage(playerLayoutFrame);
    } else {
        aSocket.end();
        aSocket.destroy();
    }
};

p.updateLayoutDuringPlay = function() {
    console.log("weblab.orchestra.LiveManager::updateLayoutDuringPlay");
    this._updateLayoutDuringPlay();
};

p._updateLayoutDuringPlay = function() {
    console.log("weblab.orchestra.LiveManager::_updateLayoutDuringPlay");

    var playerLayoutMessage = MessageEncoder.encodePlayerLayout(this._requestedPlayerLayout);
    var playerLayoutFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(playerLayoutMessage.toString("utf8"));

    MessageEncoder.decodePlayerLayoutMessage(playerLayoutMessage.slice(1), this._confirmedPlayerLayout);
    this._museumClient.sendMessage(playerLayoutFrame);

    console.log(playerLayoutMessage);
    console.log("Requested: " + this._requestedPlayerLayout.getReadableString());
    console.log("Confirmed: " + this._confirmedPlayerLayout.getReadableString());

};


p.museumUserJoined = function(aInstrumentId, aUserId) {
    console.log("weblab.orchestra.LiveManager::museumUserJoined");
    console.log(aInstrumentId, aUserId);

    if (aUserId != "anonymous") {
        this._currentPlayerIds[aInstrumentId] = aUserId;
    }
    this._lastRegistrationTimes[aInstrumentId] = new Date();

    var userJoinedMessage = MessageEncoder.encodeUserJoined(aInstrumentId, aUserId);
    this.broadcastBufferMessageToEveryone(userJoinedMessage);
};

p.museumUserLeft = function(aInstrumentId, aUserId) {
    console.log("weblab.orchestra.LiveManager::museumUserLeft");
    console.log(aInstrumentId, aUserId);

    if (this._currentPlayerIds[aInstrumentId] == aUserId) {
        this._currentPlayerIds[aInstrumentId] = null;
    }

    var userLeftMessage = MessageEncoder.encodeUserLeft(aInstrumentId, aUserId);
    this.broadcastBufferMessageToEveryone(userLeftMessage);
};

p.setCurrentLayout = function(aLayoutMessage) {
    console.log("weblab.orchestra.LiveManager::setCurrentLayout");

    MessageEncoder.decodePlayerLayoutMessage(aLayoutMessage, this._requestedPlayerLayout);
    MessageEncoder.decodePlayerLayoutMessage(aLayoutMessage, this._confirmedPlayerLayout);

    //console.log(this._confirmedPlayerLayout);
};

p.setCurrentPlayers = function(aPlayerIds) {
    for (var i = 0; i < 8; i++) {
        var currentId = aPlayerIds[i];
        if (currentId != "") {
            this._currentPlayerIds[i] = currentId;
        }
    }
};

p.addNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
    console.log("weblab.orchestra.LiveManager::addNote");
    console.log(aInstrumentId, aNoteId, aPosition, aPitch);

    this._lastRegistrationTimes[aInstrumentId] = new Date();

    if (this._museumClient == null) {
        this.broadcastTextMessage(MessageIds.LOG_WARNING, "Museum client doesn't exist");
        return false;
    } else if (this._requestedPlayerLayout.addNote(aInstrumentId, aNoteId, aPosition, aPitch)) {

        var noteMessage = MessageEncoder.encodeAddNote(aInstrumentId, aNoteId, aPosition, aPitch);
        var noteFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(noteMessage.toString("utf8"));
        var noteFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(noteMessage.toString("utf8"));

        if (this._handledInstruments.indexOf(aInstrumentId) != -1) {
            this.sendToMuseum(noteFrame);
        }
        this.broadcastMessage(noteFrame, noteFrameHybi00);
        return true;
    }
    return false;
};

p.noteAdded = function(aInstrumentId, aNoteId, aPosition, aPitch, aDate) {
    console.log("weblab.orchestra.LiveManager::noteAdded");
    console.log(aInstrumentId, aNoteId, aPosition, aPitch);

    this._confirmedPlayerLayout.addNote(aInstrumentId, aNoteId, aPosition, aPitch);

    var noteMessage = MessageEncoder.encodeNoteAdded(aInstrumentId, aNoteId, aPosition, aPitch, aDate);
    var noteFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(noteMessage.toString("utf8"));
    var noteFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(noteMessage.toString("utf8"));

    this.broadcastMessage(noteFrame, noteFrameHybi00);
    return true;
};

p.changeNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
    console.log("weblab.orchestra.LiveManager::changeNote");
    console.log(aInstrumentId, aNoteId, aPosition, aPitch);

    this._lastRegistrationTimes[aInstrumentId] = new Date();

    if (this._museumClient == null) {
        this.broadcastTextMessage(MessageIds.LOG_WARNING, "Museum client doesn't exist");
        return false;
    } else if (this._requestedPlayerLayout.changeNote(aInstrumentId, aNoteId, aPosition, aPitch)) {

        var noteMessage = MessageEncoder.encodeChangeNote(aInstrumentId, aNoteId, aPosition, aPitch);
        var noteFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(noteMessage.toString("utf8"));
        var noteFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(noteMessage.toString("utf8"));

        if (this._handledInstruments.indexOf(aInstrumentId) != -1) {
            this.sendToMuseum(noteFrame);
        }
        this.broadcastMessage(noteFrame, noteFrameHybi00);
        return true;
    }
    return false;
};

p.noteChanged = function(aInstrumentId, aNoteId, aPosition, aPitch, aDate) {
    console.log("weblab.orchestra.LiveManager::noteChanged");
    console.log(aInstrumentId, aNoteId, aPosition, aPitch);

    this._confirmedPlayerLayout.changeNote(aInstrumentId, aNoteId, aPosition, aPitch);

    var noteMessage = MessageEncoder.encodeNoteChanged(aInstrumentId, aNoteId, aPosition, aPitch, aDate);
    var noteFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(noteMessage.toString("utf8"));
    var noteFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(noteMessage.toString("utf8"));

    this.broadcastMessage(noteFrame, noteFrameHybi00);
    return true;
};

p.removeNote = function(aInstrumentId, aNoteId) {
    console.log("weblab.orchestra.LiveManager::removeNote");
    console.log(aInstrumentId, aNoteId);

    this._lastRegistrationTimes[aInstrumentId] = new Date();

    if (this._museumClient == null) {
        this.broadcastTextMessage(MessageIds.LOG_WARNING, "Museum client doesn't exist");
        return false;
    } else if (this._requestedPlayerLayout.removeNote(aInstrumentId, aNoteId)) {

        var noteMessage = MessageEncoder.encodeRemoveNote(aInstrumentId, aNoteId);
        var noteFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(noteMessage.toString("utf8"));
        var noteFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(noteMessage.toString("utf8"));

        if (this._handledInstruments.indexOf(aInstrumentId) != -1) {
            this.sendToMuseum(noteFrame);
        }
        this.broadcastMessage(noteFrame, noteFrameHybi00);
        return true;
    }
    return false;
};

p.noteRemoved = function(aInstrumentId, aNoteId, aDate) {
    console.log("weblab.orchestra.LiveManager::noteRemoved");
    console.log(aInstrumentId, aNoteId, aDate);

    //MENOTE: layout might have been updated before
    this._confirmedPlayerLayout.removeNote(aInstrumentId, aNoteId)
    //if(this._confirmedPlayerLayout.removeNote(aInstrumentId, aNoteId)) {

    var noteMessage = MessageEncoder.encodeNoteRemoved(aInstrumentId, aNoteId, aDate);
    var noteFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(noteMessage.toString("utf8"));
    var noteFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(noteMessage.toString("utf8"));

    this.broadcastMessage(noteFrame, noteFrameHybi00);
    return true;
    //}
    //return false;
};

p.sendToMuseum = function(aMessageFrame) {
    if (this._museumClient != null) {
        this._museumClient.sendMessage(aMessageFrame);
    } else {
        //MEDEBUG: //
        //console.log("Museum client doesn't exist");
        this.broadcastTextMessage(MessageIds.LOG_WARNING, "Museum client doesn't exist");
    }
};

p.broadcastMessageToEveryone = function(aMessageFrame, aMessageFrameHybi00) {
    var currentArray = this._museumUsers;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentUser = currentArray[i];
        if (currentUser != null) {
            var sendMessage;
            switch (currentUser.connectionType) {
                case 0:
                    sendMessage = aMessageFrameHybi00;
                    break;
                case 1:
                    sendMessage = aMessageFrame;
                    break;
                default:
                    console.error("No type " + currentUser.connectionType + ". can't broadcast to user " + currentUser);
                    continue;
            }
            currentUser.sendMessage(sendMessage);
        }
    }
};

p.broadcastMessage = function(aMessageFrame, aMessageFrameHybi00) {
    var currentArray = this._museumUsers;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentUser = currentArray[i];
        if (currentUser != null) {
            var sendMessage;
            switch (currentUser.connectionType) {
                case 0:
                    sendMessage = aMessageFrameHybi00;
                    break;
                case 1:
                    sendMessage = aMessageFrame;
                    break;
                default:
                    console.error("No type " + currentUser.connectionType + ". can't broadcast to user " + currentUser);
                    continue;
            }
            currentUser.sendMessage(sendMessage);
        }
    }
};

p.broadcastTextMessage = function(aType, aText) {
    //console.log("weblab.orchestra.LiveManager::broadcastTextMessage");

    var newMessage = MessageEncoder.encodeTextMessage(aType, aText);
    var newFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(newMessage.toString("utf8"));
    var newFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(newMessage.toString("utf8"));

    this.broadcastMessage(newFrame, newFrameHybi00);
};

p.broadcastBufferMessage = function(aMessageBuffer) {
    //console.log("weblab.orchestra.LiveManager::broadcastBufferMessage");

    var newFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(aMessageBuffer.toString("utf8"));
    var newFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(aMessageBuffer.toString("utf8"));

    this.broadcastMessage(newFrame, newFrameHybi00);
};

p.broadcastBufferMessageToEveryone = function(aMessageBuffer) {
    //console.log("weblab.orchestra.LiveManager::broadcastBufferMessageToEveryone");

    var newFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(aMessageBuffer.toString("utf8"));
    var newFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00(aMessageBuffer.toString("utf8"));

    this.broadcastMessageToEveryone(newFrame, newFrameHybi00);
};

p._heartBeat = function() {
    console.log("weblab.orchestra.LiveManager::_heartBeat");
    var newFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(MessageEncoder.encodeDate(new Date()).toString("utf8"), 0x09);
    var newFrameHybi00 = webSocketEncoding.encodeUtf8MessageHybi00("");

    this.sendToMuseum(newFrame);
    this.broadcastMessageToEveryone(newFrame, newFrameHybi00);
};

p.museumUserSocketClosed = function(aUser) {
    console.log("weblab.orchestra.LiveManager::museumUserSocketClosed");

    var instrumentId = aUser.getInstrumentId();

    if (this._museumUsers[instrumentId] == aUser) {
        this._museumUsers[instrumentId] = null;
    }

    aUser.destroy();
};

p.museumSocketClosed = function(aClient) {
    console.log("weblab.orchestra.LiveManager::museumSocketClosed");

    aClient.destroy();
    if (this._museumClient == aClient) {
        this._museumClient = null;
    }
};

exports.LiveManager = LiveManager;

exports.create = function() {
    return new LiveManager();
}
