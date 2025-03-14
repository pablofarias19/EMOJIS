/**
 * Módulo para gestionar el formulario
 * Fecha de creación: 2025-03-13 15:38:02
 * Autor: pablofarias19
 */
const FormModule = (function() {
    /**
     * Inicializa el módulo de formularios
     */
    function init() {
        // Configurar validación del formulario
        document.getElementById('anuncioForm').addEventListener('submit', function(e) {
            // Aquí se podrían hacer validaciones adicionales antes de enviar el formulario
        });
    }
    
    /**
     * Selecciona el tipo de anuncio (oferta o demanda)
     * @param {string} tipo - 'oferta' o 'demanda'
     */
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
    
    // API pública
    return {
        init,
        seleccionarTipo
    };
})();