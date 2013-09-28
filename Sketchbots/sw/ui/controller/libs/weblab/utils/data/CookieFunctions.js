(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.data");

    if (namespace.CookieFunctions === undefined) {

        var CookieFunctions = function CookieFunctions() {
            //MENOTE: do nothing
        };

        namespace.CookieFunctions = CookieFunctions;

        CookieFunctions.setCookie = function(aCookieName, aCookieValue, aExpire) {
            //aExpire is optional and should be in miliseconds
            var cookie = aCookieName + "=" + escape(aCookieValue);

            if (aExpire) {
                var today = new Date();
                var expire = new Date();
                expire.setTime(today.getTime() + aExpire);
                cookie = cookie.concat(";expires=" + expire.toGMTString());
            }

            document.cookie = cookie;
        };

        CookieFunctions.getCookie = function(aCookieName) {
            var re = new RegExp('[; ]' + aCookieName + '=([^\\s;]*)');
            var sMatch = (' ' + document.cookie).match(re);
            if (aCookieName && sMatch) return unescape(sMatch[1]);
            return null;
        };

    }
})();
