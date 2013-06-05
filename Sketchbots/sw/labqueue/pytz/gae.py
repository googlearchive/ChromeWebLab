"""
gaepytz from https://pypi.python.org/pypi/gaepytz

Copyright (c) 2011 Rodrigo Moraes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

    A pytz version that runs smoothly on Google App Engine.

    Based on http://appengine-cookbook.appspot.com/recipe/caching-pytz-helper/

    To use, add pytz to your path normally, but import it from the gae module:

        from pytz.gae import pytz

    Applied patches:

      - The zoneinfo dir is removed from pytz, as this module includes a ziped
        version of it.

      - pytz is monkey patched to load zoneinfos from a zipfile.

      - pytz is patched to not check all zoneinfo files when loaded. This is
        sad, I wish that was lazy, so it could be monkey patched. As it is,
        the zipfile patch doesn't work and it'll spend resources checking
        hundreds of files that we know aren't there.

    pytz caches loaded zoneinfos, and this module will additionally cache them
    in memcache to avoid unzipping constantly. The cache key includes the
    OLSON_VERSION so it is invalidated when pytz is updated.
"""
import os
import logging
import pytz
import zipfile
from cStringIO import StringIO

# Fake memcache for when we're not running under the SDK, likely a script.
class memcache(object):
    @classmethod
    def add(*args, **kwargs):
        pass

    @classmethod
    def get(*args, **kwargs):
        return None

try:
    # Don't use memcache outside of Google App Engine or with GAE's dev server.
    if not os.environ.get('SERVER_SOFTWARE', '').startswith('Development'):
        from google.appengine.api import memcache
except ImportError:
    pass

zoneinfo = None
zoneinfo_path = os.path.abspath(os.path.join(os.path.dirname(__file__),
    'zoneinfo.zip'))


def get_zoneinfo():
    """Cache the opened zipfile in the module."""
    global zoneinfo
    if zoneinfo is None:
        zoneinfo = zipfile.ZipFile(zoneinfo_path)

    return zoneinfo


class TimezoneLoader(object):
    """A loader that that reads timezones using ZipFile."""
    def __init__(self):
        self.available = {}

    def open_resource(self, name):
        """Opens a resource from the zoneinfo subdir for reading."""
        name_parts = name.lstrip('/').split('/')
        if os.path.pardir in name_parts:
            raise ValueError('Bad path segment: %r' % os.path.pardir)

        cache_key = 'pytz.zoneinfo.%s.%s' % (pytz.OLSON_VERSION, name)
        zonedata = memcache.get(cache_key)
        if zonedata is None:
            zonedata = get_zoneinfo().read('zoneinfo/' + '/'.join(name_parts))
            memcache.add(cache_key, zonedata)
            logging.info('Added timezone to memcache: %s' % cache_key)
        else:
            logging.info('Loaded timezone from memcache: %s' % cache_key)

        return StringIO(zonedata)

    def resource_exists(self, name):
        """Return true if the given resource exists"""
        if name not in self.available:
            try:
                get_zoneinfo().getinfo('zoneinfo/' + name)
                self.available[name] = True
            except KeyError:
                self.available[name] = False

        return self.available[name]


pytz.loader = TimezoneLoader()
