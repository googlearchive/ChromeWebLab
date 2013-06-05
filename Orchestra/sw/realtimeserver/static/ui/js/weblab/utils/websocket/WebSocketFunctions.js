/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.websocket");
	
	if(namespace.WebSocketFunctions === undefined) {
		
		var WebSocketFunctions = function WebSocketFunctions() {
			//MENOTE: do nothing
		};
		
		namespace.WebSocketFunctions = WebSocketFunctions;
		
		WebSocketFunctions.supportsWebSocket = function supportsWebSocket() {
			return (window.WebSocket !== undefined || window.MozWebSocket !== undefined);
		};
		
		WebSocketFunctions.createWebSocket = function createWebSocket(aUrl) {
			if(window.WebSocket != undefined) {
				return new WebSocket(aUrl);
			}
			else if(window.MozWebSocket !== undefined) {
				return new MozWebSocket(aUrl);
			}
			console.error("Browser doesn't support web sockets.");
			return null;
		};
	}
})();