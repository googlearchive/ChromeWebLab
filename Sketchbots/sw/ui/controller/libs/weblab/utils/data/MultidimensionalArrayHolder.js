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