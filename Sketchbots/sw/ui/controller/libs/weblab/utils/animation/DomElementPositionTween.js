(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.animation");
    var TweenDelay = namespace.TweenDelay;

    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;

    if (namespace.DomElementPositionTween === undefined) {

        var DomElementPositionTween = function DomElementPositionTween() {
            this._init();
        }

        namespace.DomElementPositionTween = DomElementPositionTween;

        var p = DomElementPositionTween.prototype;

        p._init = function() {
            this._element = null;
            this._x = 0;
            this._y = 0;

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

        p.getXPosition = function() {
            return this._x;
        };

        p.getYPosition = function() {
            return this._y;
        };

        p.setStartPosition = function(aX, aY) {
            this._x = aX;
            this._y = aY;

            return this;
        };

        p.animateTo = function(aX, aY, aTime, aEasing, aDelay) {
            //console.log("WEBLAB.utils.animation.DomElementPositionTween::animateTo");
            //console.log(aX, aY, aTime, aEasing, aDelay);

            this._tweenDelay.animateTo({
                "_x": aX,
                "_y": aY
            }, aTime, aEasing, aDelay);

            return this;
        };

        p.update = function() {
            this._update();
        };

        p._update = function() {

            var elementTransform = "translate(" + this._x + "px, " + this._y + "px)";

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
            this._tween = null;
            Utils.destroyIfExists(this._tweenDelay);
            this._tweenDelay = null;

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        DomElementPositionTween.create = function(aElement, aStartX, aStartY) {
            var newDomElementPositionTween = new DomElementPositionTween();
            newDomElementPositionTween.setElement(aElement);
            newDomElementPositionTween.setStartPosition(aStartX, aStartY);
            return newDomElementPositionTween;
        };

        DomElementPositionTween.createWithAnimation = function(aElement, aStartX, aStartY, aX, aY, aTime, aEasing, aDelay) {
            var newDomElementPositionTween = new DomElementPositionTween();
            newDomElementPositionTween.setElement(aElement);
            newDomElementPositionTween.setStartPosition(aStartX, aStartY);
            newDomElementPositionTween.animateTo(aX, aY, aTime, aEasing, aDelay);
            return newDomElementPositionTween;
        };
    }
})();
