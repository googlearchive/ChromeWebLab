// 
//  player.js: interface with B-Reel's Node.js + frontend JS for blob UI
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


Orchestra.MuseumPlayer = (function() {

    var BLOB_DIMENSIONS = {
        maker: {
            radius: 25,
            spacing: 62
        }
    };

    // handles to B-Reel code
    var MuseumLiveManager = WEBLAB.namespace("WEBLAB.orchestra").MuseumLiveManager;
    var Timer = WEBLAB.namespace("WEBLAB.orchestra.timer").Timer;
    var Player = WEBLAB.namespace("WEBLAB.orchestra.ui.player").Player;

    // TutorialPlayer + deps
    var TutorialPlayer = WEBLAB.namespace("WEBLAB.orchestra.ui.player").TutorialPlayer;
    var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;
    var StandAloneCopyGenerator = WEBLAB.namespace("WEBLAB.orchestra.ui.player.copy").StandAloneCopyGenerator;
    var OrchestraCopyIds = WEBLAB.namespace("WEBLAB.common.constants").OrchestraCopyIds;
    var TutorialEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").TutorialEventTypes;
    var PlayerChangeEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").PlayerChangeEventTypes;

    // Video
    var LiveSyncedVideoPlayer = WEBLAB.namespace("WEBLAB.orchestra.ui.video").LiveSyncedVideoPlayer;
    var OrchestraConfiguration = WEBLAB.namespace("WEBLAB.orchestra").OrchestraConfiguration;
    var FixedLengthTimeCodeAdjust = WEBLAB.namespace("WEBLAB.orchestra.ui.video").FixedLengthTimeCodeAdjust;

    // BlobsLeftPanel + deps
    var BlobsLeftPanel = WEBLAB.namespace("WEBLAB.orchestra.ui.player").BlobsLeftPanel;
    var UserInteractionEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").UserInteractionEventTypes;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    // 
    var CountdownClock = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items").CountdownClock;

    /**
     * Player constructor
     */

    function MuseumPlayer(instrumentId, $player, options) {
        this.instrumentId = instrumentId;
        this.$player = $player;
        this.init(options);
    }

    // instance methods
    $.extend(MuseumPlayer.prototype, {
        /**
         *
         */
        init: function(options) {
            this.initOptions(options);
            this.initLiveManager();
            this.initPlayer();
            this.initVideo();
            this.initSync();
            this.initBlobCounter();
            this.initTutorial();
        },

        /**
         *
         */
        initOptions: function(options) {
            // defaults
            this.options = {
                video: "none"
            };

            $.extend(this.options, options);

            // canonical
            if (!this.options.video) this.options.video = "none";
        },

        /**
         *
         */
        initLiveManager: function() {
            this.liveManager = MuseumLiveManager.create();
            this.liveManager.setInstrumentId(this.instrumentId);
            this.liveManager.connect();
        },

        /**
         * For assigning callbacks
         */
        getLiveManager: function() {
            return this.liveManager;
        },

        /**
         * hook Player into DOM at correct size
         */
        initPlayer: function() {
            var dimensions = BLOB_DIMENSIONS.maker;

            this.player = Player.createMuseum(this.$player.find('.virtualPlayer').get(0),
                this.instrumentId, dimensions.radius, dimensions.spacing, 22);

            this.liveManager.setPlayerDisplay(this.player);

            // animation engine
            TWEEN.setAutostart(true);
        },

        /**
         * Init Flash or WebRTC video stream
         */
        initVideo: function() {
            switch (this.options.video) {
                case "flash":
                    $('.video .flash').show();

                    // Init video player
                    // 
                    this.videoPlayer = LiveSyncedVideoPlayer.create("/swf/LiveStreamPlayer.swf");
                    this.videoPlayer.createVideoPlayer(
                        "videoPlayer",
                        OrchestraConfiguration.LOW_LATENCY_URLS[instrument_id],
                        OrchestraConfiguration.LOW_LATENCY_IDS[instrument_id]);

                    // Correct erroneous timestamps
                    // 
                    this.videoPlayer.setTimeCodeAdjust(FixedLengthTimeCodeAdjust.create());

                    break;

                case "webrtc":
                    // first, load socket.io client
                    // 
                    $.getScript(OrchestraConfiguration.WEBRTC_SIGNALING_URL + "/socket.io/socket.io.js", function(script, textStatus, jqXHR) {

                        $('.video #webrtc').show();

                        // Init WebRTC/WebSockets connections
                        // 
                        var webrtc = new WebRTC({
                            url: OrchestraConfiguration.WEBRTC_SIGNALING_URL,
                            remoteVideosEl: 'webrtc',
                            watchOnly: true
                        });

                        // load stream
                        // 
                        webrtc.joinRoom("instrument" + instrument_id.toString());
                    });
                    break;
            }
        },

        /**
         * Set sequencer's sync mechanism:
         * sync to (Flash) video or sync to system time
         */
        initSync: function() {
            switch (this.options.video) {
                case "flash":
                    // sync sequencer to video timestamps
                    this.liveManager.setTimer(this.videoPlayer);
                    break;

                default:
                    // naïve timer assumes that UI computer is synced within 1ms to Hub via NTP
                    this.liveManager.setTimer(Timer.create());
            }
        },

        /**
         * Display of "Number of notes" to the lower-left of grid
         */
        initBlobCounter: function() {
            // setup
            this.blobsLeftPanel = BlobsLeftPanel.create(this.$player.find('.blobsLeftPanel').get(0));
            this.blobsLeftPanel.setInstrumentType("instrument" + this.instrumentId);

            // startSession
            this.blobsLeftPanel.setNumberOfVisibleBlobs(this.player.getNumberOfNotesLeft());

            // update blob counter on changes
            // see PlayerWithInterface._numberOfBlobsChanged()
            this.player.addEventListener("numberOfBlobsChanged",
                ListenerFunctions.createListenerFunction(this, function(aEvent) {
                    this.blobsLeftPanel.setNumberOfVisibleBlobs(this.player.getNumberOfNotesLeft());
                }));

            // allow drag from blob counter to sequencer
            this.blobsLeftPanel.addEventListener(UserInteractionEventTypes.DRAG_FROM_BLOBS_LEFT_PANEL,
                ListenerFunctions.createListenerFunction(this, function(aEvent) {
                    this.player.startExternalDrag();
                }));

            // "clear all" button
            this.blobsLeftPanel.addEventListener(UserInteractionEventTypes.CLEAR_ALL_NOTES,
                ListenerFunctions.createListenerFunction(this, function() {
                    this.clearAllNotes();
                }), false);

            // start, and leave open (rather than deactivating between sessions)
            this.blobsLeftPanel.activate();
        },

        /**
         *
         */
        clearAllNotes: function() {
            this.liveManager.clearAllUserNotes();
            if (this.tutorialPlayer !== null) this.tutorialPlayer.clearAllNotes();
        },

        /**
         * Tutorial
         */
        initTutorial: function() {
            this.tutorialPlayer = TutorialPlayer.create(this.player, this.$player.find('.helpLayer').get(0));

            // Tutorial copy
            var copyGenerator = StandAloneCopyGenerator.create();
            copyGenerator.addCopy(OrchestraCopyIds.TUTORIAL_ADD_BLOB, "Tap any circle <br/> to add a note");
            copyGenerator.addCopy(OrchestraCopyIds.TUTORIAL_CHANGE_BLOB, "To change the sound...");
            copyGenerator.addCopy(OrchestraCopyIds.TUTORIAL_OVER_HERE, "...drag the note over here");
            copyGenerator.addCopy(OrchestraCopyIds.TUTORIAL_REMOVE_BLOB, "Tap the note to delete");
            copyGenerator.addCopy(OrchestraCopyIds.TUTORIAL_OTHER_USER_BLOBS, "These smaller notes belong to other<br/>people online and in the museum");
            copyGenerator.addCopy(OrchestraCopyIds.TUTORIAL_NUMBER_OF_BLOBS, "You have 6 notes to play with. <br/> Get started...");
            this.tutorialPlayer.setCopyGenerator(copyGenerator);

            // user has begun tutorial: set up positions, etc.
            this.tutorialPlayer.addEventListener(TutorialEventTypes.SHOW_INTERACTIVE_PART,
                ListenerFunctions.createListenerFunction(this, function() {
                    // hide other instruments during tutorial
                    this.hideOtherInstruments();

                    // set position of first + second tutorial blobs (x1, y1, x2, y2)
                    this.tutorialPlayer.setPositions(3, 3, 7, 2);

                    // position of # blobs remaining (HARDCODED)
                    this.tutorialPlayer.setNumberOfBlobsPosition(167, 432);
                }), false);

            // user completed tutorial
            this.tutorialPlayer.addEventListener(TutorialEventTypes.DONE,
                ListenerFunctions.createListenerFunction(this, function(aEvent) {
                    if ( !! this.tutorialDoneCallback) this.tutorialDoneCallback();
                }), false);
        },

        /**
         * start tutorial
         *
         * MUST be called when player is visible, otherwise DOM manipulation calls
         * will fail and first message won't fully display.
         */
        startTutorial: function() {
            this.tutorialPlayer.startTutorial();
        },

        /**
         *
         */
        stopTutorial: function() {
            this.tutorialPlayer.cancelTutorial();
        },

        /**
         * just hide final step of tutorial (user has ostensibly completed it)
         */
        closeTutorial: function() {
            this.tutorialPlayer._numberOfBlobsHelpPointer.hide();
        },

        /**
         *
         */
        hideOtherInstruments: function() {
            for (var i = 0; i < 8; i++) {
                if (i != this.instrumentId) this.player.setInstrumentAsUnstarted(i);
            };
        },

        /**
         *
         */
        showOtherInstruments: function() {
            for (var i = 0; i < 8; i++) {
                if (i != this.instrumentId) this.player.setInstrumentAsStarted(i);
            };
        }

    });

    return MuseumPlayer;
})();
