// Variables globales
let mapaVinculos = null;
let flechasActuales = [];
let panelNavegacion = null;
let emojiActual = null;

// Inicializar sistema
function inicializarSistemaVinculos() {
  console.log("Inicializando sistema de vínculos...");
  
  // Intentar obtener referencia al mapa desde diferentes variables
  if (window.map) {
    mapaVinculos = window.map;
    console.log("✅ Mapa encontrado en window.map");
  } else if (window.appMapa && window.appMapa.map) {
    mapaVinculos = window.appMapa.map;
    console.log("✅ Mapa encontrado en window.appMapa.map");
  } else if (window.mapa) {
    mapaVinculos = window.mapa;
    console.log("✅ Mapa encontrado en window.mapa");
  } else {
    console.error("⛔ No se pudo encontrar el mapa");
    console.log("Reintentando en 2 segundos...");
    setTimeout(inicializarSistemaVinculos, 2000);
    return;
  }
  
  console.log("✅ Sistema de vínculos inicializado correctamente");
  agregarEstilosVinculos();
}

// Mostrar relaciones para un emoji
function mostrarRelacionesEmoji(emojiId, grupoId = 0) {
  console.log(`🔍 Buscando relaciones para emoji ID: ${emojiId}`);
  
  // Re-verificar el mapa antes de cada uso
  if (!mapaVinculos || typeof mapaVinculos.addLayer !== 'function') {
    if (window.appMapa && window.appMapa.map) {
      mapaVinculos = window.appMapa.map;
      console.log("Re-asignando mapa desde appMapa.map");
    } else {
      console.error("⛔ No hay un mapa válido disponible");
      mostrarMensaje("Error: No se pudo acceder al mapa", "error");
      return;
    }
  }
  
  // Limpiar navegación anterior
  limpiarNavegacionEmojis();
  emojiActual = emojiId;
  
  // Mostrar un indicador de carga
  mostrarCargando();
  
  // Obtener datos del servidor
  fetch(`obtener_emojis_relacionados.php?emoji_id=${emojiId}&grupo_id=${grupoId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("📊 Datos recibidos:", data);
      ocultarCargando();
      
      if (!data.success || !data.relacionados || data.relacionados.length === 0) {
        mostrarMensaje(`No hay relaciones definidas para este emoji`);
        return;
      }
      
      try {
        // Procesar datos recibidos
        const relacionados = data.relacionados;
        const gruposUnicos = [];
        
        // Obtener grupos únicos
        relacionados.forEach(rel => {
          if (!gruposUnicos.find(g => g.id === rel.grupo_id)) {
            gruposUnicos.push({
              id: rel.grupo_id,
              nombre: rel.nombre_grupo || 'Sin nombre',
              criterio: rel.criterio || '',
              color: rel.color || rel.grupo_color || "#3498db"
            });
          }
        });
        
        // Dibujar flechas para cada relación
        relacionados.forEach(rel => {
          try {
            dibujarFlechaRelacion(
              [parseFloat(rel.lat_inicial), parseFloat(rel.lng_inicial)],
              emojiId,
              rel.emoji_destino_id,
              rel.etiqueta || "",
              rel.color || "#3498db"
            );
          } catch (err) {
            console.error("Error dibujando flecha:", err);
          }
        });
        
        // Mostrar panel de navegación
        mostrarPanelVinculos(relacionados, gruposUnicos, emojiId);
      } catch (err) {
        console.error("Error procesando datos:", err);
        mostrarMensaje("Error al procesar datos", "error");
      }
    })
    .catch(error => {
      ocultarCargando();
      console.error("❌ Error:", error);
      mostrarMensaje(`Error: ${error.message}`, "error");
    });
}

// Dibujar flecha entre dos puntos
function dibujarFlechaRelacion(puntoDestino, origenId, destinoId, etiqueta, color) {
  // Verificar que mapaVinculos es válido
  if (!mapaVinculos || typeof mapaVinculos.addLayer !== 'function') {
    console.error("⛔ Mapa no válido para dibujar flecha");
    return;
  }
  
  // Buscar el emoji origen (punto de partida de la flecha)
  let puntoOrigen = null;
  if (window.appMapa && window.appMapa.emojiMarkers) {
    // Intentar encontrar el marcador entre los emojis cargados
    for (let i = 0; i < window.appMapa.emojiMarkers.length; i++) {
      const marcador = window.appMapa.emojiMarkers[i];
      if (marcador._icon && marcador._icon.getAttribute('data-id') == origenId) {
        puntoOrigen = marcador.getLatLng();
        break;
      }
    }
  }
  
  // Si no encontramos el punto específico, usar el centro visible
  if (!puntoOrigen) {
    console.log("⚠️ No se encontró marcador origen, usando centro del mapa");
    puntoOrigen = mapaVinculos.getCenter();
  }
  
  try {
    // Trazar línea con manejo de errores
    const linea = L.polyline([
      [puntoOrigen.lat, puntoOrigen.lng], 
      [parseFloat(puntoDestino[0]), parseFloat(puntoDestino[1])]
    ], {
      color: color || "#3498db",
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 5',
      smoothFactor: 1
    });
    
    // Agregar al mapa con verificación adicional
    mapaVinculos.addLayer(linea);
    flechasActuales.push(linea);
    
    // Añadir decorador de flecha si está disponible
    if (window.L && window.L.polylineDecorator) {
      const decorador = L.polylineDecorator(linea, {
        patterns: [
          {
            offset: '95%',
            repeat: 0,
            symbol: L.Symbol.arrowHead({
              pixelSize: 12,
              headAngle: 45,
              pathOptions: { 
                color: color || "#3498db",
                fillOpacity: 0.8,
                weight: 0
              }
            })
          }
        ]
      });
      mapaVinculos.addLayer(decorador);
      flechasActuales.push(decorador);
    }
    
    // Añadir etiqueta si existe
    if (etiqueta && etiqueta.trim()) {
      // Calcular punto medio
      const puntoMedio = L.latLng(
        (puntoOrigen.lat + parseFloat(puntoDestino[0])) / 2,
        (puntoOrigen.lng + parseFloat(puntoDestino[1])) / 2
      );
      
      // Crear etiqueta
      const etiquetaMarker = L.marker(puntoMedio, {
        icon: L.divIcon({
          className: 'etiqueta-vinculo',
          html: `<div class="vinculo-etiqueta" style="border-color:${color || "#3498db"}">${etiqueta}</div>`,
          iconSize: [120, 40],
          iconAnchor: [60, 20]
        })
      });
      mapaVinculos.addLayer(etiquetaMarker);
      flechasActuales.push(etiquetaMarker);
    }
  } catch (err) {
    console.error("Error creando la flecha:", err);
  }
}

// Mostrar panel de navegación con emojis relacionados
function mostrarPanelVinculos(relacionados, grupos, emojiId) {
  if (panelNavegacion) {
    panelNavegacion.remove();
  }
  
  // Crear panel
  panelNavegacion = L.control({ position: 'topright' });
  
  panelNavegacion.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'panel-navegacion-emojis');
    
    let html = `
      <div class="panel-header">
        <h3>🔗 Emojis Relacionados</h3>
        <button onclick="cerrarNavegacionEmojis()" class="close-btn">×</button>
      </div>
    `;
    
    // Generar contenido por grupos
    grupos.forEach(grupo => {
      html += `
        <div class="grupo-emojis">
          <h4>${grupo.nombre}</h4>
          <div class="lista-emojis">`;
      
      // Filtrar emojis de este grupo
      const emojisGrupo = relacionados.filter(rel => rel.grupo_id == grupo.id);
      
      emojisGrupo.forEach(rel => {
        html += `
          <button class="emoji-btn" 
            onclick="mostrarRelacionesEmoji(${rel.emoji_destino_id})"
            style="border-color:${grupo.color}">
            ${rel.emoji} ${rel.titulo || ''}
          </button>`;
      });
      
      html += `</div></div>`;
    });
    
    div.innerHTML = html;
    return div;
  };
  
  panelNavegacion.addTo(mapaVinculos);
}

// Limpiar navegación
function limpiarNavegacionEmojis() {
  // Eliminar flechas
  if (flechasActuales.length) {
    flechasActuales.forEach(flecha => {
      if (mapaVinculos && mapaVinculos.removeLayer) {
        try {
          mapaVinculos.removeLayer(flecha);
        } catch (e) {
          console.log("Error al eliminar capa:", e);
        }
      }
    });
    flechasActuales = [];
  }
  
  // Eliminar panel
  if (panelNavegacion) {
    try {
      panelNavegacion.remove();
    } catch (e) {
      console.log("Error al eliminar panel:", e);
    }
    panelNavegacion = null;
  }
}

// Cerrar navegación
function cerrarNavegacionEmojis() {
  limpiarNavegacionEmojis();
}

// Mostrar mensaje temporal
function mostrarMensaje(mensaje, tipo = "info") {
  const div = document.createElement('div');
  div.className = `mensaje-vinculos mensaje-${tipo}`;
  div.textContent = mensaje;
  
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.classList.add('mostrar');
    
    setTimeout(() => {
      div.classList.remove('mostrar');
      setTimeout(() => {
        div.remove();
      }, 300);
    }, 3000);
  }, 10);
}

// Mostrar indicador de carga
function mostrarCargando() {
  const div = document.createElement('div');
  div.className = 'cargando-vinculos';
  div.innerHTML = `
    <div class="spinner"></div>
    <p>Cargando relaciones...</p>
  `;
  
  document.body.appendChild(div);
}

// Ocultar indicador de carga
function ocultarCargando() {
  const cargando = document.querySelector('.cargando-vinculos');
  if (cargando) {
    cargando.remove();
  }
}

// Agregar estilos CSS
function agregarEstilosVinculos() {
  if (document.getElementById('estilos-vinculos')) return;
  
  const estilos = document.createElement('style');
  estilos.id = 'estilos-vinculos';
  estilos.innerHTML = `
    .panel-navegacion-emojis {
      background: white;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      padding: 15px;
      max-width: 300px;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    
    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 5px;
    }
    
    .grupo-emojis {
      margin-bottom: 15px;
    }
    
    .grupo-emojis h4 {
      margin: 5px 0;
      font-size: 14px;
      color: #555;
    }
    
    .lista-emojis {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    
    .emoji-btn {
      background: white;
      border: 2px solid;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
      text-align: left;
    }
    
    .emoji-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .vinculo-etiqueta {
      background: white;
      border: 2px solid;
      border-radius: 4px;
      padding: 3px 8px;
      font-size: 12px;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      text-align: center;
    }
    
    .etiqueta-vinculo {
      background: none !important;
      border: none !important;
    }
    
    .mensaje-vinculos {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: #333;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 10000;
      transition: transform 0.3s;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    
    .mensaje-vinculos.mostrar {
      transform: translateX(-50%) translateY(0);
    }
    
    .mensaje-error {
      background: #e74c3c;
    }
    
    .cargando-vinculos {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #3498db;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Añade esto al final de la función agregarEstilosVinculos() */

/* Ocultar específicamente el elemento problemático */
.boton-siguiente,  
.navegacion-mapa .siguiente-btn, 
#siguiente-btn {
  display: none !important; 
}
  `;
  
  document.head.appendChild(estilos);
}



// Escuchar tecla Escape para cerrar navegación
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && panelNavegacion) {
    cerrarNavegacionEmojis();
  }
});

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 Inicializando sistema de vínculos de emoji");
  setTimeout(inicializarSistemaVinculos, 1500);
});