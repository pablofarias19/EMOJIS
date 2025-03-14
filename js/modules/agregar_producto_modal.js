/**
 * Módulo para gestionar el modal/popup de detalles del producto
 * Fecha de creación: 2025-03-13 16:58:21
 * Autor: pablofarias19
 */
const ModalModule = (function() {
    // Variables privadas del módulo
    let datosVendedor = {
        nombre: '',
        telefono: '',
        celular: '',
        email: '',
        identificador: ''
    };
    
    let datosProducto = {
        titulo: '',
        precio: '',
        descripcion: '',
        categoria: '',
        subcategoria: '',
        ubicacion: '',
        emoji: '',
        tipo: 'oferta'
    };
    
    // Configuración de la plataforma
    const configPlataforma = {
        nombre: 'Mapita',
        url: 'www.mapita.com.ar',
        descripcion: 'comunidad colaborativa de intercambio de bienes y servicios'
    };
    
    /**
     * Inicializa el modal
     */
    function init() {
        // Configurar eventos específicos del modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', cerrarModal);
        }
        
        // Añadir listener al botón de contacto
        const contactarBtn = document.getElementById('productoModal')
            .querySelector('.modal-actions button');
        if (contactarBtn) {
            contactarBtn.addEventListener('click', contactarVendedor);
        }
    }
    
    /**
     * Muestra el modal con los detalles de un producto
     * @param {Object} producto - Datos del producto a mostrar
     */
    function mostrarProducto(producto) {
        document.getElementById('modal-titulo').textContent = producto.emoji + ' ' + producto.titulo;
        document.getElementById('modal-precio').textContent = '$' + producto.precio;
        document.getElementById('modal-descripcion').textContent = producto.descripcion_breve;
        document.getElementById('modal-ubicacion').textContent = '📍 ' + producto.ubicacion;
        
        // Guardar datos del vendedor
        guardarDatosVendedor({
            nombre: producto.nombre_vendedor || 'Vendedor',
            telefono: producto.telefono || '',
            celular: producto.celular || '',
            email: producto.email || '',
            identificador: producto.id_vendedor || ''
        });
        
        // Guardar datos del producto para mensajes predefinidos
        guardarDatosProducto({
            titulo: producto.titulo || '',
            precio: producto.precio || '',
            descripcion: producto.descripcion_breve || '',
            categoria: producto.categoria_nombre || '',
            subcategoria: producto.subcategoria_nombre || '',
            ubicacion: producto.ubicacion || '',
            emoji: producto.emoji || '',
            tipo: producto.tipo_anuncio || 'oferta'
        });
        
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
    
    /**
     * Guarda los datos del vendedor para su uso posterior
     * @param {Object} datos - Datos del vendedor
     */
    function guardarDatosVendedor(datos) {
        datosVendedor = {...datos};
        
        // También guardamos como atributos para compatibilidad
        const modal = document.getElementById('productoModal');
        modal.setAttribute('data-nombre', datos.nombre || '');
        modal.setAttribute('data-telefono', datos.telefono || '');
        modal.setAttribute('data-celular', datos.celular || '');
        modal.setAttribute('data-email', datos.email || '');
        modal.setAttribute('data-id', datos.identificador || '');
    }
    
    /**
     * Guarda los datos del producto para su uso posterior
     * @param {Object} datos - Datos del producto
     */
    function guardarDatosProducto(datos) {
        datosProducto = {...datos};
    }
    
    /**
     * Cierra el modal
     */
    function cerrarModal() {
        document.getElementById('productoModal').style.display = 'none';
        
        // Eliminar opciones de contacto si están visibles
        const elementoContacto = document.querySelector('.contacto-opciones');
        if (elementoContacto) {
            elementoContacto.remove();
        }
    }
    
    /**
     * Genera un mensaje predefinido para WhatsApp
     * @returns {string} Mensaje predefinido
     */
    function generarMensajePredefinido() {
        const tipoAnuncio = datosProducto.tipo === 'oferta' ? 'oferta' : 'búsqueda';
        return `Hola, me interesa tu ${tipoAnuncio} "${datosProducto.emoji} ${datosProducto.titulo}" a $${datosProducto.precio} que vi en ${configPlataforma.nombre}. ¿Sigue disponible?`;
    }
    
    /**
     * Genera un mensaje para correo electrónico
     * @returns {string} Mensaje formateado para email
     */
    function generarMensajeEmail() {
        const tipoAnuncio = datosProducto.tipo === 'oferta' ? 'oferta' : 'búsqueda';
        return `Hola ${datosVendedor.nombre},

Me interesa tu ${tipoAnuncio} "${datosProducto.emoji} ${datosProducto.titulo}" a $${datosProducto.precio} que vi en ${configPlataforma.nombre}.

¿Sigue disponible? Me gustaría obtener más información sobre este ${tipoAnuncio === 'oferta' ? 'producto' : 'requerimiento'}.

Detalles:
- Título: ${datosProducto.titulo}
- Precio: $${datosProducto.precio}
- Categoría: ${datosProducto.categoria}${datosProducto.subcategoria ? ' > ' + datosProducto.subcategoria : ''}
- Ubicación: ${datosProducto.ubicacion}
- Descripción: ${datosProducto.descripcion}

Quedo atento a tu respuesta.

Saludos.

--
Mensaje enviado desde ${configPlataforma.nombre} (${configPlataforma.url}) - ${configPlataforma.descripcion}`;
    }
    
    /**
     * Genera una URL para WhatsApp con mensaje predefinido
     * @param {string} numero - Número de teléfono
     * @returns {string} URL completa para WhatsApp
     */
    function generarURLWhatsApp(numero) {
        // Limpiar el número de teléfono (quitar paréntesis, espacios, guiones)
        const numeroLimpio = numero.replace(/[\s\-\(\)]/g, '');
        
        // Generar mensaje corto
        const mensaje = encodeURIComponent(generarMensajePredefinido());
        
        // Crear URL de WhatsApp
        return `https://wa.me/${numeroLimpio}?text=${mensaje}`;
    }
    
    /**
     * Gestiona el contacto con el vendedor
     * Esta función se mantiene por compatibilidad con el HTML existente
     */
    function contactarVendedor() {
        // Ahora llama a la nueva implementación
        mostrarContactoVendedor();
    }
    
    /**
     * Muestra un diálogo con las opciones de contacto
     */
    function mostrarContactoVendedor() {
        // Verificar si hay información de contacto
        if (!datosVendedor.celular && !datosVendedor.telefono && !datosVendedor.email) {
            alert('No hay información de contacto disponible.');
            return;
        }
        
        // Crear un diálogo emergente personalizado con las opciones de contacto
        const modalContenido = document.querySelector('.modal-content');
        
        // Crear el contenedor de opciones de contacto
        const contactoDiv = document.createElement('div');
        contactoDiv.className = 'contacto-opciones';
        
        // Título de las opciones de contacto
        const titulo = document.createElement('h3');
        titulo.textContent = `Contactar a ${datosVendedor.nombre}`;
        contactoDiv.appendChild(titulo);
        
        // Lista de opciones de contacto
        const listaOpciones = document.createElement('div');
        listaOpciones.className = 'contacto-lista';
        
        // Añadir opción de WhatsApp (celular)
        if (datosVendedor.celular) {
            // Añadir opción de WhatsApp
            const whatsappDiv = document.createElement('div');
            whatsappDiv.className = 'opcion-contacto';
            
            // Título de la opción
            const tituloWhatsApp = document.createElement('h4');
            tituloWhatsApp.textContent = 'WhatsApp';
            whatsappDiv.appendChild(tituloWhatsApp);
            
            // Vista previa del mensaje
            const previewWhatsApp = document.createElement('div');
            previewWhatsApp.className = 'mensaje-preview';
            previewWhatsApp.textContent = generarMensajePredefinido();
            whatsappDiv.appendChild(previewWhatsApp);
            
            // Contenedor de botones
            const botonesWhatsApp = document.createElement('div');
            botonesWhatsApp.className = 'contacto-botones';
            
            // Botón de WhatsApp
            const btnWhatsApp = document.createElement('button');
            btnWhatsApp.className = 'btn-whatsapp';
            btnWhatsApp.innerHTML = '<span class="icono-whatsapp"></span> Enviar WhatsApp';
            btnWhatsApp.onclick = function() {
                window.open(generarURLWhatsApp(datosVendedor.celular), '_blank');
            };
            botonesWhatsApp.appendChild(btnWhatsApp);
            
            // Número de teléfono
            const infoWhatsApp = document.createElement('span');
            infoWhatsApp.className = 'contacto-info';
            infoWhatsApp.textContent = datosVendedor.celular;
            botonesWhatsApp.appendChild(infoWhatsApp);
            
            whatsappDiv.appendChild(botonesWhatsApp);
            listaOpciones.appendChild(whatsappDiv);
            
            // Separador
            const separador = document.createElement('hr');
            listaOpciones.appendChild(separador);
            
            // Opción de llamada normal al celular
            const llamadaDiv = document.createElement('div');
            llamadaDiv.className = 'opcion-contacto';
            
            // Título de la opción
            const tituloLlamada = document.createElement('h4');
            tituloLlamada.textContent = 'Llamar al celular';
            llamadaDiv.appendChild(tituloLlamada);
            
            // Botones de llamada
            const botonesLlamada = document.createElement('div');
            botonesLlamada.className = 'contacto-botones';
            
            // Botón de llamada
            const btnLlamada = document.createElement('button');
            btnLlamada.className = 'btn-llamada';
            btnLlamada.textContent = '📱 Llamar al celular';
            btnLlamada.onclick = function() {
                window.location.href = 'tel:' + datosVendedor.celular;
            };
            botonesLlamada.appendChild(btnLlamada);
            
            // Número de teléfono
            const infoLlamada = document.createElement('span');
            infoLlamada.className = 'contacto-info';
            infoLlamada.textContent = datosVendedor.celular;
            botonesLlamada.appendChild(infoLlamada);
            
            llamadaDiv.appendChild(botonesLlamada);
            listaOpciones.appendChild(llamadaDiv);
        }
        
        // Añadir opción de teléfono fijo
        if (datosVendedor.telefono) {
            // Agregar separador si ya hay opciones anteriores
            if (listaOpciones.childElementCount > 0) {
                const separadorTel = document.createElement('hr');
                listaOpciones.appendChild(separadorTel);
            }
            
            // Opción de llamada al teléfono fijo
            const telefonoDiv = document.createElement('div');
            telefonoDiv.className = 'opcion-contacto';
            
            // Título de la opción
            const tituloTelefono = document.createElement('h4');
            tituloTelefono.textContent = 'Llamar al teléfono fijo';
            telefonoDiv.appendChild(tituloTelefono);
            
            // Botones de llamada
            const botonesTelefono = document.createElement('div');
            botonesTelefono.className = 'contacto-botones';
            
            // Botón de llamada
            const btnTelefono = document.createElement('button');
            btnTelefono.className = 'btn-llamada';
            btnTelefono.textContent = '☎️ Llamar al teléfono fijo';
            btnTelefono.onclick = function() {
                window.location.href = 'tel:' + datosVendedor.telefono;
            };
            botonesTelefono.appendChild(btnTelefono);
            
            // Número de teléfono
            const infoTelefono = document.createElement('span');
            infoTelefono.className = 'contacto-info';
            infoTelefono.textContent = datosVendedor.telefono;
            botonesTelefono.appendChild(infoTelefono);
            
            telefonoDiv.appendChild(botonesTelefono);
            listaOpciones.appendChild(telefonoDiv);
        }
        
        // Añadir opción de email
        if (datosVendedor.email) {
            // Agregar separador si ya hay opciones anteriores
            if (listaOpciones.childElementCount > 0) {
                const separadorEmail = document.createElement('hr');
                listaOpciones.appendChild(separadorEmail);
            }
            
            const emailDiv = document.createElement('div');
            emailDiv.className = 'opcion-contacto';
            
            // Título de la opción
            const tituloEmail = document.createElement('h4');
            tituloEmail.textContent = 'Enviar correo electrónico';
            emailDiv.appendChild(tituloEmail);
            
            // Vista previa del mensaje
            const previewEmail = document.createElement('div');
            previewEmail.className = 'mensaje-preview email-preview';
            
            // Dividir el mensaje en líneas para mejor formato
            const mensajeEmail = generarMensajeEmail();
            const lineas = mensajeEmail.split('\n');
            
                       
            lineas.forEach((linea, index) => {
                if (index > 0) {
                    previewEmail.appendChild(document.createElement('br'));
                }
                previewEmail.appendChild(document.createTextNode(linea));
            });
            
            emailDiv.appendChild(previewEmail);
            
            // Contenedor de botones
            const botonesEmail = document.createElement('div');
            botonesEmail.className = 'contacto-botones';
            
            // Preparar el asunto y cuerpo del correo
            const asuntoEmail = encodeURIComponent(`Consulta sobre ${datosProducto.emoji} ${datosProducto.titulo}`);
            const cuerpoEmail = encodeURIComponent(generarMensajeEmail());
            
            // Botón de email
            const btnEmail = document.createElement('button');
            btnEmail.className = 'btn-email';
            btnEmail.textContent = '✉️ Enviar correo electrónico';
            btnEmail.onclick = function() {
                window.location.href = `mailto:${datosVendedor.email}?subject=${asuntoEmail}&body=${cuerpoEmail}`;
            };
            botonesEmail.appendChild(btnEmail);
            
            // Dirección de email
            const infoEmail = document.createElement('span');
            infoEmail.className = 'contacto-info';
            infoEmail.textContent = datosVendedor.email;
            botonesEmail.appendChild(infoEmail);
            
            emailDiv.appendChild(botonesEmail);
            listaOpciones.appendChild(emailDiv);
        }
        
        contactoDiv.appendChild(listaOpciones);
        
        // Añadir botón para cerrar opciones
        const btnCerrar = document.createElement('button');
        btnCerrar.className = 'btn-secondary';
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.onclick = function() {
            const elementoAnterior = document.querySelector('.contacto-opciones');
            if (elementoAnterior) {
                elementoAnterior.remove();
            }
        };
        
        contactoDiv.appendChild(btnCerrar);
        
        // Eliminar diálogo anterior si existe
        const elementoAnterior = document.querySelector('.contacto-opciones');
        if (elementoAnterior) {
            elementoAnterior.remove();
        }
        
        // Añadir el nuevo diálogo
        modalContenido.appendChild(contactoDiv);
    }
    
    // API pública
    return {
        init,
        mostrarProducto,
        cerrarModal,
        contactarVendedor
    };
})();