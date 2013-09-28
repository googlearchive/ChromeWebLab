// 
//  navigation.js: DOM code for navigation in between "panes", or UI screens
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
            this.fadeIn($('.pane').filter('#' + pane));
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
