/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

var events = require("events");
var http = require("http");
var listenerFunctions = require("../listenerFunctions");

var HttpPostRequest = function HttpPostRequest() {
	//console.log("weblab.utils.orchestra.HttpPostRequest::HttpPostRequest");
	
	this._url = null;
	this._data = "";
	this._response = null;
	
	this._onDataCallback = listenerFunctions.createSecureListenerFunction(this, this._onData);
	this._onEndCallback = listenerFunctions.createSecureListenerFunction(this, this._onEnd);
	this._onErrorCallback = listenerFunctions.createSecureListenerFunction(this, this._onError);
	this._onResponseCallback = listenerFunctions.createSecureListenerFunction(this, this._onResponse);
}

var p = HttpPostRequest.prototype = new events.EventEmitter();

p.getData = function() {
	return this._data;
}

p._onData = function(aDataPart) {
	this._data += aDataPart;
};

p._onEnd = function() {
	console.log("weblab.utils.orchestra.HttpPostRequest::_onEnd");
	console.log(this._data);
	
	this.emit("loaded");
};

p._onResponse = function(aResponse) {
	this._response = aResponse;
	
	this._response.on("data", this._onDataCallback);
	this._response.on("end", this._onEndCallback);
};

p._onError = function(aError) {
	console.log("weblab.utils.orchestra.HttpPostRequest::_onError");
	console.log("Couldn't load file (" + this._url + "): " + aError.message)
};

p.load = function(aUrl, aData) {
	//console.log("weblab.utils.orchestra.HttpPostRequest::load");
	this._url = aUrl;
	
	var colonPosition = aUrl.indexOf(":");
	var slashPosition = aUrl.indexOf("/");
	
	var getOptions = {"host": aUrl.substring(0, colonPosition), "port": aUrl.substring(colonPosition+1, slashPosition), "path": aUrl.substring(slashPosition, aUrl.length), "method": "POST", "headers": {"Content-Type": "application/x-www-form-urlencoded", "Content-Length": aData.length}};
	
	//console.log(getOptions);
	var request = http.request(getOptions, this._onResponseCallback).on("error", this._onErrorCallback);
	request.write(aData);
	request.end();
	
	return this;
};

exports.HttpPostRequest = HttpPostRequest;

exports.create = function() {
	return new HttpPostRequest();
}