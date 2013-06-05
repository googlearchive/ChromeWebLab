
/*
 * 	Sprite
 *
 * 	Part of a Canvas animation system with a simple API and a flat display list. 
 *
 * 	@description Simple Canvas-based item to be animated within a Stage.
 *
 * 	@author Adam Palmer
 *
 * 	@usage :
 *	
 *	// instantiate and pass in a canvas to use
 *	var sprite = new Sprite(canvas);
 *
 */


(function(){

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.animation');
	

    if (namespace.Sprite === undefined) 
	{
        namespace.Sprite = function(src, onReady)
 		{
			this.type = 'Sprite';
			this.regPoint = {x:0, y:0};
			return this.init(src, onReady);
        }

        var p = namespace.Sprite.prototype = new namespace.DisplayObject();
		
		
		p.update = function()
		{
			
		}	
}

})();
