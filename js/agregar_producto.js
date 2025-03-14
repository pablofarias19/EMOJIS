/**
 * Archivo principal de inicialización para el formulario Agregar Producto
 * Fecha de creación: 2025-03-13 16:22:05
 * Última modificación: 2025-03-13 17:48:12
 * Autor: pablofarias19
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar geolocalización
    GeoModule.init();
    
    // Inicializar categorías
    CategoriasModule.init();
    
    // Inicializar gestión de formulario
    FormModule.init();
    
    // Inicializar modal
    ModalModule.init();
    
    // Configurar evento para cerrar el modal al hacer clic fuera
    window.onclick = function(event) {
        const modal = document.getElementById('productoModal');
        if (event.target == modal) {
            ModalModule.cerrarModal();
        }
    };
    
    // Añadir botón de previsualización
    const formElement = document.getElementById('anuncioForm');
    const submitButton = document.getElementById('submitBtn');
    
    // Crear botón de previsualización
    const previewButton = document.createElement('button');
    previewButton.type = 'button';
    previewButton.textContent = 'Previsualizar anuncio';
    previewButton.className = 'preview-btn';
    previewButton.style.marginBottom = '10px';
    previewButton.style.backgroundColor = '#007bff';
    
    // Insertar antes del botón de envío
    submitButton.parentNode.insertBefore(previewButton, submitButton);
    submitButton.parentNode.insertBefore(document.createElement('br'), submitButton);
    
    // Evento para previsualizar
    previewButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(formElement);
        
        // Obtener nombres para categoría y subcategoría
        const categoriaSelect = document.getElementById('categoria');
        const subcategoriaSelect = document.getElementById('subcategoria');
        
        const categoriaNombre = categoriaSelect.options[categoriaSelect.selectedIndex]?.text || '';
        const subcategoriaNombre = subcategoriaSelect.options[subcategoriaSelect.selectedIndex]?.text || '';
        
        const productoPreview = {
            titulo: formData.get('titulo'),
            precio: formData.get('precio'),
            descripcion_breve: formData.get('descripcion_breve'),
            descripcion_detallada: formData.get('descripcion_detallada'),
            ubicacion: formData.get('ubicacion') || 'Ubicación no especificada',
            emoji: formData.get('emoji'),
            categoria: formData.get('categoria'),
            subcategoria: formData.get('subcategoria'),
            categoria_nombre: categoriaNombre,
            subcategoria_nombre: subcategoriaNombre,
            tipo_anuncio: formData.get('tipo_anuncio'),
            
            // Datos del vendedor
            nombre_vendedor: formData.get('nombre') || 'Usuario actual', 
            telefono: formData.get('telefono'),
            celular: formData.get('celular'),
            email: formData.get('email'),
            id_vendedor: 'USER_ID' // Se podría obtener del sistema
        };
        
        // Mostrar vista previa
        ModalModule.mostrarProducto(productoPreview);
    });
    
    /**
     * Función para manejar el envío exitoso del formulario
     * @param {Object} respuesta - Respuesta JSON del servidor
     */
    function manejarEnvioExitoso(respuesta) {
        // Guardar datos en localStorage para la página de éxito
        if (respuesta.success) {
            // Guardar en localStorage para que la página de éxito pueda recuperarlos
            localStorage.setItem('productoExitoso', JSON.stringify({
                emoji: respuesta.emoji,
                titulo: respuesta.titulo,
                tipo_anuncio: respuesta.tipo_anuncio,
                id: respuesta.id
            }));
            
            // Redirigir a la página de éxito
            window.location.href = "exito_producto.html";
        } else {
            // Mostrar mensaje de error
            alert("Error: " + (respuesta.error || "No se pudo guardar el producto."));
            // Rehabilitar botón de envío
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar anuncio';
        }
    }
    
    // Validación adicional antes del envío del formulario
    formElement.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevenir envío tradicional del formulario
        
        // Validar teléfono o celular o email
        const telefono = document.getElementById('telefono').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const email = document.getElementById('email').value.trim();
        
        if (!telefono && !celular && !email) {
            alert('Debe proporcionar al menos un medio de contacto: teléfono, celular o email.');
            return false;
        }
        
        // Validar ubicación
        const latitud = document.getElementById('latitud').value;
        const longitud = document.getElementById('longitud').value;
        
        if (!latitud || !longitud) {
            alert('Debe proporcionar una ubicación para su anuncio.');
            return false;
        }
        
        // Mostrar mensaje de carga
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        // Crear FormData para enviar con Fetch API
        const formData = new FormData(formElement);
        
        // Enviar usando Fetch API
        fetch('guardar_producto.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Respuesta del servidor:", data);
            // Usar la función para manejar la respuesta exitosa
            manejarEnvioExitoso(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al procesar la solicitud.');
            // Rehabilitar botón de envío
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar anuncio';
        });
    });
});