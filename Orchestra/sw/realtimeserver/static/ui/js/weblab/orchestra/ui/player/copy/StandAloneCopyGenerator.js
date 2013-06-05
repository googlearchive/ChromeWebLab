/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player.copy");
	
	if(namespace.StandAloneCopyGenerator === undefined) {
		
		var StandAloneCopyGenerator = function StandAloneCopyGenerator() {
			this._init();
		};
		
		namespace.StandAloneCopyGenerator = StandAloneCopyGenerator;
		
		var p = StandAloneCopyGenerator.prototype;
		
		p._init = function() {
			
			this._copyObject = new Object();
			
			return this;
		};
		
		p.addCopy = function(aId, aCopy) {
			
			this._copyObject[aId] = aCopy;
			
			return this;
		};
		
		p.setCopyObject = function(aObject) {
			this._copyObject = aObject;
			
			return this;
		};
		
		p.getCopy = function(aId) {
			if(this._copyObject[aId] === undefined) {
				return "Copy not found (" + aId + ")";
			}
			return this._copyObject[aId];
		};
		
		p.destroy = function() {
			this._copyObject = null;
		};
		
		StandAloneCopyGenerator.create = function() {
			var newStandAloneCopyGenerator = new StandAloneCopyGenerator();
			return newStandAloneCopyGenerator;
		}
	}
})();