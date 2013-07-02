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
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.video");
	
	if(namespace.FixedLengthTimeCodeAdjust === undefined) {
		
		var FixedLengthTimeCodeAdjust = function FixedLengthTimeCodeAdjust() {
			this._init();
		};
		
		namespace.FixedLengthTimeCodeAdjust = FixedLengthTimeCodeAdjust;
		
		var p = FixedLengthTimeCodeAdjust.prototype;
		
		p._init = function() {
			
			this._maxDiff = 20;
			this._frameLength = 31;
			this._timeAdjustment = -700;
			
			this._lastTime = -1;
			this._lastAdjustedTime = -1;
			this._minTime = -1;
			
			return this;
		};
		
		p._timeIsInDiffRange = function(aTime, aLastTime, aMaxDiff) {
			return (aTime-aLastTime <= aMaxDiff);
		};
		
		p.updateTime = function(aTime) {
			//console.log("WEBLAB.orchestra.ui.video.FixedLengthTimeCodeAdjust::updateTime");
			
			aTime += this._timeAdjustment;
			
			if(this._lastTime && this._lastAdjustedTime && this._timeIsInDiffRange(aTime, this._lastTime, this._maxDiff)) {
				this._lastAdjustedTime += this._frameLength;
			}
			else {
				this._lastAdjustedTime = aTime;
				this._lastTime = aTime;
			}
			
			this._minTime = Math.max(this._minTime, this._lastAdjustedTime);
			
			return this._minTime;
		};
		
		p.getTime = function() {
			//console.log("WEBLAB.orchestra.ui.video.FixedLengthTimeCodeAdjust::getTime");
			
			return this._minTime;
		};
		
		
		p.destroy = function() {
			
			
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		FixedLengthTimeCodeAdjust.create = function() {
			var newFixedLengthTimeCodeAdjust = new FixedLengthTimeCodeAdjust();
			return newFixedLengthTimeCodeAdjust;
		};
	}
})();