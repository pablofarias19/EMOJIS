document.addEventListener('DOMContentLoaded', function() {
  // Crear botones desplegables para búsqueda y filtros
  const searchContainer = document.querySelector('.search-container');
  const searchRow = document.querySelector('.search-row');
  const filtersContainer = document.querySelector('.filters-container');
  
  // Crear botón desplegable para la búsqueda
  const searchToggle = document.createElement('button');
  searchToggle.className = 'search-toggle';
  searchToggle.textContent = 'Buscar productos';
  searchToggle.setAttribute('aria-expanded', 'false');
  searchToggle.setAttribute('aria-controls', 'search-content');
  
  // Crear botón desplegable para los filtros
  const filtersToggle = document.createElement('button');
  filtersToggle.className = 'filters-toggle';
  filtersToggle.textContent = 'Mostrar filtros';
  filtersToggle.setAttribute('aria-expanded', 'false');
  filtersToggle.setAttribute('aria-controls', 'filters-container');
  
  // Crear div contenedor para el área de búsqueda
  const searchContent = document.createElement('div');
  searchContent.className = 'search-content';
  searchContent.id = 'search-content';
  
  // Solo aplicar en versión móvil
  function setupMobileLayout() {
    if (window.innerWidth <= 767) {
      // Si no se ha configurado aún
      if (!document.querySelector('.search-toggle')) {
        // Insertar los elementos en el DOM
        searchContainer.insertBefore(searchToggle, searchRow);
        searchContainer.insertBefore(filtersToggle, filtersContainer);
        
        // Mover elementos al contenedor desplegable
        searchContent.appendChild(searchRow);
        searchContainer.insertBefore(searchContent, filtersToggle);
        
        // Añadir event listeners
        searchToggle.addEventListener('click', function() {
          const isExpanded = searchToggle.getAttribute('aria-expanded') === 'true';
          searchToggle.setAttribute('aria-expanded', !isExpanded);
          searchToggle.classList.toggle('active');
          searchContent.classList.toggle('show');
        });
        
        filtersToggle.addEventListener('click', function() {
          const isExpanded = filtersToggle.getAttribute('aria-expanded') === 'true';
          filtersToggle.setAttribute('aria-expanded', !isExpanded);
          filtersToggle.classList.toggle('active');
          filtersContainer.classList.toggle('show');
        });
      }
    } else {
      // En desktop, restaurar la estructura original
      if (document.querySelector('.search-toggle')) {
        // Restaurar searchRow a su posición original
        searchContainer.insertBefore(searchRow, searchContent);
        
        // Eliminar elementos temporales
        if (searchToggle.parentNode) searchToggle.parentNode.removeChild(searchToggle);
        if (filtersToggle.parentNode) filtersToggle.parentNode.removeChild(filtersToggle);
        if (searchContent.parentNode) searchContent.parentNode.removeChild(searchContent);
        
        // Restaurar visibilidad
        filtersContainer.classList.remove('show');
        searchRow.style.display = 'flex';
        filtersContainer.style.display = 'flex';
      }
    }
  }
  
  // Configurar inicialmente
  setupMobileLayout();
  
  // Reconfigura al cambiar el tamaño de la ventana
  window.addEventListener('resize', setupMobileLayout);
});