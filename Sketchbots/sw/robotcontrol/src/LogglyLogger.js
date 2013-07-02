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
var
  sys = require('sys'),
  http = require('http'),
  streamLogger = require('streamlogger');
var logger = null;


exports.LogglyLogger = new Class({
    Implements: [Events, Options, process.EventEmitter],

    options: {
    },

    initialize: function(options){
        logger = new streamLogger.StreamLogger('logs/'+(new Date()).getTime()+'.log');
        //Defaults to info, debug messages will not be logged at info
        logger.level = logger.levels.debug;
        //Streamlogger: If you want to rotate logs, this will re-open the files on sighup
        process.addListener("SIGHUP", function() {
          logger.reopen();
        });

        this.setOptions(options);
        console.log("Initializing loggly logger for "+options.workerName);
        this.workerName = options.workerName;
        var config = {
          subdomain: "tellart"
        }
        this.logglyClient = loggly.createClient(config);
        this.key = '3d85f894-5011-4a67-9ae2-778bebac49b9';
        this.logglyClient.log(this.key,this.workerName+": loggly is working.");
    },
                          
    log: function(input){
        var date = new Date();
        util.debug(date.getTime()+" "+this.workerName+": "+input);
        this.logglyClient.log(this.key,date.getTime()+" "+this.workerName+": "+input);
        logger.info(input);
    },
    
    dir: function(input){
        console.log(util.inspect(input, true, null));
        logger.info(util.inspect(input, true, null));
    },
    
    inject: function(consoleToInject){
        consoleToInject.log = this.log;
        consoleToInject.logglyClient = this.logglyClient;
        consoleToInject.key = this.key;
        consoleToInject.workerName = this.workerName;
    }
    
}); 



