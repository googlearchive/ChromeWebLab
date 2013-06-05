/*
Copyright (c) Arian Stolwijk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
/*
---
name: Picker.Date
description: Creates a DatePicker, can be used for picking years/months/days and time, or all of them
authors: Arian Stolwijk
requires: [Picker, Picker.Attach, Locale.en-US.DatePicker, More/Locale, More/Date]
provides: Picker.Date
...
*/


(function(){

this.DatePicker = Picker.Date = new Class({

	Extends: Picker.Attach,

	options: {/*
		onSelect: function(date){},

		minDate: new Date('3/4/2010'), // Date object or a string
		maxDate: new Date('3/4/2011'), // same as minDate
		availableDates: {}, //
		invertAvailable: false,

		format: null,*/

		timePicker: false,
		timePickerOnly: false, // deprecated, use onlyView = 'time'
		timeWheelStep: 1, // 10,15,20,30

		yearPicker: true,
		yearsPerPage: 20,

		startDay: 1, // Sunday (0) through Saturday (6) - be aware that this may affect your layout, since the days on the right might have a different margin
		rtl: false,

		startView: 'days', // allowed values: {time, days, months, years}
		openLastView: false,
		pickOnly: false, // 'years', 'months', 'days', 'time'
		canAlwaysGoUp: ['months', 'days'],
		updateAll : false, //whether or not to update all inputs when selecting a date

		weeknumbers: false,

		// if you like to use your own translations
		months_abbr: null,
		days_abbr: null,
		years_title: function(date, options){
			var year = date.get('year');
			return year + '-' + (year + options.yearsPerPage - 1);
		},
		months_title: function(date, options){
			return date.get('year');
		},
		days_title: function(date, options){
			return date.format('%b %Y');
		},
		time_title: function(date, options){
			return (options.pickOnly == 'time') ? Locale.get('DatePicker.select_a_time') : date.format('%d %B, %Y');
		}
	},

	initialize: function(attachTo, options){
		this.parent(attachTo, options);

		this.setOptions(options);
		options = this.options;

		// If we only want to use one picker / backwards compatibility
		['year', 'month', 'day', 'time'].some(function(what){
			if (options[what + 'PickerOnly']){
				options.pickOnly = what;
				return true;
			}
			return false;
		});
		if (options.pickOnly){
			options[options.pickOnly + 'Picker'] = true;
			options.startView = options.pickOnly;
		}

		// backward compatibility for startView
		var newViews = ['days', 'months', 'years'];
		['month', 'year', 'decades'].some(function(what, i){
			return (options.startView == what) && (options.startView = newViews[i]);
		});

		options.canAlwaysGoUp = options.canAlwaysGoUp ? Array.from(options.canAlwaysGoUp) : [];

		// Set the min and max dates as Date objects
		if (options.minDate){
			if (!(options.minDate instanceof Date)) options.minDate = Date.parse(options.minDate);
			options.minDate.clearTime();
		}
		if (options.maxDate){
			if (!(options.maxDate instanceof Date)) options.maxDate = Date.parse(options.maxDate);
			options.maxDate.clearTime();
		}

		if (!options.format){
			options.format = (options.pickOnly != 'time') ? Locale.get('Date.shortDate') : '';
			if (options.timePicker) options.format = (options.format) + (options.format ? ' ' : '') + Locale.get('Date.shortTime');
		}

		// Some link or input has fired an event!
		this.addEvent('attached', function(event, element){

			// This is where we store the selected date
			if (!this.currentView || !options.openLastView) this.currentView = options.startView;

			this.date = limitDate(new Date(), options.minDate, options.maxDate);
			var tag = element.get('tag'), input;
			if (tag == 'input') input = element;
			else {
				var index = this.toggles.indexOf(element);
				if (this.inputs[index]) input = this.inputs[index];
			}
			this.getInputDate(input);
			this.input = input;
			this.setColumns(this.originalColumns);
		}.bind(this), true);

	},

	getInputDate: function(input){
		this.date = new Date();
		if (!input) return;
		var date = Date.parse(input.get('value'));
		if (date == null || !date.isValid()){
			var storeDate = input.retrieve('datepicker:value');
			if (storeDate) date = Date.parse(storeDate);
		}
		if (date != null && date.isValid()) this.date = date;
	},

	// Control the previous and next elements

	constructPicker: function(){
		this.parent();

		if (!this.options.rtl){
			this.previous = new Element('div.previous[html=&#171;]').inject(this.header);
			this.next = new Element('div.next[html=&#187;]').inject(this.header);
		} else {
			this.next = new Element('div.previous[html=&#171;]').inject(this.header);
			this.previous = new Element('div.next[html=&#187;]').inject(this.header);
		}
	},

	hidePrevious: function(_next, _show){
		this[_next ? 'next' : 'previous'].setStyle('display', _show ? 'block' : 'none');
		return this;
	},

	showPrevious: function(_next){
		return this.hidePrevious(_next, true);
	},

	setPreviousEvent: function(fn, _next){
		this[_next ? 'next' : 'previous'].removeEvents('click');
		if (fn) this[_next ? 'next' : 'previous'].addEvent('click', fn);
		return this;
	},

	hideNext: function(){
		return this.hidePrevious(true);
	},

	showNext: function(){
		return this.showPrevious(true);
	},

	setNextEvent: function(fn){
		return this.setPreviousEvent(fn, true);
	},

	setColumns: function(columns, view, date, viewFx){
		var ret = this.parent(columns), method;

		if ((view || this.currentView)
			&& (method = 'render' + (view || this.currentView).capitalize())
			&& this[method]
		) this[method](date || this.date.clone(), viewFx);

		return ret;
	},

	// Render the Pickers

	renderYears: function(date, fx){
		var options = this.options, pages = options.columns, perPage = options.yearsPerPage,
			_columns = [], _dates = [];
		this.dateElements = [];

		// start neatly at interval (eg. 1980 instead of 1987)
		date = date.clone().decrement('year', date.get('year') % perPage);
	
		var iterateDate = date.clone().decrement('year', Math.floor((pages - 1) / 2) * perPage);

		for (var i = pages; i--;){
			var _date = iterateDate.clone();
			_dates.push(_date);
			_columns.push(renderers.years(
				timesSelectors.years(options, _date.clone()),
				options,
				this.date.clone(),
				this.dateElements,
				function(date){
					if (options.pickOnly == 'years') this.select(date);
					else this.renderMonths(date, 'fade');
					this.date = date;
				}.bind(this)
			));
			iterateDate.increment('year', perPage);
		}

		this.setColumnsContent(_columns, fx);
		this.setTitle(_dates, options.years_title);

		// Set limits
		var limitLeft = (options.minDate && date.get('year') <= options.minDate.get('year')),
			limitRight = (options.maxDate && (date.get('year') + options.yearsPerPage) >= options.maxDate.get('year'));
		this[(limitLeft ? 'hide' : 'show') + 'Previous']();
		this[(limitRight ? 'hide' : 'show') + 'Next']();

		this.setPreviousEvent(function(){
			this.renderYears(date.decrement('year', perPage), 'left');
		}.bind(this));

		this.setNextEvent(function(){
			this.renderYears(date.increment('year', perPage), 'right');
		}.bind(this));

		// We can't go up!
		this.setTitleEvent(null);

		this.currentView = 'years';
	},

	renderMonths: function(date, fx){
		var options = this.options, years = options.columns, _columns = [], _dates = [],
			iterateDate = date.clone().decrement('year', Math.floor((years - 1) / 2));
		this.dateElements = [];

		for (var i = years; i--;){
			var _date = iterateDate.clone();
			_dates.push(_date);
			_columns.push(renderers.months(
				timesSelectors.months(options, _date.clone()),
				options,
				this.date.clone(),
				this.dateElements,
				function(date){
					if (options.pickOnly == 'months') this.select(date);
					else this.renderDays(date, 'fade');
					this.date = date;
				}.bind(this)
			));
			iterateDate.increment('year', 1);
		}

		this.setColumnsContent(_columns, fx);
		this.setTitle(_dates, options.months_title);

		// Set limits
		var year = date.get('year'),
			limitLeft = (options.minDate && year <= options.minDate.get('year')),
			limitRight = (options.maxDate && year >= options.maxDate.get('year'));
		this[(limitLeft ? 'hide' : 'show') + 'Previous']();
		this[(limitRight ? 'hide' : 'show') + 'Next']();

		this.setPreviousEvent(function(){
			this.renderMonths(date.decrement('year', years), 'left');
		}.bind(this));

		this.setNextEvent(function(){
			this.renderMonths(date.increment('year', years), 'right');
		}.bind(this));

		var canGoUp = options.yearPicker && (options.pickOnly != 'months' || options.canAlwaysGoUp.contains('months'));
		var titleEvent = (canGoUp) ? function(){
			this.renderYears(date, 'fade');
		}.bind(this) : null;
		this.setTitleEvent(titleEvent);

		this.currentView = 'months';
	},

	renderDays: function(date, fx){
		var options = this.options, months = options.columns, _columns = [], _dates = [],
			iterateDate = date.clone().decrement('month', Math.floor((months - 1) / 2));
		this.dateElements = [];

		for (var i = months; i--;){
			_date = iterateDate.clone();
			_dates.push(_date);
			_columns.push(renderers.days(
				timesSelectors.days(options, _date.clone()),
				options,
				this.date.clone(),
				this.dateElements,
				function(date){
					if (options.pickOnly == 'days' || !options.timePicker) this.select(date)
					else this.renderTime(date, 'fade');
					this.date = date;
				}.bind(this)
			));
			iterateDate.increment('month', 1);
		}

		this.setColumnsContent(_columns, fx);
		this.setTitle(_dates, options.days_title);

		var yearmonth = date.format('%Y%m').toInt(),
			limitLeft = (options.minDate && yearmonth <= options.minDate.format('%Y%m')),
			limitRight = (options.maxDate && yearmonth >= options.maxDate.format('%Y%m'));
		this[(limitLeft ? 'hide' : 'show') + 'Previous']();
		this[(limitRight ? 'hide' : 'show') + 'Next']();

		this.setPreviousEvent(function(){
			this.renderDays(date.decrement('month', months), 'left');
		}.bind(this));

		this.setNextEvent(function(){
			this.renderDays(date.increment('month', months), 'right');
		}.bind(this));

		var canGoUp = options.pickOnly != 'days' || options.canAlwaysGoUp.contains('days');
		var titleEvent = (canGoUp) ? function(){
			this.renderMonths(date, 'fade');
		}.bind(this) : null;
		this.setTitleEvent(titleEvent);

		this.currentView = 'days';
	},

	renderTime: function(date, fx){
		var options = this.options;
		this.setTitle(date, options.time_title);

		var originalColumns = this.originalColumns = options.columns;
		this.currentView = null; // otherwise you'd get crazy recursion
		if (originalColumns != 1) this.setColumns(1);

		this.setContent(renderers.time(
			options,
			date.clone(),
			function(date){
				this.select(date);
			}.bind(this)
		), fx);

		// Hide « and » buttons
		this.hidePrevious()
			.hideNext()
			.setPreviousEvent(null)
			.setNextEvent(null);

		var canGoUp = options.pickOnly != 'time' || options.canAlwaysGoUp.contains('time');
		var titleEvent = (canGoUp) ? function(){
			this.setColumns(originalColumns, 'days', date, 'fade');
		}.bind(this) : null;
		this.setTitleEvent(titleEvent);

		this.currentView = 'time';
	},

	select: function(date, all){
		this.date = date;
		var formatted = date.format(this.options.format),
			time = date.strftime(),
			inputs = (!this.options.updateAll && !all && this.input) ? [this.input] : this.inputs;

		inputs.each(function(input){
			input.set('value', formatted).store('datepicker:value', time).fireEvent('change');
		}, this);

		this.fireEvent('select', [date].concat(inputs));
		this.close();
		return this;
	}

});


// Renderers only output elements and calculate the limits!

var timesSelectors = {

	years: function(options, date){
		var times = [];
		for (var i = 0; i < options.yearsPerPage; i++){
			times.push(+date);
			date.increment('year', 1);
		}
		return times;
	},

	months: function(options, date){
		var times = [];
		date.set('month', 0);
		for (var i = 0; i <= 11; i++){
			times.push(+date);
			date.increment('month', 1);
		}
		return times;
	},

	days: function(options, date){
		var times = [];
		date.set('date', 1);
		while (date.get('day') != options.startDay) date.set('date', date.get('date') - 1);
		for (var i = 0; i < 42; i++){
			times.push(+date);
			date.increment('day',  1);
		}
		return times;
	}

};

var renderers = {

	years: function(years, options, currentDate, dateElements, fn){
		var container = new Element('div.years'),
			today = new Date(), element, classes;

		years.each(function(_year, i){
			var date = new Date(_year), year = date.get('year');

			classes = '.year.year' + i;
			if (year == today.get('year')) classes += '.today';
			if (year == currentDate.get('year')) classes += '.selected';
			element = new Element('div' + classes, {text: year}).inject(container);

			dateElements.push({element: element, time: _year});

			if (isUnavailable('year', date, options)) element.addClass('unavailable');
			else element.addEvent('click', fn.pass(date));
		});

		return container;
	},

	months: function(months, options, currentDate, dateElements, fn){
		var today = new Date(),
			month = today.get('month'),
			thisyear = today.get('year'),
			selectedyear = currentDate.get('year'),
			container = new Element('div.months'),
			monthsAbbr = options.months_abbr || Locale.get('Date.months_abbr'),
			element, classes;

		months.each(function(_month, i){
			var date = new Date(_month), year = date.get('year');

			classes = '.month.month' + (i + 1);
			if (i == month && year == thisyear) classes += '.today';
			if (i == currentDate.get('month') && year == selectedyear) classes += '.selected';
			element = new Element('div' + classes, {text: monthsAbbr[i]}).inject(container);

			dateElements.push({element: element, time: _month});

			if (isUnavailable('month', date, options)) element.addClass('unavailable');
			else element.addEvent('click', fn.pass(date));
		});

		return container;
	},

	days: function(days, options, currentDate, dateElements, fn){
		var month = new Date(days[14]).get('month'),
			todayString = new Date().toDateString(),
			currentString = currentDate.toDateString(),
			weeknumbers = options.weeknumbers,
			container = new Element('table.days' + (weeknumbers ? '.weeknumbers' : ''), {
				role: 'grid', 'aria-labelledby': this.titleID
			}),
			header = new Element('thead').inject(container),
			body = new Element('tbody').inject(container),
			titles = new Element('tr.titles').inject(header),
			localeDaysShort = options.days_abbr || Locale.get('Date.days_abbr'),
			day, classes, element, weekcontainer, dateString,
			where = options.rtl ? 'top' : 'bottom';

		if (weeknumbers) new Element('th.title.day.weeknumber', {
			text: Locale.get('DatePicker.week')
		}).inject(titles);

		for (day = options.startDay; day < (options.startDay + 7); day++){
			new Element('th.title.day.day' + (day % 7), {
				text: localeDaysShort[(day % 7)],
				role: 'columnheader'
			}).inject(titles, where);
		}

		days.each(function(_date, i){
			var date = new Date(_date);

			if (i % 7 == 0){
				weekcontainer = new Element('tr.week.week' + (Math.floor(i / 7))).set('role', 'row').inject(body);
				if (weeknumbers) new Element('th.day.weeknumber', {text: date.get('week'), scope: 'row', role: 'rowheader'}).inject(weekcontainer);
			}

			dateString = date.toDateString();
			classes = '.day.day' + date.get('day');
			if (dateString == todayString) classes += '.today';
			if (date.get('month') != month) classes += '.otherMonth';
			element = new Element('td' + classes, {text: date.getDate(), role: 'gridcell'}).inject(weekcontainer, where);

			if (dateString == currentString) element.addClass('selected').set('aria-selected', 'true');
			else element.set('aria-selected', 'false');

			dateElements.push({element: element, time: _date});

			if (isUnavailable('date', date, options)) element.addClass('unavailable');
			else element.addEvent('click', fn.pass(date.clone()));
		});

		return container;
	},

	time: function(options, date, fn){
		var container = new Element('div.time'),
			// make sure that the minutes are timeWheelStep * k
			initMinutes = (date.get('minutes') / options.timeWheelStep).round() * options.timeWheelStep

		if (initMinutes >= 60) initMinutes = 0;
		date.set('minutes', initMinutes);

		var hoursInput = new Element('input.hour[type=text]', {
			title: Locale.get('DatePicker.use_mouse_wheel'),
			value: date.format('%H'),
			events: {
				click: function(event){
					event.target.focus();
					event.stop();
				},
				mousewheel: function(event){
					event.stop();
					hoursInput.focus();
					var value = hoursInput.get('value').toInt();
					value = (event.wheel > 0) ? ((value < 23) ? value + 1 : 0)
						: ((value > 0) ? value - 1 : 23)
					date.set('hours', value);
					hoursInput.set('value', date.format('%H'));
				}.bind(this)
			},
			maxlength: 2
		}).inject(container);

		var minutesInput = new Element('input.minutes[type=text]', {
			title: Locale.get('DatePicker.use_mouse_wheel'),
			value: date.format('%M'),
			events: {
				click: function(event){
					event.target.focus();
					event.stop();
				},
				mousewheel: function(event){
					event.stop();
					minutesInput.focus();
					var value = minutesInput.get('value').toInt();
					value = (event.wheel > 0) ? ((value < 59) ? (value + options.timeWheelStep) : 0)
						: ((value > 0) ? (value - options.timeWheelStep) : (60 - options.timeWheelStep));
					if (value >= 60) value = 0;
					date.set('minutes', value);
					minutesInput.set('value', date.format('%M'));
				}.bind(this)
			},
			maxlength: 2
		}).inject(container);

		new Element('div.separator[text=:]').inject(container);

		new Element('input.ok[type=submit]', {
			value: Locale.get('DatePicker.time_confirm_button'),
			events: {click: function(event){
				event.stop();
				date.set({
					hours: hoursInput.get('value').toInt(),
					minutes: minutesInput.get('value').toInt()
				});
				fn(date.clone());
			}}
		}).inject(container);

		return container;
	}

};


Picker.Date.defineRenderer = function(name, fn){
	renderers[name] = fn;
	return this;
};

var limitDate = function(date, min, max){
	if (min && date < min) return min;
	if (max && date > max) return max;
	return date;
};

var isUnavailable = function(type, date, options){
	var minDate = options.minDate,
		maxDate = options.maxDate,
		availableDates = options.availableDates,
		year, month, day, ms;

	if (!minDate && !maxDate && !availableDates) return false;
	date.clearTime();

	if (type == 'year'){
		year = date.get('year');
		return (
			(minDate && year < minDate.get('year')) ||
			(maxDate && year > maxDate.get('year')) ||
			(
				(availableDates != null &&  !options.invertAvailable) && (
					availableDates[year] == null ||
					Object.getLength(availableDates[year]) == 0 ||
					Object.getLength(
						Object.filter(availableDates[year], function(days){
							return (days.length > 0);
						})
					) == 0
				)
			)
		);
	}

	if (type == 'month'){
		year = date.get('year');
		month = date.get('month') + 1;
		ms = date.format('%Y%m').toInt();
		return (
			(minDate && ms < minDate.format('%Y%m').toInt()) ||
			(maxDate && ms > maxDate.format('%Y%m').toInt()) ||
			(
				(availableDates != null && !options.invertAvailable) && (
					availableDates[year] == null ||
					availableDates[year][month] == null ||
					availableDates[year][month].length == 0
				)
			)
		);
	}

	// type == 'date'
	year = date.get('year');
	month = date.get('month') + 1;
	day = date.get('date');

	var dateAllow = (minDate && date < minDate) || (minDate && date > maxDate);
	if (availableDates != null){
		dateAllow = dateAllow
			|| availableDates[year] == null
			|| availableDates[year][month] == null
			|| !availableDates[year][month].contains(day);
		if (options.invertAvailable) dateAllow = !dateAllow;
	}

	return dateAllow;
};

})();
