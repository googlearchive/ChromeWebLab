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
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.data");
	
	var ArrayFunctions = namespace.ArrayFunctions;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if(namespace.MultidimensionalArrayHolder === undefined) {
		
		var MultidimensionalArrayHolder = function MultidimensionalArrayHolder() {
			this._init();
		};
		
		namespace.MultidimensionalArrayHolder = MultidimensionalArrayHolder;
		
		var p = MultidimensionalArrayHolder.prototype;
	
		p._init = function() {
			
			this._array = null;
			this._lengths = null;
			
			return this;
		};
		
		p.getDimesionLength = function(aDimension) {
			return this._lengths[aDimension];
		}
		
		p._getArrayPosition = function(aPositions) {
			
			var returnValue = 0;
			var multiplier = 1;
			
			var currentArray = this._lengths;
			var currentArrayLength = currentArray.length;
			for(var i = currentArrayLength; --i >= 0;) { //MENOTE: loop from end to start
				returnValue += multiplier*aPositions[i];
				multiplier *= currentArray[i];
			}
			
			return returnValue;
		}
		
		p.getValue = function(/* ... aPositions */) {
			
			aPositions = arguments;
			
			if(aPositions.length != this._lengths.length) {
				//METODO: error message
				return null;
			}
			
			var arrayPosition = this._getArrayPosition(aPositions);
			return this._array[arrayPosition];
		};
		
		p.setValue = function(/* ... aPositions, aValue */) {
			
			if(arguments.length != this._lengths.length+1) {
				//METODO: error message
				return;
			}
			
			var arrayPosition = this._getArrayPosition(arguments);
			this._array[arrayPosition] = arguments[arguments.length-1];
		};
		
		p.setLengths = function(aLengths) {
			this._lengths = aLengths;
			var totalLength = 1;
			var currentArray = this._lengths;
			var currentArrayLength = currentArray.length;
			for(var i = 0; i < currentArrayLength; i++) {
				totalLength *= currentArray[i];
			}
			this._array = new Array(totalLength);
		};
		
		p.destroy = function() {
			
			Utils.destroyArrayIfExists(this._array);
			this._array = null;
			
			this._lengths = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		MultidimensionalArrayHolder.create = function(/* ... aLengths */) {
			//trace("weblab.utils.data.MultidimensionalArrayHolder.create");
			
			aLengths = arguments;
			
			var newMultidimensionalArrayHolder = (new MultidimensionalArrayHolder());
			newMultidimensionalArrayHolder.setLengths(ArrayFunctions.copyArray(aLengths));
			return newMultidimensionalArrayHolder;
		} //End function create
	}
})();
