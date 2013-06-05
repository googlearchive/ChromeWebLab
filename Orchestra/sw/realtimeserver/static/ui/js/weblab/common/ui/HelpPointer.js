/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.common.ui");
	
	var ReplaceableContent = namespace.ReplaceableContent;
	
	var ArrayFunctions = WEBLAB.namespace("WEBLAB.utils.data").ArrayFunctions;
	var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;
	var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
	
	var DomElementCreator = WEBLAB.namespace("WEBLAB.utils.htmldom").DomElementCreator;
	var ElementUtils = WEBLAB.namespace("WEBLAB.utils.htmldom").ElementUtils;
	var Utils = WEBLAB.namespace("WEBLAB.utils").Utils;
	
	if(namespace.HelpPointer === undefined) {
		//console.log("WEBLAB.common.ui.HelpPointer");
		
		var HelpPointer = function HelpPointer() {
			this._init();
		};
		
		namespace.HelpPointer = HelpPointer;
		
		var p = HelpPointer.prototype = new EventDispatcher();
		
		p._init = function() {
			
			this._element = document.createElement("div");
			this._element.style.setProperty("position", "absolute", "");
			ElementUtils.addClass(this._element, "helpPointer");
			
			this._svgElement = DomElementCreator.createSvg(document);
			this._element.appendChild(this._svgElement);
			this._svgElement.style.setProperty("position", "absolute", "");
			this._groupElement = DomElementCreator.createSvgElement(this._svgElement, "g");
			this._groupTransform = this._svgElement.createSVGTransform();
			this._groupElement.transform.baseVal.appendItem(this._groupTransform);
			
			this._pointElement = DomElementCreator.createSvgElement(this._groupElement, "rect");
			this._pointElement.x.baseVal.value = -2;
			this._pointElement.y.baseVal.value = -2;
			this._pointElement.width.baseVal.value = 4;
			this._pointElement.height.baseVal.value = 4;
			this._pointElement.style.setProperty("opacity", 0, "");
			this._pointElement.style.setProperty("fill", "#000000", "");
			this._lineElement = DomElementCreator.createSvgElement(this._groupElement, "path");
			this._lineElement.style.setProperty("fill", "none", "");
			this._lineElement.style.setProperty("stroke", "#000000", "");
			
			this._topElement = DomElementCreator.createChild(this._element, "div");
			this._topElement.style.setProperty("position", "absolute", "");
			this._topContentElement = null;
			this._bottomElement = DomElementCreator.createChild(this._element, "div");
			this._bottomElement.style.setProperty("position", "absolute", "");
			this._bottomElement.id = "_bottomElement";
			this._bottomContentElement = null;
			
			this._topContent = ReplaceableContent.create(true, 10, 100);
			this._bottomContent = ReplaceableContent.create(false, 10, 100);
			this._topElement.appendChild(this._topContent.getElement());
			this._bottomElement.appendChild(this._bottomContent.getElement());
			
			this._topContentElement = null;
			this._bottomContentElement = null;
			this._topContentHolderElement = null;
			this._bottomContentHolderElement = null;
			
			this._width = 0;
			this._checkWidth = 0;
			this._height = 0;
			this._checkHeight = 0;
			this._bendLineLength = 0;
			this._restLineLength = 0;
			this._updateTopContentSize = true;
			this._updateBottomContentSize = true;
			
			this._animationValues = {"pointEnvelope": 0, "lineEnvelope": 0};
			this._updateTimeCallback = ListenerFunctions.createListenerFunction(this, this._updateTime);
			
			this._animationValuesTween = new TWEEN.Tween(this._animationValues).onUpdate(this._updateTimeCallback);
			
			return this;
		};
		
		p.getElement = function() {
			return this._element;
		};
		
		p.getTopContent = function() {
			return this._topContent;
		};
		
		p.getBottomContent = function() {
			return this._bottomContent;
		};

		p.getBottomElement = function() {
			return this._bottomElement;
		};
		
		p.setPosition = function(aX, aY) {
			this._element.style.setProperty("left", aX + "px", "");
			this._element.style.setProperty("top", aY + "px", "");
		};
		
		p.setMargins = function(aTopMargin, aBottomMargin) {
			this._topContent.setMargin(aTopMargin);
			this._bottomContent.setMargin(aBottomMargin);
			
			return this;
		};
		
		p.setUpdateContentSize = function(aUpdateTopContent, aUpdateBottomContent) {
			this._updateTopContentSize = aUpdateTopContent;
			this._updateBottomContentSize = aUpdateBottomContent;
		};
		
		p.setSize = function(aWidth, aHeight) {
			//console.log("WEBLAB.common.ui.HelpPointer::setSize");
			
			this._width = aWidth;
			this._height = aHeight;
			this._checkWidth = this._width;
			this._checkHeight = this._height;
			
			this._svgElement.style.setProperty("width", Math.max(4, (Math.abs(this._width)+2))+"px", "");
			this._svgElement.style.setProperty("height", Math.max(4, (Math.abs(this._height)+2))+"px", "");
			
			if(this._width >= 0) {
				this._groupTransform.matrix.e = 2;
				this._svgElement.style.setProperty("left", "-2px", "");
			}
			else {
				this._groupTransform.matrix.e = -1*this._width;
				this._svgElement.style.setProperty("left", (this._width)+"px", "");
			}
			
			if(this._height >= 0) {
				this._groupTransform.matrix.f = 2;
				this._svgElement.style.setProperty("top", "-2px", "");
			}
			else {
				this._groupTransform.matrix.f = -1*this._height;
				this._svgElement.style.setProperty("top", (this._height)+"px", "");
			}
			
			this._groupElement.transform.baseVal.clear();
			this._groupElement.transform.baseVal.appendItem(this._groupTransform);
			
			this._bendLineLength = Math.sqrt(2*Math.pow(this._height-4, 2));
			this._restLineLength = Math.abs(this._width)-Math.abs(this._height);
			
			this._topContent.setWidth(this._restLineLength);
			this._bottomContent.setWidth(this._restLineLength);
			
			if(this._width >= 0) {
				this._topElement.classList.add("right");
				this._topElement.classList.remove("left");
				this._bottomElement.classList.add("right");
				this._bottomElement.classList.remove("left");
			}
			else {
				this._topElement.classList.add("left");
				this._topElement.classList.remove("right");
				this._bottomElement.classList.add("left");
				this._bottomElement.classList.remove("right");
			}
			
			return this;
		};
		
		p._setupClipping = function() {
			
			this._topElement.style.setProperty("width", (this._restLineLength)+"px", "");
			this._topElement.style.setProperty("height", 0+"px", "");
			
			if(this._width >= 0) {
				this._topElement.style.setProperty("left", (this._width-this._restLineLength)+"px", "");
			}
			else {
				this._topElement.style.setProperty("left", (this._width)+"px", "");
			}
			this._topElement.style.setProperty("top", (this._height-this._topElement.clientHeight)+"px", "");
			
			this._bottomElement.style.setProperty("width", (this._restLineLength)+"px", "");
			this._bottomElement.style.setProperty("height", 0+"px", "");
			if(this._width >= 0) {
				this._bottomElement.style.setProperty("left", (this._width-this._restLineLength)+"px", "");
			}
			else {
				this._bottomElement.style.setProperty("left", (this._width)+"px", "");
			}
			this._bottomElement.style.setProperty("top", (this._height+1)+"px", "");
		};
		
		p.show = function() {
			
			this._setupClipping();
			
			//this._animationValuesTween.stop();
			this._animationValuesTween.to({"pointEnvelope": 1, "lineEnvelope": 1}, 0.4*1000).delay(0).easing(TWEEN.Easing.Quadratic.EaseOut).start();
			//this._animationValuesTween.to({"lineEnvelope": 1}, 0.4*1000).delay(0).easing(TWEEN.Easing.Quadratic.EaseOut).start();
			
			var maxWidth = -1;
			if(this._topContentElement !== null) {
				if(this._updateTopContentSize) {
					this._topContent.setWidth(this._checkWidth);
				}
				this._topContent.replaceContent(this._topContentHolderElement);
				if(this._updateTopContentSize) {
					maxWidth = Math.max(maxWidth, this._topContentElement.clientWidth+this._topContentElement.offsetLeft);
					console.log("maxWidth = " + maxWidth);
				}
			}
			if(this._bottomContentElement !== null) {
				if(this._updateBottomContentSize) {
					this._bottomContent.setWidth(this._checkHeight);
				}
				this._bottomContent.replaceContent(this._bottomContentHolderElement);
				if(this._updateBottomContentSize) {
					maxWidth = Math.max(maxWidth, this._bottomContentElement.clientWidth+this._bottomContentElement.offsetLeft);
				}
			}
			
			if(maxWidth > -1) {
				var multiplier = (this._width >= 0) ? 1 : -1;
				
				this.setSize(multiplier*(maxWidth+1+Math.abs(this._height)), this._height);
				this._setupClipping();
			}
			
			this._updateTime();
		};
		
		p.hide = function() {
			//this._animationValuesTween.stop();
			this._animationValuesTween.to({"pointEnvelope": 0, "lineEnvelope": 0}, 0.4*1000).delay(0.2*1000).easing(TWEEN.Easing.Quadratic.EaseOut).start();
			//this._animationValuesTween.to({"lineEnvelope": 0}, 0.4*1000).delay(0.2*1000).easing(TWEEN.Easing.Quadratic.EaseOut).start();
			
			this._topContent.hideContent();
			this._bottomContent.hideContent();
		};
		
		p.getContentWidth = function() {
			//METODO: calculate width of content
			return 100; //MEDEBUG
		};
		
		p.setContent = function(aTopContentElement, aBottomContentElement) {
			
			this._topContentElement = aTopContentElement;
			if(this._topContentElement !== null) {
				this._topContentHolderElement = document.createElement("div");
				this._topContentHolderElement.appendChild(this._topContentElement);								
			}
			
			this._bottomContentElement = aBottomContentElement;
			if(this._bottomContentElement !== null) {
				this._bottomContentHolderElement = document.createElement("div");
				this._bottomContentHolderElement.appendChild(this._bottomContentElement);
			}
			
			this._updateTime();
		};
		
		p.replaceContent = function(aTopContentElement, aBottomContentElement) {
			var maxWidth = -1;
			if(aTopContentElement !== this._topContentElement) {
				this._topContentHolderElement = document.createElement("div");
				this._topContentElement = aTopContentElement;
				this._topContentHolderElement.appendChild(this._topContentElement);
				if(this._topContentElement !== null) {
					if(this._updateTopContentSize) {
						this._topContent.setWidth(this._checkWidth);
					}
					this._topContent.replaceContent(this._topContentHolderElement);
					if(this._updateTopContentSize) {
						maxWidth = Math.max(maxWidth, this._topContentElement.clientWidth+this._topContentElement.offsetLeft);
						console.log("maxWidth = " + maxWidth + " for content : " + this._topContentElement);
					}
				}
			}
			if(aBottomContentElement !== this._bottomContentElement) {
				this._bottomContentHolderElement = document.createElement("div");
				this._bottomContentElement = aBottomContentElement;
				this._bottomContentHolderElement.appendChild(this._bottomContentElement);
				if(this._bottomContentElement !== null) {
					if(this._updateBottomContentSize) {
						this._bottomContent.setWidth(this._checkHeight);
					}
					this._bottomContent.replaceContent(this._bottomContentHolderElement);
					if(this._updateBottomContentSize) {
						maxWidth = Math.max(maxWidth, this._bottomContentElement.clientWidth+this._bottomContentElement.offsetLeft);
					}
				}
			}
			
			if(maxWidth > -1) {
				var multiplier = (this._width >= 0) ? 1 : -1;
				
				this.setSize(multiplier*(maxWidth+1+Math.abs(this._height)), this._height);
				this._setupClipping();
			}
			
			this._updateTime();
		};
		
		p._updateTime = function() {
			//console.log("WEBLAB.common.ui.HelpPointer::_updateTime");
			//console.log(this._animationValues.lineEnvelope, this._animationValues.contentEnvelope, this._animationValues.titleEnvelope);
			
			this._pointElement.style.setProperty("opacity", this._animationValues.pointEnvelope, "");
			
			var moveLength = this._animationValues.lineEnvelope*(this._bendLineLength+this._restLineLength);
			
			this._lineElement.pathSegList.clear();
			
			if(moveLength > 0) {
				
				var startPositionX = 4*(this._width/Math.abs(this._width));
				var startPositionY = 4*(this._height/Math.abs(this._height));
				
				this._lineElement.pathSegList.appendItem(this._lineElement.createSVGPathSegMovetoAbs(startPositionX, startPositionY));
				
				var bendPositionX = Math.max(4, Math.abs(this._height))*(this._width/Math.abs(this._width));
				var bendPositionY = this._height;
				
				if(moveLength > this._bendLineLength) {
					this._lineElement.pathSegList.appendItem(this._lineElement.createSVGPathSegLinetoAbs(bendPositionX, bendPositionY));
					var lengthParameter = (moveLength-this._bendLineLength)/this._restLineLength;
					this._lineElement.pathSegList.appendItem(this._lineElement.createSVGPathSegLinetoAbs(lengthParameter*this._width+(1-lengthParameter)*bendPositionX, lengthParameter*this._height+(1-lengthParameter)*bendPositionY));
				}
				else {
					var lengthParameter = moveLength/this._bendLineLength;
					this._lineElement.pathSegList.appendItem(this._lineElement.createSVGPathSegLinetoAbs(lengthParameter*bendPositionX+(1-lengthParameter)*startPositionX, lengthParameter*bendPositionY+(1-lengthParameter)*startPositionY));
				}
			}
		};
		
		p.destroy = function() {
			
			this._element = null;
			this._svgElement = null;
			this._groupElement = null;
			this._groupTransform = null;
			
			this._pointElement = null;
			this._lineElement = null;
			
			this._topElement = null;
			this._bottomElement = null;
			
			this._topContentElement = null;
			this._bottomContentElement = null;
			this._topContentHolderElement = null;
			this._bottomContentHolderElement = null;
			
			Utils.destroyIfExists(this._topContent);
			this._topContent = null;
			Utils.destroyIfExists(this._bottomContent);
			this._bottomContent = null;
			
			if(this._animationValuesTween !== null) {
				this._animationValuesTween.stop();
				this._animationValuesTween = null;
			}
			
			this._animationValues = null;
			this._updateTimeCallback = null;
			
			//WEBLAB.namespace("WEBLAB.utils.dev").DestroyVerification.verifyNoComplexObjects(this);
		};
		
		HelpPointer.create = function() {
			var newHelpPointer = new HelpPointer();
			return newHelpPointer;
		};
	}
})();