(function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.utils.loading");
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	
	if(namespace.JSLoader === undefined) {
		
		var JSLoader = function JSLoader() {
			
		};
		
		namespace.JSLoader = JSLoader;
		
		JSLoader.LOADED = "loaded";
		JSLoader.ERROR = "error";
		
		var p = JSLoader.prototype = new EventDispatcher();
		
		p.load = function(aFilePath, aIsAsync) {
			var scope = this;
			var script = document.getElementsByTagName('script')[0];
			var newjs = document.createElement('script');

			newjs.onreadystatechange = function () {
				if (newjs.readyState === 'loaded' || newjs.readyState === 'complete') {
					newjs.onreadystatechange = null;
					scope.dispatchCustomEvent(JSLoader.LOADED, aFilePath);
				}
			};

			newjs.onload = function () {
				scope.dispatchCustomEvent(JSLoader.LOADED, aFilePath);
			};

			newjs.src = aFilePath;
			newjs.async = aIsAsync;
			script.parentNode.insertBefore(newjs, script.nextSibling);
		};
		
	}
})();