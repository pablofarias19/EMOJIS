<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publicar Anuncio</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        .form-row .form-group {
            flex: 1;
            margin-bottom: 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, select, textarea {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        }
        button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        #ubicacionStatus {
            margin: 10px 0;
            color: #666;
        }
        .error {
            color: red;
        }
        .emoji-preview {
            font-size: 1.5em;
            margin-left: 5px;
        }
        .tipo-anuncio {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
        }
        .tipo-anuncio button {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            background: #f9f9f9;
            cursor: pointer;
        }
        .tipo-anuncio button.active {
            background-color: #e6f7ff;
            border-color: #1890ff;
            font-weight: bold;
        }
        .tipo-anuncio button:focus {
            outline: none;
        }
        textarea {
            resize: vertical;
            min-height: 60px;
        }
    </style>
</head>
<body>
    <!-- Modal/Pop-up para mostrar detalles del producto -->
    <div id="productoModal" class="modal" style="display:none; position:fixed; z-index:100; left:0; top:0; width:100%; height:100%; overflow:auto; background-color:rgba(0,0,0,0.4);">
        <div class="modal-content" style="background-color:#fefefe; margin:15% auto; padding:20px; border:1px solid #888; width:80%; max-width:600px; border-radius:8px;">
            <span class="close" onclick="cerrarModal()" style="color:#aaa; float:right; font-size:28px; font-weight:bold; cursor:pointer;">&times;</span>
            <h2 id="modal-titulo"></h2>
            <p id="modal-precio"></p>
            <p id="modal-descripcion"></p>
            <p id="modal-ubicacion"></p>
            <div id="modal-imagenes"></div>
            <hr>
            <div style="text-align:center;">
                <button onclick="contactarVendedor()" style="background-color:#4CAF50; color:white; padding:10px 20px; border:none; border-radius:4px; cursor:pointer; font-size:16px;">
                    Contactar al vendedor
                </button>
            </div>
        </div>
    </div>

    <!-- Ajustamos el "action" para que coincida con tu script de guardado, por ejemplo "guardar_producto.php" -->
    <form id="anuncioForm" method="post" action="guardar_producto.php" enctype="multipart/form-data">
        
        <!-- Tipo de anuncio: Oferta o Demanda -->
        <div class="form-group">
            <label>Tipo de anuncio:</label>
            <div class="tipo-anuncio">
                <button type="button" id="btn-oferta" class="active" onclick="seleccionarTipo('oferta')">
                    📢 OFERTA
                </button>
                <button type="button" id="btn-demanda" onclick="seleccionarTipo('demanda')">
                    🔍 DEMANDA
                </button>
            </div>
            <!-- Campo oculto donde guardamos la opción seleccionada (oferta/demanda) -->
            <input type="hidden" id="tipo_anuncio" name="tipo_anuncio" value="oferta">
        </div>
        
        <!-- Categoría y subcategoría -->
        <div class="form-row">
            <div class="form-group">
                <label for="categoria">Categoría:</label>
                <select id="categoria" name="categoria" required onchange="actualizarSubcategorias()">
                    <option value="">Seleccione una categoría</option>
                    <option value="alimentos" data-emoji="🍎">🍎 Alimentos</option>
                    <option value="ropa" data-emoji="👕">👕 Ropa</option>
                    <option value="calzado" data-emoji="👟">👟 Calzado</option>
                    <option value="juguetes" data-emoji="🧸">🧸 Juguetes</option>
                    <option value="libros" data-emoji="📚">📚 Libros</option>
                    <option value="electronica" data-emoji="📱">📱 Electrónica</option>
                    <option value="hogar" data-emoji="🏠">🏠 Hogar y Decoración</option>
                    <option value="servicios" data-emoji="🔧">🔧 Servicios</option>
                    <option value="vehiculos" data-emoji="🚗">🚗 Vehículos</option>
                    <option value="inmuebles" data-emoji="🏢">🏢 Inmuebles</option>
                    <option value="trabajo" data-emoji="💼">💼 Trabajo</option>
                    <option value="otros" data-emoji="🔄">🔄 Otros</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="subcategoria">Subcategoría:</label>
                <select id="subcategoria" name="subcategoria" required>
                    <option value="">Primero seleccione una categoría</option>
                </select>
            </div>
        </div>
                <!-- Título y precio -->
        <div class="form-row">
            <div class="form-group">
                <label for="titulo">Título: 
                    <span id="emoji-preview" class="emoji-preview"></span>
                </label>
                <input type="text" id="titulo" name="titulo" required 
                       placeholder="Título breve y descriptivo">
                <!-- Campo oculto donde guardamos el emoji de la categoría -->
                <input type="hidden" id="emoji" name="emoji" value="">
            </div>
            
            <div class="form-group">
                <label for="precio">Precio ($):</label>
                <input type="number" id="precio" name="precio" required 
                       min="0" step="0.01" placeholder="0.00">
            </div>
        </div>
        
        <!-- Descripción breve -->
        <div class="form-group">
            <label for="descripcion_breve">Descripción breve:</label>
            <textarea id="descripcion_breve" name="descripcion_breve" required 
                      placeholder="Describa brevemente su anuncio (máx. 200 caracteres)" 
                      maxlength="200"></textarea>
        </div>
        
        <!-- Descripción detallada (para la tabla expandible) -->
        <div class="form-group">
            <label for="descripcion_detallada">Descripción detallada:</label>
            <textarea id="descripcion_detallada" name="descripcion_detallada" 
                      placeholder="Incluya todos los detalles importantes de su anuncio">
            </textarea>
        </div>
        
        <!-- Ubicación -->
        <div class="form-group">
            <label for="ubicacion">Dirección/Zona:</label>
            <input type="text" id="ubicacion" name="ubicacion" 
                   placeholder="Barrio, calle, referencia, etc.">
        </div>
        
        <!-- Imágenes -->
        <div class="form-group">
            <label for="imagenes">Imágenes (opcional):</label>
            <input type="file" id="imagenes" name="imagenes[]" 
                   multiple accept="image/*">
            <small>Puede seleccionar varias imágenes. Formatos aceptados: JPG, PNG, GIF</small>
        </div>
        
        <!-- Información de contacto -->
        <div class="form-group">
            <label>Información de contacto:</label>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="telefono">Teléfono fijo (opcional):</label>
                    <input type="tel" id="telefono" name="telefono" 
                           placeholder="Ej. (01) 1234-5678">
                </div>
                
                <div class="form-group">
                    <label for="celular">Teléfono celular (opcional):</label>
                    <input type="tel" id="celular" name="celular" 
                           placeholder="Ej. (011) 15-1234-5678">
                </div>
            </div>
            
            <div class="form-group">
                <label for="email">Correo electrónico (opcional):</label>
                <input type="email" id="email" name="email" 
                       placeholder="ejemplo@correo.com">
            </div>
        </div>
        
        <!-- Campos ocultos para la geolocalización -->
        <input type="hidden" id="latitud" name="latitud">
        <input type="hidden" id="longitud" name="longitud">
        
        <div id="ubicacionStatus">Detectando su ubicación actual...</div>
        
        <!-- Botón enviar desactivado hasta que obtenga la geolocalización o se ingrese manual -->
        <button type="submit" id="submitBtn" disabled>Publicar Anuncio</button>
    </form>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Intentar obtener la geolocalización al cargar la página
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        // Éxito
                        document.getElementById('latitud').value = position.coords.latitude;
                        document.getElementById('longitud').value = position.coords.longitude;
                        document.getElementById('ubicacionStatus').textContent = 
                            'Ubicación detectada correctamente: ' + 
                            position.coords.latitude.toFixed(6) + ', ' + 
                            position.coords.longitude.toFixed(6);
                        document.getElementById('submitBtn').disabled = false;
                    },
                    function(error) {
                        // Error de geolocalización
                        let errorMsg;
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMsg = "Usuario denegó acceso a la ubicación.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMsg = "Información de ubicación no disponible.";
                                break;
                            case error.TIMEOUT:
                                errorMsg = "Tiempo de espera agotado para obtener ubicación.";
                                break;
                            default:
                                errorMsg = "Error desconocido al obtener ubicación.";
                        }
                        document.getElementById('ubicacionStatus').innerHTML = 
                            '<div class="error">' + errorMsg + '</div>' +
                            'Por favor ingrese las coordenadas manualmente:';
                        
                        // Crear campos para ingresar lat/lng manualmente
                        const contenedor = document.getElementById('ubicacionStatus');
                        contenedor.innerHTML += `
                            <div class="form-group" style="margin-top:10px">
                                <label for="latitud-manual">Latitud:</label>
                                <input type="text" id="latitud-manual" placeholder="Ej. -34.603722">
                            </div>
                            <div class="form-group">
                                <label for="longitud-manual">Longitud:</label>
                                <input type="text" id="longitud-manual" placeholder="Ej. -58.381592">
                            </div>
                        `;
                        
                        // Cuando el usuario complete ambos campos, habilitamos el botón
                        document.getElementById('latitud-manual')
                                .addEventListener('input', actualizarCoordenadas);
                        document.getElementById('longitud-manual')
                                .addEventListener('input', actualizarCoordenadas);
                    }
                );
            } else {
                document.getElementById('ubicacionStatus').innerHTML = 
                    '<div class="error">Su navegador no soporta geolocalización.</div>';
            }
        });
        
        function actualizarCoordenadas() {
            const latManual = document.getElementById('latitud-manual').value;
            const lngManual = document.getElementById('longitud-manual').value;
            
            if (latManual && lngManual) {
                document.getElementById('latitud').value = latManual;
                document.getElementById('longitud').value = lngManual;
                document.getElementById('submitBtn').disabled = false;
            } else {
                document.getElementById('submitBtn').disabled = true;
            }
        }
        
        // Manejar el tipo de anuncio (oferta o demanda)
        function seleccionarTipo(tipo) {
            document.getElementById('tipo_anuncio').value = tipo;
            if (tipo === 'oferta') {
                document.getElementById('btn-oferta').classList.add('active');
                document.getElementById('btn-demanda').classList.remove('active');
            } else {
                document.getElementById('btn-demanda').classList.add('active');
                document.getElementById('btn-oferta').classList.remove('active');
            }
        }
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
        
             // Actualiza las subcategorías según la categoría seleccionada
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
                
                // Agregar listener para actualizar el emoji cuando se cambie la subcategoría
                subcategoriaSelect.addEventListener('change', function() {
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
        }
        
        // Función para abrir el modal/pop-up con los detalles del producto
        function mostrarProducto(producto) {
            document.getElementById('modal-titulo').textContent = producto.emoji + ' ' + producto.titulo;
            document.getElementById('modal-precio').textContent = '$' + producto.precio;
            document.getElementById('modal-descripcion').textContent = producto.descripcion_breve;
            document.getElementById('modal-ubicacion').textContent = '📍 ' + producto.ubicacion;
            
            // Guarda los datos de contacto en atributos data- para usarlos luego
            const modal = document.getElementById('productoModal');
            modal.setAttribute('data-telefono', producto.telefono || '');
            modal.setAttribute('data-celular', producto.celular || '');
            modal.setAttribute('data-email', producto.email || '');
            
            // Mostrar imágenes si hay
            const imagenesDiv = document.getElementById('modal-imagenes');
            imagenesDiv.innerHTML = '';
            if (producto.imagenes && producto.imagenes.length > 0) {
                producto.imagenes.forEach(img => {
                    const imgElement = document.createElement('img');
                    imgElement.src = img;
                    imgElement.style.maxWidth = '100%';
                    imgElement.style.marginBottom = '10px';
                    imagenesDiv.appendChild(imgElement);
                });
            }
            
            // Mostrar el modal
            document.getElementById('productoModal').style.display = 'block';
        }
        
        // Función para cerrar el modal
        function cerrarModal() {
            document.getElementById('productoModal').style.display = 'none';
        }
        
        // Función para manejar el contacto con el vendedor
        function contactarVendedor() {
            const modal = document.getElementById('productoModal');
            const telefono = modal.getAttribute('data-telefono');
            const celular = modal.getAttribute('data-celular');
            const email = modal.getAttribute('data-email');
            
            // Prioridad: Celular > Teléfono > Email
            if (celular) {
                window.location.href = 'tel:' + celular;
            } else if (telefono) {
                window.location.href = 'tel:' + telefono;
            } else if (email) {
                window.location.href = 'mailto:' + email;
            } else {
                alert('No hay información de contacto disponible.');
            }
        }
        
        // Cierra el modal si el usuario hace clic fuera del contenido
        window.onclick = function(event) {
            const modal = document.getElementById('productoModal');
            if (event.target == modal) {
                cerrarModal();
            }
        }
    </script>
</body>
</html>
