/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.queue");
	var singletonsNamespace = WEBLAB.namespace("WEBLAB.orchestra.singletons");
	
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var JsonLoader = WEBLAB.namespace("WEBLAB.utils.loading").JsonLoader;
	var LiveManager = WEBLAB.namespace("WEBLAB.orchestra").LiveManager;
	var InstrumentQueueLength = WEBLAB.namespace("WEBLAB.orchestra.data").InstrumentQueueLength;
	
	var QueueEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").QueueEventTypes;
	var PlayerChangeEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").PlayerChangeEventTypes;
	
	if(namespace.QueueManager === undefined) {
		
		var QueueManager = function QueueManager() {
			this._init();
		};
		
		namespace.QueueManager = QueueManager;
		
		var p = QueueManager.prototype = new EventDispatcher();
		
		p._init = function() {
			
			this._shouldUpdateQueueLengths = false;
			this._shouldUpdateJoinedQueue = false;
			this._queueIntrumentId = -1;
			
			this._updateInterval = -1;
			this._confirmStartTimedOutId = -1;
			
			this._queueLengths = new Array(8);
			for(var i = 0; i < 8; i++) {
				this._queueLengths[i] = InstrumentQueueLength.create();
			}
			
			this._liveManager = null;
			
			this._queueLengthsUpdatedCallback = ListenerFunctions.createListenerFunction(this, this._queueLengthsUpdated);
			this._joinedQueueLengthUpdatedCallback = ListenerFunctions.createListenerFunction(this, this._joinedQueueLengthUpdated);
			this._updateIntervalCallback = ListenerFunctions.createListenerFunction(this, this._updateData);
			this._joinedQueueCallback = ListenerFunctions.createListenerFunction(this, this._joinedQueue);
			this._forceJoinedQueueCallback = ListenerFunctions.createListenerFunction(this, this._forceJoinedQueue);
			
			this._connectionLostDuringQueueCallback = ListenerFunctions.createListenerFunction(this, this._connectionLostDuringQueue);
			this._connectionRestoredDuringQueueCallback = ListenerFunctions.createListenerFunction(this, this._connectionRestoredDuringQueue);

			this._showConfirmStartCallback = ListenerFunctions.createListenerFunction(this, this._showConfirmStart);
			
			this._adjustStartTimeCallback = ListenerFunctions.createListenerFunction(this, this._adjustStartTime);
			this._confirmStartTimedOutCallback = ListenerFunctions.createListenerFunction(this, this._confirmStartTimedOut);
			
			return this;
		};
		
		p.getLiveManager = function() {
			return this._liveManager;
		};
		
		p.isInQueue = function() {
			return (this._queueIntrumentId != -1);
		};
		
		p.getCurrentQueueId = function(){
			return this._queueIntrumentId;
		};
		
		p.getQueueLengths = function() {
			return this._queueLengths;
		};
		
		p.getSessionId = function() {
			var returnString = singletonsNamespace.orchestraManager.backendUrlGenerator.getUserId();
			returnString += "_" + this._liveManager.getStartTime().valueOf();
			return returnString;
		}
		
		p.getStatusForQueueId = function(aID) {
			var queueData = this._queueLengths[aID];				
			if (queueData.hasData())
			{
				return queueData.getStatus();
			}
			else return -1;			
		};

		p.joinQueue = function(aInstrumentId) {
			console.log("weblab.orchestra.queue.QueueManager::joinQueue");
			
			if (aInstrumentId < 0 || aInstrumentId > 7) 
			{
				console.error("ERROR : Tried to join queue -1");
					return this;
			}

			this._queueIntrumentId = aInstrumentId;
			
			var currentUrl = singletonsNamespace.orchestraManager.backendUrlGenerator.generateJoinQueueForInstrument(this._queueIntrumentId, false);
			var currentLoader = JsonLoader.create(currentUrl);
			currentLoader.addEventListener(JsonLoader.LOADED, this._joinedQueueCallback, false);
			currentLoader.load();
			
			return this;
		};
		
		p.forceJoinQueue = function(aInstrumentId) {
			console.log("weblab.orchestra.queue.QueueManager::forceJoinQueue");
			
			this._queueIntrumentId = aInstrumentId;
			
			var currentUrl = singletonsNamespace.orchestraManager.backendUrlGenerator.generateJoinQueueForInstrument(this._queueIntrumentId, true);
			var currentLoader = JsonLoader.create(currentUrl);
			currentLoader.addEventListener(JsonLoader.LOADED, this._forceJoinedQueueCallback, false);
			currentLoader.load();
			
			return this;
		};
		
		p.leaveQueue = function() {
			//console.log("weblab.orchestra.queue.QueueManager::leaveQueue");
			
			if(this._liveManager !== null) {
				this._liveManager.confirmLeaveQueue();
			}
			
			var currentUrl = singletonsNamespace.orchestraManager.backendUrlGenerator.generateLeaveQueueForInstrument(this._queueIntrumentId);
			var currentLoader = JsonLoader.create(currentUrl);
			currentLoader.load();
			
			this._queueIntrumentId = -1;
			this._shouldUpdateJoinedQueue = false;
			if(!this._shouldUpdateQueueLengths) {
				this._stopInterval();
			}
			
			if(this._liveManager !== null) {
				this._liveManager.destroy();
				this._liveManager = null;
			}
			clearTimeout(this._confirmStartTimedOutId);
			
			this.dispatchCustomEvent(QueueEventTypes.LEFT_QUEUE, null);
			
			return this;
		};
		
		p.confirmStart = function() {
			if(this._queueIntrumentId === -1) {
				console.error("User is not in queue");
				return;
			}
			if(this._confirmStartTimedOutId !== -1) {
				clearTimeout(this._confirmStartTimedOutId);
				this._confirmStartTimedOutId = -1;
			}
			
			this._shouldUpdateJoinedQueue = false;
			if(!this._shouldUpdateQueueLengths) {
				this._stopInterval();
			}
			
			this._queueIntrumentId = -1;

			this._liveManager.removeEventListener(PlayerChangeEventTypes.CONNECTION_LOST, this._connectionLostDuringQueueCallback);
			this._liveManager.removeEventListener(PlayerChangeEventTypes.CONNECTION_RESTORED, this._connectionRestoredDuringQueueCallback);

			this._liveManager._internalFucntionality_confirmStart();
		};
		
		p._updateData = function() {
			//console.log("weblab.orchestra.queue.QueueManager::_updateData");
			// OHDEBUG
			var enabled = !singletonsNamespace.orchestraManager.userData.debugNoQueueData;
			if(this._shouldUpdateQueueLengths) {
				var currentUrl = singletonsNamespace.orchestraManager.backendUrlGenerator.generateGetQueueStatusUrl();
				var currentLoader = JsonLoader.create(currentUrl);
				currentLoader.addEventListener(JsonLoader.LOADED, this._queueLengthsUpdatedCallback, false);
				// OHDEBUG
				if (enabled) currentLoader.load();
			}
			if(this._shouldUpdateJoinedQueue) {
				var currentUrl = singletonsNamespace.orchestraManager.backendUrlGenerator.generateGetQueueForInstrument(this._queueIntrumentId);
				var currentLoader = JsonLoader.create(currentUrl);
				currentLoader.addEventListener(JsonLoader.LOADED, this._joinedQueueLengthUpdatedCallback, false);
				// OHDEBUG
				if (enabled) currentLoader.load();
			}
			if (!enabled)
				throw new Error("This is an error to try and break the start Page");
		};
		
		p.startUpdatingQueueLengths = function() {
			try {
				this._shouldUpdateQueueLengths = true;
				this._updateData();
				this._startInterval();
			} catch (err){

				// OHTODO: display error message here
				console.warn("Error updaing queue lengths: ", err);

			}
		};
		
		p.stopUpdatingQueueLengths = function() {
			this._shouldUpdateQueueLengths = false;
			if(!this._shouldUpdateJoinedQueue) {
				this._stopInterval();
			}
		};
		
		p._startInterval = function() {
			//console.log("weblab.orchestra.queue.QueueManager::_startInterval");
			if(this._updateInterval !== -1) return;
			
			this._updateInterval = setInterval(this._updateIntervalCallback, 5*1000);
		};
		
		p._stopInterval = function() {
			if(this._updateInterval === -1) return;
			
			clearInterval(this._updateInterval);
			this._updateInterval = -1;
		};
		
		p._queueLengthsUpdated = function(aEvent) {
			//console.log("weblab.orchestra.queue.QueueManager::_queueLengthsUpdated");
			
			var queueDataWithStatus = aEvent.detail;
			
			var currentArray = queueDataWithStatus.response;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentData = currentArray[i];
				
				// currentData.status = Math.floor(Math.random() * 5) -1; //OHDEBUG
				
				// if (i % 2 == 1) currentData.status = -1;

				this._queueLengths[i].updateData(currentData.status, currentData.queueLength.numberOfPersons, currentData.queueLength.estimatedTime, currentData.currentPlayer);
			}
			
			this.dispatchCustomEvent(QueueEventTypes.QUEUE_STATUS_UPDATE, this._queueLengths);
		};
		
		p._joinedQueueLengthUpdated = function(aEvent) {
			//console.log("weblab.orchestra.queue.QueueManager::_joinedQueueLengthUpdated");
			
			var queueDataWithStatus = aEvent.detail;
			var queueData = queueDataWithStatus.response;
			
			if(queueData !== null) {
				//console.log(queueData.connect, this._liveManager);
				if(queueData.connect && this._liveManager === null) {
					this._liveManager = LiveManager.create();

					if(this._queueIntrumentId < 0)
						console.error("QueueManager :: Error, trying to connect to instrumentID : ", this._queueIntrumentId);
					this._liveManager.setInstrumentId(this._queueIntrumentId);
					this._liveManager.addEventListener(QueueEventTypes.CONFIRM_START, this._showConfirmStartCallback);
					this._liveManager.addEventListener(QueueEventTypes.ADJUST_START_TIME, this._adjustStartTimeCallback);
					this._liveManager.addEventListener(PlayerChangeEventTypes.CONNECTION_LOST, this._connectionLostDuringQueueCallback);
					this._liveManager.addEventListener(PlayerChangeEventTypes.CONNECTION_RESTORED, this._connectionRestoredDuringQueueCallback);
					this._liveManager.connect();
				}
				
				this.dispatchCustomEvent(QueueEventTypes.JOINED_QUEUE_STATUS_UPDATE, queueData);
			}
		};
		
		p._joinedQueue = function(aEvent) {
			//console.log("weblab.orchestra.queue.QueueManager::_joinedQueue");
			//console.log(aEvent);
			
			var data = aEvent.detail;
			var status = data.response;
			
			if(status) {
				this.dispatchCustomEvent(QueueEventTypes.JOINED_QUEUE, this._queueIntrumentId);
				this._shouldUpdateJoinedQueue = true;
				this._updateData();
				this._startInterval();
			}
			else {
				this.dispatchCustomEvent(QueueEventTypes.ALREADY_IN_QUEUE, this._queueIntrumentId);
				this._queueIntrumentId = -1;
			}
		};
		
		p._forceJoinedQueue = function(aEvent) {
			//console.log("weblab.orchestra.queue.QueueManager::_forceJoinedQueue");
			//console.log(aEvent);
			
			var data = aEvent.detail;
			var status = data.response;
			
			if(status) {
				this.dispatchCustomEvent(QueueEventTypes.JOINED_QUEUE, this._queueIntrumentId);
				this._shouldUpdateJoinedQueue = true;
				this._updateData();
				this._startInterval();
			}
			else {
				this.dispatchCustomEvent(QueueEventTypes.CANT_JOIN_QUEUE, this._queueIntrumentId);
				this._queueIntrumentId = -1;
			}
		};

		p._connectionLostDuringQueue = function(aEvent) {
			console.log("QueueManager :: _connectionLostDuringQueue");

			if (this._liveManager.getReconnectionTimes() < 3)
				setTimeout(function() { this._liveManager.reconnect(); }.bind(this), 1000);
			else
				this.dispatchCustomEvent(QueueEventTypes.CONNECTION_LOST_DURING_QUEUE, null);			
		};

		p._connectionRestoredDuringQueue = function(aEvent) {
			console.log("QueueManager :: _connectionRestoredDuringQueue");
		};
		
		p._showConfirmStart = function(aEvent) {
			console.log("weblab.orchestra.queue.QueueManager::_showConfirmStart");
			
			this._confirmStartTimedOutId = setTimeout(this._confirmStartTimedOutCallback, 1000*(aEvent.detail));
			
			this.dispatchCustomEvent(QueueEventTypes.CONFIRM_START, aEvent.detail);
		};
		
		p._adjustStartTime = function(aEvent) {
			console.log("weblab.orchestra.queue.QueueManager::_adjustStartTime");
			
			this.dispatchCustomEvent(QueueEventTypes.ADJUST_START_TIME, aEvent.detail);
		};
		
		p._confirmStartTimedOut = function() {
			console.log("weblab.orchestra.queue.QueueManager::_confirmStartTimedOutCallback");
			
			this._queueIntrumentId = -1;
			this._shouldUpdateJoinedQueue = false;
			if(!this._shouldUpdateQueueLengths) {
				this._stopInterval();
			}
			this._confirmStartTimedOutId = -1;
			
			this._liveManager.destroy();
			this._liveManager = null;
			
			this.dispatchCustomEvent(QueueEventTypes.CONFIRM_START_TIMED_OUT, null);
		};
		
		p.quitSession = function() {
			console.log("weblab.orchestra.queue.QueueManager::quitSession");
			
			this.dispatchCustomEvent(QueueEventTypes.CONFIRM_QUIT_SESSION, null);
		}
		
		p.confirmQuitSession = function() {
			console.log("weblab.orchestra.queue.QueueManager::confirmQuitSession");
			this.leaveQueue();
			
			this.dispatchCustomEvent(QueueEventTypes.QUIT_SESSION_CONFIRMED, null);
			
		}
		
		p.sessionDone = function() {
			console.log("weblab.orchestra.queue.QueueManager::sessionDone");
			if(this._liveManager !== null) {
				this._liveManager.destroy();
				this._liveManager = null;
			}
		};
		
		p.destroy = function destroy() {
			//METODO
			
			this._stopInterval();
		};
		
		QueueManager.create = function() {
			return new QueueManager();
		};
	}
})();