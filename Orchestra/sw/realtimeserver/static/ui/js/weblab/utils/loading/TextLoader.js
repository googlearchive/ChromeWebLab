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

    var namespace = WEBLAB.namespace("WEBLAB.utils.loading");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.TextLoader === undefined) {

        var TextLoader = function TextLoader() {
            this._init();
        };

        namespace.TextLoader = TextLoader;

        TextLoader.LOADED = "loaded";
        TextLoader.ERROR = "error";

        var p = TextLoader.prototype = new EventDispatcher();

        p._init = function() {

            this._url = null;
            this._loader = null;
            this._data = null;

            return this;
        };

        p.getData = function() {
            return this._data;
        };

        p.setUrl = function(aUrl) {

            this._url = aUrl;

            return this;
        };

        p.load = function() {

            this._loader = new XMLHttpRequest();
            this._loader.open("GET", this._url, true);

            this._loader.onreadystatechange = ListenerFunctions.createListenerFunction(this, this._onReadyStateChange);

            this._loader.send(null);

            return this;
        };

        p._onReadyStateChange = function() {
            //console.log("WEBLAB.utils.loading.TextLoader::_onReadyStateChange");
            //console.log(this._url, this._loader.readyState, this._loader.status);
            switch (this._loader.readyState) {
                case 0: //Uninitialized
                case 1: //Set up
                case 2: //Sent
                case 3: //Partly done
                    //MENOTE: do nothing
                    break;
                case 4: //Done
                    if (this._loader.status < 400) {
                        this._data = this._loader.responseText;
                        this.dispatchCustomEvent(TextLoader.LOADED, this.getData());
                    } else {
                        this.dispatchCustomEvent(TextLoader.ERROR, null);
                    }
                    break;
            }
        };

        p.destroy = function() {
            if (this._loader !== null) {
                this._loader.onreadystatechange = null;
                this._loader = null;
            }

            this._url = null;
            this._data = null;
        };

        TextLoader.create = function(aUrl) {
            var newTextLoader = new TextLoader();
            newTextLoader.setUrl(aUrl);
            return newTextLoader;
        };
    }
})();
