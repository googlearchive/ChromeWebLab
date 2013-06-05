/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player");
	
	var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;
	
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	
	if(namespace.BlobLine === undefined) {
		
		var BlobLine = function BlobLine() {
			this._init();
		};
		
		namespace.BlobLine = BlobLine;
		
		BlobLine.DAMPING = 0.2;
		BlobLine.TRACKING_ENVELOPE = 6;
		
		var p = BlobLine.prototype;
		
		p._init = function() {
			
			this.circle1 = null;
			this.circle2 = null;
			
			this.centerPoint = Point.create();
			this.centerPointSpeed = Point.create();
			
			return this;
		};
		
		p.setup = function(aCircle1, aCircle2) {
			
			this.circle1 = aCircle1;
			this.circle2 = aCircle2;
			
			this.centerPoint.x = 0.5*(this.circle1.position.x+this.circle2.position.x);
			this.centerPoint.y = 0.5*(this.circle1.position.y+this.circle2.position.y);
			
			return this;
		};
		
		p.updateTime = function(aTimeParameter, aTimeDifference) {
			//console.log("WEBLAB.orchestra.ui.player.BlobLine::updateTime");
			
			var centerX = 0.5*(this.circle1.position.x+this.circle2.position.x);
			var centerY = 0.5*(this.circle1.position.y+this.circle2.position.y);
			
			var centerPointDistance = Math.sqrt(Math.pow(this.centerPoint.x-centerX, 2)+Math.pow(this.centerPoint.y-centerY, 2));
			var angle = Math.atan2(centerY-this.centerPoint.y, centerX-this.centerPoint.x);
			
			var newSpeedX = (1-BlobLine.DAMPING)*(BlobLine.TRACKING_ENVELOPE*centerPointDistance*Math.cos(angle)+this.centerPointSpeed.x);
			var newSpeedY = (1-BlobLine.DAMPING)*(BlobLine.TRACKING_ENVELOPE*centerPointDistance*Math.sin(angle)+this.centerPointSpeed.y);
			
			this.centerPoint.x += newSpeedX*aTimeDifference;
			this.centerPoint.y += newSpeedY*aTimeDifference;
			
			this.centerPointSpeed.x = newSpeedX;
			this.centerPointSpeed.y = newSpeedY;
		}
		
		p.destroy = function() {
			
			this.circle1 = null;
			this.circle2 = null;
			
			this.centerPoint = null;
			this.centerPointSpeed = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		BlobLine.create = function(aCircle1, aCircle2) {
			var newBlobLine = new BlobLine();
			newBlobLine.setup(aCircle1, aCircle2);
			return newBlobLine;
		};
	}
})();