// 
//  instrument.js: controller logic for online/museum instruments +
//  the various ways that UIs can take control of it
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

Orchestra.Instrument = (function() {
  
  // durations (seconds)
  var TUTORIAL_TIMEOUT_DURATION = 20;
  
  /**
  * constructor
  */
  var Instrument = function(instrumentId, videoFormat) {
    this.instrumentId = instrumentId;
    
    // DOM tools
    this.navigation = new Orchestra.Navigation(instrumentId);
    
    this.player = new Orchestra.MuseumPlayer(
      instrumentId,
      $('#play'),
      {video: videoFormat});

    this.init();
  };
  
  // instance methods
  $.extend(Instrument.prototype, {
    
    /**
    * handlers and first screen
    */
    init: function() {
      // handle for callbacks
      var instrument = this;
      
      // button: SKIP TUTORIAL
      this.navigation.getPlayerElement().find('.skipTutorialButton').click(function() {
        instrument.player.stopTutorial();
        instrument.tutorialDone();
        return false;
      });
      
      // callback: TUTORIAL DONE
      this.player.tutorialDoneCallback = function() {
        instrument.tutorialDone();
        
        // close last tutorial tip after a few seconds, regardless of activity
        setTimeout(function() {
          instrument.player.closeTutorial();
        }, 4000);
      };
      
      // GO
      this.play();
    },
    
    /**
    * when tutorial finishes (whether user completed or skipped it)
    */
    tutorialDone: function() {
      // show other instruments
      this.player.showOtherInstruments();
      
      if (this.tutorialTimeout) clearTimeout(this.tutorialTimeout);
      this.tutorialTimeout = false;
      
      // hide "skip tutorial" button, show recording button if badged in
      this.navigation.resetPlayButtons(false, false);
    },
    
    /**
    * Beginning to play
    */
    play: function() {
      
      // callback: player is visible
      var instrument = this;
      this.player.getLiveManager().addEventListener("readyForTutorial", function() {
        instrument.navigation.fadeToPane('play');
        instrument.player.startTutorial();

        if (instrument.tutorialTimeout) clearTimeout(instrument.tutorialTimeout);

        // tutorial timeout
        instrument.tutorialTimeout = setTimeout(function() {
          instrument.player.stopTutorial();
          instrument.tutorialDone();
        }, TUTORIAL_TIMEOUT_DURATION * 1000);
      });
      
      // set up play screen (on first session, loading screen will appear first)
      this.navigation.play(false, false);
    }
  });
  
  return Instrument;
})();
