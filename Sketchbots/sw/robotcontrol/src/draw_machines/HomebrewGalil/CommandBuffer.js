/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// CommandBuffer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.CommandBuffer = new Class({
//this thing really streams, that's just what it does!	
	Implements: [Events, Options, process.EventEmitter],
	
	options: {
		MAX_COMMAND_COUNT: 180000,
	},
	
	
	initialize: function(options){
		this.setOptions(options);
		this.COMMAND_LENGTH = 14; //"CD-99,-99,-99\r"
		this.setOptions(options);
		this.batchCursor = 0; //Current pos of queued commands?
		this.commandCount = 0; //total number of commands
		this.cursor = 0;//the single character count pos
		this.MAX_COMMAND_COUNT = this.options.MAX_COMMAND_COUNT;
		this.commands = new Buffer(this.MAX_COMMAND_COUNT*this.COMMAND_LENGTH);
		console.log("CommandBuffer size in characters: "+this.commands.length );
	},
		
	checkMotionController: function(){
		//checks the motion controller to see if more commands need to be sent over.
		
	},	
	
	flush: function(){
	//flush the buffer, reset the cursors, and fill buffer with 0
		this.batchCursor = 0; //Current pos of queued commands?
		this.commandCount = 0; //total number of commands
		this.cursor = 0;//the single character count pos
		//this.commands.fill(0); //not supported until v.6
		
		for(var i = 0; i < this.commands.length; i ++){
			this.commands[i]=0;
		}
		
		
		this.emit('flushed');
	},
	
	getNextBatch: function(batchSize){
		//copy [batchSize] commands from the command buffer into a smaller batch buffer
		//and sreturn them.
		//then move the command cursor ahead to point to the next
		//command in the command buffer after the end of the batch returned.
		
		var nextBatchCharCount = batchSize*this.COMMAND_LENGTH;
		var actualCommandCharsLeft = this.cursor - this.batchCursor;
		nextBatchCharCount = (nextBatchCharCount < actualCommandCharsLeft) ? nextBatchCharCount : actualCommandCharsLeft;
		
		if (nextBatchCharCount == 0){
			this.emit('finished');
			return null; //we have reached the end of the commands, so there is no batch to return
		}
		
		var batchBuffer = new Buffer(nextBatchCharCount);
		var endBufferIndex = this.batchCursor+batchBuffer.length; //This is a non inclusive index number
		
		this.commands.copy(batchBuffer,0,this.batchCursor,endBufferIndex);
		
		this.batchCursor = endBufferIndex;
		
		//console.log(actualCommandCharsLeft + " chars left in command buffer");
		return batchBuffer;
	},
	
	getNextCommand: function(){
	//This works, but there should be a more efficient way to do this.
	//Using buffer.slice we could reduce the copy buffer.
		
		var actualCommandCharsLeft = this.cursor - this.batchCursor;
		var nextBatchCharCount = (this.COMMAND_LENGTH < actualCommandCharsLeft) ? this.COMMAND_LENGTH : actualCommandCharsLeft;
				
		if (nextBatchCharCount == 0){
			this.emit('finished');
			return null; //we have reached the end of the commands, so there is no batch to return
		}
		
		var batchBuffer = new Buffer(nextBatchCharCount);
		var endBufferIndex = this.batchCursor+batchBuffer.length; //This is a non inclusive index number
		
		this.commands.copy(batchBuffer,0,this.batchCursor,endBufferIndex);
		
		this.batchCursor = endBufferIndex;
		
		//console.log(actualCommandCharsLeft + " chars left in command buffer");
		//console.log('sending command: '+batchBuffer);
		return batchBuffer;
	},
	
	push: function(newCommand){
		//if(this.commandCount > 200) return; //TESTING ONLY
		
		//console.log('pushing: '+newCommand);
		
		//push into buffer
		if (newCommand.length+this.cursor < this.commands.length){
			this.commandCount++;
			this.commands.write(newCommand, this.cursor);
			this.cursor += newCommand.length;
		}else{
			console.log("ERROR: Maximum command buffer length will be exceeded. Dropping command.");
		}
	}
	
	
});

