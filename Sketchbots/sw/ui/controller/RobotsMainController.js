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
var AUTO_REFRESH_INTERVAL = 4000; //set to 0 or null to disable auto refresh

// class
var RobotsQueueManager = new Class({
    Implements: [Options, Events],

    _UIContainer: null, // a DOM element which will contain most of the UI

    _webCamController: null,
    _filePickerWrapper: null,
    _filePickerController: null,
    _topicQueuesController: null,

    //
    // public methods
    //

    /**
     * Initialize the entire Sketchbots drawing UI
     *
     * @param wrapper a Mootools Element in which the UI should be contained
     * @param webCamSWFURL a String indicating the URL for a fallback SWF file that can be used if WebRTC is unavailable
     * @param webCamW The number of pixels wide the web cam UI should be
     * @param webCamH The number of pixels high the web cam UI should be
     *
     */
    initialize: function(wrapper, webCamSWFURL, webCamW, webCamH, data, options) {
        this.setOptions(options);

        this.wrapper = document.id(wrapper);
        this.data = data;

		var globalContainer = new Element('div', {
            id: 'globalContainer'
        }).inject(this.wrapper);

        // first, build the basic UI structure (see CSS and HTML for how this UI is presented as a view)
        var header = new Element('div', {
            id: 'header'
        }).inject(globalContainer);
        new Element('h2', {
            'text': _('PAGE_SUBTITLE'),
        }).inject(header);
        new Element('h1', {
            'text': _('PAGE_TITLE'),
        }).inject(header);

        // one container to rule them all
        this._UIContainer = new Element('div', {
            id: 'uiContainer',
        }).inject(globalContainer);

        // a container in which global navigation may some day be placed
        var GlobalNavWrapper = new Element('div', {
			'id': 'GlobalNav',
            'class': 'GlobalNav',
        }).inject(this._UIContainer);
		new Element('h1', {
			'text': _('GLOBAL_NAV_HEADER'),
		}).inject(GlobalNavWrapper);

		var GlobalNavTrigger = new Element('div', {
			id: 'GlobalNavTrigger',
			'html': '&#9776;',
			events: {
				click: function() {
					if (this.parentElement.classList.contains('Active')) {
						this.style.display = "block";
						this.parentElement.removeClass('Active');
					} else {
						this.style.display = "none";
						this.parentElement.addClass('Active');
					}
				}
			}
		}).inject(GlobalNavWrapper);

		var GlobalNav = new Element('ul').inject(GlobalNavWrapper);
		new Element('li', {
			'class': "Waiting",
			'text': _('WAITING_DRAWINGS_TITLE'),
		}).inject(GlobalNav);

		new Element('li', {
			'text': _('WORKING_DRAWINGS_TITLE'),
			'class': "Working",
		}).inject(GlobalNav);

		new Element('li', {
			'text': _('COMPLETED_DRAWINGS_TITLE'),
			'class': "Completed",
		}).inject(GlobalNav);

		$(GlobalNav).addEvent('click', function(e){
			document.querySelector('.TaskListWrapper.Active').removeClass('Active');
			document.querySelector('.TaskListWrapper.' + e.target.className).addClass('Active');
			document.getElementById('GlobalNav').removeClass('Active');
			GlobalNavTrigger.style.display = "block";
		});

        // a general element to hold messages to the user
        this._userMessageBox = new Element('div', {
            'class': 'MessageBox',
            'id': 'userMessageBox',
            hidden: true
        }).inject(this._UIContainer);

        // listen for global SET_USER_MESSAGE events coming from anywhere
        document.addEvent(RobotsMainControllerEvents.SET_USER_MESSAGE, this._onUserMessageEvent.bind(this));

        // create a RobotsWebCamController to let the user to add drawings from a web cam
        var webCamWrapper = new Element('div', {
            'class': 'AddBoxWrapper',
        }).inject(this.wrapper);
        this._webCamController = new RobotsWebCamController(webCamWrapper, webCamSWFURL, webCamW, webCamH);
        this._webCamController.addEvent(
            RobotsMainControllerEvents.IMAGE_READY_FOR_UPLOAD,
            this._createDrawingFromImage.bind(this));

        this._filePickerWrapper = new Element('div', {
            'class': 'AddBoxWrapper',
        }).inject(this.wrapper);
        this._rebuildFilePicker();

        // this creates a UI that allows interaction with queues on the server
        // this UI is placed that inside a div which is in turn wrapped in this._UIContainer
        this._topicQueuesController = new RobotsTopicQueuesController(
            new Element('div', {
                id: 'topicQueuesContainer',
            }).inject(this._UIContainer));

        // respond to requests for web cam drawings
        this._topicQueuesController.addEvent(RobotsMainControllerEvents.WEB_CAM_CAPTURE_REQUESTED, function(topicName) {
            this._filePickerController.hide();
            this._webCamController.show(topicName);
        }.bind(this));

        // and requests for drawings from files
        this._topicQueuesController.addEvent(RobotsMainControllerEvents.FILE_UPLOAD_REQUESTED, function(topicName) {
            this._webCamController.hide();
            this._rebuildFilePicker();
            this._filePickerController.show(topicName);
        }.bind(this));

        // refresh the UI periodically
        if (AUTO_REFRESH_INTERVAL > 0) {
            setInterval(this.refresh.bind(this), AUTO_REFRESH_INTERVAL);
        } else {
            this.refresh(); //just refresh once
        }
    },

    /**
     * Refreshes the display with the most recent data.
     * This method basically calls refresh() on various other objects.
     *
     */
    refresh: function() {
        // refresh the queue lists
        this._topicQueuesController.refresh();
    },

    /**
     * Displays or hides a non-modal message to the user.
     *
     * @param msg The String message to display, or null to hide the message
     *
     */
    setUserMessage: function(msg) {
        this._userMessageBox.textContent = msg;
        if (msg !== null) {
            this._userMessageBox.addClass('Show');
            this._userMessageBox.hidden = false;
        } else {
            this._userMessageBox.removeClass('Show');
            this._userMessageBox.hidden = true;
        }
    },

    //
    // private methods
    //

    _rebuildFilePicker: function() {
        // create a RobotsFilePickerController to let the user to add drawings from a local file on disk
        this._filePickerWrapper.empty();
        this._filePickerController = new RobotsFilePickerController(this._filePickerWrapper);
        this._filePickerController.addEvent(
            RobotsMainControllerEvents.IMAGE_READY_FOR_UPLOAD,
            this._createDrawingFromImage.bind(this));
    },

    _createDrawingFromImage: function(topicName, dataURL) {
        console.log("RobotsMainController._createDrawingFromImage in topic " + topicName + " with " + dataURL.length + ' bytes of base-64 data');
        this._webCamController.hide();
        this._filePickerController.hide();

        // this is where the drawing is actually sent to the server
        this._topicQueuesController.createDrawingTask(topicName, dataURL);
    },

    _onUserMessageEvent: function(e) {
        this.setUserMessage(e);
    },

});
