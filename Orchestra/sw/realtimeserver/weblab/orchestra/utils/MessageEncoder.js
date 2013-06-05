/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

var MessageIds = require("../constants/MessageIds");

var encodeDate = function(aDate) {
	//console.log("weblab.orchestra.MessageEncoder::encodeDate");
	//console.log(aDate.toGMTString());
	var dateValue = aDate.valueOf();
	var returnString = "";
	for(var i = 0; i < 6; i++) {
		var currentValue = dateValue & 0x7F;
		returnString = String.fromCharCode(currentValue) + returnString;
		dateValue -= currentValue;
		dateValue /= 128;
	}
	return returnString;
};
exports.encodeDate = encodeDate;

var decodeDate = function(aBuffer, aBufferOffset) {
	//console.log("weblab.orchestra.MessageEncoder::decodeDate");
	//console.log(aBuffer, aBufferOffset);
	
	var returnValue = 0;
	for(var i = 0; i < 6; i++) {
		var multiplier = Math.pow(2, (7*(6-i-1)));
		returnValue += aBuffer[i+aBufferOffset]*multiplier;
	}
	var returnDate = new Date(returnValue);
	//console.log(returnValue, returnDate.toGMTString());
	return returnDate;
};
exports.decodeDate = decodeDate;

var decodeLoopTimes = function(aBuffer, aBufferOffset) {
	//console.log("weblab.orchestra.MessageEncoder::decodeLoopTimes");
	//console.log(aBuffer.length);
			
	var currentArrayLength = (aBuffer.length-aBufferOffset)/6;
	var currentArray = new Array(currentArrayLength);
			
	for(var i = 0; i < currentArrayLength; i++) {
		currentArray[i] = decodeDate(aBuffer, i*6+aBufferOffset);
	}
			
	return currentArray;
};
exports.decodeLoopTimes = decodeLoopTimes;

exports.decodePlayerLayoutMessage = function decodePlayerLayoutMessage(aMessage, aPlayerLayout) {
	
	aPlayerLayout.reset();
	
	var currentPosition = 0;
	
	for(var i = 0; i < 8; i++) {
		var currentLength = aMessage[currentPosition];
		for(var j = 0; j < currentLength; j++) {
			var currentStartByte = currentPosition+1+3*j;
			aPlayerLayout.addNote(i, aMessage[currentStartByte], aMessage[currentStartByte+1], aMessage[currentStartByte+2]);
		}
		currentPosition += 1+3*currentLength;
	}
};

exports.encodeAddNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
	var returnBuffer = new Buffer(5);
	
	returnBuffer[0] = MessageIds.ADD_NOTE;
	returnBuffer[1] = aInstrumentId;
	returnBuffer[2] = aNoteId;
	returnBuffer[3] = aPosition;
	returnBuffer[4] = aPitch;
	
	return returnBuffer;
};

exports.encodeChangeNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
	var returnBuffer = new Buffer(5);
	
	returnBuffer[0] = MessageIds.CHANGE_NOTE;
	returnBuffer[1] = aInstrumentId;
	returnBuffer[2] = aNoteId;
	returnBuffer[3] = aPosition;
	returnBuffer[4] = aPitch;
	
	return returnBuffer;
};

exports.encodeRemoveNote = function(aInstrumentId, aNoteId) {
	var returnBuffer = new Buffer(3);
	
	returnBuffer[0] = MessageIds.REMOVE_NOTE;
	returnBuffer[1] = aInstrumentId;
	returnBuffer[2] = aNoteId;
	
	return returnBuffer;
};

exports.encodeNoteAdded = function(aInstrumentId, aNoteId, aPosition, aPitch, aDate) {
	var returnBuffer = new Buffer(5+6);
	
	returnBuffer[0] = MessageIds.NOTE_ADDED;
	returnBuffer[1] = aInstrumentId;
	returnBuffer[2] = aNoteId;
	returnBuffer[3] = aPosition;
	returnBuffer[4] = aPitch;
	
	var dateMessage = encodeDate(aDate);
	returnBuffer.write(dateMessage, 5, "utf8");
	
	return returnBuffer;
};

exports.encodeNoteChanged = function(aInstrumentId, aNoteId, aPosition, aPitch, aDate) {
	var returnBuffer = new Buffer(5+6);
	
	returnBuffer[0] = MessageIds.NOTE_CHANGED;
	returnBuffer[1] = aInstrumentId;
	returnBuffer[2] = aNoteId;
	returnBuffer[3] = aPosition;
	returnBuffer[4] = aPitch;
	
	var dateMessage = encodeDate(aDate);
	returnBuffer.write(dateMessage, 5, "utf8");
	
	return returnBuffer;
};

exports.encodeNoteRemoved = function(aInstrumentId, aNoteId, aDate) {
	var returnBuffer = new Buffer(3+6);
	
	returnBuffer[0] = MessageIds.NOTE_REMOVED;
	returnBuffer[1] = aInstrumentId;
	returnBuffer[2] = aNoteId;
	
	var dateMessage = encodeDate(aDate);
	returnBuffer.write(dateMessage, 3, "utf8");
	
	return returnBuffer;
};

exports.encodeRemoveAllNotesForInstrument = function(aInstrumentId) {
	var returnBuffer = new Buffer(2);
	
	returnBuffer[0] = MessageIds.REMOVE_ALL_NOTES_FOR_INSTRUMENT;
	returnBuffer[1] = aInstrumentId;
	
	return returnBuffer;
};

exports.encodeAllNotesForInstrumentRemoved = function(aInstrumentId, aDate) {
	var returnBuffer = new Buffer(2+6);
	
	returnBuffer[0] = MessageIds.ALL_NOTES_FOR_INSTRUMENT_REMOVED;
	returnBuffer[1] = aInstrumentId;
	
	var dateMessage = encodeDate(aDate);
	returnBuffer.write(dateMessage, 3, "utf8");
	
	return returnBuffer;
};

exports.encodeTextMessage = function(aType, aText) {
	var byteLength = Buffer.byteLength(aText, "utf8");
	var returnBuffer = new Buffer(byteLength + 1);
	
	returnBuffer[0] = aType;
	returnBuffer.write(aText, 1, "utf8");
	
	return returnBuffer;
};

exports.encodeTypeMessage = function(aType) {
	var returnBuffer = new Buffer(1);
	
	returnBuffer[0] = aType;
	
	return returnBuffer;
};

exports.encodePlayerLayout = function(aPlayerLayout) {
	//console.log("weblab.orchestra.MessageEncoder::encodePlayerLayout");
	//console.log(aPlayerLayout);
	
	var message = "";
	var currentArray = aPlayerLayout.instruments;
	var currentArrayLength = currentArray.length;
	for(var i = 0; i < currentArrayLength; i++) {
		var currentInstrument = currentArray[i];
		//console.log(currentInstrument.toString());
		var currentLength = 0;
		var currentNoteMessage = "";
		var currentArray2 = currentInstrument.notes;
		var currentArray2Length = currentArray2.length;
		for(var j = 0; j < currentArray2Length; j++) {
			var currentNote = currentArray2[j];
			if(currentNote != null) {
				currentLength++;
				currentNoteMessage += String.fromCharCode(j, currentNote.position, currentNote.pitch);
			}
		}
		message += String.fromCharCode(currentLength) + currentNoteMessage;
	}
	
	var byteLength = Buffer.byteLength(message, "utf8");
	var returnBuffer = new Buffer(byteLength + 1);
	
	returnBuffer[0] = MessageIds.CURRENT_LAYOUT;
	returnBuffer.write(message, 1, "utf8");
	
	return returnBuffer;
};

exports.encodeCurrentPlayers = function(aPlayersArray) {
	
	var currentArray = aPlayersArray;
	var currentArrayLength = currentArray.length;
	var idsArray = new Array(currentArrayLength);
	for(var i = 0; i < currentArrayLength; i++) {
		var currentUser = currentArray[i];
		idsArray[i] = (currentUser != null) ? currentUser.getId() : "";
	}
	
	var message = idsArray.join(",");
	
	var byteLength = Buffer.byteLength(message, "utf8");
	var returnBuffer = new Buffer(byteLength + 1);
	
	returnBuffer[0] = MessageIds.CURRENT_PLAYERS;
	returnBuffer.write(message, 1, "utf8");
	
	return returnBuffer;
};

exports.encodeCurrentPlayerIds = function(aPlayerIdsArray) {
	
	var message = aPlayerIdsArray.join(",");
	
	var byteLength = Buffer.byteLength(message, "utf8");
	var returnBuffer = new Buffer(byteLength + 1);
	
	returnBuffer[0] = MessageIds.CURRENT_PLAYERS;
	returnBuffer.write(message, 1, "utf8");
	
	return returnBuffer;
};

exports.encodeUserJoined = function(aInstrumentId, aUserId) {
	
	var byteLength = Buffer.byteLength(aUserId, "utf8");
	var returnBuffer = new Buffer(byteLength + 2);
	
	returnBuffer[0] = MessageIds.USER_JOINED;
	returnBuffer[1] = aInstrumentId;
	returnBuffer.write(aUserId, 2, "utf8");
	
	return returnBuffer;
};

exports.encodeUserLeft = function(aInstrumentId, aUserId) {
	//console.log("weblab.orchestra.MessageEncoder::encodeUserLeft");
	//console.log(aInstrumentId, aUserId);
	
	var byteLength = Buffer.byteLength(aUserId, "utf8");
	var returnBuffer = new Buffer(byteLength + 2);
	
	returnBuffer[0] = MessageIds.USER_LEFT;
	returnBuffer[1] = aInstrumentId;
	returnBuffer.write(aUserId, 2, "utf8");
	
	return returnBuffer;
};

exports.encodeCurrentInstrument = function(aInstrumentId) {
	
	var returnBuffer = new Buffer(2);
	
	returnBuffer[0] = MessageIds.CURRENT_INSTRUMENT;
	returnBuffer[1] = aInstrumentId;
	
	return returnBuffer;
};

exports.encodeInstrumentChanged = function(aInstrumentId, aUserId) {
	
	var byteLength = Buffer.byteLength(aUserId, "utf8");
	var returnBuffer = new Buffer(byteLength + 2);
	
	returnBuffer[0] = MessageIds.INSTRUMENT_CHANGED;
	returnBuffer[1] = aInstrumentId;
	returnBuffer.write(aUserId, 2, "utf8");
	
	return returnBuffer;
};

exports.encodeInstrumentChangeRefused = function(aInstrumentId) {
	
	var returnBuffer = new Buffer(2);
	
	returnBuffer[0] = MessageIds.INSTRUMENT_CHANGE_REFUSED;
	returnBuffer[1] = aInstrumentId;
	
	return returnBuffer;
};

exports.encodeStartMessage = function(aType, aCurrentDate, aStartDate) {
	
	var returnBuffer = new Buffer(1+6+6);
	
	returnBuffer[0] = aType;
	
	var dateMessage = encodeDate(aCurrentDate);
	returnBuffer.write(dateMessage, 1, "utf8");
	
	var dateMessage = encodeDate(aStartDate);
	returnBuffer.write(dateMessage, 1+6, "utf8");
	
	return returnBuffer;
};

exports.encodeControlAssumed = function(aInstrumentIds) {
	
	var returnBuffer = new Buffer(1+aInstrumentIds.length);
	
	returnBuffer[0] = MessageIds.CONTROL_ASSUMED;
	
	var currentArray = aInstrumentIds;
	var currentArrayLength = currentArray.length;
	for(var i = 0; i < currentArrayLength; i++) {
		returnBuffer[i+1] = currentArray[i];
	}
	
	return returnBuffer;
};

exports.encodeUserStarted = function(aInstrumentId, aTime, aUserId) {
	
	var byteLength = Buffer.byteLength(aUserId, "utf8");
	var returnBuffer = new Buffer(byteLength+2+6);
	
	returnBuffer[0] = MessageIds.USER_STARTED;
	returnBuffer[1] = aInstrumentId;
	
	var dateMessage = encodeDate(aTime);
	returnBuffer.write(dateMessage, 2, "utf8");
	
	returnBuffer.write(aUserId, 2+6, "utf8");
	
	return returnBuffer;
};

exports.encodeUserRemoved = function(aInstrumentId, aUserId) {
	
	var byteLength = Buffer.byteLength(aUserId, "utf8");
	var returnBuffer = new Buffer(byteLength + 2);
	
	returnBuffer[0] = MessageIds.USER_REMOVED;
	returnBuffer[1] = aInstrumentId;
	
	returnBuffer.write(aUserId, 2, "utf8");
	
	return returnBuffer;
};