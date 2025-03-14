/**
 * modals.js
 * 
 * Descripción:
 * Este archivo se encarga de la gestión de modales y diálogos,
 * especialmente para mostrar detalles de productos y opciones de compartir.
 * 
 * Funcionalidades principales:
 * - Mostrar detalles de productos en modal
 * - Gestionar imágenes y miniaturas
 * - Funcionalidad para compartir productos
 * - Cerrar modal y gestionar su estado
 */

// Muestra el detalle de un producto en el modal
function mostrarDetalleProducto(id) {
  const producto = window.appMapa.productosData.find(p => p.id === id);
  if (!producto) {
    document.getElementById('modal-loading').style.display = 'none';
    document.getElementById('product-detail').style.display = 'none';
    document.getElementById('modal-error').style.display = 'block';
    document.getElementById('modal-error').textContent = 'No se encontró información del producto';
    document.getElementById('product-modal').style.display = 'block';
    return;
  }

  // Actualizar datos básicos
  document.getElementById('modal-product-title').textContent = producto.titulo;
  document.getElementById('product-emoji').textContent = producto.emoji || '📦';
  document.getElementById('product-title').textContent = producto.titulo.replace(producto.emoji, '').trim();
  document.getElementById('product-price').textContent = producto.precio_formateado;
  document.getElementById('product-location').textContent = `📍 ${producto.ubicacion}`;
  document.getElementById('product-short-desc').textContent = producto.descripcion_breve;
  document.getElementById('product-long-desc').textContent = producto.descripcion_detallada || 'Sin detalles adicionales';

  // Configurar insignia según tipo
  const tipoBadge = document.getElementById('product-tipo');
  tipoBadge.textContent = producto.tipo === 'oferta' ? '📢 OFERTA' : '🔍 DEMANDA';
  tipoBadge.className = 'product-badge badge-' + producto.tipo;

  document.getElementById('product-categoria').textContent = `${producto.categoria} > ${producto.subcategoria}`;

  // Gestionar imágenes
  const mainImage = document.getElementById('main-image');
  const noImages = document.getElementById('no-images');
  const thumbnailContainer = document.getElementById('thumbnail-container');
  thumbnailContainer.innerHTML = '';

  if (producto.imagen && producto.imagen !== 'sin_imagen.jpg') {
    mainImage.src = `imagenes/productos/${producto.imagen}`;
    mainImage.alt = producto.titulo;
    mainImage.style.display = 'block';
    noImages.style.display = 'none';

    // Generar miniaturas de ejemplo
    for (let i = 0; i < 3; i++) {
      const thumb = document.createElement('img');
      thumb.src = `imagenes/productos/${producto.imagen}`;
      thumb.alt = `Vista ${i+1}`;
      thumb.className = i === 0 ? 'thumbnail active' : 'thumbnail';
      thumb.onclick = function() {
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        mainImage.src = this.src;
      };
      thumbnailContainer.appendChild(thumb);
    }
  } else {
    // Sin imágenes, mostrar placeholder
    mainImage.style.display = 'none';
    noImages.style.display = 'flex';
    noImages.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:72px;">${producto.emoji || '📦'}</div>
        <div>Sin imágenes disponibles</div>
      </div>
    `;
  }

  // Actualizar estado del modal
  document.getElementById('modal-loading').style.display = 'none';
  document.getElementById('modal-error').style.display = 'none';
  document.getElementById('product-detail').style.display = 'grid';

  // Configurar botón de contacto
  const contactBtn = document.getElementById('contact-seller-btn');
  if (contactBtn) {
    contactBtn.onclick = function() {
      contactarVendedorJS(id);
    };
  }

  // Guardar ID para referencia futura (compartir)
  document.getElementById('product-modal').dataset.productoId = id;

  // Mostrar el modal
  document.getElementById('product-modal').style.display = 'block';
}

// Cierra el modal de producto
function cerrarModal() {
  document.getElementById('product-modal').style.display = 'none';
  document.getElementById('modal-loading').style.display = 'block';
  document.getElementById('product-detail').style.display = 'none';
}

// Función para compartir producto con opciones
function compartirProducto() {
  const productoId = document.getElementById('product-modal').dataset.productoId;
  if (!productoId) {
    console.error('No se pudo encontrar el ID del producto para compartir');
    return;
  }
  const producto = window.appMapa.productosData.find(p => p.id === parseInt(productoId));
  if (!producto) {
    console.error('No se encontró información del producto');
    return;
  }

  // Preparar datos para compartir
  const shareUrl   = `${window.location.origin}${window.location.pathname}?id=${productoId}`;
  const shareTitle = `${producto.emoji} ${producto.titulo}`;
  const shareText  = `${producto.emoji} ${producto.titulo} - ${producto.precio_formateado} - ${producto.ubicacion}`;

  // Usar Web Share API si está disponible
  if (navigator.share) {
    navigator.share({
      title: shareTitle,
      text: shareText,
      url: shareUrl,
    })
    .then(() => console.log('Compartido exitosamente'))
    .catch(error => {
      console.error('Error al compartir:', error);
      mostrarOpcionesCompartir(shareUrl, shareTitle, shareText);
    });
  } else {
    // Fallback para navegadores sin Web Share API
    mostrarOpcionesCompartir(shareUrl, shareTitle, shareText);
  }
}

// Método alternativo de compartir cuando Web Share API no está disponible
function mostrarOpcionesCompartir(url, title, text) {
  alert(
    'Copia y comparte este enlace:\n\n' +
    url + '\n\n' +
    'Título: ' + title + '\n' +
    'Detalles: ' + text
  );
}