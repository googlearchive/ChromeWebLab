(function(){

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.utils');
	var ImageDataTools = namespace.ImageDataTools;
	
    if (namespace.ChopIntoBlocks === undefined) 
	{
		var ChopIntoBlocks = function ChopIntoBlocks()
 		{
        }

		namespace.ChopIntoBlocks = ChopIntoBlocks;


		ChopIntoBlocks.chop = function(canvas, blockSize)
		{			
			var ctx = canvas.getContext('2d');
			var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			var data = imageData.data;
			
			var cols = Math.floor(ctx.canvas.width/blockSize);
			var rows = Math.floor(ctx.canvas.height/blockSize);			
			
			var index, block, blocks = [];
			
			for (r=0; r < rows; ++r)
			{
				blocks[r] = [];
				
				for (var c=0; c < cols; ++c)
				{
					block = blocks[r][c] = [];
					
					for (var x=c*blockSize; x < c*blockSize + blockSize; ++x)
					{
						// for every x in the block, store all y values
						for (var y=r*blockSize; y < r*blockSize + blockSize; ++y)
						{
							index = ImageDataTools.coordsToIndex(x, y, ctx.canvas);
							block.push(index);
						}
					}
				}
			}
			
			return { blocks:blocks, imageData:imageData, cols:cols, rows:rows };
		}
}

})();
