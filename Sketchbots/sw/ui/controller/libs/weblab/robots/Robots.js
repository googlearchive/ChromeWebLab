/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */
WEBLAB.init = function()
{
	console.log("init");

	//DEPENDENCIES: use private vars
	var robots = WEBLAB.robots;	

	var robotsStart = new robots.RobotsStart();
	robotsStart.init();	

};

window.addEventListener('load', WEBLAB.init, false);