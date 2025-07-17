# 📊 Guía de Índices de Firestore para UTalk

**Objetivo:** Asegurar que todas las queries de Firestore sean eficientes con los índices apropiados

## 🔍 **Queries Identificadas en el Código**

### 1. **Mensajes por Conversación**

#### **Query Actual:**
```javascript
// useFirestoreMessages.ts - línea ~96
query(
  collection(db, 'conversations', conversationId, 'messages'),
  orderBy('timestamp', 'desc'),
  limit(50)
)

// Fallback si timestamp no existe
query(
  collection(db, 'conversations', conversationId, 'messages'),
  orderBy('createdAt', 'desc'),
  limit(50)
)
```

#### **Índices Requeridos:**
```
Collection: conversations/{conversationId}/messages
Fields: timestamp (Descending)
Status: ✅ CREAR

Collection: conversations/{conversationId}/messages  
Fields: createdAt (Descending)
Status: ✅ CREAR (Fallback)
```

### 2. **Mensajes en Tiempo Real**

#### **Query Actual:**
```javascript
// useMessages.ts - línea ~149
query(
  collection(db, 'conversations', conversationId, 'messages'),
  orderBy('timestamp', 'desc'),
  limit(1)
)
```

#### **Índices Requeridos:**
```
Collection: conversations/{conversationId}/messages
Fields: timestamp (Descending)
Status: ✅ MISMO QUE ARRIBA
```

### 3. **Conversaciones por Estado**

#### **Query Potencial:**
```javascript
// Para futuras funcionalidades
query(
  collection(db, 'conversations'),
  where('status', '==', 'active'),
  orderBy('lastMessageAt', 'desc')
)
```

#### **Índices Requeridos:**
```
Collection: conversations
Fields: status (Ascending), lastMessageAt (Descending)
Status: ⚠️ PREPARAR PARA FUTURO
```

### 4. **Conversaciones por Agente**

#### **Query Potencial:**
```javascript
// Para asignación de conversaciones
query(
  collection(db, 'conversations'),
  where('assignedTo', '==', agentId),
  orderBy('lastMessageAt', 'desc')
)
```

#### **Índices Requeridos:**
```
Collection: conversations
Fields: assignedTo (Ascending), lastMessageAt (Descending)
Status: ⚠️ PREPARAR PARA FUTURO
```

### 5. **Mensajes por Estado de Lectura**

#### **Query Potencial:**
```javascript
// Para conteo de mensajes no leídos
query(
  collection(db, 'conversations', conversationId, 'messages'),
  where('status', '==', 'unread'),
  where('sender', '==', 'client'),
  orderBy('timestamp', 'desc')
)
```

#### **Índices Requeridos:**
```
Collection: conversations/{conversationId}/messages
Fields: status (Ascending), sender (Ascending), timestamp (Descending)
Status: ⚠️ PREPARAR PARA FUTURO
```

## 🛠 **Comandos para Crear Índices**

### **1. Vía Firebase Console**
```
1. Abrir Firebase Console
2. Ir a Firestore Database
3. Pestaña "Indexes"
4. Crear índices compuestos según las especificaciones arriba
```

### **2. Vía Firebase CLI**
```bash
# Instalar Firebase CLI si no está instalado
npm install -g firebase-tools

# Login
firebase login

# Inicializar en el proyecto
firebase init firestore

# Crear archivo firestore.indexes.json (ver abajo)
firebase deploy --only firestore:indexes
```

### **3. Archivo firestore.indexes.json**
```json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages", 
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "sender", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "conversations",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "assignedTo", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## 📊 **Verificación de Performance**

### **Métricas a Monitorear:**

#### **1. Tiempo de Query**
```javascript
// Agregar logging de performance
const startTime = Date.now();
const snapshot = await getDocs(query);
const queryTime = Date.now() - startTime;

logger.api('📊 Query performance', {
  collection: 'messages',
  queryTime: `${queryTime}ms`,
  resultCount: snapshot.size,
  hasIndex: queryTime < 100 // Queries con índice <100ms
});
```

#### **2. Alertas de Performance**
```typescript
// En useFirestoreMessages.ts
const SLOW_QUERY_THRESHOLD = 200; // ms

if (queryTime > SLOW_QUERY_THRESHOLD) {
  logger.api('⚠️ Query lenta detectada', {
    queryTime,
    collection: 'messages', 
    conversationId,
    suggestion: 'Verificar índices de Firestore'
  }, true);
}
```

### **3. Dashboard de Firestore**
```
Monitorear en Firebase Console:
- Firestore > Usage tab
- Request count por segundo
- Tiempo promedio de query
- Errores de índices faltantes
```

## 🚨 **Detección de Índices Faltantes**

### **Errores Comunes:**
```javascript
// Error típico cuando falta índice
FAILED_PRECONDITION: The query requires an index.
You can create it here: https://console.firebase.google.com/...
```

### **Handler de Errores:**
```typescript
// En useFirestoreMessages.ts
const handleFirestoreError = (error: any) => {
  if (error.code === 'failed-precondition') {
    logger.api('🚨 Índice faltante detectado', {
      error: error.message,
      conversationId,
      action: 'Crear índice en Firebase Console'
    }, true);
    
    toast({
      variant: "destructive",
      title: "Índice de base de datos faltante",
      description: "Contacta al administrador para optimizar la base de datos.",
    });
  }
};
```

## ⚡ **Optimizaciones Adicionales**

### **1. Paginación Eficiente**
```javascript
// Usar cursores en lugar de offset
const q = query(
  messagesRef,
  orderBy('timestamp', 'desc'),
  startAfter(lastDoc), // Cursor-based pagination
  limit(20)
);
```

### **2. Batch Reads**
```javascript
// Leer múltiples documentos en una sola operación
const conversationRefs = conversationIds.map(id => 
  doc(db, 'conversations', id)
);
const snapshots = await getDocs(conversationRefs);
```

### **3. Cache Local**
```javascript
// Habilitar cache offline
enableNetwork(db);
enableIndexedDbPersistence(db);
```

## 📋 **Checklist de Implementación**

### **Índices Críticos (Implementar YA):**
- ✅ `messages.timestamp DESC`
- ✅ `messages.createdAt DESC` (fallback)

### **Índices Preparatorios (Para futuras features):**
- ⚠️ `conversations.status ASC, lastMessageAt DESC`
- ⚠️ `conversations.assignedTo ASC, lastMessageAt DESC`
- ⚠️ `messages.status ASC, sender ASC, timestamp DESC`

### **Monitoreo:**
- ✅ Logging de tiempo de queries
- ✅ Alertas para queries lentas (>200ms)
- ✅ Handler de errores de índices faltantes

### **Optimizaciones:**
- ✅ Paginación con cursores (ya implementado)
- ⚠️ Cache offline (opcional)
- ⚠️ Batch reads para múltiples documentos

## 🎯 **Siguiente Pasos**

### **1. Implementación Inmediata:**
```bash
# 1. Crear firestore.indexes.json
# 2. Deploy índices
firebase deploy --only firestore:indexes

# 3. Verificar en Firebase Console
# 4. Probar queries en development
```

### **2. Monitoreo Continuo:**
```javascript
// Agregar métricas a hooks existentes
// Configurar alertas para queries lentas
// Revisar usage dashboard semanalmente
```

### **3. Optimización Futura:**
```
- Implementar cache estratégico
- Considerar Firestore emulator para testing
- Evaluar costos vs performance
```

---

**Estado:** 📋 **GUÍA CREADA** - Lista para implementación

**Próximo paso:** Implementar índices críticos y agregar monitoreo 