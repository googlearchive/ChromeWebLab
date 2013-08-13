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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra");
    var singletonsNamespace = WEBLAB.namespace("WEBLAB.orchestra.singletons");
    var commonSingletons = WEBLAB.namespace("WEBLAB.common.singletons");

    var SiteManager = WEBLAB.namespace("WEBLAB.common").SiteManager;

    var OrchestraPageManager = WEBLAB.namespace("WEBLAB.orchestra.ui.page").OrchestraPageManager;
    var QueueManager = WEBLAB.namespace("WEBLAB.orchestra.queue").QueueManager;
    var QueueDisplayManager = WEBLAB.namespace("WEBLAB.orchestra.ui.page").QueueDisplayManager;

    var OrchestraCopyIds = WEBLAB.namespace("WEBLAB.common.constants").OrchestraCopyIds;

    var BackendUrlGenerator = WEBLAB.namespace("WEBLAB.orchestra.loading").BackendUrlGenerator;

    var OrchestraSoundLoader = WEBLAB.namespace("WEBLAB.common.sound").OrchestraSoundLoader;
    var SequenceLoader = WEBLAB.namespace("WEBLAB.utils.loading").SequenceLoader;
    var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    var ConfirmQuitSectionDuringQueueDialog = WEBLAB.namespace("WEBLAB.orchestra.ui.dialog").ConfirmQuitSectionDuringQueueDialog;
    var ConfirmLogoutDuringQueueDialog = WEBLAB.namespace("WEBLAB.orchestra.ui.dialog").ConfirmLogoutDuringQueueDialog;

    var InstrumentIds = WEBLAB.namespace("WEBLAB.orchestra.constants").InstrumentIds;
    var LoadingEventTypes = WEBLAB.namespace("WEBLAB.utils.loading").LoadingEventTypes;

    var BackgroundCircleAnimation = WEBLAB.namespace("WEBLAB.orchestra").BackgroundCircleAnimation;
    var PhysicalTakeAway = WEBLAB.namespace("WEBLAB.orchestra.ui.labReport").PhysicalTakeAway;

    if (namespace.OrchestraManager === undefined) {

        var OrchestraManager = function OrchestraManager() {
            this._init();
        };

        namespace.OrchestraManager = OrchestraManager;


        var p = OrchestraManager.prototype = new EventDispatcher();

        p._init = function() {

            this.backendUrlGenerator = null;
            this.userData = new Object();
            this.userData.instrumentId = -1;
            this.userData.showTutorial = true;
            this._queueManager = null;
            this._queueDisplay = null;
            this._dialogManager = null;
            this._templateManager = null;
            this._pageManager = null;
            this._isInSection = false;

            this.isChrome = true;
            this.hasAudioApi = true;

            this._bigHitAnimationImage = null;
            this._bigHitAnimationData = [
                [
                    [
                        [0, 0, 45, 31],
                        [45, 0, 45, 31],
                        [90, 0, 45, 31],
                        [135, 0, 45, 31]
                    ],
                    [
                        [0, 31, 46, 27],
                        [46, 31, 46, 27],
                        [92, 31, 46, 27],
                        [138, 31, 46, 27]
                    ],
                    [
                        [0, 58, 41, 24],
                        [41, 58, 41, 24],
                        [82, 58, 41, 24],
                        [123, 58, 41, 24]
                    ],
                    [
                        [0, 82, 42, 26],
                        [42, 82, 42, 26],
                        [84, 82, 42, 26],
                        [126, 82, 42, 26]
                    ],
                    [
                        [0, 108, 47, 31],
                        [47, 108, 47, 31],
                        [94, 108, 47, 31],
                        [141, 108, 47, 31]
                    ],
                    [
                        [0, 139, 48, 33],
                        [48, 139, 48, 33],
                        [96, 139, 48, 33],
                        [144, 139, 48, 33]
                    ]
                ],
                [
                    [
                        [0, 172, 45, 38],
                        [45, 172, 45, 38],
                        [90, 172, 45, 38],
                        [135, 172, 45, 38]
                    ],
                    [
                        [0, 210, 40, 34],
                        [40, 210, 40, 34],
                        [80, 210, 40, 34],
                        [120, 210, 40, 34]
                    ],
                    [
                        [0, 244, 43, 36],
                        [43, 244, 43, 36],
                        [86, 244, 43, 36],
                        [129, 244, 43, 36]
                    ],
                    [
                        [0, 280, 46, 42],
                        [46, 280, 46, 42],
                        [92, 280, 46, 42],
                        [138, 280, 46, 42]
                    ],
                    [
                        [0, 322, 46, 44],
                        [46, 322, 46, 44],
                        [92, 322, 46, 44],
                        [138, 322, 46, 44]
                    ],
                    [
                        [0, 366, 45, 43],
                        [45, 366, 45, 43],
                        [90, 366, 45, 43],
                        [135, 366, 45, 43]
                    ]
                ],
                [
                    [
                        [0, 409, 37, 35],
                        [37, 409, 37, 35],
                        [74, 409, 37, 35],
                        [111, 409, 37, 35]
                    ],
                    [
                        [0, 444, 42, 37],
                        [42, 444, 42, 37],
                        [84, 444, 42, 37],
                        [126, 444, 42, 37]
                    ],
                    [
                        [0, 481, 43, 43],
                        [43, 481, 43, 43],
                        [86, 481, 43, 43],
                        [129, 481, 43, 43]
                    ],
                    [
                        [0, 524, 41, 40],
                        [41, 524, 41, 40],
                        [82, 524, 41, 40],
                        [123, 524, 41, 40]
                    ],
                    [
                        [0, 564, 45, 45],
                        [45, 564, 45, 45],
                        [90, 564, 45, 45],
                        [135, 564, 45, 45]
                    ],
                    [
                        [0, 609, 45, 47],
                        [45, 609, 45, 47],
                        [90, 609, 45, 47],
                        [135, 609, 45, 47]
                    ]
                ],
                [
                    [
                        [0, 656, 47, 46],
                        [47, 656, 47, 46],
                        [94, 656, 47, 46],
                        [141, 656, 47, 46]
                    ],
                    [
                        [0, 702, 38, 46],
                        [38, 702, 38, 46],
                        [76, 702, 38, 46],
                        [114, 702, 38, 46]
                    ],
                    [
                        [0, 748, 46, 42],
                        [46, 748, 46, 42],
                        [92, 748, 46, 42],
                        [138, 748, 46, 42]
                    ],
                    [
                        [0, 790, 45, 43],
                        [45, 790, 45, 43],
                        [90, 790, 45, 43],
                        [135, 790, 45, 43]
                    ],
                    [
                        [0, 833, 47, 43],
                        [47, 833, 47, 43],
                        [94, 833, 47, 43],
                        [141, 833, 47, 43]
                    ],
                    [
                        [0, 876, 47, 42],
                        [47, 876, 47, 42],
                        [94, 876, 47, 42],
                        [141, 876, 47, 42]
                    ]
                ],
                [
                    [
                        [0, 918, 46, 38],
                        [46, 918, 46, 38],
                        [92, 918, 46, 38],
                        [138, 918, 46, 38]
                    ],
                    [
                        [0, 956, 41, 28],
                        [41, 956, 41, 28],
                        [82, 956, 41, 28],
                        [123, 956, 41, 28]
                    ],
                    [
                        [0, 984, 40, 16],
                        [40, 984, 40, 16],
                        [80, 984, 40, 16],
                        [120, 984, 40, 16]
                    ],
                    [
                        [0, 1000, 44, 17],
                        [44, 1000, 44, 17],
                        [88, 1000, 44, 17],
                        [132, 1000, 44, 17]
                    ],
                    [
                        [0, 1017, 42, 31],
                        [42, 1017, 42, 31],
                        [84, 1017, 42, 31],
                        [126, 1017, 42, 31]
                    ],
                    [
                        [0, 1048, 47, 38],
                        [47, 1048, 47, 38],
                        [94, 1048, 47, 38],
                        [141, 1048, 47, 38]
                    ]
                ],
                [
                    [
                        [0, 1086, 38, 25],
                        [38, 1086, 38, 25],
                        [76, 1086, 38, 25],
                        [114, 1086, 38, 25]
                    ],
                    [
                        [0, 1111, 42, 29],
                        [42, 1111, 42, 29],
                        [84, 1111, 42, 29],
                        [126, 1111, 42, 29]
                    ],
                    [
                        [0, 1140, 45, 29],
                        [45, 1140, 45, 29],
                        [90, 1140, 45, 29],
                        [135, 1140, 45, 29]
                    ],
                    [
                        [0, 1169, 42, 22],
                        [42, 1169, 42, 22],
                        [84, 1169, 42, 22],
                        [126, 1169, 42, 22]
                    ],
                    [
                        [0, 1191, 45, 26],
                        [45, 1191, 45, 26],
                        [90, 1191, 45, 26],
                        [135, 1191, 45, 26]
                    ],
                    [
                        [0, 1217, 48, 27],
                        [48, 1217, 48, 27],
                        [96, 1217, 48, 27],
                        [144, 1217, 48, 27]
                    ]
                ],
                [
                    [
                        [0, 1244, 38, 23],
                        [38, 1244, 38, 23],
                        [76, 1244, 38, 23],
                        [114, 1244, 38, 23]
                    ],
                    [
                        [0, 1267, 41, 30],
                        [41, 1267, 41, 30],
                        [82, 1267, 41, 30],
                        [123, 1267, 41, 30]
                    ],
                    [
                        [0, 1297, 46, 31],
                        [46, 1297, 46, 31],
                        [92, 1297, 46, 31],
                        [138, 1297, 46, 31]
                    ],
                    [
                        [0, 1328, 48, 32],
                        [48, 1328, 48, 32],
                        [96, 1328, 48, 32],
                        [144, 1328, 48, 32]
                    ],
                    [
                        [0, 1360, 46, 32],
                        [46, 1360, 46, 32],
                        [92, 1360, 46, 32],
                        [138, 1360, 46, 32]
                    ],
                    [
                        [0, 1392, 42, 29],
                        [42, 1392, 42, 29],
                        [84, 1392, 42, 29],
                        [126, 1392, 42, 29]
                    ]
                ],
                [
                    [
                        [0, 1421, 42, 41],
                        [42, 1421, 42, 41],
                        [84, 1421, 42, 41],
                        [126, 1421, 42, 41]
                    ],
                    [
                        [0, 1462, 37, 37],
                        [37, 1462, 37, 37],
                        [74, 1462, 37, 37],
                        [111, 1462, 37, 37]
                    ],
                    [
                        [0, 1499, 43, 42],
                        [43, 1499, 43, 42],
                        [86, 1499, 43, 42],
                        [129, 1499, 43, 42]
                    ],
                    [
                        [0, 1541, 42, 46],
                        [42, 1541, 42, 46],
                        [84, 1541, 42, 46],
                        [126, 1541, 42, 46]
                    ],
                    [
                        [0, 1587, 44, 45],
                        [44, 1587, 44, 45],
                        [88, 1587, 44, 45],
                        [132, 1587, 44, 45]
                    ],
                    [
                        [0, 1632, 40, 48],
                        [40, 1632, 40, 48],
                        [80, 1632, 40, 48],
                        [120, 1632, 40, 48]
                    ]
                ]
            ];
            this._smallHitAnimationImage = null;
            this._smallHitAnimationData = [
                [
                    [
                        [0, 0, 20, 14],
                        [20, 0, 20, 14],
                        [40, 0, 20, 14],
                        [60, 0, 20, 14]
                    ],
                    [
                        [0, 14, 18, 12],
                        [18, 14, 18, 12],
                        [36, 14, 18, 12],
                        [54, 14, 18, 12]
                    ],
                    [
                        [0, 26, 17, 10],
                        [17, 26, 17, 10],
                        [34, 26, 17, 10],
                        [51, 26, 17, 10]
                    ],
                    [
                        [0, 36, 19, 12],
                        [19, 36, 19, 12],
                        [38, 36, 19, 12],
                        [57, 36, 19, 12]
                    ],
                    [
                        [0, 48, 19, 14],
                        [19, 48, 19, 14],
                        [38, 48, 19, 14],
                        [57, 48, 19, 14]
                    ],
                    [
                        [0, 62, 21, 15],
                        [21, 62, 21, 15],
                        [42, 62, 21, 15],
                        [63, 62, 21, 15]
                    ]
                ],
                [
                    [
                        [0, 77, 25, 21],
                        [25, 77, 25, 21],
                        [50, 77, 25, 21],
                        [75, 77, 25, 21]
                    ],
                    [
                        [0, 98, 24, 22],
                        [24, 98, 24, 22],
                        [48, 98, 24, 22],
                        [72, 98, 24, 22]
                    ],
                    [
                        [0, 120, 25, 22],
                        [25, 120, 25, 22],
                        [50, 120, 25, 22],
                        [75, 120, 25, 22]
                    ]
                ],
                [
                    [
                        [0, 142, 20, 17],
                        [20, 142, 20, 17],
                        [40, 142, 20, 17],
                        [60, 142, 20, 17]
                    ],
                    [
                        [0, 159, 19, 18],
                        [19, 159, 19, 18],
                        [38, 159, 19, 18],
                        [57, 159, 19, 18]
                    ],
                    [
                        [0, 177, 21, 21],
                        [21, 177, 21, 21],
                        [42, 177, 21, 21],
                        [63, 177, 21, 21]
                    ]
                ],
                [
                    [
                        [0, 198, 25, 22],
                        [25, 198, 25, 22],
                        [50, 198, 25, 22],
                        [75, 198, 25, 22]
                    ]
                ],
                [
                    [
                        [0, 220, 22, 18],
                        [22, 220, 22, 18],
                        [44, 220, 22, 18],
                        [66, 220, 22, 18]
                    ],
                    [
                        [0, 238, 19, 13],
                        [19, 238, 19, 13],
                        [38, 238, 19, 13],
                        [57, 238, 19, 13]
                    ],
                    [
                        [0, 251, 18, 8],
                        [18, 251, 18, 8],
                        [36, 251, 18, 8],
                        [54, 251, 18, 8]
                    ],
                    [
                        [0, 259, 21, 8],
                        [21, 259, 21, 8],
                        [42, 259, 21, 8],
                        [63, 259, 21, 8]
                    ],
                    [
                        [0, 267, 20, 15],
                        [20, 267, 20, 15],
                        [40, 267, 20, 15],
                        [60, 267, 20, 15]
                    ],
                    [
                        [0, 282, 22, 19],
                        [22, 282, 22, 19],
                        [44, 282, 22, 19],
                        [66, 282, 22, 19]
                    ]
                ],
                [
                    [
                        [0, 301, 22, 12],
                        [22, 301, 22, 12],
                        [44, 301, 22, 12],
                        [66, 301, 22, 12]
                    ],
                    [
                        [0, 313, 24, 14],
                        [24, 313, 24, 14],
                        [48, 313, 24, 14],
                        [72, 313, 24, 14]
                    ],
                    [
                        [0, 327, 24, 14],
                        [24, 327, 24, 14],
                        [48, 327, 24, 14],
                        [72, 327, 24, 14]
                    ]
                ],
                [
                    [
                        [0, 341, 18, 12],
                        [18, 341, 18, 12],
                        [36, 341, 18, 12],
                        [54, 341, 18, 12]
                    ],
                    [
                        [0, 353, 21, 15],
                        [21, 353, 21, 15],
                        [42, 353, 21, 15],
                        [63, 353, 21, 15]
                    ],
                    [
                        [0, 368, 22, 16],
                        [22, 368, 22, 16],
                        [44, 368, 22, 16],
                        [66, 368, 22, 16]
                    ],
                    [
                        [0, 384, 22, 16],
                        [22, 384, 22, 16],
                        [44, 384, 22, 16],
                        [66, 384, 22, 16]
                    ],
                    [
                        [0, 400, 22, 16],
                        [22, 400, 22, 16],
                        [44, 400, 22, 16],
                        [66, 400, 22, 16]
                    ],
                    [
                        [0, 416, 21, 15],
                        [21, 416, 21, 15],
                        [42, 416, 21, 15],
                        [63, 416, 21, 15]
                    ]
                ],
                [
                    [
                        [0, 431, 21, 23],
                        [21, 431, 21, 23],
                        [42, 431, 21, 23],
                        [63, 431, 21, 23]
                    ],
                    [
                        [0, 454, 22, 22],
                        [22, 454, 22, 22],
                        [44, 454, 22, 22],
                        [66, 454, 22, 22]
                    ],
                    [
                        [0, 476, 21, 23],
                        [21, 476, 21, 23],
                        [42, 476, 21, 23],
                        [63, 476, 21, 23]
                    ]
                ]
            ];

            this._hitAnimationLoader = null;
            this._bigHitAnimations = new Array(8);
            this._smallHitAnimations = new Array(8);
            var numberOfHits = [6, 6, 6, 6, 6, 6, 6, 6];
            var numberOfSmallHits = [6, 3, 3, 1, 6, 3, 6, 3];
            for (var i = 0; i < 8; i++) {
                this._bigHitAnimations[i] = new Array(numberOfHits[i]);
                this._smallHitAnimations[i] = new Array(numberOfSmallHits[i]);
            }

            this._backgroundAnimation = null;
            this._sectionBackgroundElement = null;
            this._confirmQuitSectionDialog = null;
            this._confirmSignInDialog = null;

            this._holderElement = null;
            this._overlayHolderElement = null;

            this._currentLiveTakeAway = null;

            this._pendingNavigateURL = "";
            this._requestQuitSectionCallback = ListenerFunctions.createListenerFunction(this, this.requestLeaveSection);
            this._confirmQuitSectionCallback = ListenerFunctions.createListenerFunction(this, this._confirmQuitSection);
            this._cancelQuitSectionCallback = ListenerFunctions.createListenerFunction(this, this._cancelQuitSection);
            this._spriteSheetsLoadedCallback = ListenerFunctions.createListenerFunction(this, this._spriteSheetsLoaded);
            this._requestSignInChangeCallback = ListenerFunctions.createListenerFunctionWithReturn(this, this._requestSignInChange);
            this._cancelSignInCallback = ListenerFunctions.createListenerFunction(this, this._cancelSignIn);
            this._confirmSignInCallback = ListenerFunctions.createListenerFunction(this, this._confirmSignIn);
            this._confirmSignOutCallback = ListenerFunctions.createListenerFunction(this, this._confirmSignOut);

            return this;
        };

        p.setup = function(aBaseUrl, aTemplateFolder, aCenteredHolderElement, aOverlayHolderElement, aBackgroundAnimationElement) {
            //console.log("weblab.orchestra.OrchestraManager::setup");

            this.backendUrlGenerator = BackendUrlGenerator.create(aBaseUrl, aTemplateFolder, null);
            var currentCountry = SiteManager.getSingleton().getCountry();
            if (currentCountry === "" || currentCountry === 0) currentCountry = "ZZ";
            this.backendUrlGenerator.setCountryCode(currentCountry);

            this._holderElement = aCenteredHolderElement;
            this._overlayHolderElement = aOverlayHolderElement;
            this._dialogManager = SiteManager.getSingleton().getDialogManager();

            // this._backgroundAnimation = BackgroundCircleAnimation.create(aBackgroundAnimationElement);

            this._sectionBackgroundElement = aBackgroundAnimationElement;
            this._pageManager = OrchestraPageManager.create(this._holderElement, this._sectionBackgroundElement);
            this._pageManager.setSubtitleContainer(this._holderElement.querySelector("#experimentTitle .experimentSubtitle"));

            this._templateManager = commonSingletons.siteManager.getTemplateManager();

            this._confirmQuitSectionDialog = this._createConfirmQuitSectionDialog();
            this._confirmQuitSectionDialog.addEventListener(ConfirmQuitSectionDuringQueueDialog.CANCEL_QUIT_SECTION, this._cancelQuitSectionCallback);
            this._confirmQuitSectionDialog.addEventListener(ConfirmQuitSectionDuringQueueDialog.CONFIRM_QUIT_SECTION, this._confirmQuitSectionCallback);

            commonSingletons.siteManager.addConfirmNavigateCallback(this._requestQuitSectionCallback);
            commonSingletons.siteManager.addConfirmSigninChangeCallback(this._requestSignInChangeCallback);

            return this;
        };

        p.setupFeatures = function(aIsChorme, aHasAudioApi) {
            this.isChrome = aIsChorme;
            this.hasAudioApi = aHasAudioApi;
        };

        p.getQueueManager = function() {
            return this._queueManager;
        };

        p.getPageManager = function() {
            return this._pageManager;
        };

        p.getTemplateManager = function() {
            return this._templateManager;
        };

        p.drawHitAnimation = function(aCanvas, aInstrumentId, aImageId, aSequenceNumber, aBig) {
            //console.log(aCanvas, aInstrumentId, aImageId, aSequenceNumber, aBig);

            var currentImage;
            var currentData;
            if (aBig) {
                currentImage = this._bigHitAnimationImage;
                currentData = this._bigHitAnimationData;
            } else {
                currentImage = this._smallHitAnimationImage;
                currentData = this._smallHitAnimationData;
            }

            var drawData = currentData[aInstrumentId][aImageId][aSequenceNumber];
            aCanvas.getContext("2d").drawImage(currentImage, drawData[0], drawData[1], drawData[2], drawData[3], 0, 0, drawData[2], drawData[3]);
        };

        p._generateSpriteSheet = function(aImageLoaderPaths, aLoader) {
            //console.log("weblab.orchestra.OrchestraManager::_generateSpriteSheet");
            //console.log(aImageLoaderPaths);
            var canvas = document.createElement("canvas");
            canvas.width = 3000;
            canvas.height = 3000;
            var context = canvas.getContext("2d");

            var currentX = 0;
            var currentY = 0;
            var currentStepX = 0;
            var currentStepY = 0;

            var maxWidth = 0;
            var maxHeight = 0;

            var currentArray = aImageLoaderPaths;
            var currentArrayLength = currentArray.length;
            var returnArray = new Array(currentArrayLength);
            for (var i = 0; i < currentArrayLength; i++) {
                var currentArray2 = currentArray[i];
                var currentArray2Length = currentArray2.length;
                var returnArray2 = new Array(currentArray2Length);
                returnArray[i] = returnArray2;
                for (var j = 0; j < currentArray2Length; j++) {
                    var currentArray3 = currentArray2[j];
                    var currentArray3Length = currentArray3.length;
                    var returnArray3 = new Array(currentArray3Length);
                    returnArray2[j] = returnArray3;

                    var firstData = aLoader.getLoaderByPath(currentArray3[0]).getData();
                    currentStepX = firstData.naturalWidth;
                    currentStepY = firstData.naturalHeight;
                    maxHeight = Math.max(maxHeight, currentY + currentStepY);

                    for (var k = 0; k < currentArray3Length; k++) {
                        var currentLoader = aLoader.getLoaderByPath(currentArray3[k]);
                        var currentData = currentLoader.getData();
                        maxWidth = Math.max(maxWidth, currentX + currentStepX);

                        context.drawImage(currentData, currentX, currentY, currentStepX, currentStepY);

                        returnArray3[k] = [currentX, currentY, currentStepX, currentStepY];

                        currentX += currentStepX;
                    }
                    currentX = 0;
                    currentY += currentStepY;
                }
            }

            var returnCanvas = document.createElement("canvas");
            returnCanvas.width = maxWidth;
            returnCanvas.height = maxHeight;

            returnCanvas.getContext("2d").drawImage(canvas, 0, 0, maxWidth, maxHeight, 0, 0, maxWidth, maxHeight);

            var returnImage = new Image();
            returnImage.src = returnCanvas.toDataURL("image/png");

            //console.log(JSON.stringify(returnArray));
            //document.getElementById("sectionCenteredContent").appendChild(returnImage);

            return {
                "image": returnImage,
                "data": returnArray
            };
        },

        p.startSection = function() {
            //console.log("weblab.orchestra.OrchestraManager::startSection");
            if (this._isInSection) return;
            this._isInSection = true;

            if (this._queueManager === null) {
                this._queueManager = QueueManager.create();
            }
            this._queueDisplay = QueueDisplayManager.create(this._queueManager);
            this._queueDisplay.setup(this._holderElement);
        };

        p.enterSection = function() {
            //console.log("weblab.orchestra.OrchestraManager::enterSection");
            if (this._isInSection) return;

            this.startSection();
            this._showBackground();
            this._pageManager.showPage("start");

        };

        p._showBackground = function() {
            var backgroundElement = this._sectionBackgroundElement;
            var tween = new TWEEN.Tween({
                value: 0
            }).to({
                value: 1
            }, 500).delay(1000).onUpdate(function() {
                backgroundElement.style.setProperty("opacity", this.value, "");
            }).start();
        };

        p.leaveSection = function() {
            if (!this._isInSection) return;
            this._isInSection = false;

            this._queueManager.stopUpdatingQueueLengths();
        };

        p.leaveQueue = function() {

            this._queueManager.leaveQueue();

            if (!this._isInSection) {
                this._queueManager.destroy();
                this._queueManager = null;
            }
        };

        p.showLivePageForSession = function() {
            //console.log("weblab.orchestra.OrchestraManager::showLivePageForSession");

            if (this._pageManager.getCurrentPageName() !== "selectPhysical") {
                // OHTODO: quit pages gracefully before showing live page
                this.showPage("selectPhysical");
            }

            this._performShowLiveSession();
        };

        p._performShowLiveSession = function() {

            var page = this._pageManager.getCurrentPage();
            page.startLiveSession();

            this._queueManager.confirmStart();
        };

        p.showPage = function(aPage) {
            if (aPage && this._isInSection)
                this._pageManager.showPage(aPage);
        };

        p.getSoundsLoader = function() {

            var soundsLoader = commonSingletons.siteManager.getOrchestraSoundLoader();

            if ((!soundsLoader.isLoaded() && !soundsLoader.isLoading()) || soundsLoader.getSounds().length == 0) {
                soundsLoader.loadVirtualPlayerSounds();
            }

            return soundsLoader;
        };

        p.getHitAnimationsLoader = function() {
            if (this._hitAnimationLoader === null) {
                this._hitAnimationLoader = SequenceLoader.create();

                this._hitAnimationLoader.addLoaderByPath(InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_SPRITE_SHEET_FILE_PATH, "image");
                this._hitAnimationLoader.addLoaderByPath(InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_SPRITE_SHEET_FILE_PATH, "image");

                for (var i = 0; i < 8; i++) {
                    this._hitAnimationLoader.addLoaderByPath(InstrumentIds.INSTRUMENT_BIG_FILE_PATHS[i], "image");
                }

                this._hitAnimationLoader.addEventListener(LoadingEventTypes.LOADED, ListenerFunctions.createListenerFunction(this, this._spriteSheetsLoadedCallback), false);

                /* MENOTE: this generates new sprite sheets
				for(var i = 0; i < 8; i++) {
					var currentBigArray = this._bigHitAnimations[i];
					var currentSmallArray = this._smallHitAnimations[i];
					var currentArrayLength = currentBigArray.length;
					for(var j = 0; j < currentArrayLength; j++) {
						var newBigArray = new Array();
						ArrayFunctions.generateList(InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_FILE_PATH_PREFIX + i + InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_FILE_PATH_SPLIT_1 + j + InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_FILE_PATH_SPLIT_2, 0, 4, ".png", newBigArray);
						this._hitAnimationLoader.addLoadersByPath(newBigArray);
						currentBigArray[j] = newBigArray;
					}
					
					var currentSmallArray = this._smallHitAnimations[i];
					var currentArrayLength = currentSmallArray.length;
					for(var j = 0; j < currentArrayLength; j++) {
						var newSmallArray = new Array();
						ArrayFunctions.generateList(InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_FILE_PATH_PREFIX + i + InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_FILE_PATH_SPLIT_1 + j + InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_FILE_PATH_SPLIT_2, 0, 4, ".png", newSmallArray);
						this._hitAnimationLoader.addLoadersByPath(newSmallArray);
						currentSmallArray[j] = newSmallArray;
					}
					
					this._hitAnimationLoader.addLoaderByPath(InstrumentIds.INSTRUMENT_BIG_FILE_PATHS[i], "image");
				}
				
				this._hitAnimationLoader.addEventListener(LoadingEventTypes.LOADED, ListenerFunctions.createListenerFunction(this, this._imagesLoaded), false);
				*/

            };

            return this._hitAnimationLoader;
        };

        p._imagesLoaded = function(aEvent) {
            var generatedData = this._generateSpriteSheet(this._bigHitAnimations, this._hitAnimationLoader);
            this._bigHitAnimationImage = generatedData.image;
            this._bigHitAnimationData = generatedData.data;
            var generatedData = this._generateSpriteSheet(this._smallHitAnimations, this._hitAnimationLoader);
            this._smallHitAnimationImage = generatedData.image;
            this._smallHitAnimationData = generatedData.data;
        };

        p._spriteSheetsLoaded = function(aEvent) {
            this._bigHitAnimationImage = this._hitAnimationLoader.getLoaderByPath(InstrumentIds.INSTRUMENT_BIG_HIT_ANIMATION_SPRITE_SHEET_FILE_PATH).getData();
            this._smallHitAnimationImage = this._hitAnimationLoader.getLoaderByPath(InstrumentIds.INSTRUMENT_SMALL_HIT_ANIMATION_SPRITE_SHEET_FILE_PATH).getData();
        };

        p.getAudioContext = function() {
            return commonSingletons.siteManager.getOrchestraSoundLoader().getAudioContext();
        };

        p.saveLiveTakeAway = function(aSessionID) {

            this._currentLiveTakeAway = PhysicalTakeAway.create(aSessionID);
            this._currentLiveTakeAway.requestSaveLiveRecording();
        };

        p.getMyPositionInQueueString = function(aPosition) {

            var ids = OrchestraCopyIds;
            var numPersons = "";



            switch (aPosition % 10) {
                case 1:
                    if (aPosition == 11)
                        numPersons = this.getCopyContentWithValue(ids.QUEUE_N_IN_LINE, aPosition);
                    else
                        numPersons = this.getCopyContentWithValue(ids.QUEUE_1N_IN_LINE, aPosition);
                    break;
                case 2:
                    if (aPosition == 12)
                        numPersons = this.getCopyContentWithValue(ids.QUEUE_N_IN_LINE, aPosition);
                    else
                        numPersons = this.getCopyContentWithValue(ids.QUEUE_2N_IN_LINE, aPosition);
                    break;
                case 3:
                    if (aPosition == 13)
                        numPersons = this.getCopyContentWithValue(ids.QUEUE_N_IN_LINE, aPosition);
                    else
                        numPersons = this.getCopyContentWithValue(ids.QUEUE_3N_IN_LINE, aPosition);
                    break;
                default:
                    numPersons = this.getCopyContentWithValue(ids.QUEUE_N_IN_LINE, aPosition);
                    break;
            }


            return numPersons;
        };

        p.createNumberOfPersonsString = function(aNumberOfPersons) {
            var ids = OrchestraCopyIds;
            if (aNumberOfPersons == 1) return this.getCopyContent(ids.QUEUE_NUMBER_PERSON);
            return this.getCopyContentWithValue(ids.QUEUE_NUMBER_PEOPLE, aNumberOfPersons);
        };

        p.createEstimatedTimeString = function(aEstimatedTime) {
            var ids = OrchestraCopyIds;

            var newPeopleReading = "";
            if (aEstimatedTime > (60 * 60)) {
                var numHours = Math.ceil(aEstimatedTime / (60 * 60));
                newPeopleReading = this.getCopyContentWithValue(ids.QUEUE_LESS_THAN_HOURS, numHours);
            } else if (aEstimatedTime > 60) {
                var numMinutes = Math.ceil(aEstimatedTime / (60));
                newPeopleReading = this.getCopyContentWithValue(ids.QUEUE_LESS_THAN_MINUTES, numMinutes);
            } else newPeopleReading = this.getCopyContent(ids.QUEUE_LESS_THAN_A_MINUTE);

            return newPeopleReading;
        };

        p.getCalculatingString = function() {
            return this.getCopyContent("orchestra/queue/calculating");
        };

        p.getCopyContentWithValue = function(aId, aNumber) {
            var content = this.getCopyContent(aId);
            return this._insertNumberIntoCopy(content, aNumber);
        }

        p.getCopyContent = function(aId) {
            return SiteManager.getSingleton().getCopyManager().getCopy(aId);
        };

        p._insertNumberIntoCopy = function(aCopyString, aNumber) {
            return aCopyString.replace(/\[\[(.*?)\]\]/, aNumber);
        };

        p.requestLeaveSection = function(aResultObject, aUrl) {
            this._pendingNavigateURL = aUrl;
            if (!this._queueManager.isInQueue())
                aResultObject.confirmed = true;
            else {
                SiteManager.getSingleton().importantDialogShowing();
                this._confirmQuitSectionDialog.setPendingUrl(aUrl);
                this._dialogManager.showDialog(this._confirmQuitSectionDialog);
                aResultObject.confirmed = false;
            }
        };

        p._requestSignInChange = function(aSignIn) {
            //console.log("weblab.orchestra.OrchestraManager::_requestSignInChange");

            if (!this._queueManager.isInQueue()) {
                return true;
            } else {
                SiteManager.getSingleton().importantDialogShowing();

                if (this._confirmSignInDialog === null) {
                    var confirmLogoutTemplate = this._templateManager.getTemplate("orchestra/confirmLogoutDuringQueueDialog");
                    this._confirmSignInDialog = ConfirmLogoutDuringQueueDialog.create(confirmLogoutTemplate, aSignIn);
                    this._confirmSignInDialog.addEventListener(ConfirmLogoutDuringQueueDialog.CANCEL_SIGN_IN, this._cancelSignInCallback);
                    this._confirmSignInDialog.addEventListener(ConfirmLogoutDuringQueueDialog.CONFIRM_SIGN_IN, this._confirmSignInCallback);
                    this._confirmSignInDialog.addEventListener(ConfirmLogoutDuringQueueDialog.CONFIRM_SIGN_OUT, this._confirmSignOutCallback);
                }

                this._dialogManager.showDialog(this._confirmSignInDialog);

                return false;
            }
        };

        p._cancelSignIn = function(aEvent) {
            //MENOTE: do nothing
        };

        p._confirmSignIn = function(aEvent) {
            this._queueManager.leaveQueue();
            commonSingletons.siteManager.externalLogin();
        };

        p._confirmSignOut = function(aEvent) {
            this._queueManager.leaveQueue();
            commonSingletons.siteManager.externalLogout();
        };

        p._createConfirmQuitSectionDialog = function() {
            var confirmQuitSectionTemplate = this._templateManager.getTemplate("orchestra/confirmQuitDuringQueueDialog");
            var newDialog = ConfirmQuitSectionDuringQueueDialog.create(confirmQuitSectionTemplate);
            newDialog.addEventListener(ConfirmQuitSectionDuringQueueDialog.CONFIRM_QUIT_SECTION, this._confirmQuitSectionCallback);
            newDialog.addEventListener(ConfirmQuitSectionDuringQueueDialog.CANCEL_QUIT_SECTION, this._cancelQuitSectionCallback);
            return newDialog;
        };

        p._confirmQuitSection = function() {
            this._queueManager.leaveQueue();
            commonSingletons.siteManager.navigateToExperimentURL(this._pendingNavigateURL);
        };

        p._cancelQuitSection = function() {
            this.dispatchCustomEvent(OrchestraManager.CANCEL_QUIT_SECTION, null);
        };

        p.destroy = function() {
            //METODO
        };

        OrchestraManager.createSingleton = function(aBaseUrl, aTemplateFolder, aHolderElement, aOverlayHolderElement, aBackgroundAnimationElement) {
            if (singletonsNamespace.orchestraManager === undefined) {
                singletonsNamespace.orchestraManager = new OrchestraManager();
                singletonsNamespace.orchestraManager.setup(aBaseUrl, aTemplateFolder, aHolderElement, aOverlayHolderElement, aBackgroundAnimationElement);
            }

            return singletonsNamespace.orchestraManager;
        };

        OrchestraManager.getSingleton = function() {
            return singletonsNamespace.orchestraManager;
        };
    }
})();
