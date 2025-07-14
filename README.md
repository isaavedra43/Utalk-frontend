# 🚀 **UNIK AI - Sistema Omnicanal Fullstack**

## **📋 Descripción**

Sistema de mensajería empresarial omnicanal completamente funcional con backend Node.js/Express y frontend React/Vite. Soporte para WhatsApp (Twilio), Facebook Messenger, Email y Webchat en tiempo real.

## **⚡ Deploy en Railway (Fullstack Monorepo)**

### **1. Clonar y Configurar**

```bash
git clone <tu-repo>
cd Utalk-frontend
```

### **2. Variables de Entorno para Railway**

En Railway, configura estas variables de entorno:

#### **🔧 Backend Core**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-dominio.railway.app

# JWT Secrets (genera tus propios secrets seguros)
JWT_SECRET=tu-super-secret-jwt-key-de-produccion-muy-largo-y-seguro
JWT_REFRESH_SECRET=tu-super-secret-refresh-key-de-produccion-muy-largo-y-seguro
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

#### **📱 Twilio (WhatsApp)**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_twilio_auth_token_real
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_SECRET=tu_webhook_secret_de_twilio
```

#### **🔥 Firebase**
```env
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_COMPLETA\n-----END PRIVATE KEY-----\n"
```

#### **🗄️ Base de Datos**
```env
DATABASE_URL=mongodb://tu-mongo-connection-string
MONGODB_URI=mongodb://tu-mongo-connection-string
```

#### **🔐 Seguridad**
```env
BCRYPT_ROUNDS=12
SESSION_SECRET=tu-session-secret-de-produccion
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **3. Deploy Automático**

Railway detectará automáticamente:
- `package.json` en la raíz
- Build command: `npm run build` (construye frontend React)
- Start command: `npm start` (inicia Express + sirve frontend)

El build process:
1. `npm install` - Instala dependencias
2. `npm run build` - Construye frontend React a `/dist`
3. `npm start` - Inicia Express que sirve `/dist` + APIs

### **4. Verificación Post-Deploy**

```bash
# Health check
curl https://tu-app.railway.app/health

# Frontend (SPA)
curl https://tu-app.railway.app/

# API Backend
curl https://tu-app.railway.app/api/health
```

---

## **🛠️ Desarrollo Local**

### **1. Configuración Inicial**

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de desarrollo
```

### **2. Scripts Disponibles**

```bash
# Desarrollo fullstack (backend + frontend)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend  
npm run dev:frontend

# Build frontend para producción
npm run build

# Iniciar en modo producción
npm start

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
```

### **3. Estructura del Proyecto**

```
Utalk-frontend/
├── client/                 # Frontend React
│   ├── components/        # Componentes UI
│   ├── pages/            # Páginas principales
│   ├── lib/              # API client, auth, config
│   └── hooks/            # React hooks
├── src/                   # Backend Node.js
│   ├── api/              # Rutas de API
│   ├── models/           # Modelos de datos
│   ├── services/         # Servicios externos
│   └── utils/            # Utilidades
├── dist/                 # Build del frontend (generado)
├── server.js             # Punto de entrada
└── package.json          # Config monorepo
```

---

## **🔥 Funcionalidades**

### **Backend**
- ✅ **APIs REST** completas
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Integración Twilio** (WhatsApp)
- ✅ **Rate Limiting** y seguridad
- ✅ **Base de datos** MongoDB/Firestore
- ✅ **Logging** estructurado
- ✅ **Manejo de errores** robusto

### **Frontend**
- ✅ **React + TypeScript** moderno
- ✅ **Rutas protegidas** con autenticación
- ✅ **UI components** con shadcn/ui
- ✅ **Estado global** con React Query
- ✅ **Tiempo real** polling automático
- ✅ **Responsive** design

### **Integración Fullstack**
- ✅ **SPA Fallback** para todas las rutas frontend
- ✅ **CORS** configurado correctamente
- ✅ **Proxy** de desarrollo Vite → Express
- ✅ **Build** automatizado en Railway
- ✅ **Variables de entorno** centralizadas

---

## **🔧 Arquitectura**

### **Flujo de Requests**

```
Railway Domain → Express Server
                      ↓
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
/api/*            /*              Static Files
(Backend)     (SPA Routes)        (CSS, JS, Images)
    ↓                 ↓                 ↓
API Routes     index.html        express.static()
               (React Router)
```

### **Build Process**

```
npm run build
    ↓
vite build (client/ → dist/)
    ↓
Express sirve dist/ + APIs
```

---

## **🚨 Troubleshooting**

### **Error: Frontend no carga**
```bash
# Verificar build
npm run build
ls -la dist/

# Verificar variables
curl https://tu-app.railway.app/health
```

### **Error: CORS**
- Verificar `CORS_ORIGIN` en Railway
- Debe ser `https://tu-dominio.railway.app`

### **Error: 500 en APIs**
- Verificar variables de entorno requeridas
- Revisar logs en Railway dashboard

### **Error: Firebase**
- Verificar format de `FIREBASE_PRIVATE_KEY`
- Escapar newlines: `\n`

---

## **📞 Soporte**

Sistema listo para producción con:
- ⚡ Deploy en 1-click en Railway
- 🔒 Seguridad empresarial
- 📱 Omnicanal (WhatsApp, FB, Email)
- 🎨 UI/UX moderna
- 📊 Dashboard analytics
- 👥 Multi-usuario

**¡Sistema 100% funcional y listo para escalar!** 