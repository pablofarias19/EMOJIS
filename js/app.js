/**
 * app.js
 * 
 * Descripción:
 * Archivo principal que inicializa la aplicación y coordina
 * las funcionalidades del mapa y sus componentes.
 */

// Objeto global para almacenar referencias del mapa
window.appMapa = {
  map: null,
  markersLayer: null,
  markers: [],
  productosData: [],
  emojiInterval: null,
  emojiIntervals: [],
  emojiMarkers: [],
  emojisMoviles: {}
};

// Función para inicializar toda la aplicación
function inicializarAplicacion() {
  // Inicializar mapa
  window.appMapa.map = L.map('map').setView([-34.603722, -58.381592], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(window.appMapa.map);

  // Inicializar capa de marcadores agrupados
  window.appMapa.markersLayer = L.markerClusterGroup();
  window.appMapa.map.addLayer(window.appMapa.markersLayer);
  
  // Configurar geolocalización si está disponible
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      window.appMapa.map.setView([position.coords.latitude, position.coords.longitude], 15);
    });
  }
  
  // Inicializar filtros y eventos de UI
  inicializarFiltrosYEventos();
  
  // Cargar información del mapa
  cargarInfoMapa();
  
  // Cargar productos iniciales
  cargarProductos();
  
  // Agregar emojis animados (después de que el mapa esté listo)
  setTimeout(() => {
    console.log("Iniciando carga de emojis animados...");
    agregarEmojisMoviles(window.appMapa.map);
  }, 1000);
}

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

// Inicializar eventos de UI y filtros
function inicializarFiltrosYEventos() {
  // Manejar cambio en categoría
  document.getElementById('categoria-filter').addEventListener('change', function() {
    const categoria = this.value;
    const subcategoriaSelect = document.getElementById('subcategoria-filter');

    subcategoriaSelect.innerHTML = '<option value="">Todas las subcategorías</option>';

    if (categoria && subcategorias[categoria]) {
      subcategorias[categoria].forEach(function(subcat) {
        const option = document.createElement('option');
        option.value = subcat.valor;
        option.textContent = subcat.nombre;
        subcategoriaSelect.appendChild(option);
      });
    }
    cargarProductos();
  });

  // Manejar cambios en subcategoría
  document.getElementById('subcategoria-filter').addEventListener('change', cargarProductos);

  // Manejar click en botones tipo oferta/demanda/todos
  document.querySelectorAll('.tipo-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tipo-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-checked', 'true');
      cargarProductos();
    });

    btn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

  // Manejar búsqueda por texto
  document.getElementById('search-btn').addEventListener('click', cargarProductos);
  document.getElementById('search-query').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      cargarProductos();
    }
  });

  // Cerrar modal al hacer clic fuera
  window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
      cerrarModal();
    }
  };
  
  // Evento para cerrar info-box
  document.getElementById('close-info').addEventListener('click', cerrarInfoBox);
  
  // Limpiar al salir de la página
  window.addEventListener('beforeunload', limpiarIntervalosEmojis);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);