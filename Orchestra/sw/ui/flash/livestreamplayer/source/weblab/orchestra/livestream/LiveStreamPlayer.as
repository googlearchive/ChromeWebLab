/*
    Copyright 2013 Google Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

 package weblab.orchestra.livestream {
	import flash.external.ExternalInterface;
	import flash.display.Sprite;

	/**
	 * A live stream player that takes urls from flashVars.
	 * 
	 * @author	mattiase
	 * @version	0.0.01
	 */
	public class LiveStreamPlayer extends Sprite {
		
		protected var _player:TimeCodePlayer;
		
		/**
		 * Constructor
		 */
		public function LiveStreamPlayer() {
			super();
			
			this._player = new TimeCodePlayer();
			this.addChild(this._player);
			this._player.startSizeUpdate();
			
			try {
				ExternalInterface.addCallback("changeStream", this._changeStream);
				ExternalInterface.addCallback("changeConnection", this._changeConnection);
				ExternalInterface.addCallback("stopStream", this._stopStream);
				ExternalInterface.addCallback("setVolume", this._setVolume);
				ExternalInterface.addCallback("setGlobalVolume", this._setGlobalVolume);
			}
			catch(theError:Error) {
				trace("Couldn't add callback");
			}
			
			var flashVars:Object = this.root.loaderInfo.parameters;
			//this._player.setStream("rtmp://tellart.rtmphost.com/cam0_instrument0_orch_lon_weblab/TanumEd5C29ra8eHuchu5rak", "yt-live.yd4mUP0XLAY.34", 5);
			this._player.setStream(decodeURIComponent(flashVars["url"]), flashVars["id"], parseFloat(flashVars["bufferTime"]));
			this._player.setJavascriptFunction(flashVars["javascriptFunction"]);
			
			if(flashVars["volume"] != undefined) {
				this._player.setVolume(parseFloat(flashVars["volume"]));
			}
			if(flashVars["globalVolume"] != undefined) {
				this._player.setVolume(parseFloat(flashVars["globalVolume"]));
			}
			
			this._player.connect();
			
			try {
				ExternalInterface.call(flashVars["javascriptLoadedFunction"]);
			}
			catch(theError:Error) {
				//trace(theError.message);
				//trace(theError.getStackTrace());
			}
			
		}
		
		protected function _changeStream(aStreamId:String):void {
			this._player.changeStream(aStreamId);
		}
		
		protected function _changeConnection(aUrl:String, aStreamId:String):void {
			this._player.changeConnection(aUrl, aStreamId);
		}
		
		protected function _stopStream():void {
			this._player.stopStream();
		}
		
		protected function _setVolume(aValue:Number):void {
			this._player.setVolume(aValue);
		}
		
		protected function _setGlobalVolume(aValue:Number):void {
			this._player.setGlobalVolume(aValue);
		}
	}
}
