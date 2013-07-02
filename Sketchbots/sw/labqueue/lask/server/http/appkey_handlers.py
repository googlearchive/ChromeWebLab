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
from lask.core.model import *
from lask.server.http.default_handler import DefaultHandler

#####################################################################
#
# These handlers are used to work with queue API keys
#

class AppKeyTestHandler(DefaultHandler):
    """ Simply returns True if the request was properly signed.
    """
    _GET_method = None
    _POST_method = None
    def target(self, *args, **kwargs):
        return True
    def special_post(self, *args, **kwargs):
        self.special_get()
    def special_get(self, *args, **kwargs):
        self.respond(self._is_authorized_request, self.__class__.__name__)

class AppKeyGeneratorHandler(DefaultHandler):
    """ Simple handler to allow authorized users to generate new app keys
    """
    _GET_method = 'generate'
    _POST_method = None
    def target(self, *args, **kwargs):
        creds = UserCredentials.get_current()
        if creds.can_create_app_keys:
            return AppCredentials.generate()
        return None
