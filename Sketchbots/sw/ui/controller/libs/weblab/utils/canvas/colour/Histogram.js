(function(){

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.colour');

	var canvasUtils	= WEBLAB.utils.canvas.utils;
	var CanvasFactory = canvasUtils.CanvasFactory;
	var dev	= WEBLAB.utils.dev;
	


    if (namespace.Histogram === undefined) 
	{
        namespace.Histogram = function (talky) 
		{
			verbose = talky;
        };

        var p = namespace.Histogram.prototype;
		var verbose;
		
		
		p.init = function(canvas)
		{
			this.simpleTimer = new dev.SimpleTimer(verbose);
			
			this.ctx = canvas.getContext('2d');
			this.imageData = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
			
			this.red = {r:227, g:99, b:0};
			this.green = {r:26, g:233, b:0};
			this.blue = {r:0, g:69, b:233}; 
			
			this.data = this.getHistogramData();
		}
		
		
		p.getHistogramData = function()
		{
			var arr = [];
			for (var i=0, n=256; i<n; ++i) { arr[i] = 0; }
			
			var h = {r:arr.slice(0), g:arr.slice(0), b:arr.slice(0)};
			var data = this.imageData.data;
			
			for (var i=0, n=data.length; i<n; i+=4)
			{
				if (data[i+3] > 0)
				{
					h.r[ data[i]   ]++;
					h.g[ data[i+1] ]++;
					h.b[ data[i+2] ]++;
				}
			}
			
			return h;
		}
		
		
		p.getMaxFrequency = function(data)
		{
			var max = 0;
						
			for (var i=0, n=256; i<n; ++i)
			{
				max = Math.max(max, data.r[i], data.g[i], data.b[i]);
			}
			
			return max;
		}
		
		
		p.createEmptyGraph = function(width, height)
		{
			this.max = this.getMaxFrequency(this.data);
			this.graphCtx = CanvasFactory.create(width, height);
		
			return this.graphCtx.canvas;
		}
		
		
		p.drawShapeGraph = function(data, step, baseCurveHeight, alpha)
		{
			this.baseCurveHeight = baseCurveHeight;
			if (!alpha) alpha = .6;
			
			var ms = this.simpleTimer.start();
			
			this.graphCtx.clearRect(0, 0, this.graphCtx.canvas.width, this.graphCtx.canvas.height);
			this.ratio = {x: this.graphCtx.canvas.width/data.r.length, y:(this.graphCtx.canvas.height-this.baseCurveHeight-6)/this.max};
			
			var r = 'rgba(' + Math.round(this.red.r) + ',' + Math.round(this.red.g) + ',' + Math.round(this.red.b) +',' + alpha + ')';
			var g = 'rgba(' + Math.round(this.green.r) + ',' + Math.round(this.green.g) + ',' + Math.round(this.green.b) +',' + alpha + ')';
			var b = 'rgba(' + Math.round(this.blue.r) + ',' + Math.round(this.blue.g) + ',' + Math.round(this.blue.b) +',' + alpha + ')';
			
			this.drawColourShape(this.graphCtx, data.r, step, r);
			this.drawColourShape(this.graphCtx, data.g, step, g);
			this.drawColourShape(this.graphCtx, data.b, step, b);
			
			this.simpleTimer.end(ms, 'drew graph', false);
		}
		
		
		p.drawAverageShapeGraph = function(data, step, baseCurveHeight, dataWidth)
		{
			this.baseCurveHeight = baseCurveHeight;
			
			this.graphCtx.clearRect(0, 0, this.graphCtx.canvas.width, this.graphCtx.canvas.height);
			this.ratio = {x: this.graphCtx.canvas.width/dataWidth, y:(this.graphCtx.canvas.height-this.baseCurveHeight-6)/this.max};
			data.average = [];
						
			for (var i=0, n=dataWidth; i<n; ++i)
			{
				data.average[i] = Math.round((data.r[i] + data.g[i] + data.b[i])/3);
			}
			
			var grad = this.graphCtx.createLinearGradient(0, 0, 0, this.graphCtx.canvas.height);
            grad.addColorStop(0, 'rgba(20, 20, 20, .8)');
			grad.addColorStop(1, 'rgba(90, 90, 90, .6)');
			
			this.drawColourShape(this.graphCtx, data.average, step, grad);
		}
		
		
		p.drawColourShape = function(ctx, data, step, col)
		{
			var y, g = ctx;
			var base = ctx.canvas.height;
			
			g.save();
			// g.globalCompositeOperation = 'lighter';
			
			g.moveTo(0, base);
			g.beginPath();
			
			for (var i=0, n=data.length; i<n; i+=step)
			{
				y = (base-this.baseCurveHeight) - (data[i]*this.ratio.y);
				g.lineTo(i*this.ratio.x, y);
			}
			
			var w = ctx.canvas.width;
			g.lineTo(w, y);
			g.lineTo(w, base);
			g.quadraticCurveTo(w/2, base-this.baseCurveHeight, 0, base);		
			
			g.fillStyle = col;
			g.fill();
			
			g.restore();
		}
		
		
		p.drawBarGraph = function(data)
		{			
			this.graphCtx.clearRect(0, 0, this.graphCtx.canvas.width, this.graphCtx.canvas.height);
			this.ratio = {x: this.graphCtx.canvas.width/256, y:this.graphCtx.canvas.height/this.max};	
			
			var alpha = .72;
			
			for (var i=0, n=256; i<n; ++i)
			{				
				this.drawBar(i, data.r[i], 'rgba(227, 99, 0, ' + alpha + ')');				
				this.drawBar(i, data.g[i], 'rgba(26, 233, 0, ' + alpha + ')');
				this.drawBar(i, data.b[i], 'rgba(0, 69, 233, ' + alpha + ')');	
			}
		}
		
		
		p.drawBar = function(i, freq, col)
		{			
			var g = this.graphCtx;
			var barH = freq*this.ratio.y;
			var base = this.graphCtx.canvas.height;
			
			g.save();
			
			g.translate(i*this.ratio.x, base);
			g.beginPath();
			g.rect(0, 0, this.ratio.x, -barH);
			g.fillStyle = col;
			g.fill();
			
			g.restore();
		}
		
		
		p.optimiseData = function(data)
		{
			var ms = this.simpleTimer.start();
			
			var iterations = 1;
			var range = 1;
			data = this.getCompressedData(range);
			
			while (this.getMaxFrequency(data) < this.max)
			{
				range += .01;
				data = this.getCompressedData(range);
				
				++iterations;
			}
			
			if (verbose) console.log('histogram optimised in', iterations, 'iterations. range =', range.toFixed(3));
			this.simpleTimer.end(ms, 'optimised data', false);
			
			return data;
		}
		
		
		p.getCompressedData = function(range)
		{
			this.range = range;
			
			var me = this;						
			function getMagnitude(value) { return range*((me.max - value)/me.max); }
			
			var data =
			{
				r: this.data.r.slice(0),
				g: this.data.g.slice(0),
				b: this.data.b.slice(0)
			}
			
			for (var i=0, n=256; i<n; ++i)
			{
				data.r[i] *= getMagnitude(data.r[i]);
				data.g[i] *= getMagnitude(data.g[i]);
				data.b[i] *= getMagnitude(data.b[i]);
			}
			
			return data;
		}

    }

})();