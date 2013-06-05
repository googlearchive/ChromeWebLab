/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.htmldom");

	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	
	if(namespace.ElementUtils === undefined) {
		
		var ElementUtils = function DomElementCreator() {
			//MENOTE: do nothing
		};
		
		namespace.ElementUtils = ElementUtils;
		
		ElementUtils.addClass = function addClass(aNode, aClassName, aDelay) {
			
			if (parseFloat(aDelay) > 0)
			{
				var callbackFunction = ListenerFunctions.createListenerFunctionWithArguments(this, this.addClass, [aNode, aClassName]);
				setTimeout(callbackFunction, aDelay);
				
			}
			else
			{
				if (!ElementUtils.hasClass(aNode, aClassName)) {
					aNode.className += (aNode.className ? ' ' : '') + aClassName;
				}
			}
			
			return aNode;
		};
		
		ElementUtils.hasClass = function hasClass(aNode, aClassName) {
			try {
				return new RegExp('(\\s|^)'+aClassName+'(\\s|$)').test(aNode.className);	
			} catch(err) {
				console.error("ElementUtils.hasClass :: error : ", err);
			}
			return false;
		}
		
		ElementUtils.removeClass = function removeClass(aNode, aClassName, aDelay) {
			//console.log("WEBLAB.utils.htmldom.ElementUtils::removeClass");
			//console.log(aNode, aClassName, ElementUtils.hasClass(aNode, aClassName));
			if (parseFloat(aDelay) > 0)
			{
				var callbackFunction = ListenerFunctions.createListenerFunctionWithArguments(this, this.removeClass, [aNode, aClassName]);
				setTimeout(callbackFunction, aDelay);
				
			}
			else
				{
				if (ElementUtils.hasClass(aNode, aClassName)) {
					aNode.className=aNode.className.replace(new RegExp('(\\s|^)'+aClassName+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
				}
			}
			
			return aNode;
		}

		ElementUtils.toggleClass = function toggleClass(aNode, aClassName)  {
			if (ElementUtils.hasClass(aNode, aClassName)) {
				ElementUtils.removeClass(aNode, aClassName);
			} else {
				ElementUtils.addClass(aNode, aClassName);
			}
			
			return aNode;
		}
	}
})();