import React, { useState } from 'react';
import { X, Brain, Download, Copy, RefreshCw, AlertTriangle, CheckCircle, Clock, Key, Loader2 } from 'lucide-react';
import { useMonitoring } from './MonitoringContext';
import { callOpenAI, getOpenAIAPIKey, validateAPIKey, setAPIKey } from '../../config/ai';

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
  const { apis, websockets, logs, errors, performance, states, validations } = useMonitoring();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prepareDataForAnalysis = () => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
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
      averageMemory: recentPerformance.filter(p => p.type === 'memory').reduce((sum, p) => sum + p.value, 0) / recentPerformance.filter(p => p.type === 'memory').length || 0,
      averageRenderTime: recentPerformance.filter(p => p.type === 'render').reduce((sum, p) => sum + p.value, 0) / recentPerformance.filter(p => p.type === 'render').length || 0,
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
        context: {
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
        requestBody: api.requestBody || {},
        responseBody: api.responseBody || {},
        fullUrl: api.url || 'N/A'
      })),
      sampleLogs: recentLogs.slice(0, 10).map(log => ({
        ...log,
        timestamp: log.timestamp || new Date().toISOString(),
        context: {
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
- **Contexto**: ${JSON.stringify(error.context || {})}
`).join('\n')}

## ANÁLISIS DETALLADO DE APIs FALLIDAS:
${data.sampleAPIs.filter(api => api.status >= 400 || api.error).map((api, index) => `
### API FALLIDA ${index + 1}:
- **Método**: ${api.method || 'N/A'}
- **URL Completa**: ${api.fullUrl || api.url || 'N/A'}
- **Status Code**: ${api.status || 'N/A'}
- **Duración**: ${api.duration || 0}ms
- **Error Message**: ${api.error || 'N/A'}
- **Headers de Request**: ${JSON.stringify(api.requestHeaders || {})}
- **Headers de Response**: ${JSON.stringify(api.responseHeaders || {})}
- **Body de Request**: ${JSON.stringify(api.requestBody || {})}
- **Body de Response**: ${JSON.stringify(api.responseBody || {})}
- **Timestamp**: ${api.timestamp || 'N/A'}
- **Contexto**: ${JSON.stringify(api.context || {})}
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
- **Contexto**: ${JSON.stringify(log.context || {})}
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
        summary: extractSection(aiResponse, 'RESUMEN EJECUTIVO') || 'Análisis completado',
        criticalIssues: extractList(aiResponse, 'PROBLEMAS CRÍTICOS'),
        recommendations: extractList(aiResponse, 'RECOMENDACIONES'),
        performanceInsights: extractList(aiResponse, 'INSIGHTS DE RENDIMIENTO'),
        errorPatterns: extractList(aiResponse, 'PATRONES DE ERRORES'),
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
      setError(`Error al generar análisis: ${error.message}`);
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
    <div className="ai-analysis-modal-overlay">
      <div className="ai-analysis-modal">
        <div className="ai-analysis-header">
          <div className="header-content">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2>Análisis Inteligente con IA</h2>
          </div>
          <button onClick={onClose} className="close-button">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Botón de cerrar flotante siempre visible */}
        <div className="floating-close-button">
          <button onClick={onClose} className="floating-close">
            <X className="w-6 h-6" />
            <span>Cerrar</span>
          </button>
        </div>

        <div className="ai-analysis-body">
          {!analysisResult ? (
            <div className="analysis-setup">
              <div className="setup-content">
                <div className="setup-icon">
                  <Brain className="w-16 h-16 text-purple-500" />
                </div>
                <h3>Análisis Completo del Sistema</h3>
                <p className="setup-description">
                  La IA analizará todos los datos de monitoreo y generará un reporte detallado con:
                </p>
                
                <div className="analysis-features">
                  <div className="feature-item">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Identificación de problemas críticos</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Recomendaciones específicas de solución</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Análisis de patrones de errores</span>
                  </div>
                  <div className="feature-item">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Insights de rendimiento</span>
                  </div>
                </div>

                <div className="data-summary">
                  <h4>Datos a Analizar:</h4>
                  <div className="data-stats">
                    <div className="stat-item">
                      <span className="stat-label">APIs:</span>
                      <span className="stat-value">{apis.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">WebSockets:</span>
                      <span className="stat-value">{websockets.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Errores:</span>
                      <span className="stat-value">{errors.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Logs:</span>
                      <span className="stat-value">{logs.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Rendimiento:</span>
                      <span className="stat-value">{performance.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Estados:</span>
                      <span className="stat-value">{states.length}</span>
                    </div>
                  </div>
                  <div className="total-items">
                    <strong>Total: {totalDataItems} elementos</strong>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="api-key-section">
                  <div className="api-key-info">
                    <Key className="w-4 h-4" />
                    <span>API Key de OpenAI configurada</span>
                  </div>
                  <button
                    onClick={() => {
                      const newKey = prompt('Ingresa tu nueva API Key de OpenAI:');
                      if (newKey && newKey.trim()) {
                        setAPIKey(newKey.trim());
                        alert('API Key actualizada correctamente');
                      }
                    }}
                    className="api-key-button"
                  >
                    Cambiar API Key
                  </button>
                </div>

                {totalDataItems === 0 && (
                  <p className="no-data-warning">
                    ⚠️ No hay datos para analizar. Interactúa con la aplicación para generar información de monitoreo.
                  </p>
                )}

                {/* Botón principal siempre visible */}
                <div className="start-analysis-section">
                  <button
                    onClick={generateAIAnalysis}
                    disabled={isAnalyzing}
                    className="start-analysis-button"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Iniciar Análisis con IA
                      </>
                    )}
                  </button>
                </div>

                {/* Botón de emergencia siempre visible */}
                <div className="emergency-analysis-section">
                  <button
                    onClick={generateAIAnalysis}
                    disabled={isAnalyzing}
                    className="emergency-analysis-button"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analizando con IA...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        🚀 GENERAR ANÁLISIS AHORA
                      </>
                    )}
                  </button>
                </div>

                {/* Botón simple de texto */}
                <div className="simple-analysis-section">
                  <button
                    onClick={generateAIAnalysis}
                    disabled={isAnalyzing}
                    className="simple-analysis-button"
                  >
                    {isAnalyzing ? 'Analizando...' : 'HACER ANÁLISIS'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="analysis-results">
              <div className="results-header">
                <div className="results-info">
                  <h3>Análisis Completado</h3>
                  <p className="results-meta">
                    Generado el {analysisResult.generatedAt} • {analysisResult.dataRange} • {analysisResult.totalItems} elementos analizados
                  </p>
                </div>
                <div className="results-actions">
                  <button onClick={copyToClipboard} className="action-button copy">
                    <Copy className="w-4 h-4" />
                    Copiar Resumen
                  </button>
                  <button onClick={() => {
                    const textarea = document.querySelector('.analysis-text') as HTMLTextAreaElement;
                    if (textarea) {
                      textarea.select();
                      textarea.setSelectionRange(0, 99999); // Para dispositivos móviles
                      try {
                        document.execCommand('copy');
                        alert('✅ Análisis completo copiado al portapapeles');
                      } catch (err) {
                        // Fallback para navegadores modernos
                        navigator.clipboard.writeText(textarea.value).then(() => {
                          alert('✅ Análisis completo copiado al portapapeles');
                        }).catch(() => {
                          alert('❌ Error al copiar. Intenta seleccionar y copiar manualmente.');
                        });
                      }
                    } else {
                      alert('❌ No se encontró el texto del análisis');
                    }
                  }} className="action-button copy-full">
                    <Copy className="w-4 h-4" />
                    Copiar Todo
                  </button>
                  <button onClick={exportAnalysis} className="action-button export">
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                  <button onClick={() => setAnalysisResult(null)} className="action-button refresh">
                    <RefreshCw className="w-4 h-4" />
                    Nuevo Análisis
                  </button>
                </div>
              </div>

              <div className="analysis-sections">
                <div className="analysis-section">
                  <h4>📊 Resumen Ejecutivo</h4>
                  <div className="section-content">
                    <p>{analysisResult.summary}</p>
                  </div>
                </div>

                <div className="analysis-section">
                  <h4>🚨 Problemas Críticos</h4>
                  <div className="section-content">
                    <ul>
                      {analysisResult.criticalIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="analysis-section">
                  <h4>💡 Recomendaciones</h4>
                  <div className="section-content">
                    <ul>
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="analysis-section">
                  <h4>⚡ Insights de Rendimiento</h4>
                  <div className="section-content">
                    <ul>
                      {analysisResult.performanceInsights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="analysis-section">
                  <h4>🔍 Patrones de Errores</h4>
                  <div className="section-content">
                    <ul>
                      {analysisResult.errorPatterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ANÁLISIS COMPLETO Y EXTENSO */}
                <div className="analysis-section full-analysis">
                  <h4>📋 Análisis Completo y Extenso</h4>
                  <div className="section-content">
                    <div className="full-analysis-content">
                      <textarea 
                        className="analysis-text"
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
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .ai-analysis-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10002;
          padding: 20px;
        }

        .ai-analysis-modal {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          max-width: 98vw;
          width: 100%;
          max-height: 98vh;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .ai-analysis-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px 20px 0 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-content h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .close-button {
          padding: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .floating-close-button {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10003;
        }

        .floating-close {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          transition: all 0.2s ease;
        }

        .floating-close:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }

        .start-analysis-section {
          margin-top: 24px;
          display: flex;
          justify-content: center;
        }

        .start-analysis-button {
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }

        .start-analysis-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }

        .start-analysis-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .emergency-analysis-section {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }

        .emergency-analysis-button {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 20px 40px;
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .emergency-analysis-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5);
        }

        .emergency-analysis-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .simple-analysis-section {
          margin-top: 16px;
          display: flex;
          justify-content: center;
        }

        .simple-analysis-button {
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .simple-analysis-button:hover:not(:disabled) {
          background: #059669;
        }

        .simple-analysis-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .ai-analysis-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .analysis-setup {
          text-align: center;
        }

        .setup-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .setup-icon {
          margin-bottom: 24px;
        }

        .setup-content h3 {
          margin: 0 0 16px 0;
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
        }

        .setup-description {
          margin: 0 0 32px 0;
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
        }

        .analysis-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .feature-item span {
          font-weight: 500;
          color: #1f2937;
        }

        .data-summary {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .data-summary h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .data-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .stat-label {
          color: #6b7280;
          font-size: 14px;
        }

        .stat-value {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .total-items {
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          color: #1f2937;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          margin-bottom: 24px;
        }

        .analyze-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 0 auto;
        }

        .analyze-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .analyze-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .no-data-warning {
          margin-top: 16px;
          padding: 12px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          color: #92400e;
          font-size: 14px;
        }

        .api-key-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .api-key-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0369a1;
          font-size: 14px;
          font-weight: 500;
        }

        .api-key-button {
          padding: 6px 12px;
          background: #0ea5e9;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .api-key-button:hover {
          background: #0284c7;
        }

        .analysis-results {
          max-width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .results-info h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .results-meta {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .results-actions {
          display: flex;
          gap: 8px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .action-button:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .action-button.copy:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .action-button.copy-full:hover {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }

        .action-button.export:hover {
          border-color: #10b981;
          color: #10b981;
        }

        .action-button.refresh:hover {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .analysis-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
          overflow-y: auto;
          padding-right: 8px;
        }

        .analysis-section {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }

        .analysis-section h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .section-content {
          color: #374151;
          line-height: 1.6;
        }

        .section-content p {
          margin: 0;
        }

        .section-content ul {
          margin: 0;
          padding-left: 20px;
        }

        .section-content li {
          margin-bottom: 8px;
        }

        .full-analysis {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
        }

        .full-analysis h4 {
          color: #1e40af;
          font-size: 18px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 12px;
        }

        .full-analysis-content {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 20px;
          overflow-x: auto;
        }

        .analysis-text {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          background: #f9fafb;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          height: 400px;
          width: 100%;
          resize: vertical;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .analysis-text::-webkit-scrollbar {
          width: 8px;
        }

        .analysis-text::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .analysis-text::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .analysis-text::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 1024px) {
          .ai-analysis-modal {
            max-width: 95vw;
            max-height: 95vh;
            margin: 10px;
          }
          
          .analysis-text {
            height: 300px;
            font-size: 12px;
          }
        }

        @media (max-width: 640px) {
          .ai-analysis-modal {
            margin: 5px;
            max-width: 98vw;
            max-height: 98vh;
            border-radius: 12px;
          }
          
          .ai-analysis-header {
            padding: 16px;
          }
          
          .ai-analysis-body {
            padding: 16px;
          }
          
          .results-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .results-actions {
            width: 100%;
            justify-content: center;
          }
          
          .analysis-text {
            height: 250px;
            font-size: 11px;
            padding: 12px;
          }
          
          .start-analysis-button,
          .emergency-analysis-button {
            padding: 12px 20px;
            font-size: 14px;
          }
          
          .analysis-features {
            grid-template-columns: 1fr;
          }
          
          .data-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};
