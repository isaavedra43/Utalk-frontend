// FASE 5: Sincronización multi-tab usando BroadcastChannel API
interface TabSyncMessage {
  type: 'conversation-update' | 'conversation-select' | 'user-status' | 'typing' | 'focus' | 'blur';
  data: unknown;
  timestamp: number;
  tabId: string;
}

interface TabSyncState {
  conversations: unknown[];
  selectedConversationId: string | null;
  userStatus: string;
  typingUsers: Map<string, Set<string>>;
  lastUpdate: number;
}

class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private state: TabSyncState;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private isActive = true;

  constructor() {
    this.tabId = this.generateTabId();
    this.state = {
      conversations: [],
      selectedConversationId: null,
      userStatus: 'online',
      typingUsers: new Map(),
      lastUpdate: Date.now()
    };

    this.initializeChannel();
    this.setupVisibilityListeners();
  }

  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeChannel(): void {
    try {
      this.channel = new BroadcastChannel('utalk-tab-sync');
      this.channel.onmessage = this.handleMessage.bind(this);
      console.log('🔄 TabSync - Canal de sincronización inicializado');
    } catch (error) {
      console.warn('⚠️ TabSync - BroadcastChannel no soportado:', error);
      this.channel = null;
    }
  }

  private setupVisibilityListeners(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.broadcast({ type: 'focus', data: { tabId: this.tabId }, timestamp: Date.now(), tabId: this.tabId });
        this.isActive = true;
      } else {
        this.broadcast({ type: 'blur', data: { tabId: this.tabId }, timestamp: Date.now(), tabId: this.tabId });
        this.isActive = false;
      }
    });

    window.addEventListener('beforeunload', () => {
      this.broadcast({ type: 'blur', data: { tabId: this.tabId }, timestamp: Date.now(), tabId: this.tabId });
    });
  }

  private handleMessage(event: MessageEvent<TabSyncMessage>): void {
    const message = event.data;
    
    // Ignorar mensajes propios
    if (message.tabId === this.tabId) {
      return;
    }

    console.log('🔄 TabSync - Mensaje recibido:', message);

    // Actualizar estado local
    this.updateLocalState(message);

    // Notificar listeners
    this.notifyListeners(message.type, message.data);
  }

  private updateLocalState(message: TabSyncMessage): void {
    switch (message.type) {
      case 'conversation-update':
        this.state.conversations = message.data as unknown[];
        this.state.lastUpdate = message.timestamp;
        break;
      case 'conversation-select':
        this.state.selectedConversationId = message.data as string;
        break;
      case 'user-status':
        this.state.userStatus = message.data as string;
        break;
      case 'typing': {
        const typingData = message.data as { conversationId: string; userId: string; isTyping: boolean };
        if (!this.state.typingUsers.has(typingData.conversationId)) {
          this.state.typingUsers.set(typingData.conversationId, new Set());
        }
        const typingSet = this.state.typingUsers.get(typingData.conversationId)!;
        if (typingData.isTyping) {
          typingSet.add(typingData.userId);
        } else {
          typingSet.delete(typingData.userId);
        }
        break;
      }
    }
  }

  private notifyListeners(type: string, data: unknown): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('❌ TabSync - Error en listener:', error);
        }
      });
    }
  }

  public broadcast(message: TabSyncMessage): void {
    if (!this.channel || !this.isActive) {
      return;
    }

    try {
      this.channel.postMessage(message);
      console.log('🔄 TabSync - Mensaje enviado:', message.type);
    } catch (error) {
      console.error('❌ TabSync - Error enviando mensaje:', error);
    }
  }

  public on(eventType: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  public off(eventType: string, callback: (data: unknown) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  public getState(): TabSyncState {
    return { ...this.state };
  }

  public updateConversations(conversations: unknown[]): void {
    this.state.conversations = conversations;
    this.broadcast({
      type: 'conversation-update',
      data: conversations,
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  public selectConversation(conversationId: string | null): void {
    this.state.selectedConversationId = conversationId;
    this.broadcast({
      type: 'conversation-select',
      data: conversationId,
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  public updateUserStatus(status: string): void {
    this.state.userStatus = status;
    this.broadcast({
      type: 'user-status',
      data: status,
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  public updateTyping(conversationId: string, userId: string, isTyping: boolean): void {
    this.broadcast({
      type: 'typing',
      data: { conversationId, userId, isTyping },
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  public destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
    console.log('🔄 TabSync - Manager destruido');
  }
}

// Instancia singleton
let tabSyncManager: TabSyncManager | null = null;

export const getTabSyncManager = (): TabSyncManager => {
  if (!tabSyncManager) {
    tabSyncManager = new TabSyncManager();
  }
  return tabSyncManager;
};

export const destroyTabSyncManager = (): void => {
  if (tabSyncManager) {
    tabSyncManager.destroy();
    tabSyncManager = null;
  }
};

// Hook para usar TabSync en componentes React
export const useTabSync = () => {
  const manager = getTabSyncManager();

  const on = (eventType: string, callback: (data: unknown) => void) => {
    manager.on(eventType, callback);
  };

  const off = (eventType: string, callback: (data: unknown) => void) => {
    manager.off(eventType, callback);
  };

  const broadcast = (message: Omit<TabSyncMessage, 'tabId' | 'timestamp'>) => {
    manager.broadcast({
      ...message,
      timestamp: Date.now(),
      tabId: manager['tabId']
    });
  };

  return {
    on,
    off,
    broadcast,
    getState: manager.getState.bind(manager),
    updateConversations: manager.updateConversations.bind(manager),
    selectConversation: manager.selectConversation.bind(manager),
    updateUserStatus: manager.updateUserStatus.bind(manager),
    updateTyping: manager.updateTyping.bind(manager)
  };
}; 