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