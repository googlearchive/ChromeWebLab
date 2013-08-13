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

    var namespace = WEBLAB.namespace("WEBLAB.common.ui");

    var DomElementPositionTween = WEBLAB.namespace("WEBLAB.utils.animation").DomElementPositionTween;
    var DomElementOpacityTween = WEBLAB.namespace("WEBLAB.utils.animation").DomElementOpacityTween;
    var DomElementInDomTween = WEBLAB.namespace("WEBLAB.utils.animation").DomElementInDomTween;

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;

    var DomElementCreator = WEBLAB.namespace("WEBLAB.utils.htmldom").DomElementCreator;
    var ElementUtils = WEBLAB.namespace("WEBLAB.utils.htmldom").ElementUtils;

    if (namespace.ReplaceableContent === undefined) {
        //console.log("WEBLAB.common.ui.ReplaceableContent");

        var ReplaceableContent = function ReplaceableContent() {
            this._init();
        };

        namespace.ReplaceableContent = ReplaceableContent;

        ReplaceableContent.DIRECTION_REVERESED = 0;
        ReplaceableContent.DIRECTION_SAME = 1;
        ReplaceableContent.DIRECTION_LEFT = 2;
        ReplaceableContent.DIRECTION_RIGHT = 3;

        var p = ReplaceableContent.prototype = new EventDispatcher();

        p._init = function() {

            this._verticalClipping = true;
            this._horizontalClipping = true;

            this._holderElement = document.createElement("div");
            this._holderElement.style.setProperty("position", "absolute", "");

            this._clipElement = document.createElement("div");
            this._clipElement.style.setProperty("overflow-x", "hidden", "");
            this._clipElement.style.setProperty("overflow-y", "hidden", "");
            this._clipElement.style.setProperty("height", "100px", "");
            this._clipElement.style.setProperty("position", "absolute", "");
            this._holderElement.appendChild(this._clipElement);

            this._contentHolder = document.createElement("div");
            this._contentHolder.style.setProperty("position", "absolute", "");
            this._contentHolder.style.setProperty("width", "100%", "");
            this._clipElement.appendChild(this._contentHolder);

            this._up = true;
            this._showDirection = ReplaceableContent.DIRECTION_SAME;
            this._hideDirection = ReplaceableContent.DIRECTION_REVERESED;
            this._margin = 0;
            this._width = 0;
            this._clipHeight = 100;

            this._inAnimationTime = 0.5;
            this._outAnimationTime = 0.5;
            this._replaceDelay = 0.3;

            this._pastContents = new Array();
            this._currentContent = null;
            this._currentRealContent = null;

            return this;
        };

        p.getElement = function() {
            return this._holderElement;
        };

        p.getCurrentContentElement = function() {
            if (this._currentContent !== null) {
                return this._currentContent.contentElement;
            }
            return null;
        };

        p.setup = function(aUp, aMargin, aWidth) {
            this._up = aUp;
            this._margin = aMargin;
            this._width = aWidth;

            this._setupClipping();
        };

        p.setWidth = function(aWidth) {
            this._width = aWidth;

            this._setupClipping();
        };

        p.getWidth = function() {
            return this._width;
        };

        p.setAnimationTimes = function(aInAniamtionTime, aOutAnimationTime, aDelay) {
            this._inAnimationTime = aInAniamtionTime;
            this._outAnimationTime = aOutAnimationTime;
            this._replaceDelay = aDelay;

            return this;
        };

        p.setMargin = function(aMargin) {
            this._margin = aMargin;
        };

        p.setClipHeight = function(aHeight) {
            //console.log("WEBLAB.common.ui.ReplaceableContent::setClipHeight");
            this._clipHeight = aHeight;
            this._setupClipping();
        };

        p.setVerticalClipEnabled = function(aEnabled) {
            this._verticalClipping = aEnabled;
            this._setupClipping();
        };
        p.setHorizontalClipEnabled = function(aEnabled) {
            this._horizontalClipping = aEnabled;
            this._setupClipping();
        };

        p._setupClipping = function() {

            var position = 0;

            if (this._up) {
                position = -1 * this._clipHeight;
            }

            this._clipElement.style.setProperty("top", position + "px", "");
            this._clipElement.style.setProperty("height", this._clipHeight + "px", "");

            this._contentHolder.style.setProperty("top", (-1 * position) + "px", "");

            this._clipElement.style.setProperty("width", this._width + "px", "");

            this._clipElement.style.setProperty("overflow-y", (this._verticalClipping ? "hidden" : "visible"), "");
            this._clipElement.style.setProperty("overflow-x", (this._horizontalClipping ? "hidden" : "visible"), "");
        }

        p._createContent = function(aContentElement, aAnimate) {
            //console.log("WEBLAB.common.ui.ReplaceableContent::_createContent");

            aContentElement.style.setProperty("position", "absolute", "");
            aContentElement.style.setProperty("top", "0px", "");
            aContentElement.style.setProperty("width", "100%", "");

            var inDomTween = DomElementInDomTween.create(aContentElement, this._contentHolder, true);
            inDomTween.update();

            var zeroPosition = this._margin;
            if (this._up) {
                zeroPosition += aContentElement.clientHeight;
                zeroPosition *= -1;
            }

            var startPositionY = (aAnimate) ? (this._up ? zeroPosition + 10 : zeroPosition - 10) : zeroPosition;
            var startOpacity = (aAnimate) ? 0 : 1;

            var newPositionTween = DomElementPositionTween.create(aContentElement, 0, startPositionY);
            newPositionTween.update();
            var newOpacityTween = DomElementOpacityTween.create(aContentElement, startOpacity);
            newOpacityTween.update();

            var newContent = {
                "position": newPositionTween,
                "opacity": newOpacityTween,
                "inDom": inDomTween,
                "contentElement": aContentElement
            };

            return newContent;
        };

        p.showInitialContent = function(aContentElement, aAnimate, aDelay) {

            var newContent = this._createContent(aContentElement, aAnimate);
            this._currentContent = newContent;

            if (aAnimate) {

                aDelay = (!isNaN(aDelay)) ? aDelay : 0;

                var zeroPosition = this._margin;
                if (this._up) {
                    zeroPosition += aContentElement.clientHeight;
                    zeroPosition *= -1;
                }

                newContent.position.animateTo(0, zeroPosition, this._inAnimationTime, TWEEN.Easing.Quadratic.EaseOut, aDelay);
                newContent.opacity.animateTo(1, this._inAnimationTime, TWEEN.Easing.Quadratic.EaseOut, aDelay);
            }
        };

        p.replaceContent = function(aContentElement, aDelay) {
            //console.log("WEBLAB.common.ui.ReplaceableContent::replaceContent");

            aDelay = (!isNaN(aDelay)) ? aDelay : 0;

            if (this._currentContent !== null) {


                if (this._currentContent.contentElement !== aContentElement) {
                    var outPosition = (this._up) ? this._currentContent.position.getYPosition() - 10 : this._currentContent.position.getYPosition() + 10;

                    this._currentContent.position.animateTo(0, outPosition, this._outAnimationTime, TWEEN.Easing.Quadratic.EaseOut, aDelay);
                    this._currentContent.opacity.animateTo(0, this._outAnimationTime, TWEEN.Easing.Quadratic.EaseOut, aDelay);
                    this._currentContent.inDom.animateTo(false, this._outAnimationTime + aDelay);
                    this._pastContents.push(this._currentContent);


                    var newContent = this._createContent(aContentElement, true);
                    this._currentContent = newContent;

                    var zeroPosition = this._margin;
                    if (this._up) {
                        zeroPosition += aContentElement.clientHeight;
                        zeroPosition *= -1;
                    }


                    newContent.position.animateTo(0, zeroPosition, this._inAnimationTime, TWEEN.Easing.Quadratic.EaseOut, this._replaceDelay + aDelay);
                    newContent.opacity.animateTo(1, this._inAnimationTime, TWEEN.Easing.Quadratic.EaseOut, this._replaceDelay + aDelay);

                } else {
                    this.stopHideContent();
                    this._contentHolder.appendChild(this._currentContent.contentElement);

                    var zeroPosition = this._margin;
                    if (this._up) {
                        zeroPosition += aContentElement.clientHeight;
                        zeroPosition *= -1;
                    }

                    this._currentContent.position.animateTo(0, zeroPosition, 0, TWEEN.Easing.Quadratic.EaseOut, 0);
                    this._currentContent.opacity.animateTo(1, 0, TWEEN.Easing.Quadratic.EaseOut, 0);
                }
            } else {
                this.showInitialContent(aContentElement, true, aDelay);
            }
        };

        p.hideContent = function(aDelay) {
            //console.log("WEBLAB.common.ui.ReplaceableContent::hideContent");

            aDelay = (!isNaN(aDelay)) ? aDelay : 0;

            if (this._currentContent !== null) {
                var outPosition = (this._up) ? this._currentContent.position.getYPosition() + 10 : this._currentContent.position.getYPosition() - 10;

                this._currentContent.position.animateTo(0, outPosition, this._outAnimationTime, TWEEN.Easing.Quadratic.EaseOut, aDelay);
                this._currentContent.opacity.animateTo(0, this._outAnimationTime, TWEEN.Easing.Quadratic.EaseOut, aDelay);
                this._currentContent.inDom.animateTo(false, this._outAnimationTime + aDelay);

                this._pastContents.push(this._currentContent);

                this._currentContent = null;
            }
        };

        p.stopHideContent = function() {

            this._currentContent.position._tween.stop();
            this._currentContent.opacity._tween.stop();
            this._currentContent.inDom.stop();

        };

        p.destroy = function() {
            this._holderElement = null;
            this._clipElement = null;
            this._contentHolder = null;
            this._pastContents = null;
            //METODO: clear out past contents
            this._currentContent = null;
            this._currentRealContent = null;

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        ReplaceableContent.create = function(aUp, aMargin, aWidth) {
            //console.log("WEBLAB.common.ui.ReplaceableContent::create");
            var newReplaceableContent = new ReplaceableContent();
            newReplaceableContent.setup(aUp, aMargin, aWidth);
            return newReplaceableContent;
        };
    }
})();
