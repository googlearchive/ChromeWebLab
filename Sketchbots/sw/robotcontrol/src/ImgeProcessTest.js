/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
process.on('uncaughtException', function(err) {
  console.log(err);
});

var ImageProcessingManager = require('./ImageProcessingManager').ImageProcessingManager;
var imageProcessingManager = new ImageProcessingManager();

imageProcessingManager.imageRequestEnd();