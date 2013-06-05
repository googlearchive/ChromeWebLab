/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

// constants
var BLANK_IMAGE_DATAURL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// globals


// class
/**
 * The FilePreviewController is a complete UI widget for previewing files before they are uploaded from a form.
 *
 */
var FilePreviewController = new Class(
{
	Implements: [Events],

	_UIContainer: null,
    _previewContainer: null,
    _previewImage: null,
    _gcodePreviewSceneContainer: null,
    _gcodePreviewScene: null,

    /**
     * Sets up the file preview controller
     *
     * @param UIContainer a Mootools Element in which the preview UI should be contained
     *
     */
	initialize: function(UIContainer)
    {		
		this._UIContainer = UIContainer;
        this._previewContainer = new Element('div',
        {
            'class': 'Preview Empty',
        }).inject(this._UIContainer);

        // create an image which we will use to display a preview of the file (assuming it is an image)
        this._previewImage = new Element('img',
        {
            id: 'filePickerPreview',
            'src': BLANK_IMAGE_DATAURL, // default preview image is a tiny transparent GIF, per http://probablyprogramming.com/2009/03/15/the-tiniest-gif-ever
            'alt': 'preview',
            hidden: true,
        }).inject(this._previewContainer);

        // for g-code files we need a Three.js scene to do some custom rendering
        this._gcodePreviewSceneContainer = new Element('div',
        {
            id: 'filePickerPreviewScene',
            hidden: false,
        }).inject(this._previewContainer);
        this._gcodePreviewScene = new GCodeScene(this._gcodePreviewSceneContainer, 300, 300);
        this._gcodePreviewScene.enableControls = false;
        this._gcodePreviewScene.enableRendering = false;

    },


    refresh: function(field)
    {
        if (!field.hasOwnProperty('files') || field.files.length <= 0) {
            console.warn('Attempted to preview file upload, but no file was selected');
            return;
        }

        var reader = new FileReader();
        console.log("Uploaded file of type " + field.files[0].type);
        if ((field.files[0].type.substr(5) == 'text/') || (field.files[0].name.toLowerCase().substr(-6) == '.gcode') || (field.files[0].name.toLowerCase().substr(-4) == '.txt'))
        {
            reader.onload = function(e)
            {
                //
                // preview as g-code (text)
                //
                console.log('Previewing ' + field.files[0].name + ' as text');
                this._previewImage.hidden = true;
                this._gcodePreviewSceneContainer.hidden = false;
                this._previewImage.src = BLANK_IMAGE_DATAURL;
                this._gcodePreviewScene.loadGCodeFromString(e.target.result);
                this._previewContainer.removeClass('Empty');

            }.bind(this);
            reader.readAsText(field.files[0]);

        }
        else {
            reader.onload = function(e)
            {
                //
                // preview as an image
                //
                console.log('Previewing ' + field.files[0].name + ' as binary')
                this._previewImage.hidden = false;
                this._gcodePreviewSceneContainer.hidden = true;
                if (new DataURL(e.target.result).getMIMEType() == 'image') {
                    this._previewImage.src = e.target.result; // preview an image
                    this._previewContainer.removeClass('Empty');
                } else {
                    this._previewImage.src = BLANK_IMAGE_DATAURL; // some other kind of file?
                    this._previewContainer.addClass('Empty');
                }

            }.bind(this);
            reader.readAsDataURL(field.files[0]);
        }
    },

});

