/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
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
	return "[Note (position: " + this.position +", pitch, " + this.pitch + ")]";
};

exports.Note = Note;
exports.create = function(aPosition, aPitch) {
	var newNote = new Note();
	
	newNote.setPositionAndPitch(aPosition, aPitch);
	
	return newNote;
}