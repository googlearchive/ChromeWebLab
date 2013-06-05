/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.websocket");
	
	var MessageIds = WEBLAB.namespace("WEBLAB.orchestra.constants").MessageIds;
	
	if(namespace.MessageEncoder === undefined) {
		
		var MessageEncoder = function MessageEncoder() {
			//MENOTE: do nothing
		};
		
		namespace.MessageEncoder = MessageEncoder;
		
		MessageEncoder.encodeAddNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			return String.fromCharCode(MessageIds.ADD_NOTE, aInstrumentId, aNoteId, aPosition, aPitch);
		};
		
		MessageEncoder.encodeChangeNote = function(aInstrumentId, aNoteId, aPosition, aPitch) {
			return String.fromCharCode(MessageIds.CHANGE_NOTE, aInstrumentId, aNoteId, aPosition, aPitch);
		};
		
		MessageEncoder.encodeRemoveNote = function(aInstrumentId, aNoteId) {
			return String.fromCharCode(MessageIds.REMOVE_NOTE, aInstrumentId, aNoteId);
		};
		
		MessageEncoder.encodeUserJoined = function(aInstrumentId, aUserId) {
			return String.fromCharCode(MessageIds.USER_JOINED, aInstrumentId) + aUserId;
		};
		
		MessageEncoder.encodeUserLeft = function(aInstrumentId, aUserId) {
			return String.fromCharCode(MessageIds.USER_LEFT, aInstrumentId) + aUserId;
		};
		
		MessageEncoder.encodeRequestRecording = function(aInstrumentId, aUserId, aStartTime, aEndTime) {
			return String.fromCharCode(MessageIds.REQUEST_RECORDING, aInstrumentId) + MessageEncoder.encodeDate(aStartTime) + MessageEncoder.encodeDate(aEndTime) + aUserId;
		};
		
		MessageEncoder.encodeTextMessage = function(aType, aText) {
			return String.fromCharCode(aType) + aText;
		};
		
		MessageEncoder.encodeIdMessage = function(aType) {
			return String.fromCharCode(aType);
		};
		
		MessageEncoder.encodeChangeInstrument = function(aInstrumentId) {
			return String.fromCharCode(MessageIds.CHANGE_INSTRUMENT, aInstrumentId);
		};
		
		MessageEncoder.encodeDate = function(aDate) {
			//console.log("weblab.orchestra.websocket.MessageEncoder::encodeDate");
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
		
		MessageEncoder.decodeDate = function(aDateString) {
			//console.log("weblab.orchestra.websocket.MessageEncoder::decodeDate");
			//console.log(aDateString);
			var returnValue = 0;
			for(var i = 0; i < 6; i++) {
				var multiplier = Math.pow(2, (7*(6-i-1)));
				returnValue += aDateString.charCodeAt(i)*multiplier;
			}
			var returnDate = new Date(returnValue);
			//console.log(returnValue, returnDate.toGMTString());
			return returnDate;
		};
		
		MessageEncoder.getMessageId = function(aMessage) {
			return aMessage.charCodeAt(0);
		};
		
		MessageEncoder.decodePlayerLayoutMessage = function(aMessage, aPlayerLayout) {
			//console.log("weblab.orchestra.websocket.MessageEncoder::decodePlayerLayoutMessage");
			//console.log(aMessage.length);
			aPlayerLayout.reset();
			
			var currentPosition = 0;
			
			for(var i = 0; i < 8; i++) {
				var currentLength = aMessage.charCodeAt(currentPosition);
				for(var j = 0; j < currentLength; j++) {
					var currentStartByte = currentPosition+1+3*j;
					//console.log(i, aMessage.charCodeAt(currentStartByte), aMessage.charCodeAt(currentStartByte+1), aMessage.charCodeAt(currentStartByte+2));
					aPlayerLayout.addNote(i, aMessage.charCodeAt(currentStartByte), aMessage.charCodeAt(currentStartByte+1), aMessage.charCodeAt(currentStartByte+2));
				}
				currentPosition += 1+3*currentLength;
			}
		};
		
		MessageEncoder.decodeLoopTimes = function(aMessage) {
			//console.log("weblab.orchestra.websocket.MessageEncoder::decodeLoopTimes");
			//console.log(aMessage.length);
			
			var currentArrayLength = aMessage.length/6;
			var currentArray = new Array(currentArrayLength);
			
			for(var i = 0; i < currentArrayLength; i++) {
				currentArray[i] = MessageEncoder.decodeDate(aMessage.substring(6*i, 6*(i+1)));
			}
			
			return currentArray;
		};
		
		MessageEncoder.decodeTimes = function(aMessage) {
			//console.log("weblab.orchestra.websocket.MessageEncoder::decodeTimes");
			//console.log(aMessage.length);
			
			var currentArrayLength = aMessage.length/6;
			var currentArray = new Array(currentArrayLength);
			
			for(var i = 0; i < currentArrayLength; i++) {
				currentArray[i] = MessageEncoder.decodeDate(aMessage.substring(6*i, 6*(i+1)));
			}
			
			return currentArray;
		};
	}
})();