/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

var leftTrim = function(aText) {
	return aText.replace(new RegExp("^[\\s]+", "g"), "");
};
exports.leftTrim = leftTrim;

var rightTrim = function(aText) {
	return aText.replace(new RegExp("[\\s]+$", "g"), "");
};
exports.rightTrim = rightTrim;

var trim = function(aText) {
	return leftTrim(rightTrim(aText));
};
exports.trim = trim;
	
var splitSeparatedString = function(aText, aSeparator, aTrimLeft, aTrimRight) {
	
	aSeparator = (aSeparator != undefined) ? aSeparator : ",";
	aTrimLeft = (aTrimLeft != undefined) ? aTrimLeft : true;
	aTrimRight = (aTrimRight != undefined) ? aTrimRight : true;
	
	var currentArray = aText.split(aSeparator);
	var currentArrayLength = currentArray.length;
	for(var i = 0; i < currentArrayLength; i++) {
		var currentText = currentArray[i];
		if(aTrimLeft) {
			currentText = leftTrim(currentText);
		}
		if(aTrimRight) {
			currentText = rightTrim(currentText);
		}
		currentArray[i] = currentText;
	}
	
	return currentArray;
};
exports.splitSeparatedString = splitSeparatedString;