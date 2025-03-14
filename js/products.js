/**
 * products.js
 * 
 * Descripción:
 * Este archivo maneja toda la lógica relacionada con productos: carga, filtrado y visualización en el mapa.
 * Contiene las definiciones de subcategorías para los filtros y las funciones para actualizar el mapa.
 * 
 * Funcionalidades principales:
 * - Definición de categorías y subcategorías de productos
 * - Carga de productos desde el servidor según filtros
 * - Creación y actualización de marcadores en el mapa
 * - Funciones para contactar al vendedor
 */

// Definición de subcategorías para filtros
const subcategorias = {
  "alimentos": [
    { valor: "frutas_verduras", nombre: "🍎 Frutas y verduras" },
    { valor: "carnes", nombre: "🥩 Carnes" },
    { valor: "lacteos", nombre: "🧀 Lácteos" },
    { valor: "panaderia", nombre: "🍞 Panadería" },
    { valor: "comida_preparada", nombre: "🍲 Comida preparada" },
    { valor: "bebidas", nombre: "🥤 Bebidas" },
    { valor: "saludables", nombre: "🥗 Saludables" },
    { valor: "dieteticos", nombre: "🍏 Dietéticos" },
    { valor: "otros_alimentos", nombre: "🥫 Otros alimentos" }
  ],
  "ropa": [
    { valor: "ropa_hombre", nombre: "👔 Ropa de hombre" },
    { valor: "ropa_mujer", nombre: "👗 Ropa de mujer" },
    { valor: "ropa_infantil", nombre: "👶 Ropa infantil" },
    { valor: "accesorios", nombre: "👜 Accesorios y complementos" }
  ],
  "calzado": [
    { valor: "calzado_hombre", nombre: "👞 Calzado de hombre" },
    { valor: "calzado_mujer", nombre: "👠 Calzado de mujer" },
    { valor: "calzado_infantil", nombre: "👟 Calzado infantil" },
    { valor: "deportivo", nombre: "🏃‍♂️ Calzado deportivo" }
  ],
  "juguetes": [
    { valor: "juguetes_educativos", nombre: "🧩 Juguetes educativos" },
    { valor: "juguetes_electronicos", nombre: "🎮 Juguetes electrónicos" },
    { valor: "juguetes_peluche", nombre: "🧸 Juguetes de peluche" },
    { valor: "juegos_mesa", nombre: "🎲 Juegos de mesa" },
    { valor: "juguetes_bebes", nombre: "👶 Juguetes para bebés" },
    { valor: "videojuegos", nombre: "🕹️ Videojuegos" }
  ],
  "libros": [
    { valor: "ficcion", nombre: "📖 Ficción" },
    { valor: "no_ficcion", nombre: "📚 No ficción" },
    { valor: "infantil", nombre: "📘 Infantil" },
    { valor: "educativos", nombre: "📗 Educativos" },
    { valor: "comics", nombre: "📙 Cómics" },
    { valor: "historicos", nombre: "🏺 Históricos" },
    { valor: "novelas", nombre: "📕 Novelas" },
    { valor: "autoayuda", nombre: "📔 Autoayuda" }
  ],
  "electronica": [
    { valor: "telefonos", nombre: "📱 Teléfonos" },
    { valor: "computadoras", nombre: "💻 Computadoras" },
    { valor: "televisores", nombre: "📺 Televisores" },
    { valor: "audio", nombre: "🎧 Audio" },
    { valor: "accesorios", nombre: "🔌 Accesorios" },
    { valor: "para_impresoras", nombre: "🖨️ Para impresoras" },
    { valor: "para_datos", nombre: "📡 Para datos" },
    { valor: "estabilizadores", nombre: "🔋 Estabilizadores" }
  ],
  "hogar": [
    { valor: "muebles", nombre: "🛋️ Muebles" },
    { valor: "decoracion", nombre: "🖼️ Decoración" },
    { valor: "electrodomesticos", nombre: "🍽️ Electrodomésticos" },
    { valor: "jardin", nombre: "🌳 Jardín" },
    { valor: "cocina", nombre: "🍴 Cocina" },
    { valor: "bano", nombre: "🛁 Baño" },
    { valor: "mascotas", nombre: "🐶 Mascotas" }
  ],
  "servicios": [
    { valor: "reparaciones", nombre: "🔧 Reparaciones" },
    { valor: "limpieza", nombre: "🧹 Limpieza" },
    { valor: "transporte", nombre: "🚚 Transporte" },
    { valor: "asesoria", nombre: "💼 Asesoría" },
    { valor: "enfermeria", nombre: "🩺 Enfermería" },
    { valor: "acompanamiento", nombre: "🤝 Acompañamiento" },
    { valor: "gestoria", nombre: "📂 Gestoría" },
    { valor: "mandados", nombre: "🛵 Mandados" },
    { valor: "docentes", nombre: "👩‍🏫 Docentes" },
    { valor: "gimnasio", nombre: "🏋️ Gimnasio" },
    { valor: "otros_servicios", nombre: "🔧 Otros servicios" }
  ],
  "vehiculos": [
    { valor: "autos", nombre: "🚗 Autos" },
    { valor: "motos", nombre: "🏍️ Motos" },
    { valor: "bicicletas", nombre: "🚲 Bicicletas" },
    { valor: "accesorios", nombre: "🛠️ Accesorios" },
    { valor: "otros_vehiculos", nombre: "🚜 Otros vehículos" }
  ],
  "inmuebles": [
    { valor: "casas", nombre: "🏠 Casas" },
    { valor: "departamentos", nombre: "🏢 Departamentos" },
    { valor: "terrenos", nombre: "🌳 Terrenos" },
    { valor: "oficinas", nombre: "🏢 Oficinas" },
    { valor: "alquileres", nombre: "🔑 Alquileres" },
    { valor: "ventas", nombre: "🏷️ Ventas" },
    { valor: "subastas", nombre: "🔨 Subastas" },
    { valor: "otros_inmuebles", nombre: "🏘️ Otros inmuebles" }
  ],
  "trabajo": [
    { valor: "ofertas_empleo", nombre: "💼 Ofertas de empleo" },
    { valor: "busqueda_empleo", nombre: "🔍 Búsqueda de empleo" },
    { valor: "freelance", nombre: "💻 Freelance" },
    { valor: "practicas", nombre: "📚 Prácticas" },
    { valor: "otros_trabajos", nombre: "🔧 Otros trabajos" }
  ],
  "otros": [
    { valor: "coleccionables", nombre: "🖼️ Coleccionables" },
    { valor: "deportes", nombre: "⚽ Deportes" },
    { valor: "musica", nombre: "🎵 Música" },
    { valor: "arte", nombre: "🎨 Arte" },
    { valor: "otros_productos", nombre: "🔄 Otros productos" }
  ]
};

// Función para cargar productos según filtros seleccionados
function cargarProductos() {
  const categoria = document.getElementById('categoria-filter').value;
  const subcategoria = document.getElementById('subcategoria-filter').value;
  const tipo = document.querySelector('.tipo-btn.active').dataset.tipo;
  const query = document.getElementById('search-query').value;

  document.getElementById('stats').textContent = 'Cargando...';

  let url = 'mapita_productos.php?';
  const params = [];

  if (categoria)     params.push(`categoria=${encodeURIComponent(categoria)}`);
  if (subcategoria)  params.push(`subcategoria=${encodeURIComponent(subcategoria)}`);
  if (tipo)          params.push(`tipo=${encodeURIComponent(tipo)}`);
  if (query)         params.push(`q=${encodeURIComponent(query)}`);

  url += params.join('&');

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        window.appMapa.productosData = data.productos;
        actualizarMapa(data.productos);
        document.getElementById('stats').textContent = 
          `Mostrando ${data.total} resultado${data.total !== 1 ? 's' : ''}`;
      } else {
        console.error('Error al cargar productos:', data.error);
        document.getElementById('stats').textContent = 'Error al cargar los resultados';
        mostrarError(data.error || 'Error al procesar los datos');
      }
    })
    .catch(error => {
      console.error('Error en la solicitud:', error);
      document.getElementById('stats').textContent = 'Error de conexión';
      mostrarError('Error de conexión con el servidor: ' + error.message);
    });
}

// Actualiza los marcadores en el mapa según los productos recibidos
function actualizarMapa(productos) {
  window.appMapa.markersLayer.clearLayers();
  window.appMapa.markers = [];

  if (!productos || productos.length === 0) {
    document.getElementById('stats').textContent = 'No se encontraron resultados';
    return;
  }

  const bounds = L.latLngBounds();

  productos.forEach(producto => {
    if (!producto.lat || !producto.lng) return;

    // Color del fondo: oferta = blanco, demanda = celeste
    const colorFondo = (producto.tipo === 'oferta') ? '#fff' : '#add8e6';

    // DivIcon con tamaño fijo de 30x30, para que sea un círculo
    const markerIcon = L.divIcon({
      html: `
        <div style="
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
          ${producto.emoji || '📦'}
        </div>
      `,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15,15]
    });

    const marker = L.marker([producto.lat, producto.lng], {
      icon: markerIcon,
      title: producto.titulo
    });

    const popupHTML = `
      <div style="text-align:center;">
        <strong style="font-size:16px;">${producto.emoji} ${producto.titulo}</strong>
        <div style="margin:5px 0;font-weight:bold;color:#4CAF50;">${producto.precio_formateado}</div>
        <div style="margin-bottom:5px;color:#666;">${producto.ubicacion}</div>
        <button style="background:#4CAF50;color:white;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;"
                onclick="mostrarDetalleProducto(${producto.id})">
          Ver detalles
        </button>
      </div>
    `;

    marker.bindPopup(popupHTML);
    window.appMapa.markersLayer.addLayer(marker);
    window.appMapa.markers.push(marker);

    bounds.extend([producto.lat, producto.lng]);
  });

  if (window.appMapa.markers.length > 0) {
    window.appMapa.map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15
    });
  }
}

// Función para contactar vendedor
function contactarVendedorJS(idProducto) {
  fetch('contactarVendedor.php?id=' + idProducto)
    .then(response => response.text())
    .then(html => {
      const popupContainer = document.createElement('div');
      popupContainer.id = 'popupContainer';
      popupContainer.style.position = 'fixed';
      popupContainer.style.top = '0';
      popupContainer.style.left = '0';
      popupContainer.style.width = '100%';
      popupContainer.style.height = '100%';
      popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      popupContainer.style.display = 'flex';
      popupContainer.style.justifyContent = 'center';
      popupContainer.style.alignItems = 'center';
      popupContainer.style.zIndex = '9999';

      const contentDiv = document.createElement('div');
      contentDiv.style.background = '#fff';
      contentDiv.style.padding = '20px';
      contentDiv.style.borderRadius = '5px';
      contentDiv.innerHTML = html;

      popupContainer.appendChild(contentDiv);
      document.body.appendChild(popupContainer);
    })
    .catch(error => {
      console.error('Error al contactar al vendedor:', error);
    });
}

// Cierra el popup de contacto
function cerrarPopup() {
  const popup = document.getElementById('popupContainer');
  if (popup) popup.remove();
}