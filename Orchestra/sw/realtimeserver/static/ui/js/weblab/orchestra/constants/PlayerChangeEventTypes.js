/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.constants");
	
	if(namespace.PlayerChangeEventTypes === undefined) {
		
		var PlayerChangeEventTypes = function PlayerChangeEventTypes() {
			//MENOTE: do nothing
		};
		
		namespace.PlayerChangeEventTypes = PlayerChangeEventTypes;
		
		PlayerChangeEventTypes.CURRENT_INSTRUMENT = "currentInstrument";
		PlayerChangeEventTypes.CURRENT_PLAYERS = "currentPlayers";
		PlayerChangeEventTypes.USER_JOINED = "userJoined";
		PlayerChangeEventTypes.USER_LEFT = "userLeft";
		PlayerChangeEventTypes.INSTRUMENT_CHANGED = "instrumentChanged";
		
		PlayerChangeEventTypes.RECORDING_STARTED = "recordingStarted";
		PlayerChangeEventTypes.RECORDING_ENDED = "recordingEnded";
		
		PlayerChangeEventTypes.USER_BEAT = "userBeat";
		PlayerChangeEventTypes.OTHERS_BEAT = "othersBeat";
		
		PlayerChangeEventTypes.CONNECTION_ESTABLISHED = "connectionEstablished";
		PlayerChangeEventTypes.CONNECTION_LOST = "connectionLost";
		PlayerChangeEventTypes.CONNECTION_RESTORED = "connectionRestored";
		
		PlayerChangeEventTypes.READY_FOR_TUTORIAL = "readyForTutorial";
		
		PlayerChangeEventTypes.VIDEO_BUFFERING = "videoBuffering";
		PlayerChangeEventTypes.VIDEO_DONE_BUFFERING = "videoDoneBuffering";
	}
})();