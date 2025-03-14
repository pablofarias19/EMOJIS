/**
 * ui-events.js
 * 
 * Descripción:
 * Este archivo maneja todos los eventos de la interfaz de usuario,
 * como cambios en filtros, clicks en botones y búsquedas.
 * 
 * Funcionalidades principales:
 * - Gestión de eventos para filtros de categoría/subcategoría
 * - Manejo de interacciones con botones de tipo (oferta/demanda)
 * - Control de la búsqueda por texto
 * - Muestra de mensajes de error
 */

document.addEventListener('DOMContentLoaded', function() {
  // Manejar cambio en categoría
  document.getElementById('categoria-filter').addEventListener('change', function() {
    const categoria = this.value;
    const subcategoriaSelect = document.getElementById('subcategoria-filter');

    // Actualizar opciones de subcategorías
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
      // Actualizar estado de botones
      document.querySelectorAll('.tipo-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-checked', 'true');
      cargarProductos();
    });

    // Accesibilidad: permitir activación con teclado
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

  // Cargar productos al iniciar
  cargarProductos();
});

// Función para mostrar mensajes de error temporales
function mostrarError(mensaje) {
  const errorContainer = document.getElementById('error-container');
  errorContainer.innerHTML = `<div class="error-message" role="alert">${mensaje}</div>`;
  setTimeout(() => { errorContainer.innerHTML = ''; }, 5000);
}