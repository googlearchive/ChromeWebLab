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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.player");

    var Point = WEBLAB.namespace("WEBLAB.utils.math").Point;

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.RollOver === undefined) {

        var RollOver = function RollOver() {
            this._init();
        };

        namespace.RollOver = RollOver;

        var p = RollOver.prototype;

        p._init = function() {

            this.position = -1;
            this.pitch = -1;
            this.envelope = 0;
            this.canBeRemoved = false;

            this.tween = new TWEEN.Tween(this);

            return this;
        };

        p.show = function() {
            this.canBeRemoved = false;

            this.tween.to({
                "envelope": 1
            }, 1000 * 0.2).easing(TWEEN.Easing.Quadratic.EaseOut).start();
        };

        p.hide = function() {
            this.canBeRemoved = true;

            this.tween.to({
                "envelope": 0
            }, 1000 * 0.2).easing(TWEEN.Easing.Quadratic.EaseOut).start();
        };

        p.destroy = function() {
            this.x = -1;
            this.y = -1;
            this.envelope = 0;

            this.tween = null;

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        RollOver.create = function(aPosition, aPitch) {
            var newRollOver = new RollOver();
            newRollOver.position = aPosition;
            newRollOver.pitch = aPitch;
            return newRollOver;
        };
    }
})();
