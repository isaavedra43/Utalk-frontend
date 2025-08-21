# 🔧 FIXES NECESARIOS EN EL BACKEND

## 🚨 PROBLEMA ACTUAL
1. El backend está rechazando la estructura completa que envía el frontend con error de validación:
```
VALIDATION_ERROR: "Datos de entrada inválidos"
```

2. **DUPLICACIÓN CRÍTICA**: Se están creando conversaciones en DOS lugares:
   - ❌ Colección principal `conversations` (NO QUEREMOS)
   - ✅ Subcolección `contacts/{contactId}/conversations` (SÍ QUEREMOS)

## 🎯 SOLUCIÓN REQUERIDA
**ELIMINAR** la colección principal `conversations` y usar **SOLO** la estructura anidada:
```
contacts/
  └── {contactId}/
      └── conversations/
          └── {conversationId}/
              └── messages/
```

## 📋 ESTRUCTURA QUE ENVÍA EL FRONTEND
```json
{
  "id": "conv_+5214773790184_+5214793176502",
  "customerPhone": "+5214773790184",
  "status": "open",
  "priority": "medium",
  "tags": [],
  "participants": [
    "+5214773790184",
    "admin@company.com",
    "agent:admin@company.com",
    "whatsapp:+5214773790184"
  ],
  "createdBy": "admin@company.com",
  "assignedTo": "admin@company.com",
  "assignedToName": null,
  "createdAt": "2025-08-21T19:17:45.263Z",
  "updatedAt": "2025-08-21T19:17:45.263Z",
  "lastMessageAt": "2025-08-21T19:17:45.263Z",
  "unreadCount": 0,
  "messageCount": 0,
  "tenantId": "default_tenant",
  "workspaceId": "default_workspace",
  "messages": [],
  "customerName": "",
  "lastMessage": null,
  "metadata": {
    "channel": "whatsapp",
    "createdVia": "manual"
  },
  "structure": "nested",
  "contactId": null
}
```

## 🔧 CAMBIOS NECESARIOS

### 0. ELIMINAR ENDPOINT DE CONVERSACIONES PRINCIPAL
**Archivo:** `backend/src/routes/conversations.js`
- **DESHABILITAR** o **ELIMINAR** el endpoint `POST /api/conversations`
- **CREAR** nuevo endpoint `POST /api/contacts/conversations`

### 1. MODIFICAR SCHEMA DE VALIDACIÓN
**Archivo:** `backend/src/validations/conversationValidation.js`

**REEMPLAZAR** el schema actual con:
```javascript
const createConversationSchema = Joi.object({
  // Campos requeridos
  customerPhone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).required(),
  
  // Campos opcionales que el frontend envía
  id: Joi.string().optional(),
  status: Joi.string().valid('open', 'closed', 'pending', 'resolved').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  participants: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().email().optional(),
  assignedTo: Joi.string().email().optional(),
  assignedToName: Joi.string().allow(null).optional(),
  createdAt: Joi.string().isoDate().optional(),
  updatedAt: Joi.string().isoDate().optional(),
  lastMessageAt: Joi.string().isoDate().optional(),
  unreadCount: Joi.number().integer().min(0).optional(),
  messageCount: Joi.number().integer().min(0).optional(),
  tenantId: Joi.string().optional(),
  workspaceId: Joi.string().optional(),
  messages: Joi.array().optional(),
  customerName: Joi.string().optional(),
  lastMessage: Joi.object().optional(),
  metadata: Joi.object().optional(),
  
  // Campo para mensaje inicial
  initialMessage: Joi.string().optional(),
  
  // Campos para estructura anidada
  structure: Joi.string().valid('nested').optional(),
  contactId: Joi.string().allow(null).optional()
});
```

### 2. MODIFICAR CONTROLADOR
**Archivo:** `backend/src/controllers/conversationController.js`

**EN EL MÉTODO createConversation, REEMPLAZAR** la validación actual:

**ANTES (causa el error):**
```javascript
const { error, value } = createConversationSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    success: false,
    error: 'VALIDATION_ERROR',
    message: 'Datos de entrada inválidos',
    details: error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }))
  });
}
```

**DESPUÉS (acepta la estructura completa):**
```javascript
const { error, value } = createConversationSchema.validate(req.body, { 
  allowUnknown: true,  // Permite campos adicionales
  stripUnknown: true   // Elimina campos no definidos en el schema
});

if (error) {
  console.log('Validation error details:', error.details);
  return res.status(400).json({
    success: false,
    error: 'VALIDATION_ERROR',
    message: 'Datos de entrada inválidos',
    details: error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }))
  });
}

// Usar los datos validados
const conversationData = value;
```

### 3. CREAR NUEVO ENDPOINT PARA ESTRUCTURA ANIDADA
**Archivo:** `backend/src/routes/contacts.js`

**AGREGAR** nuevo endpoint:
```javascript
// POST /api/contacts/conversations
router.post('/conversations', async (req, res) => {
  try {
    const { error, value } = createConversationSchema.validate(req.body, { 
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Crear conversación en estructura anidada
    const conversation = await createNestedConversation(value);
    
    res.status(201).json({
      success: true,
      message: 'Conversación creada exitosamente',
      data: conversation
    });
  } catch (error) {
    console.error('Error creando conversación:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Error interno del servidor'
    });
  }
});
```

### 4. MODIFICAR MODELO PARA ESTRUCTURA ANIDADA
**Archivo:** `backend/src/models/Conversation.js`

**CREAR** nuevo método para estructura anidada:

```javascript
const createNestedConversation = async (data) => {
  // 1. Buscar o crear el contacto
  let contactId = data.contactId;
  if (!contactId) {
    // Buscar contacto existente por teléfono
    const contactsRef = db.collection('contacts');
    const contactQuery = await contactsRef.where('phone', '==', data.customerPhone).limit(1).get();
    
    if (!contactQuery.empty) {
      contactId = contactQuery.docs[0].id;
    } else {
      // Crear nuevo contacto
      const newContact = {
        phone: data.customerPhone,
        name: data.customerName || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const contactDoc = await contactsRef.add(newContact);
      contactId = contactDoc.id;
    }
  }

  // 2. Crear la conversación en la estructura anidada
  // CRÍTICO: Usar SIEMPRE el ID que envía el frontend
  const conversationId = data.id; // NO generar nuevo ID, usar el del frontend
  
  const conversation = {
    id: conversationId, // Usar el ID del frontend
    customerPhone: data.customerPhone,
    status: data.status || 'open',
    priority: data.priority || 'medium',
    tags: data.tags || [],
    participants: data.participants || [
      data.customerPhone,
      data.createdBy || data.assignedTo,
      `agent:${data.createdBy || data.assignedTo}`,
      `whatsapp:${data.customerPhone}`
    ],
    createdBy: data.createdBy || data.assignedTo,
    assignedTo: data.assignedTo,
    assignedToName: data.assignedToName,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    lastMessageAt: data.lastMessageAt || new Date().toISOString(),
    unreadCount: data.unreadCount || 0,
    messageCount: data.messageCount || 0,
    tenantId: data.tenantId || 'default_tenant',
    workspaceId: data.workspaceId || 'default_workspace',
    customerName: data.customerName || '',
    lastMessage: data.lastMessage || null,
    metadata: data.metadata || {
      channel: 'whatsapp',
      createdVia: 'manual'
    }
  };

  // 3. Guardar en estructura anidada: contacts/{contactId}/conversations/{conversationId}
  const conversationRef = db
    .collection('contacts')
    .doc(contactId)
    .collection('conversations')
    .doc(conversationId); // Usar el ID del frontend
    
  await conversationRef.set(conversation);
  
  // 4. Retornar conversación con contactId
  return {
    ...conversation,
    contactId
  };
};
```

## ✅ RESULTADO ESPERADO
Después de estos cambios, el backend debería:
1. ✅ Aceptar la estructura completa que envía el frontend
2. ✅ No generar errores de validación
3. ✅ Crear la conversación **SOLO** en estructura anidada: `contacts/{contactId}/conversations/{conversationId}`
4. ✅ **NO crear** conversaciones en la colección principal `conversations`
5. ✅ Retornar la conversación creada exitosamente con `contactId`

## 🧪 PRUEBA
Una vez aplicados los cambios:
1. Crear una nueva conversación desde el frontend
2. Verificar que **SOLO** se cree en `contacts/{contactId}/conversations/{conversationId}`
3. Verificar que **NO se cree** en la colección principal `conversations`
4. Confirmar que no hay duplicación de datos

## 🗑️ LIMPIEZA OPCIONAL
Si quieres limpiar las conversaciones duplicadas existentes:
```javascript
// Script para eliminar conversaciones de la colección principal
const deleteMainConversations = async () => {
  const conversationsRef = db.collection('conversations');
  const snapshot = await conversationsRef.get();
  
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`Eliminadas ${snapshot.docs.length} conversaciones duplicadas`);
};
```
