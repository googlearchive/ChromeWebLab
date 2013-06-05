/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
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