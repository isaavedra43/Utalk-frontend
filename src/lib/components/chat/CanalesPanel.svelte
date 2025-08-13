<!-- 
 * Componente CanalesPanel para UTalk Frontend
 * Panel de filtros y categorías de conversaciones
 * Integrado con conversationsStore
 -->

<script lang="ts">
  import { authStore } from '$lib/stores/auth.store';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // Estados del componente
  let searchQuery = '';
  let selectedCategory = 'all';
  let currentUser: any = null;

  // Categorías con filtros
  const categories = [
    {
      id: 'all',
      label: 'Todos',
      icon: '📋',
      filter: {},
      badge: 0
    },
    {
      id: 'assigned',
      label: 'Asignados a ti',
      icon: '👤',
      filter: { assignedTo: 'current' },
      badge: 0
    },
    {
      id: 'unanswered',
      label: 'Sin contestar',
      icon: '⏰',
      filter: { status: 'open', unreadCount: { $gt: 0 } },
      badge: 0
    },
    {
      id: 'open',
      label: 'Abiertos',
      icon: '📁',
      filter: { status: 'open' },
      badge: 0
    }
  ];

  // Obtener usuario actual
  authStore.subscribe(state => {
    if (state.user) {
      currentUser = state.user;
    }
  });

  // Calcular badges basado en conversaciones reales
  $: if ($conversationsStore.conversations.length > 0) {
    const conversations = $conversationsStore.conversations;

    // Actualizar badges dinámicamente
    categories[0].badge = conversations.length; // Todos

    categories[1].badge = conversations.filter(c => c.assignedTo?.id === currentUser?.id).length; // Asignados a ti

    categories[2].badge = conversations.filter(
      c => c.status === 'open' && c.unreadCount > 0
    ).length; // Sin contestar

    categories[3].badge = conversations.filter(c => c.status === 'open').length; // Abiertos
  }

  // Manejar búsqueda
  function handleSearch() {
    dispatch('search', { query: searchQuery });
  }

  // Manejar selección de categoría
  function selectCategory(categoryId: string) {
    selectedCategory = categoryId;
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      dispatch('filter', {
        category: categoryId,
        filter: category.filter
      });
    }
  }

  // Limpiar búsqueda
  function clearSearch() {
    searchQuery = '';
    dispatch('search', { query: '' });
  }
</script>

<div class="canales-panel">
  <!-- Header -->
  <div class="panel-header">
    <h2 class="panel-title">Canales</h2>
  </div>

  <!-- Contenido -->
  <div class="canales-content">
    <!-- Búsqueda -->
    <div class="search-section">
      <div class="search-input">
        <input type="text" placeholder="Filtrar" bind:value={searchQuery} on:input={handleSearch} />
        {#if searchQuery}
          <button
            type="button"
            class="clear-search"
            on:click={clearSearch}
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        {/if}
      </div>
    </div>

    <!-- Categorías -->
    <div class="categories-section">
      <div class="categories-list">
        {#each categories as category}
          <button
            type="button"
            class="category-item"
            class:active={selectedCategory === category.id}
            on:click={() => selectCategory(category.id)}
            on:keydown={e => e.key === 'Enter' && selectCategory(category.id)}
            aria-label="Seleccionar categoría {category.label}"
          >
            <span class="category-icon">{category.icon}</span>
            <span class="category-label">{category.label}</span>
            {#if category.badge > 0}
              <span class="category-badge">
                {category.badge > 9 ? '9+' : category.badge}
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <!-- Footer con total -->
    <div class="canales-footer">
      <div class="total-info">
        <span class="total-label">Total conversaciones</span>
        <span class="total-count">{$conversationsStore.conversations.length}</span>
      </div>
      {#if $conversationsStore.conversations.some(c => c.unreadCount > 0)}
        <div class="unread-info">
          <span class="unread-label">Sin leer</span>
          <span class="unread-count">
            {$conversationsStore.conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
          </span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .canales-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f8f9fa;
  }

  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .panel-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
  }

  .canales-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .search-section {
    margin-bottom: 0.5rem;
  }

  .search-input {
    position: relative;
  }

  .search-input input {
    width: 100%;
    padding: 0.5rem;
    padding-right: 2rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    transition: border-color 0.2s;
  }

  .search-input input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  .clear-search {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 3px;
    font-size: 0.75rem;
  }

  .clear-search:hover {
    background: #e9ecef;
  }

  .categories-section {
    flex: 1;
  }

  .categories-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .category-item:hover {
    background: #e9ecef;
  }

  .category-item.active {
    background: #dbeafe;
    border-color: #2563eb;
    color: #2563eb;
  }

  .category-icon {
    font-size: 1rem;
    width: 1.5rem;
    text-align: center;
  }

  .category-label {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .category-badge {
    background: #dc3545;
    color: white;
    font-size: 0.75rem;
    padding: 0.125rem 0.375rem;
    border-radius: 10px;
    font-weight: bold;
    min-width: 1.5rem;
    text-align: center;
  }

  .category-item.active .category-badge {
    background: #2563eb;
  }

  .canales-footer {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
    margin-top: auto;
  }

  .total-info,
  .unread-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .total-label,
  .unread-label {
    font-size: 0.75rem;
    color: #6c757d;
  }

  .total-count,
  .unread-count {
    font-size: 0.875rem;
    font-weight: 600;
    color: #212529;
  }

  .unread-count {
    color: #dc3545;
  }
</style>
