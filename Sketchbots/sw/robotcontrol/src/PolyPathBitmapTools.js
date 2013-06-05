/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
var Canvas = require('canvas'), Image = Canvas.Image;

exports.PolyPathBitmapTools = {};
var PolyPathBitmapTools = exports.PolyPathBitmapTools;

exports.PolyPathBitmapTools.scalePoint = function(point, ratio, margin) {
		return { x:(point.x*ratio.x)+margin, y:(point.y*ratio.y)+margin }; 
	};

exports.PolyPathBitmapTools.drawBezierLine = function(ctx, ratio, offset, path, counter, margin)
	{
		var point = PolyPathBitmapTools.scalePoint(path[counter], ratio, margin);
		
		ctx.save();
		ctx.translate(offset.x, offset.y);
		ctx.beginPath();
		
		if (counter == 0) // start of path
		{
			var nextPoint = PolyPathBitmapTools.scalePoint(path[counter+1], ratio, margin);

			ctx.moveTo(point.x, point.y);
			ctx.lineTo((point.x + nextPoint.x)/2, (point.y + nextPoint.y)/2);
			ctx.stroke();
		} 
		else if (counter == path.length - 1) // end of path
		{
			var prevPoint = PolyPathBitmapTools.scalePoint(path[counter-1], ratio, margin);

			ctx.moveTo((point.x + prevPoint.x)/2, (point.y + prevPoint.y)/2);
			ctx.lineTo(point.x, point.y);				
			ctx.stroke();
		} 
		else {  // within path (uses ßeziers)
			
			var nextPoint = PolyPathBitmapTools.scalePoint(path[counter+1], ratio, margin);
			var prevPoint = PolyPathBitmapTools.scalePoint(path[counter-1], ratio, margin);

			ctx.moveTo((point.x + prevPoint.x)/2, (point.y + prevPoint.y)/2);
			
			ctx.quadraticCurveTo(
				
					point.x,
					point.y,
					
					(point.x + nextPoint.x)/2,
					(point.y + nextPoint.y)/2
					
				);
				
			ctx.stroke();
		}
		
		ctx.restore();
	};

    //this draws the image of the paths to be included in the artifact
exports.PolyPathBitmapTools.drawPolyPath = function(polyPath, color, width, invertDrawingPng){
		
		console.log("drawPolyPath: 1");
		
		var widest = 0;
		var tallest = 0;
		
		//find the dimensions of this drawing	
		for(var i = 0; i < polyPath.length; i ++){
			var path = polyPath[i];
			
			
			for(var j = 0; j < path.length; j ++){
				var point = path[j];
				
				if(point.x > widest) widest = point.x;
				if(point.y > tallest) tallest = point.y;
			}
		}
        
        if (invertDrawingPng){
            for(var i = 0; i < polyPath.length; i ++){
                var path = polyPath[i];
                for(var j = 0; j < path.length; j ++){
                    var point = path[j];
                    point.y = tallest - point.y;
                    point.x = widest - point.x;
                }
            }
        }
		
		console.log("drawPolyPath: 2");
		
		//scale up or down to needed png size
		var scale = width / widest;		
		var canvas = new Canvas(width + 5, (tallest * scale) + 5);

		
		var ctx = canvas.getContext('2d');
		ctx.lineWidth = 1;
		ctx.strokeStyle = color;
		
		console.log("drawPolyPath: 3");
        
		margin = 5;
		
		for(var i = 0; i < polyPath.length; i ++){
			for(var j = 0; j < polyPath[i].length; j ++){
				PolyPathBitmapTools.drawBezierLine(ctx, {x:scale,y:scale}, {x:0,y:0}, polyPath[i], j, margin);
			}
		}
		
		console.log("drawPolyPath: 4");
		//var img = new Element('img', {src: canvas.toDataURL()}).inject(document.body);
		//console.log(img);
		var dataURL = canvas.toDataURL('image/png');
		console.log("drawPolyPath: 5");
		return dataURL;
	};
