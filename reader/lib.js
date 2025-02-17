var filterArr = [];
var filterArrNegative = [];
var filterArrRegular = [];

function initData(){
	platform = urlParams.get('csv'); 
	csvfile = "";
	if (typeof confHash !== "undefined"){
			if (confHash[platform])
				csvfile=confHash[platform];
	}
	entries = urlParams.entries();	
}

function getData(currentUrlCsv){
	const digits_only = string => [...string].every(c => '0123456789'.includes(c));
	if (currentUrlCsv != "")
		fetch(currentUrlCsv)
		  .then(
			function(response) {
			    for (var pair of response.headers.entries()) {
					if (pair[0] === 'last-modified'){
						var par= document.createElement("p");
						var t = document.createTextNode("File generated on : " + pair[1]);
						par.appendChild(t);
						document.getElementById("fileLastModified").appendChild(par);
					}
						//document.getElementById("fileLastModified").text = "File generated on : " + pair[1]; 
				}
			  if (response.status !== 200) {
				console.log('Looks like there was a problem. Status Code: ' +
				  response.status);
				return;
			  }
			  // Examine the text in the response
			  response.text().then(function(datacsv) {
							
			  var lines = datacsv.split("\n"), tab = [], i; tab_tophead = [];
			  
			  tabHeaderTH = "";
			  for (i = 0 ; i < lines[0].split(",").length; i++){
			    if (i==0) {
					tabHeaderTH += "<td>" + lines[0].split(",")[i] + "</td>";
				}
				else{
					tabHeaderTH += "<td>"+ "<input type=\"checkbox\" value=\"hide\" id=\"col_"+i+"\" onchange=\"hide_show_table(this.id);\">" + lines[0].split(",")[i] + "</td>";
				}
				
			  }				  
			  tab_tophead.push("<tr>"+tabHeaderTH+"</tr>");
			  
			  tabHeader = "";  
			  for (i = 0 ; i < lines[0].split(",").length; i++){
				//tabHeader += "<th class=\"col_"+i+"\">" + lines[0].split(",")[i] + "</th>";
				tabHeader += "<th class=\"col_"+i+"\"> <button onclick=\"sortTable("+i+")\">" + lines[0].split(",")[i] + "</button></th>";
				filterArr[i] = "";
				filterArrRegular[i] = "";
				filterArrNegative[i] = "";
			  }		  

			  tab.push("<tr>"+tabHeader+"</tr>");
			  
			  tabFilter = "";
			  tabCounter = "";
			  tabFilterNegative = "";
			  for (i = 0 ; i < lines[0].split(",").length; i++){
				tabFilter += "<th class=\"col_"+i+"\">" + "<input type=\"text\" id=\"myFilter"+i+"\" onkeyup=\"filterFunction("+i+")\" placeholder=\"match filter\">" + "</th>"
				tabFilterNegative += "<th class=\"col_"+i+"\">" + "<input type=\"text\" id=\"myFilterNegative"+i+"\" onkeyup=\"filterFunction("+i+")\" placeholder=\"exclude filter\">" + "</th>"
				txtValue = lines[0].split(",")[i];
				if ((txtValue.indexOf("#") != -1) || (txtValue.indexOf("(int)") != -1) || (i==0))
					tabCounter += "<th class=\"col_"+i+"\">total " + "<input type=\"text\" id=\"myCounter"+i+"\" value=\"0\" disabled >" + "</th>"
				else
					tabCounter += "<th class=\"col_"+i+"\">" + "</th>"
			  }
			  tab.push("<tr>"+tabFilter+"</tr>");
			  tab.push("<tr>"+tabFilterNegative+"</tr>");
			  tab.push("<tr>"+tabCounter+"</tr>");
			  
			  for (i = 1; i < lines.length; i++) {
			    tr_arr = lines[i].slice(0).split(",");
				trtemp = "";
				for (j = 0; j < tr_arr.length; j++){
				//link-----------
					if (lines[0].slice(0).split(",")[j].includes("link")) {
						tr_arr[j] = "<a href=\""+tr_arr[j]+"\" target=\"_blank\">"+ tr_arr[j] + "</a>"
					}
				//----end link----
					trtemp += "<td class=\"col_"+j+"\">"+tr_arr[j]+"</td>";
				}
				tab.push("<tr>"+trtemp+"</tr>");
			  }
				
				tab = "<table>" + tab.join("") + "</table>";
							
				document.getElementById("vxlans").innerHTML = tab;
				document.getElementById("tophead").innerHTML = tab_tophead;
				//
				filterFunction(0, lines[0].split(","));
				filterEntry.forEach(callFilter)
			  });		  
			}
		  )
		  .catch(function(err) {
			console.log('Fetch Error :-S', err);
		  });  	
}

function callFilter(item, index){
	filterFunction(index,"")
}

function filterFunction(index, firstLine) {	
  // Declare variables
  var input, filter, table, tr, i, txtValue, inputNegative, filterNegative;
  const digits_only = string => [...string].every(c => '0123456789'.includes(c));

  input = document.getElementById("myFilter"+index);
  
  filterEntry = new Map(); 

  if (typeof entries != 'undefined')
	  for(const entry of entries) {
			key = entry[0];
			value = entry[1];
			indexFirstLine = 0;
			for(elt of firstLine) {
				if (key === elt.trim()) {
					if (document.getElementById("myFilter"+indexFirstLine).value == "") {
						document.getElementById("myFilter"+indexFirstLine).value = value;
						filterEntry.set(indexFirstLine, entry[0]+":"+entry[1]);
					}
				}
				indexFirstLine = indexFirstLine + 1
			}
	  }
	  
/*  if (index == 0) {
	if (input.value=="") {
		input.value=filtre;
		filtre="";
	}
  }*/

  if (input){
	filterArr[index] = input.value.toUpperCase();
	filterArrRegular[index] = input.value;
  }
  else{
	filterArr[index] = "";
	filterArrRegular[index] = "";
  }
  
  inputNegative = document.getElementById("myFilterNegative"+index);
  if (inputNegative)
	filterNegative = inputNegative.value.toUpperCase();
  else
    filterNegative = "";
  filterArrNegative[index] = filterNegative;  
  
  table = document.getElementById("vxlans");
  tr = table.getElementsByTagName("tr");
  //var tdini = tr[3].getElementsByTagName("td");
  var tdini = tr[4].getElementsByTagName("td");

  for(j = 0; j < filterArr.length; j++){
	idCounter = "myCounter"+j;

	txtValue = tdini[j].textContent || tdini[j].innerText;
	if ((digits_only(txtValue) &&(document.getElementById(idCounter) !== null)) || (j == 0)) {
		document.getElementById(idCounter).value = 0;
	}
  }  
  
  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
	var tdarr = tr[i].getElementsByTagName("td");
	if (tdarr.length == filterArr.length){
		var matchFilter = true;
		isMatchingValidRegex = false
		for(j = 0; j < filterArr.length; j++){
			txtValue = tdarr[j].textContent || tdarr[j].innerText;
			try {
				regexFilter = RegExp(filterArrRegular[j]);
				isMatchingValidRegex = regexFilter.test(txtValue)
			} 
			catch(e) {
				isMatchingValidRegex = false;
			}	
			if ((txtValue.toUpperCase().indexOf(filterArr[j]) == -1)&&(!isMatchingValidRegex)) {
				matchFilter = false;
				break;
			}
		}
		var matchFilterNegative = true;
		for(j = 0; j < filterArrNegative.length; j++){
			txtValue = tdarr[j].textContent || tdarr[j].innerText;
			if ((txtValue.toUpperCase() == filterArrNegative[j])&&(txtValue !== ""))  {
				matchFilterNegative = false;
				break;
			}
		}
		if ((matchFilter) && (matchFilterNegative)){
			tr[i].style.display = "";
			for(j = 0; j < filterArr.length; j++){
				idCounter = "myCounter"+j;
				txtValue = tdarr[j].textContent || tdarr[j].innerText;
				if ((isNaN(Math.round(txtValue)) === false) && document.getElementById(idCounter) !== null){
				//if (digits_only(txtValue) && document.getElementById(idCounter) !== null){
					lastValue = parseInt(document.getElementById(idCounter).value);
					//document.getElementById(idCounter).value = lastValue + parseInt(txtValue) ;
					document.getElementById(idCounter).value = lastValue + parseInt(Math.round(txtValue)) ;
				} else if (j==0){
					lastValue = parseInt(document.getElementById(idCounter).value);
					document.getElementById(idCounter).value = lastValue + 1;
				} 
			}
		}
		else
			tr[i].style.display = "none";
	} 
  }
} 

function hide_show_table(col_name){
 var checkbox_val=document.getElementById(col_name).value;
 if(checkbox_val=="hide")
 {
  var all_col=document.getElementsByClassName(col_name);
  for(var i=0;i<all_col.length;i++)
  {
   all_col[i].style.display="none";
  }
  document.getElementById(col_name).value="show";
 }
	
 else
 {
  var all_col=document.getElementsByClassName(col_name);
  for(var i=0;i<all_col.length;i++)
  {
   all_col[i].style.display="table-cell";
  }
  document.getElementById(col_name).value="hide";
 }
}

function updateCsvFile(){
	document.getElementById("urlCsv").value = document.getElementById("urlCsvMenu").value
}

function createTable(datacsv,tablabel,tablabeltop){
	const digits_only = string => [...string].every(c => '0123456789'.includes(c));
	filterArr = [];
	filterArrNegative = [];
	filterArrRegular = [];
	  // Examine the text in the response
				
	  var lines = datacsv.split("\n"), tab = [], i; tab_tophead = [];
	  
	  tabHeaderTH = "";
	  for (i = 0 ; i < lines[0].split(",").length; i++){
		if (i==0) {
			tabHeaderTH += "<td>" + lines[0].split(",")[i] + "</td>";
		}
		else{
			tabHeaderTH += "<td>"+ "<input type=\"checkbox\" value=\"hide\" id=\"col_"+i+"\" onchange=\"hide_show_table(this.id);\">" + lines[0].split(",")[i] + "</td>";
		}
		
	  }				  
	  tab_tophead.push("<tr>"+tabHeaderTH+"</tr>");
	  
	  tabHeader = "";  
	  for (i = 0 ; i < lines[0].split(",").length; i++){
		tabHeader += "<th class=\"col_"+i+"\"> <button onclick=\"sortTable("+i+")\">" + lines[0].split(",")[i] + "</button></th>";
		filterArr[i] = "";
		filterArrRegular[i] = "";
		filterArrNegative[i] = "";
	  }		  

	  tab.push("<tr>"+tabHeader+"</tr>");
	  tabFilter = "";
	  tabCounter = "";
	  
	  for (i = 0 ; i < lines[0].split(",").length; i++){
				tabFilter += "<th class=\"col_"+i+"\">" + "<input type=\"text\" id=\"myFilter"+i+"\" onkeyup=\"filterFunction("+i+")\" placeholder=\"match filter\">" + "</th>"

				txtValue = lines[0].split(",")[i];
				if ((txtValue.indexOf("#") != -1) || (txtValue.indexOf("(int)") != -1) || (i==0))
					tabCounter += "<th class=\"col_"+i+"\">total " + "<input type=\"text\" id=\"myCounter"+i+"\" value=\"0\" disabled >" + "</th>"
				else
					tabCounter += "<th class=\"col_"+i+"\">" + "</th>"
			  }
			  tab.push("<tr>"+tabFilter+"</tr>");
			  tab.push("<tr>"+tabCounter+"</tr>");
					  
			  for (i = 1; i < lines.length; i++) {
			    tr_arr = lines[i].slice(0).split(",");
				trtemp = "";
				for (j = 0; j < tr_arr.length; j++){
				//link-----------
					if (lines[0].slice(0).split(",")[j].includes("link")) {
						tr_arr[j] = "<a href=\""+tr_arr[j]+"\" target=\"_blank\">"+ tr_arr[j] + "</a>"
					}
				//----end link----
					trtemp += "<td class=\"col_"+j+"\">"+tr_arr[j]+"</td>";
				}
				tab.push("<tr>"+trtemp+"</tr>");
			  }
				
				tab = "<table>" + tab.join("") + "</table>";
				
		document.getElementById(tablabel).innerHTML = tab;
		document.getElementById(tablabeltop).innerHTML = tab_tophead;
		filterFunction(0, lines[0].split(","));
		filterEntry.forEach(callFilter)   	
}

function getDataJson(currentUrlCsv){
	const digits_only = string => [...string].every(c => '0123456789'.includes(c));
	if (currentUrlCsv != "")
		fetch(currentUrlCsv)
		  .then(
			function(response) {
			    for (var pair of response.headers.entries()) {
					if (pair[0] === 'last-modified'){
						var par= document.createElement("p");
						var t = document.createTextNode("File generated on : " + pair[1]);
						par.appendChild(t);
						document.getElementById("fileLastModified").appendChild(par);
					}
						//document.getElementById("fileLastModified").text = "File generated on : " + pair[1]; 
				}
			  if (response.status !== 200) {
				console.log('Looks like there was a problem. Status Code: ' +
				  response.status);
				return;
			  }
			  // Examine the text in the response
			  response.text().then(function(datacsv) {
			
				jsonstra= csvJSON(datacsv)
				document.write(jsonstra)
						
			  });		  
			}
		  )
		  .catch(function(err) {
			console.log('Fetch Error :-S', err);
		  });  	
}

function csvJSON(csv){

  var lines=csv.split("\n");

  var result = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }
  
  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

function bubbleSortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch;
  if (window.confirm("Do you really want to sort the table? The operation may take some time to be complete"))
  {
	  table = document.getElementById("vxlans");
	  switching = true;
	  /*Make a loop that will continue until
	  no switching has been done:*/
	  while (switching) {
		//start by saying: no switching is done:
		switching = false;
		rows = table.rows;
		/*Loop through all table rows (except the
		first, which contains table headers):*/
		for (i = 0; i < (rows.length - 1); i++) {
		  //start by saying there should be no switching:
		  shouldSwitch = false;
		  /*Get the two elements you want to compare,
		  one from current row and one from the next:*/
		  x = rows[i].getElementsByTagName("td")[n];
		  //console.log(rows[i].getElementsByTagName("td")[0].innerText)
		  y = rows[i + 1].getElementsByTagName("td")[n];
		  //check if the two rows should switch place:
		  if ((typeof x !== 'undefined')&&(typeof y !== 'undefined')&&(x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase())) {
			//if so, mark as a switch and break the loop:
		   shouldSwitch = true;
		   break;
		  }
		}
		if (shouldSwitch) {
		  /*If a switch has been marked, make the switch
		  and mark that a switch has been done:*/
		  rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
		  switching = true;
		}
	  }
  }
}

function sortTable(n){
	table = document.getElementById("vxlans");
	rows = table.rows
	//update button
	for (i = 0 ; i < rows[0].getElementsByTagName("th").length; i++){
		strButton = rows[0].getElementsByTagName("th")[i].innerHTML
		strButton = strButton.replace(" (sort by)</button>","</button>")
		if (i == n) {		
			strButton = strButton.replace("</button>"," (sort by)</button>")
		}
		rows[0].getElementsByTagName("th")[i].innerHTML= strButton		
	}		  

	arrRows= Array.from(rows);
	
	indtd= 0
	for (i = 0; i < (rows.length - 1); i++) {
		x = rows[i].getElementsByTagName("td")
		if ( x.length == 0)
			indtd = indtd + 1
	}
	arrNew = mergeSort(n,arrRows.slice(indtd))

	hhh = arrNew.length
	for(i = 0; i < hhh; i++) {
		rows[indtd-1+i].parentNode.appendChild(arrNew[i])
		j=indtd+i
	}
}

function mergeSort(n,arr){
   var len = arr.length;
   if(len <2)
      return arr;
   var mid = Math.floor(len/2),
       left = arr.slice(0,mid),
       right =arr.slice(mid);
   //send left and right to the mergeSort to broke it down into pieces
   //then merge those
   return merge(n, mergeSort(n,left),mergeSort(n,right));
}

function merge(n, left, right){
  var result = [],
      lLen = left.length,
      rLen = right.length,
      l = 0,
      r = 0;
	sortColumn = rows[0].getElementsByTagName("th")[n].getElementsByTagName("button")[0].textContent
	isANumber = sortColumn.startsWith('#')

  while(l < lLen && r < rLen){
	x = left[l].getElementsByTagName("td")[n]
	y = right[r].getElementsByTagName("td")[n]
	if (typeof x !== 'undefined'){
		ll = left[l].getElementsByTagName("td")[n].innerHTML.toLowerCase()
		if (typeof y !== 'undefined'){
			rr = right[r].getElementsByTagName("td")[n].innerHTML.toLowerCase()
			if (isANumber) {
				if (isNaN(Math.round(rr)) === false)
					rrr = parseInt(Math.round(rr))
				else
					rrr = 0;

				if (isNaN(Math.round(ll)) === false)
					lll = parseInt(Math.round(ll))
				else
					lll = 0;
				if(lll < rrr){
					result.push(left[l++]);
				}
				else {
					result.push(right[r++]);
				}
			}
			else {		
				if(ll < rr){
					result.push(left[l++]);
				}
				else {
					result.push(right[r++]);
				}
			}
		}
		else
		{
			result.push(left[l++]);
		}
	}
	else
	{
		result.push(right[r++]);
	}	  
  }  
  //remaining part needs to be addred to the result
  return result.concat(left.slice(l)).concat(right.slice(r));
}

function tableToCSV(linenbr) {
	//extract csv filename
	filename = document.getElementById("filename").files[0].name;
	
	//extract first line
	firstLine = "";
	for(i=0; i < document.getElementById("filecsvtabletop").rows[0].cells.length; i++){
		firstLine = firstLine + document.getElementById("filecsvtabletop").rows[0].cells[i].textContent.replace(/[\r\n]/gm, '')
		if (i < document.getElementById("filecsvtabletop").rows[0].cells.length - 1){
			firstLine = firstLine + ",";
		}
	};
	firstLine = firstLine.trim() + "\n";
	
	// Variable to store the final csv data
	let csv_data = [];

	// Get each row data
	let rows = document.getElementsByTagName('tr');
	
	for (let i = linenbr; i < rows.length -2; i++) {

		// Get each column data
		let cols = rows[i].querySelectorAll('td,th');

		// Stores each csv row data
		let csvrow = [];
		for (let j = 0; j < cols.length-1; j++) {

			// Get the text data of each cell
			// of a row and push it to csvrow
			csvrow.push(cols[j].innerHTML.trim());
		}

		// Combine each column value with comma
		csv_data.push(csvrow.join(","));
	}

	// Combine each row data with new line character
	csv_data = firstLine +  csv_data.join('\n');

	// Call this function to download csv file 
	
	//console.log(csv_data)
	downloadCSVFile(csv_data, filename);
}

function downloadCSVFile(csv_data, filename) {

	// Create CSV file object and feed
	// our csv_data into it
	CSVFile = new Blob([csv_data], {
		type: "text/csv"
	});

	// Create to temporary link to initiate
	// download process
	let temp_link = document.createElement('a');

	// Download csv file
	temp_link.download = filename;
	let url = window.URL.createObjectURL(CSVFile);
	temp_link.href = url;

	// This link should not be displayed
	temp_link.style.display = "none";
	document.body.appendChild(temp_link);

	// Automatically click the link to
	// trigger download
	temp_link.click();
	document.body.removeChild(temp_link);
}

function createInputTable(addrowtable,vxlans){
	addrowtable = document.getElementById(addrowtable);
	addrowtable.innerHTML = '';
	vxlanstable = document.getElementById(vxlans);
	row = addrowtable.insertRow(0);
	for (j = 0; j < vxlanstable.rows[0].cells.length-1; j++){
		cell = row.insertCell(j);
		cell.innerHTML = vxlanstable.rows[0].cells[j].innerText;	
	}
	cell = row.insertCell(vxlanstable.rows[0].cells.length -1);
	
	row = addrowtable.insertRow(1);
	for (j = 0; j < vxlanstable.rows[0].cells.length-1; j++){
		cell = row.insertCell(j);
		cell.innerHTML = "<input type='text' id='newcell"+j+"' size = '15' onkeyup='newFilterFunction("+j+")'>";	
	}
	cellf = row.insertCell(vxlanstable.rows[0].cells.length -1);
	cellf.innerHTML = "<button  onclick = 'addNewRow()'>add row</button>";
}

function newFilterFunction(index){
	document.getElementById("myFilter"+index).value = document.getElementById("newcell"+index).value;
	filterFunction(index)
}

function addNewRow(){
	
	if (document.getElementById("newcell0").value == ""){
		
	}
	else {
		tablev = document.getElementById("vxlans");
		row = tablev.insertRow(tablev.rows.length);
		lastIndex = tablev.rows.length -1
		cellInARow = tablev.rows[0].cells.length
		for (j = 0; j < cellInARow; j++){

			cell = row.insertCell(j);
			cell.className  = "col_"+j
			
			idNewcell = "newcell"+j
			if (document.getElementById(idNewcell) !== null){
				txtValue = document.getElementById(idNewcell).value
				cell.id = "modifcell_"+lastIndex+"_"+j
				
				cell.innerHTML = txtValue;
				cell.outerHTML = "<td ondblclick='modifyCell("+lastIndex+","+j+")'"+cell.outerHTML.split("<td ")[1]
				//update counters
				idCounter = "myCounter"+j;
				if ((isNaN(Math.round(txtValue)) === false) && document.getElementById(idCounter) !== null){
					lastValue = parseInt(document.getElementById(idCounter).value);

					document.getElementById(idCounter).value = lastValue + parseInt(Math.round(txtValue));
				} else if (j==0){
					lastValue = parseInt(document.getElementById(idCounter).value);

					document.getElementById(idCounter).value = lastValue + 1;
				}				
				document.getElementById("newcell"+j).value = "";
			}
			else{
				cell.innerHTML = " <button type='button' id='deleteindex"+lastIndex+"' class=button onclick='deleteRowInTable("+lastIndex+")'> X </button>";
			}
			//document.getElementById("myFilter"+j).value = ""					
		}	

	}
	
}

function deleteRowInTable(lastIndex){
	tablev = document.getElementById("vxlans");
	for (j = 0; j < tablev.rows[lastIndex].cells.length; j++){
		if (tablev.rows[lastIndex].cells[j].textContent){
			txtValue = tablev.rows[lastIndex].cells[j].textContent|| tablev.rows[lastIndex].cells[j].innerText;
			idCounter = "myCounter"+j;
			if ((isNaN(Math.round(txtValue)) === false) && document.getElementById(idCounter) !== null){
				lastValue = parseInt(document.getElementById(idCounter).value);
				document.getElementById(idCounter).value = lastValue - parseInt(Math.round(txtValue));
			} else if (j==0){
				lastValue = parseInt(document.getElementById(idCounter).value);
				document.getElementById(idCounter).value = lastValue - 1;
			}
		}
	}
	tablev.deleteRow(lastIndex)
	lastColumnIndex=tablev.rows[0].cells.length-1
	for (j = 3; j < tablev.rows.length; j++){
		 //tablev.rows[j].cells[lastColumnIndex].innerHTML = " <button type='button' id='deleteindex"+j+"' style='background-color:red;color:white' onclick='deleteRowInTable("+j+")'> X </button>";
		 tablev.rows[j].cells[lastColumnIndex].innerHTML = " <button type='button' id='deleteindex"+j+"' class='button' onclick='deleteRowInTable("+j+")' title='Delete row'> X </button>";
	}
	
}

function addDeleteColumn(idtable){
	
	tablev = document.getElementById(idtable);
	for (j = 0; j < tablev.rows.length; j++){
		indexcol = tablev.rows[j].cells.length;
		if (j>2){
			cell = tablev.rows[j].insertCell();			
			cell.className = "col_"+indexcol
			//cell.innerHTML = " <button type='button' id='deleteindex"+j+"' style='background-color:red;color:white' onclick='deleteRowInTable("+j+")'> X </button>";
			cell.innerHTML = " <button type='button' id='deleteindex"+j+"' class='button' onclick='deleteRowInTable("+j+")' title='Delete row'> X </button>";
		}
		else{
			
			if (j==1){
				//tablev.rows[j].insertCell().outerHTML = "<th class='col_"+indexcol+"'><input type='checkbox' id='myFilter"+indexcol+"' disabled></th>";
				tablev.rows[j].insertCell().outerHTML = "<th class='col_"+indexcol+"'><button type='button' onclick='resetFilter()'>reset filter</button></th>";
				
			}
			else
				tablev.rows[j].insertCell().outerHTML = "<th class='col_"+indexcol+"'></th>";
		}
	}
	filterArr.push("")
	
}

function resetFilter(){
	tablev = document.getElementById("vxlans");
	cellInARow = tablev.rows[0].cells.length

	for (j = 0; j < cellInARow -1; j++){
		document.getElementById("myFilter"+j).value = ""
	}
	for (i = 0; i < cellInARow -1; i++) {
		filterFunction(i)
	}
}

function makeTableEditable(idtable){
	tablev = document.getElementById("vxlans");
	for (i = 3; i < tablev.rows.length;i++){
		row = tablev.rows[i]
		for (j = 0; j < row.cells.length -1;j++){
			cell = row.cells[j]
			idcell = "modifcell_"+ i + "_" + j
			cell.id = idcell
			cell.outerHTML = "<td ondblclick='modifyCell("+i+","+j+")'"+cell.outerHTML.split("<td ")[1]
		}
	}
	
}

function modifyCell(i,j){
	//console.log(i,j)
	cellId = "modifcell_"+ i + "_" + j
	cell = document.getElementById(cellId)
	celltext = cell.innerText
	cellhtml = cell.outerHTML
	
	
	splitOHArr = cell.outerHTML.split(">"+celltext+"<")
	cell.outerHTML = splitOHArr[0]+">"+"<textarea id=textarea_"+cellId+" onblur=submitCell("+i+","+j+")>"+celltext+"</textarea>"+"<"+splitOHArr[1]
	
	//cell.outerHTML = cellhtml.replace(celltext,"<textarea id=textarea_"+cellId+" onblur=submitCell("+i+","+j+")>"+celltext+"</textarea>")
	
}

function submitCell(i,j){
	taId = "textarea_" + "modifcell_"+ i + "_" + j
	cellId = "modifcell_"+ i + "_" + j
	cellText = document.getElementById(taId).value

	//<td ondblclick="modifyCell(5,1)" class="col_1" id="modifcell_5_1"><textarea id="textarea_modifcell_5_1" onblur="submitCell(5,1)">MATEMATICA</textarea></td>
	document.getElementById(cellId).outerHTML = "<td ondblclick='modifyCell("+i+","+j+")'" + " class=col_"+j + " id="+cellId + ">"+cellText+"</td>"
	//console.log(i,j, document.getElementById(taId).value, document.getElementById(cellId).outerHTML)
}
	
function loadFile(currentUrlCsv){
	const digits_only = string => [...string].every(c => '0123456789'.includes(c));
	if (currentUrlCsv != "")
		fetch(currentUrlCsv)
		  .then(
			function(response) {
			    for (var pair of response.headers.entries()) {
					if (pair[0] === 'last-modified'){
						var par= document.createElement("p");
						var t = document.createTextNode("File generated on : " + pair[1]);
						par.appendChild(t);
						document.getElementById("fileLastModified").appendChild(par);
					} 
				}
				if (response.status !== 200) {
					console.log('Looks like there was a problem. Status Code: ' + response.status);
					return;
				}
				// Examine the text in the response
				response.text().then(function(datacsv) {	
					var lines = datacsv.split("\n"), tab_request = [];
					
					tabHeaderTH = "";
					tabDropdown = "";
					arrLine1 = lines[0].split(",")
					for (i = 0 ; i < arrLine1.length; i++){
							tabHeaderTH += "<td>" + arrLine1[i] + "</td>";
					}
					tab_request.push("<tr>"+tabHeaderTH+"</tr>");
					document.getElementById("requests").innerHTML = tab_request;
					
					table = document.getElementById("requests")
					row = table.insertRow()
					for (i = 0 ; i < arrLine1.length; i++){
						cell = row.insertCell(i);
						idcell = "request_"+ i 
						cell.outerHTML = "<td><input id="+idcell+" onblur=\"setButtons()\"></input></td>"
						//cell.outerHTML = "<td><input id="+idcell+" ></input></td>"
					} 
					
					for (i = 1; i < lines.length; i++) {
						row = table.insertRow()
						col = lines[i].slice(0).split(",");
						for (j = 0 ; j < col.length; j++){
							cell = row.insertCell(j);
							cell.outerHTML = "<td>"+col[j]+"</td>"				
						}
						row.style.display = "none"
					}

				});		  
			}
		  )
		  .catch(function(err) {
			console.log('Fetch Error :-S', err);
		  });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomNumbersFromSet(set, n) {
    const arrayFromSet = Array.from(set); // Converte il Set in un array
    
    if (n > arrayFromSet.length) {
        throw new Error("N è maggiore del numero di elementi disponibili nell'insieme!");
    }

    const shuffled = arrayFromSet.sort(() => Math.random() - 0.5); // Mescola gli elementi
    return shuffled.slice(0, n); // Prende i primi N elementi mescolati
}

function generateTable(array, mytable, rowRand) {
    table = document.getElementById(mytable);
	table.innerHTML = "";
	for (j=0; j< table.rows.length; j++)
		table.deleteRow(table.rows.length-1)
	//console.log(table)
	index = 0
    array.forEach(item => {
        let row = document.createElement("tr"); // Crea una riga

        let cell1 = document.createElement("td");
        cell1.textContent = item; // Inserisce la stringa

        let cell2 = document.createElement("td");
		cell2.style.width = '20px';
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox"; // Crea il checkbox
		checkbox.id = "checkbox_generated_" + index
		

		//checkbox.onchange = setQuery(index)
        cell2.appendChild(checkbox);

		let cell3 = document.createElement("td");
		cell3.id = "col_dom_"+index

        row.appendChild(cell1);
        row.appendChild(cell2);
		row.appendChild(cell3);
        table.appendChild(row);
		
		truncTD = table.rows[index].cells[1].outerHTML.split("></td>")[0]
		
		newTD = truncTD + " onchange=\"setQuery("+index+","+rowRand+")\"></td>"
		
		table.rows[index].cells[1].outerHTML = newTD
		
		index++
    });
}

function setQuery(col, rowRand){
	table = document.getElementById("requests")
	checkbox = document.getElementById("checkbox_generated_" + col)
	
	
	if (checkbox.checked){		
		//console.log(table.rows[0].cells[col].innerText,col,table.rows[rowRand].cells[col].innerText)
		document.getElementById("request_"+col).value = table.rows[rowRand].cells[col].innerText
		document.getElementById("col_dom_"+col).innerText =  table.rows[rowRand].cells[col].innerText
		document.getElementById("haveQuestion").disabled = true
		document.getElementById("haveQuestion").setAttribute("class", "button disabled");
		document.getElementById("showResponse").disabled = false
		document.getElementById("showResponse").setAttribute("class", "button");
	}
	else{
		document.getElementById("request_"+col).value = ""
		document.getElementById("col_dom_"+col).innerText = ""
	}				
		
		
}

function chooseColumns(){
	document.getElementById("haveQuestion").disabled = true
	document.getElementById("haveQuestion").setAttribute("class", "button disabled");
	document.getElementById("showResponse").disabled = true
	document.getElementById("showResponse").setAttribute("class", "button disabled");
	document.getElementById("chooseColumns").disabled = true
	document.getElementById("chooseColumns").setAttribute("class", "button disabled");
	table = document.getElementById("requests")
	for (j=0; j< table.rows[0].cells.length; j++){
		document.getElementById("request_"+j).value = ""
		document.getElementById("domanda").innerText = ""
	}
	rowRand = getRandomInt(2, table.rows.length-1)
	generateTable(table.rows[0].outerText.split("\t"), "chooseColTable",rowRand)

}

function haveQuestion(){
	table = document.getElementById("requests")
	rowRand = getRandomInt(2, table.rows.length-1)
	
	rangeCol = new Set()
	
	for (i=0; i< table.rows[0].cells.length; i++){
		if (table.rows[0].cells[i].innerText.startsWith("*") == false){			
			rangeCol.add(i); 
		}		
	}	
	
	if (rangeCol.size - 1 > 4)
		count = 4
	else
		count = rangeCol.size - 1
	
	colRandSet = getRandomNumbersFromSet(rangeCol,count)
	stringRequest = "<div id=\"domanda\"><br>richiesta: <br><ul>"
	
	for (i=0; i< colRandSet.length; i++){
		//console.log(table.rows[rowRand].cells[colRandSet[i]].innerText)
		//console.log(document.getElementById("request_"+colRandSet[i]).value) 
		document.getElementById("request_"+colRandSet[i]).value = table.rows[rowRand].cells[colRandSet[i]].innerText
		stringRequest = stringRequest + "<li>" + table.rows[0].cells[colRandSet[i]].innerText + " = " + table.rows[rowRand].cells[colRandSet[i]].innerText + "</li>"
	}
	//console.log(document.getElementById("domanda"))
	document.getElementById("domanda").outerHTML = stringRequest+"</ul></div>"
	document.getElementById("haveQuestion").disabled = true
	document.getElementById("haveQuestion").setAttribute("class", "button disabled");
	document.getElementById("showResponse").disabled = false
	document.getElementById("showResponse").setAttribute("class", "button");
	document.getElementById("chooseColumns").disabled = true
	document.getElementById("chooseColumns").setAttribute("class", "button disabled");
	
}

function showResponse(){
	table = document.getElementById("requests")
	resetTable("requests")
	inputArray = []
	showBool = false
	filterOn = false
	for (y = 0; y < table.rows[0].cells.length; y++){
		inval = document.getElementById("request_"+y).value
		if (inval !== ""){
			filterOn = true
		}	
		inputArray[y] = inval	
	}
	
	if (filterOn){
		for (i = 2; i < table.rows.length; i++){
			showBool = false		
			for (j = 0; j < table.rows[i].cells.length; j++){			
				if (inputArray[j] !== ""){					
					if ((table.rows[i].cells[j].innerHTML == inputArray[j])&&(inputArray[j]!=="")){
						showBool = true
					}
					else{
						showBool = false
						break
					}
				}
			}	
			if (showBool){
				table.rows[i].outerHTML = table.rows[i].outerHTML.replace("style=\"display: none;\"","")
			}
		}
	}
	document.getElementById("showResponse").disabled = true
	document.getElementById("showResponse").setAttribute("class", "button disabled");
}

function resetTable(tableName){
	table = document.getElementById(tableName)
	for (i = 2; i < table.rows.length; i++){
		table.rows[i].style.display = "none"
	}
}

function resetRequest(){
	table = document.getElementById("requests")
	for (y = 0; y < table.rows[0].cells.length; y++){
		document.getElementById("request_"+y).value = ""			
	}
	showResponse()
	document.getElementById("haveQuestion").disabled = false
	document.getElementById("haveQuestion").setAttribute("class", "button");
	
	document.getElementById("showResponse").disabled = true
	document.getElementById("showResponse").setAttribute("class", "button disabled");
	
	document.getElementById("chooseColumns").disabled = false
	document.getElementById("chooseColumns").setAttribute("class", "button");
	
	document.getElementById("domanda").innerText = ""
	tableChooseCol = document.getElementById("chooseColTable");
	tableChooseCol.innerHTML = "";
}

function setButtons(){
	document.getElementById("haveQuestion").disabled = true
	document.getElementById("haveQuestion").setAttribute("class", "button disabled");
	document.getElementById("showResponse").disabled = false
	document.getElementById("showResponse").setAttribute("class", "button");
}

function theMainReader(){
		
	    menu = urlParams.get('menu');
		loadConfiguration(menu);
		initData(urlParams); //out: csvfile
		
		var x1 = document.getElementById("urlCsv");
		var x3 = document.getElementById("buttonRefresh");
		var x4 = document.getElementById("urlCsvMenu");
		
		if (csvfile != "")
			x1.value = csvfile

		//if conf file not exists
		if (typeof confHash === "undefined"){
			x4.style.display = "none";
		}		
		else if ((platform !=null) && (csvfile != "")) {
			//csv param in query string
			x1.style.display = "none";
			x3.style.display = "none";
			x4.style.display = "none";
		}
		//if not csv in query string verify if file configuration is not empy or if exists
		else if (Object.keys(confHash).length != 0){
			x1.style.display = "none";
			//set options values		
			for (var key in confHash) {				
				x4.add( new Option( key, confHash[key] ) );
			}	
		}
		else {
			x4.style.display = "none";
		}		
		mode = urlParams.get('mode');
		if (mode == "response"){
				loadFile(document.getElementById("urlCsv").value)

				document.addEventListener("keyup", function(event) {
					if (event.key === 'Control') {
						haveQuestion();
					}
				});
				document.addEventListener("keyup", function(event) {
					if (event.key === 'Enter') {
						showResponse();
					}
				});
				document.addEventListener("keyup", function(event) {
					if (event.key === 'Escape') {
						resetRequest();
					}
				});
				document.addEventListener("keyup", function(event) {
					if (event.key === 'c') {
						chooseColumns();
					}
				});
				chooseCol = "<button  class=\"button\"  id= \"chooseColumns\" style=\"float: right; background-color: #2a92de;\" onclick=\"chooseColumns()\">choose columns (press c)</button><table id=\"chooseColTable\"></table>"
				
				haveQue = "<button class=\"button\" id= \"haveQuestion\"  style=\"background-color: #2a92de;\" onclick=\"haveQuestion()\">random question (press ctrl)</button>"
				
				showRe = "<button class=\"button disabled\" id= \"showResponse\"  disabled onclick=\"showResponse()\">response (press enter)</button>"
				
				resetRe = "<button  class=\"button\" id= \"resetRequest\" style=\"float: right; background-color: #a29508;\" onclick=\"resetRequest()\">reset (press esc)</button>"
				
				document.getElementById("description").innerHTML ="<br><p>"+haveQue+"&nbsp&nbsp&nbsp"+chooseCol+"</p><div id=\"domanda\"></div><br>"+showRe+"&nbsp&nbsp&nbsp"+resetRe+"<br>"
			}
		else{
			getData(document.getElementById("urlCsv").value);
			document.getElementById("description").innerHTML ="<br><p>Click to hide column</p>"
		}	
			
        document.getElementById("csv-source").innerHTML = "<p>data source file : <font color=\"blue\">" + document.getElementById("urlCsv").value + "</font></p>"
		
}