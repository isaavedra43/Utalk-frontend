# 🐛 Guía de Debugging - UTalk Frontend

## 📋 **Checklist de Flujo Completo**

### ✅ **1. Autenticación**
- [x] Login navega automáticamente a la bandeja tras éxito
- [x] Token se guarda y detecta al recargar
- [x] Sesión persiste al recargar la página
- [x] Logout borra el token y navega al login
- [x] Logs críticos aparecen en la consola

### ✅ **2. Navegación**
- [x] RequireAuth protege rutas correctamente
- [x] Redirección automática a login si no autenticado
- [x] Navegación entre módulos con logs detallados
- [x] Estados de carga apropiados

### ✅ **3. Sistema de Logs**
- [x] Logs exhaustivos en todas las fases críticas
- [x] Logs visibles en consola de navegador
- [x] Diferentes niveles de log (INFO, WARN, ERROR, DEBUG)
- [x] Logs específicos por módulo

## 🔍 **Cómo Debuggear**

### **1. Verificar Logs en Consola**
Abre DevTools (F12) → Console y busca estos patrones:

```
[AUTH INFO] Iniciando proceso de login
[AUTH INFO] Token guardado en localStorage exitosamente
[NAVIGATION INFO] Redirigiendo a la bandeja principal
[ROUTER INFO] Navegando a módulo
[MESSAGES INFO] Chat seleccionado
```

### **2. Verificar Estado de Autenticación**
En la consola del navegador:
```javascript
// Mostrar estado actual
debugUtils.showAppState()

// Limpiar datos de autenticación
debugUtils.clearAuthData()

// Verificar token
localStorage.getItem('authToken')
```

### **3. Seguir el Flujo de Login**
1. **Inicio**: `[LOGIN INFO] Componente Login inicializado`
2. **Submit**: `[LOGIN INFO] Iniciando proceso de login desde formulario`
3. **Auth**: `[AUTH INFO] Login exitoso - Guardando datos de sesión`
4. **Redirect**: `[NAVIGATION INFO] Usuario ya autenticado, redirigiendo`
5. **Load**: `[NAVIGATION INFO] Página principal inicializada`

### **4. Variables de Entorno**
Crear `.env.local` con:
```env
VITE_API_URL=http://localhost:3000/api
VITE_DEBUG=true
VITE_ENABLE_DETAILED_LOGS=true
```

## 🚨 **Problemas Comunes y Soluciones**

### **Login no redirige**
**Síntomas**: Usuario queda en página de login tras credenciales correctas
**Solución**:
1. Verificar logs: `[AUTH ERROR]` en consola
2. Verificar respuesta del backend en Network tab
3. Comprobar que `VITE_API_URL` está configurado correctamente

### **Sesión no persiste al recargar**
**Síntomas**: Usuario vuelve a login tras F5
**Solución**:
1. Verificar token en Application → Local Storage
2. Buscar log: `[AUTH INFO] Token encontrado, verificando validez`
3. Si token existe pero falla, backend puede estar retornando 401

### **Logs no aparecen**
**Síntomas**: No se ven logs detallados en consola
**Solución**:
1. Verificar `VITE_DEBUG=true` en .env.local
2. Recargar aplicación completamente
3. Verificar nivel de log en DevTools

### **Error de red en producción**
**Síntomas**: Requests fallan en Vercel
**Solución**:
1. Verificar `VITE_API_URL` en variables de Vercel
2. Comprobar CORS en backend
3. Verificar logs: `[API ERROR]` y `[CRITICAL ERROR]`

## 📊 **Logs por Módulo**

### **AUTH (Autenticación)**
- `Iniciando proceso de login`
- `Token guardado en localStorage exitosamente` 
- `Login exitoso - Guardando datos de sesión`
- `Usuario ya autenticado, redirigiendo`
- `Logout completado - Usuario desconectado`

### **NAVIGATION (Navegación)**
- `RequireAuth inicializado`
- `Acceso autorizado a ruta protegida`
- `Página principal inicializada`
- `Toggle menú móvil`
- `Estado de paneles actualizado`

### **ROUTER (Enrutamiento)**
- `Navegando a módulo`
- `Módulo activo cambiado`
- `Accediendo al módulo de mensajería`
- `Accediendo al dashboard ejecutivo`

### **MESSAGES (Mensajería)**
- `Chat seleccionado`
- `Conversación seleccionada`
- `Mensaje enviado`
- `Mensaje recibido por socket`

### **API (Llamadas de API)**
- `Query retry attempt`
- `Query error`
- `Mutation error`
- `Query cache event`

### **CRITICAL (Errores críticos)**
- `Error no capturado en la aplicación`
- `Promise rechazada no manejada`
- `Elemento root no encontrado en el DOM`

## 🔧 **Utilidades de Debugging**

### **En Desarrollo**
```javascript
// Disponibles globalmente en window
logger.auth('Mensaje de prueba')
logger.navigation('Navegación de prueba')
debugUtils.showAppState()
debugUtils.clearAuthData()
```

### **En Producción**
Solo logs críticos (ERROR) son visibles por defecto.
Para habilitar más logs en producción, usar `showInProduction: true`

## 🚀 **Testing del Flujo Completo**

### **Caso 1: Login Exitoso**
1. Abrir `/login`
2. Insertar credenciales válidas
3. **Esperado**: 
   - Logs de login en consola
   - Redirección automática a `/`
   - Token en localStorage
   - Usuario en bandeja principal

### **Caso 2: Recarga de Página**
1. Estar logueado en `/`
2. Presionar F5
3. **Esperado**:
   - Log: `Token encontrado, verificando validez`
   - No redirección a login
   - Mantenerse en bandeja principal

### **Caso 3: Logout**
1. Estar logueado
2. Ejecutar logout
3. **Esperado**:
   - Log: `Logout completado`
   - Redirección a `/login`
   - Token removido de localStorage

### **Caso 4: Acceso sin Autenticación**
1. Navegar directamente a `/`
2. **Esperado**:
   - Log: `Usuario no autenticado - Redirigiendo a login`
   - Redirección automática a `/login`

## 📱 **Testing en Móvil**

### **Responsive Logs**
- `Dispositivo móvil detectado`
- `Toggle menú móvil`
- `Menú móvil cerrado automáticamente`

### **Navegación Móvil**
- Verificar logs al abrir/cerrar menú
- Comprobar navegación entre módulos
- Validar selección de chats

## 🔗 **Links Útiles**

- DevTools → Application → Local Storage (verificar token)
- DevTools → Network (verificar llamadas API)
- DevTools → Console (todos los logs)
- DevTools → Sources (breakpoints si necesario)

## 📞 **Soporte**

Si encuentras un bug que no puedes resolver:
1. Copiar todos los logs relevantes de la consola
2. Indicar pasos exactos para reproducir
3. Incluir información del entorno (dev/prod, browser, móvil/desktop)
4. Adjuntar screenshot de DevTools si es necesario 