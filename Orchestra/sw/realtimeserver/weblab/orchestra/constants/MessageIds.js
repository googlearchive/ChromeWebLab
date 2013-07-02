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

//Startup
exports.CONFIRM_START = 0x01;
exports.START_CONFIRMED = 0x02;
exports.ADJUST_START_TIME = 0x03;
exports.START_SESSION = 0x04;
exports.END_SESSION = 0x05;
exports.REQUEST_RECORDING = 0x06;

//Initial data
exports.CURRENT_PLAYERS = 0x0A;
exports.CURRENT_LAYOUT = 0x0B;
exports.CURRENT_INSTRUMENT = 0x0C;

//Change notes
exports.ADD_NOTE = 0x10;
exports.NOTE_ADDED = 0x11;
exports.CHANGE_NOTE = 0x12;
exports.NOTE_CHANGED = 0x13;
exports.REMOVE_NOTE = 0x14;
exports.NOTE_REMOVED = 0x15;
exports.REMOVE_ALL_NOTES_FOR_INSTRUMENT = 0x16;
exports.ALL_NOTES_FOR_INSTRUMENT_REMOVED = 0x17;

//Change tempo
exports.LOOP_TIMES = 0x20;

//User management
exports.CHANGE_SERVER = 0x30;
exports.USER_JOINED = 0x31;
exports.USER_LEFT = 0x32;
exports.LEAVE_CONFIRMED = 0x33;
exports.CHANGE_INSTRUMENT = 0x34;
exports.INSTRUMENT_CHANGED = 0x35;
exports.INSTRUMENT_CHANGE_REFUSED = 0x36;

//Cluster server control
exports.CONTROL_ASSUMED = 0x40;
exports.USER_STARTED = 0x41;
exports.USER_REMOVED = 0x42;

//Error management
exports.LOG_MESSAGE = 0x70;
exports.LOG_ERROR = 0x71;
exports.LOG_WARNING = 0x72;