# 🚀 UTALK Frontend

> Aplicación de chat en tiempo real para gestión de conversaciones comerciales con WhatsApp

## 📋 Estado del Proyecto

### ✅ Funcionalidades Implementadas
- **Autenticación**: Login con JWT y manejo de sesiones
- **Chat en Tiempo Real**: WebSocket con mensajes instantáneos
- **Gestión de Conversaciones**: Lista, filtros y búsqueda
- **Mensajes Multimedia**: Texto, imágenes, documentos, audio, video
- **Estados de Mensajes**: Enviando, enviado, entregado, leído, fallido
- **Indicadores de Escritura**: En tiempo real
- **Optimistic Updates**: UX mejorada
- **Reconexión Automática**: WebSocket resiliente
- **Subida de Archivos**: Drag & drop con validación

### 🔄 En Desarrollo
- Dashboard de métricas
- Gestión de equipo
- Módulo de notificaciones
- Panel de clientes

## 🛠️ Tecnologías

- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (estilos)
- **Socket.IO** (WebSocket)
- **React Query** + **Zustand** (estado)
- **Firebase** (autenticación)

## 🚀 Inicio Rápido

### 1. Instalación
```bash
git clone <repository-url>
cd Utalk-frontend
npm install
```

### 2. Configuración
Crear `.env.local`:
```env
# Backend
VITE_BACKEND_URL=https://utalk-backend-production.up.railway.app
VITE_API_URL=https://utalk-backend-production.up.railway.app
VITE_WS_URL=wss://utalk-backend-production.up.railway.app

# Firebase (reemplazar con credenciales reales)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Desarrollo
VITE_DEBUG=false
VITE_DEV_MODE=false
VITE_MOCK_MODE=false
```

### 3. Desarrollo
```bash
npm run dev
```

### 4. Producción
```bash
npm run build
npm run preview
```

## 🏗️ Arquitectura

```
src/
├── components/          # Componentes reutilizables
│   ├── chat/           # Componentes de chat
│   ├── layout/         # Layout y navegación
│   └── ui/             # UI básicos
├── contexts/           # Providers de contexto
├── hooks/              # Custom hooks
├── modules/            # Módulos de la aplicación
│   ├── auth/
│   ├── clients/
│   ├── dashboard/
│   ├── notifications/
│   └── team/
├── services/           # Servicios de API
├── stores/             # Estado global (Zustand)
├── types/              # Tipos TypeScript
└── utils/              # Utilidades
```

## 🔌 APIs Requeridas

### REST Endpoints
- `POST /api/auth/login` - Autenticación
- `GET /api/conversations` - Listar conversaciones
- `GET /api/conversations/:id` - Obtener conversación
- `POST /api/conversations/:id/messages` - Enviar mensaje
- `GET /api/messages` - Obtener mensajes

### WebSocket Events
- `new-message` - Nuevo mensaje
- `message-sent` - Confirmación de envío
- `typing` / `typing-stop` - Indicadores de escritura
- `conversation-update` - Actualización de conversación

## 📝 Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
npm run lint:fix     # Fix automático de lint
npm run type-check   # Verificación TypeScript
npm run format       # Formateo con Prettier
```

## 🚧 Troubleshooting

### WebSocket no conecta
- Verificar `VITE_WS_URL` en variables de entorno
- Verificar que el backend esté ejecutándose
- Verificar token de autenticación en localStorage

### APIs no funcionan
- Verificar `VITE_BACKEND_URL` en variables de entorno
- Verificar conectividad con el backend
- Revisar console de browser para errores de CORS

### Mensajes no se envían
- Verificar conexión WebSocket en DevTools
- Verificar permisos de usuario
- Revisar formato de mensaje en Network tab

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.