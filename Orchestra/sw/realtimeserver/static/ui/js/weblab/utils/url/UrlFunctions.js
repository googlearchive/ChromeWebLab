/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.url");
	
	if(namespace.UrlFunctions === undefined) {
		
		var UrlFunctions = function UrlFunctions() {
			//MENOTE: do nothing
		};
		
		namespace.UrlFunctions = UrlFunctions;
		
		UrlFunctions.parseQueryString = function(aPath) {
			var queryString = aPath;
			var queryIndex = queryString.indexOf("?");
			var queryStringArray = [];
			
			if(queryIndex !== -1 && queryIndex+1 !== queryString.length) {
				queryString = queryString.substring(queryIndex+1, queryString.length);
				queryStringArray = queryString.split("&");
			}
			var returnObject = {};
			for(var i = 0; i < queryStringArray.length; i++) {
				var tempArray = queryStringArray[i].split("=");
				returnObject[tempArray[0]] = tempArray[1];
			}
			return returnObject;
		};
	}
})();