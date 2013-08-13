/*
The MIT License

Copyright (c) 2010-2013 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/ // Three.js - http://github.com/mrdoob/three.js
'use strict';
var THREE = THREE || {
    REVISION: "48"
};
if (!self.Int32Array) self.Int32Array = Array, self.Float32Array = Array;
(function() {
    for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c) window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"];
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(b) {
        var c = (new Date).getTime(),
            g = Math.max(0, 16 - (c - a)),
            e = window.setTimeout(function() {
                b(c + g)
            }, g);
        a = c + g;
        return e
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame =
        function(a) {
            clearTimeout(a)
    }
})();
THREE.Clock = function(a) {
    this.autoStart = void 0 !== a ? a : !0;
    this.elapsedTime = this.oldTime = this.startTime = 0;
    this.running = !1
};
THREE.Clock.prototype.start = function() {
    this.oldTime = this.startTime = Date.now();
    this.running = !0
};
THREE.Clock.prototype.stop = function() {
    this.getElapsedTime();
    this.running = !1
};
THREE.Clock.prototype.getElapsedTime = function() {
    return this.elapsedTime += this.getDelta()
};
THREE.Clock.prototype.getDelta = function() {
    var a = 0;
    this.autoStart && !this.running && this.start();
    if (this.running) {
        var b = Date.now(),
            a = 0.001 * (b - this.oldTime);
        this.oldTime = b;
        this.elapsedTime += a
    }
    return a
};
THREE.Color = function(a) {
    void 0 !== a && this.setHex(a);
    return this
};
THREE.Color.prototype = {
    constructor: THREE.Color,
    r: 1,
    g: 1,
    b: 1,
    copy: function(a) {
        this.r = a.r;
        this.g = a.g;
        this.b = a.b;
        return this
    },
    copyGammaToLinear: function(a) {
        this.r = a.r * a.r;
        this.g = a.g * a.g;
        this.b = a.b * a.b;
        return this
    },
    copyLinearToGamma: function(a) {
        this.r = Math.sqrt(a.r);
        this.g = Math.sqrt(a.g);
        this.b = Math.sqrt(a.b);
        return this
    },
    convertGammaToLinear: function() {
        var a = this.r,
            b = this.g,
            c = this.b;
        this.r = a * a;
        this.g = b * b;
        this.b = c * c;
        return this
    },
    convertLinearToGamma: function() {
        this.r = Math.sqrt(this.r);
        this.g = Math.sqrt(this.g);
        this.b = Math.sqrt(this.b);
        return this
    },
    setRGB: function(a, b, c) {
        this.r = a;
        this.g = b;
        this.b = c;
        return this
    },
    setHSV: function(a, b, c) {
        var d, f, g;
        if (0 === c) this.r = this.g = this.b = 0;
        else switch (d = Math.floor(6 * a), f = 6 * a - d, a = c * (1 - b), g = c * (1 - b * f), b = c * (1 - b * (1 - f)), d) {
            case 1:
                this.r = g;
                this.g = c;
                this.b = a;
                break;
            case 2:
                this.r = a;
                this.g = c;
                this.b = b;
                break;
            case 3:
                this.r = a;
                this.g = g;
                this.b = c;
                break;
            case 4:
                this.r = b;
                this.g = a;
                this.b = c;
                break;
            case 5:
                this.r = c;
                this.g = a;
                this.b = g;
                break;
            case 6:
            case 0:
                this.r = c, this.g = b, this.b = a
        }
        return this
    },
    setHex: function(a) {
        a =
            Math.floor(a);
        this.r = (a >> 16 & 255) / 255;
        this.g = (a >> 8 & 255) / 255;
        this.b = (a & 255) / 255;
        return this
    },
    getHex: function() {
        return Math.floor(255 * this.r) << 16 ^ Math.floor(255 * this.g) << 8 ^ Math.floor(255 * this.b)
    },
    getContextStyle: function() {
        return "rgb(" + Math.floor(255 * this.r) + "," + Math.floor(255 * this.g) + "," + Math.floor(255 * this.b) + ")"
    },
    clone: function() {
        return (new THREE.Color).setRGB(this.r, this.g, this.b)
    }
};
THREE.Vector2 = function(a, b) {
    this.x = a || 0;
    this.y = b || 0
};
THREE.Vector2.prototype = {
    constructor: THREE.Vector2,
    set: function(a, b) {
        this.x = a;
        this.y = b;
        return this
    },
    copy: function(a) {
        this.x = a.x;
        this.y = a.y;
        return this
    },
    clone: function() {
        return new THREE.Vector2(this.x, this.y)
    },
    add: function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this
    },
    addSelf: function(a) {
        this.x += a.x;
        this.y += a.y;
        return this
    },
    sub: function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this
    },
    subSelf: function(a) {
        this.x -= a.x;
        this.y -= a.y;
        return this
    },
    multiplyScalar: function(a) {
        this.x *= a;
        this.y *= a;
        return this
    },
    divideScalar: function(a) {
        a ? (this.x /= a, this.y /= a) : this.set(0, 0);
        return this
    },
    negate: function() {
        return this.multiplyScalar(-1)
    },
    dot: function(a) {
        return this.x * a.x + this.y * a.y
    },
    lengthSq: function() {
        return this.x * this.x + this.y * this.y
    },
    length: function() {
        return Math.sqrt(this.lengthSq())
    },
    normalize: function() {
        return this.divideScalar(this.length())
    },
    distanceTo: function(a) {
        return Math.sqrt(this.distanceToSquared(a))
    },
    distanceToSquared: function(a) {
        var b = this.x - a.x,
            a = this.y - a.y;
        return b * b + a * a
    },
    setLength: function(a) {
        return this.normalize().multiplyScalar(a)
    },
    lerpSelf: function(a, b) {
        this.x += (a.x - this.x) * b;
        this.y += (a.y - this.y) * b;
        return this
    },
    equals: function(a) {
        return a.x === this.x && a.y === this.y
    },
    isZero: function() {
        return 1.0E-4 > this.lengthSq()
    }
};
THREE.Vector3 = function(a, b, c) {
    this.x = a || 0;
    this.y = b || 0;
    this.z = c || 0
};
THREE.Vector3.prototype = {
    constructor: THREE.Vector3,
    set: function(a, b, c) {
        this.x = a;
        this.y = b;
        this.z = c;
        return this
    },
    setX: function(a) {
        this.x = a;
        return this
    },
    setY: function(a) {
        this.y = a;
        return this
    },
    setZ: function(a) {
        this.z = a;
        return this
    },
    copy: function(a) {
        this.x = a.x;
        this.y = a.y;
        this.z = a.z;
        return this
    },
    clone: function() {
        return new THREE.Vector3(this.x, this.y, this.z)
    },
    add: function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this
    },
    addSelf: function(a) {
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        return this
    },
    addScalar: function(a) {
        this.x += a;
        this.y += a;
        this.z += a;
        return this
    },
    sub: function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this
    },
    subSelf: function(a) {
        this.x -= a.x;
        this.y -= a.y;
        this.z -= a.z;
        return this
    },
    multiply: function(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        return this
    },
    multiplySelf: function(a) {
        this.x *= a.x;
        this.y *= a.y;
        this.z *= a.z;
        return this
    },
    multiplyScalar: function(a) {
        this.x *= a;
        this.y *= a;
        this.z *= a;
        return this
    },
    divideSelf: function(a) {
        this.x /= a.x;
        this.y /= a.y;
        this.z /= a.z;
        return this
    },
    divideScalar: function(a) {
        a ? (this.x /= a, this.y /= a, this.z /= a) : this.z = this.y = this.x = 0;
        return this
    },
    negate: function() {
        return this.multiplyScalar(-1)
    },
    dot: function(a) {
        return this.x * a.x + this.y * a.y + this.z * a.z
    },
    lengthSq: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    },
    length: function() {
        return Math.sqrt(this.lengthSq())
    },
    lengthManhattan: function() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z)
    },
    normalize: function() {
        return this.divideScalar(this.length())
    },
    setLength: function(a) {
        return this.normalize().multiplyScalar(a)
    },
    lerpSelf: function(a, b) {
        this.x += (a.x - this.x) * b;
        this.y += (a.y - this.y) * b;
        this.z += (a.z - this.z) * b;
        return this
    },
    cross: function(a, b) {
        this.x = a.y * b.z - a.z * b.y;
        this.y = a.z * b.x - a.x * b.z;
        this.z = a.x * b.y - a.y * b.x;
        return this
    },
    crossSelf: function(a) {
        var b = this.x,
            c = this.y,
            d = this.z;
        this.x = c * a.z - d * a.y;
        this.y = d * a.x - b * a.z;
        this.z = b * a.y - c * a.x;
        return this
    },
    distanceTo: function(a) {
        return Math.sqrt(this.distanceToSquared(a))
    },
    distanceToSquared: function(a) {
        return (new THREE.Vector3).sub(this, a).lengthSq()
    },
    getPositionFromMatrix: function(a) {
        this.x =
            a.n14;
        this.y = a.n24;
        this.z = a.n34;
        return this
    },
    getRotationFromMatrix: function(a, b) {
        var c = b ? b.x : 1,
            d = b ? b.y : 1,
            f = b ? b.z : 1,
            g = a.n11 / c,
            e = a.n12 / d,
            c = a.n21 / c,
            d = a.n22 / d,
            h = a.n23 / f,
            i = a.n33 / f;
        this.y = Math.asin(a.n13 / f);
        f = Math.cos(this.y);
        1.0E-5 < Math.abs(f) ? (this.x = Math.atan2(-h / f, i / f), this.z = Math.atan2(-e / f, g / f)) : (this.x = 0, this.z = Math.atan2(c, d));
        return this
    },
    getScaleFromMatrix: function(a) {
        var b = this.set(a.n11, a.n21, a.n31).length(),
            c = this.set(a.n12, a.n22, a.n32).length(),
            a = this.set(a.n13, a.n23, a.n33).length();
        this.x =
            b;
        this.y = c;
        this.z = a
    },
    equals: function(a) {
        return a.x === this.x && a.y === this.y && a.z === this.z
    },
    isZero: function() {
        return 1.0E-4 > this.lengthSq()
    }
};
THREE.Vector4 = function(a, b, c, d) {
    this.x = a || 0;
    this.y = b || 0;
    this.z = c || 0;
    this.w = void 0 !== d ? d : 1
};
THREE.Vector4.prototype = {
    constructor: THREE.Vector4,
    set: function(a, b, c, d) {
        this.x = a;
        this.y = b;
        this.z = c;
        this.w = d;
        return this
    },
    copy: function(a) {
        this.x = a.x;
        this.y = a.y;
        this.z = a.z;
        this.w = void 0 !== a.w ? a.w : 1;
        return this
    },
    clone: function() {
        return new THREE.Vector4(this.x, this.y, this.z, this.w)
    },
    add: function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        this.w = a.w + b.w;
        return this
    },
    addSelf: function(a) {
        this.x += a.x;
        this.y += a.y;
        this.z += a.z;
        this.w += a.w;
        return this
    },
    sub: function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        this.w = a.w - b.w;
        return this
    },
    subSelf: function(a) {
        this.x -= a.x;
        this.y -= a.y;
        this.z -= a.z;
        this.w -= a.w;
        return this
    },
    multiplyScalar: function(a) {
        this.x *= a;
        this.y *= a;
        this.z *= a;
        this.w *= a;
        return this
    },
    divideScalar: function(a) {
        a ? (this.x /= a, this.y /= a, this.z /= a, this.w /= a) : (this.z = this.y = this.x = 0, this.w = 1);
        return this
    },
    negate: function() {
        return this.multiplyScalar(-1)
    },
    dot: function(a) {
        return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w
    },
    lengthSq: function() {
        return this.dot(this)
    },
    length: function() {
        return Math.sqrt(this.lengthSq())
    },
    normalize: function() {
        return this.divideScalar(this.length())
    },
    setLength: function(a) {
        return this.normalize().multiplyScalar(a)
    },
    lerpSelf: function(a, b) {
        this.x += (a.x - this.x) * b;
        this.y += (a.y - this.y) * b;
        this.z += (a.z - this.z) * b;
        this.w += (a.w - this.w) * b;
        return this
    }
};
THREE.Frustum = function() {
    this.planes = [new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4, new THREE.Vector4]
};
THREE.Frustum.prototype.setFromMatrix = function(a) {
    var b, c = this.planes;
    c[0].set(a.n41 - a.n11, a.n42 - a.n12, a.n43 - a.n13, a.n44 - a.n14);
    c[1].set(a.n41 + a.n11, a.n42 + a.n12, a.n43 + a.n13, a.n44 + a.n14);
    c[2].set(a.n41 + a.n21, a.n42 + a.n22, a.n43 + a.n23, a.n44 + a.n24);
    c[3].set(a.n41 - a.n21, a.n42 - a.n22, a.n43 - a.n23, a.n44 - a.n24);
    c[4].set(a.n41 - a.n31, a.n42 - a.n32, a.n43 - a.n33, a.n44 - a.n34);
    c[5].set(a.n41 + a.n31, a.n42 + a.n32, a.n43 + a.n33, a.n44 + a.n34);
    for (a = 0; 6 > a; a++) b = c[a], b.divideScalar(Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z))
};
THREE.Frustum.prototype.contains = function(a) {
    for (var b = this.planes, c = a.matrixWorld, d = THREE.Frustum.__v1.set(c.getColumnX().length(), c.getColumnY().length(), c.getColumnZ().length()), d = -a.geometry.boundingSphere.radius * Math.max(d.x, Math.max(d.y, d.z)), f = 0; 6 > f; f++)
        if (a = b[f].x * c.n14 + b[f].y * c.n24 + b[f].z * c.n34 + b[f].w, a <= d) return !1;
    return !0
};
THREE.Frustum.__v1 = new THREE.Vector3;
THREE.Ray = function(a, b) {
    function c(a, b, c) {
        p.sub(c, a);
        s = p.dot(b);
        t = n.add(a, r.copy(b).multiplyScalar(s));
        return w = c.distanceTo(t)
    }

    function d(a, b, c, d) {
        p.sub(d, b);
        n.sub(c, b);
        r.sub(a, b);
        u = p.dot(p);
        v = p.dot(n);
        A = p.dot(r);
        F = n.dot(n);
        B = n.dot(r);
        D = 1 / (u * F - v * v);
        H = (F * A - v * B) * D;
        I = (u * B - v * A) * D;
        return 0 <= H && 0 <= I && 1 > H + I
    }
    this.origin = a || new THREE.Vector3;
    this.direction = b || new THREE.Vector3;
    this.intersectObjects = function(a) {
        var b, c, d = [];
        for (b = 0, c = a.length; b < c; b++) Array.prototype.push.apply(d, this.intersectObject(a[b]));
        d.sort(function(a, b) {
            return a.distance - b.distance
        });
        return d
    };
    var f = 1.0E-4;
    this.setPrecision = function(a) {
        f = a
    };
    var g = new THREE.Vector3,
        e = new THREE.Vector3,
        h = new THREE.Vector3,
        i = new THREE.Vector3,
        j = new THREE.Vector3,
        k = new THREE.Vector3,
        q = new THREE.Vector3,
        m = new THREE.Vector3,
        o = new THREE.Vector3;
    this.intersectObject = function(a) {
        var b, n = [];
        if (a instanceof THREE.Particle) {
            var p = c(this.origin, this.direction, a.matrixWorld.getPosition());
            if (p > a.scale.x) return [];
            b = {
                distance: p,
                point: a.position,
                face: null,
                object: a
            };
            n.push(b)
        } else if (a instanceof THREE.Mesh) {
            var p = c(this.origin, this.direction, a.matrixWorld.getPosition()),
                r = THREE.Frustum.__v1.set(a.matrixWorld.getColumnX().length(), a.matrixWorld.getColumnY().length(), a.matrixWorld.getColumnZ().length());
            if (p > a.geometry.boundingSphere.radius * Math.max(r.x, Math.max(r.y, r.z))) return n;
            var s, l, t = a.geometry,
                u = t.vertices,
                E;
            a.matrixRotationWorld.extractRotation(a.matrixWorld);
            for (p = 0, r = t.faces.length; p < r; p++)
                if (b = t.faces[p], j.copy(this.origin), k.copy(this.direction),
                    E = a.matrixWorld, q = E.multiplyVector3(q.copy(b.centroid)).subSelf(j), m = a.matrixRotationWorld.multiplyVector3(m.copy(b.normal)), s = k.dot(m), !(Math.abs(s) < f) && (l = m.dot(q) / s, !(0 > l) && (a.doubleSided || (a.flipSided ? 0 < s : 0 > s))))
                    if (o.add(j, k.multiplyScalar(l)), b instanceof THREE.Face3) g = E.multiplyVector3(g.copy(u[b.a].position)), e = E.multiplyVector3(e.copy(u[b.b].position)), h = E.multiplyVector3(h.copy(u[b.c].position)), d(o, g, e, h) && (b = {
                        distance: j.distanceTo(o),
                        point: o.clone(),
                        face: b,
                        object: a
                    }, n.push(b));
                    else if (b instanceof THREE.Face4 && (g = E.multiplyVector3(g.copy(u[b.a].position)), e = E.multiplyVector3(e.copy(u[b.b].position)), h = E.multiplyVector3(h.copy(u[b.c].position)), i = E.multiplyVector3(i.copy(u[b.d].position)), d(o, g, e, i) || d(o, e, h, i))) b = {
                distance: j.distanceTo(o),
                point: o.clone(),
                face: b,
                object: a
            }, n.push(b)
        }
        return n
    };
    var p = new THREE.Vector3,
        n = new THREE.Vector3,
        r = new THREE.Vector3,
        s, t, w, u, v, A, F, B, D, H, I
};
THREE.Rectangle = function() {
    function a() {
        g = d - b;
        e = f - c
    }
    var b, c, d, f, g, e, h = !0;
    this.getX = function() {
        return b
    };
    this.getY = function() {
        return c
    };
    this.getWidth = function() {
        return g
    };
    this.getHeight = function() {
        return e
    };
    this.getLeft = function() {
        return b
    };
    this.getTop = function() {
        return c
    };
    this.getRight = function() {
        return d
    };
    this.getBottom = function() {
        return f
    };
    this.set = function(g, e, k, q) {
        h = !1;
        b = g;
        c = e;
        d = k;
        f = q;
        a()
    };
    this.addPoint = function(g, e) {
        h ? (h = !1, b = g, c = e, d = g, f = e) : (b = b < g ? b : g, c = c < e ? c : e, d = d > g ? d : g, f = f > e ? f : e);
        a()
    };
    this.add3Points =
        function(g, e, k, q, m, o) {
            h ? (h = !1, b = g < k ? g < m ? g : m : k < m ? k : m, c = e < q ? e < o ? e : o : q < o ? q : o, d = g > k ? g > m ? g : m : k > m ? k : m, f = e > q ? e > o ? e : o : q > o ? q : o) : (b = g < k ? g < m ? g < b ? g : b : m < b ? m : b : k < m ? k < b ? k : b : m < b ? m : b, c = e < q ? e < o ? e < c ? e : c : o < c ? o : c : q < o ? q < c ? q : c : o < c ? o : c, d = g > k ? g > m ? g > d ? g : d : m > d ? m : d : k > m ? k > d ? k : d : m > d ? m : d, f = e > q ? e > o ? e > f ? e : f : o > f ? o : f : q > o ? q > f ? q : f : o > f ? o : f);
            a()
    };
    this.addRectangle = function(g) {
        h ? (h = !1, b = g.getLeft(), c = g.getTop(), d = g.getRight(), f = g.getBottom()) : (b = b < g.getLeft() ? b : g.getLeft(), c = c < g.getTop() ? c : g.getTop(), d = d > g.getRight() ? d : g.getRight(), f = f >
            g.getBottom() ? f : g.getBottom());
        a()
    };
    this.inflate = function(g) {
        b -= g;
        c -= g;
        d += g;
        f += g;
        a()
    };
    this.minSelf = function(g) {
        b = b > g.getLeft() ? b : g.getLeft();
        c = c > g.getTop() ? c : g.getTop();
        d = d < g.getRight() ? d : g.getRight();
        f = f < g.getBottom() ? f : g.getBottom();
        a()
    };
    this.intersects = function(a) {
        return d < a.getLeft() || b > a.getRight() || f < a.getTop() || c > a.getBottom() ? !1 : !0
    };
    this.empty = function() {
        h = !0;
        f = d = c = b = 0;
        a()
    };
    this.isEmpty = function() {
        return h
    }
};
THREE.Math = {
    clamp: function(a, b, c) {
        return a < b ? b : a > c ? c : a
    },
    clampBottom: function(a, b) {
        return a < b ? b : a
    },
    mapLinear: function(a, b, c, d, f) {
        return d + (a - b) * (f - d) / (c - b)
    },
    random16: function() {
        return (65280 * Math.random() + 255 * Math.random()) / 65535
    },
    randInt: function(a, b) {
        return a + Math.floor(Math.random() * (b - a + 1))
    },
    randFloat: function(a, b) {
        return a + Math.random() * (b - a)
    },
    randFloatSpread: function(a) {
        return a * (0.5 - Math.random())
    },
    sign: function(a) {
        return 0 > a ? -1 : 0 < a ? 1 : 0
    }
};
THREE.Matrix3 = function() {
    this.m = []
};
THREE.Matrix3.prototype = {
    constructor: THREE.Matrix3,
    transposeIntoArray: function(a) {
        var b = this.m;
        a[0] = b[0];
        a[1] = b[3];
        a[2] = b[6];
        a[3] = b[1];
        a[4] = b[4];
        a[5] = b[7];
        a[6] = b[2];
        a[7] = b[5];
        a[8] = b[8];
        return this
    }
};
THREE.Matrix4 = function(a, b, c, d, f, g, e, h, i, j, k, q, m, o, p, n) {
    this.set(void 0 !== a ? a : 1, b || 0, c || 0, d || 0, f || 0, void 0 !== g ? g : 1, e || 0, h || 0, i || 0, j || 0, void 0 !== k ? k : 1, q || 0, m || 0, o || 0, p || 0, void 0 !== n ? n : 1);
    this.m33 = new THREE.Matrix3
};
THREE.Matrix4.prototype = {
    constructor: THREE.Matrix4,
    set: function(a, b, c, d, f, g, e, h, i, j, k, q, m, o, p, n) {
        this.n11 = a;
        this.n12 = b;
        this.n13 = c;
        this.n14 = d;
        this.n21 = f;
        this.n22 = g;
        this.n23 = e;
        this.n24 = h;
        this.n31 = i;
        this.n32 = j;
        this.n33 = k;
        this.n34 = q;
        this.n41 = m;
        this.n42 = o;
        this.n43 = p;
        this.n44 = n;
        return this
    },
    identity: function() {
        this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this
    },
    copy: function(a) {
        this.set(a.n11, a.n12, a.n13, a.n14, a.n21, a.n22, a.n23, a.n24, a.n31, a.n32, a.n33, a.n34, a.n41, a.n42, a.n43, a.n44);
        return this
    },
    lookAt: function(a,
        b, c) {
        var d = THREE.Matrix4.__v1,
            f = THREE.Matrix4.__v2,
            g = THREE.Matrix4.__v3;
        g.sub(a, b).normalize();
        if (0 === g.length()) g.z = 1;
        d.cross(c, g).normalize();
        0 === d.length() && (g.x += 1.0E-4, d.cross(c, g).normalize());
        f.cross(g, d);
        this.n11 = d.x;
        this.n12 = f.x;
        this.n13 = g.x;
        this.n21 = d.y;
        this.n22 = f.y;
        this.n23 = g.y;
        this.n31 = d.z;
        this.n32 = f.z;
        this.n33 = g.z;
        return this
    },
    multiply: function(a, b) {
        var c = a.n11,
            d = a.n12,
            f = a.n13,
            g = a.n14,
            e = a.n21,
            h = a.n22,
            i = a.n23,
            j = a.n24,
            k = a.n31,
            q = a.n32,
            m = a.n33,
            o = a.n34,
            p = a.n41,
            n = a.n42,
            r = a.n43,
            s = a.n44,
            t = b.n11,
            w = b.n12,
            u = b.n13,
            v = b.n14,
            A = b.n21,
            F = b.n22,
            B = b.n23,
            D = b.n24,
            H = b.n31,
            I = b.n32,
            Q = b.n33,
            P = b.n34,
            L = b.n41,
            K = b.n42,
            O = b.n43,
            y = b.n44;
        this.n11 = c * t + d * A + f * H + g * L;
        this.n12 = c * w + d * F + f * I + g * K;
        this.n13 = c * u + d * B + f * Q + g * O;
        this.n14 = c * v + d * D + f * P + g * y;
        this.n21 = e * t + h * A + i * H + j * L;
        this.n22 = e * w + h * F + i * I + j * K;
        this.n23 = e * u + h * B + i * Q + j * O;
        this.n24 = e * v + h * D + i * P + j * y;
        this.n31 = k * t + q * A + m * H + o * L;
        this.n32 = k * w + q * F + m * I + o * K;
        this.n33 = k * u + q * B + m * Q + o * O;
        this.n34 = k * v + q * D + m * P + o * y;
        this.n41 = p * t + n * A + r * H + s * L;
        this.n42 = p * w + n * F + r * I + s * K;
        this.n43 = p * u + n * B + r * Q + s * O;
        this.n44 =
            p * v + n * D + r * P + s * y;
        return this
    },
    multiplySelf: function(a) {
        return this.multiply(this, a)
    },
    multiplyToArray: function(a, b, c) {
        this.multiply(a, b);
        c[0] = this.n11;
        c[1] = this.n21;
        c[2] = this.n31;
        c[3] = this.n41;
        c[4] = this.n12;
        c[5] = this.n22;
        c[6] = this.n32;
        c[7] = this.n42;
        c[8] = this.n13;
        c[9] = this.n23;
        c[10] = this.n33;
        c[11] = this.n43;
        c[12] = this.n14;
        c[13] = this.n24;
        c[14] = this.n34;
        c[15] = this.n44;
        return this
    },
    multiplyScalar: function(a) {
        this.n11 *= a;
        this.n12 *= a;
        this.n13 *= a;
        this.n14 *= a;
        this.n21 *= a;
        this.n22 *= a;
        this.n23 *= a;
        this.n24 *= a;
        this.n31 *= a;
        this.n32 *= a;
        this.n33 *= a;
        this.n34 *= a;
        this.n41 *= a;
        this.n42 *= a;
        this.n43 *= a;
        this.n44 *= a;
        return this
    },
    multiplyVector3: function(a) {
        var b = a.x,
            c = a.y,
            d = a.z,
            f = 1 / (this.n41 * b + this.n42 * c + this.n43 * d + this.n44);
        a.x = (this.n11 * b + this.n12 * c + this.n13 * d + this.n14) * f;
        a.y = (this.n21 * b + this.n22 * c + this.n23 * d + this.n24) * f;
        a.z = (this.n31 * b + this.n32 * c + this.n33 * d + this.n34) * f;
        return a
    },
    multiplyVector4: function(a) {
        var b = a.x,
            c = a.y,
            d = a.z,
            f = a.w;
        a.x = this.n11 * b + this.n12 * c + this.n13 * d + this.n14 * f;
        a.y = this.n21 * b + this.n22 * c + this.n23 *
            d + this.n24 * f;
        a.z = this.n31 * b + this.n32 * c + this.n33 * d + this.n34 * f;
        a.w = this.n41 * b + this.n42 * c + this.n43 * d + this.n44 * f;
        return a
    },
    rotateAxis: function(a) {
        var b = a.x,
            c = a.y,
            d = a.z;
        a.x = b * this.n11 + c * this.n12 + d * this.n13;
        a.y = b * this.n21 + c * this.n22 + d * this.n23;
        a.z = b * this.n31 + c * this.n32 + d * this.n33;
        a.normalize();
        return a
    },
    crossVector: function(a) {
        var b = new THREE.Vector4;
        b.x = this.n11 * a.x + this.n12 * a.y + this.n13 * a.z + this.n14 * a.w;
        b.y = this.n21 * a.x + this.n22 * a.y + this.n23 * a.z + this.n24 * a.w;
        b.z = this.n31 * a.x + this.n32 * a.y + this.n33 * a.z +
            this.n34 * a.w;
        b.w = a.w ? this.n41 * a.x + this.n42 * a.y + this.n43 * a.z + this.n44 * a.w : 1;
        return b
    },
    determinant: function() {
        var a = this.n11,
            b = this.n12,
            c = this.n13,
            d = this.n14,
            f = this.n21,
            g = this.n22,
            e = this.n23,
            h = this.n24,
            i = this.n31,
            j = this.n32,
            k = this.n33,
            q = this.n34,
            m = this.n41,
            o = this.n42,
            p = this.n43,
            n = this.n44;
        return d * e * j * m - c * h * j * m - d * g * k * m + b * h * k * m + c * g * q * m - b * e * q * m - d * e * i * o + c * h * i * o + d * f * k * o - a * h * k * o - c * f * q * o + a * e * q * o + d * g * i * p - b * h * i * p - d * f * j * p + a * h * j * p + b * f * q * p - a * g * q * p - c * g * i * n + b * e * i * n + c * f * j * n - a * e * j * n - b * f * k * n + a * g * k * n
    },
    transpose: function() {
        var a;
        a = this.n21;
        this.n21 = this.n12;
        this.n12 = a;
        a = this.n31;
        this.n31 = this.n13;
        this.n13 = a;
        a = this.n32;
        this.n32 = this.n23;
        this.n23 = a;
        a = this.n41;
        this.n41 = this.n14;
        this.n14 = a;
        a = this.n42;
        this.n42 = this.n24;
        this.n24 = a;
        a = this.n43;
        this.n43 = this.n34;
        this.n34 = a;
        return this
    },
    clone: function() {
        var a = new THREE.Matrix4;
        a.n11 = this.n11;
        a.n12 = this.n12;
        a.n13 = this.n13;
        a.n14 = this.n14;
        a.n21 = this.n21;
        a.n22 = this.n22;
        a.n23 = this.n23;
        a.n24 = this.n24;
        a.n31 = this.n31;
        a.n32 = this.n32;
        a.n33 = this.n33;
        a.n34 = this.n34;
        a.n41 = this.n41;
        a.n42 = this.n42;
        a.n43 = this.n43;
        a.n44 = this.n44;
        return a
    },
    flattenToArray: function(a) {
        a[0] = this.n11;
        a[1] = this.n21;
        a[2] = this.n31;
        a[3] = this.n41;
        a[4] = this.n12;
        a[5] = this.n22;
        a[6] = this.n32;
        a[7] = this.n42;
        a[8] = this.n13;
        a[9] = this.n23;
        a[10] = this.n33;
        a[11] = this.n43;
        a[12] = this.n14;
        a[13] = this.n24;
        a[14] = this.n34;
        a[15] = this.n44;
        return a
    },
    flattenToArrayOffset: function(a, b) {
        a[b] = this.n11;
        a[b + 1] = this.n21;
        a[b + 2] = this.n31;
        a[b + 3] = this.n41;
        a[b + 4] = this.n12;
        a[b + 5] = this.n22;
        a[b + 6] = this.n32;
        a[b + 7] = this.n42;
        a[b + 8] = this.n13;
        a[b + 9] = this.n23;
        a[b +
            10] = this.n33;
        a[b + 11] = this.n43;
        a[b + 12] = this.n14;
        a[b + 13] = this.n24;
        a[b + 14] = this.n34;
        a[b + 15] = this.n44;
        return a
    },
    setTranslation: function(a, b, c) {
        this.set(1, 0, 0, a, 0, 1, 0, b, 0, 0, 1, c, 0, 0, 0, 1);
        return this
    },
    setScale: function(a, b, c) {
        this.set(a, 0, 0, 0, 0, b, 0, 0, 0, 0, c, 0, 0, 0, 0, 1);
        return this
    },
    setRotationX: function(a) {
        var b = Math.cos(a),
            a = Math.sin(a);
        this.set(1, 0, 0, 0, 0, b, -a, 0, 0, a, b, 0, 0, 0, 0, 1);
        return this
    },
    setRotationY: function(a) {
        var b = Math.cos(a),
            a = Math.sin(a);
        this.set(b, 0, a, 0, 0, 1, 0, 0, -a, 0, b, 0, 0, 0, 0, 1);
        return this
    },
    setRotationZ: function(a) {
        var b =
            Math.cos(a),
            a = Math.sin(a);
        this.set(b, -a, 0, 0, a, b, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        return this
    },
    setRotationAxis: function(a, b) {
        var c = Math.cos(b),
            d = Math.sin(b),
            f = 1 - c,
            g = a.x,
            e = a.y,
            h = a.z,
            i = f * g,
            j = f * e;
        this.set(i * g + c, i * e - d * h, i * h + d * e, 0, i * e + d * h, j * e + c, j * h - d * g, 0, i * h - d * e, j * h + d * g, f * h * h + c, 0, 0, 0, 0, 1);
        return this
    },
    setPosition: function(a) {
        this.n14 = a.x;
        this.n24 = a.y;
        this.n34 = a.z;
        return this
    },
    getPosition: function() {
        return THREE.Matrix4.__v1.set(this.n14, this.n24, this.n34)
    },
    getColumnX: function() {
        return THREE.Matrix4.__v1.set(this.n11,
            this.n21, this.n31)
    },
    getColumnY: function() {
        return THREE.Matrix4.__v1.set(this.n12, this.n22, this.n32)
    },
    getColumnZ: function() {
        return THREE.Matrix4.__v1.set(this.n13, this.n23, this.n33)
    },
    getInverse: function(a) {
        var b = a.n11,
            c = a.n12,
            d = a.n13,
            f = a.n14,
            g = a.n21,
            e = a.n22,
            h = a.n23,
            i = a.n24,
            j = a.n31,
            k = a.n32,
            q = a.n33,
            m = a.n34,
            o = a.n41,
            p = a.n42,
            n = a.n43,
            r = a.n44;
        this.n11 = h * m * p - i * q * p + i * k * n - e * m * n - h * k * r + e * q * r;
        this.n12 = f * q * p - d * m * p - f * k * n + c * m * n + d * k * r - c * q * r;
        this.n13 = d * i * p - f * h * p + f * e * n - c * i * n - d * e * r + c * h * r;
        this.n14 = f * h * k - d * i * k - f * e * q + c *
            i * q + d * e * m - c * h * m;
        this.n21 = i * q * o - h * m * o - i * j * n + g * m * n + h * j * r - g * q * r;
        this.n22 = d * m * o - f * q * o + f * j * n - b * m * n - d * j * r + b * q * r;
        this.n23 = f * h * o - d * i * o - f * g * n + b * i * n + d * g * r - b * h * r;
        this.n24 = d * i * j - f * h * j + f * g * q - b * i * q - d * g * m + b * h * m;
        this.n31 = e * m * o - i * k * o + i * j * p - g * m * p - e * j * r + g * k * r;
        this.n32 = f * k * o - c * m * o - f * j * p + b * m * p + c * j * r - b * k * r;
        this.n33 = c * i * o - f * e * o + f * g * p - b * i * p - c * g * r + b * e * r;
        this.n34 = f * e * j - c * i * j - f * g * k + b * i * k + c * g * m - b * e * m;
        this.n41 = h * k * o - e * q * o - h * j * p + g * q * p + e * j * n - g * k * n;
        this.n42 = c * q * o - d * k * o + d * j * p - b * q * p - c * j * n + b * k * n;
        this.n43 = d * e * o - c * h * o - d * g * p + b * h * p + c *
            g * n - b * e * n;
        this.n44 = c * h * j - d * e * j + d * g * k - b * h * k - c * g * q + b * e * q;
        this.multiplyScalar(1 / a.determinant());
        return this
    },
    setRotationFromEuler: function(a, b) {
        var c = a.x,
            d = a.y,
            f = a.z,
            g = Math.cos(c),
            c = Math.sin(c),
            e = Math.cos(d),
            d = Math.sin(d),
            h = Math.cos(f),
            f = Math.sin(f);
        switch (b) {
            case "YXZ":
                var i = e * h,
                    j = e * f,
                    k = d * h,
                    q = d * f;
                this.n11 = i + q * c;
                this.n12 = k * c - j;
                this.n13 = g * d;
                this.n21 = g * f;
                this.n22 = g * h;
                this.n23 = -c;
                this.n31 = j * c - k;
                this.n32 = q + i * c;
                this.n33 = g * e;
                break;
            case "ZXY":
                i = e * h;
                j = e * f;
                k = d * h;
                q = d * f;
                this.n11 = i - q * c;
                this.n12 = -g * f;
                this.n13 = k +
                    j * c;
                this.n21 = j + k * c;
                this.n22 = g * h;
                this.n23 = q - i * c;
                this.n31 = -g * d;
                this.n32 = c;
                this.n33 = g * e;
                break;
            case "ZYX":
                i = g * h;
                j = g * f;
                k = c * h;
                q = c * f;
                this.n11 = e * h;
                this.n12 = k * d - j;
                this.n13 = i * d + q;
                this.n21 = e * f;
                this.n22 = q * d + i;
                this.n23 = j * d - k;
                this.n31 = -d;
                this.n32 = c * e;
                this.n33 = g * e;
                break;
            case "YZX":
                i = g * e;
                j = g * d;
                k = c * e;
                q = c * d;
                this.n11 = e * h;
                this.n12 = q - i * f;
                this.n13 = k * f + j;
                this.n21 = f;
                this.n22 = g * h;
                this.n23 = -c * h;
                this.n31 = -d * h;
                this.n32 = j * f + k;
                this.n33 = i - q * f;
                break;
            case "XZY":
                i = g * e;
                j = g * d;
                k = c * e;
                q = c * d;
                this.n11 = e * h;
                this.n12 = -f;
                this.n13 = d * h;
                this.n21 =
                    i * f + q;
                this.n22 = g * h;
                this.n23 = j * f - k;
                this.n31 = k * f - j;
                this.n32 = c * h;
                this.n33 = q * f + i;
                break;
            default:
                i = g * h, j = g * f, k = c * h, q = c * f, this.n11 = e * h, this.n12 = -e * f, this.n13 = d, this.n21 = j + k * d, this.n22 = i - q * d, this.n23 = -c * e, this.n31 = q - i * d, this.n32 = k + j * d, this.n33 = g * e
        }
        return this
    },
    setRotationFromQuaternion: function(a) {
        var b = a.x,
            c = a.y,
            d = a.z,
            f = a.w,
            g = b + b,
            e = c + c,
            h = d + d,
            a = b * g,
            i = b * e,
            b = b * h,
            j = c * e,
            c = c * h,
            d = d * h,
            g = f * g,
            e = f * e,
            f = f * h;
        this.n11 = 1 - (j + d);
        this.n12 = i - f;
        this.n13 = b + e;
        this.n21 = i + f;
        this.n22 = 1 - (a + d);
        this.n23 = c - g;
        this.n31 = b - e;
        this.n32 = c +
            g;
        this.n33 = 1 - (a + j);
        return this
    },
    scale: function(a) {
        var b = a.x,
            c = a.y,
            a = a.z;
        this.n11 *= b;
        this.n12 *= c;
        this.n13 *= a;
        this.n21 *= b;
        this.n22 *= c;
        this.n23 *= a;
        this.n31 *= b;
        this.n32 *= c;
        this.n33 *= a;
        this.n41 *= b;
        this.n42 *= c;
        this.n43 *= a;
        return this
    },
    compose: function(a, b, c) {
        var d = THREE.Matrix4.__m1,
            f = THREE.Matrix4.__m2;
        d.identity();
        d.setRotationFromQuaternion(b);
        f.setScale(c.x, c.y, c.z);
        this.multiply(d, f);
        this.n14 = a.x;
        this.n24 = a.y;
        this.n34 = a.z;
        return this
    },
    decompose: function(a, b, c) {
        var d = THREE.Matrix4.__v1,
            f = THREE.Matrix4.__v2,
            g = THREE.Matrix4.__v3;
        d.set(this.n11, this.n21, this.n31);
        f.set(this.n12, this.n22, this.n32);
        g.set(this.n13, this.n23, this.n33);
        a = a instanceof THREE.Vector3 ? a : new THREE.Vector3;
        b = b instanceof THREE.Quaternion ? b : new THREE.Quaternion;
        c = c instanceof THREE.Vector3 ? c : new THREE.Vector3;
        c.x = d.length();
        c.y = f.length();
        c.z = g.length();
        a.x = this.n14;
        a.y = this.n24;
        a.z = this.n34;
        d = THREE.Matrix4.__m1;
        d.copy(this);
        d.n11 /= c.x;
        d.n21 /= c.x;
        d.n31 /= c.x;
        d.n12 /= c.y;
        d.n22 /= c.y;
        d.n32 /= c.y;
        d.n13 /= c.z;
        d.n23 /= c.z;
        d.n33 /= c.z;
        b.setFromRotationMatrix(d);
        return [a, b, c]
    },
    extractPosition: function(a) {
        this.n14 = a.n14;
        this.n24 = a.n24;
        this.n34 = a.n34;
        return this
    },
    extractRotation: function(a) {
        var b = THREE.Matrix4.__v1,
            c = 1 / b.set(a.n11, a.n21, a.n31).length(),
            d = 1 / b.set(a.n12, a.n22, a.n32).length(),
            b = 1 / b.set(a.n13, a.n23, a.n33).length();
        this.n11 = a.n11 * c;
        this.n21 = a.n21 * c;
        this.n31 = a.n31 * c;
        this.n12 = a.n12 * d;
        this.n22 = a.n22 * d;
        this.n32 = a.n32 * d;
        this.n13 = a.n13 * b;
        this.n23 = a.n23 * b;
        this.n33 = a.n33 * b;
        return this
    },
    rotateByAxis: function(a, b) {
        if (1 === a.x && 0 === a.y && 0 === a.z) return this.rotateX(b);
        if (0 === a.x && 1 === a.y && 0 === a.z) return this.rotateY(b);
        if (0 === a.x && 0 === a.y && 1 === a.z) return this.rotateZ(b);
        var c = a.x,
            d = a.y,
            f = a.z,
            g = Math.sqrt(c * c + d * d + f * f),
            c = c / g,
            d = d / g,
            f = f / g,
            g = c * c,
            e = d * d,
            h = f * f,
            i = Math.cos(b),
            j = Math.sin(b),
            k = 1 - i,
            q = c * d * k,
            m = c * f * k,
            k = d * f * k,
            c = c * j,
            o = d * j,
            j = f * j,
            f = g + (1 - g) * i,
            g = q + j,
            d = m - o,
            q = q - j,
            e = e + (1 - e) * i,
            j = k + c,
            m = m + o,
            k = k - c,
            h = h + (1 - h) * i,
            i = this.n11,
            c = this.n21,
            o = this.n31,
            p = this.n41,
            n = this.n12,
            r = this.n22,
            s = this.n32,
            t = this.n42,
            w = this.n13,
            u = this.n23,
            v = this.n33,
            A = this.n43;
        this.n11 = f * i + g * n + d * w;
        this.n21 = f * c +
            g * r + d * u;
        this.n31 = f * o + g * s + d * v;
        this.n41 = f * p + g * t + d * A;
        this.n12 = q * i + e * n + j * w;
        this.n22 = q * c + e * r + j * u;
        this.n32 = q * o + e * s + j * v;
        this.n42 = q * p + e * t + j * A;
        this.n13 = m * i + k * n + h * w;
        this.n23 = m * c + k * r + h * u;
        this.n33 = m * o + k * s + h * v;
        this.n43 = m * p + k * t + h * A;
        return this
    },
    rotateX: function(a) {
        var b = this.n12,
            c = this.n22,
            d = this.n32,
            f = this.n42,
            g = this.n13,
            e = this.n23,
            h = this.n33,
            i = this.n43,
            j = Math.cos(a),
            a = Math.sin(a);
        this.n12 = j * b + a * g;
        this.n22 = j * c + a * e;
        this.n32 = j * d + a * h;
        this.n42 = j * f + a * i;
        this.n13 = j * g - a * b;
        this.n23 = j * e - a * c;
        this.n33 = j * h - a * d;
        this.n43 = j *
            i - a * f;
        return this
    },
    rotateY: function(a) {
        var b = this.n11,
            c = this.n21,
            d = this.n31,
            f = this.n41,
            g = this.n13,
            e = this.n23,
            h = this.n33,
            i = this.n43,
            j = Math.cos(a),
            a = Math.sin(a);
        this.n11 = j * b - a * g;
        this.n21 = j * c - a * e;
        this.n31 = j * d - a * h;
        this.n41 = j * f - a * i;
        this.n13 = j * g + a * b;
        this.n23 = j * e + a * c;
        this.n33 = j * h + a * d;
        this.n43 = j * i + a * f;
        return this
    },
    rotateZ: function(a) {
        var b = this.n11,
            c = this.n21,
            d = this.n31,
            f = this.n41,
            g = this.n12,
            e = this.n22,
            h = this.n32,
            i = this.n42,
            j = Math.cos(a),
            a = Math.sin(a);
        this.n11 = j * b + a * g;
        this.n21 = j * c + a * e;
        this.n31 = j * d + a * h;
        this.n41 =
            j * f + a * i;
        this.n12 = j * g - a * b;
        this.n22 = j * e - a * c;
        this.n32 = j * h - a * d;
        this.n42 = j * i - a * f;
        return this
    },
    translate: function(a) {
        var b = a.x,
            c = a.y,
            a = a.z;
        this.n14 = this.n11 * b + this.n12 * c + this.n13 * a + this.n14;
        this.n24 = this.n21 * b + this.n22 * c + this.n23 * a + this.n24;
        this.n34 = this.n31 * b + this.n32 * c + this.n33 * a + this.n34;
        this.n44 = this.n41 * b + this.n42 * c + this.n43 * a + this.n44;
        return this
    }
};
THREE.Matrix4.makeInvert3x3 = function(a) {
    var b = a.m33,
        c = b.m,
        d = a.n33 * a.n22 - a.n32 * a.n23,
        f = -a.n33 * a.n21 + a.n31 * a.n23,
        g = a.n32 * a.n21 - a.n31 * a.n22,
        e = -a.n33 * a.n12 + a.n32 * a.n13,
        h = a.n33 * a.n11 - a.n31 * a.n13,
        i = -a.n32 * a.n11 + a.n31 * a.n12,
        j = a.n23 * a.n12 - a.n22 * a.n13,
        k = -a.n23 * a.n11 + a.n21 * a.n13,
        q = a.n22 * a.n11 - a.n21 * a.n12,
        a = a.n11 * d + a.n21 * e + a.n31 * j;
    if (0 === a) return null;
    a = 1 / a;
    c[0] = a * d;
    c[1] = a * f;
    c[2] = a * g;
    c[3] = a * e;
    c[4] = a * h;
    c[5] = a * i;
    c[6] = a * j;
    c[7] = a * k;
    c[8] = a * q;
    return b
};
THREE.Matrix4.makeFrustum = function(a, b, c, d, f, g) {
    var e;
    e = new THREE.Matrix4;
    e.n11 = 2 * f / (b - a);
    e.n12 = 0;
    e.n13 = (b + a) / (b - a);
    e.n14 = 0;
    e.n21 = 0;
    e.n22 = 2 * f / (d - c);
    e.n23 = (d + c) / (d - c);
    e.n24 = 0;
    e.n31 = 0;
    e.n32 = 0;
    e.n33 = -(g + f) / (g - f);
    e.n34 = -2 * g * f / (g - f);
    e.n41 = 0;
    e.n42 = 0;
    e.n43 = -1;
    e.n44 = 0;
    return e
};
THREE.Matrix4.makePerspective = function(a, b, c, d) {
    var f, a = c * Math.tan(a * Math.PI / 360);
    f = -a;
    return THREE.Matrix4.makeFrustum(f * b, a * b, f, a, c, d)
};
THREE.Matrix4.makeOrtho = function(a, b, c, d, f, g) {
    var e, h, i, j;
    e = new THREE.Matrix4;
    h = b - a;
    i = c - d;
    j = g - f;
    e.n11 = 2 / h;
    e.n12 = 0;
    e.n13 = 0;
    e.n14 = -((b + a) / h);
    e.n21 = 0;
    e.n22 = 2 / i;
    e.n23 = 0;
    e.n24 = -((c + d) / i);
    e.n31 = 0;
    e.n32 = 0;
    e.n33 = -2 / j;
    e.n34 = -((g + f) / j);
    e.n41 = 0;
    e.n42 = 0;
    e.n43 = 0;
    e.n44 = 1;
    return e
};
THREE.Matrix4.__v1 = new THREE.Vector3;
THREE.Matrix4.__v2 = new THREE.Vector3;
THREE.Matrix4.__v3 = new THREE.Vector3;
THREE.Matrix4.__m1 = new THREE.Matrix4;
THREE.Matrix4.__m2 = new THREE.Matrix4;
THREE.Object3D = function() {
    this.id = THREE.Object3DCount++;
    this.name = "";
    this.parent = void 0;
    this.children = [];
    this.up = new THREE.Vector3(0, 1, 0);
    this.position = new THREE.Vector3;
    this.rotation = new THREE.Vector3;
    this.eulerOrder = "XYZ";
    this.scale = new THREE.Vector3(1, 1, 1);
    this.flipSided = this.doubleSided = !1;
    this.renderDepth = null;
    this.rotationAutoUpdate = !0;
    this.matrix = new THREE.Matrix4;
    this.matrixWorld = new THREE.Matrix4;
    this.matrixRotationWorld = new THREE.Matrix4;
    this.matrixWorldNeedsUpdate = this.matrixAutoUpdate = !0;
    this.quaternion = new THREE.Quaternion;
    this.useQuaternion = !1;
    this.boundRadius = 0;
    this.boundRadiusScale = 1;
    this.visible = !0;
    this.receiveShadow = this.castShadow = !1;
    this.frustumCulled = !0;
    this._vector = new THREE.Vector3
};
THREE.Object3D.prototype = {
    constructor: THREE.Object3D,
    applyMatrix: function(a) {
        this.matrix.multiply(a, this.matrix);
        this.scale.getScaleFromMatrix(this.matrix);
        this.rotation.getRotationFromMatrix(this.matrix, this.scale);
        this.position.getPositionFromMatrix(this.matrix)
    },
    translate: function(a, b) {
        this.matrix.rotateAxis(b);
        this.position.addSelf(b.multiplyScalar(a))
    },
    translateX: function(a) {
        this.translate(a, this._vector.set(1, 0, 0))
    },
    translateY: function(a) {
        this.translate(a, this._vector.set(0, 1, 0))
    },
    translateZ: function(a) {
        this.translate(a,
            this._vector.set(0, 0, 1))
    },
    lookAt: function(a) {
        this.matrix.lookAt(a, this.position, this.up);
        this.rotationAutoUpdate && this.rotation.getRotationFromMatrix(this.matrix)
    },
    add: function(a) {
        if (a === this) console.warn("THREE.Object3D.add: An object can't be added as a child of itself.");
        else if (-1 === this.children.indexOf(a)) {
            void 0 !== a.parent && a.parent.remove(a);
            a.parent = this;
            this.children.push(a);
            for (var b = this; void 0 !== b.parent;) b = b.parent;
            void 0 !== b && b instanceof THREE.Scene && b.__addObject(a)
        }
    },
    remove: function(a) {
        var b =
            this.children.indexOf(a);
        if (-1 !== b) {
            a.parent = void 0;
            this.children.splice(b, 1);
            for (b = this; void 0 !== b.parent;) b = b.parent;
            void 0 !== b && b instanceof THREE.Scene && b.__removeObject(a)
        }
    },
    getChildByName: function(a, b) {
        var c, d, f;
        for (c = 0, d = this.children.length; c < d; c++) {
            f = this.children[c];
            if (f.name === a || b && (f = f.getChildByName(a, b), void 0 !== f)) return f
        }
    },
    updateMatrix: function() {
        this.matrix.setPosition(this.position);
        this.useQuaternion ? this.matrix.setRotationFromQuaternion(this.quaternion) : this.matrix.setRotationFromEuler(this.rotation,
            this.eulerOrder);
        if (1 !== this.scale.x || 1 !== this.scale.y || 1 !== this.scale.z) this.matrix.scale(this.scale), this.boundRadiusScale = Math.max(this.scale.x, Math.max(this.scale.y, this.scale.z));
        this.matrixWorldNeedsUpdate = !0
    },
    updateMatrixWorld: function(a) {
        this.matrixAutoUpdate && this.updateMatrix();
        if (this.matrixWorldNeedsUpdate || a) this.parent ? this.matrixWorld.multiply(this.parent.matrixWorld, this.matrix) : this.matrixWorld.copy(this.matrix), this.matrixWorldNeedsUpdate = !1, a = !0;
        for (var b = 0, c = this.children.length; b <
            c; b++) this.children[b].updateMatrixWorld(a)
    }
};
THREE.Object3DCount = 0;
THREE.Projector = function() {
    function a() {
        var a = e[g] = e[g] || new THREE.RenderableObject;
        g++;
        return a
    }

    function b() {
        var a = j[i] = j[i] || new THREE.RenderableVertex;
        i++;
        return a
    }

    function c(a, b) {
        return b.z - a.z
    }

    function d(a, b) {
        var c = 0,
            d = 1,
            f = a.z + a.w,
            g = b.z + b.w,
            e = -a.z + a.w,
            h = -b.z + b.w;
        if (0 <= f && 0 <= g && 0 <= e && 0 <= h) return !0;
        if (0 > f && 0 > g || 0 > e && 0 > h) return !1;
        0 > f ? c = Math.max(c, f / (f - g)) : 0 > g && (d = Math.min(d, f / (f - g)));
        0 > e ? c = Math.max(c, e / (e - h)) : 0 > h && (d = Math.min(d, e / (e - h)));
        if (d < c) return !1;
        a.lerpSelf(b, c);
        b.lerpSelf(a, 1 - d);
        return !0
    }
    var f, g, e = [],
        h, i, j = [],
        k, q, m = [],
        o, p = [],
        n, r, s = [],
        t, w, u = [],
        v = {
            objects: [],
            sprites: [],
            lights: [],
            elements: []
        }, A = new THREE.Vector3,
        F = new THREE.Vector4,
        B = new THREE.Matrix4,
        D = new THREE.Matrix4,
        H = new THREE.Frustum,
        I = new THREE.Vector4,
        Q = new THREE.Vector4;
    this.projectVector = function(a, b) {
        b.matrixWorldInverse.getInverse(b.matrixWorld);
        B.multiply(b.projectionMatrix, b.matrixWorldInverse);
        B.multiplyVector3(a);
        return a
    };
    this.unprojectVector = function(a, b) {
        b.projectionMatrixInverse.getInverse(b.projectionMatrix);
        B.multiply(b.matrixWorld,
            b.projectionMatrixInverse);
        B.multiplyVector3(a);
        return a
    };
    this.pickingRay = function(a, b) {
        var c;
        a.z = -1;
        c = new THREE.Vector3(a.x, a.y, 1);
        this.unprojectVector(a, b);
        this.unprojectVector(c, b);
        c.subSelf(a).normalize();
        return new THREE.Ray(a, c)
    };
    this.projectGraph = function(b, d) {
        g = 0;
        v.objects.length = 0;
        v.sprites.length = 0;
        v.lights.length = 0;
        var e = function(b) {
            if (!1 !== b.visible) {
                (b instanceof THREE.Mesh || b instanceof THREE.Line) && (!1 === b.frustumCulled || H.contains(b)) ? (B.multiplyVector3(A.copy(b.position)), f = a(), f.object =
                    b, f.z = A.z, v.objects.push(f)) : b instanceof THREE.Sprite || b instanceof THREE.Particle ? (B.multiplyVector3(A.copy(b.position)), f = a(), f.object = b, f.z = A.z, v.sprites.push(f)) : b instanceof THREE.Light && v.lights.push(b);
                for (var c = 0, d = b.children.length; c < d; c++) e(b.children[c])
            }
        };
        e(b);
        d && v.objects.sort(c);
        return v
    };
    this.projectScene = function(a, f, g) {
        var e = f.near,
            y = f.far,
            l = !1,
            A, C, E, S, R, ca, ka, ia, N, aa, U, ba, ea, Ta, Ja;
        w = r = o = q = 0;
        v.elements.length = 0;
        void 0 === f.parent && (console.warn("DEPRECATED: Camera hasn't been added to a Scene. Adding it..."),
            a.add(f));
        a.updateMatrixWorld();
        f.matrixWorldInverse.getInverse(f.matrixWorld);
        B.multiply(f.projectionMatrix, f.matrixWorldInverse);
        H.setFromMatrix(B);
        v = this.projectGraph(a, !1);
        for (a = 0, A = v.objects.length; a < A; a++)
            if (N = v.objects[a].object, aa = N.matrixWorld, i = 0, N instanceof THREE.Mesh) {
                U = N.geometry;
                ba = N.geometry.materials;
                S = U.vertices;
                ea = U.faces;
                Ta = U.faceVertexUvs;
                U = N.matrixRotationWorld.extractRotation(aa);
                for (C = 0, E = S.length; C < E; C++) h = b(), h.positionWorld.copy(S[C].position), aa.multiplyVector3(h.positionWorld),
                h.positionScreen.copy(h.positionWorld), B.multiplyVector4(h.positionScreen), h.positionScreen.x /= h.positionScreen.w, h.positionScreen.y /= h.positionScreen.w, h.visible = h.positionScreen.z > e && h.positionScreen.z < y;
                for (S = 0, C = ea.length; S < C; S++) {
                    E = ea[S];
                    if (E instanceof THREE.Face3)
                        if (R = j[E.a], ca = j[E.b], ka = j[E.c], R.visible && ca.visible && ka.visible)
                            if (l = 0 > (ka.positionScreen.x - R.positionScreen.x) * (ca.positionScreen.y - R.positionScreen.y) - (ka.positionScreen.y - R.positionScreen.y) * (ca.positionScreen.x - R.positionScreen.x),
                                N.doubleSided || l != N.flipSided) ia = m[q] = m[q] || new THREE.RenderableFace3, q++, k = ia, k.v1.copy(R), k.v2.copy(ca), k.v3.copy(ka);
                            else continue;
                            else continue;
                            else if (E instanceof THREE.Face4)
                        if (R = j[E.a], ca = j[E.b], ka = j[E.c], ia = j[E.d], R.visible && ca.visible && ka.visible && ia.visible)
                            if (l = 0 > (ia.positionScreen.x - R.positionScreen.x) * (ca.positionScreen.y - R.positionScreen.y) - (ia.positionScreen.y - R.positionScreen.y) * (ca.positionScreen.x - R.positionScreen.x) || 0 > (ca.positionScreen.x - ka.positionScreen.x) * (ia.positionScreen.y -
                                ka.positionScreen.y) - (ca.positionScreen.y - ka.positionScreen.y) * (ia.positionScreen.x - ka.positionScreen.x), N.doubleSided || l != N.flipSided) Ja = p[o] = p[o] || new THREE.RenderableFace4, o++, k = Ja, k.v1.copy(R), k.v2.copy(ca), k.v3.copy(ka), k.v4.copy(ia);
                            else continue;
                            else continue;
                    k.normalWorld.copy(E.normal);
                    !l && (N.flipSided || N.doubleSided) && k.normalWorld.negate();
                    U.multiplyVector3(k.normalWorld);
                    k.centroidWorld.copy(E.centroid);
                    aa.multiplyVector3(k.centroidWorld);
                    k.centroidScreen.copy(k.centroidWorld);
                    B.multiplyVector3(k.centroidScreen);
                    ka = E.vertexNormals;
                    for (R = 0, ca = ka.length; R < ca; R++) ia = k.vertexNormalsWorld[R], ia.copy(ka[R]), !l && (N.flipSided || N.doubleSided) && ia.negate(), U.multiplyVector3(ia);
                    for (R = 0, ca = Ta.length; R < ca; R++)
                        if (Ja = Ta[R][S])
                            for (ka = 0, ia = Ja.length; ka < ia; ka++) k.uvs[R][ka] = Ja[ka];
                    k.material = N.material;
                    k.faceMaterial = null !== E.materialIndex ? ba[E.materialIndex] : null;
                    k.z = k.centroidScreen.z;
                    v.elements.push(k)
                }
            } else if (N instanceof THREE.Line) {
            D.multiply(B, aa);
            S = N.geometry.vertices;
            R = b();
            R.positionScreen.copy(S[0].position);
            D.multiplyVector4(R.positionScreen);
            for (C = 1, E = S.length; C < E; C++)
                if (R = b(), R.positionScreen.copy(S[C].position), D.multiplyVector4(R.positionScreen), ca = j[i - 2], I.copy(R.positionScreen), Q.copy(ca.positionScreen), d(I, Q)) I.multiplyScalar(1 / I.w), Q.multiplyScalar(1 / Q.w), aa = s[r] = s[r] || new THREE.RenderableLine, r++, n = aa, n.v1.positionScreen.copy(I), n.v2.positionScreen.copy(Q), n.z = Math.max(I.z, Q.z), n.material = N.material, v.elements.push(n)
        }
        for (a = 0, A = v.sprites.length; a < A; a++)
            if (N = v.sprites[a].object, aa = N.matrixWorld, N instanceof THREE.Particle && (F.set(aa.n14,
                aa.n24, aa.n34, 1), B.multiplyVector4(F), F.z /= F.w, 0 < F.z && 1 > F.z)) e = u[w] = u[w] || new THREE.RenderableParticle, w++, t = e, t.x = F.x / F.w, t.y = F.y / F.w, t.z = F.z, t.rotation = N.rotation.z, t.scale.x = N.scale.x * Math.abs(t.x - (F.x + f.projectionMatrix.n11) / (F.w + f.projectionMatrix.n14)), t.scale.y = N.scale.y * Math.abs(t.y - (F.y + f.projectionMatrix.n22) / (F.w + f.projectionMatrix.n24)), t.material = N.material, v.elements.push(t);
        g && v.elements.sort(c);
        return v
    }
};
THREE.Quaternion = function(a, b, c, d) {
    this.x = a || 0;
    this.y = b || 0;
    this.z = c || 0;
    this.w = void 0 !== d ? d : 1
};
THREE.Quaternion.prototype = {
    constructor: THREE.Quaternion,
    set: function(a, b, c, d) {
        this.x = a;
        this.y = b;
        this.z = c;
        this.w = d;
        return this
    },
    copy: function(a) {
        this.x = a.x;
        this.y = a.y;
        this.z = a.z;
        this.w = a.w;
        return this
    },
    clone: function() {
        return new THREE.Quaternion(this.x, this.y, this.z, this.w)
    },
    setFromEuler: function(a) {
        var b = Math.PI / 360,
            c = a.x * b,
            d = a.y * b,
            f = a.z * b,
            a = Math.cos(d),
            d = Math.sin(d),
            b = Math.cos(-f),
            f = Math.sin(-f),
            g = Math.cos(c),
            c = Math.sin(c),
            e = a * b,
            h = d * f;
        this.w = e * g - h * c;
        this.x = e * c + h * g;
        this.y = d * b * g + a * f * c;
        this.z = a * f *
            g - d * b * c;
        return this
    },
    setFromAxisAngle: function(a, b) {
        var c = b / 2,
            d = Math.sin(c);
        this.x = a.x * d;
        this.y = a.y * d;
        this.z = a.z * d;
        this.w = Math.cos(c);
        return this
    },
    setFromRotationMatrix: function(a) {
        var b = Math.pow(a.determinant(), 1 / 3);
        this.w = Math.sqrt(Math.max(0, b + a.n11 + a.n22 + a.n33)) / 2;
        this.x = Math.sqrt(Math.max(0, b + a.n11 - a.n22 - a.n33)) / 2;
        this.y = Math.sqrt(Math.max(0, b - a.n11 + a.n22 - a.n33)) / 2;
        this.z = Math.sqrt(Math.max(0, b - a.n11 - a.n22 + a.n33)) / 2;
        this.x = 0 > a.n32 - a.n23 ? -Math.abs(this.x) : Math.abs(this.x);
        this.y = 0 > a.n13 - a.n31 ? -Math.abs(this.y) : Math.abs(this.y);
        this.z = 0 > a.n21 - a.n12 ? -Math.abs(this.z) : Math.abs(this.z);
        this.normalize();
        return this
    },
    calculateW: function() {
        this.w = -Math.sqrt(Math.abs(1 - this.x * this.x - this.y * this.y - this.z * this.z));
        return this
    },
    inverse: function() {
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
        return this
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
    },
    normalize: function() {
        var a = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        0 === a ? this.w = this.z =
            this.y = this.x = 0 : (a = 1 / a, this.x *= a, this.y *= a, this.z *= a, this.w *= a);
        return this
    },
    multiplySelf: function(a) {
        var b = this.x,
            c = this.y,
            d = this.z,
            f = this.w,
            g = a.x,
            e = a.y,
            h = a.z,
            a = a.w;
        this.x = b * a + f * g + c * h - d * e;
        this.y = c * a + f * e + d * g - b * h;
        this.z = d * a + f * h + b * e - c * g;
        this.w = f * a - b * g - c * e - d * h;
        return this
    },
    multiply: function(a, b) {
        this.x = a.x * b.w + a.y * b.z - a.z * b.y + a.w * b.x;
        this.y = -a.x * b.z + a.y * b.w + a.z * b.x + a.w * b.y;
        this.z = a.x * b.y - a.y * b.x + a.z * b.w + a.w * b.z;
        this.w = -a.x * b.x - a.y * b.y - a.z * b.z + a.w * b.w;
        return this
    },
    multiplyVector3: function(a, b) {
        b || (b =
            a);
        var c = a.x,
            d = a.y,
            f = a.z,
            g = this.x,
            e = this.y,
            h = this.z,
            i = this.w,
            j = i * c + e * f - h * d,
            k = i * d + h * c - g * f,
            q = i * f + g * d - e * c,
            c = -g * c - e * d - h * f;
        b.x = j * i + c * -g + k * -h - q * -e;
        b.y = k * i + c * -e + q * -g - j * -h;
        b.z = q * i + c * -h + j * -e - k * -g;
        return b
    }
};
THREE.Quaternion.slerp = function(a, b, c, d) {
    var f = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z;
    0 > f ? (c.w = -b.w, c.x = -b.x, c.y = -b.y, c.z = -b.z, f = -f) : c.copy(b);
    if (1 <= Math.abs(f)) return c.w = a.w, c.x = a.x, c.y = a.y, c.z = a.z, c;
    var g = Math.acos(f),
        f = Math.sqrt(1 - f * f);
    if (0.001 > Math.abs(f)) return c.w = 0.5 * (a.w + b.w), c.x = 0.5 * (a.x + b.x), c.y = 0.5 * (a.y + b.y), c.z = 0.5 * (a.z + b.z), c;
    b = Math.sin((1 - d) * g) / f;
    d = Math.sin(d * g) / f;
    c.w = a.w * b + c.w * d;
    c.x = a.x * b + c.x * d;
    c.y = a.y * b + c.y * d;
    c.z = a.z * b + c.z * d;
    return c
};
THREE.Vertex = function(a) {
    this.position = a || new THREE.Vector3
};
THREE.Vertex.prototype = {
    constructor: THREE.Vertex,
    clone: function() {
        return new THREE.Vertex(this.position.clone())
    }
};
THREE.Face3 = function(a, b, c, d, f, g) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.normal = d instanceof THREE.Vector3 ? d : new THREE.Vector3;
    this.vertexNormals = d instanceof Array ? d : [];
    this.color = f instanceof THREE.Color ? f : new THREE.Color;
    this.vertexColors = f instanceof Array ? f : [];
    this.vertexTangents = [];
    this.materialIndex = g;
    this.centroid = new THREE.Vector3
};
THREE.Face3.prototype = {
    constructor: THREE.Face3,
    clone: function() {
        var a = new THREE.Face3(this.a, this.b, this.c);
        a.normal.copy(this.normal);
        a.color.copy(this.color);
        a.centroid.copy(this.centroid);
        a.materialIndex = this.materialIndex;
        var b, c;
        for (b = 0, c = this.vertexNormals.length; b < c; b++) a.vertexNormals[b] = this.vertexNormals[b].clone();
        for (b = 0, c = this.vertexColors.length; b < c; b++) a.vertexColors[b] = this.vertexColors[b].clone();
        for (b = 0, c = this.vertexTangents.length; b < c; b++) a.vertexTangents[b] = this.vertexTangents[b].clone();
        return a
    }
};
THREE.Face4 = function(a, b, c, d, f, g, e) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.normal = f instanceof THREE.Vector3 ? f : new THREE.Vector3;
    this.vertexNormals = f instanceof Array ? f : [];
    this.color = g instanceof THREE.Color ? g : new THREE.Color;
    this.vertexColors = g instanceof Array ? g : [];
    this.vertexTangents = [];
    this.materialIndex = e;
    this.centroid = new THREE.Vector3
};
THREE.Face4.prototype = {
    constructor: THREE.Face4,
    clone: function() {
        var a = new THREE.Face4(this.a, this.b, this.c, this.d);
        a.normal.copy(this.normal);
        a.color.copy(this.color);
        a.centroid.copy(this.centroid);
        a.materialIndex = this.materialIndex;
        var b, c;
        for (b = 0, c = this.vertexNormals.length; b < c; b++) a.vertexNormals[b] = this.vertexNormals[b].clone();
        for (b = 0, c = this.vertexColors.length; b < c; b++) a.vertexColors[b] = this.vertexColors[b].clone();
        for (b = 0, c = this.vertexTangents.length; b < c; b++) a.vertexTangents[b] = this.vertexTangents[b].clone();
        return a
    }
};
THREE.UV = function(a, b) {
    this.u = a || 0;
    this.v = b || 0
};
THREE.UV.prototype = {
    constructor: THREE.UV,
    set: function(a, b) {
        this.u = a;
        this.v = b;
        return this
    },
    copy: function(a) {
        this.u = a.u;
        this.v = a.v;
        return this
    },
    lerpSelf: function(a, b) {
        this.u += (a.u - this.u) * b;
        this.v += (a.v - this.v) * b;
        return this
    },
    clone: function() {
        return new THREE.UV(this.u, this.v)
    }
};
THREE.Geometry = function() {
    this.id = THREE.GeometryCount++;
    this.vertices = [];
    this.colors = [];
    this.materials = [];
    this.faces = [];
    this.faceUvs = [
        []
    ];
    this.faceVertexUvs = [
        []
    ];
    this.morphTargets = [];
    this.morphColors = [];
    this.morphNormals = [];
    this.skinWeights = [];
    this.skinIndices = [];
    this.boundingSphere = this.boundingBox = null;
    this.dynamic = this.hasTangents = !1
};
THREE.Geometry.prototype = {
    constructor: THREE.Geometry,
    applyMatrix: function(a) {
        var b = new THREE.Matrix4;
        b.extractRotation(a);
        for (var c = 0, d = this.vertices.length; c < d; c++) a.multiplyVector3(this.vertices[c].position);
        c = 0;
        for (d = this.faces.length; c < d; c++) {
            var f = this.faces[c];
            b.multiplyVector3(f.normal);
            for (var g = 0, e = f.vertexNormals.length; g < e; g++) b.multiplyVector3(f.vertexNormals[g]);
            a.multiplyVector3(f.centroid)
        }
    },
    computeCentroids: function() {
        var a, b, c;
        for (a = 0, b = this.faces.length; a < b; a++) c = this.faces[a], c.centroid.set(0,
            0, 0), c instanceof THREE.Face3 ? (c.centroid.addSelf(this.vertices[c.a].position), c.centroid.addSelf(this.vertices[c.b].position), c.centroid.addSelf(this.vertices[c.c].position), c.centroid.divideScalar(3)) : c instanceof THREE.Face4 && (c.centroid.addSelf(this.vertices[c.a].position), c.centroid.addSelf(this.vertices[c.b].position), c.centroid.addSelf(this.vertices[c.c].position), c.centroid.addSelf(this.vertices[c.d].position), c.centroid.divideScalar(4))
    },
    computeFaceNormals: function() {
        var a, b, c, d, f, g, e = new THREE.Vector3,
            h = new THREE.Vector3;
        for (a = 0, b = this.faces.length; a < b; a++) c = this.faces[a], d = this.vertices[c.a], f = this.vertices[c.b], g = this.vertices[c.c], e.sub(g.position, f.position), h.sub(d.position, f.position), e.crossSelf(h), e.isZero() || e.normalize(), c.normal.copy(e)
    },
    computeVertexNormals: function() {
        var a, b, c, d;
        if (void 0 === this.__tmpVertices) {
            d = this.__tmpVertices = Array(this.vertices.length);
            for (a = 0, b = this.vertices.length; a < b; a++) d[a] = new THREE.Vector3;
            for (a = 0, b = this.faces.length; a < b; a++)
                if (c = this.faces[a], c instanceof THREE.Face3) c.vertexNormals = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3];
                else if (c instanceof THREE.Face4) c.vertexNormals = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3]
        } else {
            d = this.__tmpVertices;
            for (a = 0, b = this.vertices.length; a < b; a++) d[a].set(0, 0, 0)
        }
        for (a = 0, b = this.faces.length; a < b; a++) c = this.faces[a], c instanceof THREE.Face3 ? (d[c.a].addSelf(c.normal), d[c.b].addSelf(c.normal), d[c.c].addSelf(c.normal)) : c instanceof THREE.Face4 && (d[c.a].addSelf(c.normal), d[c.b].addSelf(c.normal),
            d[c.c].addSelf(c.normal), d[c.d].addSelf(c.normal));
        for (a = 0, b = this.vertices.length; a < b; a++) d[a].normalize();
        for (a = 0, b = this.faces.length; a < b; a++) c = this.faces[a], c instanceof THREE.Face3 ? (c.vertexNormals[0].copy(d[c.a]), c.vertexNormals[1].copy(d[c.b]), c.vertexNormals[2].copy(d[c.c])) : c instanceof THREE.Face4 && (c.vertexNormals[0].copy(d[c.a]), c.vertexNormals[1].copy(d[c.b]), c.vertexNormals[2].copy(d[c.c]), c.vertexNormals[3].copy(d[c.d]))
    },
    computeMorphNormals: function() {
        var a, b, c, d, f;
        for (c = 0, d = this.faces.length; c <
            d; c++) {
            f = this.faces[c];
            f.__originalFaceNormal ? f.__originalFaceNormal.copy(f.normal) : f.__originalFaceNormal = f.normal.clone();
            if (!f.__originalVertexNormals) f.__originalVertexNormals = [];
            for (a = 0, b = f.vertexNormals.length; a < b; a++) f.__originalVertexNormals[a] ? f.__originalVertexNormals[a].copy(f.vertexNormals[a]) : f.__originalVertexNormals[a] = f.vertexNormals[a].clone()
        }
        var g = new THREE.Geometry;
        g.faces = this.faces;
        for (a = 0, b = this.morphTargets.length; a < b; a++) {
            if (!this.morphNormals[a]) {
                this.morphNormals[a] = {};
                this.morphNormals[a].faceNormals = [];
                this.morphNormals[a].vertexNormals = [];
                var e = this.morphNormals[a].faceNormals,
                    h = this.morphNormals[a].vertexNormals,
                    i, j;
                for (c = 0, d = this.faces.length; c < d; c++) f = this.faces[c], i = new THREE.Vector3, j = f instanceof THREE.Face3 ? {
                    a: new THREE.Vector3,
                    b: new THREE.Vector3,
                    c: new THREE.Vector3
                } : {
                    a: new THREE.Vector3,
                    b: new THREE.Vector3,
                    c: new THREE.Vector3,
                    d: new THREE.Vector3
                }, e.push(i), h.push(j)
            }
            e = this.morphNormals[a];
            g.vertices = this.morphTargets[a].vertices;
            g.computeFaceNormals();
            g.computeVertexNormals();
            for (c = 0, d = this.faces.length; c < d; c++) f = this.faces[c], i = e.faceNormals[c], j = e.vertexNormals[c], i.copy(f.normal), f instanceof THREE.Face3 ? (j.a.copy(f.vertexNormals[0]), j.b.copy(f.vertexNormals[1]), j.c.copy(f.vertexNormals[2])) : (j.a.copy(f.vertexNormals[0]), j.b.copy(f.vertexNormals[1]), j.c.copy(f.vertexNormals[2]), j.d.copy(f.vertexNormals[3]))
        }
        for (c = 0, d = this.faces.length; c < d; c++) f = this.faces[c], f.normal = f.__originalFaceNormal, f.vertexNormals = f.__originalVertexNormals
    },
    computeTangents: function() {
        function a(a,
            b, c, d, f, g, R) {
            h = a.vertices[b].position;
            i = a.vertices[c].position;
            j = a.vertices[d].position;
            k = e[f];
            q = e[g];
            m = e[R];
            o = i.x - h.x;
            p = j.x - h.x;
            n = i.y - h.y;
            r = j.y - h.y;
            s = i.z - h.z;
            t = j.z - h.z;
            w = q.u - k.u;
            u = m.u - k.u;
            v = q.v - k.v;
            A = m.v - k.v;
            F = 1 / (w * A - u * v);
            I.set((A * o - v * p) * F, (A * n - v * r) * F, (A * s - v * t) * F);
            Q.set((w * p - u * o) * F, (w * r - u * n) * F, (w * t - u * s) * F);
            D[b].addSelf(I);
            D[c].addSelf(I);
            D[d].addSelf(I);
            H[b].addSelf(Q);
            H[c].addSelf(Q);
            H[d].addSelf(Q)
        }
        var b, c, d, f, g, e, h, i, j, k, q, m, o, p, n, r, s, t, w, u, v, A, F, B, D = [],
            H = [],
            I = new THREE.Vector3,
            Q = new THREE.Vector3,
            P = new THREE.Vector3,
            L = new THREE.Vector3,
            K = new THREE.Vector3;
        for (b = 0, c = this.vertices.length; b < c; b++) D[b] = new THREE.Vector3, H[b] = new THREE.Vector3;
        for (b = 0, c = this.faces.length; b < c; b++) g = this.faces[b], e = this.faceVertexUvs[0][b], g instanceof THREE.Face3 ? a(this, g.a, g.b, g.c, 0, 1, 2) : g instanceof THREE.Face4 && (a(this, g.a, g.b, g.c, 0, 1, 2), a(this, g.a, g.b, g.d, 0, 1, 3));
        var O = ["a", "b", "c", "d"];
        for (b = 0, c = this.faces.length; b < c; b++) {
            g = this.faces[b];
            for (d = 0; d < g.vertexNormals.length; d++) K.copy(g.vertexNormals[d]), f = g[O[d]],
            B = D[f], P.copy(B), P.subSelf(K.multiplyScalar(K.dot(B))).normalize(), L.cross(g.vertexNormals[d], B), f = L.dot(H[f]), f = 0 > f ? -1 : 1, g.vertexTangents[d] = new THREE.Vector4(P.x, P.y, P.z, f)
        }
        this.hasTangents = !0
    },
    computeBoundingBox: function() {
        if (!this.boundingBox) this.boundingBox = {
            min: new THREE.Vector3,
            max: new THREE.Vector3
        };
        if (0 < this.vertices.length) {
            var a;
            a = this.vertices[0].position;
            this.boundingBox.min.copy(a);
            this.boundingBox.max.copy(a);
            for (var b = this.boundingBox.min, c = this.boundingBox.max, d = 1, f = this.vertices.length; d <
                f; d++) {
                a = this.vertices[d].position;
                if (a.x < b.x) b.x = a.x;
                else if (a.x > c.x) c.x = a.x;
                if (a.y < b.y) b.y = a.y;
                else if (a.y > c.y) c.y = a.y;
                if (a.z < b.z) b.z = a.z;
                else if (a.z > c.z) c.z = a.z
            }
        } else this.boundingBox.min.set(0, 0, 0), this.boundingBox.max.set(0, 0, 0)
    },
    computeBoundingSphere: function() {
        if (!this.boundingSphere) this.boundingSphere = {
            radius: 0
        };
        for (var a, b = 0, c = 0, d = this.vertices.length; c < d; c++) a = this.vertices[c].position.length(), a > b && (b = a);
        this.boundingSphere.radius = b
    },
    mergeVertices: function() {
        var a = {}, b = [],
            c = [],
            d, f = Math.pow(10,
                4),
            g, e;
        for (g = 0, e = this.vertices.length; g < e; g++) d = this.vertices[g].position, d = [Math.round(d.x * f), Math.round(d.y * f), Math.round(d.z * f)].join("_"), void 0 === a[d] ? (a[d] = g, b.push(this.vertices[g]), c[g] = b.length - 1) : c[g] = c[a[d]];
        for (g = 0, e = this.faces.length; g < e; g++)
            if (a = this.faces[g], a instanceof THREE.Face3) a.a = c[a.a], a.b = c[a.b], a.c = c[a.c];
            else if (a instanceof THREE.Face4) a.a = c[a.a], a.b = c[a.b], a.c = c[a.c], a.d = c[a.d];
        this.vertices = b
    }
};
THREE.GeometryCount = 0;
THREE.Spline = function(a) {
    function b(a, b, c, d, f, g, e) {
        a = 0.5 * (c - a);
        d = 0.5 * (d - b);
        return (2 * (b - c) + a + d) * e + (-3 * (b - c) - 2 * a - d) * g + a * f + b
    }
    this.points = a;
    var c = [],
        d = {
            x: 0,
            y: 0,
            z: 0
        }, f, g, e, h, i, j, k, q, m;
    this.initFromArray = function(a) {
        this.points = [];
        for (var b = 0; b < a.length; b++) this.points[b] = {
            x: a[b][0],
            y: a[b][1],
            z: a[b][2]
        }
    };
    this.getPoint = function(a) {
        f = (this.points.length - 1) * a;
        g = Math.floor(f);
        e = f - g;
        c[0] = 0 === g ? g : g - 1;
        c[1] = g;
        c[2] = g > this.points.length - 2 ? g : g + 1;
        c[3] = g > this.points.length - 3 ? g : g + 2;
        j = this.points[c[0]];
        k = this.points[c[1]];
        q = this.points[c[2]];
        m = this.points[c[3]];
        h = e * e;
        i = e * h;
        d.x = b(j.x, k.x, q.x, m.x, e, h, i);
        d.y = b(j.y, k.y, q.y, m.y, e, h, i);
        d.z = b(j.z, k.z, q.z, m.z, e, h, i);
        return d
    };
    this.getControlPointsArray = function() {
        var a, b, c = this.points.length,
            d = [];
        for (a = 0; a < c; a++) b = this.points[a], d[a] = [b.x, b.y, b.z];
        return d
    };
    this.getLength = function(a) {
        var b, c, d, f = b = b = 0,
            g = new THREE.Vector3,
            e = new THREE.Vector3,
            h = [],
            i = 0;
        h[0] = 0;
        a || (a = 100);
        c = this.points.length * a;
        g.copy(this.points[0]);
        for (a = 1; a < c; a++) b = a / c, d = this.getPoint(b), e.copy(d), i += e.distanceTo(g),
        g.copy(d), b *= this.points.length - 1, b = Math.floor(b), b != f && (h[b] = i, f = b);
        h[h.length] = i;
        return {
            chunks: h,
            total: i
        }
    };
    this.reparametrizeByArcLength = function(a) {
        var b, c, d, f, g, e, h = [],
            i = new THREE.Vector3,
            j = this.getLength();
        h.push(i.copy(this.points[0]).clone());
        for (b = 1; b < this.points.length; b++) {
            c = j.chunks[b] - j.chunks[b - 1];
            e = Math.ceil(a * c / j.total);
            f = (b - 1) / (this.points.length - 1);
            g = b / (this.points.length - 1);
            for (c = 1; c < e - 1; c++) d = f + c * (1 / e) * (g - f), d = this.getPoint(d), h.push(i.copy(d).clone());
            h.push(i.copy(this.points[b]).clone())
        }
        this.points =
            h
    }
};
THREE.Camera = function() {
    THREE.Object3D.call(this);
    this.matrixWorldInverse = new THREE.Matrix4;
    this.projectionMatrix = new THREE.Matrix4;
    this.projectionMatrixInverse = new THREE.Matrix4
};
THREE.Camera.prototype = new THREE.Object3D;
THREE.Camera.prototype.constructor = THREE.Camera;
THREE.Camera.prototype.lookAt = function(a) {
    this.matrix.lookAt(this.position, a, this.up);
    this.rotationAutoUpdate && this.rotation.getRotationFromMatrix(this.matrix)
};
THREE.OrthographicCamera = function(a, b, c, d, f, g) {
    THREE.Camera.call(this);
    this.left = a;
    this.right = b;
    this.top = c;
    this.bottom = d;
    this.near = void 0 !== f ? f : 0.1;
    this.far = void 0 !== g ? g : 2E3;
    this.updateProjectionMatrix()
};
THREE.OrthographicCamera.prototype = new THREE.Camera;
THREE.OrthographicCamera.prototype.constructor = THREE.OrthographicCamera;
THREE.OrthographicCamera.prototype.updateProjectionMatrix = function() {
    this.projectionMatrix = THREE.Matrix4.makeOrtho(this.left, this.right, this.top, this.bottom, this.near, this.far)
};
THREE.PerspectiveCamera = function(a, b, c, d) {
    THREE.Camera.call(this);
    this.fov = void 0 !== a ? a : 50;
    this.aspect = void 0 !== b ? b : 1;
    this.near = void 0 !== c ? c : 0.1;
    this.far = void 0 !== d ? d : 2E3;
    this.updateProjectionMatrix()
};
THREE.PerspectiveCamera.prototype = new THREE.Camera;
THREE.PerspectiveCamera.prototype.constructor = THREE.PerspectiveCamera;
THREE.PerspectiveCamera.prototype.setLens = function(a, b) {
    this.fov = 2 * Math.atan((void 0 !== b ? b : 24) / (2 * a)) * (180 / Math.PI);
    this.updateProjectionMatrix()
};
THREE.PerspectiveCamera.prototype.setViewOffset = function(a, b, c, d, f, g) {
    this.fullWidth = a;
    this.fullHeight = b;
    this.x = c;
    this.y = d;
    this.width = f;
    this.height = g;
    this.updateProjectionMatrix()
};
THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function() {
    if (this.fullWidth) {
        var a = this.fullWidth / this.fullHeight,
            b = Math.tan(this.fov * Math.PI / 360) * this.near,
            c = -b,
            d = a * c,
            a = Math.abs(a * b - d),
            c = Math.abs(b - c);
        this.projectionMatrix = THREE.Matrix4.makeFrustum(d + this.x * a / this.fullWidth, d + (this.x + this.width) * a / this.fullWidth, b - (this.y + this.height) * c / this.fullHeight, b - this.y * c / this.fullHeight, this.near, this.far)
    } else this.projectionMatrix = THREE.Matrix4.makePerspective(this.fov, this.aspect, this.near,
        this.far)
};
THREE.Light = function(a) {
    THREE.Object3D.call(this);
    this.color = new THREE.Color(a)
};
THREE.Light.prototype = new THREE.Object3D;
THREE.Light.prototype.constructor = THREE.Light;
THREE.Light.prototype.supr = THREE.Object3D.prototype;
THREE.AmbientLight = function(a) {
    THREE.Light.call(this, a)
};
THREE.AmbientLight.prototype = new THREE.Light;
THREE.AmbientLight.prototype.constructor = THREE.AmbientLight;
THREE.DirectionalLight = function(a, b, c) {
    THREE.Light.call(this, a);
    this.position = new THREE.Vector3(0, 1, 0);
    this.target = new THREE.Object3D;
    this.intensity = void 0 !== b ? b : 1;
    this.distance = void 0 !== c ? c : 0;
    this.onlyShadow = this.castShadow = !1;
    this.shadowCameraNear = 50;
    this.shadowCameraFar = 5E3;
    this.shadowCameraLeft = -500;
    this.shadowCameraTop = this.shadowCameraRight = 500;
    this.shadowCameraBottom = -500;
    this.shadowCameraVisible = !1;
    this.shadowBias = 0;
    this.shadowDarkness = 0.5;
    this.shadowMapHeight = this.shadowMapWidth = 512;
    this.shadowCascade = !1;
    this.shadowCascadeOffset = new THREE.Vector3(0, 0, -1E3);
    this.shadowCascadeCount = 2;
    this.shadowCascadeBias = [0, 0, 0];
    this.shadowCascadeWidth = [512, 512, 512];
    this.shadowCascadeHeight = [512, 512, 512];
    this.shadowCascadeNearZ = [-1, 0.99, 0.998];
    this.shadowCascadeFarZ = [0.99, 0.998, 1];
    this.shadowCascadeArray = [];
    this.shadowMatrix = this.shadowCamera = this.shadowMapSize = this.shadowMap = null
};
THREE.DirectionalLight.prototype = new THREE.Light;
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight;
THREE.PointLight = function(a, b, c) {
    THREE.Light.call(this, a);
    this.position = new THREE.Vector3(0, 0, 0);
    this.intensity = void 0 !== b ? b : 1;
    this.distance = void 0 !== c ? c : 0
};
THREE.PointLight.prototype = new THREE.Light;
THREE.PointLight.prototype.constructor = THREE.PointLight;
THREE.SpotLight = function(a, b, c, d) {
    THREE.Light.call(this, a);
    this.position = new THREE.Vector3(0, 1, 0);
    this.target = new THREE.Object3D;
    this.intensity = void 0 !== b ? b : 1;
    this.distance = void 0 !== c ? c : 0;
    this.castShadow = void 0 !== d ? d : !1;
    this.onlyShadow = !1;
    this.shadowCameraNear = 50;
    this.shadowCameraFar = 5E3;
    this.shadowCameraFov = 50;
    this.shadowCameraVisible = !1;
    this.shadowBias = 0;
    this.shadowDarkness = 0.5;
    this.shadowMapHeight = this.shadowMapWidth = 512;
    this.shadowMatrix = this.shadowCamera = this.shadowMapSize = this.shadowMap = null
};
THREE.SpotLight.prototype = new THREE.Light;
THREE.SpotLight.prototype.constructor = THREE.SpotLight;
THREE.Material = function(a) {
    a = a || {};
    this.id = THREE.MaterialCount++;
    this.name = "";
    this.opacity = void 0 !== a.opacity ? a.opacity : 1;
    this.transparent = void 0 !== a.transparent ? a.transparent : !1;
    this.blending = void 0 !== a.blending ? a.blending : THREE.NormalBlending;
    this.depthTest = void 0 !== a.depthTest ? a.depthTest : !0;
    this.depthWrite = void 0 !== a.depthWrite ? a.depthWrite : !0;
    this.polygonOffset = void 0 !== a.polygonOffset ? a.polygonOffset : !1;
    this.polygonOffsetFactor = void 0 !== a.polygonOffsetFactor ? a.polygonOffsetFactor : 0;
    this.polygonOffsetUnits =
        void 0 !== a.polygonOffsetUnits ? a.polygonOffsetUnits : 0;
    this.alphaTest = void 0 !== a.alphaTest ? a.alphaTest : 0;
    this.overdraw = void 0 !== a.overdraw ? a.overdraw : !1
};
THREE.MaterialCount = 0;
THREE.NoShading = 0;
THREE.FlatShading = 1;
THREE.SmoothShading = 2;
THREE.NoColors = 0;
THREE.FaceColors = 1;
THREE.VertexColors = 2;
THREE.NoBlending = 0;
THREE.NormalBlending = 1;
THREE.AdditiveBlending = 2;
THREE.SubtractiveBlending = 3;
THREE.MultiplyBlending = 4;
THREE.AdditiveAlphaBlending = 5;
THREE.LineBasicMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.color = void 0 !== a.color ? new THREE.Color(a.color) : new THREE.Color(16777215);
    this.linewidth = void 0 !== a.linewidth ? a.linewidth : 1;
    this.linecap = void 0 !== a.linecap ? a.linecap : "round";
    this.linejoin = void 0 !== a.linejoin ? a.linejoin : "round";
    this.vertexColors = a.vertexColors ? a.vertexColors : !1;
    this.fog = void 0 !== a.fog ? a.fog : !0
};
THREE.LineBasicMaterial.prototype = new THREE.Material;
THREE.LineBasicMaterial.prototype.constructor = THREE.LineBasicMaterial;
THREE.MeshBasicMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.color = void 0 !== a.color ? new THREE.Color(a.color) : new THREE.Color(16777215);
    this.map = void 0 !== a.map ? a.map : null;
    this.lightMap = void 0 !== a.lightMap ? a.lightMap : null;
    this.envMap = void 0 !== a.envMap ? a.envMap : null;
    this.combine = void 0 !== a.combine ? a.combine : THREE.MultiplyOperation;
    this.reflectivity = void 0 !== a.reflectivity ? a.reflectivity : 1;
    this.refractionRatio = void 0 !== a.refractionRatio ? a.refractionRatio : 0.98;
    this.fog = void 0 !== a.fog ? a.fog : !0;
    this.shading = void 0 !== a.shading ? a.shading : THREE.SmoothShading;
    this.wireframe = void 0 !== a.wireframe ? a.wireframe : !1;
    this.wireframeLinewidth = void 0 !== a.wireframeLinewidth ? a.wireframeLinewidth : 1;
    this.wireframeLinecap = void 0 !== a.wireframeLinecap ? a.wireframeLinecap : "round";
    this.wireframeLinejoin = void 0 !== a.wireframeLinejoin ? a.wireframeLinejoin : "round";
    this.vertexColors = void 0 !== a.vertexColors ? a.vertexColors : !1;
    this.skinning = void 0 !== a.skinning ? a.skinning : !1;
    this.morphTargets = void 0 !== a.morphTargets ? a.morphTargets : !1
};
THREE.MeshBasicMaterial.prototype = new THREE.Material;
THREE.MeshBasicMaterial.prototype.constructor = THREE.MeshBasicMaterial;
THREE.MeshLambertMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.color = void 0 !== a.color ? new THREE.Color(a.color) : new THREE.Color(16777215);
    this.ambient = void 0 !== a.ambient ? new THREE.Color(a.ambient) : new THREE.Color(16777215);
    this.wrapAround = void 0 !== a.wrapAround ? a.wrapAround : !1;
    this.wrapRGB = new THREE.Vector3(1, 1, 1);
    this.map = void 0 !== a.map ? a.map : null;
    this.lightMap = void 0 !== a.lightMap ? a.lightMap : null;
    this.envMap = void 0 !== a.envMap ? a.envMap : null;
    this.combine = void 0 !== a.combine ? a.combine :
        THREE.MultiplyOperation;
    this.reflectivity = void 0 !== a.reflectivity ? a.reflectivity : 1;
    this.refractionRatio = void 0 !== a.refractionRatio ? a.refractionRatio : 0.98;
    this.fog = void 0 !== a.fog ? a.fog : !0;
    this.shading = void 0 !== a.shading ? a.shading : THREE.SmoothShading;
    this.wireframe = void 0 !== a.wireframe ? a.wireframe : !1;
    this.wireframeLinewidth = void 0 !== a.wireframeLinewidth ? a.wireframeLinewidth : 1;
    this.wireframeLinecap = void 0 !== a.wireframeLinecap ? a.wireframeLinecap : "round";
    this.wireframeLinejoin = void 0 !== a.wireframeLinejoin ?
        a.wireframeLinejoin : "round";
    this.vertexColors = void 0 !== a.vertexColors ? a.vertexColors : !1;
    this.skinning = void 0 !== a.skinning ? a.skinning : !1;
    this.morphTargets = void 0 !== a.morphTargets ? a.morphTargets : !1;
    this.morphNormals = void 0 !== a.morphNormals ? a.morphNormals : !1
};
THREE.MeshLambertMaterial.prototype = new THREE.Material;
THREE.MeshLambertMaterial.prototype.constructor = THREE.MeshLambertMaterial;
THREE.MeshPhongMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.color = void 0 !== a.color ? new THREE.Color(a.color) : new THREE.Color(16777215);
    this.ambient = void 0 !== a.ambient ? new THREE.Color(a.ambient) : new THREE.Color(16777215);
    this.specular = void 0 !== a.specular ? new THREE.Color(a.specular) : new THREE.Color(1118481);
    this.shininess = void 0 !== a.shininess ? a.shininess : 30;
    this.metal = void 0 !== a.metal ? a.metal : !1;
    this.perPixel = void 0 !== a.perPixel ? a.perPixel : !1;
    this.wrapAround = void 0 !== a.wrapAround ? a.wrapAround : !1;
    this.wrapRGB = new THREE.Vector3(1, 1, 1);
    this.map = void 0 !== a.map ? a.map : null;
    this.lightMap = void 0 !== a.lightMap ? a.lightMap : null;
    this.envMap = void 0 !== a.envMap ? a.envMap : null;
    this.combine = void 0 !== a.combine ? a.combine : THREE.MultiplyOperation;
    this.reflectivity = void 0 !== a.reflectivity ? a.reflectivity : 1;
    this.refractionRatio = void 0 !== a.refractionRatio ? a.refractionRatio : 0.98;
    this.fog = void 0 !== a.fog ? a.fog : !0;
    this.shading = void 0 !== a.shading ? a.shading : THREE.SmoothShading;
    this.wireframe = void 0 !== a.wireframe ? a.wireframe : !1;
    this.wireframeLinewidth = void 0 !== a.wireframeLinewidth ? a.wireframeLinewidth : 1;
    this.wireframeLinecap = void 0 !== a.wireframeLinecap ? a.wireframeLinecap : "round";
    this.wireframeLinejoin = void 0 !== a.wireframeLinejoin ? a.wireframeLinejoin : "round";
    this.vertexColors = void 0 !== a.vertexColors ? a.vertexColors : !1;
    this.skinning = void 0 !== a.skinning ? a.skinning : !1;
    this.morphTargets = void 0 !== a.morphTargets ? a.morphTargets : !1;
    this.morphNormals = void 0 !== a.morphNormals ? a.morphNormals : !1
};
THREE.MeshPhongMaterial.prototype = new THREE.Material;
THREE.MeshPhongMaterial.prototype.constructor = THREE.MeshPhongMaterial;
THREE.MeshDepthMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.shading = void 0 !== a.shading ? a.shading : THREE.SmoothShading;
    this.wireframe = void 0 !== a.wireframe ? a.wireframe : !1;
    this.wireframeLinewidth = void 0 !== a.wireframeLinewidth ? a.wireframeLinewidth : 1
};
THREE.MeshDepthMaterial.prototype = new THREE.Material;
THREE.MeshDepthMaterial.prototype.constructor = THREE.MeshDepthMaterial;
THREE.MeshNormalMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.shading = a.shading ? a.shading : THREE.FlatShading;
    this.wireframe = a.wireframe ? a.wireframe : !1;
    this.wireframeLinewidth = a.wireframeLinewidth ? a.wireframeLinewidth : 1
};
THREE.MeshNormalMaterial.prototype = new THREE.Material;
THREE.MeshNormalMaterial.prototype.constructor = THREE.MeshNormalMaterial;
THREE.MeshFaceMaterial = function() {};
THREE.ParticleBasicMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.color = void 0 !== a.color ? new THREE.Color(a.color) : new THREE.Color(16777215);
    this.map = void 0 !== a.map ? a.map : null;
    this.size = void 0 !== a.size ? a.size : 1;
    this.sizeAttenuation = void 0 !== a.sizeAttenuation ? a.sizeAttenuation : !0;
    this.vertexColors = void 0 !== a.vertexColors ? a.vertexColors : !1;
    this.fog = void 0 !== a.fog ? a.fog : !0
};
THREE.ParticleBasicMaterial.prototype = new THREE.Material;
THREE.ParticleBasicMaterial.prototype.constructor = THREE.ParticleBasicMaterial;
THREE.ParticleCanvasMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.color = void 0 !== a.color ? new THREE.Color(a.color) : new THREE.Color(16777215);
    this.program = void 0 !== a.program ? a.program : function() {}
};
THREE.ParticleCanvasMaterial.prototype = new THREE.Material;
THREE.ParticleCanvasMaterial.prototype.constructor = THREE.ParticleCanvasMaterial;
THREE.ParticleDOMMaterial = function(a) {
    THREE.Material.call(this);
    this.domElement = a
};
THREE.ShaderMaterial = function(a) {
    THREE.Material.call(this, a);
    a = a || {};
    this.fragmentShader = void 0 !== a.fragmentShader ? a.fragmentShader : "void main() {}";
    this.vertexShader = void 0 !== a.vertexShader ? a.vertexShader : "void main() {}";
    this.uniforms = void 0 !== a.uniforms ? a.uniforms : {};
    this.attributes = a.attributes;
    this.shading = void 0 !== a.shading ? a.shading : THREE.SmoothShading;
    this.wireframe = void 0 !== a.wireframe ? a.wireframe : !1;
    this.wireframeLinewidth = void 0 !== a.wireframeLinewidth ? a.wireframeLinewidth : 1;
    this.fog = void 0 !==
        a.fog ? a.fog : !1;
    this.lights = void 0 !== a.lights ? a.lights : !1;
    this.vertexColors = void 0 !== a.vertexColors ? a.vertexColors : !1;
    this.skinning = void 0 !== a.skinning ? a.skinning : !1;
    this.morphTargets = void 0 !== a.morphTargets ? a.morphTargets : !1
};
THREE.ShaderMaterial.prototype = new THREE.Material;
THREE.ShaderMaterial.prototype.constructor = THREE.ShaderMaterial;
THREE.Texture = function(a, b, c, d, f, g, e, h) {
    this.id = THREE.TextureCount++;
    this.image = a;
    this.mapping = void 0 !== b ? b : new THREE.UVMapping;
    this.wrapS = void 0 !== c ? c : THREE.ClampToEdgeWrapping;
    this.wrapT = void 0 !== d ? d : THREE.ClampToEdgeWrapping;
    this.magFilter = void 0 !== f ? f : THREE.LinearFilter;
    this.minFilter = void 0 !== g ? g : THREE.LinearMipMapLinearFilter;
    this.format = void 0 !== e ? e : THREE.RGBAFormat;
    this.type = void 0 !== h ? h : THREE.UnsignedByteType;
    this.offset = new THREE.Vector2(0, 0);
    this.repeat = new THREE.Vector2(1, 1);
    this.generateMipmaps = !0;
    this.needsUpdate = !1;
    this.onUpdate = null
};
THREE.Texture.prototype = {
    constructor: THREE.Texture,
    clone: function() {
        var a = new THREE.Texture(this.image, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter, this.format, this.type);
        a.offset.copy(this.offset);
        a.repeat.copy(this.repeat);
        return a
    }
};
THREE.TextureCount = 0;
THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;
THREE.CubeReflectionMapping = function() {};
THREE.CubeRefractionMapping = function() {};
THREE.LatitudeReflectionMapping = function() {};
THREE.LatitudeRefractionMapping = function() {};
THREE.SphericalReflectionMapping = function() {};
THREE.SphericalRefractionMapping = function() {};
THREE.UVMapping = function() {};
THREE.RepeatWrapping = 0;
THREE.ClampToEdgeWrapping = 1;
THREE.MirroredRepeatWrapping = 2;
THREE.NearestFilter = 3;
THREE.NearestMipMapNearestFilter = 4;
THREE.NearestMipMapLinearFilter = 5;
THREE.LinearFilter = 6;
THREE.LinearMipMapNearestFilter = 7;
THREE.LinearMipMapLinearFilter = 8;
THREE.ByteType = 9;
THREE.UnsignedByteType = 10;
THREE.ShortType = 11;
THREE.UnsignedShortType = 12;
THREE.IntType = 13;
THREE.UnsignedIntType = 14;
THREE.FloatType = 15;
THREE.AlphaFormat = 16;
THREE.RGBFormat = 17;
THREE.RGBAFormat = 18;
THREE.LuminanceFormat = 19;
THREE.LuminanceAlphaFormat = 20;
THREE.DataTexture = function(a, b, c, d, f, g, e, h, i, j) {
    THREE.Texture.call(this, null, g, e, h, i, j, d, f);
    this.image = {
        data: a,
        width: b,
        height: c
    }
};
THREE.DataTexture.prototype = new THREE.Texture;
THREE.DataTexture.prototype.constructor = THREE.DataTexture;
THREE.DataTexture.prototype.clone = function() {
    var a = new THREE.DataTexture(this.image.data, this.image.width, this.image.height, this.format, this.type, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter);
    a.offset.copy(this.offset);
    a.repeat.copy(this.repeat);
    return a
};
THREE.Particle = function(a) {
    THREE.Object3D.call(this);
    this.material = a
};
THREE.Particle.prototype = new THREE.Object3D;
THREE.Particle.prototype.constructor = THREE.Particle;
THREE.ParticleSystem = function(a, b) {
    THREE.Object3D.call(this);
    this.geometry = a;
    this.material = void 0 !== b ? b : new THREE.ParticleBasicMaterial({
        color: 16777215 * Math.random()
    });
    this.sortParticles = !1;
    if (this.geometry) this.geometry.boundingSphere || this.geometry.computeBoundingSphere(), this.boundRadius = a.boundingSphere.radius;
    this.frustumCulled = !1
};
THREE.ParticleSystem.prototype = new THREE.Object3D;
THREE.ParticleSystem.prototype.constructor = THREE.ParticleSystem;
THREE.Line = function(a, b, c) {
    THREE.Object3D.call(this);
    this.geometry = a;
    this.material = void 0 !== b ? b : new THREE.LineBasicMaterial({
        color: 16777215 * Math.random()
    });
    this.type = void 0 !== c ? c : THREE.LineStrip;
    this.geometry && (this.geometry.boundingSphere || this.geometry.computeBoundingSphere())
};
THREE.LineStrip = 0;
THREE.LinePieces = 1;
THREE.Line.prototype = new THREE.Object3D;
THREE.Line.prototype.constructor = THREE.Line;
THREE.Mesh = function(a, b) {
    THREE.Object3D.call(this);
    this.geometry = a;
    this.material = void 0 !== b ? b : new THREE.MeshBasicMaterial({
        color: 16777215 * Math.random(),
        wireframe: !0
    });
    if (this.geometry && (this.geometry.boundingSphere || this.geometry.computeBoundingSphere(), this.boundRadius = a.boundingSphere.radius, this.geometry.morphTargets.length)) {
        this.morphTargetBase = -1;
        this.morphTargetForcedOrder = [];
        this.morphTargetInfluences = [];
        this.morphTargetDictionary = {};
        for (var c = 0; c < this.geometry.morphTargets.length; c++) this.morphTargetInfluences.push(0),
        this.morphTargetDictionary[this.geometry.morphTargets[c].name] = c
    }
};
THREE.Mesh.prototype = new THREE.Object3D;
THREE.Mesh.prototype.constructor = THREE.Mesh;
THREE.Mesh.prototype.supr = THREE.Object3D.prototype;
THREE.Mesh.prototype.getMorphTargetIndexByName = function(a) {
    if (void 0 !== this.morphTargetDictionary[a]) return this.morphTargetDictionary[a];
    console.log("THREE.Mesh.getMorphTargetIndexByName: morph target " + a + " does not exist. Returning 0.");
    return 0
};
THREE.Bone = function(a) {
    THREE.Object3D.call(this);
    this.skin = a;
    this.skinMatrix = new THREE.Matrix4
};
THREE.Bone.prototype = new THREE.Object3D;
THREE.Bone.prototype.constructor = THREE.Bone;
THREE.Bone.prototype.supr = THREE.Object3D.prototype;
THREE.Bone.prototype.update = function(a, b) {
    this.matrixAutoUpdate && (b |= this.updateMatrix());
    if (b || this.matrixWorldNeedsUpdate) a ? this.skinMatrix.multiply(a, this.matrix) : this.skinMatrix.copy(this.matrix), this.matrixWorldNeedsUpdate = !1, b = !0;
    var c, d = this.children.length;
    for (c = 0; c < d; c++) this.children[c].update(this.skinMatrix, b)
};
THREE.SkinnedMesh = function(a, b) {
    THREE.Mesh.call(this, a, b);
    this.identityMatrix = new THREE.Matrix4;
    this.bones = [];
    this.boneMatrices = [];
    var c, d, f, g, e, h;
    if (void 0 !== this.geometry.bones) {
        for (c = 0; c < this.geometry.bones.length; c++) f = this.geometry.bones[c], g = f.pos, e = f.rotq, h = f.scl, d = this.addBone(), d.name = f.name, d.position.set(g[0], g[1], g[2]), d.quaternion.set(e[0], e[1], e[2], e[3]), d.useQuaternion = !0, void 0 !== h ? d.scale.set(h[0], h[1], h[2]) : d.scale.set(1, 1, 1);
        for (c = 0; c < this.bones.length; c++) f = this.geometry.bones[c],
        d = this.bones[c], -1 === f.parent ? this.add(d) : this.bones[f.parent].add(d);
        this.boneMatrices = new Float32Array(16 * this.bones.length);
        this.pose()
    }
};
THREE.SkinnedMesh.prototype = new THREE.Mesh;
THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh;
THREE.SkinnedMesh.prototype.addBone = function(a) {
    void 0 === a && (a = new THREE.Bone(this));
    this.bones.push(a);
    return a
};
THREE.SkinnedMesh.prototype.updateMatrixWorld = function(a) {
    this.matrixAutoUpdate && this.updateMatrix();
    if (this.matrixWorldNeedsUpdate || a) this.parent ? this.matrixWorld.multiply(this.parent.matrixWorld, this.matrix) : this.matrixWorld.copy(this.matrix), this.matrixWorldNeedsUpdate = !1;
    for (var a = 0, b = this.children.length; a < b; a++) {
        var c = this.children[a];
        c instanceof THREE.Bone ? c.update(this.identityMatrix, !1) : c.updateMatrixWorld(!0)
    }
    for (var b = this.bones.length, c = this.bones, d = this.boneMatrices, a = 0; a < b; a++) c[a].skinMatrix.flattenToArrayOffset(d,
        16 * a)
};
THREE.SkinnedMesh.prototype.pose = function() {
    this.updateMatrixWorld(!0);
    for (var a, b = [], c = 0; c < this.bones.length; c++) {
        a = this.bones[c];
        var d = new THREE.Matrix4;
        d.getInverse(a.skinMatrix);
        b.push(d);
        a.skinMatrix.flattenToArrayOffset(this.boneMatrices, 16 * c)
    }
    if (void 0 === this.geometry.skinVerticesA) {
        this.geometry.skinVerticesA = [];
        this.geometry.skinVerticesB = [];
        for (a = 0; a < this.geometry.skinIndices.length; a++) {
            var c = this.geometry.vertices[a].position,
                f = this.geometry.skinIndices[a].x,
                g = this.geometry.skinIndices[a].y,
                d =
                    new THREE.Vector3(c.x, c.y, c.z);
            this.geometry.skinVerticesA.push(b[f].multiplyVector3(d));
            d = new THREE.Vector3(c.x, c.y, c.z);
            this.geometry.skinVerticesB.push(b[g].multiplyVector3(d));
            1 !== this.geometry.skinWeights[a].x + this.geometry.skinWeights[a].y && (c = 0.5 * (1 - (this.geometry.skinWeights[a].x + this.geometry.skinWeights[a].y)), this.geometry.skinWeights[a].x += c, this.geometry.skinWeights[a].y += c)
        }
    }
};
THREE.MorphAnimMesh = function(a, b) {
    THREE.Mesh.call(this, a, b);
    this.duration = 1E3;
    this.mirroredLoop = !1;
    this.currentKeyframe = this.lastKeyframe = this.time = 0;
    this.direction = 1;
    this.directionBackwards = !1;
    this.setFrameRange(0, this.geometry.morphTargets.length - 1)
};
THREE.MorphAnimMesh.prototype = new THREE.Mesh;
THREE.MorphAnimMesh.prototype.constructor = THREE.MorphAnimMesh;
THREE.MorphAnimMesh.prototype.setFrameRange = function(a, b) {
    this.startKeyframe = a;
    this.endKeyframe = b;
    this.length = this.endKeyframe - this.startKeyframe + 1
};
THREE.MorphAnimMesh.prototype.setDirectionForward = function() {
    this.direction = 1;
    this.directionBackwards = !1
};
THREE.MorphAnimMesh.prototype.setDirectionBackward = function() {
    this.direction = -1;
    this.directionBackwards = !0
};
THREE.MorphAnimMesh.prototype.parseAnimations = function() {
    var a = this.geometry;
    if (!a.animations) a.animations = {};
    for (var b, c = a.animations, d = /([a-z]+)(\d+)/, f = 0, g = a.morphTargets.length; f < g; f++) {
        var e = a.morphTargets[f].name.match(d);
        if (e && 1 < e.length) {
            e = e[1];
            c[e] || (c[e] = {
                start: Infinity,
                end: -Infinity
            });
            var h = c[e];
            if (f < h.start) h.start = f;
            if (f > h.end) h.end = f;
            b || (b = e)
        }
    }
    a.firstAnimation = b
};
THREE.MorphAnimMesh.prototype.setAnimationLabel = function(a, b, c) {
    if (!this.geometry.animations) this.geometry.animations = {};
    this.geometry.animations[a] = {
        start: b,
        end: c
    }
};
THREE.MorphAnimMesh.prototype.playAnimation = function(a, b) {
    var c = this.geometry.animations[a];
    c ? (this.setFrameRange(c.start, c.end), this.duration = 1E3 * ((c.end - c.start) / b), this.time = 0) : console.warn("animation[" + a + "] undefined")
};
THREE.MorphAnimMesh.prototype.updateAnimation = function(a) {
    var b = this.duration / this.length;
    this.time += this.direction * a;
    if (this.mirroredLoop) {
        if (this.time > this.duration || 0 > this.time) {
            this.direction *= -1;
            if (this.time > this.duration) this.time = this.duration, this.directionBackwards = !0;
            if (0 > this.time) this.time = 0, this.directionBackwards = !1
        }
    } else this.time %= this.duration, 0 > this.time && (this.time += this.duration);
    a = this.startKeyframe + THREE.Math.clamp(Math.floor(this.time / b), 0, this.length - 1);
    if (a !== this.currentKeyframe) this.morphTargetInfluences[this.lastKeyframe] =
        0, this.morphTargetInfluences[this.currentKeyframe] = 1, this.morphTargetInfluences[a] = 0, this.lastKeyframe = this.currentKeyframe, this.currentKeyframe = a;
    b = this.time % b / b;
    this.directionBackwards && (b = 1 - b);
    this.morphTargetInfluences[this.currentKeyframe] = b;
    this.morphTargetInfluences[this.lastKeyframe] = 1 - b
};
THREE.Ribbon = function(a, b) {
    THREE.Object3D.call(this);
    this.geometry = a;
    this.material = b
};
THREE.Ribbon.prototype = new THREE.Object3D;
THREE.Ribbon.prototype.constructor = THREE.Ribbon;
THREE.LOD = function() {
    THREE.Object3D.call(this);
    this.LODs = []
};
THREE.LOD.prototype = new THREE.Object3D;
THREE.LOD.prototype.constructor = THREE.LOD;
THREE.LOD.prototype.supr = THREE.Object3D.prototype;
THREE.LOD.prototype.addLevel = function(a, b) {
    void 0 === b && (b = 0);
    for (var b = Math.abs(b), c = 0; c < this.LODs.length && !(b < this.LODs[c].visibleAtDistance); c++);
    this.LODs.splice(c, 0, {
        visibleAtDistance: b,
        object3D: a
    });
    this.add(a)
};
THREE.LOD.prototype.update = function(a) {
    if (1 < this.LODs.length) {
        a.matrixWorldInverse.getInverse(a.matrixWorld);
        a = a.matrixWorldInverse;
        a = -(a.n31 * this.matrixWorld.n14 + a.n32 * this.matrixWorld.n24 + a.n33 * this.matrixWorld.n34 + a.n34);
        this.LODs[0].object3D.visible = !0;
        for (var b = 1; b < this.LODs.length; b++)
            if (a >= this.LODs[b].visibleAtDistance) this.LODs[b - 1].object3D.visible = !1, this.LODs[b].object3D.visible = !0;
            else break;
        for (; b < this.LODs.length; b++) this.LODs[b].object3D.visible = !1
    }
};
THREE.Sprite = function(a) {
    THREE.Object3D.call(this);
    this.color = void 0 !== a.color ? new THREE.Color(a.color) : new THREE.Color(16777215);
    this.map = void 0 !== a.map ? a.map : new THREE.Texture;
    this.blending = void 0 !== a.blending ? a.blending : THREE.NormalBlending;
    this.useScreenCoordinates = void 0 !== a.useScreenCoordinates ? a.useScreenCoordinates : !0;
    this.mergeWith3D = void 0 !== a.mergeWith3D ? a.mergeWith3D : !this.useScreenCoordinates;
    this.affectedByDistance = void 0 !== a.affectedByDistance ? a.affectedByDistance : !this.useScreenCoordinates;
    this.scaleByViewport = void 0 !== a.scaleByViewport ? a.scaleByViewport : !this.affectedByDistance;
    this.alignment = a.alignment instanceof THREE.Vector2 ? a.alignment : THREE.SpriteAlignment.center;
    this.rotation3d = this.rotation;
    this.rotation = 0;
    this.opacity = 1;
    this.uvOffset = new THREE.Vector2(0, 0);
    this.uvScale = new THREE.Vector2(1, 1)
};
THREE.Sprite.prototype = new THREE.Object3D;
THREE.Sprite.prototype.constructor = THREE.Sprite;
THREE.Sprite.prototype.updateMatrix = function() {
    this.matrix.setPosition(this.position);
    this.rotation3d.set(0, 0, this.rotation);
    this.matrix.setRotationFromEuler(this.rotation3d);
    if (1 !== this.scale.x || 1 !== this.scale.y) this.matrix.scale(this.scale), this.boundRadiusScale = Math.max(this.scale.x, this.scale.y);
    this.matrixWorldNeedsUpdate = !0
};
THREE.SpriteAlignment = {};
THREE.SpriteAlignment.topLeft = new THREE.Vector2(1, -1);
THREE.SpriteAlignment.topCenter = new THREE.Vector2(0, -1);
THREE.SpriteAlignment.topRight = new THREE.Vector2(-1, -1);
THREE.SpriteAlignment.centerLeft = new THREE.Vector2(1, 0);
THREE.SpriteAlignment.center = new THREE.Vector2(0, 0);
THREE.SpriteAlignment.centerRight = new THREE.Vector2(-1, 0);
THREE.SpriteAlignment.bottomLeft = new THREE.Vector2(1, 1);
THREE.SpriteAlignment.bottomCenter = new THREE.Vector2(0, 1);
THREE.SpriteAlignment.bottomRight = new THREE.Vector2(-1, 1);
THREE.Scene = function() {
    THREE.Object3D.call(this);
    this.overrideMaterial = this.fog = null;
    this.matrixAutoUpdate = !1;
    this.__objects = [];
    this.__lights = [];
    this.__objectsAdded = [];
    this.__objectsRemoved = []
};
THREE.Scene.prototype = new THREE.Object3D;
THREE.Scene.prototype.constructor = THREE.Scene;
THREE.Scene.prototype.__addObject = function(a) {
    if (a instanceof THREE.Light) - 1 === this.__lights.indexOf(a) && this.__lights.push(a);
    else if (!(a instanceof THREE.Camera || a instanceof THREE.Bone) && -1 === this.__objects.indexOf(a)) {
        this.__objects.push(a);
        this.__objectsAdded.push(a);
        var b = this.__objectsRemoved.indexOf(a); - 1 !== b && this.__objectsRemoved.splice(b, 1)
    }
    for (b = 0; b < a.children.length; b++) this.__addObject(a.children[b])
};
THREE.Scene.prototype.__removeObject = function(a) {
    if (a instanceof THREE.Light) {
        var b = this.__lights.indexOf(a); - 1 !== b && this.__lights.splice(b, 1)
    } else a instanceof THREE.Camera || (b = this.__objects.indexOf(a), -1 !== b && (this.__objects.splice(b, 1), this.__objectsRemoved.push(a), b = this.__objectsAdded.indexOf(a), -1 !== b && this.__objectsAdded.splice(b, 1)));
    for (b = 0; b < a.children.length; b++) this.__removeObject(a.children[b])
};
THREE.Fog = function(a, b, c) {
    this.color = new THREE.Color(a);
    this.near = void 0 !== b ? b : 1;
    this.far = void 0 !== c ? c : 1E3
};
THREE.FogExp2 = function(a, b) {
    this.color = new THREE.Color(a);
    this.density = void 0 !== b ? b : 2.5E-4
};
THREE.DOMRenderer = function() {
    var a, b, c = new THREE.Projector,
        d, f, g, e;
    this.domElement = document.createElement("div");
    this.setSize = function(a, b) {
        d = a;
        f = b;
        g = d / 2;
        e = f / 2
    };
    this.render = function(d, f) {
        var j, k, q, m, o;
        a = c.projectScene(d, f);
        b = a.elements;
        for (j = 0, k = b.length; j < k; j++)
            if (q = b[j], q instanceof THREE.RenderableParticle && (m = q.x * g + g, o = q.y * e + e, q = q.material, q instanceof THREE.ParticleDOMMaterial)) q = q.domElement, q.style.left = m + "px", q.style.top = o + "px"
    }
};
THREE.CanvasRenderer = function(a) {
    function b(a) {
        if (t != a) n.globalAlpha = t = a
    }

    function c(a) {
        if (w != a) {
            switch (a) {
                case THREE.NormalBlending:
                    n.globalCompositeOperation = "source-over";
                    break;
                case THREE.AdditiveBlending:
                    n.globalCompositeOperation = "lighter";
                    break;
                case THREE.SubtractiveBlending:
                    n.globalCompositeOperation = "darker"
            }
            w = a
        }
    }

    function d(a) {
        if (u != a) n.strokeStyle = u = a
    }

    function f(a) {
        if (v != a) n.fillStyle = v = a
    }
    var a = a || {}, g = this,
        e, h, i, j = new THREE.Projector,
        k = void 0 !== a.canvas ? a.canvas : document.createElement("canvas"),
        q, m, o, p, n = k.getContext("2d"),
        r = new THREE.Color(0),
        s = 0,
        t = 1,
        w = 0,
        u = null,
        v = null,
        A = null,
        F = null,
        B = null,
        D, H, I, Q, P = new THREE.RenderableVertex,
        L = new THREE.RenderableVertex,
        K, O, y, l, $, C, E, S, R, ca, ka, ia, N = new THREE.Color,
        aa = new THREE.Color,
        U = new THREE.Color,
        ba = new THREE.Color,
        ea = new THREE.Color,
        Ta = [],
        Ja = [],
        Ka, Ga, qa, ha, ib, db, lb, cb, Za, Sa, La = new THREE.Rectangle,
        sa = new THREE.Rectangle,
        za = new THREE.Rectangle,
        Ea = !1,
        Fa = new THREE.Color,
        Wa = new THREE.Color,
        mb = new THREE.Color,
        Z = new THREE.Vector3,
        T, Fb, Uc, eb, pc, Cc, a = 16;
    T =
        document.createElement("canvas");
    T.width = T.height = 2;
    Fb = T.getContext("2d");
    Fb.fillStyle = "rgba(0,0,0,1)";
    Fb.fillRect(0, 0, 2, 2);
    Uc = Fb.getImageData(0, 0, 2, 2);
    eb = Uc.data;
    pc = document.createElement("canvas");
    pc.width = pc.height = a;
    Cc = pc.getContext("2d");
    Cc.translate(-a / 2, -a / 2);
    Cc.scale(a, a);
    a--;
    this.domElement = k;
    this.sortElements = this.sortObjects = this.autoClear = !0;
    this.info = {
        render: {
            vertices: 0,
            faces: 0
        }
    };
    this.setSize = function(a, b) {
        q = a;
        m = b;
        o = Math.floor(q / 2);
        p = Math.floor(m / 2);
        k.width = q;
        k.height = m;
        La.set(-o, -p,
            o, p);
        sa.set(-o, -p, o, p);
        t = 1;
        w = 0;
        B = F = A = v = u = null
    };
    this.setClearColor = function(a, b) {
        r.copy(a);
        s = b;
        sa.set(-o, -p, o, p)
    };
    this.setClearColorHex = function(a, b) {
        r.setHex(a);
        s = b;
        sa.set(-o, -p, o, p)
    };
    this.clear = function() {
        n.setTransform(1, 0, 0, -1, o, p);
        sa.isEmpty() || (sa.minSelf(La), sa.inflate(2), 1 > s && n.clearRect(Math.floor(sa.getX()), Math.floor(sa.getY()), Math.floor(sa.getWidth()), Math.floor(sa.getHeight())), 0 < s && (c(THREE.NormalBlending), b(1), f("rgba(" + Math.floor(255 * r.r) + "," + Math.floor(255 * r.g) + "," + Math.floor(255 *
            r.b) + "," + s + ")"), n.fillRect(Math.floor(sa.getX()), Math.floor(sa.getY()), Math.floor(sa.getWidth()), Math.floor(sa.getHeight()))), sa.empty())
    };
    this.render = function(a, k) {
        function m(a) {
            var b, c, d, f;
            Fa.setRGB(0, 0, 0);
            Wa.setRGB(0, 0, 0);
            mb.setRGB(0, 0, 0);
            for (b = 0, c = a.length; b < c; b++) d = a[b], f = d.color, d instanceof THREE.AmbientLight ? (Fa.r += f.r, Fa.g += f.g, Fa.b += f.b) : d instanceof THREE.DirectionalLight ? (Wa.r += f.r, Wa.g += f.g, Wa.b += f.b) : d instanceof THREE.PointLight && (mb.r += f.r, mb.g += f.g, mb.b += f.b)
        }

        function q(a, b, c, d) {
            var f,
                g, e, h, l, i;
            for (f = 0, g = a.length; f < g; f++) e = a[f], h = e.color, e instanceof THREE.DirectionalLight ? (l = e.matrixWorld.getPosition(), i = c.dot(l), 0 >= i || (i *= e.intensity, d.r += h.r * i, d.g += h.g * i, d.b += h.b * i)) : e instanceof THREE.PointLight && (l = e.matrixWorld.getPosition(), i = c.dot(Z.sub(l, b).normalize()), 0 >= i || (i *= 0 == e.distance ? 1 : 1 - Math.min(b.distanceTo(l) / e.distance, 1), 0 != i && (i *= e.intensity, d.r += h.r * i, d.g += h.g * i, d.b += h.b * i)))
        }

        function r(a, g, e) {
            b(e.opacity);
            c(e.blending);
            var Z, h, l, i, k, j;
            if (e instanceof THREE.ParticleBasicMaterial) {
                if (e.map) i =
                    e.map.image, k = i.width >> 1, j = i.height >> 1, e = g.scale.x * o, l = g.scale.y * p, Z = e * k, h = l * j, za.set(a.x - Z, a.y - h, a.x + Z, a.y + h), La.intersects(za) && (n.save(), n.translate(a.x, a.y), n.rotate(-g.rotation), n.scale(e, -l), n.translate(-k, -j), n.drawImage(i, 0, 0), n.restore())
            } else e instanceof THREE.ParticleCanvasMaterial && (Z = g.scale.x * o, h = g.scale.y * p, za.set(a.x - Z, a.y - h, a.x + Z, a.y + h), La.intersects(za) && (d(e.color.getContextStyle()), f(e.color.getContextStyle()), n.save(), n.translate(a.x, a.y), n.rotate(-g.rotation), n.scale(Z, h), e.program(n),
                n.restore()))
        }

        function s(a, f, g, e) {
            b(e.opacity);
            c(e.blending);
            n.beginPath();
            n.moveTo(a.positionScreen.x, a.positionScreen.y);
            n.lineTo(f.positionScreen.x, f.positionScreen.y);
            n.closePath();
            if (e instanceof THREE.LineBasicMaterial) {
                a = e.linewidth;
                if (A != a) n.lineWidth = A = a;
                a = e.linecap;
                if (F != a) n.lineCap = F = a;
                a = e.linejoin;
                if (B != a) n.lineJoin = B = a;
                d(e.color.getContextStyle());
                n.stroke();
                za.inflate(2 * e.linewidth)
            }
        }

        function t(a, d, f, e, h, j, n, T) {
            g.info.render.vertices += 3;
            g.info.render.faces++;
            b(T.opacity);
            c(T.blending);
            K = a.positionScreen.x;
            O = a.positionScreen.y;
            y = d.positionScreen.x;
            l = d.positionScreen.y;
            $ = f.positionScreen.x;
            C = f.positionScreen.y;
            v(K, O, y, l, $, C);
            if (T instanceof THREE.MeshBasicMaterial)
                if (T.map) T.map.mapping instanceof THREE.UVMapping && (ha = n.uvs[0], Vc(K, O, y, l, $, C, ha[e].u, ha[e].v, ha[h].u, ha[h].v, ha[j].u, ha[j].v, T.map));
                else if (T.envMap) {
                if (T.envMap.mapping instanceof THREE.SphericalReflectionMapping) a = k.matrixWorldInverse, Z.copy(n.vertexNormalsWorld[e]), ib = 0.5 * (Z.x * a.n11 + Z.y * a.n12 + Z.z * a.n13) + 0.5, db = 0.5 * -(Z.x * a.n21 + Z.y * a.n22 + Z.z * a.n23) + 0.5, Z.copy(n.vertexNormalsWorld[h]), lb = 0.5 * (Z.x * a.n11 + Z.y * a.n12 + Z.z * a.n13) + 0.5, cb = 0.5 * -(Z.x * a.n21 + Z.y * a.n22 + Z.z * a.n23) + 0.5, Z.copy(n.vertexNormalsWorld[j]), Za = 0.5 * (Z.x * a.n11 + Z.y * a.n12 + Z.z * a.n13) + 0.5, Sa = 0.5 * -(Z.x * a.n21 + Z.y * a.n22 + Z.z * a.n23) + 0.5, Vc(K, O, y, l, $, C, ib, db, lb, cb, Za, Sa, T.envMap)
            } else T.wireframe ? Mb(T.color, T.wireframeLinewidth, T.wireframeLinecap, T.wireframeLinejoin) : Gb(T.color);
            else if (T instanceof THREE.MeshLambertMaterial) T.map && !T.wireframe && (T.map.mapping instanceof THREE.UVMapping && (ha = n.uvs[0], Vc(K, O, y, l, $, C, ha[e].u, ha[e].v, ha[h].u, ha[h].v, ha[j].u, ha[j].v, T.map)), c(THREE.SubtractiveBlending)), Ea ? !T.wireframe && T.shading == THREE.SmoothShading && 3 == n.vertexNormalsWorld.length ? (aa.r = U.r = ba.r = Fa.r, aa.g = U.g = ba.g = Fa.g, aa.b = U.b = ba.b = Fa.b, q(i, n.v1.positionWorld, n.vertexNormalsWorld[0], aa), q(i, n.v2.positionWorld, n.vertexNormalsWorld[1], U), q(i, n.v3.positionWorld, n.vertexNormalsWorld[2], ba), aa.r = Math.max(0, Math.min(T.color.r * aa.r, 1)), aa.g = Math.max(0, Math.min(T.color.g * aa.g,
                1)), aa.b = Math.max(0, Math.min(T.color.b * aa.b, 1)), U.r = Math.max(0, Math.min(T.color.r * U.r, 1)), U.g = Math.max(0, Math.min(T.color.g * U.g, 1)), U.b = Math.max(0, Math.min(T.color.b * U.b, 1)), ba.r = Math.max(0, Math.min(T.color.r * ba.r, 1)), ba.g = Math.max(0, Math.min(T.color.g * ba.g, 1)), ba.b = Math.max(0, Math.min(T.color.b * ba.b, 1)), ea.r = 0.5 * (U.r + ba.r), ea.g = 0.5 * (U.g + ba.g), ea.b = 0.5 * (U.b + ba.b), qa = Dc(aa, U, ba, ea), gc(K, O, y, l, $, C, 0, 0, 1, 0, 0, 1, qa)) : (N.r = Fa.r, N.g = Fa.g, N.b = Fa.b, q(i, n.centroidWorld, n.normalWorld, N), N.r = Math.max(0, Math.min(T.color.r *
                N.r, 1)), N.g = Math.max(0, Math.min(T.color.g * N.g, 1)), N.b = Math.max(0, Math.min(T.color.b * N.b, 1)), T.wireframe ? Mb(N, T.wireframeLinewidth, T.wireframeLinecap, T.wireframeLinejoin) : Gb(N)) : T.wireframe ? Mb(T.color, T.wireframeLinewidth, T.wireframeLinecap, T.wireframeLinejoin) : Gb(T.color);
            else if (T instanceof THREE.MeshDepthMaterial) Ka = k.near, Ga = k.far, aa.r = aa.g = aa.b = 1 - ac(a.positionScreen.z, Ka, Ga), U.r = U.g = U.b = 1 - ac(d.positionScreen.z, Ka, Ga), ba.r = ba.g = ba.b = 1 - ac(f.positionScreen.z, Ka, Ga), ea.r = 0.5 * (U.r + ba.r), ea.g = 0.5 *
                (U.g + ba.g), ea.b = 0.5 * (U.b + ba.b), qa = Dc(aa, U, ba, ea), gc(K, O, y, l, $, C, 0, 0, 1, 0, 0, 1, qa);
            else if (T instanceof THREE.MeshNormalMaterial) N.r = hc(n.normalWorld.x), N.g = hc(n.normalWorld.y), N.b = hc(n.normalWorld.z), T.wireframe ? Mb(N, T.wireframeLinewidth, T.wireframeLinecap, T.wireframeLinejoin) : Gb(N)
        }

        function u(a, d, f, e, Z, h, T, j, n) {
            g.info.render.vertices += 4;
            g.info.render.faces++;
            b(j.opacity);
            c(j.blending);
            if (j.map || j.envMap) t(a, d, e, 0, 1, 3, T, j, n), t(Z, f, h, 1, 2, 3, T, j, n);
            else if (K = a.positionScreen.x, O = a.positionScreen.y, y = d.positionScreen.x,
                l = d.positionScreen.y, $ = f.positionScreen.x, C = f.positionScreen.y, E = e.positionScreen.x, S = e.positionScreen.y, R = Z.positionScreen.x, ca = Z.positionScreen.y, ka = h.positionScreen.x, ia = h.positionScreen.y, j instanceof THREE.MeshBasicMaterial) w(K, O, y, l, $, C, E, S), j.wireframe ? Mb(j.color, j.wireframeLinewidth, j.wireframeLinecap, j.wireframeLinejoin) : Gb(j.color);
            else if (j instanceof THREE.MeshLambertMaterial) Ea ? !j.wireframe && j.shading == THREE.SmoothShading && 4 == T.vertexNormalsWorld.length ? (aa.r = U.r = ba.r = ea.r = Fa.r, aa.g =
                U.g = ba.g = ea.g = Fa.g, aa.b = U.b = ba.b = ea.b = Fa.b, q(i, T.v1.positionWorld, T.vertexNormalsWorld[0], aa), q(i, T.v2.positionWorld, T.vertexNormalsWorld[1], U), q(i, T.v4.positionWorld, T.vertexNormalsWorld[3], ba), q(i, T.v3.positionWorld, T.vertexNormalsWorld[2], ea), aa.r = Math.max(0, Math.min(j.color.r * aa.r, 1)), aa.g = Math.max(0, Math.min(j.color.g * aa.g, 1)), aa.b = Math.max(0, Math.min(j.color.b * aa.b, 1)), U.r = Math.max(0, Math.min(j.color.r * U.r, 1)), U.g = Math.max(0, Math.min(j.color.g * U.g, 1)), U.b = Math.max(0, Math.min(j.color.b * U.b, 1)),
                ba.r = Math.max(0, Math.min(j.color.r * ba.r, 1)), ba.g = Math.max(0, Math.min(j.color.g * ba.g, 1)), ba.b = Math.max(0, Math.min(j.color.b * ba.b, 1)), ea.r = Math.max(0, Math.min(j.color.r * ea.r, 1)), ea.g = Math.max(0, Math.min(j.color.g * ea.g, 1)), ea.b = Math.max(0, Math.min(j.color.b * ea.b, 1)), qa = Dc(aa, U, ba, ea), v(K, O, y, l, E, S), gc(K, O, y, l, E, S, 0, 0, 1, 0, 0, 1, qa), v(R, ca, $, C, ka, ia), gc(R, ca, $, C, ka, ia, 1, 0, 1, 1, 0, 1, qa)) : (N.r = Fa.r, N.g = Fa.g, N.b = Fa.b, q(i, T.centroidWorld, T.normalWorld, N), N.r = Math.max(0, Math.min(j.color.r * N.r, 1)), N.g = Math.max(0,
                Math.min(j.color.g * N.g, 1)), N.b = Math.max(0, Math.min(j.color.b * N.b, 1)), w(K, O, y, l, $, C, E, S), j.wireframe ? Mb(N, j.wireframeLinewidth, j.wireframeLinecap, j.wireframeLinejoin) : Gb(N)) : (w(K, O, y, l, $, C, E, S), j.wireframe ? Mb(j.color, j.wireframeLinewidth, j.wireframeLinecap, j.wireframeLinejoin) : Gb(j.color));
            else if (j instanceof THREE.MeshNormalMaterial) N.r = hc(T.normalWorld.x), N.g = hc(T.normalWorld.y), N.b = hc(T.normalWorld.z), w(K, O, y, l, $, C, E, S), j.wireframe ? Mb(N, j.wireframeLinewidth, j.wireframeLinecap, j.wireframeLinejoin) :
                Gb(N);
            else if (j instanceof THREE.MeshDepthMaterial) Ka = k.near, Ga = k.far, aa.r = aa.g = aa.b = 1 - ac(a.positionScreen.z, Ka, Ga), U.r = U.g = U.b = 1 - ac(d.positionScreen.z, Ka, Ga), ba.r = ba.g = ba.b = 1 - ac(e.positionScreen.z, Ka, Ga), ea.r = ea.g = ea.b = 1 - ac(f.positionScreen.z, Ka, Ga), qa = Dc(aa, U, ba, ea), v(K, O, y, l, E, S), gc(K, O, y, l, E, S, 0, 0, 1, 0, 0, 1, qa), v(R, ca, $, C, ka, ia), gc(R, ca, $, C, ka, ia, 1, 0, 1, 1, 0, 1, qa)
        }

        function v(a, b, c, d, f, e) {
            n.beginPath();
            n.moveTo(a, b);
            n.lineTo(c, d);
            n.lineTo(f, e);
            n.lineTo(a, b);
            n.closePath()
        }

        function w(a, b, c, d, f, e, g, Z) {
            n.beginPath();
            n.moveTo(a, b);
            n.lineTo(c, d);
            n.lineTo(f, e);
            n.lineTo(g, Z);
            n.lineTo(a, b);
            n.closePath()
        }

        function Mb(a, b, c, f) {
            if (A != b) n.lineWidth = A = b;
            if (F != c) n.lineCap = F = c;
            if (B != f) n.lineJoin = B = f;
            d(a.getContextStyle());
            n.stroke();
            za.inflate(2 * b)
        }

        function Gb(a) {
            f(a.getContextStyle());
            n.fill()
        }

        function Vc(a, b, c, d, e, g, Z, h, l, i, j, T, k) {
            if (0 != k.image.width) {
                if (!0 == k.needsUpdate || void 0 == Ta[k.id]) {
                    var m = k.wrapS == THREE.RepeatWrapping,
                        o = k.wrapT == THREE.RepeatWrapping;
                    Ta[k.id] = n.createPattern(k.image, m && o ? "repeat" : m && !o ? "repeat-x" : !m && o ? "repeat-y" : "no-repeat");
                    k.needsUpdate = !1
                }
                f(Ta[k.id]);
                var m = k.offset.x / k.repeat.x,
                    o = k.offset.y / k.repeat.y,
                    p = k.image.width * k.repeat.x,
                    Fb = k.image.height * k.repeat.y,
                    Z = (Z + m) * p,
                    h = (h + o) * Fb,
                    c = c - a,
                    d = d - b,
                    e = e - a,
                    g = g - b,
                    l = (l + m) * p - Z,
                    i = (i + o) * Fb - h,
                    j = (j + m) * p - Z,
                    T = (T + o) * Fb - h,
                    m = l * T - j * i;
                if (0 == m) {
                    if (void 0 === Ja[k.id]) b = document.createElement("canvas"), b.width = k.image.width, b.height = k.image.height, b = b.getContext("2d"), b.drawImage(k.image, 0, 0), Ja[k.id] = b.getImageData(0, 0, k.image.width, k.image.height).data;
                    b = Ja[k.id];
                    Z = 4 * (Math.floor(Z) + Math.floor(h) * k.image.width);
                    N.setRGB(b[Z] / 255, b[Z + 1] / 255, b[Z + 2] / 255);
                    Gb(N)
                } else m = 1 / m, k = (T * c - i * e) * m, i = (T * d - i * g) * m, c = (l * e - j * c) * m, d = (l * g - j * d) * m, a = a - k * Z - c * h, Z = b - i * Z - d * h, n.save(), n.transform(k, i, c, d, a, Z), n.fill(), n.restore()
            }
        }

        function gc(a, b, c, d, f, e, g, Z, h, l, i, j, T) {
            var k, m;
            k = T.width - 1;
            m = T.height - 1;
            g *= k;
            Z *= m;
            c -= a;
            d -= b;
            f -= a;
            e -= b;
            h = h * k - g;
            l = l * m - Z;
            i = i * k - g;
            j = j * m - Z;
            m = 1 / (h * j - i * l);
            k = (j * c - l * f) * m;
            l = (j * d - l * e) * m;
            c = (h * f - i * c) * m;
            d = (h * e - i * d) * m;
            a = a - k * g - c * Z;
            b = b - l * g - d * Z;
            n.save();
            n.transform(k, l, c, d, a,
                b);
            n.clip();
            n.drawImage(T, 0, 0);
            n.restore()
        }

        function Dc(a, b, c, d) {
            var f = ~~ (255 * a.r),
                e = ~~ (255 * a.g),
                a = ~~ (255 * a.b),
                g = ~~ (255 * b.r),
                Z = ~~ (255 * b.g),
                b = ~~ (255 * b.b),
                h = ~~ (255 * c.r),
                l = ~~ (255 * c.g),
                c = ~~ (255 * c.b),
                i = ~~ (255 * d.r),
                j = ~~ (255 * d.g),
                d = ~~ (255 * d.b);
            eb[0] = 0 > f ? 0 : 255 < f ? 255 : f;
            eb[1] = 0 > e ? 0 : 255 < e ? 255 : e;
            eb[2] = 0 > a ? 0 : 255 < a ? 255 : a;
            eb[4] = 0 > g ? 0 : 255 < g ? 255 : g;
            eb[5] = 0 > Z ? 0 : 255 < Z ? 255 : Z;
            eb[6] = 0 > b ? 0 : 255 < b ? 255 : b;
            eb[8] = 0 > h ? 0 : 255 < h ? 255 : h;
            eb[9] = 0 > l ? 0 : 255 < l ? 255 : l;
            eb[10] = 0 > c ? 0 : 255 < c ? 255 : c;
            eb[12] = 0 > i ? 0 : 255 < i ? 255 : i;
            eb[13] = 0 > j ? 0 : 255 < j ? 255 :
                j;
            eb[14] = 0 > d ? 0 : 255 < d ? 255 : d;
            Fb.putImageData(Uc, 0, 0);
            Cc.drawImage(T, 0, 0);
            return pc
        }

        function ac(a, b, c) {
            a = (a - b) / (c - b);
            return a * a * (3 - 2 * a)
        }

        function hc(a) {
            a = 0.5 * (a + 1);
            return 0 > a ? 0 : 1 < a ? 1 : a
        }

        function Nb(a, b) {
            var c = b.x - a.x,
                d = b.y - a.y,
                f = c * c + d * d;
            0 != f && (f = 1 / Math.sqrt(f), c *= f, d *= f, b.x += c, b.y += d, a.x -= c, a.y -= d)
        }
        var Ec, fd, Pa, jb;
        this.autoClear ? this.clear() : n.setTransform(1, 0, 0, -1, o, p);
        g.info.render.vertices = 0;
        g.info.render.faces = 0;
        e = j.projectScene(a, k, this.sortElements);
        h = e.elements;
        i = e.lights;
        (Ea = 0 < i.length) && m(i);
        for (Ec = 0, fd = h.length; Ec < fd; Ec++)
            if (Pa = h[Ec], jb = Pa.material, jb = jb instanceof THREE.MeshFaceMaterial ? Pa.faceMaterial : jb, !(null == jb || 0 == jb.opacity)) {
                za.empty();
                if (Pa instanceof THREE.RenderableParticle) D = Pa, D.x *= o, D.y *= p, r(D, Pa, jb, a);
                else if (Pa instanceof THREE.RenderableLine) D = Pa.v1, H = Pa.v2, D.positionScreen.x *= o, D.positionScreen.y *= p, H.positionScreen.x *= o, H.positionScreen.y *= p, za.addPoint(D.positionScreen.x, D.positionScreen.y), za.addPoint(H.positionScreen.x, H.positionScreen.y), La.intersects(za) && s(D,
                    H, Pa, jb, a);
                else if (Pa instanceof THREE.RenderableFace3) D = Pa.v1, H = Pa.v2, I = Pa.v3, D.positionScreen.x *= o, D.positionScreen.y *= p, H.positionScreen.x *= o, H.positionScreen.y *= p, I.positionScreen.x *= o, I.positionScreen.y *= p, jb.overdraw && (Nb(D.positionScreen, H.positionScreen), Nb(H.positionScreen, I.positionScreen), Nb(I.positionScreen, D.positionScreen)), za.add3Points(D.positionScreen.x, D.positionScreen.y, H.positionScreen.x, H.positionScreen.y, I.positionScreen.x, I.positionScreen.y), La.intersects(za) && t(D, H, I, 0, 1, 2,
                    Pa, jb, a);
                else if (Pa instanceof THREE.RenderableFace4) D = Pa.v1, H = Pa.v2, I = Pa.v3, Q = Pa.v4, D.positionScreen.x *= o, D.positionScreen.y *= p, H.positionScreen.x *= o, H.positionScreen.y *= p, I.positionScreen.x *= o, I.positionScreen.y *= p, Q.positionScreen.x *= o, Q.positionScreen.y *= p, P.positionScreen.copy(H.positionScreen), L.positionScreen.copy(Q.positionScreen), jb.overdraw && (Nb(D.positionScreen, H.positionScreen), Nb(H.positionScreen, Q.positionScreen), Nb(Q.positionScreen, D.positionScreen), Nb(I.positionScreen, P.positionScreen),
                    Nb(I.positionScreen, L.positionScreen)), za.addPoint(D.positionScreen.x, D.positionScreen.y), za.addPoint(H.positionScreen.x, H.positionScreen.y), za.addPoint(I.positionScreen.x, I.positionScreen.y), za.addPoint(Q.positionScreen.x, Q.positionScreen.y), La.intersects(za) && u(D, H, I, Q, P, L, Pa, jb, a);
                sa.addRectangle(za)
            }
        n.setTransform(1, 0, 0, 1, 0, 0)
    }
};
THREE.SVGRenderer = function() {
    function a(a, b, c, d) {
        var f, e, g, h, i, j;
        for (f = 0, e = a.length; f < e; f++) g = a[f], h = g.color, g instanceof THREE.DirectionalLight ? (i = g.matrixWorld.getPosition(), j = c.dot(i), 0 >= j || (j *= g.intensity, d.r += h.r * j, d.g += h.g * j, d.b += h.b * j)) : g instanceof THREE.PointLight && (i = g.matrixWorld.getPosition(), j = c.dot(D.sub(i, b).normalize()), 0 >= j || (j *= 0 == g.distance ? 1 : 1 - Math.min(b.distanceTo(i) / g.distance, 1), 0 != j && (j *= g.intensity, d.r += h.r * j, d.g += h.g * j, d.b += h.b * j)))
    }

    function b(a) {
        null == H[a] && (H[a] = document.createElementNS("http://www.w3.org/2000/svg",
            "path"), 0 == K && H[a].setAttribute("shape-rendering", "crispEdges"));
        return H[a]
    }

    function c(a) {
        a = 0.5 * (a + 1);
        return 0 > a ? 0 : 1 < a ? 1 : a
    }
    var d = this,
        f, g, e, h = new THREE.Projector,
        i = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        j, k, q, m, o, p, n, r, s = new THREE.Rectangle,
        t = new THREE.Rectangle,
        w = !1,
        u = new THREE.Color,
        v = new THREE.Color,
        A = new THREE.Color,
        F = new THREE.Color,
        B, D = new THREE.Vector3,
        H = [],
        I = [],
        Q, P, L, K = 1;
    this.domElement = i;
    this.sortElements = this.sortObjects = this.autoClear = !0;
    this.info = {
        render: {
            vertices: 0,
            faces: 0
        }
    };
    this.setQuality = function(a) {
        switch (a) {
            case "high":
                K = 1;
                break;
            case "low":
                K = 0
        }
    };
    this.setSize = function(a, b) {
        j = a;
        k = b;
        q = j / 2;
        m = k / 2;
        i.setAttribute("viewBox", -q + " " + -m + " " + j + " " + k);
        i.setAttribute("width", j);
        i.setAttribute("height", k);
        s.set(-q, -m, q, m)
    };
    this.clear = function() {
        for (; 0 < i.childNodes.length;) i.removeChild(i.childNodes[0])
    };
    this.render = function(j, k) {
        var l, D, C, E;
        this.autoClear && this.clear();
        d.info.render.vertices = 0;
        d.info.render.faces = 0;
        f = h.projectScene(j, k, this.sortElements);
        g = f.elements;
        e = f.lights;
        L = P = 0;
        if (w = 0 < e.length) {
            v.setRGB(0, 0, 0);
            A.setRGB(0, 0, 0);
            F.setRGB(0, 0, 0);
            for (l = 0, D = e.length; l < D; l++) E = e[l], C = E.color, E instanceof THREE.AmbientLight ? (v.r += C.r, v.g += C.g, v.b += C.b) : E instanceof THREE.DirectionalLight ? (A.r += C.r, A.g += C.g, A.b += C.b) : E instanceof THREE.PointLight && (F.r += C.r, F.g += C.g, F.b += C.b)
        }
        for (l = 0, D = g.length; l < D; l++)
            if (C = g[l], E = C.material, E = E instanceof THREE.MeshFaceMaterial ? C.faceMaterial : E, !(null == E || 0 == E.opacity))
                if (t.empty(), C instanceof THREE.RenderableParticle) o = C, o.x *=
                    q, o.y *= -m;
                else if (C instanceof THREE.RenderableLine) {
            if (o = C.v1, p = C.v2, o.positionScreen.x *= q, o.positionScreen.y *= -m, p.positionScreen.x *= q, p.positionScreen.y *= -m, t.addPoint(o.positionScreen.x, o.positionScreen.y), t.addPoint(p.positionScreen.x, p.positionScreen.y), s.intersects(t)) {
                C = o;
                var S = p,
                    R = L++;
                null == I[R] && (I[R] = document.createElementNS("http://www.w3.org/2000/svg", "line"), 0 == K && I[R].setAttribute("shape-rendering", "crispEdges"));
                Q = I[R];
                Q.setAttribute("x1", C.positionScreen.x);
                Q.setAttribute("y1", C.positionScreen.y);
                Q.setAttribute("x2", S.positionScreen.x);
                Q.setAttribute("y2", S.positionScreen.y);
                E instanceof THREE.LineBasicMaterial && (Q.setAttribute("style", "fill: none; stroke: " + E.color.getContextStyle() + "; stroke-width: " + E.linewidth + "; stroke-opacity: " + E.opacity + "; stroke-linecap: " + E.linecap + "; stroke-linejoin: " + E.linejoin), i.appendChild(Q))
            }
        } else if (C instanceof THREE.RenderableFace3) {
            if (o = C.v1, p = C.v2, n = C.v3, o.positionScreen.x *= q, o.positionScreen.y *= -m, p.positionScreen.x *= q, p.positionScreen.y *= -m, n.positionScreen.x *=
                q, n.positionScreen.y *= -m, t.addPoint(o.positionScreen.x, o.positionScreen.y), t.addPoint(p.positionScreen.x, p.positionScreen.y), t.addPoint(n.positionScreen.x, n.positionScreen.y), s.intersects(t)) {
                var S = o,
                    R = p,
                    H = n;
                d.info.render.vertices += 3;
                d.info.render.faces++;
                Q = b(P++);
                Q.setAttribute("d", "M " + S.positionScreen.x + " " + S.positionScreen.y + " L " + R.positionScreen.x + " " + R.positionScreen.y + " L " + H.positionScreen.x + "," + H.positionScreen.y + "z");
                E instanceof THREE.MeshBasicMaterial ? u.copy(E.color) : E instanceof THREE.MeshLambertMaterial ?
                    w ? (u.r = v.r, u.g = v.g, u.b = v.b, a(e, C.centroidWorld, C.normalWorld, u), u.r = Math.max(0, Math.min(E.color.r * u.r, 1)), u.g = Math.max(0, Math.min(E.color.g * u.g, 1)), u.b = Math.max(0, Math.min(E.color.b * u.b, 1))) : u.copy(E.color) : E instanceof THREE.MeshDepthMaterial ? (B = 1 - E.__2near / (E.__farPlusNear - C.z * E.__farMinusNear), u.setRGB(B, B, B)) : E instanceof THREE.MeshNormalMaterial && u.setRGB(c(C.normalWorld.x), c(C.normalWorld.y), c(C.normalWorld.z));
                E.wireframe ? Q.setAttribute("style", "fill: none; stroke: " + u.getContextStyle() + "; stroke-width: " +
                    E.wireframeLinewidth + "; stroke-opacity: " + E.opacity + "; stroke-linecap: " + E.wireframeLinecap + "; stroke-linejoin: " + E.wireframeLinejoin) : Q.setAttribute("style", "fill: " + u.getContextStyle() + "; fill-opacity: " + E.opacity);
                i.appendChild(Q)
            }
        } else if (C instanceof THREE.RenderableFace4 && (o = C.v1, p = C.v2, n = C.v3, r = C.v4, o.positionScreen.x *= q, o.positionScreen.y *= -m, p.positionScreen.x *= q, p.positionScreen.y *= -m, n.positionScreen.x *= q, n.positionScreen.y *= -m, r.positionScreen.x *= q, r.positionScreen.y *= -m, t.addPoint(o.positionScreen.x,
            o.positionScreen.y), t.addPoint(p.positionScreen.x, p.positionScreen.y), t.addPoint(n.positionScreen.x, n.positionScreen.y), t.addPoint(r.positionScreen.x, r.positionScreen.y), s.intersects(t))) {
            var S = o,
                R = p,
                H = n,
                ka = r;
            d.info.render.vertices += 4;
            d.info.render.faces++;
            Q = b(P++);
            Q.setAttribute("d", "M " + S.positionScreen.x + " " + S.positionScreen.y + " L " + R.positionScreen.x + " " + R.positionScreen.y + " L " + H.positionScreen.x + "," + H.positionScreen.y + " L " + ka.positionScreen.x + "," + ka.positionScreen.y + "z");
            E instanceof THREE.MeshBasicMaterial ?
                u.copy(E.color) : E instanceof THREE.MeshLambertMaterial ? w ? (u.r = v.r, u.g = v.g, u.b = v.b, a(e, C.centroidWorld, C.normalWorld, u), u.r = Math.max(0, Math.min(E.color.r * u.r, 1)), u.g = Math.max(0, Math.min(E.color.g * u.g, 1)), u.b = Math.max(0, Math.min(E.color.b * u.b, 1))) : u.copy(E.color) : E instanceof THREE.MeshDepthMaterial ? (B = 1 - E.__2near / (E.__farPlusNear - C.z * E.__farMinusNear), u.setRGB(B, B, B)) : E instanceof THREE.MeshNormalMaterial && u.setRGB(c(C.normalWorld.x), c(C.normalWorld.y), c(C.normalWorld.z));
            E.wireframe ? Q.setAttribute("style",
                "fill: none; stroke: " + u.getContextStyle() + "; stroke-width: " + E.wireframeLinewidth + "; stroke-opacity: " + E.opacity + "; stroke-linecap: " + E.wireframeLinecap + "; stroke-linejoin: " + E.wireframeLinejoin) : Q.setAttribute("style", "fill: " + u.getContextStyle() + "; fill-opacity: " + E.opacity);
            i.appendChild(Q)
        }
    }
};
THREE.ShaderChunk = {
    fog_pars_fragment: "#ifdef USE_FOG\nuniform vec3 fogColor;\n#ifdef FOG_EXP2\nuniform float fogDensity;\n#else\nuniform float fogNear;\nuniform float fogFar;\n#endif\n#endif",
    fog_fragment: "#ifdef USE_FOG\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\n#ifdef FOG_EXP2\nconst float LOG2 = 1.442695;\nfloat fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\nfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n#else\nfloat fogFactor = smoothstep( fogNear, fogFar, depth );\n#endif\ngl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n#endif",
    envmap_pars_fragment: "#ifdef USE_ENVMAP\nvarying vec3 vReflect;\nuniform float reflectivity;\nuniform samplerCube envMap;\nuniform float flipEnvMap;\nuniform int combine;\n#endif",
    envmap_fragment: "#ifdef USE_ENVMAP\n#ifdef DOUBLE_SIDED\nfloat flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );\nvec4 cubeColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * vReflect.x, vReflect.yz ) );\n#else\nvec4 cubeColor = textureCube( envMap, vec3( flipEnvMap * vReflect.x, vReflect.yz ) );\n#endif\n#ifdef GAMMA_INPUT\ncubeColor.xyz *= cubeColor.xyz;\n#endif\nif ( combine == 1 ) {\ngl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, reflectivity );\n} else {\ngl_FragColor.xyz = gl_FragColor.xyz * cubeColor.xyz;\n}\n#endif",
    envmap_pars_vertex: "#ifdef USE_ENVMAP\nvarying vec3 vReflect;\nuniform float refractionRatio;\nuniform bool useRefract;\n#endif",
    envmap_vertex: "#ifdef USE_ENVMAP\nvec4 mPosition = objectMatrix * vec4( position, 1.0 );\nvec3 nWorld = mat3( objectMatrix[ 0 ].xyz, objectMatrix[ 1 ].xyz, objectMatrix[ 2 ].xyz ) * normal;\nif ( useRefract ) {\nvReflect = refract( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ), refractionRatio );\n} else {\nvReflect = reflect( normalize( mPosition.xyz - cameraPosition ), normalize( nWorld.xyz ) );\n}\n#endif",
    map_particle_pars_fragment: "#ifdef USE_MAP\nuniform sampler2D map;\n#endif",
    map_particle_fragment: "#ifdef USE_MAP\ngl_FragColor = gl_FragColor * texture2D( map, gl_PointCoord );\n#endif",
    map_pars_vertex: "#ifdef USE_MAP\nvarying vec2 vUv;\nuniform vec4 offsetRepeat;\n#endif",
    map_pars_fragment: "#ifdef USE_MAP\nvarying vec2 vUv;\nuniform sampler2D map;\n#endif",
    map_vertex: "#ifdef USE_MAP\nvUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n#endif",
    map_fragment: "#ifdef USE_MAP\n#ifdef GAMMA_INPUT\nvec4 texelColor = texture2D( map, vUv );\ntexelColor.xyz *= texelColor.xyz;\ngl_FragColor = gl_FragColor * texelColor;\n#else\ngl_FragColor = gl_FragColor * texture2D( map, vUv );\n#endif\n#endif",
    lightmap_pars_fragment: "#ifdef USE_LIGHTMAP\nvarying vec2 vUv2;\nuniform sampler2D lightMap;\n#endif",
    lightmap_pars_vertex: "#ifdef USE_LIGHTMAP\nvarying vec2 vUv2;\n#endif",
    lightmap_fragment: "#ifdef USE_LIGHTMAP\ngl_FragColor = gl_FragColor * texture2D( lightMap, vUv2 );\n#endif",
    lightmap_vertex: "#ifdef USE_LIGHTMAP\nvUv2 = uv2;\n#endif",
    lights_lambert_pars_vertex: "uniform vec3 ambient;\nuniform vec3 diffuse;\nuniform vec3 ambientLightColor;\n#if MAX_DIR_LIGHTS > 0\nuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\nuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n#endif\n#ifdef WRAP_AROUND\nuniform vec3 wrapRGB;\n#endif",
    lights_lambert_vertex: "vLightFront = vec3( 0.0 );\n#ifdef DOUBLE_SIDED\nvLightBack = vec3( 0.0 );\n#endif\ntransformedNormal = normalize( transformedNormal );\n#if MAX_DIR_LIGHTS > 0\nfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\nvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\nvec3 dirVector = normalize( lDirection.xyz );\nfloat dotProduct = dot( transformedNormal, dirVector );\nvec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );\n#ifdef DOUBLE_SIDED\nvec3 directionalLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n#ifdef WRAP_AROUND\nvec3 directionalLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n#endif\n#endif\n#ifdef WRAP_AROUND\nvec3 directionalLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\ndirectionalLightWeighting = mix( directionalLightWeighting, directionalLightWeightingHalf, wrapRGB );\n#ifdef DOUBLE_SIDED\ndirectionalLightWeightingBack = mix( directionalLightWeightingBack, directionalLightWeightingHalfBack, wrapRGB );\n#endif\n#endif\nvLightFront += directionalLightColor[ i ] * directionalLightWeighting;\n#ifdef DOUBLE_SIDED\nvLightBack += directionalLightColor[ i ] * directionalLightWeightingBack;\n#endif\n}\n#endif\n#if MAX_POINT_LIGHTS > 0\nfor( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\nfloat dotProduct = dot( transformedNormal, lVector );\nvec3 pointLightWeighting = vec3( max( dotProduct, 0.0 ) );\n#ifdef DOUBLE_SIDED\nvec3 pointLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n#ifdef WRAP_AROUND\nvec3 pointLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n#endif\n#endif\n#ifdef WRAP_AROUND\nvec3 pointLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\npointLightWeighting = mix( pointLightWeighting, pointLightWeightingHalf, wrapRGB );\n#ifdef DOUBLE_SIDED\npointLightWeightingBack = mix( pointLightWeightingBack, pointLightWeightingHalfBack, wrapRGB );\n#endif\n#endif\nvLightFront += pointLightColor[ i ] * pointLightWeighting * lDistance;\n#ifdef DOUBLE_SIDED\nvLightBack += pointLightColor[ i ] * pointLightWeightingBack * lDistance;\n#endif\n}\n#endif\nvLightFront = vLightFront * diffuse + ambient * ambientLightColor;\n#ifdef DOUBLE_SIDED\nvLightBack = vLightBack * diffuse + ambient * ambientLightColor;\n#endif",
    lights_phong_pars_vertex: "#if MAX_POINT_LIGHTS > 0\n#ifndef PHONG_PER_PIXEL\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\n#endif",
    lights_phong_vertex: "#if MAX_POINT_LIGHTS > 0\n#ifndef PHONG_PER_PIXEL\nfor( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nvPointLight[ i ] = vec4( lVector, lDistance );\n}\n#endif\n#endif",
    lights_phong_pars_fragment: "uniform vec3 ambientLightColor;\n#if MAX_DIR_LIGHTS > 0\nuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\nuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n#ifdef PHONG_PER_PIXEL\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n#else\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\n#endif\n#ifdef WRAP_AROUND\nuniform vec3 wrapRGB;\n#endif\nvarying vec3 vViewPosition;\nvarying vec3 vNormal;",
    lights_phong_fragment: "vec3 normal = normalize( vNormal );\nvec3 viewPosition = normalize( vViewPosition );\n#ifdef DOUBLE_SIDED\nnormal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n#endif\n#if MAX_POINT_LIGHTS > 0\nvec3 pointDiffuse  = vec3( 0.0 );\nvec3 pointSpecular = vec3( 0.0 );\nfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n#ifdef PHONG_PER_PIXEL\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz + vViewPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\n#else\nvec3 lVector = normalize( vPointLight[ i ].xyz );\nfloat lDistance = vPointLight[ i ].w;\n#endif\nfloat dotProduct = dot( normal, lVector );\n#ifdef WRAP_AROUND\nfloat pointDiffuseWeightFull = max( dotProduct, 0.0 );\nfloat pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\nvec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n#else\nfloat pointDiffuseWeight = max( dotProduct, 0.0 );\n#endif\npointDiffuse  += diffuse * pointLightColor[ i ] * pointDiffuseWeight * lDistance;\nvec3 pointHalfVector = normalize( lVector + viewPosition );\nfloat pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\nfloat pointSpecularWeight = max( pow( pointDotNormalHalf, shininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nvec3 schlick = specular + vec3( 1.0 - specular ) * pow( dot( lVector, pointHalfVector ), 5.0 );\npointSpecular += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance;\n#else\npointSpecular += specular * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * lDistance;\n#endif\n}\n#endif\n#if MAX_DIR_LIGHTS > 0\nvec3 dirDiffuse  = vec3( 0.0 );\nvec3 dirSpecular = vec3( 0.0 );\nfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\nvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\nvec3 dirVector = normalize( lDirection.xyz );\nfloat dotProduct = dot( normal, dirVector );\n#ifdef WRAP_AROUND\nfloat dirDiffuseWeightFull = max( dotProduct, 0.0 );\nfloat dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\nvec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );\n#else\nfloat dirDiffuseWeight = max( dotProduct, 0.0 );\n#endif\ndirDiffuse  += diffuse * directionalLightColor[ i ] * dirDiffuseWeight;\nvec3 dirHalfVector = normalize( dirVector + viewPosition );\nfloat dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\nfloat dirSpecularWeight = max( pow( dirDotNormalHalf, shininess ), 0.0 );\n#ifdef PHYSICALLY_BASED_SHADING\nvec3 schlick = specular + vec3( 1.0 - specular ) * pow( dot( dirVector, dirHalfVector ), 5.0 );\ndirSpecular += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight;\n#else\ndirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight;\n#endif\n}\n#endif\nvec3 totalDiffuse = vec3( 0.0 );\nvec3 totalSpecular = vec3( 0.0 );\n#if MAX_DIR_LIGHTS > 0\ntotalDiffuse += dirDiffuse;\ntotalSpecular += dirSpecular;\n#endif\n#if MAX_POINT_LIGHTS > 0\ntotalDiffuse += pointDiffuse;\ntotalSpecular += pointSpecular;\n#endif\n#ifdef METAL\ngl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * ambient + totalSpecular );\n#else\ngl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * ambient ) + totalSpecular;\n#endif",
    color_pars_fragment: "#ifdef USE_COLOR\nvarying vec3 vColor;\n#endif",
    color_fragment: "#ifdef USE_COLOR\ngl_FragColor = gl_FragColor * vec4( vColor, opacity );\n#endif",
    color_pars_vertex: "#ifdef USE_COLOR\nvarying vec3 vColor;\n#endif",
    color_vertex: "#ifdef USE_COLOR\n#ifdef GAMMA_INPUT\nvColor = color * color;\n#else\nvColor = color;\n#endif\n#endif",
    skinning_pars_vertex: "#ifdef USE_SKINNING\nuniform mat4 boneGlobalMatrices[ MAX_BONES ];\n#endif",
    skinning_vertex: "#ifdef USE_SKINNING\ngl_Position  = ( boneGlobalMatrices[ int( skinIndex.x ) ] * skinVertexA ) * skinWeight.x;\ngl_Position += ( boneGlobalMatrices[ int( skinIndex.y ) ] * skinVertexB ) * skinWeight.y;\ngl_Position  = projectionMatrix * modelViewMatrix * gl_Position;\n#endif",
    morphtarget_pars_vertex: "#ifdef USE_MORPHTARGETS\n#ifndef USE_MORPHNORMALS\nuniform float morphTargetInfluences[ 8 ];\n#else\nuniform float morphTargetInfluences[ 4 ];\n#endif\n#endif",
    morphtarget_vertex: "#ifdef USE_MORPHTARGETS\nvec3 morphed = vec3( 0.0 );\nmorphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\nmorphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\nmorphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\nmorphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n#ifndef USE_MORPHNORMALS\nmorphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\nmorphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\nmorphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\nmorphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n#endif\nmorphed += position;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( morphed, 1.0 );\n#endif",
    default_vertex: "#ifndef USE_MORPHTARGETS\n#ifndef USE_SKINNING\ngl_Position = projectionMatrix * mvPosition;\n#endif\n#endif",
    morphnormal_vertex: "#ifdef USE_MORPHNORMALS\nvec3 morphedNormal = vec3( 0.0 );\nmorphedNormal +=  ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\nmorphedNormal +=  ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\nmorphedNormal +=  ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\nmorphedNormal +=  ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\nmorphedNormal += normal;\nvec3 transformedNormal = normalMatrix * morphedNormal;\n#else\nvec3 transformedNormal = normalMatrix * normal;\n#endif",
    shadowmap_pars_fragment: "#ifdef USE_SHADOWMAP\nuniform sampler2D shadowMap[ MAX_SHADOWS ];\nuniform vec2 shadowMapSize[ MAX_SHADOWS ];\nuniform float shadowDarkness[ MAX_SHADOWS ];\nuniform float shadowBias[ MAX_SHADOWS ];\nvarying vec4 vShadowCoord[ MAX_SHADOWS ];\nfloat unpackDepth( const in vec4 rgba_depth ) {\nconst vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\nfloat depth = dot( rgba_depth, bit_shift );\nreturn depth;\n}\n#endif",
    shadowmap_fragment: "#ifdef USE_SHADOWMAP\n#ifdef SHADOWMAP_DEBUG\nvec3 frustumColors[3];\nfrustumColors[0] = vec3( 1.0, 0.5, 0.0 );\nfrustumColors[1] = vec3( 0.0, 1.0, 0.8 );\nfrustumColors[2] = vec3( 0.0, 0.5, 1.0 );\n#endif\n#ifdef SHADOWMAP_CASCADE\nint inFrustumCount = 0;\n#endif\nfloat fDepth;\nvec3 shadowColor = vec3( 1.0 );\nfor( int i = 0; i < MAX_SHADOWS; i ++ ) {\nvec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\nbvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\nbool inFrustum = all( inFrustumVec );\n#ifdef SHADOWMAP_CASCADE\ninFrustumCount += int( inFrustum );\nbvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );\n#else\nbvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n#endif\nbool frustumTest = all( frustumTestVec );\nif ( frustumTest ) {\nshadowCoord.z += shadowBias[ i ];\n#ifdef SHADOWMAP_SOFT\nfloat shadow = 0.0;\nconst float shadowDelta = 1.0 / 9.0;\nfloat xPixelOffset = 1.0 / shadowMapSize[ i ].x;\nfloat yPixelOffset = 1.0 / shadowMapSize[ i ].y;\nfloat dx0 = -1.25 * xPixelOffset;\nfloat dy0 = -1.25 * yPixelOffset;\nfloat dx1 = 1.25 * xPixelOffset;\nfloat dy1 = 1.25 * yPixelOffset;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nfDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\nif ( fDepth < shadowCoord.z ) shadow += shadowDelta;\nshadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );\n#else\nvec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );\nfloat fDepth = unpackDepth( rgbaDepth );\nif ( fDepth < shadowCoord.z )\nshadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );\n#endif\n}\n#ifdef SHADOWMAP_DEBUG\n#ifdef SHADOWMAP_CASCADE\nif ( inFrustum && inFrustumCount == 1 ) gl_FragColor.xyz *= frustumColors[ i ];\n#else\nif ( inFrustum ) gl_FragColor.xyz *= frustumColors[ i ];\n#endif\n#endif\n}\n#ifdef GAMMA_OUTPUT\nshadowColor *= shadowColor;\n#endif\ngl_FragColor.xyz = gl_FragColor.xyz * shadowColor;\n#endif",
    shadowmap_pars_vertex: "#ifdef USE_SHADOWMAP\nvarying vec4 vShadowCoord[ MAX_SHADOWS ];\nuniform mat4 shadowMatrix[ MAX_SHADOWS ];\n#endif",
    shadowmap_vertex: "#ifdef USE_SHADOWMAP\nfor( int i = 0; i < MAX_SHADOWS; i ++ ) {\n#ifdef USE_MORPHTARGETS\nvShadowCoord[ i ] = shadowMatrix[ i ] * objectMatrix * vec4( morphed, 1.0 );\n#else\nvShadowCoord[ i ] = shadowMatrix[ i ] * objectMatrix * vec4( position, 1.0 );\n#endif\n}\n#endif",
    alphatest_fragment: "#ifdef ALPHATEST\nif ( gl_FragColor.a < ALPHATEST ) discard;\n#endif",
    linear_to_gamma_fragment: "#ifdef GAMMA_OUTPUT\ngl_FragColor.xyz = sqrt( gl_FragColor.xyz );\n#endif"
};
THREE.UniformsUtils = {
    merge: function(a) {
        var b, c, d, f = {};
        for (b = 0; b < a.length; b++)
            for (c in d = this.clone(a[b]), d) f[c] = d[c];
        return f
    },
    clone: function(a) {
        var b, c, d, f = {};
        for (b in a)
            for (c in f[b] = {}, a[b]) d = a[b][c], f[b][c] = d instanceof THREE.Color || d instanceof THREE.Vector2 || d instanceof THREE.Vector3 || d instanceof THREE.Vector4 || d instanceof THREE.Matrix4 || d instanceof THREE.Texture ? d.clone() : d instanceof Array ? d.slice() : d;
        return f
    }
};
THREE.UniformsLib = {
    common: {
        diffuse: {
            type: "c",
            value: new THREE.Color(15658734)
        },
        opacity: {
            type: "f",
            value: 1
        },
        map: {
            type: "t",
            value: 0,
            texture: null
        },
        offsetRepeat: {
            type: "v4",
            value: new THREE.Vector4(0, 0, 1, 1)
        },
        lightMap: {
            type: "t",
            value: 2,
            texture: null
        },
        envMap: {
            type: "t",
            value: 1,
            texture: null
        },
        flipEnvMap: {
            type: "f",
            value: -1
        },
        useRefract: {
            type: "i",
            value: 0
        },
        reflectivity: {
            type: "f",
            value: 1
        },
        refractionRatio: {
            type: "f",
            value: 0.98
        },
        combine: {
            type: "i",
            value: 0
        },
        morphTargetInfluences: {
            type: "f",
            value: 0
        }
    },
    fog: {
        fogDensity: {
            type: "f",
            value: 2.5E-4
        },
        fogNear: {
            type: "f",
            value: 1
        },
        fogFar: {
            type: "f",
            value: 2E3
        },
        fogColor: {
            type: "c",
            value: new THREE.Color(16777215)
        }
    },
    lights: {
        ambientLightColor: {
            type: "fv",
            value: []
        },
        directionalLightDirection: {
            type: "fv",
            value: []
        },
        directionalLightColor: {
            type: "fv",
            value: []
        },
        pointLightColor: {
            type: "fv",
            value: []
        },
        pointLightPosition: {
            type: "fv",
            value: []
        },
        pointLightDistance: {
            type: "fv1",
            value: []
        }
    },
    particle: {
        psColor: {
            type: "c",
            value: new THREE.Color(15658734)
        },
        opacity: {
            type: "f",
            value: 1
        },
        size: {
            type: "f",
            value: 1
        },
        scale: {
            type: "f",
            value: 1
        },
        map: {
            type: "t",
            value: 0,
            texture: null
        },
        fogDensity: {
            type: "f",
            value: 2.5E-4
        },
        fogNear: {
            type: "f",
            value: 1
        },
        fogFar: {
            type: "f",
            value: 2E3
        },
        fogColor: {
            type: "c",
            value: new THREE.Color(16777215)
        }
    },
    shadowmap: {
        shadowMap: {
            type: "tv",
            value: 6,
            texture: []
        },
        shadowMapSize: {
            type: "v2v",
            value: []
        },
        shadowBias: {
            type: "fv1",
            value: []
        },
        shadowDarkness: {
            type: "fv1",
            value: []
        },
        shadowMatrix: {
            type: "m4v",
            value: []
        }
    }
};
THREE.ShaderLib = {
    depth: {
        uniforms: {
            mNear: {
                type: "f",
                value: 1
            },
            mFar: {
                type: "f",
                value: 2E3
            },
            opacity: {
                type: "f",
                value: 1
            }
        },
        vertexShader: "void main() {\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",
        fragmentShader: "uniform float mNear;\nuniform float mFar;\nuniform float opacity;\nvoid main() {\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat color = 1.0 - smoothstep( mNear, mFar, depth );\ngl_FragColor = vec4( vec3( color ), opacity );\n}"
    },
    normal: {
        uniforms: {
            opacity: {
                type: "f",
                value: 1
            }
        },
        vertexShader: "varying vec3 vNormal;\nvoid main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\nvNormal = normalize( normalMatrix * normal );\ngl_Position = projectionMatrix * mvPosition;\n}",
        fragmentShader: "uniform float opacity;\nvarying vec3 vNormal;\nvoid main() {\ngl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );\n}"
    },
    basic: {
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.shadowmap]),
        vertexShader: [THREE.ShaderChunk.map_pars_vertex,
            THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, "void main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.morphtarget_vertex,
            THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"
        ].join("\n"),
        fragmentShader: ["uniform vec3 diffuse;\nuniform float opacity;", THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, "void main() {\ngl_FragColor = vec4( diffuse, opacity );", THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.alphatest_fragment,
            THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "}"
        ].join("\n")
    },
    lambert: {
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
            ambient: {
                type: "c",
                value: new THREE.Color(328965)
            },
            wrapRGB: {
                type: "v3",
                value: new THREE.Vector3(1, 1, 1)
            }
        }]),
        vertexShader: ["varying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\nvarying vec3 vLightBack;\n#endif",
            THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_lambert_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, "void main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.color_vertex,
            THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.lights_lambert_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"
        ].join("\n"),
        fragmentShader: ["uniform float opacity;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\nvarying vec3 vLightBack;\n#endif", THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment,
            THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, "void main() {\ngl_FragColor = vec4( vec3 ( 1.0 ), opacity );", THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.alphatest_fragment, "#ifdef DOUBLE_SIDED\nif ( gl_FrontFacing )\ngl_FragColor.xyz *= vLightFront;\nelse\ngl_FragColor.xyz *= vLightBack;\n#else\ngl_FragColor.xyz *= vLightFront;\n#endif", THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment,
            THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "}"
        ].join("\n")
    },
    phong: {
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
            ambient: {
                type: "c",
                value: new THREE.Color(328965)
            },
            specular: {
                type: "c",
                value: new THREE.Color(1118481)
            },
            shininess: {
                type: "f",
                value: 30
            },
            wrapRGB: {
                type: "v3",
                value: new THREE.Vector3(1, 1, 1)
            }
        }]),
        vertexShader: ["varying vec3 vViewPosition;\nvarying vec3 vNormal;", THREE.ShaderChunk.map_pars_vertex,
            THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_phong_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, "void main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.color_vertex, "#ifndef USE_ENVMAP\nvec4 mPosition = objectMatrix * vec4( position, 1.0 );\n#endif\nvViewPosition = -mvPosition.xyz;",
            THREE.ShaderChunk.morphnormal_vertex, "vNormal = transformedNormal;", THREE.ShaderChunk.lights_phong_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.shadowmap_vertex, "}"
        ].join("\n"),
        fragmentShader: ["uniform vec3 diffuse;\nuniform float opacity;\nuniform vec3 ambient;\nuniform vec3 specular;\nuniform float shininess;", THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment,
            THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.lights_phong_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, "void main() {\ngl_FragColor = vec4( vec3 ( 1.0 ), opacity );", THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.lights_phong_fragment, THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment,
            THREE.ShaderChunk.fog_fragment, "}"
        ].join("\n")
    },
    particle_basic: {
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.particle, THREE.UniformsLib.shadowmap]),
        vertexShader: ["uniform float size;\nuniform float scale;", THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, "void main() {", THREE.ShaderChunk.color_vertex, "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n#ifdef USE_SIZEATTENUATION\ngl_PointSize = size * ( scale / length( mvPosition.xyz ) );\n#else\ngl_PointSize = size;\n#endif\ngl_Position = projectionMatrix * mvPosition;",
            THREE.ShaderChunk.shadowmap_vertex, "}"
        ].join("\n"),
        fragmentShader: ["uniform vec3 psColor;\nuniform float opacity;", THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_particle_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, "void main() {\ngl_FragColor = vec4( psColor, opacity );", THREE.ShaderChunk.map_particle_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.fog_fragment,
            "}"
        ].join("\n")
    },
    depthRGBA: {
        uniforms: {},
        vertexShader: [THREE.ShaderChunk.morphtarget_pars_vertex, "void main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.default_vertex, "}"].join("\n"),
        fragmentShader: "vec4 pack_depth( const in float depth ) {\nconst vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\nconst vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\nvec4 res = fract( depth * bit_shift );\nres -= res.xxyz * bit_mask;\nreturn res;\n}\nvoid main() {\ngl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );\n}"
    }
};
THREE.WebGLRenderer = function(a) {
    function b(a, b) {
        var c = a.vertices.length,
            d = b.material;
        if (d.attributes) {
            if (void 0 === a.__webglCustomAttributesList) a.__webglCustomAttributesList = [];
            for (var f in d.attributes) {
                var e = d.attributes[f];
                if (!e.__webglInitialized || e.createUniqueBuffers) {
                    e.__webglInitialized = !0;
                    var g = 1;
                    "v2" === e.type ? g = 2 : "v3" === e.type ? g = 3 : "v4" === e.type ? g = 4 : "c" === e.type && (g = 3);
                    e.size = g;
                    e.array = new Float32Array(c * g);
                    e.buffer = l.createBuffer();
                    e.buffer.belongsToAttribute = f;
                    e.needsUpdate = !0
                }
                a.__webglCustomAttributesList.push(e)
            }
        }
    }

    function c(a, b) {
        if (a.material && !(a.material instanceof THREE.MeshFaceMaterial)) return a.material;
        if (0 <= b.materialIndex) return a.geometry.materials[b.materialIndex]
    }

    function d(a) {
        return a instanceof THREE.MeshBasicMaterial && !a.envMap || a instanceof THREE.MeshDepthMaterial ? !1 : a && void 0 !== a.shading && a.shading === THREE.SmoothShading ? THREE.SmoothShading : THREE.FlatShading
    }

    function f(a) {
        return a.map || a.lightMap || a instanceof THREE.ShaderMaterial ? !0 : !1
    }

    function g(a, b, c) {
        var d, f, e, g, h = a.vertices;
        g = h.length;
        var i = a.colors,
            j = i.length,
            k = a.__vertexArray,
            n = a.__colorArray,
            m = a.__sortArray,
            o = a.__dirtyVertices,
            p = a.__dirtyColors,
            q = a.__webglCustomAttributesList;
        if (c.sortParticles) {
            Za.multiplySelf(c.matrixWorld);
            for (d = 0; d < g; d++) f = h[d].position, Sa.copy(f), Za.multiplyVector3(Sa), m[d] = [Sa.z, d];
            m.sort(function(a, b) {
                return b[0] - a[0]
            });
            for (d = 0; d < g; d++) f = h[m[d][1]].position, e = 3 * d, k[e] = f.x, k[e + 1] = f.y, k[e + 2] = f.z;
            for (d = 0; d < j; d++) e = 3 * d, f = i[m[d][1]], n[e] = f.r, n[e + 1] = f.g, n[e + 2] = f.b;
            if (q)
                for (i = 0, j = q.length; i < j; i++)
                    if (h = q[i],
                        void 0 === h.boundTo || "vertices" === h.boundTo)
                        if (e = 0, f = h.value.length, 1 === h.size)
                            for (d = 0; d < f; d++) g = m[d][1], h.array[d] = h.value[g];
                        else if (2 === h.size)
                for (d = 0; d < f; d++) g = m[d][1], g = h.value[g], h.array[e] = g.x, h.array[e + 1] = g.y, e += 2;
            else if (3 === h.size)
                if ("c" === h.type)
                    for (d = 0; d < f; d++) g = m[d][1], g = h.value[g], h.array[e] = g.r, h.array[e + 1] = g.g, h.array[e + 2] = g.b, e += 3;
                else
                    for (d = 0; d < f; d++) g = m[d][1], g = h.value[g], h.array[e] = g.x, h.array[e + 1] = g.y, h.array[e + 2] = g.z, e += 3;
                else if (4 === h.size)
                for (d = 0; d < f; d++) g = m[d][1], g = h.value[g],
            h.array[e] = g.x, h.array[e + 1] = g.y, h.array[e + 2] = g.z, h.array[e + 3] = g.w, e += 4
        } else {
            if (o)
                for (d = 0; d < g; d++) f = h[d].position, e = 3 * d, k[e] = f.x, k[e + 1] = f.y, k[e + 2] = f.z;
            if (p)
                for (d = 0; d < j; d++) f = i[d], e = 3 * d, n[e] = f.r, n[e + 1] = f.g, n[e + 2] = f.b;
            if (q)
                for (i = 0, j = q.length; i < j; i++)
                    if (h = q[i], h.needsUpdate && (void 0 === h.boundTo || "vertices" === h.boundTo))
                        if (f = h.value.length, e = 0, 1 === h.size)
                            for (d = 0; d < f; d++) h.array[d] = h.value[d];
                        else if (2 === h.size)
                for (d = 0; d < f; d++) g = h.value[d], h.array[e] = g.x, h.array[e + 1] = g.y, e += 2;
            else if (3 === h.size)
                if ("c" ===
                    h.type)
                    for (d = 0; d < f; d++) g = h.value[d], h.array[e] = g.r, h.array[e + 1] = g.g, h.array[e + 2] = g.b, e += 3;
                else
                    for (d = 0; d < f; d++) g = h.value[d], h.array[e] = g.x, h.array[e + 1] = g.y, h.array[e + 2] = g.z, e += 3;
                else if (4 === h.size)
                for (d = 0; d < f; d++) g = h.value[d], h.array[e] = g.x, h.array[e + 1] = g.y, h.array[e + 2] = g.z, h.array[e + 3] = g.w, e += 4
        } if (o || c.sortParticles) l.bindBuffer(l.ARRAY_BUFFER, a.__webglVertexBuffer), l.bufferData(l.ARRAY_BUFFER, k, b);
        if (p || c.sortParticles) l.bindBuffer(l.ARRAY_BUFFER, a.__webglColorBuffer), l.bufferData(l.ARRAY_BUFFER,
            n, b);
        if (q)
            for (i = 0, j = q.length; i < j; i++)
                if (h = q[i], h.needsUpdate || c.sortParticles) l.bindBuffer(l.ARRAY_BUFFER, h.buffer), l.bufferData(l.ARRAY_BUFFER, h.array, b)
    }

    function e(a, b) {
        return b.z - a.z
    }

    function h(a, b, c) {
        if (a.length)
            for (var d = 0, f = a.length; d < f; d++) ca = C = null, S = R = ba = U = aa = -1, a[d].render(b, c, db, lb), ca = C = null, S = R = ba = U = aa = -1
    }

    function i(a, b, c, d, f, e, g, h) {
        var i, l, j, k;
        b ? (l = a.length - 1, k = b = -1) : (l = 0, b = a.length, k = 1);
        for (var n = l; n !== b; n += k)
            if (i = a[n], i.render) {
                l = i.object;
                j = i.buffer;
                if (h) i = h;
                else {
                    i = i[c];
                    if (!i) continue;
                    g && y.setBlending(i.blending);
                    y.setDepthTest(i.depthTest);
                    y.setDepthWrite(i.depthWrite);
                    s(i.polygonOffset, i.polygonOffsetFactor, i.polygonOffsetUnits)
                }
                y.setObjectFaces(l);
                j instanceof THREE.BufferGeometry ? y.renderBufferDirect(d, f, e, i, j, l) : y.renderBuffer(d, f, e, i, j, l)
            }
    }

    function j(a, b, c, d, f, e, g) {
        for (var h, i, l = 0, j = a.length; l < j; l++)
            if (h = a[l], i = h.object, i.visible) {
                if (g) h = g;
                else {
                    h = h[b];
                    if (!h) continue;
                    e && y.setBlending(h.blending);
                    y.setDepthTest(h.depthTest);
                    y.setDepthWrite(h.depthWrite);
                    s(h.polygonOffset, h.polygonOffsetFactor,
                        h.polygonOffsetUnits)
                }
                y.renderImmediateObject(c, d, f, h, i)
            }
    }

    function k(a, b, c) {
        a.push({
            buffer: b,
            object: c,
            opaque: null,
            transparent: null
        })
    }

    function q(a) {
        for (var b in a.attributes)
            if (a.attributes[b].needsUpdate) return !0;
        return !1
    }

    function m(a) {
        for (var b in a.attributes) a.attributes[b].needsUpdate = !1
    }

    function o(a, b) {
        for (var c = a.length - 1; 0 <= c; c--) a[c].object === b && a.splice(c, 1)
    }

    function p(a, b) {
        for (var c = a.length - 1; 0 <= c; c--) a[c] === b && a.splice(c, 1)
    }

    function n(a, b, c, d, f) {
        d.program || y.initMaterial(d, b, c, f);
        if (d.morphTargets && !f.__webglMorphTargetInfluences) {
            f.__webglMorphTargetInfluences = new Float32Array(y.maxMorphTargets);
            for (var e = 0, g = y.maxMorphTargets; e < g; e++) f.__webglMorphTargetInfluences[e] = 0
        }
        var h = !1,
            e = d.program,
            g = e.uniforms,
            i = d.uniforms;
        e !== C && (l.useProgram(e), C = e, h = !0);
        if (d.id !== S) S = d.id, h = !0;
        if (h || a !== ca) l.uniformMatrix4fv(g.projectionMatrix, !1, a._projectionMatrixArray), a !== ca && (ca = a);
        if (h) {
            if (c && d.fog)
                if (i.fogColor.value = c.color, c instanceof THREE.Fog) i.fogNear.value = c.near, i.fogFar.value = c.far;
                else if (c instanceof THREE.FogExp2) i.fogDensity.value = c.density;
            if (d instanceof THREE.MeshPhongMaterial || d instanceof THREE.MeshLambertMaterial || d.lights) {
                var j, k = 0,
                    n = 0,
                    m = 0,
                    o, p, q, r = sa,
                    s = r.directional.colors,
                    t = r.directional.positions,
                    E = r.point.colors,
                    u = r.point.positions,
                    v = r.point.distances,
                    B = 0,
                    R = 0,
                    D = q = 0;
                for (c = 0, h = b.length; c < h; c++)
                    if (j = b[c], !j.onlyShadow)
                        if (o = j.color, p = j.intensity, q = j.distance, j instanceof THREE.AmbientLight) y.gammaInput ? (k += o.r * o.r, n += o.g * o.g, m += o.b * o.b) : (k += o.r, n += o.g, m += o.b);
                        else if (j instanceof THREE.DirectionalLight) q =
                    3 * B, y.gammaInput ? (s[q] = o.r * o.r * p * p, s[q + 1] = o.g * o.g * p * p, s[q + 2] = o.b * o.b * p * p) : (s[q] = o.r * p, s[q + 1] = o.g * p, s[q + 2] = o.b * p), La.copy(j.matrixWorld.getPosition()), La.subSelf(j.target.matrixWorld.getPosition()), La.normalize(), t[q] = La.x, t[q + 1] = La.y, t[q + 2] = La.z, B += 1;
                else if (j instanceof THREE.PointLight || j instanceof THREE.SpotLight) D = 3 * R, y.gammaInput ? (E[D] = o.r * o.r * p * p, E[D + 1] = o.g * o.g * p * p, E[D + 2] = o.b * o.b * p * p) : (E[D] = o.r * p, E[D + 1] = o.g * p, E[D + 2] = o.b * p), j = j.matrixWorld.getPosition(), u[D] = j.x, u[D + 1] = j.y, u[D + 2] = j.z, v[R] = q,
                R += 1;
                for (c = 3 * B, h = s.length; c < h; c++) s[c] = 0;
                for (c = 3 * R, h = E.length; c < h; c++) E[c] = 0;
                r.point.length = R;
                r.directional.length = B;
                r.ambient[0] = k;
                r.ambient[1] = n;
                r.ambient[2] = m;
                c = sa;
                i.ambientLightColor.value = c.ambient;
                i.directionalLightColor.value = c.directional.colors;
                i.directionalLightDirection.value = c.directional.positions;
                i.pointLightColor.value = c.point.colors;
                i.pointLightPosition.value = c.point.positions;
                i.pointLightDistance.value = c.point.distances
            }
            if (d instanceof THREE.MeshBasicMaterial || d instanceof THREE.MeshLambertMaterial ||
                d instanceof THREE.MeshPhongMaterial) i.opacity.value = d.opacity, y.gammaInput ? i.diffuse.value.copyGammaToLinear(d.color) : i.diffuse.value = d.color, (i.map.texture = d.map) && i.offsetRepeat.value.set(d.map.offset.x, d.map.offset.y, d.map.repeat.x, d.map.repeat.y), i.lightMap.texture = d.lightMap, i.envMap.texture = d.envMap, i.flipEnvMap.value = d.envMap instanceof THREE.WebGLRenderTargetCube ? 1 : -1, i.reflectivity.value = d.reflectivity, i.refractionRatio.value = d.refractionRatio, i.combine.value = d.combine, i.useRefract.value =
                d.envMap && d.envMap.mapping instanceof THREE.CubeRefractionMapping;
            if (d instanceof THREE.LineBasicMaterial) i.diffuse.value = d.color, i.opacity.value = d.opacity;
            else if (d instanceof THREE.ParticleBasicMaterial) i.psColor.value = d.color, i.opacity.value = d.opacity, i.size.value = d.size, i.scale.value = F.height / 2, i.map.texture = d.map;
            else if (d instanceof THREE.MeshPhongMaterial) i.shininess.value = d.shininess, y.gammaInput ? (i.ambient.value.copyGammaToLinear(d.ambient), i.specular.value.copyGammaToLinear(d.specular)) :
                (i.ambient.value = d.ambient, i.specular.value = d.specular), d.wrapAround && i.wrapRGB.value.copy(d.wrapRGB);
            else if (d instanceof THREE.MeshLambertMaterial) y.gammaInput ? i.ambient.value.copyGammaToLinear(d.ambient) : i.ambient.value = d.ambient, d.wrapAround && i.wrapRGB.value.copy(d.wrapRGB);
            else if (d instanceof THREE.MeshDepthMaterial) i.mNear.value = a.near, i.mFar.value = a.far, i.opacity.value = d.opacity;
            else if (d instanceof THREE.MeshNormalMaterial) i.opacity.value = d.opacity;
            if (f.receiveShadow && !d._shadowPass && i.shadowMatrix) {
                h =
                    c = 0;
                for (k = b.length; h < k; h++)
                    if (n = b[h], n.castShadow && (n instanceof THREE.SpotLight || n instanceof THREE.DirectionalLight && !n.shadowCascade)) i.shadowMap.texture[c] = n.shadowMap, i.shadowMapSize.value[c] = n.shadowMapSize, i.shadowMatrix.value[c] = n.shadowMatrix, i.shadowDarkness.value[c] = n.shadowDarkness, i.shadowBias.value[c] = n.shadowBias, c++
            }
            b = d.uniformsList;
            for (i = 0, c = b.length; i < c; i++)
                if (n = e.uniforms[b[i][1]])
                    if (h = b[i][0], m = h.type, k = h.value, "i" === m) l.uniform1i(n, k);
                    else if ("f" === m) l.uniform1f(n, k);
            else if ("v2" ===
                m) l.uniform2f(n, k.x, k.y);
            else if ("v3" === m) l.uniform3f(n, k.x, k.y, k.z);
            else if ("v4" === m) l.uniform4f(n, k.x, k.y, k.z, k.w);
            else if ("c" === m) l.uniform3f(n, k.r, k.g, k.b);
            else if ("fv1" === m) l.uniform1fv(n, k);
            else if ("fv" === m) l.uniform3fv(n, k);
            else if ("v2v" === m) {
                if (!h._array) h._array = new Float32Array(2 * k.length);
                for (m = 0, r = k.length; m < r; m++) s = 2 * m, h._array[s] = k[m].x, h._array[s + 1] = k[m].y;
                l.uniform2fv(n, h._array)
            } else if ("v3v" === m) {
                if (!h._array) h._array = new Float32Array(3 * k.length);
                for (m = 0, r = k.length; m < r; m++) s = 3 * m,
                h._array[s] = k[m].x, h._array[s + 1] = k[m].y, h._array[s + 2] = k[m].z;
                l.uniform3fv(n, h._array)
            } else if ("v4v" == m) {
                if (!h._array) h._array = new Float32Array(4 * k.length);
                for (m = 0, r = k.length; m < r; m++) s = 4 * m, h._array[s] = k[m].x, h._array[s + 1] = k[m].y, h._array[s + 2] = k[m].z, h._array[s + 3] = k[m].w;
                l.uniform4fv(n, h._array)
            } else if ("m4" === m) {
                if (!h._array) h._array = new Float32Array(16);
                k.flattenToArray(h._array);
                l.uniformMatrix4fv(n, !1, h._array)
            } else if ("m4v" === m) {
                if (!h._array) h._array = new Float32Array(16 * k.length);
                for (m = 0, r = k.length; m <
                    r; m++) k[m].flattenToArrayOffset(h._array, 16 * m);
                l.uniformMatrix4fv(n, !1, h._array)
            } else if ("t" === m) {
                if (l.uniform1i(n, k), n = h.texture)
                    if (n.image instanceof Array && 6 === n.image.length) {
                        if (h = n, 6 === h.image.length)
                            if (h.needsUpdate) {
                                if (!h.image.__webglTextureCube) h.image.__webglTextureCube = l.createTexture();
                                l.activeTexture(l.TEXTURE0 + k);
                                l.bindTexture(l.TEXTURE_CUBE_MAP, h.image.__webglTextureCube);
                                k = [];
                                for (n = 0; 6 > n; n++) {
                                    m = k;
                                    r = n;
                                    if (y.autoScaleCubemaps) {
                                        if (s = h.image[n], E = Ea, !(s.width <= E && s.height <= E)) u = Math.max(s.width,
                                            s.height), t = Math.floor(s.width * E / u), E = Math.floor(s.height * E / u), u = document.createElement("canvas"), u.width = t, u.height = E, u.getContext("2d").drawImage(s, 0, 0, s.width, s.height, 0, 0, t, E), s = u
                                    } else s = h.image[n];
                                    m[r] = s
                                }
                                n = k[0];
                                m = 0 === (n.width & n.width - 1) && 0 === (n.height & n.height - 1);
                                r = A(h.format);
                                s = A(h.type);
                                w(l.TEXTURE_CUBE_MAP, h, m);
                                for (n = 0; 6 > n; n++) l.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X + n, 0, r, r, s, k[n]);
                                h.generateMipmaps && m && l.generateMipmap(l.TEXTURE_CUBE_MAP);
                                h.needsUpdate = !1;
                                if (h.onUpdate) h.onUpdate()
                            } else l.activeTexture(l.TEXTURE0 +
                                k), l.bindTexture(l.TEXTURE_CUBE_MAP, h.image.__webglTextureCube)
                    } else n instanceof THREE.WebGLRenderTargetCube ? (h = n, l.activeTexture(l.TEXTURE0 + k), l.bindTexture(l.TEXTURE_CUBE_MAP, h.__webglTexture)) : y.setTexture(n, k)
            } else if ("tv" === m) {
                if (!h._array) {
                    h._array = [];
                    for (m = 0, r = h.texture.length; m < r; m++) h._array[m] = k + m
                }
                l.uniform1iv(n, h._array);
                for (m = 0, r = h.texture.length; m < r; m++)(n = h.texture[m]) && y.setTexture(n, h._array[m])
            }
            if ((d instanceof THREE.ShaderMaterial || d instanceof THREE.MeshPhongMaterial || d.envMap) &&
                null !== g.cameraPosition) b = a.matrixWorld.getPosition(), l.uniform3f(g.cameraPosition, b.x, b.y, b.z);
            (d instanceof THREE.MeshPhongMaterial || d instanceof THREE.MeshLambertMaterial || d instanceof THREE.ShaderMaterial || d.skinning) && null !== g.viewMatrix && l.uniformMatrix4fv(g.viewMatrix, !1, a._viewMatrixArray);
            d.skinning && l.uniformMatrix4fv(g.boneGlobalMatrices, !1, f.boneMatrices)
        }
        l.uniformMatrix4fv(g.modelViewMatrix, !1, f._modelViewMatrixArray);
        g.normalMatrix && l.uniformMatrix3fv(g.normalMatrix, !1, f._normalMatrixArray);
        (d instanceof THREE.ShaderMaterial || d.envMap || d.skinning || f.receiveShadow) && null !== g.objectMatrix && l.uniformMatrix4fv(g.objectMatrix, !1, f._objectMatrixArray);
        return e
    }

    function r(a, b) {
        a._modelViewMatrix.multiplyToArray(b.matrixWorldInverse, a.matrixWorld, a._modelViewMatrixArray);
        var c = THREE.Matrix4.makeInvert3x3(a._modelViewMatrix);
        c && c.transposeIntoArray(a._normalMatrixArray)
    }

    function s(a, b, c) {
        ea !== a && (a ? l.enable(l.POLYGON_OFFSET_FILL) : l.disable(l.POLYGON_OFFSET_FILL), ea = a);
        if (a && (Ta !== b || Ja !== c)) l.polygonOffset(b,
            c), Ta = b, Ja = c
    }

    function t(a, b) {
        var c;
        "fragment" === a ? c = l.createShader(l.FRAGMENT_SHADER) : "vertex" === a && (c = l.createShader(l.VERTEX_SHADER));
        l.shaderSource(c, b);
        l.compileShader(c);
        return !l.getShaderParameter(c, l.COMPILE_STATUS) ? (console.error(l.getShaderInfoLog(c)), console.error(b), null) : c
    }

    function w(a, b, c) {
        c ? (l.texParameteri(a, l.TEXTURE_WRAP_S, A(b.wrapS)), l.texParameteri(a, l.TEXTURE_WRAP_T, A(b.wrapT)), l.texParameteri(a, l.TEXTURE_MAG_FILTER, A(b.magFilter)), l.texParameteri(a, l.TEXTURE_MIN_FILTER, A(b.minFilter))) :
            (l.texParameteri(a, l.TEXTURE_WRAP_S, l.CLAMP_TO_EDGE), l.texParameteri(a, l.TEXTURE_WRAP_T, l.CLAMP_TO_EDGE), l.texParameteri(a, l.TEXTURE_MAG_FILTER, v(b.magFilter)), l.texParameteri(a, l.TEXTURE_MIN_FILTER, v(b.minFilter)))
    }

    function u(a, b) {
        l.bindRenderbuffer(l.RENDERBUFFER, a);
        b.depthBuffer && !b.stencilBuffer ? (l.renderbufferStorage(l.RENDERBUFFER, l.DEPTH_COMPONENT16, b.width, b.height), l.framebufferRenderbuffer(l.FRAMEBUFFER, l.DEPTH_ATTACHMENT, l.RENDERBUFFER, a)) : b.depthBuffer && b.stencilBuffer ? (l.renderbufferStorage(l.RENDERBUFFER,
            l.DEPTH_STENCIL, b.width, b.height), l.framebufferRenderbuffer(l.FRAMEBUFFER, l.DEPTH_STENCIL_ATTACHMENT, l.RENDERBUFFER, a)) : l.renderbufferStorage(l.RENDERBUFFER, l.RGBA4, b.width, b.height)
    }

    function v(a) {
        switch (a) {
            case THREE.NearestFilter:
            case THREE.NearestMipMapNearestFilter:
            case THREE.NearestMipMapLinearFilter:
                return l.NEAREST;
            default:
                return l.LINEAR
        }
    }

    function A(a) {
        switch (a) {
            case THREE.RepeatWrapping:
                return l.REPEAT;
            case THREE.ClampToEdgeWrapping:
                return l.CLAMP_TO_EDGE;
            case THREE.MirroredRepeatWrapping:
                return l.MIRRORED_REPEAT;
            case THREE.NearestFilter:
                return l.NEAREST;
            case THREE.NearestMipMapNearestFilter:
                return l.NEAREST_MIPMAP_NEAREST;
            case THREE.NearestMipMapLinearFilter:
                return l.NEAREST_MIPMAP_LINEAR;
            case THREE.LinearFilter:
                return l.LINEAR;
            case THREE.LinearMipMapNearestFilter:
                return l.LINEAR_MIPMAP_NEAREST;
            case THREE.LinearMipMapLinearFilter:
                return l.LINEAR_MIPMAP_LINEAR;
            case THREE.ByteType:
                return l.BYTE;
            case THREE.UnsignedByteType:
                return l.UNSIGNED_BYTE;
            case THREE.ShortType:
                return l.SHORT;
            case THREE.UnsignedShortType:
                return l.UNSIGNED_SHORT;
            case THREE.IntType:
                return l.INT;
            case THREE.UnsignedIntType:
                return l.UNSIGNED_INT;
            case THREE.FloatType:
                return l.FLOAT;
            case THREE.AlphaFormat:
                return l.ALPHA;
            case THREE.RGBFormat:
                return l.RGB;
            case THREE.RGBAFormat:
                return l.RGBA;
            case THREE.LuminanceFormat:
                return l.LUMINANCE;
            case THREE.LuminanceAlphaFormat:
                return l.LUMINANCE_ALPHA
        }
        return 0
    }
    var a = a || {}, F = void 0 !== a.canvas ? a.canvas : document.createElement("canvas"),
        B = void 0 !== a.precision ? a.precision : "mediump",
        D = void 0 !== a.alpha ? a.alpha : !0,
        H = void 0 !== a.premultipliedAlpha ?
            a.premultipliedAlpha : !0,
        I = void 0 !== a.antialias ? a.antialias : !1,
        Q = void 0 !== a.stencil ? a.stencil : !0,
        P = void 0 !== a.preserveDrawingBuffer ? a.preserveDrawingBuffer : !1,
        L = void 0 !== a.clearColor ? new THREE.Color(a.clearColor) : new THREE.Color(0),
        K = void 0 !== a.clearAlpha ? a.clearAlpha : 0,
        O = void 0 !== a.maxLights ? a.maxLights : 4;
    this.domElement = F;
    this.context = null;
    this.autoUpdateScene = this.autoUpdateObjects = this.sortObjects = this.autoClearStencil = this.autoClearDepth = this.autoClearColor = this.autoClear = !0;
    this.shadowMapEnabled =
        this.physicallyBasedShading = this.gammaOutput = this.gammaInput = !1;
    this.shadowMapCullFrontFaces = this.shadowMapSoft = this.shadowMapAutoUpdate = !0;
    this.shadowMapCascade = this.shadowMapDebug = !1;
    this.maxMorphTargets = 8;
    this.maxMorphNormals = 4;
    this.autoScaleCubemaps = !0;
    this.renderPluginsPre = [];
    this.renderPluginsPost = [];
    this.info = {
        memory: {
            programs: 0,
            geometries: 0,
            textures: 0
        },
        render: {
            calls: 0,
            vertices: 0,
            faces: 0,
            points: 0
        }
    };
    var y = this,
        l, $ = [],
        C = null,
        E = null,
        S = -1,
        R = null,
        ca = null,
        ka = 0,
        ia = null,
        N = null,
        aa = null,
        U = null,
        ba = null,
        ea = null,
        Ta = null,
        Ja = null,
        Ka = null,
        Ga = 0,
        qa = 0,
        ha = 0,
        ib = 0,
        db = 0,
        lb = 0,
        cb = new THREE.Frustum,
        Za = new THREE.Matrix4,
        Sa = new THREE.Vector4,
        La = new THREE.Vector3,
        sa = {
            ambient: [0, 0, 0],
            directional: {
                length: 0,
                colors: [],
                positions: []
            },
            point: {
                length: 0,
                colors: [],
                positions: [],
                distances: []
            }
        };
    l = function() {
        var a;
        try {
            if (!(a = F.getContext("experimental-webgl", {
                alpha: D,
                premultipliedAlpha: H,
                antialias: I,
                stencil: Q,
                preserveDrawingBuffer: P
            }))) throw "Error creating WebGL context.";
            console.log(navigator.userAgent + " | " + a.getParameter(a.VERSION) +
                " | " + a.getParameter(a.VENDOR) + " | " + a.getParameter(a.RENDERER) + " | " + a.getParameter(a.SHADING_LANGUAGE_VERSION))
        } catch (b) {
            console.error(b)
        }
        return a
    }();
    l.clearColor(0, 0, 0, 1);
    l.clearDepth(1);
    l.clearStencil(0);
    l.enable(l.DEPTH_TEST);
    l.depthFunc(l.LEQUAL);
    l.frontFace(l.CCW);
    l.cullFace(l.BACK);
    l.enable(l.CULL_FACE);
    l.enable(l.BLEND);
    l.blendEquation(l.FUNC_ADD);
    l.blendFunc(l.SRC_ALPHA, l.ONE_MINUS_SRC_ALPHA);
    l.clearColor(L.r, L.g, L.b, K);
    this.context = l;
    var za = l.getParameter(l.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    l.getParameter(l.MAX_TEXTURE_SIZE);
    var Ea = l.getParameter(l.MAX_CUBE_MAP_TEXTURE_SIZE);
    this.getContext = function() {
        return l
    };
    this.supportsVertexTextures = function() {
        return 0 < za
    };
    this.setSize = function(a, b) {
        F.width = a;
        F.height = b;
        this.setViewport(0, 0, F.width, F.height)
    };
    this.setViewport = function(a, b, c, d) {
        Ga = a;
        qa = b;
        ha = c;
        ib = d;
        l.viewport(Ga, qa, ha, ib)
    };
    this.setScissor = function(a, b, c, d) {
        l.scissor(a, b, c, d)
    };
    this.enableScissorTest = function(a) {
        a ? l.enable(l.SCISSOR_TEST) : l.disable(l.SCISSOR_TEST)
    };
    this.setClearColorHex =
        function(a, b) {
            L.setHex(a);
            K = b;
            l.clearColor(L.r, L.g, L.b, K)
    };
    this.setClearColor = function(a, b) {
        L.copy(a);
        K = b;
        l.clearColor(L.r, L.g, L.b, K)
    };
    this.getClearColor = function() {
        return L
    };
    this.getClearAlpha = function() {
        return K
    };
    this.clear = function(a, b, c) {
        var d = 0;
        if (void 0 === a || a) d |= l.COLOR_BUFFER_BIT;
        if (void 0 === b || b) d |= l.DEPTH_BUFFER_BIT;
        if (void 0 === c || c) d |= l.STENCIL_BUFFER_BIT;
        l.clear(d)
    };
    this.clearTarget = function(a, b, c, d) {
        this.setRenderTarget(a);
        this.clear(b, c, d)
    };
    this.addPostPlugin = function(a) {
        a.init(this);
        this.renderPluginsPost.push(a)
    };
    this.addPrePlugin = function(a) {
        a.init(this);
        this.renderPluginsPre.push(a)
    };
    this.deallocateObject = function(a) {
        if (a.__webglInit)
            if (a.__webglInit = !1, delete a._modelViewMatrix, delete a._normalMatrixArray, delete a._modelViewMatrixArray, delete a._objectMatrixArray, a instanceof THREE.Mesh)
                for (var b in a.geometry.geometryGroups) {
                    var c = a.geometry.geometryGroups[b];
                    l.deleteBuffer(c.__webglVertexBuffer);
                    l.deleteBuffer(c.__webglNormalBuffer);
                    l.deleteBuffer(c.__webglTangentBuffer);
                    l.deleteBuffer(c.__webglColorBuffer);
                    l.deleteBuffer(c.__webglUVBuffer);
                    l.deleteBuffer(c.__webglUV2Buffer);
                    l.deleteBuffer(c.__webglSkinVertexABuffer);
                    l.deleteBuffer(c.__webglSkinVertexBBuffer);
                    l.deleteBuffer(c.__webglSkinIndicesBuffer);
                    l.deleteBuffer(c.__webglSkinWeightsBuffer);
                    l.deleteBuffer(c.__webglFaceBuffer);
                    l.deleteBuffer(c.__webglLineBuffer);
                    var d = void 0,
                        f = void 0;
                    if (c.numMorphTargets)
                        for (d = 0, f = c.numMorphTargets; d < f; d++) l.deleteBuffer(c.__webglMorphTargetsBuffers[d]);
                    if (c.numMorphNormals)
                        for (d =
                            0, f = c.numMorphNormals; d < f; d++) l.deleteBuffer(c.__webglMorphNormalsBuffers[d]);
                    if (c.__webglCustomAttributesList)
                        for (d in d = void 0, c.__webglCustomAttributesList) l.deleteBuffer(c.__webglCustomAttributesList[d].buffer);
                    y.info.memory.geometries--
                } else if (a instanceof THREE.Ribbon) a = a.geometry, l.deleteBuffer(a.__webglVertexBuffer), l.deleteBuffer(a.__webglColorBuffer), y.info.memory.geometries--;
                else if (a instanceof THREE.Line) a = a.geometry, l.deleteBuffer(a.__webglVertexBuffer), l.deleteBuffer(a.__webglColorBuffer),
        y.info.memory.geometries--;
        else if (a instanceof THREE.ParticleSystem) a = a.geometry, l.deleteBuffer(a.__webglVertexBuffer), l.deleteBuffer(a.__webglColorBuffer), y.info.memory.geometries--
    };
    this.deallocateTexture = function(a) {
        if (a.__webglInit) a.__webglInit = !1, l.deleteTexture(a.__webglTexture), y.info.memory.textures--
    };
    this.updateShadowMap = function(a, b) {
        C = null;
        S = R = ba = U = aa = -1;
        this.shadowMapPlugin.update(a, b)
    };
    this.renderBufferImmediate = function(a, b, c) {
        if (!a.__webglVertexBuffer) a.__webglVertexBuffer = l.createBuffer();
        if (!a.__webglNormalBuffer) a.__webglNormalBuffer = l.createBuffer();
        a.hasPos && (l.bindBuffer(l.ARRAY_BUFFER, a.__webglVertexBuffer), l.bufferData(l.ARRAY_BUFFER, a.positionArray, l.DYNAMIC_DRAW), l.enableVertexAttribArray(b.attributes.position), l.vertexAttribPointer(b.attributes.position, 3, l.FLOAT, !1, 0, 0));
        if (a.hasNormal) {
            l.bindBuffer(l.ARRAY_BUFFER, a.__webglNormalBuffer);
            if (c === THREE.FlatShading) {
                var d, f, e, g, h, i, j, k, n, m, o = 3 * a.count;
                for (m = 0; m < o; m += 9) c = a.normalArray, d = c[m], f = c[m + 1], e = c[m + 2], g = c[m + 3], i = c[m +
                    4], k = c[m + 5], h = c[m + 6], j = c[m + 7], n = c[m + 8], d = (d + g + h) / 3, f = (f + i + j) / 3, e = (e + k + n) / 3, c[m] = d, c[m + 1] = f, c[m + 2] = e, c[m + 3] = d, c[m + 4] = f, c[m + 5] = e, c[m + 6] = d, c[m + 7] = f, c[m + 8] = e
            }
            l.bufferData(l.ARRAY_BUFFER, a.normalArray, l.DYNAMIC_DRAW);
            l.enableVertexAttribArray(b.attributes.normal);
            l.vertexAttribPointer(b.attributes.normal, 3, l.FLOAT, !1, 0, 0)
        }
        l.drawArrays(l.TRIANGLES, 0, a.count);
        a.count = 0
    };
    this.renderBufferDirect = function(a, b, c, d, f, e) {
        if (0 !== d.opacity && (c = n(a, b, c, d, e), a = c.attributes, b = !1, d = 16777215 * f.id + 2 * c.id + (d.wireframe ?
            1 : 0), d !== R && (R = d, b = !0), e instanceof THREE.Mesh)) {
            e = f.offsets;
            d = 0;
            for (c = e.length; d < c; ++d) b && (l.bindBuffer(l.ARRAY_BUFFER, f.vertexPositionBuffer), l.vertexAttribPointer(a.position, f.vertexPositionBuffer.itemSize, l.FLOAT, !1, 0, 12 * e[d].index), 0 <= a.normal && f.vertexNormalBuffer && (l.bindBuffer(l.ARRAY_BUFFER, f.vertexNormalBuffer), l.vertexAttribPointer(a.normal, f.vertexNormalBuffer.itemSize, l.FLOAT, !1, 0, 12 * e[d].index)), 0 <= a.uv && f.vertexUvBuffer && (f.vertexUvBuffer ? (l.bindBuffer(l.ARRAY_BUFFER, f.vertexUvBuffer),
                l.vertexAttribPointer(a.uv, f.vertexUvBuffer.itemSize, l.FLOAT, !1, 0, 8 * e[d].index), l.enableVertexAttribArray(a.uv)) : l.disableVertexAttribArray(a.uv)), 0 <= a.color && f.vertexColorBuffer && (l.bindBuffer(l.ARRAY_BUFFER, f.vertexColorBuffer), l.vertexAttribPointer(a.color, f.vertexColorBuffer.itemSize, l.FLOAT, !1, 0, 16 * e[d].index)), l.bindBuffer(l.ELEMENT_ARRAY_BUFFER, f.vertexIndexBuffer)), l.drawElements(l.TRIANGLES, e[d].count, l.UNSIGNED_SHORT, 2 * e[d].start), y.info.render.calls++, y.info.render.vertices += e[d].count,
            y.info.render.faces += e[d].count / 3
        }
    };
    this.renderBuffer = function(a, b, c, d, f, e) {
        if (0 !== d.opacity) {
            var g, h, c = n(a, b, c, d, e),
                b = c.attributes,
                a = !1,
                c = 16777215 * f.id + 2 * c.id + (d.wireframe ? 1 : 0);
            c !== R && (R = c, a = !0);
            if (!d.morphTargets && 0 <= b.position) a && (l.bindBuffer(l.ARRAY_BUFFER, f.__webglVertexBuffer), l.vertexAttribPointer(b.position, 3, l.FLOAT, !1, 0, 0));
            else if (e.morphTargetBase) {
                c = d.program.attributes; - 1 !== e.morphTargetBase ? (l.bindBuffer(l.ARRAY_BUFFER, f.__webglMorphTargetsBuffers[e.morphTargetBase]), l.vertexAttribPointer(c.position,
                    3, l.FLOAT, !1, 0, 0)) : 0 <= c.position && (l.bindBuffer(l.ARRAY_BUFFER, f.__webglVertexBuffer), l.vertexAttribPointer(c.position, 3, l.FLOAT, !1, 0, 0));
                if (e.morphTargetForcedOrder.length) {
                    g = 0;
                    var i = e.morphTargetForcedOrder;
                    for (h = e.morphTargetInfluences; g < d.numSupportedMorphTargets && g < i.length;) l.bindBuffer(l.ARRAY_BUFFER, f.__webglMorphTargetsBuffers[i[g]]), l.vertexAttribPointer(c["morphTarget" + g], 3, l.FLOAT, !1, 0, 0), d.morphNormals && (l.bindBuffer(l.ARRAY_BUFFER, f.__webglMorphNormalsBuffers[i[g]]), l.vertexAttribPointer(c["morphNormal" +
                        g], 3, l.FLOAT, !1, 0, 0)), e.__webglMorphTargetInfluences[g] = h[i[g]], g++
                } else {
                    var i = [],
                        j = -1,
                        k = 0;
                    h = e.morphTargetInfluences;
                    var m, o = h.length;
                    g = 0;
                    for (-1 !== e.morphTargetBase && (i[e.morphTargetBase] = !0); g < d.numSupportedMorphTargets;) {
                        for (m = 0; m < o; m++)!i[m] && h[m] > j && (k = m, j = h[k]);
                        l.bindBuffer(l.ARRAY_BUFFER, f.__webglMorphTargetsBuffers[k]);
                        l.vertexAttribPointer(c["morphTarget" + g], 3, l.FLOAT, !1, 0, 0);
                        d.morphNormals && (l.bindBuffer(l.ARRAY_BUFFER, f.__webglMorphNormalsBuffers[k]), l.vertexAttribPointer(c["morphNormal" +
                            g], 3, l.FLOAT, !1, 0, 0));
                        e.__webglMorphTargetInfluences[g] = j;
                        i[k] = 1;
                        j = -1;
                        g++
                    }
                }
                null !== d.program.uniforms.morphTargetInfluences && l.uniform1fv(d.program.uniforms.morphTargetInfluences, e.__webglMorphTargetInfluences)
            }
            if (a) {
                if (f.__webglCustomAttributesList)
                    for (g = 0, h = f.__webglCustomAttributesList.length; g < h; g++) c = f.__webglCustomAttributesList[g], 0 <= b[c.buffer.belongsToAttribute] && (l.bindBuffer(l.ARRAY_BUFFER, c.buffer), l.vertexAttribPointer(b[c.buffer.belongsToAttribute], c.size, l.FLOAT, !1, 0, 0));
                0 <= b.color &&
                    (l.bindBuffer(l.ARRAY_BUFFER, f.__webglColorBuffer), l.vertexAttribPointer(b.color, 3, l.FLOAT, !1, 0, 0));
                0 <= b.normal && (l.bindBuffer(l.ARRAY_BUFFER, f.__webglNormalBuffer), l.vertexAttribPointer(b.normal, 3, l.FLOAT, !1, 0, 0));
                0 <= b.tangent && (l.bindBuffer(l.ARRAY_BUFFER, f.__webglTangentBuffer), l.vertexAttribPointer(b.tangent, 4, l.FLOAT, !1, 0, 0));
                0 <= b.uv && (f.__webglUVBuffer ? (l.bindBuffer(l.ARRAY_BUFFER, f.__webglUVBuffer), l.vertexAttribPointer(b.uv, 2, l.FLOAT, !1, 0, 0), l.enableVertexAttribArray(b.uv)) : l.disableVertexAttribArray(b.uv));
                0 <= b.uv2 && (f.__webglUV2Buffer ? (l.bindBuffer(l.ARRAY_BUFFER, f.__webglUV2Buffer), l.vertexAttribPointer(b.uv2, 2, l.FLOAT, !1, 0, 0), l.enableVertexAttribArray(b.uv2)) : l.disableVertexAttribArray(b.uv2));
                d.skinning && 0 <= b.skinVertexA && 0 <= b.skinVertexB && 0 <= b.skinIndex && 0 <= b.skinWeight && (l.bindBuffer(l.ARRAY_BUFFER, f.__webglSkinVertexABuffer), l.vertexAttribPointer(b.skinVertexA, 4, l.FLOAT, !1, 0, 0), l.bindBuffer(l.ARRAY_BUFFER, f.__webglSkinVertexBBuffer), l.vertexAttribPointer(b.skinVertexB, 4, l.FLOAT, !1, 0, 0), l.bindBuffer(l.ARRAY_BUFFER,
                    f.__webglSkinIndicesBuffer), l.vertexAttribPointer(b.skinIndex, 4, l.FLOAT, !1, 0, 0), l.bindBuffer(l.ARRAY_BUFFER, f.__webglSkinWeightsBuffer), l.vertexAttribPointer(b.skinWeight, 4, l.FLOAT, !1, 0, 0))
            }
            e instanceof THREE.Mesh ? (d.wireframe ? (d = d.wireframeLinewidth, d !== Ka && (l.lineWidth(d), Ka = d), a && l.bindBuffer(l.ELEMENT_ARRAY_BUFFER, f.__webglLineBuffer), l.drawElements(l.LINES, f.__webglLineCount, l.UNSIGNED_SHORT, 0)) : (a && l.bindBuffer(l.ELEMENT_ARRAY_BUFFER, f.__webglFaceBuffer), l.drawElements(l.TRIANGLES, f.__webglFaceCount,
                l.UNSIGNED_SHORT, 0)), y.info.render.calls++, y.info.render.vertices += f.__webglFaceCount, y.info.render.faces += f.__webglFaceCount / 3) : e instanceof THREE.Line ? (e = e.type === THREE.LineStrip ? l.LINE_STRIP : l.LINES, d = d.linewidth, d !== Ka && (l.lineWidth(d), Ka = d), l.drawArrays(e, 0, f.__webglLineCount), y.info.render.calls++) : e instanceof THREE.ParticleSystem ? (l.drawArrays(l.POINTS, 0, f.__webglParticleCount), y.info.render.calls++, y.info.render.points += f.__webglParticleCount) : e instanceof THREE.Ribbon && (l.drawArrays(l.TRIANGLE_STRIP,
                0, f.__webglVertexCount), y.info.render.calls++)
        }
    };
    this.render = function(a, b, c, d) {
        var f, g, k, m, n = a.__lights,
            o = a.fog;
        S = -1;
        this.autoUpdateObjects && this.initWebGLObjects(a);
        void 0 === b.parent && (console.warn("DEPRECATED: Camera hasn't been added to a Scene. Adding it..."), a.add(b));
        this.autoUpdateScene && a.updateMatrixWorld();
        h(this.renderPluginsPre, a, b);
        y.info.render.calls = 0;
        y.info.render.vertices = 0;
        y.info.render.faces = 0;
        y.info.render.points = 0;
        b.matrixWorldInverse.getInverse(b.matrixWorld);
        if (!b._viewMatrixArray) b._viewMatrixArray =
            new Float32Array(16);
        b.matrixWorldInverse.flattenToArray(b._viewMatrixArray);
        if (!b._projectionMatrixArray) b._projectionMatrixArray = new Float32Array(16);
        b.projectionMatrix.flattenToArray(b._projectionMatrixArray);
        Za.multiply(b.projectionMatrix, b.matrixWorldInverse);
        cb.setFromMatrix(Za);
        this.setRenderTarget(c);
        (this.autoClear || d) && this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
        m = a.__webglObjects;
        for (d = 0, f = m.length; d < f; d++)
            if (g = m[d], k = g.object, g.render = !1, k.visible && (!(k instanceof THREE.Mesh || k instanceof THREE.ParticleSystem) || !k.frustumCulled || cb.contains(k))) {
                k.matrixWorld.flattenToArray(k._objectMatrixArray);
                r(k, b);
                var p = g,
                    q = p.object,
                    t = p.buffer,
                    E = void 0,
                    E = E = void 0,
                    E = q.material;
                if (E instanceof THREE.MeshFaceMaterial) {
                    if (E = t.materialIndex, 0 <= E) E = q.geometry.materials[E], E.transparent ? (p.transparent = E, p.opaque = null) : (p.opaque = E, p.transparent = null)
                } else if (E) E.transparent ? (p.transparent = E, p.opaque = null) : (p.opaque = E, p.transparent = null);
                g.render = !0;
                if (this.sortObjects) k.renderDepth ?
                    g.z = k.renderDepth : (Sa.copy(k.position), Za.multiplyVector3(Sa), g.z = Sa.z)
            }
        this.sortObjects && m.sort(e);
        m = a.__webglObjectsImmediate;
        for (d = 0, f = m.length; d < f; d++)
            if (g = m[d], k = g.object, k.visible) k.matrixAutoUpdate && k.matrixWorld.flattenToArray(k._objectMatrixArray), r(k, b), k = g.object.material, k.transparent ? (g.transparent = k, g.opaque = null) : (g.opaque = k, g.transparent = null);
        a.overrideMaterial ? (this.setBlending(a.overrideMaterial.blending), this.setDepthTest(a.overrideMaterial.depthTest), this.setDepthWrite(a.overrideMaterial.depthWrite),
            s(a.overrideMaterial.polygonOffset, a.overrideMaterial.polygonOffsetFactor, a.overrideMaterial.polygonOffsetUnits), i(a.__webglObjects, !1, "", b, n, o, !0, a.overrideMaterial), j(a.__webglObjectsImmediate, "", b, n, o, !1, a.overrideMaterial)) : (this.setBlending(THREE.NormalBlending), i(a.__webglObjects, !0, "opaque", b, n, o, !1), j(a.__webglObjectsImmediate, "opaque", b, n, o, !1), i(a.__webglObjects, !1, "transparent", b, n, o, !0), j(a.__webglObjectsImmediate, "transparent", b, n, o, !0));
        h(this.renderPluginsPost, a, b);
        c && c.generateMipmaps &&
            c.minFilter !== THREE.NearestFilter && c.minFilter !== THREE.LinearFilter && (c instanceof THREE.WebGLRenderTargetCube ? (l.bindTexture(l.TEXTURE_CUBE_MAP, c.__webglTexture), l.generateMipmap(l.TEXTURE_CUBE_MAP), l.bindTexture(l.TEXTURE_CUBE_MAP, null)) : (l.bindTexture(l.TEXTURE_2D, c.__webglTexture), l.generateMipmap(l.TEXTURE_2D), l.bindTexture(l.TEXTURE_2D, null)));
        this.setDepthTest(!0);
        this.setDepthWrite(!0)
    };
    this.renderImmediateObject = function(a, b, c, d, f) {
        var e = n(a, b, c, d, f);
        R = -1;
        y.setObjectFaces(f);
        f.immediateRenderCallback ?
            f.immediateRenderCallback(e, l, cb) : f.render(function(a) {
                y.renderBufferImmediate(a, e, d.shading)
            })
    };
    this.initWebGLObjects = function(a) {
        if (!a.__webglObjects) a.__webglObjects = [], a.__webglObjectsImmediate = [], a.__webglSprites = [], a.__webglFlares = [];
        for (; a.__objectsAdded.length;) {
            var e = a.__objectsAdded[0],
                h = a,
                i = void 0,
                j = void 0,
                n = void 0;
            if (!e.__webglInit)
                if (e.__webglInit = !0, e._modelViewMatrix = new THREE.Matrix4, e._normalMatrixArray = new Float32Array(9), e._modelViewMatrixArray = new Float32Array(16), e._objectMatrixArray =
                    new Float32Array(16), e.matrixWorld.flattenToArray(e._objectMatrixArray), e instanceof THREE.Mesh) {
                    if (j = e.geometry, j instanceof THREE.Geometry) {
                        if (void 0 === j.geometryGroups) {
                            var r = j,
                                s = void 0,
                                t = void 0,
                                E = void 0,
                                u = void 0,
                                v = void 0,
                                w = void 0,
                                C = void 0,
                                B = {}, D = r.morphTargets.length,
                                R = r.morphNormals.length;
                            r.geometryGroups = {};
                            for (s = 0, t = r.faces.length; s < t; s++) E = r.faces[s], u = E.materialIndex, w = void 0 !== u ? u : -1, void 0 === B[w] && (B[w] = {
                                hash: w,
                                counter: 0
                            }), C = B[w].hash + "_" + B[w].counter, void 0 === r.geometryGroups[C] && (r.geometryGroups[C] = {
                                faces3: [],
                                faces4: [],
                                materialIndex: u,
                                vertices: 0,
                                numMorphTargets: D,
                                numMorphNormals: R
                            }), v = E instanceof THREE.Face3 ? 3 : 4, 65535 < r.geometryGroups[C].vertices + v && (B[w].counter += 1, C = B[w].hash + "_" + B[w].counter, void 0 === r.geometryGroups[C] && (r.geometryGroups[C] = {
                                faces3: [],
                                faces4: [],
                                materialIndex: u,
                                vertices: 0,
                                numMorphTargets: D,
                                numMorphNormals: R
                            })), E instanceof THREE.Face3 ? r.geometryGroups[C].faces3.push(s) : r.geometryGroups[C].faces4.push(s), r.geometryGroups[C].vertices += v;
                            r.geometryGroupsList = [];
                            var A = void 0;
                            for (A in r.geometryGroups) r.geometryGroups[A].id = ka++, r.geometryGroupsList.push(r.geometryGroups[A])
                        }
                        for (i in j.geometryGroups)
                            if (n = j.geometryGroups[i], !n.__webglVertexBuffer) {
                                var S = n;
                                S.__webglVertexBuffer = l.createBuffer();
                                S.__webglNormalBuffer = l.createBuffer();
                                S.__webglTangentBuffer = l.createBuffer();
                                S.__webglColorBuffer = l.createBuffer();
                                S.__webglUVBuffer = l.createBuffer();
                                S.__webglUV2Buffer = l.createBuffer();
                                S.__webglSkinVertexABuffer = l.createBuffer();
                                S.__webglSkinVertexBBuffer = l.createBuffer();
                                S.__webglSkinIndicesBuffer =
                                    l.createBuffer();
                                S.__webglSkinWeightsBuffer = l.createBuffer();
                                S.__webglFaceBuffer = l.createBuffer();
                                S.__webglLineBuffer = l.createBuffer();
                                var F = void 0,
                                    H = void 0;
                                if (S.numMorphTargets) {
                                    S.__webglMorphTargetsBuffers = [];
                                    for (F = 0, H = S.numMorphTargets; F < H; F++) S.__webglMorphTargetsBuffers.push(l.createBuffer())
                                }
                                if (S.numMorphNormals) {
                                    S.__webglMorphNormalsBuffers = [];
                                    for (F = 0, H = S.numMorphNormals; F < H; F++) S.__webglMorphNormalsBuffers.push(l.createBuffer())
                                }
                                y.info.memory.geometries++;
                                var N = n,
                                    I = e,
                                    K = I.geometry,
                                    ca = N.faces3,
                                    O = N.faces4,
                                    L = 3 * ca.length + 4 * O.length,
                                    P = 1 * ca.length + 2 * O.length,
                                    ia = 3 * ca.length + 4 * O.length,
                                    U = c(I, N),
                                    Q = f(U),
                                    aa = d(U),
                                    ba = U.vertexColors ? U.vertexColors : !1;
                                N.__vertexArray = new Float32Array(3 * L);
                                if (aa) N.__normalArray = new Float32Array(3 * L);
                                if (K.hasTangents) N.__tangentArray = new Float32Array(4 * L);
                                if (ba) N.__colorArray = new Float32Array(3 * L);
                                if (Q) {
                                    if (0 < K.faceUvs.length || 0 < K.faceVertexUvs.length) N.__uvArray = new Float32Array(2 * L);
                                    if (1 < K.faceUvs.length || 1 < K.faceVertexUvs.length) N.__uv2Array = new Float32Array(2 * L)
                                }
                                if (I.geometry.skinWeights.length &&
                                    I.geometry.skinIndices.length) N.__skinVertexAArray = new Float32Array(4 * L), N.__skinVertexBArray = new Float32Array(4 * L), N.__skinIndexArray = new Float32Array(4 * L), N.__skinWeightArray = new Float32Array(4 * L);
                                N.__faceArray = new Uint16Array(3 * P);
                                N.__lineArray = new Uint16Array(2 * ia);
                                var ea = void 0,
                                    $ = void 0;
                                if (N.numMorphTargets) {
                                    N.__morphTargetsArrays = [];
                                    for (ea = 0, $ = N.numMorphTargets; ea < $; ea++) N.__morphTargetsArrays.push(new Float32Array(3 * L))
                                }
                                if (N.numMorphNormals) {
                                    N.__morphNormalsArrays = [];
                                    for (ea = 0, $ = N.numMorphNormals; ea <
                                        $; ea++) N.__morphNormalsArrays.push(new Float32Array(3 * L))
                                }
                                N.__webglFaceCount = 3 * P;
                                N.__webglLineCount = 2 * ia;
                                if (U.attributes) {
                                    if (void 0 === N.__webglCustomAttributesList) N.__webglCustomAttributesList = [];
                                    var Ja = void 0;
                                    for (Ja in U.attributes) {
                                        var Ta = U.attributes[Ja],
                                            ha = {}, Ka;
                                        for (Ka in Ta) ha[Ka] = Ta[Ka];
                                        if (!ha.__webglInitialized || ha.createUniqueBuffers) {
                                            ha.__webglInitialized = !0;
                                            var qa = 1;
                                            "v2" === ha.type ? qa = 2 : "v3" === ha.type ? qa = 3 : "v4" === ha.type ? qa = 4 : "c" === ha.type && (qa = 3);
                                            ha.size = qa;
                                            ha.array = new Float32Array(L *
                                                qa);
                                            ha.buffer = l.createBuffer();
                                            ha.buffer.belongsToAttribute = Ja;
                                            Ta.needsUpdate = !0;
                                            ha.__original = Ta
                                        }
                                        N.__webglCustomAttributesList.push(ha)
                                    }
                                }
                                N.__inittedArrays = !0;
                                j.__dirtyVertices = !0;
                                j.__dirtyMorphTargets = !0;
                                j.__dirtyElements = !0;
                                j.__dirtyUvs = !0;
                                j.__dirtyNormals = !0;
                                j.__dirtyTangents = !0;
                                j.__dirtyColors = !0
                            }
                    }
                } else if (e instanceof THREE.Ribbon) {
                if (j = e.geometry, !j.__webglVertexBuffer) {
                    var Ga = j;
                    Ga.__webglVertexBuffer = l.createBuffer();
                    Ga.__webglColorBuffer = l.createBuffer();
                    y.info.memory.geometries++;
                    var sa =
                        j,
                        za = sa.vertices.length;
                    sa.__vertexArray = new Float32Array(3 * za);
                    sa.__colorArray = new Float32Array(3 * za);
                    sa.__webglVertexCount = za;
                    j.__dirtyVertices = !0;
                    j.__dirtyColors = !0
                }
            } else if (e instanceof THREE.Line) {
                if (j = e.geometry, !j.__webglVertexBuffer) {
                    var La = j;
                    La.__webglVertexBuffer = l.createBuffer();
                    La.__webglColorBuffer = l.createBuffer();
                    y.info.memory.geometries++;
                    var Ea = j,
                        ib = e,
                        db = Ea.vertices.length;
                    Ea.__vertexArray = new Float32Array(3 * db);
                    Ea.__colorArray = new Float32Array(3 * db);
                    Ea.__webglLineCount = db;
                    b(Ea, ib);
                    j.__dirtyVertices = !0;
                    j.__dirtyColors = !0
                }
            } else if (e instanceof THREE.ParticleSystem && (j = e.geometry, !j.__webglVertexBuffer)) {
                var Za = j;
                Za.__webglVertexBuffer = l.createBuffer();
                Za.__webglColorBuffer = l.createBuffer();
                y.info.geometries++;
                var Sa = j,
                    lb = e,
                    cb = Sa.vertices.length;
                Sa.__vertexArray = new Float32Array(3 * cb);
                Sa.__colorArray = new Float32Array(3 * cb);
                Sa.__sortArray = [];
                Sa.__webglParticleCount = cb;
                b(Sa, lb);
                j.__dirtyVertices = !0;
                j.__dirtyColors = !0
            }
            if (!e.__webglActive) {
                if (e instanceof THREE.Mesh)
                    if (j = e.geometry,
                        j instanceof THREE.BufferGeometry) k(h.__webglObjects, j, e);
                    else
                        for (i in j.geometryGroups) n = j.geometryGroups[i], k(h.__webglObjects, n, e);
                    else e instanceof THREE.Ribbon || e instanceof THREE.Line || e instanceof THREE.ParticleSystem ? (j = e.geometry, k(h.__webglObjects, j, e)) : void 0 !== THREE.MarchingCubes && e instanceof THREE.MarchingCubes || e.immediateRenderCallback ? h.__webglObjectsImmediate.push({
                        object: e,
                        opaque: null,
                        transparent: null
                    }) : e instanceof THREE.Sprite ? h.__webglSprites.push(e) : e instanceof THREE.LensFlare &&
                        h.__webglFlares.push(e);
                e.__webglActive = !0
            }
            a.__objectsAdded.splice(0, 1)
        }
        for (; a.__objectsRemoved.length;) {
            var fb = a.__objectsRemoved[0],
                Fc = a;
            fb instanceof THREE.Mesh || fb instanceof THREE.ParticleSystem || fb instanceof THREE.Ribbon || fb instanceof THREE.Line ? o(Fc.__webglObjects, fb) : fb instanceof THREE.Sprite ? p(Fc.__webglSprites, fb) : fb instanceof THREE.LensFlare ? p(Fc.__webglFlares, fb) : (fb instanceof THREE.MarchingCubes || fb.immediateRenderCallback) && o(Fc.__webglObjectsImmediate, fb);
            fb.__webglActive = !1;
            a.__objectsRemoved.splice(0,
                1)
        }
        for (var Wc = 0, rd = a.__webglObjects.length; Wc < rd; Wc++) {
            var nb = a.__webglObjects[Wc].object,
                ja = nb.geometry,
                qc = void 0,
                ic = void 0,
                Xa = void 0;
            if (nb instanceof THREE.Mesh)
                if (ja instanceof THREE.BufferGeometry) ja.__dirtyVertices = !1, ja.__dirtyElements = !1, ja.__dirtyUvs = !1, ja.__dirtyNormals = !1, ja.__dirtyColors = !1;
                else {
                    for (var Xc = 0, sd = ja.geometryGroupsList.length; Xc < sd; Xc++)
                        if (qc = ja.geometryGroupsList[Xc], Xa = c(nb, qc), ic = Xa.attributes && q(Xa), ja.__dirtyVertices || ja.__dirtyMorphTargets || ja.__dirtyElements || ja.__dirtyUvs ||
                            ja.__dirtyNormals || ja.__dirtyColors || ja.__dirtyTangents || ic) {
                            var fa = qc,
                                td = nb,
                                $a = l.DYNAMIC_DRAW,
                                ud = !ja.dynamic,
                                bc = Xa;
                            if (fa.__inittedArrays) {
                                var gd = d(bc),
                                    Yc = bc.vertexColors ? bc.vertexColors : !1,
                                    hd = f(bc),
                                    Gc = gd === THREE.SmoothShading,
                                    G = void 0,
                                    V = void 0,
                                    kb = void 0,
                                    M = void 0,
                                    jc = void 0,
                                    Ob = void 0,
                                    ob = void 0,
                                    Hc = void 0,
                                    Hb = void 0,
                                    kc = void 0,
                                    lc = void 0,
                                    W = void 0,
                                    X = void 0,
                                    Y = void 0,
                                    oa = void 0,
                                    pb = void 0,
                                    qb = void 0,
                                    rb = void 0,
                                    rc = void 0,
                                    sb = void 0,
                                    tb = void 0,
                                    ub = void 0,
                                    sc = void 0,
                                    vb = void 0,
                                    wb = void 0,
                                    xb = void 0,
                                    tc = void 0,
                                    yb = void 0,
                                    zb = void 0,
                                    Ab = void 0,
                                    uc = void 0,
                                    Bb = void 0,
                                    Cb = void 0,
                                    Db = void 0,
                                    vc = void 0,
                                    Pb = void 0,
                                    Qb = void 0,
                                    Rb = void 0,
                                    Ic = void 0,
                                    Sb = void 0,
                                    Tb = void 0,
                                    Ub = void 0,
                                    Jc = void 0,
                                    la = void 0,
                                    id = void 0,
                                    Vb = void 0,
                                    mc = void 0,
                                    nc = void 0,
                                    Ma = void 0,
                                    jd = void 0,
                                    Ha = void 0,
                                    Ia = void 0,
                                    Wb = void 0,
                                    Ib = void 0,
                                    Aa = 0,
                                    Da = 0,
                                    Jb = 0,
                                    Kb = 0,
                                    gb = 0,
                                    Ra = 0,
                                    pa = 0,
                                    Ua = 0,
                                    Ba = 0,
                                    J = 0,
                                    da = 0,
                                    z = 0,
                                    ab = void 0,
                                    Na = fa.__vertexArray,
                                    wc = fa.__uvArray,
                                    xc = fa.__uv2Array,
                                    hb = fa.__normalArray,
                                    ta = fa.__tangentArray,
                                    Oa = fa.__colorArray,
                                    ua = fa.__skinVertexAArray,
                                    va = fa.__skinVertexBArray,
                                    wa = fa.__skinIndexArray,
                                    xa = fa.__skinWeightArray,
                                    Zc = fa.__morphTargetsArrays,
                                    $c = fa.__morphNormalsArrays,
                                    ad = fa.__webglCustomAttributesList,
                                    x = void 0,
                                    Eb = fa.__faceArray,
                                    bb = fa.__lineArray,
                                    Va = td.geometry,
                                    vd = Va.__dirtyElements,
                                    kd = Va.__dirtyUvs,
                                    wd = Va.__dirtyNormals,
                                    xd = Va.__dirtyTangents,
                                    yd = Va.__dirtyColors,
                                    zd = Va.__dirtyMorphTargets,
                                    cc = Va.vertices,
                                    ma = fa.faces3,
                                    na = fa.faces4,
                                    Ca = Va.faces,
                                    bd = Va.faceVertexUvs[0],
                                    cd = Va.faceVertexUvs[1],
                                    dc = Va.skinVerticesA,
                                    ec = Va.skinVerticesB,
                                    fc = Va.skinIndices,
                                    Xb = Va.skinWeights,
                                    Yb = Va.morphTargets,
                                    Kc = Va.morphNormals;
                                if (Va.__dirtyVertices) {
                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], W = cc[M.a].position, X = cc[M.b].position, Y = cc[M.c].position, Na[Da] = W.x, Na[Da + 1] = W.y, Na[Da + 2] = W.z, Na[Da + 3] = X.x, Na[Da + 4] = X.y, Na[Da + 5] = X.z, Na[Da + 6] = Y.x, Na[Da + 7] = Y.y, Na[Da + 8] = Y.z, Da += 9;
                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], W = cc[M.a].position, X = cc[M.b].position, Y = cc[M.c].position, oa = cc[M.d].position, Na[Da] = W.x, Na[Da + 1] = W.y, Na[Da + 2] = W.z, Na[Da + 3] = X.x, Na[Da + 4] = X.y, Na[Da + 5] = X.z, Na[Da + 6] = Y.x, Na[Da + 7] = Y.y, Na[Da + 8] = Y.z, Na[Da + 9] = oa.x, Na[Da + 10] = oa.y,
                                    Na[Da + 11] = oa.z, Da += 12;
                                    l.bindBuffer(l.ARRAY_BUFFER, fa.__webglVertexBuffer);
                                    l.bufferData(l.ARRAY_BUFFER, Na, $a)
                                }
                                if (zd)
                                    for (Ma = 0, jd = Yb.length; Ma < jd; Ma++) {
                                        da = 0;
                                        for (G = 0, V = ma.length; G < V; G++) {
                                            Wb = ma[G];
                                            M = Ca[Wb];
                                            W = Yb[Ma].vertices[M.a].position;
                                            X = Yb[Ma].vertices[M.b].position;
                                            Y = Yb[Ma].vertices[M.c].position;
                                            Ha = Zc[Ma];
                                            Ha[da] = W.x;
                                            Ha[da + 1] = W.y;
                                            Ha[da + 2] = W.z;
                                            Ha[da + 3] = X.x;
                                            Ha[da + 4] = X.y;
                                            Ha[da + 5] = X.z;
                                            Ha[da + 6] = Y.x;
                                            Ha[da + 7] = Y.y;
                                            Ha[da + 8] = Y.z;
                                            if (bc.morphNormals) Gc ? (Ib = Kc[Ma].vertexNormals[Wb], sb = Ib.a, tb = Ib.b, ub = Ib.c) : ub =
                                                tb = sb = Kc[Ma].faceNormals[Wb], Ia = $c[Ma], Ia[da] = sb.x, Ia[da + 1] = sb.y, Ia[da + 2] = sb.z, Ia[da + 3] = tb.x, Ia[da + 4] = tb.y, Ia[da + 5] = tb.z, Ia[da + 6] = ub.x, Ia[da + 7] = ub.y, Ia[da + 8] = ub.z;
                                            da += 9
                                        }
                                        for (G = 0, V = na.length; G < V; G++) {
                                            Wb = na[G];
                                            M = Ca[Wb];
                                            W = Yb[Ma].vertices[M.a].position;
                                            X = Yb[Ma].vertices[M.b].position;
                                            Y = Yb[Ma].vertices[M.c].position;
                                            oa = Yb[Ma].vertices[M.d].position;
                                            Ha = Zc[Ma];
                                            Ha[da] = W.x;
                                            Ha[da + 1] = W.y;
                                            Ha[da + 2] = W.z;
                                            Ha[da + 3] = X.x;
                                            Ha[da + 4] = X.y;
                                            Ha[da + 5] = X.z;
                                            Ha[da + 6] = Y.x;
                                            Ha[da + 7] = Y.y;
                                            Ha[da + 8] = Y.z;
                                            Ha[da + 9] = oa.x;
                                            Ha[da + 10] = oa.y;
                                            Ha[da +
                                                11] = oa.z;
                                            if (bc.morphNormals) Gc ? (Ib = Kc[Ma].vertexNormals[Wb], sb = Ib.a, tb = Ib.b, ub = Ib.c, sc = Ib.d) : sc = ub = tb = sb = Kc[Ma].faceNormals[Wb], Ia = $c[Ma], Ia[da] = sb.x, Ia[da + 1] = sb.y, Ia[da + 2] = sb.z, Ia[da + 3] = tb.x, Ia[da + 4] = tb.y, Ia[da + 5] = tb.z, Ia[da + 6] = ub.x, Ia[da + 7] = ub.y, Ia[da + 8] = ub.z, Ia[da + 9] = sc.x, Ia[da + 10] = sc.y, Ia[da + 11] = sc.z;
                                            da += 12
                                        }
                                        l.bindBuffer(l.ARRAY_BUFFER, fa.__webglMorphTargetsBuffers[Ma]);
                                        l.bufferData(l.ARRAY_BUFFER, Zc[Ma], $a);
                                        bc.morphNormals && (l.bindBuffer(l.ARRAY_BUFFER, fa.__webglMorphNormalsBuffers[Ma]), l.bufferData(l.ARRAY_BUFFER,
                                            $c[Ma], $a))
                                    }
                                if (Xb.length) {
                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], yb = Xb[M.a], zb = Xb[M.b], Ab = Xb[M.c], xa[J] = yb.x, xa[J + 1] = yb.y, xa[J + 2] = yb.z, xa[J + 3] = yb.w, xa[J + 4] = zb.x, xa[J + 5] = zb.y, xa[J + 6] = zb.z, xa[J + 7] = zb.w, xa[J + 8] = Ab.x, xa[J + 9] = Ab.y, xa[J + 10] = Ab.z, xa[J + 11] = Ab.w, Bb = fc[M.a], Cb = fc[M.b], Db = fc[M.c], wa[J] = Bb.x, wa[J + 1] = Bb.y, wa[J + 2] = Bb.z, wa[J + 3] = Bb.w, wa[J + 4] = Cb.x, wa[J + 5] = Cb.y, wa[J + 6] = Cb.z, wa[J + 7] = Cb.w, wa[J + 8] = Db.x, wa[J + 9] = Db.y, wa[J + 10] = Db.z, wa[J + 11] = Db.w, Pb = dc[M.a], Qb = dc[M.b], Rb = dc[M.c], ua[J] = Pb.x, ua[J + 1] = Pb.y,
                                    ua[J + 2] = Pb.z, ua[J + 3] = 1, ua[J + 4] = Qb.x, ua[J + 5] = Qb.y, ua[J + 6] = Qb.z, ua[J + 7] = 1, ua[J + 8] = Rb.x, ua[J + 9] = Rb.y, ua[J + 10] = Rb.z, ua[J + 11] = 1, Sb = ec[M.a], Tb = ec[M.b], Ub = ec[M.c], va[J] = Sb.x, va[J + 1] = Sb.y, va[J + 2] = Sb.z, va[J + 3] = 1, va[J + 4] = Tb.x, va[J + 5] = Tb.y, va[J + 6] = Tb.z, va[J + 7] = 1, va[J + 8] = Ub.x, va[J + 9] = Ub.y, va[J + 10] = Ub.z, va[J + 11] = 1, J += 12;
                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], yb = Xb[M.a], zb = Xb[M.b], Ab = Xb[M.c], uc = Xb[M.d], xa[J] = yb.x, xa[J + 1] = yb.y, xa[J + 2] = yb.z, xa[J + 3] = yb.w, xa[J + 4] = zb.x, xa[J + 5] = zb.y, xa[J + 6] = zb.z, xa[J + 7] = zb.w, xa[J + 8] =
                                        Ab.x, xa[J + 9] = Ab.y, xa[J + 10] = Ab.z, xa[J + 11] = Ab.w, xa[J + 12] = uc.x, xa[J + 13] = uc.y, xa[J + 14] = uc.z, xa[J + 15] = uc.w, Bb = fc[M.a], Cb = fc[M.b], Db = fc[M.c], vc = fc[M.d], wa[J] = Bb.x, wa[J + 1] = Bb.y, wa[J + 2] = Bb.z, wa[J + 3] = Bb.w, wa[J + 4] = Cb.x, wa[J + 5] = Cb.y, wa[J + 6] = Cb.z, wa[J + 7] = Cb.w, wa[J + 8] = Db.x, wa[J + 9] = Db.y, wa[J + 10] = Db.z, wa[J + 11] = Db.w, wa[J + 12] = vc.x, wa[J + 13] = vc.y, wa[J + 14] = vc.z, wa[J + 15] = vc.w, Pb = dc[M.a], Qb = dc[M.b], Rb = dc[M.c], Ic = dc[M.d], ua[J] = Pb.x, ua[J + 1] = Pb.y, ua[J + 2] = Pb.z, ua[J + 3] = 1, ua[J + 4] = Qb.x, ua[J + 5] = Qb.y, ua[J + 6] = Qb.z, ua[J + 7] = 1, ua[J +
                                            8] = Rb.x, ua[J + 9] = Rb.y, ua[J + 10] = Rb.z, ua[J + 11] = 1, ua[J + 12] = Ic.x, ua[J + 13] = Ic.y, ua[J + 14] = Ic.z, ua[J + 15] = 1, Sb = ec[M.a], Tb = ec[M.b], Ub = ec[M.c], Jc = ec[M.d], va[J] = Sb.x, va[J + 1] = Sb.y, va[J + 2] = Sb.z, va[J + 3] = 1, va[J + 4] = Tb.x, va[J + 5] = Tb.y, va[J + 6] = Tb.z, va[J + 7] = 1, va[J + 8] = Ub.x, va[J + 9] = Ub.y, va[J + 10] = Ub.z, va[J + 11] = 1, va[J + 12] = Jc.x, va[J + 13] = Jc.y, va[J + 14] = Jc.z, va[J + 15] = 1, J += 16;
                                    0 < J && (l.bindBuffer(l.ARRAY_BUFFER, fa.__webglSkinVertexABuffer), l.bufferData(l.ARRAY_BUFFER, ua, $a), l.bindBuffer(l.ARRAY_BUFFER, fa.__webglSkinVertexBBuffer),
                                        l.bufferData(l.ARRAY_BUFFER, va, $a), l.bindBuffer(l.ARRAY_BUFFER, fa.__webglSkinIndicesBuffer), l.bufferData(l.ARRAY_BUFFER, wa, $a), l.bindBuffer(l.ARRAY_BUFFER, fa.__webglSkinWeightsBuffer), l.bufferData(l.ARRAY_BUFFER, xa, $a))
                                }
                                if (yd && Yc) {
                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], ob = M.vertexColors, Hc = M.color, 3 === ob.length && Yc === THREE.VertexColors ? (vb = ob[0], wb = ob[1], xb = ob[2]) : xb = wb = vb = Hc, Oa[Ba] = vb.r, Oa[Ba + 1] = vb.g, Oa[Ba + 2] = vb.b, Oa[Ba + 3] = wb.r, Oa[Ba + 4] = wb.g, Oa[Ba + 5] = wb.b, Oa[Ba + 6] = xb.r, Oa[Ba + 7] = xb.g, Oa[Ba + 8] = xb.b,
                                    Ba += 9;
                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], ob = M.vertexColors, Hc = M.color, 4 === ob.length && Yc === THREE.VertexColors ? (vb = ob[0], wb = ob[1], xb = ob[2], tc = ob[3]) : tc = xb = wb = vb = Hc, Oa[Ba] = vb.r, Oa[Ba + 1] = vb.g, Oa[Ba + 2] = vb.b, Oa[Ba + 3] = wb.r, Oa[Ba + 4] = wb.g, Oa[Ba + 5] = wb.b, Oa[Ba + 6] = xb.r, Oa[Ba + 7] = xb.g, Oa[Ba + 8] = xb.b, Oa[Ba + 9] = tc.r, Oa[Ba + 10] = tc.g, Oa[Ba + 11] = tc.b, Ba += 12;
                                    0 < Ba && (l.bindBuffer(l.ARRAY_BUFFER, fa.__webglColorBuffer), l.bufferData(l.ARRAY_BUFFER, Oa, $a))
                                }
                                if (xd && Va.hasTangents) {
                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], Hb =
                                        M.vertexTangents, pb = Hb[0], qb = Hb[1], rb = Hb[2], ta[pa] = pb.x, ta[pa + 1] = pb.y, ta[pa + 2] = pb.z, ta[pa + 3] = pb.w, ta[pa + 4] = qb.x, ta[pa + 5] = qb.y, ta[pa + 6] = qb.z, ta[pa + 7] = qb.w, ta[pa + 8] = rb.x, ta[pa + 9] = rb.y, ta[pa + 10] = rb.z, ta[pa + 11] = rb.w, pa += 12;
                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], Hb = M.vertexTangents, pb = Hb[0], qb = Hb[1], rb = Hb[2], rc = Hb[3], ta[pa] = pb.x, ta[pa + 1] = pb.y, ta[pa + 2] = pb.z, ta[pa + 3] = pb.w, ta[pa + 4] = qb.x, ta[pa + 5] = qb.y, ta[pa + 6] = qb.z, ta[pa + 7] = qb.w, ta[pa + 8] = rb.x, ta[pa + 9] = rb.y, ta[pa + 10] = rb.z, ta[pa + 11] = rb.w, ta[pa + 12] = rc.x, ta[pa +
                                        13] = rc.y, ta[pa + 14] = rc.z, ta[pa + 15] = rc.w, pa += 16;
                                    l.bindBuffer(l.ARRAY_BUFFER, fa.__webglTangentBuffer);
                                    l.bufferData(l.ARRAY_BUFFER, ta, $a)
                                }
                                if (wd && gd) {
                                    for (G = 0, V = ma.length; G < V; G++)
                                        if (M = Ca[ma[G]], jc = M.vertexNormals, Ob = M.normal, 3 === jc.length && Gc)
                                            for (la = 0; 3 > la; la++) Vb = jc[la], hb[Ra] = Vb.x, hb[Ra + 1] = Vb.y, hb[Ra + 2] = Vb.z, Ra += 3;
                                        else
                                            for (la = 0; 3 > la; la++) hb[Ra] = Ob.x, hb[Ra + 1] = Ob.y, hb[Ra + 2] = Ob.z, Ra += 3;
                                    for (G = 0, V = na.length; G < V; G++)
                                        if (M = Ca[na[G]], jc = M.vertexNormals, Ob = M.normal, 4 === jc.length && Gc)
                                            for (la = 0; 4 > la; la++) Vb = jc[la],
                                    hb[Ra] = Vb.x, hb[Ra + 1] = Vb.y, hb[Ra + 2] = Vb.z, Ra += 3;
                                    else
                                        for (la = 0; 4 > la; la++) hb[Ra] = Ob.x, hb[Ra + 1] = Ob.y, hb[Ra + 2] = Ob.z, Ra += 3;
                                    l.bindBuffer(l.ARRAY_BUFFER, fa.__webglNormalBuffer);
                                    l.bufferData(l.ARRAY_BUFFER, hb, $a)
                                }
                                if (kd && bd && hd) {
                                    for (G = 0, V = ma.length; G < V; G++)
                                        if (kb = ma[G], M = Ca[kb], kc = bd[kb], void 0 !== kc)
                                            for (la = 0; 3 > la; la++) mc = kc[la], wc[Jb] = mc.u, wc[Jb + 1] = mc.v, Jb += 2;
                                    for (G = 0, V = na.length; G < V; G++)
                                        if (kb = na[G], M = Ca[kb], kc = bd[kb], void 0 !== kc)
                                            for (la = 0; 4 > la; la++) mc = kc[la], wc[Jb] = mc.u, wc[Jb + 1] = mc.v, Jb += 2;
                                    0 < Jb && (l.bindBuffer(l.ARRAY_BUFFER,
                                        fa.__webglUVBuffer), l.bufferData(l.ARRAY_BUFFER, wc, $a))
                                }
                                if (kd && cd && hd) {
                                    for (G = 0, V = ma.length; G < V; G++)
                                        if (kb = ma[G], M = Ca[kb], lc = cd[kb], void 0 !== lc)
                                            for (la = 0; 3 > la; la++) nc = lc[la], xc[Kb] = nc.u, xc[Kb + 1] = nc.v, Kb += 2;
                                    for (G = 0, V = na.length; G < V; G++)
                                        if (kb = na[G], M = Ca[kb], lc = cd[kb], void 0 !== lc)
                                            for (la = 0; 4 > la; la++) nc = lc[la], xc[Kb] = nc.u, xc[Kb + 1] = nc.v, Kb += 2;
                                    0 < Kb && (l.bindBuffer(l.ARRAY_BUFFER, fa.__webglUV2Buffer), l.bufferData(l.ARRAY_BUFFER, xc, $a))
                                }
                                if (vd) {
                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], Eb[gb] = Aa, Eb[gb + 1] = Aa + 1, Eb[gb +
                                        2] = Aa + 2, gb += 3, bb[Ua] = Aa, bb[Ua + 1] = Aa + 1, bb[Ua + 2] = Aa, bb[Ua + 3] = Aa + 2, bb[Ua + 4] = Aa + 1, bb[Ua + 5] = Aa + 2, Ua += 6, Aa += 3;
                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], Eb[gb] = Aa, Eb[gb + 1] = Aa + 1, Eb[gb + 2] = Aa + 3, Eb[gb + 3] = Aa + 1, Eb[gb + 4] = Aa + 2, Eb[gb + 5] = Aa + 3, gb += 6, bb[Ua] = Aa, bb[Ua + 1] = Aa + 1, bb[Ua + 2] = Aa, bb[Ua + 3] = Aa + 3, bb[Ua + 4] = Aa + 1, bb[Ua + 5] = Aa + 2, bb[Ua + 6] = Aa + 2, bb[Ua + 7] = Aa + 3, Ua += 8, Aa += 4;
                                    l.bindBuffer(l.ELEMENT_ARRAY_BUFFER, fa.__webglFaceBuffer);
                                    l.bufferData(l.ELEMENT_ARRAY_BUFFER, Eb, $a);
                                    l.bindBuffer(l.ELEMENT_ARRAY_BUFFER, fa.__webglLineBuffer);
                                    l.bufferData(l.ELEMENT_ARRAY_BUFFER, bb, $a)
                                }
                                if (ad)
                                    for (la = 0, id = ad.length; la < id; la++)
                                        if (x = ad[la], x.__original.needsUpdate) {
                                            z = 0;
                                            if (1 === x.size)
                                                if (void 0 === x.boundTo || "vertices" === x.boundTo) {
                                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], x.array[z] = x.value[M.a], x.array[z + 1] = x.value[M.b], x.array[z + 2] = x.value[M.c], z += 3;
                                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], x.array[z] = x.value[M.a], x.array[z + 1] = x.value[M.b], x.array[z + 2] = x.value[M.c], x.array[z + 3] = x.value[M.d], z += 4
                                                } else {
                                                    if ("faces" === x.boundTo) {
                                                        for (G = 0, V = ma.length; G <
                                                            V; G++) ab = x.value[ma[G]], x.array[z] = ab, x.array[z + 1] = ab, x.array[z + 2] = ab, z += 3;
                                                        for (G = 0, V = na.length; G < V; G++) ab = x.value[na[G]], x.array[z] = ab, x.array[z + 1] = ab, x.array[z + 2] = ab, x.array[z + 3] = ab, z += 4
                                                    }
                                                } else if (2 === x.size)
                                                if (void 0 === x.boundTo || "vertices" === x.boundTo) {
                                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], W = x.value[M.a], X = x.value[M.b], Y = x.value[M.c], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = X.x, x.array[z + 3] = X.y, x.array[z + 4] = Y.x, x.array[z + 5] = Y.y, z += 6;
                                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], W = x.value[M.a], X =
                                                        x.value[M.b], Y = x.value[M.c], oa = x.value[M.d], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = X.x, x.array[z + 3] = X.y, x.array[z + 4] = Y.x, x.array[z + 5] = Y.y, x.array[z + 6] = oa.x, x.array[z + 7] = oa.y, z += 8
                                                } else {
                                                    if ("faces" === x.boundTo) {
                                                        for (G = 0, V = ma.length; G < V; G++) Y = X = W = ab = x.value[ma[G]], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = X.x, x.array[z + 3] = X.y, x.array[z + 4] = Y.x, x.array[z + 5] = Y.y, z += 6;
                                                        for (G = 0, V = na.length; G < V; G++) oa = Y = X = W = ab = x.value[na[G]], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = X.x, x.array[z + 3] = X.y, x.array[z +
                                                            4] = Y.x, x.array[z + 5] = Y.y, x.array[z + 6] = oa.x, x.array[z + 7] = oa.y, z += 8
                                                    }
                                                } else if (3 === x.size) {
                                                var ga;
                                                ga = "c" === x.type ? ["r", "g", "b"] : ["x", "y", "z"];
                                                if (void 0 === x.boundTo || "vertices" === x.boundTo) {
                                                    for (G = 0, V = ma.length; G < V; G++) M = Ca[ma[G]], W = x.value[M.a], X = x.value[M.b], Y = x.value[M.c], x.array[z] = W[ga[0]], x.array[z + 1] = W[ga[1]], x.array[z + 2] = W[ga[2]], x.array[z + 3] = X[ga[0]], x.array[z + 4] = X[ga[1]], x.array[z + 5] = X[ga[2]], x.array[z + 6] = Y[ga[0]], x.array[z + 7] = Y[ga[1]], x.array[z + 8] = Y[ga[2]], z += 9;
                                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]],
                                                    W = x.value[M.a], X = x.value[M.b], Y = x.value[M.c], oa = x.value[M.d], x.array[z] = W[ga[0]], x.array[z + 1] = W[ga[1]], x.array[z + 2] = W[ga[2]], x.array[z + 3] = X[ga[0]], x.array[z + 4] = X[ga[1]], x.array[z + 5] = X[ga[2]], x.array[z + 6] = Y[ga[0]], x.array[z + 7] = Y[ga[1]], x.array[z + 8] = Y[ga[2]], x.array[z + 9] = oa[ga[0]], x.array[z + 10] = oa[ga[1]], x.array[z + 11] = oa[ga[2]], z += 12
                                                } else if ("faces" === x.boundTo) {
                                                    for (G = 0, V = ma.length; G < V; G++) Y = X = W = ab = x.value[ma[G]], x.array[z] = W[ga[0]], x.array[z + 1] = W[ga[1]], x.array[z + 2] = W[ga[2]], x.array[z + 3] = X[ga[0]],
                                                    x.array[z + 4] = X[ga[1]], x.array[z + 5] = X[ga[2]], x.array[z + 6] = Y[ga[0]], x.array[z + 7] = Y[ga[1]], x.array[z + 8] = Y[ga[2]], z += 9;
                                                    for (G = 0, V = na.length; G < V; G++) oa = Y = X = W = ab = x.value[na[G]], x.array[z] = W[ga[0]], x.array[z + 1] = W[ga[1]], x.array[z + 2] = W[ga[2]], x.array[z + 3] = X[ga[0]], x.array[z + 4] = X[ga[1]], x.array[z + 5] = X[ga[2]], x.array[z + 6] = Y[ga[0]], x.array[z + 7] = Y[ga[1]], x.array[z + 8] = Y[ga[2]], x.array[z + 9] = oa[ga[0]], x.array[z + 10] = oa[ga[1]], x.array[z + 11] = oa[ga[2]], z += 12
                                                }
                                            } else if (4 === x.size)
                                                if (void 0 === x.boundTo || "vertices" === x.boundTo) {
                                                    for (G =
                                                        0, V = ma.length; G < V; G++) M = Ca[ma[G]], W = x.value[M.a], X = x.value[M.b], Y = x.value[M.c], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = W.z, x.array[z + 3] = W.w, x.array[z + 4] = X.x, x.array[z + 5] = X.y, x.array[z + 6] = X.z, x.array[z + 7] = X.w, x.array[z + 8] = Y.x, x.array[z + 9] = Y.y, x.array[z + 10] = Y.z, x.array[z + 11] = Y.w, z += 12;
                                                    for (G = 0, V = na.length; G < V; G++) M = Ca[na[G]], W = x.value[M.a], X = x.value[M.b], Y = x.value[M.c], oa = x.value[M.d], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = W.z, x.array[z + 3] = W.w, x.array[z + 4] = X.x, x.array[z + 5] = X.y, x.array[z + 6] =
                                                        X.z, x.array[z + 7] = X.w, x.array[z + 8] = Y.x, x.array[z + 9] = Y.y, x.array[z + 10] = Y.z, x.array[z + 11] = Y.w, x.array[z + 12] = oa.x, x.array[z + 13] = oa.y, x.array[z + 14] = oa.z, x.array[z + 15] = oa.w, z += 16
                                                } else if ("faces" === x.boundTo) {
                                                for (G = 0, V = ma.length; G < V; G++) Y = X = W = ab = x.value[ma[G]], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = W.z, x.array[z + 3] = W.w, x.array[z + 4] = X.x, x.array[z + 5] = X.y, x.array[z + 6] = X.z, x.array[z + 7] = X.w, x.array[z + 8] = Y.x, x.array[z + 9] = Y.y, x.array[z + 10] = Y.z, x.array[z + 11] = Y.w, z += 12;
                                                for (G = 0, V = na.length; G < V; G++) oa = Y = X = W =
                                                    ab = x.value[na[G]], x.array[z] = W.x, x.array[z + 1] = W.y, x.array[z + 2] = W.z, x.array[z + 3] = W.w, x.array[z + 4] = X.x, x.array[z + 5] = X.y, x.array[z + 6] = X.z, x.array[z + 7] = X.w, x.array[z + 8] = Y.x, x.array[z + 9] = Y.y, x.array[z + 10] = Y.z, x.array[z + 11] = Y.w, x.array[z + 12] = oa.x, x.array[z + 13] = oa.y, x.array[z + 14] = oa.z, x.array[z + 15] = oa.w, z += 16
                                            }
                                            l.bindBuffer(l.ARRAY_BUFFER, x.buffer);
                                            l.bufferData(l.ARRAY_BUFFER, x.array, $a)
                                        }
                                ud && (delete fa.__inittedArrays, delete fa.__colorArray, delete fa.__normalArray, delete fa.__tangentArray, delete fa.__uvArray,
                                    delete fa.__uv2Array, delete fa.__faceArray, delete fa.__vertexArray, delete fa.__lineArray, delete fa.__skinVertexAArray, delete fa.__skinVertexBArray, delete fa.__skinIndexArray, delete fa.__skinWeightArray)
                            }
                        }
                    ja.__dirtyVertices = !1;
                    ja.__dirtyMorphTargets = !1;
                    ja.__dirtyElements = !1;
                    ja.__dirtyUvs = !1;
                    ja.__dirtyNormals = !1;
                    ja.__dirtyColors = !1;
                    ja.__dirtyTangents = !1;
                    Xa.attributes && m(Xa)
                } else if (nb instanceof THREE.Ribbon) {
                if (ja.__dirtyVertices || ja.__dirtyColors) {
                    var Zb = ja,
                        ld = l.DYNAMIC_DRAW,
                        yc = void 0,
                        zc = void 0,
                        Lc =
                            void 0,
                        $b = void 0,
                        Mc = void 0,
                        md = Zb.vertices,
                        nd = Zb.colors,
                        Ad = md.length,
                        Bd = nd.length,
                        Nc = Zb.__vertexArray,
                        Oc = Zb.__colorArray,
                        Cd = Zb.__dirtyColors;
                    if (Zb.__dirtyVertices) {
                        for (yc = 0; yc < Ad; yc++) Lc = md[yc].position, $b = 3 * yc, Nc[$b] = Lc.x, Nc[$b + 1] = Lc.y, Nc[$b + 2] = Lc.z;
                        l.bindBuffer(l.ARRAY_BUFFER, Zb.__webglVertexBuffer);
                        l.bufferData(l.ARRAY_BUFFER, Nc, ld)
                    }
                    if (Cd) {
                        for (zc = 0; zc < Bd; zc++) Mc = nd[zc], $b = 3 * zc, Oc[$b] = Mc.r, Oc[$b + 1] = Mc.g, Oc[$b + 2] = Mc.b;
                        l.bindBuffer(l.ARRAY_BUFFER, Zb.__webglColorBuffer);
                        l.bufferData(l.ARRAY_BUFFER,
                            Oc, ld)
                    }
                }
                ja.__dirtyVertices = !1;
                ja.__dirtyColors = !1
            } else if (nb instanceof THREE.Line) {
                Xa = c(nb, qc);
                ic = Xa.attributes && q(Xa);
                if (ja.__dirtyVertices || ja.__dirtyColors || ic) {
                    var Lb = ja,
                        dd = l.DYNAMIC_DRAW,
                        Ac = void 0,
                        Bc = void 0,
                        Pc = void 0,
                        ya = void 0,
                        Qc = void 0,
                        od = Lb.vertices,
                        pd = Lb.colors,
                        Dd = od.length,
                        Ed = pd.length,
                        Rc = Lb.__vertexArray,
                        Sc = Lb.__colorArray,
                        Fd = Lb.__dirtyColors,
                        ed = Lb.__webglCustomAttributesList,
                        Tc = void 0,
                        qd = void 0,
                        Qa = void 0,
                        oc = void 0,
                        Ya = void 0,
                        ra = void 0;
                    if (Lb.__dirtyVertices) {
                        for (Ac = 0; Ac < Dd; Ac++) Pc = od[Ac].position,
                        ya = 3 * Ac, Rc[ya] = Pc.x, Rc[ya + 1] = Pc.y, Rc[ya + 2] = Pc.z;
                        l.bindBuffer(l.ARRAY_BUFFER, Lb.__webglVertexBuffer);
                        l.bufferData(l.ARRAY_BUFFER, Rc, dd)
                    }
                    if (Fd) {
                        for (Bc = 0; Bc < Ed; Bc++) Qc = pd[Bc], ya = 3 * Bc, Sc[ya] = Qc.r, Sc[ya + 1] = Qc.g, Sc[ya + 2] = Qc.b;
                        l.bindBuffer(l.ARRAY_BUFFER, Lb.__webglColorBuffer);
                        l.bufferData(l.ARRAY_BUFFER, Sc, dd)
                    }
                    if (ed)
                        for (Tc = 0, qd = ed.length; Tc < qd; Tc++)
                            if (ra = ed[Tc], ra.needsUpdate && (void 0 === ra.boundTo || "vertices" === ra.boundTo)) {
                                ya = 0;
                                oc = ra.value.length;
                                if (1 === ra.size)
                                    for (Qa = 0; Qa < oc; Qa++) ra.array[Qa] = ra.value[Qa];
                                else if (2 === ra.size)
                                    for (Qa = 0; Qa < oc; Qa++) Ya = ra.value[Qa], ra.array[ya] = Ya.x, ra.array[ya + 1] = Ya.y, ya += 2;
                                else if (3 === ra.size)
                                    if ("c" === ra.type)
                                        for (Qa = 0; Qa < oc; Qa++) Ya = ra.value[Qa], ra.array[ya] = Ya.r, ra.array[ya + 1] = Ya.g, ra.array[ya + 2] = Ya.b, ya += 3;
                                    else
                                        for (Qa = 0; Qa < oc; Qa++) Ya = ra.value[Qa], ra.array[ya] = Ya.x, ra.array[ya + 1] = Ya.y, ra.array[ya + 2] = Ya.z, ya += 3;
                                    else if (4 === ra.size)
                                    for (Qa = 0; Qa < oc; Qa++) Ya = ra.value[Qa], ra.array[ya] = Ya.x, ra.array[ya + 1] = Ya.y, ra.array[ya + 2] = Ya.z, ra.array[ya + 3] = Ya.w, ya += 4;
                                l.bindBuffer(l.ARRAY_BUFFER,
                                    ra.buffer);
                                l.bufferData(l.ARRAY_BUFFER, ra.array, dd)
                            }
                }
                ja.__dirtyVertices = !1;
                ja.__dirtyColors = !1;
                Xa.attributes && m(Xa)
            } else if (nb instanceof THREE.ParticleSystem) Xa = c(nb, qc), ic = Xa.attributes && q(Xa), (ja.__dirtyVertices || ja.__dirtyColors || nb.sortParticles || ic) && g(ja, l.DYNAMIC_DRAW, nb), ja.__dirtyVertices = !1, ja.__dirtyColors = !1, Xa.attributes && m(Xa)
        }
    };
    this.initMaterial = function(a, b, c, d) {
        var f, e, g, h, i;
        a instanceof THREE.MeshDepthMaterial ? i = "depth" : a instanceof THREE.MeshNormalMaterial ? i = "normal" : a instanceof
        THREE.MeshBasicMaterial ? i = "basic" : a instanceof THREE.MeshLambertMaterial ? i = "lambert" : a instanceof THREE.MeshPhongMaterial ? i = "phong" : a instanceof THREE.LineBasicMaterial ? i = "basic" : a instanceof THREE.ParticleBasicMaterial && (i = "particle_basic");
        if (i) {
            var j = THREE.ShaderLib[i];
            a.uniforms = THREE.UniformsUtils.clone(j.uniforms);
            a.vertexShader = j.vertexShader;
            a.fragmentShader = j.fragmentShader
        }
        var k, m;
        e = j = 0;
        for (k = 0, m = b.length; k < m; k++) f = b[k], f.onlyShadow || (f instanceof THREE.DirectionalLight && e++, f instanceof THREE.PointLight && j++, f instanceof THREE.SpotLight && j++);
        j + e <= O ? k = e : (k = Math.ceil(O * e / (j + e)), j = O - k);
        f = k;
        e = j;
        var n = 0;
        for (j = 0, k = b.length; j < k; j++) m = b[j], m.castShadow && (m instanceof THREE.SpotLight && n++, m instanceof THREE.DirectionalLight && !m.shadowCascade && n++);
        var o = 50;
        if (void 0 !== d && d instanceof THREE.SkinnedMesh) o = d.bones.length;
        var p;
        a: {
            k = a.fragmentShader;
            m = a.vertexShader;
            var j = a.uniforms,
                b = a.attributes,
                c = {
                    map: !! a.map,
                    envMap: !! a.envMap,
                    lightMap: !! a.lightMap,
                    vertexColors: a.vertexColors,
                    fog: c,
                    useFog: a.fog,
                    sizeAttenuation: a.sizeAttenuation,
                    skinning: a.skinning,
                    morphTargets: a.morphTargets,
                    morphNormals: a.morphNormals,
                    maxMorphTargets: this.maxMorphTargets,
                    maxMorphNormals: this.maxMorphNormals,
                    maxDirLights: f,
                    maxPointLights: e,
                    maxBones: o,
                    shadowMapEnabled: this.shadowMapEnabled && d.receiveShadow,
                    shadowMapSoft: this.shadowMapSoft,
                    shadowMapDebug: this.shadowMapDebug,
                    shadowMapCascade: this.shadowMapCascade,
                    maxShadows: n,
                    alphaTest: a.alphaTest,
                    metal: a.metal,
                    perPixel: a.perPixel,
                    wrapAround: a.wrapAround,
                    doubleSided: d && d.doubleSided
                },
                q, d = [];
            i ? d.push(i) : (d.push(k), d.push(m));
            for (q in c) d.push(q), d.push(c[q]);
            i = d.join();
            for (q = 0, d = $.length; q < d; q++)
                if ($[q].code === i) {
                    p = $[q].program;
                    break a
                }
            q = l.createProgram();
            d = [0 < za ? "#define VERTEX_TEXTURES" : "", y.gammaInput ? "#define GAMMA_INPUT" : "", y.gammaOutput ? "#define GAMMA_OUTPUT" : "", y.physicallyBasedShading ? "#define PHYSICALLY_BASED_SHADING" : "", "#define MAX_DIR_LIGHTS " + c.maxDirLights, "#define MAX_POINT_LIGHTS " + c.maxPointLights, "#define MAX_SHADOWS " + c.maxShadows, "#define MAX_BONES " + c.maxBones,
                c.map ? "#define USE_MAP" : "", c.envMap ? "#define USE_ENVMAP" : "", c.lightMap ? "#define USE_LIGHTMAP" : "", c.vertexColors ? "#define USE_COLOR" : "", c.skinning ? "#define USE_SKINNING" : "", c.morphTargets ? "#define USE_MORPHTARGETS" : "", c.morphNormals ? "#define USE_MORPHNORMALS" : "", c.perPixel ? "#define PHONG_PER_PIXEL" : "", c.wrapAround ? "#define WRAP_AROUND" : "", c.doubleSided ? "#define DOUBLE_SIDED" : "", c.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", c.shadowMapSoft ? "#define SHADOWMAP_SOFT" : "", c.shadowMapDebug ? "#define SHADOWMAP_DEBUG" :
                "", c.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "", c.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", "uniform mat4 objectMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\n#ifdef USE_COLOR\nattribute vec3 color;\n#endif\n#ifdef USE_MORPHTARGETS\nattribute vec3 morphTarget0;\nattribute vec3 morphTarget1;\nattribute vec3 morphTarget2;\nattribute vec3 morphTarget3;\n#ifdef USE_MORPHNORMALS\nattribute vec3 morphNormal0;\nattribute vec3 morphNormal1;\nattribute vec3 morphNormal2;\nattribute vec3 morphNormal3;\n#else\nattribute vec3 morphTarget4;\nattribute vec3 morphTarget5;\nattribute vec3 morphTarget6;\nattribute vec3 morphTarget7;\n#endif\n#endif\n#ifdef USE_SKINNING\nattribute vec4 skinVertexA;\nattribute vec4 skinVertexB;\nattribute vec4 skinIndex;\nattribute vec4 skinWeight;\n#endif\n"
            ].join("\n");
            f = ["precision " + B + " float;", "#define MAX_DIR_LIGHTS " + c.maxDirLights, "#define MAX_POINT_LIGHTS " + c.maxPointLights, "#define MAX_SHADOWS " + c.maxShadows, c.alphaTest ? "#define ALPHATEST " + c.alphaTest : "", y.gammaInput ? "#define GAMMA_INPUT" : "", y.gammaOutput ? "#define GAMMA_OUTPUT" : "", y.physicallyBasedShading ? "#define PHYSICALLY_BASED_SHADING" : "", c.useFog && c.fog ? "#define USE_FOG" : "", c.useFog && c.fog instanceof THREE.FogExp2 ? "#define FOG_EXP2" : "", c.map ? "#define USE_MAP" : "", c.envMap ? "#define USE_ENVMAP" : "", c.lightMap ?
                "#define USE_LIGHTMAP" : "", c.vertexColors ? "#define USE_COLOR" : "", c.metal ? "#define METAL" : "", c.perPixel ? "#define PHONG_PER_PIXEL" : "", c.wrapAround ? "#define WRAP_AROUND" : "", c.doubleSided ? "#define DOUBLE_SIDED" : "", c.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", c.shadowMapSoft ? "#define SHADOWMAP_SOFT" : "", c.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "", c.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "", "uniform mat4 viewMatrix;\nuniform vec3 cameraPosition;\n"
            ].join("\n");
            l.attachShader(q, t("fragment", f + k));
            l.attachShader(q, t("vertex", d + m));
            l.linkProgram(q);
            l.getProgramParameter(q, l.LINK_STATUS) || console.error("Could not initialise shader\nVALIDATE_STATUS: " + l.getProgramParameter(q, l.VALIDATE_STATUS) + ", gl error [" + l.getError() + "]");
            q.uniforms = {};
            q.attributes = {};
            var r, d = "viewMatrix,modelViewMatrix,projectionMatrix,normalMatrix,objectMatrix,cameraPosition,boneGlobalMatrices,morphTargetInfluences".split(",");
            for (r in j) d.push(r);
            r = d;
            for (d = 0, j = r.length; d < j; d++) k = r[d], q.uniforms[k] = l.getUniformLocation(q,
                k);
            d = "position,normal,uv,uv2,tangent,color,skinVertexA,skinVertexB,skinIndex,skinWeight".split(",");
            for (r = 0; r < c.maxMorphTargets; r++) d.push("morphTarget" + r);
            for (r = 0; r < c.maxMorphNormals; r++) d.push("morphNormal" + r);
            for (p in b) d.push(p);
            p = d;
            for (r = 0, b = p.length; r < b; r++) c = p[r], q.attributes[c] = l.getAttribLocation(q, c);
            q.id = $.length;
            $.push({
                program: q,
                code: i
            });
            y.info.memory.programs = $.length;
            p = q
        }
        a.program = p;
        p = a.program.attributes;
        0 <= p.position && l.enableVertexAttribArray(p.position);
        0 <= p.color && l.enableVertexAttribArray(p.color);
        0 <= p.normal && l.enableVertexAttribArray(p.normal);
        0 <= p.tangent && l.enableVertexAttribArray(p.tangent);
        a.skinning && 0 <= p.skinVertexA && 0 <= p.skinVertexB && 0 <= p.skinIndex && 0 <= p.skinWeight && (l.enableVertexAttribArray(p.skinVertexA), l.enableVertexAttribArray(p.skinVertexB), l.enableVertexAttribArray(p.skinIndex), l.enableVertexAttribArray(p.skinWeight));
        if (a.attributes)
            for (h in a.attributes) void 0 !== p[h] && 0 <= p[h] && l.enableVertexAttribArray(p[h]);
        if (a.morphTargets) {
            a.numSupportedMorphTargets = 0;
            q = "morphTarget";
            for (h = 0; h < this.maxMorphTargets; h++) r = q + h, 0 <= p[r] && (l.enableVertexAttribArray(p[r]), a.numSupportedMorphTargets++)
        }
        if (a.morphNormals) {
            a.numSupportedMorphNormals = 0;
            q = "morphNormal";
            for (h = 0; h < this.maxMorphNormals; h++) r = q + h, 0 <= p[r] && (l.enableVertexAttribArray(p[r]), a.numSupportedMorphNormals++)
        }
        a.uniformsList = [];
        for (g in a.uniforms) a.uniformsList.push([a.uniforms[g], g])
    };
    this.setFaceCulling = function(a, b) {
        a ? (!b || "ccw" === b ? l.frontFace(l.CCW) : l.frontFace(l.CW), "back" === a ? l.cullFace(l.BACK) : "front" === a ? l.cullFace(l.FRONT) :
            l.cullFace(l.FRONT_AND_BACK), l.enable(l.CULL_FACE)) : l.disable(l.CULL_FACE)
    };
    this.setObjectFaces = function(a) {
        if (ia !== a.doubleSided) a.doubleSided ? l.disable(l.CULL_FACE) : l.enable(l.CULL_FACE), ia = a.doubleSided;
        if (N !== a.flipSided) a.flipSided ? l.frontFace(l.CW) : l.frontFace(l.CCW), N = a.flipSided
    };
    this.setDepthTest = function(a) {
        U !== a && (a ? l.enable(l.DEPTH_TEST) : l.disable(l.DEPTH_TEST), U = a)
    };
    this.setDepthWrite = function(a) {
        ba !== a && (l.depthMask(a), ba = a)
    };
    this.setBlending = function(a) {
        if (a !== aa) {
            switch (a) {
                case THREE.NoBlending:
                    l.disable(l.BLEND);
                    break;
                case THREE.AdditiveBlending:
                    l.enable(l.BLEND);
                    l.blendEquation(l.FUNC_ADD);
                    l.blendFunc(l.SRC_ALPHA, l.ONE);
                    break;
                case THREE.SubtractiveBlending:
                    l.enable(l.BLEND);
                    l.blendEquation(l.FUNC_ADD);
                    l.blendFunc(l.ZERO, l.ONE_MINUS_SRC_COLOR);
                    break;
                case THREE.MultiplyBlending:
                    l.enable(l.BLEND);
                    l.blendEquation(l.FUNC_ADD);
                    l.blendFunc(l.ZERO, l.SRC_COLOR);
                    break;
                default:
                    l.enable(l.BLEND), l.blendEquationSeparate(l.FUNC_ADD, l.FUNC_ADD), l.blendFuncSeparate(l.SRC_ALPHA, l.ONE_MINUS_SRC_ALPHA, l.ONE, l.ONE_MINUS_SRC_ALPHA)
            }
            aa =
                a
        }
    };
    this.setTexture = function(a, b) {
        if (a.needsUpdate) {
            if (!a.__webglInit) a.__webglInit = !0, a.__webglTexture = l.createTexture(), y.info.memory.textures++;
            l.activeTexture(l.TEXTURE0 + b);
            l.bindTexture(l.TEXTURE_2D, a.__webglTexture);
            var c = a.image,
                d = 0 === (c.width & c.width - 1) && 0 === (c.height & c.height - 1),
                f = A(a.format),
                e = A(a.type);
            w(l.TEXTURE_2D, a, d);
            a instanceof THREE.DataTexture ? l.texImage2D(l.TEXTURE_2D, 0, f, c.width, c.height, 0, f, e, c.data) : l.texImage2D(l.TEXTURE_2D, 0, f, f, e, a.image);
            a.generateMipmaps && d && l.generateMipmap(l.TEXTURE_2D);
            a.needsUpdate = !1;
            if (a.onUpdate) a.onUpdate()
        } else l.activeTexture(l.TEXTURE0 + b), l.bindTexture(l.TEXTURE_2D, a.__webglTexture)
    };
    this.setRenderTarget = function(a) {
        var b = a instanceof THREE.WebGLRenderTargetCube;
        if (a && !a.__webglFramebuffer) {
            if (void 0 === a.depthBuffer) a.depthBuffer = !0;
            if (void 0 === a.stencilBuffer) a.stencilBuffer = !0;
            a.__webglTexture = l.createTexture();
            var c = 0 === (a.width & a.width - 1) && 0 === (a.height & a.height - 1),
                d = A(a.format),
                f = A(a.type);
            if (b) {
                a.__webglFramebuffer = [];
                a.__webglRenderbuffer = [];
                l.bindTexture(l.TEXTURE_CUBE_MAP,
                    a.__webglTexture);
                w(l.TEXTURE_CUBE_MAP, a, c);
                for (c = 0; 6 > c; c++) {
                    a.__webglFramebuffer[c] = l.createFramebuffer();
                    a.__webglRenderbuffer[c] = l.createRenderbuffer();
                    l.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X + c, 0, d, a.width, a.height, 0, d, f, null);
                    var e = a,
                        g = l.TEXTURE_CUBE_MAP_POSITIVE_X + c;
                    l.bindFramebuffer(l.FRAMEBUFFER, a.__webglFramebuffer[c]);
                    l.framebufferTexture2D(l.FRAMEBUFFER, l.COLOR_ATTACHMENT0, g, e.__webglTexture, 0);
                    u(a.__webglRenderbuffer[c], a)
                }
            } else a.__webglFramebuffer = l.createFramebuffer(), a.__webglRenderbuffer =
                l.createRenderbuffer(), l.bindTexture(l.TEXTURE_2D, a.__webglTexture), w(l.TEXTURE_2D, a, c), l.texImage2D(l.TEXTURE_2D, 0, d, a.width, a.height, 0, d, f, null), d = l.TEXTURE_2D, l.bindFramebuffer(l.FRAMEBUFFER, a.__webglFramebuffer), l.framebufferTexture2D(l.FRAMEBUFFER, l.COLOR_ATTACHMENT0, d, a.__webglTexture, 0), u(a.__webglRenderbuffer, a);
            b ? l.bindTexture(l.TEXTURE_CUBE_MAP, null) : l.bindTexture(l.TEXTURE_2D, null);
            l.bindRenderbuffer(l.RENDERBUFFER, null);
            l.bindFramebuffer(l.FRAMEBUFFER, null)
        }
        a ? (b = b ? a.__webglFramebuffer[a.activeCubeFace] :
            a.__webglFramebuffer, d = a.width, a = a.height, c = f = 0) : (b = null, d = ha, a = ib, f = Ga, c = qa);
        b !== E && (l.bindFramebuffer(l.FRAMEBUFFER, b), l.viewport(f, c, d, a), E = b);
        db = d;
        lb = a
    };
    this.shadowMapPlugin = new THREE.ShadowMapPlugin;
    this.addPrePlugin(this.shadowMapPlugin);
    this.addPostPlugin(new THREE.SpritePlugin);
    this.addPostPlugin(new THREE.LensFlarePlugin)
};
THREE.WebGLRenderTarget = function(a, b, c) {
    this.width = a;
    this.height = b;
    c = c || {};
    this.wrapS = void 0 !== c.wrapS ? c.wrapS : THREE.ClampToEdgeWrapping;
    this.wrapT = void 0 !== c.wrapT ? c.wrapT : THREE.ClampToEdgeWrapping;
    this.magFilter = void 0 !== c.magFilter ? c.magFilter : THREE.LinearFilter;
    this.minFilter = void 0 !== c.minFilter ? c.minFilter : THREE.LinearMipMapLinearFilter;
    this.offset = new THREE.Vector2(0, 0);
    this.repeat = new THREE.Vector2(1, 1);
    this.format = void 0 !== c.format ? c.format : THREE.RGBAFormat;
    this.type = void 0 !== c.type ? c.type :
        THREE.UnsignedByteType;
    this.depthBuffer = void 0 !== c.depthBuffer ? c.depthBuffer : !0;
    this.stencilBuffer = void 0 !== c.stencilBuffer ? c.stencilBuffer : !0;
    this.generateMipmaps = !0
};
THREE.WebGLRenderTarget.prototype.clone = function() {
    var a = new THREE.WebGLRenderTarget(this.width, this.height);
    a.wrapS = this.wrapS;
    a.wrapT = this.wrapT;
    a.magFilter = this.magFilter;
    a.minFilter = this.minFilter;
    a.offset.copy(this.offset);
    a.repeat.copy(this.repeat);
    a.format = this.format;
    a.type = this.type;
    a.depthBuffer = this.depthBuffer;
    a.stencilBuffer = this.stencilBuffer;
    return a
};
THREE.WebGLRenderTargetCube = function(a, b, c) {
    THREE.WebGLRenderTarget.call(this, a, b, c);
    this.activeCubeFace = 0
};
THREE.WebGLRenderTargetCube.prototype = new THREE.WebGLRenderTarget;
THREE.WebGLRenderTargetCube.prototype.constructor = THREE.WebGLRenderTargetCube;
THREE.RenderableVertex = function() {
    this.positionWorld = new THREE.Vector3;
    this.positionScreen = new THREE.Vector4;
    this.visible = !0
};
THREE.RenderableVertex.prototype.copy = function(a) {
    this.positionWorld.copy(a.positionWorld);
    this.positionScreen.copy(a.positionScreen)
};
THREE.RenderableFace3 = function() {
    this.v1 = new THREE.RenderableVertex;
    this.v2 = new THREE.RenderableVertex;
    this.v3 = new THREE.RenderableVertex;
    this.centroidWorld = new THREE.Vector3;
    this.centroidScreen = new THREE.Vector3;
    this.normalWorld = new THREE.Vector3;
    this.vertexNormalsWorld = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3];
    this.faceMaterial = this.material = null;
    this.uvs = [
        []
    ];
    this.z = null
};
THREE.RenderableFace4 = function() {
    this.v1 = new THREE.RenderableVertex;
    this.v2 = new THREE.RenderableVertex;
    this.v3 = new THREE.RenderableVertex;
    this.v4 = new THREE.RenderableVertex;
    this.centroidWorld = new THREE.Vector3;
    this.centroidScreen = new THREE.Vector3;
    this.normalWorld = new THREE.Vector3;
    this.vertexNormalsWorld = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3];
    this.faceMaterial = this.material = null;
    this.uvs = [
        []
    ];
    this.z = null
};
THREE.RenderableObject = function() {
    this.z = this.object = null
};
THREE.RenderableParticle = function() {
    this.rotation = this.z = this.y = this.x = null;
    this.scale = new THREE.Vector2;
    this.material = null
};
THREE.RenderableLine = function() {
    this.z = null;
    this.v1 = new THREE.RenderableVertex;
    this.v2 = new THREE.RenderableVertex;
    this.material = null
};
THREE.ColorUtils = {
    adjustHSV: function(a, b, c, d) {
        var f = THREE.ColorUtils.__hsv;
        THREE.ColorUtils.rgbToHsv(a, f);
        f.h = THREE.Math.clamp(f.h + b, 0, 1);
        f.s = THREE.Math.clamp(f.s + c, 0, 1);
        f.v = THREE.Math.clamp(f.v + d, 0, 1);
        a.setHSV(f.h, f.s, f.v)
    },
    rgbToHsv: function(a, b) {
        var c = a.r,
            d = a.g,
            f = a.b,
            g = Math.max(Math.max(c, d), f),
            e = Math.min(Math.min(c, d), f);
        if (e === g) e = c = 0;
        else {
            var h = g - e,
                e = h / g,
                c = (c === g ? (d - f) / h : d === g ? 2 + (f - c) / h : 4 + (c - d) / h) / 6;
            0 > c && (c += 1);
            1 < c && (c -= 1)
        }
        void 0 === b && (b = {
            h: 0,
            s: 0,
            v: 0
        });
        b.h = c;
        b.s = e;
        b.v = g;
        return b
    }
};
THREE.ColorUtils.__hsv = {
    h: 0,
    s: 0,
    v: 0
};
THREE.GeometryUtils = {
    merge: function(a, b) {
        for (var c, d, f = a.vertices.length, g = b instanceof THREE.Mesh ? b.geometry : b, e = a.vertices, h = g.vertices, i = a.faces, j = g.faces, k = a.faceVertexUvs[0], q = g.faceVertexUvs[0], m = {}, o = 0; o < a.materials.length; o++) m[a.materials[o].id] = o;
        if (b instanceof THREE.Mesh) b.matrixAutoUpdate && b.updateMatrix(), c = b.matrix, d = new THREE.Matrix4, d.extractRotation(c, b.scale);
        for (var o = 0, p = h.length; o < p; o++) {
            var n = h[o].clone();
            c && c.multiplyVector3(n.position);
            e.push(n)
        }
        for (o = 0, p = j.length; o < p; o++) {
            var e =
                j[o],
                r, s, t = e.vertexNormals,
                w = e.vertexColors;
            e instanceof THREE.Face3 ? r = new THREE.Face3(e.a + f, e.b + f, e.c + f) : e instanceof THREE.Face4 && (r = new THREE.Face4(e.a + f, e.b + f, e.c + f, e.d + f));
            r.normal.copy(e.normal);
            d && d.multiplyVector3(r.normal);
            h = 0;
            for (n = t.length; h < n; h++) s = t[h].clone(), d && d.multiplyVector3(s), r.vertexNormals.push(s);
            r.color.copy(e.color);
            h = 0;
            for (n = w.length; h < n; h++) s = w[h], r.vertexColors.push(s.clone());
            if (void 0 !== e.materialIndex) {
                h = g.materials[e.materialIndex];
                n = h.id;
                w = m[n];
                if (void 0 === w) w = a.materials.length,
                m[n] = w, a.materials.push(h);
                r.materialIndex = w
            }
            r.centroid.copy(e.centroid);
            c && c.multiplyVector3(r.centroid);
            i.push(r)
        }
        for (o = 0, p = q.length; o < p; o++) {
            c = q[o];
            d = [];
            h = 0;
            for (n = c.length; h < n; h++) d.push(new THREE.UV(c[h].u, c[h].v));
            k.push(d)
        }
    },
    clone: function(a) {
        var b = new THREE.Geometry,
            c, d = a.vertices,
            f = a.faces,
            g = a.faceVertexUvs[0];
        if (a.materials) b.materials = a.materials.slice();
        for (a = 0, c = d.length; a < c; a++) b.vertices.push(d[a].clone());
        for (a = 0, c = f.length; a < c; a++) b.faces.push(f[a].clone());
        for (a = 0, c = g.length; a < c; a++) {
            for (var d =
                g[a], f = [], e = 0, h = d.length; e < h; e++) f.push(new THREE.UV(d[e].u, d[e].v));
            b.faceVertexUvs[0].push(f)
        }
        return b
    },
    randomPointInTriangle: function(a, b, c) {
        var d, f, g, e = new THREE.Vector3,
            h = THREE.GeometryUtils.__v1;
        d = THREE.GeometryUtils.random();
        f = THREE.GeometryUtils.random();
        1 < d + f && (d = 1 - d, f = 1 - f);
        g = 1 - d - f;
        e.copy(a);
        e.multiplyScalar(d);
        h.copy(b);
        h.multiplyScalar(f);
        e.addSelf(h);
        h.copy(c);
        h.multiplyScalar(g);
        e.addSelf(h);
        return e
    },
    randomPointInFace: function(a, b, c) {
        var d, f, g;
        if (a instanceof THREE.Face3) return d = b.vertices[a.a].position,
        f = b.vertices[a.b].position, g = b.vertices[a.c].position, THREE.GeometryUtils.randomPointInTriangle(d, f, g);
        if (a instanceof THREE.Face4) {
            d = b.vertices[a.a].position;
            f = b.vertices[a.b].position;
            g = b.vertices[a.c].position;
            var b = b.vertices[a.d].position,
                e;
            c ? a._area1 && a._area2 ? (c = a._area1, e = a._area2) : (c = THREE.GeometryUtils.triangleArea(d, f, b), e = THREE.GeometryUtils.triangleArea(f, g, b), a._area1 = c, a._area2 = e) : (c = THREE.GeometryUtils.triangleArea(d, f, b), e = THREE.GeometryUtils.triangleArea(f, g, b));
            return THREE.GeometryUtils.random() *
                (c + e) < c ? THREE.GeometryUtils.randomPointInTriangle(d, f, b) : THREE.GeometryUtils.randomPointInTriangle(f, g, b)
        }
    },
    randomPointsInGeometry: function(a, b) {
        function c(a) {
            function b(c, d) {
                if (d < c) return c;
                var f = c + Math.floor((d - c) / 2);
                return j[f] > a ? b(c, f - 1) : j[f] < a ? b(f + 1, d) : f
            }
            return b(0, j.length - 1)
        }
        var d, f, g = a.faces,
            e = a.vertices,
            h = g.length,
            i = 0,
            j = [],
            k, q, m, o;
        for (f = 0; f < h; f++) {
            d = g[f];
            if (d instanceof THREE.Face3) k = e[d.a].position, q = e[d.b].position, m = e[d.c].position, d._area = THREE.GeometryUtils.triangleArea(k, q, m);
            else if (d instanceof THREE.Face4) k = e[d.a].position, q = e[d.b].position, m = e[d.c].position, o = e[d.d].position, d._area1 = THREE.GeometryUtils.triangleArea(k, q, o), d._area2 = THREE.GeometryUtils.triangleArea(q, m, o), d._area = d._area1 + d._area2;
            i += d._area;
            j[f] = i
        }
        d = [];
        for (f = 0; f < b; f++) e = THREE.GeometryUtils.random() * i, e = c(e), d[f] = THREE.GeometryUtils.randomPointInFace(g[e], a, !0);
        return d
    },
    triangleArea: function(a, b, c) {
        var d, f = THREE.GeometryUtils.__v1;
        f.sub(a, b);
        d = f.length();
        f.sub(a, c);
        a = f.length();
        f.sub(b, c);
        c = f.length();
        b = 0.5 * (d + a + c);
        return Math.sqrt(b *
            (b - d) * (b - a) * (b - c))
    },
    center: function(a) {
        a.computeBoundingBox();
        var b = a.boundingBox,
            c = new THREE.Vector3;
        c.add(b.min, b.max);
        c.multiplyScalar(-0.5);
        a.applyMatrix((new THREE.Matrix4).setTranslation(c.x, c.y, c.z));
        a.computeBoundingBox();
        return c
    },
    normalizeUVs: function(a) {
        for (var a = a.faceVertexUvs[0], b = 0, c = a.length; b < c; b++)
            for (var d = a[b], f = 0, g = d.length; f < g; f++) 1 !== d[f].u && (d[f].u -= Math.floor(d[f].u)), 1 !== d[f].v && (d[f].v -= Math.floor(d[f].v))
    },
    triangulateQuads: function(a) {
        for (var b = a.faces.length - 1; 0 <= b; b--) {
            var c =
                a.faces[b];
            if (c instanceof THREE.Face4) {
                var d = c.a,
                    f = c.b,
                    g = c.c,
                    e = c.d,
                    h = c.clone(),
                    c = c.clone();
                h.a = d;
                h.b = f;
                h.c = e;
                c.a = f;
                c.b = g;
                c.c = e;
                a.faces.splice(b, 1, h, c);
                for (d = 0; d < a.faceVertexUvs.length; d++) a.faceVertexUvs[d].length && (h = a.faceVertexUvs[d][b], f = h[1], g = h[2], e = h[3], h = [h[0].clone(), f.clone(), e.clone()], f = [f.clone(), g.clone(), e.clone()], a.faceVertexUvs[d].splice(b, 1, h, f));
                for (d = 0; d < a.faceUvs.length; d++) a.faceUvs[d].length && (f = a.faceUvs[d][b], a.faceUvs[d].splice(b, 1, f, f))
            }
        }
        a.computeCentroids();
        a.computeFaceNormals();
        a.computeVertexNormals();
        a.hasTangents && a.computeTangents()
    },
    explode: function(a) {
        for (var b = [], c = 0, d = a.faces.length; c < d; c++) {
            var f = b.length,
                g = a.faces[c];
            if (g instanceof THREE.Face4) {
                var e = g.a,
                    h = g.b,
                    i = g.c,
                    e = a.vertices[e],
                    h = a.vertices[h],
                    i = a.vertices[i],
                    j = a.vertices[g.d];
                b.push(e.clone());
                b.push(h.clone());
                b.push(i.clone());
                b.push(j.clone());
                g.a = f;
                g.b = f + 1;
                g.c = f + 2;
                g.d = f + 3
            } else e = g.a, h = g.b, i = g.c, e = a.vertices[e], h = a.vertices[h], i = a.vertices[i], b.push(e.clone()), b.push(h.clone()), b.push(i.clone()), g.a = f,
            g.b = f + 1, g.c = f + 2
        }
        a.vertices = b
    },
    tessellate: function(a, b) {
        var c, d, f, g, e, h, i, j, k, q, m, o, p, n, r, s, t;
        for (c = a.faces.length - 1; 0 <= c; c--)
            if (d = a.faces[c], d instanceof THREE.Face3) {
                if (f = d.a, g = d.b, e = d.c, i = a.vertices[f], j = a.vertices[g], k = a.vertices[e], m = i.position.distanceTo(j.position), o = j.position.distanceTo(k.position), q = i.position.distanceTo(k.position), m > b || o > b || q > b) {
                    h = a.vertices.length;
                    t = d.clone();
                    d = d.clone();
                    m >= o && m >= q ? (i = i.clone(), i.position.lerpSelf(j.position, 0.5), t.a = f, t.b = h, t.c = e, d.a = h, d.b = g, d.c = e, f =
                        0) : o >= m && o >= q ? (i = j.clone(), i.position.lerpSelf(k.position, 0.5), t.a = f, t.b = g, t.c = h, d.a = h, d.b = e, d.c = f, f = 1) : (i = i.clone(), i.position.lerpSelf(k.position, 0.5), t.a = f, t.b = g, t.c = h, d.a = h, d.b = g, d.c = e, f = 2);
                    a.faces.splice(c, 1, t, d);
                    a.vertices.push(i);
                    for (g = 0; g < a.faceVertexUvs.length; g++) a.faceVertexUvs[g].length && (k = a.faceVertexUvs[g][c], j = k[0], e = k[1], i = k[2], 0 === f ? (m = j.clone(), m.lerpSelf(e, 0.5), k = [j.clone(), m.clone(), i.clone()], e = [m.clone(), e.clone(), i.clone()]) : 1 === f ? (m = e.clone(), m.lerpSelf(i, 0.5), k = [j.clone(),
                        e.clone(), m.clone()
                    ], e = [m.clone(), i.clone(), j.clone()]) : (m = j.clone(), m.lerpSelf(i, 0.5), k = [j.clone(), e.clone(), m.clone()], e = [m.clone(), e.clone(), i.clone()]), a.faceVertexUvs[g].splice(c, 1, k, e))
                }
            } else if (f = d.a, g = d.b, e = d.c, h = d.d, i = a.vertices[f], j = a.vertices[g], k = a.vertices[e], q = a.vertices[h], m = i.position.distanceTo(j.position), o = j.position.distanceTo(k.position), p = k.position.distanceTo(q.position), n = i.position.distanceTo(q.position), m > b || o > b || p > b || n > b) {
            r = a.vertices.length;
            s = a.vertices.length + 1;
            t = d.clone();
            d = d.clone();
            m >= o && m >= p && m >= n || p >= o && p >= m && p >= n ? (m = i.clone(), m.position.lerpSelf(j.position, 0.5), j = k.clone(), j.position.lerpSelf(q.position, 0.5), t.a = f, t.b = r, t.c = s, t.d = h, d.a = r, d.b = g, d.c = e, d.d = s, f = 0) : (m = j.clone(), m.position.lerpSelf(k.position, 0.5), j = q.clone(), j.position.lerpSelf(i.position, 0.5), t.a = f, t.b = g, t.c = r, t.d = s, d.a = s, d.b = r, d.c = e, d.d = h, f = 1);
            a.faces.splice(c, 1, t, d);
            a.vertices.push(m);
            a.vertices.push(j);
            for (g = 0; g < a.faceVertexUvs.length; g++) a.faceVertexUvs[g].length && (k = a.faceVertexUvs[g][c], j = k[0],
                e = k[1], i = k[2], k = k[3], 0 === f ? (m = j.clone(), m.lerpSelf(e, 0.5), o = i.clone(), o.lerpSelf(k, 0.5), j = [j.clone(), m.clone(), o.clone(), k.clone()], e = [m.clone(), e.clone(), i.clone(), o.clone()]) : (m = e.clone(), m.lerpSelf(i, 0.5), o = k.clone(), o.lerpSelf(j, 0.5), j = [j.clone(), e.clone(), m.clone(), o.clone()], e = [o.clone(), m.clone(), i.clone(), k.clone()]), a.faceVertexUvs[g].splice(c, 1, j, e))
        }
    }
};
THREE.GeometryUtils.random = THREE.Math.random16;
THREE.GeometryUtils.__v1 = new THREE.Vector3;
THREE.ImageUtils = {
    crossOrigin: "anonymous",
    loadTexture: function(a, b, c) {
        var d = new Image,
            f = new THREE.Texture(d, b);
        d.onload = function() {
            f.needsUpdate = !0;
            c && c(this)
        };
        d.crossOrigin = this.crossOrigin;
        d.src = a;
        return f
    },
    loadTextureCube: function(a, b, c) {
        var d, f = [],
            g = new THREE.Texture(f, b);
        f.loadCount = 0;
        for (b = 0, d = a.length; b < d; ++b) f[b] = new Image, f[b].onload = function() {
            f.loadCount += 1;
            if (6 === f.loadCount) g.needsUpdate = !0;
            c && c(this)
        }, f[b].crossOrigin = this.crossOrigin, f[b].src = a[b];
        return g
    },
    getNormalMap: function(a,
        b) {
        var c = function(a) {
            var b = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
            return [a[0] / b, a[1] / b, a[2] / b]
        }, b = b | 1,
            d = a.width,
            f = a.height,
            g = document.createElement("canvas");
        g.width = d;
        g.height = f;
        var e = g.getContext("2d");
        e.drawImage(a, 0, 0);
        for (var h = e.getImageData(0, 0, d, f).data, i = e.createImageData(d, f), j = i.data, k = 0; k < d; k++)
            for (var q = 1; q < f; q++) {
                var m = 0 > q - 1 ? f - 1 : q - 1,
                    o = (q + 1) % f,
                    p = 0 > k - 1 ? d - 1 : k - 1,
                    n = (k + 1) % d,
                    r = [],
                    s = [0, 0, h[4 * (q * d + k)] / 255 * b];
                r.push([-1, 0, h[4 * (q * d + p)] / 255 * b]);
                r.push([-1, -1, h[4 * (m * d + p)] / 255 * b]);
                r.push([0, -1,
                    h[4 * (m * d + k)] / 255 * b
                ]);
                r.push([1, -1, h[4 * (m * d + n)] / 255 * b]);
                r.push([1, 0, h[4 * (q * d + n)] / 255 * b]);
                r.push([1, 1, h[4 * (o * d + n)] / 255 * b]);
                r.push([0, 1, h[4 * (o * d + k)] / 255 * b]);
                r.push([-1, 1, h[4 * (o * d + p)] / 255 * b]);
                m = [];
                p = r.length;
                for (o = 0; o < p; o++) {
                    var n = r[o],
                        t = r[(o + 1) % p],
                        n = [n[0] - s[0], n[1] - s[1], n[2] - s[2]],
                        t = [t[0] - s[0], t[1] - s[1], t[2] - s[2]];
                    m.push(c([n[1] * t[2] - n[2] * t[1], n[2] * t[0] - n[0] * t[2], n[0] * t[1] - n[1] * t[0]]))
                }
                r = [0, 0, 0];
                for (o = 0; o < m.length; o++) r[0] += m[o][0], r[1] += m[o][1], r[2] += m[o][2];
                r[0] /= m.length;
                r[1] /= m.length;
                r[2] /= m.length;
                s = 4 * (q * d + k);
                j[s] = 255 * ((r[0] + 1) / 2) | 0;
                j[s + 1] = 255 * (r[1] + 0.5) | 0;
                j[s + 2] = 255 * r[2] | 0;
                j[s + 3] = 255
            }
        e.putImageData(i, 0, 0);
        return g
    },
    generateDataTexture: function(a, b, c) {
        for (var d = a * b, f = new Uint8Array(3 * d), g = Math.floor(255 * c.r), e = Math.floor(255 * c.g), c = Math.floor(255 * c.b), h = 0; h < d; h++) f[3 * h] = g, f[3 * h + 1] = e, f[3 * h + 2] = c;
        a = new THREE.DataTexture(f, a, b, THREE.RGBFormat);
        a.needsUpdate = !0;
        return a
    }
};
THREE.SceneUtils = {
    showHierarchy: function(a, b) {
        THREE.SceneUtils.traverseHierarchy(a, function(a) {
            a.visible = b
        })
    },
    traverseHierarchy: function(a, b) {
        var c, d, f = a.children.length;
        for (d = 0; d < f; d++) c = a.children[d], b(c), THREE.SceneUtils.traverseHierarchy(c, b)
    },
    createMultiMaterialObject: function(a, b) {
        var c, d = b.length,
            f = new THREE.Object3D;
        for (c = 0; c < d; c++) {
            var g = new THREE.Mesh(a, b[c]);
            f.add(g)
        }
        return f
    },
    cloneObject: function(a) {
        var b;
        a instanceof THREE.MorphAnimMesh ? (b = new THREE.MorphAnimMesh(a.geometry, a.material),
            b.duration = a.duration, b.mirroredLoop = a.mirroredLoop, b.time = a.time, b.lastKeyframe = a.lastKeyframe, b.currentKeyframe = a.currentKeyframe, b.direction = a.direction, b.directionBackwards = a.directionBackwards) : a instanceof THREE.SkinnedMesh ? b = new THREE.SkinnedMesh(a.geometry, a.material) : a instanceof THREE.Mesh ? b = new THREE.Mesh(a.geometry, a.material) : a instanceof THREE.Line ? b = new THREE.Line(a.geometry, a.material, a.type) : a instanceof THREE.Ribbon ? b = new THREE.Ribbon(a.geometry, a.material) : a instanceof THREE.ParticleSystem ?
            (b = new THREE.ParticleSystem(a.geometry, a.material), b.sortParticles = a.sortParticles) : a instanceof THREE.Particle ? b = new THREE.Particle(a.material) : a instanceof THREE.Sprite ? (b = new THREE.Sprite({}), b.color.copy(a.color), b.map = a.map, b.blending = a.blending, b.useScreenCoordinates = a.useScreenCoordinates, b.mergeWith3D = a.mergeWith3D, b.affectedByDistance = a.affectedByDistance, b.scaleByViewport = a.scaleByViewport, b.alignment = a.alignment, b.rotation3d.copy(a.rotation3d), b.rotation = a.rotation, b.opacity = a.opacity,
            b.uvOffset.copy(a.uvOffset), b.uvScale.copy(a.uvScale)) : a instanceof THREE.LOD ? b = new THREE.LOD : a instanceof THREE.MarchingCubes ? (b = new THREE.MarchingCubes(a.resolution, a.material), b.field.set(a.field), b.isolation = a.isolation) : a instanceof THREE.Object3D && (b = new THREE.Object3D);
        b.name = a.name;
        b.parent = a.parent;
        b.up.copy(a.up);
        b.position.copy(a.position);
        b.rotation instanceof THREE.Vector3 && b.rotation.copy(a.rotation);
        b.eulerOrder = a.eulerOrder;
        b.scale.copy(a.scale);
        b.dynamic = a.dynamic;
        b.doubleSided = a.doubleSided;
        b.flipSided = a.flipSided;
        b.renderDepth = a.renderDepth;
        b.rotationAutoUpdate = a.rotationAutoUpdate;
        b.matrix.copy(a.matrix);
        b.matrixWorld.copy(a.matrixWorld);
        b.matrixRotationWorld.copy(a.matrixRotationWorld);
        b.matrixAutoUpdate = a.matrixAutoUpdate;
        b.matrixWorldNeedsUpdate = a.matrixWorldNeedsUpdate;
        b.quaternion.copy(a.quaternion);
        b.useQuaternion = a.useQuaternion;
        b.boundRadius = a.boundRadius;
        b.boundRadiusScale = a.boundRadiusScale;
        b.visible = a.visible;
        b.castShadow = a.castShadow;
        b.receiveShadow = a.receiveShadow;
        b.frustumCulled =
            a.frustumCulled;
        for (var c = 0; c < a.children.length; c++) {
            var d = THREE.SceneUtils.cloneObject(a.children[c]);
            b.children[c] = d;
            d.parent = b
        }
        if (a instanceof THREE.LOD)
            for (c = 0; c < a.LODs.length; c++) b.LODs[c] = {
                visibleAtDistance: a.LODs[c].visibleAtDistance,
                object3D: b.children[c]
            };
        return b
    },
    detach: function(a, b, c) {
        a.applyMatrix(b.matrixWorld);
        b.remove(a);
        c.add(a)
    },
    attach: function(a, b, c) {
        var d = new THREE.Matrix4;
        d.getInverse(c.matrixWorld);
        a.applyMatrix(d);
        b.remove(a);
        c.add(a)
    }
};
if (THREE.WebGLRenderer) THREE.ShaderUtils = {
    lib: {
        fresnel: {
            uniforms: {
                mRefractionRatio: {
                    type: "f",
                    value: 1.02
                },
                mFresnelBias: {
                    type: "f",
                    value: 0.1
                },
                mFresnelPower: {
                    type: "f",
                    value: 2
                },
                mFresnelScale: {
                    type: "f",
                    value: 1
                },
                tCube: {
                    type: "t",
                    value: 1,
                    texture: null
                }
            },
            fragmentShader: "uniform samplerCube tCube;\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\nvoid main() {\nvec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );\nvec4 refractedColor = vec4( 1.0, 1.0, 1.0, 1.0 );\nrefractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;\nrefractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;\nrefractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;\nrefractedColor.a = 1.0;\ngl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );\n}",
            vertexShader: "uniform float mRefractionRatio;\nuniform float mFresnelBias;\nuniform float mFresnelScale;\nuniform float mFresnelPower;\nvarying vec3 vReflect;\nvarying vec3 vRefract[3];\nvarying float vReflectionFactor;\nvoid main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\nvec4 mPosition = objectMatrix * vec4( position, 1.0 );\nvec3 nWorld = normalize ( mat3( objectMatrix[0].xyz, objectMatrix[1].xyz, objectMatrix[2].xyz ) * normal );\nvec3 I = mPosition.xyz - cameraPosition;\nvReflect = reflect( I, nWorld );\nvRefract[0] = refract( normalize( I ), nWorld, mRefractionRatio );\nvRefract[1] = refract( normalize( I ), nWorld, mRefractionRatio * 0.99 );\nvRefract[2] = refract( normalize( I ), nWorld, mRefractionRatio * 0.98 );\nvReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), nWorld ), mFresnelPower );\ngl_Position = projectionMatrix * mvPosition;\n}"
        },
        normal: {
            uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
                enableAO: {
                    type: "i",
                    value: 0
                },
                enableDiffuse: {
                    type: "i",
                    value: 0
                },
                enableSpecular: {
                    type: "i",
                    value: 0
                },
                enableReflection: {
                    type: "i",
                    value: 0
                },
                tDiffuse: {
                    type: "t",
                    value: 0,
                    texture: null
                },
                tCube: {
                    type: "t",
                    value: 1,
                    texture: null
                },
                tNormal: {
                    type: "t",
                    value: 2,
                    texture: null
                },
                tSpecular: {
                    type: "t",
                    value: 3,
                    texture: null
                },
                tAO: {
                    type: "t",
                    value: 4,
                    texture: null
                },
                tDisplacement: {
                    type: "t",
                    value: 5,
                    texture: null
                },
                uNormalScale: {
                    type: "f",
                    value: 1
                },
                uDisplacementBias: {
                    type: "f",
                    value: 0
                },
                uDisplacementScale: {
                    type: "f",
                    value: 1
                },
                uDiffuseColor: {
                    type: "c",
                    value: new THREE.Color(16777215)
                },
                uSpecularColor: {
                    type: "c",
                    value: new THREE.Color(1118481)
                },
                uAmbientColor: {
                    type: "c",
                    value: new THREE.Color(16777215)
                },
                uShininess: {
                    type: "f",
                    value: 30
                },
                uOpacity: {
                    type: "f",
                    value: 1
                },
                uReflectivity: {
                    type: "f",
                    value: 0.5
                },
                uOffset: {
                    type: "v2",
                    value: new THREE.Vector2(0, 0)
                },
                uRepeat: {
                    type: "v2",
                    value: new THREE.Vector2(1, 1)
                },
                wrapRGB: {
                    type: "v3",
                    value: new THREE.Vector3(1, 1, 1)
                }
            }]),
            fragmentShader: ["uniform vec3 uAmbientColor;\nuniform vec3 uDiffuseColor;\nuniform vec3 uSpecularColor;\nuniform float uShininess;\nuniform float uOpacity;\nuniform bool enableDiffuse;\nuniform bool enableSpecular;\nuniform bool enableAO;\nuniform bool enableReflection;\nuniform sampler2D tDiffuse;\nuniform sampler2D tNormal;\nuniform sampler2D tSpecular;\nuniform sampler2D tAO;\nuniform samplerCube tCube;\nuniform float uNormalScale;\nuniform float uReflectivity;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nuniform vec3 ambientLightColor;\n#if MAX_DIR_LIGHTS > 0\nuniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\nuniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n#endif\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\n#ifdef WRAP_AROUND\nuniform vec3 wrapRGB;\n#endif\nvarying vec3 vViewPosition;",
                THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, "void main() {\ngl_FragColor = vec4( vec3( 1.0 ), uOpacity );\nvec3 specularTex = vec3( 1.0 );\nvec3 normalTex = texture2D( tNormal, vUv ).xyz * 2.0 - 1.0;\nnormalTex.xy *= uNormalScale;\nnormalTex = normalize( normalTex );\nif( enableDiffuse ) {\n#ifdef GAMMA_INPUT\nvec4 texelColor = texture2D( tDiffuse, vUv );\ntexelColor.xyz *= texelColor.xyz;\ngl_FragColor = gl_FragColor * texelColor;\n#else\ngl_FragColor = gl_FragColor * texture2D( tDiffuse, vUv );\n#endif\n}\nif( enableAO ) {\n#ifdef GAMMA_INPUT\nvec4 aoColor = texture2D( tAO, vUv );\naoColor.xyz *= aoColor.xyz;\ngl_FragColor.xyz = gl_FragColor.xyz * aoColor.xyz;\n#else\ngl_FragColor.xyz = gl_FragColor.xyz * texture2D( tAO, vUv ).xyz;\n#endif\n}\nif( enableSpecular )\nspecularTex = texture2D( tSpecular, vUv ).xyz;\nmat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );\nvec3 finalNormal = tsb * normalTex;\nvec3 normal = normalize( finalNormal );\nvec3 viewPosition = normalize( vViewPosition );\n#if MAX_POINT_LIGHTS > 0\nvec3 pointDiffuse = vec3( 0.0 );\nvec3 pointSpecular = vec3( 0.0 );\nfor ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\nvec3 pointVector = normalize( vPointLight[ i ].xyz );\nfloat pointDistance = vPointLight[ i ].w;\n#ifdef WRAP_AROUND\nfloat pointDiffuseWeightFull = max( dot( normal, pointVector ), 0.0 );\nfloat pointDiffuseWeightHalf = max( 0.5 * dot( normal, pointVector ) + 0.5, 0.0 );\nvec3 pointDiffuseWeight = mix( vec3 ( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n#else\nfloat pointDiffuseWeight = max( dot( normal, pointVector ), 0.0 );\n#endif\npointDiffuse += pointDistance * pointLightColor[ i ] * uDiffuseColor * pointDiffuseWeight;\nvec3 pointHalfVector = normalize( pointVector + viewPosition );\nfloat pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\nfloat pointSpecularWeight = specularTex.r * max( pow( pointDotNormalHalf, uShininess ), 0.0 );\npointSpecular += pointDistance * pointLightColor[ i ] * uSpecularColor * pointSpecularWeight * pointDiffuseWeight;\n}\n#endif\n#if MAX_DIR_LIGHTS > 0\nvec3 dirDiffuse = vec3( 0.0 );\nvec3 dirSpecular = vec3( 0.0 );\nfor( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {\nvec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );\nvec3 dirVector = normalize( lDirection.xyz );\n#ifdef WRAP_AROUND\nfloat directionalLightWeightingFull = max( dot( normal, dirVector ), 0.0 );\nfloat directionalLightWeightingHalf = max( 0.5 * dot( normal, dirVector ) + 0.5, 0.0 );\nvec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), wrapRGB );\n#else\nfloat dirDiffuseWeight = max( dot( normal, dirVector ), 0.0 );\n#endif\ndirDiffuse += directionalLightColor[ i ] * uDiffuseColor * dirDiffuseWeight;\nvec3 dirHalfVector = normalize( dirVector + viewPosition );\nfloat dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\nfloat dirSpecularWeight = specularTex.r * max( pow( dirDotNormalHalf, uShininess ), 0.0 );\ndirSpecular += directionalLightColor[ i ] * uSpecularColor * dirSpecularWeight * dirDiffuseWeight;\n}\n#endif\nvec3 totalDiffuse = vec3( 0.0 );\nvec3 totalSpecular = vec3( 0.0 );\n#if MAX_DIR_LIGHTS > 0\ntotalDiffuse += dirDiffuse;\ntotalSpecular += dirSpecular;\n#endif\n#if MAX_POINT_LIGHTS > 0\ntotalDiffuse += pointDiffuse;\ntotalSpecular += pointSpecular;\n#endif\ngl_FragColor.xyz = gl_FragColor.xyz * ( totalDiffuse + ambientLightColor * uAmbientColor) + totalSpecular;\nif ( enableReflection ) {\nvec3 wPos = cameraPosition - vViewPosition;\nvec3 vReflect = reflect( normalize( wPos ), normal );\nvec4 cubeColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );\n#ifdef GAMMA_INPUT\ncubeColor.xyz *= cubeColor.xyz;\n#endif\ngl_FragColor.xyz = mix( gl_FragColor.xyz, cubeColor.xyz, specularTex.r * uReflectivity );\n}",
                THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "}"
            ].join("\n"),
            vertexShader: ["attribute vec4 tangent;\nuniform vec2 uOffset;\nuniform vec2 uRepeat;\n#ifdef VERTEX_TEXTURES\nuniform sampler2D tDisplacement;\nuniform float uDisplacementScale;\nuniform float uDisplacementBias;\n#endif\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 vNormal;\nvarying vec2 vUv;\n#if MAX_POINT_LIGHTS > 0\nuniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\nuniform float pointLightDistance[ MAX_POINT_LIGHTS ];\nvarying vec4 vPointLight[ MAX_POINT_LIGHTS ];\n#endif\nvarying vec3 vViewPosition;",
                THREE.ShaderChunk.shadowmap_pars_vertex, "void main() {\nvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\nvViewPosition = -mvPosition.xyz;\nvNormal = normalMatrix * normal;\nvTangent = normalMatrix * tangent.xyz;\nvBinormal = cross( vNormal, vTangent ) * tangent.w;\nvUv = uv * uRepeat + uOffset;\n#if MAX_POINT_LIGHTS > 0\nfor( int i = 0; i < MAX_POINT_LIGHTS; i++ ) {\nvec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\nvec3 lVector = lPosition.xyz - mvPosition.xyz;\nfloat lDistance = 1.0;\nif ( pointLightDistance[ i ] > 0.0 )\nlDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );\nlVector = normalize( lVector );\nvPointLight[ i ] = vec4( lVector, lDistance );\n}\n#endif\n#ifdef VERTEX_TEXTURES\nvec3 dv = texture2D( tDisplacement, uv ).xyz;\nfloat df = uDisplacementScale * dv.x + uDisplacementBias;\nvec4 displacedPosition = vec4( normalize( vNormal.xyz ) * df, 0.0 ) + mvPosition;\ngl_Position = projectionMatrix * displacedPosition;\n#else\ngl_Position = projectionMatrix * mvPosition;\n#endif",
                THREE.ShaderChunk.shadowmap_vertex, "}"
            ].join("\n")
        },
        cube: {
            uniforms: {
                tCube: {
                    type: "t",
                    value: 1,
                    texture: null
                },
                tFlip: {
                    type: "f",
                    value: -1
                }
            },
            vertexShader: "varying vec3 vViewPosition;\nvoid main() {\nvec4 mPosition = objectMatrix * vec4( position, 1.0 );\nvViewPosition = cameraPosition - mPosition.xyz;\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",
            fragmentShader: "uniform samplerCube tCube;\nuniform float tFlip;\nvarying vec3 vViewPosition;\nvoid main() {\nvec3 wPos = cameraPosition - vViewPosition;\ngl_FragColor = textureCube( tCube, vec3( tFlip * wPos.x, wPos.yz ) );\n}"
        }
    }
};
THREE.BufferGeometry = function() {
    this.id = THREE.GeometryCount++;
    this.vertexColorArray = this.vertexUvArray = this.vertexNormalArray = this.vertexPositionArray = this.vertexIndexArray = this.vertexColorBuffer = this.vertexUvBuffer = this.vertexNormalBuffer = this.vertexPositionBuffer = this.vertexIndexBuffer = null;
    this.dynamic = !1;
    this.boundingSphere = this.boundingBox = null;
    this.morphTargets = []
};
THREE.BufferGeometry.prototype = {
    constructor: THREE.BufferGeometry,
    computeBoundingBox: function() {},
    computeBoundingSphere: function() {}
};
THREE.Curve = function() {};
THREE.Curve.prototype.getPoint = function() {
    console.log("Warning, getPoint() not implemented!");
    return null
};
THREE.Curve.prototype.getPointAt = function(a) {
    return this.getPoint(this.getUtoTmapping(a))
};
THREE.Curve.prototype.getPoints = function(a) {
    a || (a = 5);
    var b, c = [];
    for (b = 0; b <= a; b++) c.push(this.getPoint(b / a));
    return c
};
THREE.Curve.prototype.getSpacedPoints = function(a) {
    a || (a = 5);
    var b, c = [];
    for (b = 0; b <= a; b++) c.push(this.getPointAt(b / a));
    return c
};
THREE.Curve.prototype.getLength = function() {
    var a = this.getLengths();
    return a[a.length - 1]
};
THREE.Curve.prototype.getLengths = function(a) {
    a || (a = 200);
    if (this.cacheArcLengths && this.cacheArcLengths.length == a + 1) return this.cacheArcLengths;
    var b = [],
        c, d = this.getPoint(0),
        f, g = 0;
    b.push(0);
    for (f = 1; f <= a; f++) c = this.getPoint(f / a), g += c.distanceTo(d), b.push(g), d = c;
    return this.cacheArcLengths = b
};
THREE.Curve.prototype.getUtoTmapping = function(a, b) {
    var c = this.getLengths(),
        d = 0,
        f = c.length,
        g;
    g = b ? b : a * c[f - 1];
    for (var e = 0, h = f - 1, i; e <= h;)
        if (d = Math.floor(e + (h - e) / 2), i = c[d] - g, 0 > i) e = d + 1;
        else if (0 < i) h = d - 1;
    else {
        h = d;
        break
    }
    d = h;
    if (c[d] == g) return d / (f - 1);
    e = c[d];
    return c = (d + (g - e) / (c[d + 1] - e)) / (f - 1)
};
THREE.Curve.prototype.getNormalVector = function(a) {
    a = this.getTangent(a);
    return new THREE.Vector2(-a.y, a.x)
};
THREE.Curve.prototype.getTangent = function(a) {
    var b = a - 1.0E-4,
        a = a + 1.0E-4;
    0 > b && (b = 0);
    1 < a && (a = 1);
    b = this.getPoint(b);
    a = this.getPoint(a);
    return b.clone().subSelf(a).normalize()
};
THREE.Curve.prototype.getTangentAt = function(a) {
    return this.getTangent(this.getUtoTmapping(a))
};
THREE.LineCurve = function(a, b) {
    a instanceof THREE.Vector2 ? (this.v1 = a, this.v2 = b) : THREE.LineCurve.oldConstructor.apply(this, arguments)
};
THREE.LineCurve.oldConstructor = function(a, b, c, d) {
    this.constructor(new THREE.Vector2(a, b), new THREE.Vector2(c, d))
};
THREE.LineCurve.prototype = new THREE.Curve;
THREE.LineCurve.prototype.constructor = THREE.LineCurve;
THREE.LineCurve.prototype.getPoint = function(a) {
    var b = new THREE.Vector2;
    b.sub(this.v2, this.v1);
    b.multiplyScalar(a).addSelf(this.v1);
    return b
};
THREE.LineCurve.prototype.getPointAt = function(a) {
    return this.getPoint(a)
};
THREE.LineCurve.prototype.getTangent = function() {
    var a = new THREE.Vector2;
    a.sub(this.v2, this.v1);
    a.normalize();
    return a
};
THREE.QuadraticBezierCurve = function(a, b, c) {
    if (!(b instanceof THREE.Vector2)) var d = Array.prototype.slice.call(arguments),
    a = new THREE.Vector2(d[0], d[1]), b = new THREE.Vector2(d[2], d[3]), c = new THREE.Vector2(d[4], d[5]);
    this.v0 = a;
    this.v1 = b;
    this.v2 = c
};
THREE.QuadraticBezierCurve.prototype = new THREE.Curve;
THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve;
THREE.QuadraticBezierCurve.prototype.getPoint = function(a) {
    var b;
    b = THREE.Shape.Utils.b2(a, this.v0.x, this.v1.x, this.v2.x);
    a = THREE.Shape.Utils.b2(a, this.v0.y, this.v1.y, this.v2.y);
    return new THREE.Vector2(b, a)
};
THREE.QuadraticBezierCurve.prototype.getTangent = function(a) {
    var b;
    b = THREE.Curve.Utils.tangentQuadraticBezier(a, this.v0.x, this.v1.x, this.v2.x);
    a = THREE.Curve.Utils.tangentQuadraticBezier(a, this.v0.y, this.v1.y, this.v2.y);
    b = new THREE.Vector2(b, a);
    b.normalize();
    return b
};
THREE.CubicBezierCurve = function(a, b, c, d) {
    if (!(b instanceof THREE.Vector2)) var f = Array.prototype.slice.call(arguments),
    a = new THREE.Vector2(f[0], f[1]), b = new THREE.Vector2(f[2], f[3]), c = new THREE.Vector2(f[4], f[5]), d = new THREE.Vector2(f[6], f[7]);
    this.v0 = a;
    this.v1 = b;
    this.v2 = c;
    this.v3 = d
};
THREE.CubicBezierCurve.prototype = new THREE.Curve;
THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve;
THREE.CubicBezierCurve.prototype.getPoint = function(a) {
    var b;
    b = THREE.Shape.Utils.b3(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x);
    a = THREE.Shape.Utils.b3(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y);
    return new THREE.Vector2(b, a)
};
THREE.CubicBezierCurve.prototype.getTangent = function(a) {
    var b;
    b = THREE.Curve.Utils.tangentCubicBezier(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x);
    a = THREE.Curve.Utils.tangentCubicBezier(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y);
    b = new THREE.Vector2(b, a);
    b.normalize();
    return b
};
THREE.SplineCurve = function(a) {
    this.points = void 0 == a ? [] : a
};
THREE.SplineCurve.prototype = new THREE.Curve;
THREE.SplineCurve.prototype.constructor = THREE.SplineCurve;
THREE.SplineCurve.prototype.getPoint = function(a) {
    var b = new THREE.Vector2,
        c = [],
        d = this.points,
        f;
    f = (d.length - 1) * a;
    a = Math.floor(f);
    f -= a;
    c[0] = 0 == a ? a : a - 1;
    c[1] = a;
    c[2] = a > d.length - 2 ? a : a + 1;
    c[3] = a > d.length - 3 ? a : a + 2;
    b.x = THREE.Curve.Utils.interpolate(d[c[0]].x, d[c[1]].x, d[c[2]].x, d[c[3]].x, f);
    b.y = THREE.Curve.Utils.interpolate(d[c[0]].y, d[c[1]].y, d[c[2]].y, d[c[3]].y, f);
    return b
};
THREE.ArcCurve = function(a, b, c, d, f, g) {
    this.aX = a;
    this.aY = b;
    this.aRadius = c;
    this.aStartAngle = d;
    this.aEndAngle = f;
    this.aClockwise = g
};
THREE.ArcCurve.prototype = new THREE.Curve;
THREE.ArcCurve.prototype.constructor = THREE.ArcCurve;
THREE.ArcCurve.prototype.getPoint = function(a) {
    var b = this.aEndAngle - this.aStartAngle;
    this.aClockwise || (a = 1 - a);
    b = this.aStartAngle + a * b;
    a = this.aX + this.aRadius * Math.cos(b);
    b = this.aY + this.aRadius * Math.sin(b);
    return new THREE.Vector2(a, b)
};
THREE.Curve.Utils = {
    tangentQuadraticBezier: function(a, b, c, d) {
        return 2 * (1 - a) * (c - b) + 2 * a * (d - c)
    },
    tangentCubicBezier: function(a, b, c, d, f) {
        return -3 * b * (1 - a) * (1 - a) + 3 * c * (1 - a) * (1 - a) - 6 * a * c * (1 - a) + 6 * a * d * (1 - a) - 3 * a * a * d + 3 * a * a * f
    },
    tangentSpline: function(a) {
        return 6 * a * a - 6 * a + (3 * a * a - 4 * a + 1) + (-6 * a * a + 6 * a) + (3 * a * a - 2 * a)
    },
    interpolate: function(a, b, c, d, f) {
        var a = 0.5 * (c - a),
            d = 0.5 * (d - b),
            g = f * f;
        return (2 * b - 2 * c + a + d) * f * g + (-3 * b + 3 * c - 2 * a - d) * g + a * f + b
    }
};
THREE.Curve.create = function(a, b) {
    a.prototype = new THREE.Curve;
    a.prototype.constructor = a;
    a.prototype.getPoint = b;
    return a
};
THREE.LineCurve3 = THREE.Curve.create(function(a, b) {
    this.v1 = a;
    this.v2 = b
}, function(a) {
    var b = new THREE.Vector3;
    b.sub(this.v2, this.v1);
    b.multiplyScalar(a);
    b.addSelf(this.v1);
    return b
});
THREE.QuadraticBezierCurve3 = THREE.Curve.create(function(a, b, c) {
    this.v0 = a;
    this.v1 = b;
    this.v2 = c
}, function(a) {
    var b, c;
    b = THREE.Shape.Utils.b2(a, this.v0.x, this.v1.x, this.v2.x);
    c = THREE.Shape.Utils.b2(a, this.v0.y, this.v1.y, this.v2.y);
    a = THREE.Shape.Utils.b2(a, this.v0.z, this.v1.z, this.v2.z);
    return new THREE.Vector3(b, c, a)
});
THREE.CubicBezierCurve3 = THREE.Curve.create(function(a, b, c, d) {
    this.v0 = a;
    this.v1 = b;
    this.v2 = c;
    this.v3 = d
}, function(a) {
    var b, c;
    b = THREE.Shape.Utils.b3(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x);
    c = THREE.Shape.Utils.b3(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y);
    a = THREE.Shape.Utils.b3(a, this.v0.z, this.v1.z, this.v2.z, this.v3.z);
    return new THREE.Vector3(b, c, a)
});
THREE.SplineCurve3 = THREE.Curve.create(function(a) {
    this.points = void 0 == a ? [] : a
}, function(a) {
    var b = new THREE.Vector3,
        c = [],
        d = this.points,
        f;
    f = (d.length - 1) * a;
    a = Math.floor(f);
    f -= a;
    c[0] = 0 == a ? a : a - 1;
    c[1] = a;
    c[2] = a > d.length - 2 ? a : a + 1;
    c[3] = a > d.length - 3 ? a : a + 2;
    b.x = THREE.Curve.Utils.interpolate(d[c[0]].x, d[c[1]].x, d[c[2]].x, d[c[3]].x, f);
    b.y = THREE.Curve.Utils.interpolate(d[c[0]].y, d[c[1]].y, d[c[2]].y, d[c[3]].y, f);
    b.z = THREE.Curve.Utils.interpolate(d[c[0]].z, d[c[1]].z, d[c[2]].z, d[c[3]].z, f);
    return b
});
THREE.CurvePath = function() {
    this.curves = [];
    this.bends = [];
    this.autoClose = !1
};
THREE.CurvePath.prototype = new THREE.Curve;
THREE.CurvePath.prototype.constructor = THREE.CurvePath;
THREE.CurvePath.prototype.add = function(a) {
    this.curves.push(a)
};
THREE.CurvePath.prototype.checkConnection = function() {};
THREE.CurvePath.prototype.closePath = function() {
    var a = this.curves[0].getPoint(0),
        b = this.curves[this.curves.length - 1].getPoint(1);
    a.equals(b) || this.curves.push(new THREE.LineCurve(b, a))
};
THREE.CurvePath.prototype.getPoint = function(a) {
    for (var b = a * this.getLength(), c = this.getCurveLengths(), a = 0; a < c.length;) {
        if (c[a] >= b) return b = c[a] - b, a = this.curves[a], b = 1 - b / a.getLength(), a.getPointAt(b);
        a++
    }
    return null
};
THREE.CurvePath.prototype.getLength = function() {
    var a = this.getCurveLengths();
    return a[a.length - 1]
};
THREE.CurvePath.prototype.getCurveLengths = function() {
    if (this.cacheLengths && this.cacheLengths.length == this.curves.length) return this.cacheLengths;
    var a = [],
        b = 0,
        c, d = this.curves.length;
    for (c = 0; c < d; c++) b += this.curves[c].getLength(), a.push(b);
    return this.cacheLengths = a
};
THREE.CurvePath.prototype.getBoundingBox = function() {
    var a = this.getPoints(),
        b, c, d, f;
    b = c = Number.NEGATIVE_INFINITY;
    d = f = Number.POSITIVE_INFINITY;
    var g, e, h, i;
    i = new THREE.Vector2;
    for (e = 0, h = a.length; e < h; e++) {
        g = a[e];
        if (g.x > b) b = g.x;
        else if (g.x < d) d = g.x;
        if (g.y > c) c = g.y;
        else if (g.y < c) f = g.y;
        i.addSelf(g.x, g.y)
    }
    return {
        minX: d,
        minY: f,
        maxX: b,
        maxY: c,
        centroid: i.divideScalar(h)
    }
};
THREE.CurvePath.prototype.createPointsGeometry = function(a) {
    return this.createGeometry(this.getPoints(a, !0))
};
THREE.CurvePath.prototype.createSpacedPointsGeometry = function(a) {
    return this.createGeometry(this.getSpacedPoints(a, !0))
};
THREE.CurvePath.prototype.createGeometry = function(a) {
    for (var b = new THREE.Geometry, c = 0; c < a.length; c++) b.vertices.push(new THREE.Vertex(new THREE.Vector3(a[c].x, a[c].y, 0)));
    return b
};
THREE.CurvePath.prototype.addWrapPath = function(a) {
    this.bends.push(a)
};
THREE.CurvePath.prototype.getTransformedPoints = function(a, b) {
    var c = this.getPoints(a),
        d, f;
    if (!b) b = this.bends;
    for (d = 0, f = b.length; d < f; d++) c = this.getWrapPoints(c, b[d]);
    return c
};
THREE.CurvePath.prototype.getTransformedSpacedPoints = function(a, b) {
    var c = this.getSpacedPoints(a),
        d, f;
    if (!b) b = this.bends;
    for (d = 0, f = b.length; d < f; d++) c = this.getWrapPoints(c, b[d]);
    return c
};
THREE.CurvePath.prototype.getWrapPoints = function(a, b) {
    var c = this.getBoundingBox(),
        d, f, g, e, h, i;
    for (d = 0, f = a.length; d < f; d++) g = a[d], e = g.x, h = g.y, i = e / c.maxX, i = b.getUtoTmapping(i, e), e = b.getPoint(i), h = b.getNormalVector(i).multiplyScalar(h), g.x = e.x + h.x, g.y = e.y + h.y;
    return a
};
THREE.EventTarget = function() {
    var a = {};
    this.addEventListener = function(b, c) {
        void 0 == a[b] && (a[b] = []); - 1 === a[b].indexOf(c) && a[b].push(c)
    };
    this.dispatchEvent = function(b) {
        for (var c in a[b.type]) a[b.type][c](b)
    };
    this.removeEventListener = function(b, c) {
        var d = a[b].indexOf(c); - 1 !== d && a[b].splice(d, 1)
    }
};
THREE.Gyroscope = function() {
    THREE.Object3D.call(this)
};
THREE.Gyroscope.prototype = new THREE.Object3D;
THREE.Gyroscope.prototype.constructor = THREE.Gyroscope;
THREE.Gyroscope.prototype.updateMatrixWorld = function(a) {
    this.matrixAutoUpdate && this.updateMatrix();
    if (this.matrixWorldNeedsUpdate || a) this.parent ? (this.matrixWorld.multiply(this.parent.matrixWorld, this.matrix), this.matrixWorld.decompose(this.translationWorld, this.rotationWorld, this.scaleWorld), this.matrix.decompose(this.translationObject, this.rotationObject, this.scaleObject), this.matrixWorld.compose(this.translationWorld, this.rotationObject, this.scaleWorld)) : this.matrixWorld.copy(this.matrix), this.matrixWorldNeedsUpdate = !1, a = !0;
    for (var b = 0, c = this.children.length; b < c; b++) this.children[b].updateMatrixWorld(a)
};
THREE.Gyroscope.prototype.translationWorld = new THREE.Vector3;
THREE.Gyroscope.prototype.translationObject = new THREE.Vector3;
THREE.Gyroscope.prototype.rotationWorld = new THREE.Quaternion;
THREE.Gyroscope.prototype.rotationObject = new THREE.Quaternion;
THREE.Gyroscope.prototype.scaleWorld = new THREE.Vector3;
THREE.Gyroscope.prototype.scaleObject = new THREE.Vector3;
THREE.Path = function(a) {
    THREE.CurvePath.call(this);
    this.actions = [];
    a && this.fromPoints(a)
};
THREE.Path.prototype = new THREE.CurvePath;
THREE.Path.prototype.constructor = THREE.Path;
THREE.PathActions = {
    MOVE_TO: "moveTo",
    LINE_TO: "lineTo",
    QUADRATIC_CURVE_TO: "quadraticCurveTo",
    BEZIER_CURVE_TO: "bezierCurveTo",
    CSPLINE_THRU: "splineThru",
    ARC: "arc"
};
THREE.Path.prototype.fromPoints = function(a) {
    this.moveTo(a[0].x, a[0].y);
    for (var b = 1, c = a.length; b < c; b++) this.lineTo(a[b].x, a[b].y)
};
THREE.Path.prototype.moveTo = function(a, b) {
    var c = Array.prototype.slice.call(arguments);
    this.actions.push({
        action: THREE.PathActions.MOVE_TO,
        args: c
    })
};
THREE.Path.prototype.lineTo = function(a, b) {
    var c = Array.prototype.slice.call(arguments),
        d = this.actions[this.actions.length - 1].args;
    this.curves.push(new THREE.LineCurve(new THREE.Vector2(d[d.length - 2], d[d.length - 1]), new THREE.Vector2(a, b)));
    this.actions.push({
        action: THREE.PathActions.LINE_TO,
        args: c
    })
};
THREE.Path.prototype.quadraticCurveTo = function(a, b, c, d) {
    var f = Array.prototype.slice.call(arguments),
        g = this.actions[this.actions.length - 1].args;
    this.curves.push(new THREE.QuadraticBezierCurve(new THREE.Vector2(g[g.length - 2], g[g.length - 1]), new THREE.Vector2(a, b), new THREE.Vector2(c, d)));
    this.actions.push({
        action: THREE.PathActions.QUADRATIC_CURVE_TO,
        args: f
    })
};
THREE.Path.prototype.bezierCurveTo = function(a, b, c, d, f, g) {
    var e = Array.prototype.slice.call(arguments),
        h = this.actions[this.actions.length - 1].args;
    this.curves.push(new THREE.CubicBezierCurve(new THREE.Vector2(h[h.length - 2], h[h.length - 1]), new THREE.Vector2(a, b), new THREE.Vector2(c, d), new THREE.Vector2(f, g)));
    this.actions.push({
        action: THREE.PathActions.BEZIER_CURVE_TO,
        args: e
    })
};
THREE.Path.prototype.splineThru = function(a) {
    var b = Array.prototype.slice.call(arguments),
        c = this.actions[this.actions.length - 1].args,
        c = [new THREE.Vector2(c[c.length - 2], c[c.length - 1])];
    Array.prototype.push.apply(c, a);
    this.curves.push(new THREE.SplineCurve(c));
    this.actions.push({
        action: THREE.PathActions.CSPLINE_THRU,
        args: b
    })
};
THREE.Path.prototype.arc = function(a, b, c, d, f, g) {
    var e = Array.prototype.slice.call(arguments);
    this.curves.push(new THREE.ArcCurve(a, b, c, d, f, g));
    this.actions.push({
        action: THREE.PathActions.ARC,
        args: e
    })
};
THREE.Path.prototype.getSpacedPoints = function(a) {
    a || (a = 40);
    for (var b = [], c = 0; c < a; c++) b.push(this.getPoint(c / a));
    return b
};
THREE.Path.prototype.getPoints = function(a, b) {
    var a = a || 12,
        c = [],
        d, f, g, e, h, i, j, k, q, m, o, p, n;
    for (d = 0, f = this.actions.length; d < f; d++) switch (g = this.actions[d], e = g.action, g = g.args, e) {
        case THREE.PathActions.LINE_TO:
            c.push(new THREE.Vector2(g[0], g[1]));
            break;
        case THREE.PathActions.QUADRATIC_CURVE_TO:
            h = g[2];
            i = g[3];
            q = g[0];
            m = g[1];
            0 < c.length ? (e = c[c.length - 1], o = e.x, p = e.y) : (e = this.actions[d - 1].args, o = e[e.length - 2], p = e[e.length - 1]);
            for (e = 1; e <= a; e++) n = e / a, g = THREE.Shape.Utils.b2(n, o, q, h), n = THREE.Shape.Utils.b2(n, p, m,
                i), c.push(new THREE.Vector2(g, n));
            break;
        case THREE.PathActions.BEZIER_CURVE_TO:
            h = g[4];
            i = g[5];
            q = g[0];
            m = g[1];
            j = g[2];
            k = g[3];
            0 < c.length ? (e = c[c.length - 1], o = e.x, p = e.y) : (e = this.actions[d - 1].args, o = e[e.length - 2], p = e[e.length - 1]);
            for (e = 1; e <= a; e++) n = e / a, g = THREE.Shape.Utils.b3(n, o, q, j, h), n = THREE.Shape.Utils.b3(n, p, m, k, i), c.push(new THREE.Vector2(g, n));
            break;
        case THREE.PathActions.CSPLINE_THRU:
            e = this.actions[d - 1].args;
            e = [new THREE.Vector2(e[e.length - 2], e[e.length - 1])];
            n = a * g[0].length;
            e = e.concat(g[0]);
            g = new THREE.SplineCurve(e);
            for (e = 1; e <= n; e++) c.push(g.getPointAt(e / n));
            break;
        case THREE.PathActions.ARC:
            e = this.actions[d - 1].args;
            h = g[0];
            i = g[1];
            j = g[2];
            q = g[3];
            n = g[4];
            m = !! g[5];
            k = e[e.length - 2];
            o = e[e.length - 1];
            0 == e.length && (k = o = 0);
            p = n - q;
            var r = 2 * a;
            for (e = 1; e <= r; e++) n = e / r, m || (n = 1 - n), n = q + n * p, g = k + h + j * Math.cos(n), n = o + i + j * Math.sin(n), c.push(new THREE.Vector2(g, n))
    }
    b && c.push(c[0]);
    return c
};
THREE.Path.prototype.transform = function(a, b) {
    this.getBoundingBox();
    return this.getWrapPoints(this.getPoints(b), a)
};
THREE.Path.prototype.nltransform = function(a, b, c, d, f, g) {
    var e = this.getPoints(),
        h, i, j, k, q;
    for (h = 0, i = e.length; h < i; h++) j = e[h], k = j.x, q = j.y, j.x = a * k + b * q + c, j.y = d * q + f * k + g;
    return e
};
THREE.Path.prototype.debug = function(a) {
    var b = this.getBoundingBox();
    a || (a = document.createElement("canvas"), a.setAttribute("width", b.maxX + 100), a.setAttribute("height", b.maxY + 100), document.body.appendChild(a));
    b = a.getContext("2d");
    b.fillStyle = "white";
    b.fillRect(0, 0, a.width, a.height);
    b.strokeStyle = "black";
    b.beginPath();
    var c, d, f;
    for (a = 0, c = this.actions.length; a < c; a++) d = this.actions[a], f = d.args, d = d.action, d != THREE.PathActions.CSPLINE_THRU && b[d].apply(b, f);
    b.stroke();
    b.closePath();
    b.strokeStyle = "red";
    d =
        this.getPoints();
    for (a = 0, c = d.length; a < c; a++) f = d[a], b.beginPath(), b.arc(f.x, f.y, 1.5, 0, 2 * Math.PI, !1), b.stroke(), b.closePath()
};
THREE.Path.prototype.toShapes = function() {
    var a, b, c, d, f = [],
        g = new THREE.Path;
    for (a = 0, b = this.actions.length; a < b; a++) c = this.actions[a], d = c.args, c = c.action, c == THREE.PathActions.MOVE_TO && 0 != g.actions.length && (f.push(g), g = new THREE.Path), g[c].apply(g, d);
    0 != g.actions.length && f.push(g);
    if (0 == f.length) return [];
    var e;
    d = [];
    a = !THREE.Shape.Utils.isClockWise(f[0].getPoints());
    if (1 == f.length) return g = f[0], e = new THREE.Shape, e.actions = g.actions, e.curves = g.curves, d.push(e), d;
    if (a) {
        e = new THREE.Shape;
        for (a = 0, b = f.length; a <
            b; a++) g = f[a], THREE.Shape.Utils.isClockWise(g.getPoints()) ? (e.actions = g.actions, e.curves = g.curves, d.push(e), e = new THREE.Shape) : e.holes.push(g)
    } else {
        for (a = 0, b = f.length; a < b; a++) g = f[a], THREE.Shape.Utils.isClockWise(g.getPoints()) ? (e && d.push(e), e = new THREE.Shape, e.actions = g.actions, e.curves = g.curves) : e.holes.push(g);
        d.push(e)
    }
    return d
};
THREE.Shape = function() {
    THREE.Path.apply(this, arguments);
    this.holes = []
};
THREE.Shape.prototype = new THREE.Path;
THREE.Shape.prototype.constructor = THREE.Path;
THREE.Shape.prototype.extrude = function(a) {
    return new THREE.ExtrudeGeometry(this, a)
};
THREE.Shape.prototype.getPointsHoles = function(a) {
    var b, c = this.holes.length,
        d = [];
    for (b = 0; b < c; b++) d[b] = this.holes[b].getTransformedPoints(a, this.bends);
    return d
};
THREE.Shape.prototype.getSpacedPointsHoles = function(a) {
    var b, c = this.holes.length,
        d = [];
    for (b = 0; b < c; b++) d[b] = this.holes[b].getTransformedSpacedPoints(a, this.bends);
    return d
};
THREE.Shape.prototype.extractAllPoints = function(a) {
    return {
        shape: this.getTransformedPoints(a),
        holes: this.getPointsHoles(a)
    }
};
THREE.Shape.prototype.extractAllSpacedPoints = function(a) {
    return {
        shape: this.getTransformedSpacedPoints(a),
        holes: this.getSpacedPointsHoles(a)
    }
};
THREE.Shape.Utils = {
    removeHoles: function(a, b) {
        var c = a.concat(),
            d = c.concat(),
            f, g, e, h, i, j, k, q, m, o, p = [];
        for (i = 0; i < b.length; i++) {
            j = b[i];
            Array.prototype.push.apply(d, j);
            g = Number.POSITIVE_INFINITY;
            for (f = 0; f < j.length; f++) {
                m = j[f];
                o = [];
                for (q = 0; q < c.length; q++) k = c[q], k = m.distanceToSquared(k), o.push(k), k < g && (g = k, e = f, h = q)
            }
            f = 0 <= h - 1 ? h - 1 : c.length - 1;
            g = 0 <= e - 1 ? e - 1 : j.length - 1;
            var n = [j[e], c[h], c[f]];
            q = THREE.FontUtils.Triangulate.area(n);
            var r = [j[e], j[g], c[h]];
            m = THREE.FontUtils.Triangulate.area(r);
            o = h;
            k = e;
            h += 1;
            e += -1;
            0 >
                h && (h += c.length);
            h %= c.length;
            0 > e && (e += j.length);
            e %= j.length;
            f = 0 <= h - 1 ? h - 1 : c.length - 1;
            g = 0 <= e - 1 ? e - 1 : j.length - 1;
            n = [j[e], c[h], c[f]];
            n = THREE.FontUtils.Triangulate.area(n);
            r = [j[e], j[g], c[h]];
            r = THREE.FontUtils.Triangulate.area(r);
            q + m > n + r && (h = o, e = k, 0 > h && (h += c.length), h %= c.length, 0 > e && (e += j.length), e %= j.length, f = 0 <= h - 1 ? h - 1 : c.length - 1, g = 0 <= e - 1 ? e - 1 : j.length - 1);
            q = c.slice(0, h);
            m = c.slice(h);
            o = j.slice(e);
            k = j.slice(0, e);
            g = [j[e], j[g], c[h]];
            p.push([j[e], c[h], c[f]]);
            p.push(g);
            c = q.concat(o).concat(k).concat(m)
        }
        return {
            shape: c,
            isolatedPts: p,
            allpoints: d
        }
    },
    triangulateShape: function(a, b) {
        var c = THREE.Shape.Utils.removeHoles(a, b),
            d = c.allpoints,
            f = c.isolatedPts,
            c = THREE.FontUtils.Triangulate(c.shape, !1),
            g, e, h, i, j = {};
        for (g = 0, e = d.length; g < e; g++) i = d[g].x + ":" + d[g].y, void 0 !== j[i] && console.log("Duplicate point", i), j[i] = g;
        for (g = 0, e = c.length; g < e; g++) {
            h = c[g];
            for (d = 0; 3 > d; d++) i = h[d].x + ":" + h[d].y, i = j[i], void 0 !== i && (h[d] = i)
        }
        for (g = 0, e = f.length; g < e; g++) {
            h = f[g];
            for (d = 0; 3 > d; d++) i = h[d].x + ":" + h[d].y, i = j[i], void 0 !== i && (h[d] = i)
        }
        return c.concat(f)
    },
    isClockWise: function(a) {
        return 0 > THREE.FontUtils.Triangulate.area(a)
    },
    b2p0: function(a, b) {
        var c = 1 - a;
        return c * c * b
    },
    b2p1: function(a, b) {
        return 2 * (1 - a) * a * b
    },
    b2p2: function(a, b) {
        return a * a * b
    },
    b2: function(a, b, c, d) {
        return this.b2p0(a, b) + this.b2p1(a, c) + this.b2p2(a, d)
    },
    b3p0: function(a, b) {
        var c = 1 - a;
        return c * c * c * b
    },
    b3p1: function(a, b) {
        var c = 1 - a;
        return 3 * c * c * a * b
    },
    b3p2: function(a, b) {
        return 3 * (1 - a) * a * a * b
    },
    b3p3: function(a, b) {
        return a * a * a * b
    },
    b3: function(a, b, c, d, f) {
        return this.b3p0(a, b) + this.b3p1(a, c) + this.b3p2(a, d) +
            this.b3p3(a, f)
    }
};
THREE.TextPath = function(a, b) {
    THREE.Path.call(this);
    this.parameters = b || {};
    this.set(a)
};
THREE.TextPath.prototype.set = function(a, b) {
    b = b || this.parameters;
    this.text = a;
    var c = void 0 !== b.curveSegments ? b.curveSegments : 4,
        d = void 0 !== b.font ? b.font : "helvetiker",
        f = void 0 !== b.weight ? b.weight : "normal",
        g = void 0 !== b.style ? b.style : "normal";
    THREE.FontUtils.size = void 0 !== b.size ? b.size : 100;
    THREE.FontUtils.divisions = c;
    THREE.FontUtils.face = d;
    THREE.FontUtils.weight = f;
    THREE.FontUtils.style = g
};
THREE.TextPath.prototype.toShapes = function() {
    for (var a = THREE.FontUtils.drawText(this.text).paths, b = [], c = 0, d = a.length; c < d; c++) Array.prototype.push.apply(b, a[c].toShapes());
    return b
};
THREE.AnimationHandler = function() {
    var a = [],
        b = {}, c = {
            update: function(b) {
                for (var c = 0; c < a.length; c++) a[c].update(b)
            },
            addToUpdate: function(b) {
                -1 === a.indexOf(b) && a.push(b)
            },
            removeFromUpdate: function(b) {
                b = a.indexOf(b); - 1 !== b && a.splice(b, 1)
            },
            add: function(a) {
                void 0 !== b[a.name] && console.log("THREE.AnimationHandler.add: Warning! " + a.name + " already exists in library. Overwriting.");
                b[a.name] = a;
                if (!0 !== a.initialized) {
                    for (var c = 0; c < a.hierarchy.length; c++) {
                        for (var d = 0; d < a.hierarchy[c].keys.length; d++) {
                            if (0 > a.hierarchy[c].keys[d].time) a.hierarchy[c].keys[d].time =
                                0;
                            if (void 0 !== a.hierarchy[c].keys[d].rot && !(a.hierarchy[c].keys[d].rot instanceof THREE.Quaternion)) {
                                var h = a.hierarchy[c].keys[d].rot;
                                a.hierarchy[c].keys[d].rot = new THREE.Quaternion(h[0], h[1], h[2], h[3])
                            }
                        }
                        if (a.hierarchy[c].keys.length && void 0 !== a.hierarchy[c].keys[0].morphTargets) {
                            h = {};
                            for (d = 0; d < a.hierarchy[c].keys.length; d++)
                                for (var i = 0; i < a.hierarchy[c].keys[d].morphTargets.length; i++) {
                                    var j = a.hierarchy[c].keys[d].morphTargets[i];
                                    h[j] = -1
                                }
                            a.hierarchy[c].usedMorphTargets = h;
                            for (d = 0; d < a.hierarchy[c].keys.length; d++) {
                                var k = {};
                                for (j in h) {
                                    for (i = 0; i < a.hierarchy[c].keys[d].morphTargets.length; i++)
                                        if (a.hierarchy[c].keys[d].morphTargets[i] === j) {
                                            k[j] = a.hierarchy[c].keys[d].morphTargetsInfluences[i];
                                            break
                                        }
                                    i === a.hierarchy[c].keys[d].morphTargets.length && (k[j] = 0)
                                }
                                a.hierarchy[c].keys[d].morphTargetsInfluences = k
                            }
                        }
                        for (d = 1; d < a.hierarchy[c].keys.length; d++) a.hierarchy[c].keys[d].time === a.hierarchy[c].keys[d - 1].time && (a.hierarchy[c].keys.splice(d, 1), d--);
                        for (d = 0; d < a.hierarchy[c].keys.length; d++) a.hierarchy[c].keys[d].index = d
                    }
                    d = parseInt(a.length *
                        a.fps, 10);
                    a.JIT = {};
                    a.JIT.hierarchy = [];
                    for (c = 0; c < a.hierarchy.length; c++) a.JIT.hierarchy.push(Array(d));
                    a.initialized = !0
                }
            },
            get: function(a) {
                if ("string" === typeof a) {
                    if (b[a]) return b[a];
                    console.log("THREE.AnimationHandler.get: Couldn't find animation " + a);
                    return null
                }
            },
            parse: function(a) {
                var b = [];
                if (a instanceof THREE.SkinnedMesh)
                    for (var c = 0; c < a.bones.length; c++) b.push(a.bones[c]);
                else d(a, b);
                return b
            }
        }, d = function(a, b) {
            b.push(a);
            for (var c = 0; c < a.children.length; c++) d(a.children[c], b)
        };
    c.LINEAR = 0;
    c.CATMULLROM =
        1;
    c.CATMULLROM_FORWARD = 2;
    return c
}();
THREE.Animation = function(a, b, c, d) {
    this.root = a;
    this.data = THREE.AnimationHandler.get(b);
    this.hierarchy = THREE.AnimationHandler.parse(a);
    this.currentTime = 0;
    this.timeScale = 1;
    this.isPlaying = !1;
    this.loop = this.isPaused = !0;
    this.interpolationType = void 0 !== c ? c : THREE.AnimationHandler.LINEAR;
    this.JITCompile = void 0 !== d ? d : !0;
    this.points = [];
    this.target = new THREE.Vector3
};
THREE.Animation.prototype.play = function(a, b) {
    if (!this.isPlaying) {
        this.isPlaying = !0;
        this.loop = void 0 !== a ? a : !0;
        this.currentTime = void 0 !== b ? b : 0;
        var c, d = this.hierarchy.length,
            f;
        for (c = 0; c < d; c++) {
            f = this.hierarchy[c];
            if (this.interpolationType !== THREE.AnimationHandler.CATMULLROM_FORWARD) f.useQuaternion = !0;
            f.matrixAutoUpdate = !0;
            if (void 0 === f.animationCache) f.animationCache = {}, f.animationCache.prevKey = {
                pos: 0,
                rot: 0,
                scl: 0
            }, f.animationCache.nextKey = {
                pos: 0,
                rot: 0,
                scl: 0
            }, f.animationCache.originalMatrix = f instanceof
            THREE.Bone ? f.skinMatrix : f.matrix;
            var g = f.animationCache.prevKey;
            f = f.animationCache.nextKey;
            g.pos = this.data.hierarchy[c].keys[0];
            g.rot = this.data.hierarchy[c].keys[0];
            g.scl = this.data.hierarchy[c].keys[0];
            f.pos = this.getNextKeyWith("pos", c, 1);
            f.rot = this.getNextKeyWith("rot", c, 1);
            f.scl = this.getNextKeyWith("scl", c, 1)
        }
        this.update(0)
    }
    this.isPaused = !1;
    THREE.AnimationHandler.addToUpdate(this)
};
THREE.Animation.prototype.pause = function() {
    this.isPaused ? THREE.AnimationHandler.addToUpdate(this) : THREE.AnimationHandler.removeFromUpdate(this);
    this.isPaused = !this.isPaused
};
THREE.Animation.prototype.stop = function() {
    this.isPaused = this.isPlaying = !1;
    THREE.AnimationHandler.removeFromUpdate(this);
    for (var a = 0; a < this.hierarchy.length; a++)
        if (void 0 !== this.hierarchy[a].animationCache) this.hierarchy[a] instanceof THREE.Bone ? this.hierarchy[a].skinMatrix = this.hierarchy[a].animationCache.originalMatrix : this.hierarchy[a].matrix = this.hierarchy[a].animationCache.originalMatrix, delete this.hierarchy[a].animationCache
};
THREE.Animation.prototype.update = function(a) {
    if (this.isPlaying) {
        var b = ["pos", "rot", "scl"],
            c, d, f, g, e, h, i, j, k = this.data.JIT.hierarchy,
            q, m;
        m = this.currentTime += a * this.timeScale;
        q = this.currentTime %= this.data.length;
        j = parseInt(Math.min(q * this.data.fps, this.data.length * this.data.fps), 10);
        for (var o = 0, p = this.hierarchy.length; o < p; o++)
            if (a = this.hierarchy[o], i = a.animationCache, this.JITCompile && void 0 !== k[o][j]) a instanceof THREE.Bone ? (a.skinMatrix = k[o][j], a.matrixAutoUpdate = !1, a.matrixWorldNeedsUpdate = !1) : (a.matrix =
                k[o][j], a.matrixAutoUpdate = !1, a.matrixWorldNeedsUpdate = !0);
            else {
                if (this.JITCompile) a instanceof THREE.Bone ? a.skinMatrix = a.animationCache.originalMatrix : a.matrix = a.animationCache.originalMatrix;
                for (var n = 0; 3 > n; n++) {
                    c = b[n];
                    e = i.prevKey[c];
                    h = i.nextKey[c];
                    if (h.time <= m) {
                        if (q < m)
                            if (this.loop) {
                                e = this.data.hierarchy[o].keys[0];
                                for (h = this.getNextKeyWith(c, o, 1); h.time < q;) e = h, h = this.getNextKeyWith(c, o, h.index + 1)
                            } else {
                                this.stop();
                                return
                            } else {
                                do e = h, h = this.getNextKeyWith(c, o, h.index + 1); while (h.time < q)
                            }
                        i.prevKey[c] =
                            e;
                        i.nextKey[c] = h
                    }
                    a.matrixAutoUpdate = !0;
                    a.matrixWorldNeedsUpdate = !0;
                    d = (q - e.time) / (h.time - e.time);
                    f = e[c];
                    g = h[c];
                    if (0 > d || 1 < d) console.log("THREE.Animation.update: Warning! Scale out of bounds:" + d + " on bone " + o), d = 0 > d ? 0 : 1;
                    if ("pos" === c)
                        if (c = a.position, this.interpolationType === THREE.AnimationHandler.LINEAR) c.x = f[0] + (g[0] - f[0]) * d, c.y = f[1] + (g[1] - f[1]) * d, c.z = f[2] + (g[2] - f[2]) * d;
                        else {
                            if (this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD)
                                if (this.points[0] =
                                    this.getPrevKeyWith("pos", o, e.index - 1).pos, this.points[1] = f, this.points[2] = g, this.points[3] = this.getNextKeyWith("pos", o, h.index + 1).pos, d = 0.33 * d + 0.33, f = this.interpolateCatmullRom(this.points, d), c.x = f[0], c.y = f[1], c.z = f[2], this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD) d = this.interpolateCatmullRom(this.points, 1.01 * d), this.target.set(d[0], d[1], d[2]), this.target.subSelf(c), this.target.y = 0, this.target.normalize(), d = Math.atan2(this.target.x, this.target.z), a.rotation.set(0, d, 0)
                        } else if ("rot" ===
                        c) THREE.Quaternion.slerp(f, g, a.quaternion, d);
                    else if ("scl" === c) c = a.scale, c.x = f[0] + (g[0] - f[0]) * d, c.y = f[1] + (g[1] - f[1]) * d, c.z = f[2] + (g[2] - f[2]) * d
                }
            }
        if (this.JITCompile && void 0 === k[0][j]) {
            this.hierarchy[0].updateMatrixWorld(!0);
            for (o = 0; o < this.hierarchy.length; o++) k[o][j] = this.hierarchy[o] instanceof THREE.Bone ? this.hierarchy[o].skinMatrix.clone() : this.hierarchy[o].matrix.clone()
        }
    }
};
THREE.Animation.prototype.interpolateCatmullRom = function(a, b) {
    var c = [],
        d = [],
        f, g, e, h, i, j;
    f = (a.length - 1) * b;
    g = Math.floor(f);
    f -= g;
    c[0] = 0 === g ? g : g - 1;
    c[1] = g;
    c[2] = g > a.length - 2 ? g : g + 1;
    c[3] = g > a.length - 3 ? g : g + 2;
    g = a[c[0]];
    h = a[c[1]];
    i = a[c[2]];
    j = a[c[3]];
    c = f * f;
    e = f * c;
    d[0] = this.interpolate(g[0], h[0], i[0], j[0], f, c, e);
    d[1] = this.interpolate(g[1], h[1], i[1], j[1], f, c, e);
    d[2] = this.interpolate(g[2], h[2], i[2], j[2], f, c, e);
    return d
};
THREE.Animation.prototype.interpolate = function(a, b, c, d, f, g, e) {
    a = 0.5 * (c - a);
    d = 0.5 * (d - b);
    return (2 * (b - c) + a + d) * e + (-3 * (b - c) - 2 * a - d) * g + a * f + b
};
THREE.Animation.prototype.getNextKeyWith = function(a, b, c) {
    for (var d = this.data.hierarchy[b].keys, c = this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ? c < d.length - 1 ? c : d.length - 1 : c % d.length; c < d.length; c++)
        if (void 0 !== d[c][a]) return d[c];
    return this.data.hierarchy[b].keys[0]
};
THREE.Animation.prototype.getPrevKeyWith = function(a, b, c) {
    for (var d = this.data.hierarchy[b].keys, c = this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ? 0 < c ? c : 0 : 0 <= c ? c : c + d.length; 0 <= c; c--)
        if (void 0 !== d[c][a]) return d[c];
    return this.data.hierarchy[b].keys[d.length - 1]
};
THREE.KeyFrameAnimation = function(a, b, c) {
    this.root = a;
    this.data = THREE.AnimationHandler.get(b);
    this.hierarchy = THREE.AnimationHandler.parse(a);
    this.currentTime = 0;
    this.timeScale = 0.001;
    this.isPlaying = !1;
    this.loop = this.isPaused = !0;
    this.JITCompile = void 0 !== c ? c : !0;
    a = 0;
    for (b = this.hierarchy.length; a < b; a++) {
        var c = this.data.hierarchy[a].sids,
            d = this.hierarchy[a];
        if (this.data.hierarchy[a].keys.length && c) {
            for (var f = 0; f < c.length; f++) {
                var g = c[f],
                    e = this.getNextKeyWith(g, a, 0);
                e && e.apply(g)
            }
            d.matrixAutoUpdate = !1;
            this.data.hierarchy[a].node.updateMatrix();
            d.matrixWorldNeedsUpdate = !0
        }
    }
};
THREE.KeyFrameAnimation.prototype.play = function(a, b) {
    if (!this.isPlaying) {
        this.isPlaying = !0;
        this.loop = void 0 !== a ? a : !0;
        this.currentTime = void 0 !== b ? b : 0;
        this.startTimeMs = b;
        this.startTime = 1E7;
        this.endTime = -this.startTime;
        var c, d = this.hierarchy.length,
            f, g;
        for (c = 0; c < d; c++) {
            f = this.hierarchy[c];
            g = this.data.hierarchy[c];
            f.useQuaternion = !0;
            if (void 0 === g.animationCache) g.animationCache = {}, g.animationCache.prevKey = null, g.animationCache.nextKey = null, g.animationCache.originalMatrix = f instanceof THREE.Bone ? f.skinMatrix :
                f.matrix;
            f = this.data.hierarchy[c].keys;
            if (f.length) g.animationCache.prevKey = f[0], g.animationCache.nextKey = f[1], this.startTime = Math.min(f[0].time, this.startTime), this.endTime = Math.max(f[f.length - 1].time, this.endTime)
        }
        this.update(0)
    }
    this.isPaused = !1;
    THREE.AnimationHandler.addToUpdate(this)
};
THREE.KeyFrameAnimation.prototype.pause = function() {
    this.isPaused ? THREE.AnimationHandler.addToUpdate(this) : THREE.AnimationHandler.removeFromUpdate(this);
    this.isPaused = !this.isPaused
};
THREE.KeyFrameAnimation.prototype.stop = function() {
    this.isPaused = this.isPlaying = !1;
    THREE.AnimationHandler.removeFromUpdate(this);
    for (var a = 0; a < this.data.hierarchy.length; a++) {
        var b = this.hierarchy[a],
            c = this.data.hierarchy[a];
        if (void 0 !== c.animationCache) {
            var d = c.animationCache.originalMatrix;
            b instanceof THREE.Bone ? (d.copy(b.skinMatrix), b.skinMatrix = d) : (d.copy(b.matrix), b.matrix = d);
            delete c.animationCache
        }
    }
};
THREE.KeyFrameAnimation.prototype.update = function(a) {
    if (this.isPlaying) {
        var b, c, d, f, g = this.data.JIT.hierarchy,
            e, h, i;
        h = this.currentTime += a * this.timeScale;
        e = this.currentTime %= this.data.length;
        if (e < this.startTimeMs) e = this.currentTime = this.startTimeMs + e;
        f = parseInt(Math.min(e * this.data.fps, this.data.length * this.data.fps), 10);
        if ((i = e < h) && !this.loop) {
            for (var a = 0, j = this.hierarchy.length; a < j; a++) {
                var k = this.data.hierarchy[a].keys,
                    g = this.data.hierarchy[a].sids;
                d = k.length - 1;
                f = this.hierarchy[a];
                if (k.length) {
                    for (k =
                        0; k < g.length; k++) e = g[k], (h = this.getPrevKeyWith(e, a, d)) && h.apply(e);
                    this.data.hierarchy[a].node.updateMatrix();
                    f.matrixWorldNeedsUpdate = !0
                }
            }
            this.stop()
        } else if (!(e < this.startTime)) {
            a = 0;
            for (j = this.hierarchy.length; a < j; a++) {
                d = this.hierarchy[a];
                b = this.data.hierarchy[a];
                var k = b.keys,
                    q = b.animationCache;
                if (this.JITCompile && void 0 !== g[a][f]) d instanceof THREE.Bone ? (d.skinMatrix = g[a][f], d.matrixWorldNeedsUpdate = !1) : (d.matrix = g[a][f], d.matrixWorldNeedsUpdate = !0);
                else if (k.length) {
                    if (this.JITCompile && q) d instanceof
                    THREE.Bone ? d.skinMatrix = q.originalMatrix : d.matrix = q.originalMatrix;
                    b = q.prevKey;
                    c = q.nextKey;
                    if (b && c) {
                        if (c.time <= h) {
                            if (i && this.loop) {
                                b = k[0];
                                for (c = k[1]; c.time < e;) b = c, c = k[b.index + 1]
                            } else if (!i)
                                for (var m = k.length - 1; c.time < e && c.index !== m;) b = c, c = k[b.index + 1];
                            q.prevKey = b;
                            q.nextKey = c
                        }
                        c.time >= e ? b.interpolate(c, e) : b.interpolate(c, c.time)
                    }
                    this.data.hierarchy[a].node.updateMatrix();
                    d.matrixWorldNeedsUpdate = !0
                }
            }
            if (this.JITCompile && void 0 === g[0][f]) {
                this.hierarchy[0].updateMatrixWorld(!0);
                for (a = 0; a < this.hierarchy.length; a++) g[a][f] =
                    this.hierarchy[a] instanceof THREE.Bone ? this.hierarchy[a].skinMatrix.clone() : this.hierarchy[a].matrix.clone()
            }
        }
    }
};
THREE.KeyFrameAnimation.prototype.getNextKeyWith = function(a, b, c) {
    b = this.data.hierarchy[b].keys;
    for (c %= b.length; c < b.length; c++)
        if (b[c].hasTarget(a)) return b[c];
    return b[0]
};
THREE.KeyFrameAnimation.prototype.getPrevKeyWith = function(a, b, c) {
    b = this.data.hierarchy[b].keys;
    for (c = 0 <= c ? c : c + b.length; 0 <= c; c--)
        if (b[c].hasTarget(a)) return b[c];
    return b[b.length - 1]
};
THREE.CubeCamera = function(a, b, c, d) {
    this.heightOffset = c;
    this.position = new THREE.Vector3(0, c, 0);
    this.cameraPX = new THREE.PerspectiveCamera(90, 1, a, b);
    this.cameraNX = new THREE.PerspectiveCamera(90, 1, a, b);
    this.cameraPY = new THREE.PerspectiveCamera(90, 1, a, b);
    this.cameraNY = new THREE.PerspectiveCamera(90, 1, a, b);
    this.cameraPZ = new THREE.PerspectiveCamera(90, 1, a, b);
    this.cameraNZ = new THREE.PerspectiveCamera(90, 1, a, b);
    this.cameraPX.position = this.position;
    this.cameraNX.position = this.position;
    this.cameraPY.position =
        this.position;
    this.cameraNY.position = this.position;
    this.cameraPZ.position = this.position;
    this.cameraNZ.position = this.position;
    this.cameraPX.up.set(0, -1, 0);
    this.cameraNX.up.set(0, -1, 0);
    this.cameraPY.up.set(0, 0, 1);
    this.cameraNY.up.set(0, 0, -1);
    this.cameraPZ.up.set(0, -1, 0);
    this.cameraNZ.up.set(0, -1, 0);
    this.targetPX = new THREE.Vector3(0, 0, 0);
    this.targetNX = new THREE.Vector3(0, 0, 0);
    this.targetPY = new THREE.Vector3(0, 0, 0);
    this.targetNY = new THREE.Vector3(0, 0, 0);
    this.targetPZ = new THREE.Vector3(0, 0, 0);
    this.targetNZ =
        new THREE.Vector3(0, 0, 0);
    this.renderTarget = new THREE.WebGLRenderTargetCube(d, d, {
        format: THREE.RGBFormat,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
    });
    this.updatePosition = function(a) {
        this.position.copy(a);
        this.position.y += this.heightOffset;
        this.targetPX.copy(this.position);
        this.targetNX.copy(this.position);
        this.targetPY.copy(this.position);
        this.targetNY.copy(this.position);
        this.targetPZ.copy(this.position);
        this.targetNZ.copy(this.position);
        this.targetPX.x += 1;
        this.targetNX.x -= 1;
        this.targetPY.y +=
            1;
        this.targetNY.y -= 1;
        this.targetPZ.z += 1;
        this.targetNZ.z -= 1;
        this.cameraPX.lookAt(this.targetPX);
        this.cameraNX.lookAt(this.targetNX);
        this.cameraPY.lookAt(this.targetPY);
        this.cameraNY.lookAt(this.targetNY);
        this.cameraPZ.lookAt(this.targetPZ);
        this.cameraNZ.lookAt(this.targetNZ)
    };
    this.updateCubeMap = function(a, b) {
        var c = this.renderTarget;
        c.activeCubeFace = 0;
        a.render(b, this.cameraPX, c);
        c.activeCubeFace = 1;
        a.render(b, this.cameraNX, c);
        c.activeCubeFace = 2;
        a.render(b, this.cameraPY, c);
        c.activeCubeFace = 3;
        a.render(b,
            this.cameraNY, c);
        c.activeCubeFace = 4;
        a.render(b, this.cameraPZ, c);
        c.activeCubeFace = 5;
        a.render(b, this.cameraNZ, c)
    }
};
THREE.CombinedCamera = function(a, b, c, d, f, g, e) {
    THREE.Camera.call(this);
    this.fov = c;
    this.left = -a / 2;
    this.right = a / 2;
    this.top = b / 2;
    this.bottom = -b / 2;
    this.cameraO = new THREE.OrthographicCamera(a / -2, a / 2, b / 2, b / -2, g, e);
    this.cameraP = new THREE.PerspectiveCamera(c, a / b, d, f);
    this.zoom = 1;
    this.toPerspective()
};
THREE.CombinedCamera.prototype = new THREE.Camera;
THREE.CombinedCamera.prototype.constructor = THREE.CoolCamera;
THREE.CombinedCamera.prototype.toPerspective = function() {
    this.near = this.cameraP.near;
    this.far = this.cameraP.far;
    this.cameraP.fov = this.fov / this.zoom;
    this.cameraP.updateProjectionMatrix();
    this.projectionMatrix = this.cameraP.projectionMatrix;
    this.inPersepectiveMode = !0;
    this.inOrthographicMode = !1
};
THREE.CombinedCamera.prototype.toOrthographic = function() {
    var a = this.cameraP.aspect,
        b = (this.cameraP.near + this.cameraP.far) / 2,
        b = Math.tan(this.fov / 2) * b,
        a = 2 * b * a / 2,
        b = b / this.zoom,
        a = a / this.zoom;
    this.cameraO.left = -a;
    this.cameraO.right = a;
    this.cameraO.top = b;
    this.cameraO.bottom = -b;
    this.cameraO.updateProjectionMatrix();
    this.near = this.cameraO.near;
    this.far = this.cameraO.far;
    this.projectionMatrix = this.cameraO.projectionMatrix;
    this.inPersepectiveMode = !1;
    this.inOrthographicMode = !0
};
THREE.CombinedCamera.prototype.setFov = function(a) {
    this.fov = a;
    this.inPersepectiveMode ? this.toPerspective() : this.toOrthographic()
};
THREE.CombinedCamera.prototype.setLens = function(a, b) {
    var c = 2 * Math.atan((void 0 !== b ? b : 24) / (2 * a)) * (180 / Math.PI);
    this.setFov(c);
    return c
};
THREE.CombinedCamera.prototype.setZoom = function(a) {
    this.zoom = a;
    this.inPersepectiveMode ? this.toPerspective() : this.toOrthographic()
};
THREE.CombinedCamera.prototype.toFrontView = function() {
    this.rotation.x = 0;
    this.rotation.y = 0;
    this.rotation.z = 0;
    this.rotationAutoUpdate = !1
};
THREE.CombinedCamera.prototype.toBackView = function() {
    this.rotation.x = 0;
    this.rotation.y = Math.PI;
    this.rotation.z = 0;
    this.rotationAutoUpdate = !1
};
THREE.CombinedCamera.prototype.toLeftView = function() {
    this.rotation.x = 0;
    this.rotation.y = -Math.PI / 2;
    this.rotation.z = 0;
    this.rotationAutoUpdate = !1
};
THREE.CombinedCamera.prototype.toRightView = function() {
    this.rotation.x = 0;
    this.rotation.y = Math.PI / 2;
    this.rotation.z = 0;
    this.rotationAutoUpdate = !1
};
THREE.CombinedCamera.prototype.toTopView = function() {
    this.rotation.x = -Math.PI / 2;
    this.rotation.y = 0;
    this.rotation.z = 0;
    this.rotationAutoUpdate = !1
};
THREE.CombinedCamera.prototype.toBottomView = function() {
    this.rotation.x = Math.PI / 2;
    this.rotation.y = 0;
    this.rotation.z = 0;
    this.rotationAutoUpdate = !1
};
THREE.FirstPersonControls = function(a, b) {
    function c(a, b) {
        return function() {
            b.apply(a, arguments)
        }
    }
    this.object = a;
    this.target = new THREE.Vector3(0, 0, 0);
    this.domElement = void 0 !== b ? b : document;
    this.movementSpeed = 1;
    this.lookSpeed = 0.005;
    this.noFly = !1;
    this.lookVertical = !0;
    this.autoForward = !1;
    this.activeLook = !0;
    this.heightSpeed = !1;
    this.heightCoef = 1;
    this.heightMin = 0;
    this.constrainVertical = !1;
    this.verticalMin = 0;
    this.verticalMax = Math.PI;
    this.theta = this.phi = this.lon = this.lat = this.mouseY = this.mouseX = this.autoSpeedFactor =
        0;
    this.mouseDragOn = this.freeze = this.moveRight = this.moveLeft = this.moveBackward = this.moveForward = !1;
    this.domElement === document ? (this.viewHalfX = window.innerWidth / 2, this.viewHalfY = window.innerHeight / 2) : (this.viewHalfX = this.domElement.offsetWidth / 2, this.viewHalfY = this.domElement.offsetHeight / 2, this.domElement.setAttribute("tabindex", -1));
    this.onMouseDown = function(a) {
        this.domElement !== document && this.domElement.focus();
        a.preventDefault();
        a.stopPropagation();
        if (this.activeLook) switch (a.button) {
            case 0:
                this.moveForward = !0;
                break;
            case 2:
                this.moveBackward = !0
        }
        this.mouseDragOn = !0
    };
    this.onMouseUp = function(a) {
        a.preventDefault();
        a.stopPropagation();
        if (this.activeLook) switch (a.button) {
            case 0:
                this.moveForward = !1;
                break;
            case 2:
                this.moveBackward = !1
        }
        this.mouseDragOn = !1
    };
    this.onMouseMove = function(a) {
        this.domElement === document ? (this.mouseX = a.pageX - this.viewHalfX, this.mouseY = a.pageY - this.viewHalfY) : (this.mouseX = a.pageX - this.domElement.offsetLeft - this.viewHalfX, this.mouseY = a.pageY - this.domElement.offsetTop - this.viewHalfY)
    };
    this.onKeyDown =
        function(a) {
            switch (a.keyCode) {
                case 38:
                case 87:
                    this.moveForward = !0;
                    break;
                case 37:
                case 65:
                    this.moveLeft = !0;
                    break;
                case 40:
                case 83:
                    this.moveBackward = !0;
                    break;
                case 39:
                case 68:
                    this.moveRight = !0;
                    break;
                case 82:
                    this.moveUp = !0;
                    break;
                case 70:
                    this.moveDown = !0;
                    break;
                case 81:
                    this.freeze = !this.freeze
            }
    };
    this.onKeyUp = function(a) {
        switch (a.keyCode) {
            case 38:
            case 87:
                this.moveForward = !1;
                break;
            case 37:
            case 65:
                this.moveLeft = !1;
                break;
            case 40:
            case 83:
                this.moveBackward = !1;
                break;
            case 39:
            case 68:
                this.moveRight = !1;
                break;
            case 82:
                this.moveUp = !1;
                break;
            case 70:
                this.moveDown = !1
        }
    };
    this.update = function(a) {
        var b = 0;
        if (!this.freeze) {
            this.heightSpeed ? (b = THREE.Math.clamp(this.object.position.y, this.heightMin, this.heightMax) - this.heightMin, this.autoSpeedFactor = a * b * this.heightCoef) : this.autoSpeedFactor = 0;
            b = a * this.movementSpeed;
            (this.moveForward || this.autoForward && !this.moveBackward) && this.object.translateZ(-(b + this.autoSpeedFactor));
            this.moveBackward && this.object.translateZ(b);
            this.moveLeft && this.object.translateX(-b);
            this.moveRight && this.object.translateX(b);
            this.moveUp && this.object.translateY(b);
            this.moveDown && this.object.translateY(-b);
            a *= this.lookSpeed;
            this.activeLook || (a = 0);
            this.lon += this.mouseX * a;
            this.lookVertical && (this.lat -= this.mouseY * a);
            this.lat = Math.max(-85, Math.min(85, this.lat));
            this.phi = (90 - this.lat) * Math.PI / 180;
            this.theta = this.lon * Math.PI / 180;
            var b = this.target,
                c = this.object.position;
            b.x = c.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
            b.y = c.y + 100 * Math.cos(this.phi);
            b.z = c.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);
            b = 1;
            this.constrainVertical &&
                (b = Math.PI / (this.verticalMax - this.verticalMin));
            this.lon += this.mouseX * a;
            this.lookVertical && (this.lat -= this.mouseY * a * b);
            this.lat = Math.max(-85, Math.min(85, this.lat));
            this.phi = (90 - this.lat) * Math.PI / 180;
            this.theta = this.lon * Math.PI / 180;
            if (this.constrainVertical) this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax);
            b = this.target;
            c = this.object.position;
            b.x = c.x + 100 * Math.sin(this.phi) * Math.cos(this.theta);
            b.y = c.y + 100 * Math.cos(this.phi);
            b.z = c.z + 100 * Math.sin(this.phi) * Math.sin(this.theta);
            this.object.lookAt(b)
        }
    };
    this.domElement.addEventListener("contextmenu", function(a) {
        a.preventDefault()
    }, !1);
    this.domElement.addEventListener("mousemove", c(this, this.onMouseMove), !1);
    this.domElement.addEventListener("mousedown", c(this, this.onMouseDown), !1);
    this.domElement.addEventListener("mouseup", c(this, this.onMouseUp), !1);
    this.domElement.addEventListener("keydown", c(this, this.onKeyDown), !1);
    this.domElement.addEventListener("keyup", c(this, this.onKeyUp), !1)
};
THREE.PathControls = function(a, b) {
    function c(a) {
        return 1 > (a *= 2) ? 0.5 * a * a : -0.5 * (--a * (a - 2) - 1)
    }

    function d(a, b) {
        return function() {
            b.apply(a, arguments)
        }
    }

    function f(a, b, c, d) {
        var f = {
            name: c,
            fps: 0.6,
            length: d,
            hierarchy: []
        }, e, g = b.getControlPointsArray(),
            h = b.getLength(),
            r = g.length,
            s = 0;
        e = r - 1;
        b = {
            parent: -1,
            keys: []
        };
        b.keys[0] = {
            time: 0,
            pos: g[0],
            rot: [0, 0, 0, 1],
            scl: [1, 1, 1]
        };
        b.keys[e] = {
            time: d,
            pos: g[e],
            rot: [0, 0, 0, 1],
            scl: [1, 1, 1]
        };
        for (e = 1; e < r - 1; e++) s = d * h.chunks[e] / h.total, b.keys[e] = {
            time: s,
            pos: g[e]
        };
        f.hierarchy[0] = b;
        THREE.AnimationHandler.add(f);
        return new THREE.Animation(a, c, THREE.AnimationHandler.CATMULLROM_FORWARD, !1)
    }

    function g(a, b) {
        var c, d, f = new THREE.Geometry;
        for (c = 0; c < a.points.length * b; c++) d = c / (a.points.length * b), d = a.getPoint(d), f.vertices[c] = new THREE.Vertex(new THREE.Vector3(d.x, d.y, d.z));
        return f
    }
    this.object = a;
    this.domElement = void 0 !== b ? b : document;
    this.id = "PathControls" + THREE.PathControlsIdCounter++;
    this.duration = 1E4;
    this.waypoints = [];
    this.useConstantSpeed = !0;
    this.resamplingCoef = 50;
    this.debugPath = new THREE.Object3D;
    this.debugDummy =
        new THREE.Object3D;
    this.animationParent = new THREE.Object3D;
    this.lookSpeed = 0.005;
    this.lookHorizontal = this.lookVertical = !0;
    this.verticalAngleMap = {
        srcRange: [0, 2 * Math.PI],
        dstRange: [0, 2 * Math.PI]
    };
    this.horizontalAngleMap = {
        srcRange: [0, 2 * Math.PI],
        dstRange: [0, 2 * Math.PI]
    };
    this.target = new THREE.Object3D;
    this.theta = this.phi = this.lon = this.lat = this.mouseY = this.mouseX = 0;
    this.domElement === document ? (this.viewHalfX = window.innerWidth / 2, this.viewHalfY = window.innerHeight / 2) : (this.viewHalfX = this.domElement.offsetWidth /
        2, this.viewHalfY = this.domElement.offsetHeight / 2, this.domElement.setAttribute("tabindex", -1));
    var e = 2 * Math.PI,
        h = Math.PI / 180;
    this.update = function(a) {
        var b;
        this.lookHorizontal && (this.lon += this.mouseX * this.lookSpeed * a);
        this.lookVertical && (this.lat -= this.mouseY * this.lookSpeed * a);
        this.lon = Math.max(0, Math.min(360, this.lon));
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = (90 - this.lat) * h;
        this.theta = this.lon * h;
        a = this.phi % e;
        this.phi = 0 <= a ? a : a + e;
        b = this.verticalAngleMap.srcRange;
        a = this.verticalAngleMap.dstRange;
        b = THREE.Math.mapLinear(this.phi, b[0], b[1], a[0], a[1]);
        var d = a[1] - a[0];
        this.phi = c((b - a[0]) / d) * d + a[0];
        b = this.horizontalAngleMap.srcRange;
        a = this.horizontalAngleMap.dstRange;
        b = THREE.Math.mapLinear(this.theta, b[0], b[1], a[0], a[1]);
        d = a[1] - a[0];
        this.theta = c((b - a[0]) / d) * d + a[0];
        a = this.target.position;
        a.x = 100 * Math.sin(this.phi) * Math.cos(this.theta);
        a.y = 100 * Math.cos(this.phi);
        a.z = 100 * Math.sin(this.phi) * Math.sin(this.theta);
        this.object.lookAt(this.target.position)
    };
    this.onMouseMove = function(a) {
        this.domElement ===
            document ? (this.mouseX = a.pageX - this.viewHalfX, this.mouseY = a.pageY - this.viewHalfY) : (this.mouseX = a.pageX - this.domElement.offsetLeft - this.viewHalfX, this.mouseY = a.pageY - this.domElement.offsetTop - this.viewHalfY)
    };
    this.init = function() {
        this.spline = new THREE.Spline;
        this.spline.initFromArray(this.waypoints);
        this.useConstantSpeed && this.spline.reparametrizeByArcLength(this.resamplingCoef);
        if (this.createDebugDummy) {
            var a = new THREE.MeshLambertMaterial({
                color: 30719
            }),
                b = new THREE.MeshLambertMaterial({
                    color: 65280
                }),
                c = new THREE.CubeGeometry(10, 10, 20),
                e = new THREE.CubeGeometry(2, 2, 10);
            this.animationParent = new THREE.Mesh(c, a);
            a = new THREE.Mesh(e, b);
            a.position.set(0, 10, 0);
            this.animation = f(this.animationParent, this.spline, this.id, this.duration);
            this.animationParent.add(this.object);
            this.animationParent.add(this.target);
            this.animationParent.add(a)
        } else this.animation = f(this.animationParent, this.spline, this.id, this.duration), this.animationParent.add(this.target), this.animationParent.add(this.object); if (this.createDebugPath) {
            var a =
                this.debugPath,
                b = this.spline,
                e = g(b, 10),
                c = g(b, 10),
                h = new THREE.LineBasicMaterial({
                    color: 16711680,
                    linewidth: 3
                }),
                e = new THREE.Line(e, h),
                c = new THREE.ParticleSystem(c, new THREE.ParticleBasicMaterial({
                    color: 16755200,
                    size: 3
                }));
            e.scale.set(1, 1, 1);
            a.add(e);
            c.scale.set(1, 1, 1);
            a.add(c);
            for (var e = new THREE.SphereGeometry(1, 16, 8), h = new THREE.MeshBasicMaterial({
                    color: 65280
                }), o = 0; o < b.points.length; o++) c = new THREE.Mesh(e, h), c.position.copy(b.points[o]), a.add(c)
        }
        this.domElement.addEventListener("mousemove", d(this, this.onMouseMove), !1)
    }
};
THREE.PathControlsIdCounter = 0;
THREE.FlyControls = function(a, b) {
    function c(a, b) {
        return function() {
            b.apply(a, arguments)
        }
    }
    this.object = a;
    this.domElement = void 0 !== b ? b : document;
    b && this.domElement.setAttribute("tabindex", -1);
    this.movementSpeed = 1;
    this.rollSpeed = 0.005;
    this.autoForward = this.dragToLook = !1;
    this.object.useQuaternion = !0;
    this.tmpQuaternion = new THREE.Quaternion;
    this.mouseStatus = 0;
    this.moveState = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        forward: 0,
        back: 0,
        pitchUp: 0,
        pitchDown: 0,
        yawLeft: 0,
        yawRight: 0,
        rollLeft: 0,
        rollRight: 0
    };
    this.moveVector = new THREE.Vector3(0,
        0, 0);
    this.rotationVector = new THREE.Vector3(0, 0, 0);
    this.handleEvent = function(a) {
        if ("function" == typeof this[a.type]) this[a.type](a)
    };
    this.keydown = function(a) {
        if (!a.altKey) {
            switch (a.keyCode) {
                case 16:
                    this.movementSpeedMultiplier = 0.1;
                    break;
                case 87:
                    this.moveState.forward = 1;
                    break;
                case 83:
                    this.moveState.back = 1;
                    break;
                case 65:
                    this.moveState.left = 1;
                    break;
                case 68:
                    this.moveState.right = 1;
                    break;
                case 82:
                    this.moveState.up = 1;
                    break;
                case 70:
                    this.moveState.down = 1;
                    break;
                case 38:
                    this.moveState.pitchUp = 1;
                    break;
                case 40:
                    this.moveState.pitchDown =
                        1;
                    break;
                case 37:
                    this.moveState.yawLeft = 1;
                    break;
                case 39:
                    this.moveState.yawRight = 1;
                    break;
                case 81:
                    this.moveState.rollLeft = 1;
                    break;
                case 69:
                    this.moveState.rollRight = 1
            }
            this.updateMovementVector();
            this.updateRotationVector()
        }
    };
    this.keyup = function(a) {
        switch (a.keyCode) {
            case 16:
                this.movementSpeedMultiplier = 1;
                break;
            case 87:
                this.moveState.forward = 0;
                break;
            case 83:
                this.moveState.back = 0;
                break;
            case 65:
                this.moveState.left = 0;
                break;
            case 68:
                this.moveState.right = 0;
                break;
            case 82:
                this.moveState.up = 0;
                break;
            case 70:
                this.moveState.down =
                    0;
                break;
            case 38:
                this.moveState.pitchUp = 0;
                break;
            case 40:
                this.moveState.pitchDown = 0;
                break;
            case 37:
                this.moveState.yawLeft = 0;
                break;
            case 39:
                this.moveState.yawRight = 0;
                break;
            case 81:
                this.moveState.rollLeft = 0;
                break;
            case 69:
                this.moveState.rollRight = 0
        }
        this.updateMovementVector();
        this.updateRotationVector()
    };
    this.mousedown = function(a) {
        this.domElement !== document && this.domElement.focus();
        a.preventDefault();
        a.stopPropagation();
        if (this.dragToLook) this.mouseStatus++;
        else switch (a.button) {
            case 0:
                this.object.moveForward = !0;
                break;
            case 2:
                this.object.moveBackward = !0
        }
    };
    this.mousemove = function(a) {
        if (!this.dragToLook || 0 < this.mouseStatus) {
            var b = this.getContainerDimensions(),
                c = b.size[0] / 2,
                e = b.size[1] / 2;
            this.moveState.yawLeft = -(a.pageX - b.offset[0] - c) / c;
            this.moveState.pitchDown = (a.pageY - b.offset[1] - e) / e;
            this.updateRotationVector()
        }
    };
    this.mouseup = function(a) {
        a.preventDefault();
        a.stopPropagation();
        if (this.dragToLook) this.mouseStatus--, this.moveState.yawLeft = this.moveState.pitchDown = 0;
        else switch (a.button) {
            case 0:
                this.moveForward = !1;
                break;
            case 2:
                this.moveBackward = !1
        }
        this.updateRotationVector()
    };
    this.update = function(a) {
        var b = a * this.movementSpeed,
            a = a * this.rollSpeed;
        this.object.translateX(this.moveVector.x * b);
        this.object.translateY(this.moveVector.y * b);
        this.object.translateZ(this.moveVector.z * b);
        this.tmpQuaternion.set(this.rotationVector.x * a, this.rotationVector.y * a, this.rotationVector.z * a, 1).normalize();
        this.object.quaternion.multiplySelf(this.tmpQuaternion);
        this.object.matrix.setPosition(this.object.position);
        this.object.matrix.setRotationFromQuaternion(this.object.quaternion);
        this.object.matrixWorldNeedsUpdate = !0
    };
    this.updateMovementVector = function() {
        var a = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;
        this.moveVector.x = -this.moveState.left + this.moveState.right;
        this.moveVector.y = -this.moveState.down + this.moveState.up;
        this.moveVector.z = -a + this.moveState.back
    };
    this.updateRotationVector = function() {
        this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp;
        this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft;
        this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft
    };
    this.getContainerDimensions = function() {
        return this.domElement != document ? {
            size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
            offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
        } : {
            size: [window.innerWidth, window.innerHeight],
            offset: [0, 0]
        }
    };
    this.domElement.addEventListener("mousemove", c(this, this.mousemove), !1);
    this.domElement.addEventListener("mousedown", c(this, this.mousedown), !1);
    this.domElement.addEventListener("mouseup", c(this,
        this.mouseup), !1);
    this.domElement.addEventListener("keydown", c(this, this.keydown), !1);
    this.domElement.addEventListener("keyup", c(this, this.keyup), !1);
    this.updateMovementVector();
    this.updateRotationVector()
};
THREE.RollControls = function(a, b) {
    this.object = a;
    this.domElement = void 0 !== b ? b : document;
    this.mouseLook = !0;
    this.autoForward = !1;
    this.rollSpeed = this.movementSpeed = this.lookSpeed = 1;
    this.constrainVertical = [-0.9, 0.9];
    this.object.matrixAutoUpdate = !1;
    this.forward = new THREE.Vector3(0, 0, 1);
    this.roll = 0;
    var c = new THREE.Vector3,
        d = new THREE.Vector3,
        f = new THREE.Vector3,
        g = new THREE.Matrix4,
        e = !1,
        h = 1,
        i = 0,
        j = 0,
        k = 0,
        q = 0,
        m = 0,
        o = window.innerWidth / 2,
        p = window.innerHeight / 2;
    this.update = function(a) {
        if (this.mouseLook) {
            var b = a * this.lookSpeed;
            this.rotateHorizontally(b * q);
            this.rotateVertically(b * m)
        }
        b = a * this.movementSpeed;
        this.object.translateZ(-b * (0 < i || this.autoForward && !(0 > i) ? 1 : i));
        this.object.translateX(b * j);
        this.object.translateY(b * k);
        e && (this.roll += this.rollSpeed * a * h);
        if (this.forward.y > this.constrainVertical[1]) this.forward.y = this.constrainVertical[1], this.forward.normalize();
        else if (this.forward.y < this.constrainVertical[0]) this.forward.y = this.constrainVertical[0], this.forward.normalize();
        f.copy(this.forward);
        d.set(0, 1, 0);
        c.cross(d,
            f).normalize();
        d.cross(f, c).normalize();
        this.object.matrix.n11 = c.x;
        this.object.matrix.n12 = d.x;
        this.object.matrix.n13 = f.x;
        this.object.matrix.n21 = c.y;
        this.object.matrix.n22 = d.y;
        this.object.matrix.n23 = f.y;
        this.object.matrix.n31 = c.z;
        this.object.matrix.n32 = d.z;
        this.object.matrix.n33 = f.z;
        g.identity();
        g.n11 = Math.cos(this.roll);
        g.n12 = -Math.sin(this.roll);
        g.n21 = Math.sin(this.roll);
        g.n22 = Math.cos(this.roll);
        this.object.matrix.multiplySelf(g);
        this.object.matrixWorldNeedsUpdate = !0;
        this.object.matrix.n14 = this.object.position.x;
        this.object.matrix.n24 = this.object.position.y;
        this.object.matrix.n34 = this.object.position.z
    };
    this.translateX = function(a) {
        this.object.position.x += this.object.matrix.n11 * a;
        this.object.position.y += this.object.matrix.n21 * a;
        this.object.position.z += this.object.matrix.n31 * a
    };
    this.translateY = function(a) {
        this.object.position.x += this.object.matrix.n12 * a;
        this.object.position.y += this.object.matrix.n22 * a;
        this.object.position.z += this.object.matrix.n32 * a
    };
    this.translateZ = function(a) {
        this.object.position.x -= this.object.matrix.n13 *
            a;
        this.object.position.y -= this.object.matrix.n23 * a;
        this.object.position.z -= this.object.matrix.n33 * a
    };
    this.rotateHorizontally = function(a) {
        c.set(this.object.matrix.n11, this.object.matrix.n21, this.object.matrix.n31);
        c.multiplyScalar(a);
        this.forward.subSelf(c);
        this.forward.normalize()
    };
    this.rotateVertically = function(a) {
        d.set(this.object.matrix.n12, this.object.matrix.n22, this.object.matrix.n32);
        d.multiplyScalar(a);
        this.forward.addSelf(d);
        this.forward.normalize()
    };
    this.domElement.addEventListener("contextmenu",
        function(a) {
            a.preventDefault()
        }, !1);
    this.domElement.addEventListener("mousemove", function(a) {
        q = (a.clientX - o) / window.innerWidth;
        m = (a.clientY - p) / window.innerHeight
    }, !1);
    this.domElement.addEventListener("mousedown", function(a) {
        a.preventDefault();
        a.stopPropagation();
        switch (a.button) {
            case 0:
                i = 1;
                break;
            case 2:
                i = -1
        }
    }, !1);
    this.domElement.addEventListener("mouseup", function(a) {
        a.preventDefault();
        a.stopPropagation();
        switch (a.button) {
            case 0:
                i = 0;
                break;
            case 2:
                i = 0
        }
    }, !1);
    this.domElement.addEventListener("keydown",
        function(a) {
            switch (a.keyCode) {
                case 38:
                case 87:
                    i = 1;
                    break;
                case 37:
                case 65:
                    j = -1;
                    break;
                case 40:
                case 83:
                    i = -1;
                    break;
                case 39:
                case 68:
                    j = 1;
                    break;
                case 81:
                    e = !0;
                    h = 1;
                    break;
                case 69:
                    e = !0;
                    h = -1;
                    break;
                case 82:
                    k = 1;
                    break;
                case 70:
                    k = -1
            }
        }, !1);
    this.domElement.addEventListener("keyup", function(a) {
        switch (a.keyCode) {
            case 38:
            case 87:
                i = 0;
                break;
            case 37:
            case 65:
                j = 0;
                break;
            case 40:
            case 83:
                i = 0;
                break;
            case 39:
            case 68:
                j = 0;
                break;
            case 81:
                e = !1;
                break;
            case 69:
                e = !1;
                break;
            case 82:
                k = 0;
                break;
            case 70:
                k = 0
        }
    }, !1)
};
THREE.TrackballControls = function(a, b) {
    THREE.EventTarget.call(this);
    var c = this;
    this.object = a;
    this.domElement = void 0 !== b ? b : document;
    this.enabled = !0;
    this.screen = {
        width: window.innerWidth,
        height: window.innerHeight,
        offsetLeft: 0,
        offsetTop: 0
    };
    this.radius = (this.screen.width + this.screen.height) / 4;
    this.rotateSpeed = 1;
    this.zoomSpeed = 1.2;
    this.panSpeed = 0.3;
    this.staticMoving = this.noPan = this.noZoom = this.noRotate = !1;
    this.dynamicDampingFactor = 0.2;
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.keys = [65, 83, 68];
    this.target =
        new THREE.Vector3;
    var d = new THREE.Vector3,
        f = !1,
        g = -1,
        e = new THREE.Vector3,
        h = new THREE.Vector3,
        i = new THREE.Vector3,
        j = new THREE.Vector2,
        k = new THREE.Vector2,
        q = new THREE.Vector2,
        m = new THREE.Vector2,
        o = {
            type: "change"
        };
    this.handleEvent = function(a) {
        if ("function" == typeof this[a.type]) this[a.type](a)
    };
    this.getMouseOnScreen = function(a, b) {
        return new THREE.Vector2(0.5 * ((a - c.screen.offsetLeft) / c.radius), 0.5 * ((b - c.screen.offsetTop) / c.radius))
    };
    this.getMouseProjectionOnBall = function(a, b) {
        var d = new THREE.Vector3((a -
            0.5 * c.screen.width - c.screen.offsetLeft) / c.radius, (0.5 * c.screen.height + c.screen.offsetTop - b) / c.radius, 0),
            f = d.length();
        1 < f ? d.normalize() : d.z = Math.sqrt(1 - f * f);
        e.copy(c.object.position).subSelf(c.target);
        f = c.object.up.clone().setLength(d.y);
        f.addSelf(c.object.up.clone().crossSelf(e).setLength(d.x));
        f.addSelf(e.setLength(d.z));
        return f
    };
    this.rotateCamera = function() {
        var a = Math.acos(h.dot(i) / h.length() / i.length());
        if (a) {
            var b = (new THREE.Vector3).cross(h, i).normalize(),
                d = new THREE.Quaternion,
                a = a * c.rotateSpeed;
            d.setFromAxisAngle(b, -a);
            d.multiplyVector3(e);
            d.multiplyVector3(c.object.up);
            d.multiplyVector3(i);
            c.staticMoving ? h = i : (d.setFromAxisAngle(b, a * (c.dynamicDampingFactor - 1)), d.multiplyVector3(h))
        }
    };
    this.zoomCamera = function() {
        var a = 1 + (k.y - j.y) * c.zoomSpeed;
        1 !== a && 0 < a && (e.multiplyScalar(a), c.staticMoving ? j = k : j.y += (k.y - j.y) * this.dynamicDampingFactor)
    };
    this.panCamera = function() {
        var a = m.clone().subSelf(q);
        if (a.lengthSq()) {
            a.multiplyScalar(e.length() * c.panSpeed);
            var b = e.clone().crossSelf(c.object.up).setLength(a.x);
            b.addSelf(c.object.up.clone().setLength(a.y));
            c.object.position.addSelf(b);
            c.target.addSelf(b);
            c.staticMoving ? q = m : q.addSelf(a.sub(m, q).multiplyScalar(c.dynamicDampingFactor))
        }
    };
    this.checkDistances = function() {
        if (!c.noZoom || !c.noPan) c.object.position.lengthSq() > c.maxDistance * c.maxDistance && c.object.position.setLength(c.maxDistance), e.lengthSq() < c.minDistance * c.minDistance && c.object.position.add(c.target, e.setLength(c.minDistance))
    };
    this.update = function() {
        e.copy(c.object.position).subSelf(c.target);
        c.noRotate || c.rotateCamera();
        c.noZoom || c.zoomCamera();
        c.noPan || c.panCamera();
        c.object.position.add(c.target, e);
        c.checkDistances();
        c.object.lookAt(c.target);
        0 < d.distanceTo(c.object.position) && (c.dispatchEvent(o), d.copy(c.object.position))
    };
    this.domElement.addEventListener("contextmenu", function(a) {
        a.preventDefault()
    }, !1);
    this.domElement.addEventListener("mousemove", function(a) {
        c.enabled && (f && (h = i = c.getMouseProjectionOnBall(a.clientX, a.clientY), j = k = c.getMouseOnScreen(a.clientX, a.clientY), q = m = c.getMouseOnScreen(a.clientX,
            a.clientY), f = !1), -1 !== g && (0 === g && !c.noRotate ? i = c.getMouseProjectionOnBall(a.clientX, a.clientY) : 1 === g && !c.noZoom ? k = c.getMouseOnScreen(a.clientX, a.clientY) : 2 === g && !c.noPan && (m = c.getMouseOnScreen(a.clientX, a.clientY))))
    }, !1);
    this.domElement.addEventListener("mousedown", function(a) {
        if (c.enabled && (a.preventDefault(), a.stopPropagation(), -1 === g)) g = a.button, 0 === g && !c.noRotate ? h = i = c.getMouseProjectionOnBall(a.clientX, a.clientY) : 1 === g && !c.noZoom ? j = k = c.getMouseOnScreen(a.clientX, a.clientY) : this.noPan || (q = m =
            c.getMouseOnScreen(a.clientX, a.clientY))
    }, !1);
    this.domElement.addEventListener("mouseup", function(a) {
        c.enabled && (a.preventDefault(), a.stopPropagation(), g = -1)
    }, !1);
    window.addEventListener("keydown", function(a) {
        c.enabled && -1 === g && (a.keyCode === c.keys[0] && !c.noRotate ? g = 0 : a.keyCode === c.keys[1] && !c.noZoom ? g = 1 : a.keyCode === c.keys[2] && !c.noPan && (g = 2), -1 !== g && (f = !0))
    }, !1);
    window.addEventListener("keyup", function() {
        c.enabled && -1 !== g && (g = -1)
    }, !1)
};
THREE.CubeGeometry = function(a, b, c, d, f, g, e, h) {
    function i(a, b, c, e, h, i, k, m) {
        var n, o = d || 1,
            q = f || 1,
            p = h / 2,
            r = i / 2,
            s = j.vertices.length;
        if ("x" === a && "y" === b || "y" === a && "x" === b) n = "z";
        else if ("x" === a && "z" === b || "z" === a && "x" === b) n = "y", q = g || 1;
        else if ("z" === a && "y" === b || "y" === a && "z" === b) n = "x", o = g || 1;
        var l = o + 1,
            t = q + 1,
            w = h / o,
            E = i / q,
            S = new THREE.Vector3;
        S[n] = 0 < k ? 1 : -1;
        for (h = 0; h < t; h++)
            for (i = 0; i < l; i++) {
                var R = new THREE.Vector3;
                R[a] = (i * w - p) * c;
                R[b] = (h * E - r) * e;
                R[n] = k;
                j.vertices.push(new THREE.Vertex(R))
            }
        for (h = 0; h < q; h++)
            for (i = 0; i < o; i++) a =
                new THREE.Face4(i + l * h + s, i + l * (h + 1) + s, i + 1 + l * (h + 1) + s, i + 1 + l * h + s), a.normal.copy(S), a.vertexNormals.push(S.clone(), S.clone(), S.clone(), S.clone()), a.materialIndex = m, j.faces.push(a), j.faceVertexUvs[0].push([new THREE.UV(i / o, h / q), new THREE.UV(i / o, (h + 1) / q), new THREE.UV((i + 1) / o, (h + 1) / q), new THREE.UV((i + 1) / o, h / q)])
    }
    THREE.Geometry.call(this);
    var j = this,
        k = a / 2,
        q = b / 2,
        m = c / 2,
        o, p, n, r, s, t;
    if (void 0 !== e) {
        if (e instanceof Array) this.materials = e;
        else {
            this.materials = [];
            for (o = 0; 6 > o; o++) this.materials.push(e)
        }
        o = 0;
        r = 1;
        p = 2;
        s =
            3;
        n = 4;
        t = 5
    } else this.materials = [];
    this.sides = {
        px: !0,
        nx: !0,
        py: !0,
        ny: !0,
        pz: !0,
        nz: !0
    };
    if (void 0 != h)
        for (var w in h) void 0 !== this.sides[w] && (this.sides[w] = h[w]);
    this.sides.px && i("z", "y", -1, -1, c, b, k, o);
    this.sides.nx && i("z", "y", 1, -1, c, b, -k, r);
    this.sides.py && i("x", "z", 1, 1, a, c, q, p);
    this.sides.ny && i("x", "z", 1, -1, a, c, -q, s);
    this.sides.pz && i("x", "y", 1, -1, a, b, m, n);
    this.sides.nz && i("x", "y", -1, -1, a, b, -m, t);
    this.computeCentroids();
    this.mergeVertices()
};
THREE.CubeGeometry.prototype = new THREE.Geometry;
THREE.CubeGeometry.prototype.constructor = THREE.CubeGeometry;
THREE.CylinderGeometry = function(a, b, c, d, f, g) {
    THREE.Geometry.call(this);
    var a = void 0 !== a ? a : 20,
        b = void 0 !== b ? b : 20,
        c = void 0 !== c ? c : 100,
        e = c / 2,
        d = d || 8,
        f = f || 1,
        h, i, j = [],
        k = [];
    for (i = 0; i <= f; i++) {
        var q = [],
            m = [],
            o = i / f,
            p = o * (b - a) + a;
        for (h = 0; h <= d; h++) {
            var n = h / d,
                r = p * Math.sin(2 * n * Math.PI),
                s = -o * c + e,
                t = p * Math.cos(2 * n * Math.PI);
            this.vertices.push(new THREE.Vertex(new THREE.Vector3(r, s, t)));
            q.push(this.vertices.length - 1);
            m.push(new THREE.UV(n, o))
        }
        j.push(q);
        k.push(m)
    }
    for (i = 0; i < f; i++)
        for (h = 0; h < d; h++) {
            var c = j[i][h],
                q = j[i + 1][h],
                m = j[i + 1][h + 1],
                o = j[i][h + 1],
                p = this.vertices[c].position.clone().setY(0).normalize(),
                n = this.vertices[q].position.clone().setY(0).normalize(),
                r = this.vertices[m].position.clone().setY(0).normalize(),
                s = this.vertices[o].position.clone().setY(0).normalize(),
                t = k[i][h].clone(),
                w = k[i + 1][h].clone(),
                u = k[i + 1][h + 1].clone(),
                v = k[i][h + 1].clone();
            this.faces.push(new THREE.Face4(c, q, m, o, [p, n, r, s]));
            this.faceVertexUvs[0].push([t, w, u, v])
        }
    if (!g && 0 < a) {
        this.vertices.push(new THREE.Vertex(new THREE.Vector3(0, e, 0)));
        for (h =
            0; h < d; h++) c = j[0][h], q = j[0][h + 1], m = this.vertices.length - 1, p = new THREE.Vector3(0, 1, 0), n = new THREE.Vector3(0, 1, 0), r = new THREE.Vector3(0, 1, 0), t = k[0][h].clone(), w = k[0][h + 1].clone(), u = new THREE.UV(w.u, 0), this.faces.push(new THREE.Face3(c, q, m, [p, n, r])), this.faceVertexUvs[0].push([t, w, u])
    }
    if (!g && 0 < b) {
        this.vertices.push(new THREE.Vertex(new THREE.Vector3(0, -e, 0)));
        for (h = 0; h < d; h++) c = j[i][h + 1], q = j[i][h], m = this.vertices.length - 1, p = new THREE.Vector3(0, -1, 0), n = new THREE.Vector3(0, -1, 0), r = new THREE.Vector3(0, -1,
            0), t = k[i][h + 1].clone(), w = k[i][h].clone(), u = new THREE.UV(w.u, 1), this.faces.push(new THREE.Face3(c, q, m, [p, n, r])), this.faceVertexUvs[0].push([t, w, u])
    }
    this.computeCentroids();
    this.computeFaceNormals()
};
THREE.CylinderGeometry.prototype = new THREE.Geometry;
THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry;
THREE.ExtrudeGeometry = function(a, b) {
    if ("undefined" !== typeof a) {
        THREE.Geometry.call(this);
        var a = a instanceof Array ? a : [a],
            c, d, f = a.length;
        this.shapebb = a[f - 1].getBoundingBox();
        for (d = 0; d < f; d++) c = a[d], this.addShape(c, b);
        this.computeCentroids();
        this.computeFaceNormals()
    }
};
THREE.ExtrudeGeometry.prototype = new THREE.Geometry;
THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry;
THREE.ExtrudeGeometry.prototype.addShape = function(a, b) {
    function c(a, b, c) {
        b || console.log("die");
        return b.clone().multiplyScalar(c).addSelf(a)
    }

    function d(a, b, c) {
        var d = THREE.ExtrudeGeometry.__v1,
            f = THREE.ExtrudeGeometry.__v2,
            e = THREE.ExtrudeGeometry.__v3,
            g = THREE.ExtrudeGeometry.__v4,
            h = THREE.ExtrudeGeometry.__v5,
            i = THREE.ExtrudeGeometry.__v6;
        d.set(a.x - b.x, a.y - b.y);
        f.set(a.x - c.x, a.y - c.y);
        d = d.normalize();
        f = f.normalize();
        e.set(-d.y, d.x);
        g.set(f.y, -f.x);
        h.copy(a).addSelf(e);
        i.copy(a).addSelf(g);
        if (h.equals(i)) return g.clone();
        h.copy(b).addSelf(e);
        i.copy(c).addSelf(g);
        e = d.dot(g);
        g = i.subSelf(h).dot(g);
        0 === e && (console.log("Either infinite or no solutions!"), 0 === g ? console.log("Its finite solutions.") : console.log("Too bad, no solutions."));
        g /= e;
        return 0 > g ? (b = Math.atan2(b.y - a.y, b.x - a.x), a = Math.atan2(c.y - a.y, c.x - a.x), b > a && (a += 2 * Math.PI), c = (b + a) / 2, a = -Math.cos(c), c = -Math.sin(c), new THREE.Vector2(a, c)) : d.multiplyScalar(g).addSelf(h).subSelf(a).clone()
    }

    function f(a) {
        for (y = a.length; 0 <= --y;) {
            $ = y;
            C = y - 1;
            0 > C && (C = a.length - 1);
            for (var b =
                0, c = o + 2 * k, b = 0; b < c; b++) {
                var d = L * b,
                    f = L * (b + 1),
                    e = ca + $ + d,
                    g = ca + C + d,
                    h = ca + C + f,
                    i = ca + $ + f,
                    e = e + D,
                    g = g + D,
                    h = h + D,
                    i = i + D;
                B.faces.push(new THREE.Face4(e, g, h, i, null, null, u));
                var f = B.vertices[e].position.x,
                    d = B.vertices[e].position.y,
                    e = B.vertices[e].position.z,
                    j = B.vertices[g].position.x,
                    l = B.vertices[g].position.y,
                    g = B.vertices[g].position.z,
                    m = B.vertices[h].position.x,
                    n = B.vertices[h].position.y,
                    h = B.vertices[h].position.z,
                    q = B.vertices[i].position.x,
                    p = B.vertices[i].position.y,
                    i = B.vertices[i].position.z;
                0.01 > Math.abs(d - l) ?
                    B.faceVertexUvs[0].push([new THREE.UV(f, e), new THREE.UV(j, g), new THREE.UV(m, h), new THREE.UV(q, i)]) : B.faceVertexUvs[0].push([new THREE.UV(d, e), new THREE.UV(l, g), new THREE.UV(n, h), new THREE.UV(p, i)])
            }
        }
    }

    function g(a, b, c) {
        B.vertices.push(new THREE.Vertex(new THREE.Vector3(a, b, c)))
    }

    function e(a, b, c) {
        a += D;
        b += D;
        c += D;
        B.faces.push(new THREE.Face3(a, b, c, null, null, w));
        var d = B.vertices[b].position.x,
            b = B.vertices[b].position.y,
            f = B.vertices[c].position.x,
            c = B.vertices[c].position.y;
        B.faceVertexUvs[0].push([new THREE.UV(B.vertices[a].position.x,
            1 - B.vertices[a].position.y), new THREE.UV(d, 1 - b), new THREE.UV(f, 1 - c)])
    }
    var h = void 0 !== b.amount ? b.amount : 100,
        i = void 0 !== b.bevelThickness ? b.bevelThickness : 6,
        j = void 0 !== b.bevelSize ? b.bevelSize : i - 2,
        k = void 0 !== b.bevelSegments ? b.bevelSegments : 3,
        q = void 0 !== b.bevelEnabled ? b.bevelEnabled : !0,
        m = void 0 !== b.curveSegments ? b.curveSegments : 12,
        o = void 0 !== b.steps ? b.steps : 1,
        p = b.bendPath,
        n = b.extrudePath,
        r, s = !1,
        t = void 0 !== b.useSpacedPoints ? b.useSpacedPoints : !1,
        w = b.material,
        u = b.extrudeMaterial;
    if (n) r = n.getPoints(m), o = r.length,
    s = !0, q = !1;
    q || (j = i = k = 0);
    var v, A, F, B = this,
        D = this.vertices.length;
    p && a.addWrapPath(p);
    m = t ? a.extractAllSpacedPoints(m) : a.extractAllPoints(m);
    p = m.shape;
    m = m.holes;
    if (n = !THREE.Shape.Utils.isClockWise(p)) {
        p = p.reverse();
        for (A = 0, F = m.length; A < F; A++) v = m[A], THREE.Shape.Utils.isClockWise(v) && (m[A] = v.reverse());
        n = !1
    }
    n = THREE.Shape.Utils.triangulateShape(p, m);
    t = p;
    for (A = 0, F = m.length; A < F; A++) v = m[A], p = p.concat(v);
    for (var H, I, Q, P, L = p.length, K = n.length, O = [], y = 0, l = t.length, $ = l - 1, C = y + 1; y < l; y++, $++, C++) $ === l && ($ = 0), C === l &&
        (C = 0), O[y] = d(t[y], t[$], t[C]);
    var E = [],
        S, R = O.concat();
    for (A = 0, F = m.length; A < F; A++) {
        v = m[A];
        S = [];
        for (y = 0, l = v.length, $ = l - 1, C = y + 1; y < l; y++, $++, C++) $ === l && ($ = 0), C === l && (C = 0), S[y] = d(v[y], v[$], v[C]);
        E.push(S);
        R = R.concat(S)
    }
    for (H = 0; H < k; H++) {
        I = H / k;
        Q = i * (1 - I);
        I = j * Math.sin(I * Math.PI / 2);
        for (y = 0, l = t.length; y < l; y++) P = c(t[y], O[y], I), g(P.x, P.y, -Q);
        for (A = 0, F = m.length; A < F; A++) {
            v = m[A];
            S = E[A];
            for (y = 0, l = v.length; y < l; y++) P = c(v[y], S[y], I), g(P.x, P.y, -Q)
        }
    }
    I = j;
    for (y = 0; y < L; y++) P = q ? c(p[y], R[y], I) : p[y], s ? g(P.x, P.y + r[0].y, r[0].x) :
        g(P.x, P.y, 0);
    for (H = 1; H <= o; H++)
        for (y = 0; y < L; y++) P = q ? c(p[y], R[y], I) : p[y], s ? g(P.x, P.y + r[H - 1].y, r[H - 1].x) : g(P.x, P.y, h / o * H);
    for (H = k - 1; 0 <= H; H--) {
        I = H / k;
        Q = i * (1 - I);
        I = j * Math.sin(I * Math.PI / 2);
        for (y = 0, l = t.length; y < l; y++) P = c(t[y], O[y], I), g(P.x, P.y, h + Q);
        for (A = 0, F = m.length; A < F; A++) {
            v = m[A];
            S = E[A];
            for (y = 0, l = v.length; y < l; y++) P = c(v[y], S[y], I), s ? g(P.x, P.y + r[o - 1].y, r[o - 1].x + Q) : g(P.x, P.y, h + Q)
        }
    }
    if (q) {
        i = 0 * L;
        for (y = 0; y < K; y++) h = n[y], e(h[2] + i, h[1] + i, h[0] + i);
        i = L * (o + 2 * k);
        for (y = 0; y < K; y++) h = n[y], e(h[0] + i, h[1] + i, h[2] + i)
    } else {
        for (y =
            0; y < K; y++) h = n[y], e(h[2], h[1], h[0]);
        for (y = 0; y < K; y++) h = n[y], e(h[0] + L * o, h[1] + L * o, h[2] + L * o)
    }
    var ca = 0;
    f(t);
    ca += t.length;
    for (A = 0, F = m.length; A < F; A++) v = m[A], f(v), ca += v.length
};
THREE.ExtrudeGeometry.__v1 = new THREE.Vector2;
THREE.ExtrudeGeometry.__v2 = new THREE.Vector2;
THREE.ExtrudeGeometry.__v3 = new THREE.Vector2;
THREE.ExtrudeGeometry.__v4 = new THREE.Vector2;
THREE.ExtrudeGeometry.__v5 = new THREE.Vector2;
THREE.ExtrudeGeometry.__v6 = new THREE.Vector2;
THREE.LatheGeometry = function(a, b, c) {
    THREE.Geometry.call(this);
    this.steps = b || 12;
    this.angle = c || 2 * Math.PI;
    for (var b = this.angle / this.steps, c = [], d = [], f = [], g = [], e = (new THREE.Matrix4).setRotationZ(b), h = 0; h < a.length; h++) this.vertices.push(new THREE.Vertex(a[h])), c[h] = a[h].clone(), d[h] = this.vertices.length - 1;
    for (var i = 0; i <= this.angle + 0.001; i += b) {
        for (h = 0; h < c.length; h++) i < this.angle ? (c[h] = e.multiplyVector3(c[h].clone()), this.vertices.push(new THREE.Vertex(c[h])), f[h] = this.vertices.length - 1) : f = g;
        0 == i && (g = d);
        for (h = 0; h < d.length - 1; h++) this.faces.push(new THREE.Face4(f[h], f[h + 1], d[h + 1], d[h])), this.faceVertexUvs[0].push([new THREE.UV(1 - i / this.angle, h / a.length), new THREE.UV(1 - i / this.angle, (h + 1) / a.length), new THREE.UV(1 - (i - b) / this.angle, (h + 1) / a.length), new THREE.UV(1 - (i - b) / this.angle, h / a.length)]);
        d = f;
        f = []
    }
    this.computeCentroids();
    this.computeFaceNormals();
    this.computeVertexNormals()
};
THREE.LatheGeometry.prototype = new THREE.Geometry;
THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry;
THREE.PlaneGeometry = function(a, b, c, d) {
    THREE.Geometry.call(this);
    for (var f = a / 2, g = b / 2, c = c || 1, d = d || 1, e = c + 1, h = d + 1, i = a / c, j = b / d, k = new THREE.Vector3(0, 0, 1), a = 0; a < h; a++)
        for (b = 0; b < e; b++) this.vertices.push(new THREE.Vertex(new THREE.Vector3(b * i - f, -(a * j - g), 0)));
    for (a = 0; a < d; a++)
        for (b = 0; b < c; b++) f = new THREE.Face4(b + e * a, b + e * (a + 1), b + 1 + e * (a + 1), b + 1 + e * a), f.normal.copy(k), f.vertexNormals.push(k.clone(), k.clone(), k.clone(), k.clone()), this.faces.push(f), this.faceVertexUvs[0].push([new THREE.UV(b / c, a / d), new THREE.UV(b /
            c, (a + 1) / d), new THREE.UV((b + 1) / c, (a + 1) / d), new THREE.UV((b + 1) / c, a / d)]);
    this.computeCentroids()
};
THREE.PlaneGeometry.prototype = new THREE.Geometry;
THREE.PlaneGeometry.prototype.constructor = THREE.PlaneGeometry;
THREE.SphereGeometry = function(a, b, c, d, f, g, e) {
    THREE.Geometry.call(this);
    var a = a || 50,
        d = void 0 !== d ? d : 0,
        f = void 0 !== f ? f : 2 * Math.PI,
        g = void 0 !== g ? g : 0,
        e = void 0 !== e ? e : Math.PI,
        b = Math.max(3, Math.floor(b) || 8),
        c = Math.max(2, Math.floor(c) || 6),
        h, i, j = [],
        k = [];
    for (i = 0; i <= c; i++) {
        var q = [],
            m = [];
        for (h = 0; h <= b; h++) {
            var o = h / b,
                p = i / c,
                n = -a * Math.cos(d + o * f) * Math.sin(g + p * e),
                r = a * Math.cos(g + p * e),
                s = a * Math.sin(d + o * f) * Math.sin(g + p * e);
            this.vertices.push(new THREE.Vertex(new THREE.Vector3(n, r, s)));
            q.push(this.vertices.length - 1);
            m.push(new THREE.UV(o,
                p))
        }
        j.push(q);
        k.push(m)
    }
    for (i = 0; i < c; i++)
        for (h = 0; h < b; h++) {
            var d = j[i][h + 1],
                f = j[i][h],
                g = j[i + 1][h],
                e = j[i + 1][h + 1],
                q = this.vertices[d].position.clone().normalize(),
                m = this.vertices[f].position.clone().normalize(),
                o = this.vertices[g].position.clone().normalize(),
                p = this.vertices[e].position.clone().normalize(),
                n = k[i][h + 1].clone(),
                r = k[i][h].clone(),
                s = k[i + 1][h].clone(),
                t = k[i + 1][h + 1].clone();
            Math.abs(this.vertices[d].position.y) == a ? (this.faces.push(new THREE.Face3(d, g, e, [q, o, p])), this.faceVertexUvs[0].push([n,
                s, t
            ])) : Math.abs(this.vertices[g].position.y) == a ? (this.faces.push(new THREE.Face3(d, f, g, [q, m, o])), this.faceVertexUvs[0].push([n, r, s])) : (this.faces.push(new THREE.Face4(d, f, g, e, [q, m, o, p])), this.faceVertexUvs[0].push([n, r, s, t]))
        }
    this.computeCentroids();
    this.computeFaceNormals();
    this.boundingSphere = {
        radius: a
    }
};
THREE.SphereGeometry.prototype = new THREE.Geometry;
THREE.SphereGeometry.prototype.constructor = THREE.SphereGeometry;
THREE.TextGeometry = function(a, b) {
    var c = (new THREE.TextPath(a, b)).toShapes();
    b.amount = void 0 !== b.height ? b.height : 50;
    if (void 0 === b.bevelThickness) b.bevelThickness = 10;
    if (void 0 === b.bevelSize) b.bevelSize = 8;
    if (void 0 === b.bevelEnabled) b.bevelEnabled = !1;
    if (b.bend) {
        var d = c[c.length - 1].getBoundingBox().maxX;
        b.bendPath = new THREE.QuadraticBezierCurve(new THREE.Vector2(0, 0), new THREE.Vector2(d / 2, 120), new THREE.Vector2(d, 0))
    }
    THREE.ExtrudeGeometry.call(this, c, b)
};
THREE.TextGeometry.prototype = new THREE.ExtrudeGeometry;
THREE.TextGeometry.prototype.constructor = THREE.TextGeometry;
THREE.FontUtils = {
    faces: {},
    face: "helvetiker",
    weight: "normal",
    style: "normal",
    size: 150,
    divisions: 10,
    getFace: function() {
        return this.faces[this.face][this.weight][this.style]
    },
    loadFace: function(a) {
        var b = a.familyName.toLowerCase();
        this.faces[b] = this.faces[b] || {};
        this.faces[b][a.cssFontWeight] = this.faces[b][a.cssFontWeight] || {};
        this.faces[b][a.cssFontWeight][a.cssFontStyle] = a;
        return this.faces[b][a.cssFontWeight][a.cssFontStyle] = a
    },
    drawText: function(a) {
        for (var b = this.getFace(), c = this.size / b.resolution, d =
                0, f = ("" + a).split(""), g = f.length, e = [], a = 0; a < g; a++) {
            var h = new THREE.Path,
                h = this.extractGlyphPoints(f[a], b, c, d, h),
                d = d + h.offset;
            e.push(h.path)
        }
        return {
            paths: e,
            offset: d / 2
        }
    },
    extractGlyphPoints: function(a, b, c, d, f) {
        var g = [],
            e, h, i, j, k, q, m, o, p, n, r, s = b.glyphs[a] || b.glyphs["?"];
        if (s) {
            if (s.o) {
                b = s._cachedOutline || (s._cachedOutline = s.o.split(" "));
                j = b.length;
                for (a = 0; a < j;) switch (i = b[a++], i) {
                    case "m":
                        i = b[a++] * c + d;
                        k = b[a++] * c;
                        g.push(new THREE.Vector2(i, k));
                        f.moveTo(i, k);
                        break;
                    case "l":
                        i = b[a++] * c + d;
                        k = b[a++] * c;
                        g.push(new THREE.Vector2(i,
                            k));
                        f.lineTo(i, k);
                        break;
                    case "q":
                        i = b[a++] * c + d;
                        k = b[a++] * c;
                        o = b[a++] * c + d;
                        p = b[a++] * c;
                        f.quadraticCurveTo(o, p, i, k);
                        if (e = g[g.length - 1]) {
                            q = e.x;
                            m = e.y;
                            for (e = 1, h = this.divisions; e <= h; e++) {
                                var t = e / h,
                                    w = THREE.Shape.Utils.b2(t, q, o, i),
                                    t = THREE.Shape.Utils.b2(t, m, p, k);
                                g.push(new THREE.Vector2(w, t))
                            }
                        }
                        break;
                    case "b":
                        if (i = b[a++] * c + d, k = b[a++] * c, o = b[a++] * c + d, p = b[a++] * -c, n = b[a++] * c + d, r = b[a++] * -c, f.bezierCurveTo(i, k, o, p, n, r), e = g[g.length - 1]) {
                            q = e.x;
                            m = e.y;
                            for (e = 1, h = this.divisions; e <= h; e++) t = e / h, w = THREE.Shape.Utils.b3(t, q, o,
                                n, i), t = THREE.Shape.Utils.b3(t, m, p, r, k), g.push(new THREE.Vector2(w, t))
                        }
                }
            }
            return {
                offset: s.ha * c,
                points: g,
                path: f
            }
        }
    }
};
(function(a) {
    var b = function(a) {
        for (var b = a.length, f = 0, g = b - 1, e = 0; e < b; g = e++) f += a[g].x * a[e].y - a[e].x * a[g].y;
        return 0.5 * f
    };
    a.Triangulate = function(a, d) {
        var f = a.length;
        if (3 > f) return null;
        var g = [],
            e = [],
            h = [],
            i, j, k;
        if (0 < b(a))
            for (j = 0; j < f; j++) e[j] = j;
        else
            for (j = 0; j < f; j++) e[j] = f - 1 - j;
        var q = 2 * f;
        for (j = f - 1; 2 < f;) {
            if (0 >= q--) {
                console.log("Warning, unable to triangulate polygon!");
                break
            }
            i = j;
            f <= i && (i = 0);
            j = i + 1;
            f <= j && (j = 0);
            k = j + 1;
            f <= k && (k = 0);
            var m;
            a: {
                m = a;
                var o = i,
                    p = j,
                    n = k,
                    r = f,
                    s = e,
                    t = void 0,
                    w = void 0,
                    u = void 0,
                    v = void 0,
                    A = void 0,
                    F = void 0,
                    B = void 0,
                    D = void 0,
                    H = void 0,
                    w = m[s[o]].x,
                    u = m[s[o]].y,
                    v = m[s[p]].x,
                    A = m[s[p]].y,
                    F = m[s[n]].x,
                    B = m[s[n]].y;
                if (1.0E-10 > (v - w) * (B - u) - (A - u) * (F - w)) m = !1;
                else {
                    for (t = 0; t < r; t++)
                        if (!(t == o || t == p || t == n)) {
                            var D = m[s[t]].x,
                                H = m[s[t]].y,
                                I = void 0,
                                Q = void 0,
                                P = void 0,
                                L = void 0,
                                K = void 0,
                                O = void 0,
                                y = void 0,
                                l = void 0,
                                $ = void 0,
                                C = void 0,
                                E = void 0,
                                S = void 0,
                                I = P = K = void 0,
                                I = F - v,
                                Q = B - A,
                                P = w - F,
                                L = u - B,
                                K = v - w,
                                O = A - u,
                                y = D - w,
                                l = H - u,
                                $ = D - v,
                                C = H - A,
                                E = D - F,
                                S = H - B,
                                I = I * C - Q * $,
                                K = K * l - O * y,
                                P = P * S - L * E;
                            if (0 <= I && 0 <= P && 0 <= K) {
                                m = !1;
                                break a
                            }
                        }
                    m = !0
                }
            }
            if (m) {
                g.push([a[e[i]],
                    a[e[j]], a[e[k]]
                ]);
                h.push([e[i], e[j], e[k]]);
                for (i = j, k = j + 1; k < f; i++, k++) e[i] = e[k];
                f--;
                q = 2 * f
            }
        }
        return d ? h : g
    };
    a.Triangulate.area = b;
    return a
})(THREE.FontUtils);
self._typeface_js = {
    faces: THREE.FontUtils.faces,
    loadFace: THREE.FontUtils.loadFace
};
THREE.TorusGeometry = function(a, b, c, d, f) {
    THREE.Geometry.call(this);
    this.radius = a || 100;
    this.tube = b || 40;
    this.segmentsR = c || 8;
    this.segmentsT = d || 6;
    this.arc = f || 2 * Math.PI;
    f = new THREE.Vector3;
    a = [];
    b = [];
    for (c = 0; c <= this.segmentsR; c++)
        for (d = 0; d <= this.segmentsT; d++) {
            var g = d / this.segmentsT * this.arc,
                e = 2 * c / this.segmentsR * Math.PI;
            f.x = this.radius * Math.cos(g);
            f.y = this.radius * Math.sin(g);
            var h = new THREE.Vector3;
            h.x = (this.radius + this.tube * Math.cos(e)) * Math.cos(g);
            h.y = (this.radius + this.tube * Math.cos(e)) * Math.sin(g);
            h.z =
                this.tube * Math.sin(e);
            this.vertices.push(new THREE.Vertex(h));
            a.push(new THREE.UV(d / this.segmentsT, 1 - c / this.segmentsR));
            b.push(h.clone().subSelf(f).normalize())
        }
    for (c = 1; c <= this.segmentsR; c++)
        for (d = 1; d <= this.segmentsT; d++) {
            var f = (this.segmentsT + 1) * c + d - 1,
                g = (this.segmentsT + 1) * (c - 1) + d - 1,
                e = (this.segmentsT + 1) * (c - 1) + d,
                h = (this.segmentsT + 1) * c + d,
                i = new THREE.Face4(f, g, e, h, [b[f], b[g], b[e], b[h]]);
            i.normal.addSelf(b[f]);
            i.normal.addSelf(b[g]);
            i.normal.addSelf(b[e]);
            i.normal.addSelf(b[h]);
            i.normal.normalize();
            this.faces.push(i);
            this.faceVertexUvs[0].push([a[f].clone(), a[g].clone(), a[e].clone(), a[h].clone()])
        }
    this.computeCentroids()
};
THREE.TorusGeometry.prototype = new THREE.Geometry;
THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry;
THREE.TorusKnotGeometry = function(a, b, c, d, f, g, e) {
    function h(a, b, c, d, f, e) {
        var g = Math.cos(a);
        Math.cos(b);
        b = Math.sin(a);
        a *= c / d;
        c = Math.cos(a);
        g *= 0.5 * f * (2 + c);
        b = 0.5 * f * (2 + c) * b;
        f = 0.5 * e * f * Math.sin(a);
        return new THREE.Vector3(g, b, f)
    }
    THREE.Geometry.call(this);
    this.radius = a || 200;
    this.tube = b || 40;
    this.segmentsR = c || 64;
    this.segmentsT = d || 8;
    this.p = f || 2;
    this.q = g || 3;
    this.heightScale = e || 1;
    this.grid = Array(this.segmentsR);
    c = new THREE.Vector3;
    d = new THREE.Vector3;
    f = new THREE.Vector3;
    for (a = 0; a < this.segmentsR; ++a) {
        this.grid[a] =
            Array(this.segmentsT);
        for (b = 0; b < this.segmentsT; ++b) {
            var i = 2 * (a / this.segmentsR) * this.p * Math.PI,
                e = 2 * (b / this.segmentsT) * Math.PI,
                g = h(i, e, this.q, this.p, this.radius, this.heightScale),
                i = h(i + 0.01, e, this.q, this.p, this.radius, this.heightScale);
            c.sub(i, g);
            d.add(i, g);
            f.cross(c, d);
            d.cross(f, c);
            f.normalize();
            d.normalize();
            i = -this.tube * Math.cos(e);
            e = this.tube * Math.sin(e);
            g.x += i * d.x + e * f.x;
            g.y += i * d.y + e * f.y;
            g.z += i * d.z + e * f.z;
            this.grid[a][b] = this.vertices.push(new THREE.Vertex(new THREE.Vector3(g.x, g.y, g.z))) - 1
        }
    }
    for (a =
        0; a < this.segmentsR; ++a)
        for (b = 0; b < this.segmentsT; ++b) {
            var f = (a + 1) % this.segmentsR,
                g = (b + 1) % this.segmentsT,
                c = this.grid[a][b],
                d = this.grid[f][b],
                f = this.grid[f][g],
                g = this.grid[a][g],
                e = new THREE.UV(a / this.segmentsR, b / this.segmentsT),
                i = new THREE.UV((a + 1) / this.segmentsR, b / this.segmentsT),
                j = new THREE.UV((a + 1) / this.segmentsR, (b + 1) / this.segmentsT),
                k = new THREE.UV(a / this.segmentsR, (b + 1) / this.segmentsT);
            this.faces.push(new THREE.Face4(c, d, f, g));
            this.faceVertexUvs[0].push([e, i, j, k])
        }
    this.computeCentroids();
    this.computeFaceNormals();
    this.computeVertexNormals()
};
THREE.TorusKnotGeometry.prototype = new THREE.Geometry;
THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry;
THREE.PolyhedronGeometry = function(a, b, c, d) {
    function f(a) {
        var b = new THREE.Vertex(a.normalize());
        b.index = i.vertices.push(b) - 1;
        var c = Math.atan2(a.z, -a.x) / 2 / Math.PI + 0.5,
            a = Math.atan2(-a.y, Math.sqrt(a.x * a.x + a.z * a.z)) / Math.PI + 0.5;
        b.uv = new THREE.UV(c, a);
        return b
    }

    function g(a, b, c, d) {
        1 > d ? (d = new THREE.Face3(a.index, b.index, c.index, [a.position.clone(), b.position.clone(), c.position.clone()]), d.centroid.addSelf(a.position).addSelf(b.position).addSelf(c.position).divideScalar(3), d.normal = d.centroid.clone().normalize(),
            i.faces.push(d), d = Math.atan2(d.centroid.z, -d.centroid.x), i.faceVertexUvs[0].push([h(a.uv, a.position, d), h(b.uv, b.position, d), h(c.uv, c.position, d)])) : (d -= 1, g(a, e(a, b), e(a, c), d), g(e(a, b), b, e(b, c), d), g(e(a, c), e(b, c), c, d), g(e(a, b), e(b, c), e(a, c), d))
    }

    function e(a, b) {
        q[a.index] || (q[a.index] = []);
        q[b.index] || (q[b.index] = []);
        var c = q[a.index][b.index];
        void 0 === c && (q[a.index][b.index] = q[b.index][a.index] = c = f((new THREE.Vector3).add(a.position, b.position).divideScalar(2)));
        return c
    }

    function h(a, b, c) {
        0 > c && 1 === a.u &&
            (a = new THREE.UV(a.u - 1, a.v));
        0 === b.x && 0 === b.z && (a = new THREE.UV(c / 2 / Math.PI + 0.5, a.v));
        return a
    }
    THREE.Geometry.call(this);
    for (var c = c || 1, d = d || 0, i = this, j = 0, k = a.length; j < k; j++) f(new THREE.Vector3(a[j][0], a[j][1], a[j][2]));
    for (var q = [], a = this.vertices, j = 0, k = b.length; j < k; j++) g(a[b[j][0]], a[b[j][1]], a[b[j][2]], d);
    this.mergeVertices();
    j = 0;
    for (k = this.vertices.length; j < k; j++) this.vertices[j].position.multiplyScalar(c);
    this.boundingSphere = {
        radius: c
    }
};
THREE.PolyhedronGeometry.prototype = new THREE.Geometry;
THREE.PolyhedronGeometry.prototype.constructor = THREE.PolyhedronGeometry;
THREE.IcosahedronGeometry = function(a, b) {
    var c = (1 + Math.sqrt(5)) / 2;
    THREE.PolyhedronGeometry.call(this, [
        [-1, c, 0],
        [1, c, 0],
        [-1, -c, 0],
        [1, -c, 0],
        [0, -1, c],
        [0, 1, c],
        [0, -1, -c],
        [0, 1, -c],
        [c, 0, -1],
        [c, 0, 1],
        [-c, 0, -1],
        [-c, 0, 1]
    ], [
        [0, 11, 5],
        [0, 5, 1],
        [0, 1, 7],
        [0, 7, 10],
        [0, 10, 11],
        [1, 5, 9],
        [5, 11, 4],
        [11, 10, 2],
        [10, 7, 6],
        [7, 1, 8],
        [3, 9, 4],
        [3, 4, 2],
        [3, 2, 6],
        [3, 6, 8],
        [3, 8, 9],
        [4, 9, 5],
        [2, 4, 11],
        [6, 2, 10],
        [8, 6, 7],
        [9, 8, 1]
    ], a, b)
};
THREE.IcosahedronGeometry.prototype = new THREE.Geometry;
THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry;
THREE.OctahedronGeometry = function(a, b) {
    THREE.PolyhedronGeometry.call(this, [
        [1, 0, 0],
        [-1, 0, 0],
        [0, 1, 0],
        [0, -1, 0],
        [0, 0, 1],
        [0, 0, -1]
    ], [
        [0, 2, 4],
        [0, 4, 3],
        [0, 3, 5],
        [0, 5, 2],
        [1, 2, 5],
        [1, 5, 3],
        [1, 3, 4],
        [1, 4, 2]
    ], a, b)
};
THREE.OctahedronGeometry.prototype = new THREE.Geometry;
THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry;
THREE.TetrahedronGeometry = function(a, b) {
    THREE.PolyhedronGeometry.call(this, [
        [1, 1, 1],
        [-1, -1, 1],
        [-1, 1, -1],
        [1, -1, -1]
    ], [
        [2, 1, 0],
        [0, 3, 2],
        [1, 3, 0],
        [2, 3, 1]
    ], a, b)
};
THREE.TetrahedronGeometry.prototype = new THREE.Geometry;
THREE.TetrahedronGeometry.prototype.constructor = THREE.TetrahedronGeometry;
THREE.AxisHelper = function() {
    THREE.Object3D.call(this);
    var a = new THREE.Geometry;
    a.vertices.push(new THREE.Vertex);
    a.vertices.push(new THREE.Vertex(new THREE.Vector3(0, 100, 0)));
    var b = new THREE.CylinderGeometry(0, 5, 25, 5, 1),
        c;
    c = new THREE.Line(a, new THREE.LineBasicMaterial({
        color: 16711680
    }));
    c.rotation.z = -Math.PI / 2;
    this.add(c);
    c = new THREE.Mesh(b, new THREE.MeshBasicMaterial({
        color: 16711680
    }));
    c.position.x = 100;
    c.rotation.z = -Math.PI / 2;
    this.add(c);
    c = new THREE.Line(a, new THREE.LineBasicMaterial({
        color: 65280
    }));
    this.add(c);
    c = new THREE.Mesh(b, new THREE.MeshBasicMaterial({
        color: 65280
    }));
    c.position.y = 100;
    this.add(c);
    c = new THREE.Line(a, new THREE.LineBasicMaterial({
        color: 255
    }));
    c.rotation.x = Math.PI / 2;
    this.add(c);
    c = new THREE.Mesh(b, new THREE.MeshBasicMaterial({
        color: 255
    }));
    c.position.z = 100;
    c.rotation.x = Math.PI / 2;
    this.add(c)
};
THREE.AxisHelper.prototype = new THREE.Object3D;
THREE.AxisHelper.prototype.constructor = THREE.AxisHelper;
THREE.CameraHelper = function(a) {
    function b(a, b, d) {
        c(a, d);
        c(b, d)
    }

    function c(a, b) {
        d.lineGeometry.vertices.push(new THREE.Vertex(new THREE.Vector3));
        d.lineGeometry.colors.push(new THREE.Color(b));
        void 0 === d.pointMap[a] && (d.pointMap[a] = []);
        d.pointMap[a].push(d.lineGeometry.vertices.length - 1)
    }
    THREE.Object3D.call(this);
    var d = this;
    this.lineGeometry = new THREE.Geometry;
    this.lineMaterial = new THREE.LineBasicMaterial({
        color: 16777215,
        vertexColors: THREE.FaceColors
    });
    this.pointMap = {};
    b("n1", "n2", 16755200);
    b("n2",
        "n4", 16755200);
    b("n4", "n3", 16755200);
    b("n3", "n1", 16755200);
    b("f1", "f2", 16755200);
    b("f2", "f4", 16755200);
    b("f4", "f3", 16755200);
    b("f3", "f1", 16755200);
    b("n1", "f1", 16755200);
    b("n2", "f2", 16755200);
    b("n3", "f3", 16755200);
    b("n4", "f4", 16755200);
    b("p", "n1", 16711680);
    b("p", "n2", 16711680);
    b("p", "n3", 16711680);
    b("p", "n4", 16711680);
    b("u1", "u2", 43775);
    b("u2", "u3", 43775);
    b("u3", "u1", 43775);
    b("c", "t", 16777215);
    b("p", "c", 3355443);
    b("cn1", "cn2", 3355443);
    b("cn3", "cn4", 3355443);
    b("cf1", "cf2", 3355443);
    b("cf3", "cf4", 3355443);
    this.update(a);
    this.lines = new THREE.Line(this.lineGeometry, this.lineMaterial, THREE.LinePieces);
    this.add(this.lines)
};
THREE.CameraHelper.prototype = new THREE.Object3D;
THREE.CameraHelper.prototype.constructor = THREE.CameraHelper;
THREE.CameraHelper.prototype.update = function(a) {
    function b(a, b, g, e) {
        THREE.CameraHelper.__v.set(b, g, e);
        THREE.CameraHelper.__projector.unprojectVector(THREE.CameraHelper.__v, THREE.CameraHelper.__c);
        a = c.pointMap[a];
        if (void 0 !== a) {
            b = 0;
            for (g = a.length; b < g; b++) c.lineGeometry.vertices[a[b]].position.copy(THREE.CameraHelper.__v)
        }
    }
    var c = this;
    THREE.CameraHelper.__c.projectionMatrix.copy(a.projectionMatrix);
    b("c", 0, 0, -1);
    b("t", 0, 0, 1);
    b("n1", -1, -1, -1);
    b("n2", 1, -1, -1);
    b("n3", -1, 1, -1);
    b("n4", 1, 1, -1);
    b("f1", -1, -1,
        1);
    b("f2", 1, -1, 1);
    b("f3", -1, 1, 1);
    b("f4", 1, 1, 1);
    b("u1", 0.7, 1.1, -1);
    b("u2", -0.7, 1.1, -1);
    b("u3", 0, 2, -1);
    b("cf1", -1, 0, 1);
    b("cf2", 1, 0, 1);
    b("cf3", 0, -1, 1);
    b("cf4", 0, 1, 1);
    b("cn1", -1, 0, -1);
    b("cn2", 1, 0, -1);
    b("cn3", 0, -1, -1);
    b("cn4", 0, 1, -1);
    this.lineGeometry.__dirtyVertices = !0
};
THREE.CameraHelper.__projector = new THREE.Projector;
THREE.CameraHelper.__v = new THREE.Vector3;
THREE.CameraHelper.__c = new THREE.Camera;
THREE.SubdivisionModifier = function(a) {
    this.subdivisions = void 0 === a ? 1 : a;
    this.useOldVertexColors = !1;
    this.supportUVs = !0
};
THREE.SubdivisionModifier.prototype.constructor = THREE.SubdivisionModifier;
THREE.SubdivisionModifier.prototype.modify = function(a) {
    for (var b = this.subdivisions; 0 < b--;) this.smooth(a)
};
THREE.SubdivisionModifier.prototype.smooth = function(a) {
    function b(a, b, c, d, h, i) {
        var j = new THREE.Face4(a, b, c, d, null, h.color, h.material);
        if (e.useOldVertexColors) {
            j.vertexColors = [];
            for (var k, n, o, q = 0; 4 > q; q++) {
                o = i[q];
                k = new THREE.Color;
                k.setRGB(0, 0, 0);
                for (var p = 0; p < o.length; p++) n = h.vertexColors[o[p] - 1], k.r += n.r, k.g += n.g, k.b += n.b;
                k.r /= o.length;
                k.g /= o.length;
                k.b /= o.length;
                j.vertexColors[q] = k
            }
        }
        f.push(j);
        (!e.supportUVs || 0 != m.length) && g.push([m[a], m[b], m[c], m[d]])
    }

    function c(a, b) {
        return Math.min(a, b) + "_" + Math.max(a,
            b)
    }
    var d = [],
        f = [],
        g = [],
        e = this,
        h = a.vertices,
        d = a.faces,
        i = h.concat(),
        j = [],
        k = {}, q = {}, m = [],
        o, p, n, r, s, t = a.faceVertexUvs[0];
    for (o = 0, p = t.length; o < p; o++)
        for (n = 0, r = t[o].length; n < r; n++) s = d[o]["abcd".charAt(n)], m[s] || (m[s] = t[o][n]);
    var w;
    for (o = 0, p = d.length; o < p; o++)
        if (s = d[o], j.push(s.centroid), i.push(new THREE.Vertex(s.centroid)), e.supportUVs && 0 != m.length) {
            w = new THREE.UV;
            if (s instanceof THREE.Face3) w.u = m[s.a].u + m[s.b].u + m[s.c].u, w.v = m[s.a].v + m[s.b].v + m[s.c].v, w.u /= 3, w.v /= 3;
            else if (s instanceof THREE.Face4) w.u =
                m[s.a].u + m[s.b].u + m[s.c].u + m[s.d].u, w.v = m[s.a].v + m[s.b].v + m[s.c].v + m[s.d].v, w.u /= 4, w.v /= 4;
            m.push(w)
        }
    p = function(a) {
        function b(a, c, d) {
            void 0 === a[c] && (a[c] = []);
            a[c].push(d)
        }
        var d, f, e, g, h = {};
        for (d = 0, f = a.faces.length; d < f; d++) e = a.faces[d], e instanceof THREE.Face3 ? (g = c(e.a, e.b), b(h, g, d), g = c(e.b, e.c), b(h, g, d), g = c(e.c, e.a), b(h, g, d)) : e instanceof THREE.Face4 && (g = c(e.a, e.b), b(h, g, d), g = c(e.b, e.c), b(h, g, d), g = c(e.c, e.d), b(h, g, d), g = c(e.d, e.a), b(h, g, d));
        return h
    }(a);
    var u = 0,
        t = h.length,
        v, A, F = {}, B = {}, D = function(a,
            b) {
            void 0 === F[a] && (F[a] = []);
            F[a].push(b)
        }, H = function(a, b) {
            void 0 === B[a] && (B[a] = {});
            B[a][b] = null
        };
    for (o in p) {
        w = p[o];
        v = o.split("_");
        A = v[0];
        v = v[1];
        D(A, [A, v]);
        D(v, [A, v]);
        for (n = 0, r = w.length; n < r; n++) s = w[n], H(A, s, o), H(v, s, o);
        2 > w.length && (q[o] = !0)
    }
    for (o in p)
        if (w = p[o], s = w[0], w = w[1], v = o.split("_"), A = v[0], v = v[1], r = new THREE.Vector3, q[o] ? (r.addSelf(h[A].position), r.addSelf(h[v].position), r.multiplyScalar(0.5)) : (r.addSelf(j[s]), r.addSelf(j[w]), r.addSelf(h[A].position), r.addSelf(h[v].position), r.multiplyScalar(0.25)),
            k[o] = t + d.length + u, i.push(new THREE.Vertex(r)), u++, e.supportUVs && 0 != m.length) w = new THREE.UV, w.u = m[A].u + m[v].u, w.v = m[A].v + m[v].v, w.u /= 2, w.v /= 2, m.push(w);
    var I, Q;
    v = ["123", "12", "2", "23"];
    r = ["123", "23", "3", "31"];
    var D = ["123", "31", "1", "12"],
        H = ["1234", "12", "2", "23"],
        P = ["1234", "23", "3", "34"],
        L = ["1234", "34", "4", "41"],
        K = ["1234", "41", "1", "12"];
    for (o = 0, p = j.length; o < p; o++) s = d[o], w = t + o, s instanceof THREE.Face3 ? (u = c(s.a, s.b), A = c(s.b, s.c), I = c(s.c, s.a), b(w, k[u], s.b, k[A], s, v), b(w, k[A], s.c, k[I], s, r), b(w, k[I], s.a, k[u],
        s, D)) : s instanceof THREE.Face4 ? (u = c(s.a, s.b), A = c(s.b, s.c), I = c(s.c, s.d), Q = c(s.d, s.a), b(w, k[u], s.b, k[A], s, H), b(w, k[A], s.c, k[I], s, P), b(w, k[I], s.d, k[Q], s, L), b(w, k[Q], s.a, k[u], s, K)) : console.log("face should be a face!", s);
    d = i;
    i = new THREE.Vector3;
    k = new THREE.Vector3;
    for (o = 0, p = h.length; o < p; o++)
        if (void 0 !== F[o]) {
            i.set(0, 0, 0);
            k.set(0, 0, 0);
            s = new THREE.Vector3(0, 0, 0);
            w = 0;
            for (n in B[o]) i.addSelf(j[n]), w++;
            u = 0;
            t = F[o].length;
            for (n = 0; n < t; n++) q[c(F[o][n][0], F[o][n][1])] && u++;
            if (2 != u) {
                i.divideScalar(w);
                for (n = 0; n <
                    t; n++) w = F[o][n], w = h[w[0]].position.clone().addSelf(h[w[1]].position).divideScalar(2), k.addSelf(w);
                k.divideScalar(t);
                s.addSelf(h[o].position);
                s.multiplyScalar(t - 3);
                s.addSelf(i);
                s.addSelf(k.multiplyScalar(2));
                s.divideScalar(t);
                d[o].position = s
            }
        }
    a.vertices = d;
    a.faces = f;
    a.faceVertexUvs[0] = g;
    delete a.__tmpVertices;
    a.computeCentroids();
    a.computeFaceNormals();
    a.computeVertexNormals()
};
THREE.Loader = function(a) {
    this.statusDomElement = (this.showStatus = a) ? THREE.Loader.prototype.addStatusElement() : null;
    this.onLoadStart = function() {};
    this.onLoadProgress = function() {};
    this.onLoadComplete = function() {}
};
THREE.Loader.prototype = {
    constructor: THREE.Loader,
    crossOrigin: "anonymous",
    addStatusElement: function() {
        var a = document.createElement("div");
        a.style.position = "absolute";
        a.style.right = "0px";
        a.style.top = "0px";
        a.style.fontSize = "0.8em";
        a.style.textAlign = "left";
        a.style.background = "rgba(0,0,0,0.25)";
        a.style.color = "#fff";
        a.style.width = "120px";
        a.style.padding = "0.5em 0.5em 0.5em 0.5em";
        a.style.zIndex = 1E3;
        a.innerHTML = "Loading ...";
        return a
    },
    updateProgress: function(a) {
        var b = "Loaded ",
            b = a.total ? b + ((100 * a.loaded /
                a.total).toFixed(0) + "%") : b + ((a.loaded / 1E3).toFixed(2) + " KB");
        this.statusDomElement.innerHTML = b
    },
    extractUrlBase: function(a) {
        a = a.split("/");
        a.pop();
        return (1 > a.length ? "." : a.join("/")) + "/"
    },
    initMaterials: function(a, b, c) {
        a.materials = [];
        for (var d = 0; d < b.length; ++d) a.materials[d] = THREE.Loader.prototype.createMaterial(b[d], c)
    },
    hasNormals: function(a) {
        var b, c, d = a.materials.length;
        for (c = 0; c < d; c++)
            if (b = a.materials[c], b instanceof THREE.ShaderMaterial) return !0;
        return !1
    },
    createMaterial: function(a, b) {
        function c(a) {
            a =
                Math.log(a) / Math.LN2;
            return Math.floor(a) == a
        }

        function d(a) {
            a = Math.log(a) / Math.LN2;
            return Math.pow(2, Math.round(a))
        }

        function f(a, b) {
            var e = new Image;
            e.onload = function() {
                if (!c(this.width) || !c(this.height)) {
                    var b = d(this.width),
                        e = d(this.height);
                    a.image.width = b;
                    a.image.height = e;
                    a.image.getContext("2d").drawImage(this, 0, 0, b, e)
                } else a.image = this;
                a.needsUpdate = !0
            };
            e.crossOrigin = h.crossOrigin;
            e.src = b
        }

        function g(a, c, d, e, g, h) {
            var i = document.createElement("canvas");
            a[c] = new THREE.Texture(i);
            a[c].sourceFile = d;
            if (e) {
                a[c].repeat.set(e[0], e[1]);
                if (1 != e[0]) a[c].wrapS = THREE.RepeatWrapping;
                if (1 != e[1]) a[c].wrapT = THREE.RepeatWrapping
            }
            g && a[c].offset.set(g[0], g[1]);
            if (h) {
                e = {
                    repeat: THREE.RepeatWrapping,
                    mirror: THREE.MirroredRepeatWrapping
                };
                if (void 0 !== e[h[0]]) a[c].wrapS = e[h[0]];
                if (void 0 !== e[h[1]]) a[c].wrapT = e[h[1]]
            }
            f(a[c], b + "/" + d)
        }

        function e(a) {
            return (255 * a[0] << 16) + (255 * a[1] << 8) + 255 * a[2]
        }
        var h = this,
            i = "MeshLambertMaterial",
            j = {
                color: 15658734,
                opacity: 1,
                map: null,
                lightMap: null,
                normalMap: null,
                wireframe: a.wireframe
            };
        a.shading &&
            ("Phong" == a.shading ? i = "MeshPhongMaterial" : "Basic" == a.shading && (i = "MeshBasicMaterial"));
        if (a.blending)
            if ("Additive" == a.blending) j.blending = THREE.AdditiveBlending;
            else if ("Subtractive" == a.blending) j.blending = THREE.SubtractiveBlending;
        else if ("Multiply" == a.blending) j.blending = THREE.MultiplyBlending;
        if (void 0 !== a.transparent || 1 > a.opacity) j.transparent = a.transparent;
        if (void 0 !== a.depthTest) j.depthTest = a.depthTest;
        if (void 0 !== a.vertexColors)
            if ("face" == a.vertexColors) j.vertexColors = THREE.FaceColors;
            else if (a.vertexColors) j.vertexColors =
            THREE.VertexColors;
        if (a.colorDiffuse) j.color = e(a.colorDiffuse);
        else if (a.DbgColor) j.color = a.DbgColor;
        if (a.colorSpecular) j.specular = e(a.colorSpecular);
        if (a.colorAmbient) j.ambient = e(a.colorAmbient);
        if (a.transparency) j.opacity = a.transparency;
        if (a.specularCoef) j.shininess = a.specularCoef;
        a.mapDiffuse && b && g(j, "map", a.mapDiffuse, a.mapDiffuseRepeat, a.mapDiffuseOffset, a.mapDiffuseWrap);
        a.mapLight && b && g(j, "lightMap", a.mapLight, a.mapLightRepeat, a.mapLightOffset, a.mapLightWrap);
        a.mapNormal && b && g(j, "normalMap",
            a.mapNormal, a.mapNormalRepeat, a.mapNormalOffset, a.mapNormalWrap);
        a.mapSpecular && b && g(j, "specularMap", a.mapSpecular, a.mapSpecularRepeat, a.mapSpecularOffset, a.mapSpecularWrap);
        if (a.mapNormal) {
            var i = THREE.ShaderUtils.lib.normal,
                k = THREE.UniformsUtils.clone(i.uniforms);
            k.tNormal.texture = j.normalMap;
            if (a.mapNormalFactor) k.uNormalScale.value = a.mapNormalFactor;
            if (j.map) k.tDiffuse.texture = j.map, k.enableDiffuse.value = !0;
            if (j.specularMap) k.tSpecular.texture = j.specularMap, k.enableSpecular.value = !0;
            if (j.lightMap) k.tAO.texture =
                j.lightMap, k.enableAO.value = !0;
            k.uDiffuseColor.value.setHex(j.color);
            k.uSpecularColor.value.setHex(j.specular);
            k.uAmbientColor.value.setHex(j.ambient);
            k.uShininess.value = j.shininess;
            if (void 0 !== j.opacity) k.uOpacity.value = j.opacity;
            j = new THREE.ShaderMaterial({
                fragmentShader: i.fragmentShader,
                vertexShader: i.vertexShader,
                uniforms: k,
                lights: !0,
                fog: !0
            })
        } else j = new THREE[i](j); if (void 0 !== a.DbgName) j.name = a.DbgName;
        return j
    }
};
THREE.BinaryLoader = function(a) {
    THREE.Loader.call(this, a)
};
THREE.BinaryLoader.prototype = new THREE.Loader;
THREE.BinaryLoader.prototype.constructor = THREE.BinaryLoader;
THREE.BinaryLoader.prototype.supr = THREE.Loader.prototype;
THREE.BinaryLoader.prototype.load = function(a, b, c, d) {
    var c = c ? c : this.extractUrlBase(a),
        d = d ? d : this.extractUrlBase(a),
        f = this.showProgress ? THREE.Loader.prototype.updateProgress : null;
    this.onLoadStart();
    this.loadAjaxJSON(this, a, b, c, d, f)
};
THREE.BinaryLoader.prototype.loadAjaxJSON = function(a, b, c, d, f, g) {
    var e = new XMLHttpRequest;
    e.onreadystatechange = function() {
        if (4 == e.readyState)
            if (200 == e.status || 0 == e.status) {
                var h = JSON.parse(e.responseText);
                a.loadAjaxBuffers(h, c, f, d, g)
            } else console.error("THREE.BinaryLoader: Couldn't load [" + b + "] [" + e.status + "]")
    };
    e.open("GET", b, !0);
    e.overrideMimeType && e.overrideMimeType("text/plain; charset=x-user-defined");
    e.setRequestHeader("Content-Type", "text/plain");
    e.send(null)
};
THREE.BinaryLoader.prototype.loadAjaxBuffers = function(a, b, c, d, f) {
    var g = new XMLHttpRequest,
        e = c + "/" + a.buffers,
        h = 0;
    g.onreadystatechange = function() {
        4 == g.readyState ? 200 == g.status || 0 == g.status ? THREE.BinaryLoader.prototype.createBinModel(g.response, b, d, a.materials) : console.error("THREE.BinaryLoader: Couldn't load [" + e + "] [" + g.status + "]") : 3 == g.readyState ? f && (0 == h && (h = g.getResponseHeader("Content-Length")), f({
            total: h,
            loaded: g.responseText.length
        })) : 2 == g.readyState && (h = g.getResponseHeader("Content-Length"))
    };
    g.open("GET", e, !0);
    g.responseType = "arraybuffer";
    g.send(null)
};
THREE.BinaryLoader.prototype.createBinModel = function(a, b, c, d) {
    var f = function(b) {
        var c, f, i, j, k, q, m, o, p, n, r, s, t, w, u;

        function v(a) {
            return a % 4 ? 4 - a % 4 : 0
        }

        function A(a, b) {
            return (new Uint8Array(a, b, 1))[0]
        }

        function F(a, b) {
            return (new Uint32Array(a, b, 1))[0]
        }

        function B(b, c) {
            var d, e, f, g, h, i, j, k, l = new Uint32Array(a, c, 3 * b);
            for (d = 0; d < b; d++) {
                e = l[3 * d];
                f = l[3 * d + 1];
                g = l[3 * d + 2];
                h = y[2 * e];
                e = y[2 * e + 1];
                i = y[2 * f];
                j = y[2 * f + 1];
                f = y[2 * g];
                k = y[2 * g + 1];
                g = L.faceVertexUvs[0];
                var m = [];
                m.push(new THREE.UV(h, e));
                m.push(new THREE.UV(i, j));
                m.push(new THREE.UV(f,
                    k));
                g.push(m)
            }
        }

        function D(b, c) {
            var d, e, f, g, h, i, j, k, l, m, n = new Uint32Array(a, c, 4 * b);
            for (d = 0; d < b; d++) {
                e = n[4 * d];
                f = n[4 * d + 1];
                g = n[4 * d + 2];
                h = n[4 * d + 3];
                i = y[2 * e];
                e = y[2 * e + 1];
                j = y[2 * f];
                l = y[2 * f + 1];
                k = y[2 * g];
                m = y[2 * g + 1];
                g = y[2 * h];
                f = y[2 * h + 1];
                h = L.faceVertexUvs[0];
                var o = [];
                o.push(new THREE.UV(i, e));
                o.push(new THREE.UV(j, l));
                o.push(new THREE.UV(k, m));
                o.push(new THREE.UV(g, f));
                h.push(o)
            }
        }

        function H(b, c, d) {
            for (var e, f, g, h, c = new Uint32Array(a, c, 3 * b), i = new Uint16Array(a, d, b), d = 0; d < b; d++) e = c[3 * d], f = c[3 * d + 1], g = c[3 * d + 2], h = i[d],
            L.faces.push(new THREE.Face3(e, f, g, null, null, h))
        }

        function I(b, c, d) {
            for (var e, f, g, h, i, c = new Uint32Array(a, c, 4 * b), j = new Uint16Array(a, d, b), d = 0; d < b; d++) e = c[4 * d], f = c[4 * d + 1], g = c[4 * d + 2], h = c[4 * d + 3], i = j[d], L.faces.push(new THREE.Face4(e, f, g, h, null, null, i))
        }

        function Q(b, c, d, e) {
            for (var f, g, h, i, j, k, l, c = new Uint32Array(a, c, 3 * b), d = new Uint32Array(a, d, 3 * b), m = new Uint16Array(a, e, b), e = 0; e < b; e++) {
                f = c[3 * e];
                g = c[3 * e + 1];
                h = c[3 * e + 2];
                j = d[3 * e];
                k = d[3 * e + 1];
                l = d[3 * e + 2];
                i = m[e];
                var n = O[3 * k],
                    o = O[3 * k + 1];
                k = O[3 * k + 2];
                var q = O[3 * l],
                    p =
                        O[3 * l + 1];
                l = O[3 * l + 2];
                L.faces.push(new THREE.Face3(f, g, h, [new THREE.Vector3(O[3 * j], O[3 * j + 1], O[3 * j + 2]), new THREE.Vector3(n, o, k), new THREE.Vector3(q, p, l)], null, i))
            }
        }

        function P(b, c, d, e) {
            for (var f, g, h, i, j, k, l, m, n, c = new Uint32Array(a, c, 4 * b), d = new Uint32Array(a, d, 4 * b), o = new Uint16Array(a, e, b), e = 0; e < b; e++) {
                f = c[4 * e];
                g = c[4 * e + 1];
                h = c[4 * e + 2];
                i = c[4 * e + 3];
                k = d[4 * e];
                l = d[4 * e + 1];
                m = d[4 * e + 2];
                n = d[4 * e + 3];
                j = o[e];
                var q = O[3 * l],
                    p = O[3 * l + 1];
                l = O[3 * l + 2];
                var r = O[3 * m],
                    s = O[3 * m + 1];
                m = O[3 * m + 2];
                var t = O[3 * n],
                    u = O[3 * n + 1];
                n = O[3 * n + 2];
                L.faces.push(new THREE.Face4(f,
                    g, h, i, [new THREE.Vector3(O[3 * k], O[3 * k + 1], O[3 * k + 2]), new THREE.Vector3(q, p, l), new THREE.Vector3(r, s, m), new THREE.Vector3(t, u, n)], null, j))
            }
        }
        var L = this,
            K = 0,
            O = [],
            y = [],
            l, $, C;
        THREE.Geometry.call(this);
        THREE.Loader.prototype.initMaterials(L, d, b);
        (function(a, b, c) {
            for (var a = new Uint8Array(a, b, c), d = "", e = 0; e < c; e++) d += String.fromCharCode(a[b + e]);
            return d
        })(a, K, 12);
        c = A(a, K + 12);
        A(a, K + 13);
        A(a, K + 14);
        A(a, K + 15);
        f = A(a, K + 16);
        i = A(a, K + 17);
        j = A(a, K + 18);
        k = A(a, K + 19);
        q = F(a, K + 20);
        m = F(a, K + 20 + 4);
        o = F(a, K + 20 + 8);
        b = F(a, K + 20 + 12);
        p =
            F(a, K + 20 + 16);
        n = F(a, K + 20 + 20);
        r = F(a, K + 20 + 24);
        s = F(a, K + 20 + 28);
        t = F(a, K + 20 + 32);
        w = F(a, K + 20 + 36);
        u = F(a, K + 20 + 40);
        K += c;
        c = 3 * f + k;
        C = 4 * f + k;
        l = b * c;
        $ = p * (c + 3 * i);
        f = n * (c + 3 * j);
        k = r * (c + 3 * i + 3 * j);
        c = s * C;
        i = t * (C + 4 * i);
        j = w * (C + 4 * j);
        K += function(b) {
            var b = new Float32Array(a, b, 3 * q),
                c, d, e, f;
            for (c = 0; c < q; c++) d = b[3 * c], e = b[3 * c + 1], f = b[3 * c + 2], L.vertices.push(new THREE.Vertex(new THREE.Vector3(d, e, f)));
            return 3 * q * Float32Array.BYTES_PER_ELEMENT
        }(K);
        K += function(b) {
            if (m) {
                var b = new Int8Array(a, b, 3 * m),
                    c, d, e, f;
                for (c = 0; c < m; c++) d = b[3 * c], e = b[3 * c + 1],
                f = b[3 * c + 2], O.push(d / 127, e / 127, f / 127)
            }
            return 3 * m * Int8Array.BYTES_PER_ELEMENT
        }(K);
        K += v(3 * m);
        K += function(b) {
            if (o) {
                var b = new Float32Array(a, b, 2 * o),
                    c, d, e;
                for (c = 0; c < o; c++) d = b[2 * c], e = b[2 * c + 1], y.push(d, e)
            }
            return 2 * o * Float32Array.BYTES_PER_ELEMENT
        }(K);
        l = K + l + v(2 * b);
        $ = l + $ + v(2 * p);
        f = $ + f + v(2 * n);
        k = f + k + v(2 * r);
        c = k + c + v(2 * s);
        i = c + i + v(2 * t);
        j = i + j + v(2 * w);
        (function(a) {
            if (n) {
                var b = a + 3 * n * Uint32Array.BYTES_PER_ELEMENT;
                H(n, a, b + 3 * n * Uint32Array.BYTES_PER_ELEMENT);
                B(n, b)
            }
        })($);
        (function(a) {
            if (r) {
                var b = a + 3 * r * Uint32Array.BYTES_PER_ELEMENT,
                    c = b + 3 * r * Uint32Array.BYTES_PER_ELEMENT;
                Q(r, a, b, c + 3 * r * Uint32Array.BYTES_PER_ELEMENT);
                B(r, c)
            }
        })(f);
        (function(a) {
            if (w) {
                var b = a + 4 * w * Uint32Array.BYTES_PER_ELEMENT;
                I(w, a, b + 4 * w * Uint32Array.BYTES_PER_ELEMENT);
                D(w, b)
            }
        })(i);
        (function(a) {
            if (u) {
                var b = a + 4 * u * Uint32Array.BYTES_PER_ELEMENT,
                    c = b + 4 * u * Uint32Array.BYTES_PER_ELEMENT;
                P(u, a, b, c + 4 * u * Uint32Array.BYTES_PER_ELEMENT);
                D(u, c)
            }
        })(j);
        b && H(b, K, K + 3 * b * Uint32Array.BYTES_PER_ELEMENT);
        (function(a) {
            if (p) {
                var b = a + 3 * p * Uint32Array.BYTES_PER_ELEMENT;
                Q(p, a, b, b + 3 * p * Uint32Array.BYTES_PER_ELEMENT)
            }
        })(l);
        s && I(s, k, k + 4 * s * Uint32Array.BYTES_PER_ELEMENT);
        (function(a) {
            if (t) {
                var b = a + 4 * t * Uint32Array.BYTES_PER_ELEMENT;
                P(t, a, b, b + 4 * t * Uint32Array.BYTES_PER_ELEMENT)
            }
        })(c);
        this.computeCentroids();
        this.computeFaceNormals();
        THREE.Loader.prototype.hasNormals(this) && this.computeTangents()
    };
    f.prototype = new THREE.Geometry;
    f.prototype.constructor = f;
    b(new f(c))
};
THREE.ColladaLoader = function() {
    function a(a, d, f) {
        U = a;
        d = d || Ta;
        void 0 !== f && (a = f.split("/"), a.pop(), Sa = (1 > a.length ? "." : a.join("/")) + "/");
        if ((a = U.evaluate("//dae:asset", U, E, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext()) && a.childNodes)
            for (f = 0; f < a.childNodes.length; f++) {
                var i = a.childNodes[f];
                switch (i.nodeName) {
                    case "unit":
                        (i = i.getAttribute("meter")) && parseFloat(i);
                        break;
                    case "up_axis":
                        Fa = i.textContent.charAt(0)
                }
            }
        if (!Ea.convertUpAxis || Fa === Ea.upAxis) Wa = null;
        else switch (Fa) {
            case "X":
                Wa = "Y" ===
                    Ea.upAxis ? "XtoY" : "XtoZ";
                break;
            case "Y":
                Wa = "X" === Ea.upAxis ? "YtoX" : "YtoZ";
                break;
            case "Z":
                Wa = "X" === Ea.upAxis ? "ZtoX" : "ZtoY"
        }
        Ka = b("//dae:library_images/dae:image", e, "image");
        ib = b("//dae:library_materials/dae:material", B, "material");
        db = b("//dae:library_effects/dae:effect", P, "effect");
        ha = b("//dae:library_geometries/dae:geometry", r, "geometry");
        lb = b(".//dae:library_cameras/dae:camera", $, "camera");
        qa = b("//dae:library_controllers/dae:controller", h, "controller");
        Ga = b("//dae:library_animations/dae:animation",
            K, "animation");
        Za = b(".//dae:library_visual_scenes/dae:visual_scene", k, "visual_scene");
        La = [];
        sa = [];
        (a = U.evaluate(".//dae:scene/dae:instance_visual_scene", U, E, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext()) ? (a = a.getAttribute("url").replace(/^#/, ""), ea = Za[0 < a.length ? a : "visual_scene0"]) : ea = null;
        ba = new THREE.Object3D;
        for (a = 0; a < ea.nodes.length; a++) ba.add(g(ea.nodes[a]));
        cb = [];
        c(ba);
        a = {
            scene: ba,
            morphs: La,
            skins: sa,
            animations: cb,
            dae: {
                images: Ka,
                materials: ib,
                cameras: lb,
                effects: db,
                geometries: ha,
                controllers: qa,
                animations: Ga,
                visualScenes: Za,
                scene: ea
            }
        };
        d && d(a);
        return a
    }

    function b(a, b, c) {
        for (var a = U.evaluate(a, U, E, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null), d = {}, e = a.iterateNext(), f = 0; e;) {
            e = (new b).parse(e);
            if (!e.id || 0 == e.id.length) e.id = c + f++;
            d[e.id] = e;
            e = a.iterateNext()
        }
        return d
    }

    function c(a) {
        var b = ea.getChildById(a.name, !0),
            d = null;
        if (b && b.keys) {
            d = {
                fps: 60,
                hierarchy: [{
                    node: b,
                    keys: b.keys,
                    sids: b.sids
                }],
                node: a,
                name: "animation_" + a.name,
                length: 0
            };
            cb.push(d);
            for (var e = 0, f = b.keys.length; e < f; e++) d.length = Math.max(d.length,
                b.keys[e].time)
        } else d = {
            hierarchy: [{
                keys: [],
                sids: []
            }]
        };
        e = 0;
        for (f = a.children.length; e < f; e++)
            for (var b = 0, g = c(a.children[e]).hierarchy.length; b < g; b++) d.hierarchy.push({
                keys: [],
                sids: []
            });
        return d
    }

    function d(a, b, c, e) {
        a.world = a.world || new THREE.Matrix4;
        a.world.copy(a.matrix);
        if (a.channels && a.channels.length) {
            var f = a.channels[0].sampler.output[c];
            f instanceof THREE.Matrix4 && a.world.copy(f)
        }
        e && a.world.multiply(e, a.world);
        b.push(a);
        for (e = 0; e < a.nodes.length; e++) d(a.nodes[e], b, c, a.world)
    }

    function f(a, b, c) {
        var e,
            f = qa[b.url];
        if (!f || !f.skin) console.log("ColladaLoader: Could not find skin controller.");
        else if (!b.skeleton || !b.skeleton.length) console.log("ColladaLoader: Could not find the skeleton for the skin. ");
        else {
            var c = 1E6,
                g = -c,
                h = 0;
            for (e in Ga)
                for (var i = Ga[e], j = 0; j < i.sampler.length; j++) {
                    var k = i.sampler[j];
                    k.create();
                    c = Math.min(c, k.startTime);
                    g = Math.max(g, k.endTime);
                    h = Math.max(h, k.input.length)
                }
            e = h;
            for (var b = ea.getChildById(b.skeleton[0], !0) || ea.getChildBySid(b.skeleton[0], !0), l, m, g = new THREE.Vector3, n,
                    j = 0; j < a.vertices.length; j++) f.skin.bindShapeMatrix.multiplyVector3(a.vertices[j].position);
            for (c = 0; c < e; c++) {
                h = [];
                i = [];
                for (j = 0; j < a.vertices.length; j++) i.push(new THREE.Vertex(new THREE.Vector3));
                d(b, h, c);
                j = h;
                k = f.skin;
                for (m = 0; m < j.length; m++)
                    if (l = j[m], n = -1, "JOINT" == l.type) {
                        for (var o = 0; o < k.joints.length; o++)
                            if (l.sid == k.joints[o]) {
                                n = o;
                                break
                            }
                        if (0 <= n) {
                            o = k.invBindMatrices[n];
                            l.invBindMatrix = o;
                            l.skinningMatrix = new THREE.Matrix4;
                            l.skinningMatrix.multiply(l.world, o);
                            l.weights = [];
                            for (o = 0; o < k.weights.length; o++)
                                for (var q =
                                    0; q < k.weights[o].length; q++) {
                                    var p = k.weights[o][q];
                                    p.joint == n && l.weights.push(p)
                                }
                        } else throw "ColladaLoader: Could not find joint '" + l.sid + "'.";
                    }
                for (j = 0; j < h.length; j++)
                    if ("JOINT" == h[j].type)
                        for (k = 0; k < h[j].weights.length; k++) l = h[j].weights[k], m = l.index, l = l.weight, n = a.vertices[m], m = i[m], g.x = n.position.x, g.y = n.position.y, g.z = n.position.z, h[j].skinningMatrix.multiplyVector3(g), m.position.x += g.x * l, m.position.y += g.y * l, m.position.z += g.z * l;
                a.morphTargets.push({
                    name: "target_" + c,
                    vertices: i
                })
            }
        }
    }

    function g(a) {
        var b =
            new THREE.Object3D,
            c, d, e, h;
        for (e = 0; e < a.controllers.length; e++) {
            var i = qa[a.controllers[e].url];
            switch (i.type) {
                case "skin":
                    if (ha[i.skin.source]) {
                        var j = new n;
                        j.url = i.skin.source;
                        j.instance_material = a.controllers[e].instance_material;
                        a.geometries.push(j);
                        c = a.controllers[e]
                    } else if (qa[i.skin.source] && (d = i = qa[i.skin.source], i.morph && ha[i.morph.source])) j = new n, j.url = i.morph.source, j.instance_material = a.controllers[e].instance_material, a.geometries.push(j);
                    break;
                case "morph":
                    if (ha[i.morph.source]) j = new n,
                    j.url = i.morph.source, j.instance_material = a.controllers[e].instance_material, a.geometries.push(j), d = a.controllers[e];
                    console.log("ColladaLoader: Morph-controller partially supported.")
            }
        }
        for (e = 0; e < a.geometries.length; e++) {
            var i = a.geometries[e],
                j = i.instance_material,
                i = ha[i.url],
                k = {}, l = [],
                m = 0,
                q;
            if (i && i.mesh && i.mesh.primitives) {
                if (0 == b.name.length) b.name = i.id;
                if (j)
                    for (h = 0; h < j.length; h++) {
                        q = j[h];
                        var p = ib[q.target],
                            r = db[p.instance_effect.url].shader;
                        r.material.opacity = !r.material.opacity ? 1 : r.material.opacity;
                        k[q.symbol] = m;
                        l.push(r.material);
                        q = r.material;
                        q.name = null == p.name || "" === p.name ? p.id : p.name;
                        m++
                    }
                j = q || new THREE.MeshLambertMaterial({
                    color: 14540253,
                    shading: THREE.FlatShading
                });
                i = i.mesh.geometry3js;
                if (1 < m) {
                    j = new THREE.MeshFaceMaterial;
                    i.materials = l;
                    for (h = 0; h < i.faces.length; h++) l = i.faces[h], l.materialIndex = k[l.daeMaterial]
                }
                if (void 0 !== c) f(i, c), j.morphTargets = !0, j = new THREE.SkinnedMesh(i, j), j.skeleton = c.skeleton, j.skinController = qa[c.url], j.skinInstanceController = c, j.name = "skin_" + sa.length, sa.push(j);
                else if (void 0 !== d) {
                    h = i;
                    k = d instanceof o ? qa[d.url] : d;
                    if (!k || !k.morph) console.log("could not find morph controller!");
                    else {
                        k = k.morph;
                        for (l = 0; l < k.targets.length; l++)
                            if (m = ha[k.targets[l]], m.mesh && m.mesh.primitives && m.mesh.primitives.length) m = m.mesh.primitives[0].geometry, m.vertices.length === h.vertices.length && h.morphTargets.push({
                                name: "target_1",
                                vertices: m.vertices
                            });
                        h.morphTargets.push({
                            name: "target_Z",
                            vertices: h.vertices
                        })
                    }
                    j.morphTargets = !0;
                    j = new THREE.Mesh(i, j);
                    j.name = "morph_" + La.length;
                    La.push(j)
                } else j =
                    new THREE.Mesh(i, j);
                1 < a.geometries.length ? b.add(j) : b = j
            }
        }
        for (e = 0; e < a.cameras.length; e++) b = lb[a.cameras[e].url], b = new THREE.PerspectiveCamera(b.fov, b.aspect_ratio, b.znear, b.zfar);
        b.name = a.id || "";
        b.matrix = a.matrix;
        e = a.matrix.decompose();
        b.position = e[0];
        b.quaternion = e[1];
        b.useQuaternion = !0;
        b.scale = e[2];
        Ea.centerGeometry && b.geometry && (e = THREE.GeometryUtils.center(b.geometry), b.quaternion.multiplyVector3(e.multiplySelf(b.scale)), b.position.subSelf(e));
        for (e = 0; e < a.nodes.length; e++) b.add(g(a.nodes[e], a));
        return b
    }

    function e() {
        this.init_from = this.id = ""
    }

    function h() {
        this.type = this.name = this.id = "";
        this.morph = this.skin = null
    }

    function i() {
        this.weights = this.targets = this.source = this.method = null
    }

    function j() {
        this.source = "";
        this.bindShapeMatrix = null;
        this.invBindMatrices = [];
        this.joints = [];
        this.weights = []
    }

    function k() {
        this.name = this.id = "";
        this.nodes = [];
        this.scene = new THREE.Object3D
    }

    function q() {
        this.sid = this.name = this.id = "";
        this.nodes = [];
        this.controllers = [];
        this.transforms = [];
        this.geometries = [];
        this.channels = [];
        this.matrix = new THREE.Matrix4
    }

    function m() {
        this.type = this.sid = "";
        this.data = [];
        this.obj = null
    }

    function o() {
        this.url = "";
        this.skeleton = [];
        this.instance_material = []
    }

    function p() {
        this.target = this.symbol = ""
    }

    function n() {
        this.url = "";
        this.instance_material = []
    }

    function r() {
        this.id = "";
        this.mesh = null
    }

    function s(a) {
        this.geometry = a.id;
        this.primitives = [];
        this.geometry3js = this.vertices = null
    }

    function t() {}

    function w() {
        this.material = "";
        this.count = 0;
        this.inputs = [];
        this.vcount = null;
        this.p = [];
        this.geometry = new THREE.Geometry
    }

    function u() {
        this.source = "";
        this.stride = this.count = 0;
        this.params = []
    }

    function v() {
        this.input = {}
    }

    function A() {
        this.semantic = "";
        this.offset = 0;
        this.source = "";
        this.set = 0
    }

    function F(a) {
        this.id = a;
        this.type = null
    }

    function B() {
        this.name = this.id = "";
        this.instance_effect = null
    }

    function D() {
        this.color = new THREE.Color(0);
        this.color.setRGB(Math.random(), Math.random(), Math.random());
        this.color.a = 1;
        this.texOpts = this.texcoord = this.texture = null
    }

    function H(a, b) {
        this.type = a;
        this.effect = b;
        this.material = null
    }

    function I(a) {
        this.effect =
            a;
        this.format = this.init_from = null
    }

    function Q(a) {
        this.effect = a;
        this.mipfilter = this.magfilter = this.minfilter = this.wrap_t = this.wrap_s = this.source = null
    }

    function P() {
        this.name = this.id = "";
        this.sampler = this.surface = this.shader = null
    }

    function L() {
        this.url = ""
    }

    function K() {
        this.name = this.id = "";
        this.source = {};
        this.sampler = [];
        this.channel = []
    }

    function O(a) {
        this.animation = a;
        this.target = this.source = "";
        this.member = this.arrIndices = this.arrSyntax = this.dotSyntax = this.sid = this.fullSid = null
    }

    function y(a) {
        this.id = "";
        this.animation =
            a;
        this.inputs = [];
        this.endTime = this.startTime = this.interpolation = this.strideOut = this.output = this.input = null;
        this.duration = 0
    }

    function l(a) {
        this.targets = [];
        this.time = a
    }

    function $() {
        this.name = this.id = ""
    }

    function C() {
        this.url = ""
    }

    function E(a) {
        return "dae" == a ? "http://www.collada.org/2005/11/COLLADASchema" : null
    }

    function S(a) {
        for (var a = ca(a), b = [], c = 0, d = a.length; c < d; c++) b.push(parseFloat(a[c]));
        return b
    }

    function R(a) {
        for (var a = ca(a), b = [], c = 0, d = a.length; c < d; c++) b.push(parseInt(a[c], 10));
        return b
    }

    function ca(a) {
        return 0 <
            a.length ? a.replace(/^\s+/, "").replace(/\s+$/, "").split(/\s+/) : []
    }

    function ka(a, b, c) {
        return a.hasAttribute(b) ? parseInt(a.getAttribute(b), 10) : c
    }

    function ia(a, b) {
        if (Ea.convertUpAxis && Fa !== Ea.upAxis) switch (Wa) {
            case "XtoY":
                var c = a[0];
                a[0] = b * a[1];
                a[1] = c;
                break;
            case "XtoZ":
                c = a[2];
                a[2] = a[1];
                a[1] = a[0];
                a[0] = c;
                break;
            case "YtoX":
                c = a[0];
                a[0] = a[1];
                a[1] = b * c;
                break;
            case "YtoZ":
                c = a[1];
                a[1] = b * a[2];
                a[2] = c;
                break;
            case "ZtoX":
                c = a[0];
                a[0] = a[1];
                a[1] = a[2];
                a[2] = c;
                break;
            case "ZtoY":
                c = a[1], a[1] = a[2], a[2] = b * c
        }
    }

    function N(a, b) {
        var c = [a[b], a[b + 1], a[b + 2]];
        ia(c, -1);
        return new THREE.Vector3(c[0], c[1], c[2])
    }

    function aa(a) {
        if (Ea.convertUpAxis) {
            var b = [a[0], a[4], a[8]];
            ia(b, -1);
            a[0] = b[0];
            a[4] = b[1];
            a[8] = b[2];
            b = [a[1], a[5], a[9]];
            ia(b, -1);
            a[1] = b[0];
            a[5] = b[1];
            a[9] = b[2];
            b = [a[2], a[6], a[10]];
            ia(b, -1);
            a[2] = b[0];
            a[6] = b[1];
            a[10] = b[2];
            b = [a[0], a[1], a[2]];
            ia(b, -1);
            a[0] = b[0];
            a[1] = b[1];
            a[2] = b[2];
            b = [a[4], a[5], a[6]];
            ia(b, -1);
            a[4] = b[0];
            a[5] = b[1];
            a[6] = b[2];
            b = [a[8], a[9], a[10]];
            ia(b, -1);
            a[8] = b[0];
            a[9] = b[1];
            a[10] = b[2];
            b = [a[3], a[7], a[11]];
            ia(b, -1);
            a[3] = b[0];
            a[7] = b[1];
            a[11] = b[2]
        }
        return new THREE.Matrix4(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15])
    }
    var U = null,
        ba = null,
        ea, Ta = null,
        Ja = {}, Ka = {}, Ga = {}, qa = {}, ha = {}, ib = {}, db = {}, lb = {}, cb, Za, Sa, La, sa, za = THREE.SmoothShading,
        Ea = {
            centerGeometry: !1,
            convertUpAxis: !1,
            subdivideFaces: !0,
            upAxis: "Y"
        }, Fa = "Y",
        Wa = null,
        mb = Math.PI / 180;
    e.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if ("init_from" == c.nodeName) this.init_from =
                c.textContent
        }
        return this
    };
    h.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        this.name = a.getAttribute("name");
        this.type = "none";
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            switch (c.nodeName) {
                case "skin":
                    this.skin = (new j).parse(c);
                    this.type = c.nodeName;
                    break;
                case "morph":
                    this.morph = (new i).parse(c), this.type = c.nodeName
            }
        }
        return this
    };
    i.prototype.parse = function(a) {
        var b = {}, c = [],
            d;
        this.method = a.getAttribute("method");
        this.source = a.getAttribute("source").replace(/^#/, "");
        for (d =
            0; d < a.childNodes.length; d++) {
            var e = a.childNodes[d];
            if (1 == e.nodeType) switch (e.nodeName) {
                case "source":
                    e = (new F).parse(e);
                    b[e.id] = e;
                    break;
                case "targets":
                    c = this.parseInputs(e);
                    break;
                default:
                    console.log(e.nodeName)
            }
        }
        for (d = 0; d < c.length; d++) switch (a = c[d], e = b[a.source], a.semantic) {
            case "MORPH_TARGET":
                this.targets = e.read();
                break;
            case "MORPH_WEIGHT":
                this.weights = e.read()
        }
        return this
    };
    i.prototype.parseInputs = function(a) {
        for (var b = [], c = 0; c < a.childNodes.length; c++) {
            var d = a.childNodes[c];
            if (1 == d.nodeType) switch (d.nodeName) {
                case "input":
                    b.push((new A).parse(d))
            }
        }
        return b
    };
    j.prototype.parse = function(a) {
        var b = {}, c, d;
        this.source = a.getAttribute("source").replace(/^#/, "");
        this.invBindMatrices = [];
        this.joints = [];
        this.weights = [];
        for (var e = 0; e < a.childNodes.length; e++) {
            var f = a.childNodes[e];
            if (1 == f.nodeType) switch (f.nodeName) {
                case "bind_shape_matrix":
                    f = S(f.textContent);
                    this.bindShapeMatrix = aa(f);
                    break;
                case "source":
                    f = (new F).parse(f);
                    b[f.id] = f;
                    break;
                case "joints":
                    c = f;
                    break;
                case "vertex_weights":
                    d = f;
                    break;
                default:
                    console.log(f.nodeName)
            }
        }
        this.parseJoints(c, b);
        this.parseWeights(d,
            b);
        return this
    };
    j.prototype.parseJoints = function(a, b) {
        for (var c = 0; c < a.childNodes.length; c++) {
            var d = a.childNodes[c];
            if (1 == d.nodeType) switch (d.nodeName) {
                case "input":
                    var d = (new A).parse(d),
                        e = b[d.source];
                    if ("JOINT" == d.semantic) this.joints = e.read();
                    else if ("INV_BIND_MATRIX" == d.semantic) this.invBindMatrices = e.read()
            }
        }
    };
    j.prototype.parseWeights = function(a, b) {
        for (var c, d, e = [], f = 0; f < a.childNodes.length; f++) {
            var g = a.childNodes[f];
            if (1 == g.nodeType) switch (g.nodeName) {
                case "input":
                    e.push((new A).parse(g));
                    break;
                case "v":
                    c = R(g.textContent);
                    break;
                case "vcount":
                    d = R(g.textContent)
            }
        }
        for (f = g = 0; f < d.length; f++) {
            for (var h = d[f], i = [], j = 0; j < h; j++) {
                for (var k = {}, l = 0; l < e.length; l++) {
                    var m = e[l],
                        n = c[g + m.offset];
                    switch (m.semantic) {
                        case "JOINT":
                            k.joint = n;
                            break;
                        case "WEIGHT":
                            k.weight = b[m.source].data[n]
                    }
                }
                i.push(k);
                g += e.length
            }
            for (j = 0; j < i.length; j++) i[j].index = f;
            this.weights.push(i)
        }
    };
    k.prototype.getChildById = function(a, b) {
        for (var c = 0; c < this.nodes.length; c++) {
            var d = this.nodes[c].getChildById(a, b);
            if (d) return d
        }
        return null
    };
    k.prototype.getChildBySid = function(a, b) {
        for (var c = 0; c < this.nodes.length; c++) {
            var d = this.nodes[c].getChildBySid(a, b);
            if (d) return d
        }
        return null
    };
    k.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        this.name = a.getAttribute("name");
        this.nodes = [];
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "node":
                    this.nodes.push((new q).parse(c))
            }
        }
        return this
    };
    q.prototype.getChannelForTransform = function(a) {
        for (var b = 0; b < this.channels.length; b++) {
            var c = this.channels[b],
                d = c.target.split("/");
            d.shift();
            var e = d.shift(),
                f = 0 <= e.indexOf("."),
                g = 0 <= e.indexOf("("),
                h;
            if (f) d = e.split("."), e = d.shift(), d.shift();
            else if (g) {
                h = e.split("(");
                e = h.shift();
                for (d = 0; d < h.length; d++) h[d] = parseInt(h[d].replace(/\)/, ""))
            }
            if (e == a) return c.info = {
                sid: e,
                dotSyntax: f,
                arrSyntax: g,
                arrIndices: h
            }, c
        }
        return null
    };
    q.prototype.getChildById = function(a, b) {
        if (this.id == a) return this;
        if (b)
            for (var c = 0; c < this.nodes.length; c++) {
                var d = this.nodes[c].getChildById(a, b);
                if (d) return d
            }
        return null
    };
    q.prototype.getChildBySid =
        function(a, b) {
            if (this.sid == a) return this;
            if (b)
                for (var c = 0; c < this.nodes.length; c++) {
                    var d = this.nodes[c].getChildBySid(a, b);
                    if (d) return d
                }
            return null
    };
    q.prototype.getTransformBySid = function(a) {
        for (var b = 0; b < this.transforms.length; b++)
            if (this.transforms[b].sid == a) return this.transforms[b];
        return null
    };
    q.prototype.parse = function(a) {
        var b;
        this.id = a.getAttribute("id");
        this.sid = a.getAttribute("sid");
        this.name = a.getAttribute("name");
        this.type = a.getAttribute("type");
        this.type = "JOINT" == this.type ? this.type :
            "NODE";
        this.nodes = [];
        this.transforms = [];
        this.geometries = [];
        this.cameras = [];
        this.controllers = [];
        this.matrix = new THREE.Matrix4;
        for (var c = 0; c < a.childNodes.length; c++)
            if (b = a.childNodes[c], 1 == b.nodeType) switch (b.nodeName) {
                case "node":
                    this.nodes.push((new q).parse(b));
                    break;
                case "instance_camera":
                    this.cameras.push((new C).parse(b));
                    break;
                case "instance_controller":
                    this.controllers.push((new o).parse(b));
                    break;
                case "instance_geometry":
                    this.geometries.push((new n).parse(b));
                    break;
                case "instance_light":
                    break;
                case "instance_node":
                    b = b.getAttribute("url").replace(/^#/, "");
                    (b = U.evaluate(".//dae:library_nodes//dae:node[@id='" + b + "']", U, E, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext()) && this.nodes.push((new q).parse(b));
                    break;
                case "rotate":
                case "translate":
                case "scale":
                case "matrix":
                case "lookat":
                case "skew":
                    this.transforms.push((new m).parse(b));
                    break;
                case "extra":
                    break;
                default:
                    console.log(b.nodeName)
            }
        a = [];
        c = 1E6;
        b = -1E6;
        for (var d in Ga)
            for (var e = Ga[d], f = 0; f < e.channel.length; f++) {
                var g = e.channel[f],
                    h = e.sampler[f];
                d = g.target.split("/")[0];
                if (d == this.id) h.create(), g.sampler = h, c = Math.min(c, h.startTime), b = Math.max(b, h.endTime), a.push(g)
            }
        if (a.length) this.startTime = c, this.endTime = b;
        if ((this.channels = a) && this.channels.length) {
            d = [];
            a = [];
            c = 0;
            for (e = this.channels.length; c < e; c++) {
                b = this.channels[c];
                f = b.fullSid;
                g = b.member;
                if (Ea.convertUpAxis) switch (g) {
                    case "X":
                        switch (Wa) {
                            case "XtoY":
                            case "XtoZ":
                            case "YtoX":
                                g = "Y";
                                break;
                            case "ZtoX":
                                g = "Z"
                        }
                        break;
                    case "Y":
                        switch (Wa) {
                            case "XtoY":
                            case "YtoX":
                            case "ZtoX":
                                g = "X";
                                break;
                            case "XtoZ":
                            case "YtoZ":
                            case "ZtoY":
                                g = "Z"
                        }
                        break;
                    case "Z":
                        switch (Wa) {
                            case "XtoZ":
                                g = "X";
                                break;
                            case "YtoZ":
                            case "ZtoX":
                            case "ZtoY":
                                g = "Y"
                        }
                }
                var h = b.sampler,
                    i = h.input,
                    j = this.getTransformBySid(b.sid);
                if (j) {
                    -1 === a.indexOf(f) && a.push(f);
                    b = 0;
                    for (var k = i.length; b < k; b++) {
                        var p = i[b],
                            r = h.getData(j.type, b),
                            s;
                        s = null;
                        for (var t = 0, u = d.length; t < u && null == s; t++) {
                            var v = d[t];
                            if (v.time === p) s = v;
                            else if (v.time > p) break
                        }
                        if (!s) {
                            s = new l(p);
                            t = -1;
                            u = 0;
                            for (v = d.length; u < v && -1 == t; u++) d[u].time >= p && (t = u);
                            p = t;
                            d.splice(-1 == p ? d.length :
                                p, 0, s)
                        }
                        s.addTarget(f, j, g, r)
                    }
                } else console.log('Could not find transform "' + b.sid + '" in node ' + this.id)
            }
            for (c = 0; c < a.length; c++) {
                e = a[c];
                for (b = 0; b < d.length; b++)
                    if (s = d[b], !s.hasTarget(e)) {
                        h = d;
                        f = s;
                        j = b;
                        g = e;
                        i = void 0;
                        a: {
                            i = j ? j - 1 : 0;
                            for (i = 0 <= i ? i : i + h.length; 0 <= i; i--)
                                if (k = h[i], k.hasTarget(g)) {
                                    i = k;
                                    break a
                                }
                            i = null
                        }
                        k = void 0;
                        a: {
                            for (j += 1; j < h.length; j++)
                                if (k = h[j], k.hasTarget(g)) break a;
                            k = null
                        }
                        if (i && k) {
                            h = (f.time - i.time) / (k.time - i.time);
                            i = i.getTarget(g);
                            j = k.getTarget(g).data;
                            k = i.data;
                            r = void 0;
                            if (k.length) {
                                r = [];
                                for (p = 0; p <
                                    k.length; ++p) r[p] = k[p] + (j[p] - k[p]) * h
                            } else r = k + (j - k) * h;
                            f.addTarget(g, i.transform, i.member, r)
                        }
                    }
            }
            this.keys = d;
            this.sids = a
        }
        this.updateMatrix();
        return this
    };
    q.prototype.updateMatrix = function() {
        this.matrix.identity();
        for (var a = 0; a < this.transforms.length; a++) this.transforms[a].apply(this.matrix)
    };
    m.prototype.parse = function(a) {
        this.sid = a.getAttribute("sid");
        this.type = a.nodeName;
        this.data = S(a.textContent);
        this.convert();
        return this
    };
    m.prototype.convert = function() {
        switch (this.type) {
            case "matrix":
                this.obj = aa(this.data);
                break;
            case "rotate":
                this.angle = this.data[3] * mb;
            case "translate":
                ia(this.data, -1);
                this.obj = new THREE.Vector3(this.data[0], this.data[1], this.data[2]);
                break;
            case "scale":
                ia(this.data, 1);
                this.obj = new THREE.Vector3(this.data[0], this.data[1], this.data[2]);
                break;
            default:
                console.log("Can not convert Transform of type " + this.type)
        }
    };
    m.prototype.apply = function(a) {
        switch (this.type) {
            case "matrix":
                a.multiplySelf(this.obj);
                break;
            case "translate":
                a.translate(this.obj);
                break;
            case "rotate":
                a.rotateByAxis(this.obj,
                    this.angle);
                break;
            case "scale":
                a.scale(this.obj)
        }
    };
    m.prototype.update = function(a, b) {
        switch (this.type) {
            case "matrix":
                console.log("Currently not handling matrix transform updates");
                break;
            case "translate":
            case "scale":
                switch (b) {
                    case "X":
                        this.obj.x = a;
                        break;
                    case "Y":
                        this.obj.y = a;
                        break;
                    case "Z":
                        this.obj.z = a;
                        break;
                    default:
                        this.obj.x = a[0], this.obj.y = a[1], this.obj.z = a[2]
                }
                break;
            case "rotate":
                switch (b) {
                    case "X":
                        this.obj.x = a;
                        break;
                    case "Y":
                        this.obj.y = a;
                        break;
                    case "Z":
                        this.obj.z = a;
                        break;
                    case "ANGLE":
                        this.angle =
                            a * mb;
                        break;
                    default:
                        this.obj.x = a[0], this.obj.y = a[1], this.obj.z = a[2], this.angle = a[3] * mb
                }
        }
    };
    o.prototype.parse = function(a) {
        this.url = a.getAttribute("url").replace(/^#/, "");
        this.skeleton = [];
        this.instance_material = [];
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "skeleton":
                    this.skeleton.push(c.textContent.replace(/^#/, ""));
                    break;
                case "bind_material":
                    if (c = U.evaluate(".//dae:instance_material", c, E, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null))
                        for (var d =
                            c.iterateNext(); d;) this.instance_material.push((new p).parse(d)), d = c.iterateNext()
            }
        }
        return this
    };
    p.prototype.parse = function(a) {
        this.symbol = a.getAttribute("symbol");
        this.target = a.getAttribute("target").replace(/^#/, "");
        return this
    };
    n.prototype.parse = function(a) {
        this.url = a.getAttribute("url").replace(/^#/, "");
        this.instance_material = [];
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType && "bind_material" == c.nodeName) {
                if (a = U.evaluate(".//dae:instance_material", c, E, XPathResult.ORDERED_NODE_ITERATOR_TYPE,
                    null))
                    for (b = a.iterateNext(); b;) this.instance_material.push((new p).parse(b)), b = a.iterateNext();
                break
            }
        }
        return this
    };
    r.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            switch (c.nodeName) {
                case "mesh":
                    this.mesh = (new s(this)).parse(c)
            }
        }
        return this
    };
    s.prototype.parse = function(a) {
        this.primitives = [];
        var b;
        for (b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            switch (c.nodeName) {
                case "source":
                    var d = c.getAttribute("id");
                    void 0 == Ja[d] && (Ja[d] =
                        (new F(d)).parse(c));
                    break;
                case "vertices":
                    this.vertices = (new v).parse(c);
                    break;
                case "triangles":
                    this.primitives.push((new w).parse(c));
                    break;
                case "polygons":
                    console.warn("polygon holes not yet supported!");
                case "polylist":
                    this.primitives.push((new t).parse(c))
            }
        }
        this.geometry3js = new THREE.Geometry;
        a = Ja[this.vertices.input.POSITION.source].data;
        for (b = 0; b < a.length; b += 3) this.geometry3js.vertices.push(new THREE.Vertex(N(a, b)));
        for (b = 0; b < this.primitives.length; b++) a = this.primitives[b], a.setVertices(this.vertices),
        this.handlePrimitive(a, this.geometry3js);
        this.geometry3js.computeCentroids();
        this.geometry3js.computeFaceNormals();
        this.geometry3js.calcNormals && (this.geometry3js.computeVertexNormals(), delete this.geometry3js.calcNormals);
        this.geometry3js.computeBoundingBox();
        return this
    };
    s.prototype.handlePrimitive = function(a, b) {
        var c = 0,
            d, e, f = a.p,
            g = a.inputs,
            h, i, j, k, l = 0,
            m = 3,
            n = 0,
            o = [];
        for (d = 0; d < g.length; d++) {
            h = g[d];
            var q = h.offset + 1,
                n = n < q ? q : n;
            switch (h.semantic) {
                case "TEXCOORD":
                    o.push(h.set)
            }
        }
        for (; c < f.length;) {
            var p = [],
                r = [],
                q = {}, s = [];
            a.vcount && (m = a.vcount[l++]);
            for (d = 0; d < m; d++)
                for (e = 0; e < g.length; e++) switch (h = g[e], k = Ja[h.source], i = f[c + d * n + h.offset], j = k.accessor.params.length, j *= i, h.semantic) {
                    case "VERTEX":
                        p.push(i);
                        break;
                    case "NORMAL":
                        r.push(N(k.data, j));
                        break;
                    case "TEXCOORD":
                        void 0 === q[h.set] && (q[h.set] = []);
                        q[h.set].push(new THREE.UV(k.data[j], 1 - k.data[j + 1]));
                        break;
                    case "COLOR":
                        s.push((new THREE.Color).setRGB(k.data[j], k.data[j + 1], k.data[j + 2]))
                }
            e = null;
            d = [];
            if (0 == r.length)
                if (h = this.vertices.input.NORMAL) {
                    k = Ja[h.source];
                    j = k.accessor.params.length;
                    h = 0;
                    for (i = p.length; h < i; h++) r.push(N(k.data, p[h] * j))
                } else b.calcNormals = !0;
            if (3 === m) d.push(new THREE.Face3(p[0], p[1], p[2], r, s.length ? s : new THREE.Color));
            else if (4 === m) d.push(new THREE.Face4(p[0], p[1], p[2], p[3], r, s.length ? s : new THREE.Color));
            else if (4 < m && Ea.subdivideFaces) {
                s = s.length ? s : new THREE.Color;
                for (e = 1; e < m - 1;) d.push(new THREE.Face3(p[0], p[e], p[e + 1], [r[0], r[e++], r[e]], s))
            }
            if (d.length) {
                h = 0;
                for (i = d.length; h < i; h++) {
                    e = d[h];
                    e.daeMaterial = a.material;
                    b.faces.push(e);
                    for (e =
                        0; e < o.length; e++) p = q[o[e]], p = 4 < m ? [p[0], p[h + 1], p[h + 2]] : 4 === m ? [p[0], p[1], p[2], p[3]] : [p[0], p[1], p[2]], b.faceVertexUvs[e] || (b.faceVertexUvs[e] = []), b.faceVertexUvs[e].push(p)
                }
            } else console.log("dropped face with vcount " + m + " for geometry with id: " + b.id);
            c += n * m
        }
    };
    t.prototype = new w;
    t.prototype.constructor = t;
    w.prototype.setVertices = function(a) {
        for (var b = 0; b < this.inputs.length; b++)
            if (this.inputs[b].source == a.id) this.inputs[b].source = a.input.POSITION.source
    };
    w.prototype.parse = function(a) {
        this.inputs = [];
        this.material =
            a.getAttribute("material");
        this.count = ka(a, "count", 0);
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            switch (c.nodeName) {
                case "input":
                    this.inputs.push((new A).parse(a.childNodes[b]));
                    break;
                case "vcount":
                    this.vcount = R(c.textContent);
                    break;
                case "p":
                    this.p = R(c.textContent)
            }
        }
        return this
    };
    u.prototype.parse = function(a) {
        this.params = [];
        this.source = a.getAttribute("source");
        this.count = ka(a, "count", 0);
        this.stride = ka(a, "stride", 0);
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if ("param" ==
                c.nodeName) {
                var d = {};
                d.name = c.getAttribute("name");
                d.type = c.getAttribute("type");
                this.params.push(d)
            }
        }
        return this
    };
    v.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        for (var b = 0; b < a.childNodes.length; b++)
            if ("input" == a.childNodes[b].nodeName) {
                var c = (new A).parse(a.childNodes[b]);
                this.input[c.semantic] = c
            }
        return this
    };
    A.prototype.parse = function(a) {
        this.semantic = a.getAttribute("semantic");
        this.source = a.getAttribute("source").replace(/^#/, "");
        this.set = ka(a, "set", -1);
        this.offset = ka(a, "offset", 0);
        if ("TEXCOORD" == this.semantic && 0 > this.set) this.set = 0;
        return this
    };
    F.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            switch (c.nodeName) {
                case "bool_array":
                    for (var d = ca(c.textContent), e = [], f = 0, g = d.length; f < g; f++) e.push("true" == d[f] || "1" == d[f] ? !0 : !1);
                    this.data = e;
                    this.type = c.nodeName;
                    break;
                case "float_array":
                    this.data = S(c.textContent);
                    this.type = c.nodeName;
                    break;
                case "int_array":
                    this.data = R(c.textContent);
                    this.type = c.nodeName;
                    break;
                case "IDREF_array":
                case "Name_array":
                    this.data =
                        ca(c.textContent);
                    this.type = c.nodeName;
                    break;
                case "technique_common":
                    for (d = 0; d < c.childNodes.length; d++)
                        if ("accessor" == c.childNodes[d].nodeName) {
                            this.accessor = (new u).parse(c.childNodes[d]);
                            break
                        }
            }
        }
        return this
    };
    F.prototype.read = function() {
        var a = [],
            b = this.accessor.params[0];
        switch (b.type) {
            case "IDREF":
            case "Name":
            case "name":
            case "float":
                return this.data;
            case "float4x4":
                for (b = 0; b < this.data.length; b += 16) {
                    var c = this.data.slice(b, b + 16),
                        c = aa(c);
                    a.push(c)
                }
                break;
            default:
                console.log("ColladaLoader: Source: Read dont know how to read " +
                    b.type + ".")
        }
        return a
    };
    B.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        this.name = a.getAttribute("name");
        for (var b = 0; b < a.childNodes.length; b++)
            if ("instance_effect" == a.childNodes[b].nodeName) {
                this.instance_effect = (new L).parse(a.childNodes[b]);
                break
            }
        return this
    };
    D.prototype.isColor = function() {
        return null == this.texture
    };
    D.prototype.isTexture = function() {
        return null != this.texture
    };
    D.prototype.parse = function(a) {
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "color":
                    c =
                        S(c.textContent);
                    this.color = new THREE.Color(0);
                    this.color.setRGB(c[0], c[1], c[2]);
                    this.color.a = c[3];
                    break;
                case "texture":
                    this.texture = c.getAttribute("texture"), this.texcoord = c.getAttribute("texcoord"), this.texOpts = {
                        offsetU: 0,
                        offsetV: 0,
                        repeatU: 1,
                        repeatV: 1,
                        wrapU: 1,
                        wrapV: 1
                    }, this.parseTexture(c)
            }
        }
        return this
    };
    D.prototype.parseTexture = function(a) {
        if (!a.childNodes) return this;
        a.childNodes[1] && "extra" === a.childNodes[1].nodeName && (a = a.childNodes[1], a.childNodes[1] && "technique" === a.childNodes[1].nodeName &&
            (a = a.childNodes[1]));
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            switch (c.nodeName) {
                case "offsetU":
                case "offsetV":
                case "repeatU":
                case "repeatV":
                    this.texOpts[c.nodeName] = parseFloat(c.textContent);
                    break;
                case "wrapU":
                case "wrapV":
                    this.texOpts[c.nodeName] = parseInt(c.textContent);
                    break;
                default:
                    this.texOpts[c.nodeName] = c.textContent
            }
        }
        return this
    };
    H.prototype.parse = function(a) {
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "ambient":
                case "emission":
                case "diffuse":
                case "specular":
                case "transparent":
                    this[c.nodeName] =
                        (new D).parse(c);
                    break;
                case "shininess":
                case "reflectivity":
                case "transparency":
                    var d;
                    d = U.evaluate(".//dae:float", c, E, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
                    for (var e = d.iterateNext(), f = []; e;) f.push(e), e = d.iterateNext();
                    d = f;
                    0 < d.length && (this[c.nodeName] = parseFloat(d[0].textContent))
            }
        }
        this.create();
        return this
    };
    H.prototype.create = function() {
        var a = {}, b = void 0 !== this.transparency && 1 > this.transparency,
            c;
        for (c in this) switch (c) {
            case "ambient":
            case "emission":
            case "diffuse":
            case "specular":
                var d = this[c];
                if (d instanceof D)
                    if (d.isTexture()) {
                        if (this.effect.sampler && this.effect.surface && this.effect.sampler.source == this.effect.surface.sid) {
                            var e = Ka[this.effect.surface.init_from];
                            if (e) e = THREE.ImageUtils.loadTexture(Sa + e.init_from), e.wrapS = d.texOpts.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping, e.wrapT = d.texOpts.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping, e.offset.x = d.texOpts.offsetU, e.offset.y = d.texOpts.offsetV, e.repeat.x = d.texOpts.repeatU, e.repeat.y = d.texOpts.repeatV, a.map = e
                        }
                    } else "diffuse" ==
                        c ? a.color = d.color.getHex() : b || (a[c] = d.color.getHex());
                break;
            case "shininess":
            case "reflectivity":
                a[c] = this[c];
                break;
            case "transparency":
                if (b) a.transparent = !0, a.opacity = this[c], b = !0
        }
        a.shading = za;
        return this.material = new THREE.MeshLambertMaterial(a)
    };
    I.prototype.parse = function(a) {
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "init_from":
                    this.init_from = c.textContent;
                    break;
                case "format":
                    this.format = c.textContent;
                    break;
                default:
                    console.log("unhandled Surface prop: " +
                        c.nodeName)
            }
        }
        return this
    };
    Q.prototype.parse = function(a) {
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "source":
                    this.source = c.textContent;
                    break;
                case "minfilter":
                    this.minfilter = c.textContent;
                    break;
                case "magfilter":
                    this.magfilter = c.textContent;
                    break;
                case "mipfilter":
                    this.mipfilter = c.textContent;
                    break;
                case "wrap_s":
                    this.wrap_s = c.textContent;
                    break;
                case "wrap_t":
                    this.wrap_t = c.textContent;
                    break;
                default:
                    console.log("unhandled Sampler2D prop: " + c.nodeName)
            }
        }
        return this
    };
    P.prototype.create = function() {
        if (null == this.shader) return null
    };
    P.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        this.name = a.getAttribute("name");
        this.shader = null;
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "profile_COMMON":
                    this.parseTechnique(this.parseProfileCOMMON(c))
            }
        }
        return this
    };
    P.prototype.parseNewparam = function(a) {
        for (var b = a.getAttribute("sid"), c = 0; c < a.childNodes.length; c++) {
            var d = a.childNodes[c];
            if (1 == d.nodeType) switch (d.nodeName) {
                case "surface":
                    this.surface =
                        (new I(this)).parse(d);
                    this.surface.sid = b;
                    break;
                case "sampler2D":
                    this.sampler = (new Q(this)).parse(d);
                    this.sampler.sid = b;
                    break;
                case "extra":
                    break;
                default:
                    console.log(d.nodeName)
            }
        }
    };
    P.prototype.parseProfileCOMMON = function(a) {
        for (var b, c = 0; c < a.childNodes.length; c++) {
            var d = a.childNodes[c];
            if (1 == d.nodeType) switch (d.nodeName) {
                case "profile_COMMON":
                    this.parseProfileCOMMON(d);
                    break;
                case "technique":
                    b = d;
                    break;
                case "newparam":
                    this.parseNewparam(d);
                    break;
                case "extra":
                    break;
                default:
                    console.log(d.nodeName)
            }
        }
        return b
    };
    P.prototype.parseTechnique = function(a) {
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "constant":
                case "lambert":
                case "blinn":
                case "phong":
                    this.shader = (new H(c.nodeName, this)).parse(c)
            }
        }
    };
    L.prototype.parse = function(a) {
        this.url = a.getAttribute("url").replace(/^#/, "");
        return this
    };
    K.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        this.name = a.getAttribute("name");
        this.source = {};
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "source":
                    c = (new F).parse(c);
                    this.source[c.id] = c;
                    break;
                case "sampler":
                    this.sampler.push((new y(this)).parse(c));
                    break;
                case "channel":
                    this.channel.push((new O(this)).parse(c))
            }
        }
        return this
    };
    O.prototype.parse = function(a) {
        this.source = a.getAttribute("source").replace(/^#/, "");
        this.target = a.getAttribute("target");
        var b = this.target.split("/");
        b.shift();
        var a = b.shift(),
            c = 0 <= a.indexOf("."),
            d = 0 <= a.indexOf("(");
        if (c) b = a.split("."), this.sid = b.shift(), this.member = b.shift();
        else if (d) {
            b = a.split("(");
            this.sid = b.shift();
            for (var e = 0; e < b.length; e++) b[e] = parseInt(b[e].replace(/\)/, ""));
            this.arrIndices = b
        } else this.sid = a;
        this.fullSid = a;
        this.dotSyntax = c;
        this.arrSyntax = d;
        return this
    };
    y.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        this.inputs = [];
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "input":
                    this.inputs.push((new A).parse(c))
            }
        }
        return this
    };
    y.prototype.create = function() {
        for (var a = 0; a < this.inputs.length; a++) {
            var b =
                this.inputs[a],
                c = this.animation.source[b.source];
            switch (b.semantic) {
                case "INPUT":
                    this.input = c.read();
                    break;
                case "OUTPUT":
                    this.output = c.read();
                    this.strideOut = c.accessor.stride;
                    break;
                case "INTERPOLATION":
                    this.interpolation = c.read();
                    break;
                case "IN_TANGENT":
                    break;
                case "OUT_TANGENT":
                    break;
                default:
                    console.log(b.semantic)
            }
        }
        this.duration = this.endTime = this.startTime = 0;
        if (this.input.length) {
            this.startTime = 1E8;
            this.endTime = -1E8;
            for (a = 0; a < this.input.length; a++) this.startTime = Math.min(this.startTime, this.input[a]),
            this.endTime = Math.max(this.endTime, this.input[a]);
            this.duration = this.endTime - this.startTime
        }
    };
    y.prototype.getData = function(a, b) {
        var c;
        if (1 < this.strideOut) {
            c = [];
            for (var b = b * this.strideOut, d = 0; d < this.strideOut; ++d) c[d] = this.output[b + d];
            if (3 === this.strideOut) switch (a) {
                case "rotate":
                case "translate":
                    ia(c, -1);
                    break;
                case "scale":
                    ia(c, 1)
            }
        } else c = this.output[b];
        return c
    };
    l.prototype.addTarget = function(a, b, c, d) {
        this.targets.push({
            sid: a,
            member: c,
            transform: b,
            data: d
        })
    };
    l.prototype.apply = function(a) {
        for (var b =
            0; b < this.targets.length; ++b) {
            var c = this.targets[b];
            (!a || c.sid === a) && c.transform.update(c.data, c.member)
        }
    };
    l.prototype.getTarget = function(a) {
        for (var b = 0; b < this.targets.length; ++b)
            if (this.targets[b].sid === a) return this.targets[b];
        return null
    };
    l.prototype.hasTarget = function(a) {
        for (var b = 0; b < this.targets.length; ++b)
            if (this.targets[b].sid === a) return !0;
        return !1
    };
    l.prototype.interpolate = function(a, b) {
        for (var c = 0; c < this.targets.length; ++c) {
            var d = this.targets[c],
                e = a.getTarget(d.sid);
            if (e) {
                var f = (b - this.time) /
                    (a.time - this.time),
                    g = e.data,
                    h = d.data;
                if (0 > f || 1 < f) console.log("Key.interpolate: Warning! Scale out of bounds:" + f), f = 0 > f ? 0 : 1;
                if (h.length)
                    for (var e = [], i = 0; i < h.length; ++i) e[i] = h[i] + (g[i] - h[i]) * f;
                else e = h + (g - h) * f
            } else e = d.data;
            d.transform.update(e, d.member)
        }
    };
    $.prototype.parse = function(a) {
        this.id = a.getAttribute("id");
        this.name = a.getAttribute("name");
        for (var b = 0; b < a.childNodes.length; b++) {
            var c = a.childNodes[b];
            if (1 == c.nodeType) switch (c.nodeName) {
                case "optics":
                    this.parseOptics(c)
            }
        }
        return this
    };
    $.prototype.parseOptics =
        function(a) {
            for (var b = 0; b < a.childNodes.length; b++)
                if ("technique_common" == a.childNodes[b].nodeName)
                    for (var c = a.childNodes[b], d = 0; d < c.childNodes.length; d++)
                        if ("perspective" == c.childNodes[d].nodeName)
                            for (var e = c.childNodes[d], f = 0; f < e.childNodes.length; f++) {
                                var g = e.childNodes[f];
                                switch (g.nodeName) {
                                    case "xfov":
                                        this.fov = g.textContent;
                                        break;
                                    case "znear":
                                        this.znear = 0.4;
                                        break;
                                    case "zfar":
                                        this.zfar = 1E15;
                                        break;
                                    case "aspect_ratio":
                                        this.aspect_ratio = g.textContent
                                }
                            }
            return this
    };
    C.prototype.parse = function(a) {
        this.url =
            a.getAttribute("url").replace(/^#/, "");
        return this
    };
    return {
        load: function(b, c, d) {
            var e = 0;
            if (document.implementation && document.implementation.createDocument) {
                var f = new XMLHttpRequest;
                f.overrideMimeType && f.overrideMimeType("text/xml");
                f.onreadystatechange = function() {
                    if (4 == f.readyState) {
                        if (0 == f.status || 200 == f.status) f.responseXML ? (Ta = c, a(f.responseXML, void 0, b)) : console.error("ColladaLoader: Empty or non-existing file (" + b + ")")
                    } else 3 == f.readyState && d && (0 == e && (e = f.getResponseHeader("Content-Length")),
                        d({
                            total: e,
                            loaded: f.responseText.length
                        }))
                };
                f.open("GET", b, !0);
                f.send(null)
            } else alert("Don't know how to parse XML!")
        },
        parse: a,
        setPreferredShading: function(a) {
            za = a
        },
        applySkin: f,
        geometries: ha,
        options: Ea
    }
};
THREE.JSONLoader = function(a) {
    THREE.Loader.call(this, a)
};
THREE.JSONLoader.prototype = new THREE.Loader;
THREE.JSONLoader.prototype.constructor = THREE.JSONLoader;
THREE.JSONLoader.prototype.supr = THREE.Loader.prototype;
THREE.JSONLoader.prototype.load = function(a, b, c) {
    c = c ? c : this.extractUrlBase(a);
    this.onLoadStart();
    this.loadAjaxJSON(this, a, b, c)
};
THREE.JSONLoader.prototype.loadAjaxJSON = function(a, b, c, d, f) {
    var g = new XMLHttpRequest,
        e = 0;
    g.onreadystatechange = function() {
        if (g.readyState === g.DONE)
            if (200 === g.status || 0 === g.status) {
                if (g.responseText) {
                    var h = JSON.parse(g.responseText);
                    a.createModel(h, c, d)
                } else console.warn("THREE.JSONLoader: [" + b + "] seems to be unreachable or file there is empty");
                a.onLoadComplete()
            } else console.error("THREE.JSONLoader: Couldn't load [" + b + "] [" + g.status + "]");
            else g.readyState === g.LOADING ? f && (0 === e && (e = g.getResponseHeader("Content-Length")),
                f({
                    total: e,
                    loaded: g.responseText.length
                })) : g.readyState === g.HEADERS_RECEIVED && (e = g.getResponseHeader("Content-Length"))
    };
    g.open("GET", b, !0);
    g.overrideMimeType && g.overrideMimeType("text/plain; charset=x-user-defined");
    g.setRequestHeader("Content-Type", "text/plain");
    g.send(null)
};
THREE.JSONLoader.prototype.createModel = function(a, b, c) {
    var d = new THREE.Geometry,
        f = void 0 !== a.scale ? 1 / a.scale : 1;
    this.initMaterials(d, a.materials, c);
    (function(b) {
        var c, f, i, j, k, q, m, o, p, n, r, s, t, w, u = a.faces;
        q = a.vertices;
        var v = a.normals,
            A = a.colors,
            F = 0;
        for (c = 0; c < a.uvs.length; c++) a.uvs[c].length && F++;
        for (c = 0; c < F; c++) d.faceUvs[c] = [], d.faceVertexUvs[c] = [];
        j = 0;
        for (k = q.length; j < k;) m = new THREE.Vertex, m.position.x = q[j++] * b, m.position.y = q[j++] * b, m.position.z = q[j++] * b, d.vertices.push(m);
        j = 0;
        for (k = u.length; j < k;) {
            b =
                u[j++];
            q = b & 1;
            i = b & 2;
            c = b & 4;
            f = b & 8;
            o = b & 16;
            m = b & 32;
            n = b & 64;
            b &= 128;
            q ? (r = new THREE.Face4, r.a = u[j++], r.b = u[j++], r.c = u[j++], r.d = u[j++], q = 4) : (r = new THREE.Face3, r.a = u[j++], r.b = u[j++], r.c = u[j++], q = 3);
            if (i) i = u[j++], r.materialIndex = i;
            i = d.faces.length;
            if (c)
                for (c = 0; c < F; c++) s = a.uvs[c], p = u[j++], w = s[2 * p], p = s[2 * p + 1], d.faceUvs[c][i] = new THREE.UV(w, p);
            if (f)
                for (c = 0; c < F; c++) {
                    s = a.uvs[c];
                    t = [];
                    for (f = 0; f < q; f++) p = u[j++], w = s[2 * p], p = s[2 * p + 1], t[f] = new THREE.UV(w, p);
                    d.faceVertexUvs[c][i] = t
                }
            if (o) o = 3 * u[j++], f = new THREE.Vector3, f.x = v[o++],
            f.y = v[o++], f.z = v[o], r.normal = f;
            if (m)
                for (c = 0; c < q; c++) o = 3 * u[j++], f = new THREE.Vector3, f.x = v[o++], f.y = v[o++], f.z = v[o], r.vertexNormals.push(f);
            if (n) m = u[j++], m = new THREE.Color(A[m]), r.color = m;
            if (b)
                for (c = 0; c < q; c++) m = u[j++], m = new THREE.Color(A[m]), r.vertexColors.push(m);
            d.faces.push(r)
        }
    })(f);
    (function() {
        var b, c, f, i;
        if (a.skinWeights)
            for (b = 0, c = a.skinWeights.length; b < c; b += 2) f = a.skinWeights[b], i = a.skinWeights[b + 1], d.skinWeights.push(new THREE.Vector4(f, i, 0, 0));
        if (a.skinIndices)
            for (b = 0, c = a.skinIndices.length; b <
                c; b += 2) f = a.skinIndices[b], i = a.skinIndices[b + 1], d.skinIndices.push(new THREE.Vector4(f, i, 0, 0));
        d.bones = a.bones;
        d.animation = a.animation
    })();
    (function(b) {
        if (void 0 !== a.morphTargets) {
            var c, f, i, j, k, q, m, o, p;
            for (c = 0, f = a.morphTargets.length; c < f; c++) {
                d.morphTargets[c] = {};
                d.morphTargets[c].name = a.morphTargets[c].name;
                d.morphTargets[c].vertices = [];
                o = d.morphTargets[c].vertices;
                p = a.morphTargets[c].vertices;
                for (i = 0, j = p.length; i < j; i += 3) k = p[i] * b, q = p[i + 1] * b, m = p[i + 2] * b, o.push(new THREE.Vertex(new THREE.Vector3(k, q,
                    m)))
            }
        }
        if (void 0 !== a.morphColors)
            for (c = 0, f = a.morphColors.length; c < f; c++) {
                d.morphColors[c] = {};
                d.morphColors[c].name = a.morphColors[c].name;
                d.morphColors[c].colors = [];
                j = d.morphColors[c].colors;
                k = a.morphColors[c].colors;
                for (b = 0, i = k.length; b < i; b += 3) q = new THREE.Color(16755200), q.setRGB(k[b], k[b + 1], k[b + 2]), j.push(q)
            }
    })(f);
    d.computeCentroids();
    d.computeFaceNormals();
    this.hasNormals(d) && d.computeTangents();
    b(d)
};
THREE.SceneLoader = function() {
    this.onLoadStart = function() {};
    this.onLoadProgress = function() {};
    this.onLoadComplete = function() {};
    this.callbackSync = function() {};
    this.callbackProgress = function() {}
};
THREE.SceneLoader.prototype.constructor = THREE.SceneLoader;
THREE.SceneLoader.prototype.load = function(a, b) {
    var c = this,
        d = new XMLHttpRequest;
    d.onreadystatechange = function() {
        if (4 == d.readyState)
            if (200 == d.status || 0 == d.status) {
                var f = JSON.parse(d.responseText);
                c.createScene(f, b, a)
            } else console.error("THREE.SceneLoader: Couldn't load [" + a + "] [" + d.status + "]")
    };
    d.open("GET", a, !0);
    d.overrideMimeType && d.overrideMimeType("text/plain; charset=x-user-defined");
    d.setRequestHeader("Content-Type", "text/plain");
    d.send(null)
};
THREE.SceneLoader.prototype.createScene = function(a, b, c) {
    function d(a, b) {
        return "relativeToHTML" == b ? a : j + "/" + a
    }

    function f() {
        var a;
        for (m in L.objects)
            if (!C.objects[m])
                if (s = L.objects[m], void 0 !== s.geometry) {
                    if (H = C.geometries[s.geometry]) {
                        a = !1;
                        I = C.materials[s.materials[0]];
                        (a = I instanceof THREE.ShaderMaterial) && H.computeTangents();
                        u = s.position;
                        v = s.rotation;
                        A = s.quaternion;
                        F = s.scale;
                        A = 0;
                        0 == s.materials.length && (I = new THREE.MeshFaceMaterial);
                        1 < s.materials.length && (I = new THREE.MeshFaceMaterial);
                        a = new THREE.Mesh(H,
                            I);
                        a.name = m;
                        a.position.set(u[0], u[1], u[2]);
                        A ? (a.quaternion.set(A[0], A[1], A[2], A[3]), a.useQuaternion = !0) : a.rotation.set(v[0], v[1], v[2]);
                        a.scale.set(F[0], F[1], F[2]);
                        a.visible = s.visible;
                        C.scene.add(a);
                        C.objects[m] = a;
                        if (s.castsShadow) {
                            var b = new THREE.ShadowVolume(H);
                            C.scene.add(b);
                            b.position = a.position;
                            b.rotation = a.rotation;
                            b.scale = a.scale
                        }
                        s.trigger && "none" != s.trigger.toLowerCase() && (b = {
                            type: s.trigger,
                            object: s
                        }, C.triggers[a.name] = b)
                    }
                } else u = s.position, v = s.rotation, A = s.quaternion, F = s.scale, A = 0, a = new THREE.Object3D,
        a.name = m, a.position.set(u[0], u[1], u[2]), A ? (a.quaternion.set(A[0], A[1], A[2], A[3]), a.useQuaternion = !0) : a.rotation.set(v[0], v[1], v[2]), a.scale.set(F[0], F[1], F[2]), a.visible = void 0 !== s.visible ? s.visible : !1, C.scene.add(a), C.objects[m] = a, C.empties[m] = a, s.trigger && "none" != s.trigger.toLowerCase() && (b = {
            type: s.trigger,
            object: s
        }, C.triggers[a.name] = b)
    }

    function g(a) {
        return function(b) {
            C.geometries[a] = b;
            f();
            O -= 1;
            i.onLoadComplete();
            h()
        }
    }

    function e(a) {
        return function(b) {
            C.geometries[a] = b
        }
    }

    function h() {
        i.callbackProgress({
            totalModels: l,
            totalTextures: $,
            loadedModels: l - O,
            loadedTextures: $ - y
        }, C);
        i.onLoadProgress();
        0 == O && 0 == y && b(C)
    }
    var i = this,
        j = THREE.Loader.prototype.extractUrlBase(c),
        k, q, m, o, p, n, r, s, t, w, u, v, A, F, B, D, H, I, Q, P, L, K, O, y, l, $, C;
    L = a;
    c = new THREE.BinaryLoader;
    K = new THREE.JSONLoader;
    y = O = 0;
    C = {
        scene: new THREE.Scene,
        geometries: {},
        materials: {},
        textures: {},
        objects: {},
        cameras: {},
        lights: {},
        fogs: {},
        triggers: {},
        empties: {}
    };
    if (L.transform) a = L.transform.position, t = L.transform.rotation, B = L.transform.scale, a && C.scene.position.set(a[0], a[1],
        a[2]), t && C.scene.rotation.set(t[0], t[1], t[2]), B && C.scene.scale.set(B[0], B[1], B[2]), (a || t || B) && C.scene.updateMatrix();
    a = function() {
        y -= 1;
        h();
        i.onLoadComplete()
    };
    for (p in L.cameras) B = L.cameras[p], "perspective" == B.type ? Q = new THREE.PerspectiveCamera(B.fov, B.aspect, B.near, B.far) : "ortho" == B.type && (Q = new THREE.OrthographicCamera(B.left, B.right, B.top, B.bottom, B.near, B.far)), u = B.position, t = B.target, B = B.up, Q.position.set(u[0], u[1], u[2]), Q.target = new THREE.Vector3(t[0], t[1], t[2]), B && Q.up.set(B[0], B[1], B[2]),
    C.cameras[p] = Q;
    for (o in L.lights) t = L.lights[o], p = void 0 !== t.color ? t.color : 16777215, Q = void 0 !== t.intensity ? t.intensity : 1, "directional" == t.type ? (u = t.direction, w = new THREE.DirectionalLight(p, Q), w.position.set(u[0], u[1], u[2]), w.position.normalize()) : "point" == t.type ? (u = t.position, w = t.distance, w = new THREE.PointLight(p, Q, w), w.position.set(u[0], u[1], u[2])) : "ambient" == t.type && (w = new THREE.AmbientLight(p)), C.scene.add(w), C.lights[o] = w;
    for (n in L.fogs) o = L.fogs[n], "linear" == o.type ? P = new THREE.Fog(0, o.near, o.far) :
        "exp2" == o.type && (P = new THREE.FogExp2(0, o.density)), B = o.color, P.color.setRGB(B[0], B[1], B[2]), C.fogs[n] = P;
    if (C.cameras && L.defaults.camera) C.currentCamera = C.cameras[L.defaults.camera];
    if (C.fogs && L.defaults.fog) C.scene.fog = C.fogs[L.defaults.fog];
    B = L.defaults.bgcolor;
    C.bgColor = new THREE.Color;
    C.bgColor.setRGB(B[0], B[1], B[2]);
    C.bgColorAlpha = L.defaults.bgalpha;
    for (k in L.geometries)
        if (n = L.geometries[k], "bin_mesh" == n.type || "ascii_mesh" == n.type) O += 1, i.onLoadStart();
    l = O;
    for (k in L.geometries)
        if (n = L.geometries[k],
            "cube" == n.type) H = new THREE.CubeGeometry(n.width, n.height, n.depth, n.segmentsWidth, n.segmentsHeight, n.segmentsDepth, null, n.flipped, n.sides), C.geometries[k] = H;
        else if ("plane" == n.type) H = new THREE.PlaneGeometry(n.width, n.height, n.segmentsWidth, n.segmentsHeight), C.geometries[k] = H;
    else if ("sphere" == n.type) H = new THREE.SphereGeometry(n.radius, n.segmentsWidth, n.segmentsHeight), C.geometries[k] = H;
    else if ("cylinder" == n.type) H = new THREE.CylinderGeometry(n.topRad, n.botRad, n.height, n.radSegs, n.heightSegs), C.geometries[k] =
        H;
    else if ("torus" == n.type) H = new THREE.TorusGeometry(n.radius, n.tube, n.segmentsR, n.segmentsT), C.geometries[k] = H;
    else if ("icosahedron" == n.type) H = new THREE.IcosahedronGeometry(n.radius, n.subdivisions), C.geometries[k] = H;
    else if ("bin_mesh" == n.type) c.load(d(n.url, L.urlBaseType), g(k));
    else if ("ascii_mesh" == n.type) K.load(d(n.url, L.urlBaseType), g(k));
    else if ("embedded_mesh" == n.type) n = L.embeds[n.id], n.metadata = L.metadata, n && K.createModel(n, e(k), "");
    for (r in L.textures)
        if (k = L.textures[r], k.url instanceof Array) {
            y +=
                k.url.length;
            for (n = 0; n < k.url.length; n++) i.onLoadStart()
        } else y += 1, i.onLoadStart();
    $ = y;
    for (r in L.textures) {
        k = L.textures[r];
        if (void 0 != k.mapping && void 0 != THREE[k.mapping]) k.mapping = new THREE[k.mapping];
        if (k.url instanceof Array) {
            n = [];
            for (P = 0; P < k.url.length; P++) n[P] = d(k.url[P], L.urlBaseType);
            n = THREE.ImageUtils.loadTextureCube(n, k.mapping, a)
        } else {
            n = THREE.ImageUtils.loadTexture(d(k.url, L.urlBaseType), k.mapping, a);
            if (void 0 != THREE[k.minFilter]) n.minFilter = THREE[k.minFilter];
            if (void 0 != THREE[k.magFilter]) n.magFilter =
                THREE[k.magFilter];
            if (k.repeat) {
                n.repeat.set(k.repeat[0], k.repeat[1]);
                if (1 != k.repeat[0]) n.wrapS = THREE.RepeatWrapping;
                if (1 != k.repeat[1]) n.wrapT = THREE.RepeatWrapping
            }
            k.offset && n.offset.set(k.offset[0], k.offset[1]);
            if (k.wrap) {
                P = {
                    repeat: THREE.RepeatWrapping,
                    mirror: THREE.MirroredRepeatWrapping
                };
                if (void 0 !== P[k.wrap[0]]) n.wrapS = P[k.wrap[0]];
                if (void 0 !== P[k.wrap[1]]) n.wrapT = P[k.wrap[1]]
            }
        }
        C.textures[r] = n
    }
    for (q in L.materials) {
        r = L.materials[q];
        for (D in r.parameters)
            if ("envMap" == D || "map" == D || "lightMap" == D) r.parameters[D] =
                C.textures[r.parameters[D]];
            else if ("shading" == D) r.parameters[D] = "flat" == r.parameters[D] ? THREE.FlatShading : THREE.SmoothShading;
        else if ("blending" == D) r.parameters[D] = THREE[r.parameters[D]] ? THREE[r.parameters[D]] : THREE.NormalBlending;
        else if ("combine" == D) r.parameters[D] = "MixOperation" == r.parameters[D] ? THREE.MixOperation : THREE.MultiplyOperation;
        else if ("vertexColors" == D)
            if ("face" == r.parameters[D]) r.parameters[D] = THREE.FaceColors;
            else if (r.parameters[D]) r.parameters[D] = THREE.VertexColors;
        if (void 0 !==
            r.parameters.opacity && 1 > r.parameters.opacity) r.parameters.transparent = !0;
        if (r.parameters.normalMap) {
            a = THREE.ShaderUtils.lib.normal;
            k = THREE.UniformsUtils.clone(a.uniforms);
            n = r.parameters.color;
            P = r.parameters.specular;
            c = r.parameters.ambient;
            K = r.parameters.shininess;
            k.tNormal.texture = C.textures[r.parameters.normalMap];
            if (r.parameters.normalMapFactor) k.uNormalScale.value = r.parameters.normalMapFactor;
            if (r.parameters.map) k.tDiffuse.texture = r.parameters.map, k.enableDiffuse.value = !0;
            if (r.parameters.lightMap) k.tAO.texture =
                r.parameters.lightMap, k.enableAO.value = !0;
            if (r.parameters.specularMap) k.tSpecular.texture = C.textures[r.parameters.specularMap], k.enableSpecular.value = !0;
            k.uDiffuseColor.value.setHex(n);
            k.uSpecularColor.value.setHex(P);
            k.uAmbientColor.value.setHex(c);
            k.uShininess.value = K;
            if (r.parameters.opacity) k.uOpacity.value = r.parameters.opacity;
            I = new THREE.ShaderMaterial({
                fragmentShader: a.fragmentShader,
                vertexShader: a.vertexShader,
                uniforms: k,
                lights: !0,
                fog: !0
            })
        } else I = new THREE[r.type](r.parameters);
        C.materials[q] =
            I
    }
    f();
    i.callbackSync(C);
    h()
};
THREE.UTF8Loader = function() {};
THREE.UTF8Loader.prototype.load = function(a, b, c) {
    var d = new XMLHttpRequest,
        f = void 0 !== c.scale ? c.scale : 1,
        g = void 0 !== c.offsetX ? c.offsetX : 0,
        e = void 0 !== c.offsetY ? c.offsetY : 0,
        h = void 0 !== c.offsetZ ? c.offsetZ : 0;
    d.onreadystatechange = function() {
        4 == d.readyState ? 200 == d.status || 0 == d.status ? THREE.UTF8Loader.prototype.createModel(d.responseText, b, f, g, e, h) : console.error("THREE.UTF8Loader: Couldn't load [" + a + "] [" + d.status + "]") : 3 != d.readyState && 2 == d.readyState && d.getResponseHeader("Content-Length")
    };
    d.open("GET", a, !0);
    d.send(null)
};
THREE.UTF8Loader.prototype.decompressMesh = function(a) {
    var b = a.charCodeAt(0);
    57344 <= b && (b -= 2048);
    b++;
    for (var c = new Float32Array(8 * b), d = 1, f = 0; 8 > f; f++) {
        for (var g = 0, e = 0; e < b; ++e) {
            var h = a.charCodeAt(e + d),
                g = g + (h >> 1 ^ -(h & 1));
            c[8 * e + f] = g
        }
        d += b
    }
    b = a.length - d;
    g = new Uint16Array(b);
    for (f = e = 0; f < b; f++) h = a.charCodeAt(f + d), g[f] = e - h, 0 == h && e++;
    return [c, g]
};
THREE.UTF8Loader.prototype.createModel = function(a, b, c, d, f, g) {
    var e = function() {
        var b = this;
        b.materials = [];
        THREE.Geometry.call(this);
        var e = THREE.UTF8Loader.prototype.decompressMesh(a),
            j = [],
            k = [];
        (function(a, e, i) {
            for (var j, k, r, s = a.length; i < s; i += e) j = a[i], k = a[i + 1], r = a[i + 2], j = j / 16383 * c, k = k / 16383 * c, r = r / 16383 * c, j += d, k += f, r += g, b.vertices.push(new THREE.Vertex(new THREE.Vector3(j, k, r)))
        })(e[0], 8, 0);
        (function(a, b, c) {
            for (var d, e, f = a.length; c < f; c += b) d = a[c], e = a[c + 1], d /= 1023, e /= 1023, k.push(d, 1 - e)
        })(e[0], 8, 3);
        (function(a,
            b, c) {
            for (var d, e, f, g = a.length; c < g; c += b) d = a[c], e = a[c + 1], f = a[c + 2], d = (d - 512) / 511, e = (e - 512) / 511, f = (f - 512) / 511, j.push(d, e, f)
        })(e[0], 8, 5);
        (function(a) {
            var c, d, e, f, g, i, t, w, u, v = a.length;
            for (c = 0; c < v; c += 3) {
                d = a[c];
                e = a[c + 1];
                f = a[c + 2];
                g = b;
                w = d;
                u = e;
                i = f;
                var A = j[3 * e],
                    F = j[3 * e + 1],
                    B = j[3 * e + 2],
                    D = j[3 * f],
                    H = j[3 * f + 1],
                    I = j[3 * f + 2];
                t = new THREE.Vector3(j[3 * d], j[3 * d + 1], j[3 * d + 2]);
                A = new THREE.Vector3(A, F, B);
                D = new THREE.Vector3(D, H, I);
                g.faces.push(new THREE.Face3(w, u, i, [t, A, D], null, 0));
                g = k[2 * d];
                d = k[2 * d + 1];
                i = k[2 * e];
                t = k[2 * e + 1];
                w = k[2 *
                    f];
                u = k[2 * f + 1];
                f = b.faceVertexUvs[0];
                e = i;
                i = t;
                t = [];
                t.push(new THREE.UV(g, d));
                t.push(new THREE.UV(e, i));
                t.push(new THREE.UV(w, u));
                f.push(t)
            }
        })(e[1]);
        this.computeCentroids();
        this.computeFaceNormals()
    };
    e.prototype = new THREE.Geometry;
    e.prototype.constructor = e;
    b(new e)
};
THREE.MarchingCubes = function(a, b) {
    THREE.Object3D.call(this);
    this.material = b;
    this.init = function(a) {
        this.resolution = a;
        this.isolation = 80;
        this.size = a;
        this.size2 = this.size * this.size;
        this.size3 = this.size2 * this.size;
        this.halfsize = this.size / 2;
        this.delta = 2 / this.size;
        this.yd = this.size;
        this.zd = this.size2;
        this.field = new Float32Array(this.size3);
        this.normal_cache = new Float32Array(3 * this.size3);
        this.vlist = new Float32Array(36);
        this.nlist = new Float32Array(36);
        this.firstDraw = !0;
        this.maxCount = 4096;
        this.count = 0;
        this.hasNormal =
            this.hasPos = !1;
        this.positionArray = new Float32Array(3 * this.maxCount);
        this.normalArray = new Float32Array(3 * this.maxCount)
    };
    this.lerp = function(a, b, f) {
        return a + (b - a) * f
    };
    this.VIntX = function(a, b, f, g, e, h, i, j, k, q) {
        e = (e - k) / (q - k);
        k = this.normal_cache;
        b[g] = h + e * this.delta;
        b[g + 1] = i;
        b[g + 2] = j;
        f[g] = this.lerp(k[a], k[a + 3], e);
        f[g + 1] = this.lerp(k[a + 1], k[a + 4], e);
        f[g + 2] = this.lerp(k[a + 2], k[a + 5], e)
    };
    this.VIntY = function(a, b, f, g, e, h, i, j, k, q) {
        e = (e - k) / (q - k);
        k = this.normal_cache;
        b[g] = h;
        b[g + 1] = i + e * this.delta;
        b[g + 2] = j;
        b = a + 3 * this.yd;
        f[g] = this.lerp(k[a], k[b], e);
        f[g + 1] = this.lerp(k[a + 1], k[b + 1], e);
        f[g + 2] = this.lerp(k[a + 2], k[b + 2], e)
    };
    this.VIntZ = function(a, b, f, g, e, h, i, j, k, q) {
        e = (e - k) / (q - k);
        k = this.normal_cache;
        b[g] = h;
        b[g + 1] = i;
        b[g + 2] = j + e * this.delta;
        b = a + 3 * this.zd;
        f[g] = this.lerp(k[a], k[b], e);
        f[g + 1] = this.lerp(k[a + 1], k[b + 1], e);
        f[g + 2] = this.lerp(k[a + 2], k[b + 2], e)
    };
    this.compNorm = function(a) {
        var b = 3 * a;
        0 === this.normal_cache[b] && (this.normal_cache[b] = this.field[a - 1] - this.field[a + 1], this.normal_cache[b + 1] = this.field[a - this.yd] - this.field[a + this.yd],
            this.normal_cache[b + 2] = this.field[a - this.zd] - this.field[a + this.zd])
    };
    this.polygonize = function(a, b, f, g, e, h) {
        var i = g + 1,
            j = g + this.yd,
            k = g + this.zd,
            q = i + this.yd,
            m = i + this.zd,
            o = g + this.yd + this.zd,
            p = i + this.yd + this.zd,
            n = 0,
            r = this.field[g],
            s = this.field[i],
            t = this.field[j],
            w = this.field[q],
            u = this.field[k],
            v = this.field[m],
            A = this.field[o],
            F = this.field[p];
        r < e && (n |= 1);
        s < e && (n |= 2);
        t < e && (n |= 8);
        w < e && (n |= 4);
        u < e && (n |= 16);
        v < e && (n |= 32);
        A < e && (n |= 128);
        F < e && (n |= 64);
        var B = THREE.edgeTable[n];
        if (0 === B) return 0;
        var D = this.delta,
            H = a +
                D,
            I = b + D,
            D = f + D;
        B & 1 && (this.compNorm(g), this.compNorm(i), this.VIntX(3 * g, this.vlist, this.nlist, 0, e, a, b, f, r, s));
        B & 2 && (this.compNorm(i), this.compNorm(q), this.VIntY(3 * i, this.vlist, this.nlist, 3, e, H, b, f, s, w));
        B & 4 && (this.compNorm(j), this.compNorm(q), this.VIntX(3 * j, this.vlist, this.nlist, 6, e, a, I, f, t, w));
        B & 8 && (this.compNorm(g), this.compNorm(j), this.VIntY(3 * g, this.vlist, this.nlist, 9, e, a, b, f, r, t));
        B & 16 && (this.compNorm(k), this.compNorm(m), this.VIntX(3 * k, this.vlist, this.nlist, 12, e, a, b, D, u, v));
        B & 32 && (this.compNorm(m),
            this.compNorm(p), this.VIntY(3 * m, this.vlist, this.nlist, 15, e, H, b, D, v, F));
        B & 64 && (this.compNorm(o), this.compNorm(p), this.VIntX(3 * o, this.vlist, this.nlist, 18, e, a, I, D, A, F));
        B & 128 && (this.compNorm(k), this.compNorm(o), this.VIntY(3 * k, this.vlist, this.nlist, 21, e, a, b, D, u, A));
        B & 256 && (this.compNorm(g), this.compNorm(k), this.VIntZ(3 * g, this.vlist, this.nlist, 24, e, a, b, f, r, u));
        B & 512 && (this.compNorm(i), this.compNorm(m), this.VIntZ(3 * i, this.vlist, this.nlist, 27, e, H, b, f, s, v));
        B & 1024 && (this.compNorm(q), this.compNorm(p), this.VIntZ(3 *
            q, this.vlist, this.nlist, 30, e, H, I, f, w, F));
        B & 2048 && (this.compNorm(j), this.compNorm(o), this.VIntZ(3 * j, this.vlist, this.nlist, 33, e, a, I, f, t, A));
        n <<= 4;
        for (e = g = 0; - 1 != THREE.triTable[n + e];) a = n + e, b = a + 1, f = a + 2, this.posnormtriv(this.vlist, this.nlist, 3 * THREE.triTable[a], 3 * THREE.triTable[b], 3 * THREE.triTable[f], h), e += 3, g++;
        return g
    };
    this.posnormtriv = function(a, b, f, g, e, h) {
        var i = 3 * this.count;
        this.positionArray[i] = a[f];
        this.positionArray[i + 1] = a[f + 1];
        this.positionArray[i + 2] = a[f + 2];
        this.positionArray[i + 3] = a[g];
        this.positionArray[i +
            4] = a[g + 1];
        this.positionArray[i + 5] = a[g + 2];
        this.positionArray[i + 6] = a[e];
        this.positionArray[i + 7] = a[e + 1];
        this.positionArray[i + 8] = a[e + 2];
        this.normalArray[i] = b[f];
        this.normalArray[i + 1] = b[f + 1];
        this.normalArray[i + 2] = b[f + 2];
        this.normalArray[i + 3] = b[g];
        this.normalArray[i + 4] = b[g + 1];
        this.normalArray[i + 5] = b[g + 2];
        this.normalArray[i + 6] = b[e];
        this.normalArray[i + 7] = b[e + 1];
        this.normalArray[i + 8] = b[e + 2];
        this.hasNormal = this.hasPos = !0;
        this.count += 3;
        this.count >= this.maxCount - 3 && h(this)
    };
    this.begin = function() {
        this.count = 0;
        this.hasNormal = this.hasPos = !1
    };
    this.end = function(a) {
        if (0 !== this.count) {
            for (var b = 3 * this.count; b < this.positionArray.length; b++) this.positionArray[b] = 0;
            a(this)
        }
    };
    this.addBall = function(a, b, f, g, e) {
        var h = this.size * Math.sqrt(g / e),
            i = f * this.size,
            j = b * this.size,
            k = a * this.size,
            q = Math.floor(i - h);
        1 > q && (q = 1);
        i = Math.floor(i + h);
        i > this.size - 1 && (i = this.size - 1);
        var m = Math.floor(j - h);
        1 > m && (m = 1);
        j = Math.floor(j + h);
        j > this.size - 1 && (j = this.size - 1);
        var o = Math.floor(k - h);
        1 > o && (o = 1);
        h = Math.floor(k + h);
        h > this.size - 1 && (h = this.size -
            1);
        for (var p, n, r, s, t, w, u, k = q; k < i; k++) {
            r = this.size2 * k;
            t = k / this.size - f;
            w = t * t;
            for (q = m; q < j; q++) {
                n = r + this.size * q;
                p = q / this.size - b;
                u = p * p;
                for (p = o; p < h; p++) s = p / this.size - a, s = g / (1.0E-6 + s * s + u + w) - e, 0 < s && (this.field[n + p] += s)
            }
        }
    };
    this.addPlaneX = function(a, b) {
        var f, g, e, h, i, j = this.size,
            k = this.yd,
            q = this.zd,
            m = this.field,
            o = j * Math.sqrt(a / b);
        o > j && (o = j);
        for (f = 0; f < o; f++)
            if (g = f / j, g *= g, h = a / (1.0E-4 + g) - b, 0 < h)
                for (g = 0; g < j; g++) {
                    i = f + g * k;
                    for (e = 0; e < j; e++) m[q * e + i] += h
                }
    };
    this.addPlaneY = function(a, b) {
        var f, g, e, h, i, j, k = this.size,
            q = this.yd,
            m = this.zd,
            o = this.field,
            p = k * Math.sqrt(a / b);
        p > k && (p = k);
        for (g = 0; g < p; g++)
            if (f = g / k, f *= f, h = a / (1.0E-4 + f) - b, 0 < h) {
                i = g * q;
                for (f = 0; f < k; f++) {
                    j = i + f;
                    for (e = 0; e < k; e++) o[m * e + j] += h
                }
            }
    };
    this.addPlaneZ = function(a, b) {
        var f, g, e, h, i, j, k = this.size,
            q = this.yd,
            m = this.zd,
            o = this.field,
            p = k * Math.sqrt(a / b);
        p > k && (p = k);
        for (e = 0; e < p; e++)
            if (f = e / k, f *= f, h = a / (1.0E-4 + f) - b, 0 < h) {
                i = m * e;
                for (g = 0; g < k; g++) {
                    j = i + g * q;
                    for (f = 0; f < k; f++) o[j + f] += h
                }
            }
    };
    this.reset = function() {
        var a;
        for (a = 0; a < this.size3; a++) this.normal_cache[3 * a] = 0, this.field[a] = 0
    };
    this.render =
        function(a) {
            this.begin();
            var b, f, g, e, h, i, j, k, q, m = this.size - 2;
            for (e = 1; e < m; e++) {
                q = this.size2 * e;
                j = (e - this.halfsize) / this.halfsize;
                for (g = 1; g < m; g++) {
                    k = q + this.size * g;
                    i = (g - this.halfsize) / this.halfsize;
                    for (f = 1; f < m; f++) h = (f - this.halfsize) / this.halfsize, b = k + f, this.polygonize(h, i, j, b, this.isolation, a)
                }
            }
            this.end(a)
    };
    this.generateGeometry = function() {
        var a = 0,
            b = new THREE.Geometry,
            f = [];
        this.render(function(g) {
            var e, h, i, j, k, q, m, o;
            for (e = 0; e < g.count; e++) m = 3 * e, k = m + 1, o = m + 2, h = g.positionArray[m], i = g.positionArray[k], j =
                g.positionArray[o], q = new THREE.Vector3(h, i, j), h = g.normalArray[m], i = g.normalArray[k], j = g.normalArray[o], m = new THREE.Vector3(h, i, j), m.normalize(), k = new THREE.Vertex(q), b.vertices.push(k), f.push(m);
            q = g.count / 3;
            for (e = 0; e < q; e++) m = 3 * (a + e), k = m + 1, o = m + 2, h = f[m], i = f[k], j = f[o], m = new THREE.Face3(m, k, o, [h, i, j]), b.faces.push(m);
            a += q;
            g.count = 0
        });
        return b
    };
    this.init(a)
};
THREE.MarchingCubes.prototype = new THREE.Object3D;
THREE.MarchingCubes.prototype.constructor = THREE.MarchingCubes;
THREE.edgeTable = new Int32Array([0, 265, 515, 778, 1030, 1295, 1541, 1804, 2060, 2309, 2575, 2822, 3082, 3331, 3593, 3840, 400, 153, 915, 666, 1430, 1183, 1941, 1692, 2460, 2197, 2975, 2710, 3482, 3219, 3993, 3728, 560, 825, 51, 314, 1590, 1855, 1077, 1340, 2620, 2869, 2111, 2358, 3642, 3891, 3129, 3376, 928, 681, 419, 170, 1958, 1711, 1445, 1196, 2988, 2725, 2479, 2214, 4010, 3747, 3497, 3232, 1120, 1385, 1635, 1898, 102, 367, 613, 876, 3180, 3429, 3695, 3942, 2154, 2403, 2665, 2912, 1520, 1273, 2035, 1786, 502, 255, 1013, 764, 3580, 3317, 4095, 3830, 2554, 2291, 3065, 2800, 1616, 1881, 1107,
    1370, 598, 863, 85, 348, 3676, 3925, 3167, 3414, 2650, 2899, 2137, 2384, 1984, 1737, 1475, 1226, 966, 719, 453, 204, 4044, 3781, 3535, 3270, 3018, 2755, 2505, 2240, 2240, 2505, 2755, 3018, 3270, 3535, 3781, 4044, 204, 453, 719, 966, 1226, 1475, 1737, 1984, 2384, 2137, 2899, 2650, 3414, 3167, 3925, 3676, 348, 85, 863, 598, 1370, 1107, 1881, 1616, 2800, 3065, 2291, 2554, 3830, 4095, 3317, 3580, 764, 1013, 255, 502, 1786, 2035, 1273, 1520, 2912, 2665, 2403, 2154, 3942, 3695, 3429, 3180, 876, 613, 367, 102, 1898, 1635, 1385, 1120, 3232, 3497, 3747, 4010, 2214, 2479, 2725, 2988, 1196, 1445, 1711, 1958, 170,
    419, 681, 928, 3376, 3129, 3891, 3642, 2358, 2111, 2869, 2620, 1340, 1077, 1855, 1590, 314, 51, 825, 560, 3728, 3993, 3219, 3482, 2710, 2975, 2197, 2460, 1692, 1941, 1183, 1430, 666, 915, 153, 400, 3840, 3593, 3331, 3082, 2822, 2575, 2309, 2060, 1804, 1541, 1295, 1030, 778, 515, 265, 0
]);
THREE.triTable = new Int32Array([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1, 3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1, 3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1, 9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, 9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, 2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1, 8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1, 9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, 4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1, 3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1, 1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1, 4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1, 4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1, 5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1, 2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1, 9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1, 0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, 2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1, 10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, 4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1, 5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1, 5, 4, 8, 5,
    8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, 9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1, 0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1, 1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1, 10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1, 8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1, 2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, 7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, 9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1, 2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1, 11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1, 9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1, 5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1, 11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1, 11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, 1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1, 9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1, 5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1, 2, 3, 11, 10, 6,
    5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1, 6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1, 0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1, 3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1, 6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, 10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1, 6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, 1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1, 8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1, 7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1, 3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, 5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1, 0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, 9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1, 8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1, 5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1, 0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1, 6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1, 10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
    10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1, 8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1, 1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1, 0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, 10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1, 0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1, 3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1, 6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1, 9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1, 8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1, 3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
    6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1, 0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1, 10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1, 10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1, 1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1, 2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1, 7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1, 7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1, 2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1, 1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1, 11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
    8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1, 0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1, 7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, 10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, 2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, 6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1, 7,
    2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1, 2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1, 1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1, 10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1, 10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1, 0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1, 7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1, 6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1, 8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1, 9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1, 6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1, 4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1, 10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1, 8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, 0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1, 1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1, 8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1, 10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1, 4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1, 10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, 5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, 11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1, 9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, 6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1, 7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1, 3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1, 7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1, 9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1, 3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1, 6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1, 9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1, 1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1, 4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1, 7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1, 6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1, 3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1, 0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1, 6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1, 0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1, 11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1, 6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1, 5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1, 9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1, 1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1, 1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1, 10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1, 0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1, 5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1, 10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1, 11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1, 9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1, 7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1, 2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, 8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1, 9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1, 9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1, 1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1, 9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1, 9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, 5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1, 0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1, 10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1, 2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1, 0, 4, 11, 0, 11, 3, 4, 5, 11,
    2, 11, 1, 5, 1, 11, -1, 0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1, 9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1, 5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1, 3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1, 5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1, 8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1, 0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1, 9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1, 0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1, 1, 10, 11, 1, 11,
    4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1, 3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1, 4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1, 9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1, 11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1, 11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1, 2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1, 9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1, 3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1, 1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1, 4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1, 4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1, 0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1, 3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1, 3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1, 0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1, 9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1, 1, 10,
    2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1
]);
THREE.LensFlare = function(a, b, c, d, f) {
    THREE.Object3D.call(this);
    this.lensFlares = [];
    this.positionScreen = new THREE.Vector3;
    this.customUpdateCallback = void 0;
    void 0 !== a && this.add(a, b, c, d, f)
};
THREE.LensFlare.prototype = new THREE.Object3D;
THREE.LensFlare.prototype.constructor = THREE.LensFlare;
THREE.LensFlare.prototype.supr = THREE.Object3D.prototype;
THREE.LensFlare.prototype.add = function(a, b, c, d, f, g) {
    void 0 === b && (b = -1);
    void 0 === c && (c = 0);
    void 0 === g && (g = 1);
    void 0 === f && (f = new THREE.Color(16777215));
    if (void 0 === d) d = THREE.NormalBlending;
    c = Math.min(c, Math.max(0, c));
    this.lensFlares.push({
        texture: a,
        size: b,
        distance: c,
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        rotation: 1,
        opacity: g,
        color: f,
        blending: d
    })
};
THREE.LensFlare.prototype.updateLensFlares = function() {
    var a, b = this.lensFlares.length,
        c, d = 2 * -this.positionScreen.x,
        f = 2 * -this.positionScreen.y;
    for (a = 0; a < b; a++) c = this.lensFlares[a], c.x = this.positionScreen.x + d * c.distance, c.y = this.positionScreen.y + f * c.distance, c.wantedRotation = 0.25 * c.x * Math.PI, c.rotation += 0.25 * (c.wantedRotation - c.rotation)
};
THREE.LensFlarePlugin = function() {
    function a(a) {
        var c = b.createProgram(),
            d = b.createShader(b.FRAGMENT_SHADER),
            e = b.createShader(b.VERTEX_SHADER);
        b.shaderSource(d, a.fragmentShader);
        b.shaderSource(e, a.vertexShader);
        b.compileShader(d);
        b.compileShader(e);
        b.attachShader(c, d);
        b.attachShader(c, e);
        b.linkProgram(c);
        return c
    }
    var b, c, d, f, g, e, h, i, j, k, q, m, o;
    this.init = function(p) {
        b = p.context;
        c = p;
        d = new Float32Array(16);
        f = new Uint16Array(6);
        p = 0;
        d[p++] = -1;
        d[p++] = -1;
        d[p++] = 0;
        d[p++] = 0;
        d[p++] = 1;
        d[p++] = -1;
        d[p++] = 1;
        d[p++] =
            0;
        d[p++] = 1;
        d[p++] = 1;
        d[p++] = 1;
        d[p++] = 1;
        d[p++] = -1;
        d[p++] = 1;
        d[p++] = 0;
        d[p++] = 1;
        p = 0;
        f[p++] = 0;
        f[p++] = 1;
        f[p++] = 2;
        f[p++] = 0;
        f[p++] = 2;
        f[p++] = 3;
        g = b.createBuffer();
        e = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, g);
        b.bufferData(b.ARRAY_BUFFER, d, b.STATIC_DRAW);
        b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, e);
        b.bufferData(b.ELEMENT_ARRAY_BUFFER, f, b.STATIC_DRAW);
        h = b.createTexture();
        i = b.createTexture();
        b.bindTexture(b.TEXTURE_2D, h);
        b.texImage2D(b.TEXTURE_2D, 0, b.RGB, 16, 16, 0, b.RGB, b.UNSIGNED_BYTE, null);
        b.texParameteri(b.TEXTURE_2D,
            b.TEXTURE_WRAP_S, b.CLAMP_TO_EDGE);
        b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_T, b.CLAMP_TO_EDGE);
        b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.NEAREST);
        b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.NEAREST);
        b.bindTexture(b.TEXTURE_2D, i);
        b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, 16, 16, 0, b.RGBA, b.UNSIGNED_BYTE, null);
        b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_S, b.CLAMP_TO_EDGE);
        b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_T, b.CLAMP_TO_EDGE);
        b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.NEAREST);
        b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.NEAREST);
        0 >= b.getParameter(b.MAX_VERTEX_TEXTURE_IMAGE_UNITS) ? (j = !1, k = a(THREE.ShaderFlares.lensFlare)) : (j = !0, k = a(THREE.ShaderFlares.lensFlareVertexTexture));
        q = {};
        m = {};
        q.vertex = b.getAttribLocation(k, "position");
        q.uv = b.getAttribLocation(k, "uv");
        m.renderType = b.getUniformLocation(k, "renderType");
        m.map = b.getUniformLocation(k, "map");
        m.occlusionMap = b.getUniformLocation(k, "occlusionMap");
        m.opacity = b.getUniformLocation(k, "opacity");
        m.color = b.getUniformLocation(k,
            "color");
        m.scale = b.getUniformLocation(k, "scale");
        m.rotation = b.getUniformLocation(k, "rotation");
        m.screenPosition = b.getUniformLocation(k, "screenPosition");
        o = !1
    };
    this.render = function(a, d, f, s) {
        var a = a.__webglFlares,
            t = a.length;
        if (t) {
            var w = new THREE.Vector3,
                u = s / f,
                v = 0.5 * f,
                A = 0.5 * s,
                F = 16 / s,
                B = new THREE.Vector2(F * u, F),
                D = new THREE.Vector3(1, 1, 0),
                H = new THREE.Vector2(1, 1),
                I = m,
                F = q;
            b.useProgram(k);
            o || (b.enableVertexAttribArray(q.vertex), b.enableVertexAttribArray(q.uv), o = !0);
            b.uniform1i(I.occlusionMap, 0);
            b.uniform1i(I.map,
                1);
            b.bindBuffer(b.ARRAY_BUFFER, g);
            b.vertexAttribPointer(F.vertex, 2, b.FLOAT, !1, 16, 0);
            b.vertexAttribPointer(F.uv, 2, b.FLOAT, !1, 16, 8);
            b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, e);
            b.disable(b.CULL_FACE);
            b.depthMask(!1);
            var Q, P, L, K, O;
            for (Q = 0; Q < t; Q++)
                if (F = 16 / s, B.set(F * u, F), K = a[Q], w.set(K.matrixWorld.n14, K.matrixWorld.n24, K.matrixWorld.n34), d.matrixWorldInverse.multiplyVector3(w), d.projectionMatrix.multiplyVector3(w), D.copy(w), H.x = D.x * v + v, H.y = D.y * A + A, j || 0 < H.x && H.x < f && 0 < H.y && H.y < s) {
                    b.activeTexture(b.TEXTURE1);
                    b.bindTexture(b.TEXTURE_2D,
                        h);
                    b.copyTexImage2D(b.TEXTURE_2D, 0, b.RGB, H.x - 8, H.y - 8, 16, 16, 0);
                    b.uniform1i(I.renderType, 0);
                    b.uniform2f(I.scale, B.x, B.y);
                    b.uniform3f(I.screenPosition, D.x, D.y, D.z);
                    b.disable(b.BLEND);
                    b.enable(b.DEPTH_TEST);
                    b.drawElements(b.TRIANGLES, 6, b.UNSIGNED_SHORT, 0);
                    b.activeTexture(b.TEXTURE0);
                    b.bindTexture(b.TEXTURE_2D, i);
                    b.copyTexImage2D(b.TEXTURE_2D, 0, b.RGBA, H.x - 8, H.y - 8, 16, 16, 0);
                    b.uniform1i(I.renderType, 1);
                    b.disable(b.DEPTH_TEST);
                    b.activeTexture(b.TEXTURE1);
                    b.bindTexture(b.TEXTURE_2D, h);
                    b.drawElements(b.TRIANGLES,
                        6, b.UNSIGNED_SHORT, 0);
                    K.positionScreen.copy(D);
                    K.customUpdateCallback ? K.customUpdateCallback(K) : K.updateLensFlares();
                    b.uniform1i(I.renderType, 2);
                    b.enable(b.BLEND);
                    for (P = 0, L = K.lensFlares.length; P < L; P++)
                        if (O = K.lensFlares[P], 0.001 < O.opacity && 0.001 < O.scale) D.x = O.x, D.y = O.y, D.z = O.z, F = O.size * O.scale / s, B.x = F * u, B.y = F, b.uniform3f(I.screenPosition, D.x, D.y, D.z), b.uniform2f(I.scale, B.x, B.y), b.uniform1f(I.rotation, O.rotation), b.uniform1f(I.opacity, O.opacity), b.uniform3f(I.color, O.color.r, O.color.g, O.color.b), c.setBlending(O.blending),
                    c.setTexture(O.texture, 1), b.drawElements(b.TRIANGLES, 6, b.UNSIGNED_SHORT, 0)
                }
            b.enable(b.CULL_FACE);
            b.enable(b.DEPTH_TEST);
            b.depthMask(!0)
        }
    }
};
THREE.ShadowMapPlugin = function() {
    var a, b, c, d, f = new THREE.Frustum,
        g = new THREE.Matrix4,
        e = new THREE.Vector3,
        h = new THREE.Vector3;
    this.init = function(e) {
        a = e.context;
        b = e;
        var e = THREE.ShaderLib.depthRGBA,
            f = THREE.UniformsUtils.clone(e.uniforms);
        c = new THREE.ShaderMaterial({
            fragmentShader: e.fragmentShader,
            vertexShader: e.vertexShader,
            uniforms: f
        });
        d = new THREE.ShaderMaterial({
            fragmentShader: e.fragmentShader,
            vertexShader: e.vertexShader,
            uniforms: f,
            morphTargets: !0
        });
        c._shadowPass = !0;
        d._shadowPass = !0
    };
    this.render = function(a,
        c) {
        b.shadowMapEnabled && b.shadowMapAutoUpdate && this.update(a, c)
    };
    this.update = function(i, j) {
        var k, q, m, o, p, n, r, s, t, w = [];
        o = 0;
        a.clearColor(1, 1, 1, 1);
        a.disable(a.BLEND);
        b.shadowMapCullFrontFaces && a.cullFace(a.FRONT);
        b.setDepthTest(!0);
        for (k = 0, q = i.__lights.length; k < q; k++)
            if (m = i.__lights[k], m.castShadow)
                if (m instanceof THREE.DirectionalLight && m.shadowCascade)
                    for (p = 0; p < m.shadowCascadeCount; p++) {
                        var u;
                        if (m.shadowCascadeArray[p]) u = m.shadowCascadeArray[p];
                        else {
                            t = m;
                            r = p;
                            u = new THREE.DirectionalLight;
                            u.isVirtual = !0;
                            u.onlyShadow = !0;
                            u.castShadow = !0;
                            u.shadowCameraNear = t.shadowCameraNear;
                            u.shadowCameraFar = t.shadowCameraFar;
                            u.shadowCameraLeft = t.shadowCameraLeft;
                            u.shadowCameraRight = t.shadowCameraRight;
                            u.shadowCameraBottom = t.shadowCameraBottom;
                            u.shadowCameraTop = t.shadowCameraTop;
                            u.shadowCameraVisible = t.shadowCameraVisible;
                            u.shadowDarkness = t.shadowDarkness;
                            u.shadowBias = t.shadowCascadeBias[r];
                            u.shadowMapWidth = t.shadowCascadeWidth[r];
                            u.shadowMapHeight = t.shadowCascadeHeight[r];
                            u.pointsWorld = [];
                            u.pointsFrustum = [];
                            s =
                                u.pointsWorld;
                            n = u.pointsFrustum;
                            for (var v = 0; 8 > v; v++) s[v] = new THREE.Vector3, n[v] = new THREE.Vector3;
                            s = t.shadowCascadeNearZ[r];
                            t = t.shadowCascadeFarZ[r];
                            n[0].set(-1, -1, s);
                            n[1].set(1, -1, s);
                            n[2].set(-1, 1, s);
                            n[3].set(1, 1, s);
                            n[4].set(-1, -1, t);
                            n[5].set(1, -1, t);
                            n[6].set(-1, 1, t);
                            n[7].set(1, 1, t);
                            u.originalCamera = j;
                            n = new THREE.Gyroscope;
                            n.position = m.shadowCascadeOffset;
                            n.add(u);
                            n.add(u.target);
                            j.add(n);
                            m.shadowCascadeArray[p] = u;
                            console.log("Created virtualLight", u)
                        }
                        r = m;
                        s = p;
                        t = r.shadowCascadeArray[s];
                        t.position.copy(r.position);
                        t.target.position.copy(r.target.position);
                        t.lookAt(t.target);
                        t.shadowCameraVisible = r.shadowCameraVisible;
                        t.shadowDarkness = r.shadowDarkness;
                        t.shadowBias = r.shadowCascadeBias[s];
                        n = r.shadowCascadeNearZ[s];
                        r = r.shadowCascadeFarZ[s];
                        t = t.pointsFrustum;
                        t[0].z = n;
                        t[1].z = n;
                        t[2].z = n;
                        t[3].z = n;
                        t[4].z = r;
                        t[5].z = r;
                        t[6].z = r;
                        t[7].z = r;
                        w[o] = u;
                        o++
                    } else w[o] = m, o++;
        for (k = 0, q = w.length; k < q; k++) {
            m = w[k];
            if (!m.shadowMap) m.shadowMap = new THREE.WebGLRenderTarget(m.shadowMapWidth, m.shadowMapHeight, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            }), m.shadowMapSize = new THREE.Vector2(m.shadowMapWidth, m.shadowMapHeight), m.shadowMatrix = new THREE.Matrix4;
            if (!m.shadowCamera) {
                if (m instanceof THREE.SpotLight) m.shadowCamera = new THREE.PerspectiveCamera(m.shadowCameraFov, m.shadowMapWidth / m.shadowMapHeight, m.shadowCameraNear, m.shadowCameraFar);
                else if (m instanceof THREE.DirectionalLight) m.shadowCamera = new THREE.OrthographicCamera(m.shadowCameraLeft, m.shadowCameraRight, m.shadowCameraTop, m.shadowCameraBottom, m.shadowCameraNear, m.shadowCameraFar);
                else {
                    console.error("Unsupported light type for shadow");
                    continue
                }
                i.add(m.shadowCamera);
                b.autoUpdateScene && i.updateMatrixWorld()
            }
            if (m.shadowCameraVisible && !m.cameraHelper) m.cameraHelper = new THREE.CameraHelper(m.shadowCamera), m.shadowCamera.add(m.cameraHelper);
            if (m.isVirtual && u.originalCamera == j) {
                p = j;
                o = m.shadowCamera;
                n = m.pointsFrustum;
                t = m.pointsWorld;
                e.set(Infinity, Infinity, Infinity);
                h.set(-Infinity, -Infinity, -Infinity);
                for (r = 0; 8 > r; r++) {
                    s = t[r];
                    s.copy(n[r]);
                    THREE.ShadowMapPlugin.__projector.unprojectVector(s,
                        p);
                    o.matrixWorldInverse.multiplyVector3(s);
                    if (s.x < e.x) e.x = s.x;
                    if (s.x > h.x) h.x = s.x;
                    if (s.y < e.y) e.y = s.y;
                    if (s.y > h.y) h.y = s.y;
                    if (s.z < e.z) e.z = s.z;
                    if (s.z > h.z) h.z = s.z
                }
                o.left = e.x;
                o.right = h.x;
                o.top = h.y;
                o.bottom = e.y;
                o.updateProjectionMatrix()
            }
            o = m.shadowMap;
            n = m.shadowMatrix;
            p = m.shadowCamera;
            p.position.copy(m.matrixWorld.getPosition());
            p.lookAt(m.target.matrixWorld.getPosition());
            p.updateMatrixWorld();
            p.matrixWorldInverse.getInverse(p.matrixWorld);
            if (m.cameraHelper) m.cameraHelper.lines.visible = m.shadowCameraVisible;
            m.shadowCameraVisible && m.cameraHelper.update(m.shadowCamera);
            n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
            n.multiplySelf(p.projectionMatrix);
            n.multiplySelf(p.matrixWorldInverse);
            if (!p._viewMatrixArray) p._viewMatrixArray = new Float32Array(16);
            p.matrixWorldInverse.flattenToArray(p._viewMatrixArray);
            if (!p._projectionMatrixArray) p._projectionMatrixArray = new Float32Array(16);
            p.projectionMatrix.flattenToArray(p._projectionMatrixArray);
            g.multiply(p.projectionMatrix, p.matrixWorldInverse);
            f.setFromMatrix(g);
            b.setRenderTarget(o);
            b.clear();
            t = i.__webglObjects;
            for (m = 0, o = t.length; m < o; m++)
                if (r = t[m], n = r.object, r.render = !1, n.visible && n.castShadow && (!(n instanceof THREE.Mesh) || !n.frustumCulled || f.contains(n))) n.matrixWorld.flattenToArray(n._objectMatrixArray), n._modelViewMatrix.multiplyToArray(p.matrixWorldInverse, n.matrixWorld, n._modelViewMatrixArray), r.render = !0;
            for (m = 0, o = t.length; m < o; m++)
                if (r = t[m], r.render) n = r.object, r = r.buffer, b.setObjectFaces(n), s = n.customDepthMaterial ? n.customDepthMaterial : n.geometry.morphTargets.length ?
                    d : c, r instanceof THREE.BufferGeometry ? b.renderBufferDirect(p, i.__lights, null, s, r, n) : b.renderBuffer(p, i.__lights, null, s, r, n);
            t = i.__webglObjectsImmediate;
            for (m = 0, o = t.length; m < o; m++) r = t[m], n = r.object, n.visible && n.castShadow && (n.matrixAutoUpdate && n.matrixWorld.flattenToArray(n._objectMatrixArray), n._modelViewMatrix.multiplyToArray(p.matrixWorldInverse, n.matrixWorld, n._modelViewMatrixArray), b.renderImmediateObject(p, i.__lights, null, c, n))
        }
        k = b.getClearColor();
        q = b.getClearAlpha();
        a.clearColor(k.r, k.g, k.b,
            q);
        a.enable(a.BLEND);
        b.shadowMapCullFrontFaces && a.cullFace(a.BACK)
    }
};
THREE.ShadowMapPlugin.__projector = new THREE.Projector;
THREE.SpritePlugin = function() {
    function a(a, b) {
        return b.z - a.z
    }
    var b, c, d, f, g, e, h, i, j, k;
    this.init = function(a) {
        b = a.context;
        c = a;
        d = new Float32Array(16);
        f = new Uint16Array(6);
        a = 0;
        d[a++] = -1;
        d[a++] = -1;
        d[a++] = 0;
        d[a++] = 1;
        d[a++] = 1;
        d[a++] = -1;
        d[a++] = 1;
        d[a++] = 1;
        d[a++] = 1;
        d[a++] = 1;
        d[a++] = 1;
        d[a++] = 0;
        d[a++] = -1;
        d[a++] = 1;
        d[a++] = 0;
        a = d[a++] = 0;
        f[a++] = 0;
        f[a++] = 1;
        f[a++] = 2;
        f[a++] = 0;
        f[a++] = 2;
        f[a++] = 3;
        g = b.createBuffer();
        e = b.createBuffer();
        b.bindBuffer(b.ARRAY_BUFFER, g);
        b.bufferData(b.ARRAY_BUFFER, d, b.STATIC_DRAW);
        b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,
            e);
        b.bufferData(b.ELEMENT_ARRAY_BUFFER, f, b.STATIC_DRAW);
        var a = THREE.ShaderSprite.sprite,
            m = b.createProgram(),
            o = b.createShader(b.FRAGMENT_SHADER),
            p = b.createShader(b.VERTEX_SHADER);
        b.shaderSource(o, a.fragmentShader);
        b.shaderSource(p, a.vertexShader);
        b.compileShader(o);
        b.compileShader(p);
        b.attachShader(m, o);
        b.attachShader(m, p);
        b.linkProgram(m);
        h = m;
        i = {};
        j = {};
        i.position = b.getAttribLocation(h, "position");
        i.uv = b.getAttribLocation(h, "uv");
        j.uvOffset = b.getUniformLocation(h, "uvOffset");
        j.uvScale = b.getUniformLocation(h,
            "uvScale");
        j.rotation = b.getUniformLocation(h, "rotation");
        j.scale = b.getUniformLocation(h, "scale");
        j.alignment = b.getUniformLocation(h, "alignment");
        j.color = b.getUniformLocation(h, "color");
        j.map = b.getUniformLocation(h, "map");
        j.opacity = b.getUniformLocation(h, "opacity");
        j.useScreenCoordinates = b.getUniformLocation(h, "useScreenCoordinates");
        j.affectedByDistance = b.getUniformLocation(h, "affectedByDistance");
        j.screenPosition = b.getUniformLocation(h, "screenPosition");
        j.modelViewMatrix = b.getUniformLocation(h, "modelViewMatrix");
        j.projectionMatrix = b.getUniformLocation(h, "projectionMatrix");
        k = !1
    };
    this.render = function(d, f, o, p) {
        var d = d.__webglSprites,
            n = d.length;
        if (n) {
            var r = i,
                s = j,
                t = p / o,
                o = 0.5 * o,
                w = 0.5 * p,
                u = !0;
            b.useProgram(h);
            k || (b.enableVertexAttribArray(r.position), b.enableVertexAttribArray(r.uv), k = !0);
            b.disable(b.CULL_FACE);
            b.enable(b.BLEND);
            b.depthMask(!0);
            b.bindBuffer(b.ARRAY_BUFFER, g);
            b.vertexAttribPointer(r.position, 2, b.FLOAT, !1, 16, 0);
            b.vertexAttribPointer(r.uv, 2, b.FLOAT, !1, 16, 8);
            b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, e);
            b.uniformMatrix4fv(s.projectionMatrix, !1, f._projectionMatrixArray);
            b.activeTexture(b.TEXTURE0);
            b.uniform1i(s.map, 0);
            for (var v, A = [], r = 0; r < n; r++)
                if (v = d[r], v.visible && 0 !== v.opacity) v.useScreenCoordinates ? v.z = -v.position.z : (v._modelViewMatrix.multiplyToArray(f.matrixWorldInverse, v.matrixWorld, v._modelViewMatrixArray), v.z = -v._modelViewMatrix.n34);
            d.sort(a);
            for (r = 0; r < n; r++) v = d[r], v.visible && 0 !== v.opacity && v.map && v.map.image && v.map.image.width && (v.useScreenCoordinates ? (b.uniform1i(s.useScreenCoordinates, 1), b.uniform3f(s.screenPosition, (v.position.x -
                o) / o, (w - v.position.y) / w, Math.max(0, Math.min(1, v.position.z)))) : (b.uniform1i(s.useScreenCoordinates, 0), b.uniform1i(s.affectedByDistance, v.affectedByDistance ? 1 : 0), b.uniformMatrix4fv(s.modelViewMatrix, !1, v._modelViewMatrixArray)), f = v.map.image.width / (v.scaleByViewport ? p : 1), A[0] = f * t * v.scale.x, A[1] = f * v.scale.y, b.uniform2f(s.uvScale, v.uvScale.x, v.uvScale.y), b.uniform2f(s.uvOffset, v.uvOffset.x, v.uvOffset.y), b.uniform2f(s.alignment, v.alignment.x, v.alignment.y), b.uniform1f(s.opacity, v.opacity), b.uniform3f(s.color,
                v.color.r, v.color.g, v.color.b), b.uniform1f(s.rotation, v.rotation), b.uniform2fv(s.scale, A), v.mergeWith3D && !u ? (b.enable(b.DEPTH_TEST), u = !0) : !v.mergeWith3D && u && (b.disable(b.DEPTH_TEST), u = !1), c.setBlending(v.blending), c.setTexture(v.map, 0), b.drawElements(b.TRIANGLES, 6, b.UNSIGNED_SHORT, 0));
            b.enable(b.CULL_FACE);
            b.enable(b.DEPTH_TEST);
            b.depthMask(!0)
        }
    }
};
if (THREE.WebGLRenderer) THREE.AnaglyphWebGLRenderer = function(a) {
    THREE.WebGLRenderer.call(this, a);
    this.autoUpdateScene = !1;
    var b = this,
        c = this.setSize,
        d = this.render,
        f = new THREE.PerspectiveCamera,
        g = new THREE.PerspectiveCamera,
        e = new THREE.Matrix4,
        h = new THREE.Matrix4,
        i, j, k, q;
    f.matrixAutoUpdate = g.matrixAutoUpdate = !1;
    var a = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat
    }, m = new THREE.WebGLRenderTarget(512, 512, a),
        o = new THREE.WebGLRenderTarget(512, 512, a),
        p = new THREE.PerspectiveCamera(53,
            1, 1, 1E4);
    p.position.z = 2;
    var a = new THREE.ShaderMaterial({
        uniforms: {
            mapLeft: {
                type: "t",
                value: 0,
                texture: m
            },
            mapRight: {
                type: "t",
                value: 1,
                texture: o
            }
        },
        vertexShader: "varying vec2 vUv;\nvoid main() {\nvUv = vec2( uv.x, 1.0 - uv.y );\ngl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",
        fragmentShader: "uniform sampler2D mapLeft;\nuniform sampler2D mapRight;\nvarying vec2 vUv;\nvoid main() {\nvec4 colorL, colorR;\nvec2 uv = vUv;\ncolorL = texture2D( mapLeft, uv );\ncolorR = texture2D( mapRight, uv );\ngl_FragColor = vec4( colorL.g * 0.7 + colorL.b * 0.3, colorR.g, colorR.b, colorL.a + colorR.a ) * 1.1;\n}"
    }),
        n = new THREE.Scene;
    n.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), a));
    n.add(p);
    this.setSize = function(a, d) {
        c.call(b, a, d);
        m.width = a;
        m.height = d;
        o.width = a;
        o.height = d
    };
    this.render = function(a, c) {
        a.updateMatrixWorld();
        if (i !== c.aspect || j !== c.near || k !== c.far || q !== c.fov) {
            i = c.aspect;
            j = c.near;
            k = c.far;
            q = c.fov;
            var t = c.projectionMatrix.clone(),
                w = 0.5 * (125 / 30),
                u = w * j / 125,
                v = j * Math.tan(q * Math.PI / 360),
                A;
            e.n14 = w;
            h.n14 = -w;
            w = -v * i + u;
            A = v * i + u;
            t.n11 = 2 * j / (A - w);
            t.n13 = (A + w) / (A - w);
            f.projectionMatrix.copy(t);
            w = -v * i - u;
            A = v * i - u;
            t.n11 =
                2 * j / (A - w);
            t.n13 = (A + w) / (A - w);
            g.projectionMatrix.copy(t)
        }
        f.matrixWorld.copy(c.matrixWorld).multiplySelf(h);
        f.position.copy(c.position);
        f.near = c.near;
        f.far = c.far;
        d.call(b, a, f, m, !0);
        g.matrixWorld.copy(c.matrixWorld).multiplySelf(e);
        g.position.copy(c.position);
        g.near = c.near;
        g.far = c.far;
        d.call(b, a, g, o, !0);
        n.updateMatrixWorld();
        d.call(b, n, p)
    }
};
if (THREE.WebGLRenderer) THREE.CrosseyedWebGLRenderer = function(a) {
    THREE.WebGLRenderer.call(this, a);
    this.autoClear = !1;
    var b = this,
        c = this.setSize,
        d = this.render,
        f, g, e = new THREE.PerspectiveCamera;
    e.target = new THREE.Vector3(0, 0, 0);
    var h = new THREE.PerspectiveCamera;
    h.target = new THREE.Vector3(0, 0, 0);
    b.separation = 10;
    if (a && void 0 !== a.separation) b.separation = a.separation;
    this.setSize = function(a, d) {
        c.call(b, a, d);
        f = a / 2;
        g = d
    };
    this.render = function(a, c) {
        this.clear();
        e.fov = c.fov;
        e.aspect = 0.5 * c.aspect;
        e.near = c.near;
        e.far =
            c.far;
        e.updateProjectionMatrix();
        e.position.copy(c.position);
        e.target.copy(c.target);
        e.translateX(b.separation);
        e.lookAt(e.target);
        h.projectionMatrix = e.projectionMatrix;
        h.position.copy(c.position);
        h.target.copy(c.target);
        h.translateX(-b.separation);
        h.lookAt(h.target);
        this.setViewport(0, 0, f, g);
        d.call(b, a, e);
        this.setViewport(f, 0, f, g);
        d.call(b, a, h, !1)
    }
};
THREE.ShaderFlares = {
    lensFlareVertexTexture: {
        vertexShader: "uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nuniform sampler2D occlusionMap;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\nvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.1 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.9, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.9 ) ) +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ) +\ntexture2D( occlusionMap, vec2( 0.5, 0.5 ) );\nvVisibility = (       visibility.r / 9.0 ) *\n( 1.0 - visibility.g / 9.0 ) *\n(       visibility.b / 9.0 ) *\n( 1.0 - visibility.a / 9.0 );\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",
        fragmentShader: "precision mediump float;\nuniform sampler2D map;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * vVisibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"
    },
    lensFlare: {
        vertexShader: "uniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform int renderType;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",
        fragmentShader: "precision mediump float;\nuniform sampler2D map;\nuniform sampler2D occlusionMap;\nuniform float opacity;\nuniform int renderType;\nuniform vec3 color;\nvarying vec2 vUV;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nfloat visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a +\ntexture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a +\ntexture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a +\ntexture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;\nvisibility = ( 1.0 - visibility / 4.0 );\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * visibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"
    }
};
THREE.ShaderSprite = {
    sprite: {
        vertexShader: "uniform int useScreenCoordinates;\nuniform int affectedByDistance;\nuniform vec3 screenPosition;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float rotation;\nuniform vec2 scale;\nuniform vec2 alignment;\nuniform vec2 uvOffset;\nuniform vec2 uvScale;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uvOffset + uv * uvScale;\nvec2 alignedPosition = position + alignment;\nvec2 rotatedPosition;\nrotatedPosition.x = ( cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y ) * scale.x;\nrotatedPosition.y = ( sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y ) * scale.y;\nvec4 finalPosition;\nif( useScreenCoordinates != 0 ) {\nfinalPosition = vec4( screenPosition.xy + rotatedPosition, screenPosition.z, 1.0 );\n} else {\nfinalPosition = projectionMatrix * modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfinalPosition.xy += rotatedPosition * ( affectedByDistance == 1 ? 1.0 : finalPosition.z );\n}\ngl_Position = finalPosition;\n}",
        fragmentShader: "precision mediump float;\nuniform vec3 color;\nuniform sampler2D map;\nuniform float opacity;\nvarying vec2 vUV;\nvoid main() {\nvec4 texture = texture2D( map, vUV );\ngl_FragColor = vec4( color * texture.xyz, texture.a * opacity );\n}"
    }
};
