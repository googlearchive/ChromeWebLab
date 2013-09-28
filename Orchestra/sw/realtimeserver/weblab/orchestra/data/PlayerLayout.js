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

var InstrumentNotes = require("./InstrumentNotes");

var weblabConfiguration = require("../../configuration");

var PlayerLayout = function PlayerLayout() {

    this._numberOfInstruments = weblabConfiguration.NUMBER_OF_INSTRUMENTS;
    this._numberOfPitches = weblabConfiguration.NUMBER_OF_PITCHES;
    this.instruments = new Array(this._numberOfInstruments);

    for (var i = 0; i < this._numberOfInstruments; i++) {
        this.instruments[i] = InstrumentNotes.create(this._numberOfPitches);
    }
};

var p = PlayerLayout.prototype;

p.addNote = function(aInstumentId, aNoteId, aPosition, aPitch) {
    //console.log("weblab.orchestra.data.PlayerLayout::addNote");
    //console.log(aInstumentId, aNoteId, aPosition, aPitch);

    if (!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;

    return this.instruments[aInstumentId].addNote(aNoteId, aPosition, aPitch);
};

p.changeNote = function(aInstumentId, aNoteId, aPosition, aPitch) {
    if (!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;

    return this.instruments[aInstumentId].changeNote(aNoteId, aPosition, aPitch);
};

p.removeNote = function(aInstumentId, aNoteId) {
    if (!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;

    return this.instruments[aInstumentId].removeNote(aNoteId);
};

p.removeAllNotesForInstrument = function(aInstumentId) {
    return this.instruments[aInstumentId].removeAllNotes();
};

p.getFirstPlayingNote = function(aInstumentId) {
    if (!(aInstumentId >= 0 && aInstumentId < this._numberOfInstruments)) return false;

    return this.instruments[aInstumentId].getFirstPlayingNote();
};

p.reset = function() {
    var currentArray = this.instruments;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentInstrument = currentArray[i];
        currentInstrument.reset();
    }
};

p.getReadableString = function() {

    var returnArray = new Array();

    var currentArray = this.instruments;
    var currentArrayLength = currentArray.length;
    for (var i = 0; i < currentArrayLength; i++) {
        var currentInstrument = currentArray[i];
        var currentString = "(" + i + ": " + currentInstrument.notes.join(",") + ")";
        returnArray.push(currentString);
    }

    return returnArray.join(",");
};

exports.PlayerLayout = PlayerLayout;
exports.create = function() {
    return new PlayerLayout();
};
