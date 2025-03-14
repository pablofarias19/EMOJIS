// Función para calcular la distancia entre dos puntos geográficos usando la fórmula de Haversine
function calcularDistancia(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const rad = Math.PI / 180;
  const φ1 = lat1 * rad;
  const φ2 = lat2 * rad;
  const Δφ = (lat2 - lat1) * rad;
  const Δλ = (lng2 - lng1) * rad;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

// Función para ordenar los iconos por cercanía a un punto de referencia y filtrar por categoría
function ordenarIconosPorCercaniaYCategoria(iconos, referenciaLat, referenciaLng, categoria) {
  // Filtrar iconos por categoría
  const iconosFiltrados = iconos.filter(icono => icono.categoria === categoria);

  // Ordenar iconos filtrados por distancia al punto de referencia
  return iconosFiltrados.sort((a, b) => {
    const distanciaA = calcularDistancia(referenciaLat, referenciaLng, a.lat_inicial, a.lng_inicial);
    const distanciaB = calcularDistancia(referenciaLat, referenciaLng, b.lat_inicial, b.lng_inicial);
    return distanciaA - distanciaB;
  });
}

// Función para obtener datos de las tablas productos e iconos_mapa
function obtenerDatos() {
  return fetch('/path-to-your-api-endpoint') // Ajusta esta URL para que apunte a tu API
    .then(response => response.json())
    .then(data => {
      console.log('Datos recibidos:', data);
      const productos = data.productos;
      const iconosMapa = data.iconosMapa;
      return { productos, iconosMapa };
    })
    .catch(error => console.error('Error al obtener datos:', error));
}

// Función para integrar y procesar los datos
function procesarDatos(referenciaLat, referenciaLng, categoria) {
  obtenerDatos().then(({ productos, iconosMapa }) => {
    console.log('Productos:', productos);
    console.log('Iconos Mapa:', iconosMapa);

    // Aquí puedes implementar la lógica de integración que necesites
    const iconosOrdenados = ordenarIconosPorCercaniaYCategoria(productos, referenciaLat, referenciaLng, categoria);
    console.log('Iconos Ordenados:', iconosOrdenados);

    // Aquí puedes mostrar los datos en la interfaz de usuario
  });
}