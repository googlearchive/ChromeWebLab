(function() {

    var namespace = WEBLAB.namespace("WEBLAB.utils.data");

    if (namespace.DateFunctions === undefined) {

        var DateFunctions = function DateFunctions() {
            //MENOTE: do nothing
        };

        namespace.DateFunctions = DateFunctions;

        DateFunctions.getLocalisedDate = function(aTimeMS, aLanguage) {

            aTimeMS = parseInt(aTimeMS);
            if (!aLanguage) aLanguage = "en-US";

            // adjust for timezone
            var offset = new Date().getTimezoneOffset();
            aTimeMS -= offset * 60 * 1000;

            var returnString = "";
            var dateTaken = new Date(aTimeMS);
            var hours = dateTaken.getUTCHours();
            hours = (hours < 10) ? '0' + hours : hours;
            var minutes = dateTaken.getUTCMinutes();
            minutes = (minutes < 10) ? '0' + minutes : minutes;

            var timeString = hours + ":" + minutes;

            var yearString = dateTaken.getFullYear();
            var month = dateTaken.getMonth() + 1;
            month = (month < 10) ? '0' + month : month;
            var day = dateTaken.getDate();
            day = (day < 10) ? '0' + day : day;

            var dateString = "";

            switch (aLanguage) {
                case "en-US":
                    dateString = month + "/" + day + "/" + yearString;
                    break;

                case "sv-SE":
                    dateString = day + "/" + month + " " + yearString;
                    break;

                default:
                    dateString = day + "/" + month + "/" + yearString;
                    break;
            }

            returnString = timeString + " " + dateString;

            return returnString;
        };
    }
})();
