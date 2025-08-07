<!-- 
 * Página de Índice del Chat
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md
 * 
 * Funcionalidades:
 * - Estado vacío cuando no hay conversaciones
 * - Redirección automática cuando hay conversaciones
 * - Mensaje informativo para el usuario
 -->

<script lang="ts">
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { onMount } from 'svelte';

  let conversations: any[] = [];
  let loading = true;

  onMount(() => {
    // Suscribirse a cambios en conversaciones
    conversationsStore.subscribe(state => {
      conversations = state.conversations;
      loading = false;
    });
  });
</script>

<div class="chat-index">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando conversaciones...</p>
    </div>
  {:else if conversations.length === 0}
    <div class="empty-state">
      <div class="empty-icon">💬</div>
      <h2>No hay conversaciones</h2>
      <p>Cuando recibas mensajes de clientes, aparecerán aquí.</p>
      <div class="empty-actions">
        <button
          type="button"
          class="refresh-button"
          on:click={() => conversationsStore.loadConversations()}
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  {:else}
    <div class="redirecting-state">
      <div class="spinner"></div>
      <p>Redirigiendo a la conversación...</p>
    </div>
  {/if}
</div>

<style>
  .chat-index {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f8f9fa;
  }

  .loading-state,
  .empty-state,
  .redirecting-state {
    text-align: center;
    color: #6c757d;
    max-width: 400px;
    padding: 2rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e9ecef;
    border-top: 4px solid #2196f3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h2 {
    margin: 0 0 0.5rem 0;
    color: #212529;
    font-size: 1.5rem;
  }

  .empty-state p {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
    line-height: 1.5;
  }

  .empty-actions {
    display: flex;
    justify-content: center;
  }

  .refresh-button {
    background-color: #2196f3;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .refresh-button:hover {
    background-color: #1976d2;
  }
</style>
