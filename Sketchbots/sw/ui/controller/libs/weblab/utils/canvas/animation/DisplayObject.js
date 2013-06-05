/*
 * 	DisplayObject
 *
 * 	Part of a Canvas animation system with a simple API and a flat display list. 
 *
 * 	@description Both Stage and Sprite inherit from this. 
 *	Provides easy control of various animation params.
 *
 * 	@author Adam Palmer
 *
 */

(function(){

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.animation');

	var CanvasFactory = WEBLAB.utils.canvas.utils.CanvasFactory;
	var SimpleTrig = WEBLAB.utils.math.SimpleTrig;
	

    if (namespace.DisplayObject === undefined) 
	{
        namespace.DisplayObject = function ()
 		{			
			this.x = 0;
			this.y = 0;
			this.scaleX = 1;
			this.scaleY = 1;
			this.rotation = 0;
			this.regPoint = {x:0, y:0};
			this.alpha = 1;
			this.visible = true;

			this.parent = null;
			this.canvas = null;
			this.ctx = null;
			this.mask = null;
			this.doUpdate = false;

			this.tween = null;

			this.id = 'no ID';
			this.type = 'DisplayObject';
			
			this.blendMode = null;
        }

        var p = namespace.DisplayObject.prototype;

		
		p.init = function(src, onImageLoaded)
		{		
			if (typeof src == 'string')
			{
				this.visible = false;
				
				var image = new Image();				
				image.onload = (function()
					{
						this.initWithCanvas(CanvasFactory.createFromImage(image).canvas);
						this.visible = true;
						onImageLoaded();
					}
					).bind(this);					
				image.src = src;
			} 
			else {
				this.initWithCanvas(src);
			}			
		}
		
		
		p.initWithCanvas = function(src)
		{
			this.canvas = src;
			this.ctx = src.getContext('2d');
		}
		
		
		p.killTween = function()
		{
			if (this.tween) this.tween.stop();
		}
		
		
		p.centreRegPoint = function()
		{
			this.regPoint.x = this.canvas.width/2;
			this.regPoint.y = this.canvas.height/2;
		}
		
		
		p.drawRegPoint = function(point)
		{
			this.ctx.save();
			this.ctx.translate(this.regPoint.x, this.regPoint.y);
			this.ctx.beginPath();
			this.ctx.rect(-2, -2, 4, 4);
			this.ctx.fillStyle = 'rgba(0, 0, 0, .8)';
			this.ctx.fill();
			this.ctx.restore();
		}
		
		
		p.render = function(ctx) 
		{	
			ctx.save();
			ctx.globalAlpha = this.alpha;
			if (this.blendMode) ctx.globalCompositeOperation = this.blendMode;
		
			// move to x, y
			ctx.translate(this.x, this.y);
			
			// rotate 
			ctx.rotate(SimpleTrig.toRadians(this.rotation));
			
			// move back from x,y to regPoint offset, within rotated context
			ctx.translate(-this.regPoint.x*this.scaleX, -this.regPoint.y*this.scaleY);
			
			// draw with regPoint at (x,y)			
			ctx.drawImage(this.canvas, 0, 0, this.canvas.width*this.scaleX, this.canvas.height*this.scaleY);
			
			ctx.restore();
		}
		
		
		p.canvasMask = function(canvas)
		{
			this.mask = canvas;
		}
		
		
		p.clone = function(scale)
		{
			scale = scale || 1;
			
			var d, ctx = CanvasFactory.clone(this.canvas, scale);
			
			if (this.type == 'Sprite') d = new namespace.Sprite(ctx.canvas);
			if (this.type == 'Stage') d = new namespace.Stage(ctx.canvas, this.id+' CLONE');
						
			if (scale == 1)
			{
				d.scaleX = this.scaleX;
				d.scaleY = this.scaleY;
			} else {
				d.scaleX = d.scaleY = 1;
			}
						
			d.x = this.x;
			d.y = this.y;
			d.rotation = this.rotation;
			d.regPoint.x = this.regPoint.x*scale;
			d.regPoint.y = this.regPoint.y*scale;
			d.alpha = this.alpha;
			d.visible = this.visible;

			d.parent = null;
			d.mask = this.mask;
			d.doUpdate = this.doUpdate;

			d.tween = null;
			d.id = this.id + ' CLONE';
			d.type = this.type;

			return d;
		}
}

})();
