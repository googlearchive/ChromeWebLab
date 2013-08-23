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

var robot = new Robot3Axis('/dev/cu.usbmodem621', [     //'/dev/cu.NXT-DevB', [ //'/dev/cu.usbmodemfd121', [
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
	//process.exit(0);
}.bind(this));

var debug = 'true'; // 'false' runs the 4 corners, 'true' runs 2 easy moves, anything else just zeroes

var test2 = calcAngles(15, 15, -10);
var test3 = calcAngles(25, 7, 0);

if (debug == 'true'){
robot.once('moveToZeroDone', function() {
	console.log('Zeroed!');
	//goToPos(20, 10, 5);

	setTimeout(function() {
		robot.synchronizedMove(100, test2 );
	}.bind(this), 2000);

	robot.once('synchronizedMoveDone', function() {
		console.log('Done with move 1.');

		setTimeout(function() {
			robot.synchronizedMove(100, test3 );
		}.bind(this), 2000);

		robot.once('synchronizedMoveDone', function() {
			console.log('Done with move 2.');
			
			process.exit(0);

		}.bind(this));

	}.bind(this));

	//process.exit(0);
}.bind(this));
}

var corner1 = calcAngles(20, 15, -10);
var corner2 = calcAngles(20, 20, -10);
var corner3 = calcAngles(15, 20, -10);
var corner4 = calcAngles(20, 15, -10);

//console.log('corner1: ' + corner1);
//console.log('corner2: ' + corner2);
//console.log('corner3: ' + corner3);
//console.log('corner4: ' + corner4);

if (debug == 'false'){
robot.once('moveToZeroDone', function() {
	console.log('Zeroed!');
	
//+++++++++++++++++++++++

	console.log('Doing corner 1...');
	setTimeout(function() {
		robot.synchronizedMove(5, corner1 );
	}.bind(this), 2000);

	robot.once('synchronizedMoveDone', function() {
		console.log('Done with corner 1.');

//+++++++++++++++++++++++

		console.log('Doing corner 2...');
		setTimeout(function() {
			robot.synchronizedMove(5, corner2 );
		}.bind(this), 2000);

		robot.once('synchronizedMoveDone', function() {
			console.log('Done with corner 2.');

//++++++++++++++++++++++

			console.log('Doing corner 3...');
			setTimeout(function() {
				robot.synchronizedMove(5, corner3 );
			}.bind(this), 2000);

			robot.once('synchronizedMoveDone', function() {
				console.log('Done with corner 3.');

//++++++++++++++++++++++

				console.log('Doing corner 4...');
				setTimeout(function() {
					robot.synchronizedMove(5, corner4 );
				}.bind(this), 2000);

				robot.once('synchronizedMoveDone', function() {
					console.log('Done with corner 4.');

					process.exit(0);

				}.bind(this));

			}.bind(this));

		}.bind(this));

	}.bind(this));

}.bind(this));
}


function calcAngles(x,y,z){
	// based on this paper: http://www.hessmer.org/uploads/RobotArm/Inverse%2520Kinematics%2520for%2520Robot%2520Arm.pdf
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

	// found these taking a picture and using illustrator
	var GEAR0ZEROANGLE = 6.187;
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
	r = Math.sqrt(k1*k1 + k2*k2);
    
    console.log('-------------------');
	// base angle, simply from x and y
	theta0 = Math.atan2(y, x);

	// calculating angle for topmost joint
	theta2calc = (dsq + zprimesq - l1sq - l2sq)/(2*l1*l2);
	sinTheta2 = Math.sqrt( 1 - Math.pow(theta2calc, 2) );
	cosTheta2 = theta2calc;
	// sinTheta2 gets negative because it's an 'elbow-down' orientation
	theta2 = Math.atan2(-sinTheta2, cosTheta2);

	// calculating angle for middle joint
	k1 = l1 + l2*Math.cos(theta2);
	k2 = l2*Math.sin(theta2);
	theta1 = Math.atan2(zprime,d) - Math.atan2(k2,k1);

	// converting radians to degrees
	theta0deg = theta0 * 180 / Math.PI;
	theta1deg = theta1 * 180 / Math.PI;
	theta2deg = theta2 * 180 / Math.PI;

	var thetadegs = [ theta0deg, theta1deg, theta2deg ];
	console.log('actual angles in degrees: ' + thetadegs);

	// checking to see if angles will go beyond 'zero' limits, 
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

// this is the IK function from the HomebrewGalil folder
/*
function calcAnglesHB(x,y,z){
	var radToDeg = 57.2957795;
	
	var PI_2 = 6.283185307179586;
	var PI_OVER_2 = 1.570796326794897;

	var LINK_A = 2.25; //ConfigParams.LINK_A; 
	var LINK_B = 13.75; //ConfigParams.LINK_B; 
	var LINK_C = 0.0; //ConfigParams.LINK_C; 
	var LINK_D = 19.0; //ConfigParams.LINK_D; 
	
	var ik_sq_linkc_linkd_hypot = LINK_C*LINK_C + LINK_D*LINK_D;
	var ik_linkc_linkd_hypot = Math.sqrt(ik_sq_linkc_linkd_hypot);
	var ik_atan_linkc_o_linkd = Math.atan(LINK_C/LINK_D);
	var ik_sq_linkb = LINK_B*LINK_B;
	var ik_2_linkb = 2.0*LINK_B;
	var ik_j3_offset = ik_atan_linkc_o_linkd + PI_OVER_2;
	
	var r = Math.sqrt(x*x + y*y) - LINK_A;
	var h = Math.sqrt(r*r + z*z);
	var t1 = Math.acos(r/h);
	
	if (z < 0) t1 = -1.0 * t1;

	var sq_h = h*h;
	
	var t2 = Math.acos((ik_sq_linkb + sq_h - ik_sq_linkc_linkd_hypot)/(ik_2_linkb*h));
	var t3 = Math.acos((ik_sq_linkb + ik_sq_linkc_linkd_hypot - sq_h)/(ik_2_linkb*ik_linkc_linkd_hypot));
	
	console.log('t1: ' + t1 + ', t2: ' + t2 + ', t3: ' + t3);

	//var baseDeg = (Math.atan2(-1.0*x, y)) * radToDeg;
	var baseDeg = (Math.atan2(y, x)) * radToDeg;
	var lowerArmDeg = (t1 + t2 - PI_OVER_2) * radToDeg;
	var upperArmDeg = (t3 - ik_j3_offset) * radToDeg;
	
	//lowerArmDeg += 90.0;
	//upperArmDeg += 90.0;
	
	var returnArr = [];
	
	returnArr[0] = baseDeg;
	returnArr[1] = lowerArmDeg;
	returnArr[2] = upperArmDeg;
	
	
	return returnArr;
}
*/

console.log('Connecting...')
robot.connect(); //start here

