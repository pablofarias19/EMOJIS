/**
 * emoji-animations.js
 * 
 * Descripción:
 * Este archivo maneja las animaciones de emojis en el mapa,
 * creando elementos visuales dinámicos que se mueven entre puntos.
 * 
 * Funcionalidades principales:
 * - Carga de emojis animados desde el servidor
 * - Creación de marcadores para cada emoji
 * - Animación de movimiento entre coordenadas 
 * - Gestión del ciclo de vida de las animaciones
 * - Popups interactivos con enlaces y contacto
 */

// Función para crear popups mejorados para emojis
function crearPopupParaEmoji(emoji, titulo, descripcion, id, enlaceWeb = null, contacto = null) {
  // Construimos el HTML del popup con las características solicitadas
  let popupHTML = `
    <div class="emoji-popup-container" style="text-align:center; min-width: 220px; padding: 8px;">
      <h3 style="margin-top:5px; margin-bottom:10px; color:#333;">${titulo}</h3>
      
      <div class="emoji-popup-content" style="margin-bottom:12px;">
        <p style="margin:0 0 10px; line-height:1.4;">${descripcion}</p>
        
        ${enlaceWeb ? 
          `<div class="emoji-popup-link" style="margin:10px 0;">
             <a href="${enlaceWeb}" target="_blank" style="color:#0066cc; text-decoration:none; padding:5px 10px; background:#f1f8ff; border-radius:4px; display:inline-block;">
               🔗 Visitar sitio web
             </a>
           </div>` 
          : ''}
      </div>
      
      <div class="emoji-popup-footer" style="border-top:1px solid #eee; padding-top:10px; display:flex; justify-content:space-between;">
        ${contacto ? 
          `<button onclick="contactarEmoji('${id}', '${contacto}')" 
                  style="background:#4CAF50; color:white; border:none; 
                  padding:5px 12px; border-radius:4px; cursor:pointer; font-size:12px;">
            📞 Contactar
          </button>` 
          : ''}
        
        <button onclick="mostrarRelacionesEmoji(${id})" 
                style="background:#3498db; color:white; border:none; 
                padding:5px 12px; border-radius:4px; cursor:pointer; font-size:12px;">
          🔗 Ver relacionados
        </button>
      </div>
    </div>
  `;
  
  return popupHTML;
}

// Función que maneja el contacto
function contactarEmoji(id, contacto) {
  // Si es un teléfono (comienza con + o números)
  if (/^[+\d]/.test(contacto)) {
    window.open(`tel:${contacto}`, '_blank');
  } 
  // Si es un email
  else if (contacto.includes('@')) {
    window.open(`mailto:${contacto}`, '_blank');
  } 
  // Otro tipo de contacto
  else {
    alert(`Información de contacto: ${contacto}`);
  }
}

// Función para agregar emojis móviles desde el servidor
function agregarEmojisMoviles(map) {
  console.log("Función agregarEmojisMoviles ejecutándose...");
  
  // Verificar que el mapa existe
  if (!map) {
    console.error("El mapa no está inicializado");
    return;
  }
  
  // Limpiar intervalos existentes si hay
  if (typeof limpiarIntervalosEmojis === 'function') {
    limpiarIntervalosEmojis();
  }
  
  // Inicializar arrays si no existen
  if (!window.appMapa.emojiIntervals) window.appMapa.emojiIntervals = [];
  if (!window.appMapa.emojiMarkers) window.appMapa.emojiMarkers = [];
  
  // Cargar datos de emojis desde el servidor
  fetch('movimiento_emoji3.php')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al cargar emojis: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos de emojis recibidos:", data);
      
      // Verificar si hay datos para mostrar
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log("No hay emojis para mostrar");
        return;
      }
      
      // Normalizar formato de datos
      const iconos = Array.isArray(data) ? data : [data];
      
      console.log(`Procesando ${iconos.length} emojis para animación`);
      
      // Procesar cada icono
      iconos.forEach((icono, index) => {
        // Extraer coordenadas según estructura de datos
        const inicioLat = parseFloat(icono.inicio?.lat || icono.lat_inicial || 0);
        const inicioLng = parseFloat(icono.inicio?.lng || icono.lng_inicial || 0);
        const finLat = parseFloat(icono.fin?.lat || icono.lat_final || 0);
        const finLng = parseFloat(icono.fin?.lng || icono.lng_final || 0);
        
        console.log(`Emoji ${index+1}: Coordenadas inicio (${inicioLat}, ${inicioLng}) fin (${finLat}, ${finLng})`);
        
        // Verificar validez de coordenadas
        if (isNaN(inicioLat) || isNaN(inicioLng) || isNaN(finLat) || isNaN(finLng)) {
          console.error("Coordenadas inválidas para icono:", icono);
          return;
        }
        
        // Si las coordenadas son todas 0, no mostrar
        if (inicioLat === 0 && inicioLng === 0 && finLat === 0 && finLng === 0) {
          console.log("Coordenadas en cero, no se mostrará:", icono);
          return;
        }
        
        // Extraer propiedades del emoji
        const emoji = icono.emoji || '🚀';
        const velocidad = parseFloat(icono.velocidad) || 0.0003;
        const titulo = icono.titulo || '';
        const descripcion = icono.descripcion || '';
        const mostrarPopup = icono.mostrar_popup == 1 || icono.popup === true;
        const enlaceWeb = icono.enlaceWeb || null;
        const contacto = icono.contacto || null;
        
        // Crear posiciones para animación
        let posicion = { lat: inicioLat, lng: inicioLng };
        let direccion = 1; // 1 = hacia el final, -1 = hacia el inicio
        
       // Definir icono personalizado con los nuevos estilos
        const emojiIcon = L.divIcon({
         html: `<div class="emoji-contenedor" style="width:30px; height:30px;">
           <div class="emoji-icon-controlado emoji-base interactive" style="font-size: 30px;">${emoji}</div>
         </div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
        });
        
        // Crear marcador
        let emojiMarker = L.marker([posicion.lat, posicion.lng], {
          icon: emojiIcon
        });
        
        // Configurar popup mejorado si corresponde
        if (mostrarPopup && (titulo || descripcion)) {
          // Usar la función para crear el contenido del popup
          const popupContent = crearPopupParaEmoji(
            emoji,
            titulo,
            descripcion,
            icono.id,
            enlaceWeb,
            contacto
          );
          
          emojiMarker.bindPopup(popupContent);
          
          // Opcional: Mostrar popup al hacer hover si se especifica
          if (icono.mostrarAlHover) {
            emojiMarker.on('mouseover', function() {
              this.openPopup();
            });
          }
        }
        
        // Añadir el ID al HTML del marcador para referencias futuras
        emojiMarker.on('add', function(e) {
          if (e.target._icon) {
            e.target._icon.setAttribute('data-id', icono.id);
            e.target._icon.classList.add('emoji-marker');
          }
        });
        
        // Añadir marcador al mapa
        emojiMarker.addTo(map);
        console.log(`Emoji ${emoji} añadido al mapa en (${posicion.lat}, ${posicion.lng})`);
        
        // Guardar referencia al marcador
        window.appMapa.emojiMarkers.push(emojiMarker);
        
        // Cálculos para movimiento vectorial
        const deltaLat = finLat - inicioLat;
        const deltaLng = finLng - inicioLng;
        const distancia = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
        
        // Verificar si la distancia es muy pequeña
        if (distancia < 0.0000001) {
          console.log("Distancia muy pequeña, no se animará:", icono);
          return;
        }
        
        // Normalizar para obtener dirección de movimiento
        const dirLat = deltaLat / distancia;
        const dirLng = deltaLng / distancia;
        
        // Función para actualizar posición del emoji
        function moverEmoji() {
          // Calcular siguiente paso
          const pasoLat = velocidad * direccion * dirLat;
          const pasoLng = velocidad * direccion * dirLng;
          
          // Actualizar posición
          posicion.lat += pasoLat;
          posicion.lng += pasoLng;
          
          // Actualizar marcador
          emojiMarker.setLatLng([posicion.lat, posicion.lng]);
          
          // Verificar si ha llegado a los extremos para cambiar dirección
          if (direccion === 1) {
            // Calculamos si se pasó del punto final
            const distanciaActualAlFin = Math.sqrt(
              Math.pow(finLat - posicion.lat, 2) + 
              Math.pow(finLng - posicion.lng, 2)
            );
            
            if (distanciaActualAlFin < velocidad) {
              // Si está muy cerca del final, invertir dirección
              direccion = -1;
            }
          } else {
            // Calculamos si se pasó del punto inicial
            const distanciaActualAlInicio = Math.sqrt(
              Math.pow(inicioLat - posicion.lat, 2) + 
              Math.pow(inicioLng - posicion.lng, 2)
            );
            
            if (distanciaActualAlInicio < velocidad) {
              // Si está muy cerca del inicio, invertir dirección
              direccion = 1;
            }
          }
        }
        
        // Crear y guardar el intervalo para la animación
        const interval = setInterval(moverEmoji, 50); // 50ms para movimiento fluido
        window.appMapa.emojiIntervals.push(interval);
      });
    })
    .catch(error => {
      console.error('Error al cargar emojis:', error);
    });
}

// Función para limpiar todos los intervalos y referencias de emojis
function limpiarIntervalosEmojis() {
  if (window.appMapa && window.appMapa.emojiIntervals) {
    window.appMapa.emojiIntervals.forEach(interval => clearInterval(interval));
    window.appMapa.emojiIntervals = [];
  }
  
  if (window.appMapa && window.appMapa.emojiInterval) {
    clearInterval(window.appMapa.emojiInterval);
    window.appMapa.emojiInterval = null;
  }
  
  // Limpiar referencias y quitar marcadores del mapa
  if (window.appMapa && window.appMapa.emojiMarkers) {
    window.appMapa.emojiMarkers.forEach(marker => {
      if (marker && window.appMapa.map) {
        window.appMapa.map.removeLayer(marker);
      }
    });
    window.appMapa.emojiMarkers = [];
  }
  
// ... [Código anterior] ...

console.log("Todos los intervalos y marcadores de emojis han sido limpiados");
}

/**
 * Función para mostrar las relaciones entre emojis
 * @param {number} id - ID del emoji del que se mostrarán las relaciones
 */
function mostrarRelacionesEmoji(id) {
  console.log(`Mostrando relaciones para emoji ID: ${id}`);
  
  // Verificar que el mapa exista
  if (!window.appMapa || !window.appMapa.map) {
    console.error("El mapa no está inicializado");
    return;
  }
  
  // Mostrar un indicador de carga
  mostrarCartelEmoji('⏳', 'Cargando relaciones...');
  
  // Realizar la consulta al servidor para obtener las relaciones
  fetch(`emoji_relaciones.php?id=${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar relaciones: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos de relaciones recibidos:", data);
      
      // Verificar si hay relaciones para mostrar
      if (!data || !data.relaciones || data.relaciones.length === 0) {
        mostrarCartelEmoji('🔍', 'No se encontraron relaciones para este elemento');
        return;
      }
      
      // Limpiar líneas existentes
      if (window.appMapa.relacionesLineas) {
        window.appMapa.relacionesLineas.forEach(linea => {
          window.appMapa.map.removeLayer(linea);
        });
      }
      
      window.appMapa.relacionesLineas = [];
      
      // Obtener la posición del emoji actual
      const emojiActual = buscarEmojiPorId(id);
      
      if (!emojiActual) {
        console.error("No se encontró el emoji origen en el mapa");
        return;
      }
      
      const posOrigen = emojiActual.getLatLng();
      
      // Crear líneas para cada relación
      data.relaciones.forEach(rel => {
        // Buscar emoji relacionado
        const emojiRelacionado = buscarEmojiPorId(rel.id_emoji_relacionado);
        
        if (emojiRelacionado) {
          const posDestino = emojiRelacionado.getLatLng();
          
          // Usar el color específico de la relación o uno predeterminado
          const colorLinea = rel.color || (rel.tipo === 'fuerte' ? '#FF5722' : '#2196F3');
          const grosorLinea = rel.tipo === 'fuerte' ? 3 : 2;
          
          const linea = L.polyline([posOrigen, posDestino], {
            color: colorLinea,
            weight: grosorLinea,
            opacity: 0.7,
            dashArray: '5, 10',
            animate: 45
          }).addTo(window.appMapa.map);
          
          // Agregar etiqueta a la línea si existe
          if (rel.etiqueta) {
            const puntoMedio = L.latLng(
              (posOrigen.lat + posDestino.lat) / 2,
              (posOrigen.lng + posDestino.lng) / 2
            );
            
            const tooltip = L.tooltip({
              permanent: true,
              direction: 'center',
              className: 'relacion-tooltip'
            })
            .setLatLng(puntoMedio)
            .setContent(rel.etiqueta)
            .addTo(window.appMapa.map);
            
            window.appMapa.relacionesLineas.push(tooltip);
          }
          
          window.appMapa.relacionesLineas.push(linea);
        }
      });
      
      // Mostrar mensaje de éxito
      mostrarCartelEmoji('🔗', `Se encontraron ${data.relaciones.length} relaciones`);
      
      // Configurar eliminación automática después de un tiempo
      setTimeout(() => {
        if (window.appMapa.relacionesLineas) {
          window.appMapa.relacionesLineas.forEach(capa => {
            if (window.appMapa.map.hasLayer(capa)) {
              window.appMapa.map.removeLayer(capa);
            }
          });
          window.appMapa.relacionesLineas = [];
        }
      }, 30000); // Eliminar después de 30 segundos
      
    })
    .catch(error => {
      console.error('Error al obtener relaciones:', error);
      mostrarCartelEmoji('❌', 'Error al cargar las relaciones');
    });
}

/**
 * Busca un marcador de emoji en el mapa por su ID
 * @param {number} id - ID del emoji a buscar
 * @returns {L.Marker|null} - El marcador encontrado o null
 */
function buscarEmojiPorId(id) {
  if (!window.appMapa.emojiMarkers) return null;
  
  return window.appMapa.emojiMarkers.find(marker => {
    if (marker._icon && marker._icon.getAttribute('data-id') == id) {
      return true;
    }
    return false;
  });
}

/**
 * Muestra un cartel informativo temporal en la pantalla
 * @param {string} emoji - Emoji a mostrar
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarCartelEmoji(emoji, mensaje) {
  if (!window.appMapa || !window.appMapa.map) return;
  
  const div = document.createElement('div');
  div.className = 'emoji-notification';
  div.innerHTML = `<div class="emoji">${emoji}</div><div class="mensaje">${mensaje}</div>`;
  
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.classList.add('show');
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(div);
      }, 500);
    }, 3000);
  }, 100);
}

// Exportar las funciones para ser usadas por otros scripts
window.agregarEmojisMoviles = agregarEmojisMoviles;
window.limpiarIntervalosEmojis = limpiarIntervalosEmojis;
window.contactarEmoji = contactarEmoji;
window.mostrarRelacionesEmoji = mostrarRelacionesEmoji;
window.buscarEmojiPorId = buscarEmojiPorId;
window.mostrarCartelEmoji = mostrarCartelEmoji;