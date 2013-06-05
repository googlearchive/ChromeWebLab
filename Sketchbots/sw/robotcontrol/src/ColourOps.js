/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
/*
 * 	ColourOps
 *
 * 	@description Simple image processing routines for canvas
 * 	@author Adam Palmer
 *
 * 	@usage :
 *	
 *	// instantiate and reset the cache with a new canvas
 *	var colourOps = new ColourOps();
 *	colourOps.resetCache(canvas);
 *
 * 	// call image processing routines with a canvas to draw into
 *	colourOps.threshold(destinationCanvas, 128);
 *
 */
 
require('mootools');
var Canvas = require('canvas'), Image = Canvas.Image;
 
 
exports.ColourOps = new Class({
	Implements: [Options, Events, process.EventEmitter],
 	
 	options: {
 	
 	},
 	
 	
 	initialize: function(options){		
 		this.setOptions(options);	
 	},
 	
 	resetCache: function(canvas){
		this.cache = new Canvas(canvas.width, canvas.height);
		var ctx = this.cache.getContext('2d');
		ctx.drawImage(canvas, 0, 0);
	},
	

	/**
	* @param edge Clips the threshold in the range 0-255.
	*/ 
	
	threshold: function(canvas, edge) {
		var imgData = this.cache.getContext('2d').getImageData(0, 0, this.cache.width, this.cache.height);
		var pix = imgData.data;	
		var blackTally = 0;		
		
		for (var i = 0, n = pix.length; i < n; i += 4){
			average = (pix[i] + pix[i+1] + pix[i+2])/3;
			bw = average >= edge ? 255 : 0;
		
			pix[i] = bw;
			pix[i+1] = bw;
			pix[i+2] = bw;
			
			if (bw == 0) ++blackTally;
		}

		if (canvas) canvas.getContext('2d').putImageData(imgData, 0, 0);
		
		return blackTally/(pix.length/4);
	},
	
	
	getThresholdWithBlackPercentage: function(perc){
		var thresh = 0;		
			
		while (this.threshold(null, thresh) < perc){
			thresh += 5;
		}
					
		return thresh;
	},
	

	/**
	* @param sat sets the saturation in the range -1 (b&w) - 0 (normal colour).
	*/
	
	saturation: function(canvas, sat){
		var imgData = this.cache.getContext('2d').getImageData(0, 0, this.cache.width, this.cache.height);
		var pix = imgData.data;

		for (var i = 0, n = pix.length; i < n; i += 4){
			average = (pix[i] + pix[i+1] + pix[i+2])/3;

			if (sat > 0) {
		
				pix[i  ] += (average - pix[i]) * (1 - 1 / (1.001 - sat));
				pix[i+1] += (average - pix[i+1]) * (1 - 1 / (1.001 - sat));
				pix[i+2] += (average - pix[i+2]) * (1 - 1 / (1.001 - sat));
		
			} else {

				pix[i  ] += (average - pix[i]) * (-sat);
				pix[i+1] += (average - pix[i+1]) * (-sat);
				pix[i+2] += (average - pix[i+2]) * (-sat);
		
	        }
		}

		canvas.getContext('2d').putImageData(imgData, 0, 0);		
	},

 });
 
 