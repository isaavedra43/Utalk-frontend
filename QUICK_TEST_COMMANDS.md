# 🚀 **COMANDOS RÁPIDOS - TESTING FRONTEND UTALK**

## 🔧 **SETUP INICIAL**

```bash
# 1. Instalar dependencias (si no está hecho)
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con:
# VITE_API_URL=http://localhost:3000/api

# 3. Iniciar frontend en desarrollo
npm run dev
# Debería abrir en http://localhost:5173
```

## 🧪 **TESTING RÁPIDO DE FUNCIONALIDADES**

### **Test 1: Autenticación Básica**
```bash
# Abrir browser en http://localhost:5173
# 1. Debe redirigir automáticamente a /login
# 2. Usar credenciales: admin@utalk.com / 123456
# 3. Debe redirigir inmediatamente a / tras login exitoso
# 4. Recargar página - debe mantener sesión
```

### **Test 2: API Connectivity**
```javascript
// Abrir consola del browser (F12) y ejecutar:
fetch('http://localhost:3000/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend health:', data))
  .catch(err => console.error('Backend no disponible:', err));

// Verificar token en localStorage:
localStorage.getItem('authToken');
// Debe retornar un JWT token después del login
```

### **Test 3: React Query DevTools**
```javascript
// En consola del browser:
window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.onMount?.();
// Esto debería abrir las devtools de React Query para ver cache
```

### **Test 4: Logs del Sistema**
```javascript
// En consola del browser, verificar logs del sistema:
// Deberías ver logs con prefijos como:
// [AUTH INFO] - [NAVIGATION INFO] - [API INFO]
// Si no ves logs, revisar configuración de logger en utils.ts
```

## 📊 **VERIFICACIÓN POR MÓDULO**

### **Mensajes/Chat**
```bash
# URL: http://localhost:5173/#messages
# Verificar:
# ✅ Lista de conversaciones carga
# ✅ Se puede seleccionar una conversación
# ✅ Se pueden enviar mensajes de prueba
# ✅ Los mensajes aparecen en la interfaz
```

### **Contactos**
```bash
# URL: http://localhost:5173/#contacts
# Verificar:
# ✅ Lista de contactos carga
# ✅ Botón "Nuevo Contacto" abre formulario
# ✅ Se puede crear un contacto de prueba
# ✅ El contacto aparece en la lista
# ✅ Se puede editar/eliminar el contacto
```

### **Dashboard**
```bash
# URL: http://localhost:5173/#dashboard
# Verificar:
# ✅ KPIs muestran números reales
# ✅ Gráficos cargan con datos
# ✅ No hay mensajes de "datos mock"
# ✅ Alertas/notificaciones aparecen
```

### **Campañas**
```bash
# URL: http://localhost:5173/#campaigns
# Verificar:
# ✅ Lista de campañas carga
# ✅ Se puede crear nueva campaña
# ✅ Formulario de campaña tiene validación
# ✅ Se pueden ver estadísticas de campañas
```

### **Knowledge Base**
```bash
# URL: http://localhost:5173/#knowledge
# Verificar:
# ✅ Lista de documentos/FAQs carga
# ✅ Se pueden subir documentos
# ✅ Se pueden crear FAQs
# ✅ Búsqueda funciona
```

### **Equipo**
```bash
# URL: http://localhost:5173/#team
# Verificar:
# ✅ Lista de miembros del equipo carga
# ✅ Se pueden agregar nuevos miembros
# ✅ Roles y permisos funcionan
# ✅ Estados online/offline aparecen
```

## 🛠️ **DEBUGGING COMMANDS**

### **Verificar Estados de React**
```javascript
// En React DevTools:
// 1. Buscar AuthContext en el árbol de componentes
// 2. Verificar state: { user, loading, isAuthenticated }
// 3. Buscar componentes que usan React Query
// 4. Verificar cache de queries en React Query DevTools
```

### **Verificar Network Requests**
```javascript
// En Network tab del browser:
// 1. Filtrar por XHR/Fetch
// 2. Verificar que requests van a localhost:3000/api
// 3. Verificar headers Authorization: Bearer <token>
// 4. Verificar status codes (200, 401, 403, etc.)
```

### **Logs de Sistema Detallados**
```javascript
// Para habilitar logs detallados:
localStorage.setItem('debug', 'true');
// Recargar página y ver logs más detallados en consola
```

## 🔍 **TROUBLESHOOTING COMÚN**

### **Problema: Login no funciona**
```bash
# Verificar:
1. Backend está corriendo en localhost:3000
2. VITE_API_URL está configurado correctamente
3. Credenciales son correctas: admin@utalk.com / 123456
4. Verificar en Network tab si request llega al backend
5. Verificar response del backend en Network tab
```

### **Problema: Datos no cargan**
```bash
# Verificar:
1. Token está en localStorage después del login
2. Requests tienen header Authorization
3. Backend endpoints responden correctamente
4. React Query cache no está corrupto (limpiar con DevTools)
```

### **Problema: Errores de CORS**
```bash
# Si ves errores de CORS:
1. Verificar que backend tiene CORS habilitado
2. Verificar URL del frontend en configuración CORS del backend
3. Puede requerir configuración específica en backend
```

### **Problema: Componentes no renderizan**
```bash
# Verificar:
1. React DevTools para errores en componentes
2. Console para errores de JavaScript
3. Dependencias están instaladas correctamente
4. Imports de componentes son correctos
```

## 📈 **PERFORMANCE TESTING**

### **Verificar Tiempos de Carga**
```javascript
// En consola del browser:
performance.getEntriesByType('navigation')[0].loadEventEnd;
// Debería ser < 3000ms para primera carga

// Para medir tiempo de login:
const start = performance.now();
// ... hacer login ...
const end = performance.now();
console.log(`Login tardó ${end - start} milisegundos`);
```

### **Verificar Memory Leaks**
```javascript
// En Memory tab del DevTools:
// 1. Tomar heap snapshot antes de usar app
// 2. Navegar por todos los módulos
// 3. Tomar heap snapshot después
// 4. Comparar para detectar memory leaks
```

## 🚀 **BUILD Y DEPLOYMENT**

### **Test de Build de Producción**
```bash
# 1. Build para producción
npm run build

# 2. Preview del build
npm run preview
# Verificar que funciona en http://localhost:4173

# 3. Verificar tamaño del build
ls -la dist/
# dist/ no debería ser > 5MB
```

### **Variables para Producción**
```bash
# Para deployment en Vercel/Netlify:
# Configurar estas variables:
VITE_API_URL=https://tu-backend-production.vercel.app/api
VITE_APP_NAME=UTalk
VITE_APP_VERSION=1.0.0
```

## ✅ **CHECKLIST RÁPIDO**

```bash
# Test completo en 5 minutos:
[ ] npm run dev funciona sin errores
[ ] http://localhost:5173 abre correctamente
[ ] Login con admin@utalk.com / 123456 funciona
[ ] Redirige a dashboard después del login
[ ] Al menos 3 módulos cargan datos reales
[ ] No hay errores críticos en consola
[ ] Network tab muestra requests exitosos al backend
[ ] React Query DevTools muestra cache poblado
[ ] Logout funciona y redirige a login
[ ] npm run build ejecuta sin errores
```

## 🆘 **CONTACTO PARA ISSUES**

Si alguno de estos tests falla:

1. **Verificar configuración:** `.env.local`, `package.json`
2. **Revisar logs:** Consola del browser, terminal de desarrollo
3. **Consultar documentación:** `DEBUGGING_GUIDE.md`, `FRONTEND_INTEGRATION_CHECKLIST.md`
4. **Reset de estado:** Limpiar localStorage, cache del browser
5. **Dependencias:** `rm -rf node_modules && npm install`

---

**💡 Tip:** Mantén las DevTools abiertas durante todo el testing para ver logs y network requests en tiempo real. 