# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""  A simple handler which redirects the root URL of this app to the UI folder
"""
import webapp2
from webapp2_extras import routes

app = webapp2.WSGIApplication([
    routes.RedirectRoute(r'/', redirect_to='/ui/index.html'),
    routes.RedirectRoute(r'/ui', redirect_to='/ui/index.html'),
    routes.RedirectRoute(r'/ui/', redirect_to='/ui/index.html'),
]);

