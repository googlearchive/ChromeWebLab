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

var http = require('http');
var net = require('net');
var crypto = require('crypto');
var url = require('url');
var path = require('path');
var fs = require("fs");
var os = require("os");

var listenerFunctions = require('./utils/listenerFunctions');
var httpServerFunctions = require('./utils/httpServerFunctions');

var Configuration = function Configuration() {

    this.debug = false;

}

var Server = function Server() {
    //console.log("weblab.Server::constructor");

    this._status = 0;
    this._httpServer = httpServerFunctions.createServer(this, this._handleRequest);
    this._additionalServers = new Array();

    this._requestHandlers = new Object();
    this._upgradeHandlers = new Object();

    httpServerFunctions.addListener(this._httpServer, "upgrade", this, this._handleUpgrade);
};

Server.prototype.addRequestHandler = function(aPath, aObject, aFunction) {
    console.log("weblab.Server::addRequestHandler :: " + aPath);
    //METODO: check that nothing is undefined
    this._requestHandlers["/" + aPath] = listenerFunctions.createListenerFunction(aObject, aFunction);
};

Server.prototype.addUpgradeHandler = function(aPath, aObject, aFunction) {
    this._upgradeHandlers["/" + aPath] = listenerFunctions.createListenerFunction(aObject, aFunction);
};

Server.prototype._handleRequest = function(aRequest, aResponse) {
    console.log("weblab.Server::_handleRequest");
    // console.log(aRequest);

    var currentPath = url.parse(aRequest.url).pathname;
    console.log("CurrentPath = ", currentPath);
    //console.log("Handler = ", this._requestHandlers[currentPath]);

    if (this._requestHandlers[currentPath] != null) {
        try {
            this._requestHandlers[currentPath](aRequest, aResponse);
        } catch (theError) {
            httpServerFunctions.writeSimpleServerError(aResponse, theError.message + "\n" + theError.stack);
        }
        return;
    }

    httpServerFunctions.writeSimpleFileNotFound(aResponse, "404 File not found");
};


Server.prototype._handleUpgrade = function(aRequest, aSocket, aBody) {
    console.log("weblab.Server::_handleUpgrade");
    // console.log(aRequest);

    var currentPath = url.parse(aRequest.url).pathname;

    if (this._upgradeHandlers[currentPath] != null) {
        try {
            this._upgradeHandlers[currentPath](aRequest, aSocket, aBody, false);
        } catch (theError) {
            console.log("Error while upgrading");
            console.log(theError.message + "\n" + theError.stack);
            aSocket.end();
        }
        return;
    }

    aSocket.end();
};

Server.prototype._started = function() {
    console.log("weblab.Server::_started");
    console.log(os.hostname());

    this._status = 1;
};

Server.prototype.start = function(aPort) {
    console.log("weblab.Server::start");
    this._status = 2;
    this._httpServer.listen(aPort, listenerFunctions.createListenerFunction(this, this._started));
};

Server.prototype._additionalServerStarted = function() {
    console.log("weblab.Server::_additionalServerStarted");
    //MENOTE: do nothing
};

Server.prototype.startAdditionalServer = function(aPort) {
    var newHttpServer = httpServerFunctions.createServer(this, this._handleRequest);
    this._additionalServers.push(newHttpServer);
    httpServerFunctions.addListener(newHttpServer, "upgrade", this, this._handleUpgrade);
    newHttpServer.listen(aPort, listenerFunctions.createListenerFunction(this, this._additionalServerStarted));
};

var StaticFileServer = function StaticFileServer() {

    this._status = 0;
    this.filesFolder = "static/";
    this._httpServer = httpServerFunctions.createServer(this, this._handleRequest);

};

StaticFileServer.prototype._handleRequest = function(aRequest, aResponse) {
    //console.log("weblab.StaticFileServer::_handleRequest");

    var currentPath = url.parse(aRequest.url).pathname;

    var filePath = path.join(process.cwd(), this.filesFolder, currentPath);

    path.exists(filePath, listenerFunctions.createListenerFunctionWithArguments(this, this._fileExistsCallback, [aResponse, filePath]));
};

StaticFileServer.prototype._fileExistsCallback = function(aResponse, aFileName, aExists) {
    //console.log("weblab.StaticFileServer::_fileExistsCallback");

    if (!aExists) {
        httpServerFunctions.writeSimpleFileNotFound(aResponse, "404 File (" + aFileName + ") not found");
        return;
    }

    if (fs.statSync(aFileName).isDirectory()) {
        var filePath = path.join(aFileName, "/index.html");
        path.exists(filePath, listenerFunctions.createListenerFunctionWithArguments(this, this._fileExistsCallback, [aResponse, filePath]));
        return;
    }

    var fileExtensionPattern = new RegExp("\\.([a-zA-Z0-9]+)(\\?[^#]*)?(#.*)?$", "");

    var fileExtensionResult = fileExtensionPattern.exec(aFileName);
    var contentType = "text/plain";
    switch (fileExtensionResult[1]) {
        case "html":
            contentType = "text/html";
            break;
        case "css":
            contentType = "text/css";
            break;
        case "js":
            contentType = "text/javascript";
            break;
        case "swf":
            contentType = "application/x-shockwave-flash";
            break;
        case "jpg":
        case "jpeg":
        case "jfif":
            contentType = "image/jpeg";
            break;
        case "gif":
            contentType = "image/gif";
            break;
        case "png":
            contentType = "image/png";
            break;
        case "svg":
            contentType = "image/svg+xml";
            break;
    }

    fs.readFile(aFileName, "binary", listenerFunctions.createListenerFunctionWithArguments(this, this._fileLoadedCallback, [aResponse, contentType]));
};

StaticFileServer.prototype._fileLoadedCallback = function(aResponse, aContentType, aError, aFile) {
    //console.log("weblab.StaticFileServer::_fileLoadedCallback");
    //console.log(aError, aFile);

    if (aError) {
        httpServerFunctions.writeSimpleServerError(aResponse, "Un error has occured" + "\n" + aError);
        return;
    }

    aResponse.writeHead(200, {
        "Content-Type": aContentType
    });
    aResponse.write(aFile, "binary");
    aResponse.end();
}

StaticFileServer.prototype._started = function() {
    console.log("weblab.StaticFileServer::_started");

    this._status = 1;
};

StaticFileServer.prototype.start = function(aPort) {
    console.log("weblab.StaticFileServer::start");
    this._status = 2;
    this._httpServer.listen(aPort, listenerFunctions.createListenerFunction(this, this._started));
};

exports.Server = Server;
exports.StaticFileServer = StaticFileServer;
exports.configuration = new Configuration();
