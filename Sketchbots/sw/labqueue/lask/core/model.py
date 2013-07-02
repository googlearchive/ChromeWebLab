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
"""Part of Lask, the Web Lab task / data system.


All of the Lask data models are described here.
"""

from google.appengine.runtime import DeadlineExceededError
from google.appengine.ext import db
from google.appengine.ext import blobstore
import support.modeling
import datetime
import exception
import urllib
import numbers
import base64
import hashlib
import StringIO
from webapp2 import uri_for
from webapp2 import Request
import random
import logging
import calendar
from math import floor
import lask.services
import lask.services.cloudworker_svc
import static_data.standard_datastore_fixtures
try: import simplejson as json
except ImportError: import json
from support.modeling import SimplejsonModelRegistry
import lask.client
from google.appengine.api import users
import config
import support.imaging

import pytz
from pytz import timezone
import os



ENABLE_LDC_COMPATIBILITY_MODE = False
"Enabling this flag will turn on compatibility with LDCs that are parented using the datastore's built-in (locking) data heirarchy machinery. A previous version of the LDC system used this mechanism instead of the current, less agressive system."

ALLOW_TOPIC_UPDATES = True
"Enable this to let a worker modify a topic after creation."

LOST_TASK_TIMEOUT_HRS = 6
"The number of hours after which we assume that a task which is being worked on has gotten 'lost'."

INCOMING_CONTENT_BUFFER_SIZE = 65536
"The size, in bytes, of the read/write buffer when working with non-Blobstore binary data"
    

class KnownWorkerStatus(support.modeling.GenericModel):
    """
    Records various pieces of stat and
    statistical information about a particular Worker
    """ 
    
    GUID = support.modeling.WorkerGUID(required=True)
    "These statistics are about the Worker identified by this GUID."
    
    app_guid = db.StringProperty(required=False)
    "The application GUID, eg lon.weblab, www.weblab etc."
    
    touchpoint = db.StringProperty(required=False)
    "One of config.VALID_TOUCHPOINT_NAMES, can be used to identify the part of the exhibit this worker is in."
    
    last_contact = support.modeling.ModifiedAtDateTimeProperty(required=True)
    "When the Worker named in the GUID property last contacted the TaskRouter"
    
    last_status = db.StringProperty(required=False, default='OK')
    "If available, a message from the worker the last time it was heard from."
    
    last_accepted_task_url = db.StringProperty(required=False, default=None)
    "The URL of the last Task this worker accepted"
    
    last_accepted_task_timestamp = support.modeling.OccuranceTimeProperty(required=False, default=None)
    "The datetime the Task indicated in last_accepted_task_url was accepted by this worker"
    
    last_accepted_task_est_stop_at = support.modeling.OccuranceTimeProperty()
    "The date/time when the assigned_to Worker estimates the last accepted Task will be complete"
    
    last_stopped_task_url = db.StringProperty(required=False, default=None)
    "The URL of the last Task this worker stopped"
    
    last_stopped_task_timestamp = support.modeling.OccuranceTimeProperty(required=False, default=None)
    "The datetime the Task indicated in last_stopped_task_url was stopped by this worker"
    
    last_created_task_url = db.StringProperty(required=False, default=None)
    "The URL of the last Task this worker created"
    
    last_created_task_timestamp = support.modeling.OccuranceTimeProperty(required=False, default=None)
    "The datetime the Task indicated in last_stopped_task_url was stopped by this worker"

    # Logging-related
    
    MAX_LOG_LENGTH = 87000
    "Maximum number of entries in the object's log before MAX_TRUNCATE_NUM older entries are removed"
    
    TRUNCATE_NUM = 60
    "Number of old log entries to trim each time the log hits MAX_LOG_LENGTH entries"
    
    log = db.ListProperty(db.Text)
    "Log of past history for this object"
    
    # system health properties
    uptime = db.StringProperty(required=False, default=None)
    "latest uptime string from the worker's host system, current as of last_contact time"
    
    free_memory = db.FloatProperty(required=False, default=None)
    "MB of free memory on the worker's host system, current as of last_contact time"
    
    total_memory = db.FloatProperty(required=False, default=None)
    "MB of total memory on the worker's host system"
    
    deployed_version = db.StringProperty(required=False, default=None)
    "The worker's deployed software version"
    
    #
    # class methods
    #
    __big_counter_cache = {}
    @classmethod
    def tasks_accepted_today_counter(cls, GUID):
        """Returns a counter which tracks the number of tasks
        accepted by this worker today.
        
        :GUID:
            The worker GUID.
            
        """
        dt = support.modeling.modeling_utcnow()
        # convert dt into an absolute number
        dt_ts_sec = calendar.timegm(dt.timetuple()) + dt.microsecond/1e6
        # reduce the precision to 1 day
        c_dt_ts_sec = floor(dt_ts_sec / 86400) * 86400
        name = '%s_%s_CTR-0001_%s' % (KnownWorkerStatus.kind(), GUID, c_dt_ts_sec)
        
        if name not in cls.__big_counter_cache:
            cls.__big_counter_cache[name] = support.big_counter.BigCounter(name)
        #logging.info('tasks_created_this_hour_counter: '+name+' '+str(len(cls.__big_counter_cache)))
        return cls.__big_counter_cache[name]
        
    @classmethod
    def tasks_succeeded_counter(cls, GUID):
        """Returns a counter which tracks the number of tasks
        stopped successfully by this worker today.
        
        :GUID:
            The worker GUID.
            
        """
        dt = support.modeling.modeling_utcnow()
        # convert dt into an absolute number
        dt_ts_sec = calendar.timegm(dt.timetuple()) + dt.microsecond/1e6
        # reduce the precision to 1 day
        c_dt_ts_sec = floor(dt_ts_sec / 86400) * 86400
        name = '%s_%s_CTR-0003_%s' % (KnownWorkerStatus.kind(), GUID, c_dt_ts_sec)
        
        if name not in cls.__big_counter_cache:
            cls.__big_counter_cache[name] = support.big_counter.BigCounter(name)
        #logging.info('tasks_created_this_hour_counter: '+name+' '+str(len(cls.__big_counter_cache)))
        return cls.__big_counter_cache[name]
        
    @classmethod
    def tasks_failed_counter(cls, GUID):
        """Returns a counter which tracks the number of tasks
        stopped in failure by this worker today.
        
        :GUID:
            The worker's GUID.
            
        """
        dt = support.modeling.modeling_utcnow()
        # convert dt into an absolute number
        dt_ts_sec = calendar.timegm(dt.timetuple()) + dt.microsecond/1e6
        # reduce the precision to 1 day
        c_dt_ts_sec = floor(dt_ts_sec / 86400) * 86400
        name = '%s_%s_CTR-0004_%s' % (KnownWorkerStatus.kind(), GUID, c_dt_ts_sec)
        
        if name not in cls.__big_counter_cache:
            cls.__big_counter_cache[name] = support.big_counter.BigCounter(name)
        #logging.info('tasks_created_this_hour_counter: '+name+' '+str(len(cls.__big_counter_cache)))
        return cls.__big_counter_cache[name]
    
    @classmethod
    def get_for_worker(cls, GUID, create_new_records=True):
        """ Retrieves a worker's current status record, if available.
        
        :GUID:
            The GUID of the Worker.

        :create_new_records:
            If True and the specified worker has never been seen before then
            a new worker record will be created and returned. New records are
            not automatically put(), so the calling code must do this if the
            record is meant to be retained.
            
        """
        # check arguments
        exception.ex_check_worker_guid_and_raise(GUID)
        obj = KnownWorkerStatus.get_by_key_name(GUID)
        if create_new_records and obj is None:
            obj = KnownWorkerStatus.get_or_insert(GUID,
                GUID=GUID)
        if obj is not None:
            obj.app_guid = _get_app_guid_from_worker_guid(GUID)
            obj.touchpoint = _get_touchpoint_from_worker_guid(GUID)
        return obj
        
    
    @classmethod
    def worker_was_seen(cls, GUID):
        """" When called will record when a particular worker was last seen by the system.
        This has the effect of locating (or creating) a KnownWorkerStatus record for the
        specified worker, updating the last_contact property and saving it.
        
        Returns nothing.
        
        :GUID:
            The GUID of the Worker that was just seen
        
        * Raises an InvalidWorkerGUIDError if the specified Worker's GUID is invalid
        """
        try:
            obj = KnownWorkerStatus.get_for_worker(GUID)
            obj.last_contact = support.modeling.modeling_utcnow()
            obj.put(add_to_log=False)
            logging.info('worker_guid="%s"'%(GUID))
        except:
            pass

    @classmethod
    def worker_was_seen_progressing_a_task(cls, GUID, est_stop_at):
        """" When called will record when a particular worker was last seen by the system.
        This has the effect of locating (or creating) a KnownWorkerStatus record for the
        specified worker, updating the last_contact property and saving it.
        
        Returns nothing.
        
        :GUID:
            The GUID of the Worker that was just seen
            
        :est_stop_at:
            The date/time when the Worker estimates the task will be complete.
        
        * Raises an InvalidWorkerGUIDError if the specified Worker's GUID is invalid
        """
        try:
            obj = KnownWorkerStatus.get_for_worker(GUID)
            obj.last_contact = support.modeling.modeling_utcnow()
            obj.last_accepted_task_est_stop_at = est_stop_at
            obj.put(add_to_log=True)
            logging.info('worker_guid="%s"'%(GUID))
        except:
            pass
        
    @classmethod
    def worker_was_seen_accepting_a_task(self, GUID, url, est_stop_at):
        """ Records the URL of the last task this worker accepted.
        
        :GUID:
            The GUID of the Worker that was just seen

        :url:
            The URL of the last Task this worker this worker accepted.
            
        :est_stop_at:
            The date/time when the Worker estimates the task will be complete.
        """
        try:
            obj = KnownWorkerStatus.get_for_worker(GUID)
            obj.last_contact = support.modeling.modeling_utcnow()
            obj.last_accepted_task_url = url
            obj.last_accepted_task_timestamp = obj.last_contact
            obj.last_accepted_task_est_stop_at = est_stop_at
            KnownWorkerStatus.tasks_accepted_today_counter(GUID).increment()
            obj.put(add_to_log=True)
            logging.info('worker_guid="%s"'%(GUID))
        except:
            pass
    
    @classmethod
    def worker_was_seen_stopping_a_task(self, GUID, url, success):
        """ Records the URL of the last task this worker stopped.
        
        :GUID:
            The worker's GUID.

        :url:
            The URL of the last Task this worker this worker stopped.
            
        :success:
            Boolean, whether or not the task was successful
            
        """
        try:
            obj = KnownWorkerStatus.get_for_worker(GUID)
            obj.last_contact = support.modeling.modeling_utcnow()
            obj.last_stopped_task_url = url
            obj.last_stopped_task_timestamp = obj.last_contact
            obj.put(add_to_log=True)
            if success:
                KnownWorkerStatus.tasks_succeeded_counter(GUID).increment()
            else:
                KnownWorkerStatus.tasks_failed_counter(GUID).increment()
            logging.info('worker_guid="%s"'%(GUID))
        except:
            pass
    
    @classmethod
    def worker_was_seen_creating_a_task(self, GUID, url):
        """ Records the URL of the last task this worker created.
        
        :GUID:
            The worker's GUID.

        :url:
            The URL of the last Task this worker this worker created.
        """
        try:
            obj = KnownWorkerStatus.get_for_worker(GUID)
            obj.last_contact = support.modeling.modeling_utcnow()
            obj.last_created_task_url = url
            obj.last_created_task_timestamp = obj.last_contact
            obj.put(add_to_log=True)
            logging.info('worker_guid="%s"'%(GUID))
        except:
            pass
    
    
    @classmethod
    def get_all_status(cls, touchpoint=None, activity_space=None):
        """ Returns a list of worker status information. A worker not in the list
        has never been seen.
        
        :activity_space:
            Optional. A string indicating the space for which you want status information.
            If specified, must be one of the strings in config.VALID_ACTIVITY_SPACES:
                "www"   - for the frontend web site
                "lon"   - for the London Science Museum
        
        :touchpoint:
            Optional. A string indicating the touchpoint with which the tag was last active. Must be one
            of the strings in config.VALID_TOUCHPOINT_NAMES

                
        """
        q = db.Query(KnownWorkerStatus)
        if touchpoint is not None:
            exception.ex_check_touchpoint_name_and_raise(touchpoint)
            q.filter('touchpoint =', touchpoint)
            if config.ANCIENT_WORKER_STATUS_CUTOFF_DAYS is not None:
                q.filter('last_contact >', support.modeling.modeling_utcnow() - datetime.timedelta(days=config.ANCIENT_WORKER_STATUS_CUTOFF_DAYS))
        if activity_space is not None:
            exception.ex_check_activity_space_and_raise(activity_space)
            q.filter('app_guid =', activity_space+'.weblab')
            if config.ANCIENT_WORKER_STATUS_CUTOFF_DAYS is not None:
                q.filter('last_contact >', support.modeling.modeling_utcnow() - datetime.timedelta(days=config.ANCIENT_WORKER_STATUS_CUTOFF_DAYS))
        return q.fetch(limit=400)
    
    #
    # instance methods
    #
    
    def set_status(self, message):
        """ Allows a worker to set their own status message.
        
        :message:
            A status message.
        
        """
        if self.last_contact + datetime.timedelta(seconds=config.MIN_WORKER_STATUS_UPDATE_PERIOD_SEC) > support.modeling.modeling_utcnow():
            # cannot update this worker's status right now because it was updated too recently
            # logging.warning('Attempted to update worker status too frequently')
            return self
            
        # check arguments
        self.last_status = message
        self.put(add_to_log=True)
        return self
        
        
    def set_sys_health(self, uptime=None, free_memory=None, total_memory=None, deployed_version=None):
        """ Reports current system health stats for the machine on which the worker is running.
        
        :uptime:
            Optional. String output from the `uptime` command, or similar
        
        :free_memory:
            Optional. Float, number of MB of free system memory, such that (free_memory / total_memory) = % available memory
        
        :total_memory:
            Optional. Float, number of MB of total system memory, such that (free_memory / total_memory) = % available memory
        
        :deployed_version:
            Optional. String, the deployed version of the worker's software.
        
        
        * Raises a TypeError if free_memory or total_memory are not floats
        """
        
        if uptime is not None:          self.uptime = uptime
        if free_memory is not None:     self.free_memory = free_memory
        if total_memory is not None:    self.total_memory = total_memory
        if deployed_version is not None: self.deployed_version = deployed_version
        
        self.put(add_to_log=True)
        return self
    
    def get_log(self, offset=None, num=50):
        """
        Returns a list containing a log of this object's changes, as a list of strings in chronological order.
        Each log entry is an object encoded as a JSON string. See to_log_entry() for a description of the
        object's structure.
        
        :offset:
            Optional. The log entry number to start returning entries for. The 0th entry is the most recent entry in the log.
        
        :num:
            Optional. The max number of log entries to return. Defaults to 50.
        
        """
        
        if offset is None:
            offset = 50
        start = max(0, len(self.log) - offset)
        end = min(len(self.log), start + num)
        
        return self.log[start:end]
    
    def to_log_entry(self):
        """
        Returns a log entry string containing the current state of this object.
        A log entry string is an object encoded as JSON with the following structure:
        
            {"t": "2012-09-21 18:25:05.969718 UTC",   "o": { ... } }
        
        Where "o" contains a snapshot of the object at the indicated date/time.
        
        """
        return json.dumps({
            't': str(support.modeling.modeling_utcnow())+' UTC',
            'o': self.to_dict(),
        }, default=SimplejsonModelRegistry.default, indent=False)
    
    def _add_self_to_log(self):
        """
        Private method to update the log to contain a snapshot of the current state of the object.
        New entries to the log are appended.
        """
        # self.log.append(db.Text(self.to_log_entry()))
        # if len(self.log) >= KnownWorkerStatus.MAX_LOG_LENGTH:
        #    self.log = self.log[KnownWorkerStatus.TRUNCATE_NUM:]
        self.log = []
        
    def to_dict(self):
    
#        d = super(self.__class__, self).to_dict()
#        d['last_contact_friendly'] = str(self.last_contact)+' UTC'
#        d['tasks_accepted_today'] = KnownWorkerStatus.tasks_accepted_today_counter(self.GUID).get_value()
#        d['tasks_succeeded_today'] = KnownWorkerStatus.tasks_succeeded_counter(self.GUID).get_value()
#        d['tasks_failed_today'] = KnownWorkerStatus.tasks_failed_counter(self.GUID).get_value()
#        return d
        
        return {
            'uptime': self.uptime,
            'total_memory': self.total_memory,
            'deployed_version': self.deployed_version,
            'name': self.GUID,
            'is_saved': self.is_saved(),
            'last_accepted_task_url': self.last_accepted_task_url,
            'free_memory': self.free_memory,
            'tasks_succeeded_today': KnownWorkerStatus.tasks_succeeded_counter(self.GUID).get_value(),
            'tasks_accepted_today': KnownWorkerStatus.tasks_accepted_today_counter(self.GUID).get_value(),
            'last_accepted_task_est_stop_at': self.last_accepted_task_est_stop_at,
            'last_created_task_timestamp': self.last_created_task_timestamp,
            'last_accepted_task_timestamp': self.last_accepted_task_timestamp,
            'app_guid': self.app_guid,
            'last_stopped_task_timestamp': self.last_stopped_task_timestamp,
            'tasks_failed_today': KnownWorkerStatus.tasks_failed_counter(self.GUID).get_value(),
            'last_status': self.last_status,
            'touchpoint': self.touchpoint,
            'last_created_task_url': self.last_created_task_url,
            'GUID': self.GUID,
            'last_contact_friendly': str(self.last_contact)+' UTC',
            'last_stopped_task_url': self.last_stopped_task_url,
            'last_contact': self.last_contact,
        }
    
    
    def put(self, add_to_log=False):
        """ Like put(), but optionally places a copy of the object in the log as a KnownWorkerStatusHistory.
        
        :add_to_log:
            If True, a copy of the object will also be put into the log as a KnownWorkerStatusHistory
            
        """
        if add_to_log:
            self._add_self_to_log()
            
        if not config.DISABLE_WORKER_STATUS_WRITES:
            try:
                super(self.__class__, self).put()
            except DeadlineExceededError:
                pass
        else:
            logging.warning('Worker status writes are disabled in config.')
        
        
class TaskStateProperty(db.Property):
    """The following are valid values for the 'state' property of Task objects.
    """
    
    #
    # possible Task states
    #
    
    ROOT = "ROOT"
    """ROOT - reserved, do not use
    """
    
    MOD_REJECTED = "MOD_REJECTED"
    """
        MOD_REJECTED - Tasks in this state have been halted due to a moderation action. They cannot be updated
            by any worker. The Task's updated_at indicates the date/time when it was rejected
    """
    
    
    RESERVATION = "RESERVATION"
    """
        RESERVATION - This is a temporary reservation for a task which will be filled in later by a Worker.
            properties filled in are:
                created_by - provided by the requesting Worker
                created_at - filled in by the datastore
                updated_at - filled in by the datastore
                topic - provided by the requesting Worker
                payload - set to None by Lask
                remindable - set to False by Lask
    """
    
    POSTED_NEW = "POSTED_NEW"
    """
        POSTED_NEW - The task is new and has been posted by a Worker.
            properties filled in are:
                created_by - provided by the requesting Worker
                created_at - filled in by the datastore
                updated_at - filled in by the datastore
                topic - provided by the requesting Worker
                payload - given by the requesting Worker
                remindable - set to False by Lask
    """ 

    ASSIGNMENT_OFFERED = "ASSIGNMENT_OFFERED"
    """
        ASSIGNMENT_OFFERED - The task has been offered to a Worker for assignment
            Has all of the same properties as POSTED_NEW, plus these changes:
                updated_at - filled in by the datastore
                offered_to - filled in by Lask
                offered_at - filled in by Lask
                remindable - set to True by Lask
    """
    
    ASSIGNMENT_ACCEPTED_NEW = "ASSIGNMENT_ACCEPTED_NEW"
    """
        ASSIGNMENT_ACCEPTED_NEW - The task was previously offered to a Worker and has been accepted by that Worker but no progress has been reported
            Has all of the same properties as ASSIGNMENT_OFFERED, plus these changes:
                updated_at - filled in by the datastore
                assigned_to - filled in by Lask
                assigned_at - filled in by Lask
                est_stop_at - provided by the accepting Worker
                remindable - set to True by Lask
    """

    ASSIGNMENT_REMINDER_OFFERED = "ASSIGNMENT_REMINDER_OFFERED"
    """
        ASSIGNMENT_REMINDER_OFFERED - The assigned-to Worker has asked for a new assignment without delegating or stopping
                                       their current task. The TaskRouter will re-offer the same task to the Worker and
                                       increment the task's reminder_count variable. The Worker must then either accept
                                       or decline the Task. If the assigned-to Worker asks for a new assignment while still
                                       having one enough times then the TaskRouter will offer the Worker a different task
                                       and mark the previous one STOPPED_FAILURE. If the Worker accepts the reminder offer
                                       then the Task goes to ASSIGNMENT_ACCEPTED_REMINDER until the Worker posts some
                                       progress or does something more.
            Has all of the same properties as ASSIGNMENT_OFFERED, plus these changes:
                updated_at - filled in by the datastore
                reminder_count - incremented by Lask
                offered_to - filled in by Lask
                offered_at - filled in by Lask
                assigned_to - set to None by Lask
                assigned_at - set to None by Lask
                est_stop_at - set to None by Lask
                remindable - set to True by Lask
    """
    
    ASSIGNMENT_ACCEPTED_REMINDER = "ASSIGNMENT_ACCEPTED_REMINDER"
    """
        ASSIGNMENT_ACCEPTED_REMINDER - Like ASSIGNMENT_ACCEPTED_NEW, but follows the ASSIGNMENT_REMINDER_OFFERED state.
            Has all of the same properties as ASSIGNMENT_OFFERED, plus these changes:
                updated_at - filled in by the datastore
                assigned_to - filled in by Lask
                assigned_at - filled in by Lask
                est_stop_at - provided by the accepting Worker
                remindable - set to True by Lask
    """
    
    DELEGATED = "DELEGATED"
    """
        DELEGATED - The Worker assigned to this Task is delegating this job. This means the assigned
                    Worker will no longer work on it and wants to re-post the Task. The TaskRouter
                    will make a copy of the Task and set the created_by to the assigned Worker.
                    The topic and payload on the new Task will be the same.
                    
            Has all of the same properties as ASSIGNMENT_ACCEPTED_NEW, plus these changes:
                updated_at - filled in by the datastore
                delegated_at - filled in by Lask
                delegated_as - filled in by Lask
                remindable - set to False by Lask
    """
    
    ASSIGNED_UNKNOWN = "ASSIGNED_UNKNOWN"
    """
        
        ASSIGNED_UNKNOWN - A task may attain this state if it has been assigned, but the Supervisor has
                           determined that the assigned Worker is no longer responding. Incidentally, this
                           should also cause that non-responsive Worker to be flagged in a KnownWorkerStatus
                           record for the Worker in question.

            Has all of the same properties as ASSIGNMENT_ACCEPTED_NEW, IN_PROGRESS_GOOD or IN_PROGRESS_WARNING, plus these changes:
                updated_at - filled in by the datastore
                declared_unknown_at - filled in by Lask
                remindable - set to True by Lask
    """
    
    IN_PROGRESS_GOOD = "IN_PROGRESS_GOOD"
    """
        IN_PROGRESS_GOOD - The assigned Worker has made some kind of progress completing this Task, but
                           has not yet completed it. The task is moving toward successful completion.
                    
            Has all of the same properties as ASSIGNMENT_ACCEPTED_NEW, plus these changes:
                updated_at - filled in by the datastore
                last_progress_message - provided by the assigned Worker
                last_progress_at - filled in by Lask
                est_stop_at - provided by the assigned Worker
                assignee_state - provided by the assigned Worker
                remindable - set to True by Lask
    """
    
    IN_PROGRESS_WARNING = "IN_PROGRESS_WARNING"
    """
        IN_PROGRESS_WARNING - The assigned Worker has made some kind of progress completing this Task, but
                              has not yet completed it. The task has not failed, but there is a (non-fatal) problem.
                    
            Has all of the same properties as ASSIGNMENT_ACCEPTED_NEW, plus these changes:
                updated_at - filled in by the datastore
                last_progress_message - provided by the assigned Worker
                last_progress_at - filled in by Lask
                est_stop_at - provided by the assigned Worker
                assignee_state - provided by the assigned Worker
                remindable - set to True by Lask
    """
    
    STOPPED_SUCCESS = "STOPPED_SUCCESS"
    """
        STOPPED_SUCCESS - The assigned Worker has stopped working on the Task because it is complete!
                    
            Has all of the same properties as ASSIGNMENT_ACCEPTED_NEW, plus these changes:
                updated_at - filled in by the datastore
                last_progress_message - filled in by Lask
                last_progress_at - filled in by Lask
                stopped_at - filled in by Lask
                payload - provided by the assigned Worker
                stop_message - provided by the assigned Worker
                remindable - set to False by Lask
    """
    
    STOPPED_FAILURE = "STOPPED_FAILURE"
    """
        STOPPED_FAILURE - The assigned Worker has stopped working on the Task because it cannot be completed.
                    
            Has all of the same properties as ASSIGNMENT_ACCEPTED_NEW, plus these changes:
                updated_at - filled in by the datastore
                last_progress_message - filled in by Lask
                last_progress_at - filled in by Lask
                stopped_at - filled in by Lask
                payload - provided by the assigned Worker
                stop_message - provided by the assigned Worker
                remindable - set to False by Lask
    """
    
    def __init__(self):
        super(TaskStateProperty, self).__init__(required=True, choices=(
                                                                         TaskStateProperty.ROOT,
                                                                         TaskStateProperty.MOD_REJECTED,
                                                                         TaskStateProperty.RESERVATION,
                                                                         TaskStateProperty.POSTED_NEW,
                                                                         TaskStateProperty.ASSIGNMENT_OFFERED,
                                                                         TaskStateProperty.ASSIGNMENT_ACCEPTED_NEW,
                                                                         TaskStateProperty.ASSIGNMENT_REMINDER_OFFERED,
                                                                         TaskStateProperty.ASSIGNMENT_ACCEPTED_REMINDER,
                                                                         TaskStateProperty.DELEGATED,
                                                                         TaskStateProperty.ASSIGNED_UNKNOWN,
                                                                         TaskStateProperty.IN_PROGRESS_GOOD,
                                                                         TaskStateProperty.IN_PROGRESS_WARNING,
                                                                         TaskStateProperty.STOPPED_SUCCESS,
                                                                         TaskStateProperty.STOPPED_FAILURE,
                                                                         ))


class HistoricEvent(support.modeling.GenericLogEntryModel):
    """A(n) HistoricEvent records information about something that happened
    in the past, such as the creation or routing of a Task.
    """

    recorded_by = support.modeling.WorkerGUID()
    "The GUID of the Worker which recorded the event being described. If None, then the Event was recorded by something other than a Worker."


TaskID = long
"The class used to represent Task IDs. This should match the type returned by google.appengine.ext.db.Model.key().id()."

TopicName = unicode
"The class used to represent Task names. This should match the type returned by google.appengine.ext.db.Model.key().name()."

def TopicKey(name):
    """Returns a suitable Topic object Key given a valid Topic name
    """
    return db.Key.from_path('Topic', name)
    

class Topic(support.modeling.GenericLogEntryModel):
    """A Topic is a way of organizing and setting queueing policy for similar Tasks.
    For example, if a group of Tasks need to be organized into a FIFO queue, to be
    performed by a scalable set of similar hardware somewhere, they should all be parented
    to a single Topic. That Topic would contain current state information about the
    associated Tasks, as well as certain policy rules about when the queue should be
    cleared, etc.
    """
    
#    owner_app_id = support.modeling.ApplicationGUID(required=True)
#    "The Application which owns this Topic."
    
    created_by = support.modeling.WorkerGUID(required=True)
    "The Worker which first created this Topic. Since all Topics must come from a Worker, this is required."
    
    created_at = support.modeling.CreatedAtDateTimeProperty(required=True)
    "The date/time when the Worker indicated in created_by first posted this Topic"

    updated_at = support.modeling.ModifiedAtDateTimeProperty(required=True)
    "The date/time when the Topic was last updated (modified). Updating a Task within a Topic does NOT constitute an update to the Topic."
    
    task_policy = support.modeling.ParsedJSONObjectProperty(required=True,default={})
    "The control policy for Tasks in this Topic."
    
    
    #
    # class methods
    #
    @classmethod
    def get_by_name(cls, name):
        """Attempts to retrieve a Topic by its name.
        
        :name:
            The name of the Topic to retrieve
            
        * Raises an InvalidTopicNameError or BadKeyError if the supplied name is invalid per exception.ex_check_topic_name_and_raise()
        """
        exception.ex_check_topic_name_and_raise(name)
        topic = Topic._int_get_by_name(name)
        
        #
        # lazily load from fixtures
        #
        if topic is None and name in static_data.standard_datastore_fixtures.TOPICS:
            template = static_data.standard_datastore_fixtures.TOPICS[name]
            logging.info('model.LabDataContainer: Lazy-loading Topic from fixtures: '+name)
            topic = Topic.create_or_update(name=name, **template)

        return topic
    @classmethod
    def _int_get_by_name(cls, name):
        return Topic.get(TopicKey(name))
        
    @classmethod
    def create_or_update(cls, worker_guid, name, task_policy=None):
        """Create and save a Topic.
        
        :worker_guid:
            The GUID of the Worker which is creating this Topic
        
        :name:
            The name of the new Topic
            
        :task_policy:
            (Optional) An object which defines the policy for Tasks in this topic.
            The object may have the following key/value pairs:
                'max_num_tasks'             Specify an integer to cap
                                            the max number of new tasks
                                            to allow each hour. The timing
                                            of the cap is NOT rolling;
                                            instead it works as a number
                                            of slots which are released at
                                            the top of each hour and used
                                            as needed.
                'can_cache'                 If True, the system will run new
                                            and stopped Tasks through the
                                            CacheWorker from the cloudworker service.
                
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid per the criteria in exception.ex_check_worker_guid_and_raise()
        
        * Raises an InvalidTopicNameError or BadKeyError if the supplied name is invalid per exception.ex_check_topic_name_and_raise()
        
        * Raises a TopicAlreadyExistsError if a Topic already exists with the same name
        
        * Raises an InvalidTopicTaskPolicyError if the task_policy is invalid per 
        """
        
        # check arguments
        exception.ex_check_worker_guid_and_raise(worker_guid)
        exception.ex_check_topic_name_and_raise(name)
        if (task_policy is not None):
            exception.ex_check_topic_task_policy_and_rasie(task_policy)
        
        topic = Topic._int_get_by_name(name)
        if topic is not None:
            if not ALLOW_TOPIC_UPDATES:
                raise exception.TopicAlreadyExistsError('The specified Topic already exists')
            else:
                topic.task_policy = task_policy
        else:
            topic = Topic(
                key=TopicKey(name),
                created_by=worker_guid,
                task_policy=task_policy
            )
        topic.put() # save it
        
        return topic

    @classmethod
    def get_Topics_query(cls):
        """Returns a db.Query suitable for retrieving the full list of Topics in the system.
        This Query can be paginated, filtered, etc. just like any Query.
        """
        
        q = db.Query(Topic, keys_only=True)
        return q
    
    @classmethod
    def get_Topics_list(cls, num=None, start=None, order=None):
        """Gets a list of available Topics, optionally paginating the results.
        
        :num:
            Optional. The maximum number of objects to return in the list. Defaults to unlimited,
            however this may cause the query to time out before completion.
        
        :start:
            Optional. A number specifying which object in the list to start with,
            expressed as an offset from the start of the list.
        
        :order:
            Optional. If specified, will try to order the list by the property specified.
            To order in reverse, preceed the property name with a minus sign.
            
            For example, to sort alphabetically by the GUID of the Worker which created
            each Topic, set order to "created_by". To sort that in reverse order
            set order to "-created_by"
        
        * Raises a TypeError if start or num are not numbers
        * Raises an ValueError if start or num are negative
        """
        q = Topic.get_Topics_query()
        topics = Topic.list_from_query(q, num, start, order)
        if topics is None or len(topics) == 0:
            topics = []
            for topic_name in static_data.standard_datastore_fixtures.TOPICS:
                template = static_data.standard_datastore_fixtures.TOPICS[topic_name]
                logging.info('model.LabDataContainer: Lazy-loading Topic from fixtures: '+topic_name)
                Topic.create_or_update(name=topic_name, **template)
                topics.append(topic_name)
        return topics
        
    __big_counter_cache = {}
    @classmethod
    def tasks_created_this_hour_counter(cls, topic_name):
        """Returns a counter which tracks the number of tasks
        created in this topic in the current hour.
        
        :topic_name:
            The topic for which a counter is required.
            
        """
        dt = support.modeling.modeling_utcnow()
        # convert dt into an absolute number
        dt_ts_sec = calendar.timegm(dt.timetuple()) + dt.microsecond/1e6
        # reduce the precision to 1 hour
        c_dt_ts_sec = floor(dt_ts_sec / 3600) * 3600
        name = '%s_%s_CTR-0001_%s' % (Topic.kind(), topic_name, c_dt_ts_sec)
        
        if name not in cls.__big_counter_cache:
            cls.__big_counter_cache[name] = support.big_counter.BigCounter(name)
        #logging.info('tasks_created_this_hour_counter: '+name+' '+str(len(cls.__big_counter_cache)))
        return cls.__big_counter_cache[name]
        
    @classmethod
    def unstopped_tasks_counter(cls, topic_name):
        """Returns a counter which tracks the number of tasks
        in this topic which are unstopped.
        
        :topic_name:
            The topic for which a counter is required.
            
        """
        name = '%s_%s_CTR-0002' % (Topic.kind(), topic_name)
        
        if name not in cls.__big_counter_cache:
            cls.__big_counter_cache[name] = support.big_counter.BigCounter(name)
        #logging.info('unstopped_tasks_counter: '+name+' '+str(len(cls.__big_counter_cache)))
        return cls.__big_counter_cache[name]
        
    #
    # instance methods
    #
    
    def get_name(self):
        """Return this topic's name. This is identical to calling key().name()
        """
        return self.key().name()
    
    def __check_task_policy_and_raise_pre_create_Task(self, created_by_guid, payload, do_not_store_artifact, claim_reservation_id=None):
        """Check the task policy to see if it is OK to create a new Task
        
        See create_Task() for explanation of arguments
        """
        if self.task_policy is None:
            return
            
        # enforce max tasks created per hour
        if 'max_num_tasks' in self.task_policy:
            #check that we have a task slot available
            n = self.num_creatable_tasks()
            if n <= 0:
                if claim_reservation_id is not None:
                    raise exception.TopicFullError('This topic is full. Please wait for more queue spaces to become available. In addition, the reserved Task ID provided was not valid or expired before it was claimed. (%i)' % (n))
                else:
                    raise exception.TopicFullError('This topic is full. Please wait for more queue spaces to become available. (%i)' % (n))
    
    def max_num_tasks(self):
        """If this topic uses the 'max_num_tasks' task policy rule,
        returns the maximum number of tasks in a state other than
        STOPPED_SUCCESS or STOPPED_FAILURE allowed per hour. If this topic
        does not use that task policy rule, then this method will return
        a very large number.
        """
        if self.task_policy is None or 'max_num_tasks' not in self.task_policy:
            return 1000000000000000
        else:
            return self.task_policy['max_num_tasks']
    
    def num_creatable_tasks(self):
        """Returns the APPROXIMATE number of available "slots" if this
        topic uses the 'max_num_tasks' task policy rule. If this topic
        does not use this policy rule then this method will return a very
        large number.
        """
        if self.task_policy is None or 'max_num_tasks' not in self.task_policy:
            return 1000000000000000
        
        if config.TASK_POLICY_MAX_NUM_TASKS_USES_SLOT_MODE:
            return max(0, self.task_policy['max_num_tasks'] - Topic.tasks_created_this_hour_counter(self.get_name()).get_value())
        else:
            return max(0, self.task_policy['max_num_tasks'] - Topic.unstopped_tasks_counter(self.get_name()).get_value())
    
    def create_Task(self, created_by_guid, payload, do_not_store_artifact, make_reservation=False, claim_reservation_id=None):
        """Create a new Task in this Topic, to be done by a Worker. Returns a Task which has already been stored in the datastore.
        
        :created_by_guid:
            the GUID of a Worker, the one which is posting this new task
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        :payload:
            A string containing any related data.
        
        :do_not_store_artifact:
            If True, the Worker performing the Task should not store any artifacts from the
            work, other than what gets put into this Task object upon completion.
        
        :make_reservation:
            Optional, may not be used with claim_reservation_id.
            If True, the Task created will be a reservation which can later be turned into
            a full task using claim_Task_reservation().
        
        :claim_reservation_id:
            Optional, may not be used with make_reservation.
            If provided, will attempt to retrieve the reserved Task with this id. If the Task
            still has a valid reservation, its payload and artifact storage settings will be
            replaced and updated--thus turning the reservation into a POSTED_NEW Task.
            If the reservation is invalid for whatever reason, this method will attempt to
            create a new Task as if claim_reservation_id had been None.
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid per the criteria in
          exception.ex_check_worker_guid_and_raise()
        
        * Raises an InvalidPayloadError if the payload is invalid per the criteria in
          exception.ex_check_payload_and_raise()
          
        * Raises an ArgumentError if both make_reservation and claim_reservation_id are used 
          at the same time
          
        """
        
        # check arguments
        exception.ex_check_worker_guid_and_raise(created_by_guid)
        exception.ex_check_payload_and_raise(payload)
        if make_reservation and claim_reservation_id is not None:
            raise exception.ArgumentError('Both make_reservation and claim_reservation_id were used together but their use is mutually exclusive')
        
        if claim_reservation_id is not None:
            #
            # try to claim an existing reservation
            #
            task = self.get_Task(TaskID(claim_reservation_id))
            if task is not None:
                # check if this is a valid reserved Task
                if task.state == TaskStateProperty.RESERVATION and task.created_by == created_by_guid:
                    # check timeout
                    if task.created_at < support.modeling.modeling_utcnow() - datetime.timedelta(seconds=config.TASK_RESERVATION_MAX_HOLD_TIME_SEC):
                        # reservation has expired
                        logging.info('Attempted to use expired reserved Task %s in Topic %s (created by %s at %s), cancelling' % (str(task.get_task_id()), task.topic_name, task.created_by, str(task.created_at)))
                        task.cancel_reservation(task.created_by)
                    else:
                        # reservation is good, update it
                        task.state = TaskStateProperty.POSTED_NEW
                        task.is_waiting = True
                        task.payload = payload
                        task.do_not_store_artifact = do_not_store_artifact == True
                        # save
                        task.put()
                        # we saw a worker...
                        KnownWorkerStatus.worker_was_seen(created_by_guid)
                        # all done
                        return task
                        
        
        # check task policy
        self.__check_task_policy_and_raise_pre_create_Task(created_by_guid, payload, do_not_store_artifact, claim_reservation_id)
        
        p = None
        
        # get the app name from the worker GUID
        created_by_app = _get_app_guid_from_worker_guid(created_by_guid)
        
        if make_reservation:
            state = TaskStateProperty.RESERVATION
            is_waiting = False
        else:
            state = TaskStateProperty.POSTED_NEW
            is_waiting = True
        
        task = Task(
            parent = p,
            topic_name = self.get_name(),
            state = state,
            is_waiting = is_waiting,
            remindable = False,
            reminder_count = 0,
            created_by = created_by_guid,
            created_by_app = created_by_app,
            created_at = support.modeling.modeling_utcnow(), # this is handled automatically by the datastore now
            payload = payload,
            do_not_store_artifact = do_not_store_artifact == True,
        )
        task.do_not_assign_to.append(created_by_guid)
        
        # increment waiting tasks counter
        Topic.tasks_created_this_hour_counter(self.get_name()).increment()
        Topic.unstopped_tasks_counter(self.get_name()).increment()
        
        # see if the result of this task can be retrieved from the cache
        if not make_reservation and self.task_policy is not None and 'can_cache' in self.task_policy and self.task_policy['can_cache'] == True:
            task.can_be_cached = True
            ctask = lask.services.cloudworker_svc.CacheWorker.get(task)
            if ctask is not None:
                task.state = ctask.state
                task.payload = ctask.payload
                task.is_waiting = ctask.is_waiting
#                task.created_by_app = created_by_app
#                task.created_by = created_by
#                task.updated_at = support.modeling.modeling_utcnow()
        
        # save it to the datastore
        task.put()
        
        # we saw a worker...
        KnownWorkerStatus.worker_was_seen_creating_a_task(created_by_guid, task.get_URI(True))
        
        return task
        

    def get_Tasks_query(self, keys_only=False):
        """Returns a db.Query suitable for retrieving the full list of Tasks in this Topic.
        This Query can be paginated, filtered, etc. just like any Query.
        
        :keys_only:
            Optional. Set to True to return only keys in the query.
            
        """
        q = db.Query(Task, keys_only)
        q.filter('topic_name =', self.get_name())
        #q.order('do_not_assign_to')
        #q.order('created_by')
        return q
    
    def get_mod_rejected_Tasks_count(self, num=1000):
        """Gets a count of Tasks which have been rejected by a moderator.
        
        :num:
            Optional. A limit on the number of tasks to retrieve.
        """
        q = self.__get_mod_rejected_Tasks_query()
        return q.count(num)
    
    def get_mod_rejected_Tasks_list(self, num=100):
        """Gets a list of Tasks which have been rejected by a moderator.
        
        :num:
            Optional. A limit on the number of tasks to retrieve.
        """
        return Topic.list_from_query(self.__get_mod_rejected_Tasks_query(), num=num)
    
    def __get_mod_rejected_Tasks_query(self):
        q = self.get_Tasks_query()
        q.order('-created_at')
        
        # add filters for different properties
        # q.filter('is_waiting =',True)
        q.filter('state =', TaskStateProperty.MOD_REJECTED)
        return q
    
    def get_waiting_Tasks_count(self, num=1000):
        """Gets the number of Tasks which are waiting to be accepted by a worker.
        
        :num:
            Optional. A limit on the number of tasks to count.
        """
        q = self.__get_waiting_Tasks_query()
        return q.count(num)
    
    def get_waiting_Tasks_list(self, num=1000):
        """Gets a list of Tasks which are waiting to be accepted by a worker.
        
        :num:
            Optional. A limit on the number of tasks to retrieve.
        """
        return Topic.list_from_query(self.__get_waiting_Tasks_query(), num=num)
    
    def __get_waiting_Tasks_query(self):
        q = self.get_Tasks_query()
        q.order('created_at')
        
        # add filters for different properties
        # q.filter('is_waiting =',True)
        q.filter('state =', TaskStateProperty.POSTED_NEW)
        return q
    
    def get_working_Tasks_count(self, num=1000):
        """Gets the number of Tasks which are waiting to be accepted by a worker.
        
        :num:
            Optional. A limit on the number of tasks to count.
        """
        q = self.__get_working_Tasks_query()
        return q.count(num)
    
    def get_working_Tasks_list(self, num=1000):
        """Gets a list of Tasks which are waiting to be accepted by a worker.
        
        :num:
            Optional. A limit on the number of tasks to retrieve.
        """
        return Topic.list_from_query(self.__get_working_Tasks_query(), num=num)
    
    def __get_working_Tasks_query(self):
        # add filters for different properties
        q = self.get_Tasks_query()
        q.order('created_at')
        q.filter('is_working =',True)
        # we only care about working tasks that have been updated reasonably recently
        #q.filter('updated_at >', support.modeling.modeling_utcnow() - datetime.timedelta(hours=LOST_TASK_TIMEOUT_HRS))
        #q.order('-updated_at')
        return q
    
    
    def get_failed_Tasks_list(self, num=1000):
        """Gets a list of Tasks which are stopped in an unsuccessful state.
        
        :num:
            Optional. A limit on the number of tasks to retrieve.
            
        """
        q = self.get_Tasks_query()
        
        # add filters for different properties
        # q.filter('is_waiting =',True)
        q.filter('state =', TaskStateProperty.STOPPED_FAILURE)
        q.order('-updated_at')
        
        return Topic.list_from_query(q, num=num)
    
    def get_successful_Tasks_list(self, num=1000):
        """Gets a list of Tasks which are stopped in a successful state.
        
        :num:
            Optional. A limit on the number of tasks to retrieve.
            
        """
        q = self.get_Tasks_query()
        
        # add filters for different properties
        # q.filter('is_waiting =',True)
        q.filter('state =', TaskStateProperty.STOPPED_SUCCESS)
        q.order('-updated_at')
        
        return Topic.list_from_query(q, num=num)
    
    def get_Tasks_list(self, num=None, start=None, order=None, filter_state=None, filter_assigned_to=None, filter_created_by=None):
        """Gets a list of Tasks, optionally paginating the results.
        
        :num:
            Optional. The maximum number of objects to return in the list. Defaults to unlimited,
            however this may cause the query to time out before completion.
        
        :start:
            Optional. A number specifying which object in the list to start with,
            expressed as an offset from the start of the list.
        
        :order:
            Optional. If specified, will try to order the list by the property specified.
            To order in reverse, preceed the property name with a minus sign.
            
            For example, to sort alphabetically by the GUID of the Worker which created
            each object, set order to "created_by". To sort that in reverse order
            set order to "-created_by"
        
        :filter_state:
            Optional. Specifies a filter for the 'state' property of all Tasks in the list.
            
            The filter is specified as an array in the form:
                [op,value]

            ...where op is a string having one of the following values:
                "=","!=",">",">=","<","<="

            ...and value is any value.
            
            When the list of objects is being generated, each object's 'state' property
            will be compared to the value specified in the filter, using the op in the filter.

            For example, if the parameter is set to ["=","Foo"] then only objects having a
            'state' of "Foo" will be included.
        
        :filter_assigned_to:
            Optional. Specifies a filter for the 'assigned_to' property of all Tasks in the list.
            See the filter_state argument for details on how to use a filter.
        
        :filter_created_by:
            Optional. Specifies a filter for the 'created_by' property of all Tasks in the list.
            See the filter_state argument for details on how to use a filter.
            
        
        * Raises a TypeError if start or num are not numbers
        * Raises an ValueError if start or num are negative
        * Raises a PropertyError if order is specified, but is not a valid property of the objects being listed
        """
        q = self.get_Tasks_query()
        
        # add filters for different properties
        filters = {}
        if filter_state is not None:
            filters['state'] = filter_state
        if filter_assigned_to is not None:
            filters['assigned_to'] = filter_assigned_to
        if filter_created_by is not None:
            filters['created_by'] = filter_created_by
        
        return Topic.list_from_query(q, num, start, order=order, filters=filters)
    
    
    def assign_Task(self, assignee_guid):
        """A Worker wants a new task. Do something about it!
        This could even be a worker we already assigned a task to (it forgot about it, needs a reminder).

        A Worker will never be assigned a task created by itself.
        
        This method will load an appropriate Task object, alter it to indicate that it is being offered
        to a particular Worker, and save it.
        
        It will return the offered Task or, if no suitable Task is available, this method returns None.
        
        :assignee_guid:
            the GUID of a Worker, the one which is posting this new task
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid per the criteria in exception.ex_check_worker_guid_and_raise()
        
        """
        
        #check arguments
        exception.ex_check_worker_guid_and_raise(assignee_guid)

        # we saw a worker...
        KnownWorkerStatus.worker_was_seen(assignee_guid)
        
        # look for Tasks that were offered to this Worker
        # for which a reminder is needed
        q = db.Query(Task)
        q.filter('topic_name =', self.get_name())
        q.filter('offered_to =', str(assignee_guid))
        q.filter('remindable =', True)
        obj = q.get()
        
        if obj is None or obj.state == TaskStateProperty.MOD_REJECTED:
            # no reminders needed for existing Task offers
            # so look for Tasks needing a reminder which have already been assigned
            q = db.Query(Task)
            q.filter('topic_name =', self.get_name())
            q.filter('assigned_to =', str(assignee_guid))
            q.filter('remindable =', True)
            obj = q.get()
        
        if obj is None or obj.state == TaskStateProperty.MOD_REJECTED:
            # no reminders needed, so look for a new Task to offer
            q = db.Query(Task)
            q.filter('topic_name =', self.get_name())
            q.filter('state =', TaskStateProperty.POSTED_NEW)
            
            #q.filter('created_by !=', assignee_guid)
            #q.order('created_by')
            
            #
            # we don't want to offer the same worker the same task over and over again if they've already declined it
            # unfortunately, checking the do_not_assign_to list in the
            # query means we have to sort the results by the do_not_assign_to
            # field. This is not what we want. We need the results to be sorted
            # by creation date, ascending.
            # So, as a crude workaround, we'll retrieve one result and then
            # check if the assignee is in the do_not_assign_to list in code
            # If the assignee is in the list, we'll just retrieve the next
            # result. If there are tons of tasks in the list with this
            # assignee in the do_not_assign_to list then this method will
            # time out! The belief is that since state must be POSTED_NEW there
            # should always be one, or maybe two objects that have the assignee
            # in the do_not_assign_to list.
            #
            # q.filter('do_not_assign_to !=', assignee_guid)
            #q.order('do_not_assign_to')
            q.order('created_at')
            
            keep_looking = True
            while keep_looking:
                obj = q.get()
                if obj is not None:
                    if assignee_guid in obj.do_not_assign_to:
                        # the assignee is in the list of workers 
                        q.with_cursor(q.cursor())
                    else:
                        keep_looking = False
                else:
                    keep_looking = False
    
        #
        # if we've found a candidate...
        #
        if obj is not None:
            #
            # define a transaction method to
            # see if this worker needs a reminder
            # and then mark it as being reminded to the specified worker
            #
             
            def txn1(assignee_guid, topic, task_id):
                # get_by_id is ALWAYS consistent in HRD so we use it to ensure
                # that some other request hasn't snatched up this Task in the mean time
                obj = Task.get_by_id(task_id)
                    
                if obj is not None and (obj.assigned_to == assignee_guid or obj.offered_to == assignee_guid):
                    obj.state = TaskStateProperty.ASSIGNMENT_REMINDER_OFFERED
                    obj.is_waiting = False
                    obj.is_working = False
                    obj.is_stopped = False
                    
                    obj.remindable = True
                    obj.reminder_count = obj.reminder_count + 1
                    obj.offered_to = assignee_guid
                    obj.offered_at = support.modeling.modeling_utcnow()
                    obj.assigned_to = None
                    obj.assigned_at = None
                    obj.est_stop_at = None
                    obj.put()
                elif obj is not None and obj.state == TaskStateProperty.POSTED_NEW:
                    obj.state = TaskStateProperty.ASSIGNMENT_OFFERED
                    obj.is_waiting = False
                    obj.is_working = False
                    obj.is_stopped = False
                    
                    obj.remindable = True
                    obj.offered_to = assignee_guid
                    obj.offered_at = support.modeling.modeling_utcnow()
                    obj.put()
                else:
                    obj = None
                return obj
            # end txn1
            obj = db.run_in_transaction(txn1, assignee_guid, self, obj.key().id())
    
        return obj
    
    def get_Task(self, task_id):
        """Retrieves a single task by its ID. Use this method to retrieve a Task for purposes
        of then calling accept, delegate, progress, or stop
        
        :task_id:
            the ID of the Task
        
        * Raises an InvalidTaskIDError if task_id is invalid per exception.ex_check_task_id_and_raise()
        
        """
        # check arguments
        exception.ex_check_task_id_and_raise(task_id)
        # for now, this is just an alias to Model.get_by_id
#        q = db.Query(Task)
#        q.ancestor(db.Key.from_path('Task', task_id))
#        q.filter('topic_name =', self.get_name())
#        return q.get()
        return Task.get(db.Key.from_path('Task', task_id))

    def __eq__(self, other) :
        """When comparing Topics, they are the same if they:
            1. are both instances of the same class
            2. have the same properties and values
            3. have the same key
        """
        if not isinstance(other, Topic):
            return False

        if not hasattr(other, 'to_dict'):
            return False

        if self.to_dict() != other.to_dict():
            return False

        if self.key() != other.key():
            return False

        return True
    
    def get_URI(self, full):
        """Returns a URI by which this instance may be accessed, or None if no such
        URI is available.
        
        :full:
            Whether or not to return a "full" URI from uri_for()
        """
        return uri_for(self.__class__.__name__, _full=full, topic_name=self.key().name())
    
    def to_dict(self):
        d = super(self.__class__, self).to_dict()
        d['num_creatable_tasks'] = self.num_creatable_tasks()
        return d

class Task(support.modeling.GenericLogEntryModel):
    """A Task is a way of describing something that needs to be done. Tasks are
    posted by Workers and assigned to workers according to the logic encompassed
    in the TaskRouter class.
    
    Probably the first important property of a Task is state. See the class
    variables of the TaskStateProperty for a payload of all of the possible states
    and how the impact the rest of the Task class.
    """
    
    WORKING_TASK_STATES = [
        TaskStateProperty.ASSIGNMENT_ACCEPTED_NEW,
        TaskStateProperty.ASSIGNMENT_ACCEPTED_REMINDER,
        TaskStateProperty.ASSIGNED_UNKNOWN,
        TaskStateProperty.IN_PROGRESS_GOOD,
        TaskStateProperty.IN_PROGRESS_WARNING,
    ]
    "Convenience list of TaskStateProperty values in which a Task can be in while 'running' (being processed by a worker)"
    
    #
    # Required properties
    #
 
    topic_name = db.StringProperty(required=True)
    "The Task Topic's name"
 
    state = TaskStateProperty()
    "The current state of this Task. Required. See docs for each TaskStateProperty variable"
    
    is_waiting = db.BooleanProperty(required=False, default=True)
    "Will be True if the state property is POSTED_NEW"
    
    is_working = db.BooleanProperty(required=False, default=False)
    "Will be True if the state property is one of ASSIGNMENT_ACCEPTED_NEW, ASSIGNMENT_ACCEPTED_REMINDER, IN_PROGRESS_GOOD, or IN_PROGRESS_WARNING"
    
    is_stopped = db.BooleanProperty(required=False, default=False)
    "Will be True if the state property is one of STOPPED_SUCCESS or STOPPED_FAILURE"
    
    remindable = db.BooleanProperty(required=True)
    "Whether or not the Task is in a state where a Worker can be reminded of it"
 
    created_by = support.modeling.WorkerGUID(required=True)
    "The Worker which first posted this Task. Since all Tasks must come from a Worker, this is required."
    
    created_by_app = db.StringProperty(required=False, default='')
    "The last part of the creating worker's GUID, e.g. www.weblab or lon.weblab"
 
    created_at = support.modeling.CreatedAtDateTimeProperty(required=True)
    "The date/time when the Worker indicated in created_by first posted this Task"
 
    updated_at = support.modeling.ModifiedAtDateTimeProperty(required=True)
    "The date/time when the this task was last updated in any way"
    
    #payload = support.modeling.UnparsedJSONObjectProperty(required=True)
    payload = support.modeling.ParsedJSONObjectProperty(required=True)
    "An object describing the Task in some fashion. The content is not looked at by Lask or the Supervisor."
    
    
    #
    # Optional properties
    #
    
    reminder_count = db.IntegerProperty()
    "The number of times the assigned Worker has been reminded of this task"
    
    assignee_state = support.modeling.UnparsedJSONObjectProperty()
    "An optional object the assigned_to Worker can use to store state information. The content is not looked at by Lask or the Supervisor."
    
    offered_to = support.modeling.WorkerGUID()
    "The most recent Worker to which this Task has been offered assignment."
    
    offered_at = support.modeling.OccuranceTimeProperty()
    "The date/time when the Worker specified in offered_to was offered the task"
    
    do_not_assign_to = support.modeling.WorkerGUIDList(default=[])
    "A list of zero or more Worker GUIDs who should not be assigned this Task (usually because they have declined it in the past)"
    
    assigned_to = support.modeling.WorkerGUID()
    "The Worker to which the Task has been assigned"
    
    assigned_at = support.modeling.OccuranceTimeProperty()
    "The date/time when the Worker specified in assigned_to was assigned this Task"
    
    delegated_at = support.modeling.OccuranceTimeProperty()
    "The date/time when the Worker specified in assigned_to stopped working on this task and requested it be delegated"
    
    delegated_as = db.ReferenceProperty(reference_class=db._SELF_REFERENCE)
    "If this Task has been delegated, a reference to the Task copy with which it was delegated"
    
    declared_unknown_at = support.modeling.OccuranceTimeProperty()
    "The date/time when this task's state was declared unknown by the Supervisor"
    
    last_progress_message = db.StringProperty()
    "The last progress message reported by the assigned_to Worker."
    
    last_progress_at = support.modeling.OccuranceTimeProperty()
    "The date/time when the assigned_to Worker last reported progress."
    
    stop_message = db.StringProperty()
    "A message reported by the assigned_to Worker when the Task was stopped."
    
    stopped_at = support.modeling.OccuranceTimeProperty()
    "The date/time when the assigned_to Worker stopped working on the Task"
    
    est_stop_at = support.modeling.OccuranceTimeProperty()
    "The date/time when the assigned_to Worker estimates the Task will be complete"
    
    do_not_store_artifact = db.BooleanProperty(default=False)
    "If True, the Worker performing the Task should not store any artifacts from the work, other than what gets put into this Task object upon completion."
    
    can_be_cached = db.BooleanProperty(default=False)
    "If True, this Task's results can be cached on the server."
    
    is_cached = db.BooleanProperty(default=False)
    "If True, this Task's results came from the cache rather than a live Worker"
    
    #
    # instance methods
    #
    
    def get_topic(self):
        """Returns the Topic to which this Task belongs
        
        * Raises a TopicDeletedError if the Topic which contained this Task has been deleted
        
        """
        
        p = Topic._int_get_by_name(self.topic_name)
            
        if p is not None:
            return p
        else:
            raise exception.TopicDeletedError('The Topic containing Task %r has been deleted, but the Task was not.' % (self))
            
    
    def get_task_id(self):
        """Returns an ID suitable for use with Task.get_by_task_id
        """
        return self.key().id()
    
    
    def reject(self):
        """ Rejects a task on moderation grounds
        """
        logging.info('Task: User has requested that Task %s be rejected. Setting state = MOD_REJECTED' % (self.key().id_or_name()))
        self.state = TaskStateProperty.MOD_REJECTED
        self.is_working = False
        self.remindable = False
        self.put()
        return self
    
    def accept(self, assignee_guid, est_stop_at):
        """Indicates that a Worker has accepted the assignment of a task.
        
        This method will check that the Task has been properly offered to
        the indicated Worker, alter the Task to indicate the worker has accepted it and save the Task.
        
        It returns nothing.
        
        :assignee_guid:
            the GUID of the worker accepting the new Task
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        :est_stop_at:
            The date/time when the Worker estimates the task will be complete. If a number, this value will
            be interpreted by datetime.datetime.utcfromtimestamp() (see http://docs.python.org/library/datetime.html#datetime.datetime.utcfromtimestamp).
            If a string, this value will be interpreted by datetime.datetime.strptime() (see http://docs.python.org/library/datetime.html#datetime.datetime.strptime)
            and will expect the string to be in the format "%a %b %d %H:%M:%S %Y"
            
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid per exception.ex_check_worker_guid_and_raise()
        
        * Raises a TaskNotOfferedError if the Worker was not offered the task (including if it
        was offered to a different Worker)
        
        * Raises an InvalidEstimatedStopError if est_stop_at is invalid per exception.ex_check_est_stop_and_raise()
        
        * Raises a WrongTaskStateError if the task is not in a state allowing it to be accepted.
        """
        
        # check arguments
        exception.ex_check_state_and_raise(self.state, [
            TaskStateProperty.ASSIGNMENT_OFFERED,
            TaskStateProperty.ASSIGNMENT_REMINDER_OFFERED,
        ], 'accept')
        exception.ex_check_worker_guid_and_raise(assignee_guid)
        if self.offered_to != assignee_guid:
            raise exception.TaskNotOfferedError('This task was not offered to the specified Worker')
        est_stop_at = support.modeling.normalize_datetime(est_stop_at)
        exception.ex_check_est_stop_and_raise(est_stop_at)
        
        # change the state
        if self.state == TaskStateProperty.ASSIGNMENT_REMINDER_OFFERED:
            self.state = TaskStateProperty.ASSIGNMENT_ACCEPTED_REMINDER
        else:
            self.state = TaskStateProperty.ASSIGNMENT_ACCEPTED_NEW
        self.is_waiting = False
        self.is_working = True
        self.is_stopped = False
        
        self.remindable = True
        self.assigned_to = assignee_guid
        self.assigned_at = support.modeling.modeling_utcnow()
        self.est_stop_at = est_stop_at
        self.declared_unknown_at = None
        
        # save it to the datastore
        self.put()
        
        # we saw a worker...
        KnownWorkerStatus.worker_was_seen_accepting_a_task(assignee_guid, self.get_URI(True), self.est_stop_at)
    
    def cancel_reservation(self, worker_guid):
        """If this is a reserved Task, cancels the reservation; otherwise does nothing.
        
        :worker_guid:
            The GUID of the worker cancelling this reservation.
            
        """
        if self.state != TaskStateProperty.RESERVATION:
            return
        
        return self._impl_stop(assignee_guid=worker_guid, stop_message="Reservation cancelled", payload=self.payload, success=False)
    
    def decline(self, assignee_guid):
        """Indicates that an assigned Worker cannot accept the offered Task. The system may
        offer it again to a different Worker later.
        
        It returns nothing.
        
        :assignee_guid:
            the GUID of the worker declining the new Task
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid per exception.ex_check_worker_guid_and_raise()
        
        * Raises a TaskNotOfferedError if the Worker was not offered the task (including if it
        was offered to a different Worker)
        
        * Raises a WrongTaskStateError if the task is not in a state allowing it to be declined.
        """
        
        # check arguments
        exception.ex_check_state_and_raise(self.state, [
            TaskStateProperty.ASSIGNMENT_OFFERED,
            TaskStateProperty.ASSIGNMENT_REMINDER_OFFERED,
        ], 'accept')
        exception.ex_check_worker_guid_and_raise(assignee_guid)
        if self.offered_to != assignee_guid:
            raise exception.TaskNotOfferedError('This task was not offered to the specified Worker')

        # change the state
        self.state = TaskStateProperty.POSTED_NEW
        self.is_waiting = True
        self.is_working = False
        self.is_stopped = False
        
        self.remindable = False
        self.offered_to = None
        self.offered_at = None
        self.do_not_assign_to.append(assignee_guid)
        
        # save it to the datastore
        self.put()
        
        # we saw a worker...
        KnownWorkerStatus.worker_was_seen(assignee_guid)
    
    def delegate(self, assignee_guid):
        """Indicates that an assigned Worker wants the task it was assigned to be delegated
        to a different Worker (to be chosen by the TaskRouter using some internal logic).
        
        This method will check that the Task has been assigned to
        the indicated Worker, alter the Task to indicate that it has been delegated and save it.
        It will then post a new Task on the indicated Worker's behalf, with the same topic and
        payload as the delegated Task.
        
        It will return the delegated Task upon success or raise an exception upon failure.
        
        :assignee_guid:
            the GUID of the worker delegating the Task
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        * Raises a TaskNotAssignedError if the Worker is not the one assigned to the task (including if it
        is not assigned or is assigned to a different Worker)
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid per exception.ex_check_worker_guid_and_raise()
        
        * Raises a WrongTaskStateError if the task is not in a state allowing delegation.
        """
        
        # check arguments
        exception.ex_check_state_and_raise(self.state, Task.WORKING_TASK_STATES, 'delegate')
        exception.ex_check_worker_guid_and_raise(assignee_guid)
        if self.assigned_to != assignee_guid:
            raise exception.TaskNotAssignedError('This task was not assigned to the specified Worker and so cannot be delegated by that Worker')
        
        # change the state
        self.state = TaskStateProperty.DELEGATED
        self.is_waiting = False
        self.is_working = False
        self.is_stopped = False
        
        self.remindable = False
        self.declared_unknown_at = None
        self.delegated_at = support.modeling.modeling_utcnow()

        # decrement tasks counter
        Topic.unstopped_tasks_counter(self.topic_name).decrement()
        
        # create a new task so that some other worker can be assigned this task
        self.delegated_as = self.get_topic().create_Task(created_by_guid=self.assigned_to, payload=self.payload, do_not_store_artifact=self.do_not_store_artifact)
        self.delegated_as.do_not_assign_to = self.do_not_assign_to
        self.delegated_as.do_not_assign_to.append(self.assigned_to)
        
        # save it to the datastore
        self.put()
        
        # we saw a worker...
        KnownWorkerStatus.worker_was_seen(assignee_guid)
        
        return self.delegated_as
    
    def progress(self, assignee_guid, progress_message, progress_payload=None, est_stop_at=None, assignee_state=None, warning=False):
        """Indicates that the Worker has a progress report on its Task. This will either indicate
        good forward progress toward successful completion or a warning that something is wrong
        (but not wrong enough to warrant stopping the task -- see stop(). It also requires that the
        Worker give an estimated time at which it will successfully complete the Task.
        
        This method will check that the Task has been assigned to
        the indicated Worker, alter the Task to record the progress report and save it.
        
        It returns nothing.
        
        :assignee_guid:
            the GUID of the worker providing the progress report
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        :progress_message:
            some message from the Worker about the Task's current progress
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        :progress_payload:
            Optional. If specified, will replace the Task payload with the supplied object.
            This should be the entire payload object, with any incremental updates.
            If omitted, the task payload will remain as specified by the Task's creator.
        
        :est_stop_at:
            Optional. The date/time when the Worker estimates the task will be complete. If a number, this value will
            be interpreted by datetime.datetime.utcfromtimestamp() (see http://docs.python.org/library/datetime.html#datetime.datetime.utcfromtimestamp).
            If a string, this value will be interpreted by datetime.datetime.strptime() (see http://docs.python.org/library/datetime.html#datetime.datetime.strptime)
            and will expect the string to be in the format "%a %b %d %H:%M:%S %Y". If omitted,
            the task will keep the estimate stop time given when the task was accepted.
        
        :assignee_state:
            an optional object which the assignee can use to store some information about
            its state at the time this progress report was made. This object should be simple enough
            that it can be JSON-encoded (not pickled)
        
        :warning:
            whether or not this progress is a warning of a (possible) problem, will be interpreted as a boolean
        
        
        * Raises a TaskNotAssignedError if the Worker is not the one assigned to the task (including if it
        is not assigned or is assigned to a different Worker)
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid by the criteria in exception.ex_check_worker_guid_and_raise()
        
        * Raises an InvalidMessage if the progress_message is invalid by the criteria in exception.ex_check_message_and_raise()
        
        * Raises an InvalidEstimatedStopError if est_stop_at is invalid by the criteria in exception.ex_check_est_stop_and_raise()
        
        * Raises a WrongTaskStateError if the Task cannot currently receive a progress report.
        
        """
        
        # check arguments
        exception.ex_check_state_and_raise(self.state, Task.WORKING_TASK_STATES, 'progress')
        exception.ex_check_worker_guid_and_raise(assignee_guid)
        if self.assigned_to != assignee_guid:
            raise exception.TaskNotAssignedError('This task was not assigned to the specified Worker and so cannot have a progress report by that Worker')
        exception.ex_check_message_and_raise(progress_message)
        if est_stop_at is not None:
            est_stop_at = support.modeling.normalize_datetime(est_stop_at)
            exception.ex_check_est_stop_and_raise(est_stop_at)
        if progress_payload is not None:
            exception.ex_check_payload_and_raise(progress_payload)
        
        # change the state
        if warning:
            self.state = TaskStateProperty.IN_PROGRESS_WARNING
        else:
            self.state = TaskStateProperty.IN_PROGRESS_GOOD
        self.is_waiting = False
        self.is_working = True
        self.is_stopped = False
        
        self.remindable = True
        self.last_progress_message = progress_message
        self.last_progress_at = support.modeling.modeling_utcnow()
        self.assignee_state = assignee_state
        if progress_payload is not None:
            self.payload = progress_payload
        if est_stop_at is not None:
            self.est_stop_at = est_stop_at
        self.declared_unknown_at = None
        
        # save it to the datastore
        self.put()

        # we saw a worker...
        KnownWorkerStatus.worker_was_seen_progressing_a_task(assignee_guid, self.est_stop_at)
    
    def stop(self, assignee_guid, stop_message, payload=None, success=True):
        """Indicates that the Worker has stopped work on the specified Task. The condition of the stop
        is either success or failure, and the Worker can include a message describing something about the
        stop. The Task's payload can also be updated at the time of a stop.
        
        This method will check that the Task has been assigned to
        the indicated Worker, alter the Task to mark it as stopped (and set the mesage, payload) and save it.
        
        It returns nothing.
        
        :assignee_guid:
            the GUID of the worker stopping the Task
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        :success:
            whether or not this is a successful stop (True) or a failure (False)
            Interpreted as a bool
        
        :stop_message:
            a message from the Worker about the stop
            The Task model record will receive have this value assigned to a StringProperty,
            this needs to be string-like
        
        :payload:
            Optional. If specified, this object becomes the new value for the Task's Payload object
            (presumably it will bear some resemblance to what it was when the Task started). The object
            should be simple enough that it can be JSON-encoded (not pickled).
            If no payload is specified the existing payload of the Task will remain unchanged.
        
        * Raises a TaskNotAssignedError if the Worker is not the one assigned to the task (including if it
        is not assigned or is assigned to a different Worker)
        
        * Raises an InvalidWorkerGUIDError if assignee_guid is invalid per exception.ex_check_worker_guid_and_raise()
        
        * Raises an InvalidPayloadError the new payload is invalid per exception.ex_check_payload_and_raise()
        
        * Raises a WrongTaskStateError if the Task cannot be stopped.
        
        """
         
        # check arguments
        exception.ex_check_state_and_raise(self.state, Task.WORKING_TASK_STATES, 'stop')
        exception.ex_check_worker_guid_and_raise(assignee_guid)
        if payload is not None:
            exception.ex_check_payload_and_raise(payload)
        if self.assigned_to != assignee_guid:
            raise exception.TaskNotAssignedError('This task was not assigned to the specified Worker and so cannot be stopped by that Worker')
            
        # truncate long stop_messages
        if len(stop_message) > 500:
            stop_message = stop_message[:496]+'..'
        
        exception.ex_check_message_and_raise(stop_message)
        
        self._impl_stop(assignee_guid, stop_message, payload, success)

        # see if the result of this task can be stored in the cache
        if self.can_be_cached and success:
            lask.services.cloudworker_svc.CacheWorker.put(self)
    
    def _impl_stop(self, assignee_guid, stop_message, payload, success):
        """ This is the internal logic for the stop() method. It is also used
        by the CacheWorker service to inject completed tasks from the cache.
        """
        # change the state
        self.assigned_to = assignee_guid
        if success:
            self.state = TaskStateProperty.STOPPED_SUCCESS
        else:
            self.state = TaskStateProperty.STOPPED_FAILURE
        self.is_waiting = False
        self.is_working = False
        self.is_stopped = True
        
        self.remindable = False
        self.last_progress_message = stop_message
        self.last_progress_at = support.modeling.modeling_utcnow()
        self.stopped_at = self.last_progress_at
        if payload is not None:
            self.payload = payload
        self.stop_message = stop_message
        self.declared_unknown_at = None
        
        # save it to the datastore
        self.put()
        
        # decrement tasks counter
        Topic.unstopped_tasks_counter(self.topic_name).decrement()
        
        # we saw a worker...
        KnownWorkerStatus.worker_was_seen_stopping_a_task(assignee_guid, self.get_URI(True), success)
        


    def to_dict(self):
        """Return a serializable dict describing this Task
        appropriately.
        """
        d = super(Task, self).to_dict()
        #if hasattr(d, 'is_waiting'):
        if 'is_waiting' in d:
            del(d['is_waiting'])
        #if hasattr(d, 'is_working'):
        if 'is_working' in d:
            del(d['is_working'])
        #if hasattr(d, 'is_stopped'):
        if 'is_stopped' in d:
            del(d['is_stopped'])
        d['created_at_friendly'] = str(self.created_at)
        d['updated_at_friendly'] = str(self.updated_at)
        return d
        
    def __eq__(self, other) : 
        """When comparing Tasks, they are the same if they:
            1. are both instances of the same class
            2. have the same properties and values
            3. are in the same topic
        """
        if not isinstance(other, Task):
            return False

        if not hasattr(other, 'to_dict'):
            return False

        if self.to_dict() != other.to_dict():
            return False

        if self.topic_name != other.topic_name:
            return False
            
        return True
    
    def get_URI(self, full):
        """Returns a URI by which this instance may be accessed, or None if no such
        URI is available.
        
        :full:
            Whether or not to return a "full" URI from uri_for()
        """
        return uri_for(self.__class__.__name__, _full=full, topic_name=self.topic_name, task_id=self.get_task_id())

class LabDataPath():
    """A class used to store paths to LabDataContainers.
    """

    RANDOM_ID_PLACEHOLDER = '*'
    PATH_SEPARATOR = ','
    MAX_DEPTH = 6
    MAX_ELEMENT_LENGTH = 90
    
    __path_list = None
    __k = None
    __compatible_k = None
    __parent_path = None
    
    #
    # class methods
    #
    @classmethod
    def from_key(cls, k):
        """Attempts to construct a LabDataPath from a Key.
        
        * Raises a BadKeyError if the Key does not represent a consistent chain of LabDataContainers
        """
        if not isinstance(k, db.Key):
            raise db.BadKeyError('Supplied argument is a %s, but a Key is required.' % (type(k)))
        
        ldp = None
        
        if k.kind() != 'LabDataContainer':
            raise db.BadKeyError('Supplied Key is for an entity of kind %s, but LabDataPaths can only be created from Keys to LabDataContainer entities.' % (k.kind(), L))
            
        elif ENABLE_LDC_COMPATIBILITY_MODE and (k.name() is None or LabDataPath.PATH_SEPARATOR not in k.name()):
            # begin ENABLE_LDC_COMPATIBILITY_MODE
            L = []
            p = k
            while p is not None:
                #if p.name() is None:
                #    raise db.BadKeyError('Supplied Key has an ancestor (%s:%i) which does not have a name, but LabDataPaths can only be created from Keys using exclusively names (not IDs). Path up to problem is: %s' % (p.kind(), p.id(), L))
                if p.kind() != 'LabDataContainer':
                    raise db.BadKeyError('Supplied Key has an ancestor which is is of kind %s, but LabDataPaths can only be created from Keys exclusively having LabDataContainer ancestors. Path up to problem is: %s' % (p.kind(), L))
                if str(p.name()) == 'content':
                    raise db.BadKeyError('Supplied Key has an ancestor which is named %s, but that name is a reserved word. Path up to problem is: %s' % (p.id_or_name(), L))
                if str(p.name()) == LabDataPath.RANDOM_ID_PLACEHOLDER:
                    raise db.BadKeyError('Supplied Key has an ancestor which is named %s, but that name is a reserved word. Path up to problem is: %s' % (p.id_or_name(), L))
                L.insert(0, p.id_or_name())
                p = p.parent()
            ldp = LabDataPath(*L)
            # end ENABLE_LDC_COMPATIBILITY_MODE
        else:
            if LabDataPath.PATH_SEPARATOR not in k.name() and hasattr(k, 'parent') and k.parent() is not None:
                raise db.BadKeyError('Supplied Key is for a LabDataContainer, but the Key name ("%s") cannot be interpreted as a LabDataPath. An error may have occurred when trying to create the Key.' % (k.name()))
            else:
                L = k.name().split(LabDataPath.PATH_SEPARATOR)
                ldp = LabDataPath(*L)
            
        return ldp
    
    @classmethod
    def from_URL_quoted(cls, *args):
        """Returns a LabDataPath, given a list of path components. Each one will
        be run through urllib.unquote() before they are sent to the LabDataPath constructor.
        
        :L:
            A list of path components.
        
        * Raises BadKeyError if there is a problem with the path arguments.
        """
        from_path_args = []
        for arg in args:
            from_path_args.append(urllib.unquote(arg))
        return LabDataPath(*from_path_args)
        
    #
    # instance methods
    #
    
    # constructor
    def __init__(self, *args):
        """Expects a comma-separated list of LabDataContainer names, in path order.
        
        * Raises BadKeyError or BadValueError if there is a problem with the path arguments.
        
        """
        self.__path_list = list(args)
        kind = 'LabDataContainer'
        exception.ex_check_path_elements_and_raise(args)
        
        self.__k = db.Key.from_path(kind, self.__path_str_from_list(args))
        
        # begin ENABLE_LDC_COMPATIBILITY_MODE
        if ENABLE_LDC_COMPATIBILITY_MODE:
            from_path_args = []
            
            for arg in args:
                from_path_args.append(kind)
                from_path_args.append(arg)
            
            self.__compatible_k = db.Key.from_path(*from_path_args)
        # end ENABLE_LDC_COMPATIBILITY_MODE
        
        
    def get_key(self):
        """Returns a db.Key corresponding to this LabDataPath
        """
        return self.__k;
    
    def get_ancestor_keys(self):
        """Returns a list of db.Keys corresponding to all of this path's ancestors.
        If the path contains no ancestors, an empty list will be returned
        """
        L = []
        names = self.to_list()
        max = len(names)
        for i in range(1,max):
            L.append(db.Key.from_path('LabDataContainer', self.__path_str_from_list(names[:i ])))
        return L
        
        
    def get_compatible_key(self):
        """Returns a db.Key corresponding to this LabDataPath which is compatible
        with retrieving old-style LDCs.
        """
        # begin ENABLE_LDC_COMPATIBILITY_MODE
        if ENABLE_LDC_COMPATIBILITY_MODE:
            return self.__compatible_k
            # end ENABLE_LDC_COMPATIBILITY_MODE
        else:
            return None
    
    
    def to_list(self):
        """Returns a list of LabDataContainer names for this LabPath, in path order,
        ending with the name of this LabDataPath.
        
        You should be able to reconstruct this LabDataPath as follows:
        
        path1 = LabDataPath('ay', 'bee', 'see')
        path2 = LabDataPath(*path1.to_list())
        self.assertTrue(path1 == path2)
        
        """
        return self.__path_list
    
    def last_name(self):
        """Returns the final name in the path.
        """
        return self.__path_list[-1]
    
    def get_parent_path(self):
        """Returns a LabDataPath representing the parent of this LabDataPath,
        or None if this LabDataPath has no parent.
        """
        if self.__parent_path is None:
            L = self.to_list()
            if len(L) > 1:
                self.__parent_path = LabDataPath(*L[:-1])
        return self.__parent_path
        
    
    def get_parent_path_str(self):
        """Returns the string representation of this LabDataPath's parent
        """
        L = self.to_list()
        if len(L) > 0:
            return self.__path_str_from_list(L[:-1])
        else:
            return ''
    
    def __str__(self):
        """String representation of a LabDataPath
        """
        return self.__path_str_from_list(self.to_list())
    
    def __path_str_from_list(self, L):
        return LabDataPath.PATH_SEPARATOR.join(map(str,L))

class BinaryBlock(db.Model):
    """BinaryBlock are opaque storage containers used to store publicly-served arbitrary strings of bits.
    """
    data = db.BlobProperty(required=False)
    linked_blob = blobstore.BlobReferenceProperty()
    
    __stringio = None
    def read(self, bufsize):
        """ Read from this BinaryBlock as if it were a file.

        Important: when sending the content of a BinaryBlock to a webapp handler you should use send_to_handler() instead of file-like IO.

        * Raises IOError if the data cannot be read OR if the content of this BinaryBlock is linked to another blob
        """
        if self.linked_blob is not None:
            raise IOError('Cannot set data for this BinaryBlock because it is acting as a link to a read-only blobstore.BlobInfo object.')

        else:
            if self.__stringio is None:
                self.__stringio = StringIO.StringIO(self.data)
            return self.__stringio.read(bufsize)
        
    def write(self, data):
        """ Write to this BinaryBlock as if it were a file
        Note that this implicitly discards any linked blob data.
        """
        if self.linked_blob is not None:
            self.linked_blob = None

        if self.__stringio is None:
            self.__stringio = StringIO.StringIO(self.data)
        return self.__stringio.write(data)


    def send_to_handler(self, handler, content_type=None):
        """ Sends the entire content of this BinaryBlock out to a client
        via the specified handler object.

        :handler:
            A RequestHandler object. If this BinaryBlock is a link to a blobstore object
            then the handler must have a send_blob() method which accepts a blobstore.BlobInfo object.
            All handlers which subclass blobstore_handlers.BlobStoreDownloadHandler have this capability.

        :content_type:
            Optional. If specified, the handler's response content type will be set to this value.

        """
        if self.is_link():
            handler.send_blob(self.linked_blob, content_type=content_type)

        else:
            if content_type is not None:
                handler.response.content_type = str(content_type)

            data = self.read(INCOMING_CONTENT_BUFFER_SIZE)
            while data:
                handler.response.write(data)
                data = self.read(INCOMING_CONTENT_BUFFER_SIZE)
    
    def close(self):
        """ Do this when you are done.

        Important: when sending the content of a BinaryBlock to a webapp handler you should use send_to_handler() instead of file-like IO.

        """

        if not self.linked_blob:
            if self.__stringio is None:
                return
            
            self.data = self.__stringio.getvalue()
            self.__stringio.close()
            self.__stringio = None


    def link_to(self, key):
        """ Turns this BinaryBlock into a link to a blobstore.BlobInfo object,
        or breaks such a link if it exists.

        :key:
            If None breaks any existing link to a blobstore.BlobInfo object, or
            if it is a blobstore.BlobKey creates such a link and discards any local blob content.
            If this is a blobstore.BlobInfo then this method acts the same as if you had called link_to(key.key())

        """
        if key is None:
            self.linked_blob = None
        else:
            if isinstance(key, blobstore.BlobInfo):
                key = key.key()

            self.linked_blob = key
            self.blob = None
            self.__stringio = None

    
    def is_link(self):
        """ Retruns True if this BinaryBlock is a link, or False if otherwise.
        """
        return self.linked_blob is not None


    def monolithic_set(self, data):
        """ Replace the entire contents of this BinaryBlock with the specified string
        """
        self.linked_blob = None
        self.data = data
        if self.__stringio is not None:
            self.__stringio = StringIO.StringIO(self.data)
    
    def monolithic_get(self):
        """ Returns the entire contents of this BinaryBlock as a str

        Important: when sending the content of a BinaryBlock to a webapp handler you should use send_to_handler() instead of file-like IO.

        * Raises IOError if the data cannot be read OR if the content of this BinaryBlock is linked to another blob
        """
        if self.linked_blob is not None:
            raise IOError('Cannot set data for this BinaryBlock because it is acting as a link to a read-only blobstore.BlobInfo object.')

        return self.data
    
    def is_empty(self):
        return (self.data is None or self.data == '') and (self.linked_blob is None)
            

class LabDataContainer(support.modeling.GenericLogEntryModel):
    """LabDataContainers (LDC's) are a generalized data storage scheme to retain data for the web lab.
    This needs to be working prior to the design being signed-off, so it is quite open-ended.
    
    Every LDC has a "path," expressed as a LabDataPath object, very similar to a filesystem path.
    LDC's are heirarchical in the datastore, but do not use the built-in datastore Key.parent() scheme
    as that uses a locking strategry more agressive than we require.
    
    Load an LDC using LabDataContainer.get_for_path().
    Create a new LDC using LabDataContainer.create_or_update() or
    <instance>.create_or_update_child_LabDataContainer()
    
    
    """

    LATEST_MODEL_VERSION = 3.0
    model_version_used = db.FloatProperty(required=False, default=0.0)
    
    #owner_app_id = support.modeling.ApplicationGUID(required=True)
    created_by = support.modeling.WorkerGUID(required=True)
    created_at = support.modeling.CreatedAtDateTimeProperty(required=True)
    updated_at = support.modeling.ModifiedAtDateTimeProperty(required=True)
    "Who and when this LDC was created/last updated"
    
    updated_space = db.StringProperty(required=False)
    "Where this LDC was last updated (see config.VALID_ACTIVITY_SPACES)"
    
    updated_touchpoint = db.StringProperty(required=False)
    "The touchpoint being used when this LDC was last updated (see config.VALID_TOUCHPOINT_NAMES)"
    
    unlisted = db.BooleanProperty(required=False, default=False)
    "Whether or not this LDC should appear in lists of its parent's children"
    
    description = db.TextProperty(required=False)
    "Optional text description of this LDC"
    
    
    ######################################################################
    
    _txt_content = db.TextProperty(required=False,default=None)
    _bin_content_ref = db.ReferenceProperty(reference_class=BinaryBlock, required=False, collection_name='LabDataCointainer_main')
    _bin_content_ref__thumbnail_small = db.ReferenceProperty(reference_class=BinaryBlock, required=False, collection_name='LabDataCointainer_small')
    _bin_content_ref__thumbnail_email1 = db.ReferenceProperty(reference_class=BinaryBlock, required=False, collection_name='LabDataCointainer_email1')
    _bin_content_ref__thumbnail_email2 = db.ReferenceProperty(reference_class=BinaryBlock, required=False, collection_name='LabDataCointainer_email2')
    
    ######################################################################
    
    
    content_type = db.StringProperty(required=False,default=None)
    "The MIME type of this LDC's content"

    content_latitude = db.FloatProperty(required=False,default=None)
    "Optional latitude property for content. Use only if the content makes sense as geospatial information."

    content_longitude = db.FloatProperty(required=False,default=None)
    "Optional longitude property for content. Use only if the content makes sense as geospatial information."

    content_timezone = db.StringProperty(required=False,default=None)
    "Optional timezone name for content. Use only if content makes sense as geospatial information."
    
    parent_path_str = db.StringProperty(required=False,default=None)
    "The string representation of this LDC's parent's path"
    
    app_timestamp = support.modeling.OccuranceTimeProperty()
    "A timestamp which can be set by the posted, to be used for whatever purpose"
    
    deleted = db.BooleanProperty(required=False, default=False)
    "Objects flagged as deleted will be culled by a periodic sweep from cron"
    
    culled = db.BooleanProperty(required=False, default=False)
    "Once an object which is deleted has been processed by the watchdog, it will be set to culled"
    
    num_migrations = db.IntegerProperty(required=False, default=0)
    "The number of times this object's model has been migrated to a new version"
    
    ancestors = db.ListProperty(db.Key)
    "The ancestors list is used to provide non-blocking heirarchical data storage"
    
#    full_path = db.StringListProperty(db.StringProperty)
#    "A list of element names of all of this LDC's ancestors. Equivalent to LabDataPath.from_key(k).last_name() for each Key k in the ancestors list"
    
    path_depth = db.IntegerProperty(default=None)
    "The depth of the LDC in the heirarchy, with 0 being the top"
    
    random_block = db.FloatProperty(default=1.0)
    "random_block is used to select pseudo-random groups of entries from the datastore. Essentially, we're making up for app engine's lack of a database-side rand() with a pre-calculated random psuedo-key"
    
    recently_migrated = False
    "Wether or not this LDC recently had its model migrated from one version to another."
    
    mod_flagged = db.BooleanProperty(default=False)
    "Whether or not this LDC has been flagged for moderation"
    
    mod_flagged_at = support.modeling.OccuranceTimeProperty(required=False)
    "The date/time when mod_flagged was last set to True"
    
    mod_rejected = db.BooleanProperty(default=False)
    "Whether or not a flagged LDC has been reviewed by a moderator and found to be unacceptable"
    
    mod_rejected_at = support.modeling.OccuranceTimeProperty(required=False)
    "The date/time when mod_rejected was last set to True"
    
    mod_approved = db.BooleanProperty(default=False)
    "Whether or not a flagged LDC has been reviewed by a moderator and found to be acceptable"
    
    mod_approved_at = support.modeling.OccuranceTimeProperty(required=False)
    "The date/time when mod_approved was last set to True"
    
    mod_propogate = db.BooleanProperty(default=False)
    "Whether or not this LDC's moderation properties need to be pushed down to its children by the moderation watchtodg daemon"
    
    is_new = False
    "Whether or not this LDC was retrieved from the datastore or was created in memory."
    
    _content_obj = None # temp, used to prevent repeated need to JSONify
    
#    num_children = support.modeling.NaiveIntegerCounterProperty(required=False,default=None)
#    "The number of immediate children this LDC has."
#    # why isn't num_children a shard? That is because we need immediate counts and are
#    # ALREADY restricted as to update rate when creating new children. Therefore a naieve
#    # counter is more efficient than shards due to less data store overhead
    
    is_artifact_ancestor = db.BooleanProperty(default=False)
    "Whether or not this LDC is the ancestor LDC of any artifact LDCs. These artifacts are assumed to be descendents of this LDC."
    
    #
    # class methods
    #
    
    @classmethod
    def __get_new(cls, *args, **kwargs):
        """This is a convenience method for constructing a new LabDataContainer which
        has a random block assigned.
        """
        # all new objects use the latest version of the model
        kwargs['model_version_used'] = LabDataContainer.LATEST_MODEL_VERSION
        
        if 'random_block' in kwargs:
            del kwargs['random_block']
        return LabDataContainer(
            random_block=random.random(),
            **kwargs
        )
    
    @classmethod
    def get_for_path(cls, path, include_rejected=False):
        """Retrieve the LabDataContainer indicated by the provided LabDataPath.
        
        Will return the LabDataContainer at the specified path, or None if no such object exists.
        
        :path:
            The LabDataPath to the desired LabDataContainer
        
        :include_rejected:
            Optional. If true, the method will allow retrieval of LDCs with mod_rejected == True
        
        * Raises InvalidPathError if the specified path is not valid per ex_check_path_and_raise
        """
        exception.ex_check_path_and_raise(path, raise_on_last_item_random_id_placeholder=True)
        # logging.info('LabDataContainer.get_for_path %s' % (path))

        if path.last_name() == LabDataPath.RANDOM_ID_PLACEHOLDER:
            raise exception.InvalidPathError('The specified path contains a unique ID placeholder (%s). While this is a valid path for creating new LabDataContainers, it is not valid for retrieving existing ones.' % (LabDataPath.RANDOM_ID_PLACEHOLDER))
        
        ldc = LabDataContainer.get(path.get_key())

        # begin ENABLE_LDC_COMPATIBILITY_MODE
        if ENABLE_LDC_COMPATIBILITY_MODE:
            if ldc is not None:
                if ldc.model_version_used < LabDataContainer.LATEST_MODEL_VERSION:
                    ldc = ldc.__get_migrated_copy()
            else:
                ldc = LabDataContainer.get(path.get_compatible_key())
                if ldc is not None:
                    ldc = ldc.__get_migrated_copy()
                    
        # end ENABLE_LDC_COMPATIBILITY_MODE
        
        if ldc is not None and ldc.deleted:
            ldc = None
        elif ldc is not None and ldc.mod_rejected:
            if not include_rejected:
                ldc = None
        else:
            #
            # lazily load from fixtures
            #
            if ldc is None and str(path) in static_data.standard_datastore_fixtures.LABDATACONTAINERS:
                template = static_data.standard_datastore_fixtures.LABDATACONTAINERS[str(path)]
                logging.info('model.LabDataContainer: Lazy-loading LDC from fixtures: '+str(path))
                ldc = LabDataContainer.create_or_update(path=path, **template)
        
        return ldc

    
    @classmethod
    def create_or_update(cls, path, worker_guid, unlisted=False, mod_flagged=None, mod_rejected=None, mod_approved=None, description=None, content=None, content_type=None, content_latitude=None, content_longitude=None, content_timezone=None, decode_base64_before_saving=False, create_tree=False, app_timestamp=None, updated_space=None, updated_touchpoint=None, allow_overwrite=True):
        """Create a new LabDataContainer or update an existing one.
        
        :path:
            A LabDataPath which represents the location for this LabDataContainer.
            See LabDataPath.__init__()
        
        :worker_guid:
            The GUID of the Worker creating this LabDataContainer.
        
        :unlisted:
            Optional. Whether or not this LabDataContainer should be unlisted. Unlisted LabDataContainers
            do not appear in the query returned by LabDataContainer.get_child_LabDataContainers_query()
            and should always be omitted from user-facing lists of data.
        
        :description:
            Optional. A text description of what this LabDataContainer is for.
        
        :content:
            Optional. The content to store in this LabDataContainer.
        
        :content_type:
            Optional. The MIME type of the content. If None and content is specified,
            then we will try to detect an appropriate type based on the Python type of the
            content argument.

        :content_latitude:
            Optional. If appropriate, the content can be tagged with a map latitude.

        :content_longitude:
            Optional. If appropriate, the content can be tagged with a map longitude.

        :content_timezone:
            Optional. If appropriate, the content can be tagged with a timezone name. See http://pytz.sourceforge.net/#tzinfo-api for information
            on valid timezone names.
        
        :decode_base64_before_saving:
            Optional. If True and the content argument is a string, the method will first interpret the
            content argument as a Base64 string, and use the decoded data as the actual content.
        
        :create_tree:
            Optional. If True, then the system will check the LDC's in the path to ensure that its ancestor
            LDCs really exist, and will create them if they do not. This check is performed starting with this
            LDC and working up the tree until an existing LDC is encountered, at which point the search will stop.
            LDC's created in this manner will have no description, content or content_type; their worker_guid will
            be that of the worker calling this method, and their unlisted value will be the same as that
            passed to this method.
        
        :app_timestamp:
            Optional. If specified, allows storing a application-defined timestamp for the content of this LabDataContainer.
            The value is not used internally by the API. It is indexed, however, and can be used freely by an application
            accessing the API.
        
        :updated_space:
            Optional. A string indicating the space in which LDC was updated. If specified, must be one of the strings
            in config.VALID_ACTIVITY_SPACES

        :updated_touchpoint:
            Optional. A string indicating the touchpoint in use when this LDC was updated. If specified, must be one of the strings
            of the strings in config.VALID_TOUCHPOINT_NAMES

        
        :mod_flagged:
            Optional. Whether or not the content is flagged for moderation.
        
        :mod_rejected:
            Optional. Whether or not the content has been rejected by a moderator.
            Setting mod_rejected to True will automatically set mod_approved to False.
        
        :mod_approved:
            Optional. Whether or not the content has been approved by a moderator.
            Setting mod_approved to True will automatically set mod_rejected to False.
            If both mod_approved and mod_rejected are True, only mod_rejected will be set.
        
        :allow_overwrite:
            Optional. If False, will raise an error if attempting to write to a record which already exists.

        * Raises InvalidPathError if the specified path is not valid per ex_check_path_and_raise
        * Raises an InvalidWorkerGUIDError if the specified Worker's GUID is invalid
        * Raises a ContainerAlreadyExistsError if there is already a LabDataContainer at the specified path
        * Raises an InvalidActivitySpaceError if the updated_space argument is invalid.
        * Raises an InvalidTouchpointError if the updated_touchpoint argument is invalid.
        * Raises an ObjectDeletedError if you are attempting to update an object which has been deleted.
        * Raises an ObjectRejectedError if you are attempting to update an object which has been rejected by moderators.
        """
        
        # check arguments
        exception.ex_check_worker_guid_and_raise(worker_guid)
        exception.ex_check_path_and_raise(path)
        
        if unlisted:
            unlisted_bool = True
        else:
            unlisted_bool = False
        
        if path.last_name() == LabDataPath.RANDOM_ID_PLACEHOLDER:
            # get a system-generated ID for the new entry
            ids = db.allocate_ids(path.get_key(), 1)
            ppl = path.to_list()
            ppl[-1] = str(ids[0])
            path = LabDataPath(*ppl)
        
        if app_timestamp is not None:
            app_timestamp = support.modeling.normalize_datetime(app_timestamp)
        
        if updated_space is not None:
            exception.ex_check_activity_space_and_raise(updated_space)
        
        if updated_touchpoint is not None:
            exception.ex_check_touchpoint_name_and_raise(updated_touchpoint)
        
        logging.info('create_or_update: content_type='+str(content_type))
        content_type = support.modeling.normalize_content_type(content, content_type)
        
        #
        # create/update the LDC
        #
        ldc_key = path.get_key() # the key of the LDC
        
        # mod_approved and mod_rejected are mutually exclusive
        # we default to the (safer) behavior of only approving
        # content which is not simultaneously being rejected
        if mod_approved and mod_rejected:
            mod_approved = False
        elif mod_approved:
            mod_rejected = False
        elif mod_rejected:
            mod_approved = False
        
        
        # transactionally create a new LDC if needed
        # we'll go ahead and create the unsaved new LDC here (outside the txn)
        # to save time
        
        # set new object defaults for moderation properties
        new_mod_flagged = mod_flagged
        new_mod_rejected = mod_rejected
        new_mod_approved = mod_approved
        if new_mod_flagged is None:
            new_mod_flagged = False
        if new_mod_rejected is None:
            new_mod_rejected = False
        if new_mod_approved is None:
            new_mod_approved = False
            
        new_ldc = LabDataContainer.__get_new(
            key=ldc_key,
            created_by=worker_guid,
            unlisted=unlisted_bool,
            description=description,
            content_latitude=content_latitude,
            content_longitude=content_longitude,
            content_timezone=content_timezone,
            parent_path_str=path.get_parent_path_str(),
            app_timestamp=app_timestamp,
            updated_space=updated_space,
            updated_touchpoint=updated_touchpoint,
            ancestors=path.get_ancestor_keys(),
            full_path=path.to_list(),
            path_depth=len(path.to_list()) - 1,
            mod_flagged=new_mod_flagged,
            mod_rejected=new_mod_rejected,
            mod_approved=new_mod_approved
        )
#        for tn_type in config.LDC_THUMBNAIL_PARAMS.keys():
#            new_ldc.__set_thumbnail_key(tn_type, thumbnail_keys[tn_type])
        new_ldc.impl__set_content_from_user__no_put(
            normalized_content_type=content_type,
            incoming_content=content,
            decode_base64_before_saving=decode_base64_before_saving
        )
        
        new_ldc.is_new = True
        
        # the transaction:
        def txn2(ldc_key, new_ldc):
            ldc = LabDataContainer.get(ldc_key)
            if ldc is None:
                new_ldc.put()
                return new_ldc
            else:
                return ldc
        # end of txn2
        
        # run the transaction!
        obj = db.run_in_transaction(txn2, ldc_key, new_ldc)
        
        if obj.deleted:
            # Attempting to update a deleted LDC, can't do this
            raise exception.ObjectDeletedError('The LabDataContainer located at %s has been deleted and cannot be replaced.' % (path))
            
        elif obj.mod_rejected and ((obj.mod_rejected == mod_rejected) or mod_rejected is None):
            # Attempting to update a moderated LDC, can't do this
            raise exception.ObjectRejectedError('The LabDataContainer located at %s has been rejected by moderators and cannot be replaced.' % (path))

        if not obj.is_new:
            # The LDC was already in the datastore. We need to
            # update it.
            
            # fill out properties on the existing LDC and store it
            if config.LDCS_ONLY_EDITABLE_BY_ORIGINAL_CREATOR and obj.created_by != worker_guid:
                raise exception.ContainerAlreadyExistsError('A LabDataContainer called %s was already created by %s, and can only be updated by that worker' % (path, obj.created_by))
            
            if not allow_overwrite:
                raise exception.ContainerAlreadyExistsError('The request specified that allow_overwrite == False, and the LabDataContainer called %s already exists' % (path))
            
            # set properties, if specified
            if unlisted is not None:
                obj.unlisted = unlisted_bool
            if description is not None:
                obj.description = str(description)
            if app_timestamp is not None:
                obj.app_timestamp = app_timestamp
            if updated_space is not None:
                obj.updated_space = updated_space
            if updated_touchpoint is not None:
                obj.updated_touchpoint = updated_touchpoint

            if content_latitude is not None:
                obj.content_latitude = content_latitude
            if content_longitude is not None:
                obj.content_longitude = content_longitude
            if content_timezone is not None:
                obj.content_timezone = content_timezone
            
            if mod_flagged is not None:
                obj.mod_flagged = mod_flagged
                obj.mod_propogate = True
                if obj.mod_flagged:
                    obj.mod_flagged_at = support.modeling.modeling_utcnow()
            if mod_rejected is not None:
                obj.mod_rejected = mod_rejected
                obj.mod_propogate = True
                if obj.mod_rejected:
                    obj.mod_rejected_at = support.modeling.modeling_utcnow()
            if mod_approved is not None:
                obj.mod_approved = mod_approved
                obj.mod_propogate = True
                if obj.mod_approved:
                    obj.mod_approved_at = support.modeling.modeling_utcnow()
            if obj.mod_propogate:
                logging.info('LabDataContainer: User has requested that LDC %s have moderation properties propogated to children: mod_flagged = %s, mod_rejected = %s, mod_approved = %s, mod_propogate = %s' % (obj.key().id_or_name(), str(obj.mod_flagged), str(obj.mod_rejected), str(obj.mod_approved), srt(obj.mod_propogate)))
            
            # set content
            obj.impl__set_content_from_other_LDC__no_put(new_ldc)

            #
            # save update object
            #
            obj.model_version_used = LabDataContainer.LATEST_MODEL_VERSION
            obj.put()
            
#            # now that the LDC is saved with a reference to the
#            # new content binblock we can delete the old one
#            if old_content_binblock is not None:
#                old_content_binblock.delete()
#            for tn_type in old_thumbnail_keys.keys():
#                if old_thumbnail_keys[tn_type] is not None:
#                    old_thumbnail_keys[tn_type].delete()
        
        # if this is a newly-created LDC and it has a parent, then increment that parent's num_children counter
        if obj.is_new and len(obj.ancestors) > 0:
            
            ancestor_key = obj.ancestors[-1]
            parent_ldc = LabDataContainer.get(ancestor_key)
            
            if not parent_ldc:
                # The user is trying to create/update a child of a parent LDC, but
                # that parent does not exist.
                # If create_tree was specified, then try to quickly create the
                # tree of LDCs above the current one.
                if create_tree:
                    def txn3(pk, worker_guid, ancestor_ldc):
                        existing_ancestor_ldc = LabDataContainer.get(pk)
                        if existing_ancestor_ldc is None:
                            ancestor_ldc.put()
                            return ancestor_ldc
                        else:
                            return existing_ancestor_ldc
                    # end of txn3
                    for ancestor_key in obj.ancestors:
                        ancestor_path = LabDataPath.from_key(ancestor_key)
                        ancestor_ldc = LabDataContainer.__get_new(
                            key=ancestor_key,
                            created_by=worker_guid,
    #                        num_children=1,
                            parent_path_str=ancestor_path.get_parent_path_str(),
                            ancestors = ancestor_path.get_ancestor_keys(),
                            full_path = ancestor_path.to_list(),
                            path_depth = len(ancestor_path.to_list()) - 1
                        )
                        db.run_in_transaction(txn3, ancestor_key, worker_guid, ancestor_ldc)
                        LabDataContainer.num_children_counter(str(ancestor_path)).increment()
            else:
                ancestor_path = LabDataPath.from_key(ancestor_key)
                LabDataContainer.num_children_counter(str(ancestor_path)).increment()

        
        # we saw a worker...
        KnownWorkerStatus.worker_was_seen(worker_guid)

        return obj

    @classmethod
    def _compatible_safe_child_query(cls, k, parent_path_str, include_rejected=False):
        """Used by get_child_LabDataContainers_list() if ENABLE_LDC_COMPATIBILITY_MODE is True
        """
        q = db.Query(LabDataContainer)
        q.filter('unlisted = ', False)
        q.filter('deleted = ', False)
        if not include_rejected:
            q.filter('mod_rejected = ', False)
        q.ancestor(k) # only LabDataContainer which are ancestors of this LabDataContainer
        
        return q
    
    @classmethod
    def _safe_child_query(cls, k, parent_path_str, include_rejected=False):
        """Used by get_child_LabDataContainers_list()
        """
        q = db.Query(LabDataContainer)
        q.filter('ancestors = ', k)
        q.filter('deleted = ', False)
        if not include_rejected:
            q.filter('mod_rejected = ', False)
        #q.filter('parent_path_str =', parent_path_str)
        
        return q
        

    @classmethod
    def touch(cls, target, app_timestamp=None, activity_space=None, touchpoint=None):
        """Simply bump the updated_at field of a LabDataContainer and then save.
        
        :target:
            Either a LabDataContainer or a LabDataPath which represents the location for this LabDataContainer.
            See LabDataPath.__init__()

        :app_timestamp:
            Optional. If specified, then this will be the time recorded for when the activity took place.
            If not specified then the current time will be used.
            This should really only be used for generating test data, or in the case where activity genuinely
            takes place which cannot be reported in real time. Use with care.
            If specified, should be a Unix timestamp (in seconds) specifying the first date & time for which slices are needed.
            (e.g. 1333238400 is 1-April-2012 at 00:00:00 GMT)
        
        :activity_space:
            Optional. A string indicating the space in which the user was active. If specified, must be one of the strings
            in config.VALID_ACTIVITY_SPACES
        
        :touchpoint:
            Optional. A string indicating the space in which the user was active. If specified, must be one
            of the strings in config.VALID_TOUCHPOINT_NAMES


        * Raises InvalidPathError if the specified path is not valid per ex_check_path_and_raise
        * Raises InvalidActivitySpaceError if the specified activity space is not valid
        * Raises InvalidTouchpointError if the touchpoint argument is invalid.
            
        """
        
        # check arguments
        if activity_space is not None:
            exception.ex_check_activity_space_and_raise(activity_space)
        if touchpoint is not None:
            exception.ex_check_touchpoint_name_and_raise(touchpoint)
        if app_timestamp is not None:
            app_timestamp = support.modeling.normalize_datetime(app_timestamp)

        # target can either be a LabDataContainer or a LabDataPath
        # we need an LDC to work on, so load from paths here if needed:
        if isinstance(target, LabDataContainer):
            ldc = target
        else:
            exception.ex_check_path_and_raise(target, raise_on_last_item_random_id_placeholder=True)
            ldc = LabDataContainer.get_for_path(target)
        
        # if such an LDC exists, then touch it:
        if ldc is not None:
            ldc.updated_space = activity_space
            ldc.updated_touchpoint = touchpoint
            if app_timestamp is not None:
                ldc.app_timestamp = app_timestamp
            ldc.put()
        
        return ldc
    
    __big_counter_cache = {}
    @classmethod
    def num_children_counter(cls, path):
        """Returns a counter which tracks the number of children of
        a LabDataContainer
        
        :path:
            The LDC's LabDataPath.
            
        """
        name = '%s_%s_CTR-0001' % (Task.kind(), str(path))
        
        if name not in cls.__big_counter_cache:
            cls.__big_counter_cache[name] = support.big_counter.BigCounter(name)
        #logging.info('num_children_counter: '+name+' '+str(len(cls.__big_counter_cache)))
        return cls.__big_counter_cache[name]

    
    #
    # instance methods
    #
    
    def end_user_delete(self):
        """Marks an LDC for culling by the deletion daemon.
        """
        logging.info('LabDataContainer: User has requested that LDC %s be deleted. Marking deleted = True.' % (self.key().id_or_name()))
        self.deleted = True
        # self.mod_flagged = False
        # self.mod_rejected = False
        self.put()
        
    def flag(self, flag_children=True):
        """Flags an LDC and, optionally, all of its children for moderation.
        
        :flag_children:
            Optional. If True, the system will also flag all of this LDC's children for
            moderation. This should be used if an entire artifact needs moderation, as an
            artifact contains many different distinct parts in separate LDC's. Due to App
            Engine's design there will be a time delay, even a minute or longer,
            until the system has fully flagged all of this LDC's children. During that time
            the children will not all show up in lists of items needing moderation.
        """
        logging.info('LabDataContainer: User has requested that LDC %s be flagged for moderation. Marking mod_flag = True, mod_propogate = %s' % (self.key().id_or_name(), str(flag_children)))
        self.mod_flagged = True
        self.mod_flagged_at = support.modeling.modeling_utcnow()
        if flag_children:
            flag_children_bool = True
        else:
            flag_children_bool = False
        self.mod_propogate = flag_children_bool
        self.put()
        return True
    
    def reject(self, reject_children=True):
        """Rejects an LDC on moderation grounds, and, optionally, all of its children.
        
        :reject_children:
            Optional. If True, the system will also reject all of this LDC's children.
            This should be used if an entire artifact needs to be rejected, as an
            artifact contains many different distinct parts in separate LDC's. Due to App
            Engine's design there will be a time delay, even a minute or longer,
            until the system has fully rejected all of this LDC's children. During that time
            the children will continue to show up in public lists.
            
        """
        logging.info('LabDataContainer: User has requested that LDC %s be rejected. Marking mod_rejected = True, mod_approved = False, mod_propogate = %s' % (self.key().id_or_name(), str(reject_children)))
        self.mod_rejected = True
        self.mod_rejected_at = support.modeling.modeling_utcnow()
        # mod_approved and mod_rejected are mutually exclusive
        self.mod_approved = False
        if reject_children:
            reject_children_bool = True
        else:
            reject_children_bool = False
        self.mod_propogate = reject_children_bool
        self.put()
        return True
    
    def approve(self, approve_children=True):
        """Approves an LDC on moderation grounds, and, optionally, all of its children.
        
        :approve_children:
            Optional. If True, the system will also approve all of this LDC's children.
            This should be used if an entire artifact needs to be approved, as an
            artifact contains many different distinct parts in separate LDC's. Due to App
            Engine's design there will be a time delay, even a minute or longer,
            until the system has fully approved all of this LDC's children. During that time
            any rejected children will continue to be rejected.
            
        """
        logging.info('LabDataContainer: User has requested that LDC %s be approved. Marking mod_approved = True, mod_rejected = False, mod_propogate = %s' % (self.key().id_or_name(), str(approve_children)))
        self.mod_approved = True
        self.mod_approved_at = support.modeling.modeling_utcnow()
        # mod_approved and mod_rejected are mutually exclusive
        self.mod_rejected = False
        if approve_children:
            approve_children_bool = True
        else:
            approve_children_bool = False
        self.mod_propogate = approve_children_bool
        self.put()
        return True
        
    def __get_migrated_copy(self):
        """Migrates an LDC from its current model version to the latest model version,
        and then returns the migrated version of the object.
        
        """
        logging.info('Starting entity migration: %s; entity model version=%s; latest model version=%s' % (self.key().id_or_name(), str(self.model_version_used), str(LabDataContainer.LATEST_MODEL_VERSION)))
        new_obj = None
        
        if hasattr(self, 'model_version_used') and self.model_version_used >= LabDataContainer.LATEST_MODEL_VERSION:
            new_obj = self #nothing to do
        
        elif not hasattr(self, 'model_version_used') or self.model_version_used == 0:
        
            # upgrade the object's key
            p = self.get_path()
            new_key = p.get_key()
            
            # fill in the ancestor list
            L = []
            while p:
                p = p.get_parent_path()
                if p is not None:
                    L.append(p.get_key())

            # create the new object
            new_obj = self.get_cloned_copy(
                key=new_key,
                model_version_used=2.0,
                num_migrations=self.num_migrations + 1,
                #flag as migrated
                recently_migrated = True,
                ancestors = L,
            )
            new_obj.put()
            self.delete()
            
        elif self.model_version_used < 2.5:
            # create the new object
            new_obj = self
            new_obj.model_version_used = 2.5
            new_obj.num_migrations += 1
            new_obj.recently_migrated = True
            new_obj.ancestors = self.get_path().get_ancestor_keys()
#            new_obj.full_path = self.get_path().to_list()
            new_obj.path_depth = len(self.get_path().to_list()) - 1
            new_obj.put()

        logging.info('Completed entity migration: %s; entity model version=%s; latest model version=%s' % (new_obj.key().id_or_name(), str(new_obj.model_version_used), str(LabDataContainer.LATEST_MODEL_VERSION)))
        
        return new_obj

    def edit(self, worker_guid=None, mod_flagged=None, mod_rejected=None, mod_approved=None, unlisted=None, description=None, content=None, content_type=None, content_latitude=None, content_longitude=None, content_timezone=None, decode_base64_before_saving=False, app_timestamp=None, updated_space=None, updated_touchpoint=None):
        """Modify this LabDataContainer.

        :worker_guid:
            The GUID of the Worker creating this LabDataContainer.
        
        :mod_flagged:
            Optional. Sets whether this content is flagged for moderation.
        
        :mod_rejected:
            Optional. Sets whether this content has been rejected by a moderator.
            Setting mod_rejected to True will automatically set mod_approved to False.
        
        :mod_approved:
            Optional. Whether or not the content has been approved by a moderator.
            Setting mod_approved to True will automatically set mod_rejected to False.
            If both mod_approved and mod_rejected are True, only mod_rejected will be set.
        
        :unlisted:
            Optional. Boolean. Whether or not this LabDataContainer should be unlisted. Unlisted LabDataContainers
            do not appear in the query returned by LabDataContainer.get_child_LabDataContainers_query()
            and should always be omitted from user-facing lists of data.
        
        :description:
            Optional. A text description of what this LabDataContainer is for.
        
        :content:
            Optional. The first piece of content to store in this LabDataContainer.
        
        :content_type:
            Optional. The MIME type of the content. If None and content is specified,
            then we will try to detect an appropriate type based on the Python type of the
            content argument.

        :content_latitude:
            Optional. If appropriate, the content can be tagged with a map latitude.

        :content_longitude:
            Optional. If appropriate, the content can be tagged with a map longitude.

        :content_timezone:
            Optional. If appropriate, the content can be tagged with a timezone name. See http://pytz.sourceforge.net/#tzinfo-api for information
            on valid timezone names.
            
        :decode_base64_before_saving:
            Optional. If True and the content argument is a string, the method will first interpret the
            content argument as a Base64 string, and use the decoded data as the actual content.
        
        :app_timestamp:
            Optional. If specified, allows storing a application-defined timestamp for the content of this LabDataContainer.
            The value is not used internally by the API. It is indexed, however, and can be used freely by an application
            accessing the API.
        
        :updated_space:
            Optional. A string indicating the space in which LDC was updated. If specified, must be one of the strings
            in config.VALID_ACTIVITY_SPACES

        :updated_touchpoint:
            Optional. A string indicating the touchpoint in use when this LDC was updated. If specified, must be one of the strings
            of the strings in config.VALID_TOUCHPOINT_NAMES


        * Raises an InvalidTouchpointError if the updated_touchpoint argument is invalid.
        * Raises an InvalidWorkerGUIDError if the specified Worker's GUID is invalid
        
        """
        path = self.get_path()
        #create_or_update(cls, path, worker_guid, unlisted=False, description=None, content=None, content_type=None, decode_base64_before_saving=False, create_tree=False, app_timestamp=None, updated_space=None, updated_touchpoint=None):
        
        if worker_guid is None:
            worker_guid = self.created_by
        if content_type is None:
            content_type = self.content_type
            
            
        # mod_approved and mod_rejected are mutually exclusive
        if mod_approved and mod_rejected:
            mod_approved = False
        elif mod_approved:
            mod_rejected = False
        elif mod_rejected:
            mod_approved = False
            
        if content is not None:
            return LabDataContainer.create_or_update(
                path=path,
                worker_guid=worker_guid,
                unlisted=unlisted,
                description=description,
                content=content,
                content_type=content_type,
                content_latitude=content_latitude,
                content_longitude=content_longitude,
                content_timezone=content_timezone,
                decode_base64_before_saving=decode_base64_before_saving,
                app_timestamp=app_timestamp,
                updated_space=updated_space,
                updated_touchpoint=updated_touchpoint)
        else:
            self.created_by = worker_guid
            if unlisted is not None:
                self.unlisted = unlisted
            if description is not None:
                self.description = description
            if content_type is not None:
                self.content_type = content_type
            if content_latitude is not None:
                self.content_latitude = content_latitude
            if content_longitude is not None:
                self.content_longitude = content_longitude
            if content_timezone is not None:
                self.content_timezone = content_timezone
            if app_timestamp is not None:
                self.app_timestamp = app_timestamp
            if updated_space is not None:
                self.updated_space = updated_space
            if updated_touchpoint is not None:
                self.updated_touchpoint = updated_touchpoint
            if mod_flagged is not None:
                self.mod_flagged = mod_flagged
                self.mod_propogate = True
                if self.mod_flagged:
                    self.mod_flagged_at = support.modeling.modeling_utcnow()
            if mod_rejected is not None:
                self.mod_rejected = mod_rejected
                self.mod_propogate = True
                if self.mod_rejected:
                    self.mod_rejected_at = support.modeling.modeling_utcnow()
            if mod_approved is not None:
                self.mod_approved = mod_approved
                self.mod_propogate = True
                if self.mod_approved:
                    self.mod_approved_at = support.modeling.modeling_utcnow()
            if self.mod_propogate:
                logging.info('LabDataContainer: User has requested that LDC %s have moderation properties propogated to children: mod_flagged = %s, mod_rejected = %s, mod_approved = %s, mod_propogate = %s' % (self.key().id_or_name(), str(self.mod_flagged), str(self.mod_rejected), str(self.mod_approved), str(self.mod_propogate)))
            self.model_version_used = LabDataContainer.LATEST_MODEL_VERSION
            self.put()
            return self
            

    def create_or_update_child_LabDataContainer(self, worker_guid, name=None, unlisted=False, description=None, content=None, content_type=None, content_latitude=None, content_longitude=None, content_timezone=None, decode_base64_before_saving=False, app_timestamp=None, updated_space=None, updated_touchpoint=None, allow_overwrite=True):
        """Create a new LabDataContainer or update an existing one.
        
        :worker_guid:
            The GUID of the Worker creating this LabDataContainer.
        
        :name:
            Optional. If provided, this will be the name of the new LabDataContainer. If omitted, the system will
            assign a unique name to the new LabDataContainer.
        
        :unlisted:
            Optional. Boolean. Whether or not this LabDataContainer should be unlisted. Unlisted LabDataContainers
            do not appear in the query returned by LabDataContainer.get_child_LabDataContainers_query()
            and should always be omitted from user-facing lists of data.
        
        :description:
            Optional. A text description of what this LabDataContainer is for.
        
        :content:
            Optional. The first piece of content to store in this LabDataContainer.
        
        :content_type:
            Optional. The MIME type of the content. If None and content is specified,
            then we will try to detect an appropriate type based on the Python type of the
            content argument.

        :content_latitude:
            Optional. If appropriate, the content can be tagged with a map latitude.

        :content_longitude:
            Optional. If appropriate, the content can be tagged with a map longitude.

        :content_timezone:
            Optional. If appropriate, the content can be tagged with a timezone name. See http://pytz.sourceforge.net/#tzinfo-api for information
            on valid timezone names.
            
        :decode_base64_before_saving:
            Optional. If True and the content argument is a string, the method will first interpret the
            content argument as a Base64 string, and use the decoded data as the actual content.
        
        :app_timestamp:
            Optional. If specified, allows storing a application-defined timestamp for the content of this LabDataContainer.
            The value is not used internally by the API. It is indexed, however, and can be used freely by an application
            accessing the API.
        
        :updated_space:
            Optional. A string indicating the space in which LDC was updated. If specified, must be one of the strings
            in config.VALID_ACTIVITY_SPACES

        :updated_touchpoint:
            Optional. A string indicating the touchpoint in use when this LDC was updated. If specified, must be one of the strings
            of the strings in config.VALID_TOUCHPOINT_NAMES


        :allow_overwrite:
            Optional. If False, will raise an error if attempting to write to a record which already exists.

        * Raises an InvalidWorkerGUIDError if the specified Worker's GUID is invalid
        * Raises a ContainerAlreadyExistsError if there is already a child LabDataContainer with the same name
        * Raises a InvalidPathError if the name of the child is invalid
        * Raises an InvalidTouchpointError if the updated_touchpoint argument is invalid.
            
        """
        if name is not None:
            name = str(name)
        else:
            name = LabDataPath.RANDOM_ID_PLACEHOLDER
        
        L = self.get_path().to_list()
        L.append(name)
        try:
            path = LabDataPath(*L)
        except db.BadValueError or db.BadKeyError:
            raise exception.InvalidPathError('"%s" is an invalid name for a LabDataContainer' % (name))
            
        return LabDataContainer.create_or_update(
            path=path,
            worker_guid=worker_guid,
            unlisted=unlisted,
            description=description,
            content=content,
            content_type=content_type,
            content_latitude=content_latitude,
            content_longitude=content_longitude,
            content_timezone=content_timezone,
            decode_base64_before_saving=decode_base64_before_saving,
            app_timestamp=app_timestamp,
            updated_space=updated_space,
            updated_touchpoint=updated_touchpoint,
            allow_overwrite=allow_overwrite)
        

#    def get_child_LabDataContainers_query(self):
#        """Returns a Query object which lists LabDataContainers which are grouped below this
#        LabDataContainer, just as one might get a directory listing. The Query returned should automatically
#        omit unlisted LabDataContainers.
#        """
#        return LabDataContainer._safe_child_query(self.key(), str(self.get_path()))
        

    def get_child_LabDataContainers_list(self, num=None, start=None, order=None, include_rejected=False):
        """Gets a list of LabDataContainers, optionally paginating the results.
        
        :num:
            Optional. The maximum number of objects to return in the list. Defaults to unlimited,
            however this may cause the query to time out before completion.
        
        :start:
            Optional. A number specifying which object in the list to start with,
            expressed as an offset from the start of the list.
        
        :order:
            Optional. If specified, will try to order the list by the property specified.
            To order in reverse, preceed the property name with a minus sign.
            
            For example, to sort alphabetically by the GUID of the Worker which created
            each object, set order to "created_by". To sort that in reverse order
            set order to "-created_by"
        
        :include_rejected:
            Optional. If true, the method will allow retrieval of LDCs with mod_rejected == True
        
        * Raises a TypeError if start or num are not numbers
        * Raises an ValueError if start or num are negative
        * Raises a PropertyError if order is specified, but is not a valid property of the objects being listed
        """
        q = LabDataContainer._safe_child_query(self.key(), str(self.get_path()), include_rejected=include_rejected)
        
        # begin ENABLE_LDC_COMPATIBILITY_MODE
        if ENABLE_LDC_COMPATIBILITY_MODE:
            L = LabDataContainer.list_from_query(q, num, start, order)
            if num is None or len(L) < num:
                q2 = LabDataContainer._compatible_safe_child_query(self.key(), str(self.get_path()), include_rejected=include_rejected)
                
                # how many entries in the compatibility list?
                if num is not None:
                    n = num - len(L)
                else:
                    n = None
                    
                L = L + LabDataContainer.list_from_query(q2, n, start, order)
                
            return L
            # end ENABLE_LDC_COMPATIBILITY_MODE
        else:
            return LabDataContainer.list_from_query(q, num, start, order)

    
    __cached_path = None
    def get_path(self):
        """Returns this LabDataContainer's path, as a LabDataPath object.
        """
        if self.__cached_path is None:
            self.__cached_path = LabDataPath.from_key(self.key())
        return self.__cached_path
        
    
    def get_content(self):
        """Returns an object representing the content of this LabDataContainer.
        If content is binary, returns a Key object. If it is something else, returns
        that something else as a bytestring (str)
        """
        c = self.get_non_binary_content_as_string()
        if c is None:
            c = self._bin_content_ref
        return c

    def impl__set_content_from_other_LDC__no_put(self, ldc):
        """ Sets this LDC to point to the same content as the specified other LDC.
        
        Does not allocate any new binary content storage or trigger any new thumbnail generation.
        Does not implicitly call self.put() 
        
        """
        if ldc.model_version_used != self.model_version_used:
            raise Exception('Attempt made to set content of one LDC from another LDC with different model versions. Target version was %s; Source version was %s. Target path was %s' % (str(self.model_version_used), str(ldc.model_version_used), str(self.get_path())))
            
        self._txt_content = ldc._txt_content
        self.content_type = ldc.content_type
        self._bin_content_ref = ldc._bin_content_ref
        for k in config.LDC_THUMBNAIL_PARAMS.keys():
            an = self.__get_model_property_name_for_thumbnail_key(k)
            setattr(self, an, getattr(ldc, an))
    
    
    def __clear_old_bin_content(self):
        """Private and dangerous!
        """
        self._bin_content_ref = None
        for k in config.LDC_THUMBNAIL_PARAMS.keys():
            an = self.__get_model_property_name_for_thumbnail_key(k)
            setattr(self, an, None)
    
    def __clear_old_txt_content(self):
        """Private and dangerous!
        """
        self._txt_content = None
    
    @classmethod
    def get_stringio_from_user_content(cls, incoming_content, decode_base64_before_saving):
        """ Decodes base-64 content in several different container formats
        and returns a dict containing the following:
        {
            'data' : StringIO.StringIO, # contains the actual content
            'len': int # the length of the content, in bytes
        }
        """
        if decode_base64_before_saving:
            if hasattr(incoming_content, 'file'):
                # decode from multipart data
                data = StringIO.StringIO()
                base64.decode(incoming_content.file, data)
                data.seek(0, os.SEEK_END)
                l = data.tell()
                data.seek(0)
            elif isinstance(incoming_content, str) or isinstance(incoming_content, unicode):
                # decode from string
                data = StringIO.StringIO()
                base64.decode(StringIO.StringIO(incoming_content), data)
                data.seek(0, os.SEEK_END)
                l = data.tell()
                data.seek(0)
            else:
                raise Exception('The new content is a %s, but you have requested that it be decoded from base-64. Only strings can be base-64 decoded.' % (type(incoming_content)))
        else:
            if hasattr(incoming_content, 'file'):
                # data is multipart data
                data = incoming_content.file
                data.seek(0, os.SEEK_END)
                l = data.tell()
                data.seek(0)
            elif isinstance(incoming_content, str) or isinstance(incoming_content, unicode):
                # data is direct string or unicode
                data = incoming_content
                l = len(data)
            elif isinstance(incoming_content, dict):
                # data is a dict, JSON-encode it
                data = json.dumps(incoming_content,
                    default=SimplejsonModelRegistry.default,
                    indent=False)
                l = len(data)
                    
        return {
            'data': data,
            'len': l
        }
    
    def impl__set_content_from_user__no_put(self, normalized_content_type=None, incoming_content=None, decode_base64_before_saving=False):
        """ Sets properties of self so that it will contain the specified content. Any existing content will be 
        properly replaced by the new content. If necessary, new storage space will be allocated to contain binary data.
        
        Does not implicitly call self.put()
        However, any new storage units required WILL be stored by this method.

        incoming_content can either be the data to be stored as content OR a blobstore.BlobInfo / blobstore.BlobKey.

        The logic for storing the data is:

        + If it is simple text content, then the data is stored in self._txt_content.

        + If it is binary or more complex text data, then the data stored directly in 
          a BinaryBlock object which is then referenced by self._bin_content_ref

        + If it is one of these blobstore classes, then the BinaryBlock in self._bin_content_ref
          is *linked* to underlying blobstore object rather than storing the content directly.
        
        """
        logging.info('impl__set_content_from_user__no_put: (A) ' + str(normalized_content_type))
        if incoming_content is None:
            self.content_type = normalized_content_type
            self.__clear_old_txt_content()
            self.__clear_old_bin_content()
            return
        
        if normalized_content_type is None or normalized_content_type is '':
            # logging.info(incoming_content)
            raise Exception('Normalized content type cannot be empty or None')
        
        #
        # deal with the simplest case in the simplest way:
        #
        if not decode_base64_before_saving:
            if normalized_content_type.startswith('text/') or normalized_content_type == 'application/json':
                if isinstance(incoming_content, str) or isinstance(incoming_content, unicode):
                    self._txt_content = incoming_content
                    self.content_type = normalized_content_type
                    self.__clear_old_bin_content()
                    return

        if isinstance(incoming_content, blobstore.BlobKey) or isinstance(incoming_content, blobstore.BlobInfo):
            #
            # incoming content has already been saved to the blobstore
            # by way of blobstore.create_upload_url() and a BlobstoreUploadHandler
            #
            #logging.info('impl__set_content_from_user__no_put got blobkey')
            if self._bin_content_ref is not None:
                # re-use the old content reference
                binblock = self._bin_content_ref
            else:
                binblock = BinaryBlock()

            self.__clear_old_bin_content()
            self.__clear_old_txt_content()

            binblock.link_to(incoming_content)
            
            try:
                binblock.put() # save it
                self._bin_content_ref = binblock
            except Exception as ex:
                logging.error('Exception raised during LabDataContainer.impl__set_content_from_user__no_put when saving BinaryBlock: %s' % str(ex))

        else:
            #
            # incoming content has NOT already been saved anywhere,
            # so do that now.
            #

            # Simultaneously decode any base-64-encoded uploads and
            # convert the incoming_content object into a StringIO object from
            # which our actual content can be read
            source = LabDataContainer.get_stringio_from_user_content(
                incoming_content=incoming_content,
                decode_base64_before_saving=decode_base64_before_saving)
            
            if source['len'] >= config.MAX_DIRECT_UPLOAD_FILE_SIZE_BYTES:
                # content is too big to be stored this way
                if self.is_new:
                    further_instructions = 'Instead, repeat this POST without the content then look at the "big_data_upload_url" property in the response; then POST the content to that URL.'
                else:
                    further_instructions = 'Instead, repeat this POST without the content then look at the "big_data_upload_url" property in the response; then POST the content to that URL. The big_data_upload_url can change dynamically so you should check it right before posting. Its current value is %s.' % self.get_big_data_upload_URI(True)

                raise Exception('The new content for this LabDataContainer is %i bytes long, but only content which is %i bytes or smaller may be directly uploaded in this way. %s' % (source['len'], config.MAX_DIRECT_UPLOAD_FILE_SIZE_BYTES, further_instructions))

            # content type can have a charset or other stuff after the base content type (text/whatever)
            # we only care about the first part of this
            base_content_type = normalized_content_type
            if ';' in base_content_type:
                base_content_type = base_content_type.split(';')[0]

            if (base_content_type in ["text/plain", "text/html", "application/json"]):
                #
                # content is text
                #
                if isinstance(source['data'], str) or isinstance(source['data'], unicode):
                    # direct string-string copy
                    self._txt_content = source['data']
                else:
                    #logging.info(type(source['data']))
                    # copy from file-like object
                    self._txt_content = u''
                    data = source['data'].read(INCOMING_CONTENT_BUFFER_SIZE)
                    try:
                        while data:
                            self._txt_content += data
                            data = source['data'].read(INCOMING_CONTENT_BUFFER_SIZE)
                    except UnicodeDecodeError as ude:
                        raise Exception('The content type specified was %s but the content contains bytes which are not valid for this type of content. The specific problem was that %s' % (normalized_content_type, str(ude)))
                        
                self.__clear_old_bin_content()
                
            else:
                #
                # content is binary
                #
                if self._bin_content_ref is not None:
                    # re-use the old content reference
                    binblock = self._bin_content_ref
                else:
                    binblock = BinaryBlock()
                    
                # clear old binary AND text content (this needs to happen before writing new binary content)
                self.__clear_old_bin_content()
                self.__clear_old_txt_content()

                # write new binary content
                if isinstance(source['data'], str) or isinstance(source['data'], unicode):
                    # direct string copy
                    # logging.info('incoming data is in str or unicode')
                    binblock.monolithic_set(source['data'])
                else:
                    # copy from file-like object
                    # logging.info('incoming data is in file-like object')
                    data = source['data'].read(INCOMING_CONTENT_BUFFER_SIZE)
                    while data:
                        binblock.write(data)
                        data = source['data'].read(INCOMING_CONTENT_BUFFER_SIZE)
                
                binblock.close() # done writing
                try:
                    binblock.put() # save it
                    self._bin_content_ref = binblock
                except Exception as ex:
                    logging.error('Exception raised during LabDataContainer.impl__set_content_from_user__no_put when saving BinaryBlock: %s' % str(ex))
                    # logging.info('binblock length = %i bytes' % len(binblock.data))
                    # raise Exception('Exception raised during LabDataContainer.impl__set_content_from_user__no_put when saving BinaryBlock: %s' % (str(ex)))
                #logging.info(len(binblock.monolithic_get()))
                
                # we will write thumbnails opportunistically the first time
                # each one is requested
        
        # and, finally, set the content type
        self.content_type = normalized_content_type
       # logging.info('wrote ct %s' % self.content_type)
#        logging.info('d')
        logging.info('impl__set_content_from_user__no_put: (B) ' + str(self.content_type))

    def write_content_to_handler(self, handler, tn_type=None):
        """ Properly writes this LDC's content (or, optionally, a thumbnail version thereof)
        to the specified Webapp2 request handler.
        
        :handler:
            A Webapp2 request handler with a valid response object.
        
        :tn_type:
            Optional. Image LDC's only. The string identifier of a thumbnail version of the LDC to send,
            or None to send the full-sized version of the content.
        
        *** DOES NOT SET ANY RESPONSE HEADERS. Do that yourself! ***
        
        """
        needs_put = False
                
        # write new-style content
        s = self.get_non_binary_content_as_string()
        if s is not None:
            handler.response.write(s)
        else:
            # figure out which model property contains the data
            if tn_type is not None and tn_type != 'closeup':
                an = self.__get_model_property_name_for_thumbnail_key(tn_type)

                if not hasattr(self, an):
                    handler.response.status_int = 404
                    return
                    
                # get the data object
                binblock = getattr(self, an)
#                logging.info(an)
#                logging.info(binblock)
                # see if we need to create this thumbnail right now
                if binblock is None and self._bin_content_ref is not None and tn_type in config.LDC_THUMBNAIL_PARAMS:
                    binblock = BinaryBlock()
                    for profile in config.LDC_THUMBNAIL_PARAMS[tn_type]:
                        try:
                            #logging.info('Trying "%s" thumbnail profile...' % profile)
                            img = support.imaging.generate_thumbnail(
                                    image_data=self._bin_content_ref.monolithic_get(),
                                    content_type=self.content_type,
                                    min_source_width=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['min_source_width'],
                                    min_source_height=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['min_source_height'],
                                    max_source_width=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['max_source_width'],
                                    max_source_height=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['max_source_height'],
                                    width=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['width'],
                                    height=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['height'],
                                    overlay_path=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['overlay_path'],
                                    valign=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['valign'],
                                    top_crop_pct=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['top_crop_pct'],
                                    bottom_crop_pct=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['bottom_crop_pct'],
                                    left_crop_pct=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['left_crop_pct'],
                                    right_crop_pct=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['right_crop_pct'],
                                    crop_x=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['crop_x'],
                                    crop_y=config.LDC_THUMBNAIL_PARAMS[tn_type][profile]['crop_y'],
                                )
                            if img is not None:
                                binblock.monolithic_set(img)
                            if not binblock.is_empty():
                                # logging.info('Used "%s" thumbnail profile for %s thumbnail' % (profile, tn_type))
                                binblock.put()
                                setattr(self, an, binblock)
                                needs_put = True
                                break
                        except:
                            # if there are any errors in thumbnail generation, skip making the thumbnail
                            pass
                    
                    if binblock.is_empty():
                        binblock = None
                
            else:
                # get the data object
                binblock = self._bin_content_ref
            
            if binblock is not None:
                if not isinstance(binblock, BinaryBlock):
                    raise Exception('Attempting to read something other than BinaryBlock as content for LabDataContainer %s'  % str(self.get_path()))
                
                binblock.send_to_handler(handler, content_type=self.content_type)


            if needs_put:
                try:
                    self.put()
                except:
                    pass
    
    def __get_model_property_name_for_thumbnail_key(self, tn_type):
        return '_bin_content_ref__thumbnail_%s' % tn_type

    
    def set_content(self, content=None, content_type=None, decode_base64_before_saving=False):
        """Sets the data content of this LabDataContainer.
        
        :content:
            The content to store in this LabDataContainer. If None, will remove the LabDataContainer's
            content. Setting content to None does NOT remove child LabDataContainers.
        
        :content_type:
            The MIME type of the content. If None and content is specified,
            then we will try to detect a type based on the Python type of the content argument.
                
            At the moment, this detection works as follows:
                
                If type(content) is...      Then a content_type set to None will be set to...
                str                         'text/plain'
                unicode                     'text/plain; charset=UTF-8'
                anything else               'application/octet-stream'
                
            However, this detection may change in the future. The best bet is to
            explicitly define the content type by giving content_type a value.
            
        :decode_base64_before_saving:
            Optional. If True and the content argument is a string, the method will first interpret the
            content argument as a Base64 string, and use the decoded data as the actual content.

        """
        content_type = support.modeling.normalize_content_type(content, content_type)
        self.impl__set_content_from_user__no_put(
            normalized_content_type=content_type,
            incoming_content=content,
            decode_base64_before_saving=decode_base64_before_saving
        )
        self.model_version_used = LabDataContainer.LATEST_MODEL_VERSION
        self.put()
        


        
        
    def get_non_binary_content_as_string(self):
        """If the LDC has non-binary content, returns it as a string. Otherwise,
        returns None.
        """
        if self.content_type is not None:
            ctl = self.content_type.lower()
        else:
            ctl = None
        if ctl is not None and (ctl.startswith('text/') or ctl.startswith('application/json')):
            return self._txt_content
        else:
            return None
    
    
    def to_dict(self):
        """Return a serializable dict describing this LabDataContainer
        appropriately.
        """
        # start with the default serialization dict
        d = super(LabDataContainer, self).to_dict()
        
        # the default serialization will have either id or name
        # depending on the details of the object's key
        if 'id' in d:
            del(d['id'])
        # replace or set the name field with the terminal name from this LDC's LabDataPath
        d['name'] = self.get_path().last_name()
        
        if '_txt_content' in d:
            del(d['_txt_content'])
        if 'unlisted' in d:
            del(d['unlisted'])

        # remove defato thumbnail properties and replace
        # them with URLs to retrieve the various kinds of thumbnails
        # of this LDC's content
        for k in config.LDC_THUMBNAIL_PARAMS.keys():
            an = self.__get_model_property_name_for_thumbnail_key(k)
            if an in d:
                del(d[an])
            d['content_tn_%s' % k] = self.get_thumbnail_URI(k)
        
        # the content_is_binary flag is used to quickly let client apps
        # tell whether content is binary or not without interpreting the MIME type
        d['content'] = self.get_non_binary_content_as_string()
        d['content_is_binary'] = d['content'] is None

        # path to the LDC (not a URL)
        if not hasattr(d, 'full_path') or len(self.full_path) == 0 or self.full_path is None:
            d['full_path'] = self.get_path().to_list()
        
        d['content_url'] = self.get_content_URI()
        
        d['recently_migrated'] = self.recently_migrated
        
        d['updated_at_friendly'] = str(self.updated_at)
        d['app_timestamp_friendly'] = str(self.app_timestamp)
        
        d['num_children'] = LabDataContainer.num_children_counter(str(self.get_path())).get_value()
        d['big_data_upload_url'] = self.get_big_data_upload_URI(True)

        if self.content_timezone is not None:
            # attempt to calculate the current time in this content's timezone
            try:
                tz = timezone(self.content_timezone)
                dt = tz.localize(support.modeling.modeling_utcnow())
                d['content_local_time'] = dt
            except:
                pass
        
#        d['k'] = str(self.key())
#        d['p'] = str(self.parent())
        del(d['deleted'])
        del(d['culled'])
        
        return d


    __cached_big_data_upload_finish_URI = None
    __cached_big_data_upload_URI = None
    def get_big_data_upload_URI(self, full):
        """Returns a URL suitable for uploading 1MB or more of data as the content for
        this LabDataContainer
        
        :full:
            Whether or not to return a "full" URI from uri_for()
        """
        if self.__cached_big_data_upload_finish_URI is None:
            pl = self.get_path().to_list()
            depth = len(pl) - 1
            uri_name = '%s-L%i-finish_upload' % (self.__class__.__name__, depth)
            
            # construct a dict of arguments to uri_for()
            d = dict()
            for i in range(len(pl)):
                d['ldc%i' % (i)] = pl[i]

            if d is not None:
                self.__cached_big_data_upload_finish_URI = uri_for(uri_name, _full=full, **d)
            else:
                self.__cached_big_data_upload_finish_URI = None
        
        if self.__cached_big_data_upload_URI is None:
            self.__cached_big_data_upload_URI = blobstore.create_upload_url(self.__cached_big_data_upload_finish_URI)

        return self.__cached_big_data_upload_URI


    def get_thumbnail_URI(self, tn_type):
        """If this LabDataContainer has image content and the specified
        thumbnail type is valid, will return a URI pointing to the thumbnail
        itself. Otherwise, returns None.
        """
        # this is not very extensible, but it is fast and simple:
        if self.content_type is not None and self.content_type.startswith('image/') and tn_type in config.LDC_THUMBNAIL_PARAMS:
            if tn_type == 'closeup':
                # the 'closeup' thumbnail has been deprecated, but we don't want to
                # break links, so we alias it to the main content URI for all images
                return self.get_content_URI()
            else:
                return '%s/%s' % (self.get_content_URI(), tn_type)
        else:
            return None
    
    __cached_content_URI = None
    def get_content_URI(self):
        """Returns a public-facing URL to access the content of this LabDataContainer
        """
#        content_uri = None
#        uri = self.get_URI(True)
#        
#        if uri.endswith('/'):
#            content_uri = d['url']+'content'
#        else:
#            content_uri = d['url']+'/content'
        if self.__cached_content_URI is None:
            if self.content_type is not None and self.content_type.startswith('image/'):
                mk = LabDataContainerPublicMediaKey.get_media_key_str(self)
                self.__cached_content_URI = uri_for('public-media', _full=True, key=mk)
            else:
                try:
                    uri = self.get_URI(True)
                    if uri.endswith('/'):
                        self.__cached_content_URI = uri+'content'
                    else:
                        self.__cached_content_URI = uri+'/content'
                except:
                    return None
        
        return self.__cached_content_URI
    
    
    __cached_URI = None
    def get_URI(self, full):
        """Returns a URI by which this instance may be accessed, or None if no such
        URI is available.
        
        :full:
            Whether or not to return a "full" URI from uri_for()
        """
        if self.__cached_URI is None:
            pl = self.get_path().to_list()
            depth = len(pl) - 1
            uri_name = '%s-L%i' % (self.__class__.__name__, depth)
            
            # construct a dict of arguments to uri_for()
            d = dict()
            for i in range(len(pl)):
                d['ldc%i' % (i)] = pl[i]

            if d is not None:
                self.__cached_URI = uri_for(uri_name, _full=full, **d)
            else:
                self.__cached_URI = None
            
        return self.__cached_URI
        
    def __eq__(self, other) :
        """When comparing LabDataContainers, they are the same if they:
            1. are both instances of the same class
            2. have the same properties and values
            3. have the same key
        """
        if not isinstance(other, LabDataContainer):
            return False
        
        # this might be an unnecessary performance hit:
        # use the serialization of both objects as a simple
        # way to compare properties of the two instances
        if not hasattr(other, 'to_dict'):
            return False
        if self.to_dict() != other.to_dict():
            return False

        if self.key() != other.key():
            return False

        return True

class LabDataContainerPublicMediaKey(support.modeling.GenericLogEntryModel):
    """ LabDataContainerPublicMediaKey objects allow one-way mapping of LabDataContainers to
    "media keys" which can be used to publicly refer to the LDC without exposing the actual
    path of the LabDataContainer.
    """
    
    ldc = db.ReferenceProperty(reference_class=LabDataContainer)
    """The LDC to which this public content URI maps"""
    
    #
    # class methods
    #
    @classmethod
    def get_media_key_str(cls, ldc):
        if not isinstance(ldc, LabDataContainer):
            raise Exception('ldc must be a LabDataContainer, but it is %s' % (ldc.__class__.__name__))
        
        m = hashlib.md5()
        m.update(str(ldc.get_path()))
        s = m.hexdigest()
        mk = LabDataContainerPublicMediaKey.get_or_insert(
            key_name = s,
            ldc = ldc
        )
        return s
        
    @classmethod
    def get_LDC(cls, media_key):
        mk = LabDataContainerPublicMediaKey.get_by_key_name(media_key)
        if mk is not None:
            try:
                return mk.ldc
            except:
                return None
        else:
            return None

class UserCredentials(support.modeling.GenericLogEntryModel):
    
    created_at = support.modeling.CreatedAtDateTimeProperty(required=True)
    "The date/time when these user credentials were created"
    
    updated_at = support.modeling.ModifiedAtDateTimeProperty(required=True)
    "The date/time when these user credentials were last updated (modified)."

    user = db.UserProperty(required=True)
    "The GAE User object associated with these credentials"
    
    app_key = db.StringProperty(required=False, default='')
    "If provided, the user can log in and use this app key to interactively work with the API (e.g. using the help system)"
    
    authorized_user = db.BooleanProperty(required=True, default=False)
    "Whether or not the user is authorized. If False then this user is as good as anonymous."
    
    can_monitor_workers = db.BooleanProperty(required=False,default=False)
    "Whether or not the user is authorized to use the Admin Worker Monitor"
    
    can_create_app_keys = db.BooleanProperty(required=False,default=False)
    "Whether or not the user is authorized to create new app keys"

    #
    # class methods
    #
    @classmethod
    def get_current(cls):
        """ Retrieves credentials for the current user
        """
        return UserCredentials.get_for_user(users.get_current_user())
    
    @classmethod
    def get_for_user(cls, user):
        """ Retrieves credentials for a given app engine User instance.
        
        :user:
            The User object to get credentials for.
        """
        c = None
        if user:
            q = db.Query(UserCredentials)
            q.filter('user =', user)
            c = q.get()
            if c is None:
                c = UserCredentials(
                    user = user,
                    authorized_user = False,
                )
                c.put()
        return c
        

def _AppCredentials__make_big_prn():
    """Used to generate pseudo-random secrets for new AppCredentials objects"""
    #return hashlib.sha256( str(random.getrandbits(256)) ).hexdigest()
    return base64.b64encode(hashlib.sha256( str(random.getrandbits(256)) ).digest(), random.choice(['rA','aZ','gQ','hH','hG','aR','DD'])).rstrip('==')
        
class AppCredentials(support.modeling.GenericLogEntryModel):
    """ AppCredentials allow a non-human client to access the API.
    
    key_name: The entity's key name is the public App Key
    
    """
    
    created_at = support.modeling.CreatedAtDateTimeProperty(required=True)
    "The date/time when these API credentials were created"
    
    updated_at = support.modeling.ModifiedAtDateTimeProperty(required=True)
    "The date/time when these API credentials were last updated (modified)."
    
    description = db.StringProperty(required=False)
    "A description of these credentials"
    
    secret = db.StringProperty(required=True)
    "The secret for these credentials."
    
    authorized_app = db.BooleanProperty(required=True, default=False)
    "Whether or not the app is authorized. If False then this app is as good as anonymous."
    
    from_user = False
    "Whether or not this AppCredentials object was loaded from a UserCredentials object"
    def to_dict(self):
        d = super(self.__class__, self).to_dict()
        d['from_user'] = self.from_user
        return d
    
    #
    # class methods
    #
    def __init__(self, *args, **kwargs):
        # if there is no secret provided, make sure we generate a new one every time
        # a new AppCredentials entity is created
        if not 'secret' in kwargs:
            kwargs['secret'] = __make_big_prn()+__make_big_prn()
        super(self.__class__, self).__init__(*args, **kwargs)
    
    @classmethod
    def generate(cls):
        """ Generate new AppCredentials
        """
        cred = AppCredentials(
            key_name = str(__make_big_prn()),
            description = ''
        )
        cred.put()
        return cred
    
    @classmethod
    def get_for_app_key(cls, app_key):
        """ Given an app key, retrieves an AppCredentials object.
        
        :app_key:
            The app key.
        """
        if app_key is None or len(app_key) <= 0:
            return None
        else:
            cred = AppCredentials.get_by_key_name(app_key)
            #
            # lazily load from fixtures
            #
            if cred is None and app_key in static_data.standard_datastore_fixtures.CLIENT_APP_CREDENTIALS:
                template = static_data.standard_datastore_fixtures.CLIENT_APP_CREDENTIALS[app_key]
                logging.info('model.AppCredentials: Lazy-loading AppCredentials from fixtures: '+app_key)
                cred = AppCredentials(key_name=app_key, **template)
                cred.put()
                
            return cred
    
    @classmethod
    def authenticate_request(cls, req, user_cred=None):
        """ Attempts to verify that a provided Webapp2/webob Request object has originated
        from an authenticated client. First, the request itself is inspected for valid
        client authentication information. If none is found, the optional user_cred
        object will be checked to see if it contains a stored, valid App Key.
        
        If the request can be authenticated, then an AppCredentials object will be returned.
        
        This method will return None under the following circumstances:
            - The request includes no autnetication information and no user_cred object is provded
            - Neither the request or user_cred include autnetication information
            - The request includes authentication information, but it is invalid for some reason
            - The request includes no authentication information and the auth information from
              user_cred is invalid for some reason
        
        Authentication information is supplied with requests using the 'Authorization' HTTP header
        in the form:
            
            Authorization: CWL appkey:signature
        
        or as a request parameter called "_auth" which has the form:
            
            &_auth=appkey:signature
        
        :req:
            Required. A Webapp2 or webob HTTP request object.
        
        :user_cred:
            Optional. A UserCredentials object to use as a fallback when
            requests are missing authentication information.
        
        """
        # check arguments
        if not isinstance(req, Request):
            return None
        if user_cred is not None and not isinstance(user_cred, UserCredentials):
            return None
        
        key_used = None
        app_cred = None
        expected_signature = None
        candidate_signature = None
        
        auth_arg = req.get('_auth', default_value=None)
        
        if 'Authorization' in req.headers or auth_arg is not None:
            auth_value_parts = None
            if 'Authorization' in req.headers:
                # first choice is the Authorization header
                parts = req.headers['Authorization'].split(' ')
                if len(parts) == 2 and parts[0] == 'CWL':
                    auth_value_parts = parts[1].split(':')
                    candidate_signature = parts[1]
        
            elif auth_arg is not None:
                # failing that, use the _auth parameter
                auth_value_parts = auth_arg.split(':')
                candidate_signature = auth_arg

            # if the value part of the authorization string is valid (regardless of where it came from)...
            if len(auth_value_parts) == 2:
                app_key = auth_value_parts[0]
                key_used = app_key
                app_cred = AppCredentials.get_for_app_key(app_key)
                if app_cred is not None:
                    # the app_key is valid, check the signature
                    expected_signature = lask.client.get_auth_parameter_for_url(req.url, str(app_key), str(app_cred.secret))
                    if candidate_signature != expected_signature:
                        #logging.info(expected_signature)
                        #logging.info(candidate_signature)
                        # failed!
                        app_cred = None
        
        else:
            # failing any explicit app authentication, check
            # the logged-in user's account to see if they are
            # an app owner
            if user_cred is not None:
                if user_cred.app_key is not None:
                    key_used = user_cred.app_key
                    # user has something stored in the app_key field, try to use it as an app key...
                    app_cred = AppCredentials.get_for_app_key(user_cred.app_key)
                    if app_cred is not None:
                        app_cred.from_user = True
        
        return app_cred, key_used, expected_signature, candidate_signature
        
        

def _get_touchpoint_from_worker_guid(worker_guid):
    """ Given a valid worker GUID, returns the touchpoint with which
    that worker is associated, or None if the worker is not
    associated with a touchpoint.
    """
    parts = worker_guid.split('.')
    if len(parts) >= 3:
        tp = parts[-3]
        if tp not in config.VALID_TOUCHPOINT_NAMES:
            tp = None
    else:
        tp = None
    return tp

    
    
    
def _get_app_guid_from_worker_guid(worker_guid):
    """ Given a valid worker GUID, returns the app GUID.
    """
    parts = worker_guid.split('.')
    if len(parts) >= 2:
        app = parts[-2]+'.'+parts[-1]
    else:
        app = worker_guid
    return app

    
    
    
