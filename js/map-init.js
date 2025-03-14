/**
 * map-init.js
 * 
 * Descripción:
 * Este archivo se encarga de la inicialización del mapa principal y sus componentes básicos.
 * Crea el objeto global appMapa que contiene todas las referencias importantes del mapa.
 * 
 * Funcionalidades principales:
 * - Inicialización del mapa utilizando Leaflet
 * - Configuración de la vista inicial y capas base
 * - Inicialización del grupo de marcadores para clustering
 * - Geolocalización del usuario
 * - Carga de información del mapa desde el servidor
 */

// Objeto global para almacenar referencias del mapa
window.appMapa = {
  map: null,
  markersLayer: null,
  markers: [],
  productosData: [],
  emojiInterval: null,
  emojiIntervals: [],
  emojiMarkers: []
};

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar mapa una sola vez
  window.appMapa.map = L.map('map').setView([-34.603722, -58.381592], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(window.appMapa.map);

  window.appMapa.markersLayer = L.markerClusterGroup();
  window.appMapa.map.addLayer(window.appMapa.markersLayer);
  
  // Si hay geolocalización, centrar el mapa en la ubicación del usuario
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      window.appMapa.map.setView([position.coords.latitude, position.coords.longitude], 15);
    });
  }
  
  // Agregar emoji en movimiento después de que el mapa se inicializa
  setTimeout(() => {
    if (window.appMapa.map) {
      agregarEmojisMoviles(window.appMapa.map);
    }
  }, 1000);
  
  // Cargar información del mapa
  cargarInfoMapa();
});

// Función para cargar la información del mapa
function cargarInfoMapa() {
  fetch('info_mapa.php')
    .then(response => response.json())
    .then(data => {
      document.getElementById('info-title').textContent = data.titulo;
      document.getElementById('info-description').textContent = data.descripcion;
      document.getElementById('info-details').textContent = data.detalles;
      document.getElementById('info-box').style.display = 'block';
    })
    .catch(error => {
      console.error('Error al cargar información:', error);
    });
}

// Función para cerrar el cuadro de información
function cerrarInfoBox() {
  document.getElementById('info-box').style.display = 'none';
}

// Agregar un event listener para limpiar los intervalos al cerrar la página
window.addEventListener('beforeunload', limpiarIntervalosEmojis);