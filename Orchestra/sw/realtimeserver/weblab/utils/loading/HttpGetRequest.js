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

var HttpGetRequest = function HttpGetRequest() {
	//console.log("weblab.utils.orchestra.HttpGetRequest::HttpGetRequest");
	
	this._url = null;
	this._data = "";
	this._request = null;
	this._response = null;
	
	this._onDataCallback = listenerFunctions.createSecureListenerFunction(this, this._onData);
	this._onEndCallback = listenerFunctions.createSecureListenerFunction(this, this._onEnd);
	this._onErrorCallback = listenerFunctions.createSecureListenerFunction(this, this._onError);
	this._onResponseCallback = listenerFunctions.createSecureListenerFunction(this, this._onResponse);
}

var p = HttpGetRequest.prototype = new events.EventEmitter();

p.getData = function() {
	return this._data;
}

p._onData = function(aDataPart) {
	this._data += aDataPart;
};

p._onEnd = function() {
	//console.log("weblab.utils.orchestra.HttpGetRequest::_onEnd");
	//console.log(this._data);
	
	this.emit("loaded");
};

p._onResponse = function(aResponse) {
	this._response = aResponse;
	
	this._response.on("data", this._onDataCallback);
	this._response.on("end", this._onEndCallback);
};

p._onError = function(aError) {
	console.log("weblab.utils.orchestra.HttpGetRequest::_onError");
	console.log("Couldn't load file (" + this._url + "): " + aError.message)
};

p.load = function(aUrl) {
	//console.log("weblab.utils.orchestra.HttpGetRequest::load");
	this._url = aUrl;
	
	var colonPosition = aUrl.indexOf(":");
	var slashPosition = aUrl.indexOf("/");
	
	var getOptions = {"host": aUrl.substring(0, colonPosition), "port": aUrl.substring(colonPosition+1, slashPosition), "path": aUrl.substring(slashPosition, aUrl.length)};
	
	//console.log(getOptions);
	http.get(getOptions, this._onResponseCallback).on("error", this._onErrorCallback);
	
	return this;
};

p.abort = function() {

	if (this._request != null) {
		console.log("weblab.utils.orchestra.HttpGetRequest::abort");
		this._request.abort();
	}
};

exports.HttpGetRequest = HttpGetRequest;

exports.create = function() {
	return new HttpGetRequest();
}