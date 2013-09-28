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

// globals

// class
var RobotsFilePickerController = new Class({
    Implements: [Events],

    _UIContainer: null,
    _filePickerBox: null,
    _backgroundBlocker: null,
    _filePickerContainer: null,
    _filePreview: null,

    _selectFileButton: null,
    _saveButton: null,

    _currentTopicName: null,

    initialize: function(UIContainer) {
        this._UIContainer = UIContainer;

        this._filePickerBox = new Element('div', {
            id: 'filePickerBox',
            hidden: true,
        });
        if ($(this._filePickerBox.id)) {
            this._filePickerBox.replaces(new Element($(this._filePickerBox.id)));
        } else {
            this._filePickerBox.inject(this._UIContainer);
        }

        this._backgroundBlocker = new Element('div', {
            'class': 'Background',
        }).inject(this._filePickerBox);

        this._filePickerContainer = new Element('div', {
            'class': 'Window',
        }).inject(this._backgroundBlocker);

        new Element('div', {
            'class': 'Help',
            'html': _('FILE_PICKER_PROMPT')
        }).inject(this._filePickerContainer);

        this._filePreview = new FilePreviewController(this._filePickerContainer);

        // create the file select button
        this._selectFileButton = new Element('input', {
            'type': 'file',
            'accept': 'image/png, image/jpeg, text/plain, text/gcode',
            'class': 'File',
        }).inject(new Element('form', {
            runat: 'server',
        }).inject(this._filePickerContainer)).addEvent('change', function(e) {
            this._saveButton.hidden = false;
            this._filePreview.refresh(e.target || e.currentTarget);
        }.bind(this));

        var buttons = new Element('div', {
            id: 'filePickerTools',
            'class': 'Tools',
        }).inject(this._filePickerContainer);

        UIWidgets.getNewButtonElement({
            'class': 'Cancel',
            'text': _('CANCEL_FILE_LABEL'),
        }).inject(buttons).addEvent('click', this.hide.bind(this));

        this._saveButton = UIWidgets.getNewButtonElement({
            'class': 'Save',
            'text': _('SAVE_FILE_LABEL'),
            hidden: true,
        }).inject(buttons).addEvent('click', this._save.bind(this));
    },

    /**
     * Displays this file picker UI
     *
     * @param topicName a String containing the name of the queue topic to which the image will be sent (if captured)
     *
     */
    show: function(topicName) {
        this._currentTopicName = topicName;
        this._reset();
        this._filePickerBox.hidden = false;
    },

    hide: function() {
        this._filePickerBox.hidden = true;
    },

    //
    // private methods
    //

    _reset: function() {
        //TODO
        this._saveButton.hidden = true;
    },


    _save: function() {
        var reader = new FileReader();
        reader.onload = function(e) {
            this.fireEvent(RobotsMainControllerEvents.IMAGE_READY_FOR_UPLOAD, [this._currentTopicName, e.target.result]);
        }.bind(this);
        reader.readAsDataURL(this._selectFileButton.files[0]);
    },


});
