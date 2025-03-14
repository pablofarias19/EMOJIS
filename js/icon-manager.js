/**
 * icon-manager.js
 * 
 * Control de tamaño de iconos según el nivel de zoom del mapa,
 * especialmente para el zoom out.
 */

// Función para crear icono de producto con escala controlada
function crearIconoProducto(emoji, tipo) {
  const colorFondo = (tipo === 'oferta') ? '#fff' : '#add8e6';
  
  return L.divIcon({
    html: `
      <div class="icono-escalable icono-producto" style="
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 25px;
        background-color: ${colorFondo};
        border-radius: 50%;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        box-shadow: 0 0 0 2px white;
      ">
        ${emoji || '📦'}
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

// Función para crear icono de emoji animado con escala controlada
function crearIconoEmoji(emoji) {
  return L.divIcon({
    html: `<div class="icono-escalable emoji-animado" style="font-size: 30px;">${emoji}</div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

// Función para actualizar la clase del contenedor del mapa según el zoom
function actualizarEscalaSegunZoom(mapa) {
  // Obtener el contenedor del mapa
  const contenedor = mapa.getContainer();
  
  // Eliminar clases previas de zoom
  const clasesPrevias = Array.from(contenedor.classList)
    .filter(clase => clase.startsWith('zoom-level-'));
  
  clasesPrevias.forEach(clase => {
    contenedor.classList.remove(clase);
  });
  
  // Añadir clase con nivel actual de zoom
  const nivelZoom = mapa.getZoom();
  contenedor.classList.add(`zoom-level-${nivelZoom}`);
  
  // Opcional: Mostrar información de depuración
  mostrarInfoZoom(nivelZoom);
}

// Función para mostrar información de zoom (opcional, para depuración)
function mostrarInfoZoom(nivelZoom) {
  let infoZoom = document.getElementById('info-zoom');
  
  if (!infoZoom) {
    infoZoom = document.createElement('div');
    infoZoom.id = 'info-zoom';
    infoZoom.style.position = 'fixed';
    infoZoom.style.bottom = '10px';
    infoZoom.style.right = '10px';
    infoZoom.style.background = 'rgba(0,0,0,0.7)';
    infoZoom.style.color = 'white';
    infoZoom.style.padding = '5px 10px';
    infoZoom.style.borderRadius = '4px';
    infoZoom.style.zIndex = '1000';
    infoZoom.style.fontSize = '12px';
    document.body.appendChild(infoZoom);
  }
  
  // Factor de escala basado en el nivel de zoom
  let escala = 1;
  if (nivelZoom <= 12) escala = 0.9;
  if (nivelZoom <= 11) escala = 0.8;
  if (nivelZoom <= 10) escala = 0.7;
  if (nivelZoom <= 9) escala = 0.6;
  if (nivelZoom <= 8) escala = 0.5;
  if (nivelZoom <= 7) escala = 0.4;
  if (nivelZoom <= 4) escala = 0.3;
  if (nivelZoom <= 2) escala = 0.2;
  
  infoZoom.textContent = `Zoom: ${nivelZoom} | Escala: ${escala*100}%`;
}

// Inicializar el control de escala de iconos
function inicializarControlIconos(mapa) {
  // Aplicar al inicio
  setTimeout(() => actualizarEscalaSegunZoom(mapa), 500);
  
  // Aplicar cada vez que cambia el zoom
  mapa.on('zoomend', function() {
    actualizarEscalaSegunZoom(mapa);
  });
}