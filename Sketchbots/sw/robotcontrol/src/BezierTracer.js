/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
exports.BezierTracer = function (){		
	this.PATH_DISTANCE_THRESHOLD = 40;
}

var p = exports.BezierTracer.prototype;


p.getPolyPaths = function(ctx, preserveAreas)
{
	// cascade data through...
	var thresholdData = this.computeThresholdData(ctx);		
	var vertexData = this.computeVertexData(ctx, thresholdData);
	var pixelPathData = this.computePixelPathData(ctx, vertexData);			
	var polyPathData = this.computePolyPathData(ctx, pixelPathData);
	
	this.PATH_DISTANCE_THRESHOLD = 30;

	// var preserveAreas = [{x:0, y:0, w:400, h:100}];
	this.eliminateRedundantPaths(polyPathData,preserveAreas);
	
	return {width:ctx.canvas.width, height:ctx.canvas.height, polyPathData:polyPathData};
}


p.computeThresholdData = function(ctx)
{
	var index, imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
	
	// load threshData with arrays for x[y]
	var thresholdData = [];			
	
	for (var i = 0; i < ctx.canvas.width; i++) 
	{
		thresholdData.push([]);
	}
	
	// cycle through x & y
	for (var y = 0, m=ctx.canvas.height; y < m; y++) 
	{
		for (var x = 0, n=ctx.canvas.width; x < n; x++) 
		{
			// set threshold data to 0 or 1
			index = this.coordsToIndex(x, y, ctx.canvas);
			imgData[index] == 0 ? thresholdData[x][y] = 0 : thresholdData[x][y] = 1;
		}
	}
	
	return thresholdData;
}


p.computeVertexData = function(ctx, thresholdData)
{
	// load vertexData with arrays for x[y]
	var vertexData = [];
	
	for (var i = 0; i < ctx.canvas.width - 1; i++) 
	{
		vertexData.push([]);
	}
	
	// cycle through and create vertex data
	for (var y = 0; y < ctx.canvas.height; y++) 
	{
		for (var x = 0; x < ctx.canvas.width; x++) 
		{
			if (y < ctx.canvas.height - 1 && x < ctx.canvas.width - 1) 
			{
				var tl, tr, bl, br;
				
				tl = thresholdData[x][y];
				tr = thresholdData[x+1][y];
				bl = thresholdData[x][y+1];
				br = thresholdData[x+1][y+1];
				
				var typeData = tl + 2*tr + 4*bl + 8*br;
				vertexData[x][y] = this.typeToVertexData(x, y, typeData);
			}
		}
	}
	
	return vertexData;
}


p.typeToVertexData = function(x, y, type_data) 
{
	var prev_map = [null, [-1, 0], [0, -1], [-1, 0], [0, 1], [0, 1], null, [0, 1], [1, 0], null, [0, -1], [-1, 0], [1, 0], [1, 0], [0, -1], null];
	var next_map = [null, [0, -1], [1, 0], [1, 0], [-1, 0], [0, -1], null, [1, 0], [0, 1], null, [0, 1], [0, 1], [-1, 0], [0, -1], [-1, 0], null];
	
	var prev_data;
	var next_data;
	
	if (type_data == 0 || type_data == 6 || type_data == 9 || type_data == 15) 
	{
		prev_data = null;
		next_data = null;
	} 
	else {
		prev_data = { x: x + prev_map[type_data][0], y: y + prev_map[type_data][1] };
		next_data = { x: x + next_map[type_data][0], y: y + next_map[type_data][1] };
	}
	
	return { type: type_data, prev: prev_data, next: next_data };
}


p.computePixelPathData = function(ctx, vertexData) 
{
	// load usedPixel with arrays
	var usedPixels = [];
	
	for (var i = 0; i < ctx.canvas.width; i++) 
	{
		usedPixels.push([]);
		
		for (var j = 0; j < ctx.canvas.height; j++) 
		{
			usedPixels[i][j] = 0;
		}
	}
	
	// create pixel path data
	pixelPathData = [];
	
	var index = 0;
				
	while (index < (ctx.canvas.height - 1)*(ctx.canvas.width - 1))
	{
		var pixelPath = [];
		var pixelPathRev = [];
		
		while (pixelPath.length == 0 && index < (ctx.canvas.height - 1)*(ctx.canvas.width - 1))
		{
			var x = index % (ctx.canvas.width - 1);
			var y = parseInt(Math.floor(index / (ctx.canvas.width - 1)));
			var ty = vertexData[x][y].type;
			
			if ((ty == 3 || ty == 1 || ty == 11 || ty == 5 || ty == 10 || ty == 2 || ty == 4 || ty == 7 || ty == 8 || ty == 13 || ty == 12 || ty == 14) && usedPixels[x][y] == 0) 
			{
				pixelPath.push({x: x, y: y});
				pixelPathRev.push({x: x, y: y});
				usedPixels[x][y] = 1;
			}
			
			index++;
		}
		
		if (pixelPath.length > 0) 
		{
			var path_done = 0;
			var cur_x = pixelPath[0].x;
			var cur_y = pixelPath[0].y;
			
			while (path_done == 0) 
			{
				var next_pixel, next_x, next_y;
				
				if (vertexData[cur_x][cur_y].next != null) 
				{
					next_pixel = vertexData[cur_x][cur_y].next;
					next_x = vertexData[cur_x][cur_y].next.x;
					next_y = vertexData[cur_x][cur_y].next.y;
					
					if (next_x >= 0 && next_y >= 0 && next_x < ctx.canvas.width - 1 && next_y < ctx.canvas.height - 1 && usedPixels[next_x][next_y] == 0)
					{
						pixelPath.push({x: next_x, y: next_y});
						usedPixels[next_x][next_y] = 1;
						
						cur_x = next_x;
						cur_y = next_y;
						
						var new_type = vertexData[cur_x][cur_y].type
						
						if (new_type != 3 && new_type != 1 && new_type != 11 && new_type != 5 && new_type != 10 && new_type != 2 && new_type != 4 && new_type != 7 && new_type != 8 && new_type != 13 && new_type != 12 && new_type != 14)
						{
							path_done = 1;
						}
						
					} else {
						pixelPath.push({x: next_x, y: next_y});
						path_done = 1;
					}
				} else {
					path_done = 1;
				}
			}
			
			if (pixelPath.length > 0) 
			{
				pixelPathData.push(pixelPath);
			}
			
		}
		
		if (pixelPathRev.length > 0) 
		{
			var path_done = 0;
			var cur_x = pixelPathRev[0].x;
			var cur_y = pixelPathRev[0].y;
			
			while (path_done == 0)
			{
				var next_pixel, next_x, next_y;
				
				if (vertexData[cur_x][cur_y].prev != null)
				{
					next_pixel = vertexData[cur_x][cur_y].prev;
					next_x = vertexData[cur_x][cur_y].prev.x;
					next_y = vertexData[cur_x][cur_y].prev.y;
					
					if (next_x >= 0 && next_y >= 0 && next_x < ctx.canvas.width - 1 && next_y < ctx.canvas.height - 1 && usedPixels[next_x][next_y] == 0)
					{
						pixelPathRev.push({x: next_x, y: next_y});
						usedPixels[next_x][next_y] = 1;
						
						cur_x = next_x;
						cur_y = next_y;
						
						var new_type = vertexData[cur_x][cur_y].type
						
						if (new_type != 3 && new_type != 1 && new_type != 11 && new_type != 5 && new_type != 10 && new_type != 2 && new_type != 4 && new_type != 7 && new_type != 8 && new_type != 13 && new_type != 12 && new_type != 14)
						{
							path_done = 1;
						}
						
					} else {
						pixelPathRev.push({x: next_x, y: next_y});
						path_done = 1;
					}
				} else {
					path_done = 1;
				}
			}
			
			if (pixelPathRev.length > 0) 
			{
				pixelPathData.push(pixelPathRev);
			}
		}
	}

	return pixelPathData;			
}


p.computePolyPathData = function(ctx, pixelPathData)
{
	var polyPathData = [];
	
	for (var j=0, n=pixelPathData.length; j < n; j++)
	{
		var path = pixelPathData[j];
		
		if (path.length > 15) // minimum path length...?
		{
			polyPathData.push(this.pixelToPolyPath(path));
		}
	}

	return polyPathData;
}


p.pixelToPolyPath = function(pixelPath)
{
	var polyPath = [];
	var polyPathIndices = [];
	var mid = Math.floor(pixelPath.length/2);
	
	polyPath.push(pixelPath[0]);
	polyPath.push(pixelPath[mid]);
	polyPath.push(pixelPath[pixelPath.length - 1]);
	
	polyPathIndices.push(0);
	polyPathIndices.push(mid);
	polyPathIndices.push(pixelPath.length - 1);
	
	var stillbad = 1;
	var level = 0;
	
	while (stillbad != 0 && level < 100) // level of detail maybe...?
	{
		level++;
		stillbad = 0;
		
		for (var i = polyPath.length - 2; i >= 0; i--)
		{
			if (this.normalizedPolyError(pixelPath, polyPathIndices[i], polyPathIndices[i+1]) > 0.7 && polyPathIndices[i+1] - polyPathIndices[i] - 1 > 3)
			{
				var newind = Math.floor((polyPathIndices[i] + polyPathIndices[i+1])/2);
				polyPath.splice(i+1, 0, pixelPath[newind]);
				polyPathIndices.splice(i+1, 0, newind);
				stillbad = 1;
			}
		}
	}
	
	return polyPath;
}


p.normalizedPolyError = function(pixelPath, start, end)
{
	var error = 0;
	
	for (var i = start + 1; i < end; i++) 
	{
		error += this.distPointToLine(pixelPath[i], pixelPath[start], pixelPath[end]);
	}
	
	return error/(end - start - 1);
}


p.distPointToLine = function(pt, linePt0, linePt1)
{
	var a = linePt1.y - linePt0.y;
	var b = linePt0.x - linePt1.x;
	var c = linePt1.x * linePt0.y - linePt0.x * linePt1.y;
	
	return Math.abs(a*pt.x + b*pt.y + c)/Math.sqrt(a*a + b*b);
}


p.distance = function(p1,p2) 
{
	return Math.sqrt(Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2));
};


p.getPathLengthEstimate = function(path)
{
	var pathLengthEstimate = 0;
	for (var j=0; j< path.length-1; j++) {
		pathLengthEstimate += this.distance(path[j],path[j+1]);
	}
	return pathLengthEstimate;
}

p.pathInArea = function(path,areas)
{
	var inArea = false;
	for (var i=0; i< areas.length; i++) {
		for (var j=0; j< path.length; j++) {
			inArea |= ((path[j].x > areas[i].x)&&(path[j].x < areas[i].x+areas[i].w)&&(path[j].y > areas[i].y)&&(path[j].y < areas[i].y+areas[i].h));
			// console.log("path x: "+path[j].x);
			if (inArea) break;
		}
	}
	return inArea;
}


p.eliminateRedundantPaths = function(polyPathDataParam, preserveAreas)
{
		//image area to avoid reducing
		// alert("preserving");
		//get a path
		var redundantPolyLines = new Array();
		var A = 0;
		var B = 0;
		var C = 0;
		var AB = 0;
		var AC = 0;
		var BC = 0;
		// console.log("Start reduction ");

		for (var path_index_1=0; path_index_1< polyPathDataParam.length; path_index_1++) {
			// console.log("reduction loop");
		    var path_index_2 = path_index_1+1;
		    polyLine1 = polyPathDataParam[path_index_1];
			if ((polyLine1.length < 2)||(this.pathInArea(polyLine1,preserveAreas))){
				continue;
			}

		    if(redundantPolyLines.indexOf(polyLine1) == -1){
		      	points1 = polyLine1;

	      		// console.log("Compare "+path_index_1);

		      	//compare it to every other path
		      	while(path_index_2 < polyPathDataParam.length){
		      		// console.log("to "+path_index_2);
		        	polyLine2 = polyPathDataParam[path_index_2];
					if ((polyLine2.length < 2)||(this.pathInArea(polyLine2,preserveAreas))){
						path_index_2++;
						continue;
					}
		        	if(redundantPolyLines.indexOf(polyLine2) == -1){
			      		// console.log(path_index_2+" is not already redundant");
		          		points2 = polyLine2;
		          		//array of distances between line segments on one path and points on the other
		          		minDistPerSeg = new Array(points1.length-1);
		          		for(var i=0;i<minDistPerSeg.length;i++){
			 				minDistPerSeg[i]=Number.MAX_VALUE;
						}
			      		// console.log("start comparing points...");
			      		// console.log("points1 length"+points1.length);
			      		// console.log("points2 length"+points2.length);
		          		for(var i=1;i<points1.length;i++){ //starts at 1 not 0
		            		var minDistIndex = i-1;
		            		A = points1[i-1];
		            		B = points1[i];
		            		AB = this.distance(A,B);
		            		for(var j=0;j<points2.length;j++){
		              			C = points2[j];
		              			AC = this.distance(A,C);
		              			BC = this.distance(B,C);
		              			var distance = (AC+BC)-AB;
		              			if (distance < minDistPerSeg[minDistIndex]) minDistPerSeg[minDistIndex] = distance;
								// console.log("minDistPerSeg["+minDistIndex+"] "+minDistPerSeg[minDistIndex]);
		            		}
		          		}

		          		//find the distance metric for the two paths by summing and dividing by segment count
		          		var distanceMetric = 0;
		          		for(var i=0;i<minDistPerSeg.length;i++){ //starts at 1 not 0
		            		distanceMetric += minDistPerSeg[i];
		          		}
		          		distanceMetric/=minDistPerSeg.length;
		          		// console.log("dist met: "+distanceMetric);
		          		if (distanceMetric < this.PATH_DISTANCE_THRESHOLD){
		            		if (this.getPathLengthEstimate(polyLine1) < this.getPathLengthEstimate(polyLine2)){
		              			redundantPolyLines.push(polyLine1);
		            		}else{
		              			redundantPolyLines.push(polyLine2);
		            		}
		          		}
		        	}

		        	path_index_2++;

		      		// console.log("----------------");
		      	}
			}
		    path_index_1++;
		}

	  	//eliminate paths now
	  console.log("Eliminating "+redundantPolyLines.length+" paths for redundancy.");

	  while(redundantPolyLines.length>0)
	{
	    var removeIndex = polyPathDataParam.indexOf(redundantPolyLines.pop());
		if (removeIndex!=-1) polyPathDataParam.splice(removeIndex,1);
	  }
}


p.getBezierPreMachineCode = function(polyPathData) {
	var scale = 1.0;
	var prog = "";
	var prog_line = "";
	for (var j=0; j< polyPathData.length; j++) {
		var path = polyPathData[j];
		for (var i=0; i<path.length; i++) {
			if (i == 0) {
				var pix0 = path[i];
				var pix1 = path[i+1];
				prog_line = "" + scale*pix0.x + "," + scale*pix0.y + ",1.0;\n";
				prog_line += "" + scale*pix0.x + "," + scale*pix0.y + ",0.0;\n";
				prog_line += "" + scale*(pix0.x + pix1.x)/2.0 + "," + scale*(pix0.y + pix1.y)/2.0 + ",0.0;\n";
			} else if (i == path.length - 1) {
				var pix0 = path[i];
				prog_line = "" + scale*pix0.x + "," + scale*pix0.y + ",0.0;\n";
				prog_line += "" + scale*pix0.x + "," + scale*pix0.y + ",1.0;\n";
			} else {
				var pix0 = path[i];
				var pix1 = path[i+1];
				prog_line = "" + scale*(pix0.x + pix1.x)/2.0 + "," + scale*(pix0.y + pix1.y)/2.0 + ",0.0," + scale*pix0.x + "," + scale*pix0.y + ";\n";
			}
			prog += prog_line;
		}
	}
	
	return prog;
}



p.indexToCoords = function(i, canvas)
{
	var x = i*.25 % canvas.width;
	var y = (i*.25 - x) / canvas.width;			
	return {x:x, y:y};
}


p.coordsToIndex = function(x, y, canvas)
{
	return ((y * canvas.width) + x)*4;
}
