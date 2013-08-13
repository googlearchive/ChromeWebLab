(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.animation");
    var TweenDelay = namespace.TweenDelay;

    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;

    if (namespace.DomElementOpacityTween === undefined) {

        var DomElementOpacityTween = function DomElementOpacityTween() {
            this._init();
        }

        namespace.DomElementOpacityTween = DomElementOpacityTween;

        var p = DomElementOpacityTween.prototype;

        p._init = function() {
            this._element = null;
            this._opacity = 1;

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

        p.getOpacity = function() {
            return this._x;
        };

        p.setStartOpacity = function(aOpacity) {
            this._opacity = aOpacity;

            return this;
        };

        p.animateTo = function(aOpacity, aTime, aEasing, aDelay) {
            //console.log("WEBLAB.utils.animation.DomElementOpacityTween::animateTo");
            //console.log(aOpacity, aTime, aEasing, aDelay);

            this._tweenDelay.animateTo({
                "_opacity": aOpacity
            }, aTime, aEasing, aDelay);

            return this;
        };

        p.update = function() {
            this._update();
        };

        p._update = function() {
            if (this._element !== null) {
                this._element.style.setProperty("opacity", this._opacity, "");
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

        DomElementOpacityTween.create = function(aElement, aStartOpacity) {
            var newDomElementOpacityTween = new DomElementOpacityTween();
            newDomElementOpacityTween.setElement(aElement);
            newDomElementOpacityTween.setStartOpacity(aStartOpacity);
            return newDomElementOpacityTween;
        };

        DomElementOpacityTween.createWithAnimation = function(aElement, aStartOpacity, aOpacity, aTime, aEasing, aDelay) {
            var newDomElementOpacityTween = new DomElementOpacityTween();
            newDomElementOpacityTween.setElement(aElement);
            newDomElementOpacityTween.setStartOpacity(aStartOpacity);
            newDomElementOpacityTween.animateTo(aOpacity, aTime, aEasing, aDelay);
            return newDomElementOpacityTween;
        };
    }
})();
