/**
 * Módulo para gestionar categorías y subcategorías
 * Fecha de creación: 2025-03-13 15:38:02
 * Autor: pablofarias19
 */
const CategoriasModule = (function() {
    // Diccionario de subcategorías con emojis
    const subcategorias = {
        "alimentos": [
            {valor: "frutas_verduras", nombre: "🍎 Frutas y verduras"},
            {valor: "carnes", nombre: "🥩 Carnes"},
            {valor: "lacteos", nombre: "🧀 Lácteos"},
            {valor: "panaderia", nombre: "🍞 Panadería"},
            {valor: "comida_preparada", nombre: "🍲 Comida preparada"},
            {valor: "bebidas", nombre: "🥤 Bebidas"},
            {valor: "otros_alimentos", nombre: "🥫 Otros alimentos"}
        ],
        "ropa": [
            {valor: "ropa_hombre", nombre: "👔 Ropa de hombre"},
            {valor: "ropa_mujer", nombre: "👗 Ropa de mujer"},
            {valor: "ropa_infantil", nombre: "👶 Ropa infantil"},
            {valor: "accesorios", nombre: "👜 Accesorios y complementos"}
        ],
        "calzado": [
            {valor: "zapatos_hombre", nombre: "👞 Zapatos de hombre"},
            {valor: "zapatos_mujer", nombre: "👠 Zapatos de mujer"},
            {valor: "zapatos_infantil", nombre: "👟 Calzado infantil"},
            {valor: "calzado_deportivo", nombre: "🏃 Calzado deportivo"}
        ],
        "juguetes": [
            {valor: "juguetes_bebes", nombre: "👶 Juguetes para bebés"},
            {valor: "juguetes_ninos", nombre: "🧒 Juguetes para niños"},
            {valor: "juegos_mesa", nombre: "🎲 Juegos de mesa"},
            {valor: "juguetes_educativos", nombre: "🎓 Juguetes educativos"}
        ],
        "libros": [
            {valor: "libros_ficcion", nombre: "📕 Ficción"},
            {valor: "libros_infantiles", nombre: "📚 Literatura infantil"},
            {valor: "libros_educativos", nombre: "📘 Educativos"},
            {valor: "comics_manga", nombre: "📔 Cómics y manga"},
            {valor: "libros_historia", nombre: "📜 Historia"},
            {valor: "libros_ciencia", nombre: "🔬 Ciencia"},
            {valor: "libros_arte", nombre: "🎨 Arte"}
        ],
        "electronica": [
            {valor: "smartphones", nombre: "📱 Smartphones"},
            {valor: "tablets_ordenadores", nombre: "💻 Tablets y ordenadores"},
            {valor: "audio_video", nombre: "🎧 Audio y vídeo"},
            {valor: "electrodomesticos", nombre: "🔌 Electrodomésticos"},
            {valor: "fotografia", nombre: "📷 Fotografía"},
            {valor: "gaming", nombre: "🎮 Gaming"}
        ],
        "hogar": [
            {valor: "muebles", nombre: "🛋️ Muebles"},
            {valor: "decoracion", nombre: "🏺 Decoración"},
            {valor: "jardineria", nombre: "🌱 Jardinería"},
            {valor: "utensilios_cocina", nombre: "🍳 Utensilios de cocina"},
            {valor: "iluminacion", nombre: "💡 Iluminación"},
            {valor: "textiles", nombre: "🛏️ Textiles"}
        ],
        "servicios": [
            {valor: "reparaciones", nombre: "🔧 Reparaciones"},
            {valor: "limpieza", nombre: "🧹 Limpieza"},
            {valor: "clases_particulares", nombre: "📝 Clases particulares"},
            {valor: "servicios_profesionales", nombre: "💼 Servicios profesionales"},
            {valor: "jardinero", nombre: "🌿 Jardinero"},
            {valor: "carpintero", nombre: "🔨 Carpintero"},
            {valor: "albanil", nombre: "🧱 Albañil"},
            {valor: "plomero", nombre: "🚰 Plomero"},
            {valor: "pintor_casas", nombre: "🎨 Pintor de casas"},
            {valor: "cuidador_casas", nombre: "🏠 Cuidador de casas"},
            {valor: "otros_servicios", nombre: "🔧 Otros servicios"}
        ],
        "vehiculos": [
            {valor: "coches", nombre: "🚗 Coches"},
            {valor: "motos", nombre: "🏍️ Motos"},
            {valor: "bicicletas", nombre: "🚲 Bicicletas"},
            {valor: "accesorios_vehiculos", nombre: "🔌 Accesorios para vehículos"},
            {valor: "camiones", nombre: "🚛 Camiones"},
            {valor: "barcos", nombre: "⛵ Barcos"}
        ],
        "inmuebles": [
            {valor: "venta_casas", nombre: "🏠 Venta de casas"},
            {valor: "venta_departamentos", nombre: "🏢 Venta de departamentos"},
            {valor: "alquiler_casas", nombre: "🏡 Alquiler de casas"},
            {valor: "alquiler_departamentos", nombre: "🏬 Alquiler de departamentos"},
            {valor: "oficinas", nombre: "🏢 Oficinas"},
            {valor: "locales_comerciales", nombre: "🏪 Locales comerciales"}
        ],
        "trabajo": [
            {valor: "ofertas_empleo", nombre: "💼 Ofertas de empleo"},
            {valor: "busqueda_empleo", nombre: "🔍 Búsqueda de empleo"},
            {valor: "servicios_freelance", nombre: "👨‍💻 Servicios freelance"},
            {valor: "trabajo_temporal", nombre: "⏱️ Trabajo temporal"},
            {valor: "practicas", nombre: "📚 Prácticas"},
            {valor: "voluntariado", nombre: "🤝 Voluntariado"}
        ],
        "otros": [
            {valor: "articulos_coleccion", nombre: "🏆 Artículos de colección"},
            {valor: "mascotas", nombre: "🐶 Mascotas"},
            {valor: "deportes", nombre: "⚽ Deportes"},
            {valor: "instrumentos_musicales", nombre: "🎸 Instrumentos musicales"},
            {valor: "juegos_juguetes", nombre: "🧸 Juegos y juguetes"},
            {valor: "otros_general", nombre: "📦 Otros"}
        ]
    };
    
    /**
     * Inicializa el módulo de categorías
     */
    function init() {
        // Añadir listener para actualizar subcategorías cuando cambia la categoría
        document.getElementById('categoria').addEventListener('change', actualizarSubcategorias);
        
        // Añadir listener para subcategoría
        document.getElementById('subcategoria').addEventListener('change', function() {
            if (this.selectedIndex > -1) {
                const selectedOption = this.options[this.selectedIndex];
                const subEmoji = selectedOption.getAttribute('data-emoji');
                if (subEmoji) {
                    document.getElementById('emoji-preview').textContent = subEmoji;
                    document.getElementById('emoji').value = subEmoji;
                }
            }
        });
    }
    
    /**
     * Actualiza las subcategorías según la categoría seleccionada
     */
    function actualizarSubcategorias() {
        const categoriaSelect = document.getElementById('categoria');
        const subcategoriaSelect = document.getElementById('subcategoria');
        const emoji = categoriaSelect.options[categoriaSelect.selectedIndex]
                                         .getAttribute('data-emoji') || '';
        const categoria = categoriaSelect.value;
        
        // Limpiar subcategorías anteriores
        subcategoriaSelect.innerHTML = '';
        
        // Mostrar el emoji en el preview
        document.getElementById('emoji-preview').textContent = emoji;
        document.getElementById('emoji').value = emoji;
        
        // Si no hay categoría seleccionada, restablecemos la opción por defecto
        if (!categoria) {
            subcategoriaSelect.innerHTML = 
                '<option value="">Primero seleccione una categoría</option>';
            return;
        }
        
        // Rellenar las subcategorías
        if (subcategorias[categoria]) {
            subcategorias[categoria].forEach(function(subcat) {
                const option = document.createElement('option');
                option.value = subcat.valor;
                option.textContent = subcat.nombre;
                
                // Extraer el emoji de la subcategoría y agregarlo como atributo
                const subEmoji = subcat.nombre.split(' ')[0]; // Obtiene el emoji del nombre
                option.setAttribute('data-emoji', subEmoji);
                
                subcategoriaSelect.appendChild(option);
            });
        }
    }
    
    // API pública
    return {
        init,
        actualizarSubcategorias
    };
})();