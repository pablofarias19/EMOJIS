/**
 * Archivo principal de inicialización para la Administración de Emojis
 */
document.addEventListener('DOMContentLoaded', function() {
  // Variables globales compartidas
  const appState = {
    emojisList: [],
    groupsList: [],
    relationsList: [],
    mapInstance: null
  };

  // Inicializar módulos
  UtilsModule.init();
  MapModule.init(appState, UtilsModule);
  EmojiModule.init(appState, UtilsModule, MapModule);
  GroupsModule.init(appState, UtilsModule);
  RelationsModule.init(appState, UtilsModule, MapModule);
  
  // Configurar eventos globales
  setupGlobalEvents();
  
  // Cargar datos iniciales
  EmojiModule.loadEmojis();
  
  // Log para depuración
  console.log("Sistema de administración de emojis inicializado correctamente");
});

/**
 * Configura eventos globales de la aplicación
 */
function setupGlobalEvents() {
  // Botones y formularios para emojis
  const newEmojiBtn = document.getElementById('new-emoji-btn');
  if (newEmojiBtn) {
    newEmojiBtn.addEventListener('click', function() {
      EmojiModule.showForm();
    });
  } else {
    console.error('Botón "new-emoji-btn" no encontrado en el DOM');
  }
  
  // Configurar eventos de pestañas
  const tabElements = document.querySelectorAll('button[data-bs-toggle="tab"]');
  tabElements.forEach(tabEl => {
    tabEl.addEventListener('shown.bs.tab', event => {
      const targetId = event.target.getAttribute('id');
      
      if (targetId === 'groups-tab') {
        GroupsModule.loadGroups();
      } else if (targetId === 'relations-tab') {
        RelationsModule.loadRelations();
        RelationsModule.updateEmojiSelectors();
      }
    });
  });
  
  // Exponer funciones necesarias al ámbito global para uso desde HTML
  window.editEmoji = function(id) { 
    EmojiModule.editEmoji(id); 
  };
  
  window.deleteEmoji = function(id) { 
    EmojiModule.deleteEmoji(id); 
  };
  
  window.editGroup = function(id) { 
    GroupsModule.editGroup(id); 
  };
  
  window.deleteGroup = function(id) { 
    GroupsModule.deleteGroup(id); 
  };
  
  window.deleteRelation = function(id) { 
    RelationsModule.deleteRelation(id); 
  };
  
  // Asignar eventos específicos para cada módulo
  const relationForm = document.getElementById('relation-form');
  if (relationForm) {
    relationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      RelationsModule.saveRelation(e);
    });
    console.log('Evento submit asignado al formulario de relaciones desde setupGlobalEvents');
  }
  
  const relationResetBtn = document.getElementById('relation-reset-btn');
  if (relationResetBtn) {
    relationResetBtn.addEventListener('click', function() {
      RelationsModule.resetRelationForm();
    });
  }
}