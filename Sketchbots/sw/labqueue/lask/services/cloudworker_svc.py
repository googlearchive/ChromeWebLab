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
""" This service module provides various resident Workers within the application.


"""

import logging
from support.modeling import *
from lask import core
import lask.services.services_model

class CacheWorker(object):
    
    WORKER_GUID = 'cache.weblab'
    
    @classmethod
    def get(cls, task):
        """ Called by Task.create_Task() whenever a new task is created.
        This method will return the task with any appropriate modifications.
        """
        m_name = 'get_%s_task' % (task.topic_name)
        if hasattr(cls, m_name):
            m_attr = getattr(cls, m_name)
            if callable(m_attr):
                return m_attr(task)
        return None
    
    @classmethod
    def put(cls, task):
        """ Called by Task.stop() when a task is completed
        so that it may be cached.
        """
        logging.info('CacheWorker.put')
        m_name = 'put_%s_task' % (task.topic_name)
        if hasattr(cls, m_name):
            m_attr = getattr(cls, m_name)
            if callable(m_attr):
                return m_attr(task)
        return None
    
    ##############################################################
    #
    # caching for traceroute topic
    #
    
    @classmethod
    def traceroute_cache_key_name(cls, task, destination):
        key_name = '%s_%s' % (task.kind(), destination)
        return key_name
    
    @classmethod
    def get_traceroute_task(cls, task):
        """ Try to retrieve a cached traceroute result.
        """
        logging.info('get_traceroute_task')
        if task.payload is not None and 'destination' in task.payload:
            key_name = CacheWorker.traceroute_cache_key_name(task, task.payload['destination'])
            logging.info(key_name)
            o = lask.services.services_model.CloudworkerTaskResultCache.get_by_key_name(key_name)
            if o is not None:
                payload = task.payload
                payload['route'] = o.payload_patch
                task._impl_stop(
                    CacheWorker.WORKER_GUID,
                    'Finished from cache',
                    payload,
                    o.is_success)
                task.is_cached = True
                return task
        return None
            
        
    @classmethod
    def put_traceroute_task(cls, task):
        """ Try to store a traceroute result.
        """
        logging.info('put_traceroute_task: %s' % (task))
#        logging.info('a:'+str(task.payload is not None))
#        logging.info('a:'+str('destination' in task.payload))
#        logging.info('a:'+str('route' in task.payload))
        if task.payload is not None and 'destination' in task.payload and 'route' in task.payload:
            key_name = CacheWorker.traceroute_cache_key_name(task, task.payload['destination'])
            o = lask.services.services_model.CloudworkerTaskResultCache(
                key_name = key_name,
                payload_patch = task.payload['route'],
                is_success = task.state == core.model.TaskStateProperty.STOPPED_SUCCESS
            )
            o.put()
            logging.info('Successfully cached %s' % (key_name))
            logging.info(o.payload_patch)
            
            
            

