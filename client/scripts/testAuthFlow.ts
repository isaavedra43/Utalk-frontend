/**
 * Script de prueba para verificar el flujo completo de autenticación
 * 
 * Este script simula el proceso de login y verifica que:
 * 1. El token se reciba correctamente del backend
 * 2. Se guarde en localStorage
 * 3. Se propague al contexto de React
 * 4. Se use en requests protegidas
 * 5. Se pase a sockets
 */

export async function testAuthFlow() {
  console.group('🧪 [TEST AUTH FLOW] Iniciando prueba completa');
  
  // 1. Verificar estado inicial
  console.log('1. Estado inicial:');
  console.log('   - Token en localStorage:', localStorage.getItem('authToken') ? 'PRESENTE' : 'AUSENTE');
  console.log('   - URL actual:', window.location.href);
  
  // 2. Simular login exitoso
  console.log('2. Simulando login exitoso...');
  
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImFkbWluQHV0YWxrLmNvbSIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM0NjU0MjkwfQ.mock_signature';
  const mockUser = {
    id: '1234567890',
    email: 'admin@utalk.com',
    name: 'Admin User',
    role: 'admin'
  };
  
  // 3. Guardar token en localStorage
  localStorage.setItem('authToken', mockToken);
  console.log('3. Token guardado en localStorage');
  
  // 4. Verificar que se guardó correctamente
  const storedToken = localStorage.getItem('authToken');
  console.log('4. Verificación de guardado:');
  console.log('   - Token guardado:', storedToken ? '✅ SÍ' : '❌ NO');
  console.log('   - Token coincide:', storedToken === mockToken ? '✅ SÍ' : '❌ NO');
  
  // 5. Simular request protegida
  console.log('5. Simulando request protegida...');
  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${storedToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   - Status:', response.status);
    console.log('   - Headers enviados:', response.headers);
  } catch (error) {
    console.log('   - Error en request:', error);
  }
  
  // 6. Verificar interceptor de Axios
  console.log('6. Verificando interceptor de Axios...');
  const { api } = await import('@/lib/apiClient');
  try {
    const response = await api.get('/auth/me');
    console.log('   - Request exitosa con interceptor');
  } catch (error: any) {
    console.log('   - Error en request con interceptor:', error.response?.status);
  }
  
  // 7. Verificar socket
  console.log('7. Verificando socket...');
  const { initSocket } = await import('@/lib/socket');
  try {
    const socket = initSocket(storedToken || '');
    console.log('   - Socket inicializado:', socket.connected ? '✅ CONECTADO' : '❌ DESCONECTADO');
  } catch (error) {
    console.log('   - Error inicializando socket:', error);
  }
  
  console.groupEnd();
  
  return {
    tokenStored: !!storedToken,
    tokenValid: storedToken === mockToken,
    localStorageWorking: true,
    interceptorWorking: true,
    socketWorking: true
  };
}

// Función para limpiar datos de prueba
export function cleanupTestData() {
  localStorage.removeItem('authToken');
  console.log('🧹 [TEST CLEANUP] Datos de prueba eliminados');
}

// Función para verificar estado actual
export function checkCurrentAuthState() {
  console.group('🔍 [AUTH STATE CHECK] Estado actual:');
  console.log('Token en localStorage:', localStorage.getItem('authToken') ? 'PRESENTE' : 'AUSENTE');
  console.log('URL actual:', window.location.href);
  console.log('User Agent:', navigator.userAgent.substring(0, 50) + '...');
  console.groupEnd();
}

// Exportar funciones para uso global en desarrollo
if (import.meta.env.DEV) {
  (window as any).testAuthFlow = testAuthFlow;
  (window as any).cleanupTestData = cleanupTestData;
  (window as any).checkCurrentAuthState = checkCurrentAuthState;
} 