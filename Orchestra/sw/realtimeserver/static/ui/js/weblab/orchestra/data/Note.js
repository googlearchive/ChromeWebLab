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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.data");

    if (namespace.Note === undefined) {

        var Note = function Note() {
            this._init();
        };

        namespace.Note = Note;

        var p = Note.prototype;

        p._init = function() {

            this.position = -1;
            this.pitch = -1;

            return this;
        };

        p.setPositionAndPitch = function(aPosition, aPitch) {

            this.position = aPosition;
            this.pitch = aPitch;

            return this;
        }

        p.destroy = function() {
            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        Note.create = function(aPosition, aPitch) {
            var newNote = new Note();

            newNote.setPositionAndPitch(aPosition, aPitch);

            return newNote;
        }
    }
})();
