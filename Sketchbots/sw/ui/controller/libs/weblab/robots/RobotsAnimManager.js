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

    var namespace = WEBLAB.namespace('WEBLAB.robots');
    var singletonsNamespace = WEBLAB.namespace("WEBLAB.robots.singletons");

    var backend = WEBLAB.namespace("WEBLAB.robots.backend");
    var BackendComms;

    var facerec = WEBLAB.robots.facerec;
    var webcam = WEBLAB.robots.webcam;
    var robots_animation = WEBLAB.robots.animation;

    var canvas_utils = WEBLAB.utils.canvas.utils;
    var canvas_animation = WEBLAB.utils.canvas.animation;

    var math = WEBLAB.utils.math;
    var dev = WEBLAB.utils.dev;

    var SimpleTrig = math.SimpleTrig;
    var drawing = canvas_utils.Drawing;
    var CanvasFactory = canvas_utils.CanvasFactory;
    var TweenHelper = WEBLAB.utils.animation.TweenHelper;

    var JsonLoader = WEBLAB.namespace("WEBLAB.utils.loading").JsonLoader;

    var SiteManager = WEBLAB.namespace("WEBLAB.common").SiteManager;
    var RobotsSoundIds = WEBLAB.namespace("WEBLAB.robots.constants").RobotsSoundIds;

    var stage, gui, faceOval, userCols, faceToLoad, doRender;


    if (namespace.RobotsAnimManager === undefined) {

        namespace.RobotsAnimManager = function(aUserCols) {

            this._animationDone = false;
            this._hasReserveData = false;
            this._hasReservedSpace = false;
            this._currentImage = null;

            this._reservedSpaceLoadedCallback = this._reservedSpaceLoaded.bind(this);
            this._reservedSpaceLoadingErrorCallback = this._reservedSpaceLoadingError.bind(this);

            this.faceRecogniser = new facerec.FaceRecogniser();
            BackendComms = backend.BackendComms;
            userCols = aUserCols;

            this._stageWidth = 0;
            this._stageHeight = 0;
            this._onResizeCallback = this._onResize.bind(this);
        };

        var p = namespace.RobotsAnimManager.prototype;


        p.init = function(swfUrl, w, h, aAnimContainer, aShowAnim) {
            this.animContainer = aAnimContainer;
            this.faceOvalData = {
                data: {
                    eye_left: {
                        x: 32,
                        y: 50
                    },
                    eye_right: {
                        x: 68,
                        y: 50
                    }
                },
                proportionalDistanceBetweenEyes: 0.374545
            };

            this.testing = false;

            if (this.testing) {
                this.showAnim = aShowAnim;
                this.loadTestWebCamImage('development/test_faces/google/front_page_candidates/girl1.png');
                // this.chooseTestFaceImage();
            } else {
                this.initWebCam(swfUrl, w, h);
            }

            doRender = true;
            this.render();
        }

        p.getCurrentImage = function() {
            return this._currentImage;
        };


        p.testStageOnStart = function() // call from RobotsPageManager
        {
            this.createStage();

            // TEST HERE

            doRender = true;
            this.render();
        }


        p.chooseTestFaceImage = function() {
            var faceImage = new Image();

            faceImage.onload = (function() {
                var faceCtx = CanvasFactory.createFromImage(faceImage);
                this.faceRecogniser.useCanvas(faceCtx.canvas, this.onWebCamImageLoaded.bind(this));
            }).bind(this);

            // use input to get file			
            var input = document.createElement("input");
            input.type = 'file';
            input.addEventListener('change', (function(evt) {
                document.body.removeChild(input);
                var f = evt.target.files[0];

                // load with FileReader as path/url is not available
                // - this is HTML5 local filesystem stuff

                var reader = new FileReader();
                reader.onload = (function(theFile) {
                    return function(e) {
                        faceImage.src = e.target.result;
                    }
                })(f);

                reader.readAsDataURL(f);
            }).bind(this), false);

            // document.body.appendChild(input);
        }


        p.loadTestWebCamImage = function(webcamImageUrl) {
            var url = singletonsNamespace.RobotsManager.backendUrlGenerator.generateFileUrl('images', webcamImageUrl);
            var ctx = CanvasFactory.createFromImageUrl(url, 1, (function(ctx) {
                ctx.canvas.id = 'webCamImage';
                document.body.appendChild(ctx.canvas);

                robotsWebCamManager = new webcam.WebCamManager();
                robotsWebCamManager.initForTesting(this.useWebCamImage.bind(this));
                robotsWebCamManager.canvas = this.faceRecogniser.domElement = ctx.canvas;

                console.log('calling click process btn');

                this.faceRecogniser.findFace(this.faceRecogniser.DEFAULT_FACE_RECOGNITION_ENGINE, robotsWebCamManager.webCamPage.fakeClickProcessPictureButton.bind(robotsWebCamManager.webCamPage));
                // this.faceRecogniser.useCanvas(ctx.canvas, this.onWebCamImageLoaded.bind(this));
            }).bind(this), 0);
        }


        p.createStage = function() {
            var canvas = CanvasFactory.create(window.innerWidth, window.innerHeight).canvas;
            stage = new canvas_animation.Stage(canvas, 'MAIN STAGE');
            this.animContainer.appendChild(canvas);

            this._stageWidth = window.innerWidth;
            this._stageHeight = window.innerHeight;

            this.animContainer.style.setProperty("width", window.innerWidth + "px", "");
            this.animContainer.style.setProperty("height", window.innerHeight + "px", "");
            this.animContainer.style.setProperty("position", "absolute", "");

        }

        p.initWebCam = function(swfUrl, w, h) {
            // global, as flash needs to talk to it...
            robotsWebCamManager = new webcam.WebCamManager();
            robotsWebCamManager.init(swfUrl, w, h, this.useWebCamImage.bind(this));
        }


        p.useWebCamImage = function(onFaceChecked) {
            this.onFaceChecked = onFaceChecked;

            robotsWebCamManager.domElement.id = 'webCamImage';
            document.body.appendChild(robotsWebCamManager.domElement); // required for later stages of anim //MENOTE: What? and why?

            this.faceRecogniser.useCanvas(robotsWebCamManager.domElement, (function() {
                this.faceRecogniser.findFace(this.faceRecogniser.DEFAULT_FACE_RECOGNITION_ENGINE, this.onFaceChecked);
            }).bind(this));
        }


        p.getFaceOval = function(faceCanvas, faceData) {
            this._currentImage = faceCanvas;

            var bigFaceWidth = 550;
            var bigFace = CanvasFactory.clone(faceCanvas, bigFaceWidth / faceCanvas.width).canvas;

            this.webCamImage = new canvas_animation.Sprite(bigFace);
            this.webCamImage.scaleX = this.webCamImage.scaleY = faceCanvas.width / bigFaceWidth;

            this.getFaceOvalAnim = new robots_animation.Seq1_GetFaceOval(faceData);

            var faceOvalObject = this.getFaceOvalAnim.createFaceOval(this.webCamImage);

            this.faceOval = faceOvalObject.faceOval;
            this.faceOvalData = faceOvalObject.faceOvalData;

            return this.faceOval;
        }


        p.preRenderAdaptiveThresholdFrames = function(onComplete) {
            this.adaptiveThreshold = new robots_animation.AdaptiveThreshold();
            this.adaptiveThreshold.preRender(this.faceOval.canvas, 15, onComplete);
        }


        p.cancelAdaptiveFramesPreRender = function() {
            if (this.adaptiveThreshold) this.adaptiveThreshold.cancelPreRender();
        }


        p.scaleWebCamImage = function(faceData, coords) {
            this.faceData = faceData || this.faceData;
            this.createStage();

            this.webCamImage.x = coords.x;
            this.webCamImage.y = coords.y;

            TweenHelper.to(this.webCamImage, 1, .6, {
                x: stage.canvas.width / 2 - this.webCamImage.canvas.width / 2,
                y: stage.canvas.height / 2 - this.webCamImage.canvas.height / 2,
                scaleX: 1,
                scaleY: 1
            }, TweenHelper.quart.EaseInOut).onComplete(this.startAnim.bind(this)).start();

            stage.addChild(this.webCamImage, 'web cam image');
        }


        p.startAnim = function() {
            this._animationDone = false;
            this._hasReserveData = false;
            this._hasReservedSpace = false;

            setTimeout(this.showFaceOval.bind(this), 500);

            window.addEventListener("resize", this._onResizeCallback, false);
        }

        p._onResize = function(aEvent) {

            var currentPositionX = Math.round(0.5 * (window.innerWidth - this._stageWidth));
            var currentPositionY = Math.round(0.5 * (window.innerHeight - this._stageHeight));

            this.animContainer.style.setProperty("left", currentPositionX + "px", "");
            this.animContainer.style.setProperty("top", currentPositionY + "px", "");

        }


        ///////// ANIMATION SEQUENCES


        p.showFaceOval = function() {
            this.getFaceOvalAnim.start(stage, this.desaturate.bind(this));
            singletonsNamespace.RobotsManager.animProgressIndicator.showStep(0);
        }


        p.desaturate = function(oval) {
            faceOval = oval || this.getFaceOvalAnim.faceOval; // gets passed through when testing == true //MENOTE: What does this comment even mean?
            this.faceData = this.getFaceOvalAnim.face;

            var desaturateAnim = new robots_animation.Seq2_Desaturate(stage);
            desaturateAnim.start(faceOval, this.threshold.bind(this));

            singletonsNamespace.RobotsManager.animProgressIndicator.showStep(2);
        }


        p.threshold = function(oval) {
            faceOval = oval || this.getFaceOvalAnim.faceOval; // gets passed through when testing == true

            this.thresholdAnim = new robots_animation.Seq3_Threshold(stage);
            this.thresholdAnim.start(faceOval, this.edgeDetection.bind(this), this.faceData, this.adaptiveThreshold.finalParams);

            singletonsNamespace.RobotsManager.animProgressIndicator.showStep(3);
        }


        p.edgeDetection = function() {
            this.faceData = this.faceOvalData;

            var edgeDetectionAnim = new robots_animation.Seq4_EdgeDetection(stage);
            edgeDetectionAnim.start(this.vectorise.bind(this), this.faceData);

            singletonsNamespace.RobotsManager.animProgressIndicator.showStep(4);
        }


        p.vectorise = function() {
            // if (!this.faceData) this.faceData = this.getFaceOvalAnim.face; // gets set when testing == true

            var vectoriseAnim = new robots_animation.Seq5_Vectorise(stage);
            vectoriseAnim.start(this.createSvg.bind(this), this.faceData);

            singletonsNamespace.RobotsManager.animProgressIndicator.showStep(5);
        }


        p.createSvg = function() {
            // get paths
            var facePathData = stage.getChildById('face oval THRESHOLD').pathData;

            // convert paths to svg
            var svgOps = new(WEBLAB.namespace('WEBLAB.robots.vectorise')).SVGOps();
            svgOps.createSVG(facePathData.width, facePathData.height);
            svgOps.createGradients(userCols);
            svgOps.addToSVG(facePathData, 'grad1');

            // serialise SVG to string
            var serializer = new XMLSerializer();
            this.svgStr = serializer.serializeToString(svgOps.svg);

            // FF appends a0: and a0= to attributes. No idea why.
            var regEx = /a0./g;
            this.svgStr = this.svgStr.replace(regEx, '');

            var regExp = /xmlns:"http:\/\/www.w3.org\/2000\/svg" /g;
            this.svgStr = this.svgStr.replace(regExp, '');

            // and carry on
            this.deleteOriginal();
        }


        p.deleteOriginal = function() {
            this.deleteOriginalAnim = new robots_animation.Seq6_DeleteOriginal(stage, userCols);
            this.deleteOriginalAnim.start(this.leaveAnimation.bind(this));

            singletonsNamespace.RobotsManager.animProgressIndicator.showStep(6);

            this.reserveSpace();
        }


        p.initSectionHeadingManager = function() {
            this.sectionHeadingManager = new robots_animation.SectionHeadingManager();
            this.sectionHeadingManager.init();
        }

        p.reserveSpace = function() {
            console.log("WEBLAB.robots.RobotsAnimManager::reserveSpace");

            var url = "/sandRobots/reserveSlot?labTagId=" + BackendComms.getLabTagId();

            this._reserveSpaceLoader = JsonLoader.create(url);
            this._reserveSpaceLoader.addEventListener(JsonLoader.LOADED, this._reservedSpaceLoadedCallback, false);
            this._reserveSpaceLoader.addEventListener(JsonLoader.ERROR, this._reservedSpaceLoadingErrorCallback, false);
            this._reserveSpaceLoader.load();
        };

        p._reservedSpaceLoaded = function(aEvent) {
            console.log("WEBLAB.robots.RobotsAnimManager::_reservedSpaceLoaded");

            this._hasReserveData = true;

            var data = aEvent.detail;

            if (data.status.ok && data.response.reserved) {
                this._hasReservedSpace = true;
                singletonsNamespace.RobotsManager.getPageManager().setNumberOfSlots(data.response.availableSlots);
                singletonsNamespace.RobotsManager.getPageManager().setSlotId(data.response.slotId);
            } else {
                this._hasReservedSpace = false;
                singletonsNamespace.RobotsManager.getPageManager().setNumberOfSlots((data.status.ok) ? 0 : -1);
            }

            this._leaveIfReady();
        };

        p._reservedSpaceLoadingError = function(aEvent) {
            console.log("WEBLAB.robots.RobotsAnimManager::_reservedSpaceLoadingError");

            this._hasReserveData = true;
            this._hasReservedSpace = false;
            singletonsNamespace.RobotsManager.getPageManager().setNumberOfSlots(-1); //MEDEBUG: //
            //singletonsNamespace.RobotsManager.getPageManager().setNumberOfSlots(2); //MEDEBUG

            this._leaveIfReady();
        };

        p.leaveAnimation = function() {

            this._animationDone = true;
            doRender = false;

            this._leaveIfReady();
        };

        p._leaveIfReady = function() {

            if (this._animationDone && this._hasReserveData) {
                window.removeEventListener("resize", this._onResizeCallback, false);
                singletonsNamespace.RobotsManager.getPageManager().showPage('submit');
            }
        };

        p.render = function() {
            if (stage) stage.update();
            if (doRender) requestAnimFrame(this.render.bind(this));
        };
    }
})();
