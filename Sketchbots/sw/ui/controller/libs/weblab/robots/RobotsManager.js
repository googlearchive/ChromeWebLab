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
(function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.robots");
	var singletonsNamespace = WEBLAB.namespace("WEBLAB.robots.singletons");
	var progress = WEBLAB.namespace("WEBLAB.robots.animation.progress");
	var SiteManager = WEBLAB.namespace("WEBLAB.common").SiteManager;

	var TweenHelper = WEBLAB.namespace("WEBLAB.utils.animation").TweenHelper;
	
	var BackendUrlGenerator = WEBLAB.namespace("WEBLAB.robots.loading").BackendUrlGenerator;	
	var RobotsPageManager = WEBLAB.namespace("WEBLAB.robots.ui.page").RobotsPageManager;
	

	if(namespace.RobotsManager === undefined) {
		
		namespace.RobotsManager = function()
		{
			this.userCols = {
				grad1:[ {index:0, col:'#E89681'}, {index:1, col:'#E38892'} ], 
				grad2:[ {index:0, col:'#E38892'}, {index:1, col:'#DD78A3'}] 
			};
		};
		
		
		var p = namespace.RobotsManager.prototype;
		
		
		p.setup = function(aBaseUrl, aTemplateFolder, aCenteredHolderElement, aFullBrowserElement, aOverlayHolderElement)
		{
			console.log("RobotsManager.setup:", aBaseUrl, aTemplateFolder, aCenteredHolderElement, aFullBrowserElement, aOverlayHolderElement);
			this.backendUrlGenerator = new BackendUrlGenerator(aBaseUrl, aTemplateFolder);			
			this._pageManager = RobotsPageManager.create(aCenteredHolderElement, aFullBrowserElement);
			this._pageManager.setSubtitleContainer(aCenteredHolderElement.querySelector("#experimentTitle .experimentSubtitle .content"));
		};
		

		p.start = function()
		{						
			this.robotsAnimManager = new namespace.RobotsAnimManager(this.userCols);
			this.animProgressIndicator = new progress.AnimationProgressIndicator();
					
			var bg = document.getElementById('sectionBackground');
			var alpha = {value:0};

			TweenHelper.to(alpha, .5, 1, {value:1}, TweenHelper.quad.EaseIn)
				.onUpdate((function(){ bg.style.opacity = alpha.value; }).bind(this))
				.onComplete((function(){ this._pageManager.showPage('webCam'); }).bind(this))
				.start();
		};
		
		
		p.getPageManager = function()
		{
			return this._pageManager;
		}
		
		
		p.destroy = function()
		{
			//METODO
		};
		
		
		namespace.RobotsManager.createSingleton = function(aBaseUrl, aTemplateFolder, aCentredHolderElement, aFullBrowserElement, aOverlayHolderElement) 
		{
			if (singletonsNamespace.RobotsManager === undefined) 
			{
				singletonsNamespace.RobotsManager = new namespace.RobotsManager();
				singletonsNamespace.RobotsManager.setup(aBaseUrl, aTemplateFolder, aCentredHolderElement, aFullBrowserElement, aOverlayHolderElement);
			}
			
			return singletonsNamespace.RobotsManager;
		};
		
		
		namespace.RobotsManager.getSingleton = function()
		{
			return singletonsNamespace.RobotsManager;
		};
	}
})();