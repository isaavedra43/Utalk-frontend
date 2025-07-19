# 📋 ESTRUCTURA CANÓNICA DE DATOS - UTalk Frontend

## **🎯 MISIÓN DEL SISTEMA**

El Frontend de UTalk es el **ESTÁNDAR DE CALIDAD DE DATOS** para todo el ecosistema. Ningún dato mal formado debe llegar a los componentes de UI.

### **🛡️ PRINCIPIOS FUNDAMENTALES**

1. **NO HAY HACKS NI WORKAROUNDS** - Si el dato no cumple el estándar, se rechaza
2. **VALIDACIÓN OBLIGATORIA** - Todo dato del backend pasa por validación antes de renderizar
3. **LOGS DETALLADOS** - Cada error es reportado con contexto completo
4. **ESTRUCTURA ÚNICA** - Todos los módulos usan la misma estructura canónica
5. **BACKEND SE ADAPTA** - Si hay desalineación, el backend debe corregir, no el frontend

---

## **📊 ESTRUCTURA CANÓNICA**

### **🎯 MENSAJE CANÓNICO**

```typescript
interface CanonicalMessage {
  // ✅ CAMPOS OBLIGATORIOS
  id: string                    // ID único del mensaje
  conversationId: string        // ID de la conversación
  content: string              // Contenido del mensaje
  timestamp: Date              // Timestamp SIEMPRE Date, nunca string
  
  // ✅ REMITENTE OBLIGATORIO
  sender: {
    id: string                 // ID único del remitente
    name: string               // Nombre completo
    type: 'contact' | 'agent' | 'bot' | 'system'  // Tipo estricto
    avatar?: string            // URL del avatar (opcional)
  }
  
  // ✅ TIPO Y ESTADO OBLIGATORIOS
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker'
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  direction: 'inbound' | 'outbound'
  
  // ✅ CAMPOS BOOLEANOS CON DEFAULTS
  isRead: boolean              // Estado de lectura
  isDelivered: boolean         // Estado de entrega
  isImportant: boolean         // Marcado como importante
  
  // ✅ ADJUNTOS (OPCIONAL PERO ESTRUCTURADO)
  attachments?: Array<{
    id: string                 // ID único del adjunto
    name: string               // Nombre del archivo
    url: string                // URL del archivo
    type: string               // MIME type
    size: number               // Tamaño en bytes
  }>
  
  // ✅ METADATOS (OPCIONAL)
  metadata?: {
    twilioSid?: string         // ID de Twilio (si aplica)
    userId?: string            // ID del usuario que envió
    edited?: boolean           // Si fue editado
    reactions?: Array<{        // Reacciones al mensaje
      emoji: string
      userId: string
      timestamp: Date
    }>
  }
}
```

### **🎯 CONVERSACIÓN CANÓNICA**

```typescript
interface CanonicalConversation {
  // ✅ CAMPOS OBLIGATORIOS
  id: string                   // ID único de conversación
  title: string                // Título de la conversación
  status: 'open' | 'pending' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  // ✅ CONTACTO OBLIGATORIO
  contact: CanonicalContact    // Contacto principal
  
  // ✅ CANAL OBLIGATORIO
  channel: 'whatsapp' | 'telegram' | 'email' | 'webchat' | 'api'
  
  // ✅ TIMESTAMPS OBLIGATORIOS
  createdAt: Date
  updatedAt: Date
  lastMessageAt: Date
  
  // ✅ CONTADORES OBLIGATORIOS
  messageCount: number         // Total de mensajes
  unreadCount: number          // Mensajes sin leer
  
  // ✅ ASIGNACIÓN (OPCIONAL)
  assignedTo?: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  
  // ✅ ÚLTIMO MENSAJE (OPCIONAL)
  lastMessage?: {
    id: string
    content: string
    timestamp: Date
    senderName: string
    type: CanonicalMessage['type']
  }
  
  // ✅ ETIQUETAS Y METADATOS
  tags: string[]               // Array de etiquetas
  isMuted: boolean            // Si está silenciado
  isArchived: boolean         // Si está archivado
  
  // ✅ METADATOS
  metadata?: {
    source?: string            // Origen de la conversación
    customFields?: Record<string, any>
    satisfaction?: number      // Rating de satisfacción
  }
}
```

### **🎯 CONTACTO CANÓNICO**

```typescript
interface CanonicalContact {
  // ✅ CAMPOS OBLIGATORIOS
  id: string                   // ID único del contacto
  name: string                 // Nombre completo
  phone: string                // Teléfono (formato internacional)
  
  // ✅ INFORMACIÓN PERSONAL
  email?: string               // Email (opcional pero común)
  avatar?: string              // URL del avatar
  
  // ✅ INFORMACIÓN COMERCIAL
  company?: string             // Empresa
  position?: string            // Cargo
  
  // ✅ ESTADO Y CLASIFICACIÓN
  status: 'active' | 'inactive' | 'blocked' | 'prospect' | 'customer' | 'lead'
  source: 'manual' | 'import' | 'whatsapp' | 'webchat' | 'api'
  
  // ✅ TIMESTAMPS
  createdAt: Date
  updatedAt: Date
  lastContactAt?: Date
  
  // ✅ ESTADÍSTICAS
  totalMessages: number        // Total de mensajes
  totalConversations: number   // Total de conversaciones
  averageResponseTime?: number // Tiempo promedio de respuesta (minutos)
  
  // ✅ DATOS COMERCIALES
  value: number                // Valor comercial (0 por default)
  currency: string             // Moneda (USD, MXN, etc)
  
  // ✅ ETIQUETAS Y CLASIFICACIÓN
  tags: string[]               // Etiquetas del contacto
  
  // ✅ METADATOS
  metadata?: {
    customFields?: Record<string, any>
    preferences?: {
      language?: string
      timezone?: string
      communicationChannel?: string
    }
    social?: {
      linkedin?: string
      twitter?: string
      facebook?: string
    }
  }
}
```

---

## **🛡️ SISTEMA DE VALIDACIÓN**

### **🚨 VALIDADORES IMPLEMENTADOS**

#### **MessageValidator**
```typescript
// Valida mensajes individuales
const validation = MessageValidator.validate(backendMessage)
if (validation.isValid) {
  const canonicalMessage = validation.data
  // ✅ Usar mensaje validado
} else {
  // ❌ Log error y rechazar
  console.error('Mensaje inválido:', validation.errors)
}

// Validar respuesta completa del backend
const validMessages = MessageValidator.validateBackendResponse(response)
```

#### **ConversationValidator**
```typescript
// Valida conversaciones
const validation = ConversationValidator.validate(backendConversation)
if (validation.isValid) {
  const canonicalConversation = validation.data
  // ✅ Usar conversación validada
}

// Validar respuesta del backend
const validConversations = ConversationValidator.validateBackendResponse(response)
```

#### **ContactValidator**
```typescript
// Valida contactos
const validation = ContactValidator.validate(backendContact)
if (validation.isValid) {
  const canonicalContact = validation.data
  // ✅ Usar contacto validado
}

// Validar respuesta del backend
const validContacts = ContactValidator.validateBackendResponse(response)
```

### **📋 EJEMPLOS DE USO**

#### **En MessageService**
```typescript
async getMessages(conversationId: string): Promise<MessagesResponse> {
  try {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`)
    
    // ✅ VALIDACIÓN CENTRALIZADA
    const validatedMessages = MessageValidator.validateBackendResponse(response)
    
    return {
      success: true,
      messages: validatedMessages,
      total: response.total || validatedMessages.length
    }
  } catch (error) {
    // ✅ NUNCA PASAR DATOS MAL FORMADOS
    return {
      success: false,
      messages: [],
      total: 0,
      error: error.message
    }
  }
}
```

#### **En Componentes**
```typescript
function MessageList({ messages }: { messages: CanonicalMessage[] }) {
  // ✅ AQUÍ SABEMOS QUE TODOS LOS MENSAJES SON VÁLIDOS
  return (
    <div>
      {messages.map(message => (
        <MessageBubble 
          key={message.id}              // ✅ Garantizado que existe
          content={message.content}     // ✅ Garantizado que existe
          timestamp={message.timestamp} // ✅ Garantizado que es Date
          sender={message.sender}       // ✅ Garantizado que es válido
        />
      ))}
    </div>
  )
}
```

---

## **📝 LOGS Y DEBUGGING**

### **🚨 TIPOS DE LOGS**

#### **Error Logs**
```
🚨 VALIDATION ERROR - MESSAGE_VALIDATION
Campo requerido faltante: id
Data received: { content: "hola", timestamp: "2024-01-01" }
Stack trace: ...
```

#### **Warning Logs**
```
⚠️ VALIDATION WARNING - MESSAGE_VALIDATION
isRead no definido, infiriendo del status
Data received: { status: "read" }
```

#### **Info Logs**
```
ℹ️ VALIDATION INFO - DATE_TRANSFORM
Transformado timestamp de string a Date
Data: { original: "2024-01-01T10:00:00Z", transformed: Date }
```

### **📊 REPORTES DE VALIDACIÓN**

```
✅ MessageService.getMessages result:
- Original count: 25
- Validated count: 23
- Invalid count: 2
- Validation passed: true
```

---

## **🔧 INTEGRACIÓN CON SERVICIOS**

### **📡 API Client Actualizado**

```typescript
// Antes (problemático)
const response = await apiClient.get('/messages')
const messages = response.data.map(msg => mapMessage(msg)) // ❌ Sin validación

// Después (con validación)
const response = await apiClient.get('/messages')
const validatedMessages = MessageValidator.validateBackendResponse(response) // ✅ Validado
```

### **🎣 React Query Integrado**

```typescript
const { data: messages } = useQuery({
  queryKey: ['messages', conversationId],
  queryFn: async () => {
    const response = await messageService.getMessages(conversationId)
    // ✅ Aquí ya vienen validados por MessageValidator
    return response.messages
  }
})
```

---

## **🚀 MIGRACIÓN GRADUAL**

### **Fase 1: ✅ COMPLETADA**
- [x] Estructura canónica definida
- [x] Sistema de validación implementado
- [x] MessageService refactorizado
- [x] Tipos actualizados

### **Fase 2: 🔄 EN PROGRESO**
- [ ] ConversationService refactorizado
- [ ] ContactService refactorizado
- [ ] CampaignService refactorizado

### **Fase 3: 📋 PENDIENTE**
- [ ] Todos los hooks actualizados
- [ ] Todos los componentes validados
- [ ] Tests de integración completos

---

## **📋 CHECKLIST PARA NUEVOS MÓDULOS**

### **Al crear un nuevo servicio:**

1. **✅ Importar validadores**
   ```typescript
   import { MessageValidator, ConversationValidator } from '@/lib/validation'
   ```

2. **✅ Validar respuestas del backend**
   ```typescript
   const validatedData = Validator.validateBackendResponse(response)
   ```

3. **✅ Manejar errores gracefully**
   ```typescript
   catch (error) {
     return { success: false, data: [], error: error.message }
   }
   ```

4. **✅ Usar tipos canónicos**
   ```typescript
   import type { CanonicalMessage } from '@/types/canonical'
   ```

5. **✅ Logs detallados**
   ```typescript
   console.log('🛡️ Validation complete:', { validatedCount })
   ```

### **Al crear un nuevo componente:**

1. **✅ Usar tipos canónicos como props**
   ```typescript
   interface Props {
     messages: CanonicalMessage[]
   }
   ```

2. **✅ Asumir datos ya validados**
   ```typescript
   // ✅ No validar aquí, ya está validado en el servicio
   message.id // Garantizado que existe
   ```

3. **✅ Manejo de estados vacíos**
   ```typescript
   if (messages.length === 0) {
     return <EmptyState />
   }
   ```

---

## **⚠️ REGLAS ESTRICTAS**

### **❌ PROHIBIDO**

1. **Mapear datos sin validar**
   ```typescript
   // ❌ NUNCA HACER ESTO
   const messages = response.data.map(msg => ({
     id: msg.id,
     content: msg.content || '' // ❌ Hack
   }))
   ```

2. **Usar workarounds temporales**
   ```typescript
   // ❌ NUNCA HACER ESTO
   const content = message.content || message.text || 'Sin contenido'
   ```

3. **Pasar datos sin validar a componentes**
   ```typescript
   // ❌ NUNCA HACER ESTO
   <MessageList messages={response.data} />
   ```

### **✅ OBLIGATORIO**

1. **Validar todo dato del backend**
   ```typescript
   // ✅ SIEMPRE HACER ESTO
   const validatedMessages = MessageValidator.validateBackendResponse(response)
   ```

2. **Reportar errores de estructura**
   ```typescript
   // ✅ SIEMPRE HACER ESTO
   if (!validation.isValid) {
     console.error('Estructura inválida:', validation.errors)
     return fallback
   }
   ```

3. **Usar estructura canónica**
   ```typescript
   // ✅ SIEMPRE HACER ESTO
   interface Props {
     message: CanonicalMessage
   }
   ```

---

## **📞 COMUNICACIÓN CON BACKEND**

### **🚨 AL ENCONTRAR ERRORES DE ESTRUCTURA**

**Mensaje para Backend Team:**

```
🚨 ESTRUCTURA INVÁLIDA DETECTADA

Endpoint: /api/conversations/{id}/messages
Error: Campo 'timestamp' es string, debe ser Date ISO

Estructura recibida:
{
  "id": "msg_123",
  "timestamp": "2024-01-01 10:00:00"  // ❌ Formato incorrecto
}

Estructura esperada:
{
  "id": "msg_123",
  "timestamp": "2024-01-01T10:00:00.000Z"  // ✅ ISO Date string
}

Por favor corregir antes del próximo deploy.
```

### **📋 TEMPLATE DE REPORTE**

```markdown
## Reporte de Estructura Inválida

**Endpoint:** `/api/endpoint`
**Fecha:** 2024-01-01
**Severidad:** Alta/Media/Baja

### Error Detectado
- Campo: `fieldName`
- Problema: Descripción del problema
- Valor recibido: `valor`
- Valor esperado: `valor_correcto`

### Impacto
- Módulos afectados: Chat, CRM, etc.
- Funcionalidad impactada: Descripción

### Solución Requerida
- Cambio necesario en backend
- Timeline sugerido: Inmediato/Próximo deploy
```

---

## **🎉 BENEFICIOS DEL SISTEMA**

### **🛡️ Para el Frontend**
- **Calidad garantizada** - Nunca más datos mal formados
- **Debugging fácil** - Logs detallados en cada paso
- **Desarrollo rápido** - No más mappings manuales
- **Mantenimiento simple** - Estructura centralizada

### **🔧 Para el Backend**
- **Estándar claro** - Documentación exacta de qué enviar
- **Validación automática** - El frontend valida y reporta errores
- **Retroalimentación inmediata** - Logs muestran problemas al instante

### **👥 Para el Equipo**
- **Comunicación clara** - Estructura documentada y compartida
- **Menos bugs** - Validación previene errores
- **Escalabilidad** - Nuevos módulos siguen el mismo patrón

---

**💡 RECUERDA: El Frontend es el guardián de la calidad de datos. No hay excepciones, no hay workarounds. Si no cumple el estándar, no pasa.** 