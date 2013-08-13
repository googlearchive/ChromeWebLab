(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.events");
    var commonSingletonsNamespace = WEBLAB.namespace("WEBLAB.common.singletons");

    if (namespace.SoundListeners === undefined) {

        var SoundListeners = function SoundListeners() {
            //MENOTE: do nothing
        };

        namespace.SoundListeners = SoundListeners;

        SoundListeners.soundFunctions = new Object();
        SoundListeners.randomSoundFunctions = new Object();

        SoundListeners.STANDARD_BIG_BUTTON_CLICK = "common/standardBigButton/click";
        SoundListeners.STANDARD_BIG_BUTTON_CLICK_SOUNDS = ["common/bigButton/click1", "common/bigButton/click2", "common/bigButton/click3"];
        SoundListeners.STANDARD_BIG_BUTTON_ROLLOVER = "common/standardBigButton/rollover";
        SoundListeners.STANDARD_BIG_BUTTON_ROLLOVER_SOUNDS = ["common/bigButton/rollover1", "common/bigButton/rollover2", "common/bigButton/rollover3"];

        SoundListeners.STANDARD_SMALL_BUTTON_CLICK = "common/standardSmallButton/click";
        SoundListeners.STANDARD_SMALL_BUTTON_CLICK_SOUNDS = ["common/smallButton/click1", "common/smallButton/click2", "common/smallButton/click3"];
        SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER = "common/standardSmallButton/rollover";
        SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER_SOUNDS = ["common/smallButton/rollover1", "common/smallButton/rollover2", "common/smallButton/rollover3"];

        SoundListeners.NAV_BUTTON_CLICK = "common/navButton/click";
        SoundListeners.NAV_BUTTON_CLICK_SOUNDS = ["common/navButton/click1", "common/navButton/click2", "common/navButton/click3"];
        SoundListeners.NAV_BUTTON_ROLLOVER = "common/navButton/rollover1";
        SoundListeners.NAV_BUTTON_ROLLOVER_SOUNDS = ["common/navButton/rollover1", "common/navButton/rollover2", "common/navButton/rollover3"];


        SoundListeners.createRandomSoundListener = function(aId, aSounds, aVolume) {
            SoundListeners.randomSoundFunctions[aId] = function(aSoundType) {
                //console.log("WEBLAB.utils.events.SoundListeners::randomSoundFunction (listener)");
                var randomIndex = Math.floor(Math.random() * aSounds.length);
                commonSingletonsNamespace.SiteManagerBasic.getSoundManager().playSound(aSounds[randomIndex], false, aVolume, aSoundType);
            }
        };

        SoundListeners.addSoundListener = function(aButton, aEventName, aSoundId, aVolume, aSoundType) {
            if (SoundListeners.soundFunctions[aSoundId] === undefined) {
                //console.log("WEBLAB.utils.events.SoundListeners::soundFunction (listener)"); 
                SoundListeners.soundFunctions[aSoundId] = function(aSoundType) {
                    commonSingletonsNamespace.SiteManagerBasic.getSoundManager().playSound(aSoundId, false, aVolume, aSoundType);
                }
            }

            if (aButton.__soundListeners === undefined) aButton.__soundListeners = new Object();
            aButton.__soundListeners[aSoundId] = function() {
                SoundListeners.soundFunctions[aSoundId](aSoundType);
            };

            aButton.addEventListener(aEventName, aButton.__soundListeners[aSoundId], false);
        };

        SoundListeners.removeSoundListener = function(aButton, aEventName, aSoundId, aSoundType) {
            aButton.removeEventListener(aEventName, aButton.__soundListeners[aSoundId], false);
        };

        SoundListeners.addRandomSoundListener = function(aButton, aEventName, aSoundId, aSoundType) {
            var soundFunction = SoundListeners.randomSoundFunctions[aSoundId];
            if (!soundFunction) console.warn("ERROR : soundFunction was null for soundID : ", aSoundId);
            var type = aSoundType;

            if (aButton.__soundListeners === undefined) aButton.__soundListeners = new Object();
            aButton.__soundListeners[aSoundId] = function() {
                soundFunction(type);
            };

            aButton.addEventListener(aEventName, aButton.__soundListeners[aSoundId], false);
        };

        SoundListeners.removeRandomSoundListener = function(aButton, aEventName, aSoundId) {
            aButton.removeEventListener(aEventName, aButton.__soundListeners[aSoundId], false);
        };

        SoundListeners.createClickSound = function(aButton, aSoundId, aSoundType) {
            SoundListeners.addSoundListener(aButton, "click", aSoundId, 1, aSoundType);
        };

        SoundListeners.createRolloverSound = function(aButton, aSoundId, aSoundType) {
            SoundListeners.addSoundListener(aButton, "mouseover", aSoundId, 1, aSoundType);
        };

        SoundListeners.addStandardBigButtonListeners = function(aButton, aSoundType) {
            SoundListeners.addRandomSoundListener(aButton, "click", SoundListeners.STANDARD_BIG_BUTTON_CLICK, aSoundType);
            //SoundListeners.addRandomSoundListener(aButton, "mouseover", SoundListeners.STANDARD_BIG_BUTTON_ROLLOVER);
        };

        SoundListeners.removeStandardBigButtonListeners = function(aButton, aSoundType) {
            SoundListeners.removeRandomSoundListener(aButton, "click", SoundListeners.STANDARD_BIG_BUTTON_CLICK, aSoundType);
            //SoundListeners.removeRandomSoundListener(aButton, "mouseover", SoundListeners.STANDARD_BIG_BUTTON_ROLLOVER);
        };

        SoundListeners.addStandardSmallButtonListeners = function(aButton, aSoundType) {
            SoundListeners.addRandomSoundListener(aButton, "click", SoundListeners.STANDARD_SMALL_BUTTON_CLICK, aSoundType);
            //SoundListeners.addRandomSoundListener(aButton, "mouseover", SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER);
        };

        SoundListeners.removeStandardSmallButtonListeners = function(aButton, aSoundType) {
            SoundListeners.removeRandomSoundListener(aButton, "click", SoundListeners.STANDARD_SMALL_BUTTON_CLICK, aSoundType);
            //SoundListeners.removeRandomSoundListener(aButton, "mouseover", SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER);
        };

        SoundListeners.addStandardNavButtonListeners = function(aButton, aSoundType) {
            SoundListeners.addRandomSoundListener(aButton, "click", SoundListeners.NAV_BUTTON_CLICK, aSoundType);
            //SoundListeners.addRandomSoundListener(aButton, "mouseover", SoundListeners.NAV_BUTTON_ROLLOVER);
        };

        SoundListeners.removeStandardNavButtonListeners = function(aButton, aSoundType) {
            SoundListeners.removeRandomSoundListener(aButton, "click", SoundListeners.NAV_BUTTON_CLICK, aSoundType);
            //SoundListeners.removeRandomSoundListener(aButton, "mouseover", SoundListeners.NAV_BUTTON_ROLLOVER);
        };

        SoundListeners.createRandomSoundListener(SoundListeners.STANDARD_BIG_BUTTON_CLICK, SoundListeners.STANDARD_BIG_BUTTON_CLICK_SOUNDS, 1);
        SoundListeners.createRandomSoundListener(SoundListeners.STANDARD_BIG_BUTTON_ROLLOVER, SoundListeners.STANDARD_BIG_BUTTON_ROLLOVER_SOUNDS, 1);

        SoundListeners.createRandomSoundListener(SoundListeners.STANDARD_SMALL_BUTTON_CLICK, SoundListeners.STANDARD_SMALL_BUTTON_CLICK_SOUNDS, 1);
        SoundListeners.createRandomSoundListener(SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER, SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER_SOUNDS, 1);

        SoundListeners.createRandomSoundListener(SoundListeners.STANDARD_SMALL_BUTTON_CLICK, SoundListeners.STANDARD_SMALL_BUTTON_CLICK_SOUNDS, 1);
        SoundListeners.createRandomSoundListener(SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER, SoundListeners.STANDARD_SMALL_BUTTON_ROLLOVER_SOUNDS, 1);

        SoundListeners.createRandomSoundListener(SoundListeners.NAV_BUTTON_CLICK, SoundListeners.NAV_BUTTON_CLICK_SOUNDS, 1);
        SoundListeners.createRandomSoundListener(SoundListeners.NAV_BUTTON_ROLLOVER, SoundListeners.NAV_BUTTON_ROLLOVER_SOUNDS, 1);

    }
})();
