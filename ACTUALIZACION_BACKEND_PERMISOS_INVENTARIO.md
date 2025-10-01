# ACTUALIZACIÓN CRÍTICA DEL BACKEND - SISTEMA DE PERMISOS Y MÓDULOS

## 🚨 CAMBIOS URGENTES REQUERIDOS

El frontend ha sido completamente actualizado y necesita que el backend realice los siguientes cambios críticos para mantener la funcionalidad al 100%.

---

## 📋 RESUMEN DE CAMBIOS

### ❌ MÓDULOS ELIMINADOS
- **`warehouse`** - Módulo de almacén (completamente eliminado)
- **`providers`** - Módulo de proveedores (completamente eliminado)

### ✅ MÓDULOS AGREGADOS
- **`inventory`** - Nuevo módulo de inventario (completamente funcional)

---

## 🔧 ACTUALIZACIONES REQUERIDAS EN EL BACKEND

### 1. ACTUALIZAR SISTEMA DE PERMISOS

#### A. Eliminar módulos obsoletos de la configuración de permisos:

```javascript
// ELIMINAR estas entradas de todos los archivos de configuración:
'warehouse': { read: false, write: false, configure: false }
'providers': { read: false, write: false, configure: false }
```

#### B. Agregar el nuevo módulo de inventario:

```javascript
// AGREGAR esta entrada a todos los archivos de configuración:
'inventory': { 
  name: 'Inventario', 
  description: 'Gestión de inventario y plataformas de carga',
  level: 'operational',
  permissions: {
    read: boolean,
    write: boolean,
    configure: boolean
  }
}
```

### 2. ACTUALIZAR CONFIGURACIONES DE ROLES

#### A. Roles existentes que deben actualizarse:

**AGENTE DE RRHH:**
```javascript
const hrAgentPermissions = {
  modules: {
    'dashboard': { read: true, write: false, configure: false },
    'hr': { read: true, write: true, configure: false },
    'team': { read: true, write: true, configure: false },
    'notifications': { read: true, write: false, configure: false },
    'knowledge-base': { read: true, write: false, configure: false },
    'internal-chat': { read: true, write: true, configure: false },
    
    // NUEVOS MÓDULOS RESTRINGIDOS
    'clients': { read: false, write: false, configure: false },
    'chat': { read: false, write: false, configure: false },
    'campaigns': { read: false, write: false, configure: false },
    'phone': { read: false, write: false, configure: false },
    'supervision': { read: false, write: false, configure: false },
    'copilot': { read: false, write: false, configure: false },
    'inventory': { read: false, write: false, configure: false }, // NUEVO
    'shipping': { read: false, write: false, configure: false },
    'services': { read: false, write: false, configure: false }
  }
};
```

**AGENTE DE VENTAS:**
```javascript
const salesAgentPermissions = {
  modules: {
    'dashboard': { read: true, write: false, configure: false },
    'clients': { read: true, write: true, configure: false },
    'chat': { read: true, write: true, configure: false },
    'campaigns': { read: true, write: true, configure: false },
    'phone': { read: true, write: true, configure: false },
    'knowledge-base': { read: true, write: false, configure: false },
    'copilot': { read: true, write: false, configure: false },
    'notifications': { read: true, write: false, configure: false },
    'internal-chat': { read: true, write: true, configure: false },
    
    // NUEVOS MÓDULOS RESTRINGIDOS
    'hr': { read: false, write: false, configure: false },
    'team': { read: false, write: false, configure: false },
    'supervision': { read: false, write: false, configure: false },
    'inventory': { read: false, write: false, configure: false }, // NUEVO
    'shipping': { read: false, write: false, configure: false },
    'services': { read: false, write: false, configure: false }
  }
};
```

**SUPERVISOR:**
```javascript
const supervisorPermissions = {
  modules: {
    'dashboard': { read: true, write: true, configure: false },
    'clients': { read: true, write: true, configure: false },
    'chat': { read: true, write: true, configure: false },
    'campaigns': { read: true, write: true, configure: false },
    'phone': { read: true, write: true, configure: false },
    'knowledge-base': { read: true, write: true, configure: false },
    'copilot': { read: true, write: false, configure: false },
    'notifications': { read: true, write: true, configure: false },
    'internal-chat': { read: true, write: true, configure: false },
    'team': { read: true, write: true, configure: false },
    'supervision': { read: true, write: true, configure: false },
    'hr': { read: true, write: false, configure: false },
    'inventory': { read: true, write: true, configure: false }, // NUEVO - Acceso completo
    'shipping': { read: true, write: false, configure: false },
    'services': { read: true, write: false, configure: false }
  }
};
```

#### B. NUEVO ROL: AGENTE DE INVENTARIO

```javascript
const inventoryAgentPermissions = {
  modules: {
    'dashboard': { read: true, write: false, configure: false },
    'inventory': { read: true, write: true, configure: true }, // Acceso completo
    'notifications': { read: true, write: false, configure: false },
    'internal-chat': { read: true, write: true, configure: false },
    'knowledge-base': { read: true, write: false, configure: false }, // Solo lectura
    'shipping': { read: true, write: false, configure: false }, // Solo lectura
    
    // TODOS LOS DEMÁS RESTRINGIDOS
    'clients': { read: false, write: false, configure: false },
    'chat': { read: false, write: false, configure: false },
    'campaigns': { read: false, write: false, configure: false },
    'phone': { read: false, write: false, configure: false },
    'hr': { read: false, write: false, configure: false },
    'team': { read: false, write: false, configure: false },
    'supervision': { read: false, write: false, configure: false },
    'copilot': { read: false, write: false, configure: false },
    'services': { read: false, write: false, configure: false }
  }
};
```

### 3. ACTUALIZAR PRIORIDAD DE MÓDULOS

```javascript
// Actualizar la lista de prioridad de módulos (para determinar módulo inicial)
const modulePriority = [
  'dashboard',        // 1. Dashboard
  'clients',          // 2. Clientes
  'team',             // 3. Equipo
  'notifications',    // 4. Notificaciones
  'chat',             // 5. Chat
  'internal-chat',    // 6. Chat Interno
  'campaigns',        // 7. Campañas
  'phone',            // 8. Teléfono
  'knowledge-base',   // 9. Base de Conocimiento
  'hr',               // 10. Recursos Humanos
  'supervision',      // 11. Supervisión
  'copilot',          // 12. Copiloto
  'inventory',        // 13. Inventario (NUEVO)
  'shipping',         // 14. Envíos
  'services'          // 15. Servicios
];
```

### 4. ACTUALIZAR MAPEO DE NOMBRES DE MÓDULOS

```javascript
// Actualizar el mapeo de IDs a nombres legibles
const moduleNameMapping = {
  'dashboard': 'Dashboard',
  'clients': 'Customer Hub',
  'team': 'Equipo & Performance',
  'notifications': 'Centro de Notificaciones',
  'chat': 'Mensajes',
  'internal-chat': 'Chat Interno',
  'campaigns': 'Campañas',
  'phone': 'Teléfono',
  'knowledge-base': 'Base de Conocimiento',
  'hr': 'Recursos Humanos',
  'supervision': 'Supervisión',
  'copilot': 'Copiloto IA',
  'inventory': 'Inventario', // NUEVO
  'shipping': 'Envíos',
  'services': 'Servicios'
};
```

### 5. ACTUALIZAR ENDPOINTS Y RUTAS

#### A. Eliminar endpoints obsoletos:
```javascript
// ELIMINAR estas rutas:
DELETE /api/modules/warehouse
DELETE /api/modules/providers
DELETE /api/permissions/warehouse
DELETE /api/permissions/providers
```

#### B. Agregar endpoints para inventario:
```javascript
// AGREGAR estas rutas:
GET /api/modules/inventory
POST /api/modules/inventory
PUT /api/modules/inventory
DELETE /api/modules/inventory
GET /api/permissions/inventory
POST /api/permissions/inventory
PUT /api/permissions/inventory
```

### 6. ACTUALIZAR BASE DE DATOS

#### A. Eliminar colecciones/tablas obsoletas:
```sql
-- ELIMINAR estas tablas/colecciones:
DROP TABLE warehouse_permissions;
DROP TABLE providers_permissions;
DROP TABLE warehouse_configurations;
DROP TABLE providers_configurations;
```

#### B. Crear estructura para inventario:
```sql
-- CREAR tabla/colección para inventario:
CREATE TABLE inventory_permissions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  module_id VARCHAR(50) DEFAULT 'inventory',
  read_permission BOOLEAN DEFAULT false,
  write_permission BOOLEAN DEFAULT false,
  configure_permission BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_inventory_permissions_user_id ON inventory_permissions(user_id);
CREATE INDEX idx_inventory_permissions_module_id ON inventory_permissions(module_id);
```

### 7. ACTUALIZAR MIDDLEWARE DE AUTENTICACIÓN

```javascript
// Actualizar el middleware para incluir inventario
const validateModuleAccess = (moduleId) => {
  const validModules = [
    'dashboard', 'clients', 'team', 'notifications', 'chat', 
    'internal-chat', 'campaigns', 'phone', 'knowledge-base', 
    'hr', 'supervision', 'copilot', 'inventory', // NUEVO
    'shipping', 'services'
  ];
  
  if (!validModules.includes(moduleId)) {
    throw new Error(`Módulo '${moduleId}' no válido`);
  }
};
```

### 8. ACTUALIZAR SERVICIOS DE SINCRONIZACIÓN

```javascript
// Actualizar servicios para manejar inventario
const syncUserPermissions = async (userId) => {
  const modules = [
    'dashboard', 'clients', 'team', 'notifications', 'chat',
    'internal-chat', 'campaigns', 'phone', 'knowledge-base',
    'hr', 'supervision', 'copilot', 'inventory', // NUEVO
    'shipping', 'services'
  ];
  
  // Lógica de sincronización...
};
```

---

## 🔄 PROCESO DE MIGRACIÓN RECOMENDADO

### Fase 1: Preparación (Sin impacto)
1. Crear las nuevas estructuras de base de datos
2. Agregar el módulo 'inventory' a todas las configuraciones
3. Crear el nuevo rol 'inventory_agent'

### Fase 2: Migración de datos
1. Migrar usuarios existentes para eliminar referencias a 'warehouse' y 'providers'
2. Asignar permisos de 'inventory' según roles apropiados
3. Actualizar configuraciones existentes

### Fase 3: Validación
1. Verificar que todos los usuarios tengan permisos válidos
2. Probar acceso al módulo de inventario
3. Confirmar que no hay referencias a módulos eliminados

### Fase 4: Limpieza
1. Eliminar tablas/colecciones obsoletas
2. Limpiar código obsoleto
3. Actualizar documentación

---

## 🚨 VALIDACIONES CRÍTICAS

### Antes del despliegue, verificar:
- [ ] No existen referencias a 'warehouse' en la base de datos
- [ ] No existen referencias a 'providers' en la base de datos
- [ ] Todos los usuarios tienen permisos válidos para módulos existentes
- [ ] El módulo 'inventory' está disponible para usuarios apropiados
- [ ] Las rutas API están actualizadas
- [ ] El middleware de autenticación reconoce todos los módulos

### Después del despliegue, verificar:
- [ ] Los usuarios pueden acceder al módulo de inventario
- [ ] Los permisos se aplican correctamente
- [ ] No hay errores 404 para módulos eliminados
- [ ] La navegación funciona correctamente
- [ ] Los roles funcionan según lo esperado

---

## 📞 SOPORTE POST-DESPLIEGUE

Si surgen problemas después de la actualización:

1. **Verificar logs de autenticación** para errores de permisos
2. **Revisar base de datos** para usuarios con permisos inválidos
3. **Comprobar configuración de módulos** en el backend
4. **Validar rutas API** están funcionando correctamente

---

## 🎯 RESULTADO ESPERADO

Después de implementar estos cambios:

- ✅ El módulo de inventario funcionará al 100%
- ✅ Los permisos se aplicarán correctamente
- ✅ No habrá errores por módulos eliminados
- ✅ Los usuarios tendrán acceso apropiado según su rol
- ✅ El sistema será completamente funcional

---

**IMPORTANTE:** Esta actualización es crítica para mantener la funcionalidad del frontend. Sin estos cambios, los usuarios experimentarán errores de permisos y el módulo de inventario no funcionará correctamente.
