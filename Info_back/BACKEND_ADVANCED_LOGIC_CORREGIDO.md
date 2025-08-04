# BACKEND_ADVANCED_LOGIC_CORREGIDO.md

> **🚨 ADVERTENCIA CRÍTICA:** Este documento es la fuente única de verdad para la integración Frontend-Backend, y debe revisarse antes de cualquier trabajo de Front. Contiene TODOS los edge cases, transformaciones implícitas, side effects y comportamientos especiales que pueden romper la integración si no se conocen.

> **📋 NOTA TÉCNICA:** Generado automáticamente desde la rama `main` del backend a fecha 2025-08-02, siguiendo las mejores prácticas de [documentación de backend para 2025](https://overcast.blog/documenting-backend-code-a-guide-for-2025-843cb25d9895).

---

## 📑 ÍNDICE CRÍTICO

- [1. GAPS Y OMISIONES CRÍTICAS DETECTADAS](#1-gaps-y-omisiones-críticas-detectadas)
- [2. SIDE EFFECTS Y MUTACIONES AUTOMÁTICAS](#2-side-effects-y-mutaciones-automáticas)
- [3. TRANSFORMACIONES IMPLÍCITAS DE DATOS](#3-transformaciones-implícitas-de-datos)
- [4. EDGE CASES CRÍTICOS NO DOCUMENTADOS](#4-edge-cases-críticos-no-documentados)
- [5. VALIDACIONES OCULTAS Y COMPORTAMIENTOS ESPECIALES](#5-validaciones-ocultas-y-comportamientos-especiales)
- [6. INCONSISTENCIAS Y ADVERTENCIAS DE ARQUITECTURA](#6-inconsistencias-y-advertencias-de-arquitectura)
- [7. PROBLEMAS DE SEGURIDAD CRÍTICOS](#7-problemas-de-seguridad-críticos)
- [8. TODOS Y FIXMES CRÍTICOS](#8-todos-y-fixmes-críticos)
- [9. RECOMENDACIONES FINALES PARA DESARROLLO FRONT](#9-recomendaciones-finales-para-desarrollo-front)

---

## 1. GAPS Y OMISIONES CRÍTICAS DETECTADAS

### 🔴 **CRÍTICO: Sistema de Fechas Inconsistente**

El backend maneja **6 formatos diferentes de fecha** que el frontend debe estar preparado para recibir:

```javascript
// FORMATOS POSIBLES EN RESPUESTAS:
{
  "createdAt": "2025-08-02T00:47:01.317Z",        // ISO String (más común)
  "updatedAt": { "_seconds": 1727234421, "_nanoseconds": 317000000 }, // Firestore raw
  "lastMessageAt": { "seconds": 1727234421, "nanoseconds": 317000000 }, // Firestore serialized
  "timestamp": 1727234421317,                      // Unix timestamp (ms)
  "readAt": null,                                  // null explícito
  "deletedAt": undefined                           // undefined (campo ausente)
}
```

**🚨 ADVERTENCIA FRONTEND:**

- Usar SIEMPRE `safeDateToISOString()` para parsear fechas del backend
- Nunca asumir formato específico - implementar fallbacks
- Campos de fecha pueden ser `null`, `undefined` o ausentes completamente

### 🔴 **CRÍTICO: Campos Calculados Dinámicamente**

Algunos campos en las respuestas se calculan dinámicamente y NO están en la base de datos:

```javascript
// En GET /api/conversations/:id
{
  "id": "uuid-v4",
  "customerPhone": "+1234567890",
  "assignedTo": "agent@example.com",

  // ⚠️ CAMPOS CALCULADOS - No están en DB:
  "isOnline": true,                    // Calculado desde Socket.IO connectedUsers
  "lastSeen": "2025-08-02T00:45:00Z",  // Calculado desde última actividad
  "unreadCount": 5,                    // Calculado contando mensajes no leídos
  "responseTime": 150000,              // Calculado promedio de respuesta
  "participantCount": 2,               // Calculado desde participants.length

  // ⚠️ CAMPOS CONDICIONALES - Solo aparecen si cumplen condiciones:
  "contact": { ... },                  // Solo si el customerPhone tiene contacto
  "lastMessage": { ... },              // Solo si hay mensajes en la conversación
  "tags": [],                          // Solo si priority !== 'normal'
}
```

### 🔴 **CRÍTICO: Validaciones Joi Estrictas No Documentadas**

```javascript
// src/routes/messages.js - Validaciones que pueden bloquear requests:

// Longitud máxima de mensaje - MUY ESPECÍFICA
content: Joi.string().min(1).max(4096).required();

// Teléfonos - FORMATO EXACTO requerido
to: Joi.string()
  .pattern(/^\+[1-9]\d{1,14}$/)
  .optional();

// Archivos adjuntos - LÍMITE ESTRICTO
attachments: Joi.array()
  .items(
    Joi.object({
      url: Joi.string().uri().required(),
      type: Joi.string().required(),
      name: Joi.string().optional()
    })
  )
  .max(10)
  .optional();

// UUIDs - DEBE ser UUID v4 válido
conversationId: Joi.string().uuid().required();
```

**🚨 ADVERTENCIA FRONTEND:**

- Validar LOCALMENTE antes de enviar
- 4096 caracteres MAX en content (incluye emojis = múltiples bytes)
- Máximo 10 attachments por mensaje
- Todos los IDs DEBEN ser UUID v4 válidos

---

## 2. SIDE EFFECTS Y MUTACIONES AUTOMÁTICAS

### 🔄 **Side Effects en Creación de Mensajes**

Cuando se crea un mensaje con `POST /api/conversations/:id/messages`, ocurren **automáticamente**:

```javascript
// SIDE EFFECTS AUTOMÁTICOS en Message.create():

1. **Actualización de Conversación:**
   - conversation.lastMessage = newMessage
   - conversation.lastMessageAt = newMessage.timestamp
   - conversation.messageCount++
   - conversation.updatedAt = NOW

2. **Actualización de Contacto (si existe):**
   - contact.lastContactAt = NOW
   - contact.totalMessages++
   - contact.lastMessageContent = newMessage.content.substring(0, 100)

3. **Socket.IO Broadcasts:**
   - 'new-message' → todos en la conversación
   - 'conversation-updated' → dashboard/lista
   - 'user-activity' → presence tracking

4. **Rate Limiting Updates:**
   - Incrementa contador por usuario/email
   - Actualiza lastMessageTimestamp para rate limiting

5. **Twilio Integration (si outbound):**
   - Intenta envío vía Twilio API
   - Si falla → status = 'failed' pero mensaje se guarda igual
   - Logs automáticos en TwilioService
```

### 🔄 **Side Effects en Autenticación**

```javascript
// En POST /api/auth/login - Side effects automáticos:

1. **User.updateLastActivity():**
   - lastActivityAt = NOW
   - lastLoginAt = NOW
   - loginCount++ (si existe el campo)

2. **RefreshToken Creation:**
   - Crea nuevo refresh token en DB
   - Invalida tokens antiguos de la misma familia
   - Log de sesión activa

3. **Rate Limiting:**
   - Incrementa contador de login attempts por IP
   - Si > 5 intentos → bloqueo temporal de IP

4. **Socket.IO Session:**
   - Si hay socket conectado, actualiza autenticación
   - Emite 'user-authenticated' event
```

### 🔄 **Side Effects en Asignación de Conversaciones**

```javascript
// En PUT /api/conversations/:id/assign - Side effects:

1. **Conversation.assignTo():**
   - assignedTo = newAgentEmail
   - assignedToName = agentData.name
   - assignedAt = NOW
   - updatedAt = NOW

2. **Socket.IO Broadcasts:**
   - 'conversation-assigned' → a todos los agentes
   - 'conversation-updated' → al nuevo agente
   - 'assignment-notification' → al agente específico

3. **Dashboard Metrics:**
   - Actualiza workload del nuevo agente
   - Decrementa workload del agente anterior
   - Recalcula métricas de asignación automática
```

---

## 3. TRANSFORMACIONES IMPLÍCITAS DE DATOS

### 📊 **Transformaciones en Respuestas de Usuario**

```javascript
// src/models/User.js - Campo 'password' NUNCA se retorna:

// EN BASE DE DATOS:
{
  email: "user@example.com",
  password: "plaintext123",        // ⚠️ TEXTO PLANO - PROBLEMA DE SEGURIDAD
  name: "John Doe",
  role: "agent"
}

// EN RESPUESTA API:
{
  email: "user@example.com",
  // password: FILTRADO AUTOMÁTICAMENTE
  name: "John Doe",
  role: "agent",

  // CAMPOS AGREGADOS automáticamente:
  permissions: ["read", "write"],   // Calculado desde role
  isOnline: true,                  // Desde Socket.IO
  lastSeen: "2025-08-02T00:45:00Z" // Desde lastActivityAt
}
```

### 📊 **Transformaciones de Firestore**

```javascript
// AUTOMÁTICAS al leer de Firestore:

// Firestore Storage:
{
  createdAt: Timestamp { _seconds: 1727234421, _nanoseconds: 317000000 },
  participants: ["user1@example.com", "+1234567890"],
  isActive: true
}

// Respuesta API (después de prepareForFirestore):
{
  createdAt: "2025-08-02T00:47:01.317Z",        // Convertido a ISO
  participants: ["user1@example.com", "+1234567890"], // Sin cambios
  isActive: true,

  // CAMPOS AGREGADOS:
  id: "document-id",                            // ID del documento
  updatedAt: "2025-08-02T00:47:01.317Z"        // Timestamp de consulta
}
```

### 📊 **Normalización de Teléfonos**

```javascript
// Automática en TODOS los endpoints que reciben teléfonos:

// INPUT (cualquier formato):
{
  "customerPhone": "123-456-7890",
  "to": "(123) 456-7890",
  "phone": "1234567890"
}

// OUTPUT (normalizado automáticamente):
{
  "customerPhone": "+11234567890",
  "to": "+11234567890",
  "phone": "+11234567890"
}

// ⚠️ ADVERTENCIA: Si no se puede normalizar → ERROR 400
```

---

## 4. EDGE CASES CRÍTICOS NO DOCUMENTADOS

### 🔥 **Edge Case: Conversación Sin Agente Asignado**

```javascript
// GET /api/conversations/:id puede retornar:
{
  id: "uuid",
  customerPhone: "+1234567890",
  assignedTo: null,               // ⚠️ SIN AGENTE ASIGNADO
  assignedToName: null,
  status: "open",

  // ⚠️ FRONTEND debe manejar:
  lastMessage: null,              // Conversación nueva, sin mensajes
  messageCount: 0,
  unreadCount: 0
}

// ⚠️ POST /api/conversations/:id/messages FALLA si no hay agente:
// Error 403: "Conversation must have an assigned agent"
```

### 🔥 **Edge Case: Mensajes con Media Fallida**

```javascript
// Mensaje enviado con archivo, pero Twilio falló:
{
  id: "message-uuid",
  content: "Archivo adjunto",
  mediaUrl: "https://storage.googleapis.com/...",
  status: "failed",                    // ⚠️ Enviado pero no entregado

  // ⚠️ METADATA ESPECIAL en caso de error:
  metadata: {
    failureReason: "Invalid media format",
    twilioError: "63016",
    retryable: false,               // ⚠️ No se debe reintentar
    originalMediaType: "image/webp"  // Tipo no soportado por WhatsApp
  }
}
```

### 🔥 **Edge Case: Token Expirado Durante Request**

```javascript
// Request con token válido al inicio, expirado durante procesamiento:

// REQUEST: POST /api/messages/send (token válido)
// RESPONSE: 401 con código específico
{
  "success": false,
  "error": "TOKEN_EXPIRED_DURING_PROCESSING",
  "message": "El token expiró durante el procesamiento del request",
  "suggestion": "Refresca el token y reintenta la operación",
  "details": {
    "expiredAt": "2025-08-02T00:46:00Z",
    "processedAt": "2025-08-02T00:46:30Z",
    "operation": "message_send"
  }
}
```

### 🔥 **Edge Case: Rate Limiting por Usuario**

```javascript
// Rate limiting POR USUARIO + POR IP:

// Headers en respuesta cuando se acerca al límite:
{
  "X-RateLimit-Limit": "100",           // Requests por ventana
  "X-RateLimit-Remaining": "5",         // Requests restantes
  "X-RateLimit-Reset": "1727234481",    // Timestamp cuando resetea
  "X-RateLimit-User": "user@example.com" // Rate limit por usuario
}

// Error 429 cuando se excede:
{
  "error": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "window": "1 hour",
    "retryAfter": 3600,              // Segundos hasta poder reintentar
    "type": "user_specific"          // Tipo de rate limit aplicado
  }
}
```

---

## 5. VALIDACIONES OCULTAS Y COMPORTAMIENTOS ESPECIALES

### 🔒 **Validaciones de Firestore Rules**

Además de las validaciones Joi, hay **reglas de Firestore** que pueden bloquear operaciones:

```javascript
// firestore.rules - Validaciones ADICIONALES:

// Conversaciones - Solo agentes y admins:
match /conversations/{conversationId} {
  allow read, write: if isAuthenticated() && isAgentOrAbove();
  // ⚠️ VIEWERS no pueden leer conversaciones aunque tengan token válido
}

// Campañas - Solo el creador o admin:
match /campaigns/{campaignId} {
  allow write: if request.auth.uid == resource.data.createdBy || isAdmin();
  // ⚠️ Agentes no pueden editar campañas de otros agentes
}

// Knowledge - Solo admins pueden escribir:
match /knowledge/{knowledgeId} {
  allow write: if isAuthenticated() && isAdmin();
  // ⚠️ Agentes pueden leer pero NO crear/editar artículos
}
```

### 🔒 **Validaciones de Roles en Runtime**

```javascript
// Además de Firestore Rules, hay validaciones en controladores:

// MessageController.createMessageInConversation():
if (req.user.role === 'viewer') {
  throw CommonErrors.USER_NOT_AUTHORIZED('enviar mensajes', conversationId);
  // ⚠️ HTTP 403 incluso con token válido
}

// ConversationController.assignConversation():
if (conversation.assignedTo === assignedTo) {
  throw CommonErrors.CONVERSATION_ALREADY_ASSIGNED(id, assignedTo);
  // ⚠️ HTTP 409 si ya está asignada al mismo agente
}

// CampaignController - En 6 métodos diferentes:
if (req.user.role !== 'admin' && campaign.createdBy !== req.user.id) {
  return res.status(403).json({ error: 'Sin permisos' });
  // ⚠️ Solo admin o creador pueden modificar campañas
}
```

### 🔒 **Validaciones Automáticas de Archivos**

```javascript
// MediaUploadController - Validaciones NO documentadas:

const allowedMimeTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  document: ['application/pdf', 'text/plain', 'application/msword']
};

// ⚠️ Límites específicos:
limits: {
  fileSize: 100 * 1024 * 1024,    // 100MB por archivo
  files: 10,                      // Máximo 10 archivos por request
  fieldSize: 10 * 1024 * 1024     // 10MB para campos de texto
}

// ⚠️ Extensiones bloqueadas automáticamente:
const blockedExtensions = ['.exe', '.bat', '.sh', '.php', '.js', '.html'];
```

---

## 6. INCONSISTENCIAS Y ADVERTENCIAS DE ARQUITECTURA

### ⚠️ **Inconsistencia: Formatos de ID**

```javascript
// PROBLEMA: El sistema usa 3 formatos diferentes de ID:

// 1. UUIDs v4 (nuevo estándar):
"conversationId": "123e4567-e89b-12d3-a456-426614174000"

// 2. IDs de Firestore (legacy):
"documentId": "9m4e2mr0ui3e8a215n4g"

// 3. Teléfonos como ID (contacts):
"contactId": "+1234567890"

// ⚠️ FRONTEND debe validar formato según contexto
```

### ⚠️ **Inconsistencia: Campos de Usuario**

```javascript
// User model maneja EMAIL como ID principal, pero responses inconsistentes:

// En /api/auth/profile:
{
  "email": "user@example.com",     // ID principal
  "id": "user@example.com",        // Duplicado para compatibilidad
  "userId": "firestore-doc-id"     // Legacy ID de Firestore
}

// En Socket.IO events:
{
  "userEmail": "user@example.com", // Diferente nombre de campo
  "user": {
    "email": "user@example.com",
    "id": "firestore-doc-id"       // Usa Firestore ID en lugar de email
  }
}
```

### ⚠️ **Inconsistencia: Timestamps**

```javascript
// PROBLEMA: 3 tipos de timestamp en diferentes endpoints:

// 1. ISO Strings (mayoría):
"createdAt": "2025-08-02T00:47:01.317Z"

// 2. Unix timestamps (Socket.IO):
"connectedAt": 1727234421317

// 3. Firestore Timestamps (raw):
"lastSeen": { "_seconds": 1727234421, "_nanoseconds": 317000000 }

// ⚠️ FRONTEND debe normalizar TODOS los timestamps
```

---

## 7. PROBLEMAS DE SEGURIDAD CRÍTICOS

### 🚨 **CRÍTICO: Contraseñas en Texto Plano**

```javascript
// src/models/User.js línea 142-149:
// ⚠️ PROBLEMA DE SEGURIDAD GRAVE - Contraseñas sin hash

if (userData.password && userData.password === passwordInput) {
  isValid = true;  // ⚠️ Comparación de texto plano
}

// DATABASE:
{
  "email": "admin@example.com",
  "password": "admin123",        // ⚠️ TEXTO PLANO en Firestore
  "passwordHash": "admin123"     // ⚠️ También texto plano
}

// TODO URGENTE: Implementar bcrypt.hash() antes de producción
```

### 🚨 **CRÍTICO: Logs Sensibles**

```javascript
// Información sensible en logs:

// AuthController.login() línea 20-24:
req.logger.auth('login_attempt', {
  email, // ⚠️ Email en logs
  ip: req.ip,
  userAgent: req.headers['user-agent']?.substring(0, 100)
});

// ⚠️ PROBLEMA: Los logs pueden contener:
// - Emails de usuarios
// - IPs completas
// - User agents completos
// - Tokens parciales en caso de error
```

### 🚨 **CRÍTICO: CORS en Desarrollo**

```javascript
// src/config/cors.js - En desarrollo permite TODO:

development: [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

// ⚠️ PROBLEMA: No hay validación de subdominios
// ⚠️ Cualquier puerto localhost puede acceder en dev
```

---

## 8. TODOS Y FIXMES CRÍTICOS

### 🔧 **TODOs que Afectan Frontend**

```javascript
// src/middleware/auth.js líneas 375-376:
requireAgentOrAdmin: requireRole(['admin', 'superadmin', 'agent']),
// TODO: Migrar a requireWriteAccess
requireViewerOrHigher: requireReadAccess
// TODO: Migrar a requireReadAccess

// ⚠️ IMPACTO: Roles pueden cambiar sin aviso
```

```javascript
// src/controllers/TeamController.js:
// TODO: Implementar envío de email para invitaciones

// ⚠️ IMPACTO: Endpoint POST /api/team/invite
// NO envía emails actualmente - solo logs
```

```javascript
// src/models/Contact.js:
// TODO: Implementar lógica real para detectar duplicados

// ⚠️ IMPACTO: Pueden crearse contactos duplicados
// Frontend debe manejar múltiples contactos con mismo teléfono
```

### 🔧 **Funciones Mock No Implementadas**

```javascript
// src/utils/agentAssignment.js línea 134-135:
async function getAgentWorkload(agentId) {
  // Simulación básica - en producción consultaría la base de datos
  return 0; // ⚠️ SIEMPRE retorna 0
}

// ⚠️ IMPACTO: Asignación automática de agentes no funciona
```

```javascript
// src/services/AudioProcessor.js:
// TODO: Implementar transcripción real con OpenAI Whisper

// ⚠️ IMPACTO: Archivos de audio NO se transcriben
// Frontend debe manejar audio sin transcripción
```

---

## 9. RECOMENDACIONES FINALES PARA DESARROLLO FRONT

### ✅ **CHECKLIST OBLIGATORIO para Desarrolladores**

**🔐 Autenticación:**

- [ ] Implementar interceptor para 401 con auto-refresh
- [ ] Manejar `TOKEN_EXPIRED_DURING_PROCESSING` específicamente
- [ ] Implementar logout forzado en múltiples pestañas
- [ ] Validar JWT localmente antes de requests (opcional optimization)

**📊 Manejo de Datos:**

- [ ] Usar `safeDateToISOString()` para TODAS las fechas del backend
- [ ] Implementar fallbacks para campos opcionales (`contact`, `lastMessage`, etc.)
- [ ] Validar UUIDs v4 antes de enviar requests
- [ ] Normalizar timestamps a un formato único en frontend

**📱 Validaciones Frontend:**

- [ ] Implementar MISMA validación Joi que el backend (4096 chars, etc.)
- [ ] Validar teléfonos con regex `/^\+[1-9]\d{1,14}$/` antes de enviar
- [ ] Limitar uploads a 10 archivos, 100MB cada uno
- [ ] Implementar validación de MIME types

**🔌 WebSocket:**

- [ ] Implementar reconexión exponential backoff
- [ ] Manejar `sync-state` obligatorio después de reconexión
- [ ] Implementar cleanup de listeners en componentes
- [ ] Rate limiting client-side (500ms entre typing events)

**⚠️ Edge Cases:**

- [ ] Manejar conversaciones sin agente asignado
- [ ] UI para mensajes con `status: 'failed'`
- [ ] Mostrar errores específicos de rate limiting
- [ ] Fallback para campos calculados dinámicamente

### ✅ **CHECKLIST para QA**

**🧪 Casos de Prueba Críticos:**

- [ ] Token expira DURANTE un request largo (upload archivo)
- [ ] Conversación asignada simultáneamente por 2 agentes
- [ ] Mensaje enviado sin conexión + reconexión
- [ ] Upload de archivo > 100MB o tipo no permitido
- [ ] Usuario downgrades de 'agent' a 'viewer' durante sesión activa

**🔄 Pruebas de Concurrencia:**

- [ ] Múltiples usuarios enviando mensajes a misma conversación
- [ ] Rate limiting: 100 requests en 1 segundo
- [ ] Socket.IO: 1000 conexiones simultáneas
- [ ] Usuario conectado en web + móvil simultáneamente

**🚨 Pruebas de Seguridad:**

- [ ] Intentar acceder con token de otro usuario
- [ ] Enviar teléfonos malformados con inyección
- [ ] Upload de archivos con extensiones peligrosas
- [ ] Requests con roles insuficientes

### ✅ **VERIFICACIONES FINALES**

**🔍 Antes de Cada Release:**

- [ ] Verificar que TODAS las fechas se muestran consistentemente
- [ ] Probar flujo completo de login → mensaje → logout
- [ ] Verificar que rate limiting no bloquea uso normal
- [ ] Confirmar que todos los campos opcionales tienen fallbacks
- [ ] Probar reconexión WebSocket en diferentes escenarios

**📝 Monitoreo en Producción:**

- [ ] Alertas para errores 500 (pueden ser problemas de backend)
- [ ] Monitoreo de rate limiting (429 errors)
- [ ] Tracking de reconexiones WebSocket frecuentes
- [ ] Logs de errores de validación (pueden indicar problemas de sync)

---

## 🚨 **ADVERTENCIAS CRÍTICAS FINALES**

### **NO ASUMIR NUNCA:**

1. **Que un campo estará presente** - Todos los campos opcionales pueden ser `null`, `undefined` o ausentes
2. **Que las fechas tendrán formato específico** - Implementar parsing robusto
3. **Que los IDs serán del mismo tipo** - Validar formato según contexto
4. **Que los WebSocket se reconectarán automáticamente** - Implementar lógica manual
5. **Que el rate limiting es solo por IP** - Es por usuario + IP + endpoint

### **IMPLEMENTAR SIEMPRE:**

1. **Logging detallado** de errores 401, 403, 429 para debugging
2. **Timeouts apropiados** para requests (15s para uploads, 5s para texto)
3. **Loading states granulares** para operaciones que pueden fallar silenciosamente
4. **Retry logic inteligente** que no reintente errores 400/403
5. **Fallbacks para datos ausentes** especialmente en listas y conversaciones

### **CONSULTAR BACKEND TEAM SI:**

- Encuentras campos no documentados en respuestas
- Recibes errores 500 consistentes en algún endpoint
- Rate limiting bloquea uso normal de la aplicación
- WebSocket se desconecta frecuentemente sin razón aparente
- Hay inconsistencias entre la documentación y el comportamiento real

---

**📞 Para dudas técnicas críticas:** backend-team@utalk.com  
**🔄 Última actualización:** 2025-08-02 | **Versión:** 4.1.0 Enterprise  
**⚠️ Documento generado con auditoría exhaustiva** - No omite edge cases críticos
