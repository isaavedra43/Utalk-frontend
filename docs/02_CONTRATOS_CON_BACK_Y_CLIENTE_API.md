# 02 - CONTRATOS CON BACK Y CLIENTE API

## 1. Principios de contrato

**Fuente de verdad**: Este documento define los contratos entre Frontend y Backend.
**Formato**: JSON estándar; errores `{ code, message, details }`.
**Paginación**: `cursor/limit` para listas.
**Idempotencia**: Por `messageId` (UUIDv4) para mensajes.

## 2. DTOs y Tipos (implementados)

```typescript
// src/types/index.ts (tipos principales)
export type ID = string;

export interface User {
  id: ID;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: ID;
  status: 'open' | 'pending' | 'closed' | 'escalated';
  lastMessageAt: string;
  participants: ID[];
  customerName?: string;
  customerEmail?: string;
}

export interface Message {
  id: ID;
  messageId: ID;
  conversationId: ID;
  type: 'text' | 'image' | 'audio' | 'file';
  text?: string;
  mediaId?: ID;
  createdAt: string;
  senderId: ID;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// src/types/client.ts
export interface Client {
  id: ID;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastContactAt?: string;
}

// src/types/team.ts
export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'manager';
  status: 'active' | 'inactive';
  performance?: {
    conversationsHandled: number;
    avgResponseTime: number;
    satisfactionScore: number;
  };
}
```

## 3. Cliente HTTP (implementado)

```typescript
// src/services/api.ts (cliente Axios configurado)
import axios, { type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://tu-backend.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de requests con token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de responses con refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await api.post('/api/auth/refresh', { refreshToken });
        const { accessToken } = response.data;
        
        localStorage.setItem('access_token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falló, redirigir a login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

## 4. Helpers de endpoints tipados

```typescript
// src/services/api.ts (continuación)
export const Api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    api.post<{ accessToken: string; refreshToken: string; user: User }>('/api/auth/login', credentials),
  
  getProfile: () =>
    api.get<User>('/api/auth/profile'),
  
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken }),

  // Conversations
  listConversations: (cursor?: string, limit = 20) =>
    api.get<{ items: Conversation[]; nextCursor?: string }>(
      `/api/conversations?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`
    ),
  
  getConversation: (conversationId: ID) =>
    api.get<Conversation>(`/api/conversations/${conversationId}`),
  
  updateConversation: (conversationId: ID, updates: Partial<Conversation>) =>
    api.patch<Conversation>(`/api/conversations/${conversationId}`, updates),

  // Messages
  getMessages: (conversationId: ID, cursor?: string, limit = 50) =>
    api.get<{ items: Message[]; nextCursor?: string }>(
      `/api/messages?conversationId=${conversationId}&limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`
    ),
  
  sendMessage: (payload: Omit<Message, 'id' | 'createdAt' | 'senderId'>) =>
    api.post<Message>('/api/messages', payload),
  
  markAsRead: (conversationId: ID, messageId: ID) =>
    api.post(`/api/messages/${messageId}/read`, { conversationId }),

  // Media
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ mediaId: ID; url: string }>('/api/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getMediaUrl: (mediaId: ID) =>
    api.get<{ url: string }>(`/api/media/${mediaId}/url`),

  // Clients
  listClients: (filters?: { status?: string; search?: string }) =>
    api.get<{ items: Client[]; total: number }>('/api/clients', { params: filters }),
  
  getClient: (clientId: ID) =>
    api.get<Client>(`/api/clients/${clientId}`),

  // Team
  listTeamMembers: () =>
    api.get<TeamMember[]>('/api/team/members'),
  
  getTeamMember: (memberId: ID) =>
    api.get<TeamMember>(`/api/team/members/${memberId}`),

  // KPIs
  getKPIs: (range: 'day' | 'week' | 'month' | 'year') =>
    api.get<{
      totalConversations: number;
      activeConversations: number;
      avgResponseTime: number;
      satisfactionScore: number;
    }>(`/api/kpis?range=${range}`),
  
  getConversationStats: (conversationId: ID) =>
    api.get<{
      messageCount: number;
      avgResponseTime: number;
      escalationCount: number;
    }>(`/api/conversations/${conversationId}/stats`)
};
```

## 5. Claves de cache (React Query)

```typescript
// src/hooks/shared/useStats.ts (ejemplo de claves)
export const queryKeys = {
  // Auth
  me: ['me'] as const,
  
  // Conversations
  conversations: (filters?: unknown) => ['conversations', filters] as const,
  conversation: (id: ID) => ['conversation', id] as const,
  
  // Messages
  messages: (conversationId: ID) => ['messages', conversationId] as const,
  
  // Clients
  clients: (filters?: unknown) => ['clients', filters] as const,
  client: (id: ID) => ['client', id] as const,
  
  // Team
  teamMembers: ['team', 'members'] as const,
  teamMember: (id: ID) => ['team', 'member', id] as const,
  
  // KPIs
  kpis: (range: string) => ['kpis', range] as const,
  conversationStats: (id: ID) => ['conversation', id, 'stats'] as const,
  
  // Media
  mediaUrl: (mediaId: ID) => ['media', mediaId, 'url'] as const,
};
```

## 6. Hooks de React Query (ejemplos)

```typescript
// src/hooks/useConversations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Api } from '../services/api';
import { queryKeys } from './shared/useStats';

export const useConversations = (cursor?: string, limit = 20) => {
  return useQuery({
    queryKey: queryKeys.conversations({ cursor, limit }),
    queryFn: () => Api.listConversations(cursor, limit),
    staleTime: 10000, // 10 segundos
    refetchOnWindowFocus: true,
  });
};

export const useConversation = (conversationId: ID) => {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: () => Api.getConversation(conversationId),
    enabled: !!conversationId,
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: ID; updates: Partial<Conversation> }) =>
      Api.updateConversation(id, updates),
    onSuccess: (updatedConversation) => {
      // Actualizar cache
      queryClient.setQueryData(
        queryKeys.conversation(updatedConversation.id),
        updatedConversation
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations()
      });
    },
  });
};

// src/hooks/useMessages.ts
export const useMessages = (conversationId: ID, cursor?: string, limit = 50) => {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => Api.getMessages(conversationId, cursor, limit),
    enabled: !!conversationId,
    staleTime: 0, // Siempre fresh para mensajes
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: Omit<Message, 'id' | 'createdAt' | 'senderId'>) =>
      Api.sendMessage(payload),
    onSuccess: (newMessage) => {
      // Actualizar cache de mensajes
      queryClient.setQueryData(
        queryKeys.messages(newMessage.conversationId),
        (old: any) => ({
          ...old,
          items: [...(old?.items || []), newMessage]
        })
      );
      
      // Actualizar última actividad de conversación
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations()
      });
    },
  });
};
```

## 7. Errores y reintentos

```typescript
// src/utils/retryUtils.ts (implementado)
export const retryConfig = {
  retries: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  retryCondition: (error: any) => {
    // Solo reintentar en errores de red o 5xx
    return !error.response || error.response.status >= 500;
  }
};

// Configuración en React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: retryConfig.retries,
      retryDelay: retryConfig.retryDelay,
      retryOnMount: true,
    },
    mutations: {
      retry: false, // No reintentar mutaciones por defecto
    },
  },
});
```

## 8. Rate Limiting

```typescript
// src/utils/rateLimiter.ts (implementado)
export const rateLimiter = {
  limits: new Map<string, { count: number; resetTime: number }>(),
  
  checkRateLimit: (endpoint: string): boolean => {
    const now = Date.now();
    const limit = rateLimiter.limits.get(endpoint);
    
    if (!limit || now > limit.resetTime) {
      rateLimiter.limits.set(endpoint, { count: 1, resetTime: now + 60000 });
      return true;
    }
    
    if (limit.count >= 10) { // 10 requests por minuto
      return false;
    }
    
    limit.count++;
    return true;
  }
};
```

## 9. Ejemplos de uso en componentes

```typescript
// src/components/chat/ChatArea.tsx (ejemplo)
import { useMessages, useSendMessage } from '../../hooks/useMessages';

export const ChatArea: React.FC<{ conversationId: ID }> = ({ conversationId }) => {
  const { data: messagesData, isLoading } = useMessages(conversationId);
  const sendMessageMutation = useSendMessage();
  
  const handleSendMessage = async (text: string) => {
    const messageId = crypto.randomUUID();
    
    try {
      await sendMessageMutation.mutateAsync({
        messageId,
        conversationId,
        type: 'text',
        text
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Mostrar toast de error
    }
  };
  
  return (
    <div>
      {isLoading ? (
        <div>Loading messages...</div>
      ) : (
        <div>
          {messagesData?.items.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
};
```

## 10. Validación con Zod

```typescript
// src/types/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres')
});

export const messageSchema = z.object({
  messageId: z.string().uuid(),
  conversationId: z.string().uuid(),
  type: z.enum(['text', 'image', 'audio', 'file']),
  text: z.string().optional(),
  mediaId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional()
});

export const conversationUpdateSchema = z.object({
  status: z.enum(['open', 'pending', 'closed', 'escalated']).optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional()
});

// Uso en formularios
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: '',
    password: ''
  }
});
```

## 11. Manejo de errores centralizado

```typescript
// src/utils/errorHandler.ts
import toast from 'react-hot-toast';

export const handleApiError = (error: any, context?: string) => {
  const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
  
  // Log para debugging
  console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  
  // Mostrar toast al usuario
  toast.error(errorMessage);
  
  // Manejar errores específicos
  switch (error.response?.status) {
    case 401:
      // Token expirado, redirigir a login
      localStorage.clear();
      window.location.href = '/login';
      break;
    case 403:
      toast.error('No tienes permisos para esta acción');
      break;
    case 429:
      toast.error('Demasiadas peticiones. Intenta de nuevo en unos minutos');
      break;
    default:
      break;
  }
};
```

## 12. Contratos WebSocket

```typescript
// src/hooks/websocket/useWebSocketEvents.ts
export interface WebSocketEvents {
  // Client → Server
  'message:send': (payload: {
    messageId: string;
    conversationId: string;
    type: 'text' | 'image' | 'audio' | 'file';
    text?: string;
    mediaId?: string;
    metadata?: any;
  }, ack: (res: { delivered: boolean; serverId?: string }) => void) => void;
  
  'typing:start': (payload: { conversationId: string }) => void;
  'typing:stop': (payload: { conversationId: string }) => void;
  'conversation:read': (payload: { conversationId: string; messageId: string }) => void;
  
  // Server → Client
  'message:new': (msg: Message) => void;
  'message:delivered': (payload: { messageId: string }) => void;
  'message:read': (payload: { conversationId: string; messageId: string }) => void;
  'conversation:updated': (conv: Conversation) => void;
  'escalation:started': (c: { conversationId: string }) => void;
  'escalation:ended': (c: { conversationId: string }) => void;
}
``` 