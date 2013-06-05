// 
//  navigation.js: DOM code for navigation in between "panes", or UI screens
//  
//  Copyright Google Inc, 2013
//  See LICENSE.TXT for licensing information.
// 


Orchestra.Navigation = (function() {
  
  var PAUSE_DELAY = 4 * 1000; // milis
  var FADE_DURATION = 400;
  
  /**
  * constructor: init DOM things for online/museum
  */
  var Navigation = function(instrumentId) {
    this.$player = $('#play');
  };
  
  // instance methods
  $.extend(Navigation.prototype, {
    
    /**
    * show 'play' pane
    */
    play: function(continuing, isBadgedIn) {
      // in case it was hidden by recording
      this.$player.show();
      
      // reset visible buttons
      this.resetPlayButtons(!continuing, isBadgedIn);
      
      // if user was prompted for badge, clear that timeout.
      clearTimeout(this.promptTimeout);
      
      // fade to 'loading' on first time--player will set it to 'play' when ready
      this.fadeToPane('loading');
    },
    
    /**
    * Play buttons are just Tutorial buttons now.
    */
    resetPlayButtons: function(showTutorial, isBadgedIn) {
      // if we already did the tutorial, ignore the incoming args
      if (this.tutorialDone) showTutorial = false;
      
      // show tutorial controls on first play only
      this.$player.find('.tutorialControls').toggle(showTutorial);
      
      // make a note if we're hiding the tutorial (it's done)
      if (!showTutorial) this.tutorialDone = true;
    },
    
    /**
    * Fade out whatever we happen to be on (if any),
    * and fade in the new one
    */
    fadeToPane: function(pane) {
      this.fadeOut($('.pane.fadeIn'));
      this.fadeIn($('.pane').filter('#'+pane));
    },
    
    fadeIn: function($el) {
      $el.removeClass('fadeOut').addClass('fadeIn');
    },
    fadeOut: function($el) {
      $el.removeClass('fadeIn').addClass('fadeOut');
    },
    
    /**
    * helper
    */
    getPlayerElement: function() {
      return this.$player;
    }
  });
  
  return Navigation;
})();
