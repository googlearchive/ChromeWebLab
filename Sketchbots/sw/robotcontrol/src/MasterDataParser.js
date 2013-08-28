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
require('mootools');
var ConfigParams = require('./ConfigParams').ConfigParams;

exports.MasterDataParser = new Class({
	Implements: [Events, Options, process.EventEmitter],
	
	options: {

	},
	
    initialize: function(options){
        this.setOptions(options);
        
        this.DRAW_PARAMETERS = ConfigParams.DRAW_PARAMETERS;
        this.MASTER_DATA_RAW = {};
        this.MASTER_DATA = [];
        this.MASTER_MACHINE_CODE = [];
        var larger_cam_dim = ConfigParams.CAM_X > ConfigParams.CAM_Y ? ConfigParams.CAM_X : ConfigParams.CAM_Y;
        this.CAM_IMG_DIM;
        if (larger_cam_dim == ConfigParams.CAM_X){
            var offset = (larger_cam_dim - ConfigParams.CAM_Y)/2;
            this.CAM_IMG_DIM = { xmin: 0, xmax: ConfigParams.CAM_X, ymin: -1*offset, ymax: ConfigParams.CAM_Y+offset };
        } else {
            var offset = (larger_cam_dim - ConfigParams.CAM_X)/2;
            this.CAM_IMG_DIM = { xmin: -1*offset, xmax: ConfigParams.CAM_X+offset, ymin: 0, ymax: ConfigParams.CAM_Y };
        }
    },
    
    // this function takes the strings from the bezier tracer that describe the face curves and
    // converts them into numbers in an array of coordinates. the numbers are normalized so that
    // they are nolonger at the camera's pixel scale
    parseMasterData: function() {
        var raw = this.MASTER_DATA_RAW['pre_machine_code'];
        var lines = raw.split(";");
        var line_count = lines.length;
        this.MASTER_DATA = [];

        for (var i=0; i<line_count; i++) {
            var line_args = lines[i].split(",");
            var x_num = (parseFloat(line_args[0]) - this.CAM_IMG_DIM.xmin)/(this.CAM_IMG_DIM.xmax - this.CAM_IMG_DIM.xmin);
            var y_num = (parseFloat(line_args[1]) - this.CAM_IMG_DIM.ymin)/(this.CAM_IMG_DIM.ymax - this.CAM_IMG_DIM.ymin);
            var z_num = parseFloat(line_args[2]);

            // console.log("NORMALIZED XY:");
            // console.log("x_num " + x_num);
            // console.log("y_num " + y_num);
            // console.log("--------------");

            if (line_args.length == 3) {
                this.MASTER_DATA.push({ x:x_num, y:y_num, z:z_num, type:0});
            } else if (line_args.length == 5) {
                var c0x_num = (parseFloat(line_args[3]) - this.CAM_IMG_DIM.xmin)/(this.CAM_IMG_DIM.xmax - this.CAM_IMG_DIM.xmin);
                var c0y_num = (parseFloat(line_args[4]) - this.CAM_IMG_DIM.ymin)/(this.CAM_IMG_DIM.ymax - this.CAM_IMG_DIM.ymin);
                
                this.MASTER_DATA.push({ x:x_num, y:y_num, z:z_num, c0x:c0x_num, c0y:c0y_num, type:1 });
            } else if (line_args.length == 7) {
                var c0x_num = (parseFloat(line_args[3]) - this.CAM_IMG_DIM.xmin)/(this.CAM_IMG_DIM.xmax - this.CAM_IMG_DIM.xmin);
                var c0y_num = (parseFloat(line_args[4]) - this.CAM_IMG_DIM.ymin)/(this.CAM_IMG_DIM.ymax - this.CAM_IMG_DIM.ymin);
                var c1x_num = (parseFloat(line_args[5]) - this.CAM_IMG_DIM.xmin)/(this.CAM_IMG_DIM.xmax - this.CAM_IMG_DIM.xmin);
                var c1y_num = (parseFloat(line_args[6]) - this.CAM_IMG_DIM.ymin)/(this.CAM_IMG_DIM.ymax - this.CAM_IMG_DIM.ymin);
                this.MASTER_DATA.push({ x:x_num, y:y_num, z:z_num, c0x:c0x_num, c0y:c0y_num, c1x:c1x_num, c1y:c1y_num, type:2 });
            }
        }
    },

    //computes the distance between successive points on the curves

    computeDistances: function() {
        var line_count = this.MASTER_DATA.length;
        this.MASTER_DATA[0].dist = 0;
        for (var i=1; i<line_count; i++) {
            if (this.MASTER_DATA[i].type == 0) {
                this.MASTER_DATA[i].dist = 0;
            } else if (this.MASTER_DATA[i].type == 1) {
                this.MASTER_DATA[i].dist = 0;
                var pts = [];
                for (var t=0; t<=1; t += 0.01) {
                    var xt = (1-t)*((1-t)*this.MASTER_DATA[i-1].x + t*this.MASTER_DATA[i].c0x) + t*((1-t)*this.MASTER_DATA[i].c0x + t*this.MASTER_DATA[i].x);
                    var yt = (1-t)*((1-t)*this.MASTER_DATA[i-1].y + t*this.MASTER_DATA[i].c0y) + t*((1-t)*this.MASTER_DATA[i].c0y + t*this.MASTER_DATA[i].y);
                    pts.push({x:xt, y:yt});
                }
                for (var p=1; p<pts.length; p++) {
                    this.MASTER_DATA[i].dist += Math.sqrt(Math.pow(pts[p].x - pts[p-1].x, 2) + Math.pow(pts[p].y - pts[p-1].y, 2));
                }
            } else if (this.MASTER_DATA[i].type == 2) {
                this.MASTER_DATA[i].dist = 0;
                var pts = [];
                for (var t=0; t<=1; t += 0.01) {
                    var xt0 = (1-t)*((1-t)*this.MASTER_DATA[i-1].x + t*this.MASTER_DATA[i].c0x) + t*((1-t)*this.MASTER_DATA[i].c0x + t*this.MASTER_DATA[i].c1x);
                    var yt0 = (1-t)*((1-t)*this.MASTER_DATA[i-1].y + t*this.MASTER_DATA[i].c0y) + t*((1-t)*this.MASTER_DATA[i].c0y + t*this.MASTER_DATA[i].c1y);
                    var xt1 = (1-t)*((1-t)*this.MASTER_DATA[i].c0x + t*this.MASTER_DATA[i].c1x) + t*((1-t)*this.MASTER_DATA[i].c1x + t*this.MASTER_DATA[i].x);
                    var yt1 = (1-t)*((1-t)*this.MASTER_DATA[i].c0y + t*this.MASTER_DATA[i].c1y) + t*((1-t)*this.MASTER_DATA[i].c1y + t*this.MASTER_DATA[i].y);
                    pts.push({x:(1-t)*xt0 + t*xt1, y:(1-t)*yt0 + t*yt1});
                }
                for (var p=1; p<pts.length; p++) {
                    this.MASTER_DATA[i].dist += Math.sqrt(Math.pow(pts[p].x - pts[p-1].x, 2) + Math.pow(pts[p].y - pts[p-1].y, 2));
                }
            }
        }
    },

    //the coordinates generated by the function below will control all of the movements
    //of the robot arm between the calibrations at the start and the end of the drawing
    
    computeMasterMachineCode: function() {
        this.MASTER_MACHINE_CODE = [];
        var rxmin = parseFloat(this.DRAW_PARAMETERS['robotXMin']);
        var rxmax = parseFloat(this.DRAW_PARAMETERS['robotXMax']);
        var rymin = parseFloat(this.DRAW_PARAMETERS['robotYMin']);
        var rymax = parseFloat(this.DRAW_PARAMETERS['robotYMax']);
        var v_num = this.DRAW_PARAMETERS['velocity'];
        var a_num = this.DRAW_PARAMETERS['acceleration'];
        var line_count = this.MASTER_DATA.length;
        var tempLine = "";

        console.log("COMPUTED MASTER MACHINE CODE");
        console.log('X Min = ' + rxmin);
        console.log('X Max = ' + rxmax);
        console.log("Y MIN = " + rymin);
        console.log("Y MAX = " + rymax);
        console.log(v_num);
        console.log(a_num);
        console.log(line_count);
        console.log(tempLine);
        console.log("----------------------------");
        
        if(ConfigParams.DRAW_MACHINE_TYPE === 'MindstormsNXT') {
            console.log("USING MindstormsNXT");
        }
        // make the arm go to a safe point just above the center first to avoid hitting the
        // plastic barrier with the back of the arm on the way down to the drawing
        tempLine = this.DRAW_PARAMETERS['velocity']/4.0 + "," + this.DRAW_PARAMETERS['acceleration'] + "," + Math.abs(rxmax - rxmin)*this.MASTER_DATA[0].dist + "," + ((rxmin+rxmax)/2) + "," + ((rymin+rymax)/2) + "," + 1;
        this.MASTER_MACHINE_CODE.push(tempLine);

        for (var i=0; i<line_count; i++) {
            var tempLine = "";
            var d_num = Math.abs(rxmax - rxmin)*this.MASTER_DATA[i].dist;
            var x_num = (rxmax - rxmin)*this.MASTER_DATA[i].x + rxmin;
            var y_num = (rymax - rymin)*this.MASTER_DATA[i].y + rymin;

            //console.log(this.MASTER_DATA[i].type);
            
            //this will be replaced by the robot with its calibrated value 
            var z_num = this.MASTER_DATA[i].z;

            if (this.MASTER_DATA[i].type == 0) {
                tempLine = v_num + "," + a_num + "," + d_num + "," + x_num + "," + y_num + "," + z_num;
            } else if (this.MASTER_DATA[i].type == 1) {
                var c0x_num = (rxmax - rxmin)*this.MASTER_DATA[i].c0x + rxmin;
                var c0y_num = (rymax - rymin)*this.MASTER_DATA[i].c0y + rymin;
                tempLine = v_num + "," + a_num + "," + d_num + "," + x_num + "," + y_num + "," + z_num + "," + c0x_num + "," + c0y_num;
            } else if (this.MASTER_DATA[i].type == 2) {
                var c0x_num = (rxmax - rxmin)*this.MASTER_DATA[i].c0x + rxmin;
                var c0y_num = (rymax - rymin)*this.MASTER_DATA[i].c0y + rymin;
                var c1x_num = (rxmax - rxmin)*this.MASTER_DATA[i].c1x + rxmin;
                var c1y_num = (rymax - rymin)*this.MASTER_DATA[i].c1y + rymin;
                tempLine = v_num + "," + a_num + "," + d_num + "," + x_num + "," + y_num + "," + z_num + "," + c0x_num + "," + c0y_num + "," + c1x_num + "," + c1y_num;
            }
            this.MASTER_MACHINE_CODE.push(tempLine);
        }

    }
});

