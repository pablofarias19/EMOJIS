/**
 * Módulo de utilidades para funciones comunes
 */
const UtilsModule = (function() {
  /**
   * Inicializa el módulo de utilidades
   */
  function init() {
    // Si hay alguna inicialización específica para las utilidades, se haría aquí
    console.log("UtilsModule inicializado");
  }

  /**
   * Muestra un mensaje de alerta al usuario
   * @param {string} message - El mensaje a mostrar
   * @param {string} type - Tipo de alerta (success, danger, info, warning)
   */
  function showMessage(message, type) {
    const container = document.getElementById('message-container');
    container.textContent = message;
    container.className = `alert alert-${type}`;
    
    // Hacer scroll al mensaje y ocultarlo después de 5 segundos
    container.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      container.className = 'alert alert-hidden';
    }, 5000);
  }

  /**
   * Encuentra un elemento en un array por su ID
   * @param {Array} array - Array donde buscar
   * @param {number|string} id - ID a buscar
   * @returns {Object|undefined} El objeto encontrado o undefined
   */
  function findById(array, id) {
    return array.find(item => item.id == id);
  }

  /**
   * Cuenta elementos en un array que cumplan una condición
   * @param {Array} array - Array donde contar
   * @param {Function} predicate - Función de condición
   * @returns {number} El número de elementos que cumplen la condición
   */
  function countItems(array, predicate) {
    return array.filter(predicate).length;
  }
  
  // API pública
  return {
    init,
    showMessage,
    findById,
    countItems
  };
})();