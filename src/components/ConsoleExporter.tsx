import React, { useState, useEffect } from 'react';
import consoleExporter from '../utils/consoleExporter';

interface ConsoleExporterProps {
  className?: string;
}

export const ConsoleExporter: React.FC<ConsoleExporterProps> = ({ className = '' }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [logCount, setLogCount] = useState(0);
  const [stats, setStats] = useState<{ total: number; byLevel: Record<string, number> }>({
    total: 0,
    byLevel: { log: 0, info: 0, warn: 0, error: 0, debug: 0 }
  });

  // Actualizar estadísticas cada segundo
  useEffect(() => {
    if (isCapturing) {
      const interval = setInterval(() => {
        const currentStats = consoleExporter.getStats();
        setStats(currentStats);
        setLogCount(currentStats.total);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCapturing]);

  const handleStartCapture = () => {
    consoleExporter.startCapture();
    setIsCapturing(true);
  };

  const handleStopCapture = () => {
    consoleExporter.stopCapture();
    setIsCapturing(false);
  };

  const handleExportJSON = () => {
    consoleExporter.downloadLogs('json');
  };

  const handleExportText = () => {
    consoleExporter.downloadLogs('txt');
  };

  const handleClearLogs = () => {
    consoleExporter.clearLogs();
    setLogCount(0);
    setStats({ total: 0, byLevel: { log: 0, info: 0, warn: 0, error: 0, debug: 0 } });
  };

  return (
    <div className={`console-exporter ${className}`}>
      <div className="console-exporter-header">
        <h3>🔍 Console Exporter</h3>
        <div className="console-exporter-status">
          <span className={`status-indicator ${isCapturing ? 'capturing' : 'stopped'}`}>
            {isCapturing ? '🟢 Capturando' : '🔴 Detenido'}
          </span>
          <span className="log-count">Logs: {logCount}</span>
        </div>
      </div>

      <div className="console-exporter-controls">
        {!isCapturing ? (
          <button 
            onClick={handleStartCapture}
            className="btn-start"
            title="Iniciar captura de logs"
          >
            ▶️ Iniciar Captura
          </button>
        ) : (
          <button 
            onClick={handleStopCapture}
            className="btn-stop"
            title="Detener captura de logs"
          >
            ⏹️ Detener Captura
          </button>
        )}

        <button 
          onClick={handleExportJSON}
          className="btn-export"
          disabled={logCount === 0}
          title="Exportar como JSON"
        >
          📄 Exportar JSON
        </button>

        <button 
          onClick={handleExportText}
          className="btn-export"
          disabled={logCount === 0}
          title="Exportar como texto"
        >
          📝 Exportar TXT
        </button>

        <button 
          onClick={handleClearLogs}
          className="btn-clear"
          disabled={logCount === 0}
          title="Limpiar logs"
        >
          🗑️ Limpiar
        </button>
      </div>

      {logCount > 0 && (
        <div className="console-exporter-stats">
          <h4>Estadísticas:</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Log:</span>
              <span className="stat-value log">{stats.byLevel.log}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Info:</span>
              <span className="stat-value info">{stats.byLevel.info}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Warn:</span>
              <span className="stat-value warn">{stats.byLevel.warn}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Error:</span>
              <span className="stat-value error">{stats.byLevel.error}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Debug:</span>
              <span className="stat-value debug">{stats.byLevel.debug}</span>
            </div>
          </div>
        </div>
      )}

      <div className="console-exporter-help">
        <details>
          <summary>📖 Instrucciones de uso</summary>
          <div className="help-content">
            <p><strong>Uso desde la consola del navegador:</strong></p>
            <ul>
              <li><code>startLogCapture()</code> - Iniciar captura</li>
              <li><code>stopLogCapture()</code> - Detener captura</li>
              <li><code>exportLogs('json')</code> - Exportar como JSON</li>
              <li><code>exportLogs('txt')</code> - Exportar como texto</li>
              <li><code>getLogStats()</code> - Ver estadísticas</li>
              <li><code>clearLogs()</code> - Limpiar logs</li>
            </ul>
            <p><strong>Características:</strong></p>
            <ul>
              <li>✅ 100% seguro - No requiere plugins externos</li>
              <li>✅ Captura todos los tipos de logs (log, info, warn, error, debug)</li>
              <li>✅ Captura errores no manejados y promesas rechazadas</li>
              <li>✅ Incluye timestamps y stack traces</li>
              <li>✅ Exporta en formato JSON o texto plano</li>
              <li>✅ Descarga automática de archivos</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ConsoleExporter; 