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

var Note = function Note() {

    this.position = -1;
    this.pitch = -1;

};

var p = Note.prototype;

p.setPositionAndPitch = function(aPosition, aPitch) {

    this.position = aPosition;
    this.pitch = aPitch;

    return this;
}

p.toString = function() {
    return "[Note (position: " + this.position + ", pitch, " + this.pitch + ")]";
};

exports.Note = Note;
exports.create = function(aPosition, aPitch) {
    var newNote = new Note();

    newNote.setPositionAndPitch(aPosition, aPitch);

    return newNote;
}
