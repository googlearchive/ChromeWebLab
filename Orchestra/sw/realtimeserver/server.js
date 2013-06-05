/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

var weblab = require("./weblab/main");
var orchestraServerManager = require("./weblab/orchestra/ServerManager");


var server = new weblab.Server();
var serverManager = orchestraServerManager.create(server);
//serverManager.enableDebugCalls(); //MEDEBUG

// WebSockets server
// 
server.start(8080);

serverManager.performStartRealTimeControl();

// static file server
// 
var staticFileServer = new weblab.StaticFileServer();
staticFileServer.start(8081);
