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
require('mootools')
var net = require('net');
var ConfigParams = require('./ConfigParams').ConfigParams;

// determine the correct draw machine to load based on ConfigParams.DRAW_MACHINE_TYPE
var DrawMachine = require('./draw_machines/'+ConfigParams.DRAW_MACHINE_TYPE+'/DrawMachine').DrawMachine;

/**
 * IMPORTANT:
 *
 * DrawMachine is expected to be a class which conforms to the API in NoMachine/DrawMachine.js
 *
 * READ THAT FILE BEFORE MAKING A NEW DrawMachine.
 *
 */


exports.DrawMachineCommandLoader = new Class({
	Implements: [Events, Options, process.EventEmitter],
	
	options: {

	},
	
	
	initialize: function(options){
		this.setOptions(options);
        this.readyToDraw = false;
		this.machine = new DrawMachine({MAX_DRAW_TIME:ConfigParams.MAX_DRAW_TIME});
        
        this.machine.on('sensorError', function(){
            this.emit('sensorError');
        }.bind(this));

    
		this.machine.once('robotConnectedToMotionController', function(){
            this.emit('robotConnectedToMotionController');
		}.bind(this));
		
		
        this.commandBuffer = new Array(8);
		for (var i=0;i<8;i++){
			this.commandBuffer[i] = new Array(32);
		}
		this.cbi = 0; // Next index that might have data.
		this.commandBufferEnd = 0; // First index with no data.
		this.commandBufferPointer = 0;
		this.motorTimerCounter = 0;
		this.debugTimerCounter = 0;
		this.isDriving = false;
	},
	
    getReadyToDrawState: function(){
         return this.readyToDraw;
    },
                                             
	
	fillBufferSlot: function(type,v,a,d,tcx,tcy,tcz,c0x,c0y,c1x,c1y) {		
		this.machine.buff_type[this.machine.maxBufferIndex] = type;
		this.machine.buff_vel[this.machine.maxBufferIndex] = v;
		this.machine.buff_acc[this.machine.maxBufferIndex] = a;
		this.machine.buff_dist[this.machine.maxBufferIndex] = d;
		this.machine.buff_cart[0][this.machine.maxBufferIndex] = tcx;
		this.machine.buff_cart[1][this.machine.maxBufferIndex] = tcy;
		this.machine.buff_cart[2][this.machine.maxBufferIndex] = tcz;
		this.machine.buff_control[0][this.machine.maxBufferIndex] = c0x;
		this.machine.buff_control[1][this.machine.maxBufferIndex] = c0y;
		this.machine.buff_control[2][this.machine.maxBufferIndex] = c1x;
		this.machine.buff_control[3][this.machine.maxBufferIndex] = c1y;
		this.machine.maxBufferIndex++;
	},

    triggerTurntable: function(){
        this.machine.once('turntableMotionComplete', function(){
                this.emit('turntableMotionComplete');
            }.bind(this));
        
        this.machine.moveTurntable();
    },
    
    resetCommandBuffer: function(){
        this.machine.maxBufferIndex = 0;
        this.machine.currentBufferIndex = 0;
        //clear the command buffer
        this.machine.reset();
    },
    
    // starts the drawing and sets up a chain of events that will fire
    // one time when the drawing completes.
    // the chain of events will trigger the homing and turntable movement
    // needed after each drawing is completed
    startDrawing: function(){
        
        this.machine.once('robotAtHome', function(){
            this.machine.currentBufferIndex = 0;
            this.motorTimerCounter = 0;
            this.debugTimerCounter = 0;
            this.emit('readyForVideoStart');
            this.machine.once('timeEstimate',function(timeEstimate){this.emit('timeEstimate',timeEstimate);}.bind(this));
            this.machine.start();
            // prepare event chain for when the drawing completes
            // zero out and go home
            //this.machine.removeAllListeners(); //avoid multiple event listeners
            this.machine.once('drawingComplete', function(movement){
                this.emit('drawingComplete');
                this.prepareRobotForNextDrawing();
            }.bind(this));
        }.bind(this));

        this.machine.goHome();
    },
    
    // prepare the robot and table for drawing, and emit 
    // a 'readyToDraw' event when done
    prepareRobotForNextDrawing: function(){
        console.log("DMCL preparing robot for drawing");
        this.machine.zero();
        
        //video needs to know when arm is up.
        this.machine.once('robotAtHome', function(){
            this.emit('readyForHomeTimestamp');
        }.bind(this));

        this.machine.calibrate();
       //along the way, events will trigger some artifacts stuff
        this.machine.once('drawingComplete', function(){
//            this.emit('readyForVideoStop');
        }.bind(this));
        this.machine.once('readyForPicture', function(){
            this.emit('readyForPicture');
        }.bind(this));
        //once the robot is calibrated, emit a ready event
        this.machine.once('robotCalibrated', function(){
            this.readyToDraw = true;
            console.log("Calibration complete. Emitting readyToStartDrawing");
            this.emit('readyToStartDrawing');
        }.bind(this));
    },
    
    // prepare the robot and table for drawing, and emit 
    // a 'readyToDraw' event when done
    prepareRobotForFirstDrawing: function(){
        console.log("DMCL preparing robot for first drawing");
        this.machine.zero();
        this.machine.once('robotCalibrated', function(movement){
            console.log("Robot is calibrated. Moving the dot.");
            
            //once the turntable is done moving, emit a ready event
            this.machine.once('turntableMotionComplete', function(movement){
                this.readyToDraw = true;
                console.log("Turntable motion complete. Emitting readyToStartDrawing");
                this.emit('readyToStartDrawing');
            }.bind(this));
            
            //once at calibrated, move the turntable shift the calibration dot
            this.machine.partialWipe();
        }.bind(this));
        
        this.machine.doInitialCalibration();
    },

    createRobot: function(){
        console.log("DMCL created robot");
        this.machine.createRobot();
    }
});


//var DrawMachineCommandLoader = exports.DrawMachineCommandLoader;
//var dcl = new DrawMachineCommandLoader();

