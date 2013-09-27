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

var Robot3Axis = require('./Robot3Axis').Robot3Axis;
var ConfigParams = require('../../ConfigParams').ConfigParams;
var IK = require('./DrawMachine').IK;

//CONFIG
var DIRECT_DRIVE_SPEED = 30;
//var robot = new Robot3Axis('/dev/vcpa', [
var robot = new Robot3Axis('/dev/cu.usbmodemfd1221', ConfigParams.MINDSTORMS_NXT__AXIS_CONFIG);

robot.once('connected', function() {

	console.log('Connected. Moving to zero...')
	
	//after connecting, get the robot to zero
	robot.moveToZero();

}.bind(this));


// process.on('exit', function() { //ensure node's process doesn't hang
// 	console.log("Killing Process ID #" + process.pid);
//   process.kill(process.pid, 'SIGTERM');
// });

/* DIRECT DEGREE TEST
   --------------------------------------------------- */

// function goto(coords) {

// 	var _x = (coords.x)? coords.x: 0,
// 			_y = (coords.y)? coords.y: 0,
// 			_z = (coords.z)? coords.z: 0;

// 	robot.once('synchronizedMoveDone', function() {
// 		console.log("exiting");
// 		process.exit(0);
// 	}.bind(this));

// 	robot.synchronizedMove([_x, _y, _z] );
// }

/* COORD TESTS
  --------------------------------------------------- */

var calibrate = false;
var useIk = true; //when false uses direct coords

var coords = [];


if(useIk) {

	coords = [
		// end position
		IK._doIk(
			ConfigParams.DRAW_PARAMETERS.robotXMin + ((ConfigParams.DRAW_PARAMETERS.robotXMax - ConfigParams.DRAW_PARAMETERS.robotXMin)/2),
			ConfigParams.DRAW_PARAMETERS.robotYMin,
			ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z),

		//line test
		// IK._doIk(12, 12, 0),
		// IK._doIk(12, 14, 0),
		// IK._doIk(12, 16, 0),
		// IK._doIk(12, 18, 0),
		// IK._doIk(12, 20, 0),
		// IK._doIk(12, 22, 0),

		//rectangle test
		//at drawing depth
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMin, ConfigParams.DRAW_PARAMETERS.robotYMin, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMin, ConfigParams.DRAW_PARAMETERS.robotYMax, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMax, ConfigParams.DRAW_PARAMETERS.robotYMax, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMax, ConfigParams.DRAW_PARAMETERS.robotYMin, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMin, ConfigParams.DRAW_PARAMETERS.robotYMin, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),

		//an X from the corners of the rectangle, with travel move in middle
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMin, ConfigParams.DRAW_PARAMETERS.robotYMin, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMax, ConfigParams.DRAW_PARAMETERS.robotYMax, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),

		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMax, ConfigParams.DRAW_PARAMETERS.robotYMax, ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z),
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMin, ConfigParams.DRAW_PARAMETERS.robotYMax, ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z),

		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMin, ConfigParams.DRAW_PARAMETERS.robotYMax, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),
		IK._doIk(ConfigParams.DRAW_PARAMETERS.robotXMax, ConfigParams.DRAW_PARAMETERS.robotYMin, ConfigParams.MINDSTORMS_NXT__DRAW_MOVE_Z),


		// end position
		IK._doIk(
			ConfigParams.DRAW_PARAMETERS.robotXMin + ((ConfigParams.DRAW_PARAMETERS.robotXMax - ConfigParams.DRAW_PARAMETERS.robotXMin)/2),
			ConfigParams.DRAW_PARAMETERS.robotYMin,
			ConfigParams.MINDSTORMS_NXT__TRAVEL_MOVE_Z),
	];

} else {
	var slop = 6;
	coords = [
		[null,75.34053189815609,null],
	];
}

var delay = 1000;

robot.once('moveToZeroDone', function() {

	console.log('Zeroed...');	

	if (calibrate) {
		robot.calibrate();
	} else {
		drawCoords();
	}

}.bind(this));

function drawCoords() {

	if(coords.length) { //if remaining coords, go to next

		console.log('Going to next coord at:  ' + coords[0] + ' in ' + (delay/1000) + ' seconds');

		setTimeout(function() {

			robot.once('synchronizedMoveDone', function() {

				drawCoords(); //recursion

			}.bind(this));

			robot.synchronizedMove(coords[0]);

			coords.shift();

			console.log("remaining coords => " + coords.length);

		}.bind(this), delay);

	} else {

		console.log("finished drawing coords, entering calibrate mode -- PRESS ORANGE BUTTON ON NXT BRICK TO END");
		robot.calibrate();
		//process.exit(0);

		// robot.moveToZero(true);

		// robot.once('moveToZeroDone', function() {

		// 	console.log("EXITING");

		// 	process.exit(0);

		// }.bind(this));
	}
}


console.log('Connecting...');
robot.connect(); //start here
