/**
 * Servicio de almacenamiento offline con IndexedDB
 * Permite guardar conversaciones, mensajes y datos de usuario para uso sin conexión
 */

const DB_NAME = 'utalk_offline_db';
const DB_VERSION = 1;

// Nombres de las stores
const STORES = {
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  USER_DATA: 'user_data',
  PENDING_ACTIONS: 'pending_actions',
  CACHED_API: 'cached_api'
} as const;

export interface OfflineConversation {
  id: string;
  clientName: string;
  clientPhone: string;
  platform: string;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  status: string;
  assignedAgent?: string;
  metadata?: Record<string, any>;
  syncedAt: number;
}

export interface OfflineMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: 'client' | 'agent';
  senderName?: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'file';
  attachmentUrl?: string;
  metadata?: Record<string, any>;
  syncedAt: number;
}

export interface PendingAction {
  id: string;
  type: 'send_message' | 'update_conversation' | 'upload_file';
  payload: any;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

/**
 * Inicializar la base de datos IndexedDB
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Error al abrir IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store de conversaciones
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        const conversationsStore = db.createObjectStore(STORES.CONVERSATIONS, { keyPath: 'id' });
        conversationsStore.createIndex('syncedAt', 'syncedAt', { unique: false });
        conversationsStore.createIndex('platform', 'platform', { unique: false });
      }

      // Store de mensajes
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messagesStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        messagesStore.createIndex('conversationId', 'conversationId', { unique: false });
        messagesStore.createIndex('syncedAt', 'syncedAt', { unique: false });
      }

      // Store de datos de usuario
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }

      // Store de acciones pendientes
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const pendingStore = db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id' });
        pendingStore.createIndex('createdAt', 'createdAt', { unique: false });
        pendingStore.createIndex('type', 'type', { unique: false });
      }

      // Store de cache de API
      if (!db.objectStoreNames.contains(STORES.CACHED_API)) {
        const cacheStore = db.createObjectStore(STORES.CACHED_API, { keyPath: 'key' });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
};

/**
 * CONVERSACIONES
 */

export const saveConversationsOffline = async (conversations: OfflineConversation[]): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.CONVERSATIONS, 'readwrite');
  const store = transaction.objectStore(STORES.CONVERSATIONS);

  for (const conversation of conversations) {
    await new Promise((resolve, reject) => {
      const request = store.put({
        ...conversation,
        syncedAt: Date.now()
      });
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });
  }

  db.close();
};

export const getConversationsOffline = async (): Promise<OfflineConversation[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.CONVERSATIONS, 'readonly');
  const store = transaction.objectStore(STORES.CONVERSATIONS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result || []);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

export const getConversationOffline = async (id: string): Promise<OfflineConversation | null> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.CONVERSATIONS, 'readonly');
  const store = transaction.objectStore(STORES.CONVERSATIONS);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => {
      resolve(request.result || null);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

/**
 * MENSAJES
 */

export const saveMessagesOffline = async (messages: OfflineMessage[]): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.MESSAGES, 'readwrite');
  const store = transaction.objectStore(STORES.MESSAGES);

  for (const message of messages) {
    await new Promise((resolve, reject) => {
      const request = store.put({
        ...message,
        syncedAt: Date.now()
      });
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });
  }

  db.close();
};

export const getMessagesOffline = async (conversationId: string): Promise<OfflineMessage[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.MESSAGES, 'readonly');
  const store = transaction.objectStore(STORES.MESSAGES);
  const index = store.index('conversationId');

  return new Promise((resolve, reject) => {
    const request = index.getAll(conversationId);
    request.onsuccess = () => {
      resolve(request.result || []);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

/**
 * ACCIONES PENDIENTES
 */

export const addPendingAction = async (action: Omit<PendingAction, 'id' | 'createdAt' | 'retryCount'>): Promise<string> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
  const store = transaction.objectStore(STORES.PENDING_ACTIONS);

  const pendingAction: PendingAction = {
    ...action,
    id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    retryCount: 0
  };

  return new Promise((resolve, reject) => {
    const request = store.add(pendingAction);
    request.onsuccess = () => {
      resolve(pendingAction.id);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

export const getPendingActions = async (): Promise<PendingAction[]> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.PENDING_ACTIONS, 'readonly');
  const store = transaction.objectStore(STORES.PENDING_ACTIONS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      resolve(request.result || []);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

export const removePendingAction = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
  const store = transaction.objectStore(STORES.PENDING_ACTIONS);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => {
      resolve();
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

export const updatePendingAction = async (id: string, updates: Partial<PendingAction>): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.PENDING_ACTIONS, 'readwrite');
  const store = transaction.objectStore(STORES.PENDING_ACTIONS);

  return new Promise((resolve, reject) => {
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const action = getRequest.result;
      if (!action) {
        reject(new Error('Acción pendiente no encontrada'));
        db.close();
        return;
      }

      const updatedAction = { ...action, ...updates };
      const putRequest = store.put(updatedAction);
      
      putRequest.onsuccess = () => {
        resolve();
        db.close();
      };
      
      putRequest.onerror = () => {
        reject(putRequest.error);
        db.close();
      };
    };
    
    getRequest.onerror = () => {
      reject(getRequest.error);
      db.close();
    };
  });
};

/**
 * DATOS DE USUARIO
 */

export const saveUserDataOffline = async (key: string, data: any): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.USER_DATA, 'readwrite');
  const store = transaction.objectStore(STORES.USER_DATA);

  return new Promise((resolve, reject) => {
    const request = store.put({ key, data, updatedAt: Date.now() });
    request.onsuccess = () => {
      resolve();
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

export const getUserDataOffline = async (key: string): Promise<any | null> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.USER_DATA, 'readonly');
  const store = transaction.objectStore(STORES.USER_DATA);

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.data : null);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

/**
 * CACHE DE API
 */

export const cacheAPIResponse = async (
  key: string,
  data: any,
  ttlMinutes: number = 60
): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.CACHED_API, 'readwrite');
  const store = transaction.objectStore(STORES.CACHED_API);

  const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);

  return new Promise((resolve, reject) => {
    const request = store.put({ key, data, expiresAt, cachedAt: Date.now() });
    request.onsuccess = () => {
      resolve();
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

export const getCachedAPIResponse = async (key: string): Promise<any | null> => {
  const db = await initDB();
  const transaction = db.transaction(STORES.CACHED_API, 'readonly');
  const store = transaction.objectStore(STORES.CACHED_API);

  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      
      // Verificar si el cache expiró
      if (!result) {
        resolve(null);
        db.close();
        return;
      }

      if (result.expiresAt < Date.now()) {
        // Cache expirado, eliminarlo
        const deleteTransaction = db.transaction(STORES.CACHED_API, 'readwrite');
        const deleteStore = deleteTransaction.objectStore(STORES.CACHED_API);
        deleteStore.delete(key);
        resolve(null);
        db.close();
        return;
      }

      resolve(result.data);
      db.close();
    };
    request.onerror = () => {
      reject(request.error);
      db.close();
    };
  });
};

/**
 * LIMPIEZA
 */

export const clearOldCache = async (olderThanDays: number = 7): Promise<void> => {
  const db = await initDB();
  const threshold = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

  // Limpiar cache de API expirado
  const cacheTransaction = db.transaction(STORES.CACHED_API, 'readwrite');
  const cacheStore = cacheTransaction.objectStore(STORES.CACHED_API);
  const cacheIndex = cacheStore.index('expiresAt');
  const cacheRange = IDBKeyRange.upperBound(Date.now());
  
  const cacheRequest = cacheIndex.openCursor(cacheRange);
  cacheRequest.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest).result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  // Limpiar conversaciones antiguas
  const convTransaction = db.transaction(STORES.CONVERSATIONS, 'readwrite');
  const convStore = convTransaction.objectStore(STORES.CONVERSATIONS);
  const convIndex = convStore.index('syncedAt');
  const convRange = IDBKeyRange.upperBound(threshold);
  
  const convRequest = convIndex.openCursor(convRange);
  convRequest.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest).result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };

  db.close();
};

export const clearAllOfflineData = async (): Promise<void> => {
  const db = await initDB();
  
  const stores = [
    STORES.CONVERSATIONS,
    STORES.MESSAGES,
    STORES.USER_DATA,
    STORES.PENDING_ACTIONS,
    STORES.CACHED_API
  ];

  for (const storeName of stores) {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve(undefined);
      request.onerror = () => reject(request.error);
    });
  }

  db.close();
};

/**
 * SINCRONIZACIÓN
 */

export const syncPendingActions = async (
  executeAction: (action: PendingAction) => Promise<boolean>
): Promise<{ success: number; failed: number }> => {
  const pendingActions = await getPendingActions();
  let success = 0;
  let failed = 0;

  for (const action of pendingActions) {
    try {
      const result = await executeAction(action);
      
      if (result) {
        await removePendingAction(action.id);
        success++;
      } else {
        await updatePendingAction(action.id, {
          retryCount: action.retryCount + 1,
          lastError: 'Ejecución falló'
        });
        failed++;
      }
    } catch (error) {
      const err = error as Error;
      await updatePendingAction(action.id, {
        retryCount: action.retryCount + 1,
        lastError: err.message
      });
      failed++;
    }
  }

  return { success, failed };
};

/**
 * UTILIDADES
 */

export const getStorageStats = async (): Promise<{
  conversations: number;
  messages: number;
  pendingActions: number;
  cachedAPI: number;
}> => {
  const db = await initDB();
  
  const counts = {
    conversations: 0,
    messages: 0,
    pendingActions: 0,
    cachedAPI: 0
  };

  // Contar conversaciones
  const convTransaction = db.transaction(STORES.CONVERSATIONS, 'readonly');
  const convStore = convTransaction.objectStore(STORES.CONVERSATIONS);
  const convRequest = convStore.count();
  counts.conversations = await new Promise((resolve) => {
    convRequest.onsuccess = () => resolve(convRequest.result);
  });

  // Contar mensajes
  const msgTransaction = db.transaction(STORES.MESSAGES, 'readonly');
  const msgStore = msgTransaction.objectStore(STORES.MESSAGES);
  const msgRequest = msgStore.count();
  counts.messages = await new Promise((resolve) => {
    msgRequest.onsuccess = () => resolve(msgRequest.result);
  });

  // Contar acciones pendientes
  const pendingTransaction = db.transaction(STORES.PENDING_ACTIONS, 'readonly');
  const pendingStore = pendingTransaction.objectStore(STORES.PENDING_ACTIONS);
  const pendingRequest = pendingStore.count();
  counts.pendingActions = await new Promise((resolve) => {
    pendingRequest.onsuccess = () => resolve(pendingRequest.result);
  });

  // Contar cache
  const cacheTransaction = db.transaction(STORES.CACHED_API, 'readonly');
  const cacheStore = cacheTransaction.objectStore(STORES.CACHED_API);
  const cacheRequest = cacheStore.count();
  counts.cachedAPI = await new Promise((resolve) => {
    cacheRequest.onsuccess = () => resolve(cacheRequest.result);
  });

  db.close();

  return counts;
};

