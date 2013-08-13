(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.animation");
    var TweenDelay = namespace.TweenDelay;

    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;

    if (namespace.DomElementScaleTween === undefined) {

        var DomElementScaleTween = function DomElementScaleTween() {
            this._init();
        }

        namespace.DomElementScaleTween = DomElementScaleTween;

        var p = DomElementScaleTween.prototype;

        p._init = function() {
            this._element = null;
            this._horizontalScale = 1;
            this._verticalScale = 1;

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

        p.getHorizontalScale = function() {
            return this._horizontalScale;
        };

        p.getVerticalScale = function() {
            return this._verticalScale;
        };

        p.setStartScale = function(aHorizontalScale, aVerticalScale) {
            this._horizontalScale = aHorizontalScale;
            this._verticalScale = aVerticalScale;

            return this;
        };

        p.animateTo = function(aHorizontalScale, aVerticalScale, aTime, aEasing, aDelay) {
            //console.log("WEBLAB.utils.animation.DomElementScaleTween::animateTo");
            //console.log(aHorizontalScale, aVerticalScale, aTime, aEasing, aDelay);

            this._tweenDelay.animateTo({
                "_horizontalScale": aHorizontalScale,
                "_verticalScale": aVerticalScale
            }, aTime, aEasing, aDelay);

            return this;
        };

        p.getTransform = function() {
            return "scale(" + this._horizontalScale + ", " + this._verticalScale + ")";
        };

        p.update = function() {
            this._update();
        };

        p._update = function() {

            var elementTransform = this.getTransform();

            if (this._element !== null) {
                this._element.style.setProperty("-khtml-transform", elementTransform, "");
                this._element.style.setProperty("-moz-transform", elementTransform, "");
                this._element.style.setProperty("-ms-transform", elementTransform, "");
                this._element.style.setProperty("-webkit-transform", elementTransform, "");
                this._element.style.setProperty("-o-transform", elementTransform, "");
                this._element.style.setProperty("transform", elementTransform, "");
            }
        };

        p.destroy = function() {
            this._element = null;
            this._updateCallback = null;
            if (this._tween !== null) {
                this._tween.stop();
            }
            this._tween = null;
            Utils.destroyIfExists(this._tweenDelay);
            this._tweenDelay = null;

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        DomElementScaleTween.create = function(aElement, aStartHorizontalScale, aStartVerticalScale) {
            var newDomElementScaleTween = new DomElementScaleTween();
            newDomElementScaleTween.setElement(aElement);
            newDomElementScaleTween.setStartScale(aStartHorizontalScale, aStartVerticalScale);
            return newDomElementScaleTween;
        };

        DomElementScaleTween.createWithAnimation = function(aElement, aStartHorizontalScale, aStartVerticalScale, aHorizontalScale, aVerticalScale, aTime, aEasing, aDelay) {
            var newDomElementScaleTween = new DomElementScaleTween();
            newDomElementScaleTween.setElement(aElement);
            newDomElementScaleTween.setStartScale(aStartHorizontalScale, aStartVerticalScale);
            newDomElementScaleTween.animateTo(aHorizontalScale, aVerticalScale, aTime, aEasing, aDelay);
            return newDomElementScaleTween;
        };
    }
})();
