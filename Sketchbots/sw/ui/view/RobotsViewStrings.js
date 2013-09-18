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

//
// strings used in this UI
// to insert a string somewhere, use _('KEY_NAME')
//
var _ = function(key) {
    if (this.hasOwnProperty(key)) return this[key];
    else throw new Error('Invalid string key "' + key + '"');
}.bind({
    'LABQUEUE_OK': 'Successfully connected to labqueue',

    'LOADING_DRAWING_QUEUES': '...',

    'PAGE_TITLE': 'Sketchbots',
    'PAGE_SUBTITLE': 'Exp. 03',

    'ADD_FROM_WEBCAM_LABEL': 'New from Web Cam',
    'ADD_FROM_FILE_LABEL': 'New from File',
    'COMPLETED_TASKS_LIST_TITLE': 'Completed',
    'WORKING_TASKS_LIST_TITLE': 'Current Drawings',
    'WAITING_TASKS_LIST_TITLE': 'Queue',

    'TAKE_WEBCAM_PICTURE_LABEL': 'Take Photo',
    'SAVE_WEBCAM_PICTURE_LABEL': 'Save',
    'RESET_WEBCAM_PICTURE_LABEL': 'Retake Photo',
    'CANCEL_WEBCAM_PICTURE_LABEL': 'Cancel',
    'WEBCAM_PERMISSIONS_MESSAGE_TEXT': 'Please select "Allow" at the top of the page to enable your web cam.',
    'WEBCAM_NOT_FOUND_MESSAGE_TEXT': 'The browser has reported that there is no web cam attached to this computer. Please connect one, or check that it is working properly, then reload this page. It may also be necessary to close any other applications or tabs which are using your camera.',
    'WEBCAM_ACCESS_DENIED_MESSAGE_TEXT': 'This page has been denied access to your web cam. If you would like to use the web cam to add a drawing, please click the <img src="view/libs/images/denied_cam.png" alt="Camera Access Denied Button" /> button in the upper-right corner of this window, then select the "Ask..." option and click "Done".',

    'CANCEL_FILE_LABEL': 'Cancel',
    'SAVE_FILE_LABEL': 'Save',
    'FILE_PICKER_PROMPT': 'Select a JPEG, PNG or G-code file to draw. G-code files will be flattened before drawing. Currently we understand RepRap and Makerbot-style g-code. The robot will draw in the sand when the extruder is on.',

    'VIEW_ORIGINAL_BUTTON_LABEL': 'Original',
    'VIEW_TASK_BUTTON_LABEL': 'JSON',
    'REJECT_TASK_BUTTON_LABEL': '',
    'TASK_LABEL': '#',

    'COMPLETED_DRAWINGS_TITLE': 'Completed',
    'WORKING_DRAWINGS_TITLE': 'In-progress',
    'WAITING_DRAWINGS_TITLE': 'Queue',

    'LAST_UPDATE_PREFIX': 'Last update ',
    'LAST_UPDATE_SUFFIX': 'ago',

    'ASSIGNED_TO_PREFIX': 'Drawing on ',
    'ASSIGNED_TO_SUFFIX': '',

    'GCODE_PREVIEW_TEXT': '(G-code Drawing)',

    'VIEW_PNG_PREVIEW_BUTTON_LABEL': 'View PNG',
    'VIEW_SVG_PREVIEW_BUTTON_LABEL': 'View SVG',
    'VIEW_GCODE_PREVIEW_BUTTON_LABEL': 'View G-code',

    'VIEW_FINAL_BUTTON_LABEL': 'View Completed Drawing',

	'GLOBAL_NAV_HEADER': 'Navigation',
});
