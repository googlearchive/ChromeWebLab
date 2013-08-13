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
var Note = require("./Note");

var weblabConfiguration = require("../../configuration");

var InstrumentNotes = function InstrumentNotes() {

    this._maxNumberOfNotes = weblabConfiguration.MAX_NUMBER_OF_NOTES;
    this._numberOfPositions = 16;
    this._numberOfPitches = -1;
    this.notes = new Array(this._maxNumberOfNotes);

};

var p = InstrumentNotes.prototype;

p.setNumberOfPitches = function(aNumberOfPitches) {
    this._numberOfPitches = aNumberOfPitches;

    return this;
};

p.addNote = function(aId, aPosition, aPitch) {
    //console.log("weblab.orchestra.data.InstrumentNotes::addNote");
    //console.log(aId, aPosition, aPitch);

    if (!(aId >= 0 && aId < this._maxNumberOfNotes) || this.notes[aId] != null) return false;

    if (!(aPosition >= 0 && aPosition < this._numberOfPositions && aPitch >= 0 && aPitch < this._numberOfPitches)) {
        return false;
    }

    var currentArray = this.notes;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var testNote = currentArray[i];
        if (testNote != null && testNote.position == aPosition && testNote.pitch == aPitch) {
            return false;
        }
    }

    this.notes[aId] = Note.create(aPosition, aPitch);

    return true;
};

p.removeNote = function(aId) {
    if (!(aId >= 0 && aId < this._maxNumberOfNotes) || this.notes[aId] == null) return false;

    this.notes[aId] = null;

    return true;
};

p.changeNote = function(aId, aPosition, aPitch) {
    if (!(aId >= 0 && aId < this._maxNumberOfNotes)) return false;
    var currentNote = this.notes[aId];
    if (currentNote == null) return false;

    if (!(aPosition >= 0 && aPosition < this._numberOfPositions && aPitch >= 0 && aPitch < this._numberOfPitches)) {
        return false;
    }

    var currentArray = this.notes;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var testNote = currentArray[i];
        if (testNote != null && i != aId && testNote.position == aPosition && testNote.pitch == aPitch) {
            return false;
        }
    }


    currentNote.position = aPosition;
    currentNote.pitch = aPitch;

    return true;
};

p.removeAllNotes = function() {
    var currentArray = this.notes;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        this.notes[i] = null;
    }

    return true;
};

p.getFirstPlayingNote = function() {
    var currentArray = this.notes;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        if (currentArray[i] != null) {
            return i;
        }
    }
    return -1;
};

p.reset = function() {
    var currentArray = this.notes;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        currentArray[i] = null;
    }
};

p.toString = function() {
    var returnString = "[";
    var listArray = new Array(this._maxNumberOfNotes);
    for (var i = 0; i < this._maxNumberOfNotes; i++) {
        if (this.notes[i] == null) {
            listArray[i] = "    ";
        } else {
            listArray[i] = this.notes[i].position + "," + this.notes[i].pitch;
        }
    }
    returnString += listArray.join(";");
    returnString += "]";
    return returnString;
}

exports.InstrumentNotes = InstrumentNotes;
exports.create = function(aNumberOfPitches) {
    var newInstrumentNotes = new InstrumentNotes();
    newInstrumentNotes.setNumberOfPitches(aNumberOfPitches);
    return newInstrumentNotes;
};
