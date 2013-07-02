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
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.animation");
	var TimedCommands = WEBLAB.namespace("WEBLAB.utils.timer").TimedCommands;
	
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if (namespace.DomElementInDomTween === undefined) {
		
		var DomElementInDomTween = function DomElementInDomTween() {
			this._init();
		}
		
		namespace.DomElementInDomTween = DomElementInDomTween;
		
		DomElementInDomTween.INTERNAL_CHANGE_STATE = "changeState";
		
		var p = DomElementInDomTween.prototype;
		
		p._init = function() {
			this._element = null;
			this._parentElement = null;
			
			this._isInDom = false;
			
			this._changeStateCallback = ListenerFunctions.createListenerFunction(this, this._changeState);
			
			this._timedCommands = TimedCommands.create().setAutoStart(true);
			this._timedCommands.addEventListener(DomElementInDomTween.INTERNAL_CHANGE_STATE, this._changeStateCallback, false);
			
		}
		
		p.setElement = function(aElement, aParentElement) {
			this._element = aElement;
			this._parentElement = aParentElement;
			
			return this;
		};
		
		p.getElement = function() {
			return this._element;
		};
		
		p.isInDom = function() {
			return this._isInDom;
		};
		
		p.setStartInDom = function(aInDom) {
			this._isInDom = aInDom;
			
			return this;
		};
		
		p.animateTo = function(aInDom, aDelay) {
			//console.log("WEBLAB.utils.animation.DomElementInDomTween::animateTo");
			//console.log(aInDom, aDelay);
			
			if(aDelay === 0) {
				this._timedCommands.clearAllCommandsByType(DomElementInDomTween.INTERNAL_CHANGE_STATE);
				this._isInDom = aInDom;
				this._update();
			}
			else {
				var currentTime = 0.001*Date.now();
				
				this._timedCommands.addCommand(DomElementInDomTween.INTERNAL_CHANGE_STATE, currentTime+aDelay, aInDom);
			}
			
			return this;
		};
		
		p.update = function() {
			this._update();
		};
		
		p._update = function() {
			//console.log("WEBLAB.utils.animation.DomElementInDomTween::_update");
			if(this._isInDom) {
				if(this._element !== null && this._element.parentNode !== this._parentElement) {
					this._parentElement.appendChild(this._element);
				}
			}
			else {
				if(this._element !== null && this._element.parentNode !== null) {
					this._element.parentNode.removeChild(this._element);
				}
			}
		};

		p.stop = function() {
			this._timedCommands.clearAllCommandsByType(DomElementInDomTween.INTERNAL_CHANGE_STATE);
		};
		
		p._changeState = function(aEvent) {
			this._isInDom = aEvent.detail;
			this._update();
		};
		
		p.destroy = function() {
			this._element = null;
			this._parentElement = null;
			this._changeStateCallback = null;
			if(this._timedCommands !== null) {
				this._timedCommands.destroy();
				this._timedCommands = null;
			}
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		DomElementInDomTween.create = function(aElement, aParentElement, aStartInDom) {
			var newDomElementInDomTween = new DomElementInDomTween();
			newDomElementInDomTween.setElement(aElement, aParentElement);
			newDomElementInDomTween.setStartInDom(aStartInDom);
			return newDomElementInDomTween;
		};
	}
})();
