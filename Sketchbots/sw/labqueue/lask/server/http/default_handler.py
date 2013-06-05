# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
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
