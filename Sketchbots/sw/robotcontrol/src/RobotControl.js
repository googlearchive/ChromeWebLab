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
var mootools = require('mootools');
var net = require('net');
var sys = require('sys');
var querystring = require('querystring');
var ConfigParams = require('./ConfigParams').ConfigParams;
var labqueueClient = new(require('./SignedRequest').SignedRequest)().signed_client;
var ImageProcessingManager = require('./ImageProcessingManager').ImageProcessingManager;
var MasterDataParser = require('./MasterDataParser').MasterDataParser;
var DrawMachineCommandLoader = require('./DrawMachineCommandLoader').DrawMachineCommandLoader;
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var path = require('path');
var restler = require('restler');

//only use RobotLogger if USE_LOGGLY is enabled
var RobotLogger = ConfigParams.USE_LOGGLY ? require('./RobotLogger').RobotLogger : null;

exports.RobotControl = new Class({
    Implements: [Events, process.EventEmitter],

    /**
     * get this robot ready to start accepting tasks. this includes managing configurations, etc
     *
     */
    initialize: function() {
        //the worker name is the unique identifier for this robot, and it is passed in
        //when the command that launches this class is called
        this.workerGUID = ConfigParams.SKETCHBOT_NAME + '.' + ConfigParams.SKETCHBOT_DOMAIN + '.openweblab';

        //this is the name (topic) of the queue from which this bot should
        //get new drawings
        //change it in ConfigParams.js
        this.queueName = ConfigParams.QUEUE_TOPIC;

        // replace the node console log function with a RobotLogger. Since the RobotLogger 
        // will be logging to the node console as well, this is transparent to any logging
        // done on console. this will also write the logs to a local file
        if (ConfigParams.USE_LOGGLY) {
            this.robotLogger = new RobotLogger({
                workerName: this.workerGUID,
                subdomain: ConfigParams.LOGGLY_SUBDOMAIN,
                key: ConfigParams.LOGGLY_KEY
            });
            this.robotLogger.inject(console);
        }

        console.log("==============================================================");
        console.log("========= PROGRAM START: ROBOT CONTROL INITIALIZING ==========");
        console.log("==============================================================");

        console.log("This robot's ID is " + this.workerGUID);

        this.LABQUEUE_HOSTNAME = ConfigParams.LABQUEUE_HOSTNAME;
        this.LABQUEUE_PORT = ConfigParams.LABQUEUE_PORT;

        // each time the robot looks for a new task, it first checks what activity space it should be
        // working in, www or museum. this depends on a schedule that is maintained by the api
        // these will change later depending on the activity space returned by the api
        this.GET_NEXT_DRAWING_PATH = '/api/topics/' + this.queueName + '/offers'; //note: NO trailing slash here
        this.DRAWING_TASKS_PATH = '/api/topics/' + this.queueName + '/tasks/';
        this.BIN_PATH = '/api/bin';

        console.log("This robot's drawings come from the " + this.queueName + " queue topic at " + (ConfigParams.LABQUEUE_USE_HTTPS ? "https" : "http") + "://" + this.LABQUEUE_HOSTNAME + ":" + this.LABQUEUE_PORT + this.GET_NEXT_DRAWING_PATH);

        console.log("==============================================================");

        //this is where the robot will post the artifact media at the end of a drawing

        //this is where the robot can get the current activity space

        //this is where the robot posts the current status on a job
        //such as an updated time to completion estimate
        this.STATUS_PATH = '/api/workers/' + this.workerGUID + '/status';

        //this will be set to true when the robot is ready to accept a job
        //but first some calibration etc needs to happen
        this.checkingForNewDrawing = false;
        this.linesToLoad = [];

        // the robot can never accept more than one task
        // so this is the id of the currently drawing task
        this.acceptedDrawingTaskID = 0;

        // these are used to track the payload of the task indicated by acceptedDrawingTaskID 
        this.candidateDrawingPayload = null;
        this.acceptedDrawingPayload = null;

        //temp value, no meaning
        this.acceptedPhotoUrl = 0;

        // robot will be ready after calibration etc
        // this will be set to false while a drawing is under way
        // and true again when it is finished
        this.robotIsReady = false;

        // this counter is used to track (roughly) how long we have
        // been waiting for the robot to become ready
        this.waitingForRobotCount = 0;

        // this converts the basic drawing commands into scaled 3d paths that
        // can be converted to steps and sent to the draw machine
        this.masterDataParser = new MasterDataParser();

        // this class will create the draw machine, which creats the robot
        // which connects to the draw machine. events from the draw machine
        // and the arduinos will appear through this class. this class will prepare
        // step data and sent it to the draw machine
        this.drawMachineCommandLoader = new DrawMachineCommandLoader();

        //keeps track of whether a task is active
        this.taskIsActive = false;

        //the "next" data object will be the one that is drawing next
        //the "current" data object will be the one that is drawing currently
        //right before a drawing starts, "current" will be set to the object in "next"
        this.setNextDrawingArtifactData(null);
        this.setCurrentDrawingArtifactData(null);


        this.estimatedStopTime = 0;

        //these can be used to keep track of the stages after a draw completes
        //and make sure that a new task is not accepted until media is collected
        //and uploaded to the api
        this.waiting_for_photo_success = true;
        this.waiting_for_artifact_upload = true;

        process.on('uncaughtException', function(err) {
            console.log(err + "\n" + err.stack);
        });

    },

    // this is used to track whether serial is failing over and over
    // and exit node. the startup scripts then relaunch node

    // sets the state of the robot based on the activity space received from the api

    // reset the command buffer, load in the new data, and start drawing
    // if the robot is not ready to draw, we keep trying every second until it is ready 
    // when the drawing is complete, the turntable will move, and the resultant event
    // 'readyToStartDrawing' will trigger the check for more offers
    loadLinesAndStartDrawing: function(imageProcessingManager) {
        if (this.robotIsReady) {
            this.waitingForRobotCount = 0;
            // setting this.robotIsReady to 'false' because
            // once the robot has begun drawing, it is nolonger ready to start drawing
            // until the command loader has generated a 'readyToStartDrawing' event
            this.robotIsReady = false;

            // if we are configured to capture a photo then prepare for that action to happen later on
            this.prepareForArtifactRecordingAndUpload(imageProcessingManager);

            this.setCurrentDrawingArtifactData(this.getNextDrawingArtifactData());
            //once the commands are ready, the robot will have an accurate estimate
            this.drawMachineCommandLoader.once('timeEstimate', function(timeEstimate) {
                this.progressUpdateActiveTask(timeEstimate);
            }.bind(this));
            console.log("** Resetting the robot's command buffer, loading the lines, and starting the drawing. **");
            this.drawMachineCommandLoader.startDrawing();
        } else {
            console.log("Waiting for robot to be ready to draw..." + (this.waitingForRobotCount > 10 ? ' (is the draw machine connected to the computer and powered on?)' : ''));
            this.waitingForRobotCount++;
            this.loadLinesAndStartDrawing.delay(1000, this);
        }
    },

    // prepare for when the robot is ready to draw again
    // when the drawing is complete, we can stop the task and start
    // asking for a new offer. the new offer will not actually be drawn until the
    // robot is ready, signaled by the drawMachineCommandLoader's 'readyToStartDrawing' event
    prepareForDrawingCompletion: function() {

        this.drawMachineCommandLoader.once('drawingComplete', function() {
            try {
                if (this.taskIsActive) {
                    console.log("Going to wait for media to finish capturing (video and photo) and then stop the task.");
                    //if a task is active, notify server that we are done
                    this.waitForMediaAndStopTask();
                }
            } catch (err) {
                console.log("No task active. It is not safe to check for new tasks.");
            }
        }.bind(this));
    },

    // this waits for the media to caputure and then upload before it stops the active task
    // stopping the active task causes the robot to check the api for new drawings
    waitForMediaAndStopTask: function() {
        //if (this.waiting_for_video_success || this.waiting_for_photo_success){
        if (this.waiting_for_artifact_upload) {
            console.log("Not yet ready to stop. Video and photo have not completed uploading. Trying again...");
            //            console.log("Waiting for video? "+this.waiting_for_video_success);
            //            console.log("Waiting for photo? "+this.waiting_for_photo_success);
            console.log("Waiting for artifact upload? " + this.waiting_for_artifact_upload);
            this.waitForMediaAndStopTask.delay(ConfigParams.TASK_STOP_DELAY, this);
        } else {
            console.log("Notifying server that we can stop this task.");
            this.stopActiveTask(1);
        }
    },

    // currently this method does not do anything. This is because there are currently no events generated during the drawing that indicate a failure
    prepareForDrawingFailure: function() {
        // can do something here in case the robot fails to draw
    },

    // once the task is stopped, start checking for new drawings
    prepareForTaskStop: function() {
        // avoid any unknown situation in which more than one event listener
        // could respond to the event.
        this.removeAllListeners('taskStopped');
        this.once('taskStopped', function() {
            console.log("Task was successfully stopped. Checking for new drawings.");
            this.startCheckingForNewDrawing(0);
        }.bind(this));
    },

    prepareForArtifactRecordingAndUpload: function(imageProcessingManager) {
        // prepare flags so that task can stop only after media is succesfully captured
        this.waiting_for_photo_success = true;
        this.waiting_for_artifact_upload = true;

        // make sure that these do not contain old values
        // better to fail than to put the wrong values in

        // and when it is finished drawing, but not yet calibrated, with an event
        this.drawMachineCommandLoader.once('drawingComplete', function() {
            if (this.getCurrentDrawingArtifactData()) this.getCurrentDrawingArtifactData().drawingCompleteTime = (new Date()).getTime() / 1000;
        }.bind(this));

        this.drawMachineCommandLoader.removeAllListeners('readyForPicture');
        this.drawMachineCommandLoader.once('readyForPicture', function() {
            console.log("Drawing is ready for picture, taking picture...");
            //only stop video if the robot is responsible for the capture
            //otherwise, the render queue will get the still and video from a
            //streamer process that runs outside node.

            // if either the CAPTURE_AND_UPLOAD_MEDIA config setting is true or we are using the special "NoMachine" draw machine
            // then 
            if (!ConfigParams.CAPTURE_AND_UPLOAD_MEDIA || (ConfigParams.DRAW_MACHINE_TYPE == 'NoMachine')) {
                this.waiting_for_artifact_upload = false;
            } else {
                this.takeArtifactPhoto();
                this.removeAllListeners('tookPhoto');
                // generated when the photo process returns
                this.once('tookPhoto', function(imagePath) {
                    this.postArtifact(imagePath, imageProcessingManager);
                    this.waiting_for_artifact_upload = false;
                }.bind(this));
            }

        }.bind(this));

        //only take photo if the robot is responsible for the capture
        //otherwise, the render queue will get the still and video from a
        //streamer process that runs outside node.

        this.drawMachineCommandLoader.on('readyForHomeTimestamp', function() {
            if (this.getCurrentDrawingArtifactData() != null) this.getCurrentDrawingArtifactData().homeTime = (new Date()).getTime() / 1000;
        }.bind(this));
    },

    // posts the finished drawing photo
    postArtifact: function(imagePath, imageProcessingManager) {
        //TODO - upload the photo to the server and update the task payload

    },



    //at the end of the drawing, a photo is taken of the result
    takeArtifactPhoto: function() {
        console.log("##### Taking artifact photo.");

        var imagePath = path.join(ConfigParams.WORK_OUTPUT_WATCH_PATH, 'artifact.jpg');
        newProcess = spawn('./bin/imageSnap', [imagePath]);
        newProcess.stdout.on('data', function(data) {
            console.log('takeArtifactPhoto() stdout: ' + data);
        }.bind(this));

        newProcess.stderr.on('data', function(data) {
            console.log('takeArtifactPhoto() stderr: ' + data);
        }.bind(this));

        newProcess.on('exit', function(code) {
            console.log('takeArtifactPhoto() child process exited with code ' + code);
            if (code !== 0) {
                console.log("##### Error taking photo.");
                this.statusUpdate("photo error");
            } else {
                console.log("##### Took photo. Setting photo succes flag to true");
                this.waiting_for_photo_success = false;
                this.emit('tookPhoto', imagePath);
            }
        }.bind(this));
    },


    // Set robotIsReady flag when the 'readyToStartDrawing' event happens. from this point on, any time
    // robotIsReady the robot is ready to draw, the corresponding flag in this class will be set true
    startListeningForReadyRobot: function() {
        // avoid any unknown situation in which more than one event listener
        // could respond to the event.
        this.drawMachineCommandLoader.removeAllListeners('readyToStartDrawing');
        console.log("Starting to listen for when robot is ready to start drawing.");
        this.drawMachineCommandLoader.on('readyToStartDrawing', function() {
            console.log("Robot is prepared to start drawing. " + (new Date()));
            // this was set to 'false' in loadLinesAndStartDrawing because
            // once the robot has begun drawing, it is nolonger ready to start drawing
            // until the command loader has generated a 'readyToStartDrawing' event
            this.robotIsReady = true;
        }.bind(this));
    },

    // prepare the robot for drawing and start checking for drawings
    // the drawing will not start until drawMachineCommandLoader emits
    // the 'readyToStartDrawing' event. from this point on, any time
    // the robot is ready to draw, the corresponding flag in this class will be set true
    prepareRobotAndStartCheckingForDrawings: function() {
        // just to be safe, set this to false, so that it cannot draw until
        // the robot is ready
        this.robotIsReady = false;
        this.startListeningForReadyRobot();

        // prepare the bot. once the robot is connected to the draw machine
        // prepare it for the drawing
        // avoid any unknown situation in which more than one event listener
        // could respond to the event.
        this.drawMachineCommandLoader.removeAllListeners('robotConnectedToMotionController');
        this.drawMachineCommandLoader.once('robotConnectedToMotionController',
            this.drawMachineCommandLoader.prepareRobotForFirstDrawing);

        this.drawMachineCommandLoader.createRobot();

        // start checking for a new offer.
        // the actual drawing will not begin until the robot is ready
        this.startCheckingForNewDrawing(0);
    },

    // puts the data in the master machine code array into a buffer that can be
    // processed and sent to the draw machine
    robotAutoLoadLines: function() {
        var lines = this.masterDataParser.MASTER_MACHINE_CODE;
        var line_count = lines.length;
        loadingLineIndex = 1;
        this.linesToLoad = [];
        for (var i = 0; i < line_count; i++) {
            line_args = lines[i].split(",");
            if (line_args.length == 6) {
                var type = 0;
                this.drawMachineCommandLoader.fillBufferSlot(type, line_args[0], line_args[1], line_args[2], line_args[3], line_args[4], line_args[5], 0, 0, 0, 0);
            } else if (line_args.length == 8) {
                var type = 1;
                this.drawMachineCommandLoader.fillBufferSlot(type, line_args[0], line_args[1], line_args[2], line_args[3], line_args[4], line_args[5], line_args[6], line_args[7], 0, 0);
            } else if (line_args.length == 10) {
                var type = 2;
                this.drawMachineCommandLoader.fillBufferSlot(type, line_args[0], line_args[1], line_args[2], line_args[3], line_args[4], line_args[5], line_args[6], line_args[7], line_args[8], line_args[9]);
            }

        }
    },

    // start checking the API for a new offer. wait the specified number of milliseconds
    // before checking, so that the rate of checking can be controlled.
    // if RobotControl is already checking for a drawing, then no check will be made.
    startCheckingForNewDrawing: function(delay) {
        if (!this.checkingForNewDrawing) {
            this.checkingForNewDrawing = true;
            if (delay > 0) {
                console.log("Checking server for new drawing task offers in " + delay + "ms");
                this.autoLoadNextFromServerAndDraw.delay(delay, this);
            } else {
                console.log("Checking server for new drawing task offers now!");
                this.autoLoadNextFromServerAndDraw();
            }
            //}else{
            //    console.log("Detected attempt to request multiple new drawings at the same time");
        }
    },

    // once a request for an offer has been made by autoLoadNextFromServerAndDraw()
    // this method handles the server response.
    // no validation is performed on the data structure returned by the server.
    // if an offer is available, the photo URL in the LDC is checked for null
    // handleAcceptResponse() handles the response when a task is accepted
    // if no task is accepted, the periodic offer check is resumed
    handleOfferResponse: function(returnjson) {
        var parsedReturnJSON;
        try {
            parsedReturnJSON = JSON.parse(returnjson);
        } catch (err) {
            console.log("Error parsing the json response: " + err.message);
            console.log(returnjson);
        }

        // a null result from the server indicates that there are no tasks on offer
        if (parsedReturnJSON == undefined || parsedReturnJSON.result == null) {
            console.log("No new drawing tasks were offered by the server");
            console.log("Will resume checking for offers");
            this.noOffer();
        } else {
            // a non null result is assumed to be a valid response with a task in it.
            console.log("The server responded with a drawing task offer. Checking if this robot can fulfil the offer...");

            console.log("The offered task has an ID of " + parsedReturnJSON.result.id + " and a state of " + parsedReturnJSON.result.state);
            if (parsedReturnJSON.result.state != "ASSIGNMENT_OFFERED" && parsedReturnJSON.result.state != "ASSIGNMENT_REMINDER_OFFERED")
                console.log("WARNING: Expected to receive a task with state ASSIGNMENT_OFFERED or ASSIGNMENT_REMINDER_OFFERED (got " + parsedReturnJSON.result.state + " instead).");

            this.taskIsBad = false;
            try {
                //start off assuming no lab tag id is in the payload. this means that there should be
                //no artifacts created
                this.setNextDrawingArtifactData(null);

                //then, if there is a tag id, create the artifact data object and populate it partially
                //with what data is known now. the rest will come after the robot is done drawing
                this.candidateDrawingPayload = parsedReturnJSON.result.payload;

                this.acceptedPhotoUrl = parsedReturnJSON.result.payload.photo_url;
                if ((this.acceptedPhotoUrl == undefined)) {
                    this.taskIsBad = true;
                    console.log("Warning! Bad photo url. Skipping this task.");
                }

            } catch (err) {
                console.log("There was an error getting the photo URL, tag id, or tag country from the LDC.");
                console.dir(err);
                console.log("The task on offer is not usable and needs to be stopped.");
                console.log("Accepting task and then stoping it.");
                //this flag will be checked once the task is accepted
                //and then the task will be rejected
                this.taskIsBad = true;
            }

            console.log("Now accepting the task at hand.");
            var accept_id = parsedReturnJSON.result.id;
            console.log("Done parsing offer response, got id: " + accept_id);
            this.estimatedStopTime = ConfigParams.MAX_DRAW_TIME * 60 + ((new Date()).getTime() / 1000);
            console.log("estimated stop: " + this.estimatedStopTime);
            var accept_post_data = querystring.stringify({
                'est_stop_at': this.estimatedStopTime,
                'assignee_guid': '"' + this.workerGUID + '"'
            });
            var accept_post_options = {
                host: this.LABQUEUE_HOSTNAME,
                port: this.LABQUEUE_PORT,
                path: this.DRAWING_TASKS_PATH + accept_id + "/do/accept",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': accept_post_data.length
                },
                method: 'POST',
            };

            // once the task has been accepted, the server will send back a response
            // prepare the reaction to the response to the acceptance post.
            var accept_post_req = labqueueClient.request(accept_post_options, function(res) {
                console.log("Response from accepting task was received");
                if (res.statusCode >= 400) {
                    console.log("Got " + res.statusCode + " error from server. Will stop accepting this offer and go back to checking for offers.");
                    this.noOffer();
                    return;
                }
                res.setEncoding('utf8');
                var chunks = "";
                res.on('data', function(chunk) {
                    chunks += chunk;
                }.bind(this));
                res.on('end', function() {
                    this.handleAcceptResponse(chunks, accept_id);
                }.bind(this));
            }.bind(this));
            accept_post_req.on('error', function(e) {
                console.log("There was a problem sending the acceptance request." + e.message);
                console.log("Going back to checking for offers.");
                this.noOffer();
            });
            console.log("sending accept post");
            accept_post_req.write(accept_post_data);
            accept_post_req.end();

        }
    },

    // this runs if there is no offer available from the api
    noOffer: function() {
        // this.checkingForNewDrawing was set to true in 
        // startCheckingForNewDrawing() at the beginning of the current
        // API checking sequence. since we are done with this check, 
        // it should now be set to 'false'
        this.checkingForNewDrawing = false;
        this.startCheckingForNewDrawing(ConfigParams.DRAWING_CHECK_DELAY);
    },

    // when the api returns an activity space, this parses it out and calls
    // autoLoadNextFromServerAndDraw() to load a drawing if avaialble
    // if for some strange reason there is no activity space in the response,
    // the robot will start checking again


    // when the response comes back after accepting a task from the api
    // this method 
    handleAcceptResponse: function(chunks, accept_id) {
        try {
            var accept_response = JSON.parse(chunks);
            if (!accept_response.status.is_error) {
                this.taskIsActive = true;
                this.acceptedDrawingPayload = this.candidateDrawingPayload;
                this.acceptedDrawingTaskID = accept_id; //save this for later when we will be stopping the task
                console.log("Success accepting task. checking photo url and drawing");

                // this.checkingForNewDrawing was set to true in 
                // startCheckingForNewDrawing() at the beginning of the current
                // API checking sequence. since we are done with this check, 
                // it should now be set to 'false'
                this.checkingForNewDrawing = false;

                if (!this.taskIsBad) {
                    this.findPathsAndDraw(this.acceptedPhotoUrl);
                } else {
                    console.log("Task is bad. Stopping task and checking queue.");
                    this.prepareForTaskStop();
                    this.stopActiveTask(0);
                }
            } else {
                console.log("Failed to accept task. Response status is error.");
                console.dir(accept_response);
                // this.acceptedDrawingTaskID = accept_id; //save this for later when we will be stopping the task
                //                this.stopActiveTask(0);
            }
        } catch (err) {
            // if there was an error parsing the server response, then the program will
            // go back to checking for drawings. it is not possible to stop the task
            // because no ID is available in the response.
            console.log("Failed to decode the server response while attempting to accept the offered task:\n" + err.message + "\nReturning to periodic offer checking.");
            this.checkingForNewDrawing = false;
            this.startCheckingForNewDrawing(0);
        }
    },

    /**
     * a general-purpose request handling function, for x-www-form-urlencoded data
     *
     */
    makeLabqueueJSONRequest: function(method, URLPath, contentType, contentData, onResponseEndCallback, onErrorCallback) {
        var options = {
            host: this.LABQUEUE_HOSTNAME,
            port: this.LABQUEUE_PORT,
            path: URLPath,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contentData.length
            },
            method: method
        };
        var req = labqueueClient.request(options, function(res) {
            if (res.statusCode >= 400) {
                return onErrorCallback(res);
            }
            var chunks = "";
            res.on('data', function(chunk) {
                chunks += chunk;
            }.bind(this));
            res.once('end', function() {
                try {
                    var responseObj = JSON.parse(chunks);
                    onResponseEndCallback(responseObj)
                } catch (err) {
                    onErrorCallback(err);
                }
            }.bind(this));
        }.bind(this));
        req.once('error', onErrorCallback);
        req.write(contentData);
        req.end();
        return req;
    },

    saveAndPostAlternateDrawingRepresentationErrorHandler: function(err) {
        console.dir(err);
        //console.log('There was a problem sending the POST request for the '+fileExtension.toUpperCase()+' export of line drawing: '+err + ' (in '+URLPath+')');
    },

    saveAndPostAlternateDrawingRepresentation: function(contentType, fileExtension, fn, representationData, payloadURLKey, onComplete) {
        console.log("Done creating " + fileExtension.toUpperCase() + ' export of line drawing, storing local copy as ' + fn);
        require('fs').writeFile(fn, representationData);

        var URLPath = '';

        //
        // create a data container in the bin
        //
        URLPath = this.BIN_PATH;
        var req = this.makeLabqueueJSONRequest('POST', URLPath, null,
            querystring.stringify({
                'worker_guid': '"' + this.workerGUID + '"',
                'content_type': '"' + contentType + '"',
            }),
            function(response) {
                req.removeAllListeners();
                // once the container is created, POST the actual data into that container
                if (!response.hasOwnProperty('result') || !response.result.hasOwnProperty('big_data_upload_url')) return this.saveAndPostAlternateDrawingRepresentationErrorHandler('Invalid response from server when attempting to create new drawing data container.');

                //next part is best handled by Restler
                var uploader = restler.post(response.result.big_data_upload_url, {
                    multipart: true,
                    data: {
                        'content': restler.file(fn, null, representationData.length, null, contentType),
                    }
                });
                uploader.once('error', this.saveAndPostAlternateDrawingRepresentationErrorHandler);
                uploader.once('fail', this.saveAndPostAlternateDrawingRepresentationErrorHandler);
                uploader.once('success',
                    function(response) {
                        uploader.removeAllListeners();

                        // then update the task payload and store that on the server
                        if (!response.hasOwnProperty('result') || !response.result.hasOwnProperty('content_url')) return this.saveAndPostAlternateDrawingRepresentationErrorHandler('Invalid response from server when attempting to store drawing source data.');

                        // add the content URL to the task payload
                        this.acceptedDrawingPayload[payloadURLKey] = response.result.content_url;

                        // and then store the updated payload on the server
                        URLPath = this.DRAWING_TASKS_PATH + this.acceptedDrawingTaskID + "/do/progress";
                        req = this.makeLabqueueJSONRequest('POST', URLPath, null,
                            querystring.stringify({
                                'progress_message': '"Added ' + fileExtension.toUpperCase() + ' preview of drawing"',
                                'est_stop_at': this.estimatedStopTime,
                                'assignee_guid': '"' + this.workerGUID + '"',
                                'progress_payload': JSON.stringify(this.acceptedDrawingPayload),
                            }),
                            function(response) {
                                req.removeAllListeners();
                                // all done
                                console.log('Updated task payload to include ' + payloadURLKey + ' of ' + this.acceptedDrawingPayload[payloadURLKey]);
                                if (onComplete != null) onComplete();
                            }.bind(this),
                            this.saveAndPostAlternateDrawingRepresentationErrorHandler
                        );
                    }.bind(this)
                );
            }.bind(this),
            this.saveAndPostAlternateDrawingRepresentationErrorHandler
        );
    },

    findPathsAndDraw: function(url) {

        // the task could be stopped if the payload is invalid, various other errors in communication
        // or simply if the drawing completes successfully
        console.log("prepareForTaskStop()");
        this.prepareForTaskStop();

        console.log("Creating an ImageProcessingManager to download and process the drawing task's source image");
        //the image processor will handle converting the image into bezier curves
        var newImageProcessingManager = new ImageProcessingManager();

        //this will make the sand drawing match the orientation of the line drawing
        newImageProcessingManager.setHorizontalBezierFlip(true); //this.activitySpace=='lon');

        console.log("Processing image from " + url);
        newImageProcessingManager.downloadAndProcessImage(url);
        newImageProcessingManager.once('processComplete', function(prog_str, imageProcessingManager) {
            console.log("Done processing image");

            //
            // now we need to spin off various other representations of the drawing
            //
            // currently we support PNG, G-code and SVG
            //

            var data;

            //PNG output
            this.saveAndPostAlternateDrawingRepresentation(
                'image/png',
                'png',
                path.join(ConfigParams.WORK_OUTPUT_WATCH_PATH, 'drawing.png'),
                new Buffer(imageProcessingManager.getBitmapRepresentation(ConfigParams.PNG_CONVERSION_PATH_COLOR, 500).replace(/^data:image\/png;base64,/, ""), 'base64'),
                'drawing_preview_png',
                function() {
                    //g-code output
                    this.saveAndPostAlternateDrawingRepresentation(
                        'text/plain',
                        'gcode',
                        path.join(ConfigParams.WORK_OUTPUT_WATCH_PATH, 'drawing.gcode'),
                        imageProcessingManager.getGCodeRepresentation(),
                        'drawing_preview_gcode',
                        function() {
                            //SVG output
                            this.saveAndPostAlternateDrawingRepresentation(
                                'image/svg+xml',
                                'svg',
                                path.join(ConfigParams.WORK_OUTPUT_WATCH_PATH, 'drawing.svg'),
                                imageProcessingManager.getSVGRepresentation(ConfigParams.SVG_CONVERSION_PATH_COLOR, 500),
                                'drawing_preview_svg',
                                null
                            );
                        }.bind(this)
                    );
                }.bind(this)
            );

            //
            // now we need to prepare everything for the robot
            // then start drawing
            //

            //when the image processor finishes finding the curves, it generates this event
            //and it passes in the resulting curves
            console.log("Parsing data for robot");
            //the curves are loaded into the data parser to be converted to the tool paths
            this.masterDataParser.MASTER_DATA_RAW['pre_machine_code'] = prog_str;
            console.log("parseMasterData()");
            //now the parser will convert the curves into tool paths
            //first the data parser converts the strings into javascript objects
            this.masterDataParser.parseMasterData();
            console.log("computeDistances()");
            //then the parser finds the distance between successive points
            this.masterDataParser.computeDistances();
            console.log("computeMasterMachineCode()");
            //then it finishes generating 3d paths from the 2d curves
            this.masterDataParser.computeMasterMachineCode();
            console.log("Master Data Length " + this.masterDataParser.MASTER_DATA.length);
            //next the robot command buffer is reset so that a new drawing can be loaded in
            //based on the paths parsed by the data parser
            this.drawMachineCommandLoader.resetCommandBuffer();
            console.log("robotAutoLoadLines()");
            this.robotAutoLoadLines();

            // in loadLinesAndStartDrawing(), the "next" artifact data is made "current"
            // and the robot is prepared for artifact recording if necessary
            // it is done in that function rather than here because the robot may still be
            // homing after the last drawing when this function is called, which could fire
            // the artifact recording event listeners prematurely.
            console.log("loadLinesAndStartDrawing()");
            this.loadLinesAndStartDrawing(newImageProcessingManager);
            console.log("prepareForDrawingCompletion()");
            // this method sets up the event listeners that will handle the completion of a drawing
            this.prepareForDrawingCompletion();
            console.log("prepareForDrawingFailure()");
            // this method sets up event listeners that will handle problems that happen during the drawing.
            this.prepareForDrawingFailure();

        }.bind(this));
    },

    // this method tells the api that the accepted task has stopped. This includes a flag indicating
    // wheather it was successfully completed. if the api server responds with an error, then more 
    // attempts are made until there is nolonger an error. this continues indefinitely until the api is 
    // available because there is nothing that the robot can or should do other than retry if there is
    // a failure.
    stopActiveTask: function(success) {
        var data = querystring.stringify({
            'stop_message': '"OK"',
            'success': success ? '1' : '0',
            'assignee_guid': '"' + this.workerGUID + '"',
        });
        var options = {
            host: this.LABQUEUE_HOSTNAME,
            port: this.LABQUEUE_PORT,
            path: this.DRAWING_TASKS_PATH + this.acceptedDrawingTaskID + "/do/stop",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            },
            method: 'POST',
        };

        var req = labqueueClient.request(options, function(res) {
            //console.log("Got Response.");
            if (res.statusCode >= 400) {
                console.log("Got " + res.statusCode + " error from sever. Will attempt to stop task again.");
                this.stopActiveTask(success);
                return;
            }
            res.setEncoding('utf8');
            var chunks = "";
            res.on('data', function(chunk) {
                chunks += chunk;
            }.bind(this));
            res.on('end', function() {
                var stop_response = JSON.parse(chunks);

                console.log(this.DRAWING_TASKS_PATH + this.acceptedDrawingTaskID + "/do/stop");
                console.log(stop_response.status.is_error);

                if (!stop_response.status.is_error) {
                    console.log("Stopped active task " + this.acceptedDrawingTaskID);
                    this.taskIsActive = false;
                    // once the task has been successfully stopped, the robot can check the activity
                    // space and then check for more tasks.
                    this.emit('taskStopped');
                } else {
                    console.log("Failed to stop task. It is not safe to start a new drawing." + this.acceptedDrawingTaskID);
                    console.log(stop_response);
                }
            }.bind(this));
        }.bind(this));

        req.on('error', function(e) {
            console.log("There was a problem sending the stop request: " + e.message);
        }.bind(this));
        req.write(data);
        req.end();
    },

    //update the api on how long the job will probably take
    progressUpdateActiveTask: function(timeEstimate) {
        var message = 'OK';
        this.estimatedStopTime = timeEstimate;
        var data = querystring.stringify({
            'progress_message': '"' + message + '"',
            'est_stop_at': this.estimatedStopTime,
            'assignee_guid': '"' + this.workerGUID + '"',
        });
        var options = {
            host: this.LABQUEUE_HOSTNAME,
            port: this.LABQUEUE_PORT,
            path: this.DRAWING_TASKS_PATH + this.acceptedDrawingTaskID + "/do/progress",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            },
            method: 'POST',
        };

        var req = labqueueClient.request(options, function(res) {
            //console.log("Got Response.");
            res.setEncoding('utf8');
            var chunks = "";
            res.on('data', function(chunk) {
                chunks += chunk;
            }.bind(this));
            res.on('end', function() {
                try {
                    var stop_response = JSON.parse(chunks);

                    console.log(this.DRAWING_TASKS_PATH + this.acceptedDrawingTaskID + "/do/progress");
                    console.log("response.status.is_error: " + stop_response.status.is_error);

                    if (!stop_response.status.is_error) {
                        console.log("Progress update on active task " + this.acceptedDrawingTaskID + " sent: " + message);
                    } else {
                        console.log("Failed to send progress update." + this.acceptedDrawingTaskID);
                    }
                } catch (e) {
                    console.log("Failed to send progress update due to exception." + e);
                }
            }.bind(this));
        }.bind(this));

        req.on('error', function(e) {
            console.log("There was a problem sending the progress update: " + e.message);
        }.bind(this));
        req.write(data);
        req.end();
    },

    //tell the api how a task is doing. the message passed in will go to the api
    statusUpdateActiveTask: function(message) {
        var data = 'message=' + JSON.stringify(message);
        var options = {
            host: this.LABQUEUE_HOSTNAME,
            port: this.LABQUEUE_PORT,
            path: this.STATUS_PATH,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            },
            method: 'POST',
        };

        var req = labqueueClient.request(options, function(res) {
            //console.log("Got Response.");
            res.setEncoding('utf8');
            var chunks = "";
            res.on('data', function(chunk) {
                chunks += chunk;
            }.bind(this));
            res.on('end', function() {
                try {
                    var response = JSON.parse(chunks);

                    console.log(this.STATUS_PATH);
                    console.log(response.status.is_error);

                    if (!response.status.is_error) {
                        console.log("Status update sent: " + message);
                    } else {
                        console.log("Failed to send status update: " + message);
                    }
                } catch (e) {
                    console.log("Failed to send status update due to exception.");
                    console.log(e);
                }
            }.bind(this));
        }.bind(this));

        req.on('error', function(e) {
            console.log("There was a problem sending the progress update.");
            console.log(e);
        }.bind(this));
        req.write(data);
        req.end();
    },


    // check the server for any available offers.
    // we attach handleOfferResponse() to the response from the server to
    // determine if there is an offer available and to process it if so
    autoLoadNextFromServerAndDraw: function() {
        //console.log("autoLoadNextFromServerAndDraw()");
        try {

            var options = {
                host: this.LABQUEUE_HOSTNAME,
                port: this.LABQUEUE_PORT,
                path: encodeURI(this.GET_NEXT_DRAWING_PATH + '?assignee_guid="' + this.workerGUID + '"'),
                method: 'GET',
            };
            console.log("==============================================================");
            console.log("Checking server for a new drawing task offer...");
            var req = labqueueClient.request(options, function(res) {
                //console.log("Got Response.");
                if (res.statusCode >= 400) {
                    console.log("Got " + res.statusCode + " error when requesting a new drawing task offer. Will skip offer attempt.");
                    this.offerError();
                    return;
                }
                res.setEncoding('utf8');
                var chunks = "";
                res.on('data', function(chunk) {
                    chunks += chunk;
                }.bind(this));
                res.on('end', function() {
                    this.handleOfferResponse(chunks);
                }.bind(this));
            }.bind(this));

            req.on('error', function(e) {
                var msg = "" + e.message;
                if (msg == "connect ECONNREFUSED") msg += " - Check that ConfigParams.LABQUEUE_HOSTNAME and ConfigParams.LABQUEUE_PORT are correct, and that the labqueue server is running in App Engine Launcher.";
                console.log("Request for drawing task offers failed: " + msg);
                this.offerError();
            }.bind(this));
            req.end();

        } catch (err) {
            console.log("Request for drawing task offers failed: " + err);
            this.startCheckingForNewDrawing(ConfigParams.DRAWING_CHECK_DELAY);
        }
    },

    // if there was an error communicating with the server, requests should be
    // made until the server is finally reached. in this way, the system should
    // be made robust to network outages
    offerError: function() {
        //console.log("Trying again...");
        this.checkingForNewDrawing = false;
        this.startCheckingForNewDrawing(ConfigParams.DRAWING_CHECK_DELAY);
    },

    // check the server for current activity space. this determines whether the next job comes from the
    // website or from the museum,


    getCurrentDrawingArtifactData: function() {
        console.log("***currentDrawingArtifactData: " + this.currentDrawingArtifactData);
        return this.currentDrawingArtifactData;
    },

    getNextDrawingArtifactData: function() {
        console.log("***nextDrawingArtifactData: " + this.nextDrawingArtifactData);
        return this.nextDrawingArtifactData;
    },

    setCurrentDrawingArtifactData: function(value) {
        console.log("***currentDrawingArtifactData: " + this.currentDrawingArtifactData);
        this.currentDrawingArtifactData = value;
    },

    setNextDrawingArtifactData: function(value) {
        console.log("***nextDrawingArtifactData: " + this.nextDrawingArtifactData);
        this.nextDrawingArtifactData = value;
    },

});


//The code here lets this class run from the command line when node is invoked with RobotControl.js
//as an argument. There are other arguments that tell RobotControl where to find drawings, etc
var RobotControl = exports.RobotControl;
var configParamChanges = null;
// The default configuration parameters can be overridden by a config file specified
// as the third argument on the command line
var rc = new RobotControl();
rc.prepareRobotAndStartCheckingForDrawings();
