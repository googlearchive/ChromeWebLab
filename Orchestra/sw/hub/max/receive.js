// 
//  receive.js: get messages from Python via OSC, store data or do something.
//  
//  Copyright Google Inc, 2013
//  See LICENSE.TXT for licensing information.
// 

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
