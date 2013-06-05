/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.htmldom");
	
	if(namespace.PositionFunctions === undefined) {
		
		var PositionFunctions = function PositionFunctions() {
			//MENOTE: do nothing
		};
		
		namespace.PositionFunctions = PositionFunctions;
		
		PositionFunctions.getGlobalPositionForNode = function(aElement, aReturnPoint) {
			var currentElement = aElement;
			aReturnPoint.x = 0;
			aReturnPoint.y = 0;
			var debugBreakCounter = 0;
			while(currentElement != null) {
				if(debugBreakCounter++ > 1000) {
					//METODO: error message
					break;
				}
				//console.log({x: currentElement}, currentElement.offsetLeft, currentElement.offsetTop);
				aReturnPoint.x += currentElement.offsetLeft;
				aReturnPoint.y += currentElement.offsetTop;
				currentElement = currentElement.offsetParent;
			}
			
			return aReturnPoint;
		};
		
		PositionFunctions.debugTraceGlobalPositionForNode = function(aElement) {
			var currentElement = aElement;
			var debugBreakCounter = 0;
			while(currentElement != null) {
				if(debugBreakCounter++ > 1000) {
					//METODO: error message
					break;
				}
				console.log(currentElement.offsetLeft, currentElement.offsetTop, currentElement);
				currentElement = currentElement.offsetParent;
			}
		};
		
		PositionFunctions.getRelativePositionForNode = function(aPoint, aInputElement, aOutputElement, aReturnPoint) {
			
			var inputRelativePoint = PositionFunctions.getGlobalPositionForNode(aInputElement, {x: 0, y: 0});
			var outputRelativePoint = PositionFunctions.getGlobalPositionForNode(aOutputElement, {x: 0, y: 0});
			
			aReturnPoint.x = aPoint.x+inputRelativePoint.x-outputRelativePoint.x;
			aReturnPoint.y = aPoint.y+inputRelativePoint.y-outputRelativePoint.y;
			
			return aReturnPoint;
		};
	}
})();