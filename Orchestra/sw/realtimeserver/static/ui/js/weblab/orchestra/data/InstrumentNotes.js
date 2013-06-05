/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.data");
	
	var Note = namespace.Note;
	
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if(namespace.InstrumentNotes === undefined) {
		
		var InstrumentNotes = function InstrumentNotes() {
			this._init();
		};
		
		namespace.InstrumentNotes = InstrumentNotes;
		
		var p = InstrumentNotes.prototype;
		
		p._init = function() {
			
			this._maxNumberOfNotes = 16;
			this._numberOfPositions = 16;
			this._numberOfPitches = -1;
			this.notes = new Array(6);
			
			return this;
		};
		
		p.setNumberOfPitches = function(aNumberOfPitches) {
			this._numberOfPitches = aNumberOfPitches;
			
			return this;
		};
		
		p.addNote = function(aId, aPosition, aPitch) {
			if(!(aId >= 0 && aId < this._maxNumberOfNotes) || this.notes[aId] != null) return false;
			
			if(!(aPosition >= 0 && aPosition < this._numberOfPositions && aPitch >= 0 && aPitch < this._numberOfPitches)) {
				return false;
			}
			
			this.notes[aId] = Note.create(aPosition, aPitch);
			
			return true;
		};
		
		p.removeNote = function(aId) {
			if(!(aId >= 0 && aId < this._maxNumberOfNotes) || this.notes[aId] == null) return false;
			
			this.notes[aId] = null;
			
			return true;
		};
		
		p.changeNote = function(aId, aPosition, aPitch) {
			if(!(aId >= 0 && aId < this._maxNumberOfNotes)) return false;
			var currentNote = this.notes[aId];
			if(currentNote == null) return false;
			
			if(!(aPosition >= 0 && aPosition < this._numberOfPositions && aPitch >= 0 && aPitch < this._numberOfPitches)) {
				return false;
			}
			
			currentNote.position = aPosition;
			currentNote.pitch = aPitch;
			
			return true;
		};
		
		p.removeAllNotes = function() {
			var currentArray = this.notes;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				currentArray[i] = null;
			}
			return true;
		};
		
		p.reset = function() {
			var currentArray = this.notes;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				currentArray[i] = null;
			}
		};
		
		p.destroy = function() {
			
			Utils.destroyArrayIfExists(this.notes);
			this.notes = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		InstrumentNotes.create = function(aNumberOfPitches) {
			var newInstrumentNotes = new InstrumentNotes();
			newInstrumentNotes.setNumberOfPitches(aNumberOfPitches);
			return newInstrumentNotes;
		};
	}
})();