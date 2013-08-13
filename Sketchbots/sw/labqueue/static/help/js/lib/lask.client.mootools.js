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
/* lask client tools for MooTools
 */
var SignedJSONRequest = new Class({
    Extends: Request.JSON,

    initialize: function(options) {
        options['isSigned'] = true;
        this.parent(options);
        if (!options.hasOwnProperty('app_key'))
            throw new Error('ERROR: The \'app_key\' property must be specified in SignedJSONRequest options. It should contain your API app key as the value.');
        if (!options.hasOwnProperty('app_secret'))
            throw new Error('ERROR: The \'app_secret\' property must be specified in SignedJSONRequest options. It should contain your API app secret as the value.');
    },

    send: function(options) {
        //make sure the request is signed before sending
        if (!options) options = {}
        options['_auth'] = this.getAuthString();
        //this.options.headers['Authorization'] = this.getAuthString();
        this.parent(options);
    },
    get: function(options) {
        //make sure the request is signed before sending
        if (!options) options = {}
        options['_auth'] = this.getAuthString();
        //this.options.headers['Authorization'] = this.getAuthString();
        this.parent(options);
    },
    post: function(options) {
        //make sure the request is signed before sending
        if (!options) options = {}
        options['_auth'] = this.getAuthString();
        //this.options.headers['Authorization'] = this.getAuthString();
        this.parent(options);
    },

    getAuthString: function() {
        var a = document.createElement('a');
        a.href = this.options.url;
        var sig_target = a.pathname;
        var signature = __lask_client_mootools__CryptoJS.HmacMD5(sig_target, this.options.app_secret);
        return this.options.app_key + ':' + signature;
    }
});
/*******************************************************/
/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
var __lask_client_mootools__CryptoJS = __lask_client_mootools__CryptoJS || function(l, q) {
        var g = {}, i = g.lib = {}, p = i.Base = function() {
                function a() {}
                return {
                    extend: function(f) {
                        a.prototype = this;
                        var c = new a;
                        f && c.mixIn(f);
                        c.$super = this;
                        return c
                    },
                    create: function() {
                        var a = this.extend();
                        a.init.apply(a, arguments);
                        return a
                    },
                    init: function() {},
                    mixIn: function(a) {
                        for (var c in a) a.hasOwnProperty(c) && (this[c] = a[c]);
                        a.hasOwnProperty("toString") && (this.toString = a.toString)
                    },
                    clone: function() {
                        return this.$super.extend(this)
                    }
                }
            }(),
            m = i.WordArray = p.extend({
                init: function(a, f) {
                    a =
                        this.words = a || [];
                    this.sigBytes = f != q ? f : 4 * a.length
                },
                toString: function(a) {
                    return (a || r).stringify(this)
                },
                concat: function(a) {
                    var f = this.words,
                        c = a.words,
                        d = this.sigBytes,
                        a = a.sigBytes;
                    this.clamp();
                    if (d % 4)
                        for (var b = 0; b < a; b++) f[d + b >>> 2] |= (c[b >>> 2] >>> 24 - 8 * (b % 4) & 255) << 24 - 8 * ((d + b) % 4);
                    else if (65535 < c.length)
                        for (b = 0; b < a; b += 4) f[d + b >>> 2] = c[b >>> 2];
                    else f.push.apply(f, c);
                    this.sigBytes += a;
                    return this
                },
                clamp: function() {
                    var a = this.words,
                        b = this.sigBytes;
                    a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4);
                    a.length = l.ceil(b / 4)
                },
                clone: function() {
                    var a =
                        p.clone.call(this);
                    a.words = this.words.slice(0);
                    return a
                },
                random: function(a) {
                    for (var b = [], c = 0; c < a; c += 4) b.push(4294967296 * l.random() | 0);
                    return m.create(b, a)
                }
            }),
            n = g.enc = {}, r = n.Hex = {
                stringify: function(a) {
                    for (var b = a.words, a = a.sigBytes, c = [], d = 0; d < a; d++) {
                        var e = b[d >>> 2] >>> 24 - 8 * (d % 4) & 255;
                        c.push((e >>> 4).toString(16));
                        c.push((e & 15).toString(16))
                    }
                    return c.join("")
                },
                parse: function(a) {
                    for (var b = a.length, c = [], d = 0; d < b; d += 2) c[d >>> 3] |= parseInt(a.substr(d, 2), 16) << 24 - 4 * (d % 8);
                    return m.create(c, b / 2)
                }
            }, o = n.Latin1 = {
                stringify: function(a) {
                    for (var b =
                        a.words, a = a.sigBytes, c = [], d = 0; d < a; d++) c.push(String.fromCharCode(b[d >>> 2] >>> 24 - 8 * (d % 4) & 255));
                    return c.join("")
                },
                parse: function(a) {
                    for (var b = a.length, c = [], d = 0; d < b; d++) c[d >>> 2] |= (a.charCodeAt(d) & 255) << 24 - 8 * (d % 4);
                    return m.create(c, b)
                }
            }, j = n.Utf8 = {
                stringify: function(a) {
                    try {
                        return decodeURIComponent(escape(o.stringify(a)))
                    } catch (b) {
                        throw Error("Malformed UTF-8 data");
                    }
                },
                parse: function(a) {
                    return o.parse(unescape(encodeURIComponent(a)))
                }
            }, b = i.BufferedBlockAlgorithm = p.extend({
                reset: function() {
                    this._data = m.create();
                    this._nDataBytes = 0
                },
                _append: function(a) {
                    "string" == typeof a && (a = j.parse(a));
                    this._data.concat(a);
                    this._nDataBytes += a.sigBytes
                },
                _process: function(a) {
                    var b = this._data,
                        c = b.words,
                        d = b.sigBytes,
                        e = this.blockSize,
                        h = d / (4 * e),
                        h = a ? l.ceil(h) : l.max((h | 0) - this._minBufferSize, 0),
                        a = h * e,
                        d = l.min(4 * a, d);
                    if (a) {
                        for (var g = 0; g < a; g += e) this._doProcessBlock(c, g);
                        g = c.splice(0, a);
                        b.sigBytes -= d
                    }
                    return m.create(g, d)
                },
                clone: function() {
                    var a = p.clone.call(this);
                    a._data = this._data.clone();
                    return a
                },
                _minBufferSize: 0
            });
        i.Hasher = b.extend({
            init: function() {
                this.reset()
            },
            reset: function() {
                b.reset.call(this);
                this._doReset()
            },
            update: function(a) {
                this._append(a);
                this._process();
                return this
            },
            finalize: function(a) {
                a && this._append(a);
                this._doFinalize();
                return this._hash
            },
            clone: function() {
                var a = b.clone.call(this);
                a._hash = this._hash.clone();
                return a
            },
            blockSize: 16,
            _createHelper: function(a) {
                return function(b, c) {
                    return a.create(c).finalize(b)
                }
            },
            _createHmacHelper: function(a) {
                return function(b, c) {
                    return e.HMAC.create(a, c).finalize(b)
                }
            }
        });
        var e = g.algo = {};
        return g
    }(Math);
(function(l) {
    function q(b, e, a, f, c, d, g) {
        b = b + (e & a | ~e & f) + c + g;
        return (b << d | b >>> 32 - d) + e
    }

    function g(b, e, a, f, c, d, g) {
        b = b + (e & f | a & ~f) + c + g;
        return (b << d | b >>> 32 - d) + e
    }

    function i(b, e, a, f, c, d, g) {
        b = b + (e ^ a ^ f) + c + g;
        return (b << d | b >>> 32 - d) + e
    }

    function p(b, e, a, f, c, d, g) {
        b = b + (a ^ (e | ~f)) + c + g;
        return (b << d | b >>> 32 - d) + e
    }
    var m = __lask_client_mootools__CryptoJS,
        n = m.lib,
        r = n.WordArray,
        n = n.Hasher,
        o = m.algo,
        j = [];
    (function() {
        for (var b = 0; 64 > b; b++) j[b] = 4294967296 * l.abs(l.sin(b + 1)) | 0
    })();
    o = o.MD5 = n.extend({
        _doReset: function() {
            this._hash = r.create([1732584193, 4023233417,
                2562383102, 271733878
            ])
        },
        _doProcessBlock: function(b, e) {
            for (var a = 0; 16 > a; a++) {
                var f = e + a,
                    c = b[f];
                b[f] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360
            }
            for (var f = this._hash.words, c = f[0], d = f[1], k = f[2], h = f[3], a = 0; 64 > a; a += 4) 16 > a ? (c = q(c, d, k, h, b[e + a], 7, j[a]), h = q(h, c, d, k, b[e + a + 1], 12, j[a + 1]), k = q(k, h, c, d, b[e + a + 2], 17, j[a + 2]), d = q(d, k, h, c, b[e + a + 3], 22, j[a + 3])) : 32 > a ? (c = g(c, d, k, h, b[e + (a + 1) % 16], 5, j[a]), h = g(h, c, d, k, b[e + (a + 6) % 16], 9, j[a + 1]), k = g(k, h, c, d, b[e + (a + 11) % 16], 14, j[a + 2]), d = g(d, k, h, c, b[e + a % 16], 20, j[a + 3])) : 48 > a ? (c =
                i(c, d, k, h, b[e + (3 * a + 5) % 16], 4, j[a]), h = i(h, c, d, k, b[e + (3 * a + 8) % 16], 11, j[a + 1]), k = i(k, h, c, d, b[e + (3 * a + 11) % 16], 16, j[a + 2]), d = i(d, k, h, c, b[e + (3 * a + 14) % 16], 23, j[a + 3])) : (c = p(c, d, k, h, b[e + 3 * a % 16], 6, j[a]), h = p(h, c, d, k, b[e + (3 * a + 7) % 16], 10, j[a + 1]), k = p(k, h, c, d, b[e + (3 * a + 14) % 16], 15, j[a + 2]), d = p(d, k, h, c, b[e + (3 * a + 5) % 16], 21, j[a + 3]));
            f[0] = f[0] + c | 0;
            f[1] = f[1] + d | 0;
            f[2] = f[2] + k | 0;
            f[3] = f[3] + h | 0
        },
        _doFinalize: function() {
            var b = this._data,
                e = b.words,
                a = 8 * this._nDataBytes,
                f = 8 * b.sigBytes;
            e[f >>> 5] |= 128 << 24 - f % 32;
            e[(f + 64 >>> 9 << 4) + 14] = (a << 8 | a >>>
                24) & 16711935 | (a << 24 | a >>> 8) & 4278255360;
            b.sigBytes = 4 * (e.length + 1);
            this._process();
            b = this._hash.words;
            for (e = 0; 4 > e; e++) a = b[e], b[e] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360
        }
    });
    m.MD5 = n._createHelper(o);
    m.HmacMD5 = n._createHmacHelper(o)
})(Math);
(function() {
    var l = __lask_client_mootools__CryptoJS,
        q = l.enc.Utf8;
    l.algo.HMAC = l.lib.Base.extend({
        init: function(g, i) {
            g = this._hasher = g.create();
            "string" == typeof i && (i = q.parse(i));
            var l = g.blockSize,
                m = 4 * l;
            i.sigBytes > m && (i = g.finalize(i));
            for (var n = this._oKey = i.clone(), r = this._iKey = i.clone(), o = n.words, j = r.words, b = 0; b < l; b++) o[b] ^= 1549556828, j[b] ^= 909522486;
            n.sigBytes = r.sigBytes = m;
            this.reset()
        },
        reset: function() {
            var g = this._hasher;
            g.reset();
            g.update(this._iKey)
        },
        update: function(g) {
            this._hasher.update(g);
            return this
        },
        finalize: function(g) {
            var i =
                this._hasher,
                g = i.finalize(g);
            i.reset();
            return i.finalize(this._oKey.clone().concat(g))
        }
    })
})();
