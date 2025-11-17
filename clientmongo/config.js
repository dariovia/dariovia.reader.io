// config.js

const config = {};



// 🔍 Controllo dell’ambiente
if (window.location.hostname === "localhost" || window.location.hostname === "") {
    // 🌱 Ambiente locale
    config.API_IDENTITY_URL = "http://localhost:3000/identity";
} else {
    // ☁️ Ambiente produzione (Render o dominio reale)
    config.API_IDENTITY_URL = "https://apimongo-tde7.onrender.com/identity";
}

// Esporto globalmente
window.CONFIG = config;
