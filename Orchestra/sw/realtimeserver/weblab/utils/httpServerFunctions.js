/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
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
	aResponse.writeHead(404, {"Content-Type": "text/plain"});
	aResponse.end(aText);
};

exports.writeSimpleServerError = function(aResponse, aText) {
	
	aResponse.writeHead(500, {"Content-Type": "text/plain"});
	aResponse.end(aText);
};

exports.writeSimpleJsonResponse = function(aResponse, aData) {
	//console.log("weblab.utils.httpServerFunctions::writeSimpleJsonResponse");
	//console.log(aData);
	
	aResponse.writeHead(200, {"Content-Type": "application/json"});
	aResponse.end(JSON.stringify(aData));
};

exports.unimplementedCall = function(aRequest, aResponse) {
	
	var currentPath = url.parse(aRequest.url).pathname;
	
	aResponse.writeHead(200, {"Content-Type": "text/plain"});
	aResponse.end(currentPath + " is not implemented yet");
};