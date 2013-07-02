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


Contains Lask exception classes.
"""

import datetime
import lask.core.model
import lask.services
import config


class ObjectDeletedError(Exception):
    """The requested object has been deleted.
    """
    HTTP_status_code = 410
    pass
    
class ObjectRejectedError(Exception):
    """The requested object has been rejected.
    """
    HTTP_status_code = 410
    pass
    
class InvalidActivitySpaceError(Exception):
    pass

class InvalidTouchpointError(Exception):
    pass

class ContainerAlreadyExistsError(Exception):
    """Raised when an attempt is made to create a new LabDataContainer with the same path
    as an existing LabDataContainer
    """
    HTTP_status_code = 409
    pass

class InvalidPathError(Exception):
    """Raised when an attempt is made to use or create an invalid LabDataContainerPath
    """
    pass

class TopicDeletedError(Exception):
    """Raised when the Topic containing a Task is deleted but the Task is not.
    """
    pass

class InvalidTopicTaskPolicyError(Exception):
    """Raised when a Worker tries to set the Task policy for a Topic incorrectly.
    """
    pass

class TopicFullError(Exception):
    """Raised when a Worker attempts to create a new Task in a Topic which does not
    have any space available. This happens when the topic has a max_num_tasks
    rule set and there are not any available slots for new tasks
    """
    pass

class InvalidTopicNameError(Exception):
    """Raised when a Worker attempts to use a Topic name which is invalid/blank/etc.
    """
    pass

class WrongTaskStateError(Exception):
    """Raised when an operation requiring a certain Task state is performed on a Task which is not in that state.
    """
    pass

class TaskNotOfferedError(Exception):
    """Raised when a Worker attempts to accept assignment of a Task not offered to it.
    """
    pass

class TaskNotAssignedError(Exception):
    """Raised when a Worker attempts to use a task not assigned to it.
    """
    pass

class InvalidWorkerGUIDError(Exception):
    """Raised when an invalid/nonexistent Worker GUID is used.
    """
    pass

class InvalidApplicationGUIDError(Exception):
    """Raised when an invalid/nonexistent Application GUID is used.
    """
    pass

class InvalidTaskIDError(Exception):
    """Raised when an invalid/nonexistent Task ID is used.
    """
    pass

class InvalidMessageError(Exception):
    """Raised when an invalid Task progress report message is used.
    """
    pass

class InvalidEstimatedStopError(Exception):
    """Raised when an invalid estimated future stop date/time is used.
    """
    pass

class InvalidPayloadError(Exception):
    """Raised when there is an attempt to assign an invalid payload to a Task.
    """
    HTTP_status_code = 400
    pass

class TooManyAcceptableTopicsError(Exception):
    """Raised when a list of acceptable topics is used which has too many entries.
    """
    pass

class ArgumentError(Exception):
    """Raised when there is a fundamental problem with an argument.
    """
    HTTP_status_code = 400
    pass

class TopicAlreadyExistsError(Exception):
    """Raised when a worker attempts to create a new topic with the same name as an existing one.
    """
    HTTP_status_code = 409
    pass

def ex_check_application_guid_and_raise(app_guid):
    """Will raise an InvalidApplicationGUIDError if the supplied GUID is invalid
    
    GUIDs are invalid if they are None or equivalent to ''.
    """
    if (app_guid is None):
        raise InvalidApplicationGUIDError('Supplied application GUID is None, but that is not a valid application GUID')
    if (app_guid == ''):
        raise InvalidApplicationGUIDError('Supplied application GUID is equivalent to an empty string, but that is not a valid application GUID')

def ex_check_worker_guid_and_raise(worker_guid):
    """Will raise an InvalidWorkerGUIDError if the supplied GUID is invalid
    
    GUIDs are invalid if they are None or equivalent to '', or if they are the
    strings "undefined" or "null".
    """
    if (worker_guid is None):
        raise InvalidWorkerGUIDError('Supplied worker GUID is None, but that is not a valid worker GUID')
    if (worker_guid == ''):
        raise InvalidWorkerGUIDError('Supplied worker GUID is equivalent to an empty string, but that is not a valid worker GUID')
    if (worker_guid == 'undefined'):
        raise InvalidWorkerGUIDError('Supplied worker GUID is the string "undefined", but that is not a valid worker GUID. This may indicate that the calling code is JavaScript and tried to JSON serialize the special value undefined by concatenating it with a string. Please check for this.')
    if (worker_guid == 'null'):
        raise InvalidWorkerGUIDError('Supplied worker GUID is the string "null", but that is not a valid worker GUID. This may indicate that the calling code is JavaScript and tried to JSON serialize the special value null by concatenating it with a string. Please check for this.')
    if (worker_guid == 'None' or worker_guid == 'none'):
        raise InvalidWorkerGUIDError('Supplied worker GUID is the string "None", but that is not a valid worker GUID. This may indicate that the calling code is Python and tried to JSON serialize the special value None by concatenating it with a string. Please check for this.')

def ex_check_state_and_raise(state, valid_states, method_name):
    """Will raise a WrongStateError if the supplied state is not one of the valid_states
    """
    if any(state == val for val in valid_states) == False:
        raise WrongTaskStateError('This Task\'s state is %s, but to call %s it must be in one of the following states: %s' % (state, method_name, valid_states))
    

def ex_check_topic_name_and_raise(topic_name):
    """Will raise an InvalidTopicNameError if the supplied Topic name is invalid
    
    Topics are invalid if they are None or equivalent to ''.
    """
    if (topic_name is None):
        raise InvalidTopicNameError('Supplied Topic name is None, but that is not a valid Topic name')
    if (topic_name == ''):
        raise InvalidTopicNameError('Supplied Topic name is equivalent to an empty string, but that is not a valid topic')
    if str(topic_name) != topic_name:
        raise InvalidTopicNameError('Supplied Topic name (%s) is not a string, but Topic names must be strings' % (topic_name))
    try:
        if lask.core.model.TopicName(topic_name) != topic_name:
            raise ValueError('')
    except ValueError:
        raise InvalidTopicNameError('Supplied Topic name is of type %r, but Topic names must be %r' % (type(topic_name), lask.core.model.TopicName))
    

def ex_check_payload_and_raise(payload):
    """Will raise an InvalidPayloadError if the supplied Task payload is invalid.
    
    Payloads are invalid if they are None or equivalent to ''.
    """
    if (payload is None):
        raise InvalidPayloadError('Supplied payload is None, but that is not a valid payload')
    if (payload == ''):
        raise InvalidPayloadError('Supplied payload is equivalent to an empty string, but that is not a valid payload')

def ex_check_task_id_and_raise(task_id):
    """Will raise an InvalidTaskIDError if the supplied task ID is invalid
    
    A task ID is invalid if it is None.
    """
    if task_id is None:
        raise InvalidTaskIDError('Supplied Task ID is None, but that is not a Task ID')
    if lask.core.model.TaskID(task_id) is not task_id:
        raise InvalidTaskIDError('Supplied Task ID is of type %r, but Task IDs must be %r' % (type(task_id), lask.core.model.TaskID))

def ex_check_message_and_raise(message):
    """Will raise an InvalidMessageError if the supplied message is None or empty
    """
    if (message is None):
        raise InvalidMessageError('Supplied message is None, but that is not a valid message')
    if (message == ''):
        raise InvalidMessageError('Supplied message is equivalent to an empty string, but that is not a valid message')

def ex_check_est_stop_and_raise(est_stop_at):
    """Will raise an InvalidEstimatedStopError if the supplied date is None or indicates an impossible date (in past, etc.)
    """
    if (est_stop_at is None):
        raise InvalidEstimatedStopError('Supplied date/time is None, but that is not a valid estimated stop time')
    n = datetime.datetime.utcnow()
    if (est_stop_at < n):
        raise InvalidEstimatedStopError('Estimated stop times must be in the future, but the supplied value (%s) is in the past. The current time is %s.' % (est_stop_at, n))

def ex_check_topic_task_policy_and_rasie(policy):
    """Will raise an InvalidTopicTaskPolicyError if the supplied policy is invalid.
    """
    for rule in policy:
        if rule == 'max_num_tasks':
            if not isinstance(policy[rule], int):
                raise InvalidTopicTaskPolicyError('Task policy includes "%s" rule, which must be an int, but it is a %s' % (rule, type(rule)))
        elif rule == 'can_cache':
            if not isinstance(policy[rule], bool):
                raise InvalidTopicTaskPolicyError('Task policy includes "%s" rule, which must be an bool, but it is a %s' % (rule, type(rule)))
        else:
            raise InvalidTopicTaskPolicyError('Task policy includes unrecognized "%s" rule' % (rule))
        

def ex_check_path_and_raise(path, raise_on_last_item_random_id_placeholder=False):
    """Will raise an InvalidPathError if the supplied path is not valid.
    Path elements cannot contain the characters: ' " or LabDataPath.PATH_SEPARATOR and must not be more than
    LabDataPath.MAX_ELEMENT_LENGTH characters long.
    
    """
    if not isinstance(path, lask.core.model.LabDataPath):
        raise InvalidPathError('The specified path is a %s, was expected to be a LabDataPath instance' % (type(path)))
    
    ex_check_path_elements_and_raise(path.to_list(), raise_on_last_item_random_id_placeholder=raise_on_last_item_random_id_placeholder)

def ex_check_path_elements_and_raise(L, raise_on_last_item_random_id_placeholder=False):
    """Will raise an InvalidPathError if the supplied list cannot be used as a valid set of path elements for a LabDataPath.
    Path elements cannot contain the characters: ' " or LabDataPath.PATH_SEPARATOR and must not be more than
    LabDataPath.MAX_ELEMENT_LENGTH characters long.
    
    """
    max = len(L)
    if max <= 0:
        raise InvalidPathError('The specified path has no elements in it')
        
    if raise_on_last_item_random_id_placeholder:
        if lask.core.model.LabDataPath.RANDOM_ID_PLACEHOLDER in L[:-1]:
            raise InvalidPathError('The specified path contains the random ID placeholder (%s) in an illegal position' % (lask.core.model.LabDataPath.RANDOM_ID_PLACEHOLDER))
    for i in range(max):
        element = L[i]
        if element == lask.core.model.LabDataPath.RANDOM_ID_PLACEHOLDER and (i < (max - 1) or raise_on_last_item_random_id_placeholder):
            raise InvalidPathError('The specified path contains the random ID placeholder (%s) in an illegal position' % (lask.core.model.LabDataPath.RANDOM_ID_PLACEHOLDER))
        elif element == None:
            raise InvalidPathError('The specified path contains an element which is null, but this is not valid.')
        elif element == '':
            raise InvalidPathError('The specified path contains an empty string as an element name, but this is not valid.')
        elif "'" in element or '"' in element or lask.core.model.LabDataPath.PATH_SEPARATOR in element:
            raise InvalidPathError('The specified path contains invalid characters (double-quote, single-quote or %s).' % (lask.core.model.LabDataPath.PATH_SEPARATOR))
        elif len(element) > lask.core.model.LabDataPath.MAX_ELEMENT_LENGTH:
            raise InvalidPathError('The specified path is invalid because it contains one or more element with a name longer than %i characters ("%s").' % (lask.core.model.LabDataPath.MAX_ELEMENT_LENGTH, element))

def ex_check_activity_space_and_raise(activity_space):
    """Will raise an InvalidActivitySpaceError if the supplied activity space is not valid.
    """
    if not activity_space in config.VALID_ACTIVITY_SPACES:
        raise InvalidActivitySpaceError('The activity space "%s" is not valid. Valid activity spaces are: %s' % (activity_space, ', '.join(config.VALID_ACTIVITY_SPACES)))

def ex_check_touchpoint_name_and_raise(touchpoint_name):
    """Will raise an InvalidTouchpointError if the supplied touchpoint name is invalid.
    """
    if not touchpoint_name in config.VALID_TOUCHPOINT_NAMES:
        raise InvalidTouchpointError('The touchpoint "%s" is not valid. Valid touchpoint names are: %s' % (touchpoint_name, ', '.join(config.VALID_TOUCHPOINT_NAMES)))
