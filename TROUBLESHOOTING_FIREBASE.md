# 🔧 **GUÍA DE TROUBLESHOOTING - FIREBASE UTalk**

## **🎯 PROBLEMAS COMUNES Y SOLUCIONES**

### **1. ERROR: "Firebase configuration missing required environment variables"**

**Causa:** Variables de entorno no configuradas o no disponibles en runtime.

**Solución:**
```bash
# 1. Verificar variables en Vercel
# Dashboard > Project > Settings > Environment Variables

# 2. Verificar variables localmente
# Crear archivo .env en la raíz del proyecto:
VITE_FIREBASE_API_KEY=tu-api-key-real
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_API_URL=https://tu-backend.railway.app/api
VITE_WS_URL=https://tu-backend.railway.app
```

**Diagnóstico:**
```javascript
// En browser console:
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
})
```

---

### **2. ERROR: "Firebase Auth not initialized"**

**Causa:** Firebase se inicializa antes de que las variables estén disponibles.

**Solución:**
- ✅ **IMPLEMENTADO:** Lazy loading en `src/lib/firebase.ts`
- Firebase ahora se inicializa solo cuando se necesita
- Validación en runtime, no en import

**Diagnóstico:**
```javascript
// En browser console:
import { getFirebaseApp } from '@/lib/firebase'
try {
  const app = getFirebaseApp()
  console.log('✅ Firebase initialized:', app.options.projectId)
} catch (error) {
  console.error('❌ Firebase init failed:', error)
}
```

---

### **3. ERROR: "WebSocket connection failed"**

**Causa:** URL incorrecta o protocolo mal configurado.

**Solución:**
```bash
# ❌ INCORRECTO:
VITE_WS_URL=wss://tu-backend.railway.app

# ✅ CORRECTO:
VITE_WS_URL=https://tu-backend.railway.app
```

**Diagnóstico:**
```javascript
// En browser console:
console.log('WebSocket URL:', import.meta.env.VITE_WS_URL)
```

---

### **4. ERROR: "No authentication token available for WebSocket"**

**Causa:** WebSocket intenta conectar antes del login.

**Solución:**
- ✅ **IMPLEMENTADO:** WebSocket solo se conecta después del login exitoso
- Token se pasa explícitamente al conectar

**Diagnóstico:**
```javascript
// En browser console:
console.log('Auth Token:', localStorage.getItem('auth_token'))
```

---

### **5. ERROR: "Backend not receiving requests"**

**Causa:** Variables de entorno incorrectas o caché de build.

**Solución:**
```bash
# 1. Verificar variables en Vercel
# 2. Forzar rebuild completo
# 3. Verificar logs en Railway

# Variables requeridas:
VITE_API_URL=https://tu-backend.railway.app/api
VITE_WS_URL=https://tu-backend.railway.app
```

**Diagnóstico:**
```javascript
// En browser console:
console.log('API URL:', import.meta.env.VITE_API_URL)
console.log('WS URL:', import.meta.env.VITE_WS_URL)
```

---

## **🔍 DIAGNÓSTICO AVANZADO**

### **1. Validación de Variables de Entorno**

```javascript
// Ejecutar en browser console:
import { validateEnvironmentVariables } from '@/lib/envValidator'
const result = validateEnvironmentVariables()
console.log('Validation Result:', result)
```

### **2. Logs de Firebase**

```javascript
// Verificar logs en consola del browser:
// - "✅ Firebase initialized successfully"
// - "✅ Firebase Auth instance available"
// - "✅ WebSocket configuration validated"
```

### **3. Logs de Autenticación**

```javascript
// Verificar logs en consola del browser:
// - "Starting login process..."
// - "Firebase authentication successful"
// - "WebSocket connected after login"
```

---

## **🚨 PROBLEMAS CRÍTICOS**

### **1. Caché de Build en Vercel**

**Síntoma:** Variables correctas pero app no las lee.

**Solución:**
1. Ir a Vercel Dashboard > Project > Settings > General
2. Buscar "Build & Development Settings"
3. Click en "Clear Build Cache"
4. Redeploy

### **2. Variables de Entorno en Producción**

**Síntoma:** Funciona en local pero no en producción.

**Solución:**
1. Verificar variables en Vercel Dashboard
2. Asegurar que estén en "Production" environment
3. Redeploy después de agregar variables

### **3. Dominio no Autorizado en Firebase**

**Síntoma:** Login falla con error de dominio.

**Solución:**
1. Firebase Console > Authentication > Settings > Authorized domains
2. Agregar: `tu-app.vercel.app`
3. Agregar: `localhost` (para desarrollo)

---

## **📋 CHECKLIST DE VERIFICACIÓN**

### **✅ Variables de Entorno**
- [ ] `VITE_FIREBASE_API_KEY` configurada
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` configurada
- [ ] `VITE_FIREBASE_PROJECT_ID` configurada
- [ ] `VITE_FIREBASE_APP_ID` configurada
- [ ] `VITE_API_URL` configurada (termina en /api)
- [ ] `VITE_WS_URL` configurada (usa https://)

### **✅ Firebase Console**
- [ ] Proyecto creado y configurado
- [ ] Authentication habilitado (Email/Password)
- [ ] Dominios autorizados agregados
- [ ] Usuarios creados para testing

### **✅ Backend (Railway)**
- [ ] Backend desplegado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Logs disponibles en Railway Dashboard
- [ ] Endpoints respondiendo correctamente

### **✅ Frontend (Vercel)**
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build exitoso sin errores
- [ ] Dominio configurado correctamente
- [ ] Caché limpiado si es necesario

---

## **🔧 COMANDOS DE DIAGNÓSTICO**

### **1. Verificar Variables en Runtime**
```javascript
// En browser console:
Object.keys(import.meta.env)
  .filter(key => key.startsWith('VITE_'))
  .forEach(key => console.log(key, ':', import.meta.env[key]))
```

### **2. Verificar Firebase Config**
```javascript
// En browser console:
import { getFirebaseApp } from '@/lib/firebase'
const app = getFirebaseApp()
console.log('Firebase Config:', app.options)
```

### **3. Verificar WebSocket**
```javascript
// En browser console:
console.log('WS URL:', import.meta.env.VITE_WS_URL)
console.log('Auth Token:', localStorage.getItem('auth_token'))
```

### **4. Verificar API Client**
```javascript
// En browser console:
import apiClient from '@/services/apiClient'
console.log('API Base URL:', apiClient.defaults.baseURL)
```

---

## **📞 CONTACTO Y SOPORTE**

Si los problemas persisten después de seguir esta guía:

1. **Revisar logs completos** en browser console
2. **Verificar logs de Railway** en backend
3. **Verificar logs de Vercel** en frontend
4. **Comprobar variables** en ambos entornos
5. **Forzar rebuild** en Vercel
6. **Limpiar caché** del browser

**Variables críticas a verificar:**
- Firebase: API Key, Auth Domain, Project ID, App ID
- Backend: API URL, WebSocket URL
- Dominios: Autorizados en Firebase, configurados en Vercel 