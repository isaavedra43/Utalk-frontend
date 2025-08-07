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
  import { authStore } from '$lib/stores/auth.store';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { onMount } from 'svelte';

  let conversations: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      // Cargar conversaciones
      await conversationsStore.loadConversations();
    } catch (err: any) {
      error = err.message || 'Error al cargar conversaciones';
      notificationsStore.error(error);
    } finally {
      loading = false;
    }

    // Suscribirse a cambios en conversaciones
    conversationsStore.subscribe(state => {
      conversations = state.conversations;
    });
  });
</script>

<div class="chat-index">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando conversaciones...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Error al cargar conversaciones</h2>
      <p>{error}</p>
      <div class="error-details">
        <p class="error-help">
          Si el problema persiste, verifica tu conexión a internet o contacta al administrador.
        </p>
      </div>
      <div class="error-actions">
        <button
          type="button"
          class="retry-button"
          on:click={() => {
            error = '';
            loading = true;
            conversationsStore
              .loadConversations()
              .catch(err => {
                error = err.message || 'Error al cargar conversaciones';
                notificationsStore.error(error);
              })
              .finally(() => {
                loading = false;
              });
          }}
        >
          🔄 Reintentar
        </button>
        <button
          type="button"
          class="logout-button"
          on:click={() => {
            authStore.logout();
            window.location.href = '/login';
          }}
        >
          🔑 Reiniciar sesión
        </button>
      </div>
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
        <button
          type="button"
          class="demo-button"
          on:click={() => {
            // Crear una conversación de demo y redirigir
            const demoConversation = {
              id: 'demo-conversation',
              participants: ['+521234567890', 'admin@company.com'],
              customerPhone: '+521234567890',
              contact: {
                id: '+521234567890',
                name: 'Cliente Demo',
                phone: '+521234567890',
                email: 'cliente@demo.com',
                avatar: null,
                company: 'Empresa Demo',
                notes: 'Cliente de demostración',
                channel: 'whatsapp',
                isActive: true,
                tags: ['demo'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              assignedTo: {
                id: 'admin@company.com',
                name: 'Administrador del Sistema',
                email: 'admin@company.com',
                role: 'admin'
              },
              status: 'open' as const,
              priority: 'normal' as const,
              tags: ['demo'],
              unreadCount: 2,
              messageCount: 5,
              lastMessage: {
                id: 'msg_demo_1',
                content: 'Hola, ¿cómo puedo ayudarte?',
                timestamp: new Date().toISOString(),
                sender: 'agent',
                type: 'text',
                status: 'delivered'
              },
              lastMessageId: 'msg_demo_1',
              lastMessageAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Agregar la conversación demo al store
            conversationsStore.addDemoConversation(demoConversation);

            // Redirigir a la conversación demo
            window.location.href = '/chat/demo-conversation';
          }}
        >
          🎯 Ver Interfaz Completa (Demo)
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
  .redirecting-state,
  .error-state {
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

  .empty-icon,
  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-details {
    margin: 1rem 0;
  }

  .error-help {
    font-size: 0.9rem;
    color: #6c757d;
    margin: 0;
  }

  .error-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .retry-button,
  .logout-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .retry-button {
    background-color: #2196f3;
    color: white;
  }

  .retry-button:hover {
    background-color: #1976d2;
  }

  .logout-button {
    background-color: #6c757d;
    color: white;
  }

  .logout-button:hover {
    background-color: #5a6268;
  }

  .demo-button {
    background-color: #28a745;
    color: white;
    margin-top: 0.5rem;
  }

  .demo-button:hover {
    background-color: #218838;
  }

  .empty-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    margin-top: 1rem;
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
