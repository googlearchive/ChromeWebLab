/*The MIT License

Copyright (c) 2010-2012 Tween.js authors.

Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/

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
THE SOFTWARE.*/

// tween.js r5 - http://github.com/sole/tween.js
var TWEEN = TWEEN || function() {
        var a, e, c = 60,
            b = false,
            h = [],
            i;
        return {
            setFPS: function(f) {
                c = f || 60
            },
            start: function(f) {
                arguments.length != 0 && this.setFPS(f);
                e = setInterval(this.update, 1E3 / c)
            },
            stop: function() {
                clearInterval(e)
            },
            setAutostart: function(f) {
                (b = f) && !e && this.start()
            },
            add: function(f) {
                h.push(f);
                b && !e && this.start()
            },
            getAll: function() {
                return h
            },
            removeAll: function() {
                h = []
            },
            remove: function(f) {
                a = h.indexOf(f);
                a !== -1 && h.splice(a, 1)
            },
            update: function(f) {
                a = 0;
                i = h.length;
                for (f = f || Date.now(); a < i;)
                    if (h[a].update(f)) a++;
                    else {
                        h.splice(a, 1);
                        i--
                    }
            }
        }
    }();
TWEEN.Tween = function(a) {
    var e = {}, c = {}, b = {}, h = 1E3,
        i = 0,
        f = null,
        n = TWEEN.Easing.Linear.EaseNone,
        k = null,
        l = null,
        m = null;
    this.to = function(d, g) {
        if (g !== null) h = g;
        for (var j in d)
            if (a[j] !== null) b[j] = d[j];
        return this
    };
    this.start = function(d) {
        TWEEN.add(this);
        f = d ? d + i : Date.now() + i;
        for (var g in b)
            if (a[g] !== null) {
                e[g] = a[g];
                c[g] = b[g] - a[g]
            }
        return this
    };
    this.stop = function() {
        TWEEN.remove(this);
        return this
    };
    this.delay = function(d) {
        i = d;
        return this
    };
    this.easing = function(d) {
        n = d;
        return this
    };
    this.chain = function(d) {
        k = d
    };
    this.onUpdate =
        function(d) {
            l = d;
            return this
    };
    this.onComplete = function(d) {
        m = d;
        return this
    };
    this.update = function(d) {
        var g, j;
        if (d < f) return true;
        d = (d - f) / h;
        d = d > 1 ? 1 : d;
        j = n(d);
        for (g in c) a[g] = e[g] + c[g] * j;
        l !== null && l.call(a, j);
        if (d == 1) {
            m !== null && m.call(a);
            k !== null && k.start();
            return false
        }
        return true
    }
};
TWEEN.Easing = {
    Linear: {},
    Quadratic: {},
    Cubic: {},
    Quartic: {},
    Quintic: {},
    Sinusoidal: {},
    Exponential: {},
    Circular: {},
    Elastic: {},
    Back: {},
    Bounce: {}
};
TWEEN.Easing.Linear.EaseNone = function(a) {
    return a
};
TWEEN.Easing.Quadratic.EaseIn = function(a) {
    return a * a
};
TWEEN.Easing.Quadratic.EaseOut = function(a) {
    return -a * (a - 2)
};
TWEEN.Easing.Quadratic.EaseInOut = function(a) {
    if ((a *= 2) < 1) return 0.5 * a * a;
    return -0.5 * (--a * (a - 2) - 1)
};
TWEEN.Easing.Cubic.EaseIn = function(a) {
    return a * a * a
};
TWEEN.Easing.Cubic.EaseOut = function(a) {
    return --a * a * a + 1
};
TWEEN.Easing.Cubic.EaseInOut = function(a) {
    if ((a *= 2) < 1) return 0.5 * a * a * a;
    return 0.5 * ((a -= 2) * a * a + 2)
};
TWEEN.Easing.Quartic.EaseIn = function(a) {
    return a * a * a * a
};
TWEEN.Easing.Quartic.EaseOut = function(a) {
    return -(--a * a * a * a - 1)
};
TWEEN.Easing.Quartic.EaseInOut = function(a) {
    if ((a *= 2) < 1) return 0.5 * a * a * a * a;
    return -0.5 * ((a -= 2) * a * a * a - 2)
};
TWEEN.Easing.Quintic.EaseIn = function(a) {
    return a * a * a * a * a
};
TWEEN.Easing.Quintic.EaseOut = function(a) {
    return (a -= 1) * a * a * a * a + 1
};
TWEEN.Easing.Quintic.EaseInOut = function(a) {
    if ((a *= 2) < 1) return 0.5 * a * a * a * a * a;
    return 0.5 * ((a -= 2) * a * a * a * a + 2)
};
TWEEN.Easing.Sinusoidal.EaseIn = function(a) {
    return -Math.cos(a * Math.PI / 2) + 1
};
TWEEN.Easing.Sinusoidal.EaseOut = function(a) {
    return Math.sin(a * Math.PI / 2)
};
TWEEN.Easing.Sinusoidal.EaseInOut = function(a) {
    return -0.5 * (Math.cos(Math.PI * a) - 1)
};
TWEEN.Easing.Exponential.EaseIn = function(a) {
    return a == 0 ? 0 : Math.pow(2, 10 * (a - 1))
};
TWEEN.Easing.Exponential.EaseOut = function(a) {
    return a == 1 ? 1 : -Math.pow(2, -10 * a) + 1
};
TWEEN.Easing.Exponential.EaseInOut = function(a) {
    if (a == 0) return 0;
    if (a == 1) return 1;
    if ((a *= 2) < 1) return 0.5 * Math.pow(2, 10 * (a - 1));
    return 0.5 * (-Math.pow(2, -10 * (a - 1)) + 2)
};
TWEEN.Easing.Circular.EaseIn = function(a) {
    return -(Math.sqrt(1 - a * a) - 1)
};
TWEEN.Easing.Circular.EaseOut = function(a) {
    return Math.sqrt(1 - --a * a)
};
TWEEN.Easing.Circular.EaseInOut = function(a) {
    if ((a /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - a * a) - 1);
    return 0.5 * (Math.sqrt(1 - (a -= 2) * a) + 1)
};
TWEEN.Easing.Elastic.EaseIn = function(a) {
    var e, c = 0.1,
        b = 0.4;
    if (a == 0) return 0;
    if (a == 1) return 1;
    b || (b = 0.3);
    if (!c || c < 1) {
        c = 1;
        e = b / 4
    } else e = b / (2 * Math.PI) * Math.asin(1 / c);
    return -(c * Math.pow(2, 10 * (a -= 1)) * Math.sin((a - e) * 2 * Math.PI / b))
};
TWEEN.Easing.Elastic.EaseOut = function(a) {
    var e, c = 0.1,
        b = 0.4;
    if (a == 0) return 0;
    if (a == 1) return 1;
    b || (b = 0.3);
    if (!c || c < 1) {
        c = 1;
        e = b / 4
    } else e = b / (2 * Math.PI) * Math.asin(1 / c);
    return c * Math.pow(2, -10 * a) * Math.sin((a - e) * 2 * Math.PI / b) + 1
};
TWEEN.Easing.Elastic.EaseInOut = function(a) {
    var e, c = 0.1,
        b = 0.4;
    if (a == 0) return 0;
    if (a == 1) return 1;
    b || (b = 0.3);
    if (!c || c < 1) {
        c = 1;
        e = b / 4
    } else e = b / (2 * Math.PI) * Math.asin(1 / c); if ((a *= 2) < 1) return -0.5 * c * Math.pow(2, 10 * (a -= 1)) * Math.sin((a - e) * 2 * Math.PI / b);
    return c * Math.pow(2, -10 * (a -= 1)) * Math.sin((a - e) * 2 * Math.PI / b) * 0.5 + 1
};
TWEEN.Easing.Back.EaseIn = function(a) {
    return a * a * (2.70158 * a - 1.70158)
};
TWEEN.Easing.Back.EaseOut = function(a) {
    return (a -= 1) * a * (2.70158 * a + 1.70158) + 1
};
TWEEN.Easing.Back.EaseInOut = function(a) {
    if ((a *= 2) < 1) return 0.5 * a * a * (3.5949095 * a - 2.5949095);
    return 0.5 * ((a -= 2) * a * (3.5949095 * a + 2.5949095) + 2)
};
TWEEN.Easing.Bounce.EaseIn = function(a) {
    return 1 - TWEEN.Easing.Bounce.EaseOut(1 - a)
};
TWEEN.Easing.Bounce.EaseOut = function(a) {
    return (a /= 1) < 1 / 2.75 ? 7.5625 * a * a : a < 2 / 2.75 ? 7.5625 * (a -= 1.5 / 2.75) * a + 0.75 : a < 2.5 / 2.75 ? 7.5625 * (a -= 2.25 / 2.75) * a + 0.9375 : 7.5625 * (a -= 2.625 / 2.75) * a + 0.984375
};
TWEEN.Easing.Bounce.EaseInOut = function(a) {
    if (a < 0.5) return TWEEN.Easing.Bounce.EaseIn(a * 2) * 0.5;
    return TWEEN.Easing.Bounce.EaseOut(a * 2 - 1) * 0.5 + 0.5
};
