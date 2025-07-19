# 🚨 **PRUEBA URGENTE - DIAGNÓSTICO INMEDIATO**

## **PASO 1: VERIFICAR CONECTIVIDAD DIRECTA**

Ejecuta esto en la consola del navegador **ANTES** de intentar login:

```javascript
// ✅ TEST 1: Verificar que el backend responde
fetch('https://utalk-backend-production.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({ idToken: 'test-token-fake' })
})
.then(response => {
  console.log('🔍 BACKEND RESPONSE STATUS:', response.status)
  console.log('🔍 BACKEND RESPONSE HEADERS:', [...response.headers.entries()])
  return response.text()
})
.then(text => {
  console.log('🔍 BACKEND RESPONSE TEXT:', text)
  try {
    const json = JSON.parse(text)
    console.log('🔍 BACKEND RESPONSE JSON:', json)
  } catch (e) {
    console.log('🔍 RESPONSE IS NOT JSON')
  }
})
.catch(error => {
  console.error('❌ FETCH ERROR:', error)
  console.error('❌ ERROR TYPE:', typeof error)
  console.error('❌ ERROR CODE:', error.code)
  console.error('❌ ERROR MESSAGE:', error.message)
})
```

## **PASO 2: LIMPIAR EXTENSIONES**

1. Abre una **VENTANA INCÓGNITO** en Chrome
2. Intenta el login desde ahí
3. Si funciona, el problema son las extensiones

## **PASO 3: VERIFICAR NETWORK TAB**

1. Ve a **Network** en DevTools
2. Intenta login
3. Busca requests a `railway.app`
4. **IMPORTANTE:** ¿Ves algún request a tu backend? ¿O solo a Google?

## **PASO 4: VERIFICAR VARIABLES CRÍTICAS**

```javascript
// ✅ Ejecutar en consola
console.group('🔍 VARIABLES CRÍTICAS')
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL)
console.log('Tipo API_URL:', typeof import.meta.env.VITE_API_URL)
console.log('API_URL vacía?:', import.meta.env.VITE_API_URL === '')
console.log('API_URL undefined?:', import.meta.env.VITE_API_URL === undefined)
console.groupEnd()
```

## **PASO 5: SI NO HAY REQUESTS AL BACKEND**

Si no ves requests a Railway en el Network tab, el problema es que:

1. **apiClient no se está inicializando** con la URL correcta
2. **Axios está fallando** antes de enviar
3. **Variables de entorno** no están cargando en runtime

## **RESPONDE CON:**

1. ✅ **Resultado del fetch manual** (PASO 1)
2. ✅ **Funciona en incógnito?** (PASO 2) 
3. ✅ **Qué requests ves en Network?** (PASO 3)
4. ✅ **Valores de las variables** (PASO 4)
5. ✅ **Console logs del login** (errores completos)

---

**NOTA CRÍTICA:** Si el fetch manual funciona pero el frontend no, el problema está en la configuración de Axios o en el flujo de datos, NO en el backend. 