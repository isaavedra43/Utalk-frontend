# 🧪 **PRUEBAS MANUALES DE FETCH - UTalk**

## **📋 OBJETIVO**
Verificar la conectividad directa con el backend sin pasar por Axios ni el frontend.

## **🔍 PRUEBA 1: FETCH DIRECTO AL BACKEND**

Ejecutar en la consola del navegador:

```javascript
// ✅ PRUEBA MANUAL: Fetch directo al endpoint de login
fetch('https://tu-backend.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({ idToken: 'test-token-12345' })
})
.then(response => {
  console.log('🔍 Response Status:', response.status)
  console.log('🔍 Response Headers:', [...response.headers.entries()])
  return response.json()
})
.then(data => {
  console.log('✅ Response Data:', data)
  console.log('🔍 Data Structure:', {
    type: typeof data,
    keys: Object.keys(data),
    hasData: !!data.data,
    hasUser: !!data.user,
    hasToken: !!data.token,
    structure: JSON.stringify(data, null, 2)
  })
})
.catch(error => {
  console.error('❌ Fetch Error:', {
    message: error.message,
    type: error.name,
    stack: error.stack
  })
})
```

## **🔍 PRUEBA 2: VERIFICAR CORS**

```javascript
// ✅ VERIFICAR CORS: Preflight request
fetch('https://tu-backend.railway.app/api/auth/login', {
  method: 'OPTIONS',
  headers: { 
    'Origin': window.location.origin,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
})
.then(response => {
  console.log('🔍 CORS Status:', response.status)
  console.log('🔍 CORS Headers:', [...response.headers.entries()])
})
.catch(error => console.error('❌ CORS Error:', error))
```

## **🔍 PRUEBA 3: HEALTH CHECK**

```javascript
// ✅ HEALTH CHECK: Verificar que el backend responde
fetch('https://tu-backend.railway.app/health', {
  method: 'GET',
  headers: { 'Origin': window.location.origin }
})
.then(response => response.json())
.then(data => {
  console.log('✅ Health Check:', data)
})
.catch(error => console.error('❌ Health Check Error:', error))
```

## **🔍 PRUEBA 4: VERIFICAR VARIABLES EN RUNTIME**

```javascript
// ✅ VERIFICAR VARIABLES: Estado actual del frontend
console.group('🔍 VARIABLES DE ENTORNO')
console.log('API URL:', import.meta.env.VITE_API_URL)
console.log('WS URL:', import.meta.env.VITE_WS_URL)
console.log('Firebase Project:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
console.log('Firebase Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)
console.log('Mode:', import.meta.env.MODE)
console.log('Dev:', import.meta.env.DEV)
console.groupEnd()
```

## **📊 RESULTADOS ESPERADOS**

### **✅ RESULTADO EXITOSO:**
- Status: 400 o 401 (esperado con token inválido)
- Headers CORS presentes
- Respuesta JSON con estructura definida
- No errores de red

### **❌ RESULTADO PROBLEMÁTICO:**
- Status: 0 (error de red)
- CORS errors
- Timeout
- No response

## **🚨 TROUBLESHOOTING**

### **Error de Red:**
- Verificar URL del backend
- Verificar que Railway esté activo
- Verificar conectividad

### **Error CORS:**
- Verificar configuración CORS en backend
- Verificar dominio autorizado

### **Timeout:**
- Verificar que el backend responda
- Verificar logs en Railway 