# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""Part of Lask, the Web Lab Task management system.


Handlers for the LASK HTTP server.

"""

import webapp2
from default_handler import DefaultHandler
from lask.core.model import *
from lask.services import task_stats_svc

#####################################################################
#
# These handlers allow RESTful interaction with LabDataContainer objects
#


class TopicCollectionHandler(DefaultHandler):
    """Get a list of Topics and create Topics
    """
    _GET_method = 'get_Topics_list'
    _POST_method = 'create_or_update'
    def target(self, *args, **kwargs):
        return Topic

class TopicHandler(DefaultHandler):
    """Get Topics and create Topics
    """
    _GET_method = 'me'
    _POST_method = None # 'create_Task'
    def target(self, *args, **kwargs):
        try:
            return Topic.get_by_name(kwargs['topic_name'])
        except ValueError or KeyError:
            return None

class TopicHandler_num_creatable_tasks(TopicHandler):
    """Get num_creatable_tasks
    """
    _GET_method = 'num_creatable_tasks'
    _POST_method = None

class TopicHandler_max_num_tasks(TopicHandler):
    """Get num_creatable_tasks
    """
    _GET_method = 'max_num_tasks'
    _POST_method = None

class TaskStatsReporterHandler_num_recent_tasks_created(DefaultHandler):
    """ Get counts of recently-created tasks
    """
    def target(self, *args, **kwargs):
        return task_stats_svc.TaskStatsReporter(kwargs['topic_name'])

    _GET_method = 'num_recent_tasks_created'
    _POST_method = None

class AssignTaskHandler(TopicHandler):
    """Assign Tasks from Topics
    """
    _GET_method = 'assign_Task'
    _POST_method = None

class TaskCollectionHandler(TopicHandler):
    """Get a list of Tasks and create Tasks
    """
    _GET_method = 'get_Tasks_list'
    _POST_method = 'create_Task'

class RejectedTaskCountHandler(TopicHandler):
    """Get the number of tasks which have been rejected by a moderator
    """
    _GET_method = 'get_mod_rejected_Tasks_count'
    _POST_method = None

class RejectedTaskCollectionHandler(TopicHandler):
    """Get a list of Tasks which have been rejected by a moderator
    """
    _GET_method = 'get_mod_rejected_Tasks_list'
    _POST_method = None

class WaitingTaskCountHandler(TopicHandler):
    """Get the number of tasks which are waiting to be worked on
    """
    _GET_method = 'get_waiting_Tasks_count'
    _POST_method = None

class WaitingTaskCollectionHandler(TopicHandler):
    """Get a list of Tasks which are waiting to be worked on
    """
    _GET_method = 'get_waiting_Tasks_list'
    _POST_method = None

class WorkingTaskCountHandler(TopicHandler):
    """Get the number of tasks which are being worked on
    """
    _GET_method = 'get_working_Tasks_count'
    _POST_method = None

class WorkingTaskCollectionHandler(TopicHandler):
    """Get a list of Tasks which are being worked on
    """
    _GET_method = 'get_working_Tasks_list'
    _POST_method = None

class SuccessfulTaskCollectionHandler(TopicHandler):
    """Get a list of Tasks which have been stopped successfully.
    """
    _GET_method = 'get_successful_Tasks_list'
    _POST_method = None

class FailedTaskCollectionHandler(TopicHandler):
    """Get a list of Tasks which have been stopped successfully.
    """
    _GET_method = 'get_failed_Tasks_list'
    _POST_method = None

class TaskHandler(DefaultHandler):
    """Get a Task
    """
    _GET_method = 'me'
    _POST_method = None
    def target(self, *args, **kwargs):
        try:
            t = Topic.get_by_name(kwargs['topic_name'])
            if t is not None:
                return t.get_Task(TaskID(kwargs['task_id']))
        except ValueError or KeyError or AttributeError:
            pass
        return None

class AcceptTaskHandler(TaskHandler):
    """Accept an offered Task
    """
    _GET_method = None
    _POST_method = 'accept'

class DeclineTaskHandler(TaskHandler):
    """Decline an offered Task
    """
    _GET_method = None
    _POST_method = 'decline'

class DelegateTaskHandler(TaskHandler):
    """Delegate a Task
    """
    _GET_method = None
    _POST_method = 'delegate'

class ProgressTaskHandler(TaskHandler):
    """Notify of progress on a Task
    """
    _GET_method = None
    _POST_method = 'progress'

class StopTaskHandler(TaskHandler):
    """Done working on a Task
    """
    _GET_method = None
    _POST_method = 'stop'

class TaskModerationRejectHandler(TaskHandler):
    """Rejects a task on moderation grounds
    """
    _GET_method = None
    _POST_method = 'reject'
