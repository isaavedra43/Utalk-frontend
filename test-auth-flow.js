// Script de prueba para verificar el flujo de autenticación
// Ejecutar en la consola del navegador después de cargar la app

console.log('🔍 TESTING AUTH FLOW...');

// 1. Verificar localStorage
const token = localStorage.getItem('auth_token');
const userData = localStorage.getItem('user_data');

console.log('📦 localStorage contents:', {
  hasToken: !!token,
  hasUserData: !!userData,
  tokenLength: token?.length || 0,
  userDataLength: userData?.length || 0
});

if (token) {
  console.log('🔑 Token found:', token.substring(0, 20) + '...');
}

if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('👤 User data:', user);
  } catch (e) {
    console.error('❌ Error parsing user data:', e);
  }
}

// 2. Verificar contexto de autenticación (si está disponible)
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('🔧 React DevTools available');
}

// 3. Simular el flujo de restauración
console.log('🔄 Simulating auth restoration...');

// 4. Verificar si hay errores en la consola
console.log('📊 Console errors check - look for auth-related errors above');

// 5. Instrucciones para el usuario
console.log(`
📋 INSTRUCCIONES PARA DIAGNOSTICAR:

1. Abre las DevTools (F12)
2. Ve a la pestaña Console
3. Recarga la página (F5)
4. Busca estos logs en orden:
   - "--- Auth Initialization Start ---"
   - "1. Reading from localStorage"
   - "2. Token and user data found" o "2. No session found"
   - "3. Session validated successfully" o "3. Session validation failed"
   - "--- Auth Initialization End ---"

5. Si ves errores de red, verifica:
   - Que el backend esté corriendo
   - Que VITE_API_URL esté configurado correctamente
   - Que el endpoint /auth/me esté disponible

6. Si no ves logs de autenticación, verifica:
   - Que AuthProvider esté envolviendo la app
   - Que no haya errores de JavaScript que impidan la ejecución
`);

// 6. Función para limpiar y probar desde cero
window.testAuthReset = () => {
  console.log('🧹 Clearing auth data...');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  console.log('✅ Auth data cleared. Reload the page to test fresh login.');
};

// 7. Función para verificar el estado actual
window.checkAuthState = () => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  console.log('🔍 Current auth state:', {
    hasToken: !!token,
    hasUserData: !!userData,
    token: token ? token.substring(0, 20) + '...' : null,
    userData: userData ? JSON.parse(userData) : null
  });
};

console.log('✅ Test script loaded. Use testAuthReset() to clear auth data or checkAuthState() to see current state.'); 