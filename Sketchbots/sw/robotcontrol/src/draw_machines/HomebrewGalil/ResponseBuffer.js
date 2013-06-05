/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// ResponseBuffer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.ResponseBuffer = new Class({
	Implements: [Events, Options, process.EventEmitter],
	
	options: {
		maximumResponseBufferSize: 1000
	},
	
	
	initialize: function(options){
		this.setOptions(options);

		
		this.responses = new Buffer(this.options.maximumResponseBufferSize);
		this.cursor = 0;
		this.END_CHAR = 0x3a;
		this.ERROR_CHAR = '?'.charCodeAt(0);
	},
	
	
	parseData: function(data){
		//look at data, find end of lines
		//parse it into full responces
		//console.log('parsing data: ['+data+']');
		var gotEndChar = false;
		
		for(var i = 0; i < data.length; i++){
		//loop through all data sent, scrub for end character 
			//console.log("socket data: "+data.toString("utf-8"));
			if((data[i] != this.END_CHAR)&&(data[i] != this.ERROR_CHAR)){
				this.responses[this.cursor] = data[i];
				this.cursor ++;
			}else{
				//fire off event indicating that response was received
				//pass the buffer data to the listener
				//then clear buffer
				//and reset cursor
				gotEndChar = true;
				
				if(this.cursor>0){
					var response = this.responses.toString("utf-8",0, this.cursor);
					response = response.replace(/\r/gi,'\n');
					
					//console.log('sending full response ');
					//console.log('full response:' + response);
					
					
					//console.log(response.replace(/[\. ]/gi,'').substr(0,1));
					
					if(response.replace(/[\. ]/gi,'').substr(0,1) == 0){
						this.emit('done');	
					}
					
					
					this.emit('fullResponse', response);
					//console.log(response.replace(/[\. ]/gi,'').substr(0,1));
					
					
					for (var j=0;j<this.cursor+1;j++){
						this.responses[j] = 0;
					}
					//this.responses.fill(0, 0, this.cursor+1); //clear it out
					this.cursor = 0;
				}else{
					if (data[i] != this.ERROR_CHAR){
						//no data, but non-error response
						this.emit('acknowledgementResponse');
					}else{
						//response came back with error
						this.emit('error', data[i]);
					}		
				}
			}
		}
	}
	
});

