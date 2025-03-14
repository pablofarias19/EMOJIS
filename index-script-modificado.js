// Script para mejorar el info-box en dispositivos móviles
document.addEventListener('DOMContentLoaded', function() {
  // Verificar si ya existe una función original
  const originalCargarInfoMapa = window.cargarInfoMapa;
  
  // Sobreescribir la función cargarInfoMapa
  window.cargarInfoMapa = function() {
    fetch('info_mapa.php')
      .then(response => response.json())
      .then(data => {
        document.getElementById('info-title').textContent = data.titulo;
        document.getElementById('info-description').textContent = data.descripcion;
        document.getElementById('info-details').textContent = data.detalles;
        
        const infoBox = document.getElementById('info-box');
        infoBox.style.display = 'block';
        
        // Añadir clase para animación en dispositivos móviles
        if (window.innerWidth <= 767) {
          infoBox.classList.add('showing');
          
          // Auto-ocultar después de 10 segundos en móvil
          setTimeout(function() {
            if (infoBox.style.display === 'block') {
              cerrarInfoBox();
            }
          }, 10000);
        }
      })
      .catch(error => {
        console.error('Error al cargar información:', error);
      });
  };

  // Reemplazar la función cerrarInfoBox
  window.cerrarInfoBox = function() {
    const infoBox = document.getElementById('info-box');
    
    if (window.innerWidth <= 767) {
      // En móviles, agregar animación de salida
      infoBox.classList.remove('showing');
      infoBox.classList.add('hiding');
      
      // Esperar a que termine la animación antes de ocultar
      setTimeout(function() {
        infoBox.style.display = 'none';
        infoBox.classList.remove('hiding');
      }, 300);
    } else {
      // En escritorio, ocultar inmediatamente
      infoBox.style.display = 'none';
    }
  };
  
  // Si se hace scroll, cerrar el info-box en móvil
  if (window.innerWidth <= 767) {
    document.addEventListener('scroll', function() {
      const infoBox = document.getElementById('info-box');
      if (infoBox && infoBox.style.display === 'block') {
        cerrarInfoBox();
      }
    }, { passive: true });
  }
  
  // Mejorar la experiencia táctil para el botón de cierre
  const closeInfoBtn = document.getElementById('close-info');
  if (closeInfoBtn) {
    // Hacer el botón de cierre más grande en móviles
    if (window.innerWidth <= 767) {
      closeInfoBtn.style.width = '30px';
      closeInfoBtn.style.height = '30px';
      closeInfoBtn.style.fontSize = '16px';
    }
    
    // Añadir evento táctil explícito para dispositivos móviles
    closeInfoBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      cerrarInfoBox();
    });
  }
});