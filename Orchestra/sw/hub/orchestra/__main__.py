#!/usr/bin/python

# 
#  Orchestra
# 
#  Receive and confirm messages from realtime (WebSockets) server;
#  send messages to Max to drive robots
#  
#  See README.
# 
#  Copyright Google Inc, 2013
#  See LICENSE.TXT for licensing information.
# 

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
