/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player");
	
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var Utils = WEBLAB.namespace('WEBLAB.utils').Utils;
	var DomElementScaleTween = WEBLAB.namespace("WEBLAB.utils.animation").DomElementScaleTween;
	var DomElementPositionTween = WEBLAB.namespace("WEBLAB.utils.animation").DomElementPositionTween;
	var DomElementOpacityTween = WEBLAB.namespace("WEBLAB.utils.animation").DomElementOpacityTween;
	
	var UserInteractionEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").UserInteractionEventTypes;
	
	if(namespace.BlobsLeftPanel === undefined) {
		
		var BlobsLeftPanel = function BlobsLeftPanel() {
			this._init();
		};
		
		namespace.BlobsLeftPanel = BlobsLeftPanel;
		
		var p = BlobsLeftPanel.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;
		
		p._init = function() {
			
			this._element = null;
			this._images = null;
			this._imageAnimations = null;
			this._backgroundAnimations = null;
			
			this._clearAllButton = null;
			this._clearAllButtonPositionAnimation = null;
			this._clearAllButtonOpacityAnimation = null;
			
			this._numberOfBlobsActive = 0;
			this._numberOfBlobsVisible = 0;
			
			this._instrumentType = null;
			
			this._updateNumberOfVisibleBlobsCallback = ListenerFunctions.createListenerFunction(this, this._updateNumberOfVisibleBlobs);
			this._numberOfBlobsActiveTween = (new (TWEEN.Tween)(this)).onUpdate(this._updateNumberOfVisibleBlobsCallback);
			
			this._clearAllNotesCallback = ListenerFunctions.createListenerFunction(this, this._clearAllNotes);
			this._noteClickedCallback = ListenerFunctions.createListenerFunction(this, this._noteClicked);
			
			return this;
		};
		
		p.setElement = function(aElement) {
			this._element = aElement;
			
			this._images = this._element.querySelectorAll("*[data-weblab-type='blob'] .filledImage");
			var backgrounds = this._element.querySelectorAll("*[data-weblab-type='blob'] .circleBackground");
			
			var currentArray = this._images;
			var currentArrayLength = currentArray.length;
			this._imageAnimations = new Array(currentArrayLength);
			this._backgroundAnimations = new Array(currentArrayLength);
			for(var i = 0; i < currentArrayLength; i++) {
				var currentImage = currentArray[i];
				var newAnimation = DomElementScaleTween.create(currentImage, 0, 0);
				newAnimation.update();
				this._imageAnimations[i] = newAnimation;
				
				var newBackgroundAnimation = DomElementOpacityTween.create(backgrounds[i], 1);
				newBackgroundAnimation.update();
				this._backgroundAnimations[i] = newBackgroundAnimation;
			}
			
			this._clearAllButton = this._element.querySelector(".clearAllButton");
			Utils.addListener(this._clearAllButton, "click", this._clearAllNotesCallback);
			this._clearAllButton.style.setProperty("pointer-events", "none", "");
			
			var animationLayer = this._clearAllButton.querySelector(".animationLayer");
			this._clearAllButtonPositionAnimation = DomElementPositionTween.create(animationLayer, -20, 0);
			this._clearAllButtonPositionAnimation.update();
			this._clearAllButtonOpacityAnimation = DomElementOpacityTween.create(animationLayer, 0);
			this._clearAllButtonOpacityAnimation.update();
			
			return this;
		};
		
		p.getElement = function() {
			return this._element;
		};
		
		p.setInstrumentType = function(aInstrumentType) {
			if(this._instrumentType !== null) {
				this._element.classList.remove(this._instrumentType);
			}
			this._instrumentType = aInstrumentType;
			if(this._instrumentType !== null) {
				this._element.classList.add(this._instrumentType);
			}
		};
		
		p.setNumberOfVisibleBlobs = function(aNumberOfBlobs) {
			this._numberOfBlobsVisible = aNumberOfBlobs;
			this._updateNumberOfVisibleBlobs();
		};
		
		p._updateNumberOfVisibleBlobs = function() {
			var numberOfActiveBlobs = Math.round(this._numberOfBlobsActive);
			for(var i = 0; i < numberOfActiveBlobs; i++) {
				var currentAnimation = this._imageAnimations[i];
				var currentBackgroundAnimation = this._backgroundAnimations[i];
				var isUnused = (i < this._numberOfBlobsVisible);
				if(isUnused) {
					currentAnimation.animateTo(1, 1, 0.15, TWEEN.Easing.Quadratic.EaseOut, 0);
					currentBackgroundAnimation.animateTo(0, 0.15, TWEEN.Easing.Quadratic.EaseOut, 0);
				}
				else {
					currentAnimation.animateTo(0, 0, 0.15, TWEEN.Easing.Quadratic.EaseOut, 0);
					currentBackgroundAnimation.animateTo(1, 0.15, TWEEN.Easing.Quadratic.EaseOut, 0);
				}
			}
			for(; i < 6; i++) { //MENOTE: continues from last loop
				var currentAnimation = this._imageAnimations[i];
				var currentBackgroundAnimation = this._backgroundAnimations[i];
				currentAnimation.animateTo(0, 0, 0.15, TWEEN.Easing.Quadratic.EaseOut, 0);
				currentBackgroundAnimation.animateTo(1, 0.15, TWEEN.Easing.Quadratic.EaseOut, 0);
			}
			
			if(this._numberOfBlobsVisible === 6) {
				this._clearAllButton.style.setProperty("pointer-events", "none", "");
				this._clearAllButtonPositionAnimation.animateTo(-20, 0, 0.2, TWEEN.Easing.Quadratic.EaseOut, 0);
				this._clearAllButtonOpacityAnimation.animateTo(0, 0.2, TWEEN.Easing.Quadratic.EaseOut, 0);
			}
			else {
				this._clearAllButton.style.removeProperty("pointer-events");
				this._clearAllButtonPositionAnimation.animateTo(0, 0, 0.2, TWEEN.Easing.Quadratic.EaseOut, 0);
				this._clearAllButtonOpacityAnimation.animateTo(1, 0.2, TWEEN.Easing.Quadratic.EaseOut, 0);
			}
		};
		
		p.activate = function() {
			this._numberOfBlobsActiveTween.to({"_numberOfBlobsActive": 6}, 0.5*1000).easing(TWEEN.Easing.Quadratic.EaseOut).start();
			
			var currentArray = this._images;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				Utils.addListener(currentArray[i], "mousedown", this._noteClickedCallback);
			}
		};
		
		p.deactivate = function() {
			this._numberOfBlobsActiveTween.to({"_numberOfBlobsActive": 0}, 0.5*1000).easing(TWEEN.Easing.Quadratic.EaseOut).start();
			
			var currentArray = this._images;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				Utils.removeListener(currentArray[i], "mousedown", this._noteClickedCallback);
			}
		};
		
		p._clearAllNotes = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.BlobsLeftPanel::_clearAllNotes");
			//console.log(aEvent);
			
			aEvent.preventDefault();
			
			this.dispatchCustomEvent(UserInteractionEventTypes.CLEAR_ALL_NOTES, null);
		};
		
		p._noteClicked = function(aEvent) {
			//console.log("WEBLAB.orchestra.ui.player.BlobsLeftPanel::_noteClicked");
			//console.log(aEvent);
			
			var numberOfActiveBlobs = Math.round(this._numberOfBlobsActive);
			
			var currentArray = this._images;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentImage = currentArray[i];
				if(currentImage === aEvent.target) {
					if(i < numberOfActiveBlobs && i < this._numberOfBlobsVisible) {
						this.dispatchCustomEvent(UserInteractionEventTypes.DRAG_FROM_BLOBS_LEFT_PANEL, null);
					}
					else if(i > numberOfActiveBlobs) {
						//MENOTE: do nothing
					}
					else {
						this.dispatchCustomEvent(UserInteractionEventTypes.CLICK_ON_UNAVAILABLE, null);
					}
					break;
				}
			}
		};
		
		p.reset = function() {
			//METODO
		};
		
		
		p.destroy = function() {
			
			this._element = null;
			if(this._images !== null) {
				var currentArray = this._images;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++) {
					Utils.removeListener(currentArray[i], "mousedown", this._noteClickedCallback);
				}
				this._images = null;
			}
			
			Utils.destroyArrayIfExists(this._imageAnimations);
			this._imageAnimations = null;
			Utils.destroyArrayIfExists(this._backgroundAnimations);
			this._backgroundAnimations = null;
			
			if(this._clearAllButton !== null) {
				Utils.removeListener(this._clearAllButton, "click", this._clearAllNotesCallback);
				this._clearAllButton = null;
			}
			Utils.destroyIfExists(this._clearAllButtonPositionAnimation);
			this._clearAllButtonPositionAnimation = null;
			Utils.destroyIfExists(this._clearAllButtonOpacityAnimation);
			this._clearAllButtonOpacityAnimation = null;
			
			if(this._numberOfBlobsActiveTween !== null) {
				this._numberOfBlobsActiveTween.stop();
				this._numberOfBlobsActiveTween = null;
			}
			
			this._updateNumberOfVisibleBlobsCallback = null;
			this._clearAllNotesCallback = null;
			this._noteClickedCallback = null;
			
			s.destroy.call(this);
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		BlobsLeftPanel.create = function(aElement) {
			var newBlobsLeftPanel = new BlobsLeftPanel();
			newBlobsLeftPanel.setElement(aElement);
			return newBlobsLeftPanel;
		};
	}
})();