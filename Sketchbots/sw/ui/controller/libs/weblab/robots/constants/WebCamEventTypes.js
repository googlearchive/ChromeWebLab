/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
(function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.robots.constants");
	
	if(namespace.WebCamEventTypes === undefined) {
		
		var WebCamEventTypes = function WebCamEventTypes() {
			
		};
		
		namespace.WebCamEventTypes = WebCamEventTypes;

		WebCamEventTypes.PICTURE_TAKEN = "pictureTaken";
		WebCamEventTypes.WEBCAM_READY = 'webCamReady';
		WebCamEventTypes.NEED_WEBRTC_PERMISSION = 'needWebRTCPermission';
		WebCamEventTypes.WEBCAM_ACCESS_DENIED = 'webCamAccessDenied';
		WebCamEventTypes.WEBCAM_NOT_FOUND = 'webCamNotFound';
	}
})();