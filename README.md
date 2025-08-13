# 🚀 UTALK Frontend - Chat en Tiempo Real

Frontend completo para UTALK con funcionalidad de chat en tiempo real, WebSocket, y gestión de conversaciones.

## ✨ Características

- ✅ **Chat en Tiempo Real** con WebSocket
- ✅ **Mensajes Multimedia** (texto, imágenes, documentos, audio, video, ubicación, stickers)
- ✅ **Indicadores de Escritura** en tiempo real
- ✅ **Estados de Mensajes** (enviando, enviado, entregado, leído, fallido)
- ✅ **Optimistic Updates** para mejor UX
- ✅ **Reconexión Automática** de WebSocket
- ✅ **Gestión de Conversaciones** con filtros y búsqueda
- ✅ **Subida de Archivos** con validación
- ✅ **Autenticación** con JWT
- ✅ **Responsive Design** con Tailwind CSS

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd Utalk-frontend-1
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Configuración del Backend Real
VITE_BACKEND_URL=https://tu-backend.railway.app
VITE_API_URL=https://tu-backend.railway.app
VITE_WS_URL=https://tu-backend.railway.app

# Configuración de Desarrollo
VITE_DEV_MODE=true
VITE_MOCK_MODE=false
VITE_DEBUG=true

# Firebase Configuration (configurar con valores reales)
VITE_FIREBASE_API_KEY=tu_firebase_api_key_real
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Environment Configuration
VITE_NODE_ENV=development
VITE_APP_NAME=UTALK
VITE_APP_VERSION=1.0.0
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

## 🔧 Configuración del Backend

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | URL del backend para APIs REST | `https://tu-backend.railway.app` |
| `VITE_API_URL` | URL del backend para APIs REST | `https://tu-backend.railway.app` |
| `VITE_WS_URL` | URL del backend para WebSocket | `https://tu-backend.railway.app` |
| `VITE_MOCK_MODE` | Habilitar modo mock (false para backend real) | `false` |

### Backend Requerido

El frontend requiere un backend con las siguientes APIs:

#### APIs REST
- `POST /api/auth/login` - Autenticación
- `POST /api/auth/refresh` - Refresh token
- `GET /api/conversations` - Listar conversaciones
- `GET /api/conversations/:id` - Obtener conversación
- `POST /api/conversations/:id/messages` - Enviar mensaje
- `GET /api/messages` - Obtener mensajes
- `PUT /api/conversations/:id/messages/:messageId/read` - Marcar como leído

#### WebSocket Events
- `new-message` - Nuevo mensaje recibido
- `message-sent` - Confirmación de envío
- `message-delivered` - Confirmación de entrega
- `message-read` - Confirmación de lectura
- `typing` - Usuario escribiendo
- `typing-stop` - Usuario dejó de escribir
- `conversation-update` - Actualización de conversación

## 🎯 Funcionalidades Implementadas

### Chat en Tiempo Real
- ✅ WebSocket con reconexión automática
- ✅ Optimistic updates para mensajes
- ✅ Indicadores de escritura
- ✅ Estados de mensajes (enviando, enviado, entregado, leído, fallido)
- ✅ Reintentar mensajes fallidos
- ✅ Cancelar mensajes en envío

### Mensajes Multimedia
- ✅ Texto
- ✅ Imágenes con preview
- ✅ Documentos con iconos y descarga
- ✅ Audio con reproductor
- ✅ Video con reproductor nativo
- ✅ Ubicación con Google Maps
- ✅ Stickers

### Gestión de Conversaciones
- ✅ Lista de conversaciones con paginación
- ✅ Filtros por estado, prioridad, asignación
- ✅ Búsqueda de conversaciones
- ✅ Estadísticas en tiempo real
- ✅ Marcado automático de leídos

### Subida de Archivos
- ✅ Drag & drop
- ✅ Múltiples archivos
- ✅ Validación de tipos y tamaños
- ✅ Progreso de subida
- ✅ Previsualización antes de enviar

## 🏗️ Arquitectura

### Estructura de Carpetas
```
src/
├── components/
│   ├── chat/           # Componentes de chat
│   ├── layout/         # Layout principal
│   └── ui/             # Componentes UI reutilizables
├── contexts/           # Context providers
├── hooks/              # Custom hooks
├── services/           # Servicios de API
├── stores/             # Estado global
├── types/              # Tipos TypeScript
└── utils/              # Utilidades
```

### Tecnologías Utilizadas
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **Tailwind CSS** para estilos
- **Socket.IO Client** para WebSocket
- **Axios** para APIs REST
- **React Query** para cache y estado
- **Zustand** para estado global

## 🔄 WebSocket Integration

### Conexión Automática
El WebSocket se conecta automáticamente cuando:
1. El usuario está autenticado
2. Hay un token válido en localStorage
3. La aplicación está activa

### Reconexión
- Reconexión automática en caso de desconexión
- Backoff exponencial para reintentos
- Máximo 10 intentos de reconexión

### Eventos Soportados
```typescript
// Enviar mensaje
socket.emit('new-message', { conversationId, content, type, metadata });

// Indicar escritura
socket.emit('typing', { conversationId });

// Marcar como leído
socket.emit('message-read', { conversationId, messageIds });
```

## 🚀 Deployment

### Build para Producción
```bash
npm run build
```

### Variables de Entorno para Producción
```bash
VITE_BACKEND_URL=https://tu-backend-produccion.railway.app
VITE_API_URL=https://tu-backend-produccion.railway.app
VITE_WS_URL=https://tu-backend-produccion.railway.app
VITE_MOCK_MODE=false
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **WebSocket no conecta**
   - Verificar `VITE_WS_URL` en variables de entorno
   - Verificar que el backend esté ejecutándose
   - Verificar token de autenticación

2. **APIs no funcionan**
   - Verificar `VITE_BACKEND_URL` en variables de entorno
   - Verificar que el backend esté ejecutándose
   - Verificar token de autenticación

3. **Mensajes no se envían**
   - Verificar conexión WebSocket
   - Verificar permisos de usuario
   - Verificar formato de mensaje

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting
npm run type-check   # Verificación de tipos
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico, contactar al equipo de desarrollo o crear un issue en el repositorio.
