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

var crypto = require("crypto");
var url = require("url");
var StringFunctions = require("./data/StringFunctions")

var getHandshakeHeaderHybi00 = function(aOrigin, aLocation) {
	var headers = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
		"Upgrade: WebSocket\r\n" +
		"Connection: Upgrade\r\n" +
		"Sec-WebSocket-Origin: " + aOrigin + "\r\n" +
		"Sec-WebSocket-Location: " + aLocation + "\r\n" +
		"\r\n";
	return headers;
};

var getHandshakeHeaderHybi06 = function(aAcceptKey) {
	var headers = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
		"Upgrade: WebSocket\r\n" +
		"Connection: Upgrade\r\n" +
		"Sec-WebSocket-Accept: " + aAcceptKey + "\r\n" +
		"\r\n";
	return headers;
};

var getKeyValueHybi00 = function(aKey) {
	
	var dataValue = parseInt(aKey.replace(/[^\d]/g, ""), 10);
	var numberOfSpaces = aKey.replace(/[^ ]/g, "").length;
	
	var encodeValue = dataValue/numberOfSpaces;
	
	return String.fromCharCode((encodeValue >> 24) & 0xFF, (encodeValue >> 16) & 0xFF, (encodeValue >> 8) & 0xFF, (encodeValue) & 0xFF);
};

var encodeKeyValueHybi06 = function(aKey) {
	//console.log("weblab.utils.webSocketFunctions::encodeKeyValueHybi06");
	var hashGenerator = crypto.createHash("sha1");
	
	//console.log(aKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	hashGenerator.update(aKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	
	return hashGenerator.digest("base64");
};

var getHandshakeResponseHybi00 = function(aKey1, aKey2, aKey3) {
	var md5 = crypto.createHash("md5");
	
	md5.update(getKeyValueHybi00(aKey1));
	md5.update(getKeyValueHybi00(aKey2));
	
	md5.update(aKey3.toString("binary"));
	
	return md5.digest("binary");
};

var connectUpgradeHybi00 = function(aRequest, aSocket, aBody, aOrigin, aLocation) {
	//console.log("weblab.utils.webSocketFunctions::connectUpgradeHybi00");
	aSocket.setTimeout(0);
	aSocket.setNoDelay(true);
	aSocket.setKeepAlive(true, 0);
	
	var headers = getHandshakeHeaderHybi00(aOrigin, aLocation);
	var handshakeResponse = getHandshakeResponseHybi00(aRequest.headers["sec-websocket-key1"], aRequest.headers["sec-websocket-key2"], aBody);
	
	//console.log(headers + handshakeResponse);
	
	aSocket.write(headers + handshakeResponse, "binary");
};

var connectUpgradeHybi06 = function(aRequest, aSocket, aBody) {
	//console.log("weblab.utils.webSocketFunctions::connectUpgradeHybi06");
	aSocket.setTimeout(0);
	aSocket.setNoDelay(true);
	aSocket.setKeepAlive(true, 0);
	
	var headers = getHandshakeHeaderHybi06(encodeKeyValueHybi06(aRequest.headers["sec-websocket-key"]));
	
	//console.log(headers);
	
	aSocket.write(headers, "utf8");
};

var connectUpgrade = function(aRequest, aSocket, aBody, aOrigin, aLocation) {
	if(aRequest.headers["sec-websocket-key"] != null) {
		connectUpgradeHybi06(aRequest, aSocket, aBody);
		return 1;
	}
	else {
		connectUpgradeHybi00(aRequest, aSocket, aBody, aOrigin, aLocation);
		return 0;
	}
};

var getOrigin = function(aRequest) {
	return aRequest.headers["origin"];
};

var getLocation = function(aRequest, aIsSecure) {
	var host = aRequest.headers["host"];
	
	var returnLocation = (aIsSecure) ? "wss://" : "ws://";
	returnLocation += host;
	
	var parsedUrl = url.parse(aRequest.url);
	
	returnLocation += parsedUrl.pathname;
	returnLocation += parsedUrl.search;
	
	return returnLocation;
};

var isWebSocketUpgrade = function(aRequest) {
	//console.log("weblab.utils.webSocketFunctions::isWebSocketUpgrade");
	var headers = aRequest.headers;
	//console.log(aRequest.headers);
	if(aRequest.method == "GET" && (headers["upgrade"] && headers["connection"])) {
		var connectionTypes = StringFunctions.splitSeparatedString(headers["connection"].toLowerCase(), ",", true, true);
		if(connectionTypes.indexOf("upgrade") != -1) {
			if(headers["upgrade"].toLowerCase() == "websocket") {
				return true;
			}
		}
	}
	return false;
};

exports.getHandshakeHeaderHybi00 = getHandshakeHeaderHybi00;
exports.getHandshakeHeaderHybi06 = getHandshakeHeaderHybi06;
exports.getHandshakeResponseHybi00 = getHandshakeResponseHybi00;
exports.connectUpgradeHybi00 = connectUpgradeHybi00;
exports.connectUpgradeHybi06 = connectUpgradeHybi06;
exports.connectUpgrade = connectUpgrade;
exports.getOrigin = getOrigin;
exports.getLocation = getLocation;
exports.isWebSocketUpgrade = isWebSocketUpgrade;