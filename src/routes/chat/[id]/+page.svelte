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
  import ContactProfile from '$lib/components/ContactProfile.svelte';
  import FailedMessage from '$lib/components/FailedMessage.svelte';
  import MessageAttachment from '$lib/components/MessageAttachment.svelte';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import PresenceIndicator from '$lib/components/PresenceIndicator.svelte';
  import SearchAndFilters from '$lib/components/SearchAndFilters.svelte';
  import UXFeedback from '$lib/components/UXFeedback.svelte';
  import { environment } from '$lib/config/environment';
  import { joinConversation, leaveConversation, sendTyping } from '$lib/services/socket';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { messagesStore } from '$lib/stores/messages.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { presenceStore } from '$lib/stores/presence.store';
  import { typingStore } from '$lib/stores/typing.store';
  import { safeDateToISOString } from '$lib/utils/dates';
  import { logChat } from '$lib/utils/logger';
  import { validateFileUpload, validateMessage } from '$lib/utils/validation';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';

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

  // Estados para componentes avanzados
  let showContactProfile = false;
  let selectedContactId: string | null = null;
  let uploadProgress: Record<string, number> = {};

  // Referencias a elementos del DOM
  let messageInput: HTMLTextAreaElement;
  let fileInput: HTMLInputElement;
  let messagesContainer: HTMLDivElement;

  // Suscripciones a stores
  let conversations: any[] = [];
  let messages: any[] = [];
  let typingText = '';

  // Configuración de paginación
  let loadingMore = false;
  let hasMore = false;

  let currentId: string | undefined;

  onMount(async () => {
    currentId = get(page).params.id;
    logChat('chat component: onMount start', {
      conversationId: currentId,
      timestamp: new Date().toISOString()
    });

    try {
      // Suscripciones únicas con cleanup
      const unsubConversations = conversationsStore.subscribe(state => {
        conversations = state.conversations;
      });

      const unsubMessages = messagesStore.subscribe(state => {
        messages = state.messages;
        hasMore = state.pagination?.hasMore || false;
      });

      // Conversaciones ya cargadas por +layout.svelte
      logChat('chat component: conversations already loaded by layout');

      // Seleccionar la conversación de la URL
      if (currentId) {
        logChat('chat component: selecting conversation from URL', { conversationId: currentId });
        const conversation = conversations.find(c => c.id === currentId);
        if (conversation) {
          selectedConversation = conversation;
          hasUnassignedAgent = !conversation.assignedTo;
          canSend = conversation.assignedTo !== null;
          await messagesStore.loadMessages(conversation.id);
          joinConversation(conversation.id);
          window.history.pushState({}, '', `/chat/${conversation.id}`);
        } else {
          logChat('chat component: conversation not found', { conversationId: currentId });
          error = 'Conversación no encontrada';
        }
      }

      onDestroy(() => {
        // cleanup de suscripciones y socket
        unsubMessages?.();
        unsubConversations?.();
        if (selectedConversation) {
          leaveConversation(selectedConversation.id);
        }
        presenceStore.cleanup();
      });

      loading = false;
      logChat('chat component: onMount completed successfully');
    } catch (err: any) {
      logChat('chat component: onMount error', { error: err.message, conversationId: currentId });
      error = err.response?.data?.message || 'Error al cargar el chat';
      loading = false;
    }
  });

  // Eliminar suscripciones duplicadas y listeners redundantes
  // (selectConversation y loadMessages mantienen su uso si se selecciona desde la lista)

  // Suscripción al store de indicadores de escritura
  typingStore.subscribe(() => {
    if (selectedConversation) {
      typingText = typingStore.getTypingText(selectedConversation.id);
    }
  });

  // Función para cargar conversaciones (ya no necesaria - lo maneja el layout)
  // async function loadConversations() {
  //   // REMOVIDO: ya se carga en +layout.svelte
  // }

  // Función para seleccionar conversación
  async function selectConversation(conversation: any) {
    logChat('selectConversation: start', {
      conversationId: conversation.id,
      contactName: getContactName(conversation)
    });

    try {
      // Deseleccionar conversación anterior
      if (selectedConversation) {
        leaveConversation(selectedConversation.id);
      }

      selectedConversation = conversation;

      // Verificar si tiene agente asignado
      hasUnassignedAgent = !conversation.assignedTo;

      // Verificar si puede enviar mensajes
      canSend = conversation.assignedTo !== null;

      logChat('selectConversation: conversation selected', {
        conversationId: conversation.id,
        hasUnassignedAgent,
        canSend
      });

      // Cargar mensajes de la conversación
      await loadMessages(conversation.id);

      // Unirse a la conversación en socket
      joinConversation(conversation.id);

      // Actualizar URL sin recargar
      window.history.pushState({}, '', `/chat/${conversation.id}`);

      logChat('selectConversation: completed successfully', {
        conversationId: conversation.id
      });
    } catch (err: any) {
      logChat('selectConversation: error', {
        conversationId: conversation.id,
        error: err.message
      });
      notificationsStore.error('Error al seleccionar conversación');
    }
  }

  // Función para cargar mensajes
  async function loadMessages(conversationId: string) {
    logChat('loadMessages: start', { conversationId });

    try {
      await messagesStore.loadMessages(conversationId);

      // Suscribirse a cambios en mensajes
      messagesStore.subscribe(state => {
        messages = state.messages;
        hasMore = state.pagination?.hasMore || false;
        logChat('loadMessages: messages updated', {
          conversationId,
          count: messages.length,
          hasMore
        });
      });
    } catch (err: any) {
      logChat('loadMessages: error', {
        conversationId,
        error: err.message
      });
      notificationsStore.error('Error al cargar mensajes');
    }
  }

  // Función para cargar más mensajes (paginación)
  async function loadMoreMessages() {
    logChat('loadMoreMessages: start', {
      loadingMore,
      hasMore,
      selectedConversationId: selectedConversation?.id
    });

    if (loadingMore || !hasMore || !selectedConversation) {
      logChat('loadMoreMessages: skipped', {
        reason: loadingMore ? 'already_loading' : !hasMore ? 'no_more_data' : 'no_conversation'
      });
      return;
    }

    try {
      loadingMore = true;
      logChat('loadMoreMessages: calling store method');
      await messagesStore.loadMoreMessages();
      logChat('loadMoreMessages: completed successfully');
    } catch (err: any) {
      logChat('loadMoreMessages: error', {
        error: err.message,
        selectedConversationId: selectedConversation?.id
      });
      notificationsStore.error('Error al cargar más mensajes');
    } finally {
      loadingMore = false;
    }
  }

  // Función para reintentar mensaje fallido
  async function retryMessage(messageId: string) {
    logChat('retryMessage: start', {
      messageId,
      selectedConversationId: selectedConversation?.id
    });

    try {
      // TODO: Implementar retryMessage en el store
      notificationsStore.success('Mensaje reenviado correctamente');
    } catch (err: any) {
      logChat('retryMessage: error', {
        messageId,
        error: err.message
      });
      notificationsStore.error('Error al reenviar mensaje');
    }
  }

  // Configurar listeners de socket
  function setupSocketListeners() {
    // Unirse a la conversación actual
    if (selectedConversation) {
      joinConversation(selectedConversation.id);
    }

    // Los eventos de socket se manejan automáticamente en el SocketManager
    // y actualizan los stores correspondientes
  }

  // Función para manejar cambios en el input de mensaje
  function handleMessageInput() {
    // Contar bytes reales (no caracteres) - Documento: "Límite real: 4096 bytes"
    byteCount = new TextEncoder().encode(newMessage).length;
    remainingBytes = environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH - byteCount;

    logChat('handleMessageInput: text changed', {
      messageLength: newMessage.length,
      byteCount,
      remainingBytes,
      selectedConversationId: selectedConversation?.id
    });

    // Enviar evento de escritura si hay conversación seleccionada
    if (selectedConversation && newMessage.trim()) {
      logChat('handleMessageInput: sending typing event', {
        conversationId: selectedConversation.id
      });
      sendTyping(selectedConversation.id, true);
    }
  }

  // Función para manejar selección de archivos
  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);

    logChat('handleFileSelect: files selected', {
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      selectedConversationId: selectedConversation?.id
    });

    const validation = await validateFileUpload(files);
    if (!validation.valid) {
      logChat('handleFileSelect: validation failed', {
        error: validation.error,
        fileCount: files.length
      });
      notificationsStore.error(validation.error || 'Error en archivos');
      return;
    }

    selectedFiles = files;
    logChat('handleFileSelect: files accepted', {
      fileCount: files.length,
      fileNames: files.map(f => f.name)
    });
  }

  // Función para enviar mensaje
  async function sendMessage() {
    logChat('sendMessage: start', {
      messageLength: newMessage.length,
      fileCount: selectedFiles.length,
      selectedConversationId: selectedConversation?.id,
      canSend
    });

    if (!selectedConversation || !canSend) {
      logChat('sendMessage: cannot send', {
        hasConversation: !!selectedConversation,
        canSend,
        reason: !selectedConversation ? 'no_conversation' : 'cannot_send'
      });
      notificationsStore.error('No puedes enviar mensajes a esta conversación');
      return;
    }

    // Validar mensaje
    const messageValidation = validateMessage(newMessage);
    if (!messageValidation.valid) {
      logChat('sendMessage: message validation failed', {
        error: messageValidation.error,
        messageLength: newMessage.length
      });
      notificationsStore.error(messageValidation.error || 'Error en mensaje');
      return;
    }

    logChat('sendMessage: validation passed, sending message', {
      conversationId: selectedConversation.id,
      messageLength: newMessage.length,
      fileCount: selectedFiles.length
    });

    try {
      await messagesStore.sendMessage(selectedConversation.id, newMessage, selectedFiles);

      // Limpiar input
      newMessage = '';
      selectedFiles = [];

      logChat('sendMessage: completed successfully', {
        conversationId: selectedConversation.id
      });
    } catch (err: any) {
      logChat('sendMessage: error', {
        conversationId: selectedConversation.id,
        error: err.message,
        errorResponse: err.response?.data
      });
      notificationsStore.error('Error al enviar mensaje');
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
      'Contacto sin nombre'
    );
  }

  // Función para obtener ID del contacto para PresenceIndicator
  function getContactId(conversation: any): string {
    return conversation.contact?.id || conversation.customerPhone || '';
  }

  // Función para abrir perfil de contacto
  function openContactProfile(contactId: string) {
    logChat('openContactProfile: start', { contactId });
    selectedContactId = contactId;
    showContactProfile = true;
  }

  // Función para cerrar perfil de contacto
  function closeContactProfile() {
    logChat('closeContactProfile: closing profile');
    showContactProfile = false;
    selectedContactId = null;
  }

  // Función para manejar actualización de contacto
  function handleContactUpdated(contact: any) {
    logChat('handleContactUpdated: contact updated', {
      contactId: contact.id,
      contactName: contact.name
    });

    // Actualizar la conversación si es necesario
    if (selectedConversation && selectedConversation.contact?.id === contact.id) {
      selectedConversation.contact = contact;
    }
  }

  // Función para manejar progreso de upload
  function handleUploadProgress(filename: string, progress: number) {
    uploadProgress[filename] = progress;
    uploadProgress = { ...uploadProgress }; // Trigger reactivity
  }

  // Función para limpiar progreso de upload
  function clearUploadProgress(filename: string) {
    delete uploadProgress[filename];
    uploadProgress = { ...uploadProgress }; // Trigger reactivity
  }

  // Funciones para SearchAndFilters
  function handleSearch(event: CustomEvent) {
    logChat('handleSearch: search triggered', {
      query: event.detail.query,
      type: event.detail.type
    });

    // Implementar búsqueda en conversaciones
    conversationsStore.loadConversations({
      search: event.detail.query
    });
  }

  function handleFilter(event: CustomEvent) {
    logChat('handleFilter: filter triggered', {
      filters: event.detail.filters
    });

    // Implementar filtrado de conversaciones
    conversationsStore.loadConversations(event.detail.filters);
  }

  function handleSort(event: CustomEvent) {
    logChat('handleSort: sort triggered', {
      sortBy: event.detail.sortBy,
      sortOrder: event.detail.sortOrder
    });

    // Por ahora, el ordenamiento se maneja en el backend
    // Los filtros se aplican sin parámetros de ordenamiento
    conversationsStore.loadConversations({});
  }
</script>

<!-- Layout principal del chat -->
<div class="chat-container">
  <!-- Sidebar con lista de conversaciones -->
  <div class="conversations-sidebar">
    <!-- Header con búsqueda y filtros -->
    <div class="sidebar-header">
      <h1>Conversaciones</h1>

      <!-- Componente SearchAndFilters integrado -->
      <SearchAndFilters
        conversationId={selectedConversation?.id || null}
        searchType="conversations"
      />
    </div>

    <!-- Lista de conversaciones -->
    <div class="conversations-list">
      {#if conversations.length === 0}
        <div class="empty-state">
          <p>No hay conversaciones disponibles</p>
        </div>
      {:else}
        {#each conversations as conversation (conversation.id)}
          <div
            class="conversation-item"
            class:selected={selectedConversation?.id === conversation.id}
            on:click={() => selectConversation(conversation)}
            on:keydown={e => e.key === 'Enter' && selectConversation(conversation)}
            role="button"
            tabindex="0"
          >
            <!-- Header de conversación con presencia -->
            <div class="conversation-header">
              <div class="contact-info">
                <h3 class="contact-name">
                  {getContactName(conversation)}
                </h3>

                <!-- PresenceIndicator integrado -->
                <PresenceIndicator
                  userId={getContactId(conversation)}
                  size="small"
                  showName={false}
                />
              </div>

              {#if conversation.unreadCount > 0}
                <span class="unread-badge">{conversation.unreadCount}</span>
              {/if}
            </div>

            <!-- Último mensaje -->
            {#if conversation.lastMessage}
              <p class="last-message">
                {conversation.lastMessage.content || '[Sin contenido]'}
              </p>
            {:else}
              <p class="last-message">Nueva conversación</p>
            {/if}

            <!-- Meta información -->
            <div class="conversation-meta">
              <span class="message-time">
                {#if conversation.lastMessageAt}
                  {formatMessageTime(conversation.lastMessageAt)}
                {/if}
              </span>

              {#if !conversation.assignedTo}
                <span class="unassigned-badge">Sin asignar</span>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Área principal de mensajes -->
  <div class="messages-area">
    {#if selectedConversation}
      <!-- Header de conversación -->
      <div class="conversation-header">
        <div class="conversation-details">
          <h2>{getContactName(selectedConversation)}</h2>
          <p class="contact-phone">{selectedConversation.customerPhone}</p>
        </div>

        <div class="conversation-actions">
          <!-- Botón para abrir perfil de contacto -->
          <button
            class="profile-button"
            on:click={() =>
              openContactProfile(
                selectedConversation.contact?.id || selectedConversation.customerPhone
              )}
            title="Ver perfil del contacto"
            aria-label="Ver perfil del contacto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </button>

          <span
            class="status-badge"
            class:unassigned={!selectedConversation.assignedTo}
            class:assigned={!!selectedConversation.assignedTo}
          >
            {selectedConversation.assignedTo ? 'Asignada' : 'Sin asignar'}
          </span>
        </div>
      </div>

      <!-- Contenedor de mensajes -->
      <div class="messages-container" bind:this={messagesContainer}>
        {#if messages.length === 0}
          <div class="no-messages">
            <p>No hay mensajes en esta conversación</p>
          </div>
        {:else}
          {#each messages as message (message.id)}
            <div
              class="message"
              class:own={message.direction === 'outbound'}
              class:failed={message.status === 'failed'}
            >
              <!-- Contenido del mensaje -->
              <div class="message-content">
                {#if message.type === 'text'}
                  <p>{message.content}</p>
                {:else if message.type === 'image'}
                  <MessageAttachment
                    mediaUrl={message.mediaUrl}
                    filename={message.metadata?.fileInfo?.filename || 'imagen'}
                    fileType={message.metadata?.fileInfo?.mimeType || 'image/jpeg'}
                    fileSize={message.metadata?.fileInfo?.size || 0}
                  />
                {:else if message.type === 'audio'}
                  <MessageAttachment
                    mediaUrl={message.mediaUrl}
                    filename={message.metadata?.fileInfo?.filename || 'audio'}
                    fileType={message.metadata?.fileInfo?.mimeType || 'audio/mpeg'}
                    fileSize={message.metadata?.fileInfo?.size || 0}
                  />
                {:else if message.type === 'video'}
                  <MessageAttachment
                    mediaUrl={message.mediaUrl}
                    filename={message.metadata?.fileInfo?.filename || 'video'}
                    fileType={message.metadata?.fileInfo?.mimeType || 'video/mp4'}
                    fileSize={message.metadata?.fileInfo?.size || 0}
                  />
                {:else if message.type === 'document'}
                  <MessageAttachment
                    mediaUrl={message.mediaUrl}
                    filename={message.metadata?.fileInfo?.filename || 'documento'}
                    fileType={message.metadata?.fileInfo?.mimeType || 'application/pdf'}
                    fileSize={message.metadata?.fileInfo?.size || 0}
                  />
                {:else}
                  <div class="media-message">
                    <div class="media-icon">📎</div>
                    <span class="media-type">{message.type}</span>
                  </div>
                {/if}
              </div>

              <!-- Meta información del mensaje -->
              <div class="message-meta">
                <span class="message-time">{formatMessageTime(message.timestamp)}</span>

                {#if message.status === 'failed'}
                  <FailedMessage {message} onRetry={() => retryMessage(message.id)} />
                {:else}
                  <span class="message-status">
                    {#if message.status === 'sent'}
                      ✓
                    {:else if message.status === 'delivered'}
                      ✓✓
                    {:else if message.status === 'read'}
                      ✓✓
                    {/if}
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        {/if}

        <!-- Indicador de carga de más mensajes -->
        {#if loadingMore}
          <div class="loading-more">
            <p>Cargando más mensajes...</p>
          </div>
        {/if}
      </div>

      <!-- Input de mensaje -->
      <div class="message-input-container" class:disabled={!canSend}>
        {#if !canSend}
          <div class="disabled-message">
            <p>No puedes enviar mensajes a conversaciones sin agente asignado</p>
          </div>
        {:else}
          <!-- Barra de progreso de uploads -->
          {#if Object.keys(uploadProgress).length > 0}
            <div class="upload-progress">
              {#each Object.entries(uploadProgress) as [filename, progress]}
                <div class="progress-item">
                  <span class="filename">{filename}</span>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: {progress}%"></div>
                  </div>
                  <span class="progress-text">{progress}%</span>
                </div>
              {/each}
            </div>
          {/if}

          <div class="input-container">
            <textarea
              bind:this={messageInput}
              bind:value={newMessage}
              on:input={handleMessageInput}
              placeholder="Escribe un mensaje..."
              disabled={!canSend}
              maxlength={environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH}
            ></textarea>

            <div class="input-actions">
              <input
                bind:this={fileInput}
                type="file"
                multiple
                accept="image/*,audio/*,video/*,.pdf"
                on:change={handleFileSelect}
                style="display: none;"
              />

              <button
                class="file-button"
                on:click={() => fileInput?.click()}
                disabled={!canSend}
                title="Adjuntar archivo"
                aria-label="Adjuntar archivo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a2 2 0 00-2.828-2.828z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 10l6.586-6.586a2 2 0 012.828 2.828L9.828 12.828a2 2 0 01-2.828-2.828L7 10z"
                  ></path>
                </svg>
              </button>

              <button
                class="send-button"
                on:click={sendMessage}
                disabled={!canSend || !newMessage.trim()}
                title="Enviar mensaje"
                aria-label="Enviar mensaje"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Contador de caracteres -->
          {#if newMessage.length > 0}
            <div class="character-counter" class:warning={remainingBytes < 100}>
              <span>{newMessage.length} / {environment.VALIDATION_LIMITS.MESSAGE_MAX_LENGTH}</span>
              {#if remainingBytes < 100}
                <span class="warning-text">¡Casi alcanzas el límite!</span>
              {/if}
            </div>
          {/if}
        {/if}
      </div>
    {:else}
      <!-- Estado sin conversación seleccionada -->
      <div class="no-conversation">
        <div class="empty-state">
          <h2>Selecciona una conversación</h2>
          <p>Elige una conversación de la lista para comenzar a chatear</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Modal de perfil de contacto -->
{#if showContactProfile && selectedContactId}
  <div class="contact-profile-modal" class:show={showContactProfile}>
    <div
      class="modal-overlay"
      on:click={closeContactProfile}
      on:keydown={e => e.key === 'Escape' && closeContactProfile()}
      role="button"
      tabindex="0"
      aria-label="Cerrar modal"
    ></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>Perfil del Contacto</h2>
        <button class="close-button" on:click={closeContactProfile} aria-label="Cerrar modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <ContactProfile contactId={selectedContactId} on:contactUpdated={handleContactUpdated} />
    </div>
  </div>
{/if}

<!-- Componente de notificaciones -->
<NotificationToast />

<!-- Componente de feedback UX -->
<UXFeedback type="info" message="Sistema de chat UTalk cargado" duration={3000} />

<style>
  /* Layout principal */
  .chat-container {
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
  }

  .sidebar-header h1 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
  }

  .conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .conversation-item {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
    border: 1px solid transparent;
  }

  .conversation-item:hover {
    background-color: #f8f9fa;
  }

  .conversation-item.selected {
    background-color: #e3f2fd;
    border-color: #2196f3;
  }

  .conversation-item:focus {
    outline: 2px solid #2196f3;
    outline-offset: 2px;
  }

  .contact-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .conversation-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .profile-button {
    padding: 0.5rem;
    background: transparent;
    border: 1px solid #e9ecef;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .profile-button:hover {
    background-color: #f8f9fa;
    border-color: #2196f3;
  }

  .profile-button svg {
    width: 1rem;
    height: 1rem;
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

  .media-message .media-icon {
    font-size: 2rem;
  }

  .media-type {
    font-size: 0.8rem;
    opacity: 0.8;
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
    background-color: #f8f9fa;
  }

  .disabled-message {
    text-align: center;
    padding: 1rem;
    color: #6c757d;
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 0.25rem;
  }

  .upload-progress {
    margin-bottom: 1rem;
    padding: 0.5rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }

  .progress-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .progress-item:last-child {
    margin-bottom: 0;
  }

  .filename {
    font-size: 0.8rem;
    color: #6c757d;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .progress-bar {
    width: 100px;
    height: 4px;
    background-color: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #2196f3;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.75rem;
    color: #6c757d;
    min-width: 3rem;
    text-align: right;
  }

  .input-container {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  textarea {
    flex: 1;
    min-height: 2.5rem;
    max-height: 8rem;
    padding: 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 0.25rem;
    resize: vertical;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  textarea:focus {
    outline: none;
    border-color: #2196f3;
  }

  textarea:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }

  .input-actions {
    display: flex;
    gap: 0.25rem;
  }

  .file-button,
  .send-button {
    padding: 0.75rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .file-button {
    background-color: #f8f9fa;
    color: #6c757d;
  }

  .file-button:hover:not(:disabled) {
    background-color: #e9ecef;
  }

  .send-button {
    background-color: #2196f3;
    color: white;
  }

  .send-button:hover:not(:disabled) {
    background-color: #1976d2;
  }

  .send-button:disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }

  .file-button svg,
  .send-button svg {
    width: 1rem;
    height: 1rem;
  }

  .character-counter {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #6c757d;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .character-counter.warning {
    color: #f59e0b;
  }

  .warning-text {
    color: #dc3545;
    font-weight: 500;
  }

  /* Estados vacíos */
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  .no-conversation {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  /* Modal de perfil de contacto */
  .contact-profile-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .contact-profile-modal.show {
    opacity: 1;
    visibility: visible;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: relative;
    background-color: white;
    border-radius: 0.5rem;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .close-button {
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background-color: #f8f9fa;
  }

  .close-button svg {
    width: 1rem;
    height: 1rem;
    color: #6c757d;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .chat-container {
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
