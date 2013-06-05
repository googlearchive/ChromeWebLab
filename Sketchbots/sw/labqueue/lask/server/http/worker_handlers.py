# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
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
