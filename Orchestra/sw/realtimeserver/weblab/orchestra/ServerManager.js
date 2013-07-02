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
var os = require("os");

var LiveManager = require("./LiveManager");

var listenerFunctions = require("../utils/listenerFunctions");
var httpServerFunctions = require("../utils/httpServerFunctions");


var RealTimeServerModeStatus = require("./constants/RealTimeServerModeStatus");

var weblabPaths = require("../paths");
var weblabConfiguration = require("../configuration");

var ServerManager = function ServerManager() {
	this._server = null;
	this._liveManager = null;
};

var p = ServerManager.prototype;

p.startLiveManager = function() {
	this._liveManager = LiveManager.create();
	
	this._server.addUpgradeHandler(weblabPaths.ORCHESTRA_USER_JOIN_WEB_SOCKET, this._liveManager, this._liveManager.handleMuseumUserJoinUpgrade);
	this._server.addUpgradeHandler(weblabPaths.ORCHESTRA_INSTRUMENT_CONTROL_JOIN_WEB_SOCKET, this._liveManager, this._liveManager.handleMuseumUpgrade);

	this._server.addRequestHandler(weblabPaths.ORCHESTRA_ADMIN_RESYNC, this, this.handleResync);
	this._server.addRequestHandler(weblabPaths.ORCHESTRA_DEBUG_RESET, this._liveManager, this._liveManager.handleDebugResetRequest);
	
};

p.setServer = function(aServer) {
	this._server = aServer;
	
	this._server.addRequestHandler(weblabPaths.ORCHESTRA_SERVER_GET_REAL_TIME_SERVER_STATUS, this, this.handleStatusRequest);
};

//-----

p.handleStatusRequest = function(aRequest, aResponse) {
	
	var returnObject = new Object();
	returnObject.status = RealTimeServerModeStatus.ERROR;
	returnObject.instruments = null;
	
	if(this._liveManager != null) {
		if(this._liveManager._museumClient != null) {
			returnObject.instruments = this._liveManager._handledInstruments;
			returnObject.status = RealTimeServerModeStatus.RUNNING;
		}
		else {
			returnObject.status = RealTimeServerModeStatus.NO_CONNECTION_TO_MUSEUM_CLIENT;
			returnObject.instruments = this._liveManager._handledInstruments;
		}
	}
	else {
		returnObject.status = RealTimeServerModeStatus.RUNNING_WITHOUT_RESPONSIBILITES;
	}
	
	aResponse.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
	aResponse.end(JSON.stringify({"status": {"ok": 1}, "response": returnObject}));
};

p.performStartRealTimeControl = function() {
    if(this._liveManager == null) {
        this.startLiveManager();
        this._liveManager.startUpdating();
		
		var numberOfInstruments = weblabConfiguration.NUMBER_OF_INSTRUMENTS;
        var instruments = new Array(numberOfInstruments);
		for(var i = 0; i < numberOfInstruments; i++) {
			instruments[i] = i;
		}
		this._liveManager.assumeControl(instruments);
    }
};

p.handleResync = function(aRequest, aResponse) {
	console.log("weblab.orchestra.ServerManager::handleResync");
	
	if(this._liveManager != null) {
		this._liveManager.updateLayoutDuringPlay();
		aResponse.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
		aResponse.end("true");
	}
	else {
		aResponse.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"});
		aResponse.end("false");
	}
	
};

//-----

exports.ServerManager = ServerManager;

exports.create = function(aServer) {
	var newServerManager = new ServerManager();
	newServerManager.setServer(aServer);
	return newServerManager;
};