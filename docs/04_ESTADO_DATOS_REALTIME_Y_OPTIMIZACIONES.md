# 04 - ESTADO DATOS REALTIME Y OPTIMIZACIONES

## 1. Estrategia de estado

### Arquitectura de estado implementada
- **React Query (TanStack)**: Server state (conversations, messages, kpis)
- **Zustand**: UI state (sidebar, modals, theme) + auth token en memoria
- **Context**: WebSocket connection y eventos globales
- **Normalización**: Mensajes por `conversationId` y `messageId`

### Stores implementados
```typescript
// src/stores/useAuthStore.ts
export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      // Estado
      user: null,
      backendUser: null,
      loading: true,
      error: null,
      isAuthenticated: false,
      isAuthenticating: false,

      // Acciones
      login: async (email: string, password: string) => {
        set({ error: null, loading: true, isAuthenticating: true });
        
        try {
          const response = await api.post('/api/auth/login', { email, password });
          const { accessToken, refreshToken, user: userData } = response.data;
          
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));
          
          set({
            user: userData,
            backendUser: userData,
            loading: false,
            isAuthenticated: true,
            isAuthenticating: false
          });
          
          return userData;
        } catch (error) {
          set({
            error: 'Credenciales inválidas',
            loading: false,
            isAuthenticated: false,
            isAuthenticating: false
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.clear();
          set({
            user: null,
            backendUser: null,
            loading: false,
            error: null,
            isAuthenticated: false,
            isAuthenticating: false
          });
        }
      }
    })
  )
);

// src/stores/useChatStore.ts
export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // Estado
      conversations: new Map(),
      messages: new Map(),
      selectedConversationId: null,
      unreadCounts: new Map(),
      
      // Acciones
      addConversation: (conversation) => {
        set((state) => ({
          conversations: new Map(state.conversations).set(conversation.id, conversation)
        }));
      },
      
      addMessage: (message) => {
        set((state) => {
          const conversationMessages = state.messages.get(message.conversationId) || [];
          const updatedMessages = new Map(state.messages);
          updatedMessages.set(message.conversationId, [...conversationMessages, message]);
          
          return { messages: updatedMessages };
        });
      },
      
      updateMessage: (messageId, updates) => {
        set((state) => {
          const updatedMessages = new Map(state.messages);
          
          for (const [conversationId, messages] of updatedMessages) {
            const messageIndex = messages.findIndex(m => m.messageId === messageId);
            if (messageIndex !== -1) {
              const updatedConversationMessages = [...messages];
              updatedConversationMessages[messageIndex] = {
                ...updatedConversationMessages[messageIndex],
                ...updates
              };
              updatedMessages.set(conversationId, updatedConversationMessages);
              break;
            }
          }
          
          return { messages: updatedMessages };
        });
      }
    })
  )
);
```

## 2. Claves y políticas de cache

### Configuración de React Query
```typescript
// src/main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error) => {
        // No reintentar en errores 4xx
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Claves de cache optimizadas
export const queryKeys = {
  // Auth
  me: ['me'] as const,
  
  // Conversations con filtros
  conversations: (filters?: {
    status?: string;
    search?: string;
    cursor?: string;
    limit?: number;
  }) => ['conversations', filters] as const,
  
  conversation: (id: ID) => ['conversation', id] as const,
  
  // Messages con paginación
  messages: (conversationId: ID, cursor?: string, limit?: number) => 
    ['messages', conversationId, { cursor, limit }] as const,
  
  // Clients
  clients: (filters?: { status?: string; search?: string }) => 
    ['clients', filters] as const,
  
  // Team
  teamMembers: ['team', 'members'] as const,
  
  // KPIs con rangos de tiempo
  kpis: (range: 'day' | 'week' | 'month' | 'year') => ['kpis', range] as const,
  
  // Media
  mediaUrl: (mediaId: ID) => ['media', mediaId, 'url'] as const,
};
```

### Políticas de staleTime por tipo de dato
```typescript
// src/hooks/useConversations.ts
export const useConversations = (filters?: ConversationFilters) => {
  return useQuery({
    queryKey: queryKeys.conversations(filters),
    queryFn: () => Api.listConversations(filters),
    staleTime: 10 * 1000, // 10 segundos para conversaciones
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// src/hooks/useMessages.ts
export const useMessages = (conversationId: ID, cursor?: string, limit = 50) => {
  return useQuery({
    queryKey: queryKeys.messages(conversationId, cursor, limit),
    queryFn: () => Api.getMessages(conversationId, cursor, limit),
    staleTime: 0, // Siempre fresh para mensajes (RT disponible)
    enabled: !!conversationId,
    refetchOnWindowFocus: false, // No refetch automático para mensajes
  });
};

// src/hooks/useKPIs.ts
export const useKPIs = (range: 'day' | 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: queryKeys.kpis(range),
    queryFn: () => Api.getKPIs(range),
    staleTime: 5 * 60 * 1000, // 5 minutos para KPIs
    refetchOnWindowFocus: true,
  });
};
```

## 3. WebSocket Manager (implementado)

### Socket Manager principal
```typescript
// src/hooks/websocket/useWebSocketConnection.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../stores/useAuthStore';

export const useWebSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastConnectionTime, setLastConnectionTime] = useState<Date | null>(null);
  
  const { isAuthenticated, backendUser } = useAuthStore();

  const connect = useCallback(() => {
    if (!isAuthenticated || !backendUser) {
      console.warn('Cannot connect: user not authenticated');
      return;
    }

    if (socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    const token = localStorage.getItem('access_token');
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001';

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      setReconnectAttempts(0);
      setLastConnectionTime(new Date());
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar manualmente
        setTimeout(() => connect(), 1000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnecting(false);
      setConnectionError(error.message);
      setReconnectAttempts(prev => prev + 1);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
      setLastConnectionTime(new Date());
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('WebSocket reconnection attempt:', attemptNumber);
      setReconnectAttempts(attemptNumber);
    });

    setSocket(newSocket);
  }, [isAuthenticated, backendUser, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(null);
    }
  }, [socket]);

  // Auto-connect cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && backendUser && !socket) {
      connect();
    } else if (!isAuthenticated && socket) {
      disconnect();
    }
  }, [isAuthenticated, backendUser, socket, connect, disconnect]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    reconnectAttempts,
    lastConnectionTime,
    connect,
    disconnect,
  };
};
```

### Manejo de mensajes WebSocket
```typescript
// src/hooks/websocket/useWebSocketMessages.ts
export const useWebSocketMessages = (socket: Socket | null) => {
  const queryClient = useQueryClient();
  const { addMessage, updateMessage } = useChatStore();

  const sendMessage = useCallback(async (payload: {
    messageId: string;
    conversationId: string;
    type: 'text' | 'image' | 'audio' | 'file';
    text?: string;
    mediaId?: string;
    metadata?: any;
  }) => {
    if (!socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise<{ delivered: boolean; serverId?: string }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 10000);

      socket.emit('message:send', payload, (ack: { delivered: boolean; serverId?: string }) => {
        clearTimeout(timeout);
        resolve(ack);
      });
    });
  }, [socket]);

  const markMessagesAsRead = useCallback((conversationId: string, messageId: string) => {
    if (!socket?.connected) return;

    socket.emit('conversation:read', { conversationId, messageId });
  }, [socket]);

  const processReceivedMessage = useCallback((message: Message) => {
    // Actualizar store local
    addMessage(message);

    // Actualizar cache de React Query
    queryClient.setQueryData(
      queryKeys.messages(message.conversationId),
      (old: any) => {
        if (!old) return { items: [message], nextCursor: null };
        
        // Evitar duplicados
        const existingIndex = old.items.findIndex((m: Message) => m.messageId === message.messageId);
        if (existingIndex !== -1) {
          const updatedItems = [...old.items];
          updatedItems[existingIndex] = message;
          return { ...old, items: updatedItems };
        }
        
        return { ...old, items: [...old.items, message] };
      }
    );

    // Actualizar última actividad de conversación
    queryClient.invalidateQueries({
      queryKey: queryKeys.conversations()
    });
  }, [addMessage, queryClient]);

  // Escuchar eventos del servidor
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      console.log('Received new message:', message);
      processReceivedMessage(message);
    };

    const handleMessageDelivered = (payload: { messageId: string }) => {
      console.log('Message delivered:', payload.messageId);
      updateMessage(payload.messageId, { status: 'delivered' });
    };

    const handleMessageRead = (payload: { conversationId: string; messageId: string }) => {
      console.log('Message read:', payload);
      updateMessage(payload.messageId, { status: 'read' });
    };

    const handleConversationUpdated = (conversation: Conversation) => {
      console.log('Conversation updated:', conversation);
      queryClient.setQueryData(
        queryKeys.conversation(conversation.id),
        conversation
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations()
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:delivered', handleMessageDelivered);
    socket.on('message:read', handleMessageRead);
    socket.on('conversation:updated', handleConversationUpdated);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:delivered', handleMessageDelivered);
      socket.off('message:read', handleMessageRead);
      socket.off('conversation:updated', handleConversationUpdated);
    };
  }, [socket, processReceivedMessage, updateMessage, queryClient]);

  return {
    sendMessage,
    markMessagesAsRead,
    processReceivedMessage,
  };
};
```

## 4. Flujo de envío optimista + ack + fallback

### Implementación completa
```typescript
// src/hooks/useChat.ts
export const useChat = (conversationId: string) => {
  const { sendMessage: wsSendMessage } = useWebSocket();
  const { addMessage, updateMessage } = useChatStore();
  const queryClient = useQueryClient();
  const sendMessageMutation = useSendMessage();

  const sendMessage = useCallback(async (payload: {
    type: 'text' | 'image' | 'audio' | 'file';
    text?: string;
    media?: File;
  }) => {
    const messageId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // 1. Crear mensaje optimista
    const optimisticMessage: Message = {
      id: messageId,
      messageId,
      conversationId,
      type: payload.type,
      text: payload.text,
      createdAt: timestamp,
      senderId: 'user', // Se actualizará con el ID real del backend
      status: 'sending',
    };

    // 2. Agregar a UI inmediatamente
    addMessage(optimisticMessage);
    
    // Actualizar cache de React Query
    queryClient.setQueryData(
      queryKeys.messages(conversationId),
      (old: any) => ({
        ...old,
        items: [...(old?.items || []), optimisticMessage]
      })
    );

    try {
      // 3. Intentar envío por WebSocket
      if (payload.media) {
        // Subir media primero
        const formData = new FormData();
        formData.append('file', payload.media);
        const uploadResponse = await Api.uploadMedia(payload.media);
        
        // Enviar mensaje con mediaId
        const wsPayload = {
          messageId,
          conversationId,
          type: payload.type,
          mediaId: uploadResponse.data.mediaId,
        };
        
        const ack = await wsSendMessage(wsPayload);
        
        if (ack.delivered) {
          // 4. Actualizar con respuesta del servidor
          updateMessage(messageId, {
            status: 'delivered',
            id: ack.serverId || messageId,
          });
        } else {
          throw new Error('WebSocket delivery failed');
        }
      } else {
        // Envío de texto
        const wsPayload = {
          messageId,
          conversationId,
          type: payload.type,
          text: payload.text,
        };
        
        const ack = await wsSendMessage(wsPayload);
        
        if (ack.delivered) {
          updateMessage(messageId, {
            status: 'delivered',
            id: ack.serverId || messageId,
          });
        } else {
          throw new Error('WebSocket delivery failed');
        }
      }
    } catch (error) {
      console.error('WebSocket send failed, falling back to REST:', error);
      
      // 5. Fallback a REST API
      try {
        const restPayload = {
          messageId,
          conversationId,
          type: payload.type,
          text: payload.text,
          mediaId: payload.media ? 'pending' : undefined,
        };
        
        const savedMessage = await sendMessageMutation.mutateAsync(restPayload);
        
        // Actualizar con respuesta del servidor
        updateMessage(messageId, {
          ...savedMessage,
          status: 'sent',
        });
        
        // Actualizar cache
        queryClient.setQueryData(
          queryKeys.messages(conversationId),
          (old: any) => ({
            ...old,
            items: old.items.map((m: Message) => 
              m.messageId === messageId ? { ...m, ...savedMessage, status: 'sent' } : m
            )
          })
        );
      } catch (restError) {
        console.error('REST fallback also failed:', restError);
        
        // 6. Marcar como fallido
        updateMessage(messageId, { status: 'failed' });
        
        // Mostrar error al usuario
        toast.error('Error al enviar mensaje. Intenta de nuevo.');
      }
    }
  }, [conversationId, wsSendMessage, addMessage, updateMessage, queryClient, sendMessageMutation]);

  return { sendMessage };
};
```

## 5. Idempotencia y deduplicación

### Implementación de deduplicación
```typescript
// src/utils/deduplication.ts
export class MessageDeduplicator {
  private static instance: MessageDeduplicator;
  private processedMessages = new Set<string>();
  private pendingMessages = new Map<string, number>(); // messageId -> timestamp

  static getInstance(): MessageDeduplicator {
    if (!MessageDeduplicator.instance) {
      MessageDeduplicator.instance = new MessageDeduplicator();
    }
    return MessageDeduplicator.instance;
  }

  isDuplicate(messageId: string): boolean {
    return this.processedMessages.has(messageId);
  }

  markAsProcessed(messageId: string): void {
    this.processedMessages.add(messageId);
    
    // Limpiar mensajes antiguos (más de 1 hora)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, timestamp] of this.pendingMessages) {
      if (timestamp < oneHourAgo) {
        this.pendingMessages.delete(id);
        this.processedMessages.delete(id);
      }
    }
  }

  addPending(messageId: string): void {
    this.pendingMessages.set(messageId, Date.now());
  }

  removePending(messageId: string): void {
    this.pendingMessages.delete(messageId);
  }
}

// Uso en el procesamiento de mensajes
export const processMessage = (message: Message) => {
  const deduplicator = MessageDeduplicator.getInstance();
  
  if (deduplicator.isDuplicate(message.messageId)) {
    console.log('Duplicate message ignored:', message.messageId);
    return false;
  }
  
  deduplicator.markAsProcessed(message.messageId);
  return true;
};
```

## 6. Optimizaciones de performance

### Virtualización de listas
```typescript
// src/components/chat/VirtualizedMessageList.tsx
import { FixedSizeList as List } from 'react-window';

export const VirtualizedMessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const message = messages[index];
    return (
      <div style={style}>
        <MessageBubble message={message} />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={80} // Altura estimada por mensaje
      width="100%"
    >
      {Row}
    </List>
  );
};

// src/components/clients/optimization/VirtualizedClientList.tsx
export const VirtualizedClientList: React.FC<{ clients: Client[] }> = ({ clients }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const client = clients[index];
    return (
      <div style={style}>
        <ClientItem client={client} />
      </div>
    );
  };

  return (
    <List
      height={400}
      itemCount={clients.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

### Lazy loading de componentes
```typescript
// src/components/ui/LazyMotion.tsx
import { LazyMotion, domAnimation } from 'framer-motion';

export const LazyMotion: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LazyMotion features={domAnimation} strict>
    {children}
  </LazyMotion>
);

// src/components/dashboard/LazyChart.tsx
import { lazy, Suspense } from 'react';

const Chart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));

export const LazyChart: React.FC<ChartProps> = (props) => (
  <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded" />}>
    <Chart {...props} />
  </Suspense>
);
```

### Memoización de componentes
```typescript
// src/components/chat/MessageBubble.tsx
export const MessageBubble = React.memo<MessageBubbleProps>(({
  message,
  customerName,
  onRetry,
  onDelete
}) => {
  // Componente memoizado para evitar re-renders innecesarios
  return (
    <div className={`flex ${message.senderId === 'bot' ? 'justify-start' : 'justify-end'} mb-4`}>
      {/* ... contenido del componente ... */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para optimizar re-renders
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.customerName === nextProps.customerName
  );
});
```

## 7. Offline y reconexión

### Queue de mensajes offline
```typescript
// src/utils/offlineQueue.ts
export class OfflineMessageQueue {
  private queue: Array<{
    id: string;
    payload: any;
    timestamp: number;
    retries: number;
  }> = [];
  private maxRetries = 3;

  addMessage(payload: any): string {
    const id = crypto.randomUUID();
    this.queue.push({
      id,
      payload,
      timestamp: Date.now(),
      retries: 0,
    });
    
    // Persistir en localStorage
    this.persistQueue();
    return id;
  }

  async processQueue(sendFunction: (payload: any) => Promise<any>): Promise<void> {
    const messagesToProcess = [...this.queue];
    
    for (const message of messagesToProcess) {
      try {
        await sendFunction(message.payload);
        this.removeMessage(message.id);
      } catch (error) {
        message.retries++;
        
        if (message.retries >= this.maxRetries) {
          console.error('Message failed after max retries:', message);
          this.removeMessage(message.id);
        }
      }
    }
  }

  private removeMessage(id: string): void {
    this.queue = this.queue.filter(m => m.id !== id);
    this.persistQueue();
  }

  private persistQueue(): void {
    localStorage.setItem('offline_message_queue', JSON.stringify(this.queue));
  }

  loadQueue(): void {
    const saved = localStorage.getItem('offline_message_queue');
    if (saved) {
      this.queue = JSON.parse(saved);
    }
  }
}
```

### Manejo de reconexión
```typescript
// src/hooks/websocket/useWebSocketConnection.ts
const handleReconnection = useCallback(async () => {
  if (!socket?.connected) return;

  console.log('Processing offline queue after reconnection...');
  
  // Procesar cola de mensajes offline
  const offlineQueue = new OfflineMessageQueue();
  offlineQueue.loadQueue();
  
  await offlineQueue.processQueue(async (payload) => {
    return new Promise((resolve, reject) => {
      socket.emit('message:send', payload, (ack: any) => {
        if (ack.delivered) {
          resolve(ack);
        } else {
          reject(new Error('Delivery failed'));
        }
      });
    });
  });

  // Rehidratar estado desde el servidor
  queryClient.invalidateQueries({
    queryKey: queryKeys.conversations()
  });
}, [socket, queryClient]);

// Escuchar reconexión
useEffect(() => {
  if (!socket) return;

  socket.on('connect', handleReconnection);

  return () => {
    socket.off('connect', handleReconnection);
  };
}, [socket, handleReconnection]);
```

## 8. Métricas y observabilidad

### Performance monitoring
```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(operation: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(value);
  }

  getAverage(operation: string): number {
    const values = this.metrics.get(operation) || [];
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  logMetrics(): void {
    console.log('Performance Metrics:');
    for (const [operation, values] of this.metrics) {
      const avg = this.getAverage(operation);
      const min = Math.min(...values);
      const max = Math.max(...values);
      console.log(`${operation}: avg=${avg.toFixed(2)}ms, min=${min.toFixed(2)}ms, max=${max.toFixed(2)}ms`);
    }
  }
}

// Uso en componentes
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  const measureOperation = useCallback((operation: string, fn: () => void) => {
    const endTimer = monitor.startTimer(operation);
    try {
      fn();
    } finally {
      endTimer();
    }
  }, [monitor]);

  return { measureOperation };
};
```

### Web Vitals tracking
```typescript
// src/utils/webVitals.ts
export const trackWebVitals = () => {
  // First Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log('FCP:', entry.startTime);
        // Enviar a analytics
      }
    }
  }).observe({ entryTypes: ['paint'] });

  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.startTime);
      // Enviar a analytics
    }
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingStart - entry.startTime);
      // Enviar a analytics
    }
  }).observe({ entryTypes: ['first-input'] });
};
```

## 9. Optimizaciones de bundle

### Code splitting por rutas
```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const AuthModule = lazy(() => import('./modules/auth'));
const ChatModule = lazy(() => import('./modules/chat'));
const DashboardModule = lazy(() => import('./modules/dashboard'));
const TeamModule = lazy(() => import('./modules/team'));
const ClientModule = lazy(() => import('./modules/clients'));

// Componente de loading
const ModulePlaceholder: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Uso en rutas
<Routes>
  <Route path="/login" element={
    <Suspense fallback={<ModulePlaceholder />}>
      <AuthModule />
    </Suspense>
  } />
  <Route path="/chat" element={
    <Suspense fallback={<ModulePlaceholder />}>
      <ChatModule />
    </Suspense>
  } />
  {/* ... otras rutas ... */}
</Routes>
```

### Dynamic imports para componentes pesados
```typescript
// src/components/dashboard/Charts.tsx
const BarChart = lazy(() => import('./BarChart'));
const LineChart = lazy(() => import('./LineChart'));
const PieChart = lazy(() => import('./PieChart'));

export const Charts: React.FC<{ type: 'bar' | 'line' | 'pie'; data: any }> = ({ type, data }) => {
  const ChartComponent = {
    bar: BarChart,
    line: LineChart,
    pie: PieChart,
  }[type];

  return (
    <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded" />}>
      <ChartComponent data={data} />
    </Suspense>
  );
};
``` 