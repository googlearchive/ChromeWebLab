/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

exports.verifyInstrumentId = function(aInstrumentId) {
	return (aInstrumentId >= 0 && aInstrumentId < 8);
};

exports.verifyInstrumentIdOrAll = function(aInstrumentId) {
	return (aInstrumentId >= -1 && aInstrumentId <= 8);
};

exports.verifyAll = function() {
	var currentArray = arguments;
	var currentArrayLength = currentArray.length;
	for(var i = 0; i < currentArrayLength; i++) {
		var currentItem = currentArray[i];
		if(currentItem != true) {
			return false;
		}
	}
	return true;
}