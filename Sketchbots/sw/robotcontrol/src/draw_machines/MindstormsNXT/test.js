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

var BASE_GEARBOX_CONFIG = [8, 50]; //list of gear sizes starting with the one mounted on the motor's axle
var LOWER_ARM_GEARBOX_CONFIG = [8, 40]; //list of gear sizes starting with the one mounted on the motor's axle
var UPPER_ARM_GEARBOX_CONFIG = null; //no gears on the upper arm axis

var robot = new Robot3Axis('/dev/cu.NXT-DevB', [ //'/dev/cu.usbmodemfd121', [
	{
		'motorPort': 1,
		'zeroingDirection': Robot3Axis.CLOCKWISE,
		'zeroingSpeed': 15,
		'limitSwitchPort': 1,
		'gearBoxConfig': BASE_GEARBOX_CONFIG,
	},
	{
		'motorPort': 2,
		'zeroingDirection': Robot3Axis.CLOCKWISE,
		'zeroingSpeed': 20,
		'limitSwitchPort': null,
		'gearBoxConfig': LOWER_ARM_GEARBOX_CONFIG,
	},
	{
		'motorPort': 3,
		'zeroingDirection': Robot3Axis.CLOCKWISE,
		'zeroingSpeed': 50,
		'limitSwitchPort': null,
		'gearBoxConfig': UPPER_ARM_GEARBOX_CONFIG,
	},
]);
robot.once('connected', function() {
	console.log('Connected. Moving to zero...')
	//after connecting, get the robot to zero
	robot.moveToZero();
}.bind(this));

/*
robot.once('moveToZeroDone', function() {
	console.log('Zeroed!');
	//do a move
	robot.once('synchronizedMoveDone', function() {
		console.log('Done with move 1 of 2.');
		//do another move
		robot.once('synchronizedMoveDone', function() {
			console.log('Done with move 2 of 2.');
			process.exit(0);

		}.bind(this));
		console.log('Move 2 of 2...');
		setTimeout(function() {
			robot.synchronizedMove(40, [null, 30, -145]);
		}.bind(this), 1000);

	}.bind(this));
	console.log('Move 1 of 2...');
	robot.synchronizedMove(40, [30, 0, 0]);
}.bind(this));
*/

console.log('Connecting...')
robot.connect(); //start here

