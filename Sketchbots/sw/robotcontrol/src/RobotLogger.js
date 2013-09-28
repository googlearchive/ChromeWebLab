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
require('mootools');
var loggly = require('loggly');
var util = require('util');
var sys = require('sys');
var streamLogger = require('streamlogger');
var logger = null;
var path = require('path');
var ConfigParams = require('./ConfigParams').ConfigParams;

exports.RobotLogger = new Class({
    Implements: [Events, Options, process.EventEmitter],

    key: null,
    subdomain: null,
    workerName: null,
    logglyClient: null,
    log: null,

    options: {},

    initialize: function(options) {
        // set up the ability to log file and line numbers per http://stackoverflow.com/questions/11386492/accessing-line-number-in-v8-javascript-chrome-node-js
        Object.defineProperty(global, '__stack', {
            get: function() {
                var orig = Error.prepareStackTrace;
                Error.prepareStackTrace = function(_, stack) {
                    return stack;
                };
                var err = new Error;
                Error.captureStackTrace(err, arguments.callee);
                var stack = err.stack;
                Error.prepareStackTrace = orig;
                return stack;
            }
        });

        Object.defineProperty(global, '__line', {
            get: function() {
                return __stack[5].getLineNumber();
            }
        });

        Object.defineProperty(global, '__file_name', {
            get: function() {
                return __stack[5].getFileName();
            }
        });

        Object.defineProperty(global, '__function_name', {
            get: function() {
                var n = __stack[5].getFunctionName();
                try {
                    if (n.substr(0, 8) == 'exports.') n = n.substr(8);
                    n = n.replace('.Class.', '.');
                } catch (ex) {}
                return n;
            }
        });


        if (ConfigParams.LOG_TO_FILE) {
            logger = new streamLogger.StreamLogger(path.join(ConfigParams.LOG_PATH, (new Date()).getTime() + '.log'));
            //Defaults to info, debug messages will not be logged at info
            logger.level = logger.levels.debug;
            //Streamlogger: If you want to rotate logs, this will re-open the files on sighup
            process.addListener("SIGHUP", function() {
                logger.reopen();
            });
        } else {
            logger = null;
        }

        this.setOptions(options);
        console.log("Initializing loggly logger for " + options.workerName);
        this.workerName = options.workerName;
        var config = {
            subdomain: options.subdomain
        }
        this.logglyClient = loggly.createClient(config);
        this.key = options.key;
        this.logglyClient.log(this.key, this.workerName + ": loggly is working.");
    },

    _getFormattedDebugMessage: function(input, date) {
        var src = path.basename(__file_name) + " (" + __line + ") ";

        //pad src out to some number of spaces
        var l = 38;
        var diff = l - src.length;
        if (diff < 0) diff = 0;
        src += Array(diff).join(".");

        n = this.workerName;
        l = 16;
        if (n.length > l) n = n.substr(0, l - 3) + "...";

        var str = Array(date.getTime(), n, src, input).join(" ");
        return str;
    },

    _getFormattedLogglyMessage: function(input, date) {
        var str = date.getTime() + " " + this.workerName + ": " + input;
        return str;
    },

    _getFormattedLoggerInfoMessage: function(input, date) {
        return input;
    },

    log: function(input) {
        var date = new Date();
        util.debug(this._getFormattedDebugMessage(input, date));
        this.logglyClient.log(this.key, this._getFormattedLogglyMessage(input, date));
        if (logger != null) logger.info(this._getFormattedLoggerInfoMessage(input, date));
    },

    dir: function(input) {
        console.log(util.inspect(input, true, null));
        if (logger != null) logger.info(util.inspect(input, true, null));
    },

    inject: function(consoleToInject) {
        consoleToInject.log = this.log.bind(this);
        consoleToInject.logglyClient = this.logglyClient;
        consoleToInject.key = this.key;
        consoleToInject.workerName = this.workerName;
    }

});
