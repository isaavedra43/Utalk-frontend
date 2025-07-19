// 🧪 PRUEBA MANUAL PARA VALIDAR LOGIN - UTalk Frontend
// Ejecutar en la consola del navegador para diagnosticar problemas

console.group('🔍 DIAGNÓSTICO COMPLETO DE LOGIN')

// 1. Verificar variables de entorno
console.log('📊 Variables de entorno:')
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('VITE_FIREBASE_PROJECT_ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID)
console.log('VITE_FIREBASE_AUTH_DOMAIN:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)

// 2. Calcular URL final que usará el frontend
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const baseURL = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`
const loginEndpoint = `${baseURL}/auth/login`

console.log('🎯 URL final del login:', loginEndpoint)

// 3. Prueba de conectividad básica
console.log('🔄 Probando conectividad...')

fetch(loginEndpoint, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({ idToken: 'test-fake-token-12345' })
})
.then(response => {
  console.log('✅ Respuesta recibida:')
  console.log('Status:', response.status)
  console.log('StatusText:', response.statusText)
  console.log('Headers:', [...response.headers.entries()])
  
  return response.text()
})
.then(text => {
  console.log('📄 Respuesta como texto:', text)
  
  try {
    const json = JSON.parse(text)
    console.log('📊 Respuesta como JSON:', json)
    console.log('¿Tiene user?:', !!json.user)
    console.log('¿Tiene token?:', !!json.token)
    console.log('Estructura:', Object.keys(json))
  } catch (e) {
    console.log('❌ No es JSON válido')
  }
})
.catch(error => {
  console.error('❌ Error en la petición:')
  console.error('Tipo:', typeof error)
  console.error('Nombre:', error.name)
  console.error('Mensaje:', error.message)
  console.error('Código:', error.code)
  console.error('Stack:', error.stack?.substring(0, 200))
})
.finally(() => {
  console.groupEnd()
  console.log('🏁 Diagnóstico completado. Revisa los resultados arriba.')
})

// 4. Información adicional del navegador
console.group('🌐 Información del navegador')
console.log('Online:', navigator.onLine)
console.log('UserAgent:', navigator.userAgent.substring(0, 100))
console.log('Location:', window.location.href)
console.groupEnd() 