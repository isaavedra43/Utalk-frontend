# BACKEND_ADVANCED_LOGIC.md

> **📋 NOTA IMPORTANTE:** Este documento fue generado automáticamente desde la rama `main` del backend a fecha 2025-08-02. Corresponde exactamente a la lógica implementada en ese momento y sigue los [elementos de calidad de backend](https://github.com/fpereiro/backendqual).

---

## 📑 ÍNDICE

- [1. Flujos Internos Detallados](#1-flujos-internos-detallados)
- [2. Edge Cases y Comportamiento Especial](#2-edge-cases-y-comportamiento-especial)
- [3. Eventos, Listeners y Lógica Asincrónica](#3-eventos-listeners-y-lógica-asincrónica)
- [4. Reglas de Negocio y Validaciones Internas](#4-reglas-de-negocio-y-validaciones-internas)
- [5. Manejo de Sesiones, Tokens y Seguridad](#5-manejo-de-sesiones-tokens-y-seguridad)
- [6. Auditoría de Logs, Métricas y Errores](#6-auditoría-de-logs-métricas-y-errores)
- [7. Recomendaciones y TODOs Detectados](#7-recomendaciones-y-todos-detectados)
- [8. Notas Especiales para Frontend y QA](#8-notas-especiales-para-frontend-y-qa)
- [9. Resumen para Frontend y QA](#9-resumen-para-frontend-y-qa)

---

## 1. Flujos Internos Detallados

### 🔐 Flujo de Autenticación Completo

**LOGIN ENDPOINT: `POST /api/auth/login`**

```
1. Request recibido → authMiddleware skipeado (ruta pública)
2. Extraer { email, password } del body
3. Log: 'login_attempt' con email, IP, userAgent
4. Validación básica:
   - ¿email existe? ¿password existe?
   - Si falta alguno → 400 + 'MISSING_CREDENTIALS'
5. Log: 'query_started' para user_validation
6. User.validatePassword(email, password):
   - Buscar usuario en Firestore por email
   - Comparar password con bcrypt (almacenado en plain text - ⚠️ SECURITY ISSUE)
   - Retornar boolean
7. Si password inválido:
   - Log: 'login_failed' con reason: 'invalid_credentials'
   - Incrementar failed attempts (rate limiting interno)
   - Respuesta 401 + 'INVALID_CREDENTIALS'
8. Si password válido:
   - Log: 'login_success'
   - Generar access token (JWT, 15min TTL)
   - Generar refresh token (UUID, 7 días TTL)
   - Guardar refresh token en Firestore con metadata
   - Log: 'tokens_generated'
   - Respuesta 200 + { accessToken, refreshToken, user }
```

**Diagrama de Flujo:**

```
[Request] → [Validar Body] → [DB Query] → [Password Check]
    ↓              ↓             ↓           ↓
[Log Attempt] [400 Error] [User Found] [bcrypt.compare]
    ↓                          ↓           ↓
[Continue]                [404 Error] [Success/Fail]
    ↓                                      ↓
[Generate Tokens] ←←←←←←←←←←←←←←←←←←←←←←← [401/200]
    ↓
[Save Refresh Token]
    ↓
[Response + Logs]
```

### 💬 Flujo de Creación de Mensaje

**ENDPOINT: `POST /api/conversations/:conversationId/messages`**

```
1. authMiddleware → Validar JWT → req.user cargado
2. Extraer conversationId de params
3. Extraer { messageId?, content, type, mediaUrl?, fileMetadata?, replyToMessageId?, metadata? } del body
4. Log: 'processing_started'
5. Validar conversación existe:
   - Conversation.getById(conversationId)
   - Si no existe → 404 + 'CONVERSATION_NOT_FOUND'
6. Validar permisos de usuario:
   - Si req.user.role === 'viewer' → 403 + 'USER_NOT_AUTHORIZED'
7. Validar contenido:
   - Si !content && !mediaUrl → 400 + 'MISSING_CONTENT'
8. Generar/validar messageId:
   - Si no viene del frontend → generar UUID
   - Log: 'id_generated'
9. Validar mediaUrl (si existe):
   - Debe ser URL válida de Firebase Storage
   - Validar metadata del archivo
10. Crear objeto Message completo
11. Intentar envío vía Twilio (si es outbound):
    - Si falla → marcar como 'failed' pero guardar en DB
    - Log: 'twilio_send_attempt'
12. Guardar en Firestore → Message.create()
13. Emitir eventos WebSocket:
    - 'new-message' a la conversación
    - 'message-sent' al sender
14. Log: 'message_created' + 'socket_emitted'
15. Respuesta 201 + message completo
```

### 🔌 Flujo de Conexión WebSocket

**SOCKET CONNECTION FLOW:**

```
1. Cliente conecta a /socket.io con auth: { token }
2. EnterpriseSocketManager.setupAuthenticationMiddleware():
   - Extraer token del handshake.auth
   - Verificar JWT con mismo config que authMiddleware
   - Si inválido → disconnectar con error
   - Si válido → socket.userId = decodedToken.email
3. Event 'connection':
   - Log: 'socket_connected'
   - Agregar a connectedUsers map
   - Configurar event listeners con cleanup automático
   - Rate limiting setup por usuario
4. Event 'join-conversation':
   - Validar permisos de usuario en conversación
   - Agregar socket a room de conversación
   - Actualizar userConversations map
   - Emitir 'conversation-joined'
5. Event 'disconnect':
   - Cleanup automático de listeners
   - Remover de todas las maps
   - Emitir 'user-offline' si era el último socket
   - Garbage collection trigger cada 100 disconnections
```

---

## 2. Edge Cases y Comportamiento Especial

### 📱 Manejo de Mensajes

**Edge Case: Mensaje vacío**

```javascript
// En MessageController.createMessageInConversation()
if (!content && !mediaUrl) {
  throw new ApiError(
    'MISSING_CONTENT',
    'Debes proporcionar contenido o un archivo multimedia',
    400
  );
}
```

**Edge Case: Archivo demasiado grande**

```javascript
// En multer config (MediaUploadController)
limits: {
  fileSize: 100 * 1024 * 1024, // 100MB máximo
  files: 10 // máximo 10 archivos por request
}
```

**Edge Case: Conversación inexistente**

```javascript
// Siempre se valida antes de crear mensaje
const conversation = await Conversation.getById(conversationId);
if (!conversation) {
  throw CommonErrors.CONVERSATION_NOT_FOUND(conversationId);
}
```

**Edge Case: Usuario sin permisos**

```javascript
if (req.user.role === 'viewer') {
  throw CommonErrors.USER_NOT_AUTHORIZED('enviar mensajes', conversationId);
}
```

### 🔐 Autenticación y Sesiones

**Edge Case: Token expirado durante request**

```javascript
// En authMiddleware
if (jwtError.name === 'TokenExpiredError') {
  return res.status(401).json({
    error: 'Token inválido',
    message: 'El token ha expirado. Por favor, inicia sesión de nuevo.',
    code: 'TOKEN_EXPIRED'
  });
}
```

**Edge Case: Múltiples logins simultáneos**

```javascript
// En AuthController.login - rate limiting aplicado
// Máximo 5 intentos por IP por minuto
// Tracked en AdvancedSecurity.failedAttempts Map
```

**Edge Case: Refresh token ya usado**

```javascript
// En RefreshToken.validateAndRotate()
if (token.used) {
  // Invalidar toda la familia de tokens (security breach detection)
  await this.invalidateTokenFamily(token.family);
  throw new Error('Token family compromised');
}
```

### 🎮 WebSocket Edge Cases

**Edge Case: Conexión perdida durante mensaje**

```javascript
// Socket.IO auto-reconexión + state sync
socket.emit('sync-state', { conversationIds: [...] });
// Server responde con estado actual de conversaciones
```

**Edge Case: Rate limiting en eventos**

```javascript
// En EnterpriseSocketManager
const RATE_LIMITS = {
  typing: 500, // 0.5 segundos entre eventos
  'new-message': 100, // 0.1 segundos
  'join-conversation': 1000 // 1 segundo
};
```

**Edge Case: Memory leak en listeners**

```javascript
// Cleanup automático implementado
socket.on('disconnect', () => {
  this.cleanupUserSession(userEmail);
  // Remueve todos los listeners y maps entries
});
```

---

## 3. Eventos, Listeners y Lógica Asincrónica

### 🔌 Socket.IO Events Completos

**Eventos del Cliente → Servidor:**

| Evento               | Payload                         | Autenticación | Respuesta                      | Descripción                   |
| -------------------- | ------------------------------- | ------------- | ------------------------------ | ----------------------------- |
| `authenticate`       | `{ token }`                     | ❌            | `authenticated` / `auth-error` | Re-autenticar socket          |
| `join-conversation`  | `{ conversationId }`            | ✅            | `conversation-joined`          | Unirse a sala de conversación |
| `leave-conversation` | `{ conversationId }`            | ✅            | `conversation-left`            | Salir de sala                 |
| `new-message`        | `{ content, type, mediaUrl? }`  | ✅            | `message-sent`                 | Enviar mensaje tiempo real    |
| `typing`             | `{ conversationId }`            | ✅            | `typing` (broadcast)           | Indicador de escribiendo      |
| `typing-stop`        | `{ conversationId }`            | ✅            | `typing-stop` (broadcast)      | Parar indicador               |
| `message-read`       | `{ messageId, conversationId }` | ✅            | `message-delivered`            | Marcar como leído             |
| `sync-state`         | `{ conversationIds[] }`         | ✅            | `state-synced`                 | Sincronizar estado            |

**Eventos del Servidor → Cliente:**

| Evento                | Payload                         | Trigger            | Descripción                   |
| --------------------- | ------------------------------- | ------------------ | ----------------------------- |
| `conversation-joined` | `{ conversationId, user }`      | join-conversation  | Usuario se unió               |
| `conversation-left`   | `{ conversationId, user }`      | leave-conversation | Usuario salió                 |
| `new-message`         | `{ message, conversation }`     | Message created    | Nuevo mensaje en conversación |
| `message-sent`        | `{ messageId, status }`         | Message saved      | Confirmación de envío         |
| `message-delivered`   | `{ messageId, deliveredAt }`    | Twilio webhook     | Mensaje entregado             |
| `message-read`        | `{ messageId, readAt, readBy }` | Mark as read       | Mensaje leído                 |
| `typing`              | `{ conversationId, user }`      | Typing event       | Alguien está escribiendo      |
| `typing-stop`         | `{ conversationId, user }`      | Typing stop        | Paró de escribir              |
| `user-online`         | `{ email, name, lastSeen }`     | Socket connect     | Usuario conectado             |
| `user-offline`        | `{ email, lastSeen }`           | Socket disconnect  | Usuario desconectado          |
| `admin-broadcast`     | `{ message, type, data }`       | Admin action       | Mensaje administrativo        |

### 🔄 Lógica Asincrónica Interna

**Background Jobs (NO implementados - uso de setTimeout):**

```javascript
// En MessageService - retry de envío Twilio
setTimeout(async () => {
  await this.retryFailedMessage(messageId);
}, 30000); // 30 segundos
```

**Event Emitters Internos:**

```javascript
// memoryManager events
memoryManager.on('warning-alert', alert => {
  logger.warn('Memory warning', alert);
});

// healthService events
healthService.on('service-down', serviceName => {
  // Notificar a admins vía WebSocket
});
```

**Cleanup Automático:**

```javascript
// En EnterpriseSocketManager
setInterval(
  () => {
    this.performMemoryCleanup();
  },
  2 * 60 * 1000
); // Cada 2 minutos

setInterval(
  () => {
    this.performMemoryLeakDetection();
  },
  5 * 60 * 1000
); // Cada 5 minutos
```

---

## 4. Reglas de Negocio y Validaciones Internas

### 📝 Validaciones de Mensajes

**Longitud de contenido:**

```javascript
// No hay límite explícito en código, pero Twilio limita:
// - SMS: 1600 caracteres
// - WhatsApp: 4096 caracteres
// Firebase Firestore: 1MB por documento
```

**Tipos de mensaje permitidos:**

```javascript
const validTypes = ['text', 'image', 'audio', 'video', 'document', 'system'];
// Validado en Joi schema en routes/messages.js
```

**Formato de archivos aceptados:**

```javascript
// En MediaUploadController
const allowedMimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  document: ['application/pdf', 'text/plain', 'application/msword']
};
```

### 👥 Reglas de Conversaciones

**Límite de participantes:**

```javascript
// No hay límite explícito en código
// TODO: Implementar límite configurable por plan
```

**Asignación de agentes:**

```javascript
// En ConversationController.assignConversation()
if (!agent.isActive) {
  throw new ApiError('AGENT_INACTIVE', 'El agente está inactivo', 400);
}

if (conversation.assignedTo === assignedTo) {
  throw CommonErrors.CONVERSATION_ALREADY_ASSIGNED(id, assignedTo);
}
```

### 🔐 Reglas de Usuarios y Roles

**Jerarquía de roles:**

```javascript
// Implementado en middleware/auth.js
const roleHierarchy = ['viewer', 'agent', 'admin', 'superadmin'];

// Permisos por rol:
// - viewer: solo lectura básica
// - agent: lectura + escribir mensajes + gestionar conversaciones asignadas
// - admin: todo menos gestión de superadmins
// - superadmin: acceso completo
```

**Restricciones por rol:**

```javascript
// viewer no puede:
// - Crear mensajes (MessageController)
// - Asignar conversaciones (ConversationController)
// - Gestionar team (TeamController)
// - Crear campañas (CampaignController)
```

### 📁 Reglas de Archivos

**Límites de almacenamiento:**

```javascript
// Por archivo: 100MB (multer config)
// Por request: máximo 10 archivos
// Almacenamiento en Firebase Storage con CDN
// TODO: Límites por usuario/plan no implementados
```

**Seguridad de archivos:**

```javascript
// Validación de MIME type
// Sanitización de nombres de archivo
// URLs firmadas de Firebase Storage (TTL configurable)
// Virus scanning: TODO - no implementado
```

---

## 5. Manejo de Sesiones, Tokens y Seguridad

### 🔐 Ciclo de Vida de Tokens

**Access Token (JWT):**

```javascript
// Configuración en config/jwt.js
{
  secret: process.env.JWT_SECRET,
  expiresIn: '15m',
  issuer: 'utalk-backend',
  audience: 'utalk-frontend'
}
```

**Refresh Token (UUID):**

```javascript
// Configuración en config/jwt.js
{
  expiresIn: '7d',
  family: 'uuid-v4', // Para detectar token reuse
  rotateOnUse: true,
  revokeOnSecurity: true
}
```

**Flujo de Renovación:**

```
1. Cliente envía refresh token a POST /auth/refresh
2. Validar token no expirado y no usado
3. Marcar token actual como 'usado'
4. Generar nuevo access + refresh token
5. Invalidar token anterior
6. Responder con nuevos tokens
7. Si hay reuso detectado → invalidar familia completa
```

### 🛡️ Medidas de Seguridad Implementadas

**Rate Limiting Adaptativo:**

```javascript
// En AdvancedSecurity
- Límites automáticos según carga del sistema
- Fallback Redis → Memory store
- Bloqueo temporal por IP sospechosa
- Detección de patrones de ataque
```

**Validaciones de Entrada:**

```javascript
// Joi schemas en todos los endpoints
// Sanitización HTML en middleware/sanitization.js
// Validación de teléfonos con normalización
// Protección contra SQL injection, XSS, Path traversal
```

**CORS Seguro:**

```javascript
// En config/cors.js
development: ['localhost:3000', 'localhost:3001', ...],
production: ['https://utalk.com', 'https://app.utalk.com', ...]
// No wildcards (*) en producción
```

**Headers de Seguridad:**

```javascript
// En index.js setupBasicMiddleware
'X-Content-Type-Options': 'nosniff',
'X-Frame-Options': 'DENY',
'X-XSS-Protection': '1; mode=block',
'Referrer-Policy': 'strict-origin-when-cross-origin'
```

### 🔍 Sistema de Logs de Seguridad

**Eventos auditables:**

```javascript
// Login attempts (success/failed)
req.logger.auth('login_attempt', { email, ip, userAgent });

// Token validation failures
logger.warn('JWT inválido', { category: 'AUTH_JWT_ERROR', ... });

// Suspicious activity
logger.security('unauthorized_access', { operation, userId, ... });

// Admin actions
logger.admin('user_role_change', { targetUser, newRole, ... });
```

---

## 6. Auditoría de Logs, Métricas y Errores

### 📊 Estructura de Logs

**Formato JSON estructurado:**

```javascript
{
  timestamp: '2025-08-02T00:47:01.317Z',
  level: 'info',
  message: 'Usuario autenticado exitosamente',
  category: 'AUTH_SUCCESS',
  requestId: 'req_1725234421_abc123def',
  processId: 68686,
  nodeEnv: 'production',
  userEmail: 'user@example.com',
  ip: '192.168.1.100'
}
```

**Categorías de logs:**

```javascript
// En utils/logger.js
- AUTH: autenticación y autorización
- DATABASE: operaciones de Firestore
- SOCKET: eventos WebSocket
- MESSAGE: creación/envío de mensajes
- SECURITY: eventos de seguridad
- ADMIN: acciones administrativas
- MEDIA: subida/procesamiento de archivos
- TWILIO: integración con Twilio
- ERROR: errores y excepciones
- PERFORMANCE: métricas de rendimiento
```

**Filtrado de datos sensibles:**

```javascript
// En logger.js y enhancedErrorHandler.js
const sensitiveFields = [
  'password',
  'token',
  'authorization',
  'secret',
  'key',
  'auth',
  'credential',
  'jwt',
  'refresh_token',
  'api-key'
];
// Automáticamente filtrados como '[FILTERED]'
```

### 🚨 Sistema de Errores Unificado

**Tipos de error clasificados:**

```javascript
// En enhancedErrorHandler.js
ERROR_TYPES = {
  VALIDATION: 400,
  AUTHENTICATION: 401,
  AUTHORIZATION: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  EXTERNAL_SERVICE: 502,
  DATABASE: 503,
  INTERNAL: 500,
  SECURITY: 403
};
```

**Rate limiting de errores:**

```javascript
// Prevenir spam de errores idénticos
if (this.isErrorRateLimited(errorContext)) {
  return res.status(429).json({
    error: 'Too many similar errors',
    message: 'Rate limit exceeded for error reporting'
  });
}
```

### 📈 Métricas y Monitoreo

**Métricas automáticas:**

```javascript
// En EnterpriseSocketManager
metrics: {
  connectionsPerSecond: 0,
  messagesPerSecond: 0,
  disconnectionsPerSecond: 0,
  errorsPerSecond: 0,
  lastResetTime: Date.now()
}
```

**Health checks endpoint:**

```
GET /health/detailed → Firestore, Storage, Redis, System status
GET /ready → Readiness probe para K8s
GET /api/internal/metrics → Métricas detalladas (auth requerido)
```

**Alertas críticas:**

```javascript
// Trigger automático en:
- Memory usage > 85%
- Error rate > 5 errores/segundo
- External service down > 30 segundos
- Socket connections > 45000
```

---

## 7. Recomendaciones y TODOs Detectados

### 🔴 TODOs Críticos Encontrados

**Seguridad:**

```javascript
// src/middleware/auth.js:375-376
requireAgentOrAdmin: requireRole(['admin', 'superadmin', 'agent']), // TODO: Migrar a requireWriteAccess
requireViewerOrHigher: requireReadAccess // TODO: Migrar a requireReadAccess
```

**Implementaciones pendientes:**

```javascript
// TeamController.js - Email sending
// TODO: Implementar envío de email para invitaciones

// ContactController.js - Business rules
// TODO: Implementar lógica real para duplicados

// CampaignController.js - Advanced scheduling
// TODO: Implementar scheduling avanzado de campañas
```

### ⚠️ Problemas de Seguridad Identificados

**Contraseñas en texto plano:**

```javascript
// src/models/User.js - CRÍTICO
// Contraseñas almacenadas sin hash en Firestore
// URGENTE: Implementar bcrypt.hash() antes de guardar
```

**Validación insuficiente:**

```javascript
// Rate limiting por usuario no implementado en WebSocket
// File type validation solo por MIME (spoofeable)
// No hay virus scanning en uploads
```

### 🔧 Mejoras de Arquitectura Recomendadas

**Background Jobs:**

```javascript
// Implementar queue real (Redis/Bull) en lugar de setTimeout
// Para: retry de mensajes, cleanup de archivos, envío de emails
```

**Caching:**

```javascript
// Implementar Redis caching para:
// - User sessions activas
// - Conversation metadata frecuente
// - File metadata y URLs
```

**Observabilidad:**

```javascript
// Añadir tracing distribuido (OpenTelemetry)
// Métricas de Prometheus
// Dashboard de Grafana
```

---

## 8. Notas Especiales para Frontend y QA

### 🎨 Para Desarrolladores Frontend

**Reconexión WebSocket:**

```javascript
// Implementar exponential backoff
const socket = io(WS_URL, {
  auth: { token },
  timeout: 5000,
  retries: 3,
  retryDelay: 1000
});

// Listener obligatorio para sync después de reconexión
socket.on('connect', () => {
  socket.emit('sync-state', {
    conversationIds: getActiveConversationIds()
  });
});
```

**Manejo de errores 401:**

```javascript
// Interceptor HTTP para auto-refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      await refreshToken();
      return axios.request(error.config);
    }
    throw error;
  }
);
```

**Validación client-side obligatoria:**

```javascript
// Implementar misma validación Joi en frontend
// Para reducir requests inválidos y mejorar UX
// Especialmente importante para:
- Longitud de mensajes
- Formato de teléfonos
- Tamaño de archivos
- Tipos MIME aceptados
```

**Estados de mensaje:**

```javascript
// Estados progresivos que frontend debe manejar:
'sending' → 'sent' → 'delivered' → 'read' → 'failed'

// Reintentos automáticos solo para 'failed' con reason específico
// No reintentar errores 400 (validation) o 403 (permission)
```

### 🧪 Para QA Testing

**Edge Cases críticos a probar:**

1. **Conectividad:**
   - Pérdida de internet durante envío de mensaje
   - Reconexión WebSocket con estado inconsistente
   - Timeout en upload de archivos grandes

2. **Concurrencia:**
   - Múltiples usuarios escribiendo simultáneamente
   - Mismo mensaje enviado desde web y móvil
   - Usuario conectado en múltiples pestañas

3. **Límites y Rate Limiting:**
   - Enviar 100 mensajes en 1 segundo
   - Upload simultáneo de 10 archivos de 100MB
   - Login failures repetidos (trigger IP blocking)

4. **Errores de servicios externos:**
   - Firebase Firestore down
   - Twilio API returning 503
   - Redis connection lost

**Herramientas de testing recomendadas:**

```bash
# Load testing WebSocket
npx artillery run socket-load-test.yml

# API stress testing
npx artillery run api-stress-test.yml

# Memory leak detection
node --inspect src/index.js
# Conectar Chrome DevTools → Memory tab
```

**Simulación de errores:**

```javascript
// Usar endpoints de testing (solo en dev)
POST /api/internal/simulate-error
{ type: 'firestore_timeout', duration: 5000 }

POST /api/internal/trigger-memory-pressure
{ targetUsage: 0.85 }
```

### 📱 Consideraciones Mobile

**Timeouts ajustados:**

```javascript
// Configurar timeouts más largos en mobile
const API_TIMEOUT = isMobile ? 15000 : 10000;
```

**Optimización de datos:**

```javascript
// Paginación más pequeña en mobile
const PAGE_SIZE = isMobile ? 20 : 50;

// Compresión de imágenes antes de upload
// Implementar progressive JPEG loading
```

**Background sync:**

```javascript
// Implementar Service Worker para:
// - Queue de mensajes offline
// - Background sync cuando vuelve conectividad
// - Push notifications
```

---

## 9. Resumen para Frontend y QA

### 🚨 **CRÍTICO - Implementar Siempre**

1. **Interceptor de 401:** Auto-refresh token en requests HTTP
2. **WebSocket reconnection:** Con state sync obligatorio
3. **Error boundaries:** Para manejar errores 500 inesperados
4. **Loading states:** Para todas las operaciones asíncronas
5. **Offline detection:** Queue de acciones cuando no hay internet

### ⚠️ **IMPORTANTE - Validar Edge Cases**

1. **File uploads > 50MB:** Mostrar progress + cancelación
2. **Mensajes largos:** Truncar o dividir automáticamente
3. **Múltiples conexiones:** Detectar y sincronizar estado
4. **Memory leaks:** Cleanup de listeners y components
5. **Rate limiting:** Mostrar mensajes informativos, no errores

### 🔧 **OPTIMIZACIONES - Performance**

1. **Lazy loading:** Conversaciones e imágenes
2. **Message pagination:** Infinite scroll con virtual scrolling
3. **Image compression:** Antes de upload
4. **Debounce:** En typing indicators y search
5. **Local caching:** User data y conversations metadata

### 📊 **MONITOREO - Métricas Frontend**

1. **Error tracking:** Sentry/LogRocket integration
2. **Performance:** Core Web Vitals monitoring
3. **User flows:** Funnel analysis para login → message sent
4. **WebSocket health:** Connection drops y reconnections
5. **API response times:** Por endpoint y percentiles

### 🔗 **LINKS RÁPIDOS**

- **Login Flow:** `POST /api/auth/login` → `POST /api/auth/refresh`
- **WebSocket Events:** [Ver sección 3](#3-eventos-listeners-y-lógica-asincrónica)
- **Error Codes:** [Ver enhancedErrorHandler.js](#6-auditoría-de-logs-métricas-y-errores)
- **File Upload:** `POST /api/media/upload` → Firebase Storage URLs
- **Health Check:** `GET /health/detailed` para debugging

---

**📞 Para soporte técnico o dudas sobre esta documentación, contactar al Backend Team.**

**🔄 Última actualización:** 2025-08-02 | **Versión del backend:** 4.1.0 Enterprise
