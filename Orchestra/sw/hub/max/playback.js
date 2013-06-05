// 
//  playback.js: cue up notes to play
//  
//  Copyright Google Inc, 2013
//  See LICENSE.TXT for licensing information.
// 

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
