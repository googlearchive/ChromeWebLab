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


Contains methods helpful to clients using a server running Lask.
"""

import hmac
import string
import urlparse
import urllib2
import urllib

def get_authorization_header_for_url(url, app_key, secret):
    """Given a URL as a string and an app_key/secret,
    returns the proper value for the _auth parameter
    for purposes of signing a request.
    
    Request signatures can be sent to the server either
    by including an Authorization header with the request
    or by including a request parameter called _auth.
    The data in both is the same, but the format differs
    slightly.
    
    Use this method if you are using the Authorization header.
    Use the get_auth_parameter_for_url method when you need
    to use the _auth parameter.
    
    :url:
        The URL of the request, will be parsed using urlparse.
    
    :app_key:
        Your application's app key, expressed as a hex string.
    
    :secret:
        Your application's authentication secret, expressed as a hex string.
        Never include this value directly in network communication.

    * Raises urllib2.URLError if the URL is invalid.
    * Raises TypeError if app_key is not a str
    * Raises TypeError if secret is not a str
    """
    return 'CWL %s' % (get_auth_parameter_for_url(url, app_key, secret))


def get_auth_parameter_for_url(url, app_key, secret):
    """Given a URL as a string and an app_key/secret,
    returns the proper value for the _auth parameter
    for purposes of signing a request.
    
    Request signatures can be sent to the server either
    by including an Authorization header with the request
    or by including a request parameter called _auth.
    The data in both is the same, but the format differs
    slightly.
    
    Use this method when you need to use the _auth parameter.
    Use the get_authorization_header_for_url() method if
    you are using the Authorization header.
    
    :url:
        The URL of the request, will be parsed using urlparse.
    
    :app_key:
        Your application's app key, expressed as a hex string.
    
    :secret:
        Your application's authentication secret, expressed as a hex string.
        Never include this value directly in network communication.

    * Raises TypeError if app_key is not a str
    * Raises TypeError if secret is not a str
    """
    if not isinstance(app_key, str):
        raise TypeError('app_key is expected to be a str, but was a %s' % (app_key.__class__.__name__))
    if not isinstance(secret, str):
        raise TypeError('secret is expected to be a str, but was a %s' % (app_key.__class__.__name__))
    try:
        parsed = urlparse.urlparse(url)
    except:
        raise urllib2.URLError('The URL %s is not valid for use with get_auth_parameter_for_url() or get_authorization_header_for_url()' % (url))
#    if parsed.scheme is None or parsed.scheme == '' or (string.lower(parsed.scheme) != 'https' and :
#        raise urllib2.URLError('The URL %s is not valid for use with get_auth_parameter_for_url() or get_authorization_header_for_url() [it does not use the https scheme]' % (url))
    if parsed.path is None or parsed.path == '':
        raise urllib2.URLError('The URL %s is not valid for use with get_auth_parameter_for_url() or get_authorization_header_for_url() [it does not include a path]' % (url))
    return '%s:%s' % (app_key, __sig_for_path(parsed.path, app_key, secret))

def sign_request(req, app_key, secret, do_not_use_header=False):
    """Returns a signed urllib2.Request object. The signing is done by
    either injecting an Authorization header or an _auth variable
    into the request parameters. Returns the new, signed Request which
    is equivalent to the input Request other than that it is signed.
    
    If the request already contains an Authorization header or an
    _auth parameter, the values of these will not be modified and the
    *original* req object will be returned.
    
    :req:
        The Request to sign.
    
    :app_key:
        Your application's app key, expressed as a hex string.
    
    :secret:
        Your application's authentication secret, expressed as a hex string.
        Never include this value directly in network communication.
    
    :do_not_use_header:
        Optional. If True, then a new request parameter will be added called _auth
        which contains the signature. Otherwise, this function will add a
        header to the request called Authorization which contains the signature.

    * Raises TypeError if req is not a Request
    * Raises TypeError if app_key is not a str
    * Raises TypeError if secret is not a str
    """
    if not isinstance(req, urllib2.Request):
        raise TypeError('req is expected to be urllib2.Request but was %s' % (req.__class__.__name__))

    
    if do_not_use_header:
        # use _auth parameter
        parsed = urlparse.urlsplit(req.get_full_url())
        # check query parameters
        url_params = None
        body_params = None
        if parsed.query is not None and parsed.query != '':
            url_params = urlparse.parse_qs(parsed.query)
            if '_auth' in url_params:
                return req
        # check body parameters
        if req.has_data():
            body_params = urlparse.parse_qsl(req.get_data())
            if '_auth' in body_params:
                return req
        # the _auth variable is not present in the request, so we can add it
        if url_params is None:
            url_params = {}
        if parsed.path is None or parsed.path == '':
            raise urllib2.URLError('The URL %s is not valid for use with get_auth_parameter_for_url() or get_authorization_header_for_url() [it does not include a path]' % (url))
        url_params['_auth'] = '%s:%s' % (app_key, __sig_for_path(parsed.path, app_key, secret))
        # reconstruct the request url
        #parsed.query = urllib.urlencode(url_params)
        url = urlparse.urlunsplit((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            urllib.urlencode(url_params),
            parsed.fragment,
#            parsed.username,
#            parsed.password,
#            parsed.hostname,
#            parsed.port
            ))
        # and then reconstruct the request with the new url
        new_req = urllib2.Request(
            url = url,
            data = req.get_data(),
            headers = dict(req.header_items()),
            origin_req_host = req.get_origin_req_host(),
            unverifiable = req.is_unverifiable()
        )
        req = new_req
        
    else:
        # use the Authorization header
        if req.has_header('Authorization'):
            return
        headers = dict(req.header_items())
        headers['Authorization'] = get_authorization_header_for_url(req.get_full_url(), app_key, secret)
        req = urllib2.Request(
            url = req.get_full_url(),
            data = req.get_data(),
            headers = headers,
            origin_req_host = req.get_origin_req_host(),
            unverifiable = req.is_unverifiable()
        )
    
    return req
    
def __sig_for_path(path, app_key, secret):
    signature = hmac.new(secret, path).hexdigest()
    return signature
    
            
