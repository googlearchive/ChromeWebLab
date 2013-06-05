(function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.animation");
	var TweenDelay = namespace.TweenDelay;
	
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if (namespace.DomElementAbsolutePositionTween === undefined) {
		
		var DomElementAbsolutePositionTween = function DomElementAbsolutePositionTween() {
			this._init();
		}
		
		namespace.DomElementAbsolutePositionTween = DomElementAbsolutePositionTween;
		
		var p = DomElementAbsolutePositionTween.prototype;
		
		p._init = function() {
			this._element = null;
			this._x = 0;
			this._y = 0;
			
			this._updateCallback = ListenerFunctions.createListenerFunction(this, this._update);
			
			this._tween = new TWEEN.Tween(this);
			this._tween.onUpdate(this._updateCallback);
			
			this._tweenDelay = TweenDelay.create(this._tween);
		}
		
		p.setElement = function(aElement) {
			this._element = aElement;
			
			return this;
		};
		
		p.getElemet = function() {
			return this._element;
		};
		
		p.getXPosition = function() {
			return this._x;
		};
		
		p.getYPosition = function() {
			return this._y;
		};
		
		p.setStartPosition = function(aX, aY) {
			this._x = aX;
			this._y = aY;
			
			return this;
		};
		
		p.animateTo = function(aX, aY, aTime, aEasing, aDelay) {
			//console.log("WEBLAB.utils.animation.DomElementAbsolutePositionTween::animateTo");
			//console.log(aX, aY, aTime, aEasing, aDelay);
			
			this._tweenDelay.animateTo({"_x": aX, "_y": aY}, aTime, aEasing, aDelay);
			
			return this;
		};
		
		p.update = function() {
			this._update();
		};
		
		p._update = function() {
			
			if(this._element !== null) {
				this._element.style.setProperty("left", this._x + "px", "");
				this._element.style.setProperty("top", this._y + "px", "");
			}
		};
		
		p.destroy = function() {
			this._element = null;
			this._updateCallback = null;
			this._tween = null;
			Utils.destroyIfExists(this._tweenDelay);
			this._tweenDelay = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		DomElementAbsolutePositionTween.create = function(aElement, aStartX, aStartY) {
			var newDomElementAbsolutePositionTween = new DomElementAbsolutePositionTween();
			newDomElementAbsolutePositionTween.setElement(aElement);
			newDomElementAbsolutePositionTween.setStartPosition(aStartX, aStartY);
			return newDomElementAbsolutePositionTween;
		};
		
		DomElementAbsolutePositionTween.createWithAnimation = function(aElement, aStartX, aStartY, aX, aY, aTime, aEasing, aDelay) {
			var newDomElementAbsolutePositionTween = new DomElementAbsolutePositionTween();
			newDomElementAbsolutePositionTween.setElement(aElement);
			newDomElementAbsolutePositionTween.setStartPosition(aStartX, aStartY);
			newDomElementAbsolutePositionTween.animateTo(aX, aY, aTime, aEasing, aDelay);
			return newDomElementAbsolutePositionTween;
		};
	}
})();
