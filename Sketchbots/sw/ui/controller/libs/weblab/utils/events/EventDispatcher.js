(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.events");

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;

    if (namespace.EventDispatcher === undefined) {

        var EventDispatcher = function EventDispatcher() {
            this._eventListeners = null;

        };

        namespace.EventDispatcher = EventDispatcher;

        var p = EventDispatcher.prototype;

        p.addEventListener = function(aEventType, aFunction) {
            if (this._eventListeners === null) {
                this._eventListeners = {};
            }
            if (!this._eventListeners[aEventType]) {
                this._eventListeners[aEventType] = [];
            }
            this._eventListeners[aEventType].push(aFunction);

            return this;
        };

        p.removeEventListener = function(aEventType, aFunction) {
            //console.log("WEBLAB.utils.events.EventDispatcher::removeEventListener");
            //console.log(aEventType, aFunction);
            if (this._eventListeners === null) {
                this._eventListeners = {};
            }
            var currentArray = this._eventListeners[aEventType];

            if (typeof(currentArray) === "undefined") {
                console.warn("EventDispatcher :: removeEventListener :: Tried to remove an event handler (for " + aEventType + ") that doesn't exist");
                return this;
            }

            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                if (currentArray[i] == aFunction) {
                    currentArray.splice(i, 1);
                    i--;
                    currentArrayLength--;
                }
            }
            return this;
        };

        p.dispatchEvent = function(aEvent) {
            //console.log("WEBLAB.utils.events.EventDispatcher::dispatchEvent");
            if (this._eventListeners === null) {
                this._eventListeners = {};
            }
            var eventType = aEvent.type;

            if (aEvent.target === null) {
                aEvent.target = this;
            }
            aEvent.currentTarget = this;
            //console.log(eventType, this._eventListeners[eventType], this._eventListeners[eventType].length);
            var currentEventListeners = this._eventListeners[eventType];
            if (currentEventListeners !== null && currentEventListeners !== undefined) {
                var currentArray = ArrayFunctions.copyArray(currentEventListeners);
                var currentArrayLength = currentArray.length;
                for (var i = 0; i < currentArrayLength; i++) {
                    var currentFunction = currentArray[i];
                    //console.log(currentFunction);
                    //console.log(eventType, i, currentArray.length);
                    currentFunction.call(this, aEvent);
                }
            }
            return this;
        };

        p.dispatchCustomEvent = function(aEventType, aDetail) {
            //console.log("WEBLAB.utils.events.EventDispatcher::dispatchCustomEvent");
            //console.log(aEventType, aDetail);
            var newEvent = document.createEvent("CustomEvent");
            newEvent.dispatcher = this;
            newEvent.initCustomEvent(aEventType, false, false, aDetail);
            return this.dispatchEvent(newEvent);
        };

        p.destroy = function() {
            if (this._eventListeners !== null) {
                for (var objectName in this._eventListeners) {
                    var currentArray = this._eventListeners[objectName];
                    var currentArrayLength = currentArray.length;
                    for (var i = 0; i < currentArrayLength; i++) {
                        currentArray[i] = null;
                    }
                    delete this._eventListeners[objectName];
                }
                this._eventListeners = null;
            }
        }

        /*
         *	Decorate (Static)
         *
         *	Decorator method that bestows distpatching behaviours upon generic objects.
         *	A convenience method for when your object cannot extend EventDispatcher
         */
        EventDispatcher.decorate = function(object) {
            EventDispatcher.apply(object);
            object.addEventListener = p.addEventListener;
            object.dispatchEvent = p.dispatchEvent;
            object.dispatchCustomEvent = p.dispatchCustomEvent;
            object.removeEventListener = p.removeEventListener;
            return object;
        };
    }
})();
