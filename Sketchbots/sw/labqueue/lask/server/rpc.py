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

Support classes used by the various Lask server interfaces.
"""

import webapp2
import inspect
try: import simplejson as json
except ImportError: import json


class LaskRPC():
    """A simple RPC wrapper for Lask
    """
    
    @classmethod
    def request(cls, target, m, arguments, valid_methods, JSONin=False, m_name_for_messages=None, files=None, target_name_for_messages=None):
        """Attempts to call a method with the name provided in m on the object target,
        using the arguments dict to supply arguments. Only methods matching the names
        in the list valid_methods are callable.
        
        :target:
            The object or class on which to call a method.
        
        :m:
            The name of the method to call, as a string
        
        :arguments:
            A dictionary of name-value pairs for the method's arguments
        
        :valid_methods:
            A list of method names we're allowed to call
        
        :JSONin:
            Optional. Whether or not to run each argument value through json.loads() before
            passing it to the method.
            IMPORTANT: the request() method will NEVER JSON-encode the results of the method call.
            It is up to the application to properly encode the results.
        
        :m_name_for_messages:
            Optional. A name to use in place of the actual method name in messages (e.g. exceptions)
        
        * Raises an InvalidRPCTargetError if the target object is None
        * Raises an InvalidRPCMethodError if m is None
        * DEPRICATED: Raises an InvalidRPCArgumentError if arguments is not a dict
            Effective from 2/29 we will try to use arguments, whatever type it is. It should be dict-like though.
        * Raises an InvalidRPCMethodError if m is not in valid_methods
        * Raises an InvalidRPCMethodError is valid_methods is not a list
        * Raises an InvalidRPCMethodError if target does not have a method named m
        * Raises an InvalidRPCMethodError if target has an attribute named m, but it isn't callable
        * Raises an InvalidRPCMethodError if target does not have a method named m
        * Raises an InvalidRPCArgumentError if the method requires an argument which is not present in arguments
        * DEPRICATED: Raises an InvalidRPCArgumentError if an argument is present in arguments which isn't used by the method
            Effective from 2/29 arguments present in the request which are not needed by the method are simply ignored.
        * Raises an RPCArgumentJSONDecodeError if JSONin==True and one or more of the argument values is an invalid JSON string
        """
            
        if m_name_for_messages is None:
            m_name_for_messages = m
            
        if target_name_for_messages is None:
            target_name_for_messages = ''
        else:
            target_name_for_messages = ' of %s' % (target_name_for_messages)
        
        if target is None:
            raise InvalidRPCTargetError('No target object specified')
        if m is None:
            raise InvalidRPCMethodError('No method specified')
        if arguments is None:
            arguments = {}
#        if not isinstance(arguments, dict) and not isinstance(arguments, UnicodeMultiDict):
#            raise InvalidRPCArgumentError('Arguments not specified in a dict (instead they are in a %s)' % (type(arguments)))
        if not isinstance(valid_methods, list):
            raise InvalidRPCMethodError('No valid methods specified')
        if any(m == val for val in valid_methods) == False:
            raise InvalidRPCMethodError('Attempt to call an invalid method, called \'%s\'%s' % (m_name_for_messages, target_name_for_messages))
            
        # make sure that m is being used like a string
        m = str(m)
            
        # check target has the specified method
        try:
            m_attr = getattr(target, m)
        except AttributeError:
            raise InvalidRPCMethodError('Specified method does not exist')
        
        # and that the method is callable (as opposed to a property)
        if not callable(m_attr):
            raise InvalidRPCMethodError('Specified method is not callable')
        
        # check arguments to make sure everything required by m_attr is present
        arginfo = inspect.getargspec(m_attr)
        
#        print arginfo
#        print arguments
        
        pargs = list()
        if arginfo.args is not None:
            # go through each argument to the function and
            # make sure that the caller has supplied a value for it
            # or that there is a default available for it if the caller hasn't supplied a value
            # put these arg values in pargs
            
            # see what index default values start for
            # (this works because named defaults must be after positional arguments in
            # a Python method signature)
            defaults_start_at = len(arginfo.args)
            if arginfo.defaults is not None:
                defaults_start_at -= len(arginfo.defaults)
                
            for i, arg in enumerate(arginfo.args):
                if i > 0: # skip the first arg (cls, self, etc.)
                    if arg in arguments:
                        if not JSONin or hasattr(arguments[arg], 'file'):
                            # append the argument as-is because either JSONin is Fale, or the parameter is a file
                            pargs.append(arguments[arg])
                        else:
                            # decode the JSON value and append that
                            try:
                                pargs.append(json.loads(arguments[arg]))
                            except TypeError:
                                raise RPCArgumentJSONDecodeError('The \'%s\' argument to the \'%s\' method%s was expected to be a value encoded as a JSON string, but instead it was a %s' % (arg, m_name_for_messages, target_name_for_messages, type(arguments[arg])))
                            except json.JSONDecodeError as jde:
                                raise RPCArgumentJSONDecodeError('The \'%s\' argument to the \'%s\' method%s was expected to be a value encoded as a JSON string, but it could not be decoded: %s' % (arg, m_name_for_messages, target_name_for_messages, jde))
                    else:
                        # couldn't find this argument in the supplied list
                        # so check if the method has a default for it
                        if arginfo.defaults is None or i < defaults_start_at:
                            # missing required argument with no default
                            raise InvalidRPCArgumentError('The \'%s\' argument was missing from the request, but it is required by the \'%s\' method%s' % (arg, m_name_for_messages, target_name_for_messages))
                        elif arginfo.defaults is not None:
                            pargs.append(arginfo.defaults[i - defaults_start_at])
        # execute and return
        return m_attr(*pargs)


class InvalidRPCMethodError(Exception):
    """Someone tried to call an invalid RPC method
    """
    HTTP_status_code = 400
    pass
        
class InvalidRPCTargetError(Exception):
    """Tried to call an RPC method on an invalid (not allowed) object
    """
    HTTP_status_code = 400
    pass

class InvalidRPCArgumentError(Exception):
    """Tried to make an RPC call with invalid argument(s) or no specified arguments
    """
    HTTP_status_code = 400
    pass

class RPCArgumentJSONDecodeError(Exception):
    """Tried to JSON decode an argument which was not JSON encoded
    """
    HTTP_status_code = 400
    pass


class Console():
    """A console for working live with LaskRPC
    """
    
    _target = None
    _m = None
    _m_attr = None
    _arginfo = None
    
    def __init__(self, target, m):
        
        self._target = target
        # make sure that m is being used like a string
        self._m = str(m)
            
        # check target has the specified method
        try:
            self._m_attr = getattr(self._target, self._m)
        except AttributeError:
            raise InvalidRPCMethodError('The "%s" method does not exist for %s' % (self._m, self._target))
        
        # and that the method is callable (as opposed to a property)
        if not callable(self._m_attr):
            raise InvalidRPCMethodError('The "%s" method is not callable for %s' % (self._m, self._target))
        
        # get info about the arguments to the method
        self._arginfo = inspect.getargspec(self._m_attr)
    
    def get_html_docs(self):
        """Returns the docstring for the method being used by this Console
        """
        return inspect.getdoc(self._m_attr)
    
    def get_mehod_args(self):
        return self._arginfo.args

