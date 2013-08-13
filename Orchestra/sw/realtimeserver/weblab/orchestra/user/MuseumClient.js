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

var MuseumClient = function MuseumClient() {
    //console.log("weblab.orchestra.user.MuseumClient::constructor");

    this._socket = null;
    this._controller = null;
};

MuseumClient.prototype._setup = function(aSocket, aController) {
    //console.log("weblab.orchestra.user.MuseumClient::_setup");

    this._socket = aSocket;
    this._controller = aController;
    this.connectionType = null;

    this._handleSocketDataCallback = listenerFunctions.createListenerFunction(this, this._handleSocketDataSecure);
    this._handleSocketErrorCallback = listenerFunctions.createListenerFunction(this, this._handleSocketError);
    this._handleSocketTimeOutCallback = listenerFunctions.createListenerFunction(this, this._handleSocketTimeOut);
    this._handleSocketCloseCallback = listenerFunctions.createListenerFunction(this, this._handleSocketClose);

    this._socket.on("data", this._handleSocketDataCallback);
    this._socket.on("error", this._handleSocketErrorCallback);
    this._socket.on("timeout", this._handleSocketTimeOutCallback);
    this._socket.on("end", this._handleSocketCloseCallback);
    this._socket.on("close", this._handleSocketCloseCallback);

    return this
};

MuseumClient.prototype.sendMessage = function(aMessageFrame) {
    //console.log("weblab.orchestra.user.MuseumClient::sendMessage");

    this._socket.write(aMessageFrame);
};

MuseumClient.prototype.sendTextMessage = function(aType, aText) {
    //console.log("weblab.orchestra.user.MuseumClient::sendTextMessage");

    var newMessage = MessageEncoder.encodeTextMessage(aType, aText);
    var newFrame = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(newMessage.toString("utf8"));

    this._socket.write(newFrame);
};

MuseumClient.prototype._handleSocketDataSecure = function(aData) {
    //console.log("weblab.orchestra.user.MuseumClient::_handleSocketDataSecure");
    try {
        this._handleSocketData(aData);
    } catch (theError) {
        console.log("Error while handling data");
        console.log(aData);
        console.log(theError.message + "\n" + theError.stack);
    }
};

MuseumClient.prototype._handleSocketData = function(aData) {
    //console.log("weblab.orchestra.user.MuseumClient::_handleSocketData");

    var currentArray = new Array();
    webSocketEncoding.splitMessages(this.connectionType, aData, currentArray);
    var currentArrayLength = currentArray.length;

    for (var i = 0; i < currentArrayLength; i++) {
        this._handleSocketMessage(currentArray[i]);
    }
}

MuseumClient.prototype._handleSocketMessage = function(aData) {

    var opcode = webSocketEncoding.decodeOpcodeHybi06(aData);
    switch (opcode) {
        case 0x00: //Continuation frame
            //METODO: how to deal with this
            return;
        case 0x01: //Text frame
        case 0x02: //Binary frame
            //MENOTE: continue
            break;
        case 0x09: //Ping
            var message = webSocketEncoding.decodeMessagesHybi06(aData);
            this.sendMessage(webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(message.toString("utf8"), 0x0A));
            return;
        case 0x08: //Close
            var message = webSocketEncoding.decodeMessagesHybi06(aData);
            this.sendMessage(webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks(message.toString("utf8"), 0x08));
            return;
        case 0x0A: //Pong
        default: //Reserved
            //MENOTE: do nothing
            return;
    }

    var decodedData = webSocketEncoding.decodeMessagesHybi06(aData);
    //console.log(decodedData.toString("utf8"));

    //METODO: add time stamps to these messages

    var messageId = decodedData[0];
    switch (messageId) {
        case MessageIds.NOTE_CHANGED:
            //console.log("weblab.orchestra.user.MuseumClient::_handleSocketData NOTE_CHANGED");
            var isOk = this._controller.noteChanged(decodedData[1], decodedData[2], decodedData[3], decodedData[4], MessageEncoder.decodeDate(decodedData, 5));
            if (!isOk) {
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't change note " + decodedData[1] + " " + decodedData[2] + " " + decodedData[3] + " " + decodedData[4]);
            }
            break;
        case MessageIds.NOTE_ADDED:
            //console.log("weblab.orchestra.user.MuseumClient::_handleSocketData NOTE_ADDED");
            var isOk = this._controller.noteAdded(decodedData[1], decodedData[2], decodedData[3], decodedData[4], MessageEncoder.decodeDate(decodedData, 5));
            if (!isOk) {
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't add note " + decodedData[1] + " " + decodedData[2] + " " + decodedData[3] + " " + decodedData[4]);
            }
            break;
        case MessageIds.NOTE_REMOVED:
            //console.log("weblab.orchestra.user.MuseumClient::_handleSocketData NOTE_REMOVED");
            //console.log(decodedData[1], decodedData[2], MessageEncoder.decodeDate(decodedData, 3), decodedData.length);
            //console.log(decodedData[3], decodedData[4], decodedData[5], decodedData[6], decodedData[7], decodedData[8]);
            var isOk = this._controller.noteRemoved(decodedData[1], decodedData[2], MessageEncoder.decodeDate(decodedData, 3));
            if (!isOk) {
                this.sendTextMessage(MessageIds.LOG_ERROR, "Couldn't remove note " + decodedData[1] + " " + decodedData[2]);
            }
            break;
        case MessageIds.LOOP_TIMES:
            //console.log("weblab.orchestra.user.MuseumClient::_handleSocketData LOOP_TIMES");
            //console.log(decodedData);

            var loopTimes = MessageEncoder.decodeLoopTimes(decodedData, 1);

            this._controller.broadcastBufferMessageToEveryone(decodedData);
            break;
        case MessageIds.ALL_NOTES_FOR_INSTRUMENT_REMOVED:
            console.log("weblab.orchestra.user.MuseumClient::_handleSocketData ALL_NOTES_FOR_INSTRUMENT_REMOVED");
            this._controller.allNotesForInstrumentRemoved(decodedData[1], MessageEncoder.decodeDate(decodedData, 2));
            break;
        default:
            console.log("No case for " + messageId + " in " + decodedData.toString("utf8"));
            this.sendTextMessage(MessageIds.LOG_ERROR, "No case for " + messageId + " in " + decodedData.toString("utf8"));
            //METODO: error message
            break;
    }

    //var testEncode = webSocketEncoding.encodeUtf8MessageHybi06WithoutMasks("test");
    //var testEncodeData = webSocketEncoding.decodeMessagesHybi06(testEncode);
    //console.log(testEncodeData.toString("utf8"));
};

MuseumClient.prototype._handleSocketError = function() {
    console.log("weblab.orchestra.user.MuseumClient::_handleSocketError");


};

MuseumClient.prototype._handleSocketTimeOut = function() {
    console.log("weblab.orchestra.user.MuseumClient::_handleSocketTimeOut");


};

MuseumClient.prototype._handleSocketClose = function() {
    console.log("weblab.orchestra.user.MuseumClient::_handleSocketClose");

    this._controller.museumSocketClosed(this);

    if (this._socket != null) {
        this._socket.destroy();
    }
};

MuseumClient.prototype.closeConnection = function() {
    this._socket.end();
};

MuseumClient.prototype.destroy = function() {
    //console.log("weblab.orchestra.user.MuseumClient::destroy");

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

exports.MuseumClient = MuseumClient;
exports.create = function(aSocket, aController) {
    var newMuseumClient = new MuseumClient();
    newMuseumClient._setup(aSocket, aController);
    return newMuseumClient;
}
