
function coeffFunction(){

	coeff = (punti.value / (1 - document.getElementById("runp").value/100)) / (devs.value * giorni.value - absences.value)
	document.getElementById("coeff").value = coeff
	velocit()
}	

function addRow() {
	var table = document.getElementById("myTable").getElementsByTagName('tbody')[0];
	var newRow = table.insertRow();
	
	var cell1 = newRow.insertCell(0);
	var cell2 = newRow.insertCell(1);
	var cell3 = newRow.insertCell(2);
	var cell4 = newRow.insertCell(3);
	
	cell1.innerHTML = "<input type=text value=\"name\">";
	cell2.innerHTML = "<input type=number value=\"100\" step=\"5\">";
	cell3.innerHTML = "<input type=number value=\"0\" step=\"0.5\">";
	cell4.innerHTML = '<button onclick="removeRow(this)">delete row</button>';
	velocit()
}

function removeRow(button) {
	var row = button.parentNode.parentNode;
	row.parentNode.removeChild(row);
	velocit()
}

function velocit(){
	myTable = document.getElementById("myTable")
	sprLen = parseFloat(sprintLength.value)
	coeffProd = document.getElementById("coeff").value
	totAbsences = 0
	totPresences = 0
	for (i = 1 ; i < myTable.rows.length; i++) {
		currPourcentage = parseFloat(myTable.rows[i].cells[1].getElementsByTagName("input")[0].value)
		currAbsences = parseFloat(myTable.rows[i].cells[2].getElementsByTagName("input")[0].value)
		totAbsences = currAbsences * currPourcentage /100 + totAbsences
		totPresences = (sprLen - currAbsences ) * currPourcentage /100 + totPresences
	}
	velocity = (totPresences * coeffProd) * (1 - document.getElementById("crunp").value/100) 

	document.getElementById("velo").innerHTML = "<p>"+velocity+"</p>"
}

function insertRow(name, pourcentage, absences) {
	var table = document.getElementById("myTable").getElementsByTagName('tbody')[0];
	var newRow = table.insertRow();
	
	var cell1 = newRow.insertCell(0);
	var cell2 = newRow.insertCell(1);
	var cell3 = newRow.insertCell(2);
	var cell4 = newRow.insertCell(3);
	
	cell1.innerHTML = "<input type=text value=\""+name+"\">";
	cell2.innerHTML = "<input type=number value=\""+pourcentage+"\" step=\"5\">";
	cell3.innerHTML = "<input type=number value=\""+absences+"\" step=\"0.5\">";
	cell4.innerHTML = '<button onclick="removeRow(this)">delete row</button>';
}


function addSprintReference(refVel, refDuration, refDevs, refTotalDaysAbsences, refRunPercentage){
	
	document.getElementById("punti").value = refVel
	document.getElementById("giorni").value = refDuration
	document.getElementById("devs").value = refDevs
	document.getElementById("absences").value = refTotalDaysAbsences
	document.getElementById("runp").value = parseInt(refRunPercentage)
}


function addCurrentSprint(currDuration, currRunPercentage){
	
	document.getElementById("sprintLength").value = currDuration
	document.getElementById("crunp").value = currRunPercentage

}