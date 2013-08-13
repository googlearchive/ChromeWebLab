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

    var namespace = WEBLAB.namespace("WEBLAB.weblab.common.ui.page");

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var XmlLoader = WEBLAB.namespace("WEBLAB.utils.loading").XmlLoader;

    if (namespace.PageManager === undefined) {

        var PageManager = function PageManager() {
            this._init();
        };

        namespace.PageManager = PageManager;

        var p = namespace.PageManager.prototype;

        p._init = function() {

            this._centeredHolder = null;
            this._fullBrowserHolder = null;
            this._currentPageName = null;
            this._currentPage = null;
            this._previousPage = null;
            this._templates = {};

            this._titleElement = null;

            this._windowResizeCallback = null;

            return this;
        };

        p.setElements = function(aCenteredHolder, aFullBrowserHolder) {

            this._centeredHolder = aCenteredHolder;
            this._fullBrowserHolder = aFullBrowserHolder;

            this._windowResizeCallback = ListenerFunctions.createListenerFunction(this, this._onWindowResize);
            window.addEventListener("resize", this._windowResizeCallback, false);

            this._titleElement = this._centeredHolder.querySelector("#experimentTitle");
            if (!this._titleElement) {
                this._titleElement = this._fullBrowserHolder.querySelector("#experimentTitle");
            }
            return this;
        };

        p.showPage = function(aPageName) {
            //console.log("WEBLAB.weblab.common.ui.page.PageManager::showPage");
            this._onWindowResize();

            this._currentPageName = aPageName;

            // hide old page
            if (this._currentPage) {
                this._currentPage.hide();
                this._previousPage = this._currentPage;
            }

            this._titleElement.classList.remove("hidden");
        };

        p.getCurrentPageName = function() {
            return this._currentPageName;
        };

        p.getCurrentPage = function() {
            return this._currentPage;
        };

        p._performShowPage = function() {

            // Setup event listeners
            if (this._currentPage) {
                this._currentPage._navigationListener = ListenerFunctions.createListenerFunction(this, this._pageDidNavigate);
                this._currentPage.addEventListener("navigate", this._currentPage._navigationListener);
                this._currentPage.show();
            }

        };

        p._pageDidNavigate = function(aEvent) {

            this._currentPage.removeEventListener("navigate", this._currentPage._navigationListener);
            delete this._currentPage._navigationListener;


            if (aEvent.detail)
                this.showPage(aEvent.detail);
        };

        p._onWindowResize = function() {

            if (this._titleElement) {
                var parentHeight = this._titleElement.parentElement.clientHeight;

                if (parentHeight <= 720)
                    this._titleElement.style.setProperty("top", "15px", "");
                else if (parentHeight > 720 && parentHeight < 1440) {
                    var newTitleTop = 15 + ((parentHeight - 720) * 0.1);
                    this._titleElement.style.setProperty("top", (newTitleTop + "px"), "");
                } else
                    this._titleElement.style.setProperty("top", "87px", "");
            }

        };

        p.destroy = function() {

            window.removeEventListener("resize", this._windowResizeCallback, false);
            // METODO: Perform any extra tidying up

        };

        PageManager.create = function(aCenteredHolder, aFullBrowserHolder) {

            var newPageManager = new PageManager();
            newPageManager.setElements(aCenteredHolder, aFullBrowserHolder);
            return newPageManager;
        };
    }
})();
