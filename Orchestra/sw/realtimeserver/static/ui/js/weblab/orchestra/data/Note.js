/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.data");
	
	if(namespace.Note === undefined) {
		
		var Note = function Note() {
			this._init();
		};
		
		namespace.Note = Note;
		
		var p = Note.prototype;
		
		p._init = function() {
			
			this.position = -1;
			this.pitch = -1;
			
			return this;
		};
		
		p.setPositionAndPitch = function(aPosition, aPitch) {
			
			this.position = aPosition;
			this.pitch = aPitch;
			
			return this;
		}
		
		p.destroy = function() {
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		Note.create = function(aPosition, aPitch) {
			var newNote = new Note();
			
			newNote.setPositionAndPitch(aPosition, aPitch);
			
			return newNote;
		}
	}
})();