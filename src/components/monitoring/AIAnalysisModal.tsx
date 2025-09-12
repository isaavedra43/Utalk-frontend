import React, { useState } from 'react';
import { X, Brain, Download, Copy, RefreshCw, AlertTriangle, CheckCircle, Key, Loader2 } from 'lucide-react';
import { useMonitoring } from './MonitoringContext';
import { callOpenAI, setAPIKey } from '../../config/ai';

interface AIAnalysisModalProps {
  onClose: () => void;
}

interface AIAnalysisResult {
  summary: string;
  criticalIssues: string[];
  recommendations: string[];
  performanceInsights: string[];
  errorPatterns: string[];
  generatedAt: string;
  dataRange: string;
  totalItems: number;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ onClose }) => {
  const { apis, websockets, logs, errors, performance, states } = useMonitoring();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prepareDataForAnalysis = () => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    console.log('🔍 DEBUG - Datos del store de monitoreo:');
    console.log('📊 APIs totales:', apis.length);
    console.log('🔌 WebSockets totales:', websockets.length);
    console.log('📝 Logs totales:', logs.length);
    console.log('❌ Errores totales:', errors.length);
    console.log('⚡ Performance totales:', performance.length);
    console.log('🔄 States totales:', states.length);

    // Filtrar datos recientes
    const recentAPIs = apis.filter(api => api.timestamp >= oneDayAgo);
    const recentWebSockets = websockets.filter(ws => ws.timestamp >= oneDayAgo);
    const recentLogs = logs.filter(log => log.timestamp >= oneDayAgo);
    const recentErrors = errors.filter(error => error.timestamp >= oneDayAgo);
    const recentPerformance = performance.filter(perf => perf.timestamp >= oneDayAgo);
    const recentStates = states.filter(state => state.timestamp >= oneDayAgo);

    console.log('🔍 DEBUG - Datos filtrados (últimas 24h):');
    console.log('📊 APIs recientes:', recentAPIs.length);
    console.log('🔌 WebSockets recientes:', recentWebSockets.length);
    console.log('📝 Logs recientes:', recentLogs.length);
    console.log('❌ Errores recientes:', recentErrors.length);
    console.log('⚡ Performance recientes:', recentPerformance.length);
    console.log('🔄 States recientes:', recentStates.length);

    // Estadísticas de APIs
    const apiStats = {
      total: recentAPIs.length,
      successful: recentAPIs.filter(api => api.status && api.status >= 200 && api.status < 300).length,
      failed: recentAPIs.filter(api => api.status && (api.status >= 400 || api.error)).length,
      averageResponseTime: recentAPIs.reduce((sum, api) => sum + (api.duration || 0), 0) / recentAPIs.length || 0,
      slowestEndpoint: recentAPIs.reduce((slowest, api) => 
        (api.duration || 0) > (slowest.duration || 0) ? api : slowest, recentAPIs[0] || {}),
      mostFrequentError: recentAPIs.filter(api => api.error).reduce((acc, api) => {
        acc[api.error || 'Unknown'] = (acc[api.error || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Estadísticas de WebSockets
    const wsStats = {
      total: recentWebSockets.length,
      connections: recentWebSockets.filter(ws => ws.type === 'connect').length,
      disconnections: recentWebSockets.filter(ws => ws.type === 'disconnect').length,
      messages: recentWebSockets.filter(ws => ws.type === 'message').length,
      errors: recentWebSockets.filter(ws => ws.error).length
    };

    // Estadísticas de Errores
    const errorStats = {
      total: recentErrors.length,
      byType: recentErrors.reduce((acc, error) => {
        acc[error.name] = (acc[error.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySource: recentErrors.reduce((acc, error) => {
        acc[error.source || 'Unknown'] = (acc[error.source || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      criticalErrors: recentErrors.filter(error => 
        error.name.includes('Error') || error.name.includes('Exception') || error.name.includes('TypeError')
      ).length
    };

    // Estadísticas de Rendimiento
    const perfStats = {
      total: recentPerformance.length,
      averageMemory: recentPerformance.filter(p => p.name?.includes('memory')).length > 0 
        ? recentPerformance.filter(p => p.name?.includes('memory')).reduce((sum, p) => sum + p.value, 0) / recentPerformance.filter(p => p.name?.includes('memory')).length 
        : 0,
      averageRenderTime: recentPerformance.filter(p => p.type === 'render').length > 0 
        ? recentPerformance.filter(p => p.type === 'render').reduce((sum, p) => sum + p.value, 0) / recentPerformance.filter(p => p.type === 'render').length 
        : 0,
      slowestComponent: recentPerformance.reduce((slowest, perf) => 
        perf.value > slowest.value ? perf : slowest, recentPerformance[0] || { value: 0, name: 'N/A' })
    };

    // Estadísticas de Logs
    const logStats = {
      total: recentLogs.length,
      byLevel: recentLogs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCategory: recentLogs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return {
      timeRange: {
        start: new Date(oneDayAgo).toISOString(),
        end: new Date(now).toISOString(),
        duration: '24 horas'
      },
      summary: {
        totalAPIs: apiStats.total,
        totalWebSockets: wsStats.total,
        totalErrors: errorStats.total,
        totalLogs: logStats.total,
        totalPerformance: perfStats.total
      },
      apiStats,
      wsStats,
      errorStats,
      perfStats,
      logStats,
      sampleErrors: recentErrors.slice(0, 10).map(error => ({
        ...error,
        timestamp: error.timestamp || new Date().toISOString(),
        additionalContext: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          stack: error.stack || 'N/A'
        }
      })),
      sampleAPIs: recentAPIs.slice(0, 10).map(api => ({
        ...api,
        timestamp: api.timestamp || new Date().toISOString(),
        requestHeaders: api.requestHeaders || {},
        responseHeaders: api.responseHeaders || {},
        fullUrl: api.url || 'N/A'
      })),
      sampleLogs: recentLogs.slice(0, 10).map(log => ({
        ...log,
        timestamp: log.timestamp || new Date().toISOString(),
        additionalContext: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      }))
    };
  };

  const generateAIAnalysis = async () => {
    console.log('🚀 Iniciando análisis con IA...');
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = prepareDataForAnalysis();
      console.log('📊 Datos preparados para análisis:', data);
      
      // Crear prompt para ChatGPT
      const prompt = `
Eres un experto en debugging y análisis de sistemas web. Analiza estos datos de monitoreo y proporciona un análisis TÉCNICO EXTREMADAMENTE DETALLADO.

IMPORTANTE: DEBES ANALIZAR CADA DATO INDIVIDUALMENTE. NO PUEDES RESPONDER CON "Análisis completado" o mensajes genéricos. DEBES proporcionar análisis específicos y técnicos para cada error, API fallida y log crítico.

DATOS REALES DEL SISTEMA:

## DATOS DEL SISTEMA:
- APIs: ${data.summary.totalAPIs} llamadas (${data.apiStats.successful} exitosas, ${data.apiStats.failed} fallidas)
- WebSockets: ${data.summary.totalWebSockets} eventos
- Errores: ${data.summary.totalErrors} errores críticos
- Logs: ${data.summary.totalLogs} entradas
- Rendimiento: ${data.summary.totalPerformance} métricas

## ANÁLISIS DETALLADO DE ERRORES - ANALIZA CADA UNO INDIVIDUALMENTE:
${data.sampleErrors.map((error, index) => `
### ERROR ${index + 1}:
- **Tipo**: ${error.name}
- **Mensaje**: ${error.message}
- **Fuente**: ${error.source}
- **URL**: ${error.url || 'N/A'}
- **Stack Trace**: ${error.stack ? error.stack.substring(0, 500) : 'N/A'}
- **Timestamp**: ${error.timestamp || 'N/A'}
- **Contexto**: ${JSON.stringify(error.additionalContext || {})}
`).join('\n')}

## ANÁLISIS DETALLADO DE APIs FALLIDAS:
${data.sampleAPIs.filter(api => (api.status && api.status >= 400) || api.error).map((api, index) => `
### API FALLIDA ${index + 1}:
- **Método**: ${api.method || 'N/A'}
- **URL Completa**: ${api.fullUrl || api.url || 'N/A'}
- **Status Code**: ${api.status || 'N/A'}
- **Duración**: ${api.duration || 0}ms
- **Error Message**: ${api.error || 'N/A'}
- **Headers de Request**: ${JSON.stringify(api.requestHeaders || {})}
- **Headers de Response**: ${JSON.stringify(api.responseHeaders || {})}
- **Body de Request**: ${JSON.stringify({})}
- **Body de Response**: ${JSON.stringify({})}
- **Timestamp**: ${api.timestamp || 'N/A'}
- **Contexto**: ${JSON.stringify({})}
`).join('\n')}

## ANÁLISIS DETALLADO DE LOGS CRÍTICOS:
${data.sampleLogs.filter(log => log.level === 'error' || log.level === 'warn').map((log, index) => `
### LOG CRÍTICO ${index + 1}:
- **Nivel**: ${log.level.toUpperCase()}
- **Categoría**: ${log.category}
- **Mensaje**: ${log.message}
- **Fuente**: ${log.source}
- **Datos**: ${JSON.stringify(log.data || {})}
- **Timestamp**: ${log.timestamp || 'N/A'}
- **Contexto**: ${JSON.stringify(log.additionalContext || {})}
`).join('\n')}

## ESTADÍSTICAS DE RENDIMIENTO:
- Tiempo promedio de respuesta: ${data.apiStats.averageResponseTime.toFixed(2)}ms
- Endpoint más lento: ${data.apiStats.slowestEndpoint.url || 'N/A'} (${data.apiStats.slowestEndpoint.duration || 0}ms)
- Memoria promedio: ${data.perfStats.averageMemory.toFixed(2)}MB
- Componente más lento: ${data.perfStats.slowestComponent.name} (${data.perfStats.slowestComponent.value}ms)

## INSTRUCCIONES CRÍTICAS:

Proporciona un análisis TÉCNICO EXTREMADAMENTE DETALLADO que incluya:

### 1. ANÁLISIS INDIVIDUAL DE CADA ERROR:
Para CADA error, especifica:
- **¿QUÉ ERROR ES EXACTAMENTE?** (tipo, código, descripción técnica)
- **¿DÓNDE OCURRE?** (archivo, función, línea, componente)
- **¿CUÁNDO OCURRE?** (patrón temporal, frecuencia)
- **¿POR QUÉ OCURRE?** (causa raíz técnica)
- **¿QUÉ LO OCASIONA?** (trigger, condición, flujo de datos)
- **¿CÓMO SE MANIFIESTA?** (síntomas, impacto en usuario)
- **¿QUÉ RESPUESTA DA EL BACKEND?** (status code, mensaje de error)
- **¿CÓMO SE PUEDE SOLUCIONAR?** (código específico, configuración)
- **¿ES UN ERROR CRÍTICO?** (impacto en funcionalidad)
- **¿AFECTA A OTROS COMPONENTES?** (propagación del error)

### 2. ANÁLISIS DE APIS FALLIDAS:
Para CADA API fallida, especifica:
- **¿QUÉ ENDPOINT FALLA?** (URL completa, método HTTP)
- **¿QUÉ DATOS SE ENVÍAN?** (request body, headers)
- **¿QUÉ RESPUESTA RECIBE?** (status code, error message, response body)
- **¿POR QUÉ FALLA?** (validación, autenticación, servidor, red)
- **¿CÓMO SE DEBE ARREGLAR?** (código frontend, backend, configuración)
- **¿ES UN ERROR DE AUTENTICACIÓN?** (token, permisos, roles)
- **¿ES UN ERROR DE VALIDACIÓN?** (datos incorrectos, formato)
- **¿ES UN ERROR DE SERVIDOR?** (500, timeout, conexión)
- **¿ES UN ERROR DE RED?** (CORS, DNS, conectividad)
- **¿QUÉ HEADERS FALTAN?** (Content-Type, Authorization, etc.)

### 3. ANÁLISIS DE LOGS CRÍTICOS:
Para CADA log crítico, especifica:
- **¿QUÉ TIPO DE LOG ES?** (error, warning, info, debug)
- **¿DE QUÉ CATEGORÍA?** (authentication, network, validation, etc.)
- **¿QUÉ MENSAJE ESPECÍFICO?** (descripción detallada)
- **¿DÓNDE SE GENERA?** (componente, función, archivo)
- **¿CUÁNDO OCURRE?** (patrón temporal, frecuencia)
- **¿POR QUÉ ES CRÍTICO?** (impacto en funcionalidad)
- **¿QUÉ ACCIÓN REQUIERE?** (fix, monitoring, investigation)

### 4. PATRONES Y RELACIONES:
- **¿HAY ERRORES RELACIONADOS?** (cadenas de errores, dependencias)
- **¿QUÉ LOS OCASIONA?** (configuración, dependencias, flujo de datos)
- **¿CUÁL ES EL ORDEN DE APARICIÓN?** (secuencia, timing)
- **¿AFECTAN A MÚLTIPLES COMPONENTES?** (propagación, impacto)
- **¿HAY PATRONES TEMPORALES?** (horarios, frecuencia)
- **¿SE REPITEN LOS MISMOS ERRORES?** (recurrencia, causas)

### 5. SOLUCIONES TÉCNICAS ESPECÍFICAS:
- **CÓDIGO EXACTO** a modificar (archivo, función, línea)
- **CONFIGURACIONES** a cambiar (variables, headers, timeouts)
- **DEPENDENCIAS** a actualizar o instalar
- **FLUJOS DE DATOS** a corregir
- **VALIDACIONES** a implementar
- **ERROR HANDLING** a mejorar
- **LOGGING** a implementar

### 6. PLAN DE IMPLEMENTACIÓN:
- **ORDEN DE PRIORIDAD** (crítico, alto, medio, bajo)
- **DEPENDENCIAS** entre soluciones
- **TIEMPO ESTIMADO** para cada fix
- **TESTING** requerido
- **ROLLBACK** plan si algo falla

### 7. PREVENCIÓN Y MONITOREO:
- **MONITOREO** adicional necesario
- **VALIDACIONES** preventivas
- **ERROR HANDLING** mejorado
- **LOGGING** más detallado
- **ALERTAS** a configurar
- **MÉTRICAS** a monitorear

INSTRUCCIONES CRÍTICAS:
1. DEBES analizar CADA error individualmente
2. DEBES analizar CADA API fallida individualmente  
3. DEBES analizar CADA log crítico individualmente
4. NO PUEDES responder con mensajes genéricos como "Análisis completado"
5. DEBES proporcionar soluciones específicas y técnicas
6. DEBES incluir código específico y nombres de archivos
7. DEBES explicar la causa raíz de cada problema
8. DEBES dar pasos específicos para solucionar cada problema

FORMATO DE RESPUESTA REQUERIDO:
## RESUMEN EJECUTIVO:
[Análisis general del estado del sistema]

## PROBLEMAS CRÍTICOS IDENTIFICADOS:
[Para cada problema crítico, especifica: nombre del problema, ubicación, causa, impacto, solución]

## RECOMENDACIONES ESPECÍFICAS:
[Para cada recomendación, especifica: qué hacer, dónde hacerlo, cómo hacerlo, por qué es importante]

## INSIGHTS DE RENDIMIENTO:
[Análisis específico de métricas de rendimiento y optimizaciones]

## PATRONES DE ERRORES DETECTADOS:
[Análisis de patrones, correlaciones y causas comunes]

## DETALLES TÉCNICOS:
[Información técnica específica sobre el período analizado]

Responde en español, sé EXTREMADAMENTE específico y técnico. Incluye nombres de archivos, funciones, componentes, y código específico. El análisis debe ser una guía técnica completa para solucionar TODOS los problemas identificados.
`;

      console.log('🤖 Enviando datos a ChatGPT API...');
      console.log('📊 Datos preparados:', data);

      // Usar la función de configuración de IA con más tokens para análisis extenso
      const aiResponse = await callOpenAI(prompt, undefined, { max_tokens: 6000, temperature: 0.2 });

      // Parsear la respuesta de la IA
      const analysisResult: AIAnalysisResult = {
        summary: extractSection(String(aiResponse), 'RESUMEN EJECUTIVO') || 'Análisis completado',
        criticalIssues: extractList(String(aiResponse), 'PROBLEMAS CRÍTICOS') || [],
        recommendations: extractList(String(aiResponse), 'RECOMENDACIONES') || [],
        performanceInsights: extractList(String(aiResponse), 'INSIGHTS DE RENDIMIENTO') || [],
        errorPatterns: extractList(String(aiResponse), 'PATRONES DE ERRORES') || [],
        generatedAt: new Date().toLocaleString(),
        dataRange: data.timeRange.duration,
        totalItems: data.summary.totalAPIs + data.summary.totalWebSockets + data.summary.totalErrors + data.summary.totalLogs
      };

      setAnalysisResult(analysisResult);
      console.log('✅ Análisis completado:', analysisResult);
      console.log('🤖 Respuesta completa de la IA:', aiResponse);
      console.log('📊 Resultado parseado:', analysisResult);

    } catch (error) {
      console.error('❌ Error en análisis de IA:', error);
      setError(`Error al generar análisis: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractSection = (text: string, section: string): string => {
    // Buscar la sección con diferentes variaciones
    const patterns = [
      new RegExp(`${section}[\\s\\S]*?(?=\\n\\d+\\.|\\n[A-ZÁÉÍÓÚÑ]+:|$)`, 'i'),
      new RegExp(`${section}[\\s\\S]*?(?=\\n##|\\n[A-ZÁÉÍÓÚÑ]+:|$)`, 'i'),
      new RegExp(`${section}[\\s\\S]*?(?=\\n[A-ZÁÉÍÓÚÑ]+:|$)`, 'i'),
      new RegExp(`${section}[\\s\\S]*?(?=\\n\\n|$)`, 'i')
    ];
    
    for (const regex of patterns) {
      const match = text.match(regex);
      if (match) {
        return match[0].replace(section, '').trim();
      }
    }
    
    return '';
  };

  const extractList = (text: string, section: string): string[] => {
    const sectionText = extractSection(text, section);
    return sectionText
      .split('\n')
      .map(item => item.replace(/^[-•*]\s*/, '').trim())
      .filter(item => item.length > 0);
  };

  const copyToClipboard = () => {
    if (analysisResult) {
      const text = `
ANÁLISIS DE MONITOREO - ${analysisResult.generatedAt}
================================================

RESUMEN EJECUTIVO:
${analysisResult.summary}

PROBLEMAS CRÍTICOS:
${analysisResult.criticalIssues.map(issue => `• ${issue}`).join('\n')}

RECOMENDACIONES:
${analysisResult.recommendations.map(rec => `• ${rec}`).join('\n')}

INSIGHTS DE RENDIMIENTO:
${analysisResult.performanceInsights.map(insight => `• ${insight}`).join('\n')}

PATRONES DE ERRORES:
${analysisResult.errorPatterns.map(pattern => `• ${pattern}`).join('\n')}

Datos analizados: ${analysisResult.totalItems} elementos en ${analysisResult.dataRange}
      `.trim();

      navigator.clipboard.writeText(text);
      alert('Análisis copiado al portapapeles');
    }
  };

  const exportAnalysis = () => {
    if (!analysisResult) return;
    
    const textarea = document.querySelector('.analysis-text') as HTMLTextAreaElement;
    if (!textarea) {
      alert('❌ No se encontró el texto del análisis');
      return;
    }
    
    const analysisText = textarea.value;
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Exportar como TXT
    const txtBlob = new Blob([analysisText], { type: 'text/plain;charset=utf-8' });
    const txtUrl = URL.createObjectURL(txtBlob);
    const txtLink = document.createElement('a');
    txtLink.href = txtUrl;
    txtLink.download = `analisis-ia-${timestamp}.txt`;
    txtLink.style.visibility = 'hidden';
    document.body.appendChild(txtLink);
    txtLink.click();
    document.body.removeChild(txtLink);
    URL.revokeObjectURL(txtUrl);
    
    // Exportar como JSON
    const exportData = {
      summary: analysisResult.summary,
      criticalIssues: analysisResult.criticalIssues,
      recommendations: analysisResult.recommendations,
      performanceInsights: analysisResult.performanceInsights,
      errorPatterns: analysisResult.errorPatterns,
      generatedAt: analysisResult.generatedAt,
      dataRange: analysisResult.dataRange,
      totalItems: analysisResult.totalItems,
      fullAnalysis: analysisText
    };
    
    const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `analisis-ia-${timestamp}.json`;
    jsonLink.style.visibility = 'hidden';
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);
    
    alert('✅ Análisis exportado como TXT y JSON');
  };

  const totalDataItems = apis.length + websockets.length + logs.length + errors.length + performance.length + states.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl max-h-[90vh] w-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Análisis Inteligente con IA</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!analysisResult ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-2xl">
                <div className="mb-6">
                  <Brain className="w-16 h-16 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Análisis Inteligente de Monitoreo</h3>
                <p className="text-gray-600 mb-8">
                  Utiliza inteligencia artificial para analizar todos los datos de monitoreo 
                  y obtener insights detallados sobre el rendimiento y problemas del sistema.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">{apis.length}</span>
                    <span className="text-sm text-gray-500">APIs</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">{websockets.length}</span>
                    <span className="text-sm text-gray-500">WebSockets</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">{logs.length}</span>
                    <span className="text-sm text-gray-500">Logs</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">{errors.length}</span>
                    <span className="text-sm text-gray-500">Errores</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">{performance.length}</span>
                    <span className="text-sm text-gray-500">Métricas</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-gray-900 block">{states.length}</span>
                    <span className="text-sm text-gray-500">Estados</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <span className="text-blue-800 font-medium">Total de elementos a analizar: </span>
                  <span className="text-blue-900 font-bold text-xl">{totalDataItems}</span>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-red-800">{error}</span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-medium">API Key de OpenAI configurada</span>
                  </div>
                  <button
                    onClick={() => {
                      const newKey = prompt('Ingresa tu nueva API Key de OpenAI:');
                      if (newKey && newKey.trim()) {
                        setAPIKey(newKey.trim());
                        alert('API Key actualizada correctamente');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Cambiar API Key
                  </button>
                </div>
                
                {totalDataItems === 0 && (
                  <p className="text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    ⚠️ No hay datos para analizar. Interactúa con la aplicación para generar información de monitoreo.
                  </p>
                )}
                
                <button 
                  onClick={generateAIAnalysis}
                  disabled={isAnalyzing || totalDataItems === 0}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analizando...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Iniciar Análisis con IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">Análisis Completado</h3>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <div>Generado: {analysisResult.generatedAt}</div>
                  <div>Rango: {analysisResult.dataRange}</div>
                  <div>Elementos: {analysisResult.totalItems}</div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{error}</span>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-3">Resumen Ejecutivo</h2>
                <p className="text-blue-800 leading-relaxed">{analysisResult.summary}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{analysisResult.criticalIssues.length}</div>
                  <div className="text-sm text-gray-500">Problemas Críticos</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{analysisResult.recommendations.length}</div>
                  <div className="text-sm text-gray-500">Recomendaciones</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{analysisResult.performanceInsights.length}</div>
                  <div className="text-sm text-gray-500">Insights de Rendimiento</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{analysisResult.errorPatterns.length}</div>
                  <div className="text-sm text-gray-500">Patrones de Error</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Copy className="w-4 h-4" />
                  <span>Copiar Resumen</span>
                </button>
                <button onClick={exportAnalysis} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
                <button onClick={() => setAnalysisResult(null)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  <span>Nuevo Análisis</span>
                </button>
              </div>
              
              {analysisResult.criticalIssues.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Problemas Críticos</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.criticalIssues.map((issue, index) => (
                      <li key={index} className="text-red-700 py-2 border-b border-red-200 last:border-b-0">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisResult.recommendations.length > 0 && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Recomendaciones</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-green-700 py-2 border-b border-green-200 last:border-b-0">{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisResult.performanceInsights.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Insights de Rendimiento</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.performanceInsights.map((insight, index) => (
                      <li key={index} className="text-yellow-700 py-2 border-b border-yellow-200 last:border-b-0">{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysisResult.errorPatterns.length > 0 && (
                <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Patrones de Error</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.errorPatterns.map((pattern, index) => (
                      <li key={index} className="text-purple-700 py-2 border-b border-purple-200 last:border-b-0">{pattern}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Análisis completo */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis Completo</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <textarea 
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none"
                    readOnly
                    value={`ANÁLISIS COMPLETO DEL SISTEMA - ${analysisResult.generatedAt}
========================================================

RESUMEN EJECUTIVO:
${analysisResult.summary}

PROBLEMAS CRÍTICOS IDENTIFICADOS:
${analysisResult.criticalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

RECOMENDACIONES ESPECÍFICAS:
${analysisResult.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

INSIGHTS DE RENDIMIENTO:
${analysisResult.performanceInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

PATRONES DE ERRORES DETECTADOS:
${analysisResult.errorPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}

DETALLES TÉCNICOS:
- Período analizado: ${analysisResult.dataRange}
- Total de elementos procesados: ${analysisResult.totalItems}
- Fecha de generación: ${analysisResult.generatedAt}

CONTEXTO ADICIONAL:
Este análisis fue generado por IA basándose en los datos de monitoreo capturados
en tiempo real del sistema. Incluye análisis de APIs, WebSockets, errores, logs,
métricas de rendimiento y cambios de estado para proporcionar una visión completa
del estado del sistema y recomendaciones específicas para su optimización.

Para aplicar las soluciones recomendadas:
1. Revisa cada problema crítico identificado
2. Implementa las recomendaciones en el orden de prioridad sugerido
3. Monitorea los cambios con el sistema de monitoreo
4. Genera un nuevo análisis después de implementar las mejoras

---
Generado por el Sistema de Monitoreo UTalk con IA`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};