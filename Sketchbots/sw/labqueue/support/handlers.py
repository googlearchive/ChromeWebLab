# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""Helpful classes for Webapp2 handlers

"""

from lask.server.rpc import *
import webapp2
from google.appengine.ext import db
from lask.core.model import *
from lask.core.exception import *
try: import simplejson as json
except ImportError: import json
from support.modeling import SimplejsonModelRegistry
from lask.server import rpc
import inspect
import re
import datetime
import logging
import config

import sys, traceback

import jinja2
import os

jinja_environment = jinja2.Environment(loader=jinja2.FileSystemLoader(config.HELP_TEMPLATES_PATH))

class JSONResponseHandler(webapp2.RequestHandler):
    """A webapp2-style request handler which can represent responses as JSON-encoded strings
    in the response body.
    """
    
    __init_time = None
    
    cors_allow_patterns = None
    _is_authorized_request = False
    
    def __init__(self, *args, **kwargs):
        super(JSONResponseHandler, self).__init__(*args, **kwargs)
        self.__init_time = datetime.datetime.now()
        

    def add_cors_response_headers(self):
        """ Adds appropriate CORS response headers, if needed by the request.
        """
        # check if the request came from a CORS-allowed origin
        if self.cors_allow_patterns is not None:
            if ('*' in self.cors_allow_patterns) or (r"*" in self.cors_allow_patterns) or (u'*' in self.cors_allow_patterns):
                self.response.headers.add_header('Access-Control-Allow-Origin', '*')
                
            else:
#            # per http://www.w3.org/TR/cors/#access-control-allow-origin-response-header
#            # check if the request Origin header matches anything in cors_allow_patterns
#            # and if so, echo it back to the client
#            origin = self.request.headers.get('Origin')
#            if origin is not None:
#                for exp in self.cors_allow_patterns:
#                    if re.match(exp, origin):
#                        self.response.headers.add_header('Access-Control-Allow-Origin', origin)
#                        break
                pass
        self.response.headers.add_header('Access-Control-Allow-Headers', 'Accept, Origin, Content-Type, Depth, User-Agent, Cache-Control, X-Requested-With, X-Request, Authorization');
    
    def respond(self, obj, handler_name=None):
        """Will put obj in a suitable wrapper and then put the JSON-encoded string
        representation of that in the response. The response will be of type text/plain.
        """
        
        self.add_cors_response_headers()
        
        if isinstance(obj, Exception):
            # if the exception is HTTP-compatible it may specify a status code
            if hasattr(obj, 'HTTP_status_code') and obj.HTTP_status_code:
                status_int = obj.HTTP_status_code
            else:
                status_int = 500
                
            # if the exception is HTTP-compatible it may specify some response headers (e.g. Allow for 405 errors)
            if hasattr(obj, 'HTTP_response_headers') and obj.HTTP_response_headers:
                for h in obj.HTTP_response_headers:
                    self.response.headers.add_header(h, obj.HTTP_response_headers[h])

            if hasattr(obj, 'HTTP_message') and obj.HTTP_message:
                status_message = obj.HTTP_message
            else:
                status_message = '(%s) %s %s' % (obj.__class__.__name__, HTTPException.get_default_message_for_status(status_int), obj)
            
            status_type = 'error'
            status_is_error = True
            
            # attempt to generate a human-readable traceback, but don't raise
            # if there is a problem doing so
            # payload = 'exception'
            payload = {'exception': {
                'traceback': None,
            }}
            try:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                # exctype, tb = sys.exc_info()[:2] 
                tb = traceback.format_exception(exc_type, exc_value, exc_traceback)
                payload['exception']['traceback'] = tb
            except:
                pass
                
            self.error(status_int)
            extra_status_info = {
                'request': {
                    'url': self.request.url,
                    'remote_addr': self.request.remote_addr,
#                    'body': self.request.body, # do not include body; if the user uploaded a binary file, including that here will cause an error
                    'arguments': {},
                    'headers': {},
                    'query_string': self.request.query_string,
                }
            }
            for h in self.request.headers:
                # print h
                extra_status_info['request']['headers'][h] = self.request.headers[h]
            args = self.request.params
            # logging.info(self.request.params)
            for k in args:
                try:
                    extra_status_info['request']['arguments'][k] = str(args[k])
                except UnicodeEncodeError:
                    extra_status_info['request']['arguments'][k] = '(value contains binary)'
                

            # log this exception as well
            if status_int == 404 or isinstance(obj, WrongTaskStateError): # and str(self.request.path).startswith('/api/tags/'):
                # treat tag 404's as warnings
                logging.warn(status_message)
            else:
                if 'GUID' in args:
                    logging.info('worker_guid=%s (GUID)' % args['GUID'])
                elif 'worker_guid' in args:
                    logging.info('worker_guid=%s (worker_guid)' % args['worker_guid'])
                elif 'created_by_guid' in args:
                    logging.info('worker_guid=%s (created_by_guid)' % args['created_by_guid'])
                elif 'assignee_guid' in args:
                    logging.info('worker_guid=%s (assignee_guid)' % args['assignee_guid'])
                logging.exception(status_message)
            
        else:
            status_int = 200
            status_message = 'OK'
            status_type = 'ok'
            status_is_error = False
            payload = obj
            extra_status_info = None
        
        self.response.status_int = status_int
        self.response.status_message = status_message
        self.response.status = '%i %s' % (status_int, status_message)
        # self.response.headers['Content-Type'] = 'text/plain'
        
        if handler_name is None:
            handler_name = self.__class__.__name__
        
        # set the content type appropriately
        if (self.request.get('_rtype', None) == 'text') or ('accept' in self.request.headers and ('*/*' not in self.request.headers['accept']) and ('application/json' not in self.request.headers['accept'])):
            self.response.content_type = 'text/plain'
            human_readable = True
        else:
            self.response.content_type = 'application/json'
            human_readable = False
            
        # this is the general form of the object which wraps the result:
        response_obj = {
            'status': {
                'code': status_int,
                'message': status_message,
                'type': status_type,
                'is_error': status_is_error,
                'handler': handler_name,
                'extra_info': extra_status_info,
            },
            'result': payload
        }
        response_obj['status']['pre_output_proc_time_sec'] = (datetime.datetime.now() - self.__init_time).total_seconds()
        
        if not self._is_authorized_request:
            if config.ALLOW_UNAUTHENTICATED_USE_WITH_WARNING:
                response_obj['status']['auth_warning'] = '****** WARNING: This request would be DENIED by the production server due to an invalid or missing signature. The request must include a valid signature in the Authorization header or _auth request parameter. ******'
                logging.warn('****** This request would be DENIED by the production server due to an invalid or missing signature. The request must include a valid signature in the Authorization header or _auth request parameter. ******')
#            else:
#                response_obj['status']['auth_warning'] = '****** WARNING: This request would normally be DENIED due to an invalid or missing signature. It is being allowed because you are an authorized developer. The request must include a valid signature in the Authorization header or _auth request parameter. ******'
#                logging.warn('****** This request would normally be DENIED due to an invalid or missing signature. It is being allowed because you are an authorized developer. The request must include a valid signature in the Authorization header or _auth request parameter. ******')

        j = json.dumps(response_obj,
            default=SimplejsonModelRegistry.default,
            indent=human_readable) # setting human_readable to True will cause output to be indented with line breaks
            
        self.response.out.write(j)
        
        # and finally, if the object is an Exception raise it so that
        # we can actually fix the problem when debugging
#        if isinstance(obj, Exception):
#            raise obj


                    
class JSONResponseRPCHandler(JSONResponseHandler):
    
    _raise_exceptions = False
    _enable_help = False
    _v_cahced_target = None
    
    def get_allowed_methods_list(self, *args, **kwargs):
        L = []
        L.append('OPTIONS')
        if (self.get_GET_method(*args, **kwargs) is not None):
            L.append('GET')
        if (self.get_POST_method(*args, **kwargs) is not None):
            L.append('POST')
        return L
        
    
    def target(self):
        raise Exception('The %s handler must override the target() method!' % (self.__class__.__name__))

    def cached_target(self, *args, **kwargs):
        if self._v_cahced_target is None:
            self._v_cahced_target = self.target(*args, **kwargs)
        return self._v_cahced_target

    def auth_check(self):
        """ Do an authorization check on the current request.
        Will set self._is_authorized_request to True and then
        return True if the request can proceed, or False if not.
        
        If config.ALLOW_UNAUTHENTICATED_USE_WITH_WARNING is enabled then this
        method should always return True. If it would have returned
        False under normal cirumcstances then it will return True and
        set self._is_authorized_request to False.
        
        """
        if self._is_authorized_request:
            return True
            
        if self.is_cron_handler():
            # always let cron handlers run
            self._is_authorized_request = True
            return True
            # cron handlers pass if the current user is an admin
#            user = users.get_current_user()
#            if user and users.is_current_user_admin():
#                self._is_authorized_request = True
#                return True
                
        auth, key_used, expected_signature, candidate_signature = AppCredentials.authenticate_request(self.request, UserCredentials.get_current())
        if not auth:
            self._is_authorized_request = False
            # cannot authenticate the request
            user_cred = UserCredentials.get_current()
            if user_cred is not None and user_cred.authorized_user and user_cred.app_key is not None:
                return True
            elif not config.ALLOW_UNAUTHENTICATED_USE_WITH_WARNING:
                try:
                    msg = 'Unauthorized (%s, %s, %s)' % (key_used, expected_signature, candidate_signature)
                except:
                    msg = 'Unauthorized (could not determine key)'
                self.respond(HTTPException(401, msg), self.__class__.__name__)
        else:
            self._is_authorized_request = True
        
        return config.ALLOW_UNAUTHENTICATED_USE_WITH_WARNING or self._is_authorized_request
            
        
    
    def options(self, *args, **kwargs):
        """ ENTRY POINT for OPTIONS requests.
        """
        logging.info('JSONResponseRPCHandler.options()')
        self.add_cors_response_headers()
        # add headers for the HTTP methods supported
        self.response.headers.add_header('Access-Control-Allow-Methods', ', '.join(self.get_allowed_methods_list()))
        self.response.headers.add_header('Allow', ', '.join(self.get_allowed_methods_list(*args, **kwargs)))
        self.response.status_int = 200
        # self.response.out.write('OK')

    def get(self, *args, **kwargs):
        """ ENTRY POINT for GET requests.
        """
        self.add_cors_response_headers()

        # check authorization!
        if not self.auth_check():
            return
    
        # if help is enabled and needed, provide it and stop
        method_name = self.get_GET_method(*args,**kwargs)
        target_exception = None
        t = None
        try:
            t = self.cached_target(*args,**kwargs)
        except Exception as ex:
            target_exception = ex # deal with the exception later
        
        #
        # Help is handled on GET requests (even if the help is about the POST method)
        #
        if self._enable_help and self.provided_help(t, method_name, t, self.get_POST_method(*args,**kwargs), target_exception):
            return
        
        if target_exception is not None:
            return self.respond(target_exception, self.__class__.__name__)
        elif hasattr(self, 'special_get'):
            return self.special_get(*args, **kwargs)
        elif method_name is not None:
            # perform the request
            return self.respond_basic_rpc(t, method_name)
        else:
            # no python method mapped to this HTTP method
            return self.respond(HTTPException(405, HTTP_response_headers={ 'Allow': ', '.join(self.get_allowed_methods_list(*args, **kwargs)) }), self.__class__.__name__)
    
    
    def post(self, *args, **kwargs):
        """ ENTRY POINT for POST requests.
        """
        self.add_cors_response_headers()

        # check authorization!
        if not self.auth_check():
            return
        
        method_name = self.get_POST_method(*args, **kwargs)
        target_exception = None
        t = None
        try:
            t = self.cached_target(*args,**kwargs)
        except Exception as ex:
            target_exception = ex # deal with the exception later
        
        if target_exception is not None:
            return self.respond(target_exception, self.__class__.__name__)
        elif hasattr(self, 'special_post'):
            return self.special_post(*args, **kwargs)
        elif method_name is not None:
            # perform the request
            return self.respond_basic_rpc(t, method_name)
        else:
            # no python method mapped to this HTTP method
            return self.respond(HTTPException(405, HTTP_response_headers={ 'Allow': ', '.join(self.get_allowed_methods_list(*args, **kwargs)) }), self.__class__.__name__)
    
    def is_cron_handler(self):
        if hasattr(self, '_is_cron_handler') and self._is_cron_handler:
            return True
        else:
            return False
    
    def get_GET_method(self, *args, **kwargs):
        return self._GET_method
    
    def get_POST_method(self, *args, **kwargs):
        return self._POST_method
    
    def respond_basic_rpc(self, target, m):
        """Perform the simplest bype of HTTP to RPC mapping
        """
        
        if target is None:
            return self.respond(HTTPException(404), self.__class__.__name__)

#            return self.quick_error(404) # respond with HTTP-style error
            # return self.respond(None, self.__class__.__name__)

        # see if the request was sent with JSON-encoding on paramter values
#        if self.request.get('_input_style', 'JSON') == 'JSON':
#            j = True
#        else:
#            j = False
        
        # try the RPC method and then display a nice error message in the
        # response if there was a problem
        try:
            self.respond(
                rpc.LaskRPC.request(
                    target,
                    m,
                    self.request.params,
                    [m],
                    JSONin=True,
                    m_name_for_messages=self.request.method,
                    target_name_for_messages=self.request.path,
                    ),
                self.__class__.__name__)
                
        except Exception as ex:
            self.respond(ex, self.__class__.__name__)
            if self._raise_exceptions:
                raise

    def provided_help(self, get_target, get_method, post_target, post_method, target_exception):
        """If needed, provides help to the caller. Returns True if help was provided, otherwise False.
        """

        method = None
        target = None
        h = self.request.params.get('HELP')
        
        if h is None:
            return False # no help needed
            
        elif h == 'GET':
            method_name = get_method
            target = get_target
        elif h == 'POST':
            method_name = post_method
            target = post_target
        else:
            method_name = None
        
        url = self.request.path
        if target is None or method_name is None:
            args = []
            method_docs = ''
        else:
            c = rpc.Console(target, method_name)
            args = enumerate(c.get_mehod_args())
            method_docs = c.get_html_docs()
        
        test_app_key = None
        test_app_secret = None
        user_cred = UserCredentials.get_current()
        if user_cred is not None:
            test_app_key = user_cred.app_key
            app_cred = AppCredentials.get_for_app_key(test_app_key)
            if app_cred is not None:
                test_app_secret = app_cred.secret
        
        template = jinja_environment.get_template('object_method.html')
        self.response.out.write(template.render({
            'app_key': test_app_key,
            'app_secret': test_app_secret,
            'target': target,
            'target_exception': target_exception,
            'target_url':url,
            'method_docs': method_docs,
            'method_name': h,
            'method_args_enum': args
        }))
            
        return True
    

class HTTPException(Exception):
    """A simple class used to represent various basic HTTP error responses
    """
    HTTP_status_code = 500
    HTTP_message = None
    HTTP_response_headers = None
    
    @classmethod
    def get_default_message_for_status(cls, HTTP_status_code):
        HTTP_message = None
        if HTTP_status_code == 404:
            HTTP_message = 'The requested object was not found.'
        elif HTTP_status_code == 405:
            HTTP_message = 'The requested object exists, but does not respond to the requested method. See the Allow header in this response for a list of allowed methods.'
        elif HTTP_status_code == 400:
            HTTP_message = 'There was an error in your request, such as a missing or invalid parameter.'
        elif HTTP_status_code == 500:
            HTTP_message = 'There was an error trying to fulfil your request.'
        return HTTP_message
    
    
    def __init__(self, HTTP_status_code, HTTP_message=None, HTTP_response_headers=None):
        self.HTTP_status_code = HTTP_status_code
        if HTTP_message is None:
            HTTP_message = HTTPException.get_default_message_for_status(HTTP_status_code)
        self.HTTP_message = HTTP_message
        self.HTTP_response_headers = HTTP_response_headers

