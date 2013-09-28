/*
Copyright © 2011 Eli Grey.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* BlobBuilder.js
 * A complete BlobBuilder shim
 * By Eli Grey
 * License: MIT/X11
 */

/*global self, unescape, encodeURIComponent */
/*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
  plusplus: true, maxerr: 50, indent: 4 */

var BlobBuilder = BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || (function(view) {
    "use strict";
    var
    get_class = function(object) {
        return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
    }, FakeBlobBuilder = function() {}, FakeBlob = function(data, type) {
            this.data = data;
            this.size = data.length;
            this.type = type;
        }, FBB_proto = FakeBlobBuilder.prototype = [],
        FB_proto = FakeBlob.prototype,
        FileReaderSync = view.FileReaderSync,
        FileException = function(type) {
            this.code = this[this.name = type];
        }, file_ex_codes = (
            "NOT_FOUND_ERR SECURITY_ERR ABORT_ERR NOT_READABLE_ERR ENCODING_ERR " + "NO_MODIFICATION_ALLOWED_ERR INVALID_STATE_ERR SYNTAX_ERR"
        ).split(" "),
        file_ex_code = file_ex_codes.length,
        URL = view.URL = view.URL || view.webkitURL || view,
        real_create_object_url, real_revoke_object_url, btoa = view.btoa,
        can_apply_typed_arrays = false,
        can_apply_typed_arrays_test = function(pass) {
            can_apply_typed_arrays = !pass;
        }

        , ArrayBuffer = view.ArrayBuffer,
        Uint8Array = view.Uint8Array;
    while (file_ex_code--) {
        FileException.prototype[file_ex_codes[file_ex_code]] = file_ex_code + 1;
    }
    try {
        if (Uint8Array) {
            can_apply_typed_arrays_test.apply(0, new Uint8Array(1));
        }
    } catch (ex) {}
    if (!URL.createObjectURL) {
        URL = {};
    }
    real_create_object_url = URL.createObjectURL;
    real_revoke_object_url = URL.revokeObjectURL;
    URL.createObjectURL = function(blob) {
        var type = blob.type;
        if (type === null) {
            type = "application/octet-stream";
        }
        if (blob instanceof FakeBlob) {
            if (btoa) {
                return "data:" + type + ";base64," + btoa(blob.data);
            } else {
                return "data:" + type + "," + encodeURIComponent(blob.data);
            }
        } else if (real_create_object_url) {
            return real_create_object_url.call(URL, blob);
        }
    };
    URL.revokeObjectURL = function(object_url) {
        if (object_url.substring(0, 5) !== "data:" && real_revoke_object_url) {
            real_revoke_object_url.call(URL, object_url);
        }
    };
    FBB_proto.append = function(data /*, endings*/ ) {
        var bb = this;
        // decode data to a binary string
        if (Uint8Array && data instanceof ArrayBuffer) {
            if (can_apply_typed_arrays) {
                bb.push(String.fromCharCode.apply(String, new Uint8Array(data)));
            } else {
                var
                str = "",
                    buf = new Uint8Array(data),
                    i = 0,
                    buf_len = buf.length;
                for (; i < buf_len; i++) {
                    str += String.fromCharCode(buf[i]);
                }
            }
        } else if (get_class(data) === "Blob" || get_class(data) === "File") {
            if (FileReaderSync) {
                var fr = new FileReaderSync;
                bb.push(fr.readAsBinaryString(data));
            } else {
                // async FileReader won't work as BlobBuilder is sync
                throw new FileException("NOT_READABLE_ERR");
            }
        } else if (data instanceof FakeBlob) {
            bb.push(data.data);
        } else {
            if (typeof data !== "string") {
                data += ""; // convert unsupported types to strings
            }
            // decode UTF-16 to binary string
            bb.push(unescape(encodeURIComponent(data)));
        }
    };
    FBB_proto.getBlob = function(type) {
        if (!arguments.length) {
            type = null;
        }
        return new FakeBlob(this.join(""), type);
    };
    FBB_proto.toString = function() {
        return "[object BlobBuilder]";
    };
    FB_proto.slice = function(start, end, type) {
        var args = arguments.length;
        if (args < 3) {
            type = null;
        }
        return new FakeBlob(
            this.data.slice(start, args > 1 ? end : this.data.length), type
        );
    };
    FB_proto.toString = function() {
        return "[object Blob]";
    };
    return FakeBlobBuilder;
}(self));
