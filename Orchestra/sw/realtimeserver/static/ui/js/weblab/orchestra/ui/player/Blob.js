/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player");
	
	var BlobCircle = namespace.BlobCircle;
	var BlobLine = namespace.BlobLine;
	var BlobLineRetractionAnimation = namespace.BlobLineRetractionAnimation;
	
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var OrchestraGradients = WEBLAB.namespace("WEBLAB.common.constants").OrchestraGradients;
	var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if(namespace.Blob === undefined) {
		
		var Blob = function Blob() {
			this._init();
		};
		
		namespace.Blob = Blob;
		
		/*
		Blob.DRAG_IMPACT_FORCE = 200;
		*/
		//Blob.DRAG_IMPACT_FORCE = 200;
		//Blob.DRAG_IMPACT_FORCE = 149;
		Blob.DRAG_IMPACT_FORCE = 149;
		
		var p = Blob.prototype = new EventDispatcher();
		
		p._init = function() {
			
			this.isRemoved = false;
			this.isInteractive = false;
			this.id = -1;
			this._instrumentId = -1;
			this.position = -1;
			this.pitch = -1;
			this.finalPosition = -1;
			this.finalPitch = -1;
			this._smallSize = 0;
			this._fullSize = 0;
			this.overEnvelope = 0;
			this._overEnvelopeTween = new TWEEN.Tween(this);
			this.alpha = 1;
			this.tint = false;
			this._alphaTween = new TWEEN.Tween(this);
			this._horizontalDistance = 30;
			this._verticalDistance = 30;
			this._margin = 0;
			
			this._circles = new Array();
			this._lines = new Array();
			this._playingCircle = null;
			
			this._dragCircle = null;
			this._dragLine = null;
			
			this._tempPoint = Point.create();
			this._tempPointPrevious = Point.create();
			this._tempPointNext = Point.create();
			this._tempPointPreviousVector = Point.create();
			this._tempPointNextVector = Point.create();
			this._tempPointPreviousVectorPosition = Point.create();
			this._tempPointNextVectorPosition = Point.create();
			
			this._lastTime = 0.001*(new Date()).valueOf();
			
			this._retractionAnimations = new Array();
			
			return this;
		};
		
		p.setup = function(aIntrumentId, aId, aRadius, aFullSize, aPositionX, aPositionY, aPosition, aPitch) {
			
			this.id = aId;
			this._instrumentId = aIntrumentId;
			
			this.position = aPosition;
			this.pitch = aPitch;
			this.finalPosition = aPosition;
			this.finalPitch = aPitch;
			
			this._smallSize = aRadius;
			this._fullSize = aFullSize;
			
			this.createCircle(aRadius, aPositionX, aPositionY, aPosition, aPitch);
			
			return this;
		};
		
		p.setSpacing = function(aHorizontalSpacing, aVerticalSpacing, aMargin) {
			this._horizontalDistance = aHorizontalSpacing;
			this._verticalDistance = aVerticalSpacing;
			this._margin = aMargin;
		};
		
		p.getInstrumentId = function() {
			return this._instrumentId;
		};
		
		p.createCircle = function(aRadius, aPositionX, aPositionY, aPosition, aPitch) {
			var newCircle = BlobCircle.create(aRadius, aPositionX, aPositionY, aPosition, aPitch);
			this._circles.push(newCircle);
			return newCircle;
		};
		
		p.updateTime = function(aTimeParameter) {
			//console.log("WEBLAB.orchestra.ui.player.Blob::updateTime");
			
			var currentTime = 0.001*(new Date()).valueOf();
			var timeDifference = Math.min(0.1, currentTime-this._lastTime);
			
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentCircle = currentArray[i];
				currentCircle.updateTime(aTimeParameter, timeDifference);
			}
			
			var currentArray = this._lines;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentLine = currentArray[i];
				currentLine.updateTime(aTimeParameter, timeDifference);
			}
			
			if(this._dragCircle != null) {
				this._dragCircle.updateTime(aTimeParameter, timeDifference);
			}
			
			var currentArray = this._retractionAnimations;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentAnimation = currentArray[i];
				var retsult = currentAnimation.updateTime(aTimeParameter, timeDifference);
				
				if(retsult) {
					currentAnimation.line.circle2.updateTime(aTimeParameter, timeDifference);
					
					currentAnimation.line.updateTime(aTimeParameter, timeDifference);
					
				}
				else {
					
					if(this._dragLine !== null && currentAnimation.line.circle2 === this._dragLine.circle1) {
						this._dragLine.circle1 = currentAnimation.line.circle1;
					}
					
					currentArray.splice(i, 1);
					i--;
					currentArrayLength--;
				}
			}
			
			if(this._dragLine != null) {
				this._dragLine.updateTime(aTimeParameter, timeDifference);
			}
			
			this._lastTime = currentTime;
		}
		
		p.drawGraphics = function(aContext) {
			
			aContext.globalAlpha = this.alpha;
			
			var firstCircle = this._circles[0];
			
			var gradientMinY = firstCircle.position.y-this._fullSize;
			var gradientMaxY = firstCircle.position.y+this._fullSize;
			
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 1; i < currentArrayLength; i++) { //MENOTE: skip first position
				gradientMinY = Math.min(gradientMinY, currentArray[i].position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, currentArray[i].position.y+this._fullSize);
			}
			if(this._dragCircle != null) {
				gradientMinY = Math.min(gradientMinY, this._dragCircle.position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, this._dragCircle.position.y+this._fullSize);
			}
			var currentArray = this._retractionAnimations;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentAnimation = currentArray[i];
				gradientMinY = Math.min(gradientMinY, currentAnimation.line.circle1.position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, currentAnimation.line.circle1.position.y+this._fullSize);
				gradientMinY = Math.min(gradientMinY, currentAnimation.line.circle2.position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, currentAnimation.line.circle2.position.y+this._fullSize);
			}
			
			var newGradient = aContext.createLinearGradient(0, gradientMinY, 0, gradientMaxY);
			var colorPosition = OrchestraGradients.INSTRUMENT_MAPPING[this._instrumentId];
			
			var colorStop0, colorStop1;
			if (!this.tint) {
				colorStop0 = OrchestraGradients.TOP_CSS_VALUES[colorPosition];
				colorStop1 = OrchestraGradients.BOTTOM_CSS_VALUES[colorPosition];
			}
			else {
				colorStop0 = OrchestraGradients.TOP_CSS_VALUES_TINTED[colorPosition];
				colorStop1 = OrchestraGradients.BOTTOM_CSS_VALUES_TINTED[colorPosition];
			}

			newGradient.addColorStop(0, colorStop0);
			newGradient.addColorStop(1, colorStop1);
			
			aContext.fillStyle = newGradient;
			
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				this._drawCircle(currentArray[i], aContext);
			}
			
			var currentArray = this._lines;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				this._drawLine(currentArray[i], aContext);
			}
			
			if(this._dragCircle !== null) {
				this._drawCircle(this._dragCircle, aContext);
			}
			
			var currentArray = this._retractionAnimations;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentAnimation = currentArray[i];
				this._drawCircle(currentAnimation.line.circle2, aContext);
				this._drawLine(currentAnimation.line, aContext);
			}
			
			if(this._dragLine !== null) {
				this._drawLine(this._dragLine, aContext);
			}
		};
		
		p.drawOverGraphics = function(aContext) {
			var firstCircle = this._circles[0];
			
			var gradientMinY = firstCircle.position.y-this._fullSize;
			var gradientMaxY = firstCircle.position.y+this._fullSize;
			
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 1; i < currentArrayLength; i++) { //MENOTE: skip first position
				gradientMinY = Math.min(gradientMinY, currentArray[i].position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, currentArray[i].position.y+this._fullSize);
			}
			if(this._dragCircle != null) {
				gradientMinY = Math.min(gradientMinY, this._dragCircle.position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, this._dragCircle.position.y+this._fullSize);
			}
			var currentArray = this._retractionAnimations;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentAnimation = currentArray[i];
				gradientMinY = Math.min(gradientMinY, currentAnimation.line.circle1.position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, currentAnimation.line.circle1.position.y+this._fullSize);
				gradientMinY = Math.min(gradientMinY, currentAnimation.line.circle2.position.y-this._fullSize);
				gradientMaxY = Math.max(gradientMaxY, currentAnimation.line.circle2.position.y+this._fullSize);
			}
			
			var newGradient = aContext.createLinearGradient(0, gradientMinY, 0, gradientMaxY);
			var colorPosition = OrchestraGradients.INSTRUMENT_MAPPING[this._instrumentId];

			var colorStop0, colorStop1;
			if (!this.tint) {
				colorStop0 = OrchestraGradients.TOP_CSS_VALUES[colorPosition];
				colorStop1 = OrchestraGradients.BOTTOM_CSS_VALUES[colorPosition];
			}
			else {
				colorStop0 = OrchestraGradients.TOP_CSS_VALUES_TINTED[colorPosition];
				colorStop1 = OrchestraGradients.BOTTOM_CSS_VALUES_TINTED[colorPosition];
			}
			
			newGradient.addColorStop(0, colorStop0);
			newGradient.addColorStop(1, colorStop1);
			
			aContext.fillStyle = newGradient;
			
			if(this._dragLine !== null) {
				this._drawCircle(this._dragLine.circle1, aContext);
				this._drawLine(this._dragLine, aContext);
				this._drawCircle(this._dragLine.circle2, aContext);
			}
			else if(this._lines.length > 0) {
				var currentLine = this._lines[this._lines.length-1];
				this._drawCircle(currentLine.circle1, aContext);
				this._drawLine(currentLine, aContext);
				this._drawCircle(currentLine.circle2, aContext);
			}
			else if(this._retractionAnimations.length > 0) {
				var currentLine = this._retractionAnimations[this._retractionAnimations.length-1].line;
				this._drawCircle(currentLine.circle1, aContext);
				this._drawLine(currentLine, aContext);
				this._drawCircle(currentLine.circle2, aContext);
			}
			else if(this._circles.length > 0) {
				this._drawCircle(this._circles[this._circles.length-1], aContext);
			}
		};

		// p._tintGradient = function(aGradientString, aAmount) {

		// 	var components = aGradientString.split(",");
		// 	var rComponent = parseInt(components[0].substr(4));
		// 	var gComponent = parseInt(components[1]);
		// 	var bComponent = parseInt(components[2]);




		// 	rComponent *= aAmount;
		// 	gComponent *= aAmount;
		// 	bComponent *= aAmount;

		// 	return "rgb(" + parseInt(rComponent) + "," + parseInt(gComponent) + "," + parseInt(bComponent) + ")";
		// };

		// p._rgbToHsl = function(r, g, b){

		//     r /= 255, g /= 255, b /= 255;
		//     var max = Math.max(r, g, b), min = Math.min(r, g, b);
		//     var h, s, l = (max + min) / 2;

		//     if(max == min){
		//         h = s = 0; // achromatic
		//     }else{
		//         var d = max - min;
		//         s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		//         switch(max){
		//             case r: h = (g - b) / d + (g < b ? 6 : 0); break;
		//             case g: h = (b - r) / d + 2; break;
		//             case b: h = (r - g) / d + 4; break;
		//         }
		//         h /= 6;
		//     }

		//     return [h, s, l];
		// }
		
		p._drawCircle = function(aCircle, aContext) {
			var currentCircle = aCircle;
				
			var centerX =currentCircle.position.x;
			var centerY =currentCircle.position.y;
			
			var parameter = 2*Math.PI*((-2)/BlobCircle.NUMBER_OF_POINTS);
			this._tempPointPrevious.x = centerX+Math.cos(parameter)*currentCircle.points[BlobCircle.NUMBER_OF_POINTS-2];
			this._tempPointPrevious.y = centerY+Math.sin(parameter)*currentCircle.points[BlobCircle.NUMBER_OF_POINTS-2];
			
			var parameter = 2*Math.PI*((-1)/BlobCircle.NUMBER_OF_POINTS);
			this._tempPoint.x = centerX+Math.cos(parameter)*currentCircle.points[BlobCircle.NUMBER_OF_POINTS-1];
			this._tempPoint.y = centerY+Math.sin(parameter)*currentCircle.points[BlobCircle.NUMBER_OF_POINTS-1];
			
			this._tempPointNext.x = centerX+currentCircle.points[0];
			this._tempPointNext.y = centerY;
			
			this._getTangentAtPoint(this._tempPointPrevious, this._tempPointNext, this._tempPointNextVector);
			
			var currentArray2 = currentCircle.points;
			var currentArray2Length = currentArray2.length;
			
			aContext.beginPath();
			aContext.moveTo(this._tempPoint.x, this._tempPoint.y);
			
			for(var j = 0; j <= currentArray2Length; j++) {
				
				this._tempPointPrevious.x = this._tempPoint.x;
				this._tempPointPrevious.y = this._tempPoint.y;
				this._tempPoint.x = this._tempPointNext.x;
				this._tempPoint.y = this._tempPointNext.y;
				
				this._tempPointPreviousVector.x = -1*this._tempPointNextVector.x;
				this._tempPointPreviousVector.y = -1*this._tempPointNextVector.y;
				
				var nextPoint = currentArray2[(j+1)%BlobCircle.NUMBER_OF_POINTS];
				var parameter = 2*Math.PI*((j+1)/BlobCircle.NUMBER_OF_POINTS);
				
				this._getPointPosition(centerX, centerY, parameter, nextPoint, this._tempPointNext);
				
				this._getTangentAtPoint(this._tempPointPrevious, this._tempPointNext, this._tempPointNextVector);
				
				this._tempPointPreviousVectorPosition.x = this._tempPointPrevious.x+this._tempPointPreviousVector.x;
				this._tempPointPreviousVectorPosition.y = this._tempPointPrevious.y+this._tempPointPreviousVector.y;
				this._tempPointNextVectorPosition.x = this._tempPoint.x+this._tempPointNextVector.x;
				this._tempPointNextVectorPosition.y = this._tempPoint.y+this._tempPointNextVector.y;
				
				aContext.bezierCurveTo(this._tempPointPreviousVectorPosition.x, this._tempPointPreviousVectorPosition.y, this._tempPointNextVectorPosition.x, this._tempPointNextVectorPosition.y, this._tempPoint.x, this._tempPoint.y);
				
			}
			
			aContext.closePath();
			aContext.fill();
		};
		
		p._drawLine = function(aLine, aContext) {
			
			var inAngle1 = Math.atan2(aLine.centerPoint.y-aLine.circle1.position.y, aLine.centerPoint.x-aLine.circle1.position.x);
			var inAngle2 = Math.atan2(aLine.centerPoint.y-aLine.circle2.position.y, aLine.centerPoint.x-aLine.circle2.position.x);
			
			var connectionAngle = (45/360)*2*Math.PI;
			
			aLine.circle1.getPoint(inAngle1+connectionAngle, this._tempPointPrevious);
			aLine.circle2.getPoint(inAngle2-connectionAngle, this._tempPointNext);
			
			this._tempPoint.x = aLine.centerPoint.x;
			this._tempPoint.y = aLine.centerPoint.y;
			
			aContext.beginPath();
			aContext.moveTo(aLine.circle1.position.x, aLine.circle1.position.y);
			aContext.lineTo(this._tempPointPrevious.x, this._tempPointPrevious.y);
			aContext.quadraticCurveTo(this._tempPoint.x, this._tempPoint.y, this._tempPointNext.x, this._tempPointNext.y);
			
			aLine.circle2.getPoint(inAngle2+connectionAngle, this._tempPointPrevious);
			aLine.circle1.getPoint(inAngle1-connectionAngle, this._tempPointNext);
			
			aContext.lineTo(aLine.circle2.position.x, aLine.circle2.position.y);
			aContext.lineTo(this._tempPointPrevious.x, this._tempPointPrevious.y);
			aContext.quadraticCurveTo(this._tempPoint.x, this._tempPoint.y, this._tempPointNext.x, this._tempPointNext.y);
			aContext.lineTo(aLine.circle1.position.x, aLine.circle1.position.y);
			aContext.closePath();
			aContext.fill();
		};
		
		p.updateBeat = function(aPosition) {
			//console.log("WEBLAB.orchestra.ui.player.Blob::updateBeat");
			//console.log(aPosition);
			
			if(this._playingCircle !== null) {
				return this._playingCircle.updateBeat(aPosition);
			}
			return false;
			
			/*
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentCircle = currentArray[i];
				currentCircle.updateBeat(aPosition);
			}
			*/
		};
		
		p.getPlayingPitch = function() {
			return this._playingCircle.getPitch();
		};
		
		p._getPointPosition = function(aX, aY, aParameter, aLength, aReturnPoint) {
			aReturnPoint.x = aX+Math.cos(aParameter)*aLength;
			aReturnPoint.y = aY+Math.sin(aParameter)*aLength;
		};
		
		p._getTangentAtPoint = function(aPreviousPoint, aNextPoint, aReturnPoint) {
			
			aReturnPoint.x = -0.5*0.333*(aNextPoint.x-aPreviousPoint.x);
			aReturnPoint.y = -0.5*0.333*(aNextPoint.y-aPreviousPoint.y);
		};
		
		p.isAtPosition = function(aX, aY) {
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentCircle = currentArray[i];
				if(currentCircle.isAtPosition(aX, aY)) {
					return true;
				}
			}
			return false;
		};
		
		p.reactsAtPosition = function(aPosition, aPitch) {
			if(this._playingCircle != null) {
				if(this._playingCircle) {
					return this._playingCircle.reactsAtPosition(aPosition, aPitch);
				}
			}
			return false;
		};
		
		p.changeRotationOffset = function(aOffset, aRotationOffset) {
			this._playingCircle.changeRotationOffset(aOffset, aRotationOffset);
		};
		
		p.startDragging = function(aX, aY, aCenterX, aCenterY) {
			//console.log("WEBLAB.orchestra.ui.player.Blob::startDragging");
			var startCircle = null;
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentCircle = currentArray[i];
				if(currentCircle.isAtPosition(aCenterX, aCenterY)) {
					startCircle = currentCircle;
					break;
				}
			}
			
			var newCircle = BlobCircle.create(0.5*this._fullSize, aX, aY, -1, -1);
			newCircle.fixToRadius();
			var newLine = BlobLine.create(startCircle, newCircle);
			
			var impactAngle = Math.atan2((aY-startCircle.position.y), (aX-startCircle.position.x));
			startCircle.impact(impactAngle, Blob.DRAG_IMPACT_FORCE);
			
			this._dragCircle = newCircle;
			this._dragLine = newLine;
			
			this._overEnvelopeTween.to({"overEnvelope": 1}, 1000*0.3).easing(TWEEN.Easing.Quadratic.EaseOut).start();
		};
		
		p.updateDragging = function(aX, aY) {
			//console.log("WEBLAB.orchestra.ui.player.Blob::updateDragging");
			if (!this._dragCircle) return;			
			this._dragCircle.originalPosition.x = aX;
			this._dragCircle.originalPosition.y = aY;
		};
		
		p.releaseDragging = function() {
			var newRetractionAnimation = BlobLineRetractionAnimation.create(this._dragLine);
			this._retractionAnimations.push(newRetractionAnimation);
			
			this._dragCircle = null;
			this._dragLine = null;
			this._overEnvelopeTween.to({"overEnvelope": 0}, 1000*0.3).easing(TWEEN.Easing.Quadratic.EaseOut).start();
		};
		
		p.releaseDraggingWithoutSnap = function() {
			this._dragCircle = null;
			this._dragLine = null;
			this._overEnvelopeTween.to({"overEnvelope": 0}, 1000*0.3).easing(TWEEN.Easing.Quadratic.EaseOut).start();
		};
		
		p.fixDragging = function(aPositionX, aPositionY, aPosition, aPitch) {
			
			var lastCircle = this._circles[this._circles.length-1];
			if(this._dragLine.circle1 == lastCircle) {
				
				new TWEEN.Tween(this._dragCircle.originalPosition).to({"x": aPositionX, "y": aPositionY}, 100).easing(TWEEN.Easing.Quadratic.EaseOut).start();
				
				this._dragCircle.setPositionAndPitch(aPosition, aPitch);
				
				this._circles.push(this._dragCircle);
				this._lines.push(this._dragLine);
				
				this._dragCircle = null;
				this._dragLine = null;
			}
			else {
				
				var newCircle = this.createCircle(0.5*this._fullSize, lastCircle.position.x, lastCircle.position.y, aPosition, aPitch);
				newCircle.fixToRadius();
				var newLine = BlobLine.create(lastCircle, newCircle);
				this._lines.push(newLine);
				
				new TWEEN.Tween(newCircle.originalPosition).to({"x": aPositionX, "y": aPositionY}, 300).easing(TWEEN.Easing.Quadratic.EaseOut).start();
				
				this.releaseDragging();
			}
			
			this.finalPosition = aPosition;
			this.finalPitch = aPitch;
			this._overEnvelopeTween.to({"overEnvelope": 0}, 1000*0.3).easing(TWEEN.Easing.Quadratic.EaseOut).start();
		};
		
		p.isDraggedFrom = function(aPosition, aPitch) {
			if(this._dragLine !== null) {
				return this._dragLine.circle1.reactsAtPosition(aPosition, aPitch);
			}
			return false;
		};
		
		p.addNote = function() {
			this._playingCircle = this._circles[0];
		};
		
		p.changeNote = function(aPosition, aPitch) {
			
			this.position = aPosition;
			this.pitch = aPitch;
			
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 1; i < currentArrayLength; i++) {
				var currentCircle = currentArray[i];
				var lastCircle = currentArray[i-1];
				var lastLine = this._lines[0];
				
				lastLine.circle1 = currentCircle;
				lastLine.circle2 = lastCircle;
				
				var newRetractionAnimation = BlobLineRetractionAnimation.create(lastLine);
				this._retractionAnimations.push(newRetractionAnimation);
				
				if(!currentCircle.hasAnimatedChange) {
					lastCircle.animateRadius(0.5*this._fullSize, 0.2, TWEEN.Easing.Quadratic.EaseIn);
					currentCircle.animateRadius(this._fullSize, 0.2, TWEEN.Easing.Quadratic.EaseOut);
				};
				
				currentArray.shift();
				this._lines.shift();
				
				i--;
				currentArrayLength--;
				if(currentCircle.reactsAtPosition(aPosition, aPitch)) {
					this._playingCircle = currentCircle;
					this._hasAnimatedChange = false;
					return;
				}
			}
			
			var lastCircle = currentArray.shift();
			
			var centerPositionX = ((aPosition+0.5)*this._horizontalDistance)+this._margin;
			var centerPositionY = ((aPitch+0.5)*this._verticalDistance)+this._margin;
			
			var newCircle = this.createCircle(this._fullSize, 0.3*centerPositionX+0.7*lastCircle.position.x, 0.3*centerPositionY+0.7*lastCircle.position.y, aPosition, aPitch);
			newCircle.fixToRadius();
			var newLine = BlobLine.create(newCircle, lastCircle);
			//this._lines.push(newLine);
			
			new TWEEN.Tween(newCircle.originalPosition).to({"x": centerPositionX, "y": centerPositionY}, 0.3*1000).easing(TWEEN.Easing.Quadratic.EaseOut).start();
			
			var newRetractionAnimation = BlobLineRetractionAnimation.create(newLine);
			this._retractionAnimations.push(newRetractionAnimation);
			
			this.finalPosition = aPosition;
			this.finalPitch = aPitch;
			
			this._playingCircle = newCircle;
			this._hasAnimatedChange = true;
		};
		
		p.removeNote = function() {
			this._playingCircle = null;
		};
		
		p.prepareAddNote = function() {
			//METODO
		};
		
		p.prepareChangeNote = function(aPosition, aPitch) {
			//METODO
		};
		
		p.prepareRemoveNote = function() {
			this.isInteractive = false;
			this.isRemoved = true;
			
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				var currentCircle = currentArray[i];
				
				currentCircle.animateRadius(0.25*this._fullSize, 0.2, TWEEN.Easing.Quadratic.EaseOut);
				currentCircle.hasAnimatedChange = true;
			}
		};
		
		p.animateAddNote = function(aPosition, aPitch, aAnimationTime) {
			this._circles[0].animateRadius(this._fullSize, aAnimationTime, TWEEN.Easing.Quadratic.EaseOut);
			this._circles[0].hasAnimatedChange = true;
		};
		
		p.animateChangeNote = function(aPosition, aPitch, aAnimationTime) {
			//console.log("WEBLAB.orchestra.ui.player.Blob::animateChangeNote");
			//console.log(aPosition, aPitch, aAnimationTime);
			
			var currentArray = this._circles;
			var currentArrayLength = currentArray.length;
			for(var i = 1; i < currentArrayLength; i++) {
				var currentCircle = currentArray[i];
				var lastCircle = currentArray[i-1];
				
				if(currentCircle.reactsAtPosition(aPosition, aPitch)) {
					
					lastCircle.animateRadius(0.5*this._fullSize, aAnimationTime, TWEEN.Easing.Quadratic.EaseIn);
					currentCircle.animateRadius(this._fullSize, aAnimationTime, TWEEN.Easing.Quadratic.EaseOut);
					currentCircle.hasAnimatedChange = true;
					
					return;
				}
			}
		};
		
		p.animateRemoveNote = function(aAnimationTime) {
			//this._circles[this._circles.length-1].animateRadius(0, aAnimationTime, TWEEN.Easing.Quadratic.EaseIn);
		};
		
		p.setAsMuted = function() {
			this.alpha = 0.5;
		};
		
		p.mute = function() {
			this._alphaTween.to({alpha: 0.5}, 0.2*1000).easing(TWEEN.Easing.Quadratic.EaseOut).start();
		};
		
		p.unmute = function() {
			this._alphaTween.to({alpha: 1}, 0.2*1000).easing(TWEEN.Easing.Quadratic.EaseOut).start();
		};
		
		p.showAsBig = function(aAnimationTime) {
			this._circles[0].animateRadius(this._fullSize, aAnimationTime, TWEEN.Easing.Quadratic.EaseOut);
			this._circles[0].hasAnimatedChange = true;
		};
		
		p.showAsSmall = function(aAnimationTime) {
			this._circles[0].animateRadius(this._smallSize, aAnimationTime, TWEEN.Easing.Quadratic.EaseOut);
			this._circles[0].hasAnimatedChange = true;
		};
		
		p.destroy = function() {
			
			if(this._overEnvelopeTween !== null) {
				this._overEnvelopeTween.stop();
				this._overEnvelopeTween = null;
			}
			if(this._alphaTween !== null) {
				this._alphaTween.stop();
				this._alphaTween = null;
			}
			
			this._playingCircle = null;
			this._tempPoint = null;
			this._tempPointPrevious = null;
			this._tempPointNext = null;
			this._tempPointPreviousVector = null;
			this._tempPointNextVector = null;
			this._tempPointPreviousVectorPosition = null;
			this._tempPointNextVectorPosition = null;
			
			Utils.destroyArrayIfExists(this._circles);
			this._circles = null;
			Utils.destroyArrayIfExists(this._lines);
			this._lines = null;
			Utils.destroyArrayIfExists(this._retractionAnimations);
			this._retractionAnimations = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		Blob.create = function(aInstrumentId, aId, aRadius, aFullSize, aPositionX, aPositionY, aPosition, aPitch) {
			var newBlob = new Blob();
			newBlob.setup(aInstrumentId, aId, aRadius, aFullSize, aPositionX, aPositionY, aPosition, aPitch);
			return newBlob;
		};
	}
})();