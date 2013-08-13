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
