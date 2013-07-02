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
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items");
	
	var ClockGraphics = namespace.ClockGraphics;
	
	var ColorBlender = WEBLAB.namespace("WEBLAB.utils.math").ColorBlender;
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var NumberFunctions = WEBLAB.namespace("WEBLAB.utils.data").NumberFunctions;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if(namespace.CountdownClock === undefined) {
		
		var CountdownClock = function CountdownClock() {
			this._init();
		};
		
		namespace.CountdownClock = CountdownClock;
			
		var p = namespace.CountdownClock.prototype;
		
		p._init = function() {
			
			this._element = null;
			this._numberOfMinutesElement = null;
			this._numberOfSecondsElement = null;
			this._clockGraphics = null;
			
			this._totalTime = 0;
			this._startTime = 0;
			this._blinkBaseColor = null;
			this._blinkColor = null;
			this._blinkLength = 0;
			this._blinkInterval = 1;
			this._updateInterval = -1;
			this._updateTimeCallback = ListenerFunctions.createListenerFunction(this, this._updateTime);
			
			return this;
		};
		
		p.setElement = function(aElement) {
			//console.log("WEBLAB.orchestra.ui.page.items.CountdownClock::setElement");
			//console.log(aElement);
			
			this._element = aElement;
			
			this._numberOfMinutesElement = this._element.querySelector(".num-minutes");
			this._numberOfSecondsElement = this._element.querySelector(".num-seconds");
			
			this._clockGraphics = ClockGraphics.createWithoutSettings(this._element.querySelector(".clockGraphics"));
			
			return this;
		};
		
		p.setCountdownLength = function(aLength) {
			this._totalTime = aLength;
			this._clockGraphics.setCountdownLength(this._totalTime);
		};
		
		p.adjustCountdownLength = function(aLength) {
			//console.log("WEBLAB.orchestra.ui.page.items.CountdownClock::adjustCountdownLength");
			this._totalTime = aLength;
			this._clockGraphics.setCountdownLength(this._totalTime);
			this._startTime = 0.001*Date.now();
			this._updateTime();
		};
		
		p.setupBlink = function(aBlinkBaseColor, aBlinkColor, aBlinkLength, aBlinkInterval) {
			this._blinkBaseColor = aBlinkBaseColor;
			this._blinkColor = aBlinkColor;
			this._blinkLength = aBlinkLength;
			this._blinkInterval = aBlinkInterval;
		};
		
		p.getElement = function() {
			return this._element;
		};
		
		p.getClockGraphics = function() {
			return this._clockGraphics;
		};
		
		p.start = function() {
			this._startTime = 0.001*Date.now();
			this._clockGraphics.updateCanvasSize();
			this._updateTime();
			this._updateInterval = setInterval(this._updateTimeCallback, 0.1*1000);
		};
		
		p.continueCountdown = function() {
			if(this._updateInterval === -1) {
				this._updateInterval = setInterval(this._updateTimeCallback, 0.1*1000);
			}
		}
		
		p.stop = function() {
			if(this._updateInterval !== -1) {
				clearInterval(this._updateInterval);
				this._updateInterval = -1;
			}
		}
		
		p._updateTime = function() {
			//console.log("WEBLAB.orchestra.ui.page.items.CountdownClock::_updateTime");
			
			var currentTime = 0.001*Date.now();
			
			var timeLeft = Math.max(0, this._totalTime-(currentTime-this._startTime));
			
			var minutesLeft = Math.floor(timeLeft/60);
			var secondsLeft = Math.floor(timeLeft-(minutesLeft*60));
			
			if(this._numberOfMinutesElement !== null) {
				this._numberOfMinutesElement.innerHTML = NumberFunctions.getPaddedNumber(minutesLeft, 2);
			}
			this._numberOfSecondsElement.innerHTML = NumberFunctions.getPaddedNumber(secondsLeft, 2);
			
			if(timeLeft < this._blinkLength) {
				var blinkPosition = (this._blinkLength-timeLeft);
				var frequency = (this._blinkInterval);
				var times = Math.floor(blinkPosition/frequency);
				var blinkParameter = (1-(2*Math.abs(0.5-(blinkPosition-frequency*times)/frequency)));
				
				blinkParameter = 0.5*blinkParameter+0.5*Math.pow(blinkParameter, 2);
				
				var currentColor = ColorBlender.getBlendedHexColor(blinkParameter, this._blinkBaseColor, this._blinkColor);
				this._element.style.setProperty("color", currentColor, "!important");
				if(this._numberOfMinutesElement !== null) {
					this._numberOfMinutesElement.style.setProperty("color", currentColor, "!important");
				}
				this._numberOfSecondsElement.style.setProperty("color", currentColor, "!important");
				this._clockGraphics.setColor(currentColor);
			}
			
			if(this._clockGraphics.getElement().width === 0) {
				this._clockGraphics.updateCanvasSize();
			}
			this._clockGraphics.updateTime(timeLeft);
		};
		
		p.showUninitializedTime = function() {
			
			this._clockGraphics.updateCanvasSize();
			this._clockGraphics.updateTime(this._clockGraphics.getTotalTime());
			
			if(this._numberOfMinutesElement !== null) {
				this._numberOfMinutesElement.innerHTML = "--";
			}
			this._numberOfSecondsElement.innerHTML = "--";
		},
		
		p.destroy = function() {
			this._element = null;
			this._numberOfMinutesElement = null;
			this._numberOfSecondsElement = null;
			
			Utils.destroyIfExists(this._clockGraphics);
			this._clockGraphics = null;
			
			if(this._updateInterval !== -1) {
				clearInterval(this._updateInterval);
				this._updateInterval = -1;
			}
			this._updateTimeCallback = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		CountdownClock.create = function(aElement) {
			var newCountdownClock = new CountdownClock();
			newCountdownClock.setElement(aElement);
			return newCountdownClock;
		};
	}
})();