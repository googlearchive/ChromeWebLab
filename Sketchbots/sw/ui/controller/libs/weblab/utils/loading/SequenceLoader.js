(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.loading");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    var LoadingEventTypes = WEBLAB.namespace("WEBLAB.utils.loading").LoadingEventTypes;

    if (namespace.SequenceLoader === undefined) {

        var SequenceLoader = function SequenceLoader() {
            this._init();
        };

        namespace.SequenceLoader = SequenceLoader;

        var p = SequenceLoader.prototype = new EventDispatcher();

        p._init = function() {

            this._loaders = new Array();
            this._waitingLoaders = new Array();
            this._loadingLoaders = new Array();

            this._isLoading = false;
            this._continueOnError = true;
            this._hasError = false;
            this._numberOfConcurrentLoaders = 5;

            this._onLoadCallback = ListenerFunctions.createListenerFunction(this, this._onLoad);
            this._onErrorCallback = ListenerFunctions.createListenerFunction(this, this._onError);

            return this;
        };

        p.getLoaderByPath = function(aPath) {

            var currentArray = this._loaders;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                if (aPath === currentArray[i]._url) {
                    return currentArray[i];
                }
            }

            return null;
        };

        p.addLoader = function(aLoader) {
            this._loaders.push(aLoader);
            this._waitingLoaders.push(aLoader);
        };

        p.addLoaderByPath = function(aPath, aType) {
            if (aType === "auto") {
                var fileExtension = aPath.substring(aPath.lastIndexOf(".") + 1, aPath.length).toLowerCase();
                switch (fileExtension) {
                    case "xml":
                        aType = "xml";
                        break;
                    case "txt":
                    case "text":
                        aType = "text";
                        break;
                    case "json":
                        aType = "json";
                        break;
                    case "jpg":
                    case "jpeg":
                    case "png":
                        aType = "image";
                        break;
                    default:
                        console.error("Unknown file extension " + fileExtension + " for file " + aPath);
                        return;
                }
            }

            var newLoader;
            switch (aType) {
                case "xml":
                    newLoader = namespace.XmlLoader.create(aPath);
                    break;
                case "text":
                    newLoader = namespace.TextLoader.create(aPath);
                    break;
                case "json":
                    newLoader = namespace.JsonLoader.create(aPath);
                    break;
                case "image":
                    newLoader = namespace.ImageLoader.create(aPath);
                    break;
                default:
                    console.error("Unknown type " + aType + " for file " + aPath);
                    return;
            }

            this.addLoader(newLoader);
        };

        p.addLoadersByPath = function(aPaths) {
            var currentArray = aPaths;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                this.addLoaderByPath(currentArray[i], "auto");
            }
        };

        p.isLoaded = function() {
            return (this._loadingLoaders.length === 0 && this._waitingLoaders.length === 0);
        };

        p.load = function() {

            if (this._isLoading) return;
            this._isLoading = true;

            this._continueLoading();

            return this;
        };

        p.stopLoading = function() {
            this._isLoading = false;
        };

        p._continueLoading = function() {

            if (this._waitingLoaders.length === 0 && this._loadingLoaders.length === 0) {
                if (this._isLoading) {
                    this.dispatchCustomEvent(LoadingEventTypes.LOADED, null);
                }
            } else {
                while (this._loadingLoaders.length < this._numberOfConcurrentLoaders && this._waitingLoaders.length > 0 && this._isLoading) {
                    var currentLoader = this._waitingLoaders.shift();
                    this._loadingLoaders.push(currentLoader);
                    currentLoader.addEventListener(LoadingEventTypes.LOADED, this._onLoadCallback, false);
                    currentLoader.addEventListener(LoadingEventTypes.ERROR, this._onErrorCallback, false);
                    currentLoader.load();
                }
            }
        };

        p._onLoad = function(aEvent) {

            var currentLoader = aEvent.dispatcher;

            var currentArray = this._loadingLoaders;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                if (currentLoader === currentArray[i]) {
                    currentArray.splice(i, 1);
                    break;
                }
            }

            if (!this._hasError) {
                this._continueLoading();
            }
        };

        p._onError = function(aEvent) {

            if (this._continueOnError) {
                this._onLoad(aEvent);
            } else {
                this._hasError = true;
                this.dispatchCustomEvent(LoadingEventTypes.ERROR, null);
            }
        };

        SequenceLoader.create = function create() {
            var newSequenceLoader = new SequenceLoader();
            return newSequenceLoader;
        };
    }
})();
