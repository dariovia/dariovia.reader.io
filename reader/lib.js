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
			if (txtValue.toUpperCase() == filterArrNegative[j])  {
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
	
