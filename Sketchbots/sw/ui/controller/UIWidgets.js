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
var UIWidgets = new Class({});
UIWidgets.getNewButtonElement = function(options) {
    return new Element('button', options);
    /*
        var txt;
        if (options.hasOwnProperty('text')) {
            txt = options['text'];
            delete(options['text']);
        }
        if (options.hasOwnProperty('html')) delete(options['html']);
        options['title'] = txt;
        var b = new Element('button', options);
        var captionOptions = { 'text': txt };
        if (options.hasOwnProperty('hidden')) captionOptions['hidden'] = options['hidden'];
        new Element('h4', captionOptions).inject(b);
        return b;
        */
};
