document.addEventListener('DOMContentLoaded', function() {
  // Obtener referencias a los elementos
  const brandBtn = document.getElementById('brand-btn');
  const promoBanner = document.querySelector('.promo-banner');
  
  // Ocultar el banner de promociones al inicio en móviles
  if (window.innerWidth <= 767) {
    promoBanner.classList.add('hidden');
  }
  
  // Configurar el botón para mostrar/ocultar el banner
  brandBtn.addEventListener('click', function() {
    promoBanner.classList.toggle('hidden');
    
    // Actualizar el estado de accesibilidad
    const isExpanded = promoBanner.classList.contains('hidden') ? 'false' : 'true';
    brandBtn.setAttribute('aria-expanded', isExpanded);
    
    // Cambiar el icono del botón si hay alguno (opcional)
    if (brandBtn.querySelector('.toggle-icon')) {
      const toggleIcon = brandBtn.querySelector('.toggle-icon');
      toggleIcon.textContent = promoBanner.classList.contains('hidden') ? '▼' : '▲';
    }
  });
  
  // Añadir un icono de despliegue al botón
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'toggle-icon';
  toggleIcon.textContent = '▼';
  toggleIcon.style.marginLeft = '10px';
  toggleIcon.style.fontSize = '12px';
  brandBtn.appendChild(toggleIcon);
  
  // Inicializar el atributo aria-expanded
  brandBtn.setAttribute('aria-expanded', 'false');
  brandBtn.setAttribute('aria-controls', 'promo-banner');
  
  // Asignar ID para accesibilidad
  promoBanner.id = 'promo-banner';
  
  // Ajustar los estilos para posicionar el banner como desplegable
  const accessibilityBar = document.querySelector('.accessibility-bar');
  accessibilityBar.style.flexDirection = 'column';
  accessibilityBar.style.position = 'relative';
});