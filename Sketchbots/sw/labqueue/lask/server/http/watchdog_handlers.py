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
