/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.sequencer");
	
	if(namespace.PlayingNote === undefined) {
		
		var PlayingNote = function PlayingNote() {
			this._init();
		};
		
		namespace.PlayingNote = PlayingNote;
		
		var p = PlayingNote.prototype;
		
		p._init = function() {
			this._context = null;
			this._connectedOutput = null;
			this._source = null;
			this._currentPlayingSource = null;
			this._duration = 0;
			this._volume = 1;
			
			return this;
		};
		
		p.setup = function(aContext, aSource, aDuration) {
			
			aDuration = (aDuration == null) ? aDuration : -1;
			
			this._context = aContext;
			this._source = aSource;
			this._duration = (aDuration != -1) ? aDuration : this._source.buffer.duration*this._source.playbackRate.value;
			
			return this;
		};
		
		p.setVolume = function(aVolume) {
			this._volume = aVolume;
			if(this._source !== null) {
				this._source.gain.value = this._volume;
			}
		};
		
		p.connectOutput = function(aOutput) {
			this._connectedOutput = aOutput;
			
			return this;
		};
		
		p.playAt = function(aTime) {
			//console.log("WEBLAB.orchestra.sequencer.PlayingNote::playAt");
			//console.log(aTime, this._source, this._connectedOutput);
			this._source.connect(this._connectedOutput);
			this._source.noteOn(aTime);
			
			if(this._source.loop) {
				this._source.noteOff(aTime+this._duration);
			}
			
			this._currentPlayingSource = this._source;
			this._source = this._createNewSource(); //MENOTE: sources can only be played once
			
			return this;
		};
		
		p.stop = function() {
			if(this._currentPlayingSource !== null) {
				this._currentPlayingSource.noteOff(0);
				this._currentPlayingSource = null;
			}
		};
		
		p._createNewSource = function() {
			var newSource = this._context.createBufferSource();
			newSource.buffer = this._source.buffer;
			newSource.loop = this._source.loop;
			newSource.playbackRate.value = this._source.playbackRate.value;
			newSource.gain.value = this._volume;
			
			return newSource;
		};
		
		p.duplicate = function() {
			var newNote = PlayingNote.create(this._context, this._createNewSource(), this._duration);
			newNote.connectOutput(this._connectedOutput);
			return newNote;
		};
		
		p.destroy = function() {
			
			this._context = null;
			this._connectedOutput = null;
			this._source = null;
			this._currentPlayingSource = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		PlayingNote.create = function(aContext, aSource, aDuration) {
			var newNote = new PlayingNote();
			newNote.setup(aContext, aSource, aDuration);
			return newNote;
		};
	}
})();