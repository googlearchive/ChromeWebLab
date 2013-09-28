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
/*
This class connects to a serial port, and receives data.
It is setup to use an arduino with the rotary encoder firmware on it
that sends out 3 bytes for the reading. 1 header byte, and 2 data bytes
this combines those bytes and fires events when new data is available
*/

var SerialPort = require("serialport").SerialPort;
var ConfigParams = require('../../ConfigParams').ConfigParams;

exports.ArmSensorArduino = new Class({
    Implements: [Options, Events, process.EventEmitter],

    options: {

    },


    initialize: function(SERIAL_PORT_DEVICE, SERIAL_PORT_BAUDRATE, options) {

        this.setOptions(options);

        this.UPPER_VALUE = -10; //holds the upper arm degree value
        this.TIP_VALUE = -10;
        this.LOWER_VALUE = -10;
        this.BASE_VALUE = -10;

        this.serialBuffer = [1000]; //just an array to hold the data bytes

        //the ascii char code for the header byte
        this.UPPER_HEADER_CHAR = 66; //B
        this.TIP_HEADER_CHAR = 67; //C
        this.LOWER_HEADER_CHAR = 65; //A
        this.BASE_HEADER_CHAR = 76; //L
        this.ERROR_HEADER_CHAR = 69; //E



        if (!SERIAL_PORT_DEVICE) console.log("You must specify a serial port location.");
        if (!SERIAL_PORT_BAUDRATE) SERIAL_PORT_BAUDRATE = 38400;

        this.port = SERIAL_PORT_DEVICE;
        this.rate = SERIAL_PORT_BAUDRATE;

        //time admissible for no new data. after this, serial will be reset
        this.WATCHDOG_PERIOD = 4000;

        //new serial connection
        this.createNewSerialConnection();

        this.flush(); //clear the buffer array just in case.

        console.log(this.port + " init");
        //this.lastTimeDataReceived = (new Date()).getTime();
        this.lastTimeDataReceived = 0;

        this.DEBUG = false;
        //        if (this.DEBUG) this.on('newLowerValue', function(){console.log("new lower value")});
    },

    runPeriodicDataWatchdog: function() {
        if (this.DEBUG) {
            console.log(this.port + " time since data " + this.getTimeSinceLastDataReceived() + " " + this.port + " upper " + this.UPPER_VALUE + " " + this.port + " lower " + this.LOWER_VALUE + " " + this.port + " tip   " + this.TIP_VALUE + " " + this.port + " base  " + this.BASE_VALUE);
        }
        if (this.getTimeSinceLastDataReceived() > this.WATCHDOG_PERIOD) {
            console.log(this.port + " position data stale: value=" + this.UPPER_VALUE + " time=" + this.getTimeSinceLastDataReceived() + " Re-opening serial port after closing it.");
            this.serialPort.once('close', function() {
                console.log(this.port + " Port successfully closed. Now attempting to open.");
                this.resetSerial();
            }.bind(this));
            this.serialPort.close();
            return;
        }
        this.runPeriodicDataWatchdog.delay(this.WATCHDOG_PERIOD, this);
    },

    resetSerial: function() {
        console.log(this.port + " Resetting serial port now");
        this.createNewSerialConnection();
    },

    createNewSerialConnection: function() {
        try {
            this.serialPort = new SerialPort(this.port, {
                baudrate: this.rate
            });
            this.serialPort.on("data", this.serialData.bind(this));
            this.serialPort.on("open", this.open.bind(this)); //this does not seem to get called by lib
            this.serialPort.on("error", this.error.bind(this));
            this.serialPort.on("close", this.close.bind(this));
            this.serialPort.on("end", this.end.bind(this));
            this.serialPort.once('data', function() {
                console.log(this.port + " Got data after reset.");
            }.bind(this));
            //start the watchdog, which will reset the port if the data stops coming in
            console.log(this.port + " Starting watchdog now.");
            this.runPeriodicDataWatchdog.delay(this.WATCHDOG_PERIOD, this);
        } catch (e) {
            console.log(this.port + " No port opened. Error while attempting to open port: " + e);
            console.log("Re-attempting open.");
            this.resetSerial.delay(this.WATCHDOG_PERIOD, this);
        }
    },

    reportLastLowerArmDegrees: function() {
        return this.LOWER_VALUE;
    },


    reportLastBase: function() {
        return this.BASE_VALUE;
    },

    reportLastTipReading: function() {
        return this.TIP_VALUE;
    },

    getUpperArmDegrees: function() {
        return this.UPPER_VALUE;
    },

    getTipReading: function() {
        return temp = this.TIP_VALUE;
    },

    reportLastLowerArmDegrees: function() {
        return this.LOWER_VALUE;
    },

    reportLastBase: function() {
        return this.BASE_VALUE;
    },

    getLowerArmDegrees: function() {
        return this.LOWER_VALUE;
    },

    getBase: function() {
        return this.BASE_VALUE;
    },


    getTimeSinceLastDataReceived: function() {
        var time = (new Date()).getTime() - this.lastTimeDataReceived;
        //        if (this.DEBUG) console.log(this.port+" getTimeSinceLastDataReceived(): "+(new Date()).getTime());
        //        if (this.DEBUG) console.log(this.port+" getTimeSinceLastDataReceived(): "+this.lastTimeDataReceived);
        //        if (this.DEBUG) console.log(this.port+" getTimeSinceLastDataReceived(): "+time);
        return time;
    },

    updateTimeDataReceived: function() {
        //        if (this.DEBUG) console.log(this.port+" updateTimeDataReceived()");
        this.lastTimeDataReceived = (new Date()).getTime();
    },

    serialData: function(data) {

        //even though we are sending the serial in bunches of 3 bytes per sensor
        //they do come in the order sent, but not always in full chunks, 
        //so we cant just process them right away as some data could be missing 
        //until the next data is sent
        //this just builds a long line of bytes and cycles through them as they come.

        this.updateTimeDataReceived();

        //        if (this.DEBUG){
        //            console.log(this.port);
        //            console.log(this.port+" data length  "+data.length);
        //            console.log(this.port+" data  "+data);
        //        }

        //push all the incoming bytes into an array
        for (var i = 0; i < data.length; i++) {
            this.serialBuffer.push(data[i]);
        }


        //cycle through the bytes until there is less than 3 bytes available
        while (this.serialBuffer.length >= 6) {

            //readByte removes that character from the line, so no matter if it
            // is used at all, we are moving through the serial array
            var header = this.readByte();

            //this allows ot peak at values without removing them
            var P0 = this.serialBuffer[0];
            var P1 = this.serialBuffer[1];
            var P2 = this.serialBuffer[2];
            var P3 = this.serialBuffer[3];
            var P4 = this.serialBuffer[4];


            //the pattern of data is this ABCCBA (header, data1 data2, data2, data1, header)
            //check to see if the next 5 chars with the header we just read matches that pattern
            //if it does, lets use it, if no skip this and move on to the next character
            //this way ZABCCB does not match the profile, but does not remove all 6 characters, just 1
            //so if the next character comes along is an A, the next round we have ABCCBA, a match
            if (P0 == P3 && P1 == P2 && header == P4) {

                MSB = this.readByte();
                LSB = this.readByte();

                //these are just here to remove them from the chain
                LSB2 = this.readByte();
                MSB2 = this.readByte();
                footer = this.readByte();

                //console.log('values: '+MSB+' | '+LSB);

                //if that char matches the header character, 
                //the following 2 bytes are data for the upper arm
                ////////////////////////////////////////////////
                if (header == this.UPPER_HEADER_CHAR) {
                    ////////////////////////////////////////////////
                    this.UPPER_VALUE = this.getFloatValue(MSB, LSB);
                    this.emit('newUpperValue', this.UPPER_VALUE);
                    //console.log('UPPER_VALUE: '+this.UPPER_VALUE);

                    //if that char matches the header character, 
                    //the following 2 bytes are data for the tip sensor
                    ////////////////////////////////////////////////
                } else if (header == this.TIP_HEADER_CHAR) {
                    ////////////////////////////////////////////////
                    this.TIP_VALUE = this.getFloatValue(MSB, LSB);
                    this.emit('newTipValue', this.TIP_VALUE);

                    if (this.TIP_VALUE < ConfigParams.HOMEBREW_GALIL__TIP_VALUE_THRESHOLD) this.emit('tipSpot', this.TIP_VALUE);
                    ////////////////////////////////////////////////
                } else if (header == this.LOWER_HEADER_CHAR) {
                    ////////////////////////////////////////////////	

                    this.LOWER_VALUE = this.getFloatValue(MSB, LSB);
                    if (Math.abs(this.LOWER_VALUE - 90) < 1) this.emit('lowerAt90', this.LOWER_VALUE);


                    this.emit('newLowerValue', this.LOWER_VALUE);
                    ////////////////////////////////////////////////
                } else if (header == this.BASE_HEADER_CHAR) {
                    ////////////////////////////////////////////////	


                    if (MSB == 87 && LSB == 87) {
                        this.BASE_VALUE = 'on';

                        if (this.mostRecent_BASE_VALUE != this.BASE_VALUE) this.emit('baseChange');

                        this.mostRecent_BASE_VALUE = 'on';
                        this.emit('newBaseValue', this.BASE_VALUE);

                    } else if (MSB == 66 && LSB == 66) {
                        this.BASE_VALUE = 'off';

                        if (this.mostRecent_BASE_VALUE != this.BASE_VALUE) this.emit('baseChange');

                        this.mostRecent_BASE_VALUE = 'off';
                        this.emit('newBaseValue', this.BASE_VALUE);
                    } else {
                        //console.log('MSB: '+ MSB+'\tLSB: '+LSB);
                    }


                    ////////////////////////////////////////////////	
                } else if (header == this.ERROR_HEADER_CHAR) {
                    ////////////////////////////////////////////////	

                    var errorValue = this.getFloatValue(MSB, LSB) > 0 ? "no magnet sensed" : "no sensor attached";
                    console.log(this.port + "Got error header from arduino. Sensor read was probably bad (" + errorValue + ")");


                } else {
                    console.log(this.port + " Arduino serial byte order error.");
                }

            }
        }

        //       this.updateTimeDataReceived();
    },

    flush: function() {
        this.serialBuffer = [];
    },

    reset: function() {
        this.UPPER_VALUE = -10;
        this.TIP_VALUE = -10;
        this.LOWER_VALUE = -10;
        this.BASE_VALUE = -10;
        this.flush();
    },

    readByte: function() {
        /////////////////////////////////////////////
        //take 2 data bytes and combine to make an int/10
        /////////////////////////////////////////////
        return this.serialBuffer.shift();
    },

    getFloatValue: function(MSB, LSB) {
        /////////////////////////////////////////////
        //take 2 data bytes and combine to make an int/10
        /////////////////////////////////////////////

        var value = ((MSB << 8) | LSB); //combine the 2 bytes

        //data comes in in thenths of a degree (1805 for 180.5)
        value /= 10;
        return value;
    },

    open: function() {
        console.log('Arduino Opened');
    },

    error: function(msg) {
        console.log(this.port + ' Arduino Error ' + msg);
        this.emit('arduinoError');
    },

    close: function() {
        console.log(this.port + ' Arduino Closed');
        this.emit('arduinoClose');
    },

    end: function() {
        console.log(this.port + ' Arduino Ended');
        this.emit('arduinoEnd');
    },

});
