/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
/**
 * WEBLAB Global Abatement
 */

var WEBLAB = WEBLAB || {};


/** @define {boolean} */
var ENABLE_DEBUG = true;


//to avoid 'console' is undefined Error in IE
if (!window.console || !ENABLE_DEBUG) console = {log: function() {}};
/*alert("WINDOWS MODE!");

var alertFallback = true;
   if (typeof console === "undefined" || typeof console.log === "undefined") {
     console = {};
     if (alertFallback) {
         console.log = function(msg) {
              alert(msg);
         };
     } else {
         console.log = function() {};
     }
   }*/

console.log("ENABLE_DEBUG: ", ENABLE_DEBUG);

//safari bind fix
if (typeof Function.prototype.bind != 'function')
{
    console.log("WEBLAB adding bind function...");
    Function.prototype.bind = function (bind)
    {
        var self = this;
        return function ()
        {
            var args = Array.prototype.slice.call(arguments);
            return self.apply(bind || null, args);
        };
    };
}

WEBLAB.namespace = function (aNamespace){
    var parts = aNamespace.split('.'),
        parent = WEBLAB,
        i;
    if (parts[0] === "WEBLAB") {
        parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i += 1) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }

    return parent;
};