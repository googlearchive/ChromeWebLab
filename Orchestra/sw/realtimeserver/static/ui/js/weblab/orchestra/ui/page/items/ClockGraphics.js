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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items");

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var NumberFunctions = WEBLAB.namespace("WEBLAB.utils.data").NumberFunctions;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;

    if (namespace.ClockGraphics === undefined) {

        var ClockGraphics = function ClockGraphics() {
            this._init();
        };

        namespace.ClockGraphics = ClockGraphics;

        var p = namespace.ClockGraphics.prototype;

        p._init = function() {

            this._element = null;
            this._context = null;

            this._totalTime = 1;

            this._positionX = 0;
            this._positionY = 0;
            this._innerRadius = 0;
            this._outerRadius = 0;
            this._outerLineThickness = 0;

            this._filling = true;

            this._color = null;

            return this;
        };

        p.setElement = function(aElement) {
            //console.log("WEBLAB.orchestra.ui.page.items.ClockGraphics::setElement");
            //console.log(aElement);

            this._element = aElement;
            this._context = this._element.getContext("2d");

            return this;
        };

        p.setup = function(aX, aY, aInnerRadius, aOuterRadius, aLineThickness) {

            this._positionX = aX;
            this._positionY = aY;
            this._innerRadius = aInnerRadius;
            this._outerRadius = aOuterRadius;
            this._outerLineThickness = aLineThickness;

            return this;
        };

        p.setFilling = function(aFilling) {
            this._filling = aFilling;
        };

        p.setColor = function(aColor) {
            this._color = aColor;
        };

        p.changeColor = function(aColor) {
            //METODO: aniamtion

            this._color = aColor; //MEDEBUG
        };

        p.setCountdownLength = function(aLength) {
            this._totalTime = aLength;
        };

        p.adjustCountdownLength = function(aLength) {
            //console.log("WEBLAB.orchestra.ui.page.items.ClockGraphics::adjustCountdownLength");
            this._totalTime = aLength;
        };

        p.getElement = function() {
            return this._element;
        };

        p.getTotalTime = function() {
            return this._totalTime;
        };

        p.updateCanvasSize = function() {
            this._element.width = this._element.clientWidth;
            this._element.height = this._element.clientHeight;
        };

        p._drawFilled = function(aStartAngle, aEndAngle, aCounterClockwise) {
            this._context.beginPath();
            this._context.fillStyle = this._color;
            this._context.lineWidth = 0;
            this._context.moveTo(this._positionX, this._positionY);
            this._context.lineTo(this._positionX + Math.cos(aStartAngle) * this._innerRadius, this._positionY + Math.sin(aStartAngle) * this._innerRadius);
            this._context.arc(this._positionX, this._positionY, this._innerRadius, aStartAngle, aEndAngle, aCounterClockwise);
            this._context.lineTo(this._positionX, this._positionY);
            this._context.fill();
        };

        p._drawLine = function(aStartAngle, aEndAngle, aCounterClockwise) {
            this._context.beginPath();
            this._context.strokeStyle = this._color;
            this._context.lineWidth = this._outerLineThickness;
            this._context.moveTo(this._positionX + Math.cos(aStartAngle) * this._outerRadius, this._positionY + Math.sin(aStartAngle) * this._outerRadius);
            this._context.arc(this._positionX, this._positionY, this._outerRadius, aStartAngle, aEndAngle, aCounterClockwise);
            this._context.stroke();
        };

        p.updateTime = function(aTimeLeft) {
            //console.log("WEBLAB.orchestra.ui.page.items.ClockGraphics::updateTime");

            var parameter = 1 - ((aTimeLeft) / this._totalTime);
            var maxSize = Math.ceil(this._outerRadius + 0.5 * this._outerLineThickness);
            var clearSize = 2 * maxSize;

            this._context.clearRect(this._positionX - maxSize, this._positionX - maxSize, clearSize, clearSize);

            var startAngle = -0.5 * Math.PI;
            var endAngle = startAngle + 2 * Math.PI;
            var counterClockwise = false;
            var parameterAngle = (1 - parameter) * startAngle + parameter * endAngle;

            if (this._filling) {
                if (parameter > 0) {
                    this._drawFilled(startAngle, parameterAngle, counterClockwise);
                }
                if (parameter < 1) {
                    this._drawLine(parameterAngle, endAngle, counterClockwise);
                }
            } else {
                if (parameter > 0) {
                    this._drawLine(startAngle, parameterAngle, counterClockwise);
                }
                if (parameter < 1) {
                    this._drawFilled(parameterAngle, endAngle, counterClockwise);
                }
            }
        }

        p.destroy = function() {
            this._element = null;
            this._context = null;

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        ClockGraphics.createWithoutSettings = function(aElement) {
            var newClockGraphics = new ClockGraphics();
            newClockGraphics.setElement(aElement);
            return newClockGraphics;
        };

        ClockGraphics.create = function(aElement, aX, aY, aInnerRadius, aOuterRadius, aLineThickness, aColor) {
            var newClockGraphics = new ClockGraphics();
            newClockGraphics.setElement(aElement);
            newClockGraphics.setup(aX, aY, aInnerRadius, aOuterRadius, aLineThickness);
            newClockGraphics.setColor(aColor);
            return newClockGraphics;
        };
    }
})();
