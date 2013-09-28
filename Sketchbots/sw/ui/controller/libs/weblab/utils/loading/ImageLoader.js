(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.loading");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    var LoadingEventTypes = WEBLAB.namespace("WEBLAB.utils.loading").LoadingEventTypes;

    var Utils = WEBLAB.namespace('WEBLAB.utils').Utils;

    if (namespace.ImageLoader === undefined) {

        var ImageLoader = function ImageLoader() {
            this._init();
        };

        namespace.ImageLoader = ImageLoader;


        var p = ImageLoader.prototype = new EventDispatcher();

        p._init = function _init() {

            this._url = null;
            this._loader = null;
            this._data = null;

            this._onLoadCallback = ListenerFunctions.createListenerFunction(this, this._onLoad);
            this._onErrorCallback = ListenerFunctions.createListenerFunction(this, this._onError);

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

            this._data = new Image();

            Utils.addListener(this._data, "load", this._onLoadCallback);
            Utils.addListener(this._data, "error", this._onErrorCallback);

            this._data.src = this._url;

            return this;
        };

        p._onLoad = function(aEvent) {
            this.dispatchCustomEvent(LoadingEventTypes.LOADED, this.getData());
        };

        p._onError = function(aEvent) {
            this.dispatchCustomEvent(LoadingEventTypes.ERROR, null);
        };

        ImageLoader.create = function create(aUrl) {
            var newImageLoader = new ImageLoader();
            newImageLoader.setUrl(aUrl);
            return newImageLoader;
        };
    }
})();
