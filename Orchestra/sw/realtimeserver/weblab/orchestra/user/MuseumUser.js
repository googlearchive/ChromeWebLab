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

var listenerFunctions = require("../../utils/listenerFunctions");
var webSocketEncoding = require("../../utils/webSocketEncoding");

var MessageEncoder = require("../utils/MessageEncoder");

var MessageIds = require("../constants/MessageIds");

var MuseumUser = function MuseumUser() {
    //console.log("weblab.orchestra.user.MuseumUser::constructor");

    this._socket = null;
    this._controller = null;

    this._instrumentId = -1;
    this._isPlaying = false;
};

MuseumUser.prototype._setup = function(aSocket, aController) {
    //console.log("weblab.orchestra.user.MuseumUser::_setup");

    this._socket = aSocket;
    this._controller = aController;
    this._instrumentId = -1;
    this.connectionType = null;
    this._remainingBuffer = null;

    this._handleSocketDataCallback = listenerFunctions.createListenerFunction(this, this._handleSocketDataSecure);
    this._handleSocketErrorCallback = listenerFunctions.createListenerFunction(this, this._handleSocketError);
    this._handleSocketTimeOutCallback = listenerFunctions.createListenerFunction(this, this._handleSocketTimeOut);
    this._handleSocketCloseCallback = listenerFunctions.createListenerFunction(this, this._handleSocketClose);

    this._socket.on("data", this._handleSocketDataCallback);
    this._socket.on("error", this._handleSocketErrorCallback);
    this._socket.on("timeout", this._handleSocketTimeOutCallback);
    this._socket.on("end", this._handleSocketCloseCallback);
    this._socket.on("close", this._handleSocketCloseCallback);

    return this;
};

MuseumUser.prototype.getInstrumentId = function() {
    //console.log("weblab.orchestra.user.MuseumUser::getInstrumentId");

    return this._instrumentId;
};

MuseumUser.prototype.setInstrumentId = function(aInstrumentId) {
    this._instrumentId = aInstrumentId;
};

MuseumUser.prototype.sendMessage = function(aMessageFrame) {
    //console.log("weblab.orchestra.user.MuseumUser::sendMessage");

    try {
        this._socket.write(aMessageFrame);
    } catch (theError) {
        console.log("Error while sending data");
    }
};

MuseumUser.prototype.sendTextMessage = function(aType, aText) {
    //console.log("weblab.orchestra.user.MuseumUser::sendTextMessage");

    var newMessage = MessageEncoder.encodeTextMessage(aType, aText);
    var newFrame;
    switch (this.connectionType) {
        case 0:
            newFrame = webSocketEncoding.encodeUtf8MessageHybi00(newMessage.toString("utf8"));
            break;
        case 1:
            newFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(newMessage.toString("utf8"));
            break;
        default:
            console.error("No type named " + this.connectionType + ". Can't encode message.");
            return;
    }

    this.sendMessage(newFrame);
};

MuseumUser.prototype._handleSocketDataSecure = function(aData) {
    //console.log("weblab.orchestra.user.MuseumUser::_handleSocketDataSecure");
    try {
        this._handleSocketData(aData);
    } catch (theError) {
        console.log("Error while handling data");
        console.log(aData);
        console.log(theError.message + "\n" + theError.stack);
    }
};

MuseumUser.prototype._handleSocketData = function(aData) {
    //console.log("weblab.orchestra.user.MuseumUser::_handleSocketData");

    var currentBuffer = aData;
    if (this._remainingBuffer != null) {
        console.log("Copy buffers");
        console.log(this._remainingBuffer);
        console.log(aData);
        currentBuffer = new Buffer(this._remainingBuffer.length + aData.length);
        this._remainingBuffer.copy(currentBuffer, 0, 0, this._remainingBuffer.length);
        aData.copy(currentBuffer, this._remainingBuffer.length, 0, aData.length);
        this._remainingBuffer = null;
        console.log(currentBuffer);
    }

    var currentDataLength = webSocketEncoding.getAvailableDataLength(this.connectionType, currentBuffer);

    if (currentDataLength == -1) {
        console.log("weblab.orchestra.user.User::_handleSocketData", "Message doesn't start correctly", this._id);
        console.log(currentBuffer);
        this._socket.end();
        return;
    } else if (!(currentDataLength > 0)) {
        this._remainingBuffer = currentBuffer;
        return;
    } else if (currentDataLength < currentBuffer.length) {
        this._remainingBuffer = currentBuffer.slice(currentDataLength, currentBuffer.length);
        currentBuffer = currentBuffer.slice(0, currentDataLength);
    }

    var currentArray = new Array();
    webSocketEncoding.splitMessages(this.connectionType, currentBuffer, currentArray);
    var currentArrayLength = currentArray.length;

    //console.log(currentArray);

    for (var i = 0; i < currentArrayLength; i++) {
        this._handleSocketMessage(currentArray[i]);
    }
}

MuseumUser.prototype._handleSocketMessage = function(aData) {
    //console.log("weblab.orchestra.user.MuseumUser::_handleSocketMessage");

    var opcode = webSocketEncoding.decodeOpcode(this.connectionType, aData);
    switch (opcode) {
        case 0x00: //Continuation frame
            //METODO: how to deal with this
            return;
        case 0x01: //Text frame
        case 0x02: //Binary frame
            //MENOTE: continue
            break;
        case 0x09: //Ping
            var message = webSocketEncoding.decodeMessages(this.connectionType, aData);
            this.sendMessage(webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(message.toString("utf8"), 0x0A));
            return;
        case 0x08: //Close
            var message = webSocketEncoding.decodeMessages(this.connectionType, aData);
            this.sendMessage(webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(message.toString("utf8"), 0x08));
            return;
        case 0x0A: //Pong
        default: //Reserved
            //MENOTE: do nothing
            return;
    }

    var decodedData = webSocketEncoding.decodeMessages(this.connectionType, aData);
    //console.log(decodedData.toString("utf8"));

    var messageId = decodedData[0];
    switch (messageId) {
        case MessageIds.USER_JOINED:
            var userId = decodedData.toString("utf8");
            userId = userId.substring(2, userId.length);
            if (this._instrumentId == decodedData[1]) {
                this._controller.museumUserJoined(this._instrumentId, userId);
            } else {
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't change user for instrument " + decodedData[1] + ", locked to instrument " + this._instrumentId);
            }
            break;
        case MessageIds.USER_LEFT:
            var userId = decodedData.toString("utf8");
            userId = userId.substring(2, userId.length);
            if (this._instrumentId == decodedData[1]) {
                this._controller.museumUserLeft(this._instrumentId, userId);
            } else {
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't change user for instrument " + decodedData[1] + ", locked to instrument " + this._instrumentId);
            }
            break;
        case MessageIds.CHANGE_NOTE:
            console.log("weblab.orchestra.user.MuseumUser::_handleSocketData CHANGE_NOTE");
            var isOk = false;
            if (this._instrumentId == decodedData[1]) {
                isOk = this._controller.changeNote(this._instrumentId, decodedData[2], decodedData[3], decodedData[4]);
            }
            if (!isOk) {
                console.log("Couldn't change note " + this._instrumentId + " " + decodedData[2] + " " + decodedData[3] + " " + decodedData[4]);
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't change note " + this._instrumentId + " " + decodedData[2] + " " + decodedData[3] + " " + decodedData[4]);
            }
            break;
        case MessageIds.ADD_NOTE:
            console.log("weblab.orchestra.user.MuseumUser::_handleSocketData ADD_NOTE");
            var isOk = false;
            if (this._instrumentId == decodedData[1]) {
                isOk = this._controller.addNote(this._instrumentId, decodedData[2], decodedData[3], decodedData[4]);
            }
            if (!isOk) {
                console.log("Couldn't add note " + this._instrumentId + " " + decodedData[2] + " " + decodedData[3] + " " + decodedData[4]);
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't add note " + this._instrumentId + " " + decodedData[2] + " " + decodedData[3] + " " + decodedData[4]);
            }
            break;
        case MessageIds.REMOVE_NOTE:
            console.log("weblab.orchestra.user.MuseumUser::_handleSocketData REMOVE_NOTE");
            var isOk = false;
            if (this._instrumentId == decodedData[1]) {
                isOk = this._controller.removeNote(this._instrumentId, decodedData[2]);
            }
            if (!isOk) {
                console.log("Couldn't remove note " + this._instrumentId + " " + decodedData[2]);
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't remove note " + this._instrumentId + " " + decodedData[2]);
            }
            break;
        case MessageIds.REQUEST_RECORDING:
            console.log("Request recording is no a part of the makers edition " + decodedData.toString("utf8"));
            this.sendTextMessage(MessageIds.LOG_ERROR, "Request recording is no a part of the makers edition " + decodedData.toString("utf8"));
            break;
        default:
            console.log("No case for " + messageId + " in " + decodedData.toString("utf8"));
            this.sendTextMessage(MessageIds.LOG_ERROR, "No case for " + messageId.toString(16) + " in " + decodedData.toString("utf8"));
            //METODO: error message
            break;
    }

    //var testEncode = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks("test");
    //var testEncodeData = webSocketEncoding.decodeMessagesHybi06(testEncode);
    //console.log(testEncodeData.toString("utf8"));
};

MuseumUser.prototype._handleSocketError = function() {
    console.log("weblab.orchestra.user.MuseumUser::_handleSocketError");


};

MuseumUser.prototype._handleSocketTimeOut = function() {
    console.log("weblab.orchestra.user.MuseumUser::_handleSocketTimeOut");


};

MuseumUser.prototype._handleSocketClose = function() {
    console.log("weblab.orchestra.user.MuseumUser::_handleSocketClose");

    if (this._controller != null) {
        this._controller.museumUserSocketClosed(this);
    }

    if (this._socket != null) {
        this._socket.destroy();
    }
};

MuseumUser.prototype.closeConnection = function() {
    this._socket.end();
};

MuseumUser.prototype.destroy = function() {
    //console.log("weblab.orchestra.user.MuseumUser::destroy");

    if (this._socket != null) {
        this._socket.removeListener("data", this._handleSocketDataCallback);
        this._socket.removeListener("error", this._handleSocketErrorCallback);
        this._socket.removeListener("timeout", this._handleSocketTimeOutCallback);
        this._socket.removeListener("end", this._handleSocketCloseCallback);
        this._socket.removeListener("close", this._handleSocketCloseCallback);
    }

    if (this._socket != null) {
        this._socket.destroy();
    }
    this._socket = null;
    this._controller = null;

    this._handleSocketDataCallback = null;
    this._handleSocketErrorCallback = null;
    this._handleSocketTimeOutCallback = null;
    this._handleSocketCloseCallback = null;

};

exports.MuseumUser = MuseumUser;
exports.create = function(aId, aSocket, aController) {
    var newMuseumUser = new MuseumUser();
    newMuseumUser._setup(aId, aSocket, aController);
    return newMuseumUser;
}
