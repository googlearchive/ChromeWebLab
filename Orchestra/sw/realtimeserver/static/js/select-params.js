/**
* select-params.js: keep drop-down menus and URLs in sync
*
* Copyright Google Inc, 2013
* See LICENSE.TXT for licensing information.
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
