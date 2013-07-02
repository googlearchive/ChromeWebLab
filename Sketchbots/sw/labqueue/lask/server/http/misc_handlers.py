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
"""Part of Lask, the Web Lab Task management system.


Handlers for the LASK HTTP server.

"""

import webapp2
import time
import datetime
import calendar
from lask.core.model import *

#####################################################################
#
# Miscellaneous handlers
#

class HelloWorldHandler(webapp2.RequestHandler):
    def get(self):
        creds = UserCredentials.get_current()
        self.response.write('OK')

class TestHandler(webapp2.RequestHandler):
    def get(self):
        pass

class TimeHandler(webapp2.RequestHandler):
    __init_time_ts = None
    def __init__(self, *args, **kwargs):
        super(self.__class__, self).__init__(*args, **kwargs)
        self.__init_time_ts = time.clock()

    def options(self,*args):
        self.response.headers.add_header('Access-Control-Allow-Origin', '*')
        self.response.headers.add_header('Access-Control-Allow-Methods', 'OPTIONS, GET');
        self.response.headers.add_header('Access-Control-Allow-Headers', 'Content-Type, Depth, User-Agent, Cache-Control, Authorization');
        self.response.status_int = 200
        
    def get(self):
        now_time_ts = time.clock()
        now = datetime.datetime.utcnow()
        self.response.write('{"result":{"server_time_utc":'+str(calendar.timegm(now.timetuple()))+',"server_time_utc_human":"'+str(now)+'","runtime":'+str(now_time_ts-self.__init_time_ts)+'}}')


