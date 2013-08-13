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

// class
var DataURL = new Class({
    _URL: null,
    _MIMETypeParts: null,
    _encodingType: null,
    _encodedData: null,
    _decodedData: null,

    //
    // public methods
    //

    /**
     * Initialize a DataURL object.
     *
     * @param url a String containing a data: URL
     *
     */
    initialize: function(url) {
        if (!url || !url.length > 7 || (url.substr(0, 5) != 'data:')) {
            //invalid data URL
            throw new Error("Invalid data URL string");
        }
        var parts = url.split(',');
        var headerParts = parts[0].split(';');
        headerParts[0] = headerParts[0].substr(5);
        if (headerParts[0].length > 0) {
            this._MIMETypeParts = headerParts[0].toLowerCase().split('/');
        } else {
            this._MIMETypeParts = null;
        }
        this._encodingType = headerParts[1].toLowerCase();
        this._encodedData = parts[1];
        this._decodedData = null; // we will lazily fill this member variable if someone calls getDecodedData()
    },

    /**
     * Returns a string with the MIME type of the underlying data, eg. "image/png"
     * Will return null if the data's MIME type is unknown or invalid.
     *
     */
    getFullMIMEType: function() {
        return (this._MIMETypeParts != null) ? this._MIMETypeParts.join('/') : null;
    },

    /**
     * Returns a string containing only the first part of the MIME type (the "type") e.g. "image"
     * Will return null if the data's MIME type is unknown or invalid.
     *
     */
    getMIMEType: function() {
        return (this._MIMETypeParts != null) ? this._MIMETypeParts[0] : null;
    },

    /**
     * Returns a string containing only the second part of the MIME type (the "subtype") e.g. "png"
     * Will return null if the data's MIME type is unknown or invalid.
     *
     */
    getMIMESubType: function() {
        return (this._MIMETypeParts != null) ? this._MIMETypeParts[1] : null;
    },

    /**
     * Returns a string indicating the type of encoding used for the data, eg. "base64"
     *
     */
    getEncodingType: function() {
        return this._encodingType;
    },

    /**
     * Returns the URL's encoded data as a string
     *
     */
    getDataString: function() {
        return this._encodedData;
    },

    /**
     * Attempts to return a binary object (eg Blob) which contains the underlying data in its decoded form.
     *
     */
    getDecodedData: function() {
        if (!this._decodedData) {
            //decode the data (default to base-64 if there is no specified encoding)
            if (!this._encodingType || (this._encodingType == 'base64')) {
                var mimeType = this.getFullMIMEType();
                if (!mimeType) mimeType = 'application/octet-stream';
                this._decodedData = new Blob([new Uint8Array(Base64Binary.decodeArrayBuffer(this._encodedData))], {
                    'type': mimeType
                });
            } else
            // some other kind of unknown encoding
                throw new Error('Cannot decode data because DataURL does not internally understand the encoding (' + this._encodingType + '). Instead you may manually decode the encoded data as returned by getDataString()');
        }

        return this._decodedData;
    },

    /**
     * Returns the full URL used to construct this DataURL object
     *
     */
    getURL: function() {
        return this._URL;
    }


});
