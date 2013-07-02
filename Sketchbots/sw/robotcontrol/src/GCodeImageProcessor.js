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
var Canvas = require('canvas'), Image = Canvas.Image;
var mootools = require('mootools');
var net = require('net');
var sys = require('sys');
var ConfigParams = require('./ConfigParams').ConfigParams;
var labqueueClient =  ConfigParams.LABQUEUE_USE_HTTPS ? require('https') : require('http');
var url =  require('url');
var fs = require('fs');

var BezierTracer = require('./BezierTracer').BezierTracer;

var ColourOps = require('./ColourOps').ColourOps;
var SimpleTrig = require('./SimpleTrig').SimpleTrig;

var GCodeParser = require('./libs/contrib/gcode/gcode-parser').GCodeParser;

exports.GCodeImageProcessor = new Class({

	Implements: [Options, Events, process.EventEmitter],

	options: {
		maxWidth: 200,
		maxHeight: 200,
		
		tolerance: 18,
		surround: 24,
	},

	//
	// public methods
	//
	initialize: function(options){	
		this.setOptions(options);

        this.bezierTracer = new BezierTracer();

		this.colourOps = new ColourOps();
		this.polyLines = null;
        
        this.horizontalBezierFlip = false;
	},

	processDiskFile: function(imageLoc) {
		fs.readFile(imageLoc, {
			'encoding': 'utf8',
		}, function(err, data){
			if (err) throw err;

			// start with an empty polyline set
			newDrawingPolyLines = [];
			var currentPolyLine = [];


			// g-code interpreter state variables:
			var minX = 10000000000000000000;
			var maxX = -10000000000000000000;
			var minY = 10000000000000000000;
			var maxY = -10000000000000000000;
			var minZ = 10000000000000000000;
			var maxZ = -10000000000000000000;
			/*
			var lastDrawingPosition = {x: 0, y: 0};
			var Zs = {};
			var lastArgs = null;
			var currentE = 0;
			var previousSpecifiedE = 0;
			var moveRelative = false;
			var extrudeRelative = false;
			var currentExtruderLength = 0;
			var currentFeedRate = 0;
			var currentZ;
			*/

			///////////////////////////////////////

			// this object will keep track of the current state of our "machine" while
			// we move it around with the incoming g-code commands
			var state = {
				e: 0,
				f: 0,
				x: 0,
				y: 0,
				z: 0,
				relativeMode: false, //this is the default for makerbot, reprap, etc.
				inSand: false, //this is roughly equivalent to whether the extruder is on or not... which is in turn related to extrusion length (see e property)
			}
			state.updateFromArgs = function(args, pNames) {
				// updates the state object, given parameters provided by a G1 command
				var lastE = this.e;
				for (var i = 0; i < pNames.length; i++) {
					pName = pNames[i];
					if (args.hasOwnProperty(pName))
						if (this.relativeMode)
							this[pName] = this[pName] + args[pName];
						else
							this[pName] = args[pName];
				}
				//make the inSand property track whether the extruder is on or not
				this.inSand = this.relative ? this.e > 0 : (lastE - this.e) > 0;
				//debug
				//console.dir(this);
			}.bind(state);

			state.getPoint = function() {
				// converts the state object into an x,y point
				return { x: this.x, y: this.y };
			}.bind(state);

			currentPolyLine.push(state.getPoint());

			console.log('Parsing g-code data...');
		  	var parser = new GCodeParser({

		  		G1: function(args, line) {
		  			var wasInSand = state.inSand; //keep track of whether we were last in the sand or not
		  			state.updateFromArgs(args, ['x','y','z','f','e']);
		  			var pt = state.getPoint();
		  			if (wasInSand) {
		  				if (!state.inSand) {
			  				//just left the sand, so add the current line to the drawing
			  				if (currentPolyLine.length == 1) currentPolyLine.push(currentPolyLine[0]);
			  				if (currentPolyLine.length > 1) newDrawingPolyLines.push(currentPolyLine);
			  				//and start a new line
			  				currentPolyLine = [pt];
			  			} else {
			  				//continual movement in the sand
			  				currentPolyLine.push(pt);
			  			}
		  			} else {
		  				//moving around outside the sand, just keep over-writing the last point
		  				//currentPolyLine[currentPolyLine.length - 1] = pt;
		  				currentPolyLine.push(pt);
		  			}
					if (pt.x > maxX) maxX = pt.x;
					if (pt.x < minX) minX = pt.x;
					if (pt.y > maxY) maxY = pt.y;
					if (pt.y < minY) minY = pt.y;
		  		},

		  		/*
			    G21: function(args) {
					// G21: Set Units to Millimeters
					// Example: G21
					// Units from now on are in millimeters. (This is the RepRap default.)

					// No-op: So long as G20 is not supported.
			    },
			    */

			    G90: function(args) {
					// G90: Set to Absolute Positioning
					// Example: G90
					// All coordinates from now on are absolute relative to the
					// origin of the machine. (This is the RepRap default.)

					//if (moveRelative) console.log('Switching to ABSOLUTE move mode');
					moveRelative = false;
					state.relativeMode = false;
			    },

			    G91: function(args) {
					// G91: Set to Relative Positioning
					// Example: G91
					// All coordinates from now on are relative to the last position.

					//if (!moveRelative) console.log('Switching to RELATIVE move mode');
					moveRelative = true;
					state.relativeMode = true;
			    },

			    G92: function(args) { // E0
					// G92: Set Position
					// Example: G92 E0
					// Allows programming of absolute zero point, by reseting the
					// current position to the values specified. This would set the
					// machine's X coordinate to 10, and the extrude coordinate to 90.
					// No physical motion will occur.

					// TODO: Only support E0
					if (args.hasOwnProperty('e')) {
						currentExtruderLength = args.e;
						state.inSand = args.e >= 1;
					}
			    },

			    M82: function(args) {
					// M82: Set E codes absolute (default)
					// Descriped in Sprintrun source code.

					//if (extrudeRelative) console.log('Switching to ABSOLUTE extrusion mode');
					extrudeRelative = false;
					state.relativeMode = false;
			    },
			    M83: function(args) {
					//if (!extrudeRelative) console.log('Switching to RELATIVE extrusion mode');
					extrudeRelative = true;
					state.relativeMode = true;
			    },

			    /*
			    M84: function(args) {
					// M84: Stop idle hold
					// Example: M84
					// Stop the idle hold on all axis and extruder. In some cases the
					// idle hold causes annoying noises, which can be stopped by
					// disabling the hold. Be aware that by disabling idle hold during
					// printing, you will get quality issues. This is recommended only
					// in between or after printjobs.

					// No-op
			    },
			    */

			    'default': function(args, info) {
					//console.error('Unsupported g-code command:', args.cmd, args, info);
			    },
			}).parse(data);
			//make sure we add the last line
			//if (currentPolyLine.length > 1) newDrawingPolyLines.push(currentPolyLine);
			this.polyLines = newDrawingPolyLines;
			console.log('Done parsing g-code data');

			// debug - analyze Z
			//console.dir(Zs);
			//console.log('minZ = '+minZ);
			//console.log('maxZ = '+maxZ);

			// translate/scale the polylines so that they fit in the correct region
			console.log('Scaling drawing to fit...');
			this._scalePolyLines(minX, maxX, minY, maxY, ConfigParams.CAM_X, ConfigParams.CAM_Y);
			console.log('Done scalign drawing.');

			// debug - dump poly lines to console
			/*
			console.log('============================================');
			console.dir(this.polyLines);
			console.log('============================================');
			*/

			var prog_str = this.bezierTracer.getBezierPreMachineCode(this.polyLines); //convert poly lines to sketchbot-compatible command string

			/*
			// debug - dump machine code
			console.log('============================================');
			console.dir(prog_str);
			console.log('============================================');
			*/

			this.emit('processComplete', prog_str, this); // all done!

		}.bind(this));
	},

    setHorizontalBezierFlip: function(flip){
        this.horizontalBezierFlip = flip;
    },

    //this draws the image of the paths to be included in the artifact
	drawPolyPath: function(polyPath, color, width, animate){
		//TODO
	},

	//
	// private methods
	//

	_scalePolyLines: function(minX, maxX, minY, maxY, targetWidth, targetHeight) {
		var newPolyLines = this.polyLines;
		var scaleFactor = 1.0;
		if ((maxX - minX) > (maxY - minY)) {
			//original is wider than it is tall
			scaleFactor = (maxX - minX) / targetWidth;
		} else {
			scaleFactor = (maxY - minY) / targetHeight;
		}
		newPolyLines.forEach(function(line, lineIndex, lineAr) {
			newPolyLines[lineIndex].forEach(function(point, pointIndex, pointAr) {
				point.x = (point.x - minX) * scaleFactor;
				point.y = (point.y - minY) * scaleFactor;
				newPolyLines[lineIndex][pointIndex] = point;
			});
		});
		this.polyLines = newPolyLines;
	}

});
