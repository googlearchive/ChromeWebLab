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
""" Model classes for use by services


"""

from google.appengine.ext import db
from lask.core import exception
import support.modeling
import datetime
import calendar
import numbers
import logging

import config


_KEY_STRFTIME_FMT = '%Y_%m_%d_%H_%M_%s'


class CloudworkerTaskResultCache(support.modeling.GenericLogEntryModel):
 
    created_at = support.modeling.CreatedAtDateTimeProperty(required=True)
    "The date/time when the cache entry was created"
    
    payload_patch = support.modeling.ParsedJSONObjectProperty(required=True)
    "The result payload or modified part thereof."
    
    is_success = db.BooleanProperty(default=True)
    "Whether or not the cached result was a successful result"

