# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
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

