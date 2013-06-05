(function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.math");
	
	if(namespace.BpmFunctions === undefined) {
		
		var BpmFunctions = function BpmFunctions() {
			//MENOTE: do nothing
		};
		
		namespace.BpmFunctions = BpmFunctions;
		
		BpmFunctions.getBeatLength = function(aBpm, aNoteLength) {
		
			aNoteLength = (aNoteLength == null) ? 0.25 : aNoteLength;
			//console.log(aBpm, aNoteLength, 60*4*aNoteLength/aBpm);
			return 60*4*aNoteLength/aBpm;
		};
	}
})();