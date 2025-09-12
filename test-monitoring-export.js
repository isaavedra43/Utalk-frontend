// Script para probar la exportación del módulo de monitoreo
// Ejecutar en la consola del navegador (F12)

console.log('🧪 TESTING MONITORING EXPORT');
console.log('============================');

// Función para generar datos de prueba
function generateTestData() {
  console.log('📊 Generando datos de prueba...');
  
  // Simular datos de APIs
  const testAPIs = [
    {
      timestamp: Date.now() - 1000,
      method: 'GET',
      url: '/api/test',
      status: 200,
      duration: 150,
      error: null,
      requestHeaders: { 'Content-Type': 'application/json' },
      responseHeaders: { 'Content-Type': 'application/json' },
      requestData: { test: 'data' },
      responseData: { success: true, data: 'test response' }
    },
    {
      timestamp: Date.now() - 2000,
      method: 'POST',
      url: '/api/chat/send',
      status: 500,
      duration: 3000,
      error: 'Internal Server Error',
      requestHeaders: { 'Content-Type': 'application/json' },
      responseHeaders: {},
      requestData: { message: 'test message' },
      responseData: { error: 'Server error' }
    }
  ];

  // Simular datos de WebSockets
  const testWebSockets = [
    {
      timestamp: Date.now() - 500,
      type: 'connect',
      event: 'connection',
      socketId: 'socket_123',
      url: 'ws://localhost:3000',
      data: { connected: true },
      error: null
    },
    {
      timestamp: Date.now() - 1500,
      type: 'message',
      event: 'chat_message',
      socketId: 'socket_123',
      url: 'ws://localhost:3000',
      data: { message: 'Hello world' },
      error: null
    }
  ];

  // Simular logs
  const testLogs = [
    {
      timestamp: Date.now() - 300,
      level: 'info',
      category: 'api',
      message: 'API request completed successfully',
      source: 'ApiService',
      data: { endpoint: '/api/test' },
      stack: null
    },
    {
      timestamp: Date.now() - 800,
      level: 'error',
      category: 'websocket',
      message: 'WebSocket connection failed',
      source: 'WebSocketService',
      data: { url: 'ws://localhost:3000' },
      stack: 'Error: Connection refused\n    at WebSocket.connect'
    }
  ];

  // Simular errores
  const testErrors = [
    {
      timestamp: Date.now() - 400,
      name: 'TypeError',
      message: 'Cannot read property of undefined',
      source: 'ChatComponent',
      url: 'http://localhost:5173/chat',
      stack: 'TypeError: Cannot read property of undefined\n    at ChatComponent.render',
      componentStack: 'ChatComponent\n  at div\n  at MainLayout',
      userAgent: navigator.userAgent
    }
  ];

  return {
    apis: testAPIs,
    websockets: testWebSockets,
    logs: testLogs,
    errors: testErrors,
    performance: [],
    states: [],
    validations: []
  };
}

// Función para inyectar datos de prueba en el contexto de monitoreo
function injectTestData() {
  console.log('💉 Inyectando datos de prueba...');
  
  const testData = generateTestData();
  
  // Buscar el contexto de monitoreo en el DOM
  const monitoringContext = window.monitoringContext;
  
  if (monitoringContext) {
    // Agregar datos de prueba
    testData.apis.forEach(api => monitoringContext.addAPI(api));
    testData.websockets.forEach(ws => monitoringContext.addWebSocket(ws));
    testData.logs.forEach(log => monitoringContext.addLog(log));
    testData.errors.forEach(error => monitoringContext.addError(error));
    
    console.log('✅ Datos de prueba inyectados exitosamente');
    console.log('📊 Resumen:', {
      apis: testData.apis.length,
      websockets: testData.websockets.length,
      logs: testData.logs.length,
      errors: testData.errors.length
    });
  } else {
    console.warn('⚠️ No se encontró el contexto de monitoreo');
    console.log('💡 Asegúrate de que el módulo de monitoreo esté activo');
  }
}

// Función para probar la exportación
function testExport() {
  console.log('🧪 Probando exportación...');
  
  // Simular clic en el botón de exportación
  const exportButton = document.querySelector('[data-testid="export-button"]') || 
                      document.querySelector('button[class*="export"]');
  
  if (exportButton) {
    exportButton.click();
    console.log('✅ Modal de exportación abierto');
  } else {
    console.warn('⚠️ No se encontró el botón de exportación');
    console.log('💡 Busca la burbuja de monitoreo y haz clic en el botón de descarga');
  }
}

// Función para verificar el estado del monitoreo
function checkMonitoringStatus() {
  console.log('🔍 Verificando estado del monitoreo...');
  
  const bubble = document.querySelector('[class*="monitoring-bubble"]');
  const isVisible = bubble && bubble.style.display !== 'none';
  
  console.log('📊 Estado del monitoreo:', {
    bubbleVisible: isVisible,
    bubbleElement: bubble ? 'Encontrado' : 'No encontrado',
    localStorage: localStorage.getItem('utalk_monitoring_enabled'),
    isDev: import.meta?.env?.DEV
  });
  
  if (!isVisible) {
    console.log('💡 Para activar el monitoreo, ejecuta:');
    console.log('   localStorage.setItem("utalk_monitoring_enabled", "true");');
    console.log('   window.location.reload();');
  }
}

// Función principal de prueba
function runMonitoringTest() {
  console.log('🚀 Iniciando prueba completa del monitoreo...');
  
  checkMonitoringStatus();
  
  setTimeout(() => {
    injectTestData();
    
    setTimeout(() => {
      testExport();
    }, 1000);
  }, 500);
}

// Exportar funciones para uso manual
window.testMonitoringExport = {
  generateTestData,
  injectTestData,
  testExport,
  checkMonitoringStatus,
  runMonitoringTest
};

console.log('🎯 Funciones disponibles:');
console.log('   testMonitoringExport.runMonitoringTest() - Ejecutar prueba completa');
console.log('   testMonitoringExport.injectTestData() - Inyectar datos de prueba');
console.log('   testMonitoringExport.checkMonitoringStatus() - Verificar estado');
console.log('   testMonitoringExport.testExport() - Probar exportación');

// Ejecutar verificación automática
checkMonitoringStatus();
