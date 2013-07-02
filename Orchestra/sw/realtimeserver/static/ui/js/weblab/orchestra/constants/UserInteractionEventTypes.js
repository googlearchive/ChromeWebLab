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
	
	if(namespace.UserInteractionEventTypes === undefined) {
		
		var UserInteractionEventTypes = function UserInteractionEventTypes() {
			//MENOTE: do nothing
		};
		
		namespace.UserInteractionEventTypes = UserInteractionEventTypes;
		
		UserInteractionEventTypes.MUTE_INSTRUMENT = "mutInstrument";
		UserInteractionEventTypes.UNMUTE_INSTRUMENT = "unmuteInstrument";
		UserInteractionEventTypes.CHANGE_INSTRUMENT = "changeInstrument";
		
		UserInteractionEventTypes.START_RECORDING = "startRecording";
		UserInteractionEventTypes.REQUEST_CANCEL_RECORDING = "requestCancelRecording";
		UserInteractionEventTypes.CANCEL_RECORDING = "cancelRecording";
		
		UserInteractionEventTypes.INTERACTION = "interaction";
		UserInteractionEventTypes.ADD_NOTE = "addNote";
		UserInteractionEventTypes.CHANGE_NOTE = "changeNote";
		UserInteractionEventTypes.REMOVE_NOTE = "removeNote";
		UserInteractionEventTypes.START_DRAGGING_NOTE = "startDraggingNote";
		UserInteractionEventTypes.INVALID_RELEASE_OF_DRAGGED_NOTE = "invalidReleseOfDraggedNote";
		UserInteractionEventTypes.CLEAR_ALL_NOTES = "clearAllNotes";
		UserInteractionEventTypes.TUTORIAL_DONE = "tutorialDone";
		
		UserInteractionEventTypes.DRAG_FROM_BLOBS_LEFT_PANEL = "dragFromBlobsLeftPanel";
		UserInteractionEventTypes.CLICK_ON_UNAVAILABLE = "clickOnUnavailable";
		UserInteractionEventTypes.NO_NOTE_TO_ADD = "noNoteToAdd";
	}
})();