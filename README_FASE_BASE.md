# 🚀 UTalk Frontend - Fase Base

## 📋 Descripción

Fase base del sistema de chat empresarial UTalk, construida siguiendo exactamente las especificaciones del documento `PLAN_FRONTEND_UTALK_COMPLETO.md`.

**Características implementadas:**
- ✅ Configuración de entornos y variables
- ✅ Interceptores de Axios con manejo de autenticación
- ✅ Configuración de Socket.IO con reconexión automática
- ✅ Utilidades de validación (teléfonos, mensajes, archivos)
- ✅ Utilidad de fechas para múltiples formatos
- ✅ Stores globales de autenticación
- ✅ Ejemplos de uso de todas las validaciones

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd utalk-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar las variables según tu entorno
nano .env
```

### 4. Variables de entorno requeridas
```bash
# URLs de API y Socket - Documento sección "Configuración de Entornos"
VITE_API_URL=https://utalk-backend-production.up.railway.app/api
VITE_SOCKET_URL=https://utalk-backend-production.up.railway.app

# Configuración de desarrollo
NODE_ENV=development
VITE_APP_ENV=development
```

## 🚀 Ejecutar el proyecto

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

## 📁 Estructura de Archivos

```
src/
├── lib/
│   ├── config/
│   │   └── environment.ts          # Configuración de variables de entorno
│   ├── services/
│   │   ├── axios.ts               # Interceptores de Axios
│   │   └── socket.ts              # Configuración de Socket.IO
│   ├── stores/
│   │   └── auth.store.ts          # Store de autenticación
│   ├── utils/
│   │   ├── validation.ts          # Utilidades de validación
│   │   └── dates.ts               # Utilidad de fechas
│   └── examples/
│       └── validation-examples.ts # Ejemplos de uso
├── routes/                        # Rutas de SvelteKit
└── components/                    # Componentes de UI
```

## 🔧 Configuración Implementada

### 1. Variables de Entorno
- **API_URL**: URL del backend para peticiones REST
- **SOCKET_URL**: URL del backend para conexión WebSocket
- **Credenciales de prueba**: admin@company.com / 123456

### 2. Interceptores de Axios
- **Headers de autorización**: Adjunta automáticamente `Bearer {token}`
- **Manejo de errores 401**: Token expirado durante procesamiento
- **Rate limiting**: Headers `X-RateLimit-Remaining` y `X-RateLimit-Reset`
- **Errores específicos**: Conversación sin agente asignado (403)

### 3. Socket.IO
- **Reconexión automática**: Exponential backoff (1s, 2s, 5s, 10s, 30s)
- **Sincronización de estado**: Emite `sync-state` al reconectar
- **Limpieza de listeners**: Evita duplicación de eventos
- **Eventos manejados**: new-message, message-status-updated, user-typing, etc.

### 4. Utilidades de Validación
- **validatePhone()**: Regex internacional `^\+[1-9]\d{1,14}$`
- **validateMessage()**: Límite de 4096 bytes (no caracteres)
- **validateFileUpload()**: Máximo 10 archivos, 100MB cada uno
- **validateEmail()**: Formato de email estándar
- **validatePassword()**: Mínimo 6 caracteres
- **validateUUID()**: Formato UUID v4

### 5. Utilidad de Fechas
- **safeDateToISOString()**: Maneja 6 formatos distintos de fecha
- **formatDateForDisplay()**: Formatea para mostrar en UI
- **formatRelativeDate()**: "Hace X tiempo"
- **isRecentDate()**: Verifica si es de las últimas 24 horas

## 🧪 Probar las Validaciones

### Ejecutar ejemplos de validación
```bash
# En la consola del navegador
import { runAllValidationExamples } from './src/lib/examples/validation-examples.ts';
runAllValidationExamples();
```

### Ejemplos incluidos:
1. **Validación de teléfonos**: Formato internacional
2. **Validación de mensajes**: Con emojis y bytes reales
3. **Validación de archivos**: Tipos MIME y extensiones bloqueadas
4. **Validación de fechas**: 6 formatos distintos del backend
5. **Validación de UUID**: Formato UUID v4
6. **Validación de autenticación**: Email y contraseña
7. **Utilidades de archivos**: Formateo de tamaño y tipo

## 🔐 Autenticación

### Credenciales de prueba
- **Email**: admin@company.com
- **Password**: 123456

### Store de autenticación
```typescript
import { authStore } from './src/lib/stores/auth.store';

// Login
authStore.login(user, token);

// Logout
authStore.logout();

// Verificar permisos
const canSend = authStore.canSendMessages(state);
const canView = authStore.canViewConversations(state);
const isAdmin = authStore.isAdmin(state);
```

## 📊 Casos Especiales Implementados

### 1. Conversación Sin Agente Asignado
- **Estado**: `assignedTo: null`
- **Comportamiento**: Backend rechaza mensajes (error 403)
- **UI**: Deshabilita entrada de mensaje

### 2. Mensaje con Envío Fallido
- **Estado**: `status: "failed"`
- **Metadata**: `failureReason`, `retryable`
- **UI**: Muestra error y opción de reintentar

### 3. Token Expirado Durante Procesamiento
- **Error**: 401 con código `TOKEN_EXPIRED_DURING_PROCESSING`
- **Acción**: Refresh token automático + reintentar operación

### 4. Rate Limiting
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Error**: 429 con `retryAfter`
- **UI**: Muestra avisos y cuenta regresiva

### 5. Reconexión de WebSocket
- **Evento**: `socket.on('disconnect')`
- **Acción**: Reconexión con exponential backoff
- **Sincronización**: Emite `sync-state` al reconectar

## 🎨 Modo Oscuro/Claro

El proyecto está configurado para soportar modo oscuro y claro desde el inicio. Las variables CSS están definidas en:

```css
:root {
  /* Light mode variables */
  --bg-primary: #ffffff;
  --text-primary: #000000;
  /* ... más variables */
}

[data-theme="dark"] {
  /* Dark mode variables */
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  /* ... más variables */
}
```

## ♿ Accesibilidad

- **Contraste**: Cumple estándares WCAG 2.1
- **Navegación por teclado**: Todas las interacciones accesibles
- **Screen readers**: Etiquetas ARIA apropiadas
- **Responsive**: Diseño adaptable a todos los dispositivos

## 🚨 Reglas Importantes

### ✅ Lo que SÍ está implementado:
- Todas las validaciones del documento
- Todos los edge cases documentados
- Configuración exacta de entornos
- Interceptores de Axios completos
- Socket.IO con reconexión automática
- Stores globales de autenticación
- Utilidades de fechas para múltiples formatos

### ❌ Lo que NO está implementado:
- Datos mocks o ficticios
- Lógica de negocio duplicada del backend
- Validaciones inventadas
- Endpoints no documentados

## 🔗 Conexión con Backend

El proyecto está configurado para conectarse al backend real de UTalk:

- **Desarrollo**: https://utalk-backend-production.up.railway.app
- **Socket**: https://utalk-backend-production.up.railway.app
- **Credenciales**: admin@company.com / 123456

## 📝 Próximos Pasos

1. **Fase 2**: Autenticación y Autorización
2. **Fase 3**: Gestión de Conversaciones
3. **Fase 4**: Chat en Tiempo Real
4. **Fase 5**: Manejo de Errores
5. **Fase 6**: Testing y Validación
6. **Fase 7**: Monitoreo y Métricas

## 🐛 Troubleshooting

### Error de conexión al backend
```bash
# Verificar variables de entorno
echo $VITE_API_URL
echo $VITE_SOCKET_URL

# Verificar que el backend esté funcionando
curl https://utalk-backend-production.up.railway.app/api/health
```

### Error de validación
```bash
# Ejecutar ejemplos de validación
npm run test:validation
```

### Error de Socket.IO
```bash
# Verificar conexión WebSocket
# Abrir DevTools > Network > WS
```

## 📄 Documentación

- **Plan completo**: `PLAN_FRONTEND_UTALK_COMPLETO.md`
- **Información faltante**: `LISTADO_INFORMACION_FALTANTE_BACKEND.md`
- **Ejemplos de uso**: `src/lib/examples/validation-examples.ts`

---

**Nota**: Esta fase base está 100% alineada con el documento `PLAN_FRONTEND_UTALK_COMPLETO.md` y no contiene datos ficticios ni lógica inventada. Todo está basado en las especificaciones reales del backend. 