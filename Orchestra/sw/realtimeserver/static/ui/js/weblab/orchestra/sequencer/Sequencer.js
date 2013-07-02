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
	var singletonsNamespace = WEBLAB.namespace("WEBLAB.orchestra.singletons");
	var commonSingletons = WEBLAB.namespace("WEBLAB.common.singletons");
	
	var SequencerNote = namespace.SequencerNote;
	var PlayingNote = namespace.PlayingNote;
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var MultidimensionalArrayHolder = WEBLAB.namespace("WEBLAB.utils.data").MultidimensionalArrayHolder;
	var BpmFunctions = WEBLAB.namespace("WEBLAB.utils.math").BpmFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if(namespace.Sequencer === undefined) {
		
		var Sequencer = function Sequencer() {
			this._init();
		};
		
		namespace.Sequencer = Sequencer;
		
		var p = Sequencer.prototype;
		
		Sequencer.USER_VOLUME = 1;
		Sequencer.OTHERS_VOLUME = 0.5;
		
		p._init = function() {
			
			this._isMute = false;
			this._volume = 0.5;
			this._globalVolume = 1;

			this._context = null;
			if (commonSingletons.orchestraSoundLoader)		
				this._context = commonSingletons.orchestraSoundLoader.getAudioContext();
			else this._context = commonSingletons.siteManager.getOrchestraSoundLoader().getAudioContext();

			this._mainGain = this._context.createGainNode();
			this._mainGain.gain.value = (this._volume*this._globalVolume);
			this._mainGain.connect(this._context.destination);
			this._mainOutput = this._mainGain;
			
			this._isPlaying = false;
			this._startTime = -1;
			this._contextStartTime = -1;
			
			this._playingNotes = new Array();
			this._mutedTracks = new Array();
			this._length = 1;
			this._currentTime = -1;
			this._prepareTime = 0.25;
			
			this._bpm = -1;
			this._noteLength = -1;
			this._noteTime = -1;
			this._numberOfPositions = -1;
			this._numberOfPitches = -1;
			this._currentInstrument = -1;
			
			this._notes = null;
			this._sequencerLayout = null;
			this._tracks = null;
			this._backgroundTrack = null;
			this._nextBackgroundTrackStartTime = 0;
			this._hasAdjustedStartTime = false;
			
			return this;
		};
		
		p.setup = function(aBpm, aNoteLength, aTracks, aNumberOfPosition, aNumberOfPitches) {
			
			this._bpm = aBpm;
			this._noteLength = aNoteLength;
			this._noteTime = BpmFunctions.getBeatLength(this._bpm, this._noteLength);
			this._numberOfPositions = aNumberOfPosition;
			this._numberOfPitches = aNumberOfPitches;
			
			this._tracks = aTracks;
			
			this._setLength(this._noteTime*aNumberOfPosition);
			this._sequencerLayout = MultidimensionalArrayHolder.create(aTracks.length, aNumberOfPosition, aNumberOfPitches);
			this._notes = MultidimensionalArrayHolder.create(aTracks.length, aNumberOfPitches);
			
			return this;
		};
		
		p._setLength = function(aLength) {
			if(!(aLength > 0)) {
				//METODO: error message
				return this;
			}
			
			var oldLength = this._length;
			
			this._length = aLength;
			this._currentTime = this._length*(this._currentTime/oldLength);
			
			return this;
		};
		
		p.getPrepareTime = function() {
			return this._prepareTime;
		};
		
		p.getMutedTracks = function() {
			return this._mutedTracks;
		};
		
		p.setCurrentInstrument = function setCurrentInstrument(aInstrumentId) {
			this._currentInstrument = aInstrumentId;
			
			var numberOfTracks = this._tracks.length;
			for(var i = 0; i < this._numberOfTracks; i++) {
				var currentVolume = (i === this._currentInstrument || this._currentInstrument === -1) ? Sequencer.USER_VOLUME : Sequencer.OTHERS_VOLUME;
				for(var j = 0; j < this._numberOfPositions; j++) {
					for(var k = 0; k < this._numberOfPitches; k++) {
						var currentSequencerNote = this._sequencerLayout.getValue(i, j, k);
						if(currentSequencerNote !== null && currentSequencerNote !== undefined) {
							currentSequencerNote.setVolume(currentVolume);
						}
					}
				}
			}
		};
		
		p.getContext = function getContext() {
			return this._context;
		};
		
		p._updateVolume = function() {
			if(this._isMute) {
				this._mainGain.gain.value = 0;
			}
			else {
				this._mainGain.gain.value = (this._volume*this._globalVolume);
			}
		};
		
		p.mute = function() {
			this._isMute = true;
			this._updateVolume();
		};
		
		p.unmute = function() {
			this._isMute = false;
			this._updateVolume();
		};
		
		p.setVolume = function(aValue) {
			this._volume = aValue;
			this._updateVolume();
		};
		
		p.setGlobalVolume = function(aValue) {
			this._globalVolume = aValue;
			this._updateVolume();
		};
		
		p.createNote = function(aBuffer) {
			
			var newSource = this.getContext().createBufferSource();
			newSource.buffer = aBuffer;
			newSource.loop = false;
			newSource.playbackRate.value = 1;
			
			var newNote = PlayingNote.create(this._context, newSource, -1);
			newNote.connectOutput(this._mainOutput);
			
			return newNote;
		};
		
		p.createNotesFromPartOfSoundsArray = function(aSoundsArray, aStartValue, aEndValue) {
			var returnArray = new Array();
			var currentArray = aSoundsArray;
			var currentArrayLength = currentArray.length;
			for(var i = aStartValue; i < aEndValue; i++) {
				returnArray.push(this.createNote(currentArray[i].getBuffer()));
			}
			return returnArray;
		};
		
		p.createSequencerNote = function(aNote, aPosition) {
			//console.log("WEBLAB.orchestra.sequencer.Sequencer::createSequencerNote");
			var newNote = SequencerNote.create(aNote, aPosition);
			newNote.setLastPlayedLoopFromCurrentTime(Math.max(-1, this._currentTime+this._prepareTime), this._length);
			this._playingNotes.push(newNote);
			return newNote;
		};
		
		p.removeSequencerNote = function(aSequencerNote) {
			//console.log("WEBLAB.orchestra.sequencer.Sequencer::removeSequencerNote");
			var noteIndex = ArrayFunctions.indexOfInArray(this._playingNotes, aSequencerNote);
			//console.log(noteIndex);
			if(noteIndex === -1) {
				//METODO: error message
				return;
			}
			this._playingNotes.splice(noteIndex, 1);
		};
		
		p.update = function(aTime) {
			//console.log("WEBLAB.orchestra.sequencer.Sequencer::update");
			//console.log(aTime);
			
			if(!this._isPlaying) return;
			
			this._currentTime = aTime;
			
			if(Math.abs(this._currentTime-this._startTime+this._contextStartTime-this._context.currentTime) > 0.01) {
				//if(!this._hasAdjustedStartTime) {
					//console.log(">>>>", Math.abs(this._currentTime-this._startTime+this._contextStartTime-this._context.currentTime));
					console.log(">>", this._contextStartTime, this._context.currentTime, this._currentTime, this._startTime);
					this._contextStartTime = this._context.currentTime-(this._currentTime-this._startTime);
					// console.log(">", this._contextStartTime);
					this._hasAdjustedStartTime = true;
				//}
			}
			
			//console.log(this._currentTime);
			
			var currentArray = this._playingNotes;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentNote = currentArray[i];
				var nextPlayTime = currentNote.getNextPlayTime(this._length);
				//console.log(nextPlayTime);
				if(nextPlayTime < this._currentTime) {
					//MENOTE: can this miss any notes? Should the prepare time be here?
					currentNote.setLastPlayedLoopFromCurrentTime(this._currentTime-this._prepareTime, this._length);
				}
				if(nextPlayTime <= this._currentTime+this._prepareTime) {
					currentNote.playNote(nextPlayTime+this._contextStartTime);
					currentNote.setLastPlayedLoopFromCurrentTime(nextPlayTime, this._length);
				}
			}
			
			if(this._nextBackgroundTrackStartTime <= this._currentTime+this._prepareTime) {
				//console.log(this._nextBackgroundTrackStartTime, this._currentTime, this._contextStartTime, this._nextBackgroundTrackStartTime+this._contextStartTime, this._context.currentTime);
				this._backgroundTrack.playAt(this._nextBackgroundTrackStartTime+this._contextStartTime);
				this._nextBackgroundTrackStartTime += 6*this._length;
				//6 is the number of loops the background track strech over
			}
		};
		
		p.start = function(aTime) {
			//console.log("WEBLAB.orchestra.sequencer.Sequencer::start");
			if(this._isPlaying) return;
			this._isPlaying = true;
			
			this._startTime = aTime;
			this._contextStartTime = this._context.currentTime;
			this._currentTime = -1;
			
			return this;
		};
		
		p.stop = function() {
			//console.log("WEBLAB.orchestra.sequencer.Sequencer::stop");
			
			if(!this._isPlaying) return;
			this._isPlaying = false;
			
			var currentArray = this._playingNotes;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentNote = currentArray[i];
				currentNote.destroy();
			}
			currentArray.splice(0, currentArrayLength);
			
			this._backgroundTrack.stop();
			this._nextBackgroundTrackStartTime = 0;
			
			return this;
		};
		
		p.getTrackIndex = function(aName) {
			return ArrayFunctions.indexOfInArray(this._tracks, aName);
		};
		
		p.addNotes = function(aTrackIndex, aNotes) {
			var currentArray = aNotes;
			var currentArrayLength = currentArray.length;
			if(currentArrayLength > this._numberOfPitches) {
				//METODO: error message
				currentArrayLength = this._numberOfPitches;
			}
			for(var i = 0; i < currentArrayLength; i++) {
				this._notes.setValue(aTrackIndex, i, currentArray[i]);
			}
			
			return this;
		};
		
		p.setBackgroundTrack = function(aNote) {
			//console.log("WEBLAB.orchestra.sequencer.Sequencer::setBackgroundTrack");
			//console.log(aNote);
			this._backgroundTrack = aNote;
		};
		
		p.startPlayingNote = function(aTrackIndex, aPosition, aPitch) {
			//console.log("WEBLAB.orchestra.sequencer.Sequencer::startPlayingNote");
			//console.log(aTrackIndex, aPosition, aPitch);
			var currentSequencerNote = this._sequencerLayout.getValue(aTrackIndex, aPosition, aPitch);
			
			if(currentSequencerNote != null) {
				//METODO: warning message
			}
			var newNote = this.createSequencerNote(this._notes.getValue(aTrackIndex, aPitch), this._noteTime*aPosition);
			var currentVolume = (aTrackIndex === this._currentInstrument || this._currentInstrument === -1) ? Sequencer.USER_VOLUME : Sequencer.OTHERS_VOLUME;
			newNote.setVolume(currentVolume);
			if(ArrayFunctions.indexOfInArray(this._mutedTracks, aTrackIndex) !== -1) {
				newNote.mute();
			}
			this._sequencerLayout.setValue(aTrackIndex, aPosition, aPitch, newNote);
		};
		
		p.stopPlayingNote = function(aTrackIndex, aPosition, aPitch) {
			var currentSequencerNote = this._sequencerLayout.getValue(aTrackIndex, aPosition, aPitch);
			if(currentSequencerNote == null) {
				//METODO: error message
				return;
			}
			this.removeSequencerNote(currentSequencerNote);
			this._sequencerLayout.setValue(aTrackIndex, aPosition, aPitch, null);
		};
		
		p.muteTrack = function muteTrack(aTrackIndex) {
			this._mutedTracks.push(aTrackIndex);
			
			for(var i = 0; i < this._numberOfPositions; i++) {
				for(var j = 0; j < this._numberOfPitches; j++) {
					var currentSequencerNote = this._sequencerLayout.getValue(aTrackIndex, i, j);
					if(currentSequencerNote !== null && currentSequencerNote !== undefined) {
						currentSequencerNote.mute();
					}
				}
			}
		};
		
		p.unmuteTrack = function unmuteTrack(aTrackIndex) {
			var position = ArrayFunctions.indexOfInArray(this._mutedTracks, aTrackIndex);
			if(position !== -1) {
				this._mutedTracks.splice(position, 1);
			}
			
			for(var i = 0; i < this._numberOfPositions; i++) {
				for(var j = 0; j < this._numberOfPitches; j++) {
					var currentSequencerNote = this._sequencerLayout.getValue(aTrackIndex, i, j);
					if(currentSequencerNote !== null && currentSequencerNote !== undefined) {
						currentSequencerNote.unmute();
					}
				}
			}
		};
		
		p.destroy = function() {
			
			if(this._mainGain !== null) {
				this._mainGain.disconnect(this._context.destination);
				this._mainGain = null;
			}
			this._mainOutput = null;
			this._context = null;
			
			this._mutedTracks = null;
			this._tracks = null;
			
			Utils.destroyIfExists(this._sequencerLayout);
			this._sequencerLayout = null;
			Utils.destroyIfExists(this._notes);
			this._notes = null;
			Utils.destroyIfExists(this._backgroundTrack);
			this._backgroundTrack = null;
			
			Utils.destroyArrayIfExists(this._playingNotes);
			this._playingNotes = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		Sequencer.create = function(aBpm, aNoteLength, aTracks, aNumberOfPosition, aNumberOfPitches) {
			var newSequencer = new Sequencer();
			newSequencer.setup(aBpm, aNoteLength, aTracks, aNumberOfPosition, aNumberOfPitches);
			return newSequencer;
		};
	}
})();