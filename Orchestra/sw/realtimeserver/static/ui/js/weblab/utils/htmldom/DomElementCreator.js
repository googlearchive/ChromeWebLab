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

    if (namespace.DomElementCreator === undefined) {

        var DomElementCreator = function DomElementCreator() {
            //MENOTE: do nothing
        };

        namespace.DomElementCreator = DomElementCreator;

        DomElementCreator.createChild = function createChild(aParentNode, aName) {
            var newNode = aParentNode.ownerDocument.createElement(aName);
            aParentNode.appendChild(newNode);
            return newNode;
        };

        DomElementCreator.createAttribute = function(aNode, aName, aValue) {
            var newAttribute = aNode.ownerDocument.createAttribute(aName);
            newAttribute.nodeValue = aValue;
            aNode.setAttributeNode(newAttribute);
            return aNode;
        };

        DomElementCreator.createText = function(aParentNode, aText) {
            var newNode = aParentNode.ownerDocument.createTextNode(aText);
            aParentNode.appendChild(newNode);
            return newNode;
        };

        DomElementCreator.createSvg = function(aDocument) {
            var newElement = aDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
            var defsElement = aDocument.createElementNS("http://www.w3.org/2000/svg", "defs");
            newElement.appendChild(defsElement);

            return newElement;
        };

        DomElementCreator.createSvgElement = function(aParentNode, aTagName) {

            var newElement = aParentNode.ownerDocument.createElementNS("http://www.w3.org/2000/svg", aTagName);

            aParentNode.appendChild(newElement);

            return newElement;
        };

        DomElementCreator.createSvgAttribute = function(aNode, aName, aValue) {
            var newAttribute = this.ownerDocument.createAttributeNS("http://www.w3.org/2000/svg", aName);
            newAttribute.nodeValue = aValue;
            aNode.setAttributeNode(newAttribute);
            return aNode;
        };
    }
})();
