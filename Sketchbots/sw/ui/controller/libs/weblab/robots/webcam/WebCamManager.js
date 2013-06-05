/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
(function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.robots.webcam");
	
	var CanvasFactory = WEBLAB.namespace("WEBLAB.utils.canvas.utils").CanvasFactory;
	
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	
	var WebCamEventTypes = WEBLAB.namespace("WEBLAB.robots.constants").WebCamEventTypes;
	
	if (namespace.WebCamManager === undefined) {
		
		var WebCamManager = function WebCamManager() {
			this.me = this;
		};
		
		namespace.WebCamManager = WebCamManager;
		
		var p = namespace.WebCamManager.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;
		
		p.init = function(swfURL, w, h, callback) {
			// this.size = {w:this.roundToNearestMultipleOf(15, w), h:this.roundToNearestMultipleOf(15, h)};
			this.size = { w:w, h:h };
			this.useWebCamImage = callback;
			
			this.webRTC = (navigator.webkitGetUserMedia == undefined) ? false : true;
			console.log('WebRTC available:', this.webRTC);
			
			// this.webRTC = true; //MENOTE: is this a debug setting or are we not using webRTC
			
			if (this.webRTC) this.useRTC();
			else this.useFlash(swfURL);
		};

		p.destroy = function() {
			if (this.webCam && this.webCam.parentNode) {
				this.webCam.parentNode.removeChild(this.webCam);
				this.webCam = null;
			}
		};

		p.reset = function() {
			var stoppedVideoCanvas = document.getElementById('stoppedVideoCanvas');
			if (stoppedVideoCanvas) {
				stoppedVideoCanvas.parentNode.removeChild(stoppedVideoCanvas);
			}
			if (this.webCam)
				this.webCam.style.display = null;

			var canvas = document.getElementById('stoppedWebCam');
			if (canvas) {
				canvas.parentNode.removeChild(canvas);
				this.canvas = null;
			}
		};
		
		p.roundToNearestMultiple = function(roundTo, value) {
			var b = Math.round(value/roundTo);
			return roundTo * b;
		}
		
		p.takePicture = function(onFaceChecked) {
			//console.log('take picture');
			this.onFaceChecked = onFaceChecked;
			
			if (this.webRTC) this.takeRTCPicture();
			else this.webCam.takeFlashPicture();
			
		};
		
		p.encodePicture = function()
		{
			//console.log('encode picture');
			// This was checking for a face twice when using webRTC
			// if (this.webRTC) this.checkFace();
			// else this.webCam.encodeFlashPicture();
			
			if (!this.webRTC)this.webCam.encodeFlashPicture();
		}


		p.setUpWebCamAgain = function()
		{
			var restartingCamera = true;

			if (this.webRTC) restartingCamera = false;
			else this.webCam.restartCamera();
			
			return restartingCamera;
		}
		
		
		
		////////////// WebRTC Webcam ///////////////		
		
		p.useRTC = function()
		{
			this.webCam = document.createElement("video");
			
			this.webCam.id = "webCam";
			this.webCam.width = this.size.w;
			this.webCam.height = 352;

			this.webCam.setAttribute('camPhase', 'intro');
			this.webCam.setAttribute('autoplay', 'true');
			this.webCam.style.display = null;
			this.webCam.style.webkitTransform = 'scaleX(-1)';

			this.dispatchCustomEvent(WebCamEventTypes.NEED_WEBRTC_PERMISSION, this.canvas);
			document.getElementById("webCamPreviewHolder").appendChild(this.webCam);


			// navigator.webkitGetUserMedia('video', this.gotRTCStream.bind(this), this.noRTCStream.bind(this));
			navigator.webkitGetUserMedia({audio:false, video:true}, this.gotRTCStream.bind(this), this.noRTCStream.bind(this));
		}
		
		
		p.takeRTCPicture = function()
		{
			var ctx = CanvasFactory.create(468, 352);
			ctx.save();
			ctx.translate(ctx.canvas.width, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(this.webCam, 0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.restore();

			this.canvas = ctx.canvas;

			//this.stopRTCcam();
			var stoppedVideoCanvas = CanvasFactory.clone(this.canvas).canvas;
			stoppedVideoCanvas.id = 'stoppedWebCam';
			stoppedVideoCanvas.setAttribute('camPhase', 'active');

			// without this and removing the parent's children (below), it sits to the right, then jumps back on inspection - browser bug..?
			stoppedVideoCanvas.style.position = 'relative';
			stoppedVideoCanvas.style.left = '0px';

			var webCamBox = document.getElementById('webCamPreviewHolder');
			if (this.webCam) this.webCam.style.display = 'none';
			webCamBox.appendChild(stoppedVideoCanvas);

			this.dispatchCustomEvent(WebCamEventTypes.PICTURE_TAKEN, this.canvas);
		}
		
		
		p.gotRTCStream = function(stream)
		{
			console.log('gotRTCStream!');

			this.webCam.setAttribute('camPhase', 'active');
			this.webCam.src = webkitURL.createObjectURL(stream);
			this.webCam.onerror = this.noRTCStream;

			this.dispatchCustomEvent(WebCamEventTypes.WEBCAM_READY, this);
		}


		p.noRTCStream = function()
		{
			if (!this.webCam) return; //false alarm!

			//console.log('WEB RTC FAILED!');
			this.dispatchCustomEvent(WebCamEventTypes.WEBCAM_ACCESS_DENIED, this);
		}

		p.stopRTCcam = function()
		{
			console.log("STOP RTC CAM");
			this.webCam.src = "";
		}
		
		
		
		////////////// Flash Webcam ///////////////		
		
		p.useFlash = function(swfURL) 
		{
			var div = document.createElement("div");
			div.id = 'webCam';

			var webCamBox = document.getElementById("webCamPreviewHolder");
			if (webCamBox.hasChildNodes()) webCamBox.insertBefore(div, webCamBox.childNodes[0]);
			else webCamBox.appendChild(div);
			
			var swfVersionStr = "0";
			var xiSwfUrlStr = "";
			var flashvars = { webCamManagerInstance:'robotsWebCamManager' };
			var params = { wmode:'transparent' };
			var attributes = { name:"webCam", camPhase:'intro', visible:'false' };
			
			swfobject.embedSWF(
			    swfURL,
				'webCam', this.size.w, this.size.h,
			    '10', null,
			    flashvars, params, attributes, this.flashLoaded.bind(this.me)
			);
		}
		
		
		p.flashLoaded = function(e)
		{
			console.log("Flash loaded ok");
			this.webCam = document.getElementById('webCam');
			this.webCam.className += ' ease-in06';
			this.webCam.style.display = null;
		}
		
		
		p.allowed = function()
		{
			this.webCam.setAttribute('camPhase', 'active');
			this.dispatchCustomEvent(WebCamEventTypes.WEBCAM_READY, this);
		}

		p.addEvent = function(type, callback) {
			return this.addEventListener(type, callback, false);
		}
		
		
		p.denied = function()
		{
			this.dispatchCustomEvent(WebCamEventTypes.WEBCAM_ACCESS_DENIED, this);
		}


		p.noWebCam = function()
		{
			this.dispatchCustomEvent(WebCamEventTypes.WEBCAM_NOT_FOUND, this);
		}
		
		
		p.processFlashImage = function(data) {
			//MENOTE: this is called from flash
			
			this.faceImage = new Image();
			this.faceImage.onload = this.onFlashImageLoad.bind(this);
			this.faceImage.src = "data:image/jpeg;base64," + data;
		};
		
		p.onFlashImageLoad = function() {
			this.canvas = this.canvas || document.createElement('canvas');
			this.canvas.width = this.faceImage.width; // this.roundToNearestMultipleOf(15, this.faceImage.width);
			this.canvas.height = this.faceImage.height; // this.roundToNearestMultipleOf(15, this.faceImage.height);
			
			var ctx = this.canvas.getContext('2d');
			ctx.drawImage(this.faceImage, 0, 0, this.canvas.width, this.canvas.height);
			
			//this.checkFace(); //MENOTE: this is the old face check call
			
			this.dispatchCustomEvent(WebCamEventTypes.PICTURE_TAKEN, this.canvas);
		};
	}
})();