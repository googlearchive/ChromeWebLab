/*
    Copyright 2013 Google Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
/**
 * WEBLAB Global Abatement
 */

var WEBLAB = WEBLAB || {};


/** @define {boolean} */
var ENABLE_DEBUG = true;


//to avoid 'console' is undefined Error in IE
if (!window.console || !ENABLE_DEBUG) console = {
    log: function() {}
};
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
if (typeof Function.prototype.bind != 'function') {
    console.log("WEBLAB adding bind function...");
    Function.prototype.bind = function(bind) {
        var self = this;
        return function() {
            var args = Array.prototype.slice.call(arguments);
            return self.apply(bind || null, args);
        };
    };
}

WEBLAB.namespace = function(aNamespace) {
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
