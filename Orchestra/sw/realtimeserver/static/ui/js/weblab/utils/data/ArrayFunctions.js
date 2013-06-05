/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.data");
	
	if(namespace.ArrayFunctions === undefined) {
		
		var ArrayFunctions = function ArrayFunctions() {
			//MENOTE: do nothing
		};
		
		namespace.ArrayFunctions = ArrayFunctions;
		
		ArrayFunctions.indexOfInArray = function(aArray, aData) {
			if(aArray === null || aArray === undefined) {
				return -1;
			}
			if(aArray.indexOf) {
				return aArray.indexOf(aData);
			}
			else {
				//MENOTE: ie doesn't have the indexOf function
				var currentArray = aArray;
				var currentArrayLength = currentArray.length;
				for(var i = 0; i < currentArrayLength; i++) {
					var currentData = currentArray[i];
					if(currentData == aData) {
						return i;
					}
				}
			}
			return -1;
		};
		
		ArrayFunctions.copyArray = function(aArray) {
			var currentArray = new Array(aArray.length);
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				currentArray[i] = aArray[i];
			}
			return currentArray;
		};
		
		ArrayFunctions.create2DimensionalArray = function create2DimensionalArray(aFirstDimension, aSecondDimension) {
			var returnArray = new Array(aFirstDimension);
			for(var i = 0; i < aFirstDimension; i++) {
				returnArray[i] = new Array(aSecondDimension);
			}
			
			return returnArray;
		};
		
		ArrayFunctions.generateList = function generateList(aPrefix, aStartNumber, aEndNumber, aSuffix, aReturnArray) {
			for(var i = aStartNumber; i < aEndNumber; i++) {
				aReturnArray.push(aPrefix + "" + i + "" + aSuffix);
			}
		};
		
		ArrayFunctions.generateReverseList = function generateReverseList(aPrefix, aStartNumber, aEndNumber, aSuffix, aReturnArray) {
			for(var i = aEndNumber; --i >= aStartNumber;) {
				aReturnArray.push(aPrefix + "" + i + "" + aSuffix);
			}
		};
	}
})();