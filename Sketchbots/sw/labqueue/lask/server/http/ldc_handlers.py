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
from lask.core.model import *
from google.appengine.ext.webapp import blobstore_handlers
from support.handlers import HTTPException
from lask.server.rpc import RPCArgumentJSONDecodeError
try: import simplejson as json
except ImportError: import json


####################################################################
#
# These handlers allow RESTful interaction with LabDataContainer objects
#

class RootLDCCollectionHandler(DefaultHandler):
    """Root for all root LDC groups, can create new LDCs and list children if
    ldc0 is in the _can_list_children list.
    
    """
    _can_list_children = [
    ] # this should be empty, but can contain the names of LDC root containers which allow listing of child objects

    _GET_method = 'get_child_LabDataContainers_list'
    _POST_method = 'create_or_update_child_LabDataContainer'
    
    def target(self, *args, **kwargs):
        """Get the target object
        """
        # try to get the root LDC
        path = LabDataPath(kwargs['ldc0'])
        ldc = LabDataContainer.get_for_path(path)

        return ldc
        
    
    def get_GET_method(self, *args, **kwargs):
        """ Overrides DefaultHandler.get_GET_method so that it will only return a method
        if the LDC being targeted is in _can_list_children.
        """
        if self.request.method == 'GET' and 'ldc0' in kwargs and kwargs['ldc0'] not in self._can_list_children:
            return None
        else:
            return self._GET_method


class LDCHandler(DefaultHandler):
    """ Lets one GET an LDC
    """
    _GET_method = 'me'
    _POST_method = 'edit'
    
    def target(self, *args, **kwargs):
        L = []
        for i in range(LabDataPath.MAX_DEPTH):
            k = 'ldc%i' % (i)
            if k in self.request.route_kwargs:
                L.append(self.request.route_kwargs[k])
            else:
                break
        
        if self.request.method == 'POST' or 'HELP' in self.request.params:
            include_rejected = True
        elif 'include_rejected' in self.request.params:
            include_rejected = self.request.params['include_rejected'] == '1' or self.request.params['include_rejected'].lower() == 'true'
        else:
            include_rejected = False
        
        path = LabDataPath.from_URL_quoted(*L)
        ldc = LabDataContainer.get_for_path(path, include_rejected=include_rejected)
        
        return ldc

class LDCDeleteHandler(LDCHandler):
    """ Allows deleting LDCs
    """
    _GET_method = 'end_user_delete'
    _POST_method = 'end_user_delete'
        

class LDCContentHandler(LDCHandler, blobstore_handlers.BlobstoreDownloadHandler):
    """ For GET, sends the LDC's content to the client.
    For POST receives content and adds it to the LDC
    """
    _GET_method = 'get_content'
    _POST_method = 'set_content'
        
    def special_post(self, *args, **kwargs):
        # check authorization!
        if not self.auth_check():
            return
    
        self.add_cors_response_headers()

        # perform the request
        self.respond_basic_rpc(self.cached_target(*args,**kwargs), self._POST_method)
    
    def special_get(self, *args, **kwargs):
        # check authorization!
        if not self.auth_check():
            return
    
        # see if we need to server blob content
        t = self.cached_target()
        
        if t is None:
            return self.respond(HTTPException(404), self.__class__.__name__)
    
        self.add_cors_response_headers()

        t.write_content_to_handler(self)




class LDCContentBigUploadHandler(LDCHandler, blobstore_handlers.BlobstoreUploadHandler):
    """ Finish a "big data upload" for this object which was started using the
    standard App Engine blobstore upload mechanism (see https://developers.google.com/appengine/docs/python/blobstore/overview#Uploading_a_Blob)
    This is essentially a workaround for App Engine not accepting large uploads
    to application-defined handlers.
    """

    def special_post(self, *args, **kwargs):
        # check authorization!
        if not self.auth_check():
            return
    
        self.add_cors_response_headers()

        # app engine should have already saved our data to a blob object
        # and rewrote the request so that the key to that object is available here
        #
        # See https://developers.google.com/appengine/docs/python/blobstore/overview#Uploading_a_Blob
        #
        obj = self.cached_target(*args,**kwargs)
        
        if not obj:
            return self.respond(HTTPException(404), self.__class__.__name__)

        arg = 'content'
        m_name_for_messages = 'POST'
        uploads = self.get_uploads(arg)
        if len(uploads) <= 0:
            return self.respond(RPCArgumentJSONDecodeError('The \'%s\' argument to the \'%s\' method is required but was omitted from the request.' % (arg, m_name_for_messages)), self.__class__.__name__)
        content = uploads[0].key()

        # self.request.params.update({'content': content})

        # self.respond_basic_rpc(self.cached_target(*args,**kwargs), 'set_content')

        arg = 'content_type'
        m_name_for_messages = 'POST'
        target_name_for_messages = ''
        if arg in self.request.params:
            try:
                content_type = json.loads(self.request.params[arg])
            except TypeError:
                return self.respond(RPCArgumentJSONDecodeError('The \'%s\' argument to the \'%s\' method%s was expected to be a value encoded as a JSON string, but instead it was a %s' % (arg, m_name_for_messages, target_name_for_messages, type(self.request.params[arg]))), self.__class__.__name__)
            except json.JSONDecodeError as jde:
                return self.respond(RPCArgumentJSONDecodeError('The \'%s\' argument to the \'%s\' method%s was expected to be a value encoded as a JSON string, but it could not be decoded: %s' % (arg, m_name_for_messages, target_name_for_messages, jde)), self.__class__.__name__)
            
            logging.info('a')

        else:
            logging.info('b')
            content_type = obj.content_type

        logging.info('ldc_handlers: content_type='+str(content_type))
        obj.set_content(content=content, content_type=content_type)

        # send the response
        self.respond(obj)



#
# public media handlers are different from other LDC handlers!
# They NEVER require an auth key, even if ALLOW_UNAUTHENTICATED_USE_WITH_WARNING
# is False in config.py
#
class PublicMediaHandler(blobstore_handlers.BlobstoreDownloadHandler):
    def options(self, *args, **kwargs):
        self.response.headers.add_header('Access-Control-Allow-Origin', '*')
        self.response.headers.add_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.response.headers.add_header('Allow', 'GET, OPTIONS')
        self.response.status_int = 200
        
    def get(self, *args, **kwargs):
        self.response.headers.add_header('Allow', 'GET, OPTIONS')
        self.response.headers.add_header('Access-Control-Allow-Origin', '*')
        ldc = None
        if 'key' in kwargs:
            mk = kwargs['key']
            ldc = LabDataContainerPublicMediaKey.get_LDC(mk)
        
        if ldc is None or not ldc.content_type.startswith('image/'):
            # 404 it
            self.response.status_int = 404
        else:
            # send it
            self.response.status_int = 200
            self.response.headers['Cache-Control'] = 'public, max-age=%d' % config.PUBLIC_MEDIA_CACHE_MAX_AGE_SEC
            self.response.headers['Pragma'] = 'Public'
            if ldc.content_type is not None:
                self.response.content_type = str(ldc.content_type)
                
            if 'tn_type' in kwargs:
                ldc.write_content_to_handler(self, kwargs['tn_type'])
            else:
                ldc.write_content_to_handler(self)
                
