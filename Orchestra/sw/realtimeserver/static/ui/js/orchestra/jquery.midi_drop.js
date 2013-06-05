/*
 * jquery.midi_drop.js: Load a MIDI file, parse it using jasmid,
 * and plug its notes in the Universal Orchestra sequencer
 *
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

jQuery.fn.midi_drop = function(player) {
  var MIDI_TICKS_PER_BEAT = 48; // eighth note
  var ROOT_MIDI_NOTE = 60;

  return this.each(function() {
    
    /**
    * When user selects or drops a file,
    * load the binary data.
    */
    $(this).change(function(e) {
      
      // For each file selected (should be just one)
      // 
      $.each(e.target.files, function(index, file) {

        // Load binary data
        // 
        var reader = new FileReader();
        reader.onload = loadBinaryFile;
        reader.readAsBinaryString(file);
      });

      // reset input so that this handler is called if user reloads same file
      $(this).val('');
    });
    
    // hover class
    // 
    $(this).closest('.midi').hover(
      function() { $(this).addClass("hover") },
      function() { $(this).removeClass("hover") }
    );

    /**
    * Load binary file as a string,
    * make sure it's MIDI.
    */
    function loadBinaryFile(e) {

      // Parse as MIDI
      // 
      var midiFile = MidiFile(e.target.result);

      // If it looks like MIDI, proceed.
      // TODO: better way to test for this?
      // 
      if (midiFile.tracks.length) {
        var notes = parseMidiFile(midiFile);
        sendNoteEvents(notes);
      }
    }

    /**
    * Parse individual note events out of MIDI file
    */
    function parseMidiFile(midiFile) {
      var midiTime = 0;
      var notes = [];

      // For each MIDI event in first track
      // 
      $.each(midiFile.tracks[0], function(index, midiEvent) {
        midiTime += midiEvent.deltaTime;

        // Check for noteOns
        // 
        if (midiEvent.subtype == "noteOn") {
          notes.push({
            midiTime: midiTime,
            midiPitch: midiEvent.noteNumber
          });
        }
      });

      return notes;
    }

    /**
    * Given an array of notes, massage the data
    * and apply it to the sequencer
    */
    function sendNoteEvents(notes) {

      // clear all existing notes
      // 
      player.clearAllNotes();

      if (notes.length > OrchestraConfiguration.MAX_NUMBER_OF_NOTES) {
        console.log("WARNING: MIDI file contains more than " + OrchestraConfiguration.MAX_NUMBER_OF_NOTES + " notes");
      }

      for (note_index in notes) {
        // only include notes within MAX
        if (note_index < OrchestraConfiguration.MAX_NUMBER_OF_NOTES) {
          player.getLiveManager().getPlayerDisplay().externalAddUserNote(
            notes[note_index].midiTime / MIDI_TICKS_PER_BEAT,
            (OrchestraConfiguration.NUMBER_OF_PITCHES-1) - (notes[note_index].midiPitch - ROOT_MIDI_NOTE));
        }
      }
    }
  });
}
