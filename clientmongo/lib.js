	
	async function getToken(strNome, options = {}) {
	
	  const {
		apiUrl = CONFIG.API_URL_TOKEN,
		user = CONFIG.DEFAULT_USER,
		password = CONFIG.DEFAULT_PASSWORD,
		exp = CONFIG.TOKEN_EXPIRATION
	  } = options;

	  if (!strNome || strNome === "NOUSER") {
		throw new Error("Identificarsi");
	  }

	  const response = await fetch(apiUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
		  user,
		  password,
		  claims: { nome: strNome, email: `${strNome}@test.com` },
		  exp
		})
	  });

	  if (!response.ok) throw new Error("Errore token: " + response.status);
	  const data = await response.json();
	  return data.token;
	}

    async function callProtectedApi(token,verb,endpoint,queryString) {
      let urlData = CONFIG.API_PROTECTED_URL+"/"+endpoint;
	  if (queryString) {
		  urlData = urlData + "?"+queryString
	  }
	  console.log("urlData: "+urlData)

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

	  // 🧹 Pulisci il menu prima di popolarlo
	  select.innerHTML = "";

	  // (facoltativo) aggiungi un'opzione iniziale fissa
	  const defaultOpt = document.createElement("option");
	  defaultOpt.value = "";
	  defaultOpt.textContent = "-- scegli collezione --";
	  select.appendChild(defaultOpt);

	  // 👇 Filtra solo le collezioni con grant che contiene "GET"
	  const collezioni = dataJson
		.filter(item => item.grant.includes("GET"))
		.map(item => item.collezione);

	  // 👇 Popola il menu a tendina
	  collezioni.forEach(collezione => {
		const opt = document.createElement("option");
		opt.value = collezione;
		opt.textContent = collezione;
		select.appendChild(opt);
	  });

	  // 👇 (facoltativo) Gestisci evento di scelta
	  select.addEventListener("change", () => {
		console.log("Hai selezionato:", select.value);
	  });
	}

function creaTabella(dati) {
  const output = document.getElementById("output");

  // Pulisci eventuale contenuto precedente
  output.innerHTML = "";

  if (!dati || dati.length === 0) {
    output.textContent = "Nessun dato disponibile";
    return;
  }

  // Crea tabella
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  // Header (escludi _id)
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  Object.keys(dati[0])
    .filter(key => key !== "_id")  // 👈 escludi _id
    .forEach(key => {
      const th = document.createElement("th");
      th.textContent = key;
      th.style.border = "1px solid #ccc";
      th.style.padding = "8px";
      th.style.background = "#f2f2f2";
      th.style.textAlign = "left";
      headerRow.appendChild(th);
    });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Corpo tabella (escludi _id)
  const tbody = document.createElement("tbody");
  dati.forEach(item => {
    const row = document.createElement("tr");
    Object.entries(item)
      .filter(([key]) => key !== "_id") // 👈 escludi _id
      .forEach(([key, val]) => {
        const td = document.createElement("td");
        td.textContent = val;
        td.style.border = "1px solid #ccc";
        td.style.padding = "8px";
        row.appendChild(td);
      });
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  output.appendChild(table);
}



function main(){
    const output = document.getElementById("output");
    const button = document.getElementById("callApiBtn");
    const loginBtn = document.getElementById("loginBtn");
    const loginForm = document.getElementById("loginForm");
    const submitLogin = document.getElementById("submitLogin");
	let nome = "NOUSER"
	let data

    // Mostra/nascondi form al clic del bottone
    loginBtn.addEventListener("click", () => {
      loginForm.style.display = loginForm.style.display === "block" ? "none" : "block";
    });

    // Invia login al server
    submitLogin.addEventListener("click", async () => {
      nome = document.getElementById("nome").value;
	  const frase = document.getElementById("frase").value;
	  
      loginForm.style.display = "none";
	  lg = await verifyAcces(nome, frase)
	  if (lg.errore) {
		output.textContent = "login failed"
		nome = "NOUSER"
		document.getElementById("loginBtn").textContent = "chi sei ?"
	  }
	  else{
		 document.getElementById("loginBtn").textContent = nome;
		 output.textContent = "click per caricare";
		 populateSelection(lg)
	  }
    });

    button.addEventListener("click", async () => {
      output.textContent = "Recupero token...";
      try {
        const token = await getToken(nome);
        output.textContent = "Token ricevuto ✅\n\nChiamo API protetta...";
		let collezione = document.getElementById("menuCollezioni").value;
        data = await callProtectedApi(token,"GET",collezione);
        output.textContent = "✅ Risposta finale:\n\n" + JSON.stringify(data, null, 2);
		creaTabella(data);
      } catch (err) {
        output.textContent = "❌ Errore: " + err.message;
      }
    });	
	
	
}