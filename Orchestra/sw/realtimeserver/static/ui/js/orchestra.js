/**
* orchestra.js: controller logic for Orchestra UI,
* receives messages from the badge reader and Node.js server,
* and displays blob interface.
*
* Copyright Google Inc, 2013
* See LICENSE.TXT for licensing information.
*/

var Orchestra = {};
var instrument_id;
var instrument = null;

var OrchestraConfiguration = WEBLAB.namespace("WEBLAB.orchestra").OrchestraConfiguration;

$(document).ready(function() {

  // Set instrument ID based on query string (default 0)
  // 
  instrument_id = params.instrument;

  // init player
  // 
  instrument = new Orchestra.Instrument(instrument_id, params.video);

  // init MIDI drop zone
  // 
  $('#midi').midi_drop(instrument.player);
});
