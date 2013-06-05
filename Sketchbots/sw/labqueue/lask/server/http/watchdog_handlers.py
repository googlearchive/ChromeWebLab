# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""Part of Lask, the Web Lab Task management system.


Handlers for the LASK HTTP server.

"""

import webapp2
from default_handler import DefaultHandler
from lask.services import data_watchdog_svc

#####################################################################
#
# These handlers are used by the data watchdog to do things like
# clearing out old temp data and freeing up datastore space occupied
# by deleted objects
#

class TaskWatchdogCleanTasksHandler(DefaultHandler):
    """ Allows cron to interface with the TaskWatchdog service.
    """
    _is_cron_handler=True
    _GET_method = 'clean_tasks'
    _POST_method = None
    def target(self, *args, **kwargs):
        return data_watchdog_svc.TaskWatchdog

class LabDataContainerWatchdogCullHandler(DefaultHandler):
    """ Allows cron to interface with the LabDataContainerWatchdog service.
    """
    _is_cron_handler=True
    _GET_method = 'cull'
    _POST_method = None
    def target(self, *args, **kwargs):
        return data_watchdog_svc.LabDataContainerWatchdog
