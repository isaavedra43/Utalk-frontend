<!-- 
 * Página de Chat - UTalk Frontend
 * Estructura completa del chat con sidebar y paneles
 * 
 * Características:
 * - Estructura completa del chat visible siempre
 * - Lista de conversaciones (vacía si no hay datos)
 * - Panel central de mensajes
 * - Paneles laterales integrados
 -->

<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { onMount } from 'svelte';

  let user: any = null;
  let loading = true;
  let conversations: any[] = [];
  let error = '';

  function openConversation(c: any) {
    if (!c?.id) return;
    goto(`/chat/${encodeURIComponent(c.id)}`);
  }

  function displayName(c: any) {
    return c?.contact?.name || c?.customerPhone || 'Cliente';
  }

  onMount(() => {
    // Verificar si el usuario está autenticado
    authStore.subscribe(state => {
      if (state.isAuthenticated && state.user) {
        user = state.user;
        loading = false;

        // Cargar conversaciones
        loadConversations();
      } else if (!state.isAuthenticated) {
        // Redirigir al login si no está autenticado
        goto('/login');
      }
    });
  });

  async function loadConversations() {
    try {
      loading = true;
      await conversationsStore.loadConversations();

      // Suscribirse a las conversaciones
      conversationsStore.subscribe(state => {
        conversations = state.conversations;
        loading = state.loading;
        error = state.error || '';

        // DEBUG-LOG-START(conversations-front)
        if (
          typeof window !== 'undefined' &&
          window.location.search.includes('LOG_VERBOSE_CONVERSATIONS=true')
        ) {
          const requiredKeys = ['id', 'lastMessage', 'createdAt'];
          const firstItem = conversations[0];
          const missingKeys = firstItem
            ? requiredKeys.filter(key => !(key in firstItem))
            : requiredKeys;
          const requiredKeysPresent = firstItem ? requiredKeys.filter(key => key in firstItem) : [];

          console.debug('[CONV][selector][selector:mapped]', {
            event: 'selector:mapped',
            layer: 'selector',
            request: { url: '/conversations', method: 'GET', queryParams: {} },
            response: {
              status: null,
              ok: !error,
              itemsLength: conversations.length,
              keysSample: firstItem ? Object.keys(firstItem).slice(0, 3) : []
            },
            clientFilters: {
              inbox: null,
              status: null,
              assignedTo: null,
              search: null,
              pagination: null
            },
            mapping: { requiredKeysPresent, missingKeys },
            render: {
              willShowEmptyState: conversations.length === 0,
              reason:
                conversations.length === 0 ? 'conversations.length === 0' : 'has conversations'
            }
          });
        }
        // DEBUG-LOG-END(conversations-front)
      });
    } catch (err: any) {
      error = err?.message || 'Error al cargar conversaciones';
    } finally {
      loading = false;
    }
  }
</script>

<div class="chat-container">
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
      <div class="error-actions">
        <button type="button" class="retry-button" on:click={loadConversations}>
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
  {:else}
    <!-- Estructura completa del chat -->
    <div class="chat-layout">
      <!-- Panel izquierdo: Lista de conversaciones -->
      <div class="conversations-panel">
        <div class="panel-header">
          <h2 class="panel-title">💬 Conversaciones</h2>
          <button class="refresh-button" on:click={loadConversations}> 🔄 </button>
        </div>

        <div class="conversations-list">
          {#if conversations.length === 0}
            <!-- DEBUG-LOG-START(conversations-front) -->
            {(() => {
              if (
                typeof window !== 'undefined' &&
                window.location.search.includes('LOG_VERBOSE_CONVERSATIONS=true')
              ) {
                console.debug('[CONV][component][render:decision]', {
                  event: 'render:decision',
                  layer: 'component',
                  request: { url: '/conversations', method: 'GET', queryParams: {} },
                  response: {
                    status: null,
                    ok: !error,
                    itemsLength: conversations.length,
                    keysSample: []
                  },
                  clientFilters: {
                    inbox: null,
                    status: null,
                    assignedTo: null,
                    search: null,
                    pagination: null
                  },
                  mapping: { requiredKeysPresent: [], missingKeys: [] },
                  render: { willShowEmptyState: true, reason: 'conversations.length === 0' }
                });
              }
              return '';
            })()}
            <!-- DEBUG-LOG-END(conversations-front) -->
            <div class="empty-conversations">
              <div class="empty-icon">💬</div>
              <h3>No hay conversaciones</h3>
              <p>Cuando recibas mensajes de clientes, aparecerán aquí.</p>
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
                🎯 Ver Demo Completa
              </button>
            </div>
          {:else}
            {#each conversations as conversation}
              <div class="conversation-item" on:click={() => openConversation(conversation)}>
                <div class="conversation-avatar">
                  <span class="avatar-text">
                    {displayName(conversation).charAt(0) || 'C'}
                  </span>
                </div>
                <div class="conversation-details">
                  <h4 class="conversation-name">
                    {displayName(conversation)}
                  </h4>
                  <p class="conversation-preview">
                    {conversation.lastMessage?.content || 'Sin mensajes'}
                  </p>
                </div>
                <div class="conversation-meta">
                  <span class="conversation-time">
                    {conversation.lastMessageAt
                      ? new Date(conversation.lastMessageAt).toLocaleTimeString()
                      : ''}
                  </span>
                  {#if conversation.unreadCount > 0}
                    <span class="unread-badge">{conversation.unreadCount}</span>
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- Panel central: Área de mensajes -->
      <div class="messages-panel">
        <div class="messages-header">
          <div class="chat-info">
            <h2 class="chat-title">Selecciona una conversación</h2>
            <p class="chat-subtitle">Elige una conversación para comenzar a chatear</p>
          </div>
        </div>

        <div class="messages-area">
          <div class="empty-messages">
            <div class="empty-icon">💬</div>
            <h3>Área de Mensajes</h3>
            <p>Aquí se mostrarán los mensajes de la conversación seleccionada.</p>
          </div>
        </div>

        <div class="message-input-area">
          <div class="input-container">
            <textarea class="message-input" placeholder="Escribe un mensaje..." disabled></textarea>
            <button class="send-button" disabled> 📤 </button>
          </div>
        </div>
      </div>

      <!-- Panel derecho: Detalles y herramientas -->
      <div class="details-panel">
        <div class="panel-header">
          <h3 class="panel-title">📋 Detalles</h3>
        </div>

        <div class="details-content">
          <div class="detail-section">
            <h4>Información del Contacto</h4>
            <p>Selecciona una conversación para ver los detalles del contacto.</p>
          </div>

          <div class="detail-section">
            <h4>Herramientas</h4>
            <div class="tools-list">
              <button class="tool-button" disabled> 📞 Llamar </button>
              <button class="tool-button" disabled> 📧 Email </button>
              <button class="tool-button" disabled> 📋 Notas </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .chat-container {
    height: 100vh;
    background: #f8f9fa;
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    color: #6c757d;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e9ecef;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-state h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .error-state p {
    color: #6c757d;
    margin: 0 0 1.5rem 0;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
  }

  .retry-button,
  .logout-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .retry-button {
    background: #667eea;
    color: white;
  }

  .retry-button:hover {
    background: #4956b3;
  }

  .logout-button {
    background: #6c757d;
    color: white;
  }

  .logout-button:hover {
    background: #5a6268;
  }

  /* Layout del Chat */
  .chat-layout {
    display: grid;
    grid-template-columns: 300px 1fr 300px;
    height: 100vh;
    background: white;
  }

  /* Panel de Conversaciones */
  .conversations-panel {
    border-right: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
  }

  .refresh-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .refresh-button:hover {
    background: #f8f9fa;
  }

  .conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .empty-conversations {
    text-align: center;
    padding: 2rem 1rem;
    color: #6c757d;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-conversations h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .empty-conversations p {
    margin: 0 0 1.5rem 0;
  }

  .demo-button {
    background: #28a745;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  .demo-button:hover {
    background: #218838;
  }

  .conversation-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 0.5rem;
  }

  .conversation-item:hover {
    background: #f8f9fa;
  }

  .conversation-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-text {
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .conversation-details {
    flex: 1;
    min-width: 0;
  }

  .conversation-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.25rem 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-preview {
    font-size: 0.8rem;
    color: #6c757d;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .conversation-time {
    font-size: 0.75rem;
    color: #6c757d;
  }

  .unread-badge {
    background: #667eea;
    color: white;
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    border-radius: 10px;
    font-weight: bold;
  }

  /* Panel de Mensajes */
  .messages-panel {
    display: flex;
    flex-direction: column;
    background: white;
  }

  .messages-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }

  .chat-info {
    text-align: center;
  }

  .chat-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.25rem 0;
  }

  .chat-subtitle {
    font-size: 0.9rem;
    color: #6c757d;
    margin: 0;
  }

  .messages-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .empty-messages {
    text-align: center;
    color: #6c757d;
  }

  .empty-messages .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-messages h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .empty-messages p {
    margin: 0;
  }

  .message-input-area {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e9ecef;
  }

  .input-container {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
  }

  .message-input {
    flex: 1;
    min-height: 40px;
    max-height: 120px;
    padding: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    resize: vertical;
    font-family: inherit;
    font-size: 0.9rem;
    background: #f8f9fa;
    color: #6c757d;
  }

  .message-input:disabled {
    cursor: not-allowed;
  }

  .send-button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: #6c757d;
    color: white;
    cursor: not-allowed;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Panel de Detalles */
  .details-panel {
    border-left: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
  }

  .details-content {
    flex: 1;
    padding: 1rem;
  }

  .detail-section {
    margin-bottom: 2rem;
  }

  .detail-section h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.75rem 0;
  }

  .detail-section p {
    font-size: 0.875rem;
    color: #6c757d;
    margin: 0;
  }

  .tools-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tool-button {
    padding: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    font-size: 0.875rem;
    text-align: left;
    transition: all 0.2s;
  }

  .tool-button:disabled {
    opacity: 0.5;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .chat-layout {
      grid-template-columns: 250px 1fr 250px;
    }
  }

  @media (max-width: 768px) {
    .chat-layout {
      grid-template-columns: 1fr;
    }

    .conversations-panel,
    .details-panel {
      display: none;
    }
  }
</style>
