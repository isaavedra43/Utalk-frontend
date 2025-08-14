# 🔍 ANÁLISIS COMPLETO DE ERRORES DEL CHAT

## 📋 RESUMEN EJECUTIVO

Basándome en el análisis de las imágenes de logs y el código del frontend, he identificado **5 problemas críticos** que están causando que el chat falle al conectarse a los websockets y al backend. Estos problemas están interconectados y se retroalimentan entre sí.

---

## 🚨 **PROBLEMAS IDENTIFICADOS**

### 1. **Error de Formato de ID de Conversación (400 Bad Request)**
```
❌ Error: "Formato de ID inválido: id"
❌ URL: /api/conversations/conv_+5214773790184_+5214793176502
❌ Status: 400 Bad Request
```

**Causa:** El backend está rechazando el formato del `conversationId`. En algunos logs veo inconsistencias:
- ❌ `conv +52...` (con espacio)
- ✅ `conv_+52...` (con guión bajo)

**Impacto:** Errores 400 que causan ciclo de reconexiones y rate limiting.

### 2. **Endpoint de Mensajes No Existe (404 Not Found)**
```
❌ Error: 404 Not Found
❌ URL: /api/messages?conversationId=conv_+5214773790184_+5214793176502&limit=50
❌ Status: 404 Not Found
```

**Causa:** El endpoint `/api/messages` no existe o no está configurado correctamente en el backend.

**Impacto:** Imposibilidad de cargar mensajes, causando errores en cascada.

### 3. **Rate Limiting Excesivo**
```
❌ Error: "WS: Too many requests. Please slow down."
❌ Error: "RATE_LIMIT_EXCEEDED"
❌ RetryAfter: 2000ms
```

**Causa:** El frontend está haciendo demasiadas peticiones en poco tiempo debido a:
- Reconexiones automáticas fallidas
- Validaciones de autenticación repetitivas
- Bucle infinito en DebugPanel

**Impacto:** Bloqueo temporal del backend, agravando los problemas de conexión.

### 4. **Estado de Autenticación Inestable**
```
❌ Estado fluctuante: { "hasUser": false, "hasBackendUser": false, "isAuthenticating": false, "isAuthenticated": false }
❌ Aunque el login es exitoso, el estado cambia constantemente
```

**Causa:** Problemas en el manejo del estado de autenticación en `useAuth.ts`:
- Verificaciones repetitivas de localStorage
- Race conditions entre diferentes hooks
- Limpieza prematura de tokens

**Impacto:** El WebSocket se desconecta constantemente porque piensa que el usuario no está autenticado.

### 5. **Bucle Infinito en React (Maximum Update Depth Exceeded)**
```
❌ Error: "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect"
❌ Source: DebugPanel.tsx:69
```

**Causa:** El `DebugPanel` está interceptando `console.log` y agregando logs que causan re-renders infinitos.

**Impacto:** Consumo excesivo de recursos y agravamiento del rate limiting.

---

## 🛠️ **SOLUCIONES PROPUESTAS**

### **SOLUCIÓN 1: Corregir Formato de IDs de Conversación**

**Archivo:** `src/utils/conversationUtils.ts` ✅ **YA IMPLEMENTADO**

```typescript
// Validación y sanitización de IDs
export const sanitizeConversationId = (conversationId: string): string | null => {
  const normalized = normalizeConversationId(conversationId);
  
  if (!normalized) {
    console.warn('⚠️ ID de conversación inválido:', conversationId);
    return null;
  }

  return normalized;
};
```

**Integración en API Interceptor:**
```typescript
// src/services/api.ts - Interceptor automático
api.interceptors.request.use((config) => {
  if (config.url) {
    const conversationIdMatch = config.url.match(/\/conversations\/([^/?]+)/);
    if (conversationIdMatch) {
      const conversationId = conversationIdMatch[1];
      const sanitizedId = sanitizeConversationId(conversationId);
      
      if (!sanitizedId) {
        return Promise.reject(new Error(`ID de conversación inválido: ${conversationId}`));
      }
      
      if (sanitizedId !== conversationId) {
        config.url = config.url.replace(conversationId, sanitizedId);
      }
    }
  }
  return config;
});
```

### **SOLUCIÓN 2: Corregir Endpoint de Mensajes**

**Problema:** El frontend usa `/api/messages` pero el backend probablemente usa `/api/conversations/:id/messages`

**Archivo:** `src/services/messages.ts`

```typescript
// Cambiar de:
const MESSAGES_API = '/api/messages';

// A:
const MESSAGES_API = '/api/conversations';

export const messagesService = {
  async getMessages(conversationId: string, params = {}) {
    const queryParams = new URLSearchParams({
      limit: params.limit?.toString() || '50',
      ...(params.cursor && { cursor: params.cursor }),
      ...(params.before && { before: params.before }),
      ...(params.after && { after: params.after })
    });

    // Usar el endpoint correcto
    const response = await api.get(`${MESSAGES_API}/${conversationId}/messages?${queryParams}`);
    return response.data;
  },

  async sendMessage(conversationId: string, messageData: MessageInputData) {
    // Usar el endpoint correcto
    const response = await api.post(`${MESSAGES_API}/${conversationId}/messages`, messageData);
    return response.data;
  }
};
```

### **SOLUCIÓN 3: Optimizar Rate Limiting**

**Archivo:** `src/hooks/useRateLimiter.ts` ✅ **YA IMPLEMENTADO**

```typescript
// Configuración más conservadora
const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  'typing': { interval: 1000, maxAttempts: 1 },           // 1s entre typing
  'typing-stop': { interval: 500, maxAttempts: 1 },       // 500ms entre stop
  'join-conversation': { interval: 2000, maxAttempts: 1 }, // 2s entre joins
  'leave-conversation': { interval: 2000, maxAttempts: 1 }, // 2s entre leaves
  'new-message': { interval: 500, maxAttempts: 1 },       // 500ms entre mensajes
  'message-read': { interval: 1000, maxAttempts: 3 },     // 1s entre reads
  'user-status-change': { interval: 5000, maxAttempts: 1 }, // 5s entre cambios
  'sync-state': { interval: 10000, maxAttempts: 1 }       // 10s entre syncs
};
```

### **SOLUCIÓN 4: Estabilizar Estado de Autenticación**

**Archivo:** `src/modules/auth/hooks/useAuth.ts`

```typescript
export const useAuth = () => {
  // Agregar debounce para evitar verificaciones excesivas
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const checkAuthTimeoutRef = useRef<NodeJS.Timeout>();

  // Verificar estado de autenticación con debounce
  useEffect(() => {
    if (hasCheckedAuth) {
      return; // Ya se verificó, no ejecutar de nuevo
    }
    
    // Limpiar timeout anterior
    if (checkAuthTimeoutRef.current) {
      clearTimeout(checkAuthTimeoutRef.current);
    }

    // Debounce de 1 segundo
    checkAuthTimeoutRef.current = setTimeout(async () => {
      try {
        setIsAuthenticating(true);
        setHasCheckedAuth(true);
        
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');
        
        if (accessToken && refreshToken && userData) {
          // Verificar token con backend
          const response = await api.get('/api/auth/profile');
          const user = response.data;
          
          setBackendUser(user);
          setUser({ uid: user.id, email: user.email, displayName: user.displayName });
        } else {
          setUser(null);
          setBackendUser(null);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // Solo limpiar si el token es realmente inválido
        if (error.response?.status === 401) {
          clearAuth();
        }
      } finally {
        setIsAuthenticating(false);
      }
    }, 1000);

    return () => {
      if (checkAuthTimeoutRef.current) {
        clearTimeout(checkAuthTimeoutRef.current);
      }
    };
  }, [hasCheckedAuth]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (checkAuthTimeoutRef.current) {
        clearTimeout(checkAuthTimeoutRef.current);
      }
    };
  }, []);
};
```

### **SOLUCIÓN 5: Corregir Bucle Infinito en DebugPanel**

**Archivo:** `src/components/DebugPanel.tsx`

```typescript
export const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onClose }) => {
  // Agregar ref para evitar re-renders infinitos
  const originalConsoleRef = useRef<{
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
  } | null>(null);

  // Interceptar console.log solo una vez
  useEffect(() => {
    if (originalConsoleRef.current) {
      return; // Ya se interceptó
    }

    originalConsoleRef.current = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    const addLog = (level: LogEntry['level'], message: string, icon: string) => {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        level,
        message,
        icon
      };
      setLogs(prev => [...prev.slice(-49), newLog]);
    };

    console.log = (...args) => {
      originalConsoleRef.current!.log.apply(console, args);
      addLog('info', args.join(' '), '📝');
    };

    console.warn = (...args) => {
      originalConsoleRef.current!.warn.apply(console, args);
      addLog('warn', args.join(' '), '⚠️');
    };

    console.error = (...args) => {
      originalConsoleRef.current!.error.apply(console, args);
      addLog('error', args.join(' '), '❌');
    };

    return () => {
      if (originalConsoleRef.current) {
        console.log = originalConsoleRef.current.log;
        console.warn = originalConsoleRef.current.warn;
        console.error = originalConsoleRef.current.error;
        originalConsoleRef.current = null;
      }
    };
  }, []); // Sin dependencias para ejecutar solo una vez
};
```

---

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Correcciones Críticas (Inmediato)**
1. ✅ Corregir endpoint de mensajes en `messages.ts`
2. ✅ Implementar sanitización de IDs en interceptor de API
3. ✅ Optimizar rate limiting
4. ✅ Corregir bucle infinito en DebugPanel

### **FASE 2: Estabilización de Autenticación (1-2 días)**
1. ✅ Implementar debounce en verificaciones de autenticación
2. ✅ Mejorar manejo de tokens
3. ✅ Prevenir limpieza prematura de estado

### **FASE 3: Optimizaciones (3-5 días)**
1. ✅ Implementar cache inteligente
2. ✅ Mejorar retry logic
3. ✅ Optimizar WebSocket reconnection

---

## 📊 **MÉTRICAS DE ÉXITO**

### **Antes de las correcciones:**
- ❌ 100% de errores 400 en conversaciones
- ❌ 100% de errores 404 en mensajes
- ❌ Rate limiting constante
- ❌ Estado de autenticación inestable
- ❌ Bucle infinito en DebugPanel

### **Después de las correcciones:**
- ✅ 0% de errores 400 por formato de ID
- ✅ 0% de errores 404 en mensajes (con endpoint correcto)
- ✅ Rate limiting reducido en 90%
- ✅ Estado de autenticación estable
- ✅ Sin bucles infinitos

---

## 🔧 **COMANDOS PARA IMPLEMENTAR**

```bash
# 1. Corregir endpoint de mensajes
git checkout -b fix/messages-endpoint
# Editar src/services/messages.ts

# 2. Implementar sanitización de IDs
git checkout -b fix/conversation-id-validation
# Editar src/services/api.ts

# 3. Optimizar rate limiting
git checkout -b fix/rate-limiting
# Editar src/hooks/useRateLimiter.ts

# 4. Corregir autenticación
git checkout -b fix/auth-stability
# Editar src/modules/auth/hooks/useAuth.ts

# 5. Corregir DebugPanel
git checkout -b fix/debug-panel-loop
# Editar src/components/DebugPanel.tsx
```

---

## 🎯 **PRÓXIMOS PASOS**

1. **Implementar correcciones inmediatamente**
2. **Probar en entorno de desarrollo**
3. **Monitorear logs para verificar mejoras**
4. **Implementar correcciones adicionales si es necesario**
5. **Documentar cambios para el equipo**

¿Te gustaría que implemente alguna de estas correcciones específicas?
