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

// constants
var WEBCAM_SWF_FALLBACK_URL = 'files'

// globals
var robotsWebCamManager; // see RobotsWebCamController._initWebCamManager for more on why this is global


// class
/**
 * The RobotsWebCamController is a complete UI widget which allows the capture of still
 * images from the user's web cam.
 *
 * Instances of this class fire the following events:
 *      RobotsMainControllerEvents.SET_USER_MESSAGE
 *      RobotsMainControllerEvents.IMAGE_READY_FOR_UPLOAD
 *
 */
var RobotsWebCamController = new Class({
    Implements: [Events],

    _UIContainer: null,

    _backgroundBlocker: null,
    _webCamContainer: null,

    _webCamSWFURL: null,
    _webCamW: null,
    _webCamH: null,

    _countdownController: null,
    _countdownUIContainer: null,

    _webCamBox: null,
    _help: null,
    _takePictureButton: null,
    _resetButton: null,
    _saveButton: null,

    _currentImage: null,
    _currentTopicName: null,



    /**
     * Sets up the web cam capture UI
     *
     * @param UIContainer a Mootools Element in which the web cam UI should be contained
     * @param webCamSWFURL a String indicating the URL for a fallback SWF file that can be used if WebRTC is unavailable
     * @param webCamW The number of pixels wide the web cam UI should be
     * @param webCamH The number of pixels high the web cam UI should be
     *
     */
    initialize: function(UIContainer, webCamSWFURL, webCamW, webCamH) {
        this._UIContainer = UIContainer;

        this._webCamSWFURL = webCamSWFURL;
        this._webCamW = webCamW;
        this._webCamH = webCamH;

        //
        //a box to contain the webcam preview image (only ONE of these for the whole UI)
        //
        this._webCamBox = new Element('div', {
            id: 'webCamBox',
            hidden: true,
        });
        if ($(this._webCamBox.id)) {
            this._webCamBox.replaces(new Element($(this._webCamBox.id)));
        } else {
            this._webCamBox.inject(this._UIContainer);
        }

        this._backgroundBlocker = new Element('div', {
            'class': 'Background',
        }).inject(this._webCamBox);

        this._webCamContainer = new Element('div', {
            'class': 'Window',
        }).inject(this._backgroundBlocker);

        this._countdownUIContainer = new Element('div', {
            class: 'Countdown',
            hidden: true,
        }).inject(this._webCamContainer);


        this._help = new Element('div', {
            'class': 'Help',
            'html': ''
        }).inject(this._webCamContainer);

        new Element('div', {
            'id': 'webCamPreviewHolder',
            'class': 'Preview'
        }).inject(this._webCamContainer);

        var buttons = new Element('div', {
            id: 'webCamTools',
            'class': 'Tools',
            hidden: true,
        }).inject(this._webCamContainer);

        UIWidgets.getNewButtonElement({
            'class': 'Cancel',
            'text': _('CANCEL_WEBCAM_PICTURE_LABEL'),
        }).inject(buttons).addEvent('click', this.hide.bind(this));

        // it also needs some buttons
        this._takePictureButton = UIWidgets.getNewButtonElement({
            'class': 'TakePicture',
            'text': _('TAKE_WEBCAM_PICTURE_LABEL'),
            hidden: false,
        }).inject(buttons).addEvent('click', function(e) {
            this._startImageCapture();
        }.bind(this));

        // it also needs some buttons
        this._resetButton = UIWidgets.getNewButtonElement({
            'class': 'Reset',
            'text': _('RESET_WEBCAM_PICTURE_LABEL'),
            hidden: true,
        }).inject(buttons).addEvent('click', this._reset.bind(this));

        this._saveButton = UIWidgets.getNewButtonElement({
            'class': 'Save',
            'text': _('SAVE_WEBCAM_PICTURE_LABEL'),
            hidden: true,
        }).inject(buttons).addEvent('click', this._save.bind(this));

    }, //initialize

    /**
     * Displays this web cam capture UI
     *
     * @param topicName a String containing the name of the queue topic to which the image will be sent (if captured)
     *
     */
    show: function(topicName) {
        this._currentTopicName = topicName;
        this._reset();
        this._webCamBox.hidden = false;
    },

    /**
     * Hides the webcam UI regardness of its state.
     *
     */
    hide: function() {
        this._webCamBox.hidden = true;
    },

    //
    // private methods
    //

    _startImageCapture: function() {
        //this._showCountdown(); // TODO - fix "Uncaught RangeError: Maximum call stack size exceeded" bug in the countdown functionality
        // for now, just go straight to the flash
        this._showCameraFlash();
    },

    _setUserMessage: function(msg) {
        //document.fireEvent(RobotsMainControllerEvents.SET_USER_MESSAGE, msg);
        this._help.innerHTML = msg;
    },

    _reset: function() {
        if (!robotsWebCamManager)
            this._initWebCamManager(this._webCamSWFURL, this._webCamW, this._webCamH);
        robotsWebCamManager.reset();
        //reset button state
        this._saveButton.hidden = true;
        this._resetButton.hidden = true;
        this._takePictureButton.hidden = false;
    },

    _save: function() {
        //notify listeners that there is an image ready to use
        this.fireEvent(RobotsMainControllerEvents.IMAGE_READY_FOR_UPLOAD, [this._currentTopicName, this._currentImage.toDataURL()]);
    },

    _showCountdown: function() {
        this._countdownController = new WEBLAB.robots.webcam.WebCamCountdown();
        this._countdownController.init();
        this._countdownController.scaleNumbers(this._showCameraFlash.bind(this));
        this._countdownUIContainer.appendChild(this._countdownController.domElement);
        this._countdownUIContainer.hidden = false;
    },

    _showCameraFlash: function() {
        this._countdownUIContainer.hidden = true;

        var cameraFlash = new Element('div', {
            id: 'robotsWebCamWhiteFlash'
        }).inject(this._UIContainer);


        setTimeout(this._onCameraFlashEnd.bind(this), 1000);

        // don't interfere with rendering
        //TODO
    },

    _onCameraFlashEnd: function() {
        //get rid of the flash
        new Element($('robotsWebCamWhiteFlash')).dispose();
        //take the current video frame and turn it into image data
        robotsWebCamManager.encodePicture();
        robotsWebCamManager.takePicture();
    },


    _initWebCamManager: function(swfUrl, w, h) {
        // make sure we don't do this twice
        if (robotsWebCamManager != null) return;

        // global, as flash needs to talk to it...
        robotsWebCamManager = new WEBLAB.robots.webcam.WebCamManager();

        //
        // set up some event handlers
        //

        // when the camera is initialized hide any permissions message and display the action buttons
        // note that this usually only happens once per page load
        robotsWebCamManager.addEvent(WEBLAB.robots.constants.WebCamEventTypes.WEBCAM_READY, function(e) {
            this._setUserMessage(null);
            $('webCamTools').hidden = false;
        }.bind(this));

        // dsplay a useful message if the web cam access requires the user to grant security permission
        robotsWebCamManager.addEvent(WEBLAB.robots.constants.WebCamEventTypes.NEED_WEBRTC_PERMISSION, function(e) {
            this._setUserMessage(_('WEBCAM_PERMISSIONS_MESSAGE_TEXT'));
        }.bind(this));

        // display a message if no web cam hardware is available
        robotsWebCamManager.addEvent(WEBLAB.robots.constants.WebCamEventTypes.WEBCAM_NOT_FOUND, function(e) {
            this._setUserMessage(_('WEBCAM_NOT_FOUND_MESSAGE_TEXT'));
        }.bind(this));


        // display a message if no web cam hardware is available
        robotsWebCamManager.addEvent(WEBLAB.robots.constants.WebCamEventTypes.WEBCAM_ACCESS_DENIED, function(e) {
            this._setUserMessage(_('WEBCAM_ACCESS_DENIED_MESSAGE_TEXT'));
            //destroy the robotsWebCamManager so that it can be re-initted and thus check permissions again
            robotsWebCamManager.destroy();
            robotsWebCamManager = null;
            this._resetButton.hidden = false;
        }.bind(this));

        // this is what happens when an image is done being captured from the live camera stream
        robotsWebCamManager.addEvent(WEBLAB.robots.constants.WebCamEventTypes.PICTURE_TAKEN, function(e) {
            var image = e.detail;
            this._currentImage = image;
            this._takePictureButton.hidden = true;
            this._saveButton.hidden = false;
            this._resetButton.hidden = false;
        }.bind(this));


        // finally, do the actual initialization
        robotsWebCamManager.init(swfUrl, w, h, this._useWebCamImage.bind(this));
    }, //_initWebCamManager

    _useWebCamImage: function(onFaceChecked) {
        //TODO
        robotsWebCamManager.domElement.id = 'webCamImage';
        document.body.appendChild(robotsWebCamManager.domElement); // required for later stages of anim //MENOTE: What? and why?
    },


});
