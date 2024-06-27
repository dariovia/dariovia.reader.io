function initSprintReference(){
	refVel = "15"
	refDuration = "10"
	refDevs = "3"
	refTotalDaysAbsences = "4"
	refRunPercentage = "35"
	
	addSprintReference(refVel, refDuration, refDevs, refTotalDaysAbsences, refRunPercentage)
}

function initCurrentSprint(){

	currDuration = "10"
	currRunPercentage = "0"
	
	addCurrentSprint(currDuration, currRunPercentage)
}

function initTeams(){
	insertRow("pippo","100","0");
	insertRow("pluto","100","0");
	insertRow("paperino","0","0");
	insertRow("ciccio di nonna papera","50","0");	
}
