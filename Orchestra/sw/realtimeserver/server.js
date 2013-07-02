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
