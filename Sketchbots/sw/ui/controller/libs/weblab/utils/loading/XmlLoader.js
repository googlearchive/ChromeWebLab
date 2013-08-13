(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.loading");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.XmlLoader === undefined) {

        var XmlLoader = function XmlLoader() {
            this._init();
        };

        namespace.XmlLoader = XmlLoader;

        XmlLoader.LOADED = "loaded";
        XmlLoader.ERROR = "error";

        var p = XmlLoader.prototype = new EventDispatcher();

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
            //console.log("WEBLAB.utils.loading.XmlLoader::_onReadyStateChange");
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
                        var parser = new DOMParser();
                        this._data = parser.parseFromString(this._loader.responseText, "text/xml");
                        this.dispatchCustomEvent(XmlLoader.LOADED, this.getData());
                    } else {
                        this.dispatchCustomEvent(XmlLoader.ERROR, null);
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

        XmlLoader.create = function(aUrl) {
            var newXmlLoader = new XmlLoader();
            newXmlLoader.setUrl(aUrl);
            return newXmlLoader;
        };
    }
})();
