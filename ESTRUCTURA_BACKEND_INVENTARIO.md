# 📦 ESTRUCTURA DEL BACKEND - MÓDULO DE INVENTARIO

## 🎯 OBJETIVO

Crear un sistema completo de gestión de inventario de materiales con:
- ✅ **Funcionalidad offline completa** (ya implementada)
- ✅ **Sincronización automática con backend**
- ✅ **Estructura escalable para futuras mejoras**
- ✅ **Proveedores como entidad padre principal**

---

## 🏗️ ARQUITECTURA DE DATOS

### **JERARQUÍA DE COLECCIONES**

```
Firebase/MongoDB Structure:
└── users/{userId}/
    ├── inventory_configuration/
    │   ├── settings
    │   ├── lastUpdated
    │   └── preferences
    │
    └── providers/ (COLECCIÓN PADRE)
        ├── {providerId}/
        │   ├── name
        │   ├── contact
        │   ├── phone
        │   ├── email
        │   ├── address
        │   ├── materialIds[]  // Materiales que maneja
        │   ├── createdAt
        │   ├── updatedAt
        │   └── platforms/ (SUBCOLECCIÓN)
        │       ├── {platformId}/
        │       │   ├── platformNumber
        │       │   ├── receptionDate
        │       │   ├── materialTypes[]
        │       │   ├── driver
        │       │   ├── standardWidth
        │       │   ├── pieces[]
        │       │   │   ├── id
        │       │   │   ├── number
        │       │   │   ├── length
        │       │   │   ├── standardWidth
        │       │   │   ├── linearMeters
        │       │   │   ├── material
        │       │   │   └── createdAt
        │       │   ├── totalLinearMeters
        │       │   ├── totalLength
        │       │   ├── status (in_progress | completed | exported)
        │       │   ├── notes
        │       │   ├── createdBy
        │       │   ├── createdAt
        │       │   └── updatedAt
        │
        └── materials/ (COLECCIÓN GLOBAL)
            ├── {materialId}/
            │   ├── name
            │   ├── category
            │   ├── description
            │   ├── isActive
            │   ├── providerIds[]  // Proveedores que lo manejan
            │   ├── createdAt
            │   └── updatedAt
```

---

## 📡 ENDPOINTS REQUERIDOS

### **1. PROVEEDORES** (`/api/inventory/providers`)

#### **GET /api/inventory/providers**
Obtener todos los proveedores del usuario

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "provider_123",
      "name": "Mármoles del Norte",
      "contact": "Juan Pérez",
      "phone": "+52 81 1234-5678",
      "email": "contacto@marmolesdn.com",
      "address": "Av. Principal 123, Monterrey, NL",
      "materialIds": ["mat_001", "mat_002", "mat_003"],
      "createdAt": "2025-01-30T00:00:00.000Z",
      "updatedAt": "2025-01-30T00:00:00.000Z"
    }
  ],
  "message": "Proveedores obtenidos exitosamente"
}
```

#### **GET /api/inventory/providers/:providerId**
Obtener un proveedor específico

#### **POST /api/inventory/providers**
Crear nuevo proveedor

**Request Body:**
```json
{
  "name": "Canteras del Sur",
  "contact": "María González",
  "phone": "+52 33 9876-5432",
  "email": "maria@canterasdelsur.com",
  "address": "Calle 5 de Mayo 456, Guadalajara, JAL",
  "materialIds": ["mat_004", "mat_005"]
}
```

#### **PUT /api/inventory/providers/:providerId**
Actualizar proveedor existente

#### **DELETE /api/inventory/providers/:providerId**
Eliminar proveedor

#### **GET /api/inventory/providers/:providerId/platforms**
Obtener todas las plataformas de un proveedor

#### **GET /api/inventory/providers/:providerId/materials**
Obtener todos los materiales que maneja un proveedor

#### **GET /api/inventory/providers/:providerId/stats**
Obtener estadísticas del proveedor
- Total de plataformas
- Total de metros lineales recibidos
- Últimas recepciones
- Materiales más recibidos

---

### **2. PLATAFORMAS** (`/api/inventory/platforms`)

#### **GET /api/inventory/platforms**
Obtener todas las plataformas (con filtros opcionales)

**Query Parameters:**
- `status` (optional): in_progress | completed | exported
- `providerId` (optional): Filtrar por proveedor
- `startDate` (optional): Fecha inicio
- `endDate` (optional): Fecha fin
- `materialType` (optional): Filtrar por tipo de material

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "platform_456",
      "platformNumber": "k",
      "receptionDate": "2025-01-30T00:00:00.000Z",
      "materialTypes": ["Mármol Blanco Carrara", "Granito Gris"],
      "provider": "Mármoles del Norte",
      "providerId": "provider_123",
      "driver": "Carlos López",
      "standardWidth": 0.3,
      "pieces": [
        {
          "id": "piece_789",
          "number": 1,
          "length": 6.0,
          "standardWidth": 0.3,
          "linearMeters": 1.8,
          "material": "Mármol Blanco Carrara",
          "createdAt": "2025-01-30T10:30:00.000Z"
        }
      ],
      "totalLinearMeters": 1.8,
      "totalLength": 6.0,
      "status": "exported",
      "notes": "Carga en buen estado",
      "createdBy": "user_001",
      "createdAt": "2025-01-30T08:00:00.000Z",
      "updatedAt": "2025-01-30T12:00:00.000Z"
    }
  ],
  "message": "Plataformas obtenidas exitosamente"
}
```

#### **GET /api/inventory/platforms/:platformId**
Obtener una plataforma específica

#### **POST /api/inventory/platforms**
Crear nueva plataforma

**Request Body:**
```json
{
  "platformNumber": "A-123",
  "receptionDate": "2025-01-30T00:00:00.000Z",
  "materialTypes": ["Mármol Blanco Carrara"],
  "provider": "Mármoles del Norte",
  "providerId": "provider_123",
  "driver": "Juan García",
  "standardWidth": 0.3,
  "pieces": [],
  "status": "in_progress",
  "notes": ""
}
```

#### **PUT /api/inventory/platforms/:platformId**
Actualizar plataforma existente

#### **DELETE /api/inventory/platforms/:platformId**
Eliminar plataforma

#### **GET /api/inventory/platforms/stats**
Obtener estadísticas globales
- Total de plataformas
- Total en proceso
- Total completadas
- Total exportadas
- Metros lineales totales

---

### **3. MATERIALES** (`/api/inventory/materials`)

#### **GET /api/inventory/materials**
Obtener todos los materiales

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mat_001",
      "name": "Mármol Blanco Carrara",
      "category": "Mármol",
      "description": "Mármol blanco de alta calidad",
      "isActive": true,
      "providerIds": ["provider_123", "provider_456"],
      "createdAt": "2025-01-15T00:00:00.000Z",
      "updatedAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "message": "Materiales obtenidos exitosamente"
}
```

#### **GET /api/inventory/materials/active**
Obtener solo materiales activos

#### **GET /api/inventory/materials/category/:category**
Obtener materiales por categoría

#### **POST /api/inventory/materials**
Crear nuevo material

#### **PUT /api/inventory/materials/:materialId**
Actualizar material

#### **DELETE /api/inventory/materials/:materialId**
Eliminar material

---

### **4. CONFIGURACIÓN** (`/api/inventory/configuration`)

#### **GET /api/inventory/configuration**
Obtener configuración del usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [...],
    "materials": [...],
    "settings": {
      "defaultStandardWidth": 0.3,
      "autoSaveEnabled": true,
      "showPieceNumbers": true,
      "allowMultipleMaterials": true,
      "requireMaterialSelection": true,
      "defaultMaterialCategories": ["Mármol", "Granito", "Cuarzo"]
    },
    "lastUpdated": "2025-01-30T00:00:00.000Z"
  }
}
```

#### **PUT /api/inventory/configuration**
Actualizar configuración completa

#### **POST /api/inventory/configuration/sync**
Sincronizar configuración local con servidor

**Request Body:**
```json
{
  "lastUpdated": "2025-01-30T00:00:00.000Z",
  "checksum": "base64_encoded_checksum"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "needsUpdate": false,
    "serverConfig": null  // O la configuración del servidor si needsUpdate = true
  }
}
```

---

### **5. SINCRONIZACIÓN** (`/api/inventory/sync`)

#### **POST /api/inventory/sync/all**
Sincronizar todos los datos locales con el servidor

**Request Body:**
```json
{
  "platforms": [...],  // Todas las plataformas locales
  "providers": [...],  // Todos los proveedores locales
  "materials": [...],  // Todos los materiales locales
  "configuration": {...}  // Configuración local
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "syncedPlatforms": 5,
    "syncedProviders": 3,
    "syncedMaterials": 12,
    "syncedConfiguration": true,
    "errors": [],
    "conflicts": []  // Conflictos que requieren resolución manual
  }
}
```

#### **GET /api/inventory/sync/status**
Obtener estado de sincronización

---

### **6. HEALTH CHECK** (`/api/health`)

#### **GET /api/health**
Verificar que el backend esté funcionando

**Response:**
```json
{
  "success": true,
  "message": "Backend is healthy",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

---

## 🔐 AUTENTICACIÓN

Todos los endpoints requieren autenticación mediante JWT:

```javascript
Headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

El token debe incluir:
- `userId`: ID del usuario
- `email`: Email del usuario
- `role`: Rol del usuario

---

## 📊 MODELOS DE DATOS

### **Provider**
```typescript
interface Provider {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  materialIds: string[];  // Materiales que maneja
  createdAt: Date;
  updatedAt: Date;
}
```

### **Platform**
```typescript
interface Platform {
  id: string;
  platformNumber: string;
  receptionDate: Date;
  materialTypes: string[];  // Array de nombres de materiales
  provider: string;  // Nombre del proveedor
  providerId: string;  // ID del proveedor
  driver: string;
  standardWidth: number;
  pieces: Piece[];
  totalLinearMeters: number;
  totalLength: number;
  status: 'in_progress' | 'completed' | 'exported';
  notes?: string;
  createdBy: string;  // userId
  createdAt: Date;
  updatedAt: Date;
}
```

### **Piece**
```typescript
interface Piece {
  id: string;
  number: number;
  length: number;
  standardWidth: number;
  linearMeters: number;  // Calculado: length * standardWidth
  material: string;
  createdAt: Date;
}
```

### **MaterialOption**
```typescript
interface MaterialOption {
  id: string;
  name: string;
  category?: string;
  description?: string;
  isActive?: boolean;
  providerIds: string[];  // Proveedores que lo manejan
  createdAt: Date;
  updatedAt: Date;
}
```

### **ModuleConfiguration**
```typescript
interface ModuleConfiguration {
  providers: Provider[];
  materials: MaterialOption[];
  settings: {
    defaultStandardWidth: number;
    autoSaveEnabled: boolean;
    showPieceNumbers: boolean;
    allowMultipleMaterials: boolean;
    requireMaterialSelection: boolean;
    defaultMaterialCategories: string[];
  };
  lastUpdated: Date;
}
```

---

## 🔄 LÓGICA DE SINCRONIZACIÓN

### **Flujo de Sincronización**

1. **Detectar conexión**
   - El frontend detecta cuando hay conexión a internet
   - Activa sincronización automática

2. **Identificar cambios**
   - IDs que empiezan con `id-`, `plat-`, `prov-`, `mat-` = Datos locales (crear en backend)
   - IDs del backend = Datos existentes (actualizar en backend)

3. **Sincronizar en orden**
   - **Primero**: Configuración
   - **Segundo**: Proveedores
   - **Tercero**: Materiales
   - **Cuarto**: Plataformas (porque dependen de proveedores)

4. **Manejo de conflictos**
   - Si `updatedAt` del servidor > local: El servidor gana
   - Si `updatedAt` local > servidor: El local gana
   - Notificar al usuario sobre conflictos

5. **Actualizar IDs locales**
   - Después de crear en backend, actualizar IDs locales con IDs del servidor
   - Mantener sincronización bidireccional

---

## 🚀 FUNCIONALIDADES FUTURAS

### **Dashboard de Proveedores**
- Histórico de entregas por proveedor
- Análisis de materiales por proveedor
- Calificación de proveedores
- Alertas de retrasos

### **Analítica Avanzada**
- Tendencias de recepción de materiales
- Proyecciones de inventario
- Reportes por período
- Comparativas entre proveedores

### **Integración con Otros Módulos**
- Vincular con módulo de compras
- Vincular con módulo de almacén
- Vincular con módulo de facturación
- Vincular con módulo de proyectos

### **Notificaciones**
- Alertas de stock bajo
- Notificaciones de nuevas recepciones
- Recordatorios de seguimiento
- Alertas de materiales faltantes

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### **Backend**
- [ ] Configurar base de datos (Firebase/MongoDB)
- [ ] Implementar endpoints de proveedores (CRUD)
- [ ] Implementar endpoints de plataformas (CRUD)
- [ ] Implementar endpoints de materiales (CRUD)
- [ ] Implementar endpoints de configuración
- [ ] Implementar endpoint de sincronización
- [ ] Implementar autenticación JWT
- [ ] Implementar validaciones de datos
- [ ] Implementar manejo de errores
- [ ] Implementar logging
- [ ] Implementar rate limiting
- [ ] Configurar CORS
- [ ] Crear documentación de API
- [ ] Implementar tests unitarios
- [ ] Implementar tests de integración

### **Frontend** (Ya implementado)
- [x] Servicios de API (`inventoryApiService.ts`)
- [x] Hook de sincronización (`useInventorySync.ts`)
- [x] Funcionalidad offline completa
- [x] Almacenamiento local (localStorage)
- [x] Cálculos automáticos
- [x] Exportación (PDF, Excel, Imagen)
- [ ] Integrar sincronización en componentes
- [ ] Agregar indicadores de estado de sincronización
- [ ] Agregar botón de sincronización manual
- [ ] Agregar manejo de conflictos
- [ ] Agregar notificaciones de sincronización

---

## 🎯 VENTAJAS DE ESTA ARQUITECTURA

### **Escalabilidad**
✅ Los proveedores son la entidad padre
✅ Cada proveedor puede tener múltiples plataformas
✅ Fácil agregar nuevas funcionalidades
✅ Relaciones claras entre entidades

### **Flexibilidad**
✅ Funciona offline completamente
✅ Sincronización automática cuando hay conexión
✅ No pierde datos nunca
✅ Permite trabajo simultáneo offline/online

### **Performance**
✅ Datos locales = Velocidad instantánea
✅ Sincronización en background
✅ No bloquea la UI
✅ Optimización automática de consultas

### **Mantenibilidad**
✅ Código limpio y organizado
✅ Separación clara de responsabilidades
✅ Fácil de testear
✅ Documentación completa

---

## 📞 SOPORTE

Para implementar el backend, seguir esta documentación al pie de la letra.
Todos los endpoints, modelos y flujos están definidos y listos para implementar.

**¡El frontend ya está 100% preparado para la integración!** 🚀

