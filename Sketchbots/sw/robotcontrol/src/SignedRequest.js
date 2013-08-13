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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// SignedRequest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
require('mootools');
var ConfigParams = require('./ConfigParams').ConfigParams;

exports.SignedRequest = new Class({

    Implements: [Events, Options, process.EventEmitter],

    options: {},


    initialize: function(options) {
        if (ConfigParams.LABQUEUE_USE_HTTPS)
            this.signed_client = require('./lask.client.node').https;
        else
            this.signed_client = require('./lask.client.node').http;
        this.signed_client.app_key = ConfigParams.LABQUEUE_APP_KEY;
        this.signed_client.app_secret = ConfigParams.LABQUEUE_APP_SECRET;
    },

});
