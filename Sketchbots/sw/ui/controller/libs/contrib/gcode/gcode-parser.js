/**
 * A mootols class version of Joe Walnes' cool THREE.js-based g-code viewer
 * Original from https://github.com/joewalnes/gcode-viewer/blob/master/web/ui.js
 *
 *
 * This library is licensed under the following terms:
 *      Copyright (c) 2012 Joe Walnes
 *
 *      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 *      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 *      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 */
 //


/**
 * Parses a string of gcode instructions, and invokes handlers for
 * each type of command.
 *
 * Special handler:
 *   'default': Called if no other handler matches.
 */
function GCodeParser(handlers) {
  this.handlers = handlers || {};
}

GCodeParser.prototype.parseLine = function(text, info) {
	text = text.replace(/;.*$/, '').trim(); // Remove comments
	if (text) {
		var tokens = text.split(' ');
		if (tokens) {
			var cmd = tokens[0];
			var args = {
				'cmd': cmd
			};
			tokens.splice(1).forEach(function(token) {
				var key = token[0].toLowerCase();
				var value = parseFloat(token.substring(1));
				args[key] = value;
			});
			//simple sanity check: make sure that the handler is not a default JS object member
			if (!new Object().hasOwnProperty(tokens[0])) {
				var handler = this.handlers[tokens[0]] || this.handlers['default'];
				if (handler) return handler(args, info);
			} else
				console.log('Illegal command: ' + tokens[0]);

		}
	}
};

GCodeParser.prototype.parse = function(gcode) {
  var lines = gcode.split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (this.parseLine(lines[i], i) === false) {
      break;
    }
  }
};

exports = (typeof(exports) === "undefined") ? {} : exports;
exports.GCodeParser = GCodeParser;
