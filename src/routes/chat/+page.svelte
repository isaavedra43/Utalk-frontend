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
  import MessageAttachment from '$lib/components/MessageAttachment.svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { messagesStore } from '$lib/stores/messages.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { onMount } from 'svelte';

  let user: any = null;
  let loading = true;
  let conversations: any[] = [];
  let error = '';
  let selectedConversation: any = null;
  let messages: any[] = [];
  let newMessage = '';
  let canSend = false;
  let selectedFiles: File[] = [];
  let fileInputEl: HTMLInputElement;
  let messagesContainer: HTMLElement;
  let conversationsContainer: HTMLElement;

  function openConversation(c: any) {
    if (!c?.id) return;
    selectedConversation = c;
    canSend = c.assignedTo !== null;

    // Cargar mensajes de la conversación seleccionada
    loadMessages(c.id);

    // Actualizar URL sin navegar
    window.history.pushState({}, '', `/chat/${encodeURIComponent(c.id)}`);
  }

  function displayName(c: any) {
    return c?.contact?.name || c?.customerPhone || 'Cliente';
  }

  function onItemKeydown(event: KeyboardEvent, c: any) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      openConversation(c);
    }
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

  async function loadMessages(conversationId: string) {
    try {
      await messagesStore.loadMessages(conversationId);

      // Suscribirse a los mensajes
      messagesStore.subscribe(state => {
        messages = state.messages;
      });
    } catch (err: any) {
      console.error('Error loading messages:', err);
    }
  }

  // Función para hacer scroll automático al final de los mensajes
  function scrollToBottom() {
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
    }
  }

  async function sendMessage() {
    if (!selectedConversation || (!newMessage.trim() && selectedFiles.length === 0) || !canSend)
      return;

    // Verificar si ya se está enviando
    if (messagesStore.isSending(selectedConversation.id)) {
      return;
    }

    try {
      await messagesStore.sendMessage(selectedConversation.id, newMessage, selectedFiles);
      newMessage = '';
      selectedFiles = [];

      // Scroll automático al enviar mensaje
      scrollToBottom();

      // Mostrar notificación de éxito
      notificationsStore.success('Mensaje enviado correctamente');
    } catch (err: any) {
      console.error('Error sending message:', err);

      // Mostrar error específico al usuario
      const errorMessage = err.message || 'Error al enviar mensaje';

      // No mostrar "Error desconocido" si fue un error de red o servidor
      if (errorMessage.includes('desconocido') || errorMessage.includes('unknown')) {
        notificationsStore.error('Error de conexión. Intenta de nuevo.');
      } else {
        notificationsStore.error(errorMessage);
      }
    }
  }

  function openFilePicker() {
    if (fileInputEl) fileInputEl.click();
  }

  async function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    // Validación básica de tamaño/tipo (UI):
    const MAX_IMAGE_MB = 10 * 1024 * 1024;
    const MAX_DOC_MB = 25 * 1024 * 1024;

    const allowed = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/ogg',
      'audio/webm'
    ];

    const filtered: File[] = [];
    for (const f of files) {
      if (!allowed.includes(f.type)) {
        notificationsStore.error('Tipo de archivo no permitido');
        continue;
      }
      if (f.type.startsWith('image/') && f.size > MAX_IMAGE_MB) {
        notificationsStore.error('Imagen supera 10MB');
        continue;
      }
      if (
        (f.type.startsWith('application/') || f.type === 'application/pdf') &&
        f.size > MAX_DOC_MB
      ) {
        notificationsStore.error('Documento supera 25MB');
        continue;
      }
      filtered.push(f);
    }

    selectedFiles = [...selectedFiles, ...filtered];
    // limpiar input para permitir volver a seleccionar el mismo archivo
    input.value = '';
  }

  function removeSelectedFile(index: number) {
    selectedFiles = selectedFiles.filter((_, i) => i !== index);
  }

  function getMessageMedia(m: any) {
    const media = m?.media || null;
    const mediaUrl = media?.mediaUrl ?? m?.mediaUrl ?? null;
    if (!mediaUrl) return null;
    return {
      mediaUrl,
      filename: media?.fileName || media?.filename || m?.metadata?.fileInfo?.filename || 'archivo',
      fileSize: media?.fileSize || m?.metadata?.fileInfo?.size || 0,
      fileType: media?.mimeType || m?.metadata?.fileInfo?.mimeType || ''
    };
  }

  // Reactive statement para scroll automático cuando cambian los mensajes
  $: if (messages && messages.length > 0) {
    scrollToBottom();
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

        <div class="conversations-list" bind:this={conversationsContainer}>
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
              <div
                class="conversation-item"
                role="button"
                tabindex="0"
                aria-label={`Abrir conversación con ${displayName(conversation)}`}
                on:click={() => openConversation(conversation)}
                on:keydown={e => onItemKeydown(e, conversation)}
              >
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
                      : '--'}
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
        {#if selectedConversation}
          <div class="messages-header">
            <div class="chat-info">
              <h2 class="chat-title">{displayName(selectedConversation)}</h2>
              <p class="chat-subtitle">{selectedConversation.customerPhone}</p>
            </div>
          </div>

          <div class="messages-area">
            <!-- INTEGRATION POINT: cola de archivos seleccionados -->
            {#if selectedFiles.length > 0}
              <div class="selected-files">
                {#each selectedFiles as f, i}
                  <div class="selected-file">
                    <span class="file-name">{f.name}</span>
                    <span class="file-size">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                    <button
                      class="remove-file"
                      on:click={() => removeSelectedFile(i)}
                      aria-label="Quitar archivo">✖</button
                    >
                  </div>
                {/each}
              </div>
            {/if}
            {#if messages.length === 0}
              <div class="empty-messages">
                <div class="empty-icon">💬</div>
                <h3>Sin mensajes</h3>
                <p>Esta conversación aún no tiene mensajes.</p>
              </div>
            {:else}
              <div class="messages-list" bind:this={messagesContainer}>
                {#each messages as message}
                  {@const isOutbound =
                    message?.direction === 'outbound' ||
                    message?.senderIdentifier?.startsWith('agent:')}
                  <div class="message-item" class:message-outbound={isOutbound}>
                    <div class="message-content">
                      {#if getMessageMedia(message)}
                        {#key message.id}
                          {#await Promise.resolve(getMessageMedia(message)) then mediaObj}
                            {#if mediaObj}
                              <MessageAttachment
                                mediaUrl={mediaObj.mediaUrl}
                                filename={mediaObj.filename}
                                fileType={mediaObj.fileType}
                                fileSize={mediaObj.fileSize}
                              />
                            {/if}
                          {/await}
                        {/key}
                      {/if}
                      {#if message.content}
                        <p>{message.content}</p>
                      {/if}
                    </div>
                    <div class="message-time">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '--'}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <div class="message-input-area">
            <div class="input-container">
              <textarea
                class="message-input"
                placeholder="Escribe un mensaje..."
                bind:value={newMessage}
                disabled={!canSend}
              ></textarea>
              <input
                bind:this={fileInputEl}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,audio/ogg,audio/webm"
                on:change={onFileChange}
                style="display:none"
              />
              <button
                class="send-button"
                on:click={openFilePicker}
                title="Adjuntar"
                aria-label="Adjuntar"
                disabled={!canSend}>📎</button
              >
              <button
                class="send-button"
                disabled={!canSend || (!newMessage.trim() && selectedFiles.length === 0)}
                on:click={() => sendMessage()}
              >
                📤
              </button>
            </div>
          </div>
        {:else}
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
              <textarea class="message-input" placeholder="Escribe un mensaje..." disabled
              ></textarea>
              <button class="send-button" disabled> 📤 </button>
            </div>
          </div>
        {/if}
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
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .conversations-list::-webkit-scrollbar {
    width: 6px;
  }

  .conversations-list::-webkit-scrollbar-track {
    background: #f7fafc;
  }

  .conversations-list::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  .conversations-list::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
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
    flex-direction: column;
    padding: 1rem;
    overflow-y: auto;
  }

  .messages-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .messages-list::-webkit-scrollbar {
    width: 6px;
  }

  .messages-list::-webkit-scrollbar-track {
    background: #f7fafc;
  }

  .messages-list::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  .messages-list::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  .message-item {
    display: flex;
    flex-direction: column;
    max-width: 70%;
    align-self: flex-start;
  }

  .message-item.message-outbound {
    align-self: flex-end;
  }

  .message-item.message-outbound .message-content {
    background: #007bff;
    color: white;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 4px;
  }

  .message-item.message-outbound .message-content p {
    color: white;
  }

  .message-item.message-outbound .message-time {
    text-align: right;
    margin-right: 0.5rem;
    margin-left: 0;
  }

  .message-content {
    background: #e9ecef;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border-bottom-left-radius: 4px;
  }

  .message-content p {
    margin: 0;
    font-size: 0.9rem;
    color: #212529;
  }

  .message-time {
    font-size: 0.75rem;
    color: #6c757d;
    margin-top: 0.25rem;
    margin-left: 0.5rem;
  }

  .empty-messages {
    text-align: center;
    color: #6c757d;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
    transition: all 0.2s ease;
  }

  .message-input:not(:disabled) {
    background: white;
    color: #212529;
    border-color: #007bff;
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
    transition: all 0.2s ease;
  }

  .send-button:not(:disabled) {
    background: #007bff;
    cursor: pointer;
  }

  .send-button:not(:disabled):hover {
    background: #0056b3;
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

  .selected-files {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 8px 0;
  }
  .selected-file {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f1f3f5;
    padding: 6px 10px;
    border-radius: 8px;
  }
  .selected-file .file-name {
    font-weight: 500;
  }
  .selected-file .file-size {
    font-size: 0.8rem;
    color: #6c757d;
  }
  .selected-file .remove-file {
    margin-left: auto;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #dc3545;
  }
</style>
