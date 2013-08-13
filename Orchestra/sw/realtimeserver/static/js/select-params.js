/**
 * select-params.js: keep drop-down menus and URLs in sync
 *
 */

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

var NUM_INSTRUMENTS = 2;

// get params
// 
var params = $.deparam(location.search.replace(/^\?/, ""));

// default instrument 0
params.instrument = params.instrument ? parseInt(params.instrument) : 0;

/**
 * Init options menus
 */
$(document).ready(function() {
    // Instruments menu: populate
    // 
    for (var i = 0; i < NUM_INSTRUMENTS; i++) {
        $('.instrument select').append("<option value=\"" + i + "\">Instrument " + i + "</option>");
    }

    // Menus: init selection
    // 
    $('.video select').val(params.video);
    $('.instrument select').val(params.instrument);

    // Menus: init on change
    // 
    $('select').change(function() {
        if ($('.video select').length) params.video = $('.video select').val();
        if ($('.instrument select').length) params.instrument = $('.instrument select').val();
        location = location.pathname + "?" + $.param(params);
    });
});
