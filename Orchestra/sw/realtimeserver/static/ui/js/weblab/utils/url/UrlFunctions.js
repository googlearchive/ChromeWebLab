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