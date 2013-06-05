/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// SignedRequest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
require('mootools');
var ConfigParams = require('./ConfigParams').ConfigParams;

exports.SignedRequest = new Class({

	Implements: [Events, Options, process.EventEmitter],
	
	options: {
	},
	
	
	initialize: function(options){
		if (ConfigParams.LABQUEUE_USE_HTTPS)
			this.signed_client = require('./lask.client.node').https;
		else
			this.signed_client = require('./lask.client.node').http;
	    this.signed_client.app_key = ConfigParams.LABQUEUE_APP_KEY;
	    this.signed_client.app_secret = ConfigParams.LABQUEUE_APP_SECRET;
	},
		
});

