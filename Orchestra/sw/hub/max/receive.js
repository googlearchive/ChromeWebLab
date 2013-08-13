// 
//  receive.js: get messages from Python via OSC, store data or do something.
//  
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

// global
var sequencer = new Global("sequencer");

// use high-priority thread
anything.immediate = 1;

/**
 * catch-all for OSC messages
 */

function anything() {
    // Because this comes directly from [udpreceive],
    // all args are globbed into 'messagename' keyword.
    // That's actually a good thing, as it keeps Max
    // from treating commas in JSON params as message delimeters.
    // 
    var message_parts = messagename.match(/(\/\S+) (.*)/);
    var path = message_parts[1];
    var params = eval(message_parts[2]);

    // dispatch
    switch (path) {
        case "/instruments":
            // store in global
            sequencer.instruments = params;
            break;
    }
}
