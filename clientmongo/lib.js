// ================= Globals =================
let loggedIn = false;
let nome = "NOUSER";
let optionsList = {}; // contiene info API e token per ogni collezione

// ================= Funzioni API =================
async function getToken(strNome, options) {
  if (!strNome || strNome === "NOUSER") throw new Error("Identificarsi");

  const response = await fetch(options.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: options.user,
      password: options.password,
      claims: { nome: strNome, email: `${strNome}@test.com` },
      exp: options.exp
    })
  });

  if (!response.ok) throw new Error("Errore token: " + response.status);
  const data = await response.json();
  return data.token;
}

async function callProtectedApi(api_protected_url, token, verb, endpoint, queryString) {
  let urlData = api_protected_url + "/" + endpoint;
  if (queryString) urlData += "?" + queryString;

  const response = await fetch(urlData, {
    method: verb,
    headers: {
      "Authorization": "Bearer " + token,
      "Accept": "application/json"
    }
  });

  if (!response.ok) throw new Error("Errore chiamata protetta: " + response.status);
  return await response.json();
}

async function verifyAcces(username, passphrase) {
  const urlId = CONFIG.API_IDENTITY_URL;
  const credentials = { nome: username, frase: passphrase };

  const response = await fetch(urlId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });

  return await response.json();
}

// ================= Populate Select =================
function populateSelection(dataJson) {
  const select = document.getElementById("menuCollezioni");
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- scegli --";
  select.appendChild(defaultOption);

  const collezioni = dataJson.filter(item => item.grant.includes("GET"));
  collezioni.forEach(c => {
    optionsList[c.collezione] = {
      apiUrl: c.api_url_token,
      user: c.default_user,
      password: c.default_password,
      exp: c.token_expiration,
      api_protected_url: c.api_protected_url,
      grant: c.grant
    };

    const opt = document.createElement("option");
    opt.value = c.collezione;
    opt.textContent = c.collezione;
    select.appendChild(opt);
  });

  updateCallButtonState();
}

// ================= Aggiorna Stato Bottone =================
function updateCallButtonState() {
  const callBtn = document.getElementById("callApiBtn");
  const select = document.getElementById("menuCollezioni");
  const attivo = loggedIn && select.value && select.value !== "";
  callBtn.disabled = !attivo;

  if (attivo) {
    callBtn.style.backgroundColor = "#4CAF50";
    callBtn.style.color = "white";
    callBtn.style.cursor = "pointer";
  } else {
    callBtn.style.backgroundColor = "#ccc";
    callBtn.style.color = "#666";
    callBtn.style.cursor = "not-allowed";
  }
}

// ================= Creazione Tabella =================
function creaTabella(dati, collectionName, token, rights) {
  const canDelete = rights.includes("DELETE");
  const container = document.getElementById("output");
  container.innerHTML = "";

  if (!Array.isArray(dati) || dati.length === 0) {
    container.textContent = "Nessun dato disponibile";
    return;
  }

  const keys = Object.keys(dati[0]).filter(k => k !== "_id");
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  let currentSort = { key: null, asc: true };
  let filteredData = [...dati];

  // Header + Ordinamento
  keys.forEach(k => {
    const th = document.createElement("th");
    th.textContent = k;
    th.style.border = "1px solid #ccc";
    th.style.padding = "5px";
    th.style.cursor = "pointer";

    const arrow = document.createElement("span");
    arrow.style.marginLeft = "5px";
    th.appendChild(arrow);

    th.addEventListener("click", () => {
      if (currentSort.key === k) currentSort.asc = !currentSort.asc;
      else { currentSort.key = k; currentSort.asc = true; }

      filteredData.sort((a,b) => {
        const va = a[k]?.toString().toLowerCase() || "";
        const vb = b[k]?.toString().toLowerCase() || "";
        return currentSort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
      });

      headerRow.querySelectorAll("span").forEach(s => s.textContent = "");
      arrow.textContent = currentSort.asc ? "↑" : "↓";

      renderRows(filteredData);
    });

    headerRow.appendChild(th);
  });

  if (canDelete) {
    const th = document.createElement("th");
    th.textContent = "Azioni";
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);

  // Filtro colonna
  const filterRow = document.createElement("tr");
  keys.forEach(k => {
    const th = document.createElement("th");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Filtra ${k}`;
    input.style.width = "90%";
    input.addEventListener("input", applyFilters);
    th.appendChild(input);
    filterRow.appendChild(th);
  });
  if (canDelete) filterRow.appendChild(document.createElement("th"));
  thead.appendChild(filterRow);

  // Riga conteggio righe e somme
  const countRow = document.createElement("tr");
  keys.forEach((k,i) => {
    const th = document.createElement("th");
    if (i===0) th.id="rowCount", th.textContent=`Righe: ${filteredData.length}`;
    else if (k.startsWith("#")) {
      th.id=`sum_${k}`;
      th.textContent=`Somma: ${filteredData.reduce((acc,v)=>acc+(parseFloat(v[k])||0),0)}`;
    }
    countRow.appendChild(th);
  });
  if (canDelete) countRow.appendChild(document.createElement("th"));
  thead.appendChild(countRow);

  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  function renderRows(array) {
    tbody.innerHTML = "";

    // Aggiorna conteggio righe e somme
    const rowCount = document.getElementById("rowCount");
    if(rowCount) rowCount.textContent=`Righe: ${array.length}`;
    keys.forEach((k,i)=>{
      if(i>0 && k.startsWith("#")){
        const sumCell = document.getElementById(`sum_${k}`);
        if(sumCell) sumCell.textContent=`Somma: ${array.reduce((acc,v)=>acc+(parseFloat(v[k])||0),0)}`;
      }
    });

    array.forEach(item => {
      const tr = document.createElement("tr");
      keys.forEach(k=>{
        const td = document.createElement("td");
        td.style.border="1px solid #ccc";
        td.style.padding="5px";

        const val = item[k];
        if(typeof val==="string"){
          const urlRegex=/(https?:\/\/[^\s]+)/g;
          let last=0;
          val.replace(urlRegex,(match,url,offset)=>{
            if(offset>last) td.appendChild(document.createTextNode(val.slice(last,offset)));
            const a=document.createElement("a");
            a.href=url; a.textContent=url; a.target="_blank";
            td.appendChild(a);
            last=offset+url.length;
          });
          if(last<val.length) td.appendChild(document.createTextNode(val.slice(last)));
        } else td.textContent=val;

        tr.appendChild(td);
      });

      if(canDelete){
        const td = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent="🗑️";
        btn.onclick = async () => {
          if(!confirm("Eliminare elemento?")) return;
          try{
            const res = await fetch(`${optionsList[collectionName].api_protected_url}/${collectionName}/${item._id}`,{
              method:"DELETE",
              headers: {"Authorization":"Bearer "+token}
            });
            if(!res.ok) throw new Error("Errore delete");
            filteredData = filteredData.filter(x=>x._id!==item._id);
            renderRows(filteredData);
          } catch(e){ alert(e.message); }
        };
        td.appendChild(btn);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
  }

  function applyFilters() {
    const inputs = filterRow.querySelectorAll("input");
    const filters = Array.from(inputs).map(i=>i.value.toLowerCase());
    filteredData = dati.filter(item =>
      keys.every((k,i)=>item[k]?.toString().toLowerCase().includes(filters[i]))
    );
    renderRows(filteredData);
  }

  renderRows(filteredData);
  container.appendChild(table);
}

// ================= Main =================
function main() {
  const output = document.getElementById("output");
  const loginBtn = document.getElementById("loginBtn");
  const loginForm = document.getElementById("loginForm");
  const submitLogin = document.getElementById("submitLogin");
  const callBtn = document.getElementById("callApiBtn");
  const selectCollezioni = document.getElementById("menuCollezioni");

  updateCallButtonState();

  loginBtn.addEventListener("click", ()=> {
    loginForm.style.display = loginForm.style.display==="block"?"none":"block";
  });

  loginForm.addEventListener("keydown", e=>{
    if(e.key==="Enter"){ e.preventDefault(); submitLogin.click(); }
    if(e.key==="Escape"){ loginForm.style.display="none"; }
  });

  submitLogin.addEventListener("click", async ()=>{
    nome = document.getElementById("nome").value;
    const frase = document.getElementById("frase").value;
    loginForm.style.display="none";

    const lg = await verifyAcces(nome,frase);
    if(lg.errore){
      output.textContent="Login fallito";
      nome="NOUSER";
      document.getElementById("loginBtn").textContent="Chi sei ?";
      loggedIn=false;
    } else {
      document.getElementById("loginBtn").textContent=nome;
      output.textContent="Seleziona una collezione per caricare la tabella";
      loggedIn=true;
      populateSelection(lg);
      updateCallButtonState();
    }
  });

  selectCollezioni.addEventListener("change", updateCallButtonState);

  callBtn.addEventListener("click", async ()=>{
    output.textContent="Recupero token...";
    try{
      const collezione = selectCollezioni.value;
      const token = await getToken(nome,optionsList[collezione]);
      output.textContent="Token ricevuto ✅\nChiamo API protetta...";
      const data = await callProtectedApi(optionsList[collezione].api_protected_url, token, "GET", collezione);
      creaTabella(data, collezione, token, optionsList[collezione].grant);
    } catch(err){
      output.textContent="❌ Errore: "+err.message;
    }
  });
}
