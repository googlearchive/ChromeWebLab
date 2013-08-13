(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.loading");
    var JSLoader = WEBLAB.namespace("WEBLAB.utils.loading").JSLoader;
    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;

    if (namespace.SequentialJSLoader === undefined) {

        var SequentialJSLoader = function SequentialJSLoader() {

            this._jsFiles = [];
            this._filesLoadedCount = 0;
        };

        namespace.SequentialJSLoader = SequentialJSLoader;

        SequentialJSLoader.LOADED = "sequenceLoaded";
        SequentialJSLoader.ERROR = "error";
        SequentialJSLoader.PROGRESS = "progress";

        var p = SequentialJSLoader.prototype = new EventDispatcher();

        p.load = function(aFilePathArray, aIsAsync) {
            this._loader = new JSLoader();
            this.isAsync = aIsAsync;
            this._jsFiles = aFilePathArray;
            this._filesLoadedCount = 0;
            if (this._jsFiles.length > 0) {
                this._loader.addEventListener(JSLoader.LOADED, this._onJSFileLoaded.bind(this), false);
                this._loadNext();
            }
        };

        p._loadNext = function() {
            if (this._filesLoadedCount < this._jsFiles.length) {
                this._loader.load(this._jsFiles[this._filesLoadedCount], this.isAsync);
            } else {
                this.dispatchCustomEvent(SequentialJSLoader.LOADED, null);
            }
        };

        p._onJSFileLoaded = function(aEvent) {
            this._filesLoadedCount++;
            this.dispatchCustomEvent(SequentialJSLoader.PROGRESS, null);
            this._loadNext();
        };

    }
})();
