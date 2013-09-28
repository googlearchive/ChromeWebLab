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

    var Page = WEBLAB.namespace("WEBLAB.weblab.common.ui.page").Page;
    var MultipartTitleAnimation = WEBLAB.namespace("WEBLAB.common.ui").MultipartTitleAnimation;
    var commonSingletons = WEBLAB.namespace("WEBLAB.common.singletons");
    var TrackingIds = WEBLAB.namespace("WEBLAB.common.constants").TrackingIds;

    var SectionTitle = WEBLAB.namespace("WEBLAB.common.ui").SectionTitle;
    var SectionTitleLineContent = WEBLAB.namespace("WEBLAB.common.ui").SectionTitleLineContent;
    var LineTitleAndContent = WEBLAB.namespace("WEBLAB.common.ui").LineTitleAndContent;
    var LiveRibbon = WEBLAB.namespace("WEBLAB.common.ui").LiveRibbon;

    var VideoPlayer = WEBLAB.namespace("WEBLAB.orchestra.ui.video").LiveSyncedVideoPlayer;
    var SelectPhysicalInstrumentButton = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items").SelectPhysicalInstrumentButton;
    var BigBox = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items").BigBox;
    var VirtualRollOverLoop = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items").VirtualRollOverLoop;
    var StartPageHitAnimations = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items").StartPageHitAnimations;
    var ReplaceableContent = WEBLAB.namespace("WEBLAB.common.ui").ReplaceableContent;
    var TimedCommands = WEBLAB.namespace("WEBLAB.utils.timer").TimedCommands;

    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
    var SoundListeners = WEBLAB.namespace("WEBLAB.utils.events").SoundListeners;

    var QueueEventTypes = WEBLAB.namespace("WEBLAB.orchestra.constants").QueueEventTypes;
    var OrchestraConfiguration = WEBLAB.namespace("WEBLAB.orchestra").OrchestraConfiguration;

    var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
    var ElementUtils = WEBLAB.namespace("WEBLAB.utils.htmldom").ElementUtils;

    var LiveStreamCarousel = WEBLAB.namespace("WEBLAB.orchestra.ui.page.items").LiveStreamCarousel;



    if (namespace.StartPage === undefined) {

        var StartPage = function StartPage() {
            this._init();
        };

        namespace.StartPage = StartPage;

        StartPage.CYCLE_INSTRUMENT = "cycleInstrument";
        StartPage.OUT_ANIMATION_DONE = "outAniamtionDone";

        StartPage.INSTRUMENT_IDS = [8, 9, 2, 4, 1, 6, 5, 0, 3, 7];

        var p = namespace.StartPage.prototype = new Page();
        var s = Page.prototype;

        p._init = function() {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::_init");

            s._init.call(this);

            this._queueLengths = null;
            this._currentInstrumentQueueButton = null;
            this._liveStreamCarousel = null;
            this._hitAnimations = null;

            this._hasChrome = true;

            this._forceMuseumInstrumentsClosed = false;

            this._timedCommands = TimedCommands.create();
            this._outAnimationDoneCallback = ListenerFunctions.createListenerFunction(this, this._outAnimationDone);
            this._cycleInstrumentCallback = ListenerFunctions.createListenerFunction(this, this._cycleWatchingInstrument);
            this._timedCommands.addEventListener(StartPage.OUT_ANIMATION_DONE, this._outAnimationDoneCallback);
            this._timedCommands.addEventListener(StartPage.CYCLE_INSTRUMENT, this._cycleInstrumentCallback);


            this._physicalBox = null;
            this._physicalButtonContent = null;
            this._physicalButtonContentElement = null;
            this._physicalButton = null;
            this._physicalRibbon = null;

            this._virtualBox = null;
            this._virtualButtonContent = null;
            this._virtualButtonContentElement = null;
            this._virtualButton = null;
            this._virtualNeedChromeButtonContentElement = null;
            this._virtualRibbon = null;

            this._streamMarkers = [];
            this._streamMarkersListenerFunctions = [];

            this._currentlyWatchingInstrumentId = -1;
            this._queueInfo = null;
            this._instrumentErrorMessage = null;
            this._virtualErrorMessage = null;

            this._virtualRolloverLoop = null;

            this._instrumentErrorMessageElement = null;
            this._virtualErrorMessageElement = null;

            this._queuesUpdatedCallback = ListenerFunctions.createListenerFunction(this, this._queuesUpdated);

            this._onPhysicalClickCallback = ListenerFunctions.createListenerFunction(this, this._onPhysicalClick);
            this._onVirtualClickCallback = ListenerFunctions.createListenerFunction(this, this._onVirtualClick);

            this._carouselPlayerReadyCallback = ListenerFunctions.createListenerFunction(this, this._carouselPlayerReady);
            this._carouselPlayerErrorCallback = ListenerFunctions.createListenerFunction(this, this._carouselPlayerError);

            this._overPhysicalHitAreaCallback = null;
            this._outPhysicalHitAreaCallback = null;
            this._overVirtualHitAreaCallback = null;
            this._outVirtualHitAreaCallback = null;

            return this;
        };

        p.setElement = function(aElement) {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::setElement");

            s.setElement.call(this, aElement);

            var mainWindowElement = this._element.querySelector("*[data-weblab-type='mainWindow']");
            var physicalHolder = mainWindowElement.querySelector("*[name='physicalHolder']");
            var virtualHolder = mainWindowElement.querySelector("*[name='virtualHolder']");

            this._physicalBox = BigBox.create(physicalHolder.querySelector("*[name='bigBox']"));
            this._virtualBox = BigBox.create(virtualHolder.querySelector("*[name='bigBox']"));

            this._physicalRibbon = LiveRibbon.create(physicalHolder.querySelector(".weblabLabel.live"));
            this._virtualRibbon = LiveRibbon.create(virtualHolder.querySelector(".weblabLabel.live"));

            //MENOTE: This code sets up the physical button
            var physicalContentHolder = physicalHolder.querySelector("*[name='buttonArea']");
            this._physicalButtonContentElement = physicalContentHolder.querySelector("*[name='contentHolder']");
            this._physicalButtonContentElement.parentNode.removeChild(this._physicalButtonContentElement);
            this._physicalButtonContent = ReplaceableContent.create(false, 11, 476);
            this._physicalButtonContent.setAnimationTimes(0.5, 0.3, 0.3);
            if (!this._forceMuseumInstrumentsClosed) physicalContentHolder.appendChild(this._physicalButtonContent.getElement()); //RPNOTE: Not added to dom as the streams don't have any sound and we don't want people to try playing

            this._physicalButton = this._physicalButtonContentElement.querySelector("*[name='button']");
            this._physicalHitArea = physicalHolder.querySelector(".hitArea.live");
            Utils.addListener(this._physicalButton, "click", this._onPhysicalClickCallback);
            Utils.addListener(this._physicalHitArea, "click", this._onPhysicalClickCallback);
            SoundListeners.addStandardBigButtonListeners(this._physicalButton);

            this._overPhysicalHitAreaCallback = ListenerFunctions.createListenerFunctionWithArguments(this, this._onHitAreaHover, [this._physicalButton]);
            this._outPhysicalHitAreaCallback = ListenerFunctions.createListenerFunctionWithArguments(this, this._onHitAreaMouseOut, [this._physicalButton]);

            Utils.addListener(this._physicalHitArea, "mouseover", this._overPhysicalHitAreaCallback);
            Utils.addListener(this._physicalHitArea, "mouseout", this._outPhysicalHitAreaCallback);

            this._queueInfo = SelectPhysicalInstrumentButton.create(this._physicalButtonContentElement.querySelector("*[name='queueInfo']"));

            //MENOTE: this code sets up the virtual button
            var virtualContentHolder = virtualHolder.querySelector("*[name='buttonArea']");
            this._virtualButtonContentElement = virtualContentHolder.querySelector("*[name='contentHolder']");
            this._virtualButtonContentElement.parentNode.removeChild(this._virtualButtonContentElement);
            this._virtualNeedChromeButtonContentElement = virtualContentHolder.querySelector("*[name='needChromeContentHolder']");
            this._virtualNeedChromeButtonContentElement.parentNode.removeChild(this._virtualNeedChromeButtonContentElement);
            this._virtualButtonContent = ReplaceableContent.create(false, 11, 476);
            this._virtualButtonContent.setAnimationTimes(0.5, 0.3, 0.3);
            virtualContentHolder.appendChild(this._virtualButtonContent.getElement());

            this._virtualButton = this._virtualButtonContentElement.querySelector("*[name='button']");
            this._virtualHitArea = virtualHolder.querySelector(".hitArea.virtual");
            Utils.addListener(this._virtualButton, "click", this._onVirtualClickCallback);
            Utils.addListener(this._virtualHitArea, "click", this._onVirtualClickCallback);
            Utils.addListener(this._virtualButton, "mouseover", this._onVirtualHover.bind(this));
            Utils.addListener(this._virtualButton, "mouseout", this._onVirtualMouseOut.bind(this));

            this._overVirtualHitAreaCallback = ListenerFunctions.createListenerFunctionWithArguments(this, this._onHitAreaHover, [this._virtualButton]);
            this._outVirtualHitAreaCallback = ListenerFunctions.createListenerFunctionWithArguments(this, this._onHitAreaMouseOut, [this._virtualButton]);

            Utils.addListener(this._virtualHitArea, "mouseover", this._overVirtualHitAreaCallback);
            Utils.addListener(this._virtualHitArea, "mouseout", this._outVirtualHitAreaCallback);

            this._virtualRolloverLoop = VirtualRollOverLoop.create();

            Utils.addListener(this._virtualHitArea, "mouseover", this._onVirtualHover.bind(this));
            Utils.addListener(this._virtualHitArea, "mouseout", this._onVirtualMouseOut.bind(this));




            //MENOTE: this codes sets up the live stream carousel

            this._liveStreamCarousel = LiveStreamCarousel.create(this._element.querySelector(".videoCarousel"));
            this._liveStreamCarousel.init("startPageCarousel", OrchestraConfiguration.NORMAL_IDS, false);
            this._liveStreamCarousel.addEventListener(LiveStreamCarousel.PLAYER_READY, this._carouselPlayerReadyCallback);
            this._liveStreamCarousel.addEventListener(LiveStreamCarousel.PLAYER_ERROR, this._carouselPlayerErrorCallback);
            this._createStreamNav();

            this._instrumentErrorMessageElement = physicalHolder.querySelector(".instrumentErrorMessages");
            this._virtualErrorMessageElement = virtualHolder.querySelector(".instrumentErrorMessages");

            this._instrumentErrorMessage = LineTitleAndContent.create(this._instrumentErrorMessageElement);
            this._virtualErrorMessage = LineTitleAndContent.create(this._virtualErrorMessageElement);

            if (!singletonsNamespace.orchestraManager.hasAudioApi) {
                this._hasChrome = false;
                if (!singletonsNamespace.orchestraManager.isChrome) {
                    this.setNoChrome();
                } else {
                    this.setNoAudioApi();
                }
            } else {
                SoundListeners.addStandardBigButtonListeners(this._virtualButton);
                this._setupHitAnimations();
            }

            return this;
        };

        p.setNoChrome = function() {
            ElementUtils.removeClass(this._virtualButton, "weblabGradientPurple");
            ElementUtils.addClass(this._virtualButton, "weblabColourGreyMid");
            Utils.removeListener(this._virtualButton, "click", this._onVirtualClickCallback);

            this._virtualBox.getElement().querySelector(".paddedContent").style.setProperty("opacity", 0.8, "");
            this._virtualButton.style.setProperty("opacity", 0.5, "");
            this._virtualButton.style.setProperty("pointer-events", "none", "");

            this._showInstrumentError("virtualNoChrome", this._virtualErrorMessage, this._virtualErrorMessageElement)
        };

        p.setPhysicalInstrumentsUnavailable = function() {

            ElementUtils.removeClass(this._physicalButton, "weblabGradientPurple");
            ElementUtils.addClass(this._physicalButton, "weblabColourGreyMid");
            Utils.removeListener(this._physicalButton, "click", this._onPhysicalClickCallback);

            this._physicalButton.style.setProperty("opacity", 0.5, "");
            this._physicalButton.style.setProperty("pointer-events", "none", "");

            this._physicalHitArea.style.setProperty("cursor", "default", "");

            Utils.removeListener(this._physicalHitArea, "click", this._onPhysicalClickCallback);
            Utils.removeListener(this._physicalHitArea, "mouseover", this._overPhysicalHitAreaCallback);
            Utils.removeListener(this._physicalHitArea, "mouseout", this._outPhysicalHitAreaCallback);

            this._streamMarkerContainer.style.setProperty("display", "none", "");
            this._physicalButtonContentElement.querySelector("*[name='queueInfo']").style.setProperty("display", "none");

        };

        p.setNoAudioApi = function() {
            ElementUtils.removeClass(this._virtualButton, "weblabGradientPurple");
            ElementUtils.addClass(this._virtualButton, "weblabColourGreyMid");
            Utils.removeListener(this._virtualButton, "click", this._onVirtualClickCallback);

            this._virtualBox.getElement().querySelector(".paddedContent").style.setProperty("opacity", 0.8, "");
            this._virtualButton.style.setProperty("opacity", 0.5, "");
            this._virtualButton.style.setProperty("pointer-events", "none", "");

            this._showInstrumentError("virtualNoAudioApi", this._virtualErrorMessage, this._virtualErrorMessageElement)
        };

        p._setupHitAnimations = function() {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::_setupHitAnimations");
            this._hitAnimations = StartPageHitAnimations.create(this._virtualBox.getElement().querySelector(".virtualInstrumentDisplay"));
        };

        p._createStreamNav = function() {
            this._streamMarkerContainer = this._element.querySelector(".streamCarouselMarkers");
            for (var i = 0; i < 10; i++) {

                var newMarker = document.createElement("div");
                newMarker.className = "streamCarouselMarker";
                newMarker.setAttribute("id", "instrument" + i);

                var instrumentId = StartPage.INSTRUMENT_IDS[i];

                var newListenerFunction = ListenerFunctions.createListenerFunctionWithArguments(this, this._instrumentNavClicked, [instrumentId]);

                this._streamMarkersListenerFunctions.push(newListenerFunction);
                newMarker.addEventListener("click", newListenerFunction);
                this._streamMarkerContainer.appendChild(newMarker);
                this._streamMarkers.push(newMarker);
            }

            var navWidth = 10 * 14;
            this._streamMarkerContainer.style.setProperty("width", navWidth + "px", "");
        };

        p._carouselPlayerReady = function() {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::_carouselPlayerReady");
            //MENOTE: should somethin happend here?
            if (this._forceMuseumInstrumentsClosed) this._cycleWatchingInstrument(); // Added to show the error message just after loaded
        };

        p._carouselPlayerError = function() {
            console.warn("ERROR: Live Stream player not loaded");
        };

        p.start = function(aFirstLoad) {
            var queueManager = singletonsNamespace.orchestraManager.getQueueManager();
            this._updateQueueLengths(queueManager.getQueueLengths());

            var previousInstrument = singletonsNamespace.orchestraManager.userData.instrumentId;
            var randomInstrument = (previousInstrument != null) ? previousInstrument : Math.floor(Math.random() * 7);
            this.changeWatchingInstrument(randomInstrument);
            var currentTime = 0.001 * Date.now();
            var delayTime = 15;
            this._timedCommands.addCommand(StartPage.CYCLE_INSTRUMENT, currentTime + delayTime, null);

            this._liveStreamCarousel.show();

            this._physicalBox.show(0.5, 0);
            this._virtualBox.show(0.5, 0.1);

            this._physicalRibbon.show(500);
            if (this._hasChrome)
                this._virtualRibbon.show(600);

            this._physicalButtonContent.replaceContent(this._physicalButtonContentElement, 0.4);
            this._virtualButtonContent.replaceContent(this._virtualButtonContentElement, 0.5);

            queueManager.addEventListener(QueueEventTypes.QUEUE_STATUS_UPDATE, this._queuesUpdatedCallback);

            this._timedCommands.startSelfUpdating();

            if (this._hitAnimations !== null) {
                this._hitAnimations.show();
            }

            this.dispatchCustomEvent("showBackground", null);
        };

        p.changeWatchingInstrument = function(aNewInstrumentIndex) {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::changeWatchingInstrument");
            //console.log(aNewInstrumentIndex, this._currentlyWatchingInstrumentId);

            if (aNewInstrumentIndex === this._currentlyWatchingInstrumentId) return;

            var queueManager = singletonsNamespace.orchestraManager.getQueueManager();

            var navIndex = -1;
            for (var i = 0; i < StartPage.INSTRUMENT_IDS.length; i++) {
                if (aNewInstrumentIndex == StartPage.INSTRUMENT_IDS[i]) navIndex = i;
            }

            for (var i = 0; i < this._streamMarkers.length; i++) {
                ElementUtils.removeClass(this._streamMarkers[i], "selected");
            }

            this._currentlyWatchingInstrumentId = aNewInstrumentIndex;

            if (this._currentlyWatchingInstrumentId !== -1) {
                ElementUtils.addClass(this._streamMarkers[navIndex], "selected");
            }

            //console.log("StartPage :: changeWatchingInstrument :: newId = ", this._currentlyWatchingInstrumentId);

            var hasError = false;
            if (this._queueLengths !== null) {

                if (this._currentlyWatchingInstrumentId >= 0 && this._currentlyWatchingInstrumentId < 8) {
                    var queueData = this._queueLengths[this._currentlyWatchingInstrumentId];
                    this._liveStreamCarousel.setCurrentPlayer(queueData.getCurrentPlayer());

                    //METODO: check if data has error
                    if (queueData.getStatus() == -1) {
                        hasError = true;
                    }
                }
            }

            if (this._forceMuseumInstrumentsClosed) hasError = true; //RPNOTE: forced error as the streams don't have any sound

            if (!hasError) {
                this._liveStreamCarousel.show();
                this._physicalRibbon.show();
                this._hideInstrumentError(this._instrumentErrorMessage, this._instrumentErrorMessageElement);
            } else {
                //METODO: get copy from copy manager
                //METODO: show error message
                this._liveStreamCarousel.hide();
                this._physicalRibbon.hide();
                this._showInstrumentError("instrument" + this._currentlyWatchingInstrumentId, this._instrumentErrorMessage, this._instrumentErrorMessageElement);
            }

            this._liveStreamCarousel.setStreamId(this._currentlyWatchingInstrumentId);
        };

        p._showInstrumentError = function(aType, aTarget, aTargetElement) {

            ElementUtils.addClass(aTargetElement, "visible");

            var copyManager = commonSingletons.siteManager.getCopyManager();

            var title = copyManager.getCopy("orchestra/startPage/errorMessages/" + aType + "/title");
            var body = copyManager.getCopy("orchestra/startPage/errorMessages/" + aType + "/body");

            if (aType == "virtualNoChrome") {
                var downloadButtonCopy = copyManager.getCopy("orchestra/startPage/errorMessages/virtualNoChrome/downloadButtonCopy");
                body = body += '<div class="downloadChrome"><img src="/files/images/home/chrome.png" alt="Chrome"/><a class="splashButton" href="https://www.google.com/chrome"><h4>' + downloadButtonCopy + '</h4></a></div>';
            }

            aTargetElement.querySelector(".title .animationLayer").innerHTML = title;
            aTargetElement.querySelector(".content .animationLayer").innerHTML = body;

            aTarget.show();
        };

        p._hideInstrumentError = function(aTarget, aTargetElement) {
            aTarget.hide();
            ElementUtils.removeClass(aTargetElement, "visible");
        };

        p._cycleWatchingInstrument = function() {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::_cycleWatchingInstrument");

            var currentIndex = StartPage.INSTRUMENT_IDS.indexOf(this._currentlyWatchingInstrumentId);

            /*
			var nextIndex = -1;
			var attempts = 0;
			while (nextIndex != currentIndex) {
				nextIndex = currentIndex + 1;
				if (nextIndex >= 8) nextIndex = 0;
				var currentData = this._queueLengths[nextIndex];
				if (currentData)
					if (currentData._hasData)
						break;
				if (++attempts > 8) break;
			}
			*/
            var nextIndex = (currentIndex + 1) % StartPage.INSTRUMENT_IDS.length;

            if (nextIndex >= 0) {
                var nextInstrument = StartPage.INSTRUMENT_IDS[nextIndex];
                this.changeWatchingInstrument(nextInstrument);
            }

            this._timedCommands.clearAllCommandsByType(StartPage.CYCLE_INSTRUMENT);
            var currentTime = 0.001 * Date.now();
            var delayTime = 15;
            this._timedCommands.addCommand(StartPage.CYCLE_INSTRUMENT, currentTime + delayTime, null);
        };

        p._instrumentNavClicked = function(aInstruemntId) {
            this.changeWatchingInstrument(aInstruemntId);
            this._timedCommands.clearAllCommandsByType(StartPage.CYCLE_INSTRUMENT);
        };

        p._onPhysicalClick = function() {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::_onPhysicalClick");
            //console.log(this._currentlyWatchingInstrumentId);

            var selectedInstrument;
            if (this._currentlyWatchingInstrumentId < 8) {
                selectedInstrument = this._currentlyWatchingInstrumentId;

                var currentSelectedInstrumentStatus = singletonsNamespace.orchestraManager.getQueueManager().getStatusForQueueId(selectedInstrument)
                var retries = 0;
                while (currentSelectedInstrumentStatus < 0 && retries < 10) {
                    if (selectedInstrument < 7) selectedInstrument++;
                    else selectedInstrument = 0;
                    currentSelectedInstrumentStatus = singletonsNamespace.orchestraManager.getQueueManager().getStatusForQueueId(selectedInstrument);
                    retries++;
                }

            } else {
                selectedInstrument = Math.floor(Math.random() * 8);
            }


            singletonsNamespace.orchestraManager.userData.instrumentId = selectedInstrument;

            this.hideForNavigation(0.2, 0, "selectPhysical");
            this.dispatchCustomEvent("hideBackground", null);

            commonSingletons.siteManager.getTracker().trackEvent(TrackingIds.ORCHESTRA, "OrchestraSelectLive", "The user selected 'play Live' from the start page");

            // singletonsNamespace.orchestraManager.saveLiveTakeAway("dummySessionId");

        };

        p._onVirtualClick = function() {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::_onVirtualClick");
            this.hideForNavigation(0, 0.2, "playVirtual");
            commonSingletons.siteManager.getTracker().trackEvent(TrackingIds.ORCHESTRA, "OrchestraSelectVirtual", "The user selected 'play Online' from the start page");

            // commonSingletons.siteManager.getLabReportManager().showSharingPageForID("1234-dummyLabReportId-5678-04");
            // commonSingletons.siteManager.getLabReportManager()._show();
        };

        p._onHitAreaHover = function _onHitAreaHover(aTargetButton) {
            ElementUtils.addClass(aTargetButton, "hover");
        };

        p._onHitAreaMouseOut = function _onHitAreaMouseOut(aTargetButton) {
            ElementUtils.removeClass(aTargetButton, "hover");
        }

        p._onVirtualHover = function _onVirtualHover() {
            this._liveStreamCarousel.setIsMuted(true);
            this._virtualRolloverLoop.play();

        };

        p._onVirtualMouseOut = function _onVirtualMouseOut() {
            if (this._liveStreamCarousel) this._liveStreamCarousel.setIsMuted(false);
            if (this._virtualRolloverLoop) this._virtualRolloverLoop.stop();
        };


        p._queuesUpdated = function(aEvent) {

            this._updateQueueLengths(aEvent.detail);

        };

        p._updateQueueLengths = function(aDataArray) {

            var queueManager = singletonsNamespace.orchestraManager.getQueueManager();

            this._queueLengths = aDataArray;
            var myQueueId = queueManager.getCurrentQueueId();

            var manager = singletonsNamespace.orchestraManager;

            var bestId = -1;
            var bestTime = -1;
            var numberInactiveInstruments = 0;

            var currentArray = this._queueLengths;
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                var currentData = currentArray[i];
                if (currentData.hasData()) {
                    if (currentData.getStatus() === 1 && (bestId === -1 || currentData.getEstimatedTime())) {
                        bestId = i;
                        bestTime = currentData.getEstimatedTime();
                    }
                    if (currentData.getStatus() == -1) numberInactiveInstruments++;
                }
            }

            if (bestId !== -1) {
                var currentData = this._queueLengths[bestId];
                var personsString = "";
                personsString = manager.createNumberOfPersonsString(currentData.getNumberOfPersons());
                var timeString = manager.createEstimatedTimeString(currentData.getEstimatedTime());
                this._queueInfo.updateQueueStatus(currentData.getStatus(), personsString, timeString, false);
            }

            if (this._currentlyWatchingInstrumentId >= 0 && this._currentlyWatchingInstrumentId < 8) {
                var currentData = this._queueLengths[this._currentlyWatchingInstrumentId];
                if (currentData.hasData()) {
                    this._liveStreamCarousel.setCurrentPlayer(currentData.getCurrentPlayer());
                }
            }

            if (numberInactiveInstruments == 8) {
                this._liveStreamCarousel.hide();
                this._physicalRibbon.hide();
                this.setPhysicalInstrumentsUnavailable();
                this._showInstrumentError("all", this._instrumentErrorMessage, this._instrumentErrorMessageElement);
            }
        };

        p.show = function() {
            s.show.call(this);
        };


        p.hide = function() {
            s.hide.call(this);
        };

        p._onWindowResize = function() {
            s._onWindowResize.call(this);

        }


        p.pageWillDisappear = function() {
            console.log("WEBLAB.orchestra.ui.page.StartPage::pageWillDisappear");
        };

        p.hideForNavigation = function(aDelayForPhysical, aDelayForVirtual, aEndNavigationPoint) {
            console.log("WEBLAB.orchestra.ui.page.StartPage::hideForNavigation");
            var boxDelayTime = 0.1;
            var boxAnimationTime = 0.3;

            var animationTime = Math.max(aDelayForPhysical, aDelayForVirtual) + boxDelayTime + boxAnimationTime;

            this._timedCommands.clearAllCommandsByType(StartPage.CYCLE_INSTRUMENT);

            this._physicalBox.hide(boxAnimationTime, aDelayForPhysical + boxDelayTime);
            this._virtualBox.hide(boxAnimationTime, aDelayForVirtual + boxDelayTime);

            this._physicalButtonContent.hideContent(aDelayForPhysical);
            this._virtualButtonContent.hideContent(aDelayForVirtual);

            this._physicalRibbon.hide(aDelayForPhysical);
            if (this._hasChrome) this._virtualRibbon.hide(aDelayForVirtual);

            if (this._hitAnimations !== null) {
                this._hitAnimations.hide();
            }

            var currentTime = 0.001 * Date.now()
            this._timedCommands.addCommand(StartPage.OUT_ANIMATION_DONE, currentTime + animationTime, aEndNavigationPoint);

            this._liveStreamCarousel.clearTheDecks();
        };

        p._outAnimationDone = function(aEvent) {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::_outAnimationDone");

            this._timedCommands.stopSelfUpdating();
            this.navigate(aEvent.detail);
            this.destroy();

        };

        p.destroy = function() {
            //console.log("WEBLAB.orchestra.ui.page.StartPage::destroy");

            this._queueLengths = null; //MENOTE: why is this stored as a property on this page?

            var queueManager = singletonsNamespace.orchestraManager.getQueueManager();
            queueManager.removeEventListener(QueueEventTypes.QUEUE_STATUS_UPDATE, this._queuesUpdatedCallback);

            Utils.destroyIfExists(this._physicalRibbon);
            this._physicalRibbon = null;
            Utils.destroyIfExists(this._virtualRibbon);
            this._virtualRibbon = null;

            Utils.destroyIfExists(this._physicalBox);
            this._physicalBox = null;
            Utils.destroyIfExists(this._virtualBox);
            this._virtualBox = null;

            Utils.destroyIfExists(this._liveStreamCarousel);
            this._liveStreamCarousel = null;

            Utils.destroyIfExists(this._timedCommands);
            this._timedCommands = null;

            Utils.destroyIfExists(this._hitAnimations);
            this._hitAnimations = null;

            Utils.destroyIfExists(this._physicalButtonContent);
            this._physicalButtonContent = null;
            Utils.destroyIfExists(this._virtualButtonContent);
            this._virtualButtonContent = null;

            Utils.destroyIfExists(this._virtualRolloverLoop);
            this._virtualRolloverLoop = null;

            Utils.destroyIfExists(this._instrumentErrorMessage);
            this._instrumentErrorMessage = null;
            Utils.destroyIfExists(this._virtualErrorMessage);
            this._virtualErrorMessage = null;

            Utils.destroyIfExists(this._queueInfo);
            this._queueInfo = null;

            this._instrumentErrorMessageElement = null;
            this._virtualErrorMessageElement = null;
            this._physicalButtonContentElement = null;
            this._virtualButtonContentElement = null;
            this._virtualNeedChromeButtonContentElement = null;
            this._streamMarkerContainer = null;

            if (this._physicalButton !== null) {
                Utils.removeListener(this._physicalButton, "click", this._onPhysicalClickCallback);
                this._physicalButton = null;
            }
            if (this._physicalHitArea !== null) {
                Utils.removeListener(this._physicalHitArea, "click", this._onPhysicalClickCallback);
                Utils.removeListener(this._physicalHitArea, "mouseover", this._overPhysicalHitAreaCallback);
                Utils.removeListener(this._physicalHitArea, "mouseout", this._outPhysicalHitAreaCallback);
                this._physicalHitArea = null;
            }
            if (this._virtualButton !== null) {
                Utils.removeListener(this._virtualButton, "click", this._onVirtualClickCallback);
                Utils.removeListener(this._virtualButton, "mouseover", this._onVirtualHover.bind(this));
                Utils.removeListener(this._virtualButton, "mouseout", this._onVirtualMouseOut.bind(this));
                this._virtualButton = null;
            }
            if (this._virtualHitArea !== null) {
                Utils.removeListener(this._virtualHitArea, "click", this._onVirtualClickCallback);
                Utils.removeListener(this._virtualHitArea, "mouseover", this._overVirtualHitAreaCallback);
                Utils.removeListener(this._virtualHitArea, "mouseout", this._outVirtualHitAreaCallback);
                Utils.removeListener(this._virtualHitArea, "mouseover", this._onVirtualHover.bind(this));
                Utils.removeListener(this._virtualHitArea, "mouseout", this._onVirtualMouseOut.bind(this));
                this._virtualHitArea = null;
            }

            if (this._streamMarkers !== null) {
                var currentArray = this._streamMarkers;
                var currentArrayLength = currentArray.length;
                for (var i = 0; i < currentArrayLength; i++) {
                    var currentMarker = currentArray[i];
                    currentMarker.removeEventListener("click", this._streamMarkersListenerFunctions[i], false);

                    currentArray[i] = null;
                    this._streamMarkersListenerFunctions[i] = null;
                }

                this._streamMarkers = null;
                this._streamMarkersListenerFunctions = null;
            }

            this._queuesUpdatedCallback = null;

            this._outAnimationDoneCallback = null;
            this._cycleInstrumentCallback = null;

            this._onPhysicalClickCallback = null;
            this._onVirtualClickCallback = null;

            this._carouselPlayerReadyCallback = null;
            this._carouselPlayerErrorCallback = null;

            this._overPhysicalHitAreaCallback = null;
            this._outPhysicalHitAreaCallback = null;
            this._overVirtualHitAreaCallback = null;
            this._outVirtualHitAreaCallback = null;

            s.destroy.call(this);

            //WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
        };

        StartPage.create = function(aElement) {
            var newStartPage = new StartPage();
            newStartPage.setElement(aElement);
            return newStartPage;
        };
    }
})();
