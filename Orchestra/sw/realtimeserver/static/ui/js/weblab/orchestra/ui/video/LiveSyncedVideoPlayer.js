/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.video");
	
	var MessageEncoder = namespace.MessageEncoder;
	var MuseumMessageEncoder = namespace.MuseumMessageEncoder;
	var MessageIds = WEBLAB.namespace("WEBLAB.orchestra.constants").MessageIds;
	var WebSocketFunctions = WEBLAB.namespace("WEBLAB.utils.websocket").WebSocketFunctions;
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var PlayerChangeEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").PlayerChangeEventTypes;
	
	var flashCallbackNamespace = WEBLAB.namespace("singletons.flashcallback");
	
	if(namespace.LiveSyncedVideoPlayer === undefined) {
		
		var LiveSyncedVideoPlayer = function LiveSyncedVideoPlayer() {
			this._init();
		};
		
		namespace.LiveSyncedVideoPlayer = LiveSyncedVideoPlayer;
		
		LiveSyncedVideoPlayer._idCounter = 0;
		
		var p = LiveSyncedVideoPlayer.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;
		
		p._init = function() {
			
			this._loopTimes = new Array();
			this._currentLoop = 0;
			this._currentTime = -1;
			this._id = LiveSyncedVideoPlayer._idCounter++;
			this._playerPath = null;
			this._playerFlash = null;
			this._diffRange = 1000;
			this._timeZone = ""; //"+0000"; //"Z";
			this._timeZoneValue = -1;
			this._volume = 1;
			this._globalVolume = 1;
			this._streamUrl = null;
			this._streamId = null;
			this._isLoaded = false;
			this._hasStreamChange = false;
			this._hasVolumeChange = false;
			this._timeCodeAdjust = null;
			this._isPlaying = false;
			
			this._videoSyncTime = 0;
			this._maxVideoExtrapolation = 500;
			this._maxBufferTime = 0.5;
			
			this._bufferCheckInterval = -1;
			this._bufferCheckCallback = ListenerFunctions.createListenerFunction(this, this._checkBuffer);
			this._isBuffering = false;
			
			return this;
		};
		
		p.setTimeCodeAdjust = function(aTimeCodeAdjust) {
			this._timeCodeAdjust = aTimeCodeAdjust;
			
			return this;
		};
		
		p.isBuffering = function() {
			return this._isBuffering;
		};
		
		p._flashCallback = function(aTimeStamp) {
			//console.log("WEBLAB.orchestra.ui.video.LiveSyncedVideoPlayer::_flashCallback");
			
			//var currentDate = new Date(aTimeStamp+this._timeZone);
			//console.log(aTimeStamp, currentDate);
			//console.log(0.001*(currentDate.valueOf()-this._currentTime), 0.001*((new Date()).valueOf()-this._videoSyncTime));
			
			var currentTime = Date.parse(aTimeStamp+this._timeZone);
			
			// Guess Hub/camera timezone based on first timestamp
			// 
			if (this._timeZone == "") {
				var likelyHourlyOffset = Math.round((currentTime - Date.now()) / 3600000);

				// format timezone string and set
				// 
				this._timeZone =
					(likelyHourlyOffset >= 0 ? "+" : "-") +
					(Math.abs(likelyHourlyOffset) < 10 ? "0" : "") +
					Math.abs(likelyHourlyOffset).toString() +
					"00";

				console.log("Notice: guessing timezone to be " + this._timeZone);
			}


			if(isNaN(currentTime)) {
				var tempArray = aTimeStamp.split("T");
				var dateTempArray = tempArray[0].split("-");
				var timeTempArray = tempArray[1].substring(0, 8).split(":");
				var milliSeconds = parseInt(tempArray[1].substring(9, 12), 10);
				
				currentTime = Date.UTC(parseInt(dateTempArray[0], 10), parseInt(dateTempArray[1], 10)-1, parseInt(dateTempArray[2], 10), parseInt(timeTempArray[0], 10), parseInt(timeTempArray[1], 10), parseInt(timeTempArray[2], 10), milliSeconds);
				
				currentTime += this._timeZoneValue*60*60*1000;
			}
			
			
			this._currentTime = (this._timeCodeAdjust === null) ? currentTime : this._timeCodeAdjust.updateTime(currentTime);
			//console.log(this._currentTime, currentTime);
			this._videoSyncTime = Date.now();
			
			if(this._isBuffering && this._isPlaying) {
				this._isBuffering = false;
				this._bufferCheckInterval = setInterval(this._bufferCheckCallback, this._maxBufferTime*1000);
				this.dispatchCustomEvent(PlayerChangeEventTypes.VIDEO_DONE_BUFFERING, null);
			}
		};
		
		p._flashLoadedCallback = function() {
			//console.log("WEBLAB.orchestra.ui.video.LiveSyncedVideoPlayer::_flashLoadedCallback");
			
			this._isLoaded = true;
			
			if(this._isPlaying) {
				if(this._hasStreamChange) {
					this._playerFlash.changeConnection(aUrl, aStreamId);
				}
			}
			else {
				this._playerFlash.stopStream();
			}
			this._hasStreamChange = false;
			
			if(this._hasVolumeChange) {
				this._playerFlash.setVolume(this._volume);
				this._playerFlash.setGlobalVolume(this._globalVolume);
				this._hasVolumeChange = false;
			}
		};
		
		p._checkBuffer = function() {
			var currentTime = Date.now();
			
			if(currentTime > this._videoSyncTime+this._maxBufferTime*1000) {
				this._isBuffering = true
				clearInterval(this._bufferCheckInterval);
				this._bufferCheckInterval = -1;
				this.dispatchCustomEvent(PlayerChangeEventTypes.VIDEO_BUFFERING, null);
			}
			
		};
		
		p.setPlayerPath = function(aPath) {
			this._playerPath = aPath;
			
			return this;
		};
		
		p.setVolume = function(aValue) {
			this._volume = aValue;
			
			if(this._isLoaded) {
				try {
					this._playerFlash.setVolume(this._volume);
				}
				catch(theError) {
					console.error("Error setting volume in flash");
					console.log(theError);
					console.log(theError.stack);
				}
			}
			else {
				this._hasVolumeChange = true;
			}
		};
		
		p.setGlobalVolume = function(aValue) {
			//console.log("WEBLAB.orchestra.ui.video.LiveSyncedVideoPlayer::setGlobalVolume");
			this._globalVolume = aValue;
			if(this._isLoaded) {
				try {
					this._playerFlash.setGlobalVolume(this._globalVolume);
				}
				catch(theError) {
					console.error("Error setting global volume in flash");
					console.log(theError);
					console.log(theError.stack);
				}
			}
			else {
				this._hasVolumeChange = true;
			}
		};
		
		p.createVideoPlayer = function(aTagId, aUrl, aStreamId) {
			console.log("WEBLAB.orchestra.ui.video.LiveSyncedVideoPlayer::createVideoPlayer");
			
			this._isPlaying = true;
			
			var playerName = "liveVideoPlayer" + this._id;
			var javascriptFunctionName = playerName + "_timeCodeCallback";
			var javascriptLoadedFunctionName = playerName + "_flashLoadedCallback";
			var fullJavascriptName = "WEBLAB.singletons.flashcallback." + javascriptFunctionName;
			var fullJavascriptLoadedName = "WEBLAB.singletons.flashcallback." + javascriptLoadedFunctionName;
			
			flashCallbackNamespace[javascriptFunctionName] = ListenerFunctions.createListenerFunction(this, this._flashCallback);
			flashCallbackNamespace[javascriptLoadedFunctionName] = ListenerFunctions.createListenerFunction(this, this._flashLoadedCallback);
			
			var flashvars = {};
			var params = {"allowScriptAccess": "always", "allowFullScreen": "true", "scale": "noscale", "salign": "tl", "menu": "false", "bgcolor": "#000000", "wmode": "opaque"};
			var attributes = {"id": playerName, "name": playerName};
			
			this._streamUrl = aUrl;
			this._streamId = aStreamId;
			
			flashvars["url"] = encodeURIComponent(aUrl);
			flashvars["id"] = aStreamId;
			flashvars["bufferTime"] = 3;
			flashvars["javascriptFunction"] = fullJavascriptName;
			flashvars["javascriptLoadedFunction"] = fullJavascriptLoadedName;
			flashvars["volume"] = this._volume;
			flashvars["globalVolume"] = this._globalVolume;
			
			this._isBuffering = true;
			
			var newFlash = swfobject.embedSWF(this._playerPath, aTagId, "100%", "100%", "10.0.0", null, flashvars, params, attributes);
			//console.log(newFlash);
			
			this._playerFlash = document.getElementById(playerName);
		};
		
		p.changeStream = function(aStreamId) {
			
			this._streamId = aStreamId;
			this._isPlaying = true;
			
			if(this._isLoaded) {
				this._isBuffering = true;
				this._playerFlash.changeStream(aStreamId);
			}
			else {
				this._hasStreamChange = true;
			}
		};
		
		p.changeConnection = function(aUrl, aStreamId) {
			
			this._streamUrl = aUrl;
			this._streamId = aStreamId;
			this._isPlaying = true;
			
			if(this._isLoaded) {
				this._isBuffering = true;
				this._playerFlash.changeConnection(aUrl, aStreamId);
			}
			else {
				this._hasStreamChange = true;
			}
		};
		
		p.stopStream = function() {
			//console.log("WEBLAB.orchestra.ui.video.LiveSyncedVideoPlayer::stopStream");
			
			if(this._isPlaying) {
				this._isPlaying = false;
				
				if(this._isLoaded) {
					this._playerFlash.stopStream();
				}
				else {
					this._hasStreamChange = true;
				}
				
				if(this._bufferCheckInterval !== -1) {
					clearInterval(this._bufferCheckInterval);
					this._bufferCheckInterval = -1;
				}
			}
		}
		
		p.updateLoops = function(aLoopTimes) {
			//console.log("WEBLAB.orchestra.ui.video.LiveSyncedVideoPlayer::updateLoopTimes");
			//console.log(aLoopTimes);
			
			var firstLoopTime = aLoopTimes[0].valueOf()-this._diffRange;
			var currentArray = this._loopTimes;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentValue = currentArray[i].valueOf();
				if(firstLoopTime <= currentValue) {
					currentArray.splice(i, currentArrayLength-i);
					break;
				}
			}
			
			this._loopTimes = currentArray.concat(aLoopTimes);
			
			var currentTime = this._currentTime;
			
			var currentArray = this._loopTimes;
			var currentArrayLength = currentArray.length;
			for(var i = 1; i < currentArrayLength-1; i++) { //MENOTE: skip the first value and the last so that there is always data
				var currentValue = currentArray[1].valueOf();
				if(currentTime >= currentValue) {
					currentArray.shift();
					currentArrayLength--;
					this._currentLoop++;
				}
				else {
					break;
				}
			}
		};
		
		p.getCurrentTime = function() {
			
			if(this._loopTimes.length === 0 || this._currentTime === -1) {
				return -1;
			}
			
			var currentTime = this._currentTime;
			var realCurrentTime = (new Date()).valueOf();
			var extrapolationLength = Math.min(realCurrentTime-this._videoSyncTime, this._maxVideoExtrapolation);
			currentTime += extrapolationLength;
			
			var currentIndex = 0
			
			var currentArray = this._loopTimes;
			var currentArrayLength = currentArray.length;
			for(var i = 1; i < currentArrayLength-1; i++) { //MENOTE: skip the first value and the last so that there is always data
				var currentValue = currentArray[i].valueOf();
				if(currentTime >= currentValue) {
					currentIndex++;
				}
				else {
					break;
				}
			}
			
			if (currentIndex+1 == currentArrayLength)
			{
				console.log(currentIndex, currentArrayLength, i, JSON.stringify(new Date(currentTime)), JSON.stringify(currentArray));
				currentIndex = currentArrayLength -2;	
				console.warn("ERROR : there may be an issue with the timecode on the live video stream");
			} 

			var startTime = currentArray[currentIndex].valueOf();
			var endTime = currentArray[currentIndex+1].valueOf();
			
			var currentPosition = (currentTime-startTime)/(endTime-startTime);
			
			currentPosition -= Math.floor(currentPosition);
			
			if(endTime-startTime < 1000) {
				console.log(currentPosition, currentTime, startTime, endTime);
				console.log(currentIndex, currentArray);
			}
			
			return currentPosition;
		};
		
		p.getAbsoluteTime = function() {
			
			if(this._loopTimes.length === 0 || this._currentTime === -1) {
				return -1;
			}
			
			var currentTime = this._currentTime;
			
			var realCurrentTime = (new Date()).valueOf();
			var extrapolationLength = Math.min(realCurrentTime-this._videoSyncTime, this._maxVideoExtrapolation);
			currentTime += extrapolationLength;
			
			var currentIndex = 0;
			
			var currentArray = this._loopTimes;
			var currentArrayLength = currentArray.length;
			for(var i = 1; i < currentArrayLength-1; i++) { //MENOTE: skip the first value and the last so that there is always data
				var currentValue = currentArray[i].valueOf();
				if(currentTime >= currentValue) {
					currentIndex++;
				}
				else {
					break;
				}
			}
			
			var startTime = currentArray[currentIndex].valueOf();
			var endTime = currentArray[currentIndex+1].valueOf();
			
			var currentPosition = (currentTime-startTime)/(endTime-startTime);
			
			var newTime = this._currentLoop+currentIndex+currentPosition;
			return newTime;
		};
		
		p.getGlobalTime = function() {
			var currentTime = this._currentTime;
			
			var realCurrentTime = (new Date()).valueOf();
			var extrapolationLength = Math.min(realCurrentTime-this._videoSyncTime, this._maxVideoExtrapolation);
			currentTime += extrapolationLength;
			
			return currentTime;
		};
		
		p.destroy = function() {
			console.log("WEBLAB.orchestra.ui.video.LiveSyncedVideoPlayer::destroy");
			
			if(this._bufferCheckInterval !== -1) {
					clearInterval(this._bufferCheckInterval);
					this._bufferCheckInterval = -1;
				}
			
			this.stopStream();
			this._isLoaded = false;
			
			var playerName = "liveVideoPlayer" + this._id;
			var javascriptFunctionName = playerName + "_timeCodeCallback";
			var javascriptLoadedFunctionName = playerName + "_timeCodeCallback";
			var fullJavascriptName = "WEBLAB.singletons.flashcallback." + javascriptFunctionName;
			var fullJavascriptLoadedName = "WEBLAB.singletons.flashcallback." + javascriptLoadedFunctionName;
			
			delete flashCallbackNamespace[javascriptFunctionName];
			delete flashCallbackNamespace[javascriptLoadedFunctionName];
			
			this._loopTimes = null;
			
			this._playerFlash = null;
			
			s.destroy.call(this);
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		LiveSyncedVideoPlayer.create = function(aPlayerPath) {
			var newLiveSyncedVideoPlayer = new LiveSyncedVideoPlayer();
			newLiveSyncedVideoPlayer.setPlayerPath(aPlayerPath);
			return newLiveSyncedVideoPlayer;
		};
	}
})();
