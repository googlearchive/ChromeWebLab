/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
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

