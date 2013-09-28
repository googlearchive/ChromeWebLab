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

(function() {

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.constants");

    if (namespace.InstrumentIds === undefined) {

        var InstrumentIds = function InstrumentIds() {
            //MENOTE: do nothing
        };

        namespace.InstrumentIds = InstrumentIds;

        InstrumentIds.MARIMBA = 0;
        InstrumentIds.CROTALES = 1;
        InstrumentIds.TEMPLE_BLOCKS = 2;
        InstrumentIds.KALIMBA = 3;
        InstrumentIds.HAPI_UFO_DRUM = 4;
        InstrumentIds.TOMS = 5;
        InstrumentIds.VIBRAPHONE = 6;
        InstrumentIds.MIXED_PERCUSSION = 7;

        var filesFolder = "/files/"; //"../../deploy/files/"; //MEDEBUG

        InstrumentIds.INSTRUMENT_NAMES = ["marimba", "crotales", "temple blocks", "kalimba", "hapi ufo drum", "toms", "vibraphone", "mixed percussion"];

        var soundFolder = filesFolder + "audio/orchestra/virtual-alpha/";
        InstrumentIds.INSTRUMENT_FILE_PATH_PREFIX = [soundFolder + "0_", soundFolder + "1_", soundFolder + "2_", soundFolder + "3_", soundFolder + "4_", soundFolder + "5_", soundFolder + "6_", soundFolder + "7_"];
        InstrumentIds.BACKGROUND_TRACK_FILE_PATH = soundFolder + "virtualBackground.wav";

        var bigFilePathPrefix = filesFolder + "images/orchestra/virtualInstruments/instrument-";
        InstrumentIds.INSTRUMENT_BIG_FILE_PATHS = [bigFilePathPrefix + "0-large.png", bigFilePathPrefix + "1-large.png", bigFilePathPrefix + "2-large.png", bigFilePathPrefix + "3-large.png", bigFilePathPrefix + "4-large.png", bigFilePathPrefix + "5-large.png", bigFilePathPrefix + "6-large.png", bigFilePathPrefix + "7-large.png"];

        InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_FILE_PATH_PREFIX = filesFolder + "images/orchestra/virtualInstruments/largeHits/hit-large-";
        InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_FILE_PATH_SPLIT_1 = ".";
        InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_FILE_PATH_SPLIT_2 = "-0000";
        InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_FILE_PATH_PREFIX = filesFolder + "images/orchestra/virtualInstruments/smallHits/hit-small-";
        InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_FILE_PATH_SPLIT_1 = ".";
        InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_FILE_PATH_SPLIT_2 = "-0000";

        InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_SPRITE_SHEET_FILE_PATH = filesFolder + "images/orchestra/virtualInstruments/largeHitAnimations.png";
        InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_SPRITE_SHEET_FILE_PATH = filesFolder + "images/orchestra/virtualInstruments/smallHitAnimations.png";
    }
})();
