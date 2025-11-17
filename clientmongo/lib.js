// ================= Globals =================
let loggedIn = false;
let nome = "NOUSER";
let optionsList = {}; // info API/token per ogni collezione
let editEnabled = false; // stato toggle edit
let currentCollectionName = null;
let currentData = [];
let currentToken = null;

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

async function callProtectedApi(api_protected_url, token, verb, endpoint, body) {
  let url = api_protected_url + "/" + endpoint;
  const response = await fetch(url, {
    method: verb,
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": body ? "application/json" : undefined,
      "Accept": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const err = await response.json().catch(()=>({errore: response.status}));
    throw new Error(err.errore || "Errore API: " + response.status);
  }

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

// ================= Update Button State =================
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

// ================= Render Rows Globale =================
let renderRows; // dichiarazione globale

// ================= Creazione Tabella =================
function creaTabella(dati, collectionName, token, rights) {
  const canDelete = rights.includes("DELETE");
  const canEdit = rights.includes("PUT") && editEnabled;
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

  // Header + ordinamento
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

  if (canDelete || canEdit) {
    const th = document.createElement("th");
    th.textContent = "Azioni";
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);

  // Filtri
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
  if (canDelete || canEdit) filterRow.appendChild(document.createElement("th"));
  thead.appendChild(filterRow);

  // Conteggio righe e somme
  const countRow = document.createElement("tr");
  keys.forEach((k,i)=>{
    const th = document.createElement("th");
    if(i===0) th.id="rowCount", th.textContent=`Righe: ${filteredData.length}`;
    else if(k.startsWith("#")){
      th.id=`sum_${k}`;
      th.textContent=`Somma: ${filteredData.reduce((acc,v)=>acc+(parseFloat(v[k])||0),0)}`;
    }
    countRow.appendChild(th);
  });
  if (canDelete || canEdit) countRow.appendChild(document.createElement("th"));
  thead.appendChild(countRow);

  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  renderRows = function(array){
    tbody.innerHTML = "";
    const rowCount = document.getElementById("rowCount");
    if(rowCount) rowCount.textContent=`Righe: ${array.length}`;
    keys.forEach((k,i)=>{
      if(i>0 && k.startsWith("#")){
        const sumCell = document.getElementById(`sum_${k}`);
        if(sumCell) sumCell.textContent=`Somma: ${array.reduce((acc,v)=>acc+(parseFloat(v[k])||0),0)}`;
      }
    });

    array.forEach(item=>{
      const tr = document.createElement("tr");
      keys.forEach(k=>{
        const td = document.createElement("td");
        td.style.border="1px solid #ccc";
        td.style.padding="5px";

        let val = item[k];

        if(canEdit){
          const input = document.createElement("input");
          input.value = val;
          input.style.width = "100%";
          input.addEventListener("change", async ()=>{
            const newVal = input.value;
            try{
              await callProtectedApi(optionsList[collectionName].api_protected_url, currentToken, "PUT", `${collectionName}/${item._id}`, { [k]: newVal });
              item[k] = newVal;
              renderRows(filteredData);
            }catch(e){ alert(e.message); }
          });
          td.appendChild(input);
        } else if(typeof val==="string"){
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
        } else td.textContent = val;

        tr.appendChild(td);
      });

      if(canDelete){
        const td = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent="🗑️";
        btn.onclick = async ()=>{
          if(!confirm("Eliminare elemento?")) return;
          try{
            await callProtectedApi(optionsList[collectionName].api_protected_url, currentToken, "DELETE", `${collectionName}/${item._id}`);
            filteredData = filteredData.filter(x=>x._id!==item._id);
            renderRows(filteredData);
          }catch(e){ alert(e.message); }
        };
        td.appendChild(btn);
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
  }

  function applyFilters(){
    const inputs = filterRow.querySelectorAll("input");
    const filters = Array.from(inputs).map(i=>i.value.toLowerCase());
    filteredData = dati.filter(item=>keys.every((k,i)=>item[k]?.toString().toLowerCase().includes(filters[i])));
    renderRows(filteredData);
  }

  renderRows(filteredData);
  container.appendChild(table);
}

// ================= Main =================
function main(){
  const output = document.getElementById("output");
  const loginBtn = document.getElementById("loginBtn");
  const loginForm = document.getElementById("loginForm");
  const submitLogin = document.getElementById("submitLogin");
  const callBtn = document.getElementById("callApiBtn");
  const selectCollezioni = document.getElementById("menuCollezioni");
  const toggleEdit = document.getElementById("toggleEdit");
  const editLabel = document.getElementById("editLabel");
  const addRowBtn = document.getElementById("addRowBtn");

  // Nascondi controlli all'avvio
  if(toggleEdit) toggleEdit.style.display = "none";
  if(editLabel) editLabel.style.display = "none";
  if(addRowBtn) addRowBtn.style.display = "none";

  updateCallButtonState();

  // Toggle edit
  if(toggleEdit){
    toggleEdit.addEventListener("change", ()=>{
      editEnabled = toggleEdit.checked;
      if(currentCollectionName && currentData.length>0){
        creaTabella(currentData, currentCollectionName, currentToken, optionsList[currentCollectionName].grant);
      }
    });
  }

  // Login
  loginBtn.addEventListener("click", ()=> { loginForm.style.display = loginForm.style.display==="block"?"none":"block"; });
  loginForm.addEventListener("keydown", e=>{
    if(e.key==="Enter"){ e.preventDefault(); submitLogin.click(); }
    if(e.key==="Escape"){ loginForm.style.display="none"; }
  });

  submitLogin.addEventListener("click", async ()=>{
    nome = document.getElementById("nome").value;
    const frase = document.getElementById("frase").value;
    loginForm.style.display="none";

    const lg = await verifyAcces(nome,frase);
    // Reset tabella e controlli
    currentData = [];
    currentCollectionName = null;
    currentToken = null;
    output.innerHTML = "";
    toggleEdit.style.display = "none";
    editLabel.style.display = "none";
    addRowBtn.style.display = "none";

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

  // Carica tabella
  callBtn.addEventListener("click", async ()=>{
    output.textContent="Recupero token...";
    try{
      const collezione = selectCollezioni.value;
      const token = await getToken(nome, optionsList[collezione]);
      const data = await callProtectedApi(optionsList[collezione].api_protected_url, token, "GET", collezione);

      currentCollectionName = collezione;
      currentData = data;
      currentToken = token;

      // mostra toggle edit solo se PUT
      if(optionsList[collezione].grant.includes("PUT")){
        editLabel.style.display = "inline-block";
		toggleEdit.style.display = "inline-block";
      } else {
        editLabel.style.display = "none";
		toggleEdit.style.display = "none";
        editEnabled = false;
      }

      // mostra add row solo se POST
      if(optionsList[collezione].grant.includes("POST")){
        addRowBtn.style.display = "inline-block";
      } else {
        addRowBtn.style.display = "none";
      }

      creaTabella(data, collezione, token, optionsList[collezione].grant);
    }catch(err){ output.textContent="❌ Errore: "+err.message; }
  });

  // Aggiungi riga
  addRowBtn.addEventListener("click", async ()=>{
    if(!currentData || currentData.length===0) return;
    const col = selectCollezioni.value;
    const token = await getToken(nome, optionsList[col]);
    const keys = Object.keys(currentData[0]);
    const newRow = {};
    for(let i=1;i<keys.length;i++) newRow[keys[i]]="";

    try{
      const created = await callProtectedApi(optionsList[col].api_protected_url, token, "POST", col, newRow);
      currentData.unshift(created);
      renderRows(currentData);
    }catch(e){ alert(e.message); }
  });
}
