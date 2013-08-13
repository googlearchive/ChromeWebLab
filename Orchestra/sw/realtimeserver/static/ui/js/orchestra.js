/**
 * orchestra.js: controller logic for Orchestra UI,
 * receives messages from the badge reader and Node.js server,
 * and displays blob interface.
 *
 */

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
