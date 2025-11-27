// config.js

const config = {};



// 🔍 Controllo dell’ambiente
if (window.location.hostname === "localhost" || window.location.hostname === "") {
    // 🌱 Ambiente locale
    config.API_IDENTITY_URL = "http://localhost:3000/identity";
    config.WAKEUP_TO = "http://localhost:8080/status";
    config.WAKEUP_MO = "http://localhost:3000/";
} else {
    // ☁️ Ambiente produzione (Render o dominio reale)
    config.API_IDENTITY_URL = "https://apimongo-tde7.onrender.com/identity";
    config.WAKEUP_TO = "https://api-jwt-xe2h.onrender.com/status";
    config.WAKEUP_MO = "https://apimongo-tde7.onrender.com";
}

// Esporto globalmente
window.CONFIG = config;
