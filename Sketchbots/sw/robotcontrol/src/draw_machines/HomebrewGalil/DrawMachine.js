/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
require('mootools');
var Robot = require('./Robot').Robot;
var ConfigParams = require('../../ConfigParams').ConfigParams;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// DrawMachine
///// Coverts Draw commands into steps for the motion controller.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.DrawMachine = new Class({
	Implements: [Events, Options, process.EventEmitter],
	
	options: {
	},
	
	initialize: function(options){
		this.setOptions(options);
		this.PI_2 = 6.283185307179586;
		this.PI_OVER_2 = 1.570796326794897;
		this.configParams = ConfigParams;
        //these are the lengths of the different parts of the arm
		this.LINK_A = this.configParams.LINK_A;
		this.LINK_B = this.configParams.LINK_B;
		this.LINK_C = this.configParams.LINK_C;
		this.LINK_D = this.configParams.LINK_D;
        //this is the number of steps that the motor needs to do a single revolution
		this.J1_STEP_PER_REV = 36000;
		this.J2_STEP_PER_REV = 19200;
		this.J3_STEP_PER_REV = 13333;
		this.CLOCK_HZ = 1000;
		this.BUFFER_SIZE = 3000;
        //used to compute the buffer size
		this.MAX_DRAW_TIME = ConfigParams.MAX_DRAW_TIME;
		this.CONTOUR_BUFFER_SIZE = 180000*14*4;
				
        //this keeps track of the number of steps that have been rendered from a path
		this.motorTimerCounter = 0;
		
        //these are some quantities used in the inverse kinematics trig which
        //would waste cpu if they were computed repeatedly, so they are computed once here
		this.ik_sq_linkc_linkd_hypot = this.LINK_C*this.LINK_C + this.LINK_D*this.LINK_D;
		this.ik_linkc_linkd_hypot = Math.sqrt(this.ik_sq_linkc_linkd_hypot);
		this.ik_atan_linkc_o_linkd = Math.atan(this.LINK_C/this.LINK_D);
		this.ik_sq_linkb = this.LINK_B*this.LINK_B;
		this.ik_2_linkb = 2*this.LINK_B;
		this.ik_j3_offset = this.ik_atan_linkc_o_linkd + this.PI_OVER_2;
        
        //these variables are used to distribute the steps for the contours
        //smoothly through time as the robot draws
		this.ease_case = 0;
		this.ease_dist = 0;
		this.ease_dur = 0;
		this.ease_dist_o_vel = 0;
		this.ease_vel_o_acc = 0;
		this.ease_sqrt_dist_o_acc = 0;
		this.pre_dist = 0;
		this.numPulses = 0;
		this.currentPulse = 0;
		this.curveType = 0;
		this.ease_vel = 8.0;
		this.ease_acc = 16.0;
		this.stepsLostFlag = [];
		this.stepsLostFlag[0] = 0;
		this.stepsLostFlag[1] = 0;
		this.stepsLostFlag[2] = 0;
		
		this.controlPoints = new Array(3);
		this.currentSteps = new Array(3);
		this.currentSteps[0] = 0;
		this.currentSteps[1] = 0;
		this.currentSteps[2] = 0;
		
		this.executeSteps = new Array(3);
		this.executeSteps[0] = 0;
		this.executeSteps[1] = 0;
		this.executeSteps[2] = 0;
		
		this.currentCart = new Array(3);
		this.currentCart[0] = 0.0;
		this.currentCart[1] = this.LINK_A + this.LINK_D;
		this.currentCart[2] = this.LINK_B + this.LINK_C;
		
		this.targetCart = new Array(3);
		this.targetCart[0] = 0.0;
		this.targetCart[1] = this.LINK_A + this.LINK_D;
		this.targetCart[2] = this.LINK_B + this.LINK_C;
		
		this.driveFlag = 0;
		this.maxBufferIndex = 0;
		this.currentBufferIndex = 0;
		this.buff_vel = new Array(this.BUFFER_SIZE);
		this.buff_acc = new Array(this.BUFFER_SIZE);
		this.buff_dist = new Array(this.BUFFER_SIZE);
		this.buff_cart = new Array(3);
		this.buff_cart[0] = new Array(this.BUFFER_SIZE);
		this.buff_cart[1] = new Array(this.BUFFER_SIZE);
		this.buff_cart[2] = new Array(this.BUFFER_SIZE);
		this.buff_control = new Array(3);
		this.buff_control[0] = new Array(this.BUFFER_SIZE);
		this.buff_control[1] = new Array(this.BUFFER_SIZE);
		this.buff_control[2] = new Array(this.BUFFER_SIZE);
		this.buff_control[3] = new Array(this.BUFFER_SIZE);
		this.buff_type = new Array(this.BUFFER_SIZE);
		this.bufferCommandCount = this.options.MAX_DRAW_TIME*this.CLOCK_HZ*60;
		
		this.zero();
		
	},
	
    //instantiate a new robot object and connect it to the motion controller
    //set up the listeners that will pass the robot's events to the DrawMachineCommandLoader that
    //is listening to this object
    createRobot: function(){
        this.robot = new Robot({BUFFER_COMMAND_COUNT: this.bufferCommandCount});
		this.commandBufferSize = this.robot.commandBuffer.commands.length;
        
        this.robot.on('arduinoError', function(){
            this.emit('sensorError');
        }.bind(this));
        
		this.robot.on('connectedToMotionController', function(){
			this.emit('robotConnectedToMotionController');
		}.bind(this));
        
		this.robot.on('commandBufferFilled', function(){
			console.log('The robot command buffer has been filled.');
		}.bind(this));
        
		this.robot.on('drawingComplete', function(){
            console.log("The drawing is complete.");
			this.emit('drawingComplete');
		}.bind(this));
		
		this.robot.on('turntableMotionComplete', function(){
			this.emit('turntableMotionComplete');
		}.bind(this));
		
		this.robot.on('newSandDepth', function(depth){
			this.emit('newSandDepth', depth);
		}.bind(this));
		
		this.robot.on('robotAtHome', function(){
			this.emit('robotAtHome');
		}.bind(this));
        
		this.robot.on('robotCalibrated', function(){
			this.emit('robotCalibrated');
		}.bind(this));
        
 		this.robot.on('robotSleeping', function(){
			this.emit('robotSleeping');
		}.bind(this));
        
 		this.robot.on('readyForPicture', function(){
			this.emit('readyForPicture');
		}.bind(this));

       this.robot.connect.delay(2000,this.robot);
    },
    
    //sends the robot to its home position
	goHome: function() {
        this.robot.goHome();
	},
    
	calibrate: function() {
        this.robot.calibrate();
	},
    
    doInitialCalibration: function(){
        this.robot.doInitialCalibration();
    },
	
 	zero: function() {
 	//zero out the robot - Set that robot is at "home" location
 		console.log('Zeroing: local state of robot updated to assume that it is at home position');
		this.currentSteps[0] = 0;
		this.currentSteps[1] = 0;
		this.currentSteps[2] = 0;
		
		this.executeSteps[0] = 0;
		this.executeSteps[1] = 0;
		this.executeSteps[2] = 0;
		
		this.currentCart[0] = 0.0;
		this.currentCart[1] = this.LINK_A + this.LINK_D;
		this.currentCart[2] = this.LINK_B + this.LINK_C;
		
		this.targetCart[0] = 0.0;
		this.targetCart[1] = this.LINK_A + this.LINK_D;
		this.targetCart[2] = this.LINK_B + this.LINK_C;
		
		this.driveFlag = 0;
	},

	easePreCompute: function() {
		if (this.curveType == 0) {
			this.ease_dist = Math.sqrt(Math.pow(this.targetCart[0] - this.currentCart[0], 2) + Math.pow(this.targetCart[1] - this.currentCart[1], 2) + Math.pow(this.targetCart[2] - this.currentCart[2], 2));
		} else {
			this.ease_dist = this.pre_dist;
		}
		this.ease_dist_o_vel = this.ease_dist/this.ease_vel;
		if (this.ease_acc == 0) {
			this.ease_dur = this.ease_dist_o_vel;
			this.ease_case = 0;
		} else {
			this.ease_vel_o_acc = this.ease_vel/this.ease_acc;
			if (this.ease_dist_o_vel > this.ease_vel_o_acc) {
				this.ease_dur = this.ease_dist_o_vel + this.ease_vel_o_acc;
				this.ease_case = 1;
			} else {
				this.ease_sqrt_dist_o_acc = Math.sqrt(this.ease_dist/this.ease_acc);
				this.ease_dur = 2*this.ease_sqrt_dist_o_acc;
				this.ease_case = 2;
			}
		}
		this.numPulses = Math.ceil(this.ease_dur*this.CLOCK_HZ);
		this.currentPulse = 0;
	},

	easeParameter: function(t) {
		if (t <= 0) {
			return 0;
		} else if (t >= this.ease_dur) {
			return 1;
		} else {
			if (this.ease_case == 0) {
				return this.ease_vel*t/this.ease_dist;
			} else if (this.ease_case == 1) {
				if (t <= this.ease_vel_o_acc) {
					return 0.5*this.ease_acc*t*t/this.ease_dist;
				} else if (t <= this.ease_dist_o_vel) {
					return (t - 0.5*this.ease_vel_o_acc)/this.ease_dist_o_vel;
				} else {
					var temp = t - this.ease_dist_o_vel - this.ease_vel_o_acc;
					return 1 - 0.5*this.ease_acc*temp*temp/this.ease_dist;
				}
			} else {
				if (t <= this.ease_sqrt_dist_o_acc) {
					return 0.5*this.ease_acc*t*t/this.ease_dist;
				} else {
					var temp = t - this.ease_dur;
					return 1 - 0.5*this.ease_acc*temp*temp/this.ease_dist;
				}
			}
		}
	},

	doIK: function(x,y,z,jointsBuffer) {
		var r = Math.sqrt(x*x + y*y) - this.LINK_A;
		var h = Math.sqrt(r*r + z*z);
		var t1 = Math.acos(r/h);
		if (z < 0) {
			t1 = -1*t1;
		}
		var sq_h = h*h;
		var t2 = Math.acos((this.ik_sq_linkb + sq_h - this.ik_sq_linkc_linkd_hypot)/(this.ik_2_linkb*h));
		var t3 = Math.acos((this.ik_sq_linkb + this.ik_sq_linkc_linkd_hypot - sq_h)/(this.ik_2_linkb*this.ik_linkc_linkd_hypot));
		jointsBuffer[0] = Math.atan2(-1*x, y);
		jointsBuffer[1] = t1 + t2 - this.PI_OVER_2;
		jointsBuffer[2] = t3 - this.ik_j3_offset;
	},

	computeExecuteSteps: function() {
		
		if (this.currentPulse < this.numPulses) {
			
			var param = this.easeParameter(this.ease_dur*(this.currentPulse+1)/this.numPulses);
						
			var ptx = 0;
			var pty = 0;
			var ptz = 0;
			
			
			if (this.curveType == 0) {
				ptx = (1.0 - param)*this.currentCart[0] + param*this.targetCart[0];
				pty = (1.0 - param)*this.currentCart[1] + param*this.targetCart[1];
				ptz = (1.0 - param)*this.currentCart[2] + param*this.targetCart[2];
			
			} else if (this.curveType == 1) {
				ptx = (1-param)*((1.0 - param)*this.currentCart[0] + param*this.controlPoints[0]) + param*((1.0 - param)*this.controlPoints[0] + param*this.targetCart[0]);
				pty = (1-param)*((1.0 - param)*this.currentCart[1] + param*this.controlPoints[1]) + param*((1.0 - param)*this.controlPoints[1] + param*this.targetCart[1]);
				ptz = (1.0 - param)*this.currentCart[2] + param*this.targetCart[2];
			
			} else if (this.curveType == 2) {
				var ptx0 = (1-param)*((1.0 - param)*this.currentCart[0] + param*this.controlPoints[0]) + param*((1.0 - param)*this.controlPoints[0] + param*this.controlPoints[2]);
				var pty0 = (1-param)*((1.0 - param)*this.currentCart[1] + param*this.controlPoints[1]) + param*((1.0 - param)*this.controlPoints[1] + param*this.controlPoints[3]);
				var ptx1 = (1-param)*((1.0 - param)*this.controlPoints[0] + param*this.controlPoints[2]) + param*((1.0 - param)*this.controlPoints[2] + param*this.targetCart[0]);
				var pty1 = (1-param)*((1.0 - param)*this.controlPoints[1] + param*this.controlPoints[3]) + param*((1.0 - param)*this.controlPoints[3] + param*this.targetCart[1]);
				
				ptx = (1.0 - param)*ptx0 + param*ptx1;
				pty = (1.0 - param)*pty0 + param*pty1;
				ptz = (1.0 - param)*this.currentCart[2] + param*this.targetCart[2];
			}
			
			var jointsRad = new Array(3);
			
			this.doIK(ptx, pty, ptz, jointsRad);
			
			this.executeSteps[0] = Math.round(this.J1_STEP_PER_REV*jointsRad[0]/this.PI_2) - this.currentSteps[0];
			this.executeSteps[1] = Math.round(this.J2_STEP_PER_REV*jointsRad[1]/this.PI_2) - this.currentSteps[1];
			this.executeSteps[2] = Math.round(this.J3_STEP_PER_REV*jointsRad[2]/this.PI_2) - this.currentSteps[2];
			
			if (Math.abs(this.executeSteps[0]) > 1) this.stepsLostFlag[0] = 1;
			if (Math.abs(this.executeSteps[1]) > 2) this.stepsLostFlag[1] = 1;
			if (Math.abs(this.executeSteps[2]) > 2) this.stepsLostFlag[2] = 1;
			
			this.currentSteps[0] += this.executeSteps[0];
			this.currentSteps[1] += this.executeSteps[1];
			this.currentSteps[2] += this.executeSteps[2];
			
			this.currentPulse++;
			
			return 0;
			
		} else {
			this.driveFlag = 0;
			
			this.currentCart[0] = this.targetCart[0];
			this.currentCart[1] = this.targetCart[1];
			this.currentCart[2] = this.targetCart[2];
			
			this.prepNextCurve();
			
			return -1;
		}
	},

	prepNextCurve: function() {
        var lift;
		if (this.currentBufferIndex < this.maxBufferIndex) {
		
			this.ease_vel = this.buff_vel[this.currentBufferIndex];
			this.ease_acc = this.buff_acc[this.currentBufferIndex];
			
			this.pre_dist = this.buff_dist[this.currentBufferIndex];
			
			this.targetCart[0] = this.buff_cart[0][this.currentBufferIndex];
			this.targetCart[1] = this.buff_cart[1][this.currentBufferIndex];
            lift = (this.buff_cart[2][this.currentBufferIndex] == 1);
			this.targetCart[2] = lift ? this.robot.sandDepth + ConfigParams.DRAW_PARAMETERS['liftDistance'] : this.robot.sandDepth;
			this.curveType = this.buff_type[this.currentBufferIndex];
			
			this.controlPoints[0] = this.buff_control[0][this.currentBufferIndex];
			this.controlPoints[1] = this.buff_control[1][this.currentBufferIndex];
			this.controlPoints[2] = this.buff_control[2][this.currentBufferIndex];
			this.controlPoints[3] = this.buff_control[3][this.currentBufferIndex];
			
			this.easePreCompute();
			
			this.currentBufferIndex++;
			this.driveFlag = 1;
			
			return 0;
		} else {
			return -1;
		}
	},

	start: function() {
		console.log('Draw machine: Start');
		
		this.robot.connect();
		this.robot.setFramePeriod(Math.round(1000/this.CLOCK_HZ)); //set speed the controller takes commands at

		this.prepNextCurve();
		var command = null;
		
		var data = new Buffer(this.commandBufferSize);
		
		var location = 0;
		
		var innerLoopCount = 0;
		var outerLoopCount = 0;
		
		var bufferContainsSteps = false;
		
		
		for(var i = 0; i < data.length; i ++){
			data[i] = 0;//0, i);
		}
		
		//WHY NOT JUST FILL THE BUFFER HERE?
		//We create this line, then split it up to fill the buffer. Doing a lot of extra work here.
		//like this -> //this.robot.commandBuffer.push();
		//console.log("DrawMachine.start():---- first time:");
		//console.log("DrawMachine.start(): data: "+data.toString("utf-8").replace(/\r/gi,""));
		
		while (this.driveFlag == 1){
		
			if (this.computeExecuteSteps() == 0) { //this fills this.executeSteps with the proper info
				command = "CD"+this.formatNumber(this.executeSteps[0])+","+this.formatNumber(this.executeSteps[1])+","+this.formatNumber(this.executeSteps[2])+"\r";
				location += data.write(command,location);								
				innerLoopCount++;
			}
			this.motorTimerCounter++;
		}
		
        this.generateTimeEstimate(innerLoopCount);
		console.log("commands: "+innerLoopCount);
		this.robot.drawContours(data);
	},
    
    generateTimeEstimate: function(commandCount){
        var estimate = (new Date()).getTime()/1000 + commandCount/this.CLOCK_HZ;
        this.emit('timeEstimate',estimate);
    },
	
	reset: function(){
		this.robot.reset();
	},
                                
    moveTurntable: function(){
    	this.robot.moveTurntable();
    },
    fullWipe: function(){
    	this.robot.moveTurntable(360);
    },
    partialWipe: function(){
    	this.robot.moveTurntable(60);
    },
	
	formatNumber: function(number){
		
		
		var output = new String();
		var clip = Math.abs(number)>99;
		
		if (clip){
			number=99;
			console.log("Warning: more than 99 steps per frame");
		}
		
		if (number < 0){
			output = output + "-";
		}else{
			output = output + "+";
		}
		if (Math.abs(number) < 10) output = output + "0";
		output = output + Math.abs(number);
		
		return output;
	},
});





