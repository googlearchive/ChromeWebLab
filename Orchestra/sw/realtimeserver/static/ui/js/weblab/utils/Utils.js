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

/**
 * Utils
 */

(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils');


    namespace.Utils = function() {

        /**
         * [addListener adds an event listener cross-browser]
         * @param {[DOMElement]} aElement
         * @param {[DOMEvent]} aEvent
         * @param {[Function]} aCallback
         */
        this.addListener = null;
        /**
         * [removeListener removes an event listener cross-browser]
         * @param {[DOMElement]} aElement
         * @param {[DOMEvent]} aEvent
         * @param {[Function]} aCallback
         */
        this.removeListener = null;
        /**
         * [stopEvent stops propagation and prevents default actions of an event cross-browser]
         * @param {[DOMEvent]} aEvent
         */
        this.stopEvent = null;

    };

    var utils = WEBLAB.utils.Utils;

    //add and remove listeners functions definitions depending on browser
    if (typeof window.addEventListener === 'function') {

        utils.addListener = function(aElement, aEvent, aCallback) {
            aElement.addEventListener(aEvent, aCallback, false);
        };
        utils.removeListener = function(aElement, aEvent, aCallback) {
            aElement.removeEventListener(aEvent, aCallback, false);
        };
    } else if (typeof document.attachEvent === 'function') { //IE
        utils.addListener = function(aElement, aEvent, aCallback) {
            aElement.attachEvent('on' + aEvent, aCallback);
        };
        utils.removeListener = function(aElement, aEvent, aCallback) {
            aElement.detachEvent('on' + aEvent, aCallback);
        };
    } else {
        utils.addListener = function(aElement, aEvent, aCallback) {
            aElement['on' + aEvent] = aCallback;
        };
        utils.removeListener = function(aElement, aEvent, aCallback) {
            aElement['on' + aEvent] = null;
        };
    }

    //stopEvent function definition depending on browser
    utils.stopEvent = function(aEvent) {
        if (typeof aEvent.preventDefault === "function" && typeof aEvent.stopPropagation === "function") {
            aEvent.preventDefault();
            aEvent.stopPropagation();
        }
        if (typeof aEvent.returnValue === "boolean" && typeof aEvent.cancelBubble === "boolean") {
            aEvent.returnValue = false;
            aEvent.cancelBubble = true;
        }
    };


    utils.destroyIfExists = function(aObject) {
        if (aObject !== null && aObject !== undefined && aObject.destroy instanceof Function) {
            aObject.destroy();
        }
    };

    utils.destroyArrayIfExists = function(aArray) {
        if (aArray !== null && aArray !== undefined && aArray instanceof Array) {

            var currentArray = aArray;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentObject = currentArray[i];
                if (currentObject !== null && currentObject !== undefined && currentObject.destroy instanceof Function) {
                    currentObject.destroy();
                }
                currentArray[i] = null;
            }
        }
    };

    /*
     * ECMAScript 5 Polyfill for Function.bind method
     */

    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function() {},
                fBound = function() {
                    return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }


})();
