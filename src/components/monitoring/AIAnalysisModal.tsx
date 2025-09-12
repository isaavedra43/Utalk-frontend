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

    // Filtrar datos recientes
    const recentAPIs = apis.filter(api => api.timestamp >= oneDayAgo);
    const recentWebSockets = websockets.filter(ws => ws.timestamp >= oneDayAgo);
    const recentLogs = logs.filter(log => log.timestamp >= oneDayAgo);
    const recentErrors = errors.filter(error => error.timestamp >= oneDayAgo);
    const recentPerformance = performance.filter(perf => perf.timestamp >= oneDayAgo);
    const recentStates = states.filter(state => state.timestamp >= oneDayAgo);

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
      sampleErrors: recentErrors.slice(0, 5),
      sampleAPIs: recentAPIs.slice(0, 5),
      sampleLogs: recentLogs.slice(0, 5)
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
Analiza los siguientes datos de monitoreo de una aplicación web y proporciona un análisis SÚPER DETALLADO y EXTENSO:

## RESUMEN GENERAL:
- APIs: ${data.summary.totalAPIs} llamadas
- WebSockets: ${data.summary.totalWebSockets} eventos  
- Errores: ${data.summary.totalErrors} errores
- Logs: ${data.summary.totalLogs} entradas
- Rendimiento: ${data.summary.totalPerformance} métricas

## ESTADÍSTICAS DETALLADAS DE APIs:
- Total: ${data.apiStats.total}
- Exitosas: ${data.apiStats.successful}
- Fallidas: ${data.apiStats.failed}
- Tiempo promedio de respuesta: ${data.apiStats.averageResponseTime.toFixed(2)}ms
- Endpoint más lento: ${data.apiStats.slowestEndpoint.url || 'N/A'} (${data.apiStats.slowestEndpoint.duration || 0}ms)
- Errores más frecuentes: ${Object.entries(data.apiStats.mostFrequentError).slice(0, 3).map(([error, count]) => `${error} (${count})`).join(', ')}

## ESTADÍSTICAS DETALLADAS DE WEBSOCKETS:
- Total eventos: ${data.wsStats.total}
- Conexiones: ${data.wsStats.connections}
- Desconexiones: ${data.wsStats.disconnections}
- Mensajes: ${data.wsStats.messages}
- Errores: ${data.wsStats.errors}

## ESTADÍSTICAS DETALLADAS DE ERRORES:
- Total: ${data.errorStats.total}
- Errores críticos: ${data.errorStats.criticalErrors}
- Tipos más comunes: ${Object.entries(data.errorStats.byType).slice(0, 5).map(([type, count]) => `${type} (${count})`).join(', ')}
- Fuentes más problemáticas: ${Object.entries(data.errorStats.bySource).slice(0, 5).map(([source, count]) => `${source} (${count})`).join(', ')}

## ESTADÍSTICAS DETALLADAS DE RENDIMIENTO:
- Memoria promedio: ${data.perfStats.averageMemory.toFixed(2)}MB
- Tiempo de renderizado promedio: ${data.perfStats.averageRenderTime.toFixed(2)}ms
- Componente más lento: ${data.perfStats.slowestComponent.name} (${data.perfStats.slowestComponent.value}ms)

## ESTADÍSTICAS DETALLADAS DE LOGS:
- Total: ${data.logStats.total}
- Por nivel: ${Object.entries(data.logStats.byLevel).map(([level, count]) => `${level} (${count})`).join(', ')}
- Por categoría: ${Object.entries(data.logStats.byCategory).slice(0, 5).map(([category, count]) => `${category} (${count})`).join(', ')}

## MUESTRAS DETALLADAS DE ERRORES:
${data.sampleErrors.map(error => `- ${error.name}: ${error.message} (${error.source}) - URL: ${error.url || 'N/A'} - Stack: ${error.stack ? error.stack.substring(0, 200) + '...' : 'N/A'}`).join('\n')}

## MUESTRAS DETALLADAS DE APIs:
${data.sampleAPIs.map(api => `- ${api.method} ${api.url}: ${api.status} (${api.duration}ms) ${api.error ? `- ERROR: ${api.error}` : ''} - Headers: ${JSON.stringify(api.requestHeaders || {})}`).join('\n')}

## MUESTRAS DETALLADAS DE LOGS:
${data.sampleLogs.map(log => `- [${log.level.toUpperCase()}] ${log.category}: ${log.message} - Source: ${log.source} - Data: ${JSON.stringify(log.data || {})}`).join('\n')}

## INSTRUCCIONES ESPECÍFICAS:

Necesito un análisis SÚPER EXTENSO y DETALLADO que incluya:

1. **RESUMEN EJECUTIVO**: Un párrafo completo que resuma el estado general del sistema, incluyendo todos los aspectos críticos

2. **PROBLEMAS CRÍTICOS**: Lista detallada de TODOS los problemas importantes (mínimo 5-8), con:
   - Descripción específica del problema
   - Componente/módulo afectado
   - Impacto en el sistema
   - Urgencia del problema

3. **RECOMENDACIONES ESPECÍFICAS**: Acciones detalladas para resolver cada problema, incluyendo:
   - Código específico a modificar
   - Archivos a revisar
   - Pasos exactos a seguir
   - Configuraciones a cambiar

4. **INSIGHTS DE RENDIMIENTO**: Análisis profundo del rendimiento con:
   - Cuellos de botella identificados
   - Optimizaciones específicas
   - Código a optimizar
   - Métricas objetivo

5. **PATRONES DE ERRORES**: Análisis detallado de patrones con:
   - Causas raíz de cada error
   - Soluciones específicas
   - Prevención de errores futuros
   - Código a implementar

6. **ANÁLISIS TÉCNICO PROFUNDO**: Incluye:
   - Análisis de cada componente afectado
   - Flujo de datos problemático
   - Configuraciones incorrectas
   - Dependencias problemáticas

7. **PLAN DE ACCIÓN**: Orden específico de implementación de soluciones

Responde en español, sé EXTREMADAMENTE específico y técnico. Incluye nombres de archivos, funciones, componentes, y código específico cuando sea posible. El análisis debe ser tan detallado que pueda usarse como guía completa para solucionar todos los problemas identificados.
`;

      console.log('🤖 Enviando datos a ChatGPT API...');
      console.log('📊 Datos preparados:', data);

      // Usar la función de configuración de IA con más tokens para análisis extenso
      const aiResponse = await callOpenAI(prompt, undefined, { max_tokens: 4000, temperature: 0.3 });

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

    } catch (error) {
      console.error('❌ Error en análisis de IA:', error);
      setError(`Error al generar análisis: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractSection = (text: string, section: string): string => {
    const regex = new RegExp(`${section}[\\s\\S]*?(?=\\n\\d+\\.|\\n[A-ZÁÉÍÓÚÑ]+:|$)`, 'i');
    const match = text.match(regex);
    return match ? match[0].replace(section, '').trim() : '';
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
    if (analysisResult) {
      const text = `
ANÁLISIS DE MONITOREO GENERADO POR IA
=====================================
Fecha: ${analysisResult.generatedAt}
Período: ${analysisResult.dataRange}
Total de elementos analizados: ${analysisResult.totalItems}

RESUMEN EJECUTIVO:
${analysisResult.summary}

PROBLEMAS CRÍTICOS:
${analysisResult.criticalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

RECOMENDACIONES:
${analysisResult.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

INSIGHTS DE RENDIMIENTO:
${analysisResult.performanceInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

PATRONES DE ERRORES:
${analysisResult.errorPatterns.map((pattern, i) => `${i + 1}. ${pattern}`).join('\n')}

---
Generado por el Sistema de Monitoreo UTalk
      `.trim();

      const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analisis_monitoreo_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
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
                      document.execCommand('copy');
                      alert('Análisis completo copiado al portapapeles');
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
          max-width: 95vw;
          width: 100%;
          max-height: 95vh;
          overflow-y: auto;
          position: relative;
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
          height: 500px;
          width: 100%;
          resize: vertical;
          overflow-y: auto;
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

        @media (max-width: 640px) {
          .ai-analysis-modal {
            margin: 10px;
            max-width: none;
          }
          
          .results-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .results-actions {
            width: 100%;
            justify-content: center;
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
