/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
/* lask client tools for node.js
 *
 * This is a private library used by
 * client.http and client.https.
 * Please use those modules instead of
 * using this one directly.
 *
 *
 */
 
var crypto = require('crypto');

var transports = [ 'http', 'https' ];

transports.forEach(function(tName) {
    exports[tName] = Object.create(require(tName));
    exports[tName].__old_get = exports[tName].get;
    exports[tName].get = function(options, callback) {
        var r = this.request(options, callback);
        r.end();
        r.transportType = this.transportType;
        return r;
    }
    exports[tName].transportType = tName;
    exports[tName].__old_request = exports[tName].request;
    exports[tName].request = function(options, callback) {
        if (!this.hasOwnProperty('app_key') || (this.app_key == null) || (this.app_key == undefined))
            throw new Error('When using the Lask client for Node, you must set '+tName+'.app_key before calling '+tName+'.get() or '+tName+'.request()');
        if (!this.hasOwnProperty('app_secret') || (this.app_secret == null) || (this.app_secret == undefined))
            throw new Error('When using the Lask client for Node, you must set '+tName+'.app_secret before calling '+tName+'.get() or '+tName+'.request()');
        if (!options.hasOwnProperty('path') || !options.path)
            throw new Error('The options parameter to get() or request() must contain a path');
        if (!options.hasOwnProperty('host') || !options.host)
            throw new Error('The options parameter to get() or request() must contain a host');
            
        if (!options.hasOwnProperty('headers'))
            options.headers = {};
        if (!options.headers.hasOwnProperty('Authorization')) {
            options.headers['Authorization'] = 'CWL '+this.app_key+':'+this.getSignature(this.app_secret, options.path);
        }
        var r = this.__old_request(options, callback);
        r.transportType = this.transportType;
        return r;
    };
    exports[tName].getSignature = function(secret, path) {
        //strip off any query string
        var qsi = path.indexOf('?');
        if (qsi >= 0) path = path.substr(0, qsi);
        hmac = crypto.createHmac('md5', secret);
        hmac.update(path);
        return hmac.digest('hex');
    };
});

