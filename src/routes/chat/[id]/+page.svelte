<!-- 
 * Componente Principal del Chat - Layout Tipo Intercom
 * Basado en PLAN_FRONTEND_UTALK_COMPLETO.md
 * 
 * Estructura:
 * - Sidebar izquierda: Lista de conversaciones
 * - Área central: Mensajes de la conversación seleccionada
 * - Input abajo: Envío de mensajes y archivos
 * 
 * Características:
 * - Datos reales del backend (no mocks)
 * - Validaciones exactas del documento
 * - Manejo de edge cases documentados
 * - UI responsive y accesible
 -->

<script lang="ts">
  import { page } from '$app/stores';
  import FailedMessage from '$lib/components/FailedMessage.svelte';
  import MessageAttachment from '$lib/components/MessageAttachment.svelte';
  import { environment } from '$lib/config/environment';
  import { socketManager } from '$lib/services/socket';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { messagesStore } from '$lib/stores/messages.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { typingStore } from '$lib/stores/typing.store';
  import { safeDateToISOString } from '$lib/utils/dates';
  import { validateFileUpload, validateMessage } from '$lib/utils/validation';
  import { onDestroy, onMount } from 'svelte';

  // Estados del componente
  let selectedConversation: any = null;
  let newMessage = '';
  let selectedFiles: File[] = [];
  let loading = true;
  let error = '';
  let canSend = false;
  let byteCount = 0;
  let remainingBytes = environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH;

  // Estados para edge cases - Documento: info/1.md sección "Casos Especiales que la UI debe manejar"
  let hasUnassignedAgent = false;
  let rateLimitWarning = false;

  // Referencias a elementos del DOM
  let messageInput: HTMLTextAreaElement;
  let fileInput: HTMLInputElement;
  let messagesContainer: HTMLDivElement;

  // Suscripciones a stores
  let conversations: any[] = [];
  let messages: any[] = [];
  let pagination: any = null;
  let typingText = '';

  // Configuración de paginación
  let loadingMore = false;
  let hasMore = false;

  $: conversationId = $page.params.id;

  onMount(async () => {
    try {
      // Cargar conversaciones iniciales
      await loadConversations();

      // Configurar socket para nuevos mensajes
      setupSocketListeners();

      // Seleccionar la conversación de la URL
      if (conversationId) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
          await selectConversation(conversation);
        } else {
          error = 'Conversación no encontrada';
        }
      }

      loading = false;
    } catch (err: any) {
      error = err.response?.data?.message || 'Error al cargar el chat';
      loading = false;
    }
  });

  onDestroy(() => {
    // Salir de la conversación actual al destruir el componente
    if (selectedConversation) {
      socketManager.leaveConversation(selectedConversation.id);
    }
  });

  // Suscripción a stores
  conversationsStore.subscribe(state => {
    conversations = state.conversations;
  });

  messagesStore.subscribe(state => {
    messages = state.messages;
    pagination = state.pagination;
    hasMore = state.pagination?.hasMore || false;
  });

  // Suscripción al store de indicadores de escritura
  typingStore.subscribe((state: any) => {
    if (selectedConversation) {
      typingText = typingStore.getTypingText(selectedConversation.id);
    }
  });

  // Función para cargar conversaciones
  async function loadConversations() {
    try {
      await conversationsStore.loadConversations();
    } catch (err: any) {
      notificationsStore.error('Error al cargar conversaciones');
      throw err;
    }
  }

  // Función para seleccionar una conversación
  async function selectConversation(conversation: any) {
    try {
      selectedConversation = conversation;

      // Verificar si la conversación tiene agente asignado - Documento: info/1.md sección "Conversación Sin Agente Asignado"
      hasUnassignedAgent = conversation.assignedTo === null;
      canSend = !hasUnassignedAgent && conversation.assignedTo !== null;

      // Cargar mensajes de la conversación
      await messagesStore.loadMessages(conversation.id);

      // Unirse a la conversación en socket
      socketManager.joinConversation(conversation.id);

      // Scroll al final de los mensajes
      setTimeout(() => {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (err: any) {
      notificationsStore.error('Error al cargar mensajes');
    }
  }

  // Función para cargar más mensajes (paginación)
  async function loadMoreMessages() {
    if (loadingMore || !hasMore || !selectedConversation) return;

    try {
      loadingMore = true;
      await messagesStore.loadMoreMessages();
    } catch (err: any) {
      notificationsStore.error('Error al cargar más mensajes');
    } finally {
      loadingMore = false;
    }
  }

  // Función para reintentar mensaje fallido
  async function retryMessage(messageId: string) {
    try {
      await messagesStore.retryMessage(messageId);
      notificationsStore.success('Mensaje reenviado');
    } catch (err: any) {
      notificationsStore.error('Error al reenviar mensaje');
    }
  }

  // Configurar listeners de socket
  function setupSocketListeners() {
    // Unirse a la conversación actual
    if (selectedConversation) {
      socketManager.joinConversation(selectedConversation.id);
    }

    // Los eventos de socket se manejan automáticamente en el SocketManager
    // y actualizan los stores correspondientes
  }

  // Función para manejar cambios en el input de mensaje
  function handleMessageInput() {
    // Contar bytes reales (no caracteres) - Documento: "Límite real: 4096 bytes"
    byteCount = new TextEncoder().encode(newMessage).length;
    remainingBytes = environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH - byteCount;

    // Enviar evento de escritura si hay conversación seleccionada
    if (selectedConversation && newMessage.trim()) {
      socketManager.sendTypingEvent(selectedConversation.id);
    }
  }

  // Función para manejar selección de archivos
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);

    const validation = validateFileUpload(files);
    if (!validation.valid) {
      notificationsStore.error(validation.error || 'Error en archivos');
      return;
    }

    selectedFiles = files;
  }

  // Función para enviar mensaje
  async function sendMessage() {
    if (!selectedConversation || !canSend) {
      notificationsStore.error('No puedes enviar mensajes a esta conversación');
      return;
    }

    // Validar mensaje
    const messageValidation = validateMessage(newMessage);
    if (!messageValidation.valid) {
      notificationsStore.error(messageValidation.error || 'Error en mensaje');
      return;
    }

    // Validar archivos si existen
    if (selectedFiles.length > 0) {
      const fileValidation = validateFileUpload(selectedFiles);
      if (!fileValidation.valid) {
        notificationsStore.error(fileValidation.error || 'Error en archivos');
        return;
      }
    }

    // Verificar que hay contenido o archivos
    if (!newMessage.trim() && selectedFiles.length === 0) {
      notificationsStore.error('El mensaje no puede estar vacío');
      return;
    }

    try {
      // Determinar tipo de mensaje basado en archivos
      let messageType: string = 'text';
      if (selectedFiles.length > 0) {
        const firstFile = selectedFiles[0];
        if (firstFile && firstFile.type.startsWith('image/')) {
          messageType = 'image';
        } else if (firstFile && firstFile.type.startsWith('video/')) {
          messageType = 'video';
        } else if (firstFile && firstFile.type.startsWith('audio/')) {
          messageType = 'audio';
        } else {
          messageType = 'document';
        }
      }

      // Enviar mensaje usando el store
      await messagesStore.sendMessage(
        selectedConversation.id,
        newMessage,
        selectedFiles,
        messageType as any
      );

      // Limpiar input
      newMessage = '';
      selectedFiles = [];
      byteCount = 0;
      remainingBytes = environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH;

      // Limpiar input de archivos
      if (fileInput) {
        fileInput.value = '';
      }

      // Detener evento de escritura
      if (selectedConversation) {
        socketManager.sendTypingStopEvent(selectedConversation.id);
      }
    } catch (err: any) {
      // Los errores ya se manejan en el store
      console.error('Error al enviar mensaje:', err);
    }
  }

  // Función para formatear fecha
  function formatMessageTime(timestamp: string): string {
    const date = safeDateToISOString(timestamp);
    if (!date) return 'Hora no disponible';

    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Función para obtener nombre del contacto
  function getContactName(conversation: any): string {
    return (
      conversation.contact?.name ||
      conversation.contact?.phone ||
      conversation.customerPhone ||
      'Sin nombre'
    );
  }

  // Función para obtener último mensaje
  function getLastMessage(conversation: any): string {
    if (!conversation.lastMessage) return 'Aún no hay mensajes';

    if (conversation.lastMessage.type === 'text') {
      return conversation.lastMessage.content || '[Sin contenido]';
    } else {
      return `[${conversation.lastMessage.type}]`;
    }
  }

  // Función para manejar scroll y cargar más mensajes
  function handleScroll() {
    if (!messagesContainer) return;

    const { scrollTop } = messagesContainer;
    if (scrollTop < 100 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  }
</script>

<div class="chat-layout">
  <!-- Sidebar de Conversaciones (Izquierda) -->
  <div class="conversations-sidebar">
    <div class="sidebar-header">
      <h2>Conversaciones</h2>
      <button class="refresh-btn" on:click={loadConversations}> ↻ </button>
    </div>

    <div class="conversations-list">
      {#if loading}
        <div class="loading">Cargando conversaciones...</div>
      {:else if error}
        <div class="error">{error}</div>
      {:else if conversations.length === 0}
        <div class="empty-state">
          <p>No hay conversaciones aún</p>
        </div>
      {:else}
        {#each conversations as conversation}
          <div
            class="conversation-item"
            class:selected={selectedConversation?.id === conversation.id}
            class:unassigned={!conversation.assignedTo}
            on:click={() => selectConversation(conversation)}
          >
            <div class="conversation-avatar">
              {#if conversation.contact?.avatar}
                <img src={conversation.contact.avatar} alt="Avatar" />
              {:else}
                <div class="avatar-placeholder">
                  {getContactName(conversation).charAt(0).toUpperCase()}
                </div>
              {/if}
            </div>

            <div class="conversation-info">
              <div class="conversation-header">
                <h3 class="contact-name">{getContactName(conversation)}</h3>
                {#if conversation.unreadCount > 0}
                  <span class="unread-badge">{conversation.unreadCount}</span>
                {/if}
              </div>

              <p class="last-message">{getLastMessage(conversation)}</p>

              <div class="conversation-meta">
                <span class="message-time">
                  {#if conversation.lastMessageAt}
                    {formatMessageTime(conversation.lastMessageAt)}
                  {:else}
                    Sin actividad
                  {/if}
                </span>

                {#if !conversation.assignedTo}
                  <span class="unassigned-badge">Sin asignar</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Área Principal de Mensajes (Centro) -->
  <div class="messages-area">
    {#if !selectedConversation}
      <div class="no-conversation-selected">
        <div class="empty-state">
          <h2>Selecciona una conversación</h2>
          <p>Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    {:else}
      <!-- Header de la conversación -->
      <div class="conversation-header">
        <div class="conversation-details">
          <h2>{getContactName(selectedConversation)}</h2>
          {#if selectedConversation.contact?.phone}
            <p class="contact-phone">{selectedConversation.contact.phone}</p>
          {/if}
        </div>

        <div class="conversation-status">
          {#if hasUnassignedAgent}
            <span class="status-badge unassigned">Sin agente asignado</span>
          {:else}
            <span class="status-badge assigned">
              Asignado a {selectedConversation.assignedTo.name}
            </span>
          {/if}
        </div>
      </div>

      <!-- Advertencia de conversación sin agente - Documento: info/1.md sección "Conversación Sin Agente Asignado" -->
      {#if hasUnassignedAgent}
        <div class="unassigned-warning">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">Asigna un agente antes de responder</span>
        </div>
      {/if}

      <!-- Contenedor de mensajes -->
      <div class="messages-container" bind:this={messagesContainer} on:scroll={handleScroll}>
        {#if loadingMore}
          <div class="loading-more">
            <span>Cargando más mensajes...</span>
          </div>
        {/if}

        {#each messages as message}
          <div
            class="message"
            class:own={message.direction === 'outbound'}
            class:failed={message.status === 'failed'}
          >
            <div class="message-content">
              {#if message.type === 'text'}
                <p>{message.content}</p>
              {:else if message.mediaUrl}
                <!-- Archivo adjunto -->
                <MessageAttachment
                  mediaUrl={message.mediaUrl}
                  filename={message.metadata?.fileInfo?.filename || 'archivo'}
                  fileType={message.metadata?.fileInfo?.mimeType || 'application/octet-stream'}
                  fileSize={message.metadata?.fileInfo?.size || 0}
                  thumbnail={message.metadata?.fileInfo?.thumbnail}
                />
                {#if message.content}
                  <p class="attachment-caption">{message.content}</p>
                {/if}
              {:else}
                <div class="media-message">
                  <span class="media-icon">
                    {#if message.type === 'audio'}🎵
                    {:else if message.type === 'video'}🎥
                    {:else if message.type === 'location'}📍
                    {:else}📎
                    {/if}
                  </span>
                  <span class="media-type">[{message.type}]</span>
                  {#if message.content}
                    <p>{message.content}</p>
                  {/if}
                </div>
              {/if}

              <!-- Mensaje de error si falló - Documento: info/1.md sección "Mensaje con Envío Fallido" -->
              {#if message.status === 'failed'}
                <FailedMessage {message} onRetry={retryMessage} />
              {/if}
            </div>

            <div class="message-meta">
              <span class="message-time">
                {formatMessageTime(message.timestamp)}
              </span>

              {#if message.direction === 'outbound'}
                <span class="message-status">
                  {#if message.status === 'sent'}✓
                  {:else if message.status === 'delivered'}✓✓
                  {:else if message.status === 'read'}✓✓
                  {:else if message.status === 'failed'}✗
                  {:else}⏳
                  {/if}
                </span>
              {/if}
            </div>
          </div>
        {/each}

        {#if messages.length === 0}
          <div class="no-messages">
            <p>No hay mensajes en esta conversación</p>
          </div>
        {/if}

        {#if typingText}
          <div class="typing-indicator">
            <span class="typing-dots">●●●</span>
            <span class="typing-text">{typingText}</span>
          </div>
        {/if}
      </div>

      <!-- Input de mensaje -->
      <div class="message-input-container" class:disabled={!canSend}>
        {#if hasUnassignedAgent}
          <div class="input-warning">
            <span class="warning-icon">⚠️</span>
            <span>Asigna un agente antes de responder</span>
          </div>
        {/if}

        <div class="input-wrapper">
          <div class="input-controls">
            <button
              class="file-button"
              type="button"
              disabled={!canSend}
              on:click={() => fileInput?.click()}
            >
              📎
            </button>

            {#if selectedFiles.length > 0}
              <div class="selected-files">
                {#each selectedFiles as file, index}
                  <span class="file-tag">
                    {file.name}
                    <button
                      class="remove-file"
                      on:click={() => (selectedFiles = selectedFiles.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </span>
                {/each}
              </div>
            {/if}
          </div>

          <div class="text-input-container">
            <textarea
              bind:this={messageInput}
              bind:value={newMessage}
              on:input={handleMessageInput}
              placeholder={canSend
                ? 'Escribe tu mensaje...'
                : 'Asigna un agente para enviar mensajes'}
              disabled={!canSend}
              maxlength="4096"
              rows="1"
              class="message-textarea"
            />

            <div class="input-footer">
              <span class="byte-counter" class:warning={remainingBytes < 100}>
                {remainingBytes} bytes restantes
              </span>

              <button
                class="send-button"
                on:click={sendMessage}
                disabled={!canSend || (!newMessage.trim() && selectedFiles.length === 0)}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>

        <input
          bind:this={fileInput}
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.pdf"
          on:change={handleFileSelect}
          style="display: none;"
        />
      </div>
    {/if}
  </div>
</div>

<style>
  /* Layout principal */
  .chat-layout {
    display: flex;
    height: 100vh;
    background-color: #f8f9fa;
  }

  /* Sidebar de conversaciones */
  .conversations-sidebar {
    width: 350px;
    background-color: #ffffff;
    border-right: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sidebar-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
  }

  .refresh-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .refresh-btn:hover {
    background-color: #f8f9fa;
  }

  .conversations-list {
    flex: 1;
    overflow-y: auto;
  }

  .conversation-item {
    padding: 1rem;
    border-bottom: 1px solid #f8f9fa;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .conversation-item:hover {
    background-color: #f8f9fa;
  }

  .conversation-item.selected {
    background-color: #e3f2fd;
    border-left: 3px solid #2196f3;
  }

  .conversation-item.unassigned {
    opacity: 0.7;
  }

  .conversation-avatar {
    flex-shrink: 0;
  }

  .avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #2196f3;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1rem;
  }

  .conversation-info {
    flex: 1;
    min-width: 0;
  }

  .conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.25rem;
  }

  .contact-name {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #212529;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread-badge {
    background-color: #f44336;
    color: white;
    border-radius: 50%;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 1.5rem;
    text-align: center;
  }

  .last-message {
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    color: #6c757d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .message-time {
    font-size: 0.75rem;
    color: #adb5bd;
  }

  .unassigned-badge {
    font-size: 0.75rem;
    color: #dc3545;
    font-weight: 500;
  }

  /* Área de mensajes */
  .messages-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #ffffff;
  }

  .conversation-header {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .conversation-details h2 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
  }

  .contact-phone {
    margin: 0;
    font-size: 0.9rem;
    color: #6c757d;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .status-badge.unassigned {
    background-color: #fff3cd;
    color: #856404;
  }

  .status-badge.assigned {
    background-color: #d4edda;
    color: #155724;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .loading-more {
    text-align: center;
    padding: 1rem;
    color: #6c757d;
    font-size: 0.9rem;
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }

  .message.own {
    align-self: flex-end;
  }

  .message:not(.own) {
    align-self: flex-start;
  }

  .message-content {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    position: relative;
  }

  .message.own .message-content {
    background-color: #2196f3;
    color: white;
  }

  .message:not(.own) .message-content {
    background-color: #f8f9fa;
    color: #212529;
  }

  .message.failed .message-content {
    background-color: #f8d7da;
    color: #721c24;
  }

  .message-content p {
    margin: 0;
    word-wrap: break-word;
  }

  .media-message {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .media-message img {
    max-width: 100%;
    border-radius: 0.5rem;
  }

  .document-preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 0.5rem;
  }

  .document-icon {
    font-size: 1.5rem;
  }

  .document-name {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .media-message .media-icon {
    font-size: 2rem;
  }

  .media-type {
    font-size: 0.8rem;
    opacity: 0.8;
  }

  .error-message {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background-color: rgba(220, 53, 69, 0.1);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .error-icon {
    font-size: 1rem;
  }

  .retry-button {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.8rem;
    cursor: pointer;
    margin-left: auto;
  }

  .retry-button:hover {
    background-color: #c82333;
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #6c757d;
  }

  .message.own .message-meta {
    justify-content: flex-end;
  }

  .message-status {
    font-size: 0.8rem;
  }

  .no-messages {
    text-align: center;
    color: #6c757d;
    padding: 2rem;
  }

  /* Input de mensaje */
  .message-input-container {
    border-top: 1px solid #e9ecef;
    padding: 1rem;
  }

  .message-input-container.disabled {
    opacity: 0.6;
  }

  .input-warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #856404;
  }

  .warning-icon {
    font-size: 1rem;
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .input-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .file-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .file-button:hover:not(:disabled) {
    background-color: #f8f9fa;
  }

  .file-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .selected-files {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .file-tag {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
    font-size: 0.8rem;
  }

  .remove-file {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    color: #6c757d;
  }

  .text-input-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .message-textarea {
    width: 100%;
    border: 1px solid #e9ecef;
    border-radius: 0.5rem;
    padding: 0.75rem;
    font-family: inherit;
    font-size: 0.9rem;
    resize: none;
    min-height: 2.5rem;
    max-height: 8rem;
  }

  .message-textarea:focus {
    outline: none;
    border-color: #2196f3;
  }

  .message-textarea:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .byte-counter {
    font-size: 0.8rem;
    color: #6c757d;
  }

  .byte-counter.warning {
    color: #ffc107;
  }

  .send-button {
    background-color: #2196f3;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background-color: #1976d2;
  }

  .send-button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  /* Estados de carga y error */
  .loading,
  .error,
  .empty-state {
    padding: 2rem;
    text-align: center;
    color: #6c757d;
  }

  .error {
    color: #dc3545;
  }

  .no-conversation-selected {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    color: #666;
    font-size: 0.875rem;
    font-style: italic;
  }

  .typing-dots {
    animation: typing 1.4s infinite;
    color: #007bff;
  }

  @keyframes typing {
    0%,
    20% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .typing-text {
    color: #666;
  }

  .attachment-caption {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #6c757d;
    font-style: italic;
  }

  /* Advertencia de conversación sin agente - Documento: info/1.md sección "Conversación Sin Agente Asignado" */
  .unassigned-warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 0.5rem;
    margin: 0.5rem 1rem;
    color: #856404;
  }

  .warning-icon {
    font-size: 1.1rem;
  }

  .warning-text {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .empty-state {
    color: #6c757d;
  }

  .empty-state h2 {
    margin-bottom: 0.5rem;
    color: #212529;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .chat-layout {
      flex-direction: column;
    }

    .conversations-sidebar {
      width: 100%;
      height: 40vh;
    }

    .messages-area {
      height: 60vh;
    }
  }
</style>
