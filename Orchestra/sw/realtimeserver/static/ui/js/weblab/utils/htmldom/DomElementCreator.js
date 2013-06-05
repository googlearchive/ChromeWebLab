/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.htmldom");
	
	if(namespace.DomElementCreator === undefined) {
		
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