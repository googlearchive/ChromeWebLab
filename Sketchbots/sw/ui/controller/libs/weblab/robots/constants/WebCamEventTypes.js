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