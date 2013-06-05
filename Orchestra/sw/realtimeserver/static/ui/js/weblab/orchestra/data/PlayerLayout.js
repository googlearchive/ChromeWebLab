/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.data");
	
	var InstrumentNotes = namespace.InstrumentNotes;
	
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if(namespace.PlayerLayout === undefined) {
		
		var PlayerLayout = function PlayerLayout() {
			this._init();
		};
		
		namespace.PlayerLayout = PlayerLayout;
		
		var p = PlayerLayout.prototype;
		
		p._init = function() {
			
			this._numberOfInstruments = 8;
			this.instruments = new Array(this._numberOfInstruments);
			
			this.instruments[0] = InstrumentNotes.create(6);
			this.instruments[1] = InstrumentNotes.create(6);
			this.instruments[2] = InstrumentNotes.create(6);
			this.instruments[3] = InstrumentNotes.create(6);
			this.instruments[4] = InstrumentNotes.create(6);
			this.instruments[5] = InstrumentNotes.create(6);
			this.instruments[6] = InstrumentNotes.create(6);
			this.instruments[7] = InstrumentNotes.create(6);
			
			return this;
		};
		
		p.addNote = function(aInstumentId, aNoteId, aPosition, aPitch) {
			//console.log("weblab.orchestra.data.PlayerLayout::addNote");
			//console.log(aInstumentId, aNoteId, aPosition, aPitch);
			if(!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;
			
			return this.instruments[aInstumentId].addNote(aNoteId, aPosition, aPitch);
		};
		
		p.changeNote = function(aInstumentId, aNoteId, aPosition, aPitch) {
			if(!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;
			
			return this.instruments[aInstumentId].changeNote(aNoteId, aPosition, aPitch);
		};
		
		p.removeNote = function(aInstumentId, aNoteId) {
			if(!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;
			
			return this.instruments[aInstumentId].removeNote(aNoteId);
		};
		
		p.removeAllNotesForInstrument = function(aInstumentId) {
			if(!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;
			
			return this.instruments[aInstumentId].removeAllNotes();
		};
		
		p.reset = function() {
			var currentArray = this.instruments;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentInstrument = currentArray[i];
				currentInstrument.reset();
			}
		};
		
		p.getSnapShot = function() {
			var returnObject = new Object();
			var instrumentsArray = new Array(this._numberOfInstruments);
			returnObject.instruments = instrumentsArray;
			for(var i = 0; i < this._numberOfInstruments; i++) {
				var currentInstrumentObject = new Object();
				instrumentsArray[i] = currentInstrumentObject;
				var currentInstrumentNotes = new Array();
				currentInstrumentObject.notes = currentInstrumentNotes;
				
				var currentArray = this.instruments[i].notes;
				var currentArrayLength = currentArray.length;
				for(var j = 0; j < currentArrayLength; j++) {
					var currentNote = currentArray[j];
					if(currentNote !== null && currentNote !== undefined) {
						currentInstrumentNotes.push({"id": j, "position": currentNote.position, "pitch": currentNote.pitch});
					}
				}
			}
			
			return returnObject;
		};
		
		p.destroy = function() {
			
			Utils.destroyArrayIfExists(this.instruments);
			this.instruments = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		PlayerLayout.create = function() {
			return new PlayerLayout();
		};
	}
})();