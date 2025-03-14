/**
 * Módulo para la gestión de emojis
 */
const EmojiModule = (function() {
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
    
    // Configurar eventos específicos del módulo
    setupEvents();
    
    console.log('EmojiModule inicializado correctamente');
  }
  
 /**
   * Configura eventos específicos del módulo
   */
  function setupEvents() {
    // Esta función configura eventos internos del módulo
    // NO configura el botón "new-emoji-btn" ya que eso se hace en admin_emojis.js
    const emojiForm = document.getElementById('emoji-form');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (emojiForm) {
      emojiForm.addEventListener('submit', function(e) {
        saveEmoji(e); // Usar función local para mantener el contexto
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        hideForm(); // Usar función local para mantener el contexto
      });
    }
    
    // Añadir evento para actualizar la vista previa del emoji
    const emojiSymbol = document.getElementById('emoji-symbol');
    if (emojiSymbol) {
      emojiSymbol.addEventListener('input', function() {
        const preview = document.getElementById('emoji-preview');
        if (preview) {
          preview.textContent = this.value || '📍';
        }
      });
    }
  }
  
  /**
   * Carga la lista de emojis desde el servidor
   */
  function loadEmojis() {
    fetch('get_iconos.php')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar emojis');
        }
        return response.json();
      })
      .then(data => {
        // Guardar lista de emojis para edición posterior
        appState.emojisList = data;
        
        // Actualizar tabla
        renderEmojisTable(data);
        
        // Actualizar selectores de emojis en relaciones si existe el módulo
        if (window.RelationsModule && RelationsModule.updateEmojiSelectors) {
          RelationsModule.updateEmojiSelectors();
        }
      })
      .catch(error => {
        console.error('Error:', error);
        utilsModule.showMessage('No se pudo cargar la lista de emojis', 'danger');
      });
  }
  
  /**
   * Renderiza la tabla de emojis
   * @param {Array} emojis - Lista de emojis a mostrar
   */
  function renderEmojisTable(emojis) {
    const tbody = document.getElementById('emojis-table');
    if (!tbody) return; // Verificar que la tabla exista
    
    tbody.innerHTML = '';
    
    if (emojis.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="9" class="text-center">No hay emojis registrados</td>';
      tbody.appendChild(row);
      return;
    }
    
    emojis.forEach(emoji => {
      // Obtener vinculaciones para este emoji
      const vinculaciones = getRelationshipsForEmoji(emoji.id);
      let vinculacionesHTML = '';
      
      if (vinculaciones.length > 0) {
        vinculacionesHTML = `<span class="badge text-bg-info">${vinculaciones.length} conexiones</span>`;
      } else {
        vinculacionesHTML = '<small class="text-muted">Sin vinculaciones</small>';
      }
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${emoji.id}</td>
        <td><span style="font-size:24px;">${emoji.emoji}</span></td>
        <td>${emoji.titulo || '-'}</td>
        <td>${emoji.lat_inicial}, ${emoji.lng_inicial}</td>
        <td>${emoji.lat_final}, ${emoji.lng_final}</td>
        <td>${emoji.velocidad}</td>
        <td>${vinculacionesHTML}</td>
        <td>${emoji.activo === '1' || emoji.activo === 1 ? '<span style="color:green">✓ Activo</span>' : '<span style="color:red">✗ Inactivo</span>'}</td>
        <td>
          <button class="btn btn-primary btn-sm edit-emoji-btn" data-id="${emoji.id}">Editar</button>
          <button class="btn btn-danger btn-sm delete-emoji-btn" data-id="${emoji.id}">Eliminar</button>
        </td>
      `;
      
      // Agregar eventos a los botones
      const editBtn = row.querySelector('.edit-emoji-btn');
      const deleteBtn = row.querySelector('.delete-emoji-btn');
      
      editBtn.addEventListener('click', () => editEmoji(emoji.id));
      deleteBtn.addEventListener('click', () => deleteEmoji(emoji.id));
      
      tbody.appendChild(row);
    });
  }
  
  /**
   * Muestra el formulario para agregar un nuevo emoji
   */
  function showForm() {
    const formCard = document.getElementById('form-card');
    const formTitle = document.getElementById('form-title');
    const emojiId = document.getElementById('emoji-id');
    
    if (!formCard || !formTitle || !emojiId) return;
    
    clearForm();
    formTitle.textContent = 'Agregar Emoji';
    formCard.style.display = 'block';
    emojiId.value = '';
    
    // Hacer scroll al formulario
    formCard.scrollIntoView({ behavior: 'smooth' });
  }
  
  /**
   * Oculta el formulario de emoji
   */
  function hideForm() {
    const formCard = document.getElementById('form-card');
    if (!formCard) return;
    
    formCard.style.display = 'none';
    clearForm();
  }
  
  /**
   * Limpia el formulario de emoji
   */
  function clearForm() {
    const form = document.getElementById('emoji-form');
    const preview = document.getElementById('emoji-preview');
    
    if (form) form.reset();
    if (preview) preview.textContent = '📍';
    
    // Eliminar marcadores del mapa
    if (mapModule && mapModule.clearMarkers) {
      mapModule.clearMarkers();
    }
  }
  
  /**
   * Guarda un emoji en el servidor
   * @param {Event} e - Evento del formulario
   */
  function saveEmoji(e) {
    e.preventDefault();
    
    // Validar formulario
    const startLat = document.getElementById('emoji-start-lat')?.value;
    const startLng = document.getElementById('emoji-start-lng')?.value;
    const endLat = document.getElementById('emoji-end-lat')?.value;
    const endLng = document.getElementById('emoji-end-lng')?.value;
    
    if (!startLat || !startLng) {
      utilsModule.showMessage('Por favor, seleccione la posición inicial del emoji en el mapa', 'danger');
      return;
    }
    
    if (!endLat || !endLng) {
      utilsModule.showMessage('Por favor, seleccione la posición final del emoji en el mapa', 'danger');
      return;
    }
    
    // Mostrar mensaje de carga
    utilsModule.showMessage('Guardando emoji...', 'info');
    
    // Crear FormData para enviar al servidor
    const formData = new FormData();
    formData.append('id', document.getElementById('emoji-id')?.value || '');
    formData.append('emoji', document.getElementById('emoji-symbol')?.value || '📍');
    formData.append('titulo', document.getElementById('emoji-title')?.value || '');
    formData.append('lat_inicial', startLat);
    formData.append('lng_inicial', startLng);
    formData.append('lat_final', endLat);
    formData.append('lng_final', endLng);
    formData.append('velocidad', document.getElementById('emoji-speed')?.value || '50');
    formData.append('mostrar_popup', document.getElementById('emoji-popup')?.value || '0');
    formData.append('descripcion', document.getElementById('emoji-description')?.value || '');
    formData.append('activo', document.getElementById('emoji-active')?.value || '1');
    
    // Enviar datos al servidor
    fetch('guardar_icono.php', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al guardar el emoji: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        utilsModule.showMessage('Emoji guardado correctamente', 'success');
        hideForm();
        loadEmojis();
      } else {
        utilsModule.showMessage('Error al guardar: ' + (data.error || 'Verifique los datos e intente nuevamente'), 'danger');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      utilsModule.showMessage('Error al guardar el emoji. Por favor, intente nuevamente.', 'danger');
    });
  }
  
  /**
   * Edita un emoji existente
   * @param {number} id - ID del emoji a editar
   */
  function editEmoji(id) {
    const emoji = appState.emojisList.find(e => e.id == id);
    if (!emoji) return;
    
    const formElements = {
      title: document.getElementById('form-title'),
      id: document.getElementById('emoji-id'),
      symbol: document.getElementById('emoji-symbol'),
      preview: document.getElementById('emoji-preview'),
      emojiTitle: document.getElementById('emoji-title'),
      startLat: document.getElementById('emoji-start-lat'),
      startLng: document.getElementById('emoji-start-lng'),
      endLat: document.getElementById('emoji-end-lat'),
      endLng: document.getElementById('emoji-end-lng'),
      speed: document.getElementById('emoji-speed'),
      popup: document.getElementById('emoji-popup'),
      description: document.getElementById('emoji-description'),
      active: document.getElementById('emoji-active'),
      formCard: document.getElementById('form-card')
    };
    
    // Verificar que todos los elementos necesarios existan
    for (const key in formElements) {
      if (!formElements[key]) {
        console.error(`Elemento ${key} no encontrado en el DOM`);
        return;
      }
    }
    
    formElements.title.textContent = 'Editar Emoji';
    formElements.id.value = emoji.id;
    formElements.symbol.value = emoji.emoji;
    formElements.preview.textContent = emoji.emoji;
    formElements.emojiTitle.value = emoji.titulo || '';
    formElements.startLat.value = emoji.lat_inicial;
    formElements.startLng.value = emoji.lng_inicial;
    formElements.endLat.value = emoji.lat_final;
    formElements.endLng.value = emoji.lng_final;
    formElements.speed.value = emoji.velocidad;
    formElements.popup.value = emoji.mostrar_popup || '0';
    formElements.description.value = emoji.descripcion || '';
    formElements.active.value = emoji.activo;
    
    // Actualizar marcadores en el mapa
    if (mapModule && mapModule.setStartPosition && mapModule.setEndPosition) {
      mapModule.setStartPosition(parseFloat(emoji.lat_inicial), parseFloat(emoji.lng_inicial));
      mapModule.setEndPosition(parseFloat(emoji.lat_final), parseFloat(emoji.lng_final));
    }
    
    // Mostrar el formulario
    formElements.formCard.style.display = 'block';
    formElements.formCard.scrollIntoView({ behavior: 'smooth' });
  }
  
  /**
   * Elimina un emoji
   * @param {number} id - ID del emoji a eliminar
   */
  function deleteEmoji(id) {
    if (!confirm('¿Está seguro de que desea eliminar este emoji? Esta acción no se puede deshacer.')) {
      return;
    }
    
    fetch(`eliminar_icono.php?id=${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Error al eliminar el emoji');
        return response.json();
      })
      .then(data => {
        if (data.success) {
          utilsModule.showMessage('Emoji eliminado correctamente', 'success');
          loadEmojis();
          
          // Recargar relaciones si existen
          if (window.RelationsModule && RelationsModule.loadRelations) {
            RelationsModule.loadRelations();
          }
        } else {
          utilsModule.showMessage('Error al eliminar: ' + (data.error || 'Intente nuevamente'), 'danger');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        utilsModule.showMessage('Error al eliminar el emoji', 'danger');
      });
  }
  
  /**
   * Obtiene las relaciones para un emoji
   * @param {number} emojiId - ID del emoji
   * @returns {Array} - Lista de relaciones
   */
  function getRelationshipsForEmoji(emojiId) {
    if (!appState.relationsList) return [];
    
    return appState.relationsList.filter(rel => 
      rel.emoji_origen_id == emojiId || rel.emoji_destino_id == emojiId
    );
  }
  
   // API pública
  return {
    init: init,
    loadEmojis: loadEmojis,
    showForm: showForm, // Asegúrate de que esta línea esté presente
    hideForm: hideForm,
    saveEmoji: saveEmoji,
    editEmoji: editEmoji,
    deleteEmoji: deleteEmoji,
    getRelationshipsForEmoji: getRelationshipsForEmoji
  };
})();