/*
Copyright (c) Arian Stolwijk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
/*
---
name: Picker.Attach
description: Adds attach and detach methods to the Picker, to attach it to element events
authors: Arian Stolwijk
requires: [Picker, Core/Element.Event]
provides: Picker.Attach
...
*/


Picker.Attach = new Class({

    Extends: Picker,

    options: {
        /*
		onAttached: function(event){},

		toggleElements: null, // deprecated
		toggle: null, // When set it deactivate toggling by clicking on the input */
        togglesOnly: true, // set to false to always make calendar popup on input element, if true, it depends on the toggles elements set.
        showOnInit: false, // overrides the Picker option
        blockKeydown: true
    },

    initialize: function(attachTo, options) {
        this.parent(options);

        this.attachedEvents = [];
        this.attachedElements = [];
        this.toggles = [];
        this.inputs = [];

        var documentEvent = function(event) {
            if (this.attachedElements.contains(event.target)) return;
            this.close();
        }.bind(this);
        var document = this.picker.getDocument().addEvent('click', documentEvent);

        var preventPickerClick = function(event) {
            event.stopPropagation();
            return false;
        };
        this.picker.addEvent('click', preventPickerClick);

        // Support for deprecated toggleElements
        if (this.options.toggleElements) this.options.toggle = document.getElements(this.options.toggleElements);

        this.attach(attachTo, this.options.toggle);
    },

    attach: function(attachTo, toggle) {
        if (typeOf(attachTo) == 'string') attachTo = document.id(attachTo);
        if (typeOf(toggle) == 'string') toggle = document.id(toggle);

        var elements = Array.from(attachTo),
            toggles = Array.from(toggle),
            allElements = [].append(elements).combine(toggles),
            self = this;

        var closeEvent = function(event) {
            var stopInput = self.options.blockKeydown && event.type == 'keydown' && !(['tab', 'esc'].contains(event.key)),
                isCloseKey = event.type == 'keydown' && (['tab', 'esc'].contains(event.key)),
                isA = event.target.get('tag') == 'a';

            if (stopInput || isA) event.preventDefault();
            if (isCloseKey || isA) self.close();
        };

        var getOpenEvent = function(element) {
            return function(event) {
                var tag = event.target.get('tag');
                if (tag == 'input' && event.type == 'click' && !element.match(':focus') || (self.opened && self.input == element)) return;
                if (tag == 'a') event.stop();
                self.position(element);
                self.open();
                self.fireEvent('attached', [event, element]);
            };
        };

        var getToggleEvent = function(open, close) {
            return function(event) {
                if (self.opened) close(event);
                else open(event);
            };
        };

        allElements.each(function(element) {

            // The events are already attached!
            if (self.attachedElements.contains(element)) return;

            var events = {},
                tag = element.get('tag'),
                openEvent = getOpenEvent(element),
                // closeEvent does not have a depency on element
                toggleEvent = getToggleEvent(openEvent, closeEvent);

            if (tag == 'input') {
                // Fix in order to use togglers only
                if (!self.options.togglesOnly || !toggles.length) {
                    events = {
                        focus: openEvent,
                        click: openEvent,
                        keydown: closeEvent
                    };
                }
                self.inputs.push(element);
            } else {
                if (toggles.contains(element)) {
                    self.toggles.push(element);
                    events.click = toggleEvent
                } else {
                    events.click = openEvent;
                }
            }
            element.addEvents(events);
            self.attachedElements.push(element);
            self.attachedEvents.push(events);
        });
        return this;
    },

    detach: function(attachTo, toggle) {
        if (typeOf(attachTo) == 'string') attachTo = document.id(attachTo);
        if (typeOf(toggle) == 'string') toggle = document.id(toggle);

        var elements = Array.from(attachTo),
            toggles = Array.from(toggle),
            allElements = [].append(elements).combine(toggles),
            self = this;

        if (!allElements.length) allElements = self.attachedElements;

        allElements.each(function(element) {
            var i = self.attachedElements.indexOf(element);
            if (i < 0) return;

            var events = self.attachedEvents[i];
            element.removeEvents(events);
            delete self.attachedEvents[i];
            delete self.attachedElements[i];

            var toggleIndex = self.toggles.indexOf(element);
            if (toggleIndex != -1) delete self.toggles[toggleIndex];

            var inputIndex = self.inputs.indexOf(element);
            if (toggleIndex != -1) delete self.inputs[inputIndex];
        });
        return this;
    },

    destroy: function() {
        this.detach();
        return this.parent();
    }

});
