/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.websocket");
	
	var MessageEncoder = namespace.MessageEncoder;
	var MessageIds = WEBLAB.namespace("WEBLAB.orchestra.constants").MessageIds;
	var WebSocketFunctions = WEBLAB.namespace("WEBLAB.utils.websocket").WebSocketFunctions;
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	
	if(namespace.UserWebSocketConnection === undefined) {
		
		var UserWebSocketConnection = function UserWebSocketConnection() {
			this._init();
		};
		
		namespace.UserWebSocketConnection = UserWebSocketConnection;
		
		var p = UserWebSocketConnection.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;
		
		p._init = function() {
			
			this._controller = null;
			this._socket = null;
			
			this._onOpenHandler = ListenerFunctions.createListenerFunction(this, this._connectionOpened);
			this._onMessageHandler = ListenerFunctions.createListenerFunction(this, this._messageReceivedCallback);
			this._onErrorHandler = ListenerFunctions.createListenerFunction(this, this._connectionError);
			this._onCloseHandler = ListenerFunctions.createListenerFunction(this, this._connectionClosed);
			
			return this;
		};
		
		p.connect = function(aUrl) {
			
			this._socket = WebSocketFunctions.createWebSocket(aUrl);
			this._socket.addEventListener("open", this._onOpenHandler, false);
			this._socket.addEventListener("error", this._onErrorHandler, false);
			this._socket.addEventListener("message", this._onMessageHandler, false);
			this._socket.addEventListener("close", this._onCloseHandler, false);
			
			return this;
		};
		
		p.disconnect = function() {
			if(this._socket !== null) {
				this._socket.close();
			}
		};
		
		p.setController = function(aController) {
			
			this._controller = aController;
			
			return this;
		};
		
		p.sendMessage = function(aMessage) {
			if(this._socket !== null) {
				this._socket.send(aMessage);
			}
			else {
				console.warn("Can't send message to closed websocket");
			}
			
			return this;
		};
		
		p._connectionOpened = function() {
			//console.log("WEBLAB.orchestra.websocket.UserWebSocketConnection::_connectionOpened");
			
			this.dispatchCustomEvent("open", null);
			
		};
		
		p._connectionError = function(aEvent) {
			console.log("WEBLAB.orchestra.websocket.UserWebSocketConnection::_connectionError");
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			console.log(aEvent);
		};
		
		p._connectionClosed = function(aEvent) {
			console.log("WEBLAB.orchestra.websocket.UserWebSocketConnection::_connectionClosed");
			
			console.log(aEvent);
			console.log(aEvent.code);
			//console.log(aEvent.reason);
			//console.log(aEvent.wasClean);
			
			this._socket.removeEventListener("open", this._onOpenHandler, false);
			this._socket.removeEventListener("error", this._onErrorHandler, false);
			this._socket.removeEventListener("message", this._onMessageHandler, false);
			this._socket.removeEventListener("close", this._onCloseHandler, false);
			this._socket = null;
			
			this.dispatchCustomEvent("close", null);
		};
		
		p._messageReceivedCallback = function(aEvent) {
			//console.log("WEBLAB.orchestra.websocket.UserWebSocketConnection::_messageReceivedCallback");
			//console.log(aEvent);
			this._messageReceived(aEvent.data);
		}
		
		p._messageReceived = function(aMessage) {
			if(aMessage.length === 0) {
				//MENOTE: pong frame in hybi00
				return;
			}
			//console.log("WEBLAB.orchestra.websocket.UserWebSocketConnection::_messageReceived");
			var messageId = MessageEncoder.getMessageId(aMessage);
			//console.log(messageId, aMessage.length, aMessage);
			switch(messageId) {
				//Initial data
				case MessageIds.CURRENT_LAYOUT:
					console.log("WEBLAB.orchestra.websocket.UserWebSocketConnection::_messageReceived CURRENT_LAYOUT");
					this._controller.setCurrentLayout(aMessage.substring(1, aMessage.length));
					break;
				//Change notes
				case MessageIds.ADD_NOTE:
					this._controller.addNote(aMessage.charCodeAt(1), aMessage.charCodeAt(2), aMessage.charCodeAt(3), aMessage.charCodeAt(4));
					break;
				case MessageIds.NOTE_ADDED:
					this._controller.noteAdded(aMessage.charCodeAt(1), aMessage.charCodeAt(2), aMessage.charCodeAt(3), aMessage.charCodeAt(4), MessageEncoder.decodeDate(aMessage.substring(5, 11)));
					break;
				case MessageIds.CHANGE_NOTE:
					this._controller.changeNote(aMessage.charCodeAt(1), aMessage.charCodeAt(2), aMessage.charCodeAt(3), aMessage.charCodeAt(4));
					break;
				case MessageIds.NOTE_CHANGED:
					this._controller.noteChanged(aMessage.charCodeAt(1), aMessage.charCodeAt(2), aMessage.charCodeAt(3), aMessage.charCodeAt(4), MessageEncoder.decodeDate(aMessage.substring(5, 11)));
					break;
				case MessageIds.REMOVE_NOTE:
					this._controller.removeNote(aMessage.charCodeAt(1), aMessage.charCodeAt(2));
					break;
				case MessageIds.NOTE_REMOVED:
					//console.log(aMessage, aMessage.length);
					this._controller.noteRemoved(aMessage.charCodeAt(1), aMessage.charCodeAt(2), MessageEncoder.decodeDate(aMessage.substring(3, 9)));
					break;
				case MessageIds.ALL_NOTES_FOR_INSTRUMENT_REMOVED:
					this._controller.allNotesForInstrumentRemoved(aMessage.charCodeAt(1), MessageEncoder.decodeDate(aMessage.substring(2, 8)));
					break;
				//Tempo changes
				case MessageIds.LOOP_TIMES:
					this._controller.updateLoops(MessageEncoder.decodeLoopTimes(aMessage.substring(1, aMessage.length)));
					break;
				//Error management
				case MessageIds.LOG_MESSAGE:
					console.log(this, "LOG_MESSAGE", aMessage.substring(1, aMessage.length));
					break;
				case MessageIds.LOG_ERROR:
					console.error(this, "LOG_ERROR", aMessage.substring(1, aMessage.length));
					break;
				case MessageIds.LOG_WARNING:
					console.warn(this, "LOG_WARNING", aMessage.substring(1, aMessage.length));
					break;
				default:
					console.error("No case for " + messageId.toString(16) + " from message " + aMessage);
				case MessageIds.CURRENT_INSTRUMENT:
				case MessageIds.INSTRUMENT_CHANGED:
				case MessageIds.INSTRUMENT_CHANGE_REFUSED:
				case MessageIds.USER_JOINED:
				case MessageIds.USER_LEFT:
				case MessageIds.CURRENT_PLAYERS:
				case MessageIds.CONFIRM_START:
				case MessageIds.START_SESSION:
				case MessageIds.END_SESSION:
				case MessageIds.ADJUST_START_TIME:
					this._controller.customMessage(messageId, aMessage.substring(1, aMessage.length));
					break;
			}
		};
		
		p.destroy = function() {
			//console.log("WEBLAB.orchestra.websocket.UserWebSocketConnection::destroy");
			
			this.disconnect();
			if(this._socket !== null) {
				this._socket.removeEventListener("open", this._onOpenHandler, false);
				this._socket.removeEventListener("error", this._onErrorHandler, false);
				this._socket.removeEventListener("message", this._onMessageHandler, false);
				this._socket.removeEventListener("close", this._onCloseHandler, false);
				this._socket = null;
			}
			
			this._controller = null;
			this._onOpenHandler = null;
			this._onMessageHandler = null;
			this._onCloseHandler = null;
			
			s.destroy.call(this);
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		UserWebSocketConnection.create = function(aController) {
			var newUserWebSocketConnection = new  UserWebSocketConnection();
			newUserWebSocketConnection.setController(aController);
			return newUserWebSocketConnection;
		};
	}
})();