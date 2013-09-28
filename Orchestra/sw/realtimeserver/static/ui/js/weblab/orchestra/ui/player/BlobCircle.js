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

(function() {

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player");

    var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.BlobCircle === undefined) {

        var BlobCircle = function BlobCircle() {
            this._init();
        };

        namespace.BlobCircle = BlobCircle;

        var p = BlobCircle.prototype;

        BlobCircle.NUMBER_OF_POINTS = 12;
        /*
		BlobCircle.DAMPING = 0.1;
		BlobCircle.TRACKING_FORCE_ENVELOPE = 2;
		BlobCircle.NEIGHBOR_FORCE_ENVELOPE = 4;
		
		BlobCircle.BEAT_FORCE = 40;
		BlobCircle.BEAT_FORCE_RANDOM = 30;
		*/
        //BlobCircle.DAMPING = 0.17;BlobCircle.TRACKING_FORCE_ENVELOPE = 4.1;BlobCircle.NEIGHBOR_FORCE_ENVELOPE = 2;BlobCircle.BEAT_FORCE = 75;BlobCircle.BEAT_FORCE_RANDOM = 0;
        //BlobCircle.DAMPING = 0.29000000000000004;BlobCircle.TRACKING_FORCE_ENVELOPE = 4.9;BlobCircle.NEIGHBOR_FORCE_ENVELOPE = 2;BlobCircle.BEAT_FORCE = 75;BlobCircle.BEAT_FORCE_RANDOM = 0;
        BlobCircle.DAMPING = 0.29;
        BlobCircle.TRACKING_FORCE_ENVELOPE = 4.3999999999999995;
        BlobCircle.NEIGHBOR_FORCE_ENVELOPE = 2.1;
        BlobCircle.BEAT_FORCE = 75;
        BlobCircle.BEAT_FORCE_RANDOM = 14;

        p._init = function() {

            this.originalPosition = Point.create();
            this.position = Point.create();
            this.hasAnimatedChange = false;

            this._radius = -1;
            this._centerOffset = 0;
            this._centerRotationOffset = 0;

            this.points = new Array(BlobCircle.NUMBER_OF_POINTS);
            this.trackingPoints = new Array(BlobCircle.NUMBER_OF_POINTS);
            this.pointSpeeds = new Array(BlobCircle.NUMBER_OF_POINTS);

            var currentArrayLength = BlobCircle.NUMBER_OF_POINTS;
            for (var i = 0; i < currentArrayLength; i++) {
                this.points[i] = 0;
                this.trackingPoints[i] = 0;
                this.pointSpeeds[i] = 0;
            }

            this._position = -1;
            this._pitch = -1;

            this._tempPoint = Point.create();
            this._tempPointPrevious = Point.create();
            this._tempPointNext = Point.create();
            this._tempPointNext2 = Point.create();
            this._tempPointPreviousVector = Point.create();
            this._tempPointNextVector = Point.create();

            this._radiusAnimation = {
                "radius": -1
            };
            this._radiusAnimationUpdateCallback = ListenerFunctions.createListenerFunction(this, this._radiusAnimationUpdate);
            this._radiusTween = new TWEEN.Tween(this._radiusAnimation);

            return this;
        };

        p.setup = function(aRadius, aPositionX, aPositionY, aPosition, aPitch) {
            //console.log("WEBLAB.orchestra.ui.player.BloblCircle::setup");
            //console.log(aRadius, aPositionX, aPositionY, aPosition, aPitch);

            this.originalPosition.x = aPositionX;
            this.originalPosition.y = aPositionY;

            this.position.x = aPositionX;
            this.position.y = aPositionY;
            this.setRadius(aRadius);
            this._radiusAnimation.radius = aRadius;

            this._position = aPosition;
            this._pitch = aPitch;

            return this;
        };

        p.getPitch = function() {
            return this._pitch;
        };

        p.setPositionAndPitch = function(aPosition, aPitch) {
            this._position = aPosition;
            this._pitch = aPitch;
        };

        p.setRadius = function(aRadius) {
            var currentArrayLength = BlobCircle.NUMBER_OF_POINTS;
            for (var i = 0; i < currentArrayLength; i++) {
                this.trackingPoints[i] = aRadius;
            }

            this._radius = aRadius;
        };

        p.fixToRadius = function() {
            var currentArrayLength = BlobCircle.NUMBER_OF_POINTS;
            for (var i = 0; i < currentArrayLength; i++) {
                this.points[i] = this.trackingPoints[i];
                this.pointSpeeds[i] = 0;
            }
        };

        p.adjustRadius = function(aRadius) {

            var difference = aRadius - this._radius;

            var currentArrayLength = BlobCircle.NUMBER_OF_POINTS;
            for (var i = 0; i < currentArrayLength; i++) {
                this.trackingPoints[i] = aRadius;
                this.points[i] += difference;
            }

            this._radius = aRadius;
        };

        p.updateTime = function(aTimeParameter, aTimeDifference) {
            //console.log("WEBLAB.orchestra.ui.player.BlobCircle::updateTime");

            var firstPoint = this.points[0];
            var lastPoint = this.points[BlobCircle.NUMBER_OF_POINTS - 1];
            var currentArrayLength = BlobCircle.NUMBER_OF_POINTS;
            for (var i = 0; i < currentArrayLength; i++) {

                var nextPoint = (i === BlobCircle.NUMBER_OF_POINTS - 1) ? firstPoint : this.points[(i + 1)];

                var trackingForce = this.trackingPoints[i] - this.points[i];
                var neighborForce = nextPoint + lastPoint - 2 * this.points[i];

                if (Math.abs(trackingForce) < 0.001) trackingForce = 0;
                if (Math.abs(neighborForce) < 0.001) neighborForce = 0;

                var newSpeed = (1 - BlobCircle.DAMPING) * (this.pointSpeeds[i] + BlobCircle.TRACKING_FORCE_ENVELOPE * trackingForce + BlobCircle.NEIGHBOR_FORCE_ENVELOPE * neighborForce);

                if (Math.abs(newSpeed) < 0.001) newSpeed = 0;

                lastPoint = this.points[i];

                this.pointSpeeds[i] = newSpeed;
                this.points[i] = Math.max(0, Math.min(2 * this._radius, this.points[i] + newSpeed * aTimeDifference));
            }

            this.position.x = this.originalPosition.x + this._centerOffset * Math.cos(2 * Math.PI * aTimeParameter + this._centerRotationOffset);
            this.position.y = this.originalPosition.y + this._centerOffset * Math.sin(2 * Math.PI * aTimeParameter + this._centerRotationOffset);
        }

        p.updateBeat = function(aPosition) {
            //console.log("WEBLAB.orchestra.ui.player.BlobCircle::updateBeat");
            //console.log(aPosition, this._position);

            if (aPosition === this._position) {
                var currentArrayLength = BlobCircle.NUMBER_OF_POINTS;
                for (var i = 0; i < currentArrayLength; i++) {
                    this.pointSpeeds[i] += (this._radius / 15) * (BlobCircle.BEAT_FORCE + (2 * Math.random() - 1) * BlobCircle.BEAT_FORCE_RANDOM);
                }
                return true;
            }
            return false;
        };

        p.isAtPosition = function(aX, aY) {
            var distance = Math.sqrt(Math.pow(aX - this.position.x, 2) + Math.pow(aY - this.position.y, 2));
            if (distance <= 15 /*this._radius*/ ) {
                return true;
            }
            return false;
        };

        p.reactsAtPosition = function(aPosition, aPitch) {
            //console.log("WEBLAB.orchestra.ui.player.BlobCircle::reactsAtPosition");
            //console.log(this._position, aPosition, this._pitch, aPitch);
            return (this._position === aPosition && this._pitch === aPitch);
        };

        p.changeRotationOffset = function(aOffset, aRotationOffset) {

            //this._centerOffset = aOffset;
            //this._centerRotationOffset = aRotationOffset;

            new TWEEN.Tween(this).to({
                "_centerOffset": aOffset,
                "_centerRotationOffset": aRotationOffset
            }, 300).easing(TWEEN.Easing.Quadratic.EaseOut).start();
        };

        p.animateRadius = function(aRadius, aTime, aEasing) {
            //console.log("WEBLAB.orchestra.ui.player.BlobCircle::animateRadius");
            //console.log(aRadius, aTime, aEasing);
            this._radiusTween.to({
                "radius": aRadius
            }, 1000 * aTime).easing(aEasing).onUpdate(this._radiusAnimationUpdateCallback).start();
        };

        p.impact = function(aAngle, aSpeed) {
            //console.log("WEBLAB.orchestra.ui.player.BlobCircle::impact");

            var times = Math.floor(aAngle / (2 * Math.PI));
            aAngle -= times * (2 * Math.PI);

            var pointIndex = Math.floor(BlobCircle.NUMBER_OF_POINTS * aAngle / (2 * Math.PI));

            var angleDiff = (aAngle - (pointIndex * 2 * Math.PI / BlobCircle.NUMBER_OF_POINTS)) / (2 * Math.PI / BlobCircle.NUMBER_OF_POINTS);

            var nextPointIndex = (pointIndex + 1) % BlobCircle.NUMBER_OF_POINTS;

            this.pointSpeeds[pointIndex] += (this._radius / 15) * (1 - angleDiff) * aSpeed;
            this.pointSpeeds[nextPointIndex] += (this._radius / 15) * (angleDiff) * aSpeed;
        };

        p.getPoint = function(aAngle, aReturnPoint, aReturnTangent) {

            var times = Math.floor(aAngle / (2 * Math.PI));
            aAngle -= times * (2 * Math.PI);

            var pointIndex = Math.floor(BlobCircle.NUMBER_OF_POINTS * aAngle / (2 * Math.PI));
            var angleDiff = (aAngle - (pointIndex * 2 * Math.PI / BlobCircle.NUMBER_OF_POINTS)) / (2 * Math.PI / BlobCircle.NUMBER_OF_POINTS);

            this._getPointPosition(pointIndex, this._tempPoint);
            this._getPointPosition((pointIndex - 1 + BlobCircle.NUMBER_OF_POINTS) % BlobCircle.NUMBER_OF_POINTS, this._tempPointPrevious);
            this._getPointPosition((pointIndex + 1) % BlobCircle.NUMBER_OF_POINTS, this._tempPointNext);
            this._getPointPosition((pointIndex + 2) % BlobCircle.NUMBER_OF_POINTS, this._tempPointNext2);

            this._tempPointPreviousVector = Point.create();
            this._tempPointNextVector = Point.create();

            this._getTangentAtPoint(this._tempPointPrevious, this._tempPointNext, this._tempPointPreviousVector);
            this._getTangentAtPoint(this._tempPointNext2, this._tempPoint, this._tempPointNextVector);

            aReturnPoint.x = Math.pow(1 - angleDiff, 3) * this._tempPoint.x + 3 * Math.pow(1 - angleDiff, 2) * angleDiff * (this._tempPoint.x + this._tempPointPreviousVector.x) + 3 * (1 - angleDiff) * Math.pow(angleDiff, 2) * (this._tempPointNext.x + this._tempPointNextVector.x) + Math.pow(angleDiff, 3) * this._tempPointNext.x;
            aReturnPoint.y = Math.pow(1 - angleDiff, 3) * this._tempPoint.y + 3 * Math.pow(1 - angleDiff, 2) * angleDiff * (this._tempPoint.y + this._tempPointPreviousVector.y) + 3 * (1 - angleDiff) * Math.pow(angleDiff, 2) * (this._tempPointNext.y + this._tempPointNextVector.y) + Math.pow(angleDiff, 3) * this._tempPointNext.y;
        };

        p._getPointPosition = function(aPointIndex, aReturnPoint) {

            var parameter = 2 * Math.PI * (aPointIndex / BlobCircle.NUMBER_OF_POINTS);
            var length = this.points[aPointIndex];

            aReturnPoint.x = this.position.x + Math.cos(parameter) * length;
            aReturnPoint.y = this.position.y + Math.sin(parameter) * length;
        };

        p._getTangentAtPoint = function(aPreviousPoint, aNextPoint, aReturnPoint) {

            aReturnPoint.x = 0.5 * 0.333 * (aNextPoint.x - aPreviousPoint.x);
            aReturnPoint.y = 0.5 * 0.333 * (aNextPoint.y - aPreviousPoint.y);
        };

        p._radiusAnimationUpdate = function() {
            //console.log("WEBLAB.orchestra.ui.player.BlobCircle::_radiusAnimationUpdate");
            //console.log(this._radiusAnimation.radius);
            this.adjustRadius(this._radiusAnimation.radius);
        };

        p.destroy = function() {

            this.originalPosition = null;
            this.position = null;

            this.points = null;
            this.trackingPoints = null;
            this.pointSpeeds = null;

            this._tempPoint = null;
            this._tempPointPrevious = null;
            this._tempPointNext = null;
            this._tempPointNext2 = null;
            this._tempPointPreviousVector = null;
            this._tempPointNextVector = null;

            this._radiusAnimation = null;
            this._radiusAnimationUpdateCallback = null;
            if (this._radiusTween !== null) {
                this._radiusTween.stop();
                this._radiusTween = null;
            }

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        BlobCircle.create = function(aRadius, aPositionX, aPositionY, aPosition, aPitch) {
            var newBlobCircle = new BlobCircle();
            newBlobCircle.setup(aRadius, aPositionX, aPositionY, aPosition, aPitch);
            return newBlobCircle;
        };
    }
})();
