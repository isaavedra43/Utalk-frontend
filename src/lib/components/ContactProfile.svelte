<!-- 
 * Componente de Perfil de Contacto
 * Basado en info/3.md sección "👤 Endpoints de Contactos"
 * 
 * Características:
 * - Muestra información completa del contacto
 * - Edición condicional según permisos
 * - Manejo de contactos duplicados
 * - Integración con API real
 -->

<script lang="ts">
  import { api } from '$lib/services/axios';
  import { authStore } from '$lib/stores/auth.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { createEventDispatcher } from 'svelte';

  export let contactId: string;

  const dispatch = createEventDispatcher();

  // Estados del componente
  let contact: any = null;
  let loading = true;
  let error = '';
  let editing = false;
  let saving = false;

  // Formulario de edición
  let editForm = {
    name: '',
    email: '',
    company: '',
    notes: '',
    tags: [] as string[]
  };

  // Verificar permisos de edición - Documento: info/1.md sección "Reglas de Autorización"
  $: canEdit = authStore.canEditContacts();

  // Cargar datos del contacto
  async function loadContact() {
    try {
      loading = true;
      error = '';

      const response = await api.get(`/contacts/${contactId}`);
      contact = response.data.data;

      // Inicializar formulario de edición
      editForm = {
        name: contact.name || '',
        email: contact.email || '',
        company: contact.company || '',
        notes: contact.notes || '',
        tags: contact.tags || []
      };
    } catch (err: any) {
      error = err.response?.data?.message || 'Error al cargar contacto';
      notificationsStore.error(error);
    } finally {
      loading = false;
    }
  }

  // Iniciar edición
  function startEditing() {
    if (!canEdit) {
      notificationsStore.error('No tienes permisos para editar contactos');
      return;
    }
    editing = true;
  }

  // Cancelar edición
  function cancelEditing() {
    editing = false;
    // Restaurar valores originales
    editForm = {
      name: contact.name || '',
      email: contact.email || '',
      company: contact.company || '',
      notes: contact.notes || '',
      tags: contact.tags || []
    };
  }

  // Guardar cambios
  async function saveContact() {
    try {
      saving = true;

      const response = await api.put(`/contacts/${contactId}`, editForm);
      contact = response.data.data;

      editing = false;
      notificationsStore.success('Contacto actualizado correctamente');
      dispatch('contactUpdated', contact);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar contacto';
      notificationsStore.error(errorMessage);
    } finally {
      saving = false;
    }
  }

  // Agregar tag
  function addTag(tag: string) {
    if (tag.trim() && !editForm.tags.includes(tag.trim())) {
      editForm.tags = [...editForm.tags, tag.trim()];
    }
  }

  // Remover tag
  function removeTag(tag: string) {
    editForm.tags = editForm.tags.filter(t => t !== tag);
  }

  // Formatear fecha
  function formatDate(dateString: string): string {
    if (!dateString) return 'No disponible';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  // Verificar si es contacto duplicado - Documento: info/1.md sección "Detección de Contactos Duplicados"
  function isDuplicate(): boolean {
    return contact?.metadata?.duplicateCount > 1;
  }

  // Cargar contacto al montar el componente
  loadContact();
</script>

<div class="contact-profile">
  {#if loading}
    <div class="loading-state">
      <div class="loading-spinner">⏳</div>
      <p>Cargando perfil del contacto...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{error}</p>
      <button type="button" class="retry-button" on:click={loadContact}>Reintentar</button>
    </div>
  {:else if contact}
    <div class="contact-header">
      <div class="contact-avatar">
        {#if contact.avatar}
          <img src={contact.avatar} alt={contact.name || 'Avatar'} class="avatar-image" />
        {:else}
          <div class="avatar-placeholder">
            {(contact.name || contact.phone).charAt(0).toUpperCase()}
          </div>
        {/if}
      </div>

      <div class="contact-info">
        <h2 class="contact-name">
          {contact.name || 'Sin nombre'}
          {#if isDuplicate()}
            <span class="duplicate-badge" title="Contacto duplicado">🔄</span>
          {/if}
        </h2>
        <p class="contact-phone">{contact.phone}</p>
        {#if contact.email}
          <p class="contact-email">{contact.email}</p>
        {/if}
      </div>

      {#if canEdit}
        <div class="contact-actions">
          <button type="button" class="edit-button" on:click={startEditing} disabled={editing}>
            {editing ? 'Editando...' : '✏️ Editar'}
          </button>
        </div>
      {/if}
    </div>

    {#if editing}
      <!-- Formulario de edición -->
      <div class="edit-form">
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input
            id="name"
            type="text"
            bind:value={editForm.name}
            placeholder="Nombre del contacto"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input
            id="email"
            type="email"
            bind:value={editForm.email}
            placeholder="email@ejemplo.com"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="company">Empresa:</label>
          <input
            id="company"
            type="text"
            bind:value={editForm.company}
            placeholder="Nombre de la empresa"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="notes">Notas:</label>
          <textarea
            id="notes"
            bind:value={editForm.notes}
            placeholder="Notas sobre el contacto"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="tags">Etiquetas:</label>
          <div class="tags-container">
            {#each editForm.tags as tag}
              <span class="tag">
                {tag}
                <button type="button" class="tag-remove" on:click={() => removeTag(tag)}>×</button>
              </span>
            {/each}
            <input
              type="text"
              placeholder="Agregar etiqueta..."
              class="tag-input"
              on:keydown={e => {
                if (e.key === 'Enter') {
                  addTag(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="save-button" on:click={saveContact} disabled={saving}>
            {saving ? 'Guardando...' : '💾 Guardar'}
          </button>
          <button type="button" class="cancel-button" on:click={cancelEditing} disabled={saving}>
            ❌ Cancelar
          </button>
        </div>
      </div>
    {:else}
      <!-- Información de solo lectura -->
      <div class="contact-details">
        {#if contact.company}
          <div class="detail-item">
            <span class="detail-label">Empresa:</span>
            <span class="detail-value">{contact.company}</span>
          </div>
        {/if}

        {#if contact.notes}
          <div class="detail-item">
            <span class="detail-label">Notas:</span>
            <span class="detail-value">{contact.notes}</span>
          </div>
        {/if}

        {#if contact.tags && contact.tags.length > 0}
          <div class="detail-item">
            <span class="detail-label">Etiquetas:</span>
            <div class="tags-display">
              {#each contact.tags as tag}
                <span class="tag-display">{tag}</span>
              {/each}
            </div>
          </div>
        {/if}

        <div class="detail-item">
          <span class="detail-label">Canal:</span>
          <span class="detail-value">{contact.channel}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Estado:</span>
          <span class="detail-value" class:active={contact.isActive}>
            {contact.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {#if contact.metadata}
          <div class="detail-item">
            <span class="detail-label">Último contacto:</span>
            <span class="detail-value">{formatDate(contact.metadata.lastContact)}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Total conversaciones:</span>
            <span class="detail-value">{contact.metadata.totalConversations || 0}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Total mensajes:</span>
            <span class="detail-value">{contact.metadata.totalMessages || 0}</span>
          </div>
        {/if}

        <div class="detail-item">
          <span class="detail-label">Creado:</span>
          <span class="detail-value">{formatDate(contact.createdAt)}</span>
        </div>

        <div class="detail-item">
          <span class="detail-label">Actualizado:</span>
          <span class="detail-value">{formatDate(contact.updatedAt)}</span>
        </div>
      </div>
    {/if}
  {:else}
    <div class="empty-state">
      <span class="empty-icon">👤</span>
      <p>No se encontró información del contacto</p>
    </div>
  {/if}
</div>

<style>
  .contact-profile {
    padding: 1rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
    font-size: 2rem;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .error-icon {
    font-size: 2rem;
  }

  .retry-button {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .contact-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .contact-avatar {
    flex-shrink: 0;
  }

  .avatar-image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #3b82f6;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .contact-info {
    flex: 1;
  }

  .contact-name {
    margin: 0 0 0.25rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .duplicate-badge {
    font-size: 0.875rem;
    color: #f59e0b;
  }

  .contact-phone,
  .contact-email {
    margin: 0.25rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .contact-actions {
    flex-shrink: 0;
  }

  .edit-button {
    padding: 0.5rem 1rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .edit-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .edit-form {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    font-weight: 500;
    color: #374151;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .tag {
    background: #e0f2fe;
    color: #0277bd;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .tag-remove {
    background: none;
    border: none;
    color: #0277bd;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .tag-input {
    border: 1px dashed #d1d5db;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    min-width: 120px;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .save-button,
  .cancel-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .save-button {
    background: #10b981;
    color: white;
  }

  .cancel-button {
    background: #ef4444;
    color: white;
  }

  .contact-details {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .detail-item {
    display: flex;
    margin-bottom: 0.75rem;
    gap: 0.5rem;
  }

  .detail-label {
    font-weight: 500;
    color: #374151;
    min-width: 120px;
    flex-shrink: 0;
  }

  .detail-value {
    color: #6b7280;
  }

  .detail-value.active {
    color: #10b981;
  }

  .tags-display {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tag-display {
    background: #f3f4f6;
    color: #374151;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .empty-icon {
    font-size: 3rem;
  }
</style>
