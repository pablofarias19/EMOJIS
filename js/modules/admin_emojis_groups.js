/**
 * Módulo para la gestión de grupos de vinculación
 */
const GroupsModule = (function() {
  // Variables privadas
  let appState;
  let utilsModule;
  
  /**
   * Inicializa el módulo
   * @param {Object} state - Estado compartido de la aplicación
   * @param {Object} utils - Módulo de utilidades
   */
  function init(state, utils) {
    appState = state;
    utilsModule = utils;
  }
  
  /**
   * Carga los grupos desde el servidor
   */
  function loadGroups() {
    fetch('get_grupos_emoji.php')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar grupos');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          appState.groupsList = data.grupos || [];
          renderGroupsList();
          updateGroupsSelectors();
        } else {
          utilsModule.showMessage('Error al cargar grupos: ' + data.error, 'danger');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        utilsModule.showMessage('No se pudieron cargar los grupos de emojis', 'danger');
      });
  }
  
  /**
   * Renderiza la lista de grupos
   */
  function renderGroupsList() {
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    
    if (appState.groupsList.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No hay grupos creados. Cree un nuevo grupo usando el formulario.</p>';
      return;
    }
    
    appState.groupsList.forEach(group => {
      // Contar relaciones para este grupo
      const relCount = countRelationsByGroup(group.id);
      
      const groupElement = document.createElement('div');
      groupElement.className = 'group-item';
      groupElement.style.borderLeftColor = group.color || '#4285F4';
      
      groupElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-1">${group.nombre}</h5>
          <div>
            <button class="btn btn-sm btn-outline-primary me-1 edit-group-btn" data-id="${group.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-group-btn" data-id="${group.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <p class="mb-1"><strong>Criterio:</strong> ${group.criterio}</p>
        <p class="mb-1">${group.descripcion || 'Sin descripción'}</p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <span class="badge badge-group">
            <i class="bi bi-diagram-3"></i> ${relCount} vinculaciones
          </span>
          <small class="text-muted">ID: ${group.id}</small>
        </div>
      `;
      
      // Agregar eventos a los botones
      const editBtn = groupElement.querySelector('.edit-group-btn');
      const deleteBtn = groupElement.querySelector('.delete-group-btn');
      
      editBtn.addEventListener('click', () => editGroup(group.id));
      deleteBtn.addEventListener('click', () => deleteGroup(group.id));
      
      container.appendChild(groupElement);
    });
  }
  
  /**
   * Actualiza los selectores de grupos en la interfaz
   */
  function updateGroupsSelectors() {
    const relationGroupSelect = document.getElementById('relation-group');
    const filterRelationsGroup = document.getElementById('filter-relations-group');
    
    if (relationGroupSelect) {
      // Guardar valor seleccionado actual
      const currentValue = relationGroupSelect.value;
      
      // Limpiar opciones existentes excepto la primera
      while (relationGroupSelect.options.length > 1) {
        relationGroupSelect.remove(1);
      }
      
      // Agregar nuevas opciones
      appState.groupsList.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.nombre;
        relationGroupSelect.appendChild(option);
      });
      
      // Restaurar valor seleccionado si aún existe
      if (currentValue) {
        relationGroupSelect.value = currentValue;
      }
    }
    
    if (filterRelationsGroup) {
      // Guardar valor seleccionado actual
      const currentValue = filterRelationsGroup.value;
      
      // Limpiar opciones existentes excepto la primera
      while (filterRelationsGroup.options.length > 1) {
        filterRelationsGroup.remove(1);
      }
      
      // Agregar nuevas opciones
      appState.groupsList.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.nombre;
        filterRelationsGroup.appendChild(option);
      });
      
      // Restaurar valor seleccionado si aún existe
      if (currentValue) {
        filterRelationsGroup.value = currentValue;
      }
    }
  }
  
  /**
   * Cuenta las relaciones para un grupo específico
   * @param {number} groupId - ID del grupo
   * @returns {number} - Cantidad de relaciones
   */
  function countRelationsByGroup(groupId) {
    if (!appState.relationsList) return 0;
    
    return appState.relationsList.filter(rel => rel.id_grupo == groupId).length;
  }
  
  /**
   * Maneja el envío del formulario de grupo
   * @param {Event} event - Evento de envío del formulario
   */
  function handleGroupFormSubmit(event) {
    event.preventDefault();
    
    const groupId = document.getElementById('group-id').value;
    const groupName = document.getElementById('group-name').value;
    const groupCriteria = document.getElementById('group-criteria').value;
    const groupDescription = document.getElementById('group-description').value;
    const groupColor = document.getElementById('group-color').value;
    
    if (!groupName || !groupCriteria) {
      utilsModule.showMessage('Debe ingresar un nombre y un criterio para el grupo', 'warning');
      return;
    }
    
    const groupData = {
      id: groupId || null,
      nombre: groupName,
      criterio: groupCriteria,
      descripcion: groupDescription,
      color: groupColor
    };
    
    if (groupId) {
      // Actualizar grupo existente
      updateGroup(groupData);
    } else {
      // Crear nuevo grupo
      createGroup(groupData);
    }
  }
  
  /**
   * Crea un nuevo grupo
   * @param {Object} groupData - Datos del grupo
   */
/**
 * Crea un nuevo grupo
 * @param {Object} groupData - Datos del grupo
 */
function createGroup(groupData) {
  // Usar FormData en lugar de JSON
  const formData = new FormData();
  formData.append('nombre', groupData.nombre);
  formData.append('criterio', groupData.criterio);
  formData.append('descripcion', groupData.descripcion || '');
  formData.append('color', groupData.color || '#4285F4');
  
  fetch('guardar_grupo_emoji.php', {  // Archivo correcto
    method: 'POST',
    body: formData  // Usar FormData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      utilsModule.showMessage('Grupo creado exitosamente', 'success');
      resetGroupForm();
      loadGroups();
    } else {
      utilsModule.showMessage('Error al crear grupo: ' + (data.error || 'Error desconocido'), 'danger');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    utilsModule.showMessage('No se pudo crear el grupo. Intente nuevamente.', 'danger');
  });
}

/**
 * Actualiza un grupo existente
 * @param {Object} groupData - Datos del grupo
 */
function updateGroup(groupData) {
  // Usar FormData en lugar de JSON
  const formData = new FormData();
  formData.append('id', groupData.id);  // Importante incluir el ID
  formData.append('nombre', groupData.nombre);
  formData.append('criterio', groupData.criterio);
  formData.append('descripcion', groupData.descripcion || '');
  formData.append('color', groupData.color || '#4285F4');
  
  fetch('guardar_grupo_emoji.php', {  // Usar el mismo archivo para crear/actualizar
    method: 'POST',
    body: formData  // Usar FormData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      utilsModule.showMessage('Grupo actualizado exitosamente', 'success');
      resetGroupForm();
      loadGroups();
    } else {
      utilsModule.showMessage('Error al actualizar grupo: ' + (data.error || 'Error desconocido'), 'danger');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    utilsModule.showMessage('No se pudo actualizar el grupo. Intente nuevamente.', 'danger');
  });
}
  
  /**
   * Elimina un grupo
   * @param {number} groupId - ID del grupo a eliminar
   */
  function deleteGroup(groupId) {
    if (!confirm('¿Está seguro de eliminar este grupo? Se eliminarán todas sus relaciones.')) {
      return;
    }
    
    fetch('delete_grupo_emoji.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: groupId })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        utilsModule.showMessage('Grupo eliminado exitosamente', 'success');
        loadGroups();
      } else {
        utilsModule.showMessage('Error al eliminar grupo: ' + data.error, 'danger');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      utilsModule.showMessage('No se pudo eliminar el grupo. Intente nuevamente.', 'danger');
    });
  }
  
  /**
   * Carga un grupo para edición
   * @param {number} groupId - ID del grupo a editar
   */
  function editGroup(groupId) {
    const group = appState.groupsList.find(g => g.id == groupId);
    if (!group) {
      utilsModule.showMessage('No se encontró el grupo para editar', 'danger');
      return;
    }
    
    document.getElementById('group-id').value = group.id;
    document.getElementById('group-name').value = group.nombre;
    document.getElementById('group-criteria').value = group.criterio;
    document.getElementById('group-description').value = group.descripcion || '';
    document.getElementById('group-color').value = group.color || '#4285F4';
    
    document.getElementById('group-form-title').textContent = 'Editar Grupo';
  }
  
  /**
   * Reinicia el formulario de grupo
   */
  function resetGroupForm() {
    document.getElementById('group-form').reset();
    document.getElementById('group-id').value = '';
    document.getElementById('group-form-title').textContent = 'Crear Nuevo Grupo';
  }
  
  /**
   * Configura los eventos del módulo
   */
  function setupEvents() {
    const groupForm = document.getElementById('group-form');
    const groupResetBtn = document.getElementById('group-reset-btn');
    
    if (groupForm) {
      groupForm.addEventListener('submit', handleGroupFormSubmit);
    }
    
    if (groupResetBtn) {
      groupResetBtn.addEventListener('click', resetGroupForm);
    }
  }
  
 // API pública
return {
  init: function(state, utils) {
    init(state, utils);
    setupEvents();
    loadGroups();
  },
  getGroups: function() {
    return appState.groupsList || [];
  },
  loadGroups: loadGroups,
  updateGroupsSelectors: updateGroupsSelectors,
  saveGroup: handleGroupFormSubmit,       // <-- Añadir esto
  resetGroupForm: resetGroupForm,         // <-- Añadir esto
  editGroup: editGroup,                   // <-- Añadir esto
  deleteGroup: deleteGroup,               // <-- Añadir esto
  countRelationsByGroup: countRelationsByGroup  // <-- Opcional pero útil
};
})();