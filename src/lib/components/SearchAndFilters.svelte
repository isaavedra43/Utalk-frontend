<!-- 
 * Componente de Búsqueda y Filtros
 * Basado en info/3.md sección "Query Parameters"
 * 
 * Características:
 * - Búsqueda por nombre/contacto
 * - Filtros por estado, canal, tipo
 * - Integración con stores de conversaciones y mensajes
 * - UI responsive y accesible
 -->

<script lang="ts">
  import { api } from '$lib/services/axios';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { messagesStore } from '$lib/stores/messages.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { createEventDispatcher } from 'svelte';

  export let conversationId: string | null = null;
  export let searchType: 'conversations' | 'messages' = 'conversations';

  const dispatch = createEventDispatcher();

  // Estados del componente
  let searchQuery = '';
  let selectedStatus = 'all';
  let selectedType = 'all';
  let selectedChannel = 'all';
  let loading = false;
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Opciones de filtros - Documento: info/3.md sección "Query Parameters"
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'open', label: 'Abiertas' },
    { value: 'closed', label: 'Cerradas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'resolved', label: 'Resueltas' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'text', label: 'Texto' },
    { value: 'image', label: 'Imagen' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Documento' }
  ];

  const channelOptions = [
    { value: 'all', label: 'Todos los canales' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'messenger', label: 'Messenger' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Teléfono' }
  ];

  // Función de búsqueda con debounce - Documento: info/1.md sección "Rate Limiting"
  function handleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch();
    }, 500);
  }

  // Realizar búsqueda según el tipo
  async function performSearch() {
    if (
      !searchQuery.trim() &&
      selectedStatus === 'all' &&
      selectedType === 'all' &&
      selectedChannel === 'all'
    ) {
      // Si no hay filtros, cargar todo
      if (searchType === 'conversations') {
        await conversationsStore.loadConversations();
      } else if (conversationId) {
        await messagesStore.loadMessages(conversationId);
      }
      return;
    }

    loading = true;

    try {
      if (searchType === 'conversations') {
        await searchConversations();
      } else {
        await searchMessages();
      }
    } catch (error: any) {
      notificationsStore.error('Error al realizar búsqueda');
    } finally {
      loading = false;
    }
  }

  // Búsqueda de conversaciones - Documento: info/3.md sección "GET /api/conversations"
  async function searchConversations() {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    if (selectedStatus !== 'all') {
      params.append('status', selectedStatus);
    }

    if (selectedChannel !== 'all') {
      params.append('channel', selectedChannel);
    }

    const response = await api.get(`/conversations?${params.toString()}`);

    // Actualizar store de conversaciones
    conversationsStore.setConversations(response.data.data || []);

    // Emitir evento de búsqueda completada
    dispatch('searchCompleted', {
      type: 'conversations',
      results: response.data.data?.length || 0,
      query: searchQuery,
      filters: { status: selectedStatus, channel: selectedChannel }
    });
  }

  // Búsqueda de mensajes - Documento: info/3.md sección "GET /api/conversations/:conversationId/messages"
  async function searchMessages() {
    if (!conversationId) return;

    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    if (selectedType !== 'all') {
      params.append('type', selectedType);
    }

    const response = await api.get(
      `/conversations/${conversationId}/messages?${params.toString()}`
    );

    // Actualizar store de mensajes
    messagesStore.setMessages(response.data.data || []);

    // Emitir evento de búsqueda completada
    dispatch('searchCompleted', {
      type: 'messages',
      results: response.data.data?.length || 0,
      query: searchQuery,
      filters: { type: selectedType }
    });
  }

  // Limpiar filtros
  function clearFilters() {
    searchQuery = '';
    selectedStatus = 'all';
    selectedType = 'all';
    selectedChannel = 'all';

    // Recargar datos sin filtros
    if (searchType === 'conversations') {
      conversationsStore.loadConversations();
    } else if (conversationId) {
      messagesStore.loadMessages(conversationId);
    }

    dispatch('filtersCleared');
  }

  // Manejar cambio de filtros
  function handleFilterChange() {
    performSearch();
  }
</script>

<div class="search-filters-container">
  <!-- Barra de búsqueda -->
  <div class="search-bar">
    <div class="search-input-wrapper">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        bind:value={searchQuery}
        on:input={handleSearch}
        placeholder={searchType === 'conversations'
          ? 'Buscar conversaciones...'
          : 'Buscar mensajes...'}
        class="search-input"
        disabled={loading}
      />
      {#if loading}
        <span class="loading-spinner">⏳</span>
      {/if}
    </div>

    <button type="button" class="clear-filters" on:click={clearFilters}> 🗑️ Limpiar </button>
  </div>

  <!-- Filtros -->
  <div class="filters-section">
    {#if searchType === 'conversations'}
      <!-- Filtros para conversaciones -->
      <div class="filter-group">
        <label for="status-filter">Estado:</label>
        <select
          id="status-filter"
          bind:value={selectedStatus}
          on:change={handleFilterChange}
          disabled={loading}
          class="filter-select"
        >
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div class="filter-group">
        <label for="channel-filter">Canal:</label>
        <select
          id="channel-filter"
          bind:value={selectedChannel}
          on:change={handleFilterChange}
          disabled={loading}
          class="filter-select"
        >
          {#each channelOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    {:else}
      <!-- Filtros para mensajes -->
      <div class="filter-group">
        <label for="type-filter">Tipo:</label>
        <select
          id="type-filter"
          bind:value={selectedType}
          on:change={handleFilterChange}
          disabled={loading}
          class="filter-select"
        >
          {#each typeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>

  <!-- Información de resultados -->
  {#if searchQuery || selectedStatus !== 'all' || selectedType !== 'all' || selectedChannel !== 'all'}
    <div class="search-info">
      <span class="search-summary">
        {#if searchQuery}
          Buscando "{searchQuery}"
        {/if}
        {#if selectedStatus !== 'all'}
          • Estado: {statusOptions.find(s => s.value === selectedStatus)?.label}
        {/if}
        {#if selectedType !== 'all'}
          • Tipo: {typeOptions.find(t => t.value === selectedType)?.label}
        {/if}
        {#if selectedChannel !== 'all'}
          • Canal: {channelOptions.find(c => c.value === selectedChannel)?.label}
        {/if}
      </span>
    </div>
  {/if}
</div>

<style>
  .search-filters-container {
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .search-input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 0.75rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    background: white;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .loading-spinner {
    position: absolute;
    right: 0.75rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .clear-button {
    padding: 0.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .clear-button:hover:not(:disabled) {
    background: #dc2626;
  }

  .clear-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .filters-section {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .filter-group label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #374151;
  }

  .filter-select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    background: white;
  }

  .filter-select:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .search-info {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: #e0f2fe;
    border: 1px solid #b3e5fc;
    border-radius: 0.25rem;
  }

  .search-summary {
    font-size: 0.875rem;
    color: #0277bd;
  }
</style>
