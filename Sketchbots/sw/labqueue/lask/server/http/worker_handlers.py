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
from default_handler import DefaultHandler
from lask.core.model import *

#####################################################################
#
# These handlers allow RESTful interaction with Worker objects
#

class Workers_all_status_handler(DefaultHandler):
    """ Interface to KnownWorkerStatus
    """
    _GET_method = 'get_all_status'
    _POST_method = None
    def target(self):
        return KnownWorkerStatus

class Workers_status_handler(DefaultHandler):
    """ Interface to KnownWorkerStatus.set_status
    """
    _GET_method = 'me'
    _POST_method = 'set_status'
    def target(self, *args, **kwargs):
        if 'guid' in kwargs:
            if self.request.method == 'GET' and 'HELP' not in self.request.GET:
                return KnownWorkerStatus.get_for_worker(kwargs['guid'], create_new_records=False)
            else:
                return KnownWorkerStatus.get_for_worker(kwargs['guid'], create_new_records=True)
        else:
            return None

class Workers_sys_health_handler(Workers_status_handler):
    """ Interface to KnownWorkerStatus.set_sys_health
    """
    _GET_method = 'me'
    _POST_method = 'set_sys_health'

class Workers_log_handler(Workers_status_handler):
    """ Interface to KnownWorkerStatus.set_sys_health
    """
    _GET_method = 'get_log'
    _POST_method = None
