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
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player");
	
	var Blob = namespace.Blob;
	var BackgroundCircle = namespace.BackgroundCircle;
	var RollOver = namespace.RollOver;
	
	var OrchestraConfiguration = WEBLAB.namespace("WEBLAB.orchestra").OrchestraConfiguration;
	
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	var OrchestraGradients = WEBLAB.namespace("WEBLAB.common.constants").OrchestraGradients;
	var TimedCommands = WEBLAB.namespace("WEBLAB.utils.timer").TimedCommands;
	var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;
	var MultidimensionalArrayHolder = WEBLAB.namespace("WEBLAB.utils.data").MultidimensionalArrayHolder;
	var PositionFunctions = WEBLAB.namespace("WEBLAB.utils.htmldom").PositionFunctions;
	var UserInteractionEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").UserInteractionEventTypes;
	var PlayerChangeEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").PlayerChangeEventTypes;
	var DomElementOpacityTween = WEBLAB.namespace("WEBLAB.utils.animation").DomElementOpacityTween;
	
	if(namespace.Player === undefined) {
		
		var Player = function Player() {
			this._init();
		};
		
		namespace.Player = Player;
		
		Player.INTERNAL_COMMAND_ADD_NOTE = "addNote";
		Player.INTERNAL_COMMAND_CHANGE_NOTE = "changeNote";
		Player.INTERNAL_COMMAND_REMOVE_NOTE = "removeNote";
		Player.INTERNAL_COMMAND_REMOVE_ROLL_OVER = "removeRollOver";
		Player.INTERNAL_COMMAND_REMOVE_ALL_NOTES_FOR_INSTRUMENT = "removeAllNotesForInstrument";
		
		Player.NUMBER_OF_BLOBS_CHANGED = "numberOfBlobsChanged";
		
		var p = Player.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;
		
		p._init = function() {
			
			this._element = null;
			this._alphaTween = null;
			this._backgroundCanvasElement = null;
			
			this._numberOfInstruments = 2;
			this._numberOfPositions = 16;
			this._numberOfPitches = 4;
			this._instrumentId = -1;
			this._currentPosition = -1;
			this._width = -1;
			this._height = -1;
			
			this._circleRadius = 15;
			this._smallCircleRadius = 5;
			this._horizontalDistance = 30;
			this._verticalDistance = 30;
			this._numberOfEdgePoints = 22;
			this._margin = 0;
			this._removeOutsideMargin = 20;
			this._removeOutside = true;
			this._backgroundMinAlpha = 0.4;
			this._backgroundMaxAlpha = 1;
			this._pauseEnvelope = 0;
			this._pauseEnvelopeTween = new TWEEN.Tween(this);
			this._startDragTime = null;
			this._minDragTime = 0.250;
			
			this._currentRollOver = null;
			this._enableRollOvers = true;
			this._canInteract = true;
			this._isStarted = true;
			this._allBlobsAreBig = false;
			
			this._backgroundCanvasElement = null;
			this._userBlobs = new Array();
			this._othersBlobs = new Array();
			this._tutorialBlobs = new Array();
			this._ghostDragStart = new Object();
			this._ghostDragDestination = new Object();
			this._hasTutorialBlobs = false;			
			this._hasDimmedBlobs = false;	
			this._dimRegionPitches = new Array();
			this._dimRegionPositions = new Array();			
			this._rollOvers = new Array();
			this._availableIds = [0, 1, 2, 3, 4, 5];
			this._mutedInstruments = new Array();
			this._unstartedIntruments = [false, false, false, false, false, false, false, false];
			
			this._timedCommands = new TimedCommands();
			this._currentGlobalTime = -1;
			
			this._addNoteCommandCallback = ListenerFunctions.createListenerFunction(this, this._addNoteCommand);
			this._changeNoteCommandCallback = ListenerFunctions.createListenerFunction(this, this._changeNoteCommand);
			this._removeNoteCommandCallback = ListenerFunctions.createListenerFunction(this, this._removeNoteCommand);
			this._removeAllNotesForInstrumentCommandCallback = ListenerFunctions.createListenerFunction(this, this._removeAllNotesForInstrumentCommand);
			
			this._timedCommands.addEventListener(Player.INTERNAL_COMMAND_ADD_NOTE, this._addNoteCommandCallback);
			this._timedCommands.addEventListener(Player.INTERNAL_COMMAND_CHANGE_NOTE, this._changeNoteCommandCallback);
			this._timedCommands.addEventListener(Player.INTERNAL_COMMAND_REMOVE_NOTE, this._removeNoteCommandCallback);
			this._timedCommands.addEventListener(Player.INTERNAL_COMMAND_REMOVE_ALL_NOTES_FOR_INSTRUMENT, this._removeAllNotesForInstrumentCommandCallback);
			
			this._draggedBlob = null;
			
			this.onNoteChanged = null;
			this.onNoteAdded = null;
			this.onNoteRemoved = null;
			
			this._pressCallback = ListenerFunctions.createListenerFunction(this, this._onMouseDown);
			this._releaseCallback = ListenerFunctions.createListenerFunction(this, this._onMouseUp);
			this._releaseFromExternalCallback = ListenerFunctions.createListenerFunction(this, this._releaseFromExternal);
			this._moveCallback = ListenerFunctions.createListenerFunction(this, this._onMouseMove);
			
			this._dottedCirles = new Object();
			this._backgroundCirclesImage = null;
			
			return this;
		};
		
		p.setElement = function(aElement) {
			this._element = aElement;
			
			this._alphaTween = DomElementOpacityTween.create(this._element, 1);
			
			this._backgroundCanvasElement = this._element.ownerDocument.createElement("canvas");
			this._backgroundCanvasElement.classList.add("playerCanvas");
			this._element.appendChild(this._backgroundCanvasElement);
			
			this._element.addEventListener("mousedown", this._pressCallback, false);
			document.addEventListener("mousemove", this._moveCallback, false); //MENOTE: this would be better in a start function
			
			if(this._canInteract) {
				this._element.style.setProperty("cursor", "pointer", "");
			}
			
			return this;
		};
		
		p.getElement = function() {
			return this._element;
		};
		
		p.setInstrumentId = function(aElement) {
			this._instrumentId = aElement;
			
			return this;
		};
		
		p.setAllBlobsBig = function(aValue) {
			this._allBlobsAreBig = aValue;
			return this;
		};
		
		p.setInteraction = function(aEnableRollOver, aCanInteract) {
			this._enableRollOvers = aEnableRollOver;
			this._canInteract = aCanInteract;
			
			if(!this._canInteract) {
				if(this._draggedBlob !== null) {
					this._draggedBlob.releaseDragging();
					this._draggedBlob = null;
					document.removeEventListener("mouseup", this._releaseCallback, false);
				}
				
				if(this._currentRollOver !== null) {
					this._currentRollOver.hide();
					this._currentRollOver = null;
				}
				if(this._element !== null) {
					this._element.style.removeProperty("cursor");
				}
			}
			else {
				if(this._element !== null) {
					this._element.style.setProperty("cursor", "pointer", "");
				}
			}
		};
		
		p.setPauseEnvelope = function(aValue) {
			this._pauseEnvelope = aValue;
		};
		
		p.setAsUnstarted = function() {
			this._isStarted = false;
			
			this._alphaTween.setStartOpacity(0.5);
			this._alphaTween.update();
			
			return this;
		};
		
		p.setAsStarted = function() {
			this._isStarted = true;
			
			var currentArray = this._othersBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.getInstrumentId() === this._instrumentId) {
					currentArray.splice(i, 1);
					i--;
					currentArrayLength--;
					
					var index = ArrayFunctions.indexOfInArray(this._availableIds, currentBlob.id);
					this._availableIds.splice(index, 1);
					
					currentBlob.isInteractive = true;
					this._userBlobs.push(currentBlob);
					
					currentBlob.changeRotationOffset(0, 0);
					currentBlob.animateAddNote(currentBlob.finalPosition, currentBlob.finalPitch, 0.2);
					currentBlob.addNote();
					
					this._adjustOthersNoteRotation(currentBlob.finalPosition, currentBlob.finalPitch);
				}
			}
			
			this._alphaTween.animateTo(1, 0.2, TWEEN.Easing.Quadratic.EaseOut, 0);
			
			this.dispatchCustomEvent(Player.NUMBER_OF_BLOBS_CHANGED, this._availableIds.length);
			
			return this;
		};
		
		p.setInstrumentAsUnstarted = function(aInstrumentId) {
			//console.log("WEBLAB.orchestra.ui.player.Player::setInstrumentAsUnstarted");
			this._unstartedIntruments[aInstrumentId] = true;
		};
		
		p.setInstrumentAsStarted = function(aInstrumentId) {
			//console.log("WEBLAB.orchestra.ui.player.Player::setInstrumentAsStarted");
			this._unstartedIntruments[aInstrumentId] = false;
		}
		
		p.animatePauseEnvelope = function(aValue, aTime, aEasing) {
			//console.log("WEBLAB.orchestra.ui.player.Player::animatePauseEnvelope");
			//console.log(aValue, aTime, aEasing);
			this._pauseEnvelopeTween.to({"_pauseEnvelope": aValue}, aTime*1000).easing(aEasing).start();
		};
		
		p.clearPlayerForLostConnection = function() {
			this.setInteraction(false, false);
			
			var currentArray = ArrayFunctions.copyArray(this._userBlobs);
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				this.prepareRemoveNote(currentBlob.getInstrumentId(), currentBlob.id);
				this.removeNote(currentBlob.getInstrumentId(), currentBlob.id, -1);
			}
			
			var currentArray = ArrayFunctions.copyArray(this._othersBlobs);
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				this.prepareRemoveNote(currentBlob.getInstrumentId(), currentBlob.id);
				this.removeNote(currentBlob.getInstrumentId(), currentBlob.id, -1);
			}
		};
		
		p.setupSize = function(aNumberOfPositions, aNumberOfPitches, aCircleRadius, aHorizontalSpacing, aVerticalSpacing, aNumberOfEdgePoints, aMargin) {
			
			this._numberOfPositions = aNumberOfPositions;
			this._numberOfPitches = aNumberOfPitches;
			
			this._circleRadius = aCircleRadius;
			this._smallCircleRadius = aCircleRadius/3;
			this._othersDistance = (6/15)*aCircleRadius;
			this._horizontalDistance = aHorizontalSpacing;
			this._verticalDistance = aVerticalSpacing;
			this._numberOfEdgePoints = aNumberOfEdgePoints;
			this._margin = aMargin;
			
			this._width = this._numberOfPositions*this._horizontalDistance+2*this._margin;
			this._height = this._numberOfPitches*this._verticalDistance+2*this._margin;
			
			this._backgroundCanvasElement.width = this._width;
			this._backgroundCanvasElement.height = this._height;
			
			this._backgroundCanvasElement.style.setProperty("left", (-1*this._margin) + "px", "");
			this._backgroundCanvasElement.style.setProperty("top", (-1*this._margin) + "px", "");
			
			this._renderAssets();
			this._getCircle([]);
		};
		
		p.changeInstrument = function(aInstrumentId) {
			// console.log("Player :: changeInstrument & resetting _availableIds");
			this.setInstrumentId(aInstrumentId);
			this._availableIds = [0, 1, 2, 3, 4, 5];
		};
		
		p.getNumberOfNotesLeft =function() {
			//console.log("WEBLAB.orchestra.ui.player.Player::getNumberOfNotesLeft");
			return this._availableIds.length;
		};
		
		p._renderAssets = function() {
			
			this._backgroundCirclesImage = this._element.ownerDocument.createElement("canvas");
			this._backgroundCirclesImage.width = this._horizontalDistance;
			this._backgroundCirclesImage.height = this._numberOfPitches*this._verticalDistance;
			
			var context = this._backgroundCirclesImage.getContext("2d");
			
			context.beginPath();
			context.arc(0.5*this._horizontalDistance, 0.5*this._verticalDistance, this._circleRadius, 0, 2*Math.PI, true); 
			context.closePath();
			context.fillStyle = "#FFFFFF";
			context.fill();
			
			var imageData = context.getImageData(0, 0, this._horizontalDistance, this._verticalDistance);
			for(var i = 1; i < this._numberOfPitches; i++) { //MENOTE: skip first one since its already drawn
				context.putImageData(imageData, 0, i*this._verticalDistance);
			}
		};
		
		p._getCircle = function(aColors) {
			var colorName = "grey";
			var colorArray = new Array();
			if(aColors.length > 0) {
				colorName = aColors.join(",");
			}
			
			if(this._dottedCirles[colorName] != undefined) {
				return this._dottedCirles[colorName];
			}
			
			if(aColors.length > 0) {
				colorName = aColors.join(",");
				var currentArray = aColors;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++) {
					var instrumentId = currentArray[i];
					var colorPosition = OrchestraGradients.INSTRUMENT_MAPPING[instrumentId];
					colorArray.push(OrchestraGradients.SOLID_CSS_VALUES[colorPosition]);
				}
			}
			else {
				colorArray.push("#77807F");
			}
			
			var newCanvas = this._element.ownerDocument.createElement("canvas");
			newCanvas.width = this._horizontalDistance;
			newCanvas.height = this._verticalDistance;
			var context = newCanvas.getContext("2d");
			
			var numberOfDots = this._numberOfEdgePoints;
			var dotSize = 1;
			for(var i = 0; i < numberOfDots; i++) {
				
				var rotationAngle = (i/numberOfDots*2*Math.PI);
				
				var positionX = 0.5*this._horizontalDistance+this._circleRadius*Math.cos(rotationAngle);
				var positionY = 0.5*this._verticalDistance+this._circleRadius*Math.sin(rotationAngle);
				
				context.beginPath();
				context.arc(positionX, positionY, dotSize, 0, 2*Math.PI, true); 
				context.closePath();
				
				context.fillStyle = colorArray[i%colorArray.length];
				context.fill();
			}
			
			this._dottedCirles[colorName] = newCanvas;
			return newCanvas;
		};
		
		p._getColorAtPosition = function(aPosition, aPitch) {
			var returnArray = new Array();
			
			var currentArray = this._othersBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(this._unstartedIntruments[currentBlob.getInstrumentId()]) continue;
				if(currentBlob.reactsAtPosition(aPosition, aPitch)) {
					returnArray.push(currentBlob.getInstrumentId());
				}
			}
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.reactsAtPosition(aPosition, aPitch)) {
					returnArray.push(currentBlob.getInstrumentId());
				}
			}
			
			returnArray.sort();
			
			return returnArray;
		};
		
		p._getOthersBlobsAt = function(aPosition, aPitch) {
			var returnArray = new Array();
			
			var currentArray = this._othersBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.reactsAtPosition(aPosition, aPitch)) {
					returnArray.push(currentBlob);
				}
			}
			
			return returnArray;
		};
		
		p._getBlob = function(aInstrumentId, aNoteId) {
			var currentArray;
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				currentArray = this._userBlobs;
			}
			else {
				currentArray = this._othersBlobs;
			}
			
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if((!currentBlob.isRemoved) && currentBlob.getInstrumentId() === aInstrumentId && currentBlob.id === aNoteId) {
					return currentBlob;
				}
			}
			return null;
		};
		
		p._getRemovedBlob = function(aInstrumentId, aNoteId) {
			var currentArray;
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				currentArray = this._userBlobs;
			}
			else {
				currentArray = this._othersBlobs;
			}
			
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if((currentBlob.isRemoved) && currentBlob.getInstrumentId() === aInstrumentId && currentBlob.id === aNoteId) {
					return currentBlob;
				}
			}
			return null;
		};
		
		p._getRemovedOrNormalBlob = function(aInstrumentId, aNoteId) {
			var currentArray;
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				currentArray = this._userBlobs;
			}
			else {
				currentArray = this._othersBlobs;
			}
			
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.getInstrumentId() === aInstrumentId && currentBlob.id === aNoteId) {
					return currentBlob;
				}
			}
			return null;
		};
		
		p._getRollOver = function(aPosition, aPitch) {
			var currentArray = this._rollOvers;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentRollOver = currentArray[i];
				if(currentRollOver.position === aPosition && currentRollOver.pitch === aPitch) {
					return currentRollOver;
				}
			}
			var newRollOver = RollOver.create(aPosition, aPitch);
			this._rollOvers.push(newRollOver);
			return newRollOver;
		};
		
		p.reset = function() {
			Utils.destroyArrayIfExists(this._userBlobs);
			this._userBlobs.splice(0, this._userBlobs.length);
			Utils.destroyArrayIfExists(this._othersBlobs);
			this._othersBlobs.splice(0, this._othersBlobs.length);
		};
		
		p.setToPlayerLayout = function(aPlayerLayout) {
			//console.log("WEBLAB.orchestra.ui.player.Player::setToPlayerLayout");
			this.reset();
			
			var currentArray = aPlayerLayout.instruments;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentInstrument = currentArray[i];
				var currentArray2 = currentInstrument.notes;
				var currentArray2Length = currentArray2.length;
				for(var j = 0; j < currentArray2Length; j++) {
					var currentNote = currentArray2[j];
					if(currentNote != null) {
						if(i === this._instrumentId && this._isStarted) {
							var newNote = this._createNote(i, j, currentNote.position, currentNote.pitch);
							newNote.prepareAddNote();
							newNote.addNote();
							newNote.animateAddNote(currentNote.position, currentNote.pitch, 0.3);
						}
						else {
							var newNote = this._createAndAddOthersNote(i, j, currentNote.position, currentNote.pitch);
						}
					}
				}
			}
		};
		
		p.setToRecordingSnapShot = function(aInstruments) {
			//console.log("WEBLAB.orchestra.ui.player.Player::setToRecordingSnapShot");
			this.reset();
			
			var currentArray = aInstruments;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentInstrument = currentArray[i];
				var currentArray2 = currentInstrument.notes;
				var currentArray2Length = currentArray2.length;
				for(var j = 0; j < currentArray2Length; j++) {
					var currentNote = currentArray2[j];
					if(currentNote != null) {
						if(i === this._instrumentId && this._isStarted) {
							var newNote = this._createNote(i, currentNote.id, currentNote.position, currentNote.pitch);
							newNote.prepareAddNote();
							newNote.addNote();
							newNote.animateAddNote(currentNote.position, currentNote.pitch, 0.3);
						}
						else {
							var newNote = this._createAndAddOthersNote(i, currentNote.id, currentNote.position, currentNote.pitch);
						}
					}
				}
			}
		};
		
		p._updateBackground = function(aTimeParameter) {
			
			var startPosition = Math.floor(aTimeParameter*this._numberOfPositions)+this._numberOfPositions-fallOffLength;
			
			var backgroundContext = this._backgroundCanvasElement.getContext("2d");
			backgroundContext.clearRect(0, 0, this._width, this._height);
			
			var fallOffLength = 0.5;
			var prepareLength = 1/16;
			
			for(var i = 0; i < this._numberOfPositions; i++) {
				var currentParmeter = i/this._numberOfPositions;
				
				var differenceLength = (aTimeParameter-currentParmeter);
				if(currentParmeter > aTimeParameter) {
					differenceLength += 1;
				}
				
				var envelope = 0;
				if(differenceLength <= fallOffLength) {
					envelope = Math.pow(((fallOffLength-differenceLength)/fallOffLength), 2);
				}
				else if(1-differenceLength <= prepareLength) {
					envelope = Math.pow((prepareLength-(1-differenceLength))/prepareLength, 2);
				}
				
				var circleEnvelope = ((1-this._pauseEnvelope)*envelope+this._pauseEnvelope)*(this._backgroundMaxAlpha-this._backgroundMinAlpha)+this._backgroundMinAlpha;
				var ringEnvelope = (1-(this._pauseEnvelope * 0.2))*envelope;
				
				backgroundContext.globalAlpha = circleEnvelope;
				backgroundContext.drawImage(this._backgroundCirclesImage, i*this._horizontalDistance+this._margin, 0+this._margin, this._backgroundCirclesImage.width, this._backgroundCirclesImage.height);
				
				if(ringEnvelope > 0) {
					backgroundContext.globalAlpha = ringEnvelope;
					for(var j = 0; j < this._numberOfPitches; j++) {
						backgroundContext.drawImage(this._getCircle(this._getColorAtPosition(i, j)), i*this._horizontalDistance+this._margin, j*this._verticalDistance+this._margin, this._horizontalDistance, this._verticalDistance);
					}
				}
			}
			
			var rollOverCircle = this._getCircle([this._instrumentId]);
			
			var currentArray = this._rollOvers;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentRollOver = currentArray[i];
				if(currentRollOver.envelope === 0 && currentRollOver.canBeRemoved) {
					currentArray.splice(i, 1);
					i--;
					currentArrayLength--;
					continue;
				}
				
				backgroundContext.globalAlpha = currentRollOver.envelope;
				backgroundContext.drawImage(rollOverCircle, currentRollOver.position*this._horizontalDistance+this._margin, currentRollOver.pitch*this._verticalDistance+this._margin, this._horizontalDistance, this._verticalDistance);
			}
		};
		
		p.updateTime = function(timeParameter, aGlobalTime) {
			
			this._currentGlobalTime = aGlobalTime;
			this._currentTime = timeParameter;
			this._timedCommands.updateTime(aGlobalTime);
			
			var prepareTime = 0.5*(1/16);
			
			var timeParameterWithPrepare = timeParameter+prepareTime;
			timeParameterWithPrepare -= Math.floor(timeParameterWithPrepare);
			var newPosition = Math.floor(this._numberOfPositions*timeParameterWithPrepare);
			
			this._updateBackground(timeParameter);
			
			var backgroundContext = this._backgroundCanvasElement.getContext("2d");
			backgroundContext.globalAlpha = 1;

			// Ghost tutorial blobs
			if (this._hasTutorialBlobs)
			{
				var currentArray = this._tutorialBlobs;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++) {
					var currentBlob = currentArray[i];		

					if (this._checkIfBlobIsDimmed(currentBlob.position, currentBlob.pitch)) currentBlob.alpha = 0.2;
					else currentBlob.alpha = 1;
								
					currentBlob.updateTime(timeParameter);
					currentBlob.drawGraphics(backgroundContext);					
					// currentBlob.drawOverGraphics(backgroundContext);
					
				}
			}		
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(newPosition != this._currentPosition) {
					var isPlaying = currentBlob.updateBeat(newPosition);
					if(isPlaying) {
						var dataObject = {"instrument": this._instrumentId, "position": newPosition, "pitch": currentBlob.getPlayingPitch()};
						this.dispatchCustomEvent(PlayerChangeEventTypes.USER_BEAT, dataObject);
					}
				}

				if (this._checkIfBlobIsDimmed(currentBlob.position, currentBlob.pitch)) currentBlob.alpha = 0.2;
				else currentBlob.alpha = 1;

				currentBlob.updateTime(timeParameter);
				currentBlob.drawGraphics(backgroundContext);
			}
			
			var currentArray = this._othersBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				
				if(this._unstartedIntruments[currentBlob.getInstrumentId()]) continue;
				
				if(newPosition != this._currentPosition) {
					var isPlaying = currentBlob.updateBeat(newPosition);
					if(isPlaying) {
						var dataObject = {"instrument": currentBlob.getInstrumentId(), "position": newPosition, "pitch": currentBlob.getPlayingPitch()};
						this.dispatchCustomEvent(PlayerChangeEventTypes.OTHERS_BEAT, dataObject);
					}
				}

				if (this._checkIfBlobIsDimmed(currentBlob.position, currentBlob.pitch)) currentBlob.alpha = 0.2;
				else currentBlob.alpha = 1;

				currentBlob.updateTime(timeParameter);
				currentBlob.drawGraphics(backgroundContext);
			}
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.overEnvelope > 0) {
					backgroundContext.globalAlpha = currentBlob.overEnvelope;
					currentBlob.drawOverGraphics(backgroundContext);
				}
			}
			
			this._currentPosition = newPosition;
		};
		
		p.updateDraw = function updateDraw() {
			//console.log("WEBLAB.orchestra.ui.player.Player::updateDraw");
			
			this._updateBackground(this._currentTime);
			
			var backgroundContext = this._backgroundCanvasElement.getContext("2d");
			backgroundContext.globalAlpha = 1;

			// Ghost tutorial blobs
			if (this._hasTutorialBlobs)
			{
				var currentArray = this._tutorialBlobs;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++) {
					var currentBlob = currentArray[i];
					if(currentBlob.overEnvelope > 0) {
						backgroundContext.globalAlpha = currentBlob.overEnvelope * 0.5;
						currentBlob.drawOverGraphics(backgroundContext);
					}
				}
			}
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				currentBlob.updateTime(0);
				currentBlob.drawGraphics(backgroundContext);
			}
			
			var currentArray = this._othersBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				
				currentBlob.updateTime(0);
				currentBlob.drawGraphics(backgroundContext);
			}
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.overEnvelope > 0) {
					backgroundContext.globalAlpha = currentBlob.overEnvelope;
					currentBlob.drawOverGraphics(backgroundContext);
				}
			}

			
		};
		
		p._createNote = function createNote(aInstrumentId, aNoteId, aPosition, aPitch) {
			
			var positionX = this._horizontalDistance*(aPosition+0.5)+this._margin;
			var positionY = this._verticalDistance*(aPitch+0.5)+this._margin;
			
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				var newBlob = Blob.create(aInstrumentId, aNoteId, this._smallCircleRadius, this._circleRadius, positionX, positionY, aPosition, aPitch);
				newBlob.setSpacing(this._horizontalDistance, this._verticalDistance, this._margin);
				newBlob.isInteractive = true;
				this._userBlobs.push(newBlob);
				
				var index = ArrayFunctions.indexOfInArray(this._availableIds, aNoteId);
				this._availableIds.splice(index, 1);
				this.dispatchCustomEvent(Player.NUMBER_OF_BLOBS_CHANGED, this._availableIds.length);
				
				return newBlob;
			}
			else {
				var newBlob = Blob.create(aInstrumentId, aNoteId, this._smallCircleRadius, this._circleRadius, positionX, positionY, aPosition, aPitch);
				newBlob.setSpacing(this._horizontalDistance, this._verticalDistance, this._margin);
				this._othersBlobs.push(newBlob);
				return newBlob;
			}
		};
		
		p._createAndAddOthersNote = function _createAndAddOthersNote(aInstrumentId, aNoteId, aPosition, aPitch) {
			//console.log("WEBLAB.orchestra.ui.player.Player::_createAndAddOthersNote");
			//console.log(aInstrumentId, aNoteId, aPosition, aPitch);
			
			var newNote = this._createNote(aInstrumentId, aNoteId, aPosition, aPitch);
			newNote.prepareAddNote();
			newNote.addNote();
			if(ArrayFunctions.indexOfInArray(this._mutedInstruments, aInstrumentId) !== -1) {
				newNote.setAsMuted();
			}
			
			this._adjustOthersNoteRotation(aPosition, aPitch);
			
			return newNote;
		};
		
		p._removeOthersNote = function _removeOthersNote(aInstrumentId, aNoteId) {
			//console.log("WEBLAB.orchestra.ui.player.Player::_removeOthersNote");
			//console.log(aInstrumentId, aNoteId);
			
			var removeBlob = this._getBlob(aInstrumentId, aNoteId);
			var removeBlobIndex = ArrayFunctions.indexOfInArray(this._othersBlobs, removeBlob);
			this._othersBlobs.splice(removeBlobIndex, 1);
			
			this._adjustOthersNoteRotation(removeBlob.position, removeBlob.pitch);
		};
		
		p._adjustOthersNoteRotation = function(aPosition, aPitch) {
			var notesOnPosition = this._getOthersBlobsAt(aPosition, aPitch);
			if(notesOnPosition.length > 1) {
				var currentArray = notesOnPosition;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++) {
					var currentParameter = 2*Math.PI*(i/currentArrayLength);
					var currentBlob = currentArray[i];
					currentBlob.changeRotationOffset(this._othersDistance, currentParameter);
					if(this._allBlobsAreBig) {
						currentBlob.showAsSmall(0.2);
					}
				}
			}
			else if(notesOnPosition.length === 1) {
				var currentBlob = notesOnPosition[0];
				currentBlob.changeRotationOffset(0, 0);
				if(this._allBlobsAreBig) {
					currentBlob.showAsBig(0.2);
				}
			}
		}
		
		p._canMoveBlobTo = function(aBlob, aPosition, aPitch) {
			if(aPosition < 0 || aPosition >= this._numberOfPositions || aPitch < 0 || aPitch >= this._numberOfPitches) {
				return false;
			}
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if((!currentBlob.isRemoved) && currentBlob.finalPosition === aPosition && currentBlob.finalPitch === aPitch) {
					return false;
				}
			}
			
			return true;
		};
		
		p.muteInstrument = function(aInstrumentId) {
			
			this._mutedInstruments.push(aInstrumentId);
			
			var currentArray = this._othersBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.getInstrumentId() === aInstrumentId) {
					currentBlob.mute();
				}
			}
		};
		
		p.unmuteInstrument = function(aInstrumentId) {
			
			var position = ArrayFunctions.indexOfInArray(this._mutedInstruments, aInstrumentId);
			if(position !== -1) {
				this._mutedInstruments.splice(position, 1);
			}
			
			var currentArray = this._othersBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				if(currentBlob.getInstrumentId() === aInstrumentId) {
					currentBlob.unmute();
				}
			}
		};
		
		p.addNote = function(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp) {
			//console.log("WEBLAB.orchestra.ui.player.Player::addNote");
			//console.log(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp);
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				var currentBlob = this._getBlob(aInstrumentId, aNoteId);
				console.log(">>>>", aTimeStamp, this._currentGlobalTime, 0.001*(aTimeStamp-this._currentGlobalTime), new Date(aTimeStamp), new Date(this._currentGlobalTime));
				if(aTimeStamp >= 0) {
					currentBlob.animateAddNote(aPosition, aPitch, 0.001*(aTimeStamp-this._currentGlobalTime));
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_ADD_NOTE, aTimeStamp, {"blob": currentBlob, "instrumentId": aInstrumentId, "noteId": aNoteId, "position": aPosition, "pitch": aPitch});
				}
				else {
					currentBlob.animateAddNote(currentBlob.finalPosition, currentBlob.finalPitch, 0.1);
					currentBlob.addNote();
				}
			}
			else {
				if(aTimeStamp >= 0) {
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_ADD_NOTE, aTimeStamp, {"instrumentId": aInstrumentId, "noteId": aNoteId, "position": aPosition, "pitch": aPitch});
				}
				else {
					this._createAndAddOthersNote(aInstrumentId, aNoteId, aPosition, aPitch);
				}
			}
		};
		
		p.changeNote = function(aInstrumentId, aNoteId, aPosition, aPitch, aTimeStamp) {
			
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				var currentBlob = this._getBlob(aInstrumentId, aNoteId);

				if(aTimeStamp >= 0) {
					currentBlob.animateChangeNote(aPosition, aPitch, 0.001*(aTimeStamp-this._currentGlobalTime));
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_CHANGE_NOTE, aTimeStamp, {"blob": currentBlob, "instrumentId": aInstrumentId, "noteId": aNoteId, "position": aPosition, "pitch": aPitch});
				}
				else {
					currentBlob.changeNote(aPosition, aPitch);
				}
			}
			else {
				if(aTimeStamp >= 0) {
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_CHANGE_NOTE, aTimeStamp, {"instrumentId": aInstrumentId, "noteId": aNoteId, "position": aPosition, "pitch": aPitch});
				}
				else {
					this._removeOthersNote(aInstrumentId, aNoteId);
					this._createAndAddOthersNote(aInstrumentId, aNoteId, aPosition, aPitch);
				}
			}
		};
		
		p.removeNote = function(aInstrumentId, aNoteId, aTimeStamp) {
			// console.log("removeNote :: aNoteId: ", aNoteId);
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				var currentBlob = this._getRemovedBlob(aInstrumentId, aNoteId);
				console.log(">>>>", aTimeStamp, this._currentGlobalTime, 0.001*(aTimeStamp-this._currentGlobalTime), new Date(aTimeStamp), new Date(this._currentGlobalTime));
				if(aTimeStamp >= 0) {
					currentBlob.animateRemoveNote(0.001*(aTimeStamp-this._currentGlobalTime));
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_REMOVE_NOTE, aTimeStamp, {"blob": currentBlob, "instrumentId": aInstrumentId, "noteId": aNoteId});
				}
				else {
					currentBlob.removeNote();
					
					this._addToAvailableIds(currentBlob.id);
					this.dispatchCustomEvent(Player.NUMBER_OF_BLOBS_CHANGED, this._availableIds.length);
					var currentBlobIndex = ArrayFunctions.indexOfInArray(this._userBlobs, currentBlob);
					this._userBlobs.splice(currentBlobIndex, 1);
					
				}
			}
			else {
				if(aTimeStamp >= 0) {
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_REMOVE_NOTE, aTimeStamp, {"instrumentId": aInstrumentId, "noteId": aNoteId});
				}
				else {
					this._removeOthersNote(aInstrumentId, aNoteId);
				}
			}
		};
		
		p.removeAllNotesForInstrument = function(aInstumentId) {
			if(!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;
			
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				if(aTimeStamp >= 0) {
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_REMOVE_ALL_NOTES_FOR_INSTRUMENT, aTimeStamp, {"instrumentId": aInstrumentId});
				}
				else {
					for(var i = 0; i < i; i++) {
						var currentBlob = this._getRemovedOrNormalBlob(aInstumentId, i);
						if(currentBlob !== null) {
							currentBlob.removeNote();
							
							this._addToAvailableIds(currentBlob.id);
							this.dispatchCustomEvent(Player.NUMBER_OF_BLOBS_CHANGED, this._availableIds.length);
							var currentBlobIndex = ArrayFunctions.indexOfInArray(this._userBlobs, currentBlob);
							this._userBlobs.splice(currentBlobIndex, 1);
						}
					}
				}
			}
			else {
				if(aTimeStamp >= 0) {
					this._timedCommands.addCommand(Player.INTERNAL_COMMAND_REMOVE_ALL_NOTES_FOR_INSTRUMENT, aTimeStamp, {"instrumentId": aInstrumentId});
				}
				else {
					for(var i = 0; i < i; i++) {
						var currentBlob = this._getRemovedOrNormalBlob(aInstumentId, i);
						if(currentBlob !== null) {
							this._removeOthersNote(aInstumentId, i);
						}
					}
				}
			}
		};

		p.prepareAddNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			//console.log("WEBLAB.orchestra.ui.player.Player::prepareAddNote");
			//console.log(aInstrumentId, aNoteId, aPosition, aPitch);
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				var newNote = this._createNote(aInstrumentId, aNoteId, aPosition, aPitch);
				newNote.prepareAddNote();
			}
			else {
				//MENOTE: do nothing
			}
		};
		
		p.prepareChangeNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			//console.log("WEBLAB.orchestra.ui.player.Player::prepareChangeNote");
			//console.log(aInstrumentId, aNoteId, aPosition, aPitch);
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				var currentBlob = this._getBlob(aInstrumentId, aNoteId);
				currentBlob.prepareChangeNote(aPosition, aPitch);
			}
			else {
				//MENOTE: do nothing
			}
		};
		
		p.prepareRemoveNote = function(aInstrumentId, aNoteId) {
			if(aInstrumentId === this._instrumentId && this._isStarted) {
				var currentBlob = this._getBlob(aInstrumentId, aNoteId);
				currentBlob.prepareRemoveNote();
			}
			else {
				//MENOTE: do nothing
			}
		};
		
		p._onNoteRemoved = function(aEvent) {
			var removedBlob = aEvent.detail;
			
			var currentArray;
			if(removedBlob.getInstrumentId() === this._instrumentId) {
				currentArray = this._userBlobs;
			}
			else {
				currentArray = this._othersBlobs;
			}
			
			var blobIndex = ArrayFunctions.indexOfInArray(currentArray, blobIndex);
			removedBlob.splice(blobIndex, 1);
		};
		
		p._addNoteCommand = function(aEvent) {
			var commandData = aEvent.detail;
			if(commandData.blob !== undefined) {
				commandData.blob.addNote();
			}
			else {
				this.addNote(commandData.instrumentId, commandData.noteId, commandData.position, commandData.pitch, -1);
			}
		};
		
		p._changeNoteCommand = function(aEvent) {
			var commandData = aEvent.detail;
			if(commandData.blob !== undefined) {
				commandData.blob.changeNote(commandData.position, commandData.pitch);
			}
			else {
				this.changeNote(commandData.instrumentId, commandData.noteId, commandData.position, commandData.pitch, -1);
			}
		};
		
		p._removeNoteCommand = function(aEvent) {
			
			var commandData = aEvent.detail;
			if(commandData.blob !== undefined) {

				commandData.blob.removeNote();
				
				//MEDEBUG: this should be done in a callback
				this._addToAvailableIds(commandData.blob.id);
				this.dispatchCustomEvent(Player.NUMBER_OF_BLOBS_CHANGED, this._availableIds.length);
				var currentBlobIndex = ArrayFunctions.indexOfInArray(this._userBlobs, commandData.blob);
				this._userBlobs.splice(currentBlobIndex, 1);
			}
			else {
				this.removeNote(commandData.instrumentId, commandData.noteId, -1);
			}
		};
		
		p._removeAllNotesForInstrumentCommand = function(aEvent) {
			var commandData = aEvent.detail;
			this.removeAllNotesForInstrument(commandData.instrumentId, commandData.noteId, -1);
		};

		p._addToAvailableIds = function(aNewId) {
			if (this._availableIds)
			{
				if (this._availableIds.indexOf(aNewId) == -1)
					this._availableIds.push(aNewId)
				else return false;
			}
			return true;
		};
		
		
		p.getUserBlobs = function() {
			return this._userBlobs;
		};
		
		p.getCenterPosition = function(aPosition, aPitch) {
			
			var centerPositionX = ((aPosition+0.5)*this._horizontalDistance);
			var centerPositionY = ((aPitch+0.5)*this._verticalDistance)
			
			return Point.create(centerPositionX, centerPositionY);
		};
		
		p._getPointFromMouseEvent = function(aEvent) {
			return Point.create(aEvent.clientX, aEvent.clientY);
		};
		
		p._onMouseDown = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.Player::_onMouseDown");
			//console.log(aEvent);
			
			if(this._draggedBlob != null) {
				//METODO: cancel dragged
			}
			
			if(!this._canInteract) return;
			
			var position = PositionFunctions.getRelativePositionForNode(this._getPointFromMouseEvent(aEvent), document.body, this._element, new Point());
			
			var currentPosition = Math.floor(position.x/this._horizontalDistance);
			var currentPitch = Math.floor(position.y/this._verticalDistance);
			
			var centerPositionX = ((currentPosition+0.5)*this._horizontalDistance)+this._margin;
			var centerPositionY = ((currentPitch+0.5)*this._verticalDistance)+this._margin;
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				
				if(currentBlob.isInteractive && currentBlob.isAtPosition(centerPositionX, centerPositionY)) { //MENOTE: You only have to hit the correct square, not the circle. Easier with touchscreen
					this.dispatchCustomEvent(UserInteractionEventTypes.INTERACTION, null);
					this._draggedBlob = currentBlob;
					this._draggedBlob.startDragging(position.x+this._margin, position.y+this._margin, centerPositionX, centerPositionY);
					this._startDragTime = new Date();
					document.addEventListener("mouseup", this._releaseCallback, false);
					this.dispatchCustomEvent(UserInteractionEventTypes.START_DRAGGING_NOTE, {instrument: this._instrumentId, note: this._draggedBlob.id, position: this._draggedBlob.finalPosition, pitch: this._draggedBlob.finalPitch});
					aEvent.preventDefault();
					return;
				}
			}
			
			if(this._availableIds.length > 0) {
				this.dispatchCustomEvent(UserInteractionEventTypes.INTERACTION, null);
				var currentPosition = Math.floor(position.x/this._horizontalDistance);
				var currentPitch = Math.floor(position.y/this._verticalDistance);
				
				var centerPositionX = ((currentPosition+0.5)*this._horizontalDistance)+this._margin;
				var centerPositionY = ((currentPitch+0.5)*this._verticalDistance)+this._margin;
				
				var distance = Math.sqrt(Math.pow(position.x+this._margin-centerPositionX, 2)+Math.pow(position.y+this._margin-centerPositionY, 2));
				
				//MENOTE: You only have to hit the correct square, not the circle. Easier with touchscreen
				//if(distance < this._circleRadius) {
					var newId = this._availableIds[0];
					this._addToAvailableIds(this._availableIds.shift());
					this.onNoteAdded(this._instrumentId, newId, currentPosition, currentPitch);
					this.dispatchCustomEvent(UserInteractionEventTypes.ADD_NOTE, {instrument: this._instrumentId, note: newId, position: currentPosition, pitch: currentPitch});
				//}
			}
			else {
				this.dispatchCustomEvent(UserInteractionEventTypes.NO_NOTE_TO_ADD, null);
			}
			
			aEvent.preventDefault();
		};
		
		p.externalAddUserNote = function(aPosition, aPitch) {
			if(this._availableIds.length > 0) {
				var newId = this._availableIds[0];
				this._addToAvailableIds(this._availableIds.shift());
				this.onNoteAdded(this._instrumentId, newId, aPosition, aPitch);
				this.dispatchCustomEvent(UserInteractionEventTypes.ADD_NOTE, {instrument: this._instrumentId, note: newId, position: aPosition, pitch: aPitch});
			}
		};
		
		p._releaseFromExternal = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.Player::_releaseFromExternal");
			if(!this._canInteract) return;
			
			this.dispatchCustomEvent(UserInteractionEventTypes.INTERACTION, null);
			
			//console.log(aEvent, aEvent.clientX, aEvent.clientY);
			
			var position = PositionFunctions.getRelativePositionForNode(this._getPointFromMouseEvent(aEvent), document.body, this._element, new Point());
			position.x += 0.5*aEvent.target.clientWidth;
			position.y -= 0.5*aEvent.target.clientHeight;
			
			var currentPosition = Math.floor(position.x/this._horizontalDistance);
			var currentPitch = Math.floor(position.y/this._verticalDistance);
			
			var centerPositionX = ((currentPosition+0.5)*this._horizontalDistance)+this._margin;
			var centerPositionY = ((currentPitch+0.5)*this._verticalDistance)+this._margin;
			
			var currentArray = this._userBlobs;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentBlob = currentArray[i];
				
				if(currentBlob.isInteractive && currentBlob.isAtPosition(centerPositionX, centerPositionY)) { //MENOTE: You only have to hit the correct square, not the circle. Easier with touchscreen
					return;
				}
			}
			
			if(this._availableIds.length > 0) {
				var currentPosition = Math.floor(position.x/this._horizontalDistance);
				var currentPitch = Math.floor(position.y/this._verticalDistance);
				
				var centerPositionX = ((currentPosition+0.5)*this._horizontalDistance)+this._margin;
				var centerPositionY = ((currentPitch+0.5)*this._verticalDistance)+this._margin;
				
				var distance = Math.sqrt(Math.pow(position.x+this._margin-centerPositionX, 2)+Math.pow(position.y+this._margin-centerPositionY, 2));
				
				//MENOTE: You only have to hit the correct square, not the circle. Easier with touchscreen
				if(/*distance < this._circleRadius && */ this._canMoveBlobTo(null, currentPosition, currentPitch)) {
					var newId = this._availableIds[0];
					this._addToAvailableIds(this._availableIds.shift());
					this.onNoteAdded(this._instrumentId, newId, currentPosition, currentPitch);
					this.dispatchCustomEvent(UserInteractionEventTypes.ADD_NOTE, {instrument: this._instrumentId, note: newId, position: currentPosition, pitch: currentPitch});
				}
			}
			
			document.removeEventListener("dragend", this._releaseFromExternalCallback, false);
		};
		
		p.startExternalDrag = function() {
			//console.log("WEBLAB.orchestra.ui.player.Player::startExternalDrag");
			document.addEventListener("dragend", this._releaseFromExternalCallback, false);
		};
		
		p._onMouseUp = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.Player::_onMouseUp");
			if(!this._canInteract) return;
			
			var position = PositionFunctions.getRelativePositionForNode(this._getPointFromMouseEvent(aEvent), document.body, this._element, new Point());
			
			document.removeEventListener("mouseup", this._releaseCallback, false);
			
			var currentPosition = Math.floor(position.x/this._horizontalDistance);
			var currentPitch = Math.floor(position.y/this._verticalDistance);
			
			var centerPositionX = ((currentPosition+0.5)*this._horizontalDistance)+this._margin;
			var centerPositionY = ((currentPitch+0.5)*this._verticalDistance)+this._margin;
			
			var distance = Math.sqrt(Math.pow(position.x+this._margin-centerPositionX, 2)+Math.pow(position.y+this._margin-centerPositionY, 2));
			
			var currentTime = new Date();
			if(0.001*(currentTime.valueOf()-this._startDragTime.valueOf()) < this._minDragTime && (distance < this._circleRadius && this._draggedBlob.isDraggedFrom(currentPosition, currentPitch))) {
				this._draggedBlob.releaseDraggingWithoutSnap();
				this.onNoteRemoved(this._instrumentId, this._draggedBlob.id);
				this.dispatchCustomEvent(UserInteractionEventTypes.REMOVE_NOTE, {instrument: this._instrumentId, note: this._draggedBlob.id, position: this._draggedBlob.finalPosition, pitch: this._draggedBlob.finalPitch});
			}
			
			else if(/*distance < this._circleRadius &&*/ this._canMoveBlobTo(this._draggedBlob, currentPosition, currentPitch)) { //MENOTE: You only have to hit the correct square, not the circle. Easier with touchscreen
				this._draggedBlob.fixDragging(centerPositionX, centerPositionY, currentPosition, currentPitch);
				if(this._currentRollOver !== null) {
					this._currentRollOver.hide();
					this._currentRollOver = null;
				}
				this.onNoteChanged(this._instrumentId, this._draggedBlob.id, currentPosition, currentPitch);
				this.dispatchCustomEvent(UserInteractionEventTypes.CHANGE_NOTE, {instrument: this._instrumentId, note: this._draggedBlob.id, position: this._draggedBlob.finalPosition, pitch: this._draggedBlob.finalPitch});
			}
			else {
				this._draggedBlob.releaseDragging();
				this.dispatchCustomEvent(UserInteractionEventTypes.INVALID_RELEASE_OF_DRAGGED_NOTE, {instrument: this._instrumentId, note: this._draggedBlob.id, position: this._draggedBlob.finalPosition, pitch: this._draggedBlob.finalPitch});
				this._removeOutsideMargin = 20;
				if(this._removeOutside && ((position.x < -1*this._removeOutsideMargin || position.x > this._numberOfPositions*this._horizontalDistance+this._removeOutsideMargin) || (position.y < -1*this._removeOutsideMargin || position.y > this._numberOfPitches*this._verticalDistance+this._removeOutsideMargin))) {
					this.onNoteRemoved(this._instrumentId, this._draggedBlob.id);
					this.dispatchCustomEvent(UserInteractionEventTypes.REMOVE_NOTE, {instrument: this._instrumentId, note: this._draggedBlob.id, position: this._draggedBlob.finalPosition, pitch: this._draggedBlob.finalPitch});
				}
			}
			
			this._draggedBlob = null;
		};
		
		p._onMouseMove = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.Player::_onMouseMove");
			
			if(!this._canInteract) return;

			var position = PositionFunctions.getRelativePositionForNode(this._getPointFromMouseEvent(aEvent), document.body, this._element, new Point());
			
			//console.log(aEvent.offsetX, aEvent.offsetY, position.x, position.y);
			
			if(this._enableRollOvers) {
				if(this._draggedBlob !== null || this._availableIds.length > 0) {
					var currentPosition = Math.floor(position.x/this._horizontalDistance);
					var currentPitch = Math.floor(position.y/this._verticalDistance);
					
					var centerPositionX = ((currentPosition+0.5)*this._horizontalDistance)+this._margin;
					var centerPositionY = ((currentPitch+0.5)*this._verticalDistance)+this._margin;
					
					var distance = Math.sqrt(Math.pow(position.x+this._margin-centerPositionX, 2)+Math.pow(position.y+this._margin-centerPositionY, 2));
					
					if(/*distance < this._circleRadius &&*/ this._canMoveBlobTo(this._draggedBlob, currentPosition, currentPitch)) { //MENOTE: You only have to hit the correct square, not the circle. Easier with touchscreen
						if(this._currentRollOver === null || (this._currentRollOver.position !== currentPosition || this._currentRollOver.pitch !== currentPitch)) {
							if(this._currentRollOver !== null) {
								this._currentRollOver.hide();
							}
							this._currentRollOver = this._getRollOver(currentPosition, currentPitch);
							this._currentRollOver.show();
						}
					}
					else {
						if(this._currentRollOver !== null) {
							this._currentRollOver.hide();
							this._currentRollOver = null;
						}
					}
				}
				else {
					if(this._currentRollOver !== null) {
						this._currentRollOver.hide();
						this._currentRollOver = null;
					}
				}
			}
			
			if(this._draggedBlob !== null) {
				
				var extraLengthDrag = this._margin-0.5*this._circleRadius;
				
				var totalWidth = this._numberOfPositions*this._horizontalDistance;
				var totalHeight = this._numberOfPitches*this._verticalDistance;
				
				var newPositionX = Math.max(-1*extraLengthDrag, Math.min(totalWidth+extraLengthDrag, position.x))+this._margin;
				var newPositionY = Math.max(-1*extraLengthDrag, Math.min(totalHeight+extraLengthDrag, position.y))+this._margin;
				
				this._draggedBlob.updateDragging(newPositionX, newPositionY);
			}
		};

		p.showTutorialGhostNoteDrag = function(aStartPosition, aStartPitch, aDestinationPosition, aDestinationPitch) {
			this._ghostDragStart.position = aStartPosition;
			this._ghostDragStart.pitch = aStartPitch;
			this._ghostDragDestination.position = aDestinationPosition;
			this._ghostDragDestination.pitch = aDestinationPitch;
			// console.log("STARTING tutorial ghost note drag.");
			if (!this._showTutorialDragNoteAnimation.enabled) {
				this._showTutorialDragNoteAnimation.enabled = true;
				this._showTutorialDragNoteAnimation.timeoutId = setTimeout(function() { this._showTutorialDragNoteAnimation(); }.bind(this), 2000);			
			}
		};

		p.stopTutorialGhostNoteDrag = function() { 
			// console.log("STOPPING tutorial ghost note drag.");
			clearTimeout(this._showTutorialDragNoteAnimation.timeoutId);
			this._showTutorialDragNoteAnimation.enabled = false; 

			if (this._tutorialBlobs.length > 0)
			{
				for (var i=0; i < this._tutorialBlobs.length; i++)
				{
					var ghostBlob = this._tutorialBlobs[i];
					
					ghostBlob.__dragTween.stop();

					var initialAlpha = ghostBlob.alpha;
					var fadeOutTween = new TWEEN.Tween({envelope : 1}).to({envelope : 0}, 500).onUpdate(function() {
						ghostBlob.alpha = initialAlpha * this.envelope;
					}).onComplete(function() {					
						this._hasTutorialBlobs = false;	
						// this._tutorialBlobs.splice(this._tutorialBlobs.indexOf(ghostBlob), 1);													
					}.bind(this)).start();
				}
			}
			
			
		}

		p._showTutorialDragNoteAnimation = function() {		

			var aStartPosition = this._ghostDragStart.position;
			var aStartPitch = this._ghostDragStart.pitch;
			var aDestinationPosition = this._ghostDragDestination.position;
			var aDestinationPitch = this._ghostDragDestination.pitch;

			// console.log("PLAYING tutorial drag note animation");
			var startPositionX = ((aStartPosition+0.5)*this._horizontalDistance)+this._margin;
			var startPositionY = ((aStartPitch+0.5)*this._verticalDistance)+this._margin;

			var destinationPositionX = ((aDestinationPosition+0.5)*this._horizontalDistance)+this._margin;
			var destinationPositionY = ((aDestinationPitch+0.5)*this._verticalDistance)+this._margin;

			var ghostBlob = Blob.create(this._instrumentId, -1, this._smallCircleRadius, this._circleRadius, startPositionX, startPositionY, 0, 0);
			ghostBlob.setSpacing(this._horizontalDistance, this._verticalDistance, this._margin);
			ghostBlob.isInteractive = false;			
			ghostBlob.addNote();
			ghostBlob.tint = true;			
			ghostBlob.animateAddNote(aStartPosition, aStartPitch, 1);

			this._tutorialBlobs.push(ghostBlob);
			this._hasTutorialBlobs = true;

			ghostBlob.startDragging(startPositionX+0.2, startPositionY+0.2, startPositionX, startPositionY);
			
			var diffX = destinationPositionX - startPositionX;
			var diffY = destinationPositionY - startPositionY;

			var scope = this;
			ghostBlob.__dragTween = new TWEEN.Tween({ envelope : 0}).to({ envelope : 1}, 1000).easing(TWEEN.Easing.Quartic.EaseOut).onUpdate(function() {

				var newX = startPositionX + (this.envelope * diffX);
				var newY = startPositionY + (this.envelope * diffY);
 
				ghostBlob.updateDragging(newX, newY);

			}).onComplete(function() {
				// ghostBlob.releaseDragging();												 
				ghostBlob.fixDragging(destinationPositionX, destinationPositionY, aDestinationPosition, aDestinationPitch);
				ghostBlob.changeNote(aDestinationPosition, aDestinationPitch);

				// on complete, remove this blob & perform animation again if it's still enabled
				setTimeout(function() {
					ghostBlob.prepareRemoveNote();

					var initialAlpha = ghostBlob.alpha;
					var fadeOutTween = new TWEEN.Tween({envelope : 1}).to({envelope : 0}, 500).onUpdate(function() {
						ghostBlob.alpha = initialAlpha * this.envelope;
					}).onComplete(function() {

						var arrayIndex = scope._tutorialBlobs.indexOf(ghostBlob);
						scope._tutorialBlobs.splice(arrayIndex, 1);												
						setTimeout(ghostBlob.destroy.bind(ghostBlob), 1000);
					}).start();

					scope._showTutorialDragNoteAnimationComplete();
				}.bind(scope), 3000);			
				
			}).start();

		};
		p._showTutorialDragNoteAnimation.timeoutId = -1;
		p._showTutorialDragNoteAnimation.enabled = false;

		p._showTutorialDragNoteAnimationComplete = function() {
						
			this._hasTutorialBlobs = false;
			if (this._showTutorialDragNoteAnimation.enabled)
			{
				this._showTutorialDragNoteAnimation();
			}			
		}


		p.dimBlob = function(aPosition, aPitch) {
			
			this._hasDimmedBlobs = true;			

			// save the dimmed pitch and region
			if (this._dimRegionPitches.indexOf(aPitch) == -1)
				this._dimRegionPitches.push(aPitch);
			if (this._dimRegionPositions.indexOf(aPosition) == -1)
				this._dimRegionPositions.push(aPosition);
		};		

		p._checkIfBlobIsDimmed = function(aPosition, aPitch) {

			if (!this._hasDimmedBlobs) return false;

			if (this._dimRegionPitches.indexOf(aPitch) != -1)
				if (this._dimRegionPositions.indexOf(aPosition) != -1)
					return true;
			else return false;
		}

		p.unDimAllBlobs = function() {
			this._hasDimmedBlobs = false;
			this._dimmedBlobs = new Array();
			this._dimRegionPositions = new Array();
			this._dimRegionPitches = new Array();
		}


	
		
		p.getOtherUserBlob = function() {
			if (this._othersBlobs.length === 0) return null;

			// sort other user blobs by position, we want ones as close to the center as possible in pitch, and slightly to the left in position
			var tempArray = new Array();
			tempArray = tempArray.concat(this._othersBlobs);

			var blobSortFunction = function(a, b) {
				if (a.position == b.position && a.pitch == b.pitch) return 0;

				var aPitch = (a.pitch < 3) ? a.pitch :  (5 - a.pitch);
				var bPitch = (b.pitch < 3) ? b.pitch :  (5 - b.pitch);
				var aPosition = (a.position < 6) ? a.position : ((15 - a.position) / 3);
				var bPosition = (b.position < 6) ? b.position : ((15 - b.position) / 3);

				return ((aPitch + aPosition) > (bPitch + bPosition)) ? 1 : -1;
			};
			tempArray.sort(blobSortFunction);
			return tempArray.pop();
		};



		p.showTutorialRing = function(aPosition, aPitch) {
			var currentRollOver = this._getRollOver(aPosition, aPitch);
			currentRollOver.show();
		};
		
		p.hideTutorialRing = function(aPosition, aPitch) {
			var currentRollOver = this._getRollOver(aPosition, aPitch);
			currentRollOver.hide();
		};
		
		p.destroy = function() {
			
			if(this._element !== null) {
				this._element.removeEventListener("mousedown", this._pressCallback, false);
				this._element = null;
			}
			document.removeEventListener("mousemove", this._moveCallback, false);
			
			this._backgroundCanvasElement = null;
			
			Utils.destroyIfExists(this._alphaTween);
			this._alphaTween = null;
			Utils.destroyIfExists(this._pauseEnvelopeTween);
			this._pauseEnvelopeTween = null;
			Utils.destroyIfExists(this._timedCommands);
			this._timedCommands = null;
			
			Utils.destroyArrayIfExists(this._userBlobs);
			this._userBlobs = null;
			Utils.destroyArrayIfExists(this._othersBlobs);
			this._othersBlobs = null;
			Utils.destroyArrayIfExists(this._rollOvers);
			this._rollOvers = null;
			this._availableIds = null;
			this._mutedInstruments = null;
			this._unstartedIntruments = null;
			
			if(this._dottedCirles !== null) {
				for(var objectName in this._dottedCirles) {
					delete this._dottedCirles[objectName];
				}
				this._dottedCirles = null;
			}
			this._backgroundCirclesImage = null;
			this._currentRollOver = null;
			
			this._draggedBlob = null;
			
			this.onNoteChanged = null;
			this.onNoteAdded = null;
			this.onNoteRemoved = null;
			
			this._addNoteCommandCallback = null;
			this._changeNoteCommandCallback = null;
			this._removeNoteCommandCallback = null;
			this._removeAllNotesForInstrumentCommandCallback = null;
			this._pressCallback = null;
			this._releaseCallback = null;
			this._releaseFromExternalCallback = null;
			this._moveCallback = null;
			
			s.destroy.call(this);
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		Player.create = function(aElement, aInstrumentId) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			newPlayer.setupSize(16, 6, 16, 40, 40, 22, 20);
			return newPlayer;
		};
		
		Player.createLive = function(aElement, aInstrumentId) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			newPlayer.setupSize(16, 6, 12, 29.75, 30, 18, 10);
			newPlayer.setAsUnstarted();
			return newPlayer;
		};
		
		Player.createSaveTakeAway = function(aElement, aInstrumentId) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			newPlayer.setAllBlobsBig(true);
			newPlayer.setupSize(16, 6, 7, 20, 20, 0, 0);
			return newPlayer;
		};

		Player.createTakeAway = function(aElement, aInstrumentId) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			newPlayer.setAllBlobsBig(true);
			newPlayer.setupSize(16, 6, 12, 29, 30, 0, 0);
			return newPlayer;

		};

		Player.createSharing = function(aElement, aInstrumentId) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			newPlayer.setAllBlobsBig(true);
			newPlayer.setupSize(16, 6, 16, 40, 40, 0, 20);
			return newPlayer;
		};
		
		Player.createSmall = function(aElement, aInstrumentId) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			newPlayer.setupSize(16, 6, 7, 20, 20, 10, 0);
			return newPlayer;
		};
		
		Player.createMicro = function(aElement, aInstrumentId) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			//METODO: set correct values
			newPlayer.setupSize(16, 6, 4, 10, 10, 6, 0);
			return newPlayer;
		};
		
		Player.createMuseum = function(aElement, aInstrumentId, aBlobRadius, aBlobSpacing, aNumberOfPoints) {
			var newPlayer = new Player();
			newPlayer.setElement(aElement);
			newPlayer.setInstrumentId(aInstrumentId);
			newPlayer.setupSize(16, OrchestraConfiguration.NUMBER_OF_PITCHES, aBlobRadius, aBlobSpacing, aBlobSpacing, aNumberOfPoints, 0);
			return newPlayer;
		};
	}
})();