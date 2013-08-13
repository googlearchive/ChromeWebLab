(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.animation");

    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.TweenDelay === undefined) {

        var TweenDelay = function TweenDelay() {
            this._init();
        }

        namespace.TweenDelay = TweenDelay;

        var p = TweenDelay.prototype;

        p._init = function() {
            this._delayedTweens = new Array();
            this._tween = null;

            this._updateCallback = ListenerFunctions.createListenerFunction(this, this.update);
            this._updateTween = new(TWEEN.Tween)({
                "update": 0
            }).onUpdate(this._updateCallback);
        }

        p.setup = function(aTween) {
            this._tween = aTween;
        };

        p.animateTo = function(aTo, aTime, aEasingFunction, aDelay) {

            if (aDelay == 0) {
                this.clearAllDelays();
                this._tween.to(aTo, aTime * 1000).easing(aEasingFunction).start();
            } else {
                var startTime = (0.001 * Date.now() + aDelay);
                this.clearAllDelaysFrom(startTime);
                this._delayedTweens.push({
                    "startTime": startTime,
                    "to": aTo,
                    "time": aTime,
                    "easingFunction": aEasingFunction
                });
                this._updateTween.to({
                    "update": 1
                }, 1000 * aDelay + 100).start();
            }

            return this;
        }

        p.clearAllDelays = function() {
            this._delayedTweens.splice(0, this._delayedTweens.length);
        };

        p.clearAllDelaysFrom = function(aTime) {
            var currentArray = this._delayedTweens;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentStartTime = currentArray[i].startTime;
                if (currentStartTime > aTime) {
                    this._delayedTweens.splice(i, this._delayedTweens.length);
                    break;
                }
            }
        }

        p.update = function() {
            var currentTime = 0.001 * Date.now();
            if (this._delayedTweens !== null) {
                var currentArray = this._delayedTweens;
                var currentArrayLength = currentArray.length;
                while (currentArray.length > 0) {
                    var currentData = currentArray[0];
                    if (currentData.startTime > currentTime) {
                        break;
                    }
                    this._tween.to(currentData.to, (Math.max(0, currentData.time - (currentTime - currentData.startTime)) * 1000)).easing(currentData.easingFunction).start();
                    currentArray.shift();
                }
            }
        };

        p.destroy = function() {
            this._delayedTweens = null;
            this._updateCallback = null;
            if (this._updateTween !== null) {
                this._updateTween.stop();
                this._updateTween = null;
            }
            if (this._tween !== null) {
                this._tween.stop();
                this._tween = null;
            }

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        TweenDelay.create = function(aTween) {
            var newTweenDelay = new TweenDelay();
            newTweenDelay.setup(aTween);
            return newTweenDelay;
        };

        TweenDelay.createOnObject = function(aObject, aUpdateFunction) {

            var newTween = new(TWEEN.Tween)(aObject).onUpdate(aUpdateFunction);

            var newTweenDelay = new TweenDelay();
            newTweenDelay.setup(newTween);
            return newTweenDelay;
        };
    }
})();
