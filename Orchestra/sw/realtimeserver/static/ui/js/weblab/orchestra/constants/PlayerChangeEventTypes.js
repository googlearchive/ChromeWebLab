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