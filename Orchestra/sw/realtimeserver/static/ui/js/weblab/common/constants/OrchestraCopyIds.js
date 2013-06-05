/*
 * Copyright Google Inc, 2013
 * See LICENSE.TXT for licensing information.
 */

 (function(){
	
	var namespace = WEBLAB.namespace("WEBLAB.common.constants");
	
	if(namespace.OrchestraCopyIds === undefined) {
		
		var OrchestraCopyIds = function OrchestraCopyIds() {
			//MENOTE: do nothing
		};
		
		namespace.OrchestraCopyIds = OrchestraCopyIds;
		
		OrchestraCopyIds.TUTORIAL_INTRO_TITLES = ["orchestra/tutorial/intro/title/instrument0", "orchestra/tutorial/intro/title/instrument1", "orchestra/tutorial/intro/title/instrument2", "orchestra/tutorial/intro/title/instrument3", "orchestra/tutorial/intro/title/instrument4", "orchestra/tutorial/intro/title/instrument5", "orchestra/tutorial/intro/title/instrument6", "orchestra/tutorial/intro/title/instrument7"];
		
		OrchestraCopyIds.TUTORIAL_INTRO_BODY = "orchestra/tutorial/intro/body";
		
		OrchestraCopyIds.TUTORIAL_ADD_BLOB = "orchestra/tutorial/addBlob";
		OrchestraCopyIds.TUTORIAL_CHANGE_BLOB = "orchestra/tutorial/changeBlob";
		OrchestraCopyIds.TUTORIAL_OVER_HERE = "orchestra/tutorial/overHere";
		OrchestraCopyIds.TUTORIAL_REMOVE_BLOB = "orchestra/tutorial/removeBlob";
		OrchestraCopyIds.TUTORIAL_OTHER_USER_BLOBS = "orchestra/tutorial/otherUserBlobs";
		OrchestraCopyIds.TUTORIAL_NUMBER_OF_BLOBS = "orchestra/tutorial/numberOfBlobs";
		
		OrchestraCopyIds.HELP_ADD_REMOVE_BLOB = "orchestra/help/addRemoveBlob";
		OrchestraCopyIds.HELP_CHANGE_BLOB = "orchestra/help/changeBlob";
		OrchestraCopyIds.HELP_NUMBER_OF_BLOBS = "orchestra/help/numberOfBlobs";


		OrchestraCopyIds.QUEUE_LESS_THAN_HOURS = "orchestra/queue/lessThanHours";
		OrchestraCopyIds.QUEUE_LESS_THAN_MINUTES = "orchestra/queue/lessThanMinutes";
		OrchestraCopyIds.QUEUE_LESS_THAN_A_MINUTE = "orchestra/queue/lessThanAMinute";

		OrchestraCopyIds.QUEUE_NUMBER_PEOPLE = "orchestra/queue/numberPeople";
		OrchestraCopyIds.QUEUE_NUMBER_PERSON = "orchestra/queue/numberPerson";		

		OrchestraCopyIds.QUEUE_1N_IN_LINE = "orchestra/queue/1nInLine";		
		OrchestraCopyIds.QUEUE_2N_IN_LINE = "orchestra/queue/2nInLine";		
		OrchestraCopyIds.QUEUE_3N_IN_LINE = "orchestra/queue/3nInLine";		
		OrchestraCopyIds.QUEUE_N_IN_LINE = "orchestra/queue/nInLine";
	}
})();