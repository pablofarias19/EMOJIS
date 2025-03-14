/**
 * Módulo para gestionar la geolocalización
 * Fecha de creación: 2025-03-13 15:38:02
 * Autor: pablofarias19
 */
const GeoModule = (function() {
    /**
     * Inicializa la geolocalización
     */
    function init() {
        // Intentar obtener la geolocalización al cargar la página
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                handleGeoSuccess,
                handleGeoError
            );
        } else {
            document.getElementById('ubicacionStatus').innerHTML = 
                '<div class="error">Su navegador no soporta geolocalización.</div>';
        }
    }
    
    /**
     * Maneja el éxito de la obtención de la geolocalización
     * @param {GeolocationPosition} position - Posición obtenida
     */
    function handleGeoSuccess(position) {
        // Éxito
        document.getElementById('latitud').value = position.coords.latitude;
        document.getElementById('longitud').value = position.coords.longitude;
        document.getElementById('ubicacionStatus').textContent = 
            'Ubicación detectada correctamente: ' + 
            position.coords.latitude.toFixed(6) + ', ' + 
            position.coords.longitude.toFixed(6);
        document.getElementById('submitBtn').disabled = false;
    }
    
    /**
     * Maneja errores de geolocalización
     * @param {GeolocationPositionError} error - Error de geolocalización
     */
    function handleGeoError(error) {
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
    
    /**
     * Actualiza las coordenadas cuando se ingresan manualmente
     */
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
    
    // API pública
    return {
        init
    };
})();