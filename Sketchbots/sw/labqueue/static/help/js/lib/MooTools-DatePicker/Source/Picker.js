/*
Copyright (c) Arian Stolwijk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
/*
---
name: Picker
description: Creates a Picker, which can be used for anything
authors: Arian Stolwijk
requires: [Core/Element.Dimensions, Core/Fx.Tween, Core/Fx.Transitions]
provides: Picker
...
*/


var Picker = new Class({

    Implements: [Options, Events],

    options: {
        /*
		onShow: function(){},
		onOpen: function(){},
		onHide: function(){},
		onClose: function(){},*/

        pickerClass: 'datepicker',
        inject: null,
        animationDuration: 400,
        useFadeInOut: true,
        positionOffset: {
            x: 0,
            y: 0
        },
        pickerPosition: 'bottom',
        draggable: true,
        showOnInit: true,
        columns: 1,
        footer: false
    },

    initialize: function(options) {
        this.setOptions(options);
        this.constructPicker();
        if (this.options.showOnInit) this.show();
    },

    constructPicker: function() {
        var options = this.options;

        var picker = this.picker = new Element('div', {
            'class': options.pickerClass,
            styles: {
                left: 0,
                top: 0,
                display: 'none',
                opacity: 0
            }
        }).inject(options.inject || document.body);
        picker.addClass('column_' + options.columns);

        if (options.useFadeInOut) {
            picker.set('tween', {
                duration: options.animationDuration,
                link: 'cancel'
            });
        }

        // Build the header
        var header = this.header = new Element('div.header').inject(picker);

        var title = this.title = new Element('div.title').inject(header);
        var titleID = this.titleID = 'pickertitle-' + String.uniqueID();
        this.titleText = new Element('div', {
            'role': 'heading',
            'class': 'titleText',
            'id': titleID,
            'aria-live': 'assertive',
            'aria-atomic': 'true'
        }).inject(title);

        this.closeButton = new Element('div.closeButton[text=x][role=button]')
            .addEvent('click', this.close.pass(false, this))
            .inject(header);

        // Build the body of the picker
        var body = this.body = new Element('div.body').inject(picker);

        if (options.footer) {
            this.footer = new Element('div.footer').inject(picker);
            picker.addClass('footer');
        }

        // oldContents and newContents are used to slide from the old content to a new one.
        var slider = this.slider = new Element('div.slider', {
            styles: {
                position: 'absolute',
                top: 0,
                left: 0
            }
        }).set('tween', {
            duration: options.animationDuration,
            transition: Fx.Transitions.Quad.easeInOut
        }).inject(body);

        this.newContents = new Element('div', {
            styles: {
                position: 'absolute',
                top: 0,
                left: 0
            }
        }).inject(slider);

        this.oldContents = new Element('div', {
            styles: {
                position: 'absolute',
                top: 0
            }
        }).inject(slider);

        this.originalColumns = options.columns;
        this.setColumns(options.columns);

        // IFrameShim for select fields in IE
        var shim = this.shim = window['IframeShim'] ? new IframeShim(picker) : null;

        // Dragging
        if (options.draggable && typeOf(picker.makeDraggable) == 'function') {
            this.dragger = picker.makeDraggable(shim ? {
                onDrag: shim.position.bind(shim)
            } : null);
            picker.setStyle('cursor', 'move');
        }
    },

    open: function(noFx) {
        if (this.opened == true) return this;
        this.opened = true;
        var picker = this.picker.setStyle('display', 'block').set('aria-hidden', 'false')
        if (this.shim) this.shim.show();
        this.fireEvent('open');
        if (this.options.useFadeInOut && !noFx) {
            picker.fade('in').get('tween').chain(this.fireEvent.pass('show', this));
        } else {
            picker.setStyle('opacity', 1);
            this.fireEvent('show');
        }
        return this;
    },

    show: function() {
        return this.open(true);
    },

    close: function(noFx) {
        if (this.opened == false) return this;
        this.opened = false;
        this.fireEvent('close');
        var self = this,
            picker = this.picker,
            hide = function() {
                picker.setStyle('display', 'none').set('aria-hidden', 'true');
                if (self.shim) self.shim.hide();
                self.fireEvent('hide');
            };
        if (this.options.useFadeInOut && !noFx) {
            picker.fade('out').get('tween').chain(hide);
        } else {
            picker.setStyle('opacity', 0);
            hide();
        }
        return this;
    },

    hide: function() {
        return this.close(true);
    },

    toggle: function() {
        return this[this.opened == true ? 'close' : 'open']();
    },

    destroy: function() {
        this.picker.destroy();
        if (this.shim) this.shim.destroy();
    },

    position: function(x, y) {
        var offset = this.options.positionOffset,
            scroll = document.getScroll(),
            size = document.getSize(),
            pickersize = this.picker.getSize();

        if (typeOf(x) == 'element') {
            var element = x,
                where = y || this.options.pickerPosition;

            var elementCoords = element.getCoordinates();

            x = (where == 'left') ? elementCoords.left - pickersize.x : (where == 'bottom' || where == 'top') ? elementCoords.left : elementCoords.right
            y = (where == 'bottom') ? elementCoords.bottom : (where == 'top') ? elementCoords.top - pickersize.y : elementCoords.top;
        }

        x += offset.x * ((where && where == 'left') ? -1 : 1);
        y += offset.y * ((where && where == 'top') ? -1 : 1);

        if ((x + pickersize.x) > (size.x + scroll.x)) x = (size.x + scroll.x) - pickersize.x;
        if ((y + pickersize.y) > (size.y + scroll.y)) y = (size.y + scroll.y) - pickersize.y;
        if (x < 0) x = 0;
        if (y < 0) y = 0;

        this.picker.setStyles({
            left: x,
            top: y
        });
        if (this.shim) this.shim.position();
        return this;
    },

    setBodySize: function() {
        var bodysize = this.bodysize = this.body.getSize();

        this.slider.setStyles({
            width: 2 * bodysize.x,
            height: bodysize.y
        });
        this.oldContents.setStyles({
            left: bodysize.x,
            width: bodysize.x,
            height: bodysize.y
        });
        this.newContents.setStyles({
            width: bodysize.x,
            height: bodysize.y
        });
    },

    setColumnContent: function(column, content) {
        var columnElement = this.columns[column];
        if (!columnElement) return this;

        var type = typeOf(content);
        if (['string', 'number'].contains(type)) columnElement.set('text', content);
        else columnElement.empty().adopt(content);

        return this;
    },

    setColumnsContent: function(content, fx) {
        var old = this.columns;
        this.columns = this.newColumns;
        this.newColumns = old;

        content.forEach(function(_content, i) {
            this.setColumnContent(i, _content);
        }, this);
        return this.setContent(null, fx);
    },

    setColumns: function(columns) {
        var _columns = this.columns = new Elements,
            _newColumns = this.newColumns = new Elements;
        for (var i = columns; i--;) {
            _columns.push(new Element('div.column').addClass('column_' + (columns - i)));
            _newColumns.push(new Element('div.column').addClass('column_' + (columns - i)));
        }

        var oldClass = 'column_' + this.options.columns,
            newClass = 'column_' + columns;
        this.picker.removeClass(oldClass).addClass(newClass);

        this.options.columns = columns;
        return this;
    },

    setContent: function(content, fx) {
        if (content) return this.setColumnsContent([content], fx);

        // swap contents so we can fill the newContents again and animate
        var old = this.oldContents;
        this.oldContents = this.newContents;
        this.newContents = old;
        this.newContents.empty();

        this.newContents.adopt(this.columns);

        this.setBodySize();

        if (fx) {
            this.fx(fx);
        } else {
            this.slider.setStyle('left', 0);
            this.oldContents.setStyles({
                left: 0,
                opacity: 0
            });
            this.newContents.setStyles({
                left: 0,
                opacity: 1
            });
        }
        return this;
    },

    fx: function(fx) {
        var oldContents = this.oldContents,
            newContents = this.newContents,
            slider = this.slider,
            bodysize = this.bodysize;
        if (fx == 'right') {
            oldContents.setStyles({
                left: 0,
                opacity: 1
            });
            newContents.setStyles({
                left: bodysize.x,
                opacity: 1
            });
            slider.setStyle('left', 0).tween('left', 0, -bodysize.x);
        } else if (fx == 'left') {
            oldContents.setStyles({
                left: bodysize.x,
                opacity: 1
            });
            newContents.setStyles({
                left: 0,
                opacity: 1
            });
            slider.setStyle('left', -bodysize.x).tween('left', -bodysize.x, 0);
        } else if (fx == 'fade') {
            slider.setStyle('left', 0);
            oldContents.setStyle('left', 0).set('tween', {
                duration: this.options.animationDuration / 2
            }).tween('opacity', 1, 0).get('tween').chain(function() {
                oldContents.setStyle('left', bodysize.x);
            });
            newContents.setStyles({
                opacity: 0,
                left: 0
            }).set('tween', {
                duration: this.options.animationDuration
            }).tween('opacity', 0, 1);
        }
    },

    toElement: function() {
        return this.picker;
    },

    setTitle: function(content, fn) {
        if (!fn) fn = Function.from;
        this.titleText.empty().adopt(
            Array.from(content).map(function(item, i) {
                return typeOf(item) == 'element' ? item : new Element('div.column', {
                    text: fn(item, this.options)
                }).addClass('column_' + (i + 1));
            }, this)
        );
        return this;
    },

    setTitleEvent: function(fn) {
        this.titleText.removeEvents('click');
        if (fn) this.titleText.addEvent('click', fn);
        this.titleText.setStyle('cursor', fn ? 'pointer' : '');
        return this;
    }

});
