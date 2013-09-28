// 
//  playback.js: cue up notes to play
//  
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

// global
var sequencer = new Global("sequencer");

var ROOT_MIDI_PITCH = 60;
var PITCHES_PER_INSTRUMENT = 4;

// use high-priority thread
msg_int.immediate = 1;

// tooltip
setoutletassist(0, function(num) {
    assist("MIDI note to trigger");
})

/**
 * Check to see if there are any notes to play at
 * this step of the sequencer (0-15), and play them!
 */

function msg_int(step) {
    // For each instrument...
    for (instrument_index in sequencer.instruments) {
        var instrument = sequencer.instruments[instrument_index];

        // For each note...
        for (note_index in instrument) {
            var note = instrument[note_index];

            if (note["pos"] == step) {
                var midi_pitch = ROOT_MIDI_PITCH +
                    instrument_index * PITCHES_PER_INSTRUMENT +
                    (PITCHES_PER_INSTRUMENT - 1) - note["pitch"];

                // play note!
                outlet(0, midi_pitch);
            }
        }
    }
}
