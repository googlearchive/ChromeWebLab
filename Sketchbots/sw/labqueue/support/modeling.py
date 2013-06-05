# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""
This is a collection of superclasses which help to abstract certain consistent
attributes of data within the Lab.
"""

from google.appengine.ext import db
from google.appengine.ext import blobstore
try: import simplejson as json
except ImportError: import json
import datetime
import calendar
import time
import numbers
import support.big_counter
from math import floor

SIMPLE_TYPES = (int, long, float, bool, dict, basestring, list)

class SimplejsonModelRegistry(object):
    """When using json.dumps() with objects that inherit from GenericModel
    you should supply add SimplejsonModelRegistry.default as the dumps() default. E.g.
    
    class FooClass(GenericModel):
        something = 'Foo!'
    
    foo_list = [FooClass()] # a list of FooClasses, which extend GenericModel
    
    print json.dumps(foo_list)
    # raises TypeError: <support.modeling.GenericLogEntryModel object at ...> is not JSON serializable
    
    print json.dumps(foo_list, default=SimplejsonModelRegistry.default)
    # prints [{"something":"Foo!"}]
    
    """
    
    @classmethod
    def default(cls, obj):
        if hasattr(obj, 'to_dict'):
            try:
                return obj.to_dict()
            except:
                return None
        elif isinstance(obj, datetime.datetime):
            return calendar.timegm(obj.timetuple())
            #return '%s (%f)' % (obj.strftime('%Y-%m-%d %H:%M:%S'), calendar.timegm(obj.timetuple()))
        elif isinstance(obj, db.Key):
            return obj.id_or_name()
        elif obj == True:
            return True
        elif obj == False:
            return False
        else:
            return obj
            

class GenericModel(db.Model):
    """Almost all lab API-related data models should subclass this class.
    """
    
    def me(self, include_rejected=False):
        """Gets a single object.
        
        :include_rejected:
            Optional. If True, will allow retrieval of objects which have been rejected by a moderator.
            
        """
        return self
    
    def default(self):
        return self.to_dict()
    
    __big_counter_cache = {}
    def private_big_counter(self, name):
        """ Returns an instance of a BigCounter with the
        specified name which is "private" to this GenericModel instance.
        
        :name:
            The counter name. Accessible within the GenericModel subclass
            instance only.
        
        """
        name = '%s_%s_%s' % (self.kind(), self.id_or_name(), name)
        if name not in self.__big_counter_cache:
            self.__big_counter_cache[name] = support.big_counter.BigCounter(name)
        return self.__big_counter_cache[name]


    def to_json_friendly_value(self, v):
        if v is None or isinstance(v, SIMPLE_TYPES):
            value = v
        elif isinstance(v, datetime.date):
            # Convert date/datetime to ms-since-epoch ("new Date()").
            ms = calendar.timegm(v.utctimetuple()) * 1000
            ms += getattr(v, 'microseconds', 0) / 1000
            value = float(ms)/1000
        elif isinstance(v, db.Model):
            value = v.key()
        else:
            raise ValueError('cannot encode ' + repr(v))
        return value
    
    def to_dict(self, props=None, stub=False, indent=None):

        if self.is_saved():
            if self.key().name() is not None:
                data = {"name": self.key().name() }
            else:
                data = {"id": self.key().id() }
        else:
            data = {}
        
        # note difference between URI and url here
        if hasattr(self, 'get_URI'):
            try:
                url = self.get_URI(full=True)
            except AssertionError:
                url = None
            if url is not None:
                data['url'] = url
            
        for key, prop in self.properties().iteritems():
            if props and key not in props:
                continue
            if type(prop) is db.ReferenceProperty:
                ref = prop.get_value_for_datastore(self)
                if ref:
                    data["%s_id" % key] = self.to_json_friendly_value( ref.id() )
            elif type(prop) is not blobstore.BlobReferenceProperty:
                data[key] = self.to_json_friendly_value( getattr(self, key) )
        # add the stub value if we have truncated the props
        if stub and len(self.__class__.optional_properties) > 0:
            data["stub"] = True
        
        data["is_saved"] = self.is_saved()
        
        return data
        
    def to_json(self, props=None, stub=False, indent=None):
        return json.dumps( self.to_dict(), indent=indent )
    
    def __str__(self):
        return str(self.to_json())
    
    def to_pretty_json(self, props=None, stub=False, indent=None):
        j = self.to_json(props, stub, indent=True)
#        j = j.replace(', ',",\n")
#        j = j.replace('{', "{\n")
#        j = j.replace('}', "\n}")
        return j

    def get_cloned_copy(self, **extra_args):
        """Clones this entity, with optional additional constructor attributes.
        
        Inspired by the original from Nick Johnson <http://stackoverflow.com/questions/2687724/copy-an-entity-in-google-app-engine-datastore-in-python-without-knowing-property>

        The cloned entity will have exactly the same property values as the original
        entity, except where overridden. By default it will have no parent entity or
        key name, unless supplied.

            :extra_args:
                Keyword arguments to override from the cloned entity and pass
                to the constructor.

        Returns:
            A cloned, possibly modified, copy of entity e.
        """
        model_class = self.__class__
        props = dict((k, v.__get__(self, model_class)) for k, v in model_class.properties().iteritems())
        props.update(extra_args)
        return model_class(**props)
  
    @classmethod
    def list_from_query(cls, q, num, start=None, order=None, list_entity_property_values=None, filters=None):
        """Gets a list of objects, optionally paginating the results.
        
        :q:
            Required. The Query to generate a list from.
        
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
        
        :list_entity_property_values:
            Optional. If set to the name of an entity property, will attempt to return
            a list of the values of this property for every entity in the list, instead
            of the entities themselves. Use with care as this may result in
            long requests!
        
        :filters:
            Optional. A dict of filters for different properties of the object. The dict
            keys should be properties and the value of each entry in the dict should be
            a filter.
            
            The filter is specified as an array in the form:
                [op,value]

            ...where op is a string having one of the following values:
                "=","!=",">",">=","<","<="

            ...and value is any value.
            
        
        * Raises a TypeError if start or num are not numbers
        * Raises an ValueError if start or num are negative
        * Raises a PropertyError if order is specified, but is not a valid property of the objects being listed
        """
#        
#        if num is None:
#            raise ValueError('The "num" parameter must be specified')
        
        # this helps out when fielding web requests with typeless parameters
#        try:
#            if not isinstance(num, int) and num != str(int(num)):
#                raise TypeError('The "num" parameter must be an integer, but instead it is a %s with a value which cannot be interpreted as an integer' % (type(num)))
#            else:
#                num = int(num)
#        except ValueError:
#            raise TypeError('The "num" parameter must be usable as an integer, but instead it is a %s with a value which cannot be interpreted as an integer' % (type(num)))
            
        if not isinstance(num, int):
            num = None
        elif num < 0:
            raise ValueError('The "num" parameter must be positive')
            
        if start is not None:
            try:
                start = int(start)
            except ValueError:
                raise TypeError('if start is specified it must be an integer, but instead it is a %s with a value which cannot be interpreted as an integer' % (type(start)))
                
            if start < 0:
                raise ValueError('if start is specified it must be positive')
        else:
            start = None
        
        if q is None:
            return q
            
        if not isinstance(q, db.Query):
            # get_list can only handle Query objects...
            # TODO - raise an exception?
            return None
        
        # filter the query according to params
        if order is not None and order != '':
            q.order(order)
        
        if filters is not None:
            if isinstance(filters, dict):
                for prop in filters:
                    if filters[prop] is not None:
                        q.filter('%s %s' % (prop, filters[prop][0]), filters[prop][1])
        
        if list_entity_property_values is not None:
            es = q.fetch(num, offset=start)
            L = []
            for e in es:
                if hasattr(e, list_entity_property_values):
                    L.append(getattr(e, list_entity_property_values))
            return L
        else:
            return q.fetch(num, offset=start)
    

class WorkerGUID(db.StringProperty):
    """Describes a GUID for a Worker.
    """
    pass

class WorkerGUIDList(db.StringListProperty):
    """Describes a list of Worker GUIDs
    """
    pass

class ApplicationGUID(db.StringProperty):
    """Describes a GUID for an Application.
    """
    pass


class GenericLogEntryModel(GenericModel):
    """A subclass of GenericModel which is specifically for things which are
    like log entries (what happened, who did it, when, etc.).
    """
    pass
    

class OccuranceTimeProperty(db.DateTimeProperty):
    """This class should be used for properties meant to hold the date/time when
    something happened.
    """
    pass

def CreatedAtDateTimeProperty(required=False):
    """This class should be used for properties which record when an entity was created.
    """
    return OccuranceTimeProperty(required=required, auto_now_add=True)
    #return OccuranceTimeProperty(required=required)

def ModifiedAtDateTimeProperty(required=False):
    """This class should be used for properties which record when an entity has been modified.
    """
    return OccuranceTimeProperty(required=required, auto_now=True)
    #return OccuranceTimeProperty(required=required)


class UnparsedJSONObjectProperty(db.TextProperty):
    """This class can be used to store JSON-encoded strings directly in the datastore.
    It does not actually encode/decode the JSON, it just provides a suitable container for it.
    This is essentially an alias to the most appropriate db.* property class for JSON strings.
    """
        

class ParsedJSONObjectProperty(UnparsedJSONObjectProperty):
    """This class can be used for storing Python objects in the datastore as JSON-encoded strings.
    """
    def validate(self, value):
        """Validates the data being assigned. Currently, there is no validation performed.
        """
        return value

    def get_value_for_datastore(self, model_instance):
        """Converts the property's value (an object) into a JSON string suitable
        for storage in the datastore.
        """
        result = super(ParsedJSONObjectProperty, self).get_value_for_datastore(model_instance)
        result = json.dumps(result)
        return db.Text(result)

    def make_value_from_datastore(self, value):
        """Attempts to convert the JSON-encoded string from the datastore into
        a real object.
        """ 
        try:
            value = json.loads(str(value))
        except:
            pass

        return super(ParsedJSONObjectProperty, self).make_value_from_datastore(value)

class NaiveIntegerCounterProperty(db.IntegerProperty):
    """Use this class to store actual counter values, such as simple counters which are changed infrequently or for which
    contention is acceptable, or for storing the actual value of a shard in a sharded counter scheme.
    """
    pass

# A UTC class.
ZERO_timedelta = datetime.timedelta(0)

class UTC_tzinfo(datetime.tzinfo):
    """UTC"""

    def utcoffset(self, dt):
        return ZERO_timedelta

    def tzname(self, dt):
        return "UTC"

    def dst(self, dt):
        return ZERO_timedelta

utc_tzinfo = UTC_tzinfo()

def modeling_utcnow():
    #return datetime.datetime.now(tz=utc_tzinfo)
    return datetime.datetime.utcnow()

def modeling_utcnow_timestamp():
   return calendar.timegm(modeling_utcnow().timetuple())

def modeling_utc_start_of_today():
    dt = support.modeling.modeling_utcnow()
    # convert dt into an absolute number
    dt_ts_sec = calendar.timegm(dt.timetuple()) + dt.microsecond/1e6
    # reduce the precision to 1 day
    return datetime.datetime.utcfromtimestamp(floor(dt_ts_sec / 86400) * 86400)
    

def normalize_content_type(content, content_type):
    """Attempts to normalize content type for a given piece of content.
    The normalized content-type will be returned.
    
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
    """
    
    # if content is None:
    #     content_type = None # the content type of None is None!
    # elif content_type is None or content_type == '':
    if (content_type is None or content_type == '') and content is not None:
        if hasattr(content, 'file'):
            # new binary data incoming as a direct file upload
            content_type = content.type
                
        else:
            # try figure to out what content_type should be
            if isinstance(content, unicode):
                content_type = 'text/plain; charset=UTF-8'
            elif isinstance(content, str) or isinstance(content, numbers.Number):
                content_type = 'text/plain'
            else:
                content_type = 'application/octet-stream'
            
    return content_type

def normalize_datetime(dt):
    
    if not isinstance(dt, datetime.datetime):
        if isinstance(dt, numbers.Number):
            try:
                dt = datetime.datetime.utcfromtimestamp(dt)
            except ValueError as ve:
                raise ValueError('A time parameter was specified as a number, but the number could not be interpreted as a UNIX timestamp (number of seconds since midnight GMT Jan 1., 1970)')
        elif isinstance(dt, str) or isinstance(dt, unicode):
            try:
                dt = datetime.datetime.strptime(dt, "%d %m %Y %H:%M:%S")
            except ValueError as ve:
                raise ValueError('A time parameter was specified as a string, but it was not in the form: DD MM YYY HH:MM:SS (note that the day of the month is first)')
        
    return dt
    
def key_to_human_readable_str(k):
    if k is None:
        return 'None'
    
    p = k
    s = ''
    while p is not None:
        s = ' / ' + p.kind() + '=' + p.id_or_name()
        p = p.parent()
    return s
