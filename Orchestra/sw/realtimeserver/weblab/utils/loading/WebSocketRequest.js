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

var events = require("events");
var http = require("http");
var listenerFunctions = require("../listenerFunctions");

var WebSocketRequest = function WebSocketRequest() {
    //console.log("weblab.utils.orchestra.WebSocketRequest::WebSocketRequest");

    this._url = null;
    this._data = "";
    this._response = null;
    this._socket = null;

    this._onDataCallback = listenerFunctions.createSecureListenerFunction(this, this._onData);
    this._onEndCallback = listenerFunctions.createSecureListenerFunction(this, this._onEnd);
    this._onErrorCallback = listenerFunctions.createSecureListenerFunction(this, this._onError);
    this._onResponseCallback = listenerFunctions.createSecureListenerFunction(this, this._onResponse);

    this._onUpgradeCallback = listenerFunctions.createSecureListenerFunction(this, this._onUpgrade);
}

var p = WebSocketRequest.prototype = new events.EventEmitter();

p.getData = function() {
    return this._data;
};

p.getSocket = function() {
    return this._socket;
};

p._onData = function(aDataPart) {
    this._data += aDataPart;
};

p._onEnd = function() {
    console.log("weblab.utils.orchestra.WebSocketRequest::_onEnd");
    //console.log(this._data);

    this.emit("loaded");
};

p._onResponse = function(aResponse) {
    console.log("weblab.utils.orchestra.WebSocketRequest::_onResponse");
    this._response = aResponse;

    this._response.on("data", this._onDataCallback);
    this._response.on("end", this._onEndCallback);
};

p._onError = function(aError) {
    console.log("weblab.utils.orchestra.WebSocketRequest::_onError");
    console.log("Couldn't load file (" + this._url + "): " + aError.message)
};

p._onUpgrade = function(aRequest, aSocket, aHead) {
    console.log("weblab.utils.orchestra.WebSocketRequest::_onUpgrade");
    //console.log(aSocket);

    aSocket.setTimeout(0);
    aSocket.setNoDelay(true);
    aSocket.setKeepAlive(true, 0);
    aSocket.emit("agentRemove");
    this._socket = aSocket;

    this.emit("upgraded");
};

p.load = function(aUrl) {
    //console.log("weblab.utils.orchestra.WebSocketRequest::load");
    this._url = aUrl;

    var colonPosition = aUrl.indexOf(":");
    var slashPosition = aUrl.indexOf("/");


    var nonceBuffer = new Buffer(16);
    for (var i = 0; i < 16; i++) {
        nonceBuffer[i] = Math.floor(Math.random() * 0x100);
    }

    var nonceBase64 = nonceBuffer.toString("base64");

    var headers = {
        "Upgrade": "websocket",
        "Connection": "Upgrade, Keep-Alive",
        "Sec-WebSocket-Key": nonceBase64,
        "Sec-WebSocket-Version": 13
    };

    var getOptions = {
        "host": aUrl.substring(0, colonPosition),
        "port": aUrl.substring(colonPosition + 1, slashPosition),
        "path": aUrl.substring(slashPosition, aUrl.length),
        "headers": headers
    };

    //console.log(getOptions);
    var requestObject = http.get(getOptions, this._onResponseCallback).on("error", this._onErrorCallback).on("upgrade", this._onUpgradeCallback);
    requestObject.setTimeout(0);
    requestObject.setNoDelay(true);
    requestObject.setSocketKeepAlive(true, 0);

    return this;
};

exports.WebSocketRequest = WebSocketRequest;

exports.create = function() {
    return new WebSocketRequest();
}
