# 📋 Documentación Backend - Módulo de Proveedores

## 📌 Resumen Ejecutivo

Este documento describe todos los endpoints necesarios para el **módulo de gestión de proveedores** del frontend. El módulo está **casi completamente funcional** en el frontend, pero requiere que el backend implemente varios endpoints nuevos para funcionalidades específicas como materiales, órdenes de compra, pagos, documentos, etc.

---

## ✅ Endpoints YA IMPLEMENTADOS Y FUNCIONANDO

### Base Path: `/api/inventory/providers`

Estos endpoints **YA EXISTEN** y están funcionando correctamente. El módulo de proveedores los reutiliza directamente:

#### 1. **GET** `/api/inventory/providers`
- **Descripción**: Obtener todos los proveedores
- **Query params opcionales**: `limit`, `offset`, `search`, `isActive`
- **Response**: 
```json
{
  "success": true,
  "data": [
    {
      "id": "provider-id",
      "name": "Nombre Proveedor",
      "contact": "Contacto",
      "phone": "4773790184",
      "email": "email@example.com",
      "address": "Dirección completa",
      "website": "https://example.com",
      "taxId": "RFC123456789",
      "paymentTerms": "30 días",
      "creditLimit": 100000,
      "bankAccount": "1234567890",
      "currency": "MXN",
      "notes": "Notas internas",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. **GET** `/api/inventory/providers/:providerId`
- **Descripción**: Obtener un proveedor específico por ID
- **Response**: Mismo formato que arriba, pero un solo objeto

#### 3. **POST** `/api/inventory/providers`
- **Descripción**: Crear un nuevo proveedor
- **Body**:
```json
{
  "name": "Nombre Proveedor",
  "contact": "Contacto",
  "phone": "4773790184",
  "email": "email@example.com",
  "address": "Dirección",
  "website": "https://example.com",
  "taxId": "RFC123456789",
  "paymentTerms": "30 días",
  "creditLimit": 100000,
  "bankAccount": "1234567890",
  "currency": "MXN",
  "notes": "Notas",
  "isActive": true
}
```
- **Response**: El proveedor creado con su `id` generado

#### 4. **PUT** `/api/inventory/providers/:providerId`
- **Descripción**: Actualizar un proveedor existente
- **Body**: Campos parciales a actualizar
- **Response**: El proveedor actualizado

#### 5. **DELETE** `/api/inventory/providers/:providerId`
- **Descripción**: Eliminar un proveedor
- **Response**: `{ "success": true }`

---

## 🚨 Endpoints FALTANTES - Requieren Implementación

### Base Path Sugerido: `/api/providers`

**NOTA IMPORTANTE**: El frontend actualmente usa **mock data** para todas estas funcionalidades. Necesitas implementar estos endpoints para que todo funcione en producción.

---

## 📦 1. MATERIALES DEL PROVEEDOR

Los materiales son productos que un proveedor puede suministrar. Cada material tiene información de precio, stock, categoría, e imagen (guardada como base64).

### Estructura de Datos:

```typescript
interface ProviderMaterial {
  id: string;
  providerId: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice: number;
  unit: string; // "m²", "kg", "pieza", etc.
  sku?: string;
  imageUrl?: string; // BASE64 DATA URL (data:image/jpeg;base64,...)
  stock?: number;
  minStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Endpoints Necesarios:

#### **GET** `/api/providers/:providerId/materials`
- **Descripción**: Obtener todos los materiales de un proveedor
- **Query params opcionales**: `category`, `isActive`, `search`
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "mat-123",
      "providerId": "provider-id",
      "name": "Granito Negro San Gabriel",
      "description": "Granito de alta calidad",
      "category": "Granito",
      "unitPrice": 500.00,
      "unit": "m²",
      "sku": "GRN-001",
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQ...",
      "stock": 100,
      "minStock": 10,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### **POST** `/api/providers/:providerId/materials`
- **Descripción**: Crear un nuevo material para el proveedor
- **Body**:
```json
{
  "name": "Granito Negro San Gabriel",
  "description": "Descripción del material",
  "category": "Granito",
  "unitPrice": 500.00,
  "unit": "m²",
  "sku": "GRN-001",
  "imageUrl": "data:image/jpeg;base64,...",
  "stock": 100,
  "minStock": 10,
  "isActive": true
}
```
- **Lógica**:
  - Generar `id` único
  - Asignar `providerId` automáticamente
  - Guardar `imageUrl` (base64) tal cual (o convertir a URL de storage si prefieres)
  - Timestamps automáticos
  - **Crear actividad automática**: Tipo `material_added`

#### **PUT** `/api/providers/:providerId/materials/:materialId`
- **Descripción**: Actualizar un material existente
- **Body**: Campos parciales a actualizar
- **Lógica**: 
  - Actualizar `updatedAt`
  - **Crear actividad automática**: Tipo `material_updated`

#### **DELETE** `/api/providers/:providerId/materials/:materialId`
- **Descripción**: Eliminar un material
- **Lógica**:
  - **Crear actividad automática**: Tipo `material_deleted` (antes de eliminar)

---

## 🛒 2. ÓRDENES DE COMPRA (PURCHASE ORDERS)

Las órdenes de compra representan pedidos realizados al proveedor. Tienen múltiples estados y pueden incluir múltiples materiales.

### Estructura de Datos:

```typescript
interface PurchaseOrder {
  id: string;
  orderNumber: string; // Formato: "OC-123456"
  providerId: string;
  providerName: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'in_transit' | 'delivered' | 'cancelled';
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  sentAt?: string;
  expectedDeliveryDate?: string;
  acceptedAt?: string;
  deliveredAt?: string;
  createdBy: string;
  createdByName: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  attachments?: string[];
}

interface PurchaseOrderItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  subtotal: number;
  notes?: string;
}
```

### Endpoints Necesarios:

#### **GET** `/api/providers/:providerId/orders`
- **Descripción**: Obtener todas las órdenes de compra de un proveedor
- **Query params opcionales**: `status`, `startDate`, `endDate`, `search`
- **Response**: Array de `PurchaseOrder`

#### **GET** `/api/providers/:providerId/orders/:orderId`
- **Descripción**: Obtener una orden específica
- **Response**: Un solo `PurchaseOrder`

#### **POST** `/api/providers/:providerId/orders`
- **Descripción**: Crear una nueva orden de compra
- **Body**:
```json
{
  "items": [
    {
      "materialId": "mat-123",
      "materialName": "Granito Negro",
      "quantity": 10,
      "unitPrice": 500.00,
      "unit": "m²",
      "notes": "Material especial"
    }
  ],
  "subtotal": 5000.00,
  "tax": 800.00,
  "total": 5800.00,
  "notes": "Notas para el proveedor",
  "internalNotes": "Notas internas",
  "expectedDeliveryDate": "2025-02-01",
  "deliveryAddress": "Dirección de entrega",
  "deliveryNotes": "Instrucciones de entrega"
}
```
- **Lógica**:
  - Generar `id` único
  - Generar `orderNumber` en formato `OC-XXXXXX` (6 dígitos, secuencial)
  - Obtener `providerName` del proveedor automáticamente
  - Calcular `subtotal`, `tax`, `total` si no se envían (suma de items)
  - Asignar `status: 'draft'` por defecto
  - Obtener `createdBy` y `createdByName` del token de autenticación
  - Timestamps automáticos
  - **Crear actividad automática**: Tipo `order_created`

#### **PUT** `/api/providers/:providerId/orders/:orderId`
- **Descripción**: Actualizar una orden de compra
- **Body**: Campos parciales a actualizar
- **Lógica Especial**:
  - Si `status` cambia a `'sent'`: Actualizar `sentAt`
  - Si `status` cambia a `'accepted'`: 
    - Actualizar `acceptedAt`
    - Validar que tenga `expectedDeliveryDate`
    - **Crear actividad**: Tipo `order_accepted`
  - Si `status` cambia a `'rejected'`: 
    - **Crear actividad**: Tipo `order_rejected`
  - Si `status` cambia a `'delivered'`: 
    - Actualizar `deliveredAt`
    - **Crear actividad**: Tipo `order_delivered`
  - Si `status` cambia (cualquier cambio): 
    - **Crear actividad**: Tipo `order_updated`

#### **DELETE** `/api/providers/:providerId/orders/:orderId`
- **Descripción**: Eliminar una orden (solo si está en estado `draft` o `cancelled`)
- **Validación**: No permitir eliminar órdenes ya enviadas al proveedor

---

## 💰 3. PAGOS (PAYMENTS)

Los pagos representan transacciones financieras realizadas al proveedor. Pueden estar relacionados con una orden específica o ser pagos generales. **INCLUYEN ADJUNTOS** (imágenes y documentos en base64).

### Estructura de Datos:

```typescript
interface Payment {
  id: string;
  paymentNumber: string; // Formato: "PAG-123456"
  providerId: string;
  providerName: string;
  purchaseOrderId?: string; // Opcional: orden relacionada
  orderNumber?: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'check' | 'card' | 'other';
  reference?: string; // Número de referencia, cheque, etc.
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  paymentDate: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  receiptUrl?: string; // URL del recibo (legacy, opcional)
  attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'document';
    data: string; // BASE64 DATA URL
    mimeType: string;
    size: number;
  }>;
}
```

### Endpoints Necesarios:

#### **GET** `/api/providers/:providerId/payments`
- **Descripción**: Obtener todos los pagos de un proveedor
- **Query params opcionales**: `status`, `startDate`, `endDate`, `paymentMethod`, `orderId`
- **Response**: Array de `Payment`

#### **GET** `/api/providers/:providerId/payments/:paymentId`
- **Descripción**: Obtener un pago específico
- **Response**: Un solo `Payment` con todos sus attachments

#### **POST** `/api/providers/:providerId/payments`
- **Descripción**: Registrar un nuevo pago
- **Body**:
```json
{
  "purchaseOrderId": "order-123",
  "amount": 5800.00,
  "paymentMethod": "transfer",
  "reference": "TRANS-123456",
  "paymentDate": "2025-01-15",
  "notes": "Pago completo de orden OC-123456",
  "attachments": [
    {
      "name": "comprobante.pdf",
      "type": "document",
      "data": "data:application/pdf;base64,JVBERi0...",
      "mimeType": "application/pdf",
      "size": 245678
    },
    {
      "name": "foto_comprobante.jpg",
      "type": "image",
      "data": "data:image/jpeg;base64,/9j/4AAQ...",
      "mimeType": "image/jpeg",
      "size": 123456
    }
  ]
}
```
- **Lógica**:
  - Generar `id` único
  - Generar `paymentNumber` en formato `PAG-XXXXXX` (6 dígitos, secuencial)
  - Obtener `providerName` del proveedor automáticamente
  - Si hay `purchaseOrderId`, obtener `orderNumber` de la orden
  - Asignar `status: 'completed'` por defecto (o `'pending'` según lógica)
  - Obtener `createdBy` y `createdByName` del token
  - **Guardar attachments tal cual** (base64) o convertir a URLs de storage
  - Timestamps automáticos
  - **Crear actividad automática**: Tipo `payment_created`

#### **PUT** `/api/providers/:providerId/payments/:paymentId`
- **Descripción**: Actualizar un pago
- **Body**: Campos parciales
- **Lógica**:
  - Si `status` cambia a `'completed'`: 
    - **Crear actividad**: Tipo `payment_completed`

#### **DELETE** `/api/providers/:providerId/payments/:paymentId`
- **Descripción**: Eliminar un pago
- **Validación**: Solo permitir si está en estado `pending`

---

## 📄 4. DOCUMENTOS (DOCUMENTS)

Documentos adjuntos relacionados con el proveedor (contratos, facturas, certificados, etc.).

### Estructura de Datos:

```typescript
interface ProviderDocument {
  id: string;
  providerId: string;
  name: string;
  type: 'contract' | 'invoice' | 'receipt' | 'certificate' | 'other';
  fileUrl: string; // URL del archivo en storage o base64
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  notes?: string;
}
```

### Endpoints Necesarios:

#### **GET** `/api/providers/:providerId/documents`
- **Descripción**: Obtener todos los documentos de un proveedor
- **Query params opcionales**: `type`, `search`
- **Response**: Array de `ProviderDocument`

#### **POST** `/api/providers/:providerId/documents`
- **Descripción**: Subir un documento
- **Body**:
```json
{
  "name": "Contrato_2025.pdf",
  "type": "contract",
  "fileUrl": "data:application/pdf;base64,...",
  "fileSize": 245678,
  "mimeType": "application/pdf",
  "notes": "Contrato anual"
}
```
- **Lógica**:
  - Generar `id` único
  - Obtener `uploadedBy` y `uploadedByName` del token
  - Guardar archivo (base64 o convertir a storage)
  - Timestamps automáticos
  - **Crear actividad automática**: Tipo `document_uploaded`

#### **DELETE** `/api/providers/:providerId/documents/:documentId`
- **Descripción**: Eliminar un documento
- **Lógica**: Eliminar archivo físico también

---

## 📊 5. ACTIVIDADES / HISTORIAL (ACTIVITIES)

Registro automático de todas las acciones realizadas sobre un proveedor. **SE CREAN AUTOMÁTICAMENTE** cuando ocurren eventos.

### Estructura de Datos:

```typescript
interface ProviderActivity {
  id: string;
  providerId: string;
  type: 'created' | 'updated' | 'order_created' | 'order_updated' | 
        'order_accepted' | 'order_rejected' | 'order_delivered' | 
        'payment_created' | 'payment_completed' | 
        'material_added' | 'material_updated' | 'material_deleted' | 
        'note_added' | 'document_uploaded' | 'status_changed';
  description: string;
  details?: Record<string, any>; // JSON con detalles adicionales
  entityType?: 'provider' | 'order' | 'payment' | 'material';
  entityId?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
}
```

### Endpoints Necesarios:

#### **GET** `/api/providers/:providerId/activities`
- **Descripción**: Obtener historial de actividades de un proveedor
- **Query params opcionales**: 
  - `type`: Filtrar por tipo de actividad
  - `limit`: Número de resultados (default: 100)
  - `offset`: Paginación
- **Response**: Array de `ProviderActivity` ordenado por fecha descendente
- **Nota**: Este endpoint **SOLO LEE**. Las actividades se crean automáticamente en otros endpoints.

#### **POST** `/api/providers/:providerId/activities` (Opcional - para crear manualmente)
- **Descripción**: Crear una actividad manualmente (ej: nota agregada)
- **Body**:
```json
{
  "type": "note_added",
  "description": "Nota agregada: Revisar términos de pago",
  "details": {
    "note": "Revisar términos de pago próximamente"
  }
}
```
- **Lógica**: 
  - Generar `id` único
  - Obtener usuario del token
  - Timestamps automáticos

---

## ⭐ 6. CALIFICACIONES (RATINGS)

Sistema de evaluación y calificación del proveedor.

### Estructura de Datos:

```typescript
interface ProviderRating {
  providerId: string; // ID del proveedor (clave primaria)
  overall: number; // 0-5
  quality: number; // 0-5
  delivery: number; // 0-5
  price: number; // 0-5
  communication: number; // 0-5
  totalReviews: number; // Contador de calificaciones
  updatedAt: string;
}
```

### Endpoints Necesarios:

#### **GET** `/api/providers/:providerId/rating`
- **Descripción**: Obtener calificación del proveedor
- **Response**: Un solo `ProviderRating` o `null` si no existe
- **Lógica**: Si no existe, retornar calificación por defecto con todos los valores en 0

#### **PUT** `/api/providers/:providerId/rating`
- **Descripción**: Actualizar/crear calificación
- **Body**:
```json
{
  "overall": 4.5,
  "quality": 5.0,
  "delivery": 4.0,
  "price": 4.5,
  "communication": 4.5
}
```
- **Lógica**:
  - Si no existe rating, crear uno nuevo con `totalReviews: 1`
  - Si existe, actualizar valores y incrementar `totalReviews`
  - Calcular `overall` como promedio de (quality + delivery + price + communication) / 4
  - Actualizar `updatedAt`

---

## 📈 7. ESTADO DE CUENTA (ACCOUNT STATEMENT)

Resumen financiero calculado basado en órdenes y pagos.

### Estructura de Datos:

```typescript
interface AccountStatement {
  providerId: string;
  providerName: string;
  period: {
    from: string;
    to: string;
  };
  openingBalance: number;
  totalOrders: number;
  totalPayments: number;
  currentBalance: number; // = totalOrders - totalPayments
  orders: Array<{
    id: string;
    orderNumber: string;
    date: string;
    amount: number;
    status: string;
  }>;
  payments: Array<{
    id: string;
    paymentNumber: string;
    date: string;
    amount: number;
    method: string;
  }>;
  totalPurchaseOrders: number;
  completedOrders: number;
  pendingOrders: number;
  overduePayments: number;
}
```

### Endpoints Necesarios:

#### **GET** `/api/providers/:providerId/account-statement`
- **Descripción**: Obtener estado de cuenta del proveedor
- **Query params opcionales**: 
  - `from`: Fecha inicio (ISO string)
  - `to`: Fecha fin (ISO string)
  - `period`: '30d' | '60d' | '90d' | 'all' (default: 'all')
- **Lógica**:
  1. Obtener todas las órdenes del proveedor (filtradas por fechas si aplica)
  2. Obtener todos los pagos del proveedor (filtrados por fechas si aplica)
  3. Calcular:
     - `totalOrders`: Suma de `total` de órdenes (excluyendo `cancelled`)
     - `totalPayments`: Suma de `amount` de pagos con `status: 'completed'`
     - `currentBalance`: `totalOrders - totalPayments`
     - `completedOrders`: Contar órdenes con `status: 'delivered'`
     - `pendingOrders`: Contar órdenes no entregadas ni canceladas
     - `overduePayments`: Pagos pendientes con fecha vencida (si aplica)
  4. Formatear arrays de `orders` y `payments` con campos necesarios
  5. Retornar objeto `AccountStatement`

---

## 🔐 Consideraciones de Seguridad y Autenticación

1. **Autenticación**: Todos los endpoints deben validar el token JWT
2. **Autorización**: Validar que el usuario tenga permisos para acceder al proveedor
3. **Validación de datos**: 
   - Validar que `providerId` exista antes de crear recursos relacionados
   - Validar formatos de fechas, montos, etc.
4. **Sanitización**: 
   - Sanitizar strings (XSS prevention)
   - Validar tamaño de archivos base64
   - Validar tipos MIME de archivos

---

## 💾 Estructura de Base de Datos Sugerida

### Firestore Collections:

```
providers/
  {providerId}/
    materials/
      {materialId}/
    orders/
      {orderId}/
    payments/
      {paymentId}/
    documents/
      {documentId}/
    activities/
      {activityId}/
    rating/
      {providerId}/ (un solo documento)
```

### O estructura plana:

```
providers/ (colección principal)
materials/ (subcolección o colección separada con providerId)
purchase_orders/ (colección separada con providerId)
payments/ (colección separada con providerId)
documents/ (colección separada con providerId)
activities/ (colección separada con providerId)
ratings/ (colección separada con providerId)
```

---

## 📝 Notas Importantes

1. **Imágenes Base64**: El frontend envía imágenes como base64 data URLs (`data:image/jpeg;base64,...`). Puedes:
   - Guardarlas tal cual (simple pero aumenta tamaño de BD)
   - Convertirlas a URLs de Firebase Storage (recomendado para producción)

2. **Generación de Números**: 
   - `orderNumber`: Formato `OC-XXXXXX` (ej: OC-123456)
   - `paymentNumber`: Formato `PAG-XXXXXX` (ej: PAG-123456)
   - Usar secuencias incrementales o timestamps

3. **Actividades Automáticas**: Cada vez que creas/actualizas/eliminas recursos, crea una actividad automáticamente. Esto es crítico para el historial.

4. **Timestamps**: Usar formato ISO 8601 (`2025-01-01T00:00:00.000Z`)

5. **Errores**: Retornar códigos HTTP apropiados (400, 404, 500) con mensajes descriptivos

---

## ✅ Checklist de Implementación

- [ ] Endpoints de Materiales (GET, POST, PUT, DELETE)
- [ ] Endpoints de Órdenes de Compra (GET, POST, PUT, DELETE)
- [ ] Endpoints de Pagos (GET, POST, PUT, DELETE) - **Incluir attachments**
- [ ] Endpoints de Documentos (GET, POST, DELETE)
- [ ] Endpoints de Actividades (GET, POST automático)
- [ ] Endpoints de Ratings (GET, PUT)
- [ ] Endpoint de Account Statement (GET con cálculos)
- [ ] Validación de autenticación en todos los endpoints
- [ ] Validación de datos de entrada
- [ ] Manejo de errores apropiado
- [ ] Creación automática de actividades
- [ ] Generación de números secuenciales (OC-XXX, PAG-XXX)

---

## 🔗 Endpoints Resumen

| Método | Endpoint | Estado | Descripción |
|--------|----------|--------|-------------|
| GET | `/api/inventory/providers` | ✅ Funciona | Listar proveedores |
| GET | `/api/inventory/providers/:id` | ✅ Funciona | Obtener proveedor |
| POST | `/api/inventory/providers` | ✅ Funciona | Crear proveedor |
| PUT | `/api/inventory/providers/:id` | ✅ Funciona | Actualizar proveedor |
| DELETE | `/api/inventory/providers/:id` | ✅ Funciona | Eliminar proveedor |
| GET | `/api/providers/:id/materials` | ❌ Falta | Listar materiales |
| POST | `/api/providers/:id/materials` | ❌ Falta | Crear material |
| PUT | `/api/providers/:id/materials/:matId` | ❌ Falta | Actualizar material |
| DELETE | `/api/providers/:id/materials/:matId` | ❌ Falta | Eliminar material |
| GET | `/api/providers/:id/orders` | ❌ Falta | Listar órdenes |
| POST | `/api/providers/:id/orders` | ❌ Falta | Crear orden |
| PUT | `/api/providers/:id/orders/:orderId` | ❌ Falta | Actualizar orden |
| DELETE | `/api/providers/:id/orders/:orderId` | ❌ Falta | Eliminar orden |
| GET | `/api/providers/:id/payments` | ❌ Falta | Listar pagos |
| POST | `/api/providers/:id/payments` | ❌ Falta | Crear pago (con attachments) |
| PUT | `/api/providers/:id/payments/:payId` | ❌ Falta | Actualizar pago |
| DELETE | `/api/providers/:id/payments/:payId` | ❌ Falta | Eliminar pago |
| GET | `/api/providers/:id/documents` | ❌ Falta | Listar documentos |
| POST | `/api/providers/:id/documents` | ❌ Falta | Subir documento |
| DELETE | `/api/providers/:id/documents/:docId` | ❌ Falta | Eliminar documento |
| GET | `/api/providers/:id/activities` | ❌ Falta | Listar actividades |
| GET | `/api/providers/:id/rating` | ❌ Falta | Obtener rating |
| PUT | `/api/providers/:id/rating` | ❌ Falta | Actualizar rating |
| GET | `/api/providers/:id/account-statement` | ❌ Falta | Estado de cuenta |

---

**¡Gracias por implementar estos endpoints! El módulo de proveedores quedará completamente funcional una vez que estén listos.** 🚀
