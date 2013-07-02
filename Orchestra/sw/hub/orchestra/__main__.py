#!/usr/bin/python

# 
#  Orchestra
# 
#  Receive and confirm messages from realtime (WebSockets) server;
#  send messages to Max to drive robots
#  
#  See README.
# 

#    Copyright 2013 Google Inc
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

from twisted.application import internet, service
import messenger
import sequencer
from config import config

# init twistd (n.b. var MUST be called 'application'!)
# 
application = service.Application('orchestra')
app_services = service.IServiceCollection(application)

# init WebSockets service (primary + secondary)
# 
messenger.service(config['messenger']['host']).setServiceParent(app_services)

# init OSC services (server + client)
# 
sequencer.server_service(config['osc']['rx_port']).setServiceParent(app_services)
sequencer.client_service(('127.0.0.1', config['osc']['tx_port'])).setServiceParent(app_services)
