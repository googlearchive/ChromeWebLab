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
(function() {

    var ExperimentIds = WEBLAB.namespace("WEBLAB.common.constants").ExperimentIds;
    var SiteManagerBasic = WEBLAB.namespace("WEBLAB.common").SiteManagerBasic;

    document.addEventListener("DOMContentLoaded", (function() {
        //check if it's a deeplink to the tech tab
        var hashes = window.location.hash.split('#');
        var isDeeplinkToTech = (hashes.indexOf("tech") == -1) ? false : true;
        var isDeeplinkToBrowserTech = (hashes.indexOf("browserTech") == -1) ? false : true;
        //create SiteManagerBasic
        SiteManagerBasic.createSingleton();
        //set up SiteManagerBasic :
        SiteManagerBasic.getSingleton().setup(document.getElementById("siteHolder"), ["/files/xml/common/files.xml", "/files/xml/robots/files.xml"], true, ExperimentIds.SAND_ROBOTS);
        //add a listener to know when everything has been loaded
        SiteManagerBasic.getSingleton().addStartFunction(function() {
            // define references to classes loaded here
            var RobotsManager = WEBLAB.namespace("WEBLAB.robots").RobotsManager;
            var SiteManager = WEBLAB.namespace("WEBLAB.common").SiteManager;
            // Create the SiteManeger
            SiteManager.createSingleton(SiteManagerBasic.getSingleton(), document.getElementById("siteHolder"), document.getElementsByClassName("globalUI")[0], document.getElementById("sectionDialogLayer"), document.getElementById("staticLabReportLayer"));
            SiteManager.getSingleton().setTechnologyTemplateId("robots/technology");
            // Setup the rest when SiteManager is ready (once login status is checked)
            SiteManager.getSingleton().addStartFunction(function() {
                // Hide the section loader (if it has loader)
                SiteManagerBasic.getSingleton().hideLoader();

                SiteManagerBasic.getSingleton().addLoaderHiddenFunction(function() {
                    // Setup the homepage
                    RobotsManager.createSingleton(
                        "http://localhost:8084/", "../files/",
                        document.getElementById("sectionCenteredContent"),
                        document.getElementById("sectionFullBrowserContent"),
                        document.getElementById("sectionDialogLayer")
                    );

                    RobotsManager.getSingleton().start();
                    if (isDeeplinkToTech) SiteManager.getSingleton().showTech();
                    if (isDeeplinkToBrowserTech) SiteManager.getSingleton().showTech();
                });
            });

            SiteManager.getSingleton().start();
        }, false);
        //Start loading files
        SiteManagerBasic.getSingleton().start();

    }), false);
})();
