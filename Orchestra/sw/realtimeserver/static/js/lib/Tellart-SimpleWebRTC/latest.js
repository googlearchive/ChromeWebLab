! function(t) {
    if ("function" == typeof bootstrap) bootstrap("webrtc", t);
    else if ("object" == typeof exports) module.exports = t();
    else if ("function" == typeof define && define.amd) define(t);
    else if ("undefined" != typeof ses) {
        if (!ses.ok()) return;
        ses.makeWebRTC = t
    } else "undefined" != typeof window ? window.WebRTC = t() : global.WebRTC = t()
}(function() {
    return function(t, e, n) {
        function o(n, r) {
            if (!e[n]) {
                if (!t[n]) {
                    var s = "function" == typeof require && require;
                    if (!r && s) return s(n, !0);
                    if (i) return i(n, !0);
                    throw new Error("Cannot find module '" + n + "'")
                }
                var a = e[n] = {
                    exports: {}
                };
                t[n][0].call(a.exports, function(e) {
                    var i = t[n][1][e];
                    return o(i ? i : e)
                }, a, a.exports)
            }
            return e[n].exports
        }
        for (var i = "function" == typeof require && require, r = 0; r < n.length; r++) o(n[r]);
        return o
    }({
        1: [
            function(t, e) {
                function n(t) {
                    var e, n, o = this,
                        s = t || {};
                    this.config = {
                        url: "http://signaling.simplewebrtc.com:8888",
                        log: !1,
                        localVideoEl: "",
                        remoteVideosEl: "",
                        autoRequestMedia: !1,
                        autoRemoveVideos: !0,
                        peerConnectionConfig: {
                            iceServers: "moz" == r.prefix ? [{
                                url: "stun:124.124.124.2"
                            }] : [{
                                url: "stun:stun.l.google.com:19302"
                            }]
                        },
                        peerConnectionContraints: {
                            optional: [{
                                DtlsSrtpKeyAgreement: !0
                            }]
                        },
                        media: {
                            audio: !0,
                            video: !0
                        }
                    }, r.support || console.error("Your browser doesn't seem to support WebRTC"), this.screenSharingSupport = r.screenSharing;
                    for (e in s) this.config[e] = s[e];
                    i = this.config.log ? console.log.bind(console) : function() {}, this.peers = [], n = this.connection = io.connect(this.config.url), n.on("connect", function() {
                        o.emit("ready", n.socket.sessionid), o.sessionReady = !0, o.testReadiness()
                    }), n.on("message", function(t) {
                        var e, n = o.getPeers(t.from, t.roomType);
                        "offer" === t.type ? (e = o.createPeer({
                            id: t.from,
                            type: t.roomType,
                            sharemyscreen: "screen" === t.roomType && !t.broadcaster
                        }), e.handleMessage(t)) : n.length && n.forEach(function(e) {
                            e.handleMessage(t)
                        })
                    }), n.on("remove", function(t) {
                        t.id !== o.connection.socket.sessionid && o.removeForPeerSession(t.id, t.type)
                    }), u.call(this), this.config.log && this.on("*", function(t, e, n) {
                        i("event:", t, e, n)
                    }), this.config.autoRequestMedia && this.startLocalVideo()
                }

                function o(t) {
                    var e = this;
                    this.id = t.id, this.parent = t.parent, this.type = t.type || "video", this.oneway = t.oneway || !1, this.sharemyscreen = t.sharemyscreen || !1, this.stream = t.stream, this.pc = new p(this.parent.config.peerConnectionConfig, this.parent.config.peerConnectionContraints), this.pc.on("ice", this.onIceCandidate.bind(this)), "screen" === t.type ? this.parent.localScreen && this.sharemyscreen && (i("adding local screen stream to peer connection"), this.pc.addStream(this.parent.localScreen), this.broadcaster = this.parent.connection.socket.sessionid) : this.pc.addStream(this.parent.localStream), this.pc.on("addStream", this.handleRemoteStreamAdded.bind(this)), this.pc.on("removeStream", this.handleStreamRemoved.bind(this)), u.call(this), this.on("*", function(t, n) {
                        e.parent.emit(t, n, e)
                    })
                }
                var i, r = t("webrtcsupport"),
                    s = t("getusermedia"),
                    a = t("getscreenmedia"),
                    c = t("attachmediastream"),
                    p = t("rtcpeerconnection"),
                    u = t("wildemitter"),
                    h = t("hark");
                n.prototype = Object.create(u.prototype, {
                    constructor: {
                        value: n
                    }
                }), n.prototype.getEl = function(t) {
                    return "string" == typeof t ? document.getElementById(t) : t
                }, n.prototype.getLocalVideoContainer = function() {
                    var t = this.getEl(this.config.localVideoEl);
                    if (t && "VIDEO" === t.tagName) return t;
                    var e = document.createElement("video");
                    return t.appendChild(e), e
                }, n.prototype.getRemoteVideoContainer = function() {
                    return this.getEl(this.config.remoteVideosEl)
                }, n.prototype.createPeer = function(t) {
                    var e;
                    return t.parent = this, e = new o(t), this.peers.push(e), e
                }, n.prototype.createRoom = function(t, e) {
                    2 === arguments.length ? this.connection.emit("create", t, e) : this.connection.emit("create", t)
                }, n.prototype.joinRoom = function(t, e) {
                    var n = this;
                    this.roomName = t, this.connection.emit("join", t, function(t, o) {
                        if (t) n.emit("error", t);
                        else {
                            var i, r, s, a;
                            for (i in o.clients) {
                                r = o.clients[i];
                                for (s in r) r[s] && (a = n.createPeer({
                                    id: i,
                                    type: s
                                }), a.start())
                            }
                        }
                        e instanceof Function && e(t, o)
                    })
                }, n.prototype.leaveRoom = function() {
                    this.roomName && (this.connection.emit("leave", this.roomName), this.peers.forEach(function(t) {
                        t.end()
                    }))
                }, n.prototype.testReadiness = function() {
                    var t = this;
                    this.localStream && this.sessionReady && setTimeout(function() {
                        t.emit("readyToCall", t.connection.socket.sessionid)
                    }, 1e3)
                }, n.prototype.startLocalVideo = function(t) {
                    var e = this,
                        n = t || e.getLocalVideoContainer();
                    s(function(t, o) {
                        if (t) throw new Error("Failed to get access to local media.");
                        c(n, o), n.muted = !0, e.setupAudioMonitor(o), e.localStream = e.setupMicVolumeControl(o), e.testReadiness(), e.setMicVolume(.5)
                    })
                }, n.prototype.mute = function() {
                    this._audioEnabled(!1), this.hardMuted = !0, this.emit("audioOff")
                }, n.prototype.unmute = function() {
                    this._audioEnabled(!0), this.hardMuted = !1, this.emit("audioOn")
                }, n.prototype.setupAudioMonitor = function(t) {
                    i("Setup audio");
                    var e, n = h(t),
                        o = this;
                    n.on("speaking", function() {
                        o.hardMuted || (o.setMicVolume(1), o.sendToAll("speaking", {}))
                    }), n.on("stopped_speaking", function() {
                        o.hardMuted || (e && clearTimeout(e), e = setTimeout(function() {
                            o.setMicVolume(.5), o.sendToAll("stopped_speaking", {})
                        }, 1e3))
                    })
                }, n.prototype.setupMicVolumeControl = function(t) {
                    if (!r.webAudio) return t;
                    var e = new webkitAudioContext,
                        n = e.createMediaStreamSource(t),
                        o = this.gainFilter = e.createGainNode(),
                        i = e.createMediaStreamDestination(),
                        s = i.stream;
                    return n.connect(o), o.connect(i), t.removeTrack(t.getAudioTracks()[0]), t.addTrack(s.getAudioTracks()[0]), t
                }, n.prototype.setMicVolume = function(t) {
                    r.webAudio && (this.gainFilter.gain.value = t)
                }, n.prototype.pauseVideo = function() {
                    this._videoEnabled(!1), this.emit("videoOff")
                }, n.prototype.resumeVideo = function() {
                    this._videoEnabled(!0), this.emit("videoOn")
                }, n.prototype.pause = function() {
                    this._audioEnabled(!1), this.pauseVideo()
                }, n.prototype.resume = function() {
                    this._audioEnabled(!0), this.resumeVideo()
                }, n.prototype._audioEnabled = function(t) {
                    this.setMicVolume(t ? 1 : 0), this.localStream.getAudioTracks().forEach(function(e) {
                        e.enabled = !! t
                    })
                }, n.prototype._videoEnabled = function(t) {
                    this.localStream.getVideoTracks().forEach(function(e) {
                        e.enabled = !! t
                    })
                }, n.prototype.shareScreen = function(t) {
                    var e = this;
                    r.screenSharing ? a(function(n, o) {
                        var i = document.createElement("video"),
                            r = e.getRemoteVideoContainer();
                        if (n) throw t && t("Screen sharing failed"), new Error("Failed to access to screen media.");
                        e.localScreen = o, i.id = "localScreen", c(i, o), r && r.appendChild(i), e.emit("videoAdded", i), e.connection.emit("shareScreen"), e.peers.forEach(function(t) {
                            var n;
                            "video" === t.type && (n = e.createPeer({
                                id: t.id,
                                type: "screen",
                                sharemyscreen: !0
                            }), n.start())
                        }), t && t()
                    }) : t && t("Screen sharing not supported")
                }, n.prototype.stopScreenShare = function() {
                    this.connection.emit("unshareScreen");
                    var t = document.getElementById("localScreen"),
                        e = this.getRemoteVideoContainer();
                    this.localScreen, this.config.autoRemoveVideos && e && t && e.removeChild(t), t && this.emit("videoRemoved", t), this.localScreen && this.localScreen.stop(), this.peers.forEach(function(t) {
                        t.broadcaster && t.end()
                    }), delete this.localScreen
                }, n.prototype.removeForPeerSession = function(t, e) {
                    this.getPeers(t, e).forEach(function(t) {
                        t.end()
                    })
                }, n.prototype.getPeers = function(t, e) {
                    return this.peers.filter(function(n) {
                        return !(t && n.id !== t || e && n.type !== e)
                    })
                }, n.prototype.sendToAll = function(t, e) {
                    this.peers.forEach(function(n) {
                        n.send(t, e)
                    })
                }, o.prototype = Object.create(u.prototype, {
                    constructor: {
                        value: o
                    }
                }), o.prototype.handleMessage = function(t) {
                    var e = this;
                    i("getting", t.type, t.payload), "offer" === t.type ? this.pc.answer(t.payload, function(t, n) {
                        e.send("answer", n)
                    }) : "answer" === t.type ? this.pc.handleAnswer(t.payload) : "candidate" === t.type ? this.pc.processIce(t.payload) : "speaking" === t.type ? this.parent.emit("speaking", {
                        id: t.from
                    }) : "stopped_speaking" === t.type && this.parent.emit("stopped_speaking", {
                        id: t.from
                    })
                }, o.prototype.send = function(t, e) {
                    i("sending", t, e), this.parent.connection.emit("message", {
                        to: this.id,
                        broadcaster: this.broadcaster,
                        roomType: this.type,
                        type: t,
                        payload: e
                    })
                }, o.prototype.onIceCandidate = function(t) {
                    this.closed || (t ? this.send("candidate", t) : i("End of candidates."))
                }, o.prototype.start = function() {
                    var t = this;
                    this.pc.offer(function(e, n) {
                        t.send("offer", n)
                    })
                }, o.prototype.end = function() {
                    this.pc.close(), this.handleStreamRemoved()
                }, o.prototype.handleRemoteStreamAdded = function(t) {
                    var e = this.stream = t.stream,
                        n = document.createElement("video"),
                        o = this.parent.getRemoteVideoContainer();
                    n.id = this.getDomId(), c(n, e), o && o.appendChild(n), this.emit("videoAdded", n)
                }, o.prototype.handleStreamRemoved = function() {
                    var t = document.getElementById(this.getDomId()),
                        e = this.parent.getRemoteVideoContainer();
                    t && (this.emit("videoRemoved", t), e && this.parent.config.autoRemoveVideos && e.removeChild(t)), this.parent.peers.splice(this.parent.peers.indexOf(this), 1), this.closed = !0
                }, o.prototype.getDomId = function() {
                    return [this.id, this.type, this.broadcaster ? "broadcasting" : "incoming"].join("_")
                }, "undefined" != typeof e ? e.exports = n : window.WebRTC = n
            }, {
                webrtcsupport: 2,
                getusermedia: 3,
                attachmediastream: 4,
                getscreenmedia: 5,
                hark: 6,
                wildemitter: 7,
                rtcpeerconnection: 8
            }
        ],
        2: [
            function(t, e) {
                var n = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection,
                    o = window.mozRTCIceCandidate || window.RTCIceCandidate,
                    i = window.mozRTCSessionDescription || window.RTCSessionDescription,
                    r = function() {
                        return window.mozRTCPeerConnection ? "moz" : window.webkitRTCPeerConnection ? "webkit" : void 0
                    }(),
                    s = navigator.userAgent.match("Chrome") && parseInt(navigator.userAgent.match(/Chrome\/(.*) /)[1], 10) >= 26,
                    a = !! window.webkitAudioContext;
                e.exports = {
                    support: !! n,
                    dataChannel: !! (n && n.prototype && n.prototype.createDataChannel),
                    prefix: r,
                    webAudio: a,
                    screenSharing: s,
                    PeerConnection: n,
                    SessionDescription: i,
                    IceCandidate: o
                }
            }, {}
        ],
        4: [
            function(t, e) {
                e.exports = function(t, e, n) {
                    var o = n === !1 ? !1 : !0;
                    if (o && (t.autoplay = !0), window.mozGetUserMedia) t.mozSrcObject = e, o && t.play();
                    else if ("undefined" != typeof t.srcObject) t.srcObject = e;
                    else if ("undefined" != typeof t.mozSrcObject) t.mozSrcObject = e;
                    else {
                        if ("undefined" == typeof t.src) return !1;
                        t.src = URL.createObjectURL(e)
                    }
                    return !0
                }
            }, {}
        ],
        3: [
            function(t, e) {
                var n = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                e.exports = function(t, e) {
                    var o = 2 === arguments.length,
                        i = {
                            video: !0,
                            audio: !0
                        };
                    return o || (e = t, t = i), n ? (n.call(navigator, t, function(t) {
                        e(null, t)
                    }, function(t) {
                        e(t)
                    }), void 0) : e(new Error("notSupported"))
                }
            }, {}
        ],
        7: [
            function(t, e) {
                function n() {
                    this.callbacks = {}
                }
                e.exports = n, n.prototype.on = function(t) {
                    var e = 3 === arguments.length,
                        n = e ? arguments[1] : void 0,
                        o = e ? arguments[2] : arguments[1];
                    return o._groupName = n, (this.callbacks[t] = this.callbacks[t] || []).push(o), this
                }, n.prototype.once = function(t) {
                    function e() {
                        n.off(t, e), r.apply(this, arguments)
                    }
                    var n = this,
                        o = 3 === arguments.length,
                        i = o ? arguments[1] : void 0,
                        r = o ? arguments[2] : arguments[1];
                    return this.on(t, i, e), this
                }, n.prototype.releaseGroup = function(t) {
                    var e, n, o, i;
                    for (e in this.callbacks)
                        for (i = this.callbacks[e], n = 0, o = i.length; o > n; n++) i[n]._groupName === t && (i.splice(n, 1), n--, o--);
                    return this
                }, n.prototype.off = function(t, e) {
                    var n, o = this.callbacks[t];
                    return o ? 1 === arguments.length ? (delete this.callbacks[t], this) : (n = o.indexOf(e), o.splice(n, 1), this) : this
                }, n.prototype.emit = function(t) {
                    var e, n, o = [].slice.call(arguments, 1),
                        i = this.callbacks[t],
                        r = this.getWildcardCallbacks(t);
                    if (i)
                        for (e = 0, n = i.length; n > e && i[e]; ++e) i[e].apply(this, o);
                    if (r)
                        for (e = 0, n = r.length; n > e && r[e]; ++e) r[e].apply(this, [t].concat(o));
                    return this
                }, n.prototype.getWildcardCallbacks = function(t) {
                    var e, n, o = [];
                    for (e in this.callbacks) n = e.split("*"), ("*" === e || 2 === n.length && t.slice(0, n[1].length) === n[1]) && (o = o.concat(this.callbacks[e]));
                    return o
                }
            }, {}
        ],
        5: [
            function(t, e) {
                var n = t("getusermedia");
                e.exports = function(t) {
                    var e = {
                        video: {
                            mandatory: {
                                chromeMediaSource: "screen"
                            }
                        }
                    };
                    return "http:" === window.location.protocol ? t(new Error("HttpsRequired")) : navigator.webkitGetUserMedia ? (n(e, t), void 0) : t(new Error("NotSupported"))
                }
            }, {
                getusermedia: 3
            }
        ],
        6: [
            function(t, e) {
                function n(t, e) {
                    var n = -1 / 0;
                    t.getFloatFrequencyData(e);
                    for (var o = 0, i = e.length; i > o; o++) e[o] > n && e[o] < 0 && (n = e[o]);
                    return n
                }
                var o = t("wildemitter");
                e.exports = function(t, e) {
                    var i = new o;
                    if (!window.webkitAudioContext) return i;
                    var r, s, a, e = e || {}, c = e.smoothing || .5,
                        p = e.interval || 100,
                        u = e.threshold,
                        h = e.play,
                        d = new webkitAudioContext;
                    a = d.createAnalyser(), a.fftSize = 512, a.smoothingTimeConstant = c, s = new Float32Array(a.fftSize), t.jquery && (t = t[0]), t instanceof HTMLAudioElement ? (r = d.createMediaElementSource(t), "undefined" == typeof h && (h = !0), u = u || -65) : (r = d.createMediaStreamSource(t), u = u || -45), r.connect(a), h && a.connect(d.destination), i.speaking = !1, i.setThreshold = function(t) {
                        u = t
                    }, i.setInterval = function(t) {
                        p = t
                    };
                    var f = function() {
                        setTimeout(function() {
                            var t = n(a, s);
                            i.emit("volume_change", t, u), t > u ? i.speaking || (i.speaking = !0, i.emit("speaking")) : i.speaking && (i.speaking = !1, i.emit("stopped_speaking")), f()
                        }, p)
                    };
                    return f(), i
                }
            }, {
                wildemitter: 7
            }
        ],
        8: [
            function(t, e) {
                function n(t, e) {
                    this.pc = new i.PeerConnection(t, e), o.call(this), this.pc.onicecandidate = this._onIce.bind(this), this.pc.onaddstream = this._onAddStream.bind(this), this.pc.onremovestream = this._onRemoveStream.bind(this), t.debug && this.on("*", function(t, e) {
                        console.log("PeerConnection event:", t, e)
                    })
                }
                var o = t("wildemitter"),
                    i = t("webrtcsupport");
                n.prototype = Object.create(o.prototype, {
                    constructor: {
                        value: n
                    }
                }), n.prototype.addStream = function(t) {
                    this.localStream = t, this.pc.addStream(t)
                }, n.prototype._onIce = function(t) {
                    t.candidate ? this.emit("ice", t.candidate) : this.emit("endOfCandidates")
                }, n.prototype._onAddStream = function(t) {
                    this.emit("addStream", t)
                }, n.prototype._onRemoveStream = function(t) {
                    this.emit("removeStream", t)
                }, n.prototype.processIce = function(t) {
                    this.pc.addIceCandidate(new i.IceCandidate(t))
                }, n.prototype.offer = function(t, e) {
                    var n = this,
                        o = 2 === arguments.length,
                        i = o ? t : {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        }, r = o ? e : t;
                    this.pc.createOffer(function(t) {
                        n.pc.setLocalDescription(t), n.emit("offer", t), r && r(null, t)
                    }, function(t) {
                        n.emit("error", t), r && r(t)
                    }, i)
                }, n.prototype.answerAudioOnly = function(t, e) {
                    var n = {
                        mandatory: {
                            OfferToReceiveAudio: !0,
                            OfferToReceiveVideo: !1
                        }
                    };
                    this._answer(t, n, e)
                }, n.prototype.answerVideoOnly = function(t, e) {
                    var n = {
                        mandatory: {
                            OfferToReceiveAudio: !1,
                            OfferToReceiveVideo: !0
                        }
                    };
                    this._answer(t, n, e)
                }, n.prototype._answer = function(t, e, n) {
                    var o = this;
                    this.pc.setRemoteDescription(new i.SessionDescription(t)), this.pc.createAnswer(function(t) {
                        o.pc.setLocalDescription(t), o.emit("answer", t), n && n(null, t)
                    }, function(t) {
                        o.emit("error", t), n && n(t)
                    }, e)
                }, n.prototype.answer = function(t, e, n) {
                    var o = 3 === arguments.length,
                        i = o ? n : e,
                        r = o ? e : {
                            mandatory: {
                                OfferToReceiveAudio: !0,
                                OfferToReceiveVideo: !0
                            }
                        };
                    this._answer(t, r, i)
                }, n.prototype.handleAnswer = function(t) {
                    this.pc.setRemoteDescription(new i.SessionDescription(t))
                }, n.prototype.close = function() {
                    this.pc.close(), this.emit("close")
                }, e.exports = n
            }, {
                wildemitter: 7,
                webrtcsupport: 2
            }
        ]
    }, {}, [1])(1)
});
var io = "undefined" == typeof module ? {} : module.exports;
! function() {
    ! function(t, e) {
        var n = t;
        n.version = "0.9.11", n.protocol = 1, n.transports = [], n.j = [], n.sockets = {}, n.connect = function(t, o) {
            var i, r, s = n.util.parseUri(t);
            e && e.location && (s.protocol = s.protocol || e.location.protocol.slice(0, -1), s.host = s.host || (e.document ? e.document.domain : e.location.hostname), s.port = s.port || e.location.port), i = n.util.uniqueUri(s);
            var a = {
                host: s.host,
                secure: "https" == s.protocol,
                port: s.port || ("https" == s.protocol ? 443 : 80),
                query: s.query || ""
            };
            return n.util.merge(a, o), (a["force new connection"] || !n.sockets[i]) && (r = new n.Socket(a)), !a["force new connection"] && r && (n.sockets[i] = r), r = r || n.sockets[i], r.of(s.path.length > 1 ? s.path : "")
        }
    }("object" == typeof module ? module.exports : this.io = {}, this),

    function(t, e) {
        var n = t.util = {}, o = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
            i = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
        n.parseUri = function(t) {
            for (var e = o.exec(t || ""), n = {}, r = 14; r--;) n[i[r]] = e[r] || "";
            return n
        }, n.uniqueUri = function(t) {
            var n = t.protocol,
                o = t.host,
                i = t.port;
            return "document" in e ? (o = o || document.domain, i = i || ("https" == n && "https:" !== document.location.protocol ? 443 : document.location.port)) : (o = o || "localhost", i || "https" != n || (i = 443)), (n || "http") + "://" + o + ":" + (i || 80)
        }, n.query = function(t, e) {
            var o = n.chunkQuery(t || ""),
                i = [];
            n.merge(o, n.chunkQuery(e || ""));
            for (var r in o) o.hasOwnProperty(r) && i.push(r + "=" + o[r]);
            return i.length ? "?" + i.join("&") : ""
        }, n.chunkQuery = function(t) {
            for (var e, n = {}, o = t.split("&"), i = 0, r = o.length; r > i; ++i) e = o[i].split("="), e[0] && (n[e[0]] = e[1]);
            return n
        };
        var r = !1;
        n.load = function(t) {
            return "document" in e && "complete" === document.readyState || r ? t() : (n.on(e, "load", t, !1), void 0)
        }, n.on = function(t, e, n, o) {
            t.attachEvent ? t.attachEvent("on" + e, n) : t.addEventListener && t.addEventListener(e, n, o)
        }, n.request = function(t) {
            if (t && "undefined" != typeof XDomainRequest && !n.ua.hasCORS) return new XDomainRequest;
            if ("undefined" != typeof XMLHttpRequest && (!t || n.ua.hasCORS)) return new XMLHttpRequest;
            if (!t) try {
                return new(window[["Active"].concat("Object").join("X")])("Microsoft.XMLHTTP")
            } catch (e) {}
            return null
        }, "undefined" != typeof window && n.load(function() {
            r = !0
        }), n.defer = function(t) {
            return n.ua.webkit && "undefined" == typeof importScripts ? (n.load(function() {
                setTimeout(t, 100)
            }), void 0) : t()
        }, n.merge = function(t, e, o, i) {
            var r, s = i || [],
                a = "undefined" == typeof o ? 2 : o;
            for (r in e) e.hasOwnProperty(r) && n.indexOf(s, r) < 0 && ("object" == typeof t[r] && a ? n.merge(t[r], e[r], a - 1, s) : (t[r] = e[r], s.push(e[r])));
            return t
        }, n.mixin = function(t, e) {
            n.merge(t.prototype, e.prototype)
        }, n.inherit = function(t, e) {
            function n() {}
            n.prototype = e.prototype, t.prototype = new n
        }, n.isArray = Array.isArray || function(t) {
            return "[object Array]" === Object.prototype.toString.call(t)
        }, n.intersect = function(t, e) {
            for (var o = [], i = t.length > e.length ? t : e, r = t.length > e.length ? e : t, s = 0, a = r.length; a > s; s++)~ n.indexOf(i, r[s]) && o.push(r[s]);
            return o
        }, n.indexOf = function(t, e, n) {
            for (var o = t.length, n = 0 > n ? 0 > n + o ? 0 : n + o : n || 0; o > n && t[n] !== e; n++);
            return n >= o ? -1 : n
        }, n.toArray = function(t) {
            for (var e = [], n = 0, o = t.length; o > n; n++) e.push(t[n]);
            return e
        }, n.ua = {}, n.ua.hasCORS = "undefined" != typeof XMLHttpRequest && function() {
            try {
                var t = new XMLHttpRequest
            } catch (e) {
                return !1
            }
            return void 0 != t.withCredentials
        }(), n.ua.webkit = "undefined" != typeof navigator && /webkit/i.test(navigator.userAgent), n.ua.iDevice = "undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)
    }("undefined" != typeof io ? io : module.exports, this),

    function(t, e) {
        function n() {}
        t.EventEmitter = n, n.prototype.on = function(t, n) {
            return this.$events || (this.$events = {}), this.$events[t] ? e.util.isArray(this.$events[t]) ? this.$events[t].push(n) : this.$events[t] = [this.$events[t], n] : this.$events[t] = n, this
        }, n.prototype.addListener = n.prototype.on, n.prototype.once = function(t, e) {
            function n() {
                o.removeListener(t, n), e.apply(this, arguments)
            }
            var o = this;
            return n.listener = e, this.on(t, n), this
        }, n.prototype.removeListener = function(t, n) {
            if (this.$events && this.$events[t]) {
                var o = this.$events[t];
                if (e.util.isArray(o)) {
                    for (var i = -1, r = 0, s = o.length; s > r; r++)
                        if (o[r] === n || o[r].listener && o[r].listener === n) {
                            i = r;
                            break
                        }
                    if (0 > i) return this;
                    o.splice(i, 1), o.length || delete this.$events[t]
                } else(o === n || o.listener && o.listener === n) && delete this.$events[t]
            }
            return this
        }, n.prototype.removeAllListeners = function(t) {
            return void 0 === t ? (this.$events = {}, this) : (this.$events && this.$events[t] && (this.$events[t] = null), this)
        }, n.prototype.listeners = function(t) {
            return this.$events || (this.$events = {}), this.$events[t] || (this.$events[t] = []), e.util.isArray(this.$events[t]) || (this.$events[t] = [this.$events[t]]), this.$events[t]
        }, n.prototype.emit = function(t) {
            if (!this.$events) return !1;
            var n = this.$events[t];
            if (!n) return !1;
            var o = Array.prototype.slice.call(arguments, 1);
            if ("function" == typeof n) n.apply(this, o);
            else {
                if (!e.util.isArray(n)) return !1;
                for (var i = n.slice(), r = 0, s = i.length; s > r; r++) i[r].apply(this, o)
            }
            return !0
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),

    function(exports, nativeJSON) {
        "use strict";

        function f(t) {
            return 10 > t ? "0" + t : t
        }

        function date(t) {
            return isFinite(t.valueOf()) ? t.getUTCFullYear() + "-" + f(t.getUTCMonth() + 1) + "-" + f(t.getUTCDate()) + "T" + f(t.getUTCHours()) + ":" + f(t.getUTCMinutes()) + ":" + f(t.getUTCSeconds()) + "Z" : null
        }

        function quote(t) {
            return escapable.lastIndex = 0, escapable.test(t) ? '"' + t.replace(escapable, function(t) {
                var e = meta[t];
                return "string" == typeof e ? e : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
            }) + '"' : '"' + t + '"'
        }

        function str(t, e) {
            var n, o, i, r, s, a = gap,
                c = e[t];
            switch (c instanceof Date && (c = date(t)), "function" == typeof rep && (c = rep.call(e, t, c)), typeof c) {
                case "string":
                    return quote(c);
                case "number":
                    return isFinite(c) ? String(c) : "null";
                case "boolean":
                case "null":
                    return String(c);
                case "object":
                    if (!c) return "null";
                    if (gap += indent, s = [], "[object Array]" === Object.prototype.toString.apply(c)) {
                        for (r = c.length, n = 0; r > n; n += 1) s[n] = str(n, c) || "null";
                        return i = 0 === s.length ? "[]" : gap ? "[\n" + gap + s.join(",\n" + gap) + "\n" + a + "]" : "[" + s.join(",") + "]", gap = a, i
                    }
                    if (rep && "object" == typeof rep)
                        for (r = rep.length, n = 0; r > n; n += 1) "string" == typeof rep[n] && (o = rep[n], i = str(o, c), i && s.push(quote(o) + (gap ? ": " : ":") + i));
                    else
                        for (o in c) Object.prototype.hasOwnProperty.call(c, o) && (i = str(o, c), i && s.push(quote(o) + (gap ? ": " : ":") + i));
                    return i = 0 === s.length ? "{}" : gap ? "{\n" + gap + s.join(",\n" + gap) + "\n" + a + "}" : "{" + s.join(",") + "}", gap = a, i
            }
        }
        if (nativeJSON && nativeJSON.parse) return exports.JSON = {
            parse: nativeJSON.parse,
            stringify: nativeJSON.stringify
        };
        var JSON = exports.JSON = {}, cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap, indent, meta = {
                "\b": "\\b",
                "	": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                '"': '\\"',
                "\\": "\\\\"
            }, rep;
        JSON.stringify = function(t, e, n) {
            var o;
            if (gap = "", indent = "", "number" == typeof n)
                for (o = 0; n > o; o += 1) indent += " ";
            else "string" == typeof n && (indent = n); if (rep = e, e && "function" != typeof e && ("object" != typeof e || "number" != typeof e.length)) throw new Error("JSON.stringify");
            return str("", {
                "": t
            })
        }, JSON.parse = function(text, reviver) {
            function walk(t, e) {
                var n, o, i = t[e];
                if (i && "object" == typeof i)
                    for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (o = walk(i, n), void 0 !== o ? i[n] = o : delete i[n]);
                return reviver.call(t, e, i)
            }
            var j;
            if (text = String(text), cx.lastIndex = 0, cx.test(text) && (text = text.replace(cx, function(t) {
                return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4)
            })), /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({
                "": j
            }, "") : j;
            throw new SyntaxError("JSON.parse")
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof JSON ? JSON : void 0),

    function(t, e) {
        var n = t.parser = {}, o = n.packets = ["disconnect", "connect", "heartbeat", "message", "json", "event", "ack", "error", "noop"],
            i = n.reasons = ["transport not supported", "client not handshaken", "unauthorized"],
            r = n.advice = ["reconnect"],
            s = e.JSON,
            a = e.util.indexOf;
        n.encodePacket = function(t) {
            var e = a(o, t.type),
                n = t.id || "",
                c = t.endpoint || "",
                p = t.ack,
                u = null;
            switch (t.type) {
                case "error":
                    var h = t.reason ? a(i, t.reason) : "",
                        d = t.advice ? a(r, t.advice) : "";
                    ("" !== h || "" !== d) && (u = h + ("" !== d ? "+" + d : ""));
                    break;
                case "message":
                    "" !== t.data && (u = t.data);
                    break;
                case "event":
                    var f = {
                        name: t.name
                    };
                    t.args && t.args.length && (f.args = t.args), u = s.stringify(f);
                    break;
                case "json":
                    u = s.stringify(t.data);
                    break;
                case "connect":
                    t.qs && (u = t.qs);
                    break;
                case "ack":
                    u = t.ackId + (t.args && t.args.length ? "+" + s.stringify(t.args) : "")
            }
            var l = [e, n + ("data" == p ? "+" : ""), c];
            return null !== u && void 0 !== u && l.push(u), l.join(":")
        }, n.encodePayload = function(t) {
            var e = "";
            if (1 == t.length) return t[0];
            for (var n = 0, o = t.length; o > n; n++) {
                var i = t[n];
                e += "�" + i.length + "�" + t[n]
            }
            return e
        };
        var c = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
        n.decodePacket = function(t) {
            var e = t.match(c);
            if (!e) return {};
            var n = e[2] || "",
                t = e[5] || "",
                a = {
                    type: o[e[1]],
                    endpoint: e[4] || ""
                };
            switch (n && (a.id = n, a.ack = e[3] ? "data" : !0), a.type) {
                case "error":
                    var e = t.split("+");
                    a.reason = i[e[0]] || "", a.advice = r[e[1]] || "";
                    break;
                case "message":
                    a.data = t || "";
                    break;
                case "event":
                    try {
                        var p = s.parse(t);
                        a.name = p.name, a.args = p.args
                    } catch (u) {}
                    a.args = a.args || [];
                    break;
                case "json":
                    try {
                        a.data = s.parse(t)
                    } catch (u) {}
                    break;
                case "connect":
                    a.qs = t || "";
                    break;
                case "ack":
                    var e = t.match(/^([0-9]+)(\+)?(.*)/);
                    if (e && (a.ackId = e[1], a.args = [], e[3])) try {
                        a.args = e[3] ? s.parse(e[3]) : []
                    } catch (u) {}
                    break;
                case "disconnect":
                case "heartbeat":
            }
            return a
        }, n.decodePayload = function(t) {
            if ("�" == t.charAt(0)) {
                for (var e = [], o = 1, i = ""; o < t.length; o++) "�" == t.charAt(o) ? (e.push(n.decodePacket(t.substr(o + 1).substr(0, i))), o += Number(i) + 1, i = "") : i += t.charAt(o);
                return e
            }
            return [n.decodePacket(t)]
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),

    function(t, e) {
        function n(t, e) {
            this.socket = t, this.sessid = e
        }
        t.Transport = n, e.util.mixin(n, e.EventEmitter), n.prototype.heartbeats = function() {
            return !0
        }, n.prototype.onData = function(t) {
            if (this.clearCloseTimeout(), (this.socket.connected || this.socket.connecting || this.socket.reconnecting) && this.setCloseTimeout(), "" !== t) {
                var n = e.parser.decodePayload(t);
                if (n && n.length)
                    for (var o = 0, i = n.length; i > o; o++) this.onPacket(n[o])
            }
            return this
        }, n.prototype.onPacket = function(t) {
            return this.socket.setHeartbeatTimeout(), "heartbeat" == t.type ? this.onHeartbeat() : ("connect" == t.type && "" == t.endpoint && this.onConnect(), "error" == t.type && "reconnect" == t.advice && (this.isOpen = !1), this.socket.onPacket(t), this)
        }, n.prototype.setCloseTimeout = function() {
            if (!this.closeTimeout) {
                var t = this;
                this.closeTimeout = setTimeout(function() {
                    t.onDisconnect()
                }, this.socket.closeTimeout)
            }
        }, n.prototype.onDisconnect = function() {
            return this.isOpen && this.close(), this.clearTimeouts(), this.socket.onDisconnect(), this
        }, n.prototype.onConnect = function() {
            return this.socket.onConnect(), this
        }, n.prototype.clearCloseTimeout = function() {
            this.closeTimeout && (clearTimeout(this.closeTimeout), this.closeTimeout = null)
        }, n.prototype.clearTimeouts = function() {
            this.clearCloseTimeout(), this.reopenTimeout && clearTimeout(this.reopenTimeout)
        }, n.prototype.packet = function(t) {
            this.send(e.parser.encodePacket(t))
        }, n.prototype.onHeartbeat = function() {
            this.packet({
                type: "heartbeat"
            })
        }, n.prototype.onOpen = function() {
            this.isOpen = !0, this.clearCloseTimeout(), this.socket.onOpen()
        }, n.prototype.onClose = function() {
            this.isOpen = !1, this.socket.onClose(), this.onDisconnect()
        }, n.prototype.prepareUrl = function() {
            var t = this.socket.options;
            return this.scheme() + "://" + t.host + ":" + t.port + "/" + t.resource + "/" + e.protocol + "/" + this.name + "/" + this.sessid
        }, n.prototype.ready = function(t, e) {
            e.call(this)
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),

    function(t, e, n) {
        function o(t) {
            if (this.options = {
                port: 80,
                secure: !1,
                document: "document" in n ? document : !1,
                resource: "socket.io",
                transports: e.transports,
                "connect timeout": 1e4,
                "try multiple transports": !0,
                reconnect: !0,
                "reconnection delay": 500,
                "reconnection limit": 1 / 0,
                "reopen delay": 3e3,
                "max reconnection attempts": 10,
                "sync disconnect on unload": !1,
                "auto connect": !0,
                "flash policy port": 10843,
                manualFlush: !1
            }, e.util.merge(this.options, t), this.connected = !1, this.open = !1, this.connecting = !1, this.reconnecting = !1, this.namespaces = {}, this.buffer = [], this.doBuffer = !1, this.options["sync disconnect on unload"] && (!this.isXDomain() || e.util.ua.hasCORS)) {
                var o = this;
                e.util.on(n, "beforeunload", function() {
                    o.disconnectSync()
                }, !1)
            }
            this.options["auto connect"] && this.connect()
        }

        function i() {}
        t.Socket = o, e.util.mixin(o, e.EventEmitter), o.prototype.of = function(t) {
            return this.namespaces[t] || (this.namespaces[t] = new e.SocketNamespace(this, t), "" !== t && this.namespaces[t].packet({
                type: "connect"
            })), this.namespaces[t]
        }, o.prototype.publish = function() {
            this.emit.apply(this, arguments);
            var t;
            for (var e in this.namespaces) this.namespaces.hasOwnProperty(e) && (t = this.of(e), t.$emit.apply(t, arguments))
        }, o.prototype.handshake = function(t) {
            function n(e) {
                e instanceof Error ? (o.connecting = !1, o.onError(e.message)) : t.apply(null, e.split(":"))
            }
            var o = this,
                r = this.options,
                s = ["http" + (r.secure ? "s" : "") + ":/", r.host + ":" + r.port, r.resource, e.protocol, e.util.query(this.options.query, "t=" + +new Date)].join("/");
            if (this.isXDomain() && !e.util.ua.hasCORS) {
                var a = document.getElementsByTagName("script")[0],
                    c = document.createElement("script");
                c.src = s + "&jsonp=" + e.j.length, a.parentNode.insertBefore(c, a), e.j.push(function(t) {
                    n(t), c.parentNode.removeChild(c)
                })
            } else {
                var p = e.util.request();
                p.open("GET", s, !0), this.isXDomain() && (p.withCredentials = !0), p.onreadystatechange = function() {
                    4 == p.readyState && (p.onreadystatechange = i, 200 == p.status ? n(p.responseText) : 403 == p.status ? o.onError(p.responseText) : (o.connecting = !1, !o.reconnecting && o.onError(p.responseText)))
                }, p.send(null)
            }
        }, o.prototype.getTransport = function(t) {
            for (var n, o = t || this.transports, i = 0; n = o[i]; i++)
                if (e.Transport[n] && e.Transport[n].check(this) && (!this.isXDomain() || e.Transport[n].xdomainCheck(this))) return new e.Transport[n](this, this.sessionid);
            return null
        }, o.prototype.connect = function(t) {
            if (this.connecting) return this;
            var n = this;
            return n.connecting = !0, this.handshake(function(o, i, r, s) {
                function a(t) {
                    return n.transport && n.transport.clearTimeouts(), n.transport = n.getTransport(t), n.transport ? (n.transport.ready(n, function() {
                        n.connecting = !0, n.publish("connecting", n.transport.name), n.transport.open(), n.options["connect timeout"] && (n.connectTimeoutTimer = setTimeout(function() {
                            if (!n.connected && (n.connecting = !1, n.options["try multiple transports"])) {
                                for (var t = n.transports; t.length > 0 && t.splice(0, 1)[0] != n.transport.name;);
                                t.length ? a(t) : n.publish("connect_failed")
                            }
                        }, n.options["connect timeout"]))
                    }), void 0) : n.publish("connect_failed")
                }
                n.sessionid = o, n.closeTimeout = 1e3 * r, n.heartbeatTimeout = 1e3 * i, n.transports || (n.transports = n.origTransports = s ? e.util.intersect(s.split(","), n.options.transports) : n.options.transports), n.setHeartbeatTimeout(), a(n.transports), n.once("connect", function() {
                    clearTimeout(n.connectTimeoutTimer), t && "function" == typeof t && t()
                })
            }), this
        }, o.prototype.setHeartbeatTimeout = function() {
            if (clearTimeout(this.heartbeatTimeoutTimer), !this.transport || this.transport.heartbeats()) {
                var t = this;
                this.heartbeatTimeoutTimer = setTimeout(function() {
                    t.transport.onClose()
                }, this.heartbeatTimeout)
            }
        }, o.prototype.packet = function(t) {
            return this.connected && !this.doBuffer ? this.transport.packet(t) : this.buffer.push(t), this
        }, o.prototype.setBuffer = function(t) {
            this.doBuffer = t, !t && this.connected && this.buffer.length && (this.options.manualFlush || this.flushBuffer())
        }, o.prototype.flushBuffer = function() {
            this.transport.payload(this.buffer), this.buffer = []
        }, o.prototype.disconnect = function() {
            return (this.connected || this.connecting) && (this.open && this.of("").packet({
                type: "disconnect"
            }), this.onDisconnect("booted")), this
        }, o.prototype.disconnectSync = function() {
            var t = e.util.request(),
                n = ["http" + (this.options.secure ? "s" : "") + ":/", this.options.host + ":" + this.options.port, this.options.resource, e.protocol, "", this.sessionid].join("/") + "/?disconnect=1";
            t.open("GET", n, !1), t.send(null), this.onDisconnect("booted")
        }, o.prototype.isXDomain = function() {
            var t = n.location.port || ("https:" == n.location.protocol ? 443 : 80);
            return this.options.host !== n.location.hostname || this.options.port != t
        }, o.prototype.onConnect = function() {
            this.connected || (this.connected = !0, this.connecting = !1, this.doBuffer || this.setBuffer(!1), this.emit("connect"))
        }, o.prototype.onOpen = function() {
            this.open = !0
        }, o.prototype.onClose = function() {
            this.open = !1, clearTimeout(this.heartbeatTimeoutTimer)
        }, o.prototype.onPacket = function(t) {
            this.of(t.endpoint).onPacket(t)
        }, o.prototype.onError = function(t) {
            t && t.advice && "reconnect" === t.advice && (this.connected || this.connecting) && (this.disconnect(), this.options.reconnect && this.reconnect()), this.publish("error", t && t.reason ? t.reason : t)
        }, o.prototype.onDisconnect = function(t) {
            var e = this.connected,
                n = this.connecting;
            this.connected = !1, this.connecting = !1, this.open = !1, (e || n) && (this.transport.close(), this.transport.clearTimeouts(), e && (this.publish("disconnect", t), "booted" != t && this.options.reconnect && !this.reconnecting && this.reconnect()))
        }, o.prototype.reconnect = function() {
            function t() {
                if (n.connected) {
                    for (var t in n.namespaces) n.namespaces.hasOwnProperty(t) && "" !== t && n.namespaces[t].packet({
                        type: "connect"
                    });
                    n.publish("reconnect", n.transport.name, n.reconnectionAttempts)
                }
                clearTimeout(n.reconnectionTimer), n.removeListener("connect_failed", e), n.removeListener("connect", e), n.reconnecting = !1, delete n.reconnectionAttempts, delete n.reconnectionDelay, delete n.reconnectionTimer, delete n.redoTransports, n.options["try multiple transports"] = i
            }

            function e() {
                return n.reconnecting ? n.connected ? t() : n.connecting && n.reconnecting ? n.reconnectionTimer = setTimeout(e, 1e3) : (n.reconnectionAttempts++ >= o ? n.redoTransports ? (n.publish("reconnect_failed"), t()) : (n.on("connect_failed", e), n.options["try multiple transports"] = !0, n.transports = n.origTransports, n.transport = n.getTransport(), n.redoTransports = !0, n.connect()) : (n.reconnectionDelay < r && (n.reconnectionDelay *= 2), n.connect(), n.publish("reconnecting", n.reconnectionDelay, n.reconnectionAttempts), n.reconnectionTimer = setTimeout(e, n.reconnectionDelay)), void 0) : void 0
            }
            this.reconnecting = !0, this.reconnectionAttempts = 0, this.reconnectionDelay = this.options["reconnection delay"];
            var n = this,
                o = this.options["max reconnection attempts"],
                i = this.options["try multiple transports"],
                r = this.options["reconnection limit"];
            this.options["try multiple transports"] = !1, this.reconnectionTimer = setTimeout(e, this.reconnectionDelay), this.on("connect", e)
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),

    function(t, e) {
        function n(t, e) {
            this.socket = t, this.name = e || "", this.flags = {}, this.json = new o(this, "json"), this.ackPackets = 0, this.acks = {}
        }

        function o(t, e) {
            this.namespace = t, this.name = e
        }
        t.SocketNamespace = n, e.util.mixin(n, e.EventEmitter), n.prototype.$emit = e.EventEmitter.prototype.emit, n.prototype.of = function() {
            return this.socket.of.apply(this.socket, arguments)
        }, n.prototype.packet = function(t) {
            return t.endpoint = this.name, this.socket.packet(t), this.flags = {}, this
        }, n.prototype.send = function(t, e) {
            var n = {
                type: this.flags.json ? "json" : "message",
                data: t
            };
            return "function" == typeof e && (n.id = ++this.ackPackets, n.ack = !0, this.acks[n.id] = e), this.packet(n)
        }, n.prototype.emit = function(t) {
            var e = Array.prototype.slice.call(arguments, 1),
                n = e[e.length - 1],
                o = {
                    type: "event",
                    name: t
                };
            return "function" == typeof n && (o.id = ++this.ackPackets, o.ack = "data", this.acks[o.id] = n, e = e.slice(0, e.length - 1)), o.args = e, this.packet(o)
        }, n.prototype.disconnect = function() {
            return "" === this.name ? this.socket.disconnect() : (this.packet({
                type: "disconnect"
            }), this.$emit("disconnect")), this
        }, n.prototype.onPacket = function(t) {
            function n() {
                o.packet({
                    type: "ack",
                    args: e.util.toArray(arguments),
                    ackId: t.id
                })
            }
            var o = this;
            switch (t.type) {
                case "connect":
                    this.$emit("connect");
                    break;
                case "disconnect":
                    "" === this.name ? this.socket.onDisconnect(t.reason || "booted") : this.$emit("disconnect", t.reason);
                    break;
                case "message":
                case "json":
                    var i = ["message", t.data];
                    "data" == t.ack ? i.push(n) : t.ack && this.packet({
                        type: "ack",
                        ackId: t.id
                    }), this.$emit.apply(this, i);
                    break;
                case "event":
                    var i = [t.name].concat(t.args);
                    "data" == t.ack && i.push(n), this.$emit.apply(this, i);
                    break;
                case "ack":
                    this.acks[t.ackId] && (this.acks[t.ackId].apply(this, t.args), delete this.acks[t.ackId]);
                    break;
                case "error":
                    t.advice ? this.socket.onError(t) : "unauthorized" == t.reason ? this.$emit("connect_failed", t.reason) : this.$emit("error", t.reason)
            }
        }, o.prototype.send = function() {
            this.namespace.flags[this.name] = !0, this.namespace.send.apply(this.namespace, arguments)
        }, o.prototype.emit = function() {
            this.namespace.flags[this.name] = !0, this.namespace.emit.apply(this.namespace, arguments)
        }
    }("undefined" != typeof io ? io : module.exports, "undefined" != typeof io ? io : module.parent.exports),

    function(t, e, n) {
        function o() {
            e.Transport.apply(this, arguments)
        }
        t.websocket = o, e.util.inherit(o, e.Transport), o.prototype.name = "websocket", o.prototype.open = function() {
            var t, o = e.util.query(this.socket.options.query),
                i = this;
            return t || (t = n.MozWebSocket || n.WebSocket), this.websocket = new t(this.prepareUrl() + o), this.websocket.onopen = function() {
                i.onOpen(), i.socket.setBuffer(!1)
            }, this.websocket.onmessage = function(t) {
                i.onData(t.data)
            }, this.websocket.onclose = function() {
                i.onClose(), i.socket.setBuffer(!0)
            }, this.websocket.onerror = function(t) {
                i.onError(t)
            }, this
        }, o.prototype.send = e.util.ua.iDevice ? function(t) {
            var e = this;
            return setTimeout(function() {
                e.websocket.send(t)
            }, 0), this
        } : function(t) {
            return this.websocket.send(t), this
        }, o.prototype.payload = function(t) {
            for (var e = 0, n = t.length; n > e; e++) this.packet(t[e]);
            return this
        }, o.prototype.close = function() {
            return this.websocket.close(), this
        }, o.prototype.onError = function(t) {
            this.socket.onError(t)
        }, o.prototype.scheme = function() {
            return this.socket.options.secure ? "wss" : "ws"
        }, o.check = function() {
            return "WebSocket" in n && !("__addTask" in WebSocket) || "MozWebSocket" in n
        }, o.xdomainCheck = function() {
            return !0
        }, e.transports.push("websocket")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),

    function(t, e, n) {
        function o(t) {
            t && (e.Transport.apply(this, arguments), this.sendBuffer = [])
        }

        function i() {}
        t.XHR = o, e.util.inherit(o, e.Transport), o.prototype.open = function() {
            return this.socket.setBuffer(!1), this.onOpen(), this.get(), this.setCloseTimeout(), this
        }, o.prototype.payload = function(t) {
            for (var n = [], o = 0, i = t.length; i > o; o++) n.push(e.parser.encodePacket(t[o]));
            this.send(e.parser.encodePayload(n))
        }, o.prototype.send = function(t) {
            return this.post(t), this
        }, o.prototype.post = function(t) {
            function e() {
                4 == this.readyState && (this.onreadystatechange = i, r.posting = !1, 200 == this.status ? r.socket.setBuffer(!1) : r.onClose())
            }

            function o() {
                this.onload = i, r.socket.setBuffer(!1)
            }
            var r = this;
            this.socket.setBuffer(!0), this.sendXHR = this.request("POST"), n.XDomainRequest && this.sendXHR instanceof XDomainRequest ? this.sendXHR.onload = this.sendXHR.onerror = o : this.sendXHR.onreadystatechange = e, this.sendXHR.send(t)
        }, o.prototype.close = function() {
            return this.onClose(), this
        }, o.prototype.request = function(t) {
            var n = e.util.request(this.socket.isXDomain()),
                o = e.util.query(this.socket.options.query, "t=" + +new Date);
            if (n.open(t || "GET", this.prepareUrl() + o, !0), "POST" == t) try {
                n.setRequestHeader ? n.setRequestHeader("Content-type", "text/plain;charset=UTF-8") : n.contentType = "text/plain"
            } catch (i) {}
            return n
        }, o.prototype.scheme = function() {
            return this.socket.options.secure ? "https" : "http"
        }, o.check = function(t, o) {
            try {
                var i = e.util.request(o),
                    r = n.XDomainRequest && i instanceof XDomainRequest,
                    s = t && t.options && t.options.secure ? "https:" : "http:",
                    a = n.location && s != n.location.protocol;
                if (i && (!r || !a)) return !0
            } catch (c) {}
            return !1
        }, o.xdomainCheck = function(t) {
            return o.check(t, !0)
        }
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),

    function(t, e) {
        function n() {
            e.Transport.XHR.apply(this, arguments)
        }
        t.htmlfile = n, e.util.inherit(n, e.Transport.XHR), n.prototype.name = "htmlfile", n.prototype.get = function() {
            this.doc = new(window[["Active"].concat("Object").join("X")])("htmlfile"), this.doc.open(), this.doc.write("<html></html>"), this.doc.close(), this.doc.parentWindow.s = this;
            var t = this.doc.createElement("div");
            t.className = "socketio", this.doc.body.appendChild(t), this.iframe = this.doc.createElement("iframe"), t.appendChild(this.iframe);
            var n = this,
                o = e.util.query(this.socket.options.query, "t=" + +new Date);
            this.iframe.src = this.prepareUrl() + o, e.util.on(window, "unload", function() {
                n.destroy()
            })
        }, n.prototype._ = function(t, e) {
            this.onData(t);
            try {
                var n = e.getElementsByTagName("script")[0];
                n.parentNode.removeChild(n)
            } catch (o) {}
        }, n.prototype.destroy = function() {
            if (this.iframe) {
                try {
                    this.iframe.src = "about:blank"
                } catch (t) {}
                this.doc = null, this.iframe.parentNode.removeChild(this.iframe), this.iframe = null, CollectGarbage()
            }
        }, n.prototype.close = function() {
            return this.destroy(), e.Transport.XHR.prototype.close.call(this)
        }, n.check = function(t) {
            if ("undefined" != typeof window && ["Active"].concat("Object").join("X") in window) try {
                var n = new(window[["Active"].concat("Object").join("X")])("htmlfile");
                return n && e.Transport.XHR.check(t)
            } catch (o) {}
            return !1
        }, n.xdomainCheck = function() {
            return !1
        }, e.transports.push("htmlfile")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports),

    function(t, e, n) {
        function o() {
            e.Transport.XHR.apply(this, arguments)
        }

        function i() {}
        t["xhr-polling"] = o, e.util.inherit(o, e.Transport.XHR), e.util.merge(o, e.Transport.XHR), o.prototype.name = "xhr-polling", o.prototype.heartbeats = function() {
            return !1
        }, o.prototype.open = function() {
            var t = this;
            return e.Transport.XHR.prototype.open.call(t), !1
        }, o.prototype.get = function() {
            function t() {
                4 == this.readyState && (this.onreadystatechange = i, 200 == this.status ? (r.onData(this.responseText), r.get()) : r.onClose())
            }

            function e() {
                this.onload = i, this.onerror = i, r.retryCounter = 1, r.onData(this.responseText), r.get()
            }

            function o() {
                r.retryCounter++, !r.retryCounter || r.retryCounter > 3 ? r.onClose() : r.get()
            }
            if (this.isOpen) {
                var r = this;
                this.xhr = this.request(), n.XDomainRequest && this.xhr instanceof XDomainRequest ? (this.xhr.onload = e, this.xhr.onerror = o) : this.xhr.onreadystatechange = t, this.xhr.send(null)
            }
        }, o.prototype.onClose = function() {
            if (e.Transport.XHR.prototype.onClose.call(this), this.xhr) {
                this.xhr.onreadystatechange = this.xhr.onload = this.xhr.onerror = i;
                try {
                    this.xhr.abort()
                } catch (t) {}
                this.xhr = null
            }
        }, o.prototype.ready = function(t, n) {
            var o = this;
            e.util.defer(function() {
                n.call(o)
            })
        }, e.transports.push("xhr-polling")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this),

    function(t, e, n) {
        function o() {
            e.Transport["xhr-polling"].apply(this, arguments), this.index = e.j.length;
            var t = this;
            e.j.push(function(e) {
                t._(e)
            })
        }
        var i = n.document && "MozAppearance" in n.document.documentElement.style;
        t["jsonp-polling"] = o, e.util.inherit(o, e.Transport["xhr-polling"]), o.prototype.name = "jsonp-polling", o.prototype.post = function(t) {
            function n() {
                o(), i.socket.setBuffer(!1)
            }

            function o() {
                i.iframe && i.form.removeChild(i.iframe);
                try {
                    s = document.createElement('<iframe name="' + i.iframeId + '">')
                } catch (t) {
                    s = document.createElement("iframe"), s.name = i.iframeId
                }
                s.id = i.iframeId, i.form.appendChild(s), i.iframe = s
            }
            var i = this,
                r = e.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
            if (!this.form) {
                var s, a = document.createElement("form"),
                    c = document.createElement("textarea"),
                    p = this.iframeId = "socketio_iframe_" + this.index;
                a.className = "socketio", a.style.position = "absolute", a.style.top = "0px", a.style.left = "0px", a.style.display = "none", a.target = p, a.method = "POST", a.setAttribute("accept-charset", "utf-8"), c.name = "d", a.appendChild(c), document.body.appendChild(a), this.form = a, this.area = c
            }
            this.form.action = this.prepareUrl() + r, o(), this.area.value = e.JSON.stringify(t);
            try {
                this.form.submit()
            } catch (u) {}
            this.iframe.attachEvent ? s.onreadystatechange = function() {
                "complete" == i.iframe.readyState && n()
            } : this.iframe.onload = n, this.socket.setBuffer(!0)
        }, o.prototype.get = function() {
            var t = this,
                n = document.createElement("script"),
                o = e.util.query(this.socket.options.query, "t=" + +new Date + "&i=" + this.index);
            this.script && (this.script.parentNode.removeChild(this.script), this.script = null), n.async = !0, n.src = this.prepareUrl() + o, n.onerror = function() {
                t.onClose()
            };
            var r = document.getElementsByTagName("script")[0];
            r.parentNode.insertBefore(n, r), this.script = n, i && setTimeout(function() {
                var t = document.createElement("iframe");
                document.body.appendChild(t), document.body.removeChild(t)
            }, 100)
        }, o.prototype._ = function(t) {
            return this.onData(t), this.isOpen && this.get(), this
        }, o.prototype.ready = function(t, n) {
            var o = this;
            return i ? (e.util.load(function() {
                n.call(o)
            }), void 0) : n.call(this)
        }, o.check = function() {
            return "document" in n
        }, o.xdomainCheck = function() {
            return !0
        }, e.transports.push("jsonp-polling")
    }("undefined" != typeof io ? io.Transport : module.exports, "undefined" != typeof io ? io : module.parent.exports, this), "function" == typeof define && define.amd && define([], function() {
        return io
    })
}();
