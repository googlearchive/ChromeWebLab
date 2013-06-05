/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
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