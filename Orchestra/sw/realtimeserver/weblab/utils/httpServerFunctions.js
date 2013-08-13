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
var url = require("url");

var https = require("https");
var fs = require('fs');

var listenerFunctions = require("./listenerFunctions");

exports.createServer = function(aListenerObject, aListenerFunction) {
    return http.createServer(listenerFunctions.createListenerFunction(aListenerObject, aListenerFunction));
};

exports.addListener = function(aHttpServer, aType, aListenerObject, aListenerFunction) {
    aHttpServer.on(aType, listenerFunctions.createListenerFunction(aListenerObject, aListenerFunction));
};

exports.writeFileNotFound = function(aResponse, aHeaders, aText) {

    aResponse.writeHead(404, aHeaders);
    aResponse.end(aText);
};

exports.writeServerError = function(aResponse, aHeaders, aText) {

    aResponse.writeHead(500, aHeaders);
    aResponse.end(aText);
};

exports.writeSimpleFileNotFound = function(aResponse, aText) {
    //console.log("weblab.utils.httpServerFunctions::writeSimpleFileNotFound");
    //console.log(aText);
    aResponse.writeHead(404, {
        "Content-Type": "text/plain"
    });
    aResponse.end(aText);
};

exports.writeSimpleServerError = function(aResponse, aText) {

    aResponse.writeHead(500, {
        "Content-Type": "text/plain"
    });
    aResponse.end(aText);
};

exports.writeSimpleJsonResponse = function(aResponse, aData) {
    //console.log("weblab.utils.httpServerFunctions::writeSimpleJsonResponse");
    //console.log(aData);

    aResponse.writeHead(200, {
        "Content-Type": "application/json"
    });
    aResponse.end(JSON.stringify(aData));
};

exports.unimplementedCall = function(aRequest, aResponse) {

    var currentPath = url.parse(aRequest.url).pathname;

    aResponse.writeHead(200, {
        "Content-Type": "text/plain"
    });
    aResponse.end(currentPath + " is not implemented yet");
};
