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


(function() {
	var DetectUserAgent =  function(userAgent) {
		function isNotEmpty(element, index, array) {
			return (element !== "");
		}
		userAgent = userAgent.toLowerCase();
		var clean = userAgent.replace(/[^a-z 0-9 .]+/g, ' ');
		clean = clean.split(" ");
		/* Line below remove as IE does not support FILTER() */
		// clean = clean.filter(isNotEmpty);
		var cleanLength = clean.length;
		for(var z = 0; z < cleanLength; z++) {
			var item = clean[z];
			if(item === "") {
				clean.splice(z, 1);
			}
		}
		clean = clean.toString();
		clean = clean.replace(/,/g, ' ');
		clean = " "+clean+" ";
		// console.log("clean : ", clean);
		var mos,
			browser,
			version;

		var tablets = [" ipad"," gt p6200 "," xoom "," tablet "];
		var tabletsLength = tablets.length;
		for(var j = 0; j<tabletsLength; j++) {
			var tablet = tablets[j];
			if(clean.indexOf(tablet) != -1) {
				return "basic";
			}
		}

		var mobiles = [" android"," windows phone" ," ios"," iphone"," ipod"];
		var mobilesLength = mobiles.length;
		for(var k = 0; k < mobilesLength; k++) {
			var mobile = mobiles[k];
			var index = clean.indexOf(mobile);
			if(index == -1) continue;
			var p = clean.substring(index+1+mobile.length, clean.length).split(" ", 1);
			version = -1;
			if(!isNaN(p[0])){
				version = parseFloat(p[0]);
			}
			mos = mobile;
			break;
		}
		if(mos == " windows phone") {
			return "mobile";
		} else if(mos == " ios") {
			return "mobile";
		} else if(mos == " iphone" || mos == " ipod") {
			return "mobile";
		} else if(mos == " android") {
			if(version > 0) {
				if(version < 3.0) {
					return "mobile";
				}
				if(version >= 4.0) {
					return "basic";
				}
				if(version == 3.2) {
					return "basic";
				}
			} else {
				return "mobile";
			}
		} else {}

		var browsers = ["msie","ie","chrome", "safari","firefox","opera"];
		var browsersLength = browsers.length;
		for(var l = 0; l < browsersLength; l++) {
			var b = browsers[l];
			var index = clean.indexOf(" "+b+" ");
			if(index == -1) continue;
			var p = clean.substring(index+1+b.length+1, clean.length).split(" ", 1);
			version = -1;
			var testP = parseFloat(p[0]);
			if(!isNaN(testP)){
				version = testP;
			}
			browser = b;
			break;
		}

		if(browser == "msie" && version < 9.0 && version != -1){
			return "basic";
		}else if(browser == "ie" && version < 9.0 && version != -1){
			return "basic";
		} else if(browser == "firefox" && version <12.0 && version != -1) {
			return "basic";
		} else {
			return "";
		}
	};

	var setLoc = function(loc, userAgent) {
		var mode = DetectUserAgent(userAgent);

		if(mode == "mobile" || mode == 'basic') {
			var path0 = loc;
			var index = path0.indexOf(mode);
			var locale;
			var rpath = path0.split("/");
			var destPath = ""+rpath[rpath.length-1];
			var destPieces;
			if(destPath !== "") {
				if(destPath.indexOf('#') != -1) {
					destPieces = destPath.split('#');
					destPath = destPieces[0]+".html#"+destPieces[1];
				} else {
					if(destPath.indexOf('?') != -1) {
						destPieces = destPath.split('?');
						destPath = destPieces[0]+".html";
					} else {
						destPath = destPath+".html";
					}
				}
			} else {
				destPath = "";
			}
			
			return "./"+mode+"/"+destPath;
		} else {
			return null;
		}
	};

	var t = setLoc(location.href, navigator.userAgent);
	if(t !== null) {
		document.location = t;
	}

})();