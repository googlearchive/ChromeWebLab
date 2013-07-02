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
	
	import flash.events.DataEvent;
	import flash.events.EventDispatcher;
	
	/**
	 * The netstream client
	 * 
	 * @author	mattiase
	 * @version	0.0.01
	 */
	public class NetStreamClient extends EventDispatcher {
		
		public static const TIME_CODE:String = "timeCode";
		
		function NetStreamClient() {
			super();
		}
		
		public function onMetaData(aData:*):void {
			
		}
		
		public function onFI(aData:*):void {
			var tempArray:Array = String(aData["sd"]).split("-");
			var datePart:String = tempArray[2] + "-" + tempArray[1] + "-" + tempArray[0];
			tempArray = String(aData["st"]).split(".");
			var timePart:String = tempArray[0];
			var millisecondsPart:String = tempArray[1];
			millisecondsPart = millisecondsPart.split(" ").join("0");
			var newEvent:DataEvent = new DataEvent(TIME_CODE, false, false, datePart + "T" + timePart + "." + millisecondsPart);
			this.dispatchEvent(newEvent);
		}
	}
}
