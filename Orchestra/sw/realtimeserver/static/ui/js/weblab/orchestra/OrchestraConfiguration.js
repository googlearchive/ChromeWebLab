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
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra");
	var singletonsNamespace = WEBLAB.namespace("WEBLAB.orchestra.singletons");
	var commonSingletons = WEBLAB.namespace("WEBLAB.common.singletons");
	
	if(namespace.OrchestraConfiguration === undefined) {
		
		var OrchestraConfiguration = function OrchestraConfiguration() {
			
		};
		
		namespace.OrchestraConfiguration = OrchestraConfiguration;
		
		// NOTE: The below values may need to be kept in sync with constants
		// in other components of the system. Please consult the README.

		// Realtime server
		// 
		OrchestraConfiguration.REALTIME_SERVER_HOST = "ws://127.0.0.1:8080";
		
		// Sequencer constants
		// 
		OrchestraConfiguration.NUMBER_OF_INSTRUMENTS = 2;
		OrchestraConfiguration.NUMBER_OF_PITCHES = 4;
		OrchestraConfiguration.MAX_NUMBER_OF_NOTES = 6;

		// Flash video
		// 
		OrchestraConfiguration.LOW_LATENCY_URLS = [
			"rtmp://localhost/oflaDemo"
		];
		OrchestraConfiguration.LOW_LATENCY_IDS = [
			"red5StreamDemo"
		];

		// WebRTC video only
		// 
		OrchestraConfiguration.WEBRTC_SIGNALING_URL = "http://127.0.0.1:8888";
	}
})();