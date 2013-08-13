(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.loading");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.JsonLoader === undefined) {

        var JsonLoader = function JsonLoader() {
            this._init();
        };

        namespace.JsonLoader = JsonLoader;

        JsonLoader.LOADED = "loaded";
        JsonLoader.ERROR = "error";

        var p = JsonLoader.prototype = new EventDispatcher();

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

        p.load = function(aMethod, aFormData, aAsync) {

            this._loader = new XMLHttpRequest();
            this._loader.open(aMethod || "GET", this._url, aAsync || true);

            this._loader.onreadystatechange = ListenerFunctions.createListenerFunction(this, this._onReadyStateChange);

            this._loader.send(aFormData || null);

            return this;
        };

        p._onReadyStateChange = function() {
            //console.log("WEBLAB.utils.loading.JsonLoader::_onReadyStateChange");
            //console.log(this._loader.readyState, this._loader.status);
            switch (this._loader.readyState) {
                case 0: //Uninitialized
                case 1: //Set up
                case 2: //Sent
                case 3: //Partly done
                    //MENOTE: do nothing
                    break;
                case 4: //Done
                    if (this._loader.status < 400) {
                        try {
                            this._data = JSON.parse(this._loader.responseText);
                        } catch (err) {
                            console.error("JsonLoader :: ERROR Parsing json: " + err.message + " : ", err);
                            this.dispatchCustomEvent(JsonLoader.ERROR, err);
                            break;
                        }
                        this.dispatchCustomEvent(JsonLoader.LOADED, this.getData());
                    } else {
                        this.dispatchCustomEvent(JsonLoader.ERROR, null);
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

        JsonLoader.create = function(aUrl) {
            var newJsonLoader = new JsonLoader();
            newJsonLoader.setUrl(aUrl);
            return newJsonLoader;
        };
    }
})();
