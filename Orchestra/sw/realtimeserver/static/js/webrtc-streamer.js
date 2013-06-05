/**
* Copyright Google Inc, 2013
* See LICENSE.TXT for licensing information.
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
  webrtc.on('readyToCall', function () {
    if (params.instrument !== undefined) webrtc.joinRoom("instrument" + params.instrument.toString());
  });

});
