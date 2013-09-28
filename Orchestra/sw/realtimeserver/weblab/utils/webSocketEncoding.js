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

var encodeUtf8MessageHybi00 = function(aMessage) {

    var messageLength = Buffer.byteLength(aMessage, "utf8");
    var returnBuffer = new Buffer(messageLength + 2);

    returnBuffer[0] = 0x00;
    returnBuffer.write(aMessage, 1, "utf8");
    returnBuffer[messageLength + 1] = 0xFF;

    return returnBuffer;
};

var encodeUtf8MessageHybi06WithForcedMasks = function(aMessage, aMask1, aMask2, aMask3, aMask4) {
    var messageLength = Buffer.byteLength(aMessage, "utf8");

    var lengthCode = messageLength;
    var maskOffset = 2;
    var messageOffset = 6;
    var extendedLength = 0;
    if (messageLength > 0xFFFF) {
        lengthCode = 127;
        maskOffset = 10;
        messageOffset = 14;
        extendedLength = 8;
    } else if (messageLength > 125) {
        lengthCode = 126;
        maskOffset = 4;
        messageOffset = 8;
        extendedLength = 2;
    }

    var returnBuffer = new Buffer(messageLength + messageOffset);

    returnBuffer[0] = 0x81; //FIN, reserved and opcode
    returnBuffer[1] = 0x80 | lengthCode; //Mask bit and length code

    //Extended length
    for (var i = 0; i < extendedLength; i++) {
        returnBuffer[i + 2] = (messageLength >> (8 * (extendedLength - i - 1))) & 0xFF;
    }

    var maskBuffer = new Buffer(4);
    maskBuffer[0] = aMask1;
    maskBuffer[1] = aMask2;
    maskBuffer[2] = aMask3;
    maskBuffer[3] = aMask4;

    //Mask
    maskBuffer.copy(returnBuffer, maskOffset, 0, 4);

    var messageBuffer = new Buffer(messageLength);
    messageBuffer.write(aMessage, 0, "utf8");

    //Data
    for (var i = 0; i < messageLength; i++) {
        var currentMask = maskBuffer[i % 4];
        returnBuffer[i + messageOffset] = currentMask ^ messageBuffer[i];
    }

    return returnBuffer;
};

var encodeUtf8MessageHybi06WithoutMasks = function(aMessage, aOpcode) {

    aOpcode = (aOpcode != undefined) ? aOpcode : 0x01;

    var messageLength = Buffer.byteLength(aMessage, "utf8");

    var lengthCode = messageLength;
    var messageOffset = 2;
    var extendedLength = 0;
    if (messageLength > 0xFFFF) {
        lengthCode = 127;
        messageOffset = 10;
        extendedLength = 8;
    } else if (messageLength > 125) {
        lengthCode = 126;
        messageOffset = 4;
        extendedLength = 2;
    }

    var returnBuffer = new Buffer(messageLength + messageOffset);

    returnBuffer[0] = 0x80 | aOpcode; //FIN, reserved and opcode
    returnBuffer[1] = 0x00 | lengthCode; //Mask bit and length code

    //Extended length
    for (var i = 0; i < extendedLength; i++) {
        returnBuffer[i + 2] = (messageLength >> (8 * (extendedLength - i - 1))) & 0xFF;
    }

    returnBuffer.write(aMessage, messageOffset, "utf8");

    return returnBuffer;
};

var encodeUtf8MessageHybi06 = function(aMessage) {

    return encodeUtf8MessageHybi06WithForcedMasks(aMessage, Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256));

};


var decodeOpcodeHybi00 = function(aBuffer) {
    if (aBuffer.length == 2) {
        return 0x0A; //MENOTE: empty pong frame
    }
    return 0x01;
};

var decodeMessagesHybi00 = function(aBuffer) {
    return aBuffer.slice(1, aBuffer.length - 1);
};

var decodeOpcodeHybi06 = function(aBuffer) {
    return aBuffer[0] & 0x0F;
};

var decodeMessagesHybi06 = function(aBuffer) {

    //METODO: implement multiple message decode
    //console.log(aBuffer);

    var continuationBit = aBuffer[0] & 0x80; //METODO: implement continuation
    var maskBit = aBuffer[1] & 0x80;
    var lengthCode = aBuffer[1] & 0x7F;
    var maskOffset = 2;
    var length = lengthCode;
    if (lengthCode == 0x7F) {
        maskOffset = 10;
        for (var i = 0; i < 8; i++) {
            length += aBuffer[2 + i] << ((8 - 1) - i);
        }
    } else if (lengthCode == 0x7E) {
        maskOffset = 4;
        length = 0;
        for (var i = 0; i < 2; i++) {
            length += aBuffer[2 + i] << ((2 - 1) - i);
        }
    }
    if (maskBit == 0x80) {
        var maskBuffer = aBuffer.slice(maskOffset, maskOffset + 4);
        var messageBuffer = aBuffer.slice(maskOffset + 4, maskOffset + 4 + length);
        for (var i = 0; i < length; i++) {
            messageBuffer[i] ^= maskBuffer[i % 4];
        }
        //console.log(messageBuffer);
        return messageBuffer;
    } else {
        return aBuffer.slice(maskOffset);
    }
};

var decodeOpcode = function(aType, aBuffer) {
    switch (aType) {
        case 0:
            return decodeOpcodeHybi00(aBuffer);
        case 1:
            return decodeOpcodeHybi06(aBuffer);
        default:
            console.error("No type named " + aType + ". Can't decode opcode.");
            return null;
    }
};

var decodeMessages = function(aType, aBuffer) {
    switch (aType) {
        case 0:
            return decodeMessagesHybi00(aBuffer);
        case 1:
            return decodeMessagesHybi06(aBuffer);
        default:
            console.error("No type named " + aType + ". Can't decode message.");
            return null;
    }
};

var splitMessagesHybi00 = function(aBuffer, aReturnArray) {
    var currentPosition = 0;
    var length = aBuffer.length;
    for (var i = 0; i < length; i++) {
        if (aBuffer[i] == 0xFF) {
            aReturnArray.push(aBuffer.slice(currentPosition, i + 1));
            currentPosition = i + 1;
        }
    }
};

var splitMessagesHybi06 = function(aBuffer, aReturnArray) {

    var continuationBit = aBuffer[0] & 0x80;
    var maskBit = aBuffer[1] & 0x80;
    var lengthCode = aBuffer[1] & 0x7F;
    var startPosition = 2;
    var length = lengthCode;
    if (lengthCode == 0x7F) {
        startPosition = 10;
        for (var i = 0; i < 8; i++) {
            length += aBuffer[2 + i] << ((8 - 1) - i);
        }
    } else if (lengthCode == 0x7E) {
        startPosition = 4;
        length = 0;
        for (var i = 0; i < 2; i++) {
            length += aBuffer[2 + i] << ((2 - 1) - i);
        }
    }

    if (maskBit == 0x80) {
        startPosition += 4;
    }


    aReturnArray.push(aBuffer.slice(0, startPosition + length));

    if (startPosition + length < aBuffer.length) {
        splitMessagesHybi06(aBuffer.slice(startPosition + length), aReturnArray);
    }
};

var splitMessages = function(aType, aBuffer, aReturnArray) {
    switch (aType) {
        case 0:
            return splitMessagesHybi00(aBuffer, aReturnArray);
        case 1:
            return splitMessagesHybi06(aBuffer, aReturnArray);
        default:
            console.error("No type named " + aType + ". Can't split message.");
            return null;
    }
};

var getAvailableDataLengthHybi00 = function(aBuffer) {

    if (aBuffer.length > 0 && aBuffer[0] != 0x00) {
        return -1;
    }

    for (var i = aBuffer.length; i > 0; i--) {
        if (aBuffer[i - 1] == 0xFF) {
            return i;
        }
    }
    return 0;
};

var getAvailableDataLengthHybi06 = function(aBuffer) {

    if (aBuffer.length > 0) {
        var reservedBits = aBuffer[0] & 0xF0;
        if (reservedBits != 0 && reservedBits != 0x80) {
            return -1;
        }
    }


    var returnValue = 0;

    var currentPosition = 0;
    var debugCounter = 0;

    while (currentPosition < aBuffer.length) {
        if (debugCounter++ > 50) {
            console.error("Length of messages are too long.");
            console.log(aBuffer);
            return -1;
        }
        var continuationBit = aBuffer[currentPosition] & 0x80;
        var maskBit = aBuffer[currentPosition + 1] & 0x80;
        var lengthCode = aBuffer[currentPosition + 1] & 0x7F;
        var startPosition = currentPosition + 2;
        var length = lengthCode;
        if (lengthCode == 0x7F) {
            startPosition = currentPosition + 10;
            for (var i = 0; i < 8; i++) {
                length += aBuffer[currentPosition + 2 + i] << ((8 - 1) - i);
            }
        } else if (lengthCode == 0x7E) {
            startPosition = currentPosition + 4;
            length = 0;
            for (var i = 0; i < 2; i++) {
                length += aBuffer[currentPosition + 2 + i] << ((2 - 1) - i);
            }
        }

        if (maskBit == 0x80) {
            startPosition += 4;
        }

        if (startPosition + length <= aBuffer.length) {
            returnValue = startPosition + length;
        }
        currentPosition = startPosition + length;
    }

    return returnValue;
};

var getAvailableDataLength = function(aType, aBuffer) {
    switch (aType) {
        case 0:
            return getAvailableDataLengthHybi00(aBuffer);
        case 1:
            return getAvailableDataLengthHybi06(aBuffer);
        default:
            console.error("No type named " + aType + ". Can't determin available data length.");
            return -1;
    }
};

exports.encodeUtf8MessageHybi00 = encodeUtf8MessageHybi00;
exports.encodeUtf8MessageHybi06 = encodeUtf8MessageHybi06;
exports.encodeUtf8MessageHybi06WithForcedMasks = encodeUtf8MessageHybi06WithForcedMasks;
exports.encodeUtf8MessageHybi06WithoutMasks = encodeUtf8MessageHybi06WithoutMasks;
exports.decodeMessagesHybi00 = decodeMessagesHybi00;
exports.decodeMessagesHybi06 = decodeMessagesHybi06;
exports.decodeMessages = decodeMessages;
exports.decodeOpcodeHybi00 = decodeOpcodeHybi00;
exports.decodeOpcodeHybi06 = decodeOpcodeHybi06;
exports.decodeOpcode = decodeOpcode;
exports.splitMessagesHybi00 = splitMessagesHybi00;
exports.splitMessagesHybi06 = splitMessagesHybi06;
exports.splitMessages = splitMessages;
exports.getAvailableDataLengthHybi00 = getAvailableDataLengthHybi00;
exports.getAvailableDataLengthHybi06 = getAvailableDataLengthHybi06;
exports.getAvailableDataLength = getAvailableDataLength;
