/*
 * Stage
 *
 * Part of a Canvas animation system with a simple API and a flat display list.
 *
 * @description Stage is the stage on which you animate.
 * @author Adam Palmer
 *
 * @usage :
 *
 *	// instantiate and pass in a canvas to draw into
 *	var stage = new Stage(canvas);
 *
 * 	// update stage periodically
 *  stage.update();
 *
 *	// add, remove children
 *	stage.addChild(mySprite);
 *
 */


(function() {

    var namespace = WEBLAB.namespace('WEBLAB.utils.canvas.animation');


    if (namespace.Stage === undefined) {
        namespace.Stage = function(canvas, id) {
            this.id = id || 'no id';
            this.type = 'Stage';
            this.children = [];
            // this.updateCounter = 0;

            return this.init(canvas);
        }

        var p = namespace.Stage.prototype = new namespace.DisplayObject();


        p.addChild = function(child, id) {
            this.addChildAt(child, this.children.length, id);
        }


        p.addChildAt = function(child, index, id) {
            if (typeof child == 'function') child.type = 'GraphicsFunction';
            if (id) child.id = id;

            child.parent = this;
            this.children.splice(index, 0, child);
        }


        p.addChildUnder = function(child, aboveId, id) {
            // seems flaky under testing. 
            // not sure why, but multiple calls seem to interfere with each other. AP.

            var index = this.getChildIndexById(aboveId);
            this.addChildAt(child, index - 1, id);
        }


        p.removeChild = function(child) {
            var i = this.children.indexOf(child);

            if (i > -1) {
                child.parent = null;
                this.children.splice(i, 1);
            }
        }


        p.removeChildById = function(id) {
            for (var i = 0, n = this.children.length; i < n; ++i) {
                var child = this.children[i];

                if (child.id == id) {
                    child.parent = null;
                    this.children.splice(i, 1);
                    break;
                }
            }

            return child;
        }


        p.removeAllChildren = function() {
            this.children = [];
        }


        p.getChildById = function(id) {
            for (var i in this.children) {
                if (this.children[i].id == id) return this.children[i];
            }
        }


        p.setChildIndexById = function(id, index) {
            var child = this.removeChildById(id);
            this.addChildAt(child, index, id);
        }


        p.getChildIndexById = function(id) {
            var index;

            for (var i = 0, n = this.children.length; i < n; ++i) {
                if (this.children[i].id == id) index = i;
            }

            return i;
        }


        p.update = function() {
            // if (this.updateCounter % 60 == 0) console.log('STAGE', this.id, 'updating');
            // ++this.updateCounter;

            // clear
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.restore();

            // draw children to canvas
            for (var i = 0, n = this.children.length; i < n; ++i) {
                var child = this.children[i];

                if (typeof child == 'function') {
                    child(this.ctx);
                } else {
                    if (child.doUpdate) child.update();
                    if (child.visible && child.alpha > 0) child.render(this.ctx);
                }

            }
        }


        p.logDisplayList = function(tag) {
            var msg = '\n\t\tStage \'' + this.id + '\' display list:';
            if (tag) msg += '  == ' + tag + ' ==';

            for (var i = 0, n = this.children.length; i < n; ++i) {
                var child = this.children[i];
                msg += '\n\t\t\t' + i + ' >> ' + child.type + ': ' + child.id;
            }
            msg += '\n\n';

            console.log(msg);
        }
    }

})();
