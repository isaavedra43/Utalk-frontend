# 🔄 SOLUCIÓN: Desconexión al Hacer Refresh

## 📋 **PROBLEMA IDENTIFICADO**

### **Síntomas**:
- ✅ **Al entrar normalmente**: Funciona perfecto
- ❌ **Al hacer refresh**: Se desconecta y no reconecta
- ❌ **WebSocket**: Intenta reconectar 5 veces y falla
- ❌ **Autenticación**: Se pierde al refresh

### **Evidencia en los logs**:
```javascript
🔌 Ya hay una conexión en progreso, saltando...     // ❌ CONFLICTO DE CONEXIONES
🔄 Intento de reconexión 3/5 en 4000ms             // ❌ RECONEXIÓN FALLIDA
🔄 Intento de reconexión 4/5 en 8000ms             // ❌ RECONEXIÓN FALLIDA
```

## 🔍 **ANÁLISIS DEL PROBLEMA**

### **Flujo problemático**:
1. **Al hacer refresh**: El `useAuth` hook intenta validar el token con `/api/auth/profile`
2. **La validación falla**: El backend devuelve 401 o error
3. **Se limpia la autenticación**: `clearAuth()` se ejecuta inmediatamente
4. **WebSocket se desconecta**: Pero intenta reconectar sin token válido
5. **Ciclo infinito**: Reconexión fallida → intentar de nuevo

### **Problema principal**:
- **No se intenta refresh del token** antes de limpiar la autenticación
- **WebSocket intenta reconectar** sin token válido
- **No hay manejo de reconexión** después de refresh exitoso

## 🔧 **SOLUCIÓN IMPLEMENTADA**

### **1. Mejorar validación inicial de tokens**:
```javascript
// ANTES: Solo validar y limpiar si falla
const validatedUser = await authStore.validateToken(accessToken);
if (validatedUser) {
  // Token válido
} else {
  // Limpiar inmediatamente ❌
  authStore.clearAuth();
}

// DESPUÉS: Intentar refresh antes de limpiar
const validatedUser = await authStore.validateToken(accessToken);
if (validatedUser) {
  // Token válido ✅
} else {
  // Intentar refresh antes de limpiar ✅
  try {
    const refreshResponse = await api.post('/api/auth/refresh', { 
      refreshToken: refreshToken 
    });
    
    if (refreshResponse.data.accessToken) {
      // Actualizar tokens y validar nuevo token
      localStorage.setItem('access_token', refreshResponse.data.accessToken);
      const newValidatedUser = await authStore.validateToken(refreshResponse.data.accessToken);
      
      if (newValidatedUser) {
        // Restaurar autenticación ✅
        authStore.setBackendUser(newValidatedUser);
        authStore.setUser({ ... });
        
        // Disparar evento para reconectar WebSocket ✅
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
          detail: { accessToken: refreshResponse.data.accessToken }
        }));
        return;
      }
    }
  } catch (refreshError) {
    // Refresh falló, continuar con limpieza
  }
  
  // Solo limpiar si todo falló
  authStore.clearAuth();
}
```

### **2. Eventos para reconexión automática**:
```javascript
// Evento disparado cuando el token se refresca exitosamente
window.dispatchEvent(new CustomEvent('auth:token-refreshed', {
  detail: { accessToken: refreshResponse.data.accessToken }
}));

// Listener en useAuth para reconectar WebSocket
useEffect(() => {
  const handleTokenRefreshed = (e: Event) => {
    const detail = (e as CustomEvent).detail as { accessToken: string } | undefined;
    const accessToken = detail?.accessToken;
    
    if (accessToken && connectSocket && !isConnected) {
      infoLog('🔐 useAuth - Token refrescado, reconectando WebSocket...');
      connectSocket(accessToken);
    }
  };

  window.addEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
  
  return () => {
    window.removeEventListener('auth:token-refreshed', handleTokenRefreshed as EventListener);
  };
}, [connectSocket, isConnected]);
```

## 🎯 **MEJORAS IMPLEMENTADAS**

### **1. Validación robusta de tokens**:
- ✅ **Verificar tokens corruptos** antes de validar
- ✅ **Intentar refresh automático** si la validación falla
- ✅ **Solo limpiar autenticación** si todo falla

### **2. Reconexión automática de WebSocket**:
- ✅ **Evento de token refrescado** para notificar al WebSocket
- ✅ **Reconexión automática** cuando el token se renueva
- ✅ **Manejo de errores** mejorado

### **3. Manejo de errores mejorado**:
- ✅ **Logs detallados** para debugging
- ✅ **Fallback graceful** si el refresh falla
- ✅ **Prevención de ciclos infinitos**

## 📊 **FLUJO CORREGIDO**

### **Al hacer refresh**:
1. ✅ **Verificar tokens** en localStorage
2. ✅ **Validar token actual** con backend
3. ✅ **Si válido**: Restaurar autenticación
4. ✅ **Si inválido**: Intentar refresh automático
5. ✅ **Si refresh exitoso**: Actualizar tokens y reconectar WebSocket
6. ✅ **Si todo falla**: Limpiar autenticación y redirigir al login

## 🔧 **ARCHIVOS MODIFICADOS**

### **`src/hooks/useAuth.ts`**:
- ✅ **Agregado intento de refresh** antes de limpiar autenticación
- ✅ **Evento de token refrescado** para reconexión automática
- ✅ **Importación de API** para llamadas de refresh

## 🎯 **RESULTADO ESPERADO**

- ✅ **Refresh de página**: Mantiene la conexión
- ✅ **WebSocket**: Se reconecta automáticamente
- ✅ **Autenticación**: Se restaura sin problemas
- ✅ **Experiencia de usuario**: Sin interrupciones

**Próximo paso**: Probar haciendo refresh en la página para verificar que la solución funciona correctamente.
