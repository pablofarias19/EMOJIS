/**
 * Módulo de utilidades para funciones comunes
 * Fecha de creación: 2025-03-13 15:42:10
 * Autor: pablofarias19
 */
const UtilsModule = (function() {
    /**
     * Muestra un mensaje de alerta al usuario
     * @param {string} mensaje - El mensaje a mostrar
     * @param {string} tipo - Tipo de mensaje (error, success, warning, info)
     */
    function mostrarMensaje(mensaje, tipo = 'info') {
        // Implementación simple de notificación
        alert(mensaje);
    }

    /**
     * Valida que un campo no esté vacío
     * @param {string} valor - Valor a validar
     * @return {boolean} - true si es válido
     */
    function validarCampoNoVacio(valor) {
        return valor !== null && valor !== undefined && valor.trim() !== '';
    }

    /**
     * Valida una dirección de correo electrónico
     * @param {string} email - Email a validar
     * @return {boolean} - true si es válido
     */
    function validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Valida un formato de número telefónico básico
     * @param {string} telefono - Número a validar
     * @return {boolean} - true si es válido
     */
    function validarTelefono(telefono) {
        // Elimina espacios, guiones y paréntesis para validación
        const numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '');
        return /^\d{7,15}$/.test(numeroLimpio);
    }
    
    /**
     * Crea un elemento HTML con propiedades específicas
     * @param {string} tag - Tipo de elemento (div, p, etc)
     * @param {Object} props - Propiedades del elemento
     * @param {Array|string} children - Contenido hijo del elemento
     * @return {HTMLElement} - El elemento creado
     */
    function crearElemento(tag, props = {}, children = []) {
        const element = document.createElement(tag);
        
        // Asignar propiedades
        for (const prop in props) {
            if (prop === 'style' && typeof props[prop] === 'object') {
                Object.assign(element.style, props[prop]);
            } else if (prop === 'className') {
                element.className = props[prop];
            } else if (prop === 'dataset') {
                for (const dataKey in props[prop]) {
                    element.dataset[dataKey] = props[prop][dataKey];
                }
            } else {
                element[prop] = props[prop];
            }
        }
        
        // Añadir hijos
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        }
        
        return element;
    }

    // API pública
    return {
        mostrarMensaje,
        validarCampoNoVacio,
        validarEmail,
        validarTelefono,
        crearElemento
    };
})();