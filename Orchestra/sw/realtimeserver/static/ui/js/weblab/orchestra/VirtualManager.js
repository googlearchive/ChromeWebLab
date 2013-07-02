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

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra");
	var singletonsNamespace = WEBLAB.namespace("WEBLAB.orchestra.singletons");
	
	var PlayerLayout = WEBLAB.namespace("WEBLAB.orchestra.data").PlayerLayout;
	var VirtualRecorder = WEBLAB.namespace("WEBLAB.orchestra.data").VirtualRecorder;
	var MessageEncoder = WEBLAB.namespace("WEBLAB.orchestra.websocket").MessageEncoder;
	var UserWebSocketConnection = WEBLAB.namespace("WEBLAB.orchestra.websocket").UserWebSocketConnection;
	var JsonLoader = WEBLAB.namespace("WEBLAB.utils.loading").JsonLoader;
	var SiteManager = WEBLAB.namespace("WEBLAB.common").SiteManager;
	
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	var MessageIds = WEBLAB.namespace("WEBLAB.orchestra.constants").MessageIds;
	var PlayerChangeEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").PlayerChangeEventTypes;
	
	if(namespace.VirtualManager === undefined) {
		
		var VirtualManager = function VirtualManager() {
			this._init();
		};
		
		namespace.VirtualManager = VirtualManager;
		
		var p = VirtualManager.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;
		
		p._init = function() {
			
			this._webSocketUrlLoader = null;
			this._webSocketConnection = UserWebSocketConnection.create(this);
			this._currentPlayers = new Array(8);
			this._playerLayout = PlayerLayout.create();
			this._instrumentId = -1;
			this._implementedNumberOfInstruments = 8;
			this._playerDisplay = null;
			this._sequencer = null;
			this._timer = null;
			this._recorder = null;
			this._recordingIsStarted = false;
			this._shouldBeConnected = false;
			
			this._updateInterval = -1;
			this._updateCallback = ListenerFunctions.createListenerFunction(this, this._update);
			this._webSocketUrlLoadedCallback = ListenerFunctions.createListenerFunction(this, this._webSocketUrlLoaded);
			this._webSocketUrlLoadingErrorCallback = ListenerFunctions.createListenerFunction(this, this._webSocketUrlLoadingError);
			
			this._webSocketConnection.addEventListener("open", ListenerFunctions.createListenerFunction(this, this._connectionOpened));
			this._webSocketConnection.addEventListener("close", ListenerFunctions.createListenerFunction(this, this._connectionClosed));
			
			return this;
		};
		
		p.setInstrumentId = function(aInstrumentId) {
			//console.log("weblab.orchestra.VirtualManager::setInstrumentId");
			
			this._instrumentId = aInstrumentId;
			
			return this;
		};
		
		p.setPlayerDisplay = function(aPlayer) {
			//console.log("weblab.orchestra.VirtualManager::setPlayerDisplay");
			
			this._playerDisplay = aPlayer;
			this._playerDisplay.onNoteChanged =  ListenerFunctions.createListenerFunction(this, this._onNoteChanged);
			this._playerDisplay.onNoteAdded =  ListenerFunctions.createListenerFunction(this, this._onNoteAdded);
			this._playerDisplay.onNoteRemoved =  ListenerFunctions.createListenerFunction(this, this._onNoteRemoved);
			
			return this;
		};
		
		p.setSequencer = function(aSequencer) {
			//console.log("weblab.orchestra.VirtualManager::setSequencer");
			
			this._sequencer = aSequencer;
			
			return this;
		};
		
		p.connect = function() {
			this._shouldBeConnected = true;
			
			var url = singletonsNamespace.orchestraManager.backendUrlGenerator.generateGetVirtualRealTimeServer(this._instrumentId);
			//METODO: room id
			
			this._webSocketUrlLoader = JsonLoader.create(url);
			
			this._webSocketUrlLoader.addEventListener(JsonLoader.LOADED, this._webSocketUrlLoadedCallback, false);
			this._webSocketUrlLoader.addEventListener(JsonLoader.ERROR, this._webSocketUrlLoadingErrorCallback, false);
			
			this._webSocketUrlLoader.load();
		};
		
		p.stop = function() {
			console.log("weblab.orchestra.VirtualManager::stop");
			this._shouldBeConnected = false;
			
			this._webSocketConnection.disconnect();
			
			if(this._sequencer !== null) {
				this._sequencer.stop();
			}
		};
		
		p._webSocketUrlLoaded = function(aEvent) {
			//console.log("weblab.orchestra.VirtualManager::_webSocketUrlLoaded");
			//console.log(aEvent, this._webSocketUrlLoader);
			
			var urlWithStatus = aEvent.detail;
			
			if(urlWithStatus.status.ok) {
				var url = urlWithStatus.response;
				this._webSocketUrlLoader.destroy();
				this._webSocketUrlLoader = null;
				
				this._webSocketConnection.connect(url);
			}
			else {
				this.dispatchCustomEvent(PlayerChangeEventTypes.CONNECTION_LOST, null);
			}
		};
		
		p._webSocketUrlLoadingError = function(aEvent) {
			console.log("weblab.orchestra.VirtualManager::_webSocketUrlLoadingError");
			
			this.dispatchCustomEvent(PlayerChangeEventTypes.CONNECTION_LOST, null);
		};
		
		p._connectionOpened = function() {
			console.log("weblab.orchestra.VirtualManager::_connectionOpened");
			
			this.dispatchCustomEvent(PlayerChangeEventTypes.CONNECTION_ESTABLISHED, null);
			
			this._updateInterval = setInterval(this._updateCallback, 40);
			
			//setTimeout(ListenerFunctions.createListenerFunction(this._webSocketConnection, this._webSocketConnection.disconnect), 9*1000); //MEDEBUG: test lost connection
		};
		
		p._connectionClosed = function() {
			console.log("weblab.orchestra.VirtualManager::_connectionClosed");
			
			if(this._shouldBeConnected) {
				this.dispatchCustomEvent(PlayerChangeEventTypes.CONNECTION_LOST, null);
				if(this._sequencer !== null) {
					this._sequencer.stop();
				}
			}
			else {
				if(this._updateInterval !== -1) {
					clearInterval(this._updateInterval);
					this._updateInterval = -1;
				}
			}
		};
		
		p._update = function() {
			//console.log("weblab.orchestra.VirtualManager::_update");
			
			var currentTime = this._timer.getCurrentTime();
			//console.log(currentTime);
			var currentGlobalTime = this._timer.getGlobalTime();
			
			if(this._recorder !== null) {
				if(!this._recordingIsStarted && 0.001*currentGlobalTime >= this._recorder.getStartTime()) {
					this._recorder.setInitialLayout(this._playerLayout.getSnapShot());
					this._recorder.setMutedInstruments(ArrayFunctions.copyArray(this._sequencer.getMutedTracks()));
					
					var currentArray = this._currentPlayers;
					var currentArrayLength = currentArray.length;
					for(var i = 0; i < currentArrayLength; i++) {
						var currentPlayer = currentArray[i];
						if(currentPlayer !== null && currentPlayer !== undefined) {
							this._recorder.addCountry(this._getCountryFromId(currentPlayer));
						}
					}
					
					this.dispatchCustomEvent(PlayerChangeEventTypes.RECORDING_STARTED, this._recorder.getRecording());
					this._recordingIsStarted = true;
				}
				else if(0.001*currentGlobalTime >= this._recorder.getStartTime() + 4*8) {
					this.dispatchCustomEvent(PlayerChangeEventTypes.RECORDING_ENDED, this._recorder.getRecording());
					this._recorder = null;
					this._recordingIsStarted = false;
				}
			}
			
			if(currentTime != -1) {
				this._playerDisplay.updateTime(currentTime, this._timer.getGlobalTime());
				this._sequencer.update(4*this._timer.getAbsoluteTime());
				//2 is the length in seconds of the sequencer, getAbsoluteTime() returns a parametric value for where the playhead should be on the sequencer
			}
		};
		
		p.setCurrentLayout = function(aLayoutMessage) {
			//console.log("weblab.orchestra.VirtualManager::setCurrentLayout");
			//console.log(aLayoutMessage);
			
			MessageEncoder.decodePlayerLayoutMessage(aLayoutMessage, this._playerLayout);
			this._playerDisplay.setToPlayerLayout(this._playerLayout);
			
			for(var i = 0; i < this._implementedNumberOfInstruments; i++) {
				var currentArray = this._playerLayout.instruments[i].notes;
				var currentArrayLength = currentArray.length;
				for(var j = 0; j < currentArrayLength; j++) {
					var currentNote = currentArray[j];
					if(currentNote != null) {
						this._sequencer.startPlayingNote(i, currentNote.position, currentNote.pitch);
					}
				}
			}
		};
		
		p.setTimer = function(aTimer) {
			//console.log("weblab.orchestra.VirtualManager::setTimer");
			
			this._timer = aTimer;
			
			return this;
		};
		
		p.startRecording = function() {
			//console.log("weblab.orchestra.VirtualManager::startRecording");
			
			var timeToNextLoop = 4*(1-this._timer.getCurrentTime());
			//2 is the length in seconds of the sequencer
			
			this._recorder = VirtualRecorder.create();
			this._recorder.setStartTime(0.001*(new Date()).valueOf()+timeToNextLoop);
			var currentCountry = SiteManager.getSingleton().getCountry();
			if(currentCountry === "" || currentCountry === 0) currentCountry = "ZZ";
			this._recorder.addCountry(currentCountry);
			
			console.log(this._recorder);
		};
		
		p.stopRecording = function() {
			
			this._recorder = null;
			this._recordingIsStarted = false;
		};
		
		p.getRecording = function() {
			return this._recorder.getRecording();
		};
		
		p.clearAllUserNotes = function() {
			//console.log("weblab.orchestra.VirtualManager::clearAllUserNotes");
			
			var currentArray = this._playerLayout.instruments[this._instrumentId].notes;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentNote = currentArray[i];
				if(currentNote !== null && currentNote !== undefined) {
					this._onNoteRemoved(this._instrumentId, i);
				}
			}
		}
		
		p.changeInstrument = function(aInstrumentId) {
			//console.log("weblab.orchestra.VirtualManager::changeInstrument");
			this._webSocketConnection.sendMessage(MessageEncoder.encodeChangeInstrument(aInstrumentId));
		};
		
		p.updateLoops = function(aLoopTimes) {
			//MENOTE: do nothing
		};
		
		p.muteInstrument = function(aInstrumentId) {
			this._sequencer.muteTrack(aInstrumentId);
			this._playerDisplay.muteInstrument(aInstrumentId);
			if(this._recorder !== null && this._recordingIsStarted) {
				this._recorder.muteInstrument(aInstrumentId);
			}
		};
		
		p.unmuteInstrument = function(aInstrumentId) {
			//console.log("weblab.orchestra.VirtualManager::unmuteInstrument");
			this._sequencer.unmuteTrack(aInstrumentId);
			this._playerDisplay.unmuteInstrument(aInstrumentId);
			if(this._recorder !== null && this._recordingIsStarted) {
				this._recorder.unmuteInstrument(aInstrumentId);
			}
		};
		
		p.addNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			console.log("weblab.orchestra.VirtualManager::addNote");
			console.log(aInstrumentId, aNoteId, aPosition, aPitch);
			
			//MENOTE: do nothing, virtual sends back note commands directly
			
			return false;
		};

		p.noteAdded = function(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp) {
			console.log("weblab.orchestra.VirtualManager::noteAdded");
			console.log(aInstrumentId, aNoteId, aPosition, aPitch);
			
			this._playerLayout.addNote(aInstrumentId, aNoteId, aPosition, aPitch);
			this._playerDisplay.prepareAddNote(aInstrumentId, aNoteId, aPosition, aPitch);
			if(aInstrumentId < this._implementedNumberOfInstruments) {
				this._sequencer.startPlayingNote(aInstrumentId, aPosition, aPitch);
			}
			//MEDEBUG: sync time should be -1 except for testing delays
			var syncTime =  -1; //(new Date()).valueOf()+3000;
			this._playerDisplay.addNote(aInstrumentId, aNoteId, aPosition, aPitch, syncTime);
			if(this._recorder !== null && this._recordingIsStarted) {
				this._recorder.addNote(aInstrumentId, aNoteId, aPosition, aPitch);
			}
			
			return false;
		};
		
		p.changeNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			console.log("weblab.orchestra.VirtualManager::changeNote");
			console.log(aInstrumentId, aNoteId, aPosition, aPitch);
			
			//MENOTE: do nothing, virtual sends back note commands directly
			
			return false;
		};
		
		p.noteChanged = function(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp) {
			console.log("weblab.orchestra.VirtualManager::noteChanged");
			console.log(aInstrumentId, aNoteId, aPosition, aPitch);
			
			var currentNote = this._playerLayout.instruments[aInstrumentId].notes[aNoteId];
			
			if(aInstrumentId < this._implementedNumberOfInstruments) {
				this._sequencer.stopPlayingNote(aInstrumentId, currentNote.position, currentNote.pitch);
			}
			if(aInstrumentId < this._implementedNumberOfInstruments) {
				this._sequencer.startPlayingNote(aInstrumentId, aPosition, aPitch);
			}
			
			currentNote.position = aPosition;
			currentNote.pitch = aPitch;
			this._playerDisplay.prepareChangeNote(aInstrumentId, aNoteId, aPosition, aPitch);
			//MEDEBUG: sync time should be -1 except for testing delays
			var syncTime =  -1; //(new Date()).valueOf()+3000;
			this._playerDisplay.changeNote(aInstrumentId, aNoteId, aPosition, aPitch, syncTime);
			if(this._recorder !== null && this._recordingIsStarted) {
				this._recorder.changeNote(aInstrumentId, aNoteId, aPosition, aPitch);
			}
			
			return false;
		};
		
		p.removeNote = function(aInstrumentId, aNoteId) {
			console.log("weblab.orchestra.VirtualManager::removeNote");
			console.log(aInstrumentId, aNoteId);
			
			//MENOTE: do nothing, virtual sends back note commands directly
			
			return false;
		};
		
		p.noteRemoved = function(aInstrumentId, aNoteId, aTimeStamp) {
			console.log("weblab.orchestra.VirtualManager::noteRemoved");
			console.log(aInstrumentId, aNoteId);
			
			var currentNote = this._playerLayout.instruments[aInstrumentId].notes[aNoteId];
			if(aInstrumentId < this._implementedNumberOfInstruments) {
				this._sequencer.stopPlayingNote(aInstrumentId, currentNote.position, currentNote.pitch);
			}
			
			this._playerLayout.removeNote(aInstrumentId, aNoteId);
			this._playerDisplay.prepareRemoveNote(aInstrumentId, aNoteId);
			//MEDEBUG: sync time should be -1 except for testing delays
			var syncTime = (new Date()).valueOf()+200; //-1; //MENOTE: use small time to perorm aniamtion
			this._playerDisplay.removeNote(aInstrumentId, aNoteId, syncTime);
			if(this._recorder !== null && this._recordingIsStarted) {
				this._recorder.removeNote(aInstrumentId, aNoteId);
			}
			
			return false;
		};
		
		p.customMessage = function(aMessageId, aData) {
			console.log("weblab.orchestra.VirtualManager::customMessage");
			console.log(aMessageId, aData);
			
			switch(aMessageId) {
				case MessageIds.INSTRUMENT_CHANGED:
					var instrumentId = aData.charCodeAt(0);
					this._instrumentId = instrumentId;
					var userId = aData.substring(1, aData.length);
					var currentArray = this._currentPlayers;
					var currentArrayLength = currentArray.length;
					for(var i = 0; i < currentArrayLength; i++) {
						var currentUser = currentArray[i];
						if(currentUser === userId) {
							currentArray[i] = null;
							break;
						}
					}
					this._currentPlayers[instrumentId] = userId;
					var eventData = {"instrumentId": instrumentId, "userId": userId};
					this.dispatchCustomEvent(PlayerChangeEventTypes.INSTRUMENT_CHANGED, eventData);
					break;
				case MessageIds.INSTRUMENT_CHANGE_REFUSED:
					var instrumentId = aData.charCodeAt(0);
					var userId = aData.substring(1, aData.length);
					var eventData = {"instrumentId": instrumentId, "userId": userId};
					this.dispatchCustomEvent(PlayerChangeEventTypes.INSTRUMENT_CHANGE_REFUSED, eventData);
					break;
				case MessageIds.USER_JOINED:
					var instrumentId = aData.charCodeAt(0);
					var userId = aData.substring(1, aData.length);
					this._currentPlayers[instrumentId] = userId;
					if(this._recorder !== null && this._recordingIsStarted) {
						this._recorder.addCountry(this._getCountryFromId(userId));
					}
					var eventData = {"instrumentId": instrumentId, "userId": userId};
					this.dispatchCustomEvent(PlayerChangeEventTypes.USER_JOINED, eventData);
					break;
				case MessageIds.USER_LEFT:
					var instrumentId = aData.charCodeAt(0);
					var userId = aData.substring(1, aData.length);
					if(this._currentPlayers[instrumentId] === userId) this._currentPlayers[instrumentId] = null;
					var eventData = {"instrumentId": instrumentId, "userId": userId};
					this.dispatchCustomEvent(PlayerChangeEventTypes.USER_LEFT, eventData);
					break;
				case MessageIds.CURRENT_PLAYERS:
					var playerList = aData.split(",");
					var currentArray = this._currentPlayers;
					var currentArrayLength = currentArray.length;
					for(var i = 0; i < currentArrayLength; i++) {
						if(playerList[i] === "") {
							currentArray[i] = null;
						}
						else {
							currentArray[i] = playerList[i];
						}
					}
					this.dispatchCustomEvent(PlayerChangeEventTypes.CURRENT_PLAYERS, playerList);
					break;
				case MessageIds.CURRENT_INSTRUMENT:
					var instrumentId = aData.charCodeAt(0);
					this.setInstrumentId(instrumentId);
					this.dispatchCustomEvent(PlayerChangeEventTypes.CURRENT_INSTRUMENT, instrumentId);
					break;
			}
		};

		p.isRecording = function() {
			return this._recordingIsStarted;
		};
		
		p._onNoteChanged = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			console.log("weblab.orchestra.VirtualManager::_onNoteChanged");
			
			this._webSocketConnection.sendMessage(MessageEncoder.encodeChangeNote(aInstrumentId, aNoteId, aPosition, aPitch));
		};
		
		p._onNoteAdded = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			console.log("weblab.orchestra.VirtualManager::_addNoteAdded");
			
			this._webSocketConnection.sendMessage(MessageEncoder.encodeAddNote(aInstrumentId, aNoteId, aPosition, aPitch));
		};
		
		p._onNoteRemoved = function(aInstrumentId, aNoteId) {
			//console.log("weblab.orchestra.VirtualManager::_onNoteRemoved");
			//console.log(aInstrumentId, aNoteId, MessageEncoder.encodeRemoveNote(aInstrumentId, aNoteId));
			
			this._webSocketConnection.sendMessage(MessageEncoder.encodeRemoveNote(aInstrumentId, aNoteId));
		};
		
		p._getCountryFromId = function(aId) {
			var tempArray = aId.split("_");
			return tempArray[1];
		};
		
		p.destroy = function() {
			
			if(this._updateInterval !== -1) {
				clearInterval(this._updateInterval);
				this._updateInterval = -1;
			}
			
			Utils.destroyIfExists(this._webSocketConnection);
			this._webSocketConnection = null;
			
			Utils.destroyIfExists(this._playerLayout);
			this._playerLayout = null;
			
			this._currentPlayers = null;
			this._timer = null; //MENOTE: not owned by the virtual manager
			this._sequencer = null; //MENOTE: not owned by the virtual manager
			
			if(this._playerDisplay !== null) {
				this._playerDisplay.onNoteChanged =  null;
				this._playerDisplay.onNoteAdded =  null;
				this._playerDisplay.onNoteRemoved =  null;
				this._playerDisplay = null;//MENOTE: not owned by the virtual manager
			}
			
			this._updateInterval = -1;
			this._updateCallback = null;
			this._webSocketUrlLoadedCallback = null;
			
			s.destroy.call(this);
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		VirtualManager.create = function() {
			return new VirtualManager();
		};
	}
})();