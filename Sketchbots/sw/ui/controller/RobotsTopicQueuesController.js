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
// constants
var LOCAL = 'lon';
var TOPICS_LIST_URL = '/api/topics';
var TOPIC_URL_BASE = TOPICS_LIST_URL + '/';
var TOPIC_COMPLETED_TASKS_URL_SUFFIX = '/successful_tasks?num=50';
var TOPIC_WAITING_TASKS_URL_SUFFIX = '/waiting_tasks';
var TOPIC_WORKING_TASKS_URL_SUFFIX = '/working_tasks';
var TASK_CREATE_URL_PREFIX = '/tasks';
var TASK_REJECT_URL_PREFIX = '/tasks/';
var TASK_REJECT_URL_SUFFIX = '/do/reject';
var ANONYMOUS_WEB_USER_WORKER_GUID = 'www.openweblab';
var BIN_URL_BASE = '/api/bin';

var IGNORE_OLD_WORKING_TASKS = false;

// globals

// class
/**
 * The RobotsTopicQueuesController is a complete UI widget which allows interaction with
 * queues from the labqueue server. Each queue has a topic, thus the name of the class.
 *
 * This class encapsulates all of the REST communication with the labqueue server.
 * It can be used "headless" as a way to work with the server simply by passing a null
 * UIContainer to the initialize() method.
 *
 * Instances of this class fire the following events:
 *      RobotsMainControllerEvents.SET_USER_MESSAGE
 *      RobotsMainControllerEvents.WEB_CAM_CAPTURE_REQUESTED (fired when the user asks for a new web cam drawing)
 *      RobotsMainControllerEvents.FILE_UPLOAD_REQUESTED (fired when the user asks for a new drawing from a file)
 *
 */
var RobotsTopicQueuesController = new Class({
    Implements: [Events],

    _UIContainer: null,
    _listsContainer: null,

    _topicNames: [],


    /**
     * sets up the topic queue controller
     *
     * @param UIContainer a mootools Element in which this controller's UI should be placed. If null, then the class will operate in a "headless" mode.
     *
     */
    initialize: function(UIContainer) {
        RobotsTopicQueuesController._setUserMessage = function(msg) {
            document.fireEvent(RobotsMainControllerEvents.SET_USER_MESSAGE, msg);
        };
        this._UIContainer = UIContainer;
        if (this._UIContainer == null) this._UIContainer = new Element('div'); //the user wants this to operate headlessly -- so do NOT inject this element into the DOM

        // a container to hold all of our list elements, one for each topic on the server
        this._listsContainer = new Element('div').inject(this._UIContainer);

        // build the UIs for each individual queue (note that this is an asynchronous call because it requires a round trip to the server)
        this._asyncBuildQueueTopicUIs();

    },

    /**
     * Refreshes this part of the UI with current data. You should periodically call this method.
     * It will not automatically refresh on its own.
     *
     */
    refresh: function() {
        // refresh COMPLETED tasks
        this._refreshQueueListByURL('completed', _('COMPLETED_TASKS_LIST_TITLE'), TOPIC_COMPLETED_TASKS_URL_SUFFIX);

        // refresh WORKING tasks
        this._refreshQueueListByURL('working', _('WORKING_TASKS_LIST_TITLE'), TOPIC_WORKING_TASKS_URL_SUFFIX);

        // refresh WAITING tasks
        this._refreshQueueListByURL('waiting', _('WAITING_TASKS_LIST_TITLE'), TOPIC_WAITING_TASKS_URL_SUFFIX);
    },


    /**
     * attempts to create a new drawing in a particular queue based on a supplied data URL
     *
     * @param topicName a String indicating the topic of the queue in which to create the new drawing
     * @param aURL an String data URL  which contains the image on which to base the new drawing
     *
     */
    createDrawingTask: function(topicName, aURL) {
        console.log('Creating a new task in the ' + topicName + ' queue');

        //
        // Creating a new drawing is a three-step process.
        //
        // First, we POST to the /api/bin area on the labqueue server.
        // When that is complete, the server will give us a unique URL
        // where we can send the actual image data.
        //
        // Second, we POST the actual image data.
        //
        // Third, we POST a new task into a drawing queue which
        // tells the server which bin object to use as the source image.
        //

        // parse the data URL a bit
        var dataURL = new DataURL(aURL);

        console.log("MIME type = " + dataURL.getFullMIMEType());

        // POST to create a container for data on the server
        var contentType = dataURL.getFullMIMEType();
        if (!contentType || contentType == '') contentType = 'application/octet-stream'; // when in doubt, go big
        var data = {
            'worker_guid': JSON.stringify(ANONYMOUS_WEB_USER_WORKER_GUID),
            'content_type': JSON.stringify(contentType),
        };
        r = new SignedJSONRequest({
            app_key: CONFIG.app_key,
            app_secret: CONFIG.sec,
            url: CONFIG.api_base + BIN_URL_BASE,

            onSuccess: function(response) {
                // check the response for correctness
                if (!response.hasOwnProperty('result') || !response.result.hasOwnProperty('big_data_upload_url')) {
                    console.error('RobotsTopicQueuesController.createDrawingTask: Invalid response from server when attempting to create new drawing data container.');
                    return;
                }

                // POST to upload the data into the container
                // we use Request.File (a 3rd party library) here
                // for compatibility with app engine's blobstore upload machinery
                r = new Request.File({
                    method: 'post',
                    url: response.result.big_data_upload_url, //this was given to us in the last server response

                    onSuccess: function(response) {
                        // check the response for correctness
                        // we are using Request.File here which does not decode responses for us, so do that now
                        response = JSON.decode(response);
                        if (!response.hasOwnProperty('result') || !response.result.hasOwnProperty('content_url')) {
                            console.error('RobotsTopicQueuesController.createDrawingTask: Invalid response from server when attempting to store drawing source data.');
                            return;
                        }

                        // If we get here then storing the image worked.
                        // Now, we send our second request to the server. This adds the task to the queue
                        // so that a listening sketchbot knows to process it.
                        //
                        // The URL of the image on the server is in response.result.content_url
                        // We will send this back to the server in a POST request as the
                        // photo_url member of an object called payload
                        //
                        data = {
                            'created_by_guid': JSON.stringify(ANONYMOUS_WEB_USER_WORKER_GUID),
                            'do_not_store_artifact': 'false',
                            'payload': JSON.stringify({
                                'photo_url': response.result.content_url,
                                'photo_content_type': contentType,
                                'photo_container_url': response.result.url,
                            }),
                        };
                        r = new SignedJSONRequest({
                            app_key: CONFIG.app_key,
                            app_secret: CONFIG.sec,
                            url: CONFIG.api_base + TOPIC_URL_BASE + topicName + TASK_CREATE_URL_PREFIX,

                            onSuccess: function(response) {
                                // check the response
                                if (!response.hasOwnProperty('result') || !response.result.hasOwnProperty('url')) {
                                    console.error('RobotsTopicQueuesController.createDrawingTask: Invalid response from server when attempting to store new drawing task.');
                                    return;
                                }

                                // huzzah! we have posted our source file and created a task, next a robot should pick this up
                                // and do something with it
                                console.log("Created task " + this.response.json.result.id);

                            } //onSuccess - part 3

                        }).post(data);

                    } //onSuccess - part 2

                });
                r.append('content', dataURL.getDecodedData());
                r.send();


            } //onSuccess - part 1
        }).post(data);

    },


    /**
     * Attempts to reject a task out of a queue. This will only work if the task has not been
     * started by a sketchbot.
     *
     * @param topicName a String indicating the topic of the task's queue
     * @param topicId a String or Number indicating the unique id of the task to be rejected
     *
     */
    rejectTask: function(topicName, taskId) {
        //reject the task
        console.log('Rejecting task ' + taskId);
        r = new SignedJSONRequest({
            app_key: CONFIG.app_key,
            app_secret: CONFIG.sec,
            url: CONFIG.api_base + TOPIC_URL_BASE + topicName + TASK_REJECT_URL_PREFIX + taskId + TASK_REJECT_URL_SUFFIX,
            task_id: taskId,
            onSuccess: function(response) {
                console.log("Rejected task " + this.options.task_id);
            }
        }).post();
    },

    //
    // private methods
    //

    _asyncBuildQueueTopicUIs: function() {
        // tell the user what is going on
        RobotsTopicQueuesController._setUserMessage(_('LOADING_DRAWING_QUEUES'));

        //First, discover the list of queues by querying the server
        r = new SignedJSONRequest({
            app_key: CONFIG.app_key,
            app_secret: CONFIG.sec,
            url: CONFIG.api_base + TOPICS_LIST_URL,

            onError: function() {
                // try again later
                var delay = 5000;
                console.error("Could not check list of available queue topics from server at " + CONFIG.api_base + TOPICS_LIST_URL + " (retrying in " + delay + " ms)");
                setTimeout(this._asyncBuildQueueTopicUIs.bind(this), delay);
            }.bind(this),

            onSuccess: function(response) {
                // we are expecting a response object which has a result member that should be an Array
                // so we will first check that this is indeed the case. Note the lovely way in which we
                // canonically check the response's "class" in a prototypical language
                if (!response || !response.hasOwnProperty('result') || Object.prototype.toString.call(response.result) !== Object.prototype.toString.call(new Array())) {
                    // the response is not what we expected, so try again later
                    var delay = 5000;
                    console.warn("Unexpected response when receiving list of available queue topics from server at " + CONFIG.api_base + TOPICS_LIST_URL + " (retrying in " + delay + " ms)");
                    setTimeout(this._asyncBuildQueueTopicUIs.bind(this), delay);
                    return;
                }

                // hide the message
                RobotsTopicQueuesController._setUserMessage(_('LABQUEUE_OK'));

                //
                // if we made it here then we are in good shape
                //

                // the result array in the response contains a list of available queue topics
                this._topicNames = response.result;
                console.log("The server has the following queue topics: " + JSON.stringify(this._topicNames));

                // populate the UI for selecting queue topics
                //TODO

                // All lists are held inside a container, so make sure that this
                // exists first (or, if it does exist, make sure it is empty)
                var newListsContianer = new Element('div', {});
                if (this._listsContainer) {
                    newListsContianer.replaces(this._listsContainer);
                } else {
                    newListsContianer.inject(this._UIContainer);
                }
                this._listsContainer = newListsContianer;

                // now set up the UI to stay up-to-date on all the available queues
                for (var t = 0; t < this._topicNames.length; t++) {
                    var container = new Element('div', {
                        id: 'topicQueue_' + this._topicNames[t],
                        'class': 'TopicQueue',
                    }).inject(this._listsContainer);

                    // heading for this queue topic
                    new Element('h3', {
                        'html': this._topicNames[t].replace(/[.\-_]/g, ' '),
                    }).inject(container);

                    //one for upcoming (queued) tasks
                    var listContainer = new Element('div', {
                        'class': 'TaskListWrapper Waiting',
                    }).inject(container);
                    new Element('h4', {
                        'html': _('WAITING_DRAWINGS_TITLE')
                    }).inject(listContainer);

                    // some buttons for adding a task to the queue
                    var tools = new Element('div', {
                        'class': 'ListTools',
                    }).inject(listContainer);

                    // button to add a task using local webcam
                    var addFromWebCam = UIWidgets.getNewButtonElement({
                        'class': 'AddButton WebCam',
                        'text': _('ADD_FROM_WEBCAM_LABEL'),
                    }).inject(tools).addEvent('click', function(e) {
                        this.target.fireEvent(RobotsMainControllerEvents.WEB_CAM_CAPTURE_REQUESTED, this.topicName);
                    }.bind({
                        topicName: this._topicNames[t],
                        target: this,
                    }));

                    // button to add a task by uploading a file
                    var addFromFile = UIWidgets.getNewButtonElement({
                        'class': 'AddButton File',
                        'text': _('ADD_FROM_FILE_LABEL'),
                    }).inject(tools).addEvent('click', function(e) {
                        this.target.fireEvent(RobotsMainControllerEvents.FILE_UPLOAD_REQUESTED, this.topicName);
                    }.bind({
                        topicName: this._topicNames[t],
                        target: this,
                    }));

                    // container for thumbnails of tasks waiting to be worked on by a robot

                    new Element('div', {
                        'class': 'Loading',
                        'html': _('LOADING_DRAWING_QUEUES')
                    }).inject(new Element('div', {
                        'class': 'TaskList Waiting New',
                        'id': 'waiting_taskList_' + this._topicNames[t],
                    }).inject(listContainer));


                    // container for thumbnails of tasks being worked on by a robot
                    var listContainer = new Element('div', {
                        'class': 'TaskListWrapper Working',
                    }).inject(container);
                    new Element('h4', {
                        'html': _('WORKING_DRAWINGS_TITLE')
                    }).inject(listContainer);

                    new Element('div', {
                        'class': 'Loading',
                        'html': _('LOADING_DRAWING_QUEUES')
                    }).inject(new Element('div', {
                        'class': 'TaskList Working New',
                        'id': 'working_taskList_' + this._topicNames[t],
                    }).inject(listContainer));

                    // container for thumbnails of completed tasks
                    var listContainer = new Element('div', {
                        'class': 'TaskListWrapper Completed',
                    }).inject(container);
                    new Element('h4', {
                        'html': _('COMPLETED_DRAWINGS_TITLE')
                    }).inject(listContainer);

                    new Element('div', {
                        'class': 'Loading',
                        'html': _('LOADING_DRAWING_QUEUES')
                    }).inject(new Element('div', {
                        'class': 'TaskList Completed New',
                        'id': 'completed_taskList_' + this._topicNames[t],
                    }).inject(listContainer));
                }
            }.bind(this)
        }).get();

    },

    _refreshQueueListByURL: function(listType, listTitle, urlSuffix) {
        var url;
        for (var topicIdx = 0; topicIdx < this._topicNames.length; topicIdx++) {
            //console.log('Refreshing '+this._topicNames[topicIdx])
            r = new SignedJSONRequest({
                app_key: CONFIG.app_key,
                app_secret: CONFIG.sec,
                url: CONFIG.api_base + TOPIC_URL_BASE + this._topicNames[topicIdx] + urlSuffix,
                topicIdx: topicIdx,
                queueMgr: this,
                listTitle: listTitle,
                listType: listType,

                onSuccess: function(response) {

                    if (!response.hasOwnProperty('result') || !response.result.hasOwnProperty('length')) return; //invalid response object

                    RobotsTopicQueuesController._setUserMessage(null);

                    var topicName = this.options.queueMgr._topicNames[this.options.topicIdx];
                    var taskListId = listType + '_taskList_' + topicName;

                    if (!$(taskListId)) {
                        console.warn('Attempting to update task list for ' + topicName + ' topic, but no DOM container exists for these tasks (should have ID "' + taskListId + '"). Maybe it has not been built yet. Skipping, but will try again later.');
                        return;
                    }

                    newTaskList = $(taskListId);

                    //create a new list of task UIs
                    //console.log(response);

                    // console.log('Populating ' + taskListId + ' with ' + response.result.length + ' task(s)');

                    if (response.result.length > 0) newTaskList.removeClass('New');
                    for (var t = 0; t < response.result.length; t++) {

                        if (response.result[t].hasOwnProperty('state') && (response.result[t].state == 'MOD_REJECTED'))
                            continue; //skip any rejected tasks that happen to end up in the list

                        var taskObjectId = 'task_' + response.result[t].id; //+'_'+taskListId;
                        var existingTaskObject = $(taskObjectId);
                        var taskIsNew = existingTaskObject != false;

                        var now = new Date();
                        var ageSeconds = 0;
                        if ((listType == 'working') && response.result[t].hasOwnProperty('updated_at')) {
                            ageSeconds = Math.round((now.getTime() / 1000) - response.result[t].updated_at);
                        }
                        if (IGNORE_OLD_WORKING_TASKS && (ageSeconds > 60)) continue; //skip old working tasks

                        var rowClass = (Math.floor(t / 2) == (t / 2)) ? 'even' : 'odd';

                        var taskContainer = new Element('div', {
                            'class': 'Task ' + rowClass + ' ' + (taskIsNew ? 'New' : ''),
                            'id': taskObjectId,
                            'data-list-type': listType,
                            //}).inject(newTaskList);
                        });

                        var tools = new Element('div', {
                            'class': 'TaskTools'
                        });

                        UIWidgets.getNewButtonElement({
                            'class': 'RejectButton',
                            'text': _('REJECT_TASK_BUTTON_LABEL'),
                        }).inject(tools).addEvent('click', function(e) {
                            if (confirm('Really remove this drawing task?')) {
                                this.target.rejectTask(this.task.topic_name, this.task.id);
                                e.target.parentNode.parentNode.style.display = 'none';
                            }
                        }.bind({
                            task: response.result[t],
                            target: this.options.queueMgr
                        }));

                        UIWidgets.getNewButtonElement({
                            'class': 'ViewOriginal',
                            'text': _('VIEW_ORIGINAL_BUTTON_LABEL'),
                        }).inject(tools).addEvent('click', function(e) {
                            window.open(this.payload.photo_url);
                        }.bind(response.result[t]));

                        UIWidgets.getNewButtonElement({
                            'class': 'ViewTask',
                            'text': _('VIEW_TASK_BUTTON_LABEL'),
                        }).inject(tools).addEvent('click', function(e) {
                            window.open(this.url);
                        }.bind(response.result[t]));

                        //
                        // add buttons to display different types of alternate outputs
                        //
                        var base = 'drawing_preview_';
                        for (var n in response.result[t].payload) {
                            if (n.substr(0, base.length) == base) {
                                var fileExtension = n.substr(base.length).toUpperCase();
                                UIWidgets.getNewButtonElement({
                                    'class': 'ViewPreview Preview' + fileExtension,
                                    'text': _('VIEW_' + fileExtension + '_PREVIEW_BUTTON_LABEL'),
                                }).inject(tools).addEvent('click', function(e) {
                                    window.open(this);
                                }.bind(response.result[t].payload[n]));
                            }
                        }

                        // add a button and image if an artifact photo is available
                        if (response.result[t].hasOwnProperty('artifact_photo_url')) {
                            UIWidgets.getNewButtonElement({
                                'class': 'ViewFinal',
                                'text': _('VIEW_FINAL_BUTTON_LABEL'),
                            }).inject(tools).addEvent('click', function(e) {
                                window.open(this.payload.artifact_photo_url);
                            }.bind(response.result[t]));
                        }


                        // create a preview image for this task
                        var taskInfoContainer = new Element('div', {
                            'class': 'TaskInfo',
                        }).inject(taskContainer);


                        new Element('div', {
                            'class': 'TaskID',
                            'html': '<label> ' + _('TASK_LABEL') + '</label>' + response.result[t].id
                        }).inject(taskInfoContainer);

                        var taskImage = null,
                            miniImage = null;
                        var taskImageContainer = new Element('div', {
                            'class': 'TaskImage',
                        }).inject(taskInfoContainer);
                        if (response.result[t].payload.photo_content_type.toLowerCase().substr(0, 6) == 'image/') {

                            if (response.result[t].payload.hasOwnProperty('drawing_preview_png')) {
                                taskImage = new Element('img', {
                                    'class': 'Main',
                                    'src': response.result[t].payload.drawing_preview_png
                                }).inject(taskImageContainer);
                                miniImage = new Element('img', {
                                    'class': 'Mini',
                                    'src': response.result[t].payload.photo_url
                                }).inject(taskImageContainer);

                            } else {
                                taskImage = new Element('img', {
                                    'class': 'Main',
                                    'src': response.result[t].payload.photo_url
                                }).inject(taskImageContainer);
                            }

                        } else {
                            if (response.result[t].payload.hasOwnProperty('drawing_preview_png')) {
                                taskImage = new Element('img', {
                                    'class': 'Main',
                                    'src': response.result[t].payload.drawing_preview_png
                                }).inject(taskImageContainer);
                                miniImage = new Element('div', {
                                    'class': 'Mini',
                                    'html': _('GCODE_PREVIEW_TEXT'),
                                }).inject(taskImageContainer);

                            } else {
                                taskPreview = new Element('div', {
                                    'class': 'Main',
                                    'html': _('GCODE_PREVIEW_TEXT'),
                                }).inject(taskImageContainer);
                            }
                        }

                        /*
                        new Element('div',
                        {
                            'class': 'LastUpdate',
                            'html': _('LAST_UPDATE_PREFIX') + ageSeconds + ' sec. ' + _('LAST_UPDATE_SUFFIX'),
                        }).inject(taskInfoContainer);
                        */

                        if (response.result[t].assigned_to)
                            new Element('div', {
                                'class': 'WorkerGUID',
                                'html': _('ASSIGNED_TO_PREFIX') + response.result[t].assigned_to + _('ASSIGNED_TO_SUFFIX'),
                            }).inject(taskInfoContainer);

                        // and, finally, add the tools container
                        tools.inject(taskContainer);

                        var listEnd = (listType == 'completed') ? 'top' : 'bottom';
                        if (existingTaskObject) {
                            if (existingTaskObject.dataset['listType'] != listType) {
                                //task moved from one list to another, remove the old one
                                existingTaskObject.parentNode.removeChild(existingTaskObject);
                                taskContainer.inject(newTaskList, listEnd);
                            } else {
                                //updated task
                                taskContainer.replaces(existingTaskObject);
                            }
                        } else {
                            //new task
                            taskContainer.inject(newTaskList, 'bottom');
                        }


                    } //for each item in the results array

                    //replace the old task list with the new one
                    //newTaskList.replaces($(taskListId));

                } //onSuccess
            }).get();
        } //for each topic
    }, // end of _refreshQueueListByURL


});
