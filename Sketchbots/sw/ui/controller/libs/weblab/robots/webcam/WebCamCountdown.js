/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
(function(){

    var namespace = WEBLAB.namespace('WEBLAB.robots.webcam');

    var canvas_animation = WEBLAB.namespace('WEBLAB.utils.canvas.animation');
	var canvas_utils = WEBLAB.namespace('WEBLAB.utils.canvas.utils');
	var animation = WEBLAB.namespace('WEBLAB.utils.animation');
	
	var TweenHelper = animation.TweenHelper;
	var CanvasFactory = canvas_utils.CanvasFactory;

    var stage;


    if (namespace.WebCamCountdown === undefined) 
	{
        namespace.WebCamCountdown = function()
 		{	
        }

        var p = namespace.WebCamCountdown.prototype;


		p.init = function()
		{			
			this.fontFamily = 'sans-serif';
			var ctx = CanvasFactory.create(105, 105);
			stage = new canvas_animation.Stage(ctx.canvas, 'countdown');	
			this.domElement = stage.canvas;
			
			this.three = this.createNumber(3, 'three');
			this.two = this.createNumber(2, 'two');
			this.one = this.createNumber(1, 'one');

			this.doRender = true;
			this.render();
		}


		p.scaleNumbers = function(onComplete)
		{
			var g = TweenHelper.createGroup(onComplete);	

			g.addStep('3scale', this.three, {scaleX:2, scaleY:2}, this.customEase);
			g.addStep('3alphaIn', this.three, {alpha:1}, TweenHelper.quad.EaseIn);
			g.addStep('3alphaOut', this.three, {alpha:0}, TweenHelper.quad.EaseIn);

			g.addStep('2scale', this.two, {scaleX:2, scaleY:2}, this.customEase);
			g.addStep('2alphaIn', this.two, {alpha:1}, TweenHelper.quad.EaseIn);
			g.addStep('2alphaOut', this.two, {alpha:0}, TweenHelper.quad.EaseIn);

			g.addStep('1scale', this.one, {scaleX:2, scaleY:2}, this.customEase);
			g.addStep('1alphaIn', this.one, {alpha:1}, TweenHelper.quad.EaseIn);
			g.addStep('1alphaOut', this.one, {alpha:0}, TweenHelper.quad.EaseIn);

			g.sequence =	
			[	
				'3scale', 		1, 		.1,
				'3alphaIn', 	.2,		.1,
				'3alphaOut',	.2,		.9,

				'2scale', 		1, 		1.1,
				'2alphaIn', 	.2,		1.1,
				'2alphaOut',	.2,		1.9,

				'1scale', 		1, 		2.1,
				'1alphaIn', 	.2,		2.1,
				'1alphaOut',	.2,		2.9,
			];
				
			g.scale = 1.4;
			g.start();
		}


		p.customEase = function (k)
		{
			 var max = Math.tan(0.9 * 0.5 * Math.PI);
			 var value = (1 + ( Math.tan( 0.9 * (k -  0.5 ) * Math.PI ) ) / max) / 2;

			 // console.log("k", k, "value", value);
			 return value;
		}


		p.createNumber = function(number, name)
		{
			stage.ctx.font = '75px '+ this.fontFamily;			
			var textWidth = Math.ceil(stage.ctx.measureText(number).width);
			console.log('textWidth', textWidth);

			var ctx = CanvasFactory.create(textWidth, 57);

			var sprite = new canvas_animation.Sprite(ctx.canvas);
			sprite.regPoint = {x:ctx.canvas.width/2, y:ctx.canvas.height/2};
			sprite.x = stage.canvas.width/2;
			sprite.y = stage.canvas.height/2;
			sprite.scaleX = sprite.scaleY = 0;
			sprite.alpha = 0;
			stage.addChild(sprite, name);

			ctx.save();			
			ctx.textAlign = 'left';			
			ctx.font = '75px '+ this.fontFamily;			
			ctx.fillStyle = 'white';
			ctx.fillText(number, 0, ctx.canvas.height-2);
			ctx.restore();

			return sprite;
		}


		p.render = function()
		{	
			if (stage) stage.update();
			if (this.doRender) window.requestAnimationFrame(this.render.bind(this));
		}
	}
})();
