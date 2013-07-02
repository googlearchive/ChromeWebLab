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
import config
from support.handlers import JSONResponseRPCHandler

#####################################################################
#
# This is the basis for most HTTP handlers in the system
#

class DefaultHandler(JSONResponseRPCHandler):
    """ The base for most handlers in the system
    """
    _enable_help = config.HTTP_HELP
    _raise_exceptions = config.HTTP_RAISE_EXCEPTIONS_IN_REQUESTS
    
    cors_allow_patterns = [
        r"*",
    ]
