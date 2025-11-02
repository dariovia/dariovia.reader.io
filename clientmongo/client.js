

// funzione per chiamare l'API
async function caricaTabella(idTabella) {
	const tabella = document.getElementById(idTabella);
  try {
    const response = await fetch("http://localhost:3000/api/tabelloni/spesa"); // endpoint API
    if (!response.ok) throw new Error("Errore nella chiamata API");

    const dati = await response.json(); // converte in oggetto JS
	//console.log(Object.keys(dati[0]))
	var header = tabella.createTHead();
	var row = header.insertRow(0);
	for (let i = 1; i < Object.keys(dati[0]).length; i++){
			//console.log(item[keys[i]])
			row.insertCell().innerHTML = Object.keys(dati[0])[i];
	}
	
	indexRow = 1;
    dati.forEach(item => {
		keys = Object.keys(item)
		var row = tabella.insertRow(indexRow);
		for (let i = 1; i < keys.length; i++){
			//console.log(item[keys[i]])
			row.insertCell().innerHTML = item[keys[i]];
		}
		indexRow++		
    });

  } catch (err) {
    console.error(err);
  }
}


