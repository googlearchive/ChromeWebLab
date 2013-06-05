/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.data");
	
	var VirtualRecording = namespace.VirtualRecording;
	
	var RecordingChangeActionTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").RecordingChangeActionTypes;
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	
	var InstrumentNotes = namespace.InstrumentNotes;
	
	if(namespace.VirtualRecorder === undefined) {
		
		var VirtualRecorder = function VirtualRecorder() {
			this._init();
		};
		
		namespace.VirtualRecorder = VirtualRecorder;
		
		var p = VirtualRecorder.prototype;
		
		p._init = function _init() {
			
			this._recording = VirtualRecording.create();
			
			this._startTime = NaN;
			this._isStarted = false;
			
			return this;
		};
		
		p.getRecording = function() {
			return this._recording;
		}
		
		p.setInitialLayout = function setInitialLayout(aSnapShot) {
			this._recording.initialLayout = aSnapShot;
		};
		
		p.setMutedInstruments = function(aMutedInstruments) {
			this._recording.initialMutedInstruments = aMutedInstruments;
		};
		
		p.setStartTime = function setStartTime(aTime) {
			this._startTime = aTime;
		};
		
		p.getStartTime = function getStartTime() {
			return this._startTime;
		};
		
		p._addChangeAction = function _addChangeAction(aType, aTime, aInstumentId, aNoteId, aPosition, aPitch) {
			this._recording.noteChanges.push({"action": aType, "time": aTime, "instrument": aInstumentId, "note": aNoteId, "position": aPosition, "pitch": aPitch});
		};
		
		p.addNote = function(aInstumentId, aNoteId, aPosition, aPitch) {
			//console.log("WEBLAB.orchestra.data.VirtualRecorder::addNote");
			//console.log(RecordingChangeActionTypes.ADD_NOTE);
			var currentTime = 0.001*(new Date()).valueOf()-this._startTime;
			this._addChangeAction(RecordingChangeActionTypes.ADD_NOTE, currentTime, aInstumentId, aNoteId, aPosition, aPitch);
		};
		
		p.changeNote = function(aInstumentId, aNoteId, aPosition, aPitch) {
			//console.log("WEBLAB.orchestra.data.VirtualRecorder::changeNote");
			//console.log(RecordingChangeActionTypes.CHANGE_NOTE);
			var currentTime = 0.001*(new Date()).valueOf()-this._startTime;
			this._addChangeAction(RecordingChangeActionTypes.CHANGE_NOTE, currentTime, aInstumentId, aNoteId, aPosition, aPitch);
		};
		
		p.removeNote = function(aInstumentId, aNoteId) {
			var currentTime = 0.001*(new Date()).valueOf()-this._startTime;
			this._addChangeAction(RecordingChangeActionTypes.REMOVE_NOTE, currentTime, aInstumentId, aNoteId, -1, -1);
		};
		
		p.muteInstrument = function(aInstumentId) {
			var currentTime = 0.001*(new Date()).valueOf()-this._startTime;
			this._addChangeAction(RecordingChangeActionTypes.MUTE_INSTRUMENT, currentTime, aInstumentId, -1, -1, -1);
		};
		
		p.unmuteInstrument = function(aInstumentId) {
			var currentTime = 0.001*(new Date()).valueOf()-this._startTime;
			this._addChangeAction(RecordingChangeActionTypes.UNMUTE_INSTRUMENT, currentTime, aInstumentId, -1, -1, -1);
		};
		
		p.addCountry = function(aCountry) {
			//console.log("WEBLAB.orchestra.data.VirtualRecorder::addCountry");
			//console.log(aCountry);
			if(ArrayFunctions.indexOfInArray(this._recording.countryList, aCountry) === -1) {
				this._recording.countryList.push(aCountry);
			}
		};
		
		p.destroy = function destroy() {
			this._startTime = NaN;
			this._recording = null;
		};
		
		VirtualRecorder.create = function() {
			return new VirtualRecorder();
		};
	}
})();