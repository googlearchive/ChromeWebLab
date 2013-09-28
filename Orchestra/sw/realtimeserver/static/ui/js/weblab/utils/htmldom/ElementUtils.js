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

    var namespace = WEBLAB.namespace("WEBLAB.utils.htmldom");

    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.ElementUtils === undefined) {

        var ElementUtils = function DomElementCreator() {
            //MENOTE: do nothing
        };

        namespace.ElementUtils = ElementUtils;

        ElementUtils.addClass = function addClass(aNode, aClassName, aDelay) {

            if (parseFloat(aDelay) > 0) {
                var callbackFunction = ListenerFunctions.createListenerFunctionWithArguments(this, this.addClass, [aNode, aClassName]);
                setTimeout(callbackFunction, aDelay);

            } else {
                if (!ElementUtils.hasClass(aNode, aClassName)) {
                    aNode.className += (aNode.className ? ' ' : '') + aClassName;
                }
            }

            return aNode;
        };

        ElementUtils.hasClass = function hasClass(aNode, aClassName) {
            try {
                return new RegExp('(\\s|^)' + aClassName + '(\\s|$)').test(aNode.className);
            } catch (err) {
                console.error("ElementUtils.hasClass :: error : ", err);
            }
            return false;
        }

        ElementUtils.removeClass = function removeClass(aNode, aClassName, aDelay) {
            //console.log("WEBLAB.utils.htmldom.ElementUtils::removeClass");
            //console.log(aNode, aClassName, ElementUtils.hasClass(aNode, aClassName));
            if (parseFloat(aDelay) > 0) {
                var callbackFunction = ListenerFunctions.createListenerFunctionWithArguments(this, this.removeClass, [aNode, aClassName]);
                setTimeout(callbackFunction, aDelay);

            } else {
                if (ElementUtils.hasClass(aNode, aClassName)) {
                    aNode.className = aNode.className.replace(new RegExp('(\\s|^)' + aClassName + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
                }
            }

            return aNode;
        }

        ElementUtils.toggleClass = function toggleClass(aNode, aClassName) {
            if (ElementUtils.hasClass(aNode, aClassName)) {
                ElementUtils.removeClass(aNode, aClassName);
            } else {
                ElementUtils.addClass(aNode, aClassName);
            }

            return aNode;
        }
    }
})();
