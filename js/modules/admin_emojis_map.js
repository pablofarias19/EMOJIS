/**
 * Módulo para el mapa interactivo
 */
const MapModule = (function() {
  // Variables privadas
  let appState;
  let utilsModule;
  let map = null;
  let currentMarker = null;
  let endMarker = null;
  let clickMode = 'start'; // 'start' o 'end'
  
  /**
   * Inicializa el módulo
   * @param {Object} state - Estado compartido de la aplicación
   * @param {Object} utils - Módulo de utilidades
   */
  function init(state, utils) {
    appState = state;
    utilsModule = utils;
    
    // Inicializar mapa cuando el DOM esté listo
    initMap();
  }
  
  /**
   * Inicializa el mapa de Leaflet
   */
  function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Contenedor del mapa no encontrado');
      return;
    }
    
    // Crear instancia del mapa
    map = L.map('map').setView([-31.244, -64.464], 14);
    
    // Guardar referencia en el estado global
    appState.mapInstance = map;
    
    // Agregar capa de base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Evento click en el mapa
    map.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      if (clickMode === 'start') {
        setStartPosition(lat, lng);
        clickMode = 'end';
      } else {
        setEndPosition(lat, lng);
        clickMode = 'start';
      }
    });
    
    // Agregar controles de zoom
    map.scrollWheelZoom.enable();
    
    // Eventos para coordenadas manuales
    setupCoordinatesEvents();
  }
  
  /**
   * Configura eventos para actualización manual de coordenadas
   */
  function setupCoordinatesEvents() {
    const startLat = document.getElementById('emoji-start-lat');
    const startLng = document.getElementById('emoji-start-lng');
    const endLat = document.getElementById('emoji-end-lat');
    const endLng = document.getElementById('emoji-end-lng');
    
    if (startLat && startLng && endLat && endLng) {
      startLat.addEventListener('change', updateMapMarkers);
      startLng.addEventListener('change', updateMapMarkers);
      endLat.addEventListener('change', updateMapMarkers);
      endLng.addEventListener('change', updateMapMarkers);
    }
  }
  
  /**
   * Actualiza los marcadores basados en campos de formulario
   */
  function updateMapMarkers() {
    const startLat = parseFloat(document.getElementById('emoji-start-lat')?.value);
    const startLng = parseFloat(document.getElementById('emoji-start-lng')?.value);
    const endLat = parseFloat(document.getElementById('emoji-end-lat')?.value);
    const endLng = parseFloat(document.getElementById('emoji-end-lng')?.value);
    
    // Actualizar marcador de inicio si hay datos válidos
    if (!isNaN(startLat) && !isNaN(startLng)) {
      setStartPosition(startLat, startLng);
    }
    
    // Actualizar marcador de fin si hay datos válidos
    if (!isNaN(endLat) && !isNaN(endLng)) {
      setEndPosition(endLat, endLng);
    }
  }
  
  /**
   * Establece la posición inicial del emoji
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   */
  function setStartPosition(lat, lng) {
    if (!map) return;
    
    // Actualizar campos del formulario
    const startLatField = document.getElementById('emoji-start-lat');
    const startLngField = document.getElementById('emoji-start-lng');
    
    if (startLatField) startLatField.value = lat.toFixed(6);
    if (startLngField) startLngField.value = lng.toFixed(6);
    
    // Actualizar o crear marcador
    const emoji = document.getElementById('emoji-symbol')?.value || '📍';
    
    if (currentMarker) {
      currentMarker.setLatLng([lat, lng]);
    } else {
      currentMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="font-size:30px;">${emoji}</div>`,
          className: '',
          iconSize: [30, 30]
        })
      }).addTo(map);
    }
    
    // Centrar mapa en la nueva posición
    map.setView([lat, lng], 14);
  }
  
  /**
   * Establece la posición final del emoji
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   */
  function setEndPosition(lat, lng) {
    if (!map) return;
    
    // Actualizar campos del formulario
    const endLatField = document.getElementById('emoji-end-lat');
    const endLngField = document.getElementById('emoji-end-lng');
    
    if (endLatField) endLatField.value = lat.toFixed(6);
    if (endLngField) endLngField.value = lng.toFixed(6);
    
    // Actualizar o crear marcador
    if (endMarker) {
      endMarker.setLatLng([lat, lng]);
    } else {
      endMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="font-size:16px;">🏁</div>`,
          className: '',
          iconSize: [30, 30]
        })
      }).addTo(map);
    }
    
    // Ajustar la vista para mostrar ambos marcadores
    if (currentMarker && endMarker) {
      const bounds = L.latLngBounds(
        currentMarker.getLatLng(),
        endMarker.getLatLng()
      );
      map.fitBounds(bounds, {padding: [50, 50]});
    }
  }
  
  /**
   * Elimina los marcadores del mapa
   */
  function clearMarkers() {
    if (!map) return;
    
    // Eliminar marcador de inicio
    if (currentMarker) {
      map.removeLayer(currentMarker);
      currentMarker = null;
    }
    
    // Eliminar marcador de fin
    if (endMarker) {
      map.removeLayer(endMarker);
      endMarker = null;
    }
    
    // Restablecer modo de clic
    clickMode = 'start';
  }
  
  /**
   * Actualiza el icono del marcador inicial
   * @param {string} emoji - Símbolo de emoji
   */
  function updateStartMarkerIcon(emoji) {
    if (!currentMarker || !emoji) return;
    
    currentMarker.setIcon(L.divIcon({
      html: `<div style="font-size:30px;">${emoji}</div>`,
      className: '',
      iconSize: [30, 30]
    }));
  }
  
  // API pública
  return {
    init: init,
    setStartPosition: setStartPosition,
    setEndPosition: setEndPosition,
    clearMarkers: clearMarkers,
    updateStartMarkerIcon: updateStartMarkerIcon,
    updateMapMarkers: updateMapMarkers
  };
})();