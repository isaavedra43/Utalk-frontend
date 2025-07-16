# 🚀 CONFIGURACIÓN DE VERCEL - UTalk Frontend

## Variables de Entorno REQUERIDAS

Configurar estas variables en **Vercel Dashboard → Settings → Environment Variables**:

### 🔗 Backend Configuration (CRÍTICO)
```bash
VITE_API_URL=https://tu-backend-railway.up.railway.app/api
VITE_SOCKET_URL=https://tu-backend-railway.up.railway.app
VITE_ENV=production
```

### 🔐 Firebase Authentication (Opcional)
```bash
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 🐛 Debug (Solo para troubleshooting)
```bash
VITE_DEBUG=true
```

## 📝 Pasos para Configurar

1. **Ir a Vercel Dashboard**
   - https://vercel.com/dashboard
   - Seleccionar proyecto UTalk Frontend

2. **Settings → Environment Variables**
   - Agregar cada variable una por una
   - Asegurarse de seleccionar `Production`, `Preview`, y `Development`

3. **Redeploy**
   - Ir a Deployments
   - Click en "..." → Redeploy
   - ✅ Verificar que las variables aparezcan en build logs

## 🔍 Verificación

### Logs a verificar en Vercel Build:
```
✅ 🔌 Inicializando Socket.IO con URL: https://tu-backend-railway.up.railway.app
✅ 📡 VITE_API_URL configurada correctamente
✅ Build completado sin errores de entorno
```

### Logs a verificar en Browser Console:
```
✅ 🔐 Verificando token de autenticación...
✅ ✅ Socket conectado exitosamente: ABC123
✅ 🔗 ChatView: Uniéndose a conversación: conv_123
✅ 📩 Nuevo mensaje recibido por socket: {...}
```

## ❌ Troubleshooting

### Error: "Socket connection error"
- ✅ Verificar VITE_SOCKET_URL apunta a Railway
- ✅ Verificar CORS configurado en Railway backend
- ✅ Verificar WebSocket habilitado en Railway

### Error: "Failed to fetch conversations"
- ✅ Verificar VITE_API_URL incluye `/api`
- ✅ Verificar backend Railway acepta requests desde Vercel domain
- ✅ Verificar JWT tokens válidos

### Error: "No messages appearing"
- ✅ Verificar `join-conversation` events en Browser DevTools → Network → WS
- ✅ Verificar Store Zustand se actualiza en React DevTools
- ✅ Verificar componentes usan store, no mock data

## 🔧 Commands para Debug Local

```bash
# Crear .env local
cp .env.example .env

# Editar con URLs reales
vim .env

# Test local
npm run build
npm run preview

# Verificar variables
echo $VITE_API_URL
```

---

⚠️ **IMPORTANTE**: Después de configurar variables en Vercel, hacer **REDEPLOY COMPLETO** para que tomen efecto. 