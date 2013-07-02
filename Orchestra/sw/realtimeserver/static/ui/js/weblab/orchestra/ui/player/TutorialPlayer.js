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
	var singletonsNamespace = WEBLAB.namespace("WEBLAB.orchestra.singletons");
	var commonSingletonsNamespace = WEBLAB.namespace("WEBLAB.common.singletons");
	
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	
	var HelpPointer = WEBLAB.namespace("WEBLAB.common.ui").HelpPointer;
	var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;
	
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	var PositionFunctions = WEBLAB.namespace("WEBLAB.utils.htmldom").PositionFunctions;
	var UserInteractionEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").UserInteractionEventTypes;
	var TutorialEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").TutorialEventTypes;
	var OrchestraCopyIds = WEBLAB.namespace("WEBLAB.common.constants").OrchestraCopyIds;
	var Player = WEBLAB.namespace("WEBLAB.orchestra.ui.player").Player;
	
	if(namespace.TutorialPlayer === undefined) {
		
		var TutorialPlayer = function TutorialPlayer() {
			this._init();
		};
		
		namespace.TutorialPlayer = TutorialPlayer;
		
		TutorialPlayer.INTRO_TIME = 7;
		TutorialPlayer.PLAYER_SHOWING_DELAY = 0.5;
		
		var p = TutorialPlayer.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;
		
		p._init = function() {
			
			this._player = null;
			this._holderElement = null;
			
			this._state = -1;
			this._activeBlobId = -1;
			this._addPosition = -1;
			this._addPitch = -1;
			this._removePosition = -1;
			this._originalRemovePosition = -1;
			this._removePitch = -1;
			this._textContents = new Object();
			
			this._addBlobHelpPointer = null;
			this._removeBlobHelpPointer = null;
			this._numberOfBlobsHelpPointer = null;
			this._introHelpPointer = null;
			
			this._copyGenerator = null;
			this._hasIntro = false;
			
			this._onAddNoteCallback = ListenerFunctions.createListenerFunction(this, this._onAddNote);
			this._onChangeNoteCallback = ListenerFunctions.createListenerFunction(this, this._onChangeNote);
			this._onRemoveNoteCallback = ListenerFunctions.createListenerFunction(this, this._onRemoveNote);
			this._onStartDraggingNoteCallback = ListenerFunctions.createListenerFunction(this, this._onStartDraggingNote);
			this._onInvalidReleaseOfDraggedNoteCallback = ListenerFunctions.createListenerFunction(this, this._onInvalidReleaseOfDraggedNote);
			this._interactionCallback = ListenerFunctions.createListenerFunction(this, this._interaction);
			this._dragTutorialNoteOnAddCallback = ListenerFunctions.createListenerFunction(this, this._dragTutorialNoteOnAdd);

			this._introDoneCallback = ListenerFunctions.createListenerFunction(this, this._introDone);
			this._playerInterfaceShowingCallback = ListenerFunctions.createListenerFunction(this, this._playerInterfaceShowing);
			this._introDoneTimeout = -1;			
			
			return this;
		};
		
		p.setup = function(aPlayer, aHolderElement) {
			
			this._player = aPlayer;
			this._holderElement = aHolderElement;
			
			this._addBlobHelpPointer = HelpPointer.create();
			this._holderElement.appendChild(this._addBlobHelpPointer.getElement());
			this._addBlobHelpPointer.setSize(350, -30).setMargins(0, 0);
			
			this._removeBlobHelpPointer = HelpPointer.create();
			this._holderElement.appendChild(this._removeBlobHelpPointer.getElement());
			this._removeBlobHelpPointer.setSize(350, -30).setMargins(0, 0);

			this._otherBlobsHelpPointer = HelpPointer.create();
			this._holderElement.appendChild(this._otherBlobsHelpPointer.getElement());
			this._otherBlobsHelpPointer.setSize(350, -30).setMargins(0,0);
			
			this._numberOfBlobsHelpPointer = HelpPointer.create();
			this._holderElement.appendChild(this._numberOfBlobsHelpPointer.getElement());
			this._numberOfBlobsHelpPointer.setSize(370, -30).setMargins(0, 0);
			
			this._introHelpPointer = HelpPointer.create();
			this._introHelpPointer.setSize(450, -30).setMargins(1, 6);
		};
		
		p.setCopyGenerator = function(aGenerator) {
			this._copyGenerator = aGenerator;
		};
		
		p.setPositions = function(aAddPosition, aAddPith, aReomvePosition, aRemovePitch) {
			
			this._addPosition = aAddPosition;
			this._addPitch = aAddPith;
			this._removePosition = aReomvePosition;
			this._originalRemovePosition = aReomvePosition;
			this._removePitch = aRemovePitch;
			
		};
		
		p.setNumberOfBlobsPosition = function(aX, aY) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::setNumberOfBlobsPosition");
			
			this._numberOfBlobsHelpPointer.setPosition(aX, aY);
		};
		
		p.setupIntro = function(aX, aY, aInstrumentId) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::setupIntro");
			//console.log(aX, aY, aInstrumentId);
			
			var introCopyId = OrchestraCopyIds.TUTORIAL_INTRO_TITLES[aInstrumentId];
			
			var titleDiv = this._getContent(introCopyId);
			titleDiv.classList.add("tutorialIntroTitle");
			var bodyDiv = this._getContent(OrchestraCopyIds.TUTORIAL_INTRO_BODY);
			bodyDiv.classList.add("tutorialIntroBody");
			
			this._introHelpPointer.setContent(titleDiv, bodyDiv);
			this._introHelpPointer.setPosition(aX, aY);
			this._introHelpPointer.setUpdateContentSize(true, false);
			
			this._hasIntro = true;
		};
		
		p.getIntroHelpPointerElement = function() {
			return this._introHelpPointer.getElement();
		};
		
		p.startTutorial = function() {
			this._startIntro();
		};
		
		p._startIntro = function() {
			this._state = -1;
			
			if(this._hasIntro) {
				this._introHelpPointer.show();
				this._introDoneTimeout = setTimeout(this._introDoneCallback, TutorialPlayer.INTRO_TIME*1000);
			}
			else {
				this.dispatchCustomEvent(TutorialEventTypes.SHOW_INTERACTIVE_PART, null);
				this._startInteractiveTutorial();
			}
		};
		
		p._introDone = function() {
			this._introDoneTimeout = -1;
			
			this._introHelpPointer.hide();
			
			this.dispatchCustomEvent(TutorialEventTypes.SHOW_INTERACTIVE_PART, null);
			
			this._introDoneTimeout = setTimeout(this._playerInterfaceShowingCallback, TutorialPlayer.PLAYER_SHOWING_DELAY*1000);
		}
		
		p._playerInterfaceShowing = function() {
			this._introDoneTimeout = -1;
			this._startInteractiveTutorial();
		};
		
		p._startInteractiveTutorial = function() {
			this._state = 0;
			
			var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._addPosition, this._addPitch), this._player.getElement(), this._holderElement, new Point());
			
			this._addBlobHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_ADD_BLOB), null);
			this._addBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
			this._addBlobHelpPointer.show();
			
			var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._removePosition, this._removePitch), this._player.getElement(), this._holderElement, new Point());
			this._removeBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
			
			this._player.showTutorialRing(this._addPosition, this._addPitch);
			
			this._player.addEventListener(UserInteractionEventTypes.ADD_NOTE, this._onAddNoteCallback, false);
			this._player.addEventListener(UserInteractionEventTypes.CHANGE_NOTE, this._onChangeNoteCallback, false);
			this._player.addEventListener(UserInteractionEventTypes.REMOVE_NOTE, this._onRemoveNoteCallback, false);
			this._player.addEventListener(UserInteractionEventTypes.START_DRAGGING_NOTE, this._onStartDraggingNoteCallback, false);
			this._player.addEventListener(UserInteractionEventTypes.INVALID_RELEASE_OF_DRAGGED_NOTE, this._onInvalidReleaseOfDraggedNoteCallback, false);
			this._player.addEventListener(UserInteractionEventTypes.INTERACTION, this._interactionCallback, false);
		};
		
		p.cancelTutorial = function() {
			this._addBlobHelpPointer.hide();
			this._removeBlobHelpPointer.hide();
			this._introHelpPointer.hide();

			this._player.stopTutorialGhostNoteDrag();
			
			if(this._introDoneTimeout !== -1) {
				clearTimeout(this._introDoneTimeout);
				this._introDoneTimeout = -1;
			}
			
			this._player.removeEventListener(UserInteractionEventTypes.ADD_NOTE, this._onAddNoteCallback, false);
			this._player.removeEventListener(UserInteractionEventTypes.CHANGE_NOTE, this._onChangeNoteCallback, false);
			this._player.removeEventListener(UserInteractionEventTypes.REMOVE_NOTE, this._onRemoveNoteCallback, false);
			this._player.removeEventListener(UserInteractionEventTypes.START_DRAGGING_NOTE, this._onStartDraggingNoteCallback, false);
			this._player.removeEventListener(UserInteractionEventTypes.INVALID_RELEASE_OF_DRAGGED_NOTE, this._onInvalidReleaseOfDraggedNoteCallback, false);
			this._player.removeEventListener(UserInteractionEventTypes.INTERACTION, this._interactionCallback, false);
			
			this._player.hideTutorialRing(this._addPosition, this._addPitch);
			this._player.hideTutorialRing(this._removePosition, this._removePitch);
			
			this._state = 6;
		};
		
		p._getContent = function(aId) {
			if(this._textContents[aId] === undefined) {
				var holderElement = document.createElement("div");
				holderElement.classList.add("sizeDetect");
				var newElement = document.createElement("div");
				holderElement.appendChild(newElement);
				newElement.innerHTML = this._copyGenerator.getCopy(aId);
				this._textContents[aId] = holderElement;
				newElement.classList.add("helpPointerContent");
				newElement.classList.add("tutorialContent");
			}
			
			return this._textContents[aId];
		};
		
		p._onAddNote = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::_onAddNote");
			var currentPosition = aEvent.detail.position;
			var currentPitch = aEvent.detail.pitch;
			
			if(this._state === 0) {
				this._state = 1;
				this._activeBlobId = aEvent.detail.note;
				
				this._player.hideTutorialRing(this._addPosition, this._addPitch);
				
				if((currentPosition >= this._removePosition && currentPosition < this._removePosition+6) && (currentPitch >= this._removePitch-1 && currentPitch <= this._removePitch+1)) {
					this._removePosition = this._addPosition;
					this._originalRemovePosition = this._removePosition;
					this._removePitch = this._addPitch-1;
					var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._removePosition, this._removePitch), this._player.getElement(), this._holderElement, new Point());
					this._removeBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
				}
				else if((currentPosition <= this._removePosition && currentPosition > this._removePosition-6) && (currentPitch >= this._removePitch && currentPitch <= this._removePitch+1)) {
					this._removePitch = this._addPitch-2;
					var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._removePosition, this._removePitch), this._player.getElement(), this._holderElement, new Point());
					this._removeBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
				}
				
				this._addPosition = currentPosition;
				this._addPitch = currentPitch;
				
				var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._addPosition, this._addPitch), this._player.getElement(), this._holderElement, new Point());
				this._addBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);				
				this._addBlobHelpPointer.replaceContent(this._getContent(OrchestraCopyIds.TUTORIAL_CHANGE_BLOB), null);

				this._removeBlobHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_OVER_HERE), null);
				this._removeBlobHelpPointer.show();
				this._player.showTutorialRing(this._removePosition, this._removePitch);

				// OHNOTE : performs the drag automatically				
				this._player.addEventListener(Player.NUMBER_OF_BLOBS_CHANGED, this._dragTutorialNoteOnAddCallback);				
			}
			else if(this._state === 1) {
				if(currentPosition === this._removePosition && currentPitch === this._removePitch) {
					
					this._player.hideTutorialRing(this._removePosition, this._removePitch);
					
					this._removePosition = this._originalRemovePosition;
					
					var userBlobs = this._player.getUserBlobs();
					var currentArray = userBlobs;
					var currentArrayLength = currentArray.length;
					for(var i = 0; i < currentArrayLength; i++) {
						var currentBlob = currentArray[i];
						
						if((currentBlob.finalPosition == this._removePosition && currentBlob.finalPitch === this._removePitch) || (currentPosition === this._removePosition)) {
							this._removePosition++;
							i = -1;
						}
					}
					
					if(this._state === 1) {
						var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._removePosition, this._removePitch), this._player.getElement(), this._holderElement, new Point());
						this._removeBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
						this._player.showTutorialRing(this._removePosition, this._removePitch);
					}

					// OHNOTE : updates the ghost drag position
					// this._player.stopTutorialGhostNoteDrag();
					this._player.addEventListener(Player.NUMBER_OF_BLOBS_CHANGED, this._dragTutorialNoteOnAddCallback);

				}
			}
			else if (this._state === 4) {
				this._otherBlobsHelpPointer.hide();
				this._unDimBlobs();
				this._numberOfBlobsHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_NUMBER_OF_BLOBS), null);
				this._numberOfBlobsHelpPointer.show();
				this._dimBlobRow(5, 2, 12);
				this._state = 5;
			}

		};

		p._dragTutorialNoteOnAdd = function() {
			this._player.showTutorialGhostNoteDrag(this._addPosition, this._addPitch, this._removePosition, this._removePitch);
			this._player.removeEventListener(Player.NUMBER_OF_BLOBS_CHANGED, this._dragTutorialNoteOnAddCallback);
		};

		
		p._onStartDraggingNote = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::_onStartDraggingNote");
			if(this._state === 1 && aEvent.detail.note === this._activeBlobId) {
				this._state = 2;
				this._addBlobHelpPointer.hide();				
			}
			
			this._player.stopTutorialGhostNoteDrag();
		};
		
		p._onInvalidReleaseOfDraggedNote = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::_onInvalidReleaseOfDraggedNote");
			if(this._state === 2 && aEvent.detail.note === this._activeBlobId) {
				this._state = 1;
				this._addBlobHelpPointer.show();
			}
		};
		
		p._onChangeNote = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::_onChangeNote");
			var currentPosition = aEvent.detail.position;
			var currentPitch = aEvent.detail.pitch;
			
			if(this._state === 0) {
				this._state = 1;
				this._activeBlobId = aEvent.detail.note;
				
				this._addPosition = currentPosition;
				this._addPitch = currentPitch;
				
				var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._addPosition, this._addPitch), this._player.getElement(), this._holderElement, new Point());
				this._addBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
				
				this._addBlobHelpPointer.replaceContent(this._getContent(OrchestraCopyIds.TUTORIAL_CHANGE_BLOB), null);
				this._removeBlobHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_OVER_HERE), null);
				this._removeBlobHelpPointer.show();
				this._player.hideTutorialRing(this._addPosition, this._addPitch);
				this._player.showTutorialRing(this._removePosition, this._removePitch);
			}
			else if(this._state === 1 || this._state === 2) {
				if(this._state === 1) {
					this._addBlobHelpPointer.hide();
				}
				this._state = 3;
				
				this._player.hideTutorialRing(this._removePosition, this._removePitch);
				
				this._removePosition = currentPosition;
				this._removePitch = currentPitch;
				
				this._activeBlobId = aEvent.detail.note;
				
				var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._removePosition, this._removePitch), this._player.getElement(), this._holderElement, new Point());
				
				this._removeBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
				
				this._removeBlobHelpPointer.replaceContent(this._getContent(OrchestraCopyIds.TUTORIAL_REMOVE_BLOB), null);

				this._player.stopTutorialGhostNoteDrag();
			}
			else if(this._state === 3 && aEvent.detail.note === this._activeBlobId) {
				
				this._removePosition = currentPosition;
				this._removePitch = currentPitch;
				
				var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(this._removePosition, this._removePitch), this._player.getElement(), this._holderElement, new Point());
				this._removeBlobHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
			}
		};
		
		p._onRemoveNote = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::_onRemoveNote");
			if(this._state === 3 && aEvent.detail.note === this._activeBlobId) {
				this._state = 4;
				this._removeBlobHelpPointer.hide();		
				this._player.stopTutorialGhostNoteDrag();

				this._otherBlobsHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_OTHER_USER_BLOBS), null);
				var bestBlob = this._player.getOtherUserBlob();
				if (bestBlob) {
					var pointerPosition = PositionFunctions.getRelativePositionForNode(this._player.getCenterPosition(bestBlob.position, bestBlob.pitch), this._player.getElement(), this._holderElement, new Point());
					this._otherBlobsHelpPointer.setPosition(pointerPosition.x, pointerPosition.y);
					this._otherBlobsHelpPointer.show();

					if (bestBlob.pitch > 0 && bestBlob.position < 14)					
						this._dimBlobRow(bestBlob.pitch-1, bestBlob.position+1, bestBlob.position+6);

					setTimeout(this._showOtherBlobsTimeout.bind(this), 5000);	
				}
				else 
				{
					this._numberOfBlobsHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_NUMBER_OF_BLOBS), null);
					this._numberOfBlobsHelpPointer.show();
					this._dimBlobRow(5, 2, 12);
					this._state = 5;
				}

				this.dispatchCustomEvent(TutorialEventTypes.DONE, null);
			}
			else if(this._state === 2 && aEvent.detail.note === this._activeBlobId) {
				this._state = 0;
				this._addBlobHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_ADD_BLOB), null);
				this._addBlobHelpPointer.show();
				this._removeBlobHelpPointer.hide();
				this._player.showTutorialRing(this._addPosition, this._addPitch);
				this._player.hideTutorialRing(this._removePosition, this._removePitch);
			}
		};

		p._showOtherBlobsTimeout = function() {
			if (this._state === 4) {
				this._state = 5;
				this._otherBlobsHelpPointer.hide();
				this._unDimBlobs();
				this._numberOfBlobsHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_NUMBER_OF_BLOBS), null);
				this._numberOfBlobsHelpPointer.show();
				this._dimBlobRow(5, 2, 12);
			}
		}
	
		p.clearAllNotes = function(aEvent) {
			if(this._state === 3) {
				this._state = 5;
				this._removeBlobHelpPointer.hide();
				this._numberOfBlobsHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_NUMBER_OF_BLOBS), null);
				this._numberOfBlobsHelpPointer.show();
				this._dimBlobRow(5, 2, 12);
				this.dispatchCustomEvent(TutorialEventTypes.DONE, null);
			}
			if(this._state === 2 || this._state === 1) {
				this._state = 0;
				this._addBlobHelpPointer.setContent(this._getContent(OrchestraCopyIds.TUTORIAL_ADD_BLOB), null);
				this._addBlobHelpPointer.show();
				this._removeBlobHelpPointer.hide();
				this._player.showTutorialRing(this._addPosition, this._addPitch);
				this._player.hideTutorialRing(this._removePosition, this._removePitch);
			}
		};
		
		p._interaction = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.TutorialPlayer::_interaction");
			if(this._state === 5) {
				this._state = 6;
				this._numberOfBlobsHelpPointer.hide();
				this._unDimBlobs();
			}
		};

		p._dimBlobRow = function(aPitch, aStartPosition, aEndPosition) {
			aStartPosition = (aStartPosition > 0) ? aStartPosition : 0;
			aEndPosition = (aEndPosition < 16) ? aEndPosition : 15;

			for (var i = aStartPosition; i <= aEndPosition; i++){
				this._player.dimBlob(i, aPitch);
			}
		}

		p._unDimBlobs = function () {			
			this._player.unDimAllBlobs();		
		}
		
		
		p.hideForHelp = function() {
			if(this._state === 4) {
				this._state = 6;
				this._numberOfBlobsHelpPointer.hide();
				this._unDimBlobs();
			}
		}
		
		p.destroy = function() {
			if(this._introDoneTimeout !== -1) {
				clearTimeout(this._introDoneTimeout);
				this._introDoneTimeout = -1;
			}
			
			this._player = null; //MENOTE: player is not owned by the tutorial
			this._holderElement = null;
			
			if(this._textContents !== null) {
				for(var objectName in this._textContents) {
					delete this._textContents[objectName];
				}
				this._textContents = null;
			}
			
			Utils.destroyIfExists(this._addBlobHelpPointer);
			this._addBlobHelpPointer = null;
			Utils.destroyIfExists(this._removeBlobHelpPointer);
			this._removeBlobHelpPointer = null;
			Utils.destroyIfExists(this._numberOfBlobsHelpPointer);
			this._numberOfBlobsHelpPointer = null;
			Utils.destroyIfExists(this._introHelpPointer);
			this._introHelpPointer = null;
			
			this._onAddNoteCallback = null;
			this._onChangeNoteCallback = null;
			this._onRemoveNoteCallback = null;
			this._onStartDraggingNoteCallback = null;
			this._onInvalidReleaseOfDraggedNoteCallback = null;
			this._interactionCallback = null;
			this._introDoneCallback = null;
			this._playerInterfaceShowingCallback = null;
			
			s.destroy.call(this);
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		TutorialPlayer.create = function(aPlayer, aHolderElement) {
			var newTutorialPlayer = new TutorialPlayer();
			newTutorialPlayer.setup(aPlayer, aHolderElement);
			return newTutorialPlayer;
		}
	}
})();