//globals
let loggedIn = false; // stato login globale
let nome = "NOUSER";  // username corrente

//------------------	
	//let api_protected_url = "http://localhost:3000/api/tabelloni"
	//const options = {};
	let optionsList = {}
//-----------------



	async function getToken(strNome, options ) {

	  if (!strNome || strNome === "NOUSER") {
		throw new Error("Identificarsi");
	  }

	  const response = await fetch(options.apiUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
		  user : options.user,
		  password : options.password,
		  claims: { nome: strNome, email: `${strNome}@test.com` },
		  exp : options.exp
		})
	  });

	  if (!response.ok) throw new Error("Errore token: " + response.status);
	  const data = await response.json();
	  return data.token;
	}


    async function callProtectedApi(api_protected_url,token,verb,endpoint,queryString) {
		
      let urlData = api_protected_url+"/"+endpoint;
	  if (queryString) {
		  urlData = urlData + "?"+queryString
	  }
	  

      const response = await fetch(urlData, {
        method: ""+verb,
        headers: {
          "Authorization": "Bearer " + token,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Errore nella chiamata protetta: " + response.status);
      }

      return await response.json();
    }


	async function verifyAcces(username, passphrase){
		const urlId = CONFIG.API_IDENTITY_URL
		const credentials = {
			nome: username,
			frase: passphrase
        };
		
		const response = await fetch(urlId, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials)
		});
		const grants = await response.json();
		return grants;
	}


function populateSelection(dataJson) {
  const select = document.getElementById("menuCollezioni");

  // pulisci la select
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- scegli --";
  select.appendChild(defaultOption);

  // filtra solo collezioni con grant GET
  const collezioni = dataJson.filter(item => item.grant.includes("GET"))
							//.map(item => item.collezione);
  collezioni.forEach(c => {
	  optionsList[c.collezione] = {}
    const opt = document.createElement("option");
    opt.value = c.collezione;
    opt.textContent = c.collezione;
	optionsList[c.collezione]["apiUrl"] = c.api_url_token
	optionsList[c.collezione]["user"] = c.default_user
	optionsList[c.collezione]["password"] = c.default_password
	optionsList[c.collezione]["exp"] = c.token_expiration
	optionsList[c.collezione]["api_protected_url"] = c.api_protected_url
    select.appendChild(opt);
  });

  // disabilita pulsante dopo aggiornamento
  updateCallButtonState();
}


function creaTabella(dati) {
  const output = document.getElementById("output");
  output.innerHTML = "";

  if (!dati || dati.length === 0) {
    output.textContent = "Nessun dato disponibile";
    return;
  }

  const keys = Object.keys(dati[0]).filter(k => k !== "_id");
  const container = document.createElement("div");
  container.style.overflowX = "auto";

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.marginTop = "10px";
  table.style.fontFamily = "Arial, sans-serif";
  table.style.fontSize = "14px";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  let currentSort = { key: null, asc: true };

  let filteredData = [...dati]; // array filtrato dinamico

  // 🔹 HEADER + ordinamento
  keys.forEach(k => {
    const th = document.createElement("th");
    th.textContent = k;
    th.style.border = "1px solid #ccc";
    th.style.padding = "8px";
    th.style.background = "#f2f2f2";
    th.style.textAlign = "left";
    th.style.cursor = "pointer";
    th.style.userSelect = "none";

    const arrow = document.createElement("span");
    arrow.style.marginLeft = "5px";
    arrow.style.color = "#666";
    th.appendChild(arrow);

    th.addEventListener("click", () => {
      if (currentSort.key === k) currentSort.asc = !currentSort.asc;
      else { currentSort.key = k; currentSort.asc = true; }

      filteredData.sort((a, b) => {
        const valA = a[k]?.toString().toLowerCase() ?? "";
        const valB = b[k]?.toString().toLowerCase() ?? "";
        if (valA < valB) return currentSort.asc ? -1 : 1;
        if (valA > valB) return currentSort.asc ? 1 : -1;
        return 0;
      });

      headerRow.querySelectorAll("span").forEach(s => (s.textContent = ""));
      arrow.textContent = currentSort.asc ? "↑" : "↓";

      renderBody(filteredData);
    });

    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // 🔹 FILTRI
  const filterRow = document.createElement("tr");
  keys.forEach(k => {
    const th = document.createElement("th");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Filtra ${k}`;
    input.style.width = "95%";
    input.style.padding = "4px";
    input.style.fontSize = "0.9em";

    input.addEventListener("input", applyFilters);
    th.appendChild(input);
    filterRow.appendChild(th);
  });
  thead.appendChild(filterRow);

  // 🔹 RIGA CON CONTEGGIO E SOMME
  const countRow = document.createElement("tr");
  keys.forEach((k, index) => {
    const th = document.createElement("th");

    if (index === 0) {
      th.id = "rowCount";
      th.textContent = `Righe: ${filteredData.length}`;
    } else if (k.startsWith("#")) {
      th.id = `sum_${k}`;
      const sum = filteredData.reduce((acc, item) => acc + (parseFloat(item[k]) || 0), 0);
      th.textContent = `Somma: ${sum}`;
    }

    countRow.appendChild(th);
  });
  thead.appendChild(countRow);

  table.appendChild(thead);

  // 🔹 CORPO
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  function renderBody(array) {
    tbody.innerHTML = "";

    // aggiorna conteggio righe
    const countCell = document.getElementById("rowCount");
    if (countCell) countCell.textContent = `Righe: ${array.length}`;

    // aggiorna somme colonne # a partire dalla seconda
    keys.forEach((k, index) => {
      if (index > 0 && k.startsWith("#")) {
        const sumCell = document.getElementById(`sum_${k}`);
        if (sumCell) {
          const sum = array.reduce((acc, item) => acc + (parseFloat(item[k]) || 0), 0);
          sumCell.textContent = `Somma: ${sum}`;
        }
      }
    });

    array.forEach(item => {
      const tr = document.createElement("tr");
      keys.forEach(k => {
        const td = document.createElement("td");
        td.style.border = "1px solid #ccc";
        td.style.padding = "8px";

        const value = item[k];

        if (typeof value === "string") {
          // regex per trovare URL http/https
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          let lastIndex = 0;
          value.replace(urlRegex, (match, url, offset) => {
            // testo prima del link
            if (offset > lastIndex) {
              td.appendChild(document.createTextNode(value.slice(lastIndex, offset)));
            }
            // link cliccabile
            const a = document.createElement("a");
            a.href = url;
            a.textContent = url;
            a.target = "_blank";
            a.style.color = "#007BFF";
            a.style.textDecoration = "underline";
            td.appendChild(a);

            lastIndex = offset + url.length;
          });
          // testo rimanente dopo l’ultimo link
          if (lastIndex < value.length) {
            td.appendChild(document.createTextNode(value.slice(lastIndex)));
          }
        } else {
          td.textContent = value;
        }

        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function applyFilters() {
    const filters = Array.from(filterRow.querySelectorAll("input")).map(i => i.value.toLowerCase());
    filteredData = dati.filter(item =>
      keys.every((k, i) => item[k]?.toString().toLowerCase().includes(filters[i]))
    );
    renderBody(filteredData);
  }

  // render iniziale per calcolare subito righe e somme
  renderBody(filteredData);

  // Hover sulle righe
  table.addEventListener("mouseover", e => {
    if (e.target.tagName === "TD") e.target.parentNode.style.background = "#f9f9f9";
  });
  table.addEventListener("mouseout", e => {
    if (e.target.tagName === "TD") e.target.parentNode.style.background = "";
  });

  container.appendChild(table);
  output.appendChild(container);
}



function updateCallButtonState() {
  const callBtn = document.getElementById("callApiBtn");
  const select = document.getElementById("menuCollezioni");

  const attivo = loggedIn && select.value && select.value !== "";
  callBtn.disabled = !attivo;

  // feedback visivo
  if (attivo) {
    callBtn.style.backgroundColor = "#4CAF50"; // verde
    callBtn.style.color = "white";
    callBtn.style.cursor = "pointer";
  } else {
    callBtn.style.backgroundColor = "#ccc"; // grigio
    callBtn.style.color = "#666";
    callBtn.style.cursor = "not-allowed";
  }
}


function main() {
  const output = document.getElementById("output");
  const loginBtn = document.getElementById("loginBtn");
  const loginForm = document.getElementById("loginForm");
  const submitLogin = document.getElementById("submitLogin");
  const callBtn = document.getElementById("callApiBtn");
  const selectCollezioni = document.getElementById("menuCollezioni");

  // pulsante inizialmente disabilitato
  updateCallButtonState();

  // Mostra/nascondi form login
  loginBtn.addEventListener("click", () => {
    loginForm.style.display = loginForm.style.display === "block" ? "none" : "block";
  });

  // Invio = click su Entra, Esc = chiudi form
  loginForm.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitLogin.click();
    }
    if (event.key === "Escape") {
      loginForm.style.display = "none";
    }
  });

  // Submit login
  submitLogin.addEventListener("click", async () => {
    nome = document.getElementById("nome").value;
    const frase = document.getElementById("frase").value;

    loginForm.style.display = "none";

    const lg = await verifyAcces(nome, frase); // funzione lato server
	//console.log("lg:",lg)



    if (lg.errore) {
      output.textContent = "Login fallito";
      nome = "NOUSER";
      document.getElementById("loginBtn").textContent = "Chi sei ?";
      loggedIn = false;
    } else {
      document.getElementById("loginBtn").textContent = nome;
      output.textContent = "Seleziona una collezione per caricare la tabella";
      loggedIn = true;
      populateSelection(lg); // aggiorna menu
      updateCallButtonState();
    }
  });

  // Listener sulla select
  selectCollezioni.addEventListener("change", updateCallButtonState);

  // Click sul pulsante Carica tabella
  callBtn.addEventListener("click", async () => {
    output.textContent = "Recupero token...";
    try {
		const collezione = selectCollezioni.value;
		
      const token = await getToken(nome,optionsList[collezione]); // funzione per generare token
      output.textContent = "Token ricevuto ✅\nChiamo API protetta...";
      api_protected_url=optionsList[collezione]["api_protected_url"]
      const data = await callProtectedApi(api_protected_url,token, "GET", collezione);
      creaTabella(data); // tabella con filtri e ordinamento
    } catch (err) {
      output.textContent = "❌ Errore: " + err.message;
    }
  });
}
