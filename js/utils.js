/**
 * utils.js
 * 
 * Descripción:
 * Este archivo contiene funciones de utilidad compartidas
 * entre otros módulos de la aplicación.
 */

// Función para mostrar errores
function mostrarError(mensaje) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `<div class="error-message" role="alert">${mensaje}</div>`;
  setTimeout(() => { errorContainer.innerHTML = ''; }, 5000);
}

// Función para limpiar todos los intervalos de emojis
function limpiarIntervalosEmojis() {
  if (window.appMapa && window.appMapa.emojiIntervals) {
    window.appMapa.emojiIntervals.forEach(interval => clearInterval(interval));
    window.appMapa.emojiIntervals = [];
  }
  
  if (window.appMapa && window.appMapa.emojiInterval) {
    clearInterval(window.appMapa.emojiInterval);
    window.appMapa.emojiInterval = null;
  }
  
  // Limpiar referencias a marcadores
  if (window.appMapa && window.appMapa.emojiMarkers) {
    window.appMapa.emojiMarkers.forEach(marker => {
      if (marker && window.appMapa.map) {
        window.appMapa.map.removeLayer(marker);
      }
    });
    window.appMapa.emojiMarkers = [];
  }
  
  if (window.appMapa && window.appMapa.emojisMoviles) {
    for (const id in window.appMapa.emojisMoviles) {
      const emoji = window.appMapa.emojisMoviles[id];
      if (emoji.marker && window.appMapa.map) {
        window.appMapa.map.removeLayer(emoji.marker);
      }
    }
    window.appMapa.emojisMoviles = {};
  }
}

// Función para limpiar texto de posible código malicioso
function limpiarTexto(texto) {
  if (typeof texto !== 'string') {
    return String(texto);
  }
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Función para cerrar el cuadro de información
function cerrarInfoBox() {
  document.getElementById('info-box').style.display = 'none';
}