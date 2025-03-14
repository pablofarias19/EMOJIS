/**
 * Módulo para la gestión de relaciones entre emojis
 */
const RelationsModule = (function() {
  // Variables privadas
  let appState;
  let utilsModule;
  let mapModule;
  
  /**
   * Inicializa el módulo
   * @param {Object} state - Estado compartido de la aplicación
   * @param {Object} utils - Módulo de utilidades
   * @param {Object} map - Módulo del mapa
   */
  function init(state, utils, map) {
    appState = state;
    utilsModule = utils;
    mapModule = map;
    
    // Configurar eventos de inmediato
    setupEvents();
    
    // Cargar datos iniciales
    loadInitialData();
    
    console.log('RelationsModule inicializado correctamente');
  }
  
  /**
   * Carga las relaciones desde el servidor
   */
  function loadRelations() {
    fetch('get_relaciones_emoji.php')
      .then(response => {
        if (!response.ok) throw new Error('Error al cargar relaciones');
        return response.json();
      })
      .then(data => {
        if (data.success) {
          appState.relationsList = data.relaciones || [];
          filterAndRenderRelations();
        } else {
          utilsModule.showMessage('Error al cargar relaciones: ' + data.error, 'danger');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        utilsModule.showMessage('No se pudieron cargar las relaciones', 'danger');
      });
  }
  
  /**
   * Filtra y muestra las relaciones según el grupo seleccionado
   */
  function filterAndRenderRelations() {
    const groupFilter = parseInt(document.getElementById('filter-relations-group').value);
    let filteredRelations = appState.relationsList;
    
    if (groupFilter > 0) {
      filteredRelations = appState.relationsList.filter(rel => rel.grupo_id == groupFilter);
    }
    
    renderRelationsList(filteredRelations);
  }
  
  /**
   * Renderiza la lista de relaciones
   * @param {Array} relations - Lista de relaciones a mostrar
   */
  function renderRelationsList(relations) {
    const container = document.getElementById('relations-container');
    if (!container) {
      console.error('Contenedor de relaciones no encontrado');
      return;
    }
    
    container.innerHTML = '';
    
    if (!relations || relations.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No hay relaciones para mostrar.</p>';
      return;
    }
    
    // Agrupar por grupo
    const relationsByGroup = {};
    
    relations.forEach(relation => {
      if (!relationsByGroup[relation.grupo_id]) {
        relationsByGroup[relation.grupo_id] = {
          info: getGroupById(relation.grupo_id),
          items: []
        };
      }
      
      relationsByGroup[relation.grupo_id].items.push(relation);
    });
    
    // Renderizar por grupos
    Object.values(relationsByGroup).forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'mb-4';
      
      // Encabezado del grupo
      const headerDiv = document.createElement('div');
      headerDiv.className = 'alert alert-info mb-3';
      headerDiv.innerHTML = `
        <h5 class="mb-1">${group.info?.nombre || 'Grupo sin nombre'}</h5>
        <small>${group.info?.criterio || 'Sin criterio'}</small>
      `;
      groupDiv.appendChild(headerDiv);
      
      // Relaciones del grupo
      group.items.forEach(relation => {
        const originEmoji = getEmojiById(relation.emoji_origen_id);
        const destEmoji = getEmojiById(relation.emoji_destino_id);
        
        if (!originEmoji || !destEmoji) return;
        
        const relationCard = document.createElement('div');
        relationCard.className = 'relationship-card';
        
        relationCard.innerHTML = `
          <div class="d-flex align-items-center">
            <div class="text-center">
              <span class="emoji-large">${originEmoji.emoji}</span>
              <div><small>${originEmoji.titulo || 'Sin título'}</small></div>
            </div>
            
            <div class="connection-arrow text-center mx-3">
              <i class="bi bi-arrow-right"></i>
              ${relation.etiqueta ? `<div class="connection-info">${relation.etiqueta}</div>` : ''}
            </div>
            
            <div class="text-center">
              <span class="emoji-large">${destEmoji.emoji}</span>
              <div><small>${destEmoji.titulo || 'Sin título'}</small></div>
            </div>
            
            <div class="flex-grow-1 text-end">
              <button class="btn btn-sm btn-outline-danger delete-relation-btn" data-id="${relation.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          
          <div class="mt-2 d-flex justify-content-between">
            <small class="text-muted">Orden: ${relation.orden}</small>
            <small class="text-muted">ID: ${relation.id}</small>
          </div>
        `;
        
        // Agregar evento al botón de eliminar
        const deleteBtn = relationCard.querySelector('.delete-relation-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function() {
            deleteRelation(relation.id);
          });
        }
        
        groupDiv.appendChild(relationCard);
      });
      
      container.appendChild(groupDiv);
    });
  }
  
  /**
   * Actualiza selectores de emojis
   */
  function updateEmojiSelectors() {
    const relationGroup = document.getElementById('relation-group');
    if (!relationGroup) {
      console.error('Selector de grupo de relación no encontrado');
      return;
    }
    
    // Añadir evento para actualizar selector de origen al cambiar grupo
    relationGroup.addEventListener('change', function() {
      const groupId = this.value;
      updateEmojiOriginSelector(groupId);
    });
  }
  
  /**
   * Actualiza selector de emoji origen según grupo seleccionado
   * @param {string|number} groupId - ID del grupo seleccionado
   */
  function updateEmojiOriginSelector(groupId) {
    const container = document.getElementById('emoji-origin-selector');
    if (!container) {
      console.error('Contenedor de selector de emoji origen no encontrado');
      return;
    }
    
    container.innerHTML = '';
    
    if (!groupId) {
      container.innerHTML = '<p class="text-center text-muted w-100">Seleccione un grupo primero</p>';
      return;
    }
    
    // Obtener todos los emojis activos
    const activeEmojis = appState.emojisList.filter(emoji => emoji.activo == 1);
    
    if (activeEmojis.length === 0) {
      container.innerHTML = '<p class="text-center text-muted w-100">No hay emojis activos disponibles</p>';
      return;
    }
    
    // Crear elementos para cada emoji
    activeEmojis.forEach(emoji => {
      const emojiElement = document.createElement('div');
      emojiElement.className = 'emoji-select-card';
      emojiElement.dataset.id = emoji.id;
      emojiElement.innerHTML = `
        <div class="text-center">
          <div class="emoji-badge">${emoji.emoji}</div>
          <small>${emoji.titulo || `ID: ${emoji.id}`}</small>
        </div>
      `;
      
      emojiElement.addEventListener('click', function() {
        // Quitar selección previa
        container.querySelectorAll('.emoji-select-card').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Añadir selección
        this.classList.add('selected');
        document.getElementById('emoji-origin-id').value = this.dataset.id;
        
        // Actualizar selector de destino
        updateEmojiDestSelector(this.dataset.id);
      });
      
      container.appendChild(emojiElement);
    });
  }
  
  /**
   * Actualiza selector de emoji destino
   * @param {string|number} originId - ID del emoji origen seleccionado
   */
  function updateEmojiDestSelector(originId) {
    const container = document.getElementById('emoji-destination-selector');
    if (!container) {
      console.error('Contenedor de selector de emoji destino no encontrado');
      return;
    }
    
    container.innerHTML = '';
    
    if (!originId) {
      container.innerHTML = '<p class="text-center text-muted w-100">Seleccione un origen primero</p>';
      return;
    }
    
    // Obtener todos los emojis activos excepto el origen
    const activeEmojis = appState.emojisList.filter(emoji => emoji.activo == 1 && emoji.id != originId);
    
    if (activeEmojis.length === 0) {
      container.innerHTML = '<p class="text-center text-muted w-100">No hay otros emojis disponibles</p>';
      return;
    }
    
    // Crear elementos para cada emoji
    activeEmojis.forEach(emoji => {
      const emojiElement = document.createElement('div');
      emojiElement.className = 'emoji-select-card';
      emojiElement.dataset.id = emoji.id;
      emojiElement.innerHTML = `
        <div class="text-center">
          <div class="emoji-badge">${emoji.emoji}</div>
          <small>${emoji.titulo || `ID: ${emoji.id}`}</small>
        </div>
      `;
      
      emojiElement.addEventListener('click', function() {
        // Quitar selección previa
        container.querySelectorAll('.emoji-select-card').forEach(el => {
          el.classList.remove('selected');
        });
        
        // Añadir selección
        this.classList.add('selected');
        document.getElementById('emoji-destination-id').value = this.dataset.id;
      });
      
      container.appendChild(emojiElement);
    });
  }
  
  /**
   * Guarda una relación entre emojis
   * @param {Event} e - Evento del formulario
   */
  function saveRelation(e) {
    e.preventDefault();
    
    const groupId = document.getElementById('relation-group').value;
    const originId = document.getElementById('emoji-origin-id').value;
    const destId = document.getElementById('emoji-destination-id').value;
    const orden = document.getElementById('relation-order').value;
    const etiqueta = document.getElementById('relation-label').value;
    const bidirectional = document.getElementById('bidirectional-relation').checked;
    
    // Validar datos
    if (!groupId) {
      utilsModule.showMessage('Por favor, seleccione un grupo', 'danger');
      return;
    }
    
    if (!originId) {
      utilsModule.showMessage('Por favor, seleccione un emoji de origen', 'danger');
      return;
    }
    
    if (!destId) {
      utilsModule.showMessage('Por favor, seleccione un emoji de destino', 'danger');
      return;
    }
    
    // Mostrar mensaje de carga
    utilsModule.showMessage('Guardando relación...', 'info');
    
    // Crear FormData para enviar al servidor
    const formData = new FormData();
    formData.append('grupo_id', groupId);
    formData.append('emoji_origen_id', originId);
    formData.append('emoji_destino_id', destId);
    formData.append('orden', orden);
    formData.append('etiqueta', etiqueta);
    formData.append('bidirectional', bidirectional ? '1' : '0');
    
    // Debug
    console.log('Enviando datos al servidor:', {
      grupo_id: groupId,
      emoji_origen_id: originId,
      emoji_destino_id: destId,
      orden: orden,
      etiqueta: etiqueta,
      bidirectional: bidirectional ? '1' : '0'
    });
    
    fetch('guardar_relacion_emoji.php', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta del servidor:', data);
      
      if (data.success) {
        utilsModule.showMessage(bidirectional ? 'Relaciones bidireccionales creadas correctamente' : 'Relación creada correctamente', 'success');
        resetRelationForm();
        loadRelations();
        
        // Actualizar contador en tabla de emojis si existe el módulo
        if (window.EmojiModule && EmojiModule.loadEmojis) {
          EmojiModule.loadEmojis();
        }
      } else {
        utilsModule.showMessage('Error al guardar la relación: ' + (data.error || 'Intente de nuevo'), 'danger');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      utilsModule.showMessage('Error al guardar la relación: ' + error.message, 'danger');
    });
  }
  
  /**
   * Elimina una relación
   * @param {number} id - ID de la relación a eliminar
   */
  function deleteRelation(id) {
    if (!confirm('¿Está seguro de que desea eliminar esta relación?')) {
      return;
    }
    
    fetch(`eliminar_relacion_emoji.php?id=${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Error al eliminar');
        return response.json();
      })
      .then(data => {
        if (data.success) {
          utilsModule.showMessage('Relación eliminada correctamente', 'success');
          loadRelations();
          
          // Actualizar contador en tabla de emojis
          if (window.EmojiModule && EmojiModule.loadEmojis) {
            EmojiModule.loadEmojis();
          }
        } else {
          utilsModule.showMessage('Error al eliminar: ' + (data.error || 'Intente de nuevo'), 'danger');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        utilsModule.showMessage('Error al eliminar la relación', 'danger');
      });
  }
  
  /**
   * Resetea el formulario de relación
   */
  function resetRelationForm() {
    const form = document.getElementById('relation-form');
    if (form) {
      form.reset();
    }
    
    const originId = document.getElementById('emoji-origin-id');
    const destId = document.getElementById('emoji-destination-id');
    
    if (originId) originId.value = '';
    if (destId) destId.value = '';
    
    const originSelector = document.getElementById('emoji-origin-selector');
    const destSelector = document.getElementById('emoji-destination-selector');
    
    if (originSelector) {
      originSelector.innerHTML = '<p class="text-center text-muted w-100">Seleccione un grupo primero</p>';
    }
    
    if (destSelector) {
      destSelector.innerHTML = '<p class="text-center text-muted w-100">Seleccione un origen primero</p>';
    }
  }
  
  /**
   * Obtiene un grupo por ID
   * @param {number} id - ID del grupo
   * @returns {Object|undefined} - Grupo encontrado o undefined
   */
  function getGroupById(id) {
    return appState.groupsList.find(group => group.id == id);
  }
  
  /**
   * Obtiene un emoji por ID
   * @param {number} id - ID del emoji
   * @returns {Object|undefined} - Emoji encontrado o undefined
   */
  function getEmojiById(id) {
    return appState.emojisList.find(emoji => emoji.id == id);
  }
  
  /**
   * Configura eventos para los elementos de la interfaz
   */
  function setupEvents() {
    const relationForm = document.getElementById('relation-form');
    const relationResetBtn = document.getElementById('relation-reset-btn');
    const filterRelationsGroup = document.getElementById('filter-relations-group');
    
    if (relationForm) {
      // Eliminar eventos existentes para evitar duplicados
      relationForm.removeEventListener('submit', saveRelation);
      // Añadir nuevo evento
      relationForm.addEventListener('submit', saveRelation);
      console.log('Evento submit asignado al formulario de relaciones');
    } else {
      console.error('Formulario de relaciones no encontrado');
    }
    
    if (relationResetBtn) {
      relationResetBtn.addEventListener('click', resetRelationForm);
    }
    
    if (filterRelationsGroup) {
      filterRelationsGroup.addEventListener('change', filterAndRenderRelations);
    }
  }
  
  /**
   * Carga datos iniciales necesarios para el módulo
   */
  function loadInitialData() {
    // Cargar relaciones
    loadRelations();
    
    // Inicializar selectores
    updateEmojiSelectors();
  }
  
  // Retornar API pública del módulo
  return {
    init: init,
    loadRelations: loadRelations,
    updateEmojiSelectors: updateEmojiSelectors,
    updateEmojiOriginSelector: updateEmojiOriginSelector,
    updateEmojiDestSelector: updateEmojiDestSelector,
    filterAndRenderRelations: filterAndRenderRelations,
    saveRelation: saveRelation,
    deleteRelation: deleteRelation,
    resetRelationForm: resetRelationForm
  };
})();