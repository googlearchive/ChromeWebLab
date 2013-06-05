/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

exports.createListenerFunction = function(aListenerObject, aListenerFunction) {
	var returnFunction = function() {
		aListenerFunction.apply(aListenerObject, arguments);
	}
	return returnFunction;
};

exports.createSecureListenerFunction = function(aListenerObject, aListenerFunction) {
	var returnFunction = function() {
		try {
			aListenerFunction.apply(aListenerObject, arguments);
		}
		catch(theError) {
			console.log("An error occured: " + theError.message);
			// console.log(theError.stack);
		}
	}
	return returnFunction;
};


exports.createListenerFunctionWithArguments = function(aListenerObject, aListenerFunction, aArguments) {
	var returnFunction = function() {
		var argumentsArray = aArguments.concat([]); //MENOTE: can't concat arguments. It adds an object instead of all arguments.
		var currentArray = arguments;
		var currentArrayLength = currentArray.length;
		for(var i = 0; i < currentArrayLength; i++) {
			argumentsArray.push(currentArray[i]);
		}
		//console.log(arguments, arguments.length);
		//console.log(argumentsArray);
		aListenerFunction.apply(aListenerObject, argumentsArray);
	}
	return returnFunction;
};