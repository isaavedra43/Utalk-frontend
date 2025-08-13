<!--
 * AgentCard - Componente para mostrar información de un agente
 * Incluye avatar, nombre, rol, permisos, métricas y estados de selección
 -->

<script lang="ts">
  import type { Agent } from '$lib/types/team';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // Props del componente
  export let agent: Agent;
  export let selected: boolean = false;

  // Estado local
  let showMenu = false;

  // Manejar click en la card
  function handleSelect() {
    dispatch('select', { agentId: agent.id });
  }

  // Manejar acciones del menú
  function handleAction(event: CustomEvent) {
    dispatch('action', { agentId: agent.id, action: event.detail });
  }

  // Obtener texto de estado
  function getStatusText(status: string): string {
    return status === 'active' ? 'Activo' : 'Inactivo';
  }
</script>

<div
  class="agent-card {selected ? 'selected' : ''}"
  on:click={handleSelect}
  role="button"
  tabindex="0"
  on:keydown={e => e.key === 'Enter' && handleSelect()}
>
  <!-- Header del agente -->
  <div class="agent-header">
    <div class="agent-avatar">
      {#if agent.avatar}
        <img src={agent.avatar} alt={agent.name} class="avatar-image" />
      {:else}
        <span class="avatar-initials">{agent.initials}</span>
      {/if}
    </div>

    <div class="agent-info">
      <h3 class="agent-name" title={agent.name}>{agent.name}</h3>
      <p class="agent-role" title={agent.role}>{agent.role}</p>
      <span class="agent-status {agent.status}">
        {getStatusText(agent.status)}
      </span>
    </div>

    <!-- Dropdown menu -->
    <div class="agent-menu" on:click|stopPropagation>
      <button
        type="button"
        class="agent-menu-button"
        on:click={() => dispatch('menu', { agentId: agent.id })}
        aria-label="Menú de opciones"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {#if showMenu}
        <div class="agent-menu-dropdown">
          <button
            type="button"
            class="menu-item"
            on:click={() => handleAction(new CustomEvent('action', { detail: 'view' }))}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Ver Detalles
          </button>

          <button
            type="button"
            class="menu-item"
            on:click={() => handleAction(new CustomEvent('action', { detail: 'edit' }))}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Editar
          </button>

          <button
            type="button"
            class="menu-item"
            on:click={() => handleAction(new CustomEvent('action', { detail: 'reassign' }))}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            Reasignar
          </button>

          <hr class="menu-divider" />

          <button
            type="button"
            class="menu-item destructive"
            on:click={() => handleAction(new CustomEvent('action', { detail: 'deactivate' }))}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              />
            </svg>
            Desactivar
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Sección PERMISOS (obligatoria) -->
  <div class="agent-permissions">
    <label class="permissions-label">PERMISOS</label>
    <div class="permissions-badges">
      <button
        type="button"
        class="permission-toggle"
        on:click={() => dispatch('permission', { agentId: agent.id, permission: 'read' })}
        aria-label="Cambiar permiso de lectura"
      >
        <span class="permission-badge {agent.permissions.read !== 'basic' ? 'active' : ''}">
          Leer
        </span>
      </button>

      <button
        type="button"
        class="permission-toggle"
        on:click={() => dispatch('permission', { agentId: agent.id, permission: 'write' })}
        aria-label="Cambiar permiso de escritura"
      >
        <span class="permission-badge {agent.permissions.write !== 'basic' ? 'active' : ''}">
          Escribir
        </span>
      </button>

      <button
        type="button"
        class="permission-toggle"
        on:click={() => dispatch('permission', { agentId: agent.id, permission: 'approve' })}
        aria-label="Cambiar permiso de aprobación"
      >
        <span class="permission-badge {agent.permissions.approve !== 'basic' ? 'active' : ''}">
          Aprobar
        </span>
      </button>
    </div>
  </div>

  <!-- Métricas mini (grid-cols-3) -->
  <div class="agent-metrics">
    <div class="metric-item">
      <svg class="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <span class="metric-value">{agent.metrics.chatsHandled}</span>
      <span class="metric-label">Chats</span>
    </div>

    <div class="metric-item">
      <svg class="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      <span class="metric-value">{agent.metrics.csatScore}</span>
      <span class="metric-label">CSAT</span>
    </div>

    <div class="metric-item">
      <svg class="metric-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
      <span class="metric-value">{agent.metrics.conversionRate}%</span>
      <span class="metric-label">Conv.</span>
    </div>
  </div>

  <!-- Indicador de selección -->
  {#if selected}
    <div class="selection-indicator">
      <div class="selection-dot"></div>
      <span class="selection-text">Seleccionado</span>
    </div>
  {/if}
</div>

<style>
  .agent-card {
    @apply p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-blue-300 hover:shadow-sm bg-white;
  }

  .agent-card.selected {
    @apply border-blue-500 ring-2 ring-blue-500 ring-offset-2;
  }

  .agent-card:focus {
    @apply outline-none ring-2 ring-blue-500 ring-offset-2;
  }

  /* Header del agente */
  .agent-header {
    @apply flex items-start gap-3 mb-3;
  }

  .agent-avatar {
    @apply w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden;
  }

  .avatar-image {
    @apply w-full h-full object-cover;
  }

  .avatar-initials {
    @apply text-sm font-semibold text-blue-700;
  }

  .agent-info {
    @apply flex-1 min-w-0;
  }

  .agent-name {
    @apply text-sm font-medium text-gray-900 truncate mb-1;
  }

  .agent-role {
    @apply text-xs text-gray-600 truncate mb-1;
  }

  .agent-status {
    @apply text-xs px-2 py-1 rounded-full inline-block;
  }

  .agent-status.active {
    @apply bg-green-100 text-green-700;
  }

  .agent-status.inactive {
    @apply bg-gray-100 text-gray-700;
  }

  /* Menú dropdown */
  .agent-menu {
    @apply relative;
  }

  .agent-menu-button {
    @apply p-1 text-gray-400 hover:text-gray-600 transition-colors rounded;
  }

  .agent-menu-dropdown {
    @apply absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1;
  }

  .menu-item {
    @apply w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors;
  }

  .menu-item.destructive {
    @apply text-red-600 hover:bg-red-50;
  }

  .menu-divider {
    @apply border-t border-gray-200 my-1;
  }

  /* Permisos */
  .agent-permissions {
    @apply mb-3;
  }

  .permissions-label {
    @apply block text-xs font-medium text-gray-500 mb-2;
  }

  .permissions-badges {
    @apply flex flex-wrap gap-1;
  }

  .permission-badge {
    @apply px-2 py-1 text-xs rounded border transition-colors;
  }

  .permission-badge.active {
    @apply bg-blue-100 text-blue-700 border-blue-200;
  }

  .permission-badge:not(.active) {
    @apply bg-gray-50 text-gray-600 border-gray-200;
  }

  /* Métricas */
  .agent-metrics {
    @apply grid grid-cols-3 gap-2;
  }

  .metric-item {
    @apply flex flex-col items-center text-center;
  }

  .metric-icon {
    @apply w-4 h-4 text-gray-400 mb-1;
  }

  .metric-value {
    @apply text-sm font-semibold text-gray-900;
  }

  .metric-label {
    @apply text-xs text-gray-600;
  }

  /* Indicador de selección */
  .selection-indicator {
    @apply flex items-center gap-2 mt-3 pt-3 border-t border-gray-100;
  }

  .selection-dot {
    @apply w-2 h-2 bg-blue-500 rounded-full;
  }

  .selection-text {
    @apply text-xs text-blue-700 font-medium;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .agent-metrics {
      @apply grid-cols-3 gap-1;
    }

    .metric-value {
      @apply text-xs;
    }

    .metric-label {
      @apply text-xs;
    }
  }
</style>
