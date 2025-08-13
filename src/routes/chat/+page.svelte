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
  import CanalesPanel from '$lib/components/chat/CanalesPanel.svelte';
  import { authStore } from '$lib/stores/auth.store';
  import { conversationsStore } from '$lib/stores/conversations.store';
  import { messagesStore } from '$lib/stores/messages.store';
  import { notificationsStore } from '$lib/stores/notifications.store';
  import { onDestroy, onMount } from 'svelte';

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
  let unsubscribe: (() => void) | undefined;
  let activeTab = 'details'; // Para el panel Details+Copilot
  let activeFilter = 'all'; // Para los tabs de filtro de conversaciones
  let notificationsEnabled = true; // Toggle de notificaciones
  let reportsEnabled = false; // Toggle de reportes
  let autoFollowUpEnabled = true; // Toggle de auto-seguimiento
  let copilotSubTab = 'suggestions'; // Para el sub-tab del Copilot
  let copilotQuestion = ''; // Para la pregunta del Copilot
  let searchQuery = ''; // Para la búsqueda de conversaciones
  let filteredConversations: any[] = []; // Conversaciones filtradas
  let newTagInput = ''; // Para agregar nuevos tags
  let showTagInput = false; // Para mostrar/ocultar input de tag
  let searchTimeout: NodeJS.Timeout | null = null; // Para debounce de búsqueda
  let isSearching = false; // Para mostrar loading en búsqueda
  let isFiltering = false; // Para mostrar loading en filtros
  let isUpdatingTags = false; // Para mostrar loading en tags
  let conversationsCache: any[] = []; // Cache de conversaciones
  let lastCacheUpdate = 0; // Timestamp del último cache

  // Cargar estados de toggles desde localStorage
  onMount(() => {
    // Cargar estados guardados
    const savedNotifications = localStorage.getItem('chat_notifications_enabled');
    const savedReports = localStorage.getItem('chat_reports_enabled');
    const savedAutoFollowUp = localStorage.getItem('chat_auto_followup_enabled');

    if (savedNotifications !== null) {
      notificationsEnabled = JSON.parse(savedNotifications);
    }
    if (savedReports !== null) {
      reportsEnabled = JSON.parse(savedReports);
    }
    if (savedAutoFollowUp !== null) {
      autoFollowUpEnabled = JSON.parse(savedAutoFollowUp);
    }

    // Cargar cache de conversaciones
    loadConversationsCache();
  });

  // Funciones de cache
  function loadConversationsCache() {
    try {
      const cached = localStorage.getItem('chat_conversations_cache');
      const cacheTime = localStorage.getItem('chat_conversations_cache_time');

      if (cached && cacheTime) {
        conversationsCache = JSON.parse(cached);
        lastCacheUpdate = parseInt(cacheTime);

        // Usar cache si tiene menos de 5 minutos
        const now = Date.now();
        if (now - lastCacheUpdate < 5 * 60 * 1000) {
          conversations = conversationsCache;
          updateFilteredConversations();
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error loading conversations cache:', error);
    }
  }

  function saveConversationsCache() {
    try {
      localStorage.setItem('chat_conversations_cache', JSON.stringify(conversations));
      localStorage.setItem('chat_conversations_cache_time', Date.now().toString());
      conversationsCache = conversations;
      lastCacheUpdate = Date.now();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error saving conversations cache:', error);
    }
  }

  function clearConversationsCache() {
    try {
      localStorage.removeItem('chat_conversations_cache');
      localStorage.removeItem('chat_conversations_cache_time');
      conversationsCache = [];
      lastCacheUpdate = 0;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Error clearing conversations cache:', error);
    }
  }

  // Función para guardar estado de toggle
  function saveToggleState(key: string, value: boolean) {
    localStorage.setItem(`chat_${key}_enabled`, JSON.stringify(value));
  }

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

  function onItemKeydown(event: globalThis.KeyboardEvent, c: any) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      openConversation(c);
    }
  }

  onMount(() => {
    // Suscribirse al store de conversaciones
    unsubscribe = conversationsStore.subscribe(state => {
      conversations = state.conversations ?? [];
      // Guardar en cache cuando se actualicen las conversaciones
      if (conversations.length > 0) {
        saveConversationsCache();
      }
      // eslint-disable-next-line no-console
      console.info('UI_CONV_LEN', conversations?.length ?? -1);
    });

    // Verificar si el usuario está autenticado
    authStore.subscribe(state => {
      if (state.isAuthenticated && state.user) {
        loading = false;
        // NO cargar conversaciones aquí - ya se cargan en +layout.svelte
      } else if (!state.isAuthenticated) {
        // Redirigir al login si no está autenticado
        goto('/login');
      }
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  // REMOVIDO: loadConversations() - ya se carga en +layout.svelte
  // Evita doble fetch y duplicación de llamadas

  async function loadMessages(conversationId: string) {
    try {
      await messagesStore.loadMessages(conversationId);

      // Suscribirse a los mensajes
      messagesStore.subscribe(state => {
        messages = state.messages;
      });
    } catch (err: any) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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

  function switchTab(tab: string) {
    activeTab = tab;
  }

  function setActiveFilter(filter: string) {
    activeFilter = filter;
    isFiltering = true;
    updateFilteredConversations();
    setTimeout(() => {
      isFiltering = false;
    }, 500);
  }

  function updateFilteredConversations() {
    let currentUserId: string | undefined;
    authStore.subscribe(state => {
      currentUserId = state.user?.id;
    });

    filteredConversations = conversationsStore.getFilteredConversations(
      activeFilter,
      searchQuery,
      currentUserId
    );
  }

  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    isSearching = true;

    // Debounce: cancelar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Nuevo timeout de 300ms
    searchTimeout = setTimeout(() => {
      updateFilteredConversations();
      isSearching = false;
    }, 300);
  }

  // Reactive statement para actualizar conversaciones filtradas
  $: if (conversations.length > 0) {
    updateFilteredConversations();
  }

  // Usar filteredConversations en lugar de conversations
  $: displayConversations =
    filteredConversations.length > 0 ? filteredConversations : conversations;

  function setCopilotSubTab(tab: string) {
    copilotSubTab = tab;
  }

  // Funciones del Copilot
  function copySuggestion(text: string) {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.clipboard) {
      window.navigator.clipboard
        .writeText(text)
        .then(() => {
          notificationsStore.success('Sugerencia copiada al portapapeles', 3000);
        })
        .catch(() => {
          notificationsStore.error('Error al copiar la sugerencia', 3000);
        });
    }
  }

  function improveSuggestion() {
    notificationsStore.info('Funcionalidad de mejora en desarrollo', 3000);
  }

  function sendCopilotMessage() {
    if (!copilotQuestion.trim()) return;

    notificationsStore.success('Mensaje enviado al Copilot', 3000);
    copilotQuestion = '';
  }

  // Función para formatear fechas de manera legible
  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
    }
  }

  // Manejar eventos del CanalesPanel
  function handleCanalesSearch(event: CustomEvent) {
    const { query } = event.detail;
    searchQuery = query;
    updateFilteredConversations();
  }

  function handleCanalesFilter(event: CustomEvent) {
    const { category } = event.detail;

    // Mapear categorías del CanalesPanel a filtros de la lista
    switch (category) {
      case 'all':
        activeFilter = 'all';
        break;
      case 'assigned':
        activeFilter = 'asig';
        break;
      case 'unanswered':
        activeFilter = 'new';
        break;
      case 'open':
        activeFilter = 'all'; // Mostrar todas las abiertas
        break;
    }

    updateFilteredConversations();
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

  // Suscribirse al trigger de auto-scroll del store
  let lastAddedAt = 0;
  messagesStore.subscribeLastAdded(timestamp => {
    if (timestamp > lastAddedAt && selectedConversation) {
      lastAddedAt = timestamp;
      // Solo hacer scroll si el usuario está cerca del final
      if (messagesContainer) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

        if (isNearBottom) {
          setTimeout(() => {
            messagesContainer.scrollTo({
              top: messagesContainer.scrollHeight,
              behavior: 'smooth'
            });
          }, 100);
        }
      }
    }
  });

  // Funciones para manejar tags
  function addTag() {
    if (!newTagInput.trim() || !selectedConversation) return;

    const tag = newTagInput.trim();

    // Verificar si el tag ya existe
    if (selectedConversation.tags && selectedConversation.tags.includes(tag)) {
      notificationsStore.error('Este tag ya existe', 3000);
      return;
    }

    isUpdatingTags = true;

    // Agregar tag a la conversación
    if (!selectedConversation.tags) {
      selectedConversation.tags = [];
    }
    selectedConversation.tags.push(tag);

    // TODO: Llamar API para guardar tag en backend
    setTimeout(() => {
      notificationsStore.success(`Tag "${tag}" agregado`, 3000);
      isUpdatingTags = false;
    }, 500);

    newTagInput = '';
    showTagInput = false;
  }

  function removeTag(tagToRemove: string) {
    if (!selectedConversation || !selectedConversation.tags) return;

    isUpdatingTags = true;

    selectedConversation.tags = selectedConversation.tags.filter(
      (tag: string) => tag !== tagToRemove
    );

    // TODO: Llamar API para remover tag del backend
    setTimeout(() => {
      notificationsStore.success(`Tag "${tagToRemove}" removido`, 3000);
      isUpdatingTags = false;
    }, 500);
  }

  function toggleTagInput() {
    showTagInput = !showTagInput;
    if (showTagInput) {
      // Focus en el input después de que se renderice
      setTimeout(() => {
        const input = document.querySelector('.tag-input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }
</script>

<div class="chat-container">
  {#if loading}
    <div class="loading-state">
      <div class="chat-layout">
        <!-- Skeleton para Canales -->
        <div class="canales-panel">
          <div class="panel-header">
            <div class="skeleton-title"></div>
          </div>
          <div class="canales-content">
            <div class="skeleton-search"></div>
            <div class="skeleton-categories">
              <div class="skeleton-category"></div>
              <div class="skeleton-category"></div>
              <div class="skeleton-category"></div>
              <div class="skeleton-category"></div>
            </div>
          </div>
        </div>

        <!-- Skeleton para Lista de Conversaciones -->
        <div class="conversations-panel">
          <div class="panel-header">
            <div class="skeleton-title"></div>
            <div class="skeleton-button"></div>
          </div>
          <div class="conversations-filters">
            <div class="skeleton-search"></div>
            <div class="skeleton-tabs">
              <div class="skeleton-tab"></div>
              <div class="skeleton-tab"></div>
              <div class="skeleton-tab"></div>
              <div class="skeleton-tab"></div>
            </div>
          </div>
          <div class="conversations-list">
            <div class="skeleton-conversation"></div>
            <div class="skeleton-conversation"></div>
            <div class="skeleton-conversation"></div>
            <div class="skeleton-conversation"></div>
            <div class="skeleton-conversation"></div>
          </div>
        </div>

        <!-- Skeleton para Chat -->
        <div class="messages-panel">
          <div class="messages-header">
            <div class="skeleton-chat-header"></div>
          </div>
          <div class="messages-area">
            <div class="skeleton-messages">
              <div class="skeleton-message"></div>
              <div class="skeleton-message"></div>
              <div class="skeleton-message"></div>
            </div>
          </div>
        </div>

        <!-- Skeleton para Details/Copilot -->
        <div class="details-copilot-panel">
          <div class="panel-header">
            <div class="skeleton-tabs">
              <div class="skeleton-tab"></div>
              <div class="skeleton-tab"></div>
            </div>
          </div>
          <div class="details-copilot-content">
            <div class="skeleton-details">
              <div class="skeleton-info-item"></div>
              <div class="skeleton-info-item"></div>
              <div class="skeleton-info-item"></div>
              <div class="skeleton-info-item"></div>
              <div class="skeleton-info-item"></div>
              <div class="skeleton-info-item"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else if error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Error al cargar conversaciones</h2>
      <p>{error}</p>
      <div class="error-actions">
        <button
          type="button"
          class="retry-button"
          on:click={() => conversationsStore.loadConversations()}
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
  {:else}
    <!-- Estructura completa del chat - 4 columnas -->
    <div class="chat-layout">
      <!-- Columna 1: Canales -->
      <div class="canales-panel">
        <div class="panel-header">
          <h2 class="panel-title">Canales</h2>
        </div>
        <div class="canales-content">
          <CanalesPanel on:search={handleCanalesSearch} on:filter={handleCanalesFilter} />
        </div>
      </div>

      <!-- Columna 2: Lista de conversaciones -->
      <div class="conversations-panel">
        <div class="panel-header">
          <h2 class="panel-title">💬 Conversaciones</h2>
          <div class="header-actions">
            <button
              type="button"
              class="refresh-button"
              on:click={() => conversationsStore.loadConversations()}
            >
              🔄
            </button>
            <button
              type="button"
              class="clear-cache-button"
              on:click={clearConversationsCache}
              title="Limpiar cache"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Búsqueda y filtros -->
        <div class="conversations-filters">
          <div class="search-container">
            <input
              type="text"
              placeholder="Buscar..."
              class="search-input"
              bind:value={searchQuery}
              on:input={handleSearch}
            />
            {#if isSearching}
              <div class="search-loading">🔍</div>
            {/if}
          </div>

          <!-- Tabs de filtro -->
          <div class="filter-tabs">
            <button
              type="button"
              class="filter-tab"
              class:active={activeFilter === 'all'}
              on:click={() => setActiveFilter('all')}
              disabled={isFiltering}
            >
              {#if isFiltering && activeFilter === 'all'}⏳{/if} All
            </button>
            <button
              type="button"
              class="filter-tab"
              class:active={activeFilter === 'new'}
              on:click={() => setActiveFilter('new')}
              disabled={isFiltering}
            >
              {#if isFiltering && activeFilter === 'new'}⏳{/if} New
            </button>
            <button
              type="button"
              class="filter-tab"
              class:active={activeFilter === 'asig'}
              on:click={() => setActiveFilter('asig')}
              disabled={isFiltering}
            >
              {#if isFiltering && activeFilter === 'asig'}⏳{/if} Asig
            </button>
            <button
              type="button"
              class="filter-tab"
              class:active={activeFilter === 'urg'}
              on:click={() => setActiveFilter('urg')}
              disabled={isFiltering}
            >
              {#if isFiltering && activeFilter === 'urg'}⏳{/if} Urg
            </button>
          </div>
        </div>

        <div class="conversations-list" bind:this={conversationsContainer}>
          {#if displayConversations.length === 0}
            <!-- DEBUG-LOG-START(conversations-front) -->
            {(() => {
              if (
                typeof window !== 'undefined' &&
                window.location.search.includes('LOG_VERBOSE_CONVERSATIONS=true')
              ) {
                // eslint-disable-next-line no-console
                console.debug('[CONV][component][render:decision]', {
                  event: 'render:decision',
                  layer: 'component',
                  request: { url: '/conversations', method: 'GET', queryParams: {} },
                  response: {
                    status: null,
                    ok: !error,
                    itemsLength: displayConversations.length,
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
              {#if searchQuery.trim() || activeFilter !== 'all'}
                <h3>No se encontraron conversaciones</h3>
                <p>
                  {#if searchQuery.trim()}
                    No hay conversaciones que coincidan con "{searchQuery}"
                  {:else if activeFilter === 'new'}
                    No hay conversaciones nuevas sin contestar
                  {:else if activeFilter === 'asig'}
                    No tienes conversaciones asignadas
                  {:else if activeFilter === 'urg'}
                    No hay conversaciones urgentes
                  {/if}
                </p>
                <div class="empty-actions">
                  <button
                    type="button"
                    class="clear-filters-button"
                    on:click={() => {
                      searchQuery = '';
                      activeFilter = 'all';
                      updateFilteredConversations();
                    }}
                  >
                    🔄 Limpiar filtros
                  </button>
                </div>
              {:else}
                <h3>No hay conversaciones</h3>
                <p>Cuando recibas mensajes de clientes, aparecerán aquí.</p>
                <div class="empty-actions">
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
                      // TODO: Implementar addDemoConversation si es necesario
                      // eslint-disable-next-line no-console
                      console.debug('RT:DEMO_CONV', { conversationId: demoConversation.id });

                      // Redirigir a la conversación demo
                      window.location.href = '/chat/demo-conversation';
                    }}
                  >
                    🎯 Ver Demo Completa
                  </button>
                  <button
                    type="button"
                    class="refresh-button"
                    on:click={() => conversationsStore.loadConversations()}
                  >
                    🔄 Actualizar
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            {#each displayConversations as conversation}
              <div
                class="conversation-item"
                class:selected={selectedConversation?.id === conversation.id}
                role="button"
                tabindex="0"
                aria-label={`Abrir conversación con ${displayName(conversation)}`}
                on:click={() => openConversation(conversation)}
                on:keydown={e => onItemKeydown(e, conversation)}
              >
                <!-- Avatar y estado -->
                <div class="conversation-avatar-section">
                  <div class="conversation-avatar">
                    <span class="avatar-text">
                      {displayName(conversation).charAt(0) || 'C'}
                    </span>
                  </div>
                  <!-- Indicador de estado -->
                  <div
                    class="status-indicator"
                    class:status-open={conversation.status === 'open'}
                    class:status-pending={conversation.status === 'pending'}
                    class:status-resolved={conversation.status === 'resolved'}
                    class:status-archived={conversation.status === 'archived'}
                    class:priority-low={conversation.priority === 'low'}
                    class:priority-normal={conversation.priority === 'normal'}
                    class:priority-high={conversation.priority === 'high'}
                    class:priority-urgent={conversation.priority === 'urgent'}
                  ></div>
                </div>

                <!-- Contenido principal -->
                <div class="conversation-content">
                  <div class="conversation-header">
                    <h4 class="conversation-name">
                      {displayName(conversation)}
                    </h4>
                    <span class="conversation-time">
                      {conversation.lastMessageAt
                        ? new Date(conversation.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '--'}
                    </span>
                  </div>

                  <div class="conversation-preview">
                    {conversation.lastMessage?.content || 'Sin mensajes'}
                  </div>

                  <!-- Tags y badges -->
                  <div class="conversation-tags">
                    {#if conversation.tags && conversation.tags.length > 0}
                      {#each conversation.tags.slice(0, 2) as tag}
                        <span class="conversation-tag">{tag}</span>
                      {/each}
                    {/if}
                    {#if conversation.unreadCount > 0}
                      <span class="unread-badge">{conversation.unreadCount}</span>
                    {/if}
                  </div>
                </div>

                <!-- Agente asignado -->
                {#if conversation.assignedTo}
                  <div class="assigned-agent">
                    <div class="agent-avatar">
                      <span class="agent-initials">
                        {conversation.assignedTo.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>

      <!-- Panel central: Área de mensajes -->
      <div class="messages-panel">
        {#if selectedConversation}
          <div class="messages-header">
            <div class="chat-header-content">
              <!-- Avatar y información del cliente -->
              <div class="chat-client-info">
                <div class="chat-avatar">
                  <span class="chat-avatar-text">
                    {displayName(selectedConversation).charAt(0) || 'C'}
                  </span>
                </div>
                <div class="chat-details">
                  <h2 class="chat-title">{displayName(selectedConversation)}</h2>
                  <div class="chat-status">
                    <span class="status-dot online"></span>
                    <span class="status-text">
                      {selectedConversation.status === 'open' && 'en línea'}
                      {selectedConversation.status === 'pending' && 'pendiente'}
                      {selectedConversation.status === 'resolved' && 'resuelta'}
                      {selectedConversation.status === 'archived' && 'archivada'}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Tags y botones de acción -->
              <div class="chat-actions">
                <!-- Tags del cliente -->
                <div class="client-tags">
                  {#if selectedConversation.tags && selectedConversation.tags.length > 0}
                    {#each selectedConversation.tags as tag}
                      <button
                        type="button"
                        class="tag"
                        on:click={() => removeTag(tag as string)}
                        on:keydown={e => e.key === 'Enter' && removeTag(tag as string)}
                        title="Click para remover"
                        aria-label="Remover tag {tag}"
                      >
                        {#if isUpdatingTags}⏳{/if}
                        {tag} ✖
                      </button>
                    {/each}
                  {/if}
                  {#if selectedConversation.priority === 'high' || selectedConversation.priority === 'urgent'}
                    <span class="client-tag priority">Urgente</span>
                  {/if}
                  {#if selectedConversation.contact?.tags && selectedConversation.contact.tags.length > 0}
                    {#each selectedConversation.contact.tags.slice(0, 2) as tag}
                      <span class="client-tag contact-tag">{tag}</span>
                    {/each}
                  {/if}
                </div>

                <!-- Botones de acción -->
                <div class="action-buttons">
                  <button type="button" class="action-button" title="Llamar"> 📞 </button>
                  <button type="button" class="action-button" title="Añadir usuario"> 👤+ </button>
                  <button type="button" class="action-button" title="Marcar como favorito">
                    🔖
                  </button>
                  <button type="button" class="action-button" title="Más opciones"> ⋯ </button>
                </div>
              </div>
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
                      type="button"
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
                <p>Esta conversación aún no tiene mensajes. ¡Sé el primero en escribir!</p>
                <div class="empty-actions">
                  <button
                    type="button"
                    class="demo-message-button"
                    on:click={() => {
                      newMessage = 'Hola, ¿en qué puedo ayudarte?';
                    }}
                  >
                    ✨ Escribir mensaje de ejemplo
                  </button>
                </div>
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
                type="button"
                class="send-button"
                on:click={openFilePicker}
                title="Adjuntar"
                aria-label="Adjuntar"
                disabled={!canSend}>📎</button
              >
              <button
                type="button"
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
              <button type="button" class="send-button" disabled> 📤 </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Columna 4: Details y Copilot -->
      <div class="details-copilot-panel">
        <div class="panel-header">
          <div class="tabs-container">
            <button
              type="button"
              class="tab-button"
              class:active={activeTab === 'details'}
              on:click={() => switchTab('details')}
            >
              Details
            </button>
            <button
              type="button"
              class="tab-button"
              class:active={activeTab === 'copilot'}
              on:click={() => switchTab('copilot')}
            >
              Copilot
            </button>
          </div>
        </div>

        <div class="details-copilot-content">
          <!-- Tab Details -->
          <div class="tab-content" class:active={activeTab === 'details'}>
            {#if selectedConversation}
              <!-- Perfil del Cliente -->
              <div class="client-profile">
                <div class="client-header">
                  <div class="client-avatar">
                    <span class="client-avatar-text">
                      {displayName(selectedConversation).charAt(0) || 'C'}
                    </span>
                  </div>
                  <div class="client-info">
                    <h4 class="client-name">{displayName(selectedConversation)}</h4>
                    <div class="client-status-tags">
                      <span class="status-tag active">Activo</span>
                      <span class="status-tag channel">WhatsApp</span>
                    </div>
                  </div>
                </div>

                <!-- Información de Contacto -->
                <div class="contact-info">
                  <h5>Información de Contacto</h5>
                  <div class="info-item">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">
                      {selectedConversation.customerPhone ||
                        selectedConversation.contact?.phone ||
                        'Sin teléfono'}
                      <button type="button" class="copy-button" title="Copiar">📋</button>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Canal:</span>
                    <span class="info-value"
                      >{selectedConversation.contact?.channel || 'WhatsApp'}</span
                    >
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">
                      {selectedConversation.contact?.email || 'Sin email'}
                      {#if selectedConversation.contact?.email}
                        <button type="button" class="copy-button" title="Copiar">📋</button>
                      {/if}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value"
                      >{selectedConversation.contact?.company || 'Sin empresa'}</span
                    >
                  </div>
                  <div class="info-item">
                    <span class="info-label">Último contacto:</span>
                    <span class="info-value">
                      {selectedConversation.lastMessageAt
                        ? formatTimeAgo(selectedConversation.lastMessageAt)
                        : 'Sin contacto reciente'}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Cliente desde:</span>
                    <span class="info-value">
                      {selectedConversation.createdAt
                        ? formatTimeAgo(selectedConversation.createdAt)
                        : 'Fecha no disponible'}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">ID de Contacto:</span>
                    <span class="info-value">
                      {selectedConversation.contact?.id ||
                        selectedConversation.customerPhone?.replace('+', '') ||
                        'Sin ID'}
                      <button type="button" class="copy-button" title="Copiar">📋</button>
                    </span>
                  </div>
                </div>

                <!-- Etiquetas -->
                <div class="tags-section">
                  <h5>Etiquetas</h5>
                  <div class="tags-container">
                    {#if selectedConversation.tags && selectedConversation.tags.length > 0}
                      {#each selectedConversation.tags as tag}
                        <button
                          type="button"
                          class="tag"
                          on:click={() => removeTag(tag as string)}
                          on:keydown={e => e.key === 'Enter' && removeTag(tag as string)}
                          title="Click para remover"
                          aria-label="Remover tag {tag}"
                        >
                          {#if isUpdatingTags}⏳{/if}
                          {tag} ✖
                        </button>
                      {/each}
                    {/if}
                    {#if selectedConversation.contact?.tags && selectedConversation.contact.tags.length > 0}
                      {#each selectedConversation.contact.tags as tag}
                        <span class="tag contact-tag">{tag}</span>
                      {/each}
                    {/if}

                    {#if showTagInput}
                      <div class="tag-input-container">
                        <input
                          type="text"
                          class="tag-input"
                          placeholder="Nuevo tag..."
                          bind:value={newTagInput}
                          on:keydown={e => {
                            if (e.key === 'Enter') {
                              addTag();
                            } else if (e.key === 'Escape') {
                              showTagInput = false;
                              newTagInput = '';
                            }
                          }}
                        />
                        <button type="button" class="tag-add-btn" on:click={addTag}>✓</button>
                        <button
                          type="button"
                          class="tag-cancel-btn"
                          on:click={() => {
                            showTagInput = false;
                            newTagInput = '';
                          }}>✖</button
                        >
                      </div>
                    {/if}

                    <button type="button" class="add-tag-button" on:click={toggleTagInput}
                      >+ Añadir</button
                    >
                  </div>
                </div>

                <!-- Notificaciones y Configuración -->
                <div class="notifications-section">
                  <h5>Notificaciones y Configuración</h5>
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <span class="toggle-label">Notificaciones</span>
                      <span class="toggle-description"
                        >Recibir notificaciones de esta conversación</span
                      >
                    </div>
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        on:change={e => {
                          notificationsEnabled = (e.target as HTMLInputElement).checked;
                          saveToggleState('notifications', notificationsEnabled);
                        }}
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <span class="toggle-label">Reportes</span>
                      <span class="toggle-description">Incluir en reportes de actividad</span>
                    </div>
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        checked={reportsEnabled}
                        on:change={e => {
                          reportsEnabled = (e.target as HTMLInputElement).checked;
                          saveToggleState('reports', reportsEnabled);
                        }}
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="toggle-item">
                    <div class="toggle-info">
                      <span class="toggle-label">Auto-seguimiento</span>
                      <span class="toggle-description">Recordatorios automáticos</span>
                    </div>
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        checked={autoFollowUpEnabled}
                        on:change={e => {
                          autoFollowUpEnabled = (e.target as HTMLInputElement).checked;
                          saveToggleState('auto_followup', autoFollowUpEnabled);
                        }}
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <!-- Información de Conversación -->
                <div class="conversation-info">
                  <h5>Información de Conversación</h5>
                  <div class="info-item">
                    <span class="info-label">Estado:</span>
                    <span class="info-value status-{selectedConversation.status}">
                      {selectedConversation.status === 'open' && 'Abierta'}
                      {selectedConversation.status === 'pending' && 'Pendiente'}
                      {selectedConversation.status === 'resolved' && 'Resuelta'}
                      {selectedConversation.status === 'archived' && 'Archivada'}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Prioridad:</span>
                    <span class="info-value priority-{selectedConversation.priority}">
                      {selectedConversation.priority === 'low' && 'Baja'}
                      {selectedConversation.priority === 'normal' && 'Normal'}
                      {selectedConversation.priority === 'high' && 'Alta'}
                      {selectedConversation.priority === 'urgent' && 'Urgente'}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Mensajes sin leer:</span>
                    <span class="info-value">{selectedConversation.unreadCount || 0}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Total mensajes:</span>
                    <span class="info-value">{selectedConversation.messageCount || 0}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Asignado a:</span>
                    <span class="info-value">
                      {selectedConversation.assignedTo?.name || 'Sin asignar'}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Participantes:</span>
                    <span class="info-value">{selectedConversation.participants?.length || 0}</span>
                  </div>
                  {#if selectedConversation.metadata}
                    <div class="info-item">
                      <span class="info-label">Origen:</span>
                      <span class="info-value"
                        >{selectedConversation.metadata.source || 'Desconocido'}</span
                      >
                    </div>
                    <div class="info-item">
                      <span class="info-label">Auto-asignada:</span>
                      <span class="info-value"
                        >{selectedConversation.metadata.autoAssigned ? 'Sí' : 'No'}</span
                      >
                    </div>
                    <div class="info-item">
                      <span class="info-label">Favorita:</span>
                      <span class="info-value"
                        >{selectedConversation.metadata.favorite ? 'Sí' : 'No'}</span
                      >
                    </div>
                  {/if}
                </div>

                <!-- Integration Point -->
                <div class="integration-point">
                  <h5>INTEGRATION POINT</h5>
                  <p class="integration-text">
                    Datos mapeados desde Twilio: displayName, wa_id, subscribed, last_interaction
                  </p>
                </div>
              </div>
            {:else}
              <div class="empty-details">
                <div class="empty-icon">👤</div>
                <h4>Selecciona una conversación</h4>
                <p>Elige una conversación para ver los detalles del cliente</p>
              </div>
            {/if}
          </div>

          <!-- Tab Copilot -->
          <div class="tab-content" class:active={activeTab === 'copilot'}>
            <div class="copilot-container">
              <!-- Header del Copilot -->
              <div class="copilot-header">
                <h4>Copiloto IA</h4>
                <span class="mock-badge">Mock Mode</span>
              </div>

              <p class="copilot-description">Copilot is here to help. Just ask.</p>

              <!-- Sub-tabs -->
              <div class="copilot-sub-tabs">
                <button
                  type="button"
                  class="sub-tab-button"
                  class:active={copilotSubTab === 'suggestions'}
                  on:click={() => setCopilotSubTab('suggestions')}
                >
                  Sugerencias
                </button>
                <button
                  type="button"
                  class="sub-tab-button"
                  class:active={copilotSubTab === 'chat'}
                  on:click={() => setCopilotSubTab('chat')}
                >
                  Chat IA
                </button>
              </div>

              <!-- Contenido de Sugerencias -->
              {#if copilotSubTab === 'suggestions'}
                <div class="suggestions-content">
                  <!-- Sugerencia 1 -->
                  <div class="suggestion-card">
                    <div class="suggestion-header">
                      <h5>Confirmar cambio de dirección</h5>
                      <span class="confidence-badge high">Alta confianza</span>
                    </div>
                    <p class="suggestion-text">
                      Por supuesto, puedo ayudarte a cambiar la dirección de entrega. ¿Podrías
                      proporcionarme la nueva dirección completa?
                    </p>
                    <div class="suggestion-tags">
                      <span class="suggestion-tag">order_management</span>
                      <span class="suggestion-tag">shipping_policy</span>
                    </div>
                    <div class="suggestion-actions">
                      <button
                        type="button"
                        class="action-btn copy-btn"
                        on:click={() =>
                          copySuggestion(
                            'Por supuesto, puedo ayudarte a cambiar la dirección de entrega. ¿Podrías proporcionarme la nueva dirección completa?'
                          )}>Copiar</button
                      >
                      <button
                        type="button"
                        class="action-btn improve-btn"
                        on:click={improveSuggestion}>Mejorar</button
                      >
                    </div>
                  </div>

                  <!-- Sugerencia 2 -->
                  <div class="suggestion-card">
                    <div class="suggestion-header">
                      <h5>Ofrecer tracking</h5>
                      <span class="confidence-badge medium">Confianza media</span>
                    </div>
                    <p class="suggestion-text">
                      Te envío el enlace de seguimiento para que puedas monitorear tu pedido en
                      tiempo real:
                    </p>
                    <div class="suggestion-actions">
                      <button
                        type="button"
                        class="action-btn copy-btn"
                        on:click={() =>
                          copySuggestion(
                            'Te envío el enlace de seguimiento para que puedas monitorear tu pedido en tiempo real:'
                          )}>Copiar</button
                      >
                      <button
                        type="button"
                        class="action-btn improve-btn"
                        on:click={improveSuggestion}>Mejorar</button
                      >
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Contenido de Chat IA -->
              {#if copilotSubTab === 'chat'}
                <div class="chat-ai-content">
                  <div class="empty-chat-state">
                    <div class="chat-icon">💬</div>
                    <h5>Pregunta lo que necesites</h5>
                    <p>El copiloto está aquí para ayudarte</p>
                  </div>

                  <div class="chat-input-container">
                    <input
                      type="text"
                      placeholder="Escribe tu pregunta..."
                      class="chat-input"
                      bind:value={copilotQuestion}
                    />
                    <button type="button" class="send-chat-btn" on:click={sendCopilotMessage}
                      >📤</button
                    >
                  </div>
                </div>
              {/if}

              <!-- Footer -->
              <div class="copilot-footer">
                <span class="mock-mode-text">Modo simulado - sin backend real</span>
              </div>
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

  /* Layout del Chat - 4 columnas fijas */
  .chat-layout {
    display: grid;
    grid-template-columns: 150px 180px 1fr 320px;
    height: 100vh;
    background: white;
  }

  /* Columna 1: Canales */
  .canales-panel {
    border-right: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
  }

  .canales-content {
    flex: 1;
    padding: 1rem;
  }

  /* Columna 2: Panel de Conversaciones */
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

  .conversations-filters {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .search-container {
    position: relative;
    flex: 1;
  }

  .search-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #495057;
    background: #f8f9fa;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }

  .filter-tabs {
    display: flex;
    gap: 0.5rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    overflow: hidden;
  }

  .filter-tab {
    padding: 0.5rem 1rem;
    border: none;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .filter-tab.active {
    background: #667eea;
    color: white;
    border-bottom: 2px solid #667eea;
  }

  .filter-tab:hover:not(.active) {
    background: #e9ecef;
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

  .empty-conversations,
  .empty-messages,
  .empty-details {
    text-align: center;
    padding: 2rem 1rem;
    color: #6c757d;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-conversations h3,
  .empty-messages h3,
  .empty-details h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .empty-conversations p,
  .empty-messages p,
  .empty-details p {
    margin: 0 0 1.5rem 0;
    font-size: 0.9rem;
    max-width: 300px;
    line-height: 1.5;
  }

  .empty-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .demo-button,
  .refresh-button,
  .demo-message-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .demo-button {
    background: #667eea;
    color: white;
  }

  .demo-button:hover {
    background: #4956b3;
    transform: translateY(-1px);
  }

  .refresh-button {
    background: #6c757d;
    color: white;
  }

  .refresh-button:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }

  .demo-message-button {
    background: #28a745;
    color: white;
  }

  .demo-message-button:hover {
    background: #218838;
    transform: translateY(-1px);
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

  .conversation-item.selected {
    background: #e9ecef;
    border: 1px solid #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  }

  .conversation-avatar-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
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

  /* Indicadores de estado para conversaciones */
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    position: absolute;
    top: 0;
    right: 0;
  }

  .status-indicator.status-open {
    background: #28a745;
  }

  .status-indicator.status-pending {
    background: #ffc107;
  }

  .status-indicator.status-resolved {
    background: #6c757d;
  }

  .status-indicator.status-archived {
    background: #6c757d;
    opacity: 0.5;
  }

  /* Indicadores de prioridad */
  .status-indicator.priority-low {
    border: 2px solid #6c757d;
    background: transparent;
  }

  .status-indicator.priority-normal {
    border: 2px solid #17a2b8;
    background: transparent;
  }

  .status-indicator.priority-high {
    border: 2px solid #fd7e14;
    background: #fd7e14;
  }

  .status-indicator.priority-urgent {
    border: 2px solid #dc3545;
    background: #dc3545;
    box-shadow: 0 0 4px rgba(220, 53, 69, 0.5);
  }

  .conversation-content {
    flex: 1;
    min-width: 0;
  }

  .conversation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  .conversation-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-time {
    font-size: 0.75rem;
    color: #6c757d;
  }

  .conversation-preview {
    font-size: 0.8rem;
    color: #6c757d;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .conversation-tag {
    background: #e9ecef;
    color: #495057;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .unread-badge {
    background: #667eea;
    color: white;
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    border-radius: 10px;
    font-weight: bold;
  }

  .assigned-agent {
    margin-left: 0.5rem;
    flex-shrink: 0;
  }

  .agent-avatar {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #4c51bf 0%, #364fc7 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .agent-initials {
    color: white;
    font-weight: bold;
    font-size: 0.8rem;
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

  .chat-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .chat-client-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .chat-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .chat-avatar-text {
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .chat-details {
    display: flex;
    flex-direction: column;
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

  .chat-status {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: #6c757d;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .status-dot.online {
    background-color: #28a745; /* Green for online */
  }

  .status-dot.offline {
    background-color: #dc3545; /* Red for offline */
  }

  .chat-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .client-tags {
    display: flex;
    gap: 0.5rem;
  }

  .client-tag {
    background: #e9ecef;
    color: #495057;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .client-tag.vip {
    background: #ffc107; /* Yellow for VIP */
    color: #212529;
  }

  .client-tag.priority {
    background: #dc3545; /* Red for priority */
    color: white;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .action-button {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: #e9ecef;
    color: #495057;
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

  /* Columna 4: Panel Details y Copilot */
  .details-copilot-panel {
    border-left: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
  }

  .details-copilot-content {
    flex: 1;
    padding: 1rem;
  }

  .tabs-container {
    display: flex;
    border-bottom: 1px solid #e9ecef;
  }

  .tab-button {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    color: #6c757d;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab-button.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
    font-weight: 600;
  }

  .tab-button:hover:not(.active) {
    background: #f8f9fa;
  }

  .tab-content {
    display: none;
  }

  .tab-content.active {
    display: block;
  }

  .copilot-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .copilot-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .copilot-header h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
  }

  .mock-badge {
    background: #28a745;
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .copilot-description {
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 1rem;
  }

  .copilot-sub-tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 1rem;
  }

  .sub-tab-button {
    padding: 0.5rem 1rem;
    border: none;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .sub-tab-button.active {
    background: #667eea;
    color: white;
    border-bottom: 2px solid #667eea;
  }

  .sub-tab-button:hover:not(.active) {
    background: #e9ecef;
  }

  .suggestions-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .suggestion-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .suggestion-header h5 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
  }

  .confidence-badge {
    background: #e9ecef;
    color: #495057;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .confidence-badge.high {
    background: #e9ecef;
    color: #495057;
  }

  .confidence-badge.medium {
    background: #e9ecef;
    color: #495057;
  }

  .suggestion-text {
    font-size: 0.85rem;
    color: #495057;
    margin: 0;
  }

  .suggestion-tags {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .suggestion-tag {
    background: #e9ecef;
    color: #495057;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .suggestion-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: background-color 0.2s;
  }

  .action-btn.copy-btn {
    background: #6c757d;
    color: white;
  }

  .action-btn.copy-btn:hover {
    background: #5a6268;
  }

  .action-btn.improve-btn {
    background: #007bff;
    color: white;
  }

  .action-btn.improve-btn:hover {
    background: #0056b3;
  }

  .chat-ai-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .empty-chat-state {
    text-align: center;
    color: #6c757d;
  }

  .chat-icon {
    font-size: 4rem;
    margin-bottom: 0.5rem;
  }

  .empty-chat-state h5 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .empty-chat-state p {
    margin: 0;
    font-size: 0.875rem;
  }

  .chat-input-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .chat-input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
  }

  .send-chat-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .send-chat-btn:hover {
    background: #0056b3;
  }

  .copilot-footer {
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid #e9ecef;
  }

  .mock-mode-text {
    font-size: 0.75rem;
    color: #6c757d;
  }

  /* Estilos para el tab Details */
  .client-profile {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .client-header {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .client-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .client-avatar-text {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .client-info {
    flex: 1;
  }

  .client-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .client-status-tags {
    display: flex;
    gap: 0.5rem;
  }

  .status-tag {
    background: #e9ecef;
    color: #495057;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-weight: 600;
  }

  .status-tag.active {
    background: #28a745;
    color: white;
  }

  .status-tag.channel {
    background: #007bff;
    color: white;
  }

  .contact-info,
  .tags-section,
  .notifications-section,
  .conversation-info,
  .integration-point {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .contact-info h5,
  .tags-section h5,
  .notifications-section h5,
  .conversation-info h5,
  .integration-point h5 {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f8f9fa;
  }

  .info-label {
    font-size: 0.875rem;
    color: #6c757d;
    font-weight: 500;
  }

  .info-value {
    font-size: 0.875rem;
    color: #212529;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .copy-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    color: #6c757d;
    padding: 0.25rem;
    border-radius: 3px;
  }

  .copy-button:hover {
    background: #f8f9fa;
  }

  .tags-container {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tag {
    background: #e9ecef;
    color: #495057;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tag:hover {
    background: #dc3545;
    color: white;
  }

  .tag-input-container {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .tag-input {
    padding: 0.25rem 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 0.75rem;
    width: 100px;
  }

  .tag-add-btn,
  .tag-cancel-btn {
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .tag-add-btn {
    background: #28a745;
    color: white;
  }

  .tag-cancel-btn {
    background: #dc3545;
    color: white;
  }

  .add-tag-button {
    background: #f8f9fa;
    border: 1px dashed #dee2e6;
    color: #6c757d;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
  }

  .add-tag-button:hover {
    background: #e9ecef;
  }

  .toggle-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f8f9fa;
  }

  .toggle-info {
    flex: 1;
  }

  .toggle-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 0.25rem;
  }

  .toggle-description {
    display: block;
    font-size: 0.75rem;
    color: #6c757d;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 24px;
  }

  .toggle-slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  input:checked + .toggle-slider {
    background-color: #28a745;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .status-open {
    color: #28a745;
  }

  .status-pending {
    color: #ffc107;
  }

  .status-resolved {
    color: #6c757d;
  }

  .status-archived {
    color: #6c757d;
    font-style: italic;
  }

  .priority-low {
    color: #6c757d;
  }

  .priority-normal {
    color: #17a2b8;
  }

  .priority-high {
    color: #fd7e14;
  }

  .priority-urgent {
    color: #dc3545;
    font-weight: bold;
  }

  .integration-text {
    font-size: 0.75rem;
    color: #6c757d;
    margin: 0;
    font-style: italic;
  }

  .empty-details {
    text-align: center;
    padding: 2rem 1rem;
    color: #6c757d;
  }

  .empty-details .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-details h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #212529;
    margin: 0 0 0.5rem 0;
  }

  .empty-details p {
    margin: 0;
    font-size: 0.875rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .chat-layout {
      grid-template-columns: 120px 160px 1fr 280px;
    }
  }

  @media (max-width: 768px) {
    .chat-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .canales-panel,
    .conversations-panel,
    .details-copilot-panel {
      display: none;
    }

    .messages-panel {
      grid-row: 1 / -1;
      height: 100vh;
    }

    .messages-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: white;
      border-bottom: 1px solid #e9ecef;
    }

    .message-input-area {
      position: sticky;
      bottom: 0;
      z-index: 10;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .messages-area {
      height: calc(100vh - 120px);
      overflow-y: auto;
    }
  }

  @media (max-width: 480px) {
    .chat-layout {
      grid-template-columns: 1fr;
    }

    .panel-header {
      padding: 0.75rem;
    }

    .panel-title {
      font-size: 1rem;
    }

    .conversations-filters {
      padding: 0.5rem 0.75rem;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-tabs {
      width: 100%;
      justify-content: space-between;
    }

    .filter-tab {
      flex: 1;
      padding: 0.5rem 0.25rem;
      font-size: 0.75rem;
    }

    .conversation-item {
      padding: 0.75rem;
    }

    .conversation-name {
      font-size: 0.9rem;
    }

    .conversation-preview {
      font-size: 0.8rem;
    }

    .message-input {
      font-size: 1rem;
      padding: 0.75rem;
    }

    .send-button {
      width: 40px;
      height: 40px;
      font-size: 1.2rem;
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

  .loading-state {
    height: 100vh;
    background: white;
  }

  /* Estilos para Skeletons */
  .skeleton-title {
    height: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    width: 80px;
  }

  .skeleton-search {
    height: 32px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .skeleton-button {
    width: 32px;
    height: 32px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
  }

  .skeleton-categories {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .skeleton-category {
    height: 40px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
  }

  .skeleton-tabs {
    display: flex;
    gap: 0.5rem;
  }

  .skeleton-tab {
    height: 32px;
    width: 60px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 6px;
  }

  .skeleton-conversation {
    height: 80px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .skeleton-chat-header {
    height: 60px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
  }

  .skeleton-messages {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .skeleton-message {
    height: 60px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 8px;
    width: 70%;
  }

  .skeleton-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .skeleton-info-item {
    height: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .tag-cancel-btn {
    background: #dc3545;
    color: white;
  }

  .tag.contact-tag {
    background: #007bff;
    color: white;
  }

  .tag.vip {
    background: #ffc107;
    color: #212529;
  }

  .tag.premium {
    background: #6f42c1;
    color: white;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .search-loading {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.875rem;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .filter-tab:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .clear-filters-button {
    background: #6c757d;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .clear-filters-button:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }

  .clear-cache-button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
    color: #6c757d;
  }

  .clear-cache-button:hover {
    background: #f8f9fa;
    color: #dc3545;
  }
</style>
