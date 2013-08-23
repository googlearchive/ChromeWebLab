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

//CONFIG
var BASE_GEARBOX_CONFIG = [8, 50]; //list of gear sizes starting with the one mounted on the motor's axle
var LOWER_ARM_GEARBOX_CONFIG = [8, 40]; //list of gear sizes starting with the one mounted on the motor's axle
var UPPER_ARM_GEARBOX_CONFIG = null; //no gears on the upper arm axis
var GLOBAL_SPEED = 40;

var robot = new Robot3Axis('/dev/cu.usbmodem1421', [     //'/dev/cu.NXT-DevB', [ //'/dev/cu.usbmodemfd121', [
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
	
	robot.once('moveToZeroDone', function() {
		sweepX();
	}.bind(this));
	
	//after connecting, get the robot to zero
	robot.moveToZero();
}.bind(this));


process.on('exit', function() {
	console.log("Killing Process ID #" + process.pid);
  process.kill(process.pid, 'SIGTERM');
});

/* POSITION TESTING TO FIND LIMITS
   --------------------------------------------------- */

var xPos = 10, xLimit = 20;

function sweepX() {		
		robot.synchronizedMove(GLOBAL_SPEED, [xPos, 0, 0] );

		robot.once('synchronizedMoveDone', function() {
			xPos++;
			if(xPos >= xLimit) {
				console.log("EXITING");
				process.exit(0);
			} else {
				console.log("MOVING TO " + xPos);
				sweepX();
			}
		}.bind(this));

}//end sweep

/* --------------------------------------------------- */

/*

robot.once('moveToZeroDone', function() {
	
	console.log('Zeroed!');
	
//+++++++++++++++++++++++

	console.log('Doing corner 1...');
	setTimeout(function() {
		robot.synchronizedMove(GLOBAL_SPEED, corner1 );
	}.bind(this), 2000);


	robot.once('synchronizedMoveDone', function() {
		console.log('Done with corner 1.');

//+++++++++++++++++++++++

		console.log('Doing corner 2...');
		setTimeout(function() {
			robot.synchronizedMove(GLOBAL_SPEED, corner2 );
		}.bind(this), 2000);

		robot.once('synchronizedMoveDone', function() {
			console.log('Done with corner 2.');
				process.exit(0);

//++++++++++++++++++++++

			console.log('Doing corner 3...');
			setTimeout(function() {
				robot.synchronizedMove(GLOBAL_SPEED, corner3 );
			}.bind(this), 2000);

			robot.once('synchronizedMoveDone', function() {
				console.log('Done with corner 3.');

//++++++++++++++++++++++

				console.log('Doing corner 4...');
				setTimeout(function() {
					robot.synchronizedMove(GLOBAL_SPEED, corner4 );
				}.bind(this), 2000);

				robot.once('synchronizedMoveDone', function() {
					console.log('Done with corner 4.');

					console.log('EXITING PROGRAM');

				  console.log('sending SIGTERM to process %d', process.pid);
					
					process.exit(0);


				}.bind(this));

			}.bind(this));

		}.bind(this));

	}.bind(this));

}.bind(this));

*/

function calcAngles(x,y,z){
	var theta0,	// base angle
		theta1,	// gear 1 angle
		theta2,	// gear 2 angle
		l1,		// leg 1 length
		l2,		// leg 2 length	
		l1sq, l2sq,
		k1,
		k2,
		d,
		dsq,
		r,
		xsq,
		ysq,
		zprime,
		zprimesq,
		theta2calc,
		sinTheta2,
		cosTheta2,
		theta0deg, theta1deg, theta2deg,
		angsrad,
		angsdeg,
		nxttheta0, nxttheta1, nxttheta2,
		nxtangs
		;

	var GEAR0ZEROANGLE = 16.187;
	var GEAR1ZEROANGLE = 45.584;
	var GEAR2ZEROANGLE = -134.5;
	var baseheight = 0; //7.65;

	l1 = 13.75; // Link B from ConfigParams.js
	l2 = 17.0;  // Link D from ConfigParams.js
	xsq = x*x;
	ysq = y*y;
	d = Math.sqrt(xsq + ysq);
	dsq = d*d;
	zprime = z - baseheight;
	zprimesq = zprime*zprime;
	l1sq = l1*l1;
	l2sq = l2*l2;
    
    console.log('-------------------');
	// base angle
	theta0 = Math.atan2(y, x);
    //console.log('theta0: ' + theta0);

	theta2calc = (dsq + zprimesq - l1sq - l2sq)/(2*l1*l2);
	//console.log('theta2calc: ' + theta2calc);
	sinTheta2 = Math.sqrt( 1 - Math.pow( theta2calc, 2 ) );
	cosTheta2 = theta2calc;
	//console.log('sinTheta2: ' + sinTheta2 + ', cosTheta2: ' + cosTheta2);
	theta2 = Math.atan2(-sinTheta2, cosTheta2);
	//console.log('theta2: ' + theta2);

	k1 = l1 + l2*Math.cos(theta2);
	k2 = l2*Math.sin(theta2);
	theta1 = Math.atan2(zprime,d) - Math.atan2(k2,k1);
	//console.log('theta1: ' + theta1);

	theta0deg = theta0 * 180 / Math.PI;
	theta1deg = theta1 * 180 / Math.PI;
	theta2deg = theta2 * 180 / Math.PI;
    
    //theta2deg = -(180 - Math.abs(theta2deg));
    //theta1deg = 90 - theta1deg;
    
    angsrad = [theta0, theta1, theta2];
	angsdeg = [theta0deg, theta1deg, theta2deg];
    console.log('thetas in radians: ' + angsrad);
	console.log('thetas in degrees: ' + angsdeg);

	if (theta0deg < GEAR0ZEROANGLE){
		console.log("Coordinate is outside of arm bounds. Gear 0 is the culprit.")
	}
	if (theta1deg > GEAR1ZEROANGLE){
		console.log("Coordinate is outside of arm bounds. Gear 1 is the culprit.")
	}
	if (theta2deg < GEAR2ZEROANGLE){
		console.log("Coordinate is outside of arm bounds. Gear 2 is the culprit.")
	}

	// convert angles into mindstorm space
	nxttheta0 = theta0deg - GEAR0ZEROANGLE;
	nxttheta1 = GEAR1ZEROANGLE - theta1deg;
	nxttheta2 = GEAR2ZEROANGLE - theta2deg;
	
	nxtangs = [ nxttheta0, nxttheta1, nxttheta2 ];
	console.log('angles for nxt in degrees: ' + nxtangs);
	return(nxtangs);
}


console.log('Connecting...')
robot.connect(); //start here

