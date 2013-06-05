/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

package weblab.orchestra.livestream {
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	import flash.media.SoundTransform;
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.events.DataEvent;
	import flash.events.NetStatusEvent;
	import flash.media.Video;
	import flash.net.NetStream;
	import flash.net.NetConnection;
	import flash.display.Sprite;

	/**
	 * Live streaming player that sends back time codes.
	 * 
	 * @author	mattiase
	 * @version	0.0.01
	 */
	public class TimeCodePlayer extends Sprite {
		
		protected var _netConnection:NetConnection;
    	protected var _netStream:NetStream;
    	protected var _video:Video;
		protected var _netStreamClient:NetStreamClient;
		protected var _timer:Timer;
		
		protected var _volume:Number;
		protected var _globalVolume:Number;
		
		protected var _streamUrl:String;
		protected var _streamId:String;
		protected var _bufferTime:Number;
		
		protected var _javascriptFunction:String;
		
		public function TimeCodePlayer() {
			super();
			
			this._video = new Video();
			this._video.smoothing = true;
			this.addChild(this._video);
			
			this._volume = 1;
			this._globalVolume = 1;
			
			this._timer = new Timer(3000);
			this._timer.addEventListener(TimerEvent.TIMER, this._reconnect);
		}
		
		public function setStream(aUrl:String, aId:String, aBufferTime:Number):void {
			this._streamUrl = aUrl;
			this._streamId = aId;
			this._bufferTime = aBufferTime;
		}
		
		public function setJavascriptFunction(aFunctionName:String):void {
			this._javascriptFunction = aFunctionName;
		}
		
		public function startSizeUpdate():void {
			this.stage.addEventListener(Event.RESIZE, this._updateSize);
			this._updateSize();
		}
		
		public function connect():void {
			this._netConnection = new NetConnection();
     		this._netConnection.addEventListener(NetStatusEvent.NET_STATUS, this._onConnectionNetStatus);
     		this._netConnection.connect(this._streamUrl);
		}
		
		protected function _closeConnection():void {
			if(this._netConnection != null) {
				this._netConnection.removeEventListener(NetStatusEvent.NET_STATUS, this._onConnectionNetStatus);
				this._netConnection.close();
				
				this._netConnection = null;
			}
		}
		
		protected function _closeStream():void {
			if(this._netStream != null) {
				this._netStream.removeEventListener(NetStatusEvent.NET_STATUS, this._onNetStreamNetStatus);
				this._netStream.close();
				this._netStream.client = this._netStream;
				this._netStream = null;
			
				this._netStreamClient.removeEventListener(NetStreamClient.TIME_CODE, this._onTimeCode);
				this._netStreamClient = null;
			}
			
			
		}
		
		public function changeStream(aStreamId:String):void {
			this._closeStream();
			this._video.clear();
			
			this._streamId = aStreamId;
			
			this._connectNetStream();
		}
		
		public function changeConnection(aUrl:String, aId:String):void {
			
			this._closeStream();
			this._closeConnection();
			this._video.clear();
			
			this._streamUrl = aUrl;
			this._streamId = aId;
			this.connect();
		}
		
		public function stopStream():void {
			this._closeStream();
			this._closeConnection();
			this._video.clear();
			
			this._streamUrl = null;
			this._streamId = null;
		}
		
		protected function _updateVolume():void {
			if(this._netStream != null) {
				var currentSoundTransform:SoundTransform = this._netStream.soundTransform;
				currentSoundTransform.volume = this._volume*this._globalVolume;
				this._netStream.soundTransform = currentSoundTransform;
			}
			else {
				//MENOTE: do nothing
			}
		}
		
		public function setVolume(aValue:Number):void {
			this._volume = aValue;
			this._updateVolume();
		}
		
		public function setGlobalVolume(aValue:Number):void {
			this._globalVolume = aValue;
			this._updateVolume();
		}
		
		protected function _onConnectionNetStatus(aEvent:NetStatusEvent):void {
			switch(aEvent.info["code"]) {
				case "NetConnection.Connect.Success":
					this._connectNetStream();
					break;
				case "NetConnection.Connect.Failed":
				case "NetConnection.Connect.Closed":
					this._timer.start();
					break;
				default:
					trace("Unknown connection code " + aEvent.info["code"]);
					break;
			}
		}
		
		protected function _reconnect(aEvent:TimerEvent):void {
			trace("_reconnect");
			this._timer.stop();
			
			this._closeStream();
			this._closeConnection();
			
			this.connect();
		}
		
		protected function _onNetStreamNetStatus(aEvent:NetStatusEvent):void {
			switch(aEvent.info["code"]) {
				default:
					trace("Unknown netstream code " + aEvent.info["code"]);
					break;
			}
		}
		
		protected function _connectNetStream():void {
			this._netStream = new NetStream(this._netConnection);
			this._netStream.addEventListener(NetStatusEvent.NET_STATUS, this._onNetStreamNetStatus);
			this._netStreamClient = new NetStreamClient();
			this._netStreamClient.addEventListener(NetStreamClient.TIME_CODE, this._onTimeCode);
			this._netStream.client = this._netStreamClient;
			
			this._netStream.bufferTime = this._bufferTime;
			this._netStream.play(this._streamId);
			this._video.attachNetStream(this._netStream);
			this._updateVolume();
		}
		
		protected function _onTimeCode(aEvent:DataEvent):void {
			var timeCode:String = aEvent.data;
			//trace(timeCode);
			
			try {
				ExternalInterface.call(this._javascriptFunction, timeCode);
			}
			catch(theError:Error) {
				//trace(theError.message);
				//trace(theError.getStackTrace());
			}
		}
		
		protected function _updateSize(aEvent:Event = null):void {
			this._video.width = this.stage.stageWidth;
			this._video.height = this.stage.stageHeight;
		}
	}
}
