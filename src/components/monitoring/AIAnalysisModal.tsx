import React, { useState } from 'react';
import { X, Brain, Download, Copy, RefreshCw, AlertTriangle, CheckCircle, Clock, Key } from 'lucide-react';
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
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = prepareDataForAnalysis();
      
      // Crear prompt para ChatGPT
      const prompt = `
Analiza los siguientes datos de monitoreo de una aplicación web y proporciona un análisis detallado:

## RESUMEN GENERAL:
- APIs: ${data.summary.totalAPIs} llamadas
- WebSockets: ${data.summary.totalWebSockets} eventos  
- Errores: ${data.summary.totalErrors} errores
- Logs: ${data.summary.totalLogs} entradas
- Rendimiento: ${data.summary.totalPerformance} métricas

## ESTADÍSTICAS DE APIs:
- Total: ${data.apiStats.total}
- Exitosas: ${data.apiStats.successful}
- Fallidas: ${data.apiStats.failed}
- Tiempo promedio de respuesta: ${data.apiStats.averageResponseTime.toFixed(2)}ms
- Endpoint más lento: ${data.apiStats.slowestEndpoint.url || 'N/A'} (${data.apiStats.slowestEndpoint.duration || 0}ms)

## ESTADÍSTICAS DE WEBSOCKETS:
- Total eventos: ${data.wsStats.total}
- Conexiones: ${data.wsStats.connections}
- Desconexiones: ${data.wsStats.disconnections}
- Mensajes: ${data.wsStats.messages}
- Errores: ${data.wsStats.errors}

## ESTADÍSTICAS DE ERRORES:
- Total: ${data.errorStats.total}
- Errores críticos: ${data.errorStats.criticalErrors}
- Tipos más comunes: ${Object.entries(data.errorStats.byType).slice(0, 3).map(([type, count]) => `${type} (${count})`).join(', ')}
- Fuentes más problemáticas: ${Object.entries(data.errorStats.bySource).slice(0, 3).map(([source, count]) => `${source} (${count})`).join(', ')}

## ESTADÍSTICAS DE RENDIMIENTO:
- Memoria promedio: ${data.perfStats.averageMemory.toFixed(2)}MB
- Tiempo de renderizado promedio: ${data.perfStats.averageRenderTime.toFixed(2)}ms
- Componente más lento: ${data.perfStats.slowestComponent.name} (${data.perfStats.slowestComponent.value}ms)

## MUESTRAS DE ERRORES:
${data.sampleErrors.map(error => `- ${error.name}: ${error.message} (${error.source})`).join('\n')}

## MUESTRAS DE APIs:
${data.sampleAPIs.map(api => `- ${api.method} ${api.url}: ${api.status} (${api.duration}ms) ${api.error ? `- ERROR: ${api.error}` : ''}`).join('\n')}

## MUESTRAS DE LOGS:
${data.sampleLogs.map(log => `- [${log.level.toUpperCase()}] ${log.category}: ${log.message}`).join('\n')}

Por favor, proporciona un análisis estructurado que incluya:

1. **RESUMEN EJECUTIVO**: Un párrafo que resuma el estado general del sistema
2. **PROBLEMAS CRÍTICOS**: Lista de los 3-5 problemas más importantes que necesitan atención inmediata
3. **RECOMENDACIONES**: Acciones específicas para resolver los problemas identificados
4. **INSIGHTS DE RENDIMIENTO**: Análisis del rendimiento y optimizaciones sugeridas
5. **PATRONES DE ERRORES**: Patrones identificados en los errores y cómo solucionarlos

Responde en español y sé específico y accionable en tus recomendaciones.
`;

      console.log('🤖 Enviando datos a ChatGPT API...');
      console.log('📊 Datos preparados:', data);

      // Usar la función de configuración de IA
      const aiResponse = await callOpenAI(prompt);

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

                <button
                  onClick={generateAIAnalysis}
                  disabled={isAnalyzing || totalDataItems === 0}
                  className="analyze-button"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Analizando con IA...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Generar Análisis con IA
                    </>
                  )}
                </button>

                {totalDataItems === 0 && (
                  <p className="no-data-warning">
                    ⚠️ No hay datos para analizar. Interactúa con la aplicación para generar información de monitoreo.
                  </p>
                )}
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
                    Copiar
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
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
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
