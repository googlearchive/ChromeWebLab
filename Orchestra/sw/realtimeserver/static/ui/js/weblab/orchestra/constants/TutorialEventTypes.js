/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.constants");
	
	if(namespace.TutorialEventTypes === undefined) {
		
		var TutorialEventTypes = function TutorialEventTypes() {
			//MENOTE: do nothing
		};
		
		namespace.TutorialEventTypes = TutorialEventTypes;
		
		TutorialEventTypes.SKIP = "skip";
		TutorialEventTypes.SHOW_INTERACTIVE_PART = "showInteractivePart";
		TutorialEventTypes.DONE = "done";
		
		TutorialEventTypes.STATE_CHANGED = "stateChanged";
	}
})();