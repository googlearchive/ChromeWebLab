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

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.orchestra.constants");
	
	if(namespace.MessageIds === undefined) {
		
		var MessageIds = function MessageIds() {
			//MENOTE: do nothing
		};
		
		namespace.MessageIds = MessageIds;
		
		//Startup
		MessageIds.CONFIRM_START = 0x01;
		MessageIds.START_CONFIRMED = 0x02;
		MessageIds.ADJUST_START_TIME = 0x03;
		MessageIds.START_SESSION = 0x04;
		MessageIds.END_SESSION = 0x05;
		MessageIds.REQUEST_RECORDING = 0x06;
		
		//Initial data
		MessageIds.CURRENT_PLAYERS = 0x0A;
		MessageIds.CURRENT_LAYOUT = 0x0B;
		MessageIds.CURRENT_INSTRUMENT = 0x0C;
		
		//Change notes
		MessageIds.ADD_NOTE = 0x10;
		MessageIds.NOTE_ADDED = 0x11;
		MessageIds.CHANGE_NOTE = 0x12;
		MessageIds.NOTE_CHANGED = 0x13;
		MessageIds.REMOVE_NOTE = 0x14;
		MessageIds.NOTE_REMOVED = 0x15;
		MessageIds.REMOVE_ALL_NOTES_FOR_INSTRUMENT = 0x16;
		MessageIds.ALL_NOTES_FOR_INSTRUMENT_REMOVED = 0x17;
		
		//Change tempo
		MessageIds.LOOP_TIMES = 0x20;
		
		//User management
		MessageIds.CHANGE_SERVER = 0x30;
		MessageIds.USER_JOINED = 0x31;
		MessageIds.USER_LEFT = 0x32;
		MessageIds.LEAVE_CONFIRMED = 0x33;
		MessageIds.CHANGE_INSTRUMENT = 0x34;
		MessageIds.INSTRUMENT_CHANGED = 0x35;
		MessageIds.INSTRUMENT_CHANGE_REFUSED = 0x36;
		
		//Cluster server control
		MessageIds.CONTROL_ASSUMED = 0x40;
		
		//Error management
		MessageIds.LOG_MESSAGE = 0x70;
		MessageIds.LOG_ERROR = 0x71;
		MessageIds.LOG_WARNING = 0x72;
	}
})();