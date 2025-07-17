/**
 * 🔧 Script de verificación de métodos HTTP para sincronización con backend
 * 
 * Este script prueba qué métodos HTTP acepta el backend para los endpoints
 * críticos de asignación y marcado como leído.
 */

import { apiClient } from '@/lib/apiClient';

interface MethodTestResult {
  endpoint: string;
  method: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Probar método HTTP específico para un endpoint
 */
async function testHttpMethod(
  endpoint: string, 
  method: 'POST' | 'PUT' | 'PATCH',
  testData: any
): Promise<MethodTestResult> {
  try {
    console.log(`🔧 Probando ${method} ${endpoint}...`);

    let response;
    switch (method) {
      case 'POST':
        response = await apiClient.post(endpoint, testData);
        break;
      case 'PUT':
        response = await apiClient.put(endpoint, testData);
        break;
      case 'PATCH':
        response = await apiClient.patch(endpoint, testData);
        break;
    }

    return {
      endpoint,
      method,
      success: true,
      statusCode: response.status || 200
    };
  } catch (error: any) {
    const statusCode = error.response?.status;
    const isMethodNotAllowed = statusCode === 405;
    
    return {
      endpoint,
      method,
      success: false,
      statusCode,
      error: isMethodNotAllowed ? 'Method Not Allowed' : error.message
    };
  }
}

/**
 * Verificar métodos HTTP para endpoints críticos
 */
export async function verifyHttpMethods(): Promise<{
  assign: MethodTestResult[];
  markRead: MethodTestResult[];
  recommendations: {
    assign: string;
    markRead: string;
  };
}> {
  console.log('🔧 Iniciando verificación de métodos HTTP...');

  // IDs de prueba (usar IDs que probablemente existan o que el backend maneje graciosamente)
  const TEST_CONVERSATION_ID = 'test-conversation-id';
  const TEST_AGENT_ID = 'test-agent-id';

  // 1. Probar endpoints de asignación
  console.log('\n📋 Probando endpoints de asignación...');
  const assignTests = await Promise.all([
    testHttpMethod(
      `/conversations/${TEST_CONVERSATION_ID}/assign`,
      'POST',
      { agentId: TEST_AGENT_ID }
    ),
    testHttpMethod(
      `/conversations/${TEST_CONVERSATION_ID}/assign`,
      'PUT',
      { agentId: TEST_AGENT_ID }
    ),
    testHttpMethod(
      `/conversations/${TEST_CONVERSATION_ID}/assign`,
      'PATCH',
      { agentId: TEST_AGENT_ID }
    )
  ]);

  // 2. Probar endpoints de mark-read
  console.log('\n👁️ Probando endpoints de mark-read...');
  const markReadTests = await Promise.all([
    testHttpMethod(
      `/conversations/${TEST_CONVERSATION_ID}/mark-read`,
      'POST',
      {}
    ),
    testHttpMethod(
      `/conversations/${TEST_CONVERSATION_ID}/mark-read`,
      'PUT',
      {}
    ),
    testHttpMethod(
      `/conversations/${TEST_CONVERSATION_ID}/mark-read`,
      'PATCH',
      {}
    )
  ]);

  // 3. Analizar resultados y hacer recomendaciones
  const getRecommendedMethod = (tests: MethodTestResult[]): string => {
    // Priorizar éxito, luego por convención REST
    const successful = tests.filter(t => t.success);
    if (successful.length > 0) {
      // Si PUT funciona, preferirlo para operaciones idempotentes
      const putTest = successful.find(t => t.method === 'PUT');
      if (putTest) return 'PUT';
      
      // Si no, usar el primer que funcione
      return successful[0].method;
    }

    // Si ninguno funciona, verificar si es 405 (Method Not Allowed)
    const methodNotAllowed = tests.filter(t => t.statusCode === 405);
    if (methodNotAllowed.length > 0) {
      // Si algunos dan 405, el que NO dé 405 es el correcto
      const allowedMethods = tests.filter(t => t.statusCode !== 405);
      if (allowedMethods.length > 0) {
        return allowedMethods[0].method;
      }
    }

    // Fallback a convención REST
    return 'PUT'; // Para operaciones de actualización/asignación
  };

  const recommendations = {
    assign: getRecommendedMethod(assignTests),
    markRead: getRecommendedMethod(markReadTests)
  };

  // 4. Mostrar resultados
  console.log('\n📊 Resultados de verificación:');
  console.log('\n📋 ASSIGN ENDPOINT:');
  assignTests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    console.log(`${status} ${test.method}: ${test.success ? `HTTP ${test.statusCode}` : test.error}`);
  });

  console.log('\n👁️ MARK-READ ENDPOINT:');
  markReadTests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    console.log(`${status} ${test.method}: ${test.success ? `HTTP ${test.statusCode}` : test.error}`);
  });

  console.log('\n🎯 RECOMENDACIONES:');
  console.log(`📋 Assign: usar ${recommendations.assign}`);
  console.log(`👁️ Mark-read: usar ${recommendations.markRead}`);

  return {
    assign: assignTests,
    markRead: markReadTests,
    recommendations
  };
}

/**
 * Ejecutar verificación si se llama directamente
 */
if (import.meta.url === new URL(import.meta.resolve('.')).href + 'verifyHttpMethods.ts') {
  verifyHttpMethods().catch(console.error);
} 