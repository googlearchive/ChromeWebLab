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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.ui.page");
    var singletonsNamespace = WEBLAB.namespace("WEBLAB.orchestra.singletons");
    var commonSingletons = WEBLAB.namespace("WEBLAB.common.singletons");

    var PageManager = WEBLAB.namespace("WEBLAB.weblab.common.ui.page").PageManager;

    var StartPage = namespace.StartPage;
    var PlayVirtualPage = namespace.PlayVirtualPage;
    var SelectPhysicalPage = namespace.SelectPhysicalPage;

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var XmlLoader = WEBLAB.namespace("WEBLAB.utils.loading").XmlLoader;

    var BackgroundCircleAnimation = WEBLAB.namespace("WEBLAB.orchestra.ui.backgroundAnim").BackgroundCircleAnimation;

    var OrchestraAnimatedIcons = WEBLAB.namespace("WEBLAB.orchestra.constants").OrchestraAnimatedIcons;

    var ReplaceableContent = WEBLAB.namespace("WEBLAB.common.ui").ReplaceableContent;

    if (namespace.OrchestraPageManager === undefined) {

        var OrchestraPageManager = function OrchestraPageManager() {
            this._init();
        };

        namespace.OrchestraPageManager = OrchestraPageManager;


        //define prototype
        var p = namespace.OrchestraPageManager.prototype = new PageManager();
        //define super if needed
        var s = PageManager.prototype;

        p._init = function() {

            this._firstLoad = true;

            this._currentPageName = null;
            this._currentPage = null;
            this._templates = new Object();

            this._experimentIconContainer = null;
            this._experimentIconAnimation = null;

            this._subtitleContainer = null;
            this._subtitleContent = ReplaceableContent.create(false, 6, 345);
            this._subtitleContent.setClipHeight(150);

            this._backgroundAnimation = null;

            this._takeawayTemplateLoadedCallback = ListenerFunctions.createListenerFunction(this, this._takeawayTemplateLoaded);

            this._showBackgroundCallback = ListenerFunctions.createListenerFunction(this, this.showBackgroundBlobs);
            this._hideBackgroundCallback = ListenerFunctions.createListenerFunction(this, this.hideBackgroundBlobs);

            return this;
        };


        p.setElements = function(aCenteredHolder, aFullBrowserHolder) {

            s.setElements.call(this, aCenteredHolder, aFullBrowserHolder);

            this._experimentIconContainer = this._centeredHolder.querySelector(".experimentIcon");

            this._backgroundAnimation = BackgroundCircleAnimation.create(aFullBrowserHolder);
            this._backgroundAnimation.show();

            var animatedIcon = OrchestraAnimatedIcons.LOADING_ICON;
            var animationTarget = this._centeredHolder.querySelector("#logoAnim")
            this._experimentIconAnimation = new swiffy.Stage(animationTarget, animatedIcon);

            // this._experimentIconAnimation.start();
        }

        p.setSubtitleContainer = function(aElement) {
            this._subtitleContainer = aElement;
            this._subtitleContainer.querySelector(".content").appendChild(this._subtitleContent.getElement());
        };

        p.showPage = function(aPageName) {
            //console.log("WEBLAB.orchestra.ui.page.OrchestraPageManager::showPage");

            // call superclass
            s.showPage.call(this, aPageName);

            this._performShowPage();
        };

        p._performShowPage = function() {
            //console.log("WEBLAB.orchestra.ui.page.OrchestraPageManager::_performShowPage");
            // tidy up listeners
            if (this._currentPage) {
                this._currentPage.removeEventListener('navigate', this._currentPage._navigationListener);
                this._currentPage.removeEventListener('showBackground', this._showBackgroundCallback);
                this._currentPage.removeEventListener('hideBackground', this._hideBackgroundCallback);
            }

            var templateManager = commonSingletons.siteManager.getTemplateManager();
            var templateDocument = templateManager.getTemplate("orchestra/" + this._currentPageName);
            switch (this._currentPageName) {
                case "start":
                    singletonsNamespace.orchestraManager.getQueueManager().startUpdatingQueueLengths();
                    // var templateNode = templateDocument.querySelector("*[data-weblab-type='templateMain']");
                    var newNode = document.importNode(templateDocument, true);
                    this._centeredHolder.appendChild(newNode);
                    this._currentPage = StartPage.create(newNode);

                    if (this._firstLoad) this._experimentIconAnimation.start();
                    this.setSubtitleColumnWidth(2);

                    break;
                case "playVirtual":
                    singletonsNamespace.orchestraManager.getQueueManager().stopUpdatingQueueLengths();
                    // var templateNode = templateDocument.querySelector("*[data-weblab-type='templateMain']");
                    var newNode = document.importNode(templateDocument, true);
                    this._centeredHolder.appendChild(newNode);
                    this._currentPage = PlayVirtualPage.create(newNode);

                    this.setSubtitleColumnWidth(2);
                    break;
                case "selectPhysical":
                    singletonsNamespace.orchestraManager.getQueueManager().startUpdatingQueueLengths();
                    // var templateNode = templateDocument.querySelector("*[data-weblab-type='templateMain']");
                    var newNode = document.importNode(templateDocument, true);
                    this._centeredHolder.appendChild(newNode);
                    this._currentPage = SelectPhysicalPage.create(newNode, singletonsNamespace.orchestraManager.userData.instrumentId, false);

                    this.hideBackgroundBlobs();
                    this.setSubtitleColumnWidth(1);
                    break;
            }

            this._currentPage.addEventListener("showBackground", this._showBackgroundCallback);
            this._currentPage.addEventListener("hideBackground", this._hideBackgroundCallback);

            this._currentPage.start(this._firstLoad);


            if (this._firstLoad) {
                this._firstLoad = false;
            }

            if (this._currentPage.showDefaultSubtitle) {
                var newSubtitle = this._currentPage.getSubtitle();
                if (newSubtitle !== null && newSubtitle !== undefined) {
                    this._subtitleContent.replaceContent(newSubtitle, 0);
                } else {
                    this._subtitleContent.hideContent(0);
                }
            }

            // call superclass to setup listeners
            s._performShowPage.call(this);
        };

        p.setSubtitleColumnWidth = function setSubtitleColumnWidth(aNumCols) {
            var hRule = this._subtitleContainer.querySelector("hr.blackSinglePixel");
            hRule.style.setProperty("width", (aNumCols * 140) + "px", "");
        };

        p.replaceSubtitle = function(aContent, aTime) {
            this._subtitleContent.replaceContent(aContent, aTime);
        };

        p._onWindowResize = function(aEvent) {
            s._onWindowResize.call(this, aEvent);

            var gridBackground = document.getElementById("gridBackground");

            var parentWidth = gridBackground.parentElement.clientWidth;
            var parentHeight = gridBackground.parentElement.clientHeight;

            var aspect = 840 / 460;

            var backgroundWidth;
            var backgroundHeight;
            if (parentWidth > parentHeight * aspect) {
                backgroundWidth = parentWidth;
                backgroundHeight = backgroundWidth / aspect;
            } else {
                backgroundHeight = parentHeight;
                backgroundWidth = aspect * backgroundHeight;
            }

            backgroundWidth = Math.round(backgroundWidth);
            backgroundHeight = Math.round(backgroundHeight);

            var left = Math.round(0.5 * (parentWidth - backgroundWidth));
            var top = Math.round(0.5 * (parentHeight - backgroundHeight));

            gridBackground.style.setProperty("left", left + "px", "");
            gridBackground.style.setProperty("top", top + "px", "");
            gridBackground.style.setProperty("width", backgroundWidth + "px", "");
            gridBackground.style.setProperty("height", backgroundHeight + "px", "");
        };

        p.ensureShowingLivePage = function() {
            if (this._currentPageName != "selectPhysical") {
                this.showPage("selectPhysical");
            }
        };

        p.showBackgroundBlobs = function() {
            this._backgroundAnimation.show();
        };

        p.hideBackgroundBlobs = function() {
            this._backgroundAnimation.hide();
        };

        p._takeawayTemplateLoaded = function() {

        };

        p.requestLeaveSection = function() {
            // OHTODO
            return true;
        };

        p.destroy = function() {
            // METODO: Perform any extra tidying up

            // Call superclass to remove from DOM
            s.destroy.call(this);
        };

        OrchestraPageManager.create = function(aCenteredHolder, aFullBrowserHolder) {
            var newOrchestraPageManager = new OrchestraPageManager();
            newOrchestraPageManager.setElements(aCenteredHolder, aFullBrowserHolder);
            return newOrchestraPageManager;
        };
    }
})();
