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
""" Various service objects used to work with topic/task stats


"""

import logging
import time

from google.appengine.ext import db
from support.modeling import *
import datetime
from lask.core import exception
from lask import core

RECENT_COUNT_THRESHOLD_SEC = 3600
"The number of seconds after which we no longer consider a task recent for purposes of counting."

MAX_RECENT_TASKS = 5000


class TaskStatsReporter(object):
    """ The TaskStatsReporter service is able to retrieve various statistical
    information about topics and tasks.
    """
    
    __topic_name = None
    
    def __init__(self, topic_name):
        """ Creates a TaskStatsReporter object for a particular topic
        
        :topic_name:
            Required. The name of the topic of interest.
        
        """
        # validate and make sure the topic name is valid
        exception.ex_check_topic_name_and_raise(topic_name)
        # keep track if it for later
        self.__topic_name = topic_name
    
    def num_recent_tasks_created(self, app=None):
        """ Returns the number of tasks recently created in a
        particular topic.
        
        :app:
            Optional. The name of an application which has created
            tasks. Currently one of:
                www.weblab      - public web interface
                lon.weblab      - Science Museum
            
        """
        timeout_dt = modeling_utcnow() - datetime.timedelta(seconds=RECENT_COUNT_THRESHOLD_SEC)
        q = db.Query(core.model.Task)
        q.filter('topic_name =', self.__topic_name)
        if app is not None:
            q.filter('created_by_app =', app)
        q.filter('created_at >= ', timeout_dt)
        return q.count(limit=MAX_RECENT_TASKS)
        