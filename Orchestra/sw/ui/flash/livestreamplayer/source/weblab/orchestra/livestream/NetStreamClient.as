/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
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
