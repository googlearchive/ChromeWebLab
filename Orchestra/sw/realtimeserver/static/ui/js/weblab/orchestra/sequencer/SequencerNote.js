/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.sequencer");
	
	if(namespace.SequencerNote === undefined) {
		
		var SequencerNote = function SequencerNote() {
			this._init();
		};
		
		namespace.SequencerNote = SequencerNote;
		
		var p = SequencerNote.prototype;
		
		p._init = function() {
			
			this._note = null;
			this._lastPlayedLoop = -1;
			this._position = 0;
			this._isMuted = false;
			
			return this;
		};
		
		p.setup = function(aNote, aPosition) {
			this._note = aNote;
			this._position = aPosition;
			
			return this;
		};
		
		p.setVolume = function setVolume(aVolume) {
			this._note.setVolume(aVolume);
		};
		
		p.getNextPlayTime = function(aLoopLength) {
			return this._position+aLoopLength*(this._lastPlayedLoop+1);
		};
		
		p.setLastPlayedLoop = function(aLoop) {
			this._lastPlayedLoop = aLoop;
		};
		
		p.mute = function() {
			this._isMuted = true;
		};
		
		p.unmute = function() {
			this._isMuted = false;
		};
		
		p.playNote = function(aTime) {
			if(!this._isMuted) {
				this._note.playAt(aTime);
			}
		};
		
		p.setLastPlayedLoopFromCurrentTime = function(aCurrentTime, aLoopLength) {
			this._lastPlayedLoop = Math.floor((aCurrentTime-this._position)/aLoopLength);
		};
		
		p.destroy = function() {
			
			this._note = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		
		SequencerNote.create = function(aNote, aPosition) {
			var newSequencerNote = new SequencerNote();
			newSequencerNote.setup(aNote, aPosition);
			return newSequencerNote;
		};
	}
})();