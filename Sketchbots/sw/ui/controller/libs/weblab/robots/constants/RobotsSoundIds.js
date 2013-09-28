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

    var namespace = WEBLAB.namespace("WEBLAB.robots.constants");

    if (namespace.RobotsSoundIds === undefined) {

        var RobotsSoundIds = function RobotsSoundIds() {

        };

        namespace.RobotsSoundIds = RobotsSoundIds;

        RobotsSoundIds.COUNTDOWN_START = "/files/audio/robots/countdown/countdown-start";
        RobotsSoundIds.COUNTDOWN_END = "/files/audio/robots/countdown/countdown-end";
        RobotsSoundIds.SNAPSHOT = "/files/audio/robots/snapshot/snapshot";

        RobotsSoundIds.SLIDE_LEFT = "/files/audio/robots/slide/slide-left";
        RobotsSoundIds.SLIDE_RIGHT = "/files/audio/robots/slide/slide-right";

        RobotsSoundIds.ALERT = "/files/audio/robots/alert/alert";
        RobotsSoundIds.CANCEL = "/files/audio/robots/cancel/cancel";
        RobotsSoundIds.ERROR = "/files/audio/robots/error/error";

        RobotsSoundIds.EYES = "/files/audio/robots/processing/1eyesandcrosshair";
        RobotsSoundIds.OVAL_DOTS = "/files/audio/robots/processing/2crop_ovalofdots";
        RobotsSoundIds.PINK_OVAL = "/files/audio/robots/processing/3crop_pinkoval";
        RobotsSoundIds.DISSOLVE = "/files/audio/robots/processing/4crop_dissolveintosquares";
        RobotsSoundIds.GROW_OVAL = "/files/audio/robots/processing/5crop_ovallarger_part1";
        RobotsSoundIds.GROW_OVAL_COMPLETE = "/files/audio/robots/processing/5crop_ovallarger_part2";
        RobotsSoundIds.ROTATE = "/files/audio/robots/processing/6rotate_degrees";
        RobotsSoundIds.ROTATE_BACK = "/files/audio/robots/processing/7rotate_movetpzerodgrees";
        RobotsSoundIds.SATURATION = "/files/audio/robots/processing/8_desaturatesaturation";
        RobotsSoundIds.SATURATION_RGB = "/files/audio/robots/processing/9desauturate_RGB";
        RobotsSoundIds.SATURATION_BW = "/files/audio/robots/processing/10desaturate_saturationbw";
        RobotsSoundIds.SAT_DISAPPEARS = "/files/audio/robots/processing/10desaturate_saturationdisappears";
        RobotsSoundIds.THRESH_ADAPTIVE = "/files/audio/robots/processing/12threshold_adaptivethreshold";
        RobotsSoundIds.THRESH_BARS_APPEAR = "/files/audio/robots/processing/13threshold_surroundtolerance_part1";
        RobotsSoundIds.THRESH_COMPLETE = "/files/audio/robots/processing/13threshold_surroundtolerance_part2";
        RobotsSoundIds.THRESH_BARS_DISAPPEAR = "/files/audio/robots/processing/14threshold_surroundtolerancedisappear";
        RobotsSoundIds.EDGEDET_MOVE_IMAGE = "/files/audio/robots/processing/15edgedetectionimagemovesforward";
        RobotsSoundIds.EYE_LOUPE = "/files/audio/robots/processing/16edgedetection_eyeenlarges";
        RobotsSoundIds.DETECTING_EDGES = "/files/audio/robots/processing/17edgedetection_dots";
        RobotsSoundIds.VECTORISE_MOVE_LEFT = "/files/audio/robots/processing/18vectorise_headmovesleft";
        RobotsSoundIds.VECTORISE_LINES = "/files/audio/robots/processing/19vectorise_linesjoinupdots";
        RobotsSoundIds.VECTORISE_ENDS = "/files/audio/robots/processing/20vectorise_ends";
        RobotsSoundIds.VECTORISE_TO_DELETING = "/files/audio/robots/processing/21vectorisechangestodeletingphoto";
        RobotsSoundIds.DELETING_PHOTO = "/files/audio/robots/processing/22deletingphoto";
        RobotsSoundIds.IN_THE_BIN = "/files/audio/robots/processing/23deletingphoto_inthebin";
        RobotsSoundIds.DELETING_DISAPPEARS = "/files/audio/robots/processing/violinpluck1";
        RobotsSoundIds.MOVE_LEFT = "/files/audio/robots/processing/24headmovesleft";
        RobotsSoundIds.COMPLETE = "/files/audio/robots/processing/25processingcomplete";


        RobotsSoundIds.ARRAY = [
            RobotsSoundIds.COUNTDOWN_START,
            RobotsSoundIds.COUNTDOWN_END,
            RobotsSoundIds.SNAPSHOT,
            RobotsSoundIds.SLIDE_LEFT,
            RobotsSoundIds.SLIDE_RIGHT,
            RobotsSoundIds.ALERT,
            RobotsSoundIds.CANCEL,
            RobotsSoundIds.ERROR,

            RobotsSoundIds.EYES,
            RobotsSoundIds.OVAL_DOTS,
            RobotsSoundIds.PINK_OVAL,
            RobotsSoundIds.DISSOLVE,
            RobotsSoundIds.GROW_OVAL,
            RobotsSoundIds.GROW_OVAL_COMPLETE,
            RobotsSoundIds.ROTATE,
            RobotsSoundIds.ROTATE_BACK,
            RobotsSoundIds.SATURATION,
            RobotsSoundIds.SATURATION_RGB,
            RobotsSoundIds.SATURATION_BW,
            RobotsSoundIds.SAT_DISAPPEARS,
            RobotsSoundIds.THRESH_ADAPTIVE,
            RobotsSoundIds.THRESH_BARS_APPEAR,
            RobotsSoundIds.THRESH_COMPLETE,
            RobotsSoundIds.THRESH_BARS_DISAPPEAR,
            RobotsSoundIds.EDGEDET_MOVE_IMAGE,
            RobotsSoundIds.EYE_LOUPE,
            RobotsSoundIds.DETECTING_EDGES,
            RobotsSoundIds.VECTORISE_MOVE_LEFT,
            RobotsSoundIds.VECTORISE_LINES,
            RobotsSoundIds.VECTORISE_ENDS,
            RobotsSoundIds.VECTORISE_TO_DELETING,
            RobotsSoundIds.DELETING_PHOTO,
            RobotsSoundIds.IN_THE_BIN,
            RobotsSoundIds.DELETING_DISAPPEARS,
            RobotsSoundIds.MOVE_LEFT,
            RobotsSoundIds.COMPLETE
        ];

    }
})();
