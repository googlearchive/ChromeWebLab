/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function() {
	"use strict";
	
	var namespace = WEBLAB.namespace("WEBLAB.weblab.common.ui.page");
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	
	var ElementUtils = WEBLAB.namespace("WEBLAB.utils.htmldom").ElementUtils;
	
	if(namespace.Page === undefined) {
		
		var Page = function Page() {
			this._init();
		};
		
		namespace.Page = Page;
		
		var p = Page.prototype = new EventDispatcher();
		
		Page.CONFIRM_LEAVE_SECTION = "pageConfirmLeaveSection";
		Page.CANCEL_LEAVE_SECTION = "pageCancelLeaveSection";
		
		var s = EventDispatcher.prototype;
		
		p._init = function() {
			this._parent = null;
			this._element = null;
			
			this.showDefaultSubtitle = true;
			this._subtitleContent = null;
			this._pageName = null;
			
			this.__verticallyCenteredElements = null;
			
			this.transitionId = -1;
			this.destroyPageId = -1;
			
			this._transitionDuration = 1000;
			
			this._completeShowTransitionCallback = ListenerFunctions.createListenerFunction(this, this._completeShowTransition);
			this._completeHideTransitionCallback = ListenerFunctions.createListenerFunction(this, this._completeHideTransition);
			this._windowResizeCallback = ListenerFunctions.createListenerFunction(this, this._onWindowResize);
			this._destroyPageCallback = ListenerFunctions.createListenerFunction(this, this._destroyAfterTransiion);
		};
		
		p.setElement = function(aElement) {
			
			this._element = aElement;
			this._pageName = this._element.getAttribute("name");
			this._parent = aElement.parentNode;
			if(this.showDefaultSubtitle) {
				this._subtitleContent = this._element.querySelector("*[data-weblab-type='subtitleContent']");
			}
			
			this.__verticallyCenteredElements = this._element.getElementsByClassName("jsVerticallyCentered");
			
			return this;
		};
		
		p.getSubtitle = function() {
			return this._subtitleContent;
		};
		
		p._performVerticalCenteredLayout = function(aElementList) {
			for (var i = 0; i < aElementList.length; i++) {
				var el = aElementList[i];
				var parentHeight = el.parentNode.clientHeight;
				if (parentHeight > 0) {
					var elHeight = el.clientHeight;
					if (elHeight > 0){
						var topValue = parseInt((parentHeight - elHeight) / 2);
						el.style.setProperty("top", topValue + "px", "");
					}
				}
			}
		};
		
		p._onWindowResize = function(){
			this._performVerticalCenteredLayout(this.__verticallyCenteredElements);
		};
		
		p.show = function() {
			//console.log("show");
			if (this.__verticallyCenteredElements.length > 0) {
				this._performVerticalCenteredLayout(this.__verticallyCenteredElements);
			}
			
			window.addEventListener("resize", this._windowResizeCallback, false);
			
			this._performShowTransition();
		};
		
		p.hide = function() {
			window.removeEventListener("resize", this._windowResizeCallback, false);
			this._performHideTransition();
		};

		p.cancelHide = function() {
			if(this.transitionId !== -1) {
				clearTimeout(this.transitionId);
			}
			if (this.destroyPageId !== -1)
				clearTimeout(this.destroyPageId);
		};
		
		p._performShowTransition = function() {
			this.pageWillAppear();
			ElementUtils.addClass(this._element, "transitioning");
			ElementUtils.addClass(this._element, "visible");
			if(this.transitionId !== -1) {
				clearTimeout(this.transitionId);
			}
			if (this.destroyPageId !== -1)
				clearTimeout(this.destroyPageId);
			
			this.transitionId = setTimeout(this._completeShowTransitionCallback, this._transitionDuration);
		};
		
		p._completeShowTransition = function() {
			//console.log("WEBLAB.weblab.common.ui.page.Page::_completeShowTransition");
			//console.log(this, this._element);
			this.transitionId = -1;
			ElementUtils.removeClass(this._element, "transitioning");
			this.pageDidAppear();
		};
		
		p._performHideTransition = function() {
			this.pageWillDisappear();
			
			ElementUtils.addClass(this._element, "transitioning");
			ElementUtils.removeClass(this._element, "visible");
			if(this.transitionId !== -1) {
				clearTimeout(this.transitionId);
			}
			
			this.transitionId = setTimeout(this._completeHideTransitionCallback, this._transitionDuration);
		};
		
		p._completeHideTransition = function() {
			ElementUtils.removeClass(this._element, "transitioning");
			this.pageDidDisappear();

			if (this.destroyPageId !== -1)
				clearTimeout(this.destroyPageId);

			this.destroyPageId = setTimeout(this._destroyPageCallback, 500);
		};
		
		p.pageWillAppear = function() {}; // stubs, overridden by subclass
		p.pageDidAppear = function() {};
		p.pageWillDisappear = function() {};
		p.pageDidDisappear = function() {};
		
		p.getElement = function() {
			return this._element;
		};
		
		p.requestLeaveSection = function() {
			// override this method
			// this.dispatchCustomEvent(Page.CONFIRM_LEAVE_SECTION, null);
			return true;
		};
		
		p._destroyAfterTransiion = function() {
			this.transitionId = -1;
			this.destroy();
		}
		
		p.destroy = function() {
			// take the subtitle content back from the title container
			if(this._subtitleContent) {
				this._element.appendChild(this._subtitleContent);
			}
			if(this._element.parentNode) {
				this._element.parentNode.removeChild(this._element);
			}
			
			this._parent = null;
			this._element = null;
			this._subtitleContent = null;
			
			this.__verticallyCenteredElements = null;
			
			if(this.transitionId !== -1) {
				clearTimeout(this.transitionId);
			}
			window.removeEventListener("resize", this._windowResizeCallback, false);
			
			this._completeShowTransitionCallback = null;
			this._completeHideTransitionCallback = null;
			this._windowResizeCallback = null;
			this._destroyPageCallback = null;
			
			s.destroy.call(this);
		};
		
		p.navigate = function(aPageName) {
			// delegate stub, overidden by external class
			this.dispatchCustomEvent("navigate", aPageName);
		};
	}
})();