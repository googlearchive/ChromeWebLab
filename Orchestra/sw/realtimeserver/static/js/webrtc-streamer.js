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

var OrchestraConfiguration = WEBLAB.namespace("WEBLAB.orchestra").OrchestraConfiguration;

// load socket.io, then fire up stream
// 
$.getScript(OrchestraConfiguration.WEBRTC_SIGNALING_URL + "/socket.io/socket.io.js", function(script, textStatus, jqXHR) {

    // create our webrtc connection
    // 
    var webrtc = new WebRTC({
        url: OrchestraConfiguration.WEBRTC_SIGNALING_URL,
        localVideoEl: 'localVideo',
        autoRequestMedia: true
    });

    // when video stream is loaded, join "room" for this instrument
    // 
    webrtc.on('readyToCall', function() {

        if (params.instrument !== undefined) {
            webrtc.createRoom("instrument" + params.instrument.toString(), function(err, name) {
                console.log(err, name);
                if (err) {

                }
            });
        }
    });

});
