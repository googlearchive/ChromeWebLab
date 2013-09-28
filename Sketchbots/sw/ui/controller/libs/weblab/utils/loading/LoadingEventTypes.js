(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.loading");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.LoadingEventTypes === undefined) {

        var LoadingEventTypes = function LoadingEventTypes() {

        };

        namespace.LoadingEventTypes = LoadingEventTypes;

        LoadingEventTypes.LOADED = "loaded";
        LoadingEventTypes.ERROR = "error";
    }
})();
