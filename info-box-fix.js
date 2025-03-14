// Esperamos a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log('Script responsivo cargado correctamente');
  
  // Obtener referencia al info-box
  const infoBox = document.getElementById('info-box');
  
  // Verificar si existe
  if (!infoBox) {
    console.error('No se encontró el elemento con id "info-box"');
    return;
  }
  
  console.log('Info-box encontrado, aplicando estilos responsivos');
  
  // Aplicar estilos directamente desde JavaScript (como respaldo)
  if (window.innerWidth <= 767) {
    infoBox.style.position = 'fixed';
    infoBox.style.top = 'auto';
    infoBox.style.bottom = '15px';
    infoBox.style.left = '50%';
    infoBox.style.transform = 'translateX(-50%)';
    infoBox.style.width = '90%';
    infoBox.style.maxWidth = '350px';
    infoBox.style.margin = '0';
    infoBox.style.zIndex = '2000';
    infoBox.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.2)';
    
    console.log('Estilos responsivos aplicados directamente al info-box');
  }
  
  // Guardar referencia a la función original de cerrarInfoBox
  const originalCerrarInfoBox = window.cerrarInfoBox;
  
  // Reemplazar la función cerrarInfoBox
  window.cerrarInfoBox = function() {
    console.log('Función cerrarInfoBox ejecutada');
    
    if (window.innerWidth <= 767) {
      console.log('Cerrando info-box en modo móvil con animación');
      // Ocultar en móvil
      infoBox.style.display = 'none';
      infoBox.style.opacity = '0';
      infoBox.style.transform = 'translateX(-50%) translateY(100%)';
      infoBox.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    } else if (originalCerrarInfoBox) {
      // En desktop usar la función original si existe
      console.log('Usando función original cerrarInfoBox');
      originalCerrarInfoBox();
    } else {
      // Si no hay función original, simplemente ocultar
      console.log('No hay función original, ocultando info-box');
      infoBox.style.display = 'none';
    }
  };
  
  // Obtener botón de cierre
  const closeBtn = document.getElementById('close-info');
  if (closeBtn) {
    console.log('Botón de cierre encontrado, mejorando para móviles');
    
    // Hacer el botón más grande en móviles
    if (window.innerWidth <= 767) {
      closeBtn.style.width = '30px';
      closeBtn.style.height = '30px';
      closeBtn.style.fontSize = '16px';
    }
  }
  
  // Observar el info-box para detectar cuando se muestra
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'style' && 
          infoBox.style.display === 'block' && 
          window.innerWidth <= 767) {
        
        console.log('Info-box mostrado, aplicando animación y auto-cierre');
        
        // Aplicar efecto de entrada
        infoBox.style.opacity = '1';
        infoBox.style.transform = 'translateX(-50%) translateY(0)';
        
        // Auto-ocultar después de 10 segundos
        setTimeout(function() {
          if (infoBox.style.display === 'block') {
            console.log('Auto-ocultando info-box después de 10s');
            window.cerrarInfoBox();
          }
        }, 10000);
      }
    });
  });
  
  // Configurar observador
  observer.observe(infoBox, { attributes: true });
  
  // Si se hace scroll, cerrar info-box en móvil
  if (window.innerWidth <= 767) {
    document.addEventListener('scroll', function() {
      if (infoBox && infoBox.style.display === 'block') {
        console.log('Scroll detectado, cerrando info-box');
        window.cerrarInfoBox();
      }
    }, { passive: true });
  }
  
  console.log('Configuración responsiva para info-box completada');
});