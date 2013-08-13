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

    var namespace = WEBLAB.namespace("WEBLAB.orchestra.loading");

    var EventDispatcher = WEBLAB.namespace("WEBLAB.utils.events").EventDispatcher;
    var ListenerFunctions = WEBLAB.namespace("WEBLAB.utils.events").ListenerFunctions;

    if (namespace.BackendUrlGenerator === undefined) {

        var BackendUrlGenerator = function BackendUrlGenerator() {
            this._baseUrl = null;
            this._userId = null;
            this._liveSessionId = null;
            this._countryId = "ZZ";
        };

        namespace.BackendUrlGenerator = BackendUrlGenerator;

        var p = BackendUrlGenerator.prototype = new EventDispatcher();

        p.setup = function(aBaseUrl, aTemplateFolder, aUserId) {
            this._baseUrl = aBaseUrl;
            this._templateFolder = aTemplateFolder;
            this._userId = aUserId;

            return this;
        };

        p.setUserId = function(aUserId) {
            // *******
            // DEBUG
            // *******
            this._userId = aUserId;

            //this._userId = (Math.floor(Math.random() * 0x123456789abcd)).toString(36);
        };

        p.getUserId = function() {
            return this._userId + "_" + this._countryId;
        };

        p.setCountryCode = function(aCountryCode) {
            this._countryId = aCountryCode;
        };

        p.generateGetQueueStatusUrl = function() {
            var returnUrl = this._baseUrl + "getQueueStatus";

            return returnUrl;
        };

        p.generateGetQueueForInstrument = function(aInstrumentId) {
            var returnUrl = this._baseUrl + "getQueueForInstrument";

            var compoundId = this._userId + "_" + this._countryId;

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId;

            return returnUrl;
        };

        p.generateJoinQueueForInstrument = function(aInstrumentId, aForceKickout) {
            var returnUrl = this._baseUrl + "joinQueueForInstrument";

            var compoundId = this._userId + "_" + this._countryId;
            var forceKickoutString = (aForceKickout) ? "true" : "false";

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId + "&" + "forceKickout=" + forceKickoutString;

            return returnUrl;
        };

        p.generateLeaveQueueForInstrument = function(aInstrumentId) {
            var returnUrl = this._baseUrl + "removeFromQueueForInstrument";

            var compoundId = this._userId + "_" + this._countryId;

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId;

            return returnUrl;
        };

        p.generateGetQueueForInstrument = function(aInstrumentId) {
            var returnUrl = this._baseUrl + "getQueueForInstrument";

            var compoundId = this._userId + "_" + this._countryId;

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId;

            return returnUrl;
        };

        p.generateGetRealTimeServer = function(aInstrumentId) {
            var returnUrl = this._baseUrl + "getRealTimeServer";

            var compoundId = this._userId + "_" + this._countryId;

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId;

            return returnUrl;
        };

        p.generateLostRealTimeServer = function(aInstrumentId) {
            var returnUrl = this._baseUrl + "getRealTimeServer"; //this._baseUrl + "lostRealTimeServer"; //MEDEBUG. //

            var compoundId = this._userId + "_" + this._countryId;

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId;

            return returnUrl;
        };

        p.generateGetVirtualRealTimeServer = function(aInstrumentId, aRoomId) {
            var returnUrl = this._baseUrl + "getVirtualRealTimeServer";

            var compoundId = this._userId + "_" + this._countryId;

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId;
            if (aRoomId != null) {
                returnUrl += "&" + "room=" + aRoomId;
            }

            return returnUrl;
        };

        p.removeFromQueueForInstrument = function(aInstrumentId, aLabTagId) {

            var returnUrl = this._baseUrl + "removeFromQueueForInstrument";

            var compoundId = this._userId + "_" + this._countryId;

            returnUrl += "?" + "id=" + compoundId + "&" + "labTagId=" + compoundId + "&" + "instrumentId=" + aInstrumentId;

            return returnUrl;

        };

        p.generatePageTemplateUrl = function(aPageType) {
            var returnUrl = this._templateFolder + "orchestra/";

            switch (aPageType) {
                default:
                //METODO: error message
                case "start":
                    returnUrl += aPageType + ".html";
                    break;
            }

            return returnUrl;
        };

        p.destroy = function() {

        };

        BackendUrlGenerator.create = function(aBaseUrl, aUserId) {
            var newBackendUrlGenerator = new BackendUrlGenerator();
            newBackendUrlGenerator.setup(aBaseUrl, aUserId);
            return newBackendUrlGenerator;
        };
    }
})();
