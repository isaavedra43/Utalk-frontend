# 🚀 UTALK Frontend

Aplicación de chat y customer service construida con React, TypeScript y Vite.

## 🛠️ Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Radix UI** (Componentes)
- **Zustand** (State Management)
- **TanStack Query** (Data Fetching)
- **Socket.IO Client** (WebSocket)
- **React Hook Form** + **Zod** (Formularios)
- **Framer Motion** (Animaciones)
- **Lucide React** (Iconos)

## 🚀 Despliegue en Vercel

### 1. Variables de Entorno Requeridas

Configura las siguientes variables de entorno en tu proyecto de Vercel:

```bash
# Backend API Configuration
VITE_API_URL=https://tu-backend.railway.app
VITE_WS_URL=https://tu-backend.railway.app

# Firebase Configuration
VITE_FIREBASE_API_KEY=tu-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Environment Configuration
VITE_NODE_ENV=production
VITE_DEBUG=false
VITE_APP_NAME=UTALK
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_MODE=false
VITE_MOCK_MODE=false
```

### 2. Configuración en Vercel Dashboard

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Navega a **Settings** > **Environment Variables**
3. Agrega cada variable de entorno con su valor correspondiente
4. Asegúrate de que estén configuradas para **Production**, **Preview** y **Development**

### 3. Despliegue Automático

El proyecto está configurado para despliegue automático en Vercel:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🏃‍♂️ Desarrollo Local

### Instalación

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd Utalk-frontend-1

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
# Editar .env.local con tus valores de desarrollo
```

### Scripts Disponibles

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatear código
npm run format

# Preview de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── ui/          # Componentes base (Radix UI)
│   ├── chat/        # Componentes de chat
│   ├── layout/      # Componentes de layout
│   └── common/      # Componentes comunes
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
├── services/        # API & Socket services
├── types/           # TypeScript types
├── utils/           # Helper functions
├── config/          # Configuración (Firebase, etc.)
└── styles/          # Estilos globales
```

## 🔧 Configuración

### Firebase

El proyecto incluye configuración de Firebase para autenticación y almacenamiento. Asegúrate de tener configuradas todas las variables de Firebase en Vercel.

### API Backend

La aplicación se conecta a un backend API. Configura las URLs en las variables de entorno:

- `VITE_API_URL`: URL del backend para peticiones HTTP
- `VITE_WS_URL`: URL del backend para WebSocket

## 🚀 Próximos Pasos

1. **FASE 2**: Componentes de Layout
2. **FASE 3**: Lista de Conversaciones
3. **FASE 4**: Área de Chat
4. **FASE 5**: Sidebar Derecho
5. **FASE 6**: Estado Global y Hooks
6. **FASE 7**: Integración de Servicios
7. **FASE 8**: Funcionalidades Avanzadas
8. **FASE 9**: Optimizaciones
9. **FASE 10**: Testing y Deploy

## 📞 Soporte

Para soporte técnico o preguntas sobre la integración:
- Email: soporte@utalk.com
- Documentación: https://docs.utalk.com

---

**¡Feliz desarrollo! 🚀**
