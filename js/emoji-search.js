/**
 * emoji_search.js
 * 
 * Módulo para gestionar la búsqueda y visualización de emojis relacionados en el mapa
 * Integra las funcionalidades de búsqueda, filtrado y navegación entre emojis
 */

const EmojiSearchModule = (function() {
  // Variables privadas
  let map = null;
  let searchInput = null;
  let searchButton = null;
  let searchResultsContainer = null;
  let activeMarkers = [];
  let activeRelations = [];
  
  /**
   * Inicializa el módulo de búsqueda
   * @param {Object} mapInstance - Instancia del mapa
   */
  function init(mapInstance) {
    console.log('Inicializando EmojiSearchModule...');
    
    // Guardar referencia al mapa
    map = mapInstance || (window.appMapa ? window.appMapa.map : null);
    
    if (!map) {
      console.error('No se pudo inicializar EmojiSearchModule: Mapa no disponible');
      return false;
    }
    
    // Inicializar elementos de la UI
    createSearchUI();
    
    // Configurar eventos
    setupEvents();
    
    console.log('EmojiSearchModule inicializado correctamente');
    return true;
  }
  
  /**
   * Crea la interfaz de búsqueda y resultados
   */
  function createSearchUI() {
    // Verificar si ya existe
    if (document.getElementById('emoji-search-container')) {
      return;
    }
    
    // Crear contenedor principal
    const searchContainer = document.createElement('div');
    searchContainer.id = 'emoji-search-container';
    searchContainer.className = 'emoji-search-container';
    
    // Crear campo de búsqueda
    searchContainer.innerHTML = `
      <div class="emoji-search-input-container">
        <input type="text" id="emoji-search-input" placeholder="Buscar emojis, grupos o relaciones..." class="emoji-search-input">
        <button id="emoji-search-button" class="emoji-search-button">🔍</button>
      </div>
      <div id="emoji-search-results" class="emoji-search-results"></div>
    `;
    
    // Agregar al DOM (ajustar según la estructura de la página)
    const mapContainer = map.getContainer();
    mapContainer.parentNode.insertBefore(searchContainer, mapContainer);
    
    // Guardar referencias a elementos
    searchInput = document.getElementById('emoji-search-input');
    searchButton = document.getElementById('emoji-search-button');
    searchResultsContainer = document.getElementById('emoji-search-results');
  }
  
  /**
   * Configura los eventos de búsqueda
   */
  function setupEvents() {
    // Evento botón de búsqueda
    if (searchButton) {
      searchButton.addEventListener('click', performSearch);
    }
    
    // Evento input de búsqueda (Enter)
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
    }
    
    // Evento para limpiar resultados cuando se borra el campo
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        if (e.target.value === '') {
          clearSearchResults();
        }
      });
    }
  }
  
  /**
   * Realiza la búsqueda con el término actual
   */
  function performSearch() {
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (query === '') {
      clearSearchResults();
      return;
    }
    
    // Mostrar mensaje de carga
    showLoadingResults();
    
    // Realizar búsqueda en el servidor
    fetch(`buscar_relaciones_emoji.php?keyword=${encodeURIComponent(query)}`)
      .then(response => {
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        return response.json();
      })
      .then(data => {
        if (data.success) {
          displaySearchResults(data.resultado);
        } else {
          showErrorMessage(data.error || 'Error al realizar la búsqueda');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showErrorMessage('Error de conexión. Intente nuevamente.');
      });
  }
  
  /**
   * Muestra indicador de carga en resultados
   */
  function showLoadingResults() {
    if (searchResultsContainer) {
      searchResultsContainer.innerHTML = '<div class="emoji-search-loading">Buscando...</div>';
      searchResultsContainer.style.display = 'block';
    }
  }
  
  /**
   * Muestra mensaje de error
   * @param {string} message - Mensaje de error
   */
  function showErrorMessage(message) {
    if (searchResultsContainer) {
      searchResultsContainer.innerHTML = `<div class="emoji-search-error">${message}</div>`;
    }
  }
  
  /**
   * Muestra los resultados de búsqueda
   * @param {Array} results - Resultados de búsqueda
   */
  function displaySearchResults(results) {
    if (!searchResultsContainer) return;
    
    if (!results || results.length === 0) {
      searchResultsContainer.innerHTML = '<div class="emoji-search-empty">No se encontraron resultados</div>';
      return;
    }
    
    // Agrupar resultados por tipo
    const grouped = {
      emoji: results.filter(r => r.type === 'emoji'),
      grupo: results.filter(r => r.type === 'grupo'),
      relacion: results.filter(r => r.type === 'relacion')
    };
    
    let html = '<div class="emoji-search-results-content">';
    
    // Emojis
    if (grouped.emoji.length > 0) {
      html += '<h3 class="emoji-search-category">Emojis</h3>';
      html += '<div class="emoji-search-items">';
      
      grouped.emoji.forEach(item => {
        html += `
          <div class="emoji-search-item" data-type="emoji" data-id="${item.id}">
            <div class="emoji-search-item-icon">${item.emoji}</div>
            <div class="emoji-search-item-info">
              <div class="emoji-search-item-title">${item.titulo || 'Emoji sin título'}</div>
              <div class="emoji-search-item-subtitle">
                Coordenadas: ${parseFloat(item.lat_inicial).toFixed(6)}, ${parseFloat(item.lng_inicial).toFixed(6)}
              </div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    // Grupos
    if (grouped.grupo.length > 0) {
      html += '<h3 class="emoji-search-category">Grupos</h3>';
      html += '<div class="emoji-search-items">';
      
      grouped.grupo.forEach(item => {
        html += `
          <div class="emoji-search-item" data-type="grupo" data-id="${item.id}">
            <div class="emoji-search-item-icon" style="background-color:${item.color || '#4285F4'}">
              <i class="bi bi-collection"></i>
            </div>
            <div class="emoji-search-item-info">
              <div class="emoji-search-item-title">${item.nombre}</div>
              <div class="emoji-search-item-subtitle">${item.criterio}</div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    // Relaciones
    if (grouped.relacion.length > 0) {
      html += '<h3 class="emoji-search-category">Relaciones</h3>';
      html += '<div class="emoji-search-items">';
      
      grouped.relacion.forEach(item => {
        html += `
          <div class="emoji-search-item" data-type="relacion" data-id="${item.id}">
            <div class="emoji-search-item-relation">
              <span>${item.emoji_origen}</span>
              <i class="bi bi-arrow-right"></i>
              <span>${item.emoji_destino}</span>
            </div>
            <div class="emoji-search-item-info">
              <div class="emoji-search-item-title">${item.etiqueta || 'Sin etiqueta'}</div>
              <div class="emoji-search-item-subtitle">Grupo: ${item.nombre_grupo}</div>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
    }
    
    html += '</div>';
    
    // Mostrar resultados
    searchResultsContainer.innerHTML = html;
    searchResultsContainer.style.display = 'block';
    
    // Agregar eventos a los resultados
    setupResultEvents();
  }
  
  /**
   * Configura eventos para los elementos de resultados
   */
  function setupResultEvents() {
    // Evento clic en elemento de resultado
    const items = document.querySelectorAll('.emoji-search-item');
    items.forEach(item => {
      item.addEventListener('click', function() {
        const type = this.dataset.type;
        const id = parseInt(this.dataset.id);
        
        handleResultClick(type, id);
      });
    });
  }
  
  /**
   * Maneja el clic en un resultado
   * @param {string} type - Tipo de resultado (emoji, grupo, relacion)
   * @param {number} id - ID del elemento
   */
  function handleResultClick(type, id) {
    // Limpiar visualizaciones anteriores
    clearActiveVisualization();
    
    // Acciones según tipo
    switch (type) {
      case 'emoji':
        showEmoji(id);
        break;
      case 'grupo':
        showGroup(id);
        break;
      case 'relacion':
        showRelation(id);
        break;
    }
  }
  
  /**
   * Muestra un emoji en el mapa y sus relaciones
   * @param {number} id - ID del emoji
   */
  function showEmoji(id) {
    fetch(`obtener_emojis_relacionados.php?emoji_id=${id}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.relacionados.length > 0) {
          // Centrar mapa en el emoji seleccionado
          centerMapOnEmoji(id);
          
          // Mostrar panel de navegación con emojis relacionados
          if (typeof mostrarRelacionesEmoji === 'function') {
            mostrarRelacionesEmoji(id);
          } else {
            console.warn('Función mostrarRelacionesEmoji no disponible');
          }
        } else {
          // Mostrar solo el emoji sin relaciones
          centerMapOnEmoji(id);
        }
      })
      .catch(error => {
        console.error('Error al obtener relaciones:', error);
      });
  }
  
  /**
   * Muestra todos los emojis de un grupo
   * @param {number} id - ID del grupo
   */
  function showGroup(id) {
    fetch(`obtener_emojis_por_grupo.php?grupo_id=${id}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.emojis) {
          // Mostrar todos los emojis del grupo
          highlightEmojisInMap(data.emojis);
          
          // Ajustar vista para mostrar todos
          fitMapToEmojis(data.emojis);
          
          // Mostrar panel con relaciones del grupo
          if (typeof mostrarRelacionesPorGrupo === 'function') {
            mostrarRelacionesPorGrupo(id);
          } else {
            console.warn('Función mostrarRelacionesPorGrupo no disponible');
          }
        }
      })
      .catch(error => {
        console.error('Error al obtener emojis del grupo:', error);
      });
  }
  
  /**
   * Muestra una relación específica
   * @param {number} id - ID de la relación
   */
  function showRelation(id) {
    fetch(`obtener_relacion.php?id=${id}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.relacion) {
          // Centrar mapa para mostrar ambos emojis
          const bounds = [
            [data.relacion.lat_origen, data.relacion.lng_origen],
            [data.relacion.lat_destino, data.relacion.lng_destino]
          ];
          map.fitBounds(bounds, { padding: [50, 50] });
          
          // Crear línea entre emojis
          const line = L.polyline(bounds, {
            color: data.relacion.color || '#3498db',
            weight: 3,
            opacity: 0.8
          }).addTo(map);
          
          activeRelations.push(line);
          
          // Mostrar panel de navegación si disponible
          if (typeof mostrarRelacionEspecifica === 'function') {
            mostrarRelacionEspecifica(data.relacion);
          }
        }
      })
      .catch(error => {
        console.error('Error al obtener relación:', error);
      });
  }
  
  /**
   * Centra el mapa en un emoji específico
   * @param {number} id - ID del emoji
   */
  function centerMapOnEmoji(id) {
    // Buscar primero en emojis animados
    let found = false;
    
    if (window.appMapa && window.appMapa.emojiMarkers) {
      for (const marker of window.appMapa.emojiMarkers) {
        if (marker._icon && marker._icon.getAttribute('data-id') == id) {
          // Centrar mapa en este marker
          map.setView(marker.getLatLng(), 16);
          
          // Resaltar este marker
          highlightMarker(marker);
          
          found = true;
          break;
        }
      }
    }
    
    // Si no se encontró, buscar en la base de datos
    if (!found) {
      fetch(`get_icono.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.lat_inicial && data.lng_inicial) {
            map.setView([data.lat_inicial, data.lng_inicial], 16);
          }
        })
        .catch(error => {
          console.error('Error al obtener emoji:', error);
        });
    }
  }
  
  /**
   * Resalta un marcador en el mapa
   * @param {L.Marker} marker - Marcador a resaltar
   */
  function highlightMarker(marker) {
    if (!marker || !marker._icon) return;
    
    // Agregar clase para resaltar
    marker._icon.classList.add('highlighted-emoji');
    
    // Guardar en activos
    activeMarkers.push(marker);
    
    // Abrir popup si existe
    if (marker.getPopup()) {
      marker.openPopup();
    }
  }
  
  /**
   * Resalta múltiples emojis en el mapa
   * @param {Array} emojis - Lista de emojis a resaltar
   */
  function highlightEmojisInMap(emojis) {
    if (!emojis || !emojis.length) return;
    
    emojis.forEach(emoji => {
      // Intentar encontrar marcador existente
      if (window.appMapa && window.appMapa.emojiMarkers) {
        for (const marker of window.appMapa.emojiMarkers) {
          if (marker._icon && marker._icon.getAttribute('data-id') == emoji.id) {
            highlightMarker(marker);
            break;
          }
        }
      }
    });
  }
  
  /**
   * Ajusta la vista del mapa para mostrar todos los emojis
   * @param {Array} emojis - Lista de emojis
   */
  function fitMapToEmojis(emojis) {
    if (!emojis || emojis.length === 0) return;
    
    const bounds = L.latLngBounds();
    
    emojis.forEach(emoji => {
      if (emoji.lat_inicial && emoji.lng_inicial) {
        bounds.extend([emoji.lat_inicial, emoji.lng_inicial]);
      }
    });
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
  
  /**
   * Limpia las visualizaciones activas
   */
  function clearActiveVisualization() {
    // Limpiar marcadores resaltados
    activeMarkers.forEach(marker => {
      if (marker && marker._icon) {
        marker._icon.classList.remove('highlighted-emoji');
      }
    });
    activeMarkers = [];
    
    // Limpiar relaciones activas
    activeRelations.forEach(relation => {
      if (relation && map) {
        map.removeLayer(relation);
      }
    });
    activeRelations = [];
    
    // Limpiar relaciones de emoji-vinculos.js si disponible
    if (typeof cerrarNavegacionEmojis === 'function') {
      cerrarNavegacionEmojis();
    }
  }
  
  /**
   * Limpia los resultados de búsqueda
   */
  function clearSearchResults() {
    if (searchResultsContainer) {
      searchResultsContainer.innerHTML = '';
      searchResultsContainer.style.display = 'none';
    }
    
    // También limpiar visualizaciones
    clearActiveVisualization();
  }
  
  // API pública
  return {
    init: init,
    search: performSearch,
    clearResults: clearSearchResults,
    showEmoji: showEmoji,
    showGroup: showGroup,
    showRelation: showRelation
  };
})();

// Auto-inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Esperar a que el mapa esté disponible
  const checkMapInterval = setInterval(function() {
    let mapInstance = null;
    
    // Intentar obtener el mapa de diferentes fuentes
    if (window.appMapa && window.appMapa.map) {
      mapInstance = window.appMapa.map;
    } else if (window.map) {
      mapInstance = window.map;
    }
    
    if (mapInstance) {
      clearInterval(checkMapInterval);
      console.log("Mapa detectado, inicializando EmojiSearchModule...");
      
      // Inicializar módulo de búsqueda
      EmojiSearchModule.init(mapInstance);
    }
  }, 500);
});