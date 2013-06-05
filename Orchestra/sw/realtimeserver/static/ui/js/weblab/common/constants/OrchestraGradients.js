/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.common.constants");
	
	if(namespace.OrchestraGradients === undefined) {
		
		var OrchestraGradients = function OrchestraGradients() {
			//MENOTE: do nothing
		};
		
		namespace.OrchestraGradients = OrchestraGradients;
		
		OrchestraGradients.INSTRUMENT_MAPPING = [5, 2, 0, 6, 1, 4, 3, 7];
		
		OrchestraGradients.TOP_CSS_VALUES =    ["rgb(110, 202, 222)", "rgb(75, 121, 209)", "rgb(190, 108, 145)", "rgb(232, 150, 128)", "rgb(230, 167, 90)",  "rgb(209, 205, 84)", "rgb(158, 200, 112)", "rgb(161, 224, 197)"];
		OrchestraGradients.BOTTOM_CSS_VALUES = ["rgb(129, 173, 235)", "rgb(101, 96, 173)", "rgb(138, 127, 179)", "rgb(220, 119, 164)", "rgb(219, 128, 110)", "rgb(157, 186, 77)", "rgb(111, 179, 167)", "rgb(119, 210, 224)"];
		OrchestraGradients.SOLID_CSS_VALUES =  ["rgb(120, 187, 229)", "rgb(84, 113, 197)", "rgb(162, 118, 163)", "rgb(226, 135, 146)", "rgb(226, 151, 98)",  "rgb(192, 199, 82)", "rgb(125, 185, 150)", "rgb(159, 221, 209)"];
	
		OrchestraGradients.TOP_CSS_VALUES_TINTED = ["rgb(174,212,220)","rgb(160,180,215)","rgb(206,175,189)","rgb(223,191,183)","rgb(222,198,167)","rgb(214,213,165)","rgb(193,211,176)","rgb(195,221,210)"];
		OrchestraGradients.BOTTOM_CSS_VALUES_TINTED = ["rgb(182,201,225)","rgb(171,170,201)","rgb(185,182,203)","rgb(218,179,197)","rgb(218,183,175)","rgb(193,206,162)","rgb(175,203,198)","rgb(178,215,221)"];
	}

})();