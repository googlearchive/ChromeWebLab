/*
The MIT License

Copyright (c) 2006-2009 Valerio Proietti, <http://mad4milk.net/>

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
// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/c6404b5dc1bdfe2e91019c17c6c9c68f 
// Or build this file again with packager using: packager build More/Date More/Date.Extras More/Locale More/Locale.en-US.Date More/Locale.en-US.Form.Validator More/Locale.en-US.Number More/Locale.en-GB.Date
/*
---
copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
MooTools.More = {
    version: "1.4.0.1",
    build: "a4244edf2aa97ac8a196fc96082dd35af1abab87"
};
(function() {
    var b = function(c) {
        return c != null;
    };
    var a = Object.prototype.hasOwnProperty;
    Object.extend({
        getFromPath: function(e, f) {
            if (typeof f == "string") {
                f = f.split(".");
            }
            for (var d = 0, c = f.length; d < c; d++) {
                if (a.call(e, f[d])) {
                    e = e[f[d]];
                } else {
                    return null;
                }
            }
            return e;
        },
        cleanValues: function(c, e) {
            e = e || b;
            for (var d in c) {
                if (!e(c[d])) {
                    delete c[d];
                }
            }
            return c;
        },
        erase: function(c, d) {
            if (a.call(c, d)) {
                delete c[d];
            }
            return c;
        },
        run: function(d) {
            var c = Array.slice(arguments, 1);
            for (var e in d) {
                if (d[e].apply) {
                    d[e].apply(d, c);
                }
            }
            return d;
        }
    });
})();
(function() {
    var b = null,
        a = {}, d = {};
    var c = function(f) {
        if (instanceOf(f, e.Set)) {
            return f;
        } else {
            return a[f];
        }
    };
    var e = this.Locale = {
        define: function(f, j, h, i) {
            var g;
            if (instanceOf(f, e.Set)) {
                g = f.name;
                if (g) {
                    a[g] = f;
                }
            } else {
                g = f;
                if (!a[g]) {
                    a[g] = new e.Set(g);
                }
                f = a[g];
            } if (j) {
                f.define(j, h, i);
            }
            if (!b) {
                b = f;
            }
            return f;
        },
        use: function(f) {
            f = c(f);
            if (f) {
                b = f;
                this.fireEvent("change", f);
            }
            return this;
        },
        getCurrent: function() {
            return b;
        },
        get: function(g, f) {
            return (b) ? b.get(g, f) : "";
        },
        inherit: function(f, g, h) {
            f = c(f);
            if (f) {
                f.inherit(g, h);
            }
            return this;
        },
        list: function() {
            return Object.keys(a);
        }
    };
    Object.append(e, new Events);
    e.Set = new Class({
        sets: {},
        inherits: {
            locales: [],
            sets: {}
        },
        initialize: function(f) {
            this.name = f || "";
        },
        define: function(i, g, h) {
            var f = this.sets[i];
            if (!f) {
                f = {};
            }
            if (g) {
                if (typeOf(g) == "object") {
                    f = Object.merge(f, g);
                } else {
                    f[g] = h;
                }
            }
            this.sets[i] = f;
            return this;
        },
        get: function(r, j, q) {
            var p = Object.getFromPath(this.sets, r);
            if (p != null) {
                var m = typeOf(p);
                if (m == "function") {
                    p = p.apply(null, Array.from(j));
                } else {
                    if (m == "object") {
                        p = Object.clone(p);
                    }
                }
                return p;
            }
            var h = r.indexOf("."),
                o = h < 0 ? r : r.substr(0, h),
                k = (this.inherits.sets[o] || []).combine(this.inherits.locales).include("en-US");
            if (!q) {
                q = [];
            }
            for (var g = 0, f = k.length; g < f; g++) {
                if (q.contains(k[g])) {
                    continue;
                }
                q.include(k[g]);
                var n = a[k[g]];
                if (!n) {
                    continue;
                }
                p = n.get(r, j, q);
                if (p != null) {
                    return p;
                }
            }
            return "";
        },
        inherit: function(g, h) {
            g = Array.from(g);
            if (h && !this.inherits.sets[h]) {
                this.inherits.sets[h] = [];
            }
            var f = g.length;
            while (f--) {
                (h ? this.inherits.sets[h] : this.inherits.locales).unshift(g[f]);
            }
            return this;
        }
    });
})();
Locale.define("en-US", "Date", {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    months_abbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    days_abbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dateOrder: ["month", "date", "year"],
    shortDate: "%m/%d/%Y",
    shortTime: "%I:%M%p",
    AM: "AM",
    PM: "PM",
    firstDayOfWeek: 0,
    ordinal: function(a) {
        return (a > 3 && a < 21) ? "th" : ["th", "st", "nd", "rd", "th"][Math.min(a % 10, 4)];
    },
    lessThanMinuteAgo: "less than a minute ago",
    minuteAgo: "about a minute ago",
    minutesAgo: "{delta} minutes ago",
    hourAgo: "about an hour ago",
    hoursAgo: "about {delta} hours ago",
    dayAgo: "1 day ago",
    daysAgo: "{delta} days ago",
    weekAgo: "1 week ago",
    weeksAgo: "{delta} weeks ago",
    monthAgo: "1 month ago",
    monthsAgo: "{delta} months ago",
    yearAgo: "1 year ago",
    yearsAgo: "{delta} years ago",
    lessThanMinuteUntil: "less than a minute from now",
    minuteUntil: "about a minute from now",
    minutesUntil: "{delta} minutes from now",
    hourUntil: "about an hour from now",
    hoursUntil: "about {delta} hours from now",
    dayUntil: "1 day from now",
    daysUntil: "{delta} days from now",
    weekUntil: "1 week from now",
    weeksUntil: "{delta} weeks from now",
    monthUntil: "1 month from now",
    monthsUntil: "{delta} months from now",
    yearUntil: "1 year from now",
    yearsUntil: "{delta} years from now"
});
(function() {
    var a = this.Date;
    var f = a.Methods = {
        ms: "Milliseconds",
        year: "FullYear",
        min: "Minutes",
        mo: "Month",
        sec: "Seconds",
        hr: "Hours"
    };
    ["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds", "Time", "TimezoneOffset", "Week", "Timezone", "GMTOffset", "DayOfYear", "LastMonth", "LastDayOfMonth", "UTCDate", "UTCDay", "UTCFullYear", "AMPM", "Ordinal", "UTCHours", "UTCMilliseconds", "UTCMinutes", "UTCMonth", "UTCSeconds", "UTCMilliseconds"].each(function(s) {
        a.Methods[s.toLowerCase()] = s;
    });
    var p = function(u, t, s) {
        if (t == 1) {
            return u;
        }
        return u < Math.pow(10, t - 1) ? (s || "0") + p(u, t - 1, s) : u;
    };
    a.implement({
        set: function(u, s) {
            u = u.toLowerCase();
            var t = f[u] && "set" + f[u];
            if (t && this[t]) {
                this[t](s);
            }
            return this;
        }.overloadSetter(),
        get: function(t) {
            t = t.toLowerCase();
            var s = f[t] && "get" + f[t];
            if (s && this[s]) {
                return this[s]();
            }
            return null;
        }.overloadGetter(),
        clone: function() {
            return new a(this.get("time"));
        },
        increment: function(s, u) {
            s = s || "day";
            u = u != null ? u : 1;
            switch (s) {
                case "year":
                    return this.increment("month", u * 12);
                case "month":
                    var t = this.get("date");
                    this.set("date", 1).set("mo", this.get("mo") + u);
                    return this.set("date", t.min(this.get("lastdayofmonth")));
                case "week":
                    return this.increment("day", u * 7);
                case "day":
                    return this.set("date", this.get("date") + u);
            }
            if (!a.units[s]) {
                throw new Error(s + " is not a supported interval");
            }
            return this.set("time", this.get("time") + u * a.units[s]());
        },
        decrement: function(s, t) {
            return this.increment(s, -1 * (t != null ? t : 1));
        },
        isLeapYear: function() {
            return a.isLeapYear(this.get("year"));
        },
        clearTime: function() {
            return this.set({
                hr: 0,
                min: 0,
                sec: 0,
                ms: 0
            });
        },
        diff: function(t, s) {
            if (typeOf(t) == "string") {
                t = a.parse(t);
            }
            return ((t - this) / a.units[s || "day"](3, 3)).round();
        },
        getLastDayOfMonth: function() {
            return a.daysInMonth(this.get("mo"), this.get("year"));
        },
        getDayOfYear: function() {
            return (a.UTC(this.get("year"), this.get("mo"), this.get("date") + 1) - a.UTC(this.get("year"), 0, 1)) / a.units.day();
        },
        setDay: function(t, s) {
            if (s == null) {
                s = a.getMsg("firstDayOfWeek");
                if (s === "") {
                    s = 1;
                }
            }
            t = (7 + a.parseDay(t, true) - s) % 7;
            var u = (7 + this.get("day") - s) % 7;
            return this.increment("day", t - u);
        },
        getWeek: function(v) {
            if (v == null) {
                v = a.getMsg("firstDayOfWeek");
                if (v === "") {
                    v = 1;
                }
            }
            var x = this,
                u = (7 + x.get("day") - v) % 7,
                t = 0,
                w;
            if (v == 1) {
                var y = x.get("month"),
                    s = x.get("date") - u;
                if (y == 11 && s > 28) {
                    return 1;
                }
                if (y == 0 && s < -2) {
                    x = new a(x).decrement("day", u);
                    u = 0;
                }
                w = new a(x.get("year"), 0, 1).get("day") || 7;
                if (w > 4) {
                    t = -7;
                }
            } else {
                w = new a(x.get("year"), 0, 1).get("day");
            }
            t += x.get("dayofyear");
            t += 6 - u;
            t += (7 + w - v) % 7;
            return (t / 7);
        },
        getOrdinal: function(s) {
            return a.getMsg("ordinal", s || this.get("date"));
        },
        getTimezone: function() {
            return this.toString().replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, "$1").replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, "$1$2$3");
        },
        getGMTOffset: function() {
            var s = this.get("timezoneOffset");
            return ((s > 0) ? "-" : "+") + p((s.abs() / 60).floor(), 2) + p(s % 60, 2);
        },
        setAMPM: function(s) {
            s = s.toUpperCase();
            var t = this.get("hr");
            if (t > 11 && s == "AM") {
                return this.decrement("hour", 12);
            } else {
                if (t < 12 && s == "PM") {
                    return this.increment("hour", 12);
                }
            }
            return this;
        },
        getAMPM: function() {
            return (this.get("hr") < 12) ? "AM" : "PM";
        },
        parse: function(s) {
            this.set("time", a.parse(s));
            return this;
        },
        isValid: function(s) {
            if (!s) {
                s = this;
            }
            return typeOf(s) == "date" && !isNaN(s.valueOf());
        },
        format: function(s) {
            if (!this.isValid()) {
                return "invalid date";
            }
            if (!s) {
                s = "%x %X";
            }
            if (typeof s == "string") {
                s = g[s.toLowerCase()] || s;
            }
            if (typeof s == "function") {
                return s(this);
            }
            var t = this;
            return s.replace(/%([a-z%])/gi, function(v, u) {
                switch (u) {
                    case "a":
                        return a.getMsg("days_abbr")[t.get("day")];
                    case "A":
                        return a.getMsg("days")[t.get("day")];
                    case "b":
                        return a.getMsg("months_abbr")[t.get("month")];
                    case "B":
                        return a.getMsg("months")[t.get("month")];
                    case "c":
                        return t.format("%a %b %d %H:%M:%S %Y");
                    case "d":
                        return p(t.get("date"), 2);
                    case "e":
                        return p(t.get("date"), 2, " ");
                    case "H":
                        return p(t.get("hr"), 2);
                    case "I":
                        return p((t.get("hr") % 12) || 12, 2);
                    case "j":
                        return p(t.get("dayofyear"), 3);
                    case "k":
                        return p(t.get("hr"), 2, " ");
                    case "l":
                        return p((t.get("hr") % 12) || 12, 2, " ");
                    case "L":
                        return p(t.get("ms"), 3);
                    case "m":
                        return p((t.get("mo") + 1), 2);
                    case "M":
                        return p(t.get("min"), 2);
                    case "o":
                        return t.get("ordinal");
                    case "p":
                        return a.getMsg(t.get("ampm"));
                    case "s":
                        return Math.round(t / 1000);
                    case "S":
                        return p(t.get("seconds"), 2);
                    case "T":
                        return t.format("%H:%M:%S");
                    case "U":
                        return p(t.get("week"), 2);
                    case "w":
                        return t.get("day");
                    case "x":
                        return t.format(a.getMsg("shortDate"));
                    case "X":
                        return t.format(a.getMsg("shortTime"));
                    case "y":
                        return t.get("year").toString().substr(2);
                    case "Y":
                        return t.get("year");
                    case "z":
                        return t.get("GMTOffset");
                    case "Z":
                        return t.get("Timezone");
                }
                return u;
            });
        },
        toISOString: function() {
            return this.format("iso8601");
        }
    }).alias({
        toJSON: "toISOString",
        compare: "diff",
        strftime: "format"
    });
    var k = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        h = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var g = {
        db: "%Y-%m-%d %H:%M:%S",
        compact: "%Y%m%dT%H%M%S",
        "short": "%d %b %H:%M",
        "long": "%B %d, %Y %H:%M",
        rfc822: function(s) {
            return k[s.get("day")] + s.format(", %d ") + h[s.get("month")] + s.format(" %Y %H:%M:%S %Z");
        },
        rfc2822: function(s) {
            return k[s.get("day")] + s.format(", %d ") + h[s.get("month")] + s.format(" %Y %H:%M:%S %z");
        },
        iso8601: function(s) {
            return (s.getUTCFullYear() + "-" + p(s.getUTCMonth() + 1, 2) + "-" + p(s.getUTCDate(), 2) + "T" + p(s.getUTCHours(), 2) + ":" + p(s.getUTCMinutes(), 2) + ":" + p(s.getUTCSeconds(), 2) + "." + p(s.getUTCMilliseconds(), 3) + "Z");
        }
    };
    var c = [],
        n = a.parse;
    var r = function(v, x, u) {
        var t = -1,
            w = a.getMsg(v + "s");
        switch (typeOf(x)) {
            case "object":
                t = w[x.get(v)];
                break;
            case "number":
                t = w[x];
                if (!t) {
                    throw new Error("Invalid " + v + " index: " + x);
                }
                break;
            case "string":
                var s = w.filter(function(y) {
                    return this.test(y);
                }, new RegExp("^" + x, "i"));
                if (!s.length) {
                    throw new Error("Invalid " + v + " string");
                }
                if (s.length > 1) {
                    throw new Error("Ambiguous " + v);
                }
                t = s[0];
        }
        return (u) ? w.indexOf(t) : t;
    };
    var i = 1900,
        o = 70;
    a.extend({
        getMsg: function(t, s) {
            return Locale.get("Date." + t, s);
        },
        units: {
            ms: Function.from(1),
            second: Function.from(1000),
            minute: Function.from(60000),
            hour: Function.from(3600000),
            day: Function.from(86400000),
            week: Function.from(608400000),
            month: function(t, s) {
                var u = new a;
                return a.daysInMonth(t != null ? t : u.get("mo"), s != null ? s : u.get("year")) * 86400000;
            },
            year: function(s) {
                s = s || new a().get("year");
                return a.isLeapYear(s) ? 31622400000 : 31536000000;
            }
        },
        daysInMonth: function(t, s) {
            return [31, a.isLeapYear(s) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][t];
        },
        isLeapYear: function(s) {
            return ((s % 4 === 0) && (s % 100 !== 0)) || (s % 400 === 0);
        },
        parse: function(v) {
            var u = typeOf(v);
            if (u == "number") {
                return new a(v);
            }
            if (u != "string") {
                return v;
            }
            v = v.clean();
            if (!v.length) {
                return null;
            }
            var s;
            c.some(function(w) {
                var t = w.re.exec(v);
                return (t) ? (s = w.handler(t)) : false;
            });
            if (!(s && s.isValid())) {
                s = new a(n(v));
                if (!(s && s.isValid())) {
                    s = new a(v.toInt());
                }
            }
            return s;
        },
        parseDay: function(s, t) {
            return r("day", s, t);
        },
        parseMonth: function(t, s) {
            return r("month", t, s);
        },
        parseUTC: function(t) {
            var s = new a(t);
            var u = a.UTC(s.get("year"), s.get("mo"), s.get("date"), s.get("hr"), s.get("min"), s.get("sec"), s.get("ms"));
            return new a(u);
        },
        orderIndex: function(s) {
            return a.getMsg("dateOrder").indexOf(s) + 1;
        },
        defineFormat: function(s, t) {
            g[s] = t;
            return this;
        },
        defineParser: function(s) {
            c.push((s.re && s.handler) ? s : l(s));
            return this;
        },
        defineParsers: function() {
            Array.flatten(arguments).each(a.defineParser);
            return this;
        },
        define2DigitYearStart: function(s) {
            o = s % 100;
            i = s - o;
            return this;
        }
    }).extend({
        defineFormats: a.defineFormat.overloadSetter()
    });
    var d = function(s) {
        return new RegExp("(?:" + a.getMsg(s).map(function(t) {
            return t.substr(0, 3);
        }).join("|") + ")[a-z]*");
    };
    var m = function(s) {
        switch (s) {
            case "T":
                return "%H:%M:%S";
            case "x":
                return ((a.orderIndex("month") == 1) ? "%m[-./]%d" : "%d[-./]%m") + "([-./]%y)?";
            case "X":
                return "%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%z?";
        }
        return null;
    };
    var j = {
        d: /[0-2]?[0-9]|3[01]/,
        H: /[01]?[0-9]|2[0-3]/,
        I: /0?[1-9]|1[0-2]/,
        M: /[0-5]?\d/,
        s: /\d+/,
        o: /[a-z]*/,
        p: /[ap]\.?m\.?/,
        y: /\d{2}|\d{4}/,
        Y: /\d{4}/,
        z: /Z|[+-]\d{2}(?::?\d{2})?/
    };
    j.m = j.I;
    j.S = j.M;
    var e;
    var b = function(s) {
        e = s;
        j.a = j.A = d("days");
        j.b = j.B = d("months");
        c.each(function(u, t) {
            if (u.format) {
                c[t] = l(u.format);
            }
        });
    };
    var l = function(u) {
        if (!e) {
            return {
                format: u
            };
        }
        var s = [];
        var t = (u.source || u).replace(/%([a-z])/gi, function(w, v) {
            return m(v) || w;
        }).replace(/\((?!\?)/g, "(?:").replace(/ (?!\?|\*)/g, ",? ").replace(/%([a-z%])/gi, function(w, v) {
            var x = j[v];
            if (!x) {
                return v;
            }
            s.push(v);
            return "(" + x.source + ")";
        }).replace(/\[a-z\]/gi, "[a-z\\u00c0-\\uffff;&]");
        return {
            format: u,
            re: new RegExp("^" + t + "$", "i"),
            handler: function(y) {
                y = y.slice(1).associate(s);
                var v = new a().clearTime(),
                    x = y.y || y.Y;
                if (x != null) {
                    q.call(v, "y", x);
                }
                if ("d" in y) {
                    q.call(v, "d", 1);
                }
                if ("m" in y || y.b || y.B) {
                    q.call(v, "m", 1);
                }
                for (var w in y) {
                    q.call(v, w, y[w]);
                }
                return v;
            }
        };
    };
    var q = function(s, t) {
        if (!t) {
            return this;
        }
        switch (s) {
            case "a":
            case "A":
                return this.set("day", a.parseDay(t, true));
            case "b":
            case "B":
                return this.set("mo", a.parseMonth(t, true));
            case "d":
                return this.set("date", t);
            case "H":
            case "I":
                return this.set("hr", t);
            case "m":
                return this.set("mo", t - 1);
            case "M":
                return this.set("min", t);
            case "p":
                return this.set("ampm", t.replace(/\./g, ""));
            case "S":
                return this.set("sec", t);
            case "s":
                return this.set("ms", ("0." + t) * 1000);
            case "w":
                return this.set("day", t);
            case "Y":
                return this.set("year", t);
            case "y":
                t = +t;
                if (t < 100) {
                    t += i + (t < o ? 100 : 0);
                }
                return this.set("year", t);
            case "z":
                if (t == "Z") {
                    t = "+00";
                }
                var u = t.match(/([+-])(\d{2}):?(\d{2})?/);
                u = (u[1] + "1") * (u[2] * 60 + (+u[3] || 0)) + this.getTimezoneOffset();
                return this.set("time", this - u * 60000);
        }
        return this;
    };
    a.defineParsers("%Y([-./]%m([-./]%d((T| )%X)?)?)?", "%Y%m%d(T%H(%M%S?)?)?", "%x( %X)?", "%d%o( %b( %Y)?)?( %X)?", "%b( %d%o)?( %Y)?( %X)?", "%Y %b( %d%o( %X)?)?", "%o %b %d %X %z %Y", "%T", "%H:%M( ?%p)?");
    Locale.addEvent("change", function(s) {
        if (Locale.get("Date")) {
            b(s);
        }
    }).fireEvent("change", Locale.getCurrent());
})();
Date.implement({
    timeDiffInWords: function(a) {
        return Date.distanceOfTimeInWords(this, a || new Date);
    },
    timeDiff: function(f, c) {
        if (f == null) {
            f = new Date;
        }
        var h = ((f - this) / 1000).floor().abs();
        var e = [],
            a = [60, 60, 24, 365, 0],
            d = ["s", "m", "h", "d", "y"],
            g, b;
        for (var i = 0; i < a.length; i++) {
            if (i && !h) {
                break;
            }
            g = h;
            if ((b = a[i])) {
                g = (h % b);
                h = (h / b).floor();
            }
            e.unshift(g + (d[i] || ""));
        }
        return e.join(c || ":");
    }
}).extend({
    distanceOfTimeInWords: function(b, a) {
        return Date.getTimePhrase(((a - b) / 1000).toInt());
    },
    getTimePhrase: function(f) {
        var d = (f < 0) ? "Until" : "Ago";
        if (f < 0) {
            f *= -1;
        }
        var b = {
            minute: 60,
            hour: 60,
            day: 24,
            week: 7,
            month: 52 / 12,
            year: 12,
            eon: Infinity
        };
        var e = "lessThanMinute";
        for (var c in b) {
            var a = b[c];
            if (f < 1.5 * a) {
                if (f > 0.75 * a) {
                    e = c;
                }
                break;
            }
            f /= a;
            e = c + "s";
        }
        f = f.round();
        return Date.getMsg(e + d, f).substitute({
            delta: f
        });
    }
}).defineParsers({
    re: /^(?:tod|tom|yes)/i,
    handler: function(a) {
        var b = new Date().clearTime();
        switch (a[0]) {
            case "tom":
                return b.increment();
            case "yes":
                return b.decrement();
            default:
                return b;
        }
    }
}, {
    re: /^(next|last) ([a-z]+)$/i,
    handler: function(e) {
        var f = new Date().clearTime();
        var b = f.getDay();
        var c = Date.parseDay(e[2], true);
        var a = c - b;
        if (c <= b) {
            a += 7;
        }
        if (e[1] == "last") {
            a -= 7;
        }
        return f.set("date", f.getDate() + a);
    }
}).alias("timeAgoInWords", "timeDiffInWords");
Locale.define("en-US", "FormValidator", {
    required: "This field is required.",
    length: "Please enter {length} characters (you entered {elLength} characters)",
    minLength: "Please enter at least {minLength} characters (you entered {length} characters).",
    maxLength: "Please enter no more than {maxLength} characters (you entered {length} characters).",
    integer: "Please enter an integer in this field. Numbers with decimals (e.g. 1.25) are not permitted.",
    numeric: 'Please enter only numeric values in this field (i.e. "1" or "1.1" or "-1" or "-1.1").',
    digits: "Please use numbers and punctuation only in this field (for example, a phone number with dashes or dots is permitted).",
    alpha: "Please use only letters (a-z) within this field. No spaces or other characters are allowed.",
    alphanum: "Please use only letters (a-z) or numbers (0-9) in this field. No spaces or other characters are allowed.",
    dateSuchAs: "Please enter a valid date such as {date}",
    dateInFormatMDY: 'Please enter a valid date such as MM/DD/YYYY (i.e. "12/31/1999")',
    email: 'Please enter a valid email address. For example "fred@domain.com".',
    url: "Please enter a valid URL such as http://www.example.com.",
    currencyDollar: "Please enter a valid $ amount. For example $100.00 .",
    oneRequired: "Please enter something for at least one of these inputs.",
    errorPrefix: "Error: ",
    warningPrefix: "Warning: ",
    noSpace: "There can be no spaces in this input.",
    reqChkByNode: "No items are selected.",
    requiredChk: "This field is required.",
    reqChkByName: "Please select a {label}.",
    match: "This field needs to match the {matchName} field",
    startDate: "the start date",
    endDate: "the end date",
    currendDate: "the current date",
    afterDate: "The date should be the same or after {label}.",
    beforeDate: "The date should be the same or before {label}.",
    startMonth: "Please select a start month",
    sameMonth: "These two dates must be in the same month - you must change one or the other.",
    creditcard: "The credit card number entered is invalid. Please check the number and try again. {length} digits entered."
});
Locale.define("en-US", "Number", {
    decimal: ".",
    group: ",",
    currency: {
        prefix: "$ "
    }
});
Locale.define("en-GB", "Date", {
    dateOrder: ["date", "month", "year"],
    shortDate: "%d/%m/%Y",
    shortTime: "%H:%M"
}).inherit("en-US", "Date");
