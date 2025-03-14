/**
 * Funciones mejoradas para emoji-vinculos.js
 * 
 * Este código contiene las funciones adicionales que debes integrar
 * en tu archivo emoji-vinculos.js existente para añadir las nuevas
 * funcionalidades de búsqueda y visualización
 */

/**
 * Muestra todas las relaciones de un grupo específico
 * @param {number} grupoId - ID del grupo a visualizar
 */
function mostrarRelacionesPorGrupo(grupoId) {
  console.log(`Mostrando relaciones del grupo ID: ${grupoId}`);
  
  // Verificar que el mapa exista
  if (!mapaVinculos) {
    if (window.appMapa && window.appMapa.map) {
      mapaVinculos = window.appMapa.map;
    } else if (window.map) {
      mapaVinculos = window.map;
    } else {
      console.error("No se pudo encontrar el mapa");
      mostrarMensaje("Error: No se pudo acceder al mapa", "error");
      return;
    }
  }
  
  // Limpiar navegación anterior
  limpiarNavegacionEmojis();
  
  // Mostrar un indicador de carga
  mostrarCargando();
  
  // Obtener datos del servidor
  fetch(`obtener_emojis_por_grupo.php?grupo_id=${grupoId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos recibidos:", data);
      ocultarCargando();
      
      if (!data.success || !data.relaciones || data.relaciones.length === 0) {
        mostrarMensaje(`No hay relaciones definidas para este grupo`);
        return;
      }
      
      try {
        // Procesar relaciones
        const grupo = data.grupo;
        const relaciones = data.relaciones;
        
        // Dibujar flechas para cada relación
        relaciones.forEach(rel => {
          try {
            dibujarFlechaRelacion(
              [parseFloat(rel.lat_destino), parseFloat(rel.lng_destino)],
              rel.emoji_origen_id,
              rel.emoji_destino_id,
              rel.etiqueta || "",
              rel.color || grupo.color || "#3498db"
            );
          } catch (err) {
            console.error("Error dibujando flecha:", err);
          }
        });
        
        // Mostrar panel de navegación del grupo
        mostrarPanelVinculosGrupo(data);
        
        // Ajustar vista para ver todos los emojis
        ajustarVistaGrupo(data.emojis);
        
      } catch (err) {
        console.error("Error procesando datos:", err);
        mostrarMensaje("Error al procesar datos", "error");
      }
    })
    .catch(error => {
      ocultarCargando();
      console.error("Error:", error);
      mostrarMensaje(`Error: ${error.message}`, "error");
    });
}

/**
 * Muestra una relación específica entre dos emojis
 * @param {Object} relacion - Datos de la relación a mostrar
 */
function mostrarRelacionEspecifica(relacion) {
  console.log(`Mostrando relación específica ID: ${relacion.id}`);
  
  // Verificar que el mapa exista
  if (!mapaVinculos) {
    if (window.appMapa && window.appMapa.map) {
      mapaVinculos = window.appMapa.map;
    } else if (window.map) {
      mapaVinculos = window.map;
    } else {
      console.error("No se pudo encontrar el mapa");
      mostrarMensaje("Error: No se pudo acceder al mapa", "error");
      return;
    }
  }
  
  // Limpiar navegación anterior
  limpiarNavegacionEmojis();
  
  try {
    // Dibujar flecha entre los dos emojis
    dibujarFlechaRelacion(
      [parseFloat(relacion.lat_destino), parseFloat(relacion.lng_destino)],
      relacion.emoji_origen_id,
      relacion.emoji_destino_id,
      relacion.etiqueta || "",
      relacion.color || relacion.color_grupo || "#3498db"
    );
    
    // Resaltar puntos origen y destino
    resaltarPuntoEmoji(relacion.emoji_origen_id);
    resaltarPuntoEmoji(relacion.emoji_destino_id);
    
    // Crear un panel específico para esta relación
    mostrarPanelRelacionEspecifica(relacion);
    
  } catch (err) {
    console.error("Error al mostrar relación específica:", err);
    mostrarMensaje("Error al mostrar la relación", "error");
  }
}

/**
 * Resalta un emoji específico en el mapa
 * @param {number} emojiId - ID del emoji a resaltar
 */
function resaltarPuntoEmoji(emojiId) {
  // Buscar el emoji entre los marcadores existentes
  if (window.appMapa && window.appMapa.emojiMarkers) {
    for (const marker of window.appMapa.emojiMarkers) {
      if (marker._icon && marker._icon.getAttribute('data-id') == emojiId) {
        // Añadir clase de resaltado
        marker._icon.classList.add('highlighted-emoji');
        
        // Guardar en la lista de elementos activos para limpieza posterior
        if (!flechasActuales.includes(marker)) {
          flechasActuales.push({
            type: 'highlighted',
            element: marker
          });
        }
        
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Muestra un panel de navegación para las relaciones de un grupo
 * @param {Object} data - Datos del grupo, emojis y relaciones
 */
function mostrarPanelVinculosGrupo(data) {
  if (panelNavegacion) {
    panelNavegacion.remove();
  }
  
  // Crear panel
  panelNavegacion = L.control({ position: 'topright' });
  
  panelNavegacion.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'panel-navegacion-emojis');
    
    let html = `
      <div class="panel-header">
        <h3>
          <div style="background-color:${data.grupo.color}; width:20px; height:20px; display:inline-block; border-radius:50%; vertical-align:middle; margin-right:5px;"></div>
          Grupo: ${data.grupo.nombre}
        </h3>
        <button onclick="cerrarNavegacionEmojis()" class="close-btn">×</button>
      </div>
      <p class="grupo-criterio">${data.grupo.criterio}</p>
    `;
    
    // Mostrar emojis del grupo agrupados por relaciones
    html += `
      <div class="grupo-emojis">
        <h4>Emojis en este grupo (${data.emojis.length})</h4>
        <div class="lista-emojis">`;
    
    data.emojis.forEach(emoji => {
      html += `
        <button class="emoji-btn" 
          onclick="mostrarRelacionesEmoji(${emoji.id}, ${data.grupo.id})"
          title="${emoji.titulo || 'Sin título'}"
          style="border-color:${data.grupo.color}">
          ${emoji.emoji}
        </button>`;
    });
    
    html += `</div></div>`;
    
    // Mostrar relaciones del grupo
    html += `
      <div class="grupo-relaciones">
        <h4>Relaciones (${data.relaciones.length})</h4>
        <div class="lista-relaciones">`;
    
    data.relaciones.forEach(rel => {
      html += `
        <div class="relacion-item" onclick="mostrarRelacionEspecifica(${JSON.stringify(rel).replace(/"/g, '&quot;')})">
          <span>${rel.emoji_origen}</span>
          <i class="bi bi-arrow-right"></i>
          <span>${rel.emoji_destino}</span>
          ${rel.etiqueta ? `<small class="relacion-etiqueta">${rel.etiqueta}</small>` : ''}
        </div>`;
    });
    
    html += `</div></div>`;
    
    div.innerHTML = html;
    return div;
  };
  
  panelNavegacion.addTo(mapaVinculos);
}

/**
 * Muestra un panel específico para una relación
 * @param {Object} relacion - Datos de la relación a mostrar
 */
function mostrarPanelRelacionEspecifica(relacion) {
  if (panelNavegacion) {
    panelNavegacion.remove();
  }
  
  // Crear panel
  panelNavegacion = L.control({ position: 'topright' });
  
  panelNavegacion.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'panel-navegacion-emojis');
    
    let html = `
      <div class="panel-header">
        <h3>Relación</h3>
        <button onclick="cerrarNavegacionEmojis()" class="close-btn">×</button>
      </div>
      
      <div class="relacion-detalles">
        <div class="relacion-principal">
          <div class="emoji-origen">
            <div class="emoji-grande">${relacion.emoji_origen}</div>
            <div class="emoji-titulo">${relacion.titulo_origen || 'Sin título'}</div>
            <button class="ver-btn" onclick="mostrarRelacionesEmoji(${relacion.emoji_origen_id})">
              Ver vínculos
            </button>
          </div>
          
          <div class="relacion-flecha">
            <div class="flecha-linea" style="background-color:${relacion.color || relacion.color_grupo || '#3498db'}"></div>
            <div class="flecha-etiqueta">${relacion.etiqueta || '(Sin etiqueta)'}</div>
            ${relacion.es_bidireccional ? '<div class="flecha-bidireccional">⇄ Bidireccional</div>' : ''}
          </div>
          
          <div class="emoji-destino">
            <div class="emoji-grande">${relacion.emoji_destino}</div>
            <div class="emoji-titulo">${relacion.titulo_destino || 'Sin título'}</div>
            <button class="ver-btn" onclick="mostrarRelacionesEmoji(${relacion.emoji_destino_id})">
              Ver vínculos
            </button>
          </div>
        </div>
        
        <div class="relacion-grupo">
          <h4>Grupo</h4>
          <div class="grupo-info">
            <div class="grupo-color" style="background-color:${relacion.color_grupo}"></div>
            <div class="grupo-datos">
              <div class="grupo-nombre">${relacion.nombre_grupo}</div>
              <div class="grupo-criterio">${relacion.criterio_grupo}</div>
            </div>
            <button class="ver-btn" onclick="mostrarRelacionesPorGrupo(${relacion.grupo_id})">
              Ver grupo
            </button>
          </div>
        </div>
      </div>
    `;
    
    div.innerHTML = html;
    return div;
  };
  
  panelNavegacion.addTo(mapaVinculos);
}

/**
 * Ajusta la vista del mapa para mostrar todos los emojis de un grupo
 * @param {Array} emojis - Lista de emojis a mostrar
 */
function ajustarVistaGrupo(emojis) {
  if (!emojis || emojis.length === 0 || !mapaVinculos) return;
  
  try {
    const bounds = L.latLngBounds();
    let valid = false;
    
    // Añadir cada emoji al bounds
    emojis.forEach(emoji => {
      if (emoji.lat_inicial && emoji.lng_inicial) {
        bounds.extend([parseFloat(emoji.lat_inicial), parseFloat(emoji.lng_inicial)]);
        valid = true;
      }
    });
    
    // Si hay puntos válidos, ajustar la vista
    if (valid) {
      mapaVinculos.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  } catch (error) {
    console.error("Error al ajustar vista:", error);
  }
}

/**
 * Mejora a la función original mostrarRelacionesEmoji para aceptar un grupo_id opcional
 * @param {number} emojiId - ID del emoji
 * @param {number} grupoId - ID del grupo (opcional)
 */
function mostrarRelacionesEmoji(emojiId, grupoId = 0) {
  console.log(`Mostrando relaciones para emoji ID: ${emojiId}, grupo ID: ${grupoId}`);
  
  // Verificar que el mapa exista
  if (!mapaVinculos) {
    if (window.appMapa && window.appMapa.map) {
      mapaVinculos = window.appMapa.map;
    } else if (window.map) {
      mapaVinculos = window.map;
    } else {
      console.error("No se pudo encontrar el mapa");
      mostrarMensaje("Error: No se pudo acceder al mapa", "error");
      return;
    }
  }
  
  // Limpiar navegación anterior
  limpiarNavegacionEmojis();
  emojiActual = emojiId;
  
  // Mostrar un indicador de carga
  mostrarCargando();
  
  // Construir URL con o sin filtro de grupo
  let url = `obtener_emojis_relacionados.php?emoji_id=${emojiId}`;
  if (grupoId > 0) {
    url += `&grupo_id=${grupoId}`;
  }
  
  // Obtener datos del servidor
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos recibidos:", data);
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
        
        // Centrar mapa en el emoji actual
        centrarMapaEnEmoji(emojiId);
        
      } catch (err) {
        console.error("Error procesando datos:", err);
        mostrarMensaje("Error al procesar datos", "error");
      }
    })
    .catch(error => {
      ocultarCargando();
      console.error("Error:", error);
      mostrarMensaje(`Error: ${error.message}`, "error");
    });
}

/**
 * Centra el mapa en un emoji según su ID
 * @param {number} emojiId - ID del emoji
 */
function centrarMapaEnEmoji(emojiId) {
  // Buscar entre los emojis animados
  if (window.appMapa && window.appMapa.emojiMarkers) {
    for (const marker of window.appMapa.emojiMarkers) {
      if (marker._icon && marker._icon.getAttribute('data-id') == emojiId) {
        // Centrar en este emoji
        mapaVinculos.setView(marker.getLatLng(), 16);
        return true;
      }
    }
  }
  
  // Si no lo encuentra, buscar en la base de datos
  fetch(`get_icono.php?id=${emojiId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.emoji) {
        const emoji = data.emoji;
        if (emoji.lat_inicial && emoji.lng_inicial) {
          mapaVinculos.setView(
            [parseFloat(emoji.lat_inicial), parseFloat(emoji.lng_inicial)], 
            16
          );
        }
      }
    })
    .catch(error => {
      console.error("Error al obtener coordenadas del emoji:", error);
    });
}

// Estilos adicionales específicos para las nuevas funcionalidades de relaciones
if (!document.getElementById('vinculos-estilos-adicionales')) {
  const estilosAdicionales = document.createElement('style');
  estilosAdicionales.id = 'vinculos-estilos-adicionales';
  estilosAdicionales.innerHTML = `
    .panel-navegacion-emojis {
      max-width: 320px;
      font-size: 14px;
    }
    
    .relacion-item {
      display: flex;
      align-items: center;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 5px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .relacion-item:hover {
      background: #e9ecef;
    }
    
    .relacion-item i {
      margin: 0 5px;
      color: #666;
    }
    
    .relacion-etiqueta {
      font-size: 0.8em;
      color: #666;
      margin-left: 8px;
      display: inline-block;
      background: #e9ecef;
      padding: 2px 5px;
      border-radius: 3px;
    }
    
    .grupo-criterio {
      font-style: italic;
      color: #666;
      margin-bottom: 15px;
    }
    
    .relacion-detalles {
      padding: 10px 0;
    }
    
    .relacion-principal {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    
    .emoji-origen, .emoji-destino {
      text-align: center;
      padding: 10px;
      border-radius: 5px;
      background: #f8f9fa;
    }
    
    .emoji-grande {
      font-size: 24px;
      margin-bottom: 5px;
    }
    
    .emoji-titulo {
      font-size: 12px;
      color: #333;
      margin-bottom: 5px;
    }
    
    .relacion-flecha {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 10px;
    }
    
    .flecha-linea {
      width: 100%;
      height: 4px;
      background-color: #3498db;
      position: relative;
    }
    
    .flecha-linea:after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 10px solid #3498db;
    }
    
    .flecha-etiqueta {
      font-size: 12px;
      margin-top: 5px;
      padding: 3px 8px;
      background: #f1f1f1;
      border-radius: 10px;
      text-align: center;
    }
    
    .flecha-bidireccional {
      font-size: 12px;
      margin-top: 2px;
      color: #666;
    }
    
    .relacion-grupo {
      padding: 10px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    
    .relacion-grupo h4 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 14px;
      color: #333;
    }
    
    .grupo-info {
      display: flex;
      align-items: center;
    }
    
    .grupo-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 8px;
    }
    
    .grupo-datos {
      flex: 1;
    }
    
    .grupo-nombre {
      font-weight: bold;
      font-size: 13px;
    }
    
    .grupo-criterio {
      font-size: 12px;
      color: #666;
    }
    
    .ver-btn {
      font-size: 11px;
      padding: 3px 8px;
      background: #e7f3ff;
      color: #0d6efd;
      border: 1px solid #c6e1ff;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .ver-btn:hover {
      background: #d0e7ff;
    }
  `;
  
  document.head.appendChild(estilosAdicionales);
}
