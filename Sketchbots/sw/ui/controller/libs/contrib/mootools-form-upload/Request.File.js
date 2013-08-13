/*
Copyright (c) 2012 Arian Stolwijk and Djamil Legato

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/*
---

name: Request.File
description: Uploading files with FormData
license: MIT-style license.
authors: [Arian Stolwijk, Djamil Legato]
requires: [Request]
provides: Request.File
credits: https://gist.github.com/a77b537e729aff97429c

...
*/

(function() {

    var progressSupport = ('onprogress' in new Browser.Request());

    Request.File = new Class({

        Extends: Request,

        options: {
            emulation: false,
            urlEncoded: false
        },

        initialize: function(options) {
            this.xhr = new Browser.Request();
            this.formData = new FormData();
            this.setOptions(options);
            this.headers = this.options.headers;
        },

        append: function(key, value) {
            this.formData.append(key, value);
            return this.formData;
        },

        reset: function() {
            this.formData = new FormData();
        },

        send: function(options) {
            if (!this.check(options)) return this;

            this.options.isSuccess = this.options.isSuccess || this.isSuccess;
            this.running = true;

            var xhr = this.xhr;
            if (progressSupport) {
                xhr.onloadstart = this.loadstart.bind(this);
                xhr.onprogress = this.progress.bind(this);
                xhr.upload.onprogress = this.progress.bind(this);
            }

            xhr.open('POST', this.options.url, true);
            xhr.onreadystatechange = this.onStateChange.bind(this);

            Object.each(this.headers, function(value, key) {
                try {
                    xhr.setRequestHeader(key, value);
                } catch (e) {
                    this.fireEvent('exception', [key, value]);
                }
            }, this);

            this.fireEvent('request');
            xhr.send(this.formData);

            if (!this.options.async) this.onStateChange();
            if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
            return this;
        }

    });

})();
