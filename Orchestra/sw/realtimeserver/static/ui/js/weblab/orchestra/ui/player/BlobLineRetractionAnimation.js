/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player");
	
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	
	if(namespace.BlobLineRetractionAnimation === undefined) {
		
		var BlobLineRetractionAnimation = function BlobLineRetractionAnimation() {
			this._init();
		};
		
		namespace.BlobLineRetractionAnimation = BlobLineRetractionAnimation;
		
		BlobLineRetractionAnimation.TRACKING_ENVELOPE = 0.1;
		
		/*
		BlobLineRetractionAnimation.IMPACT_FORCE = 200;
		*/
		//BlobLineRetractionAnimation.IMPACT_FORCE = 200;
		//BlobLineRetractionAnimation.IMPACT_FORCE = 149;
		BlobLineRetractionAnimation.IMPACT_FORCE = 149;
		
		var p = BlobLineRetractionAnimation.prototype;
		
		p._init = function() {
			
			this.line = null;
			this._removeWhenDone = true;
			this._speedX = 0;
			this._speedY = 0;
			
			return this;
		};
		
		p.setup = function(aLine, aRemoveWhenDone) {
			
			this.line = aLine;
			this._removeWhenDone = aRemoveWhenDone;
			
			return this;
		};
		
		p.updateTime = function(aTimeParameter, aTimeDifference) {
			//console.log("WEBLAB.orchestra.ui.player.BlobLineRetractionAnimation::updateTime");
			
			this._speedX += BlobLineRetractionAnimation.TRACKING_ENVELOPE*(this.line.circle1.position.x-this.line.circle2.position.x);
			this._speedY += BlobLineRetractionAnimation.TRACKING_ENVELOPE*(this.line.circle1.position.y-this.line.circle2.position.y);
			
			if(Math.abs(this._speedX) > Math.abs(this.line.circle1.position.x-this.line.circle2.position.x) || Math.abs(this._speedY) > Math.abs(this.line.circle1.position.y-this.line.circle2.position.y)) {
				this.line.circle2.position.x = this.line.circle1.position.x;
				this.line.circle2.position.y = this.line.circle1.position.y;
				
				var impactAngle = Math.atan2(-1*this._speedY, -1*this._speedX);
				this.line.circle1.impact(impactAngle, -1*BlobLineRetractionAnimation.IMPACT_FORCE);
				
				return false;
			}
			
			this.line.circle2.originalPosition.x += this._speedX;
			this.line.circle2.originalPosition.y += this._speedY;
			
			return true;
		}
		
		p.destroy = function() {
			
			this.line = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		BlobLineRetractionAnimation.create = function(aLine, aRemoveWhenDone) {
			var newBlobLineRetractionAnimation = new BlobLineRetractionAnimation();
			newBlobLineRetractionAnimation.setup(aLine, aRemoveWhenDone);
			return newBlobLineRetractionAnimation;
		};
	}
})();