import React, { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, Database } from 'lucide-react';
import { useMonitoring } from './MonitoringContext';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  onClose: () => void;
  onExport: (format: 'excel' | 'csv' | 'txt') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExport }) => {
  const { apis, websockets, logs, errors, performance, states, validations } = useMonitoring();
  const [selectedData, setSelectedData] = useState<string[]>(['apis', 'websockets', 'logs', 'errors']);
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'hour'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const dataOptions = [
    { id: 'apis', label: 'APIs', icon: Database, count: apis.length },
    { id: 'websockets', label: 'WebSockets', icon: Database, count: websockets.length },
    { id: 'logs', label: 'Logs', icon: FileText, count: logs.length },
    { id: 'errors', label: 'Errores', icon: X, count: errors.length },
    { id: 'performance', label: 'Rendimiento', icon: Database, count: performance.length },
    { id: 'states', label: 'Estados', icon: Database, count: states.length },
    { id: 'validations', label: 'Validaciones', icon: Database, count: validations.length }
  ];

  const toggleDataSelection = (dataType: string) => {
    setSelectedData(prev => 
      prev.includes(dataType) 
        ? prev.filter(d => d !== dataType)
        : [...prev, dataType]
    );
  };

  const filterDataByDate = <T extends { timestamp: number }>(data: T[]): T[] => {
    if (dateRange === 'all') return data;
    
    const now = Date.now();
    const cutoff = dateRange === 'today' 
      ? now - (24 * 60 * 60 * 1000) // 24 hours
      : now - (60 * 60 * 1000); // 1 hour
    
    return data.filter(item => item.timestamp >= cutoff);
  };

  const prepareDataForExport = () => {
    const exportData: Record<string, any[]> = {};

    if (selectedData.includes('apis')) {
      exportData.APIs = filterDataByDate(apis).map(api => ({
        'Timestamp': new Date(api.timestamp).toISOString(),
        'Method': api.method,
        'URL': api.url,
        'Status': api.status || 'Pending',
        'Duration (ms)': api.duration || 'N/A',
        'Error': api.error || 'None',
        'Request Headers': JSON.stringify(api.requestHeaders || {}),
        'Response Headers': JSON.stringify(api.responseHeaders || {}),
        'Request Data': JSON.stringify(api.requestData || {}),
        'Response Data': JSON.stringify(api.responseData || {})
      }));
    }

    if (selectedData.includes('websockets')) {
      exportData.WebSockets = filterDataByDate(websockets).map(ws => ({
        'Timestamp': new Date(ws.timestamp).toISOString(),
        'Type': ws.type,
        'Event': ws.event || 'N/A',
        'Socket ID': ws.socketId || 'N/A',
        'URL': ws.url || 'N/A',
        'Data': JSON.stringify(ws.data || {}),
        'Error': ws.error || 'None'
      }));
    }

    if (selectedData.includes('logs')) {
      exportData.Logs = filterDataByDate(logs).map(log => ({
        'Timestamp': new Date(log.timestamp).toISOString(),
        'Level': log.level.toUpperCase(),
        'Category': log.category,
        'Message': log.message,
        'Source': log.source || 'Unknown',
        'Data': JSON.stringify(log.data || {}),
        'Stack': log.stack || 'N/A'
      }));
    }

    if (selectedData.includes('errors')) {
      exportData.Errors = filterDataByDate(errors).map(error => ({
        'Timestamp': new Date(error.timestamp).toISOString(),
        'Name': error.name,
        'Message': error.message,
        'Source': error.source || 'Unknown',
        'URL': error.url || 'N/A',
        'Stack Trace': error.stack || 'N/A',
        'Component Stack': error.componentStack || 'N/A',
        'User Agent': error.userAgent || 'N/A'
      }));
    }

    if (selectedData.includes('performance')) {
      exportData.Performance = filterDataByDate(performance).map(metric => ({
        'Timestamp': new Date(metric.timestamp).toISOString(),
        'Type': metric.type,
        'Name': metric.name,
        'Value': metric.value,
        'Unit': metric.unit,
        'Details': JSON.stringify(metric.details || {})
      }));
    }

    if (selectedData.includes('states')) {
      exportData.States = filterDataByDate(states).map(state => ({
        'Timestamp': new Date(state.timestamp).toISOString(),
        'Store': state.store,
        'Action': state.action || 'N/A',
        'Previous State': JSON.stringify(state.previousState || {}),
        'New State': JSON.stringify(state.newState || {}),
        'Diff': JSON.stringify(state.diff || {})
      }));
    }

    if (selectedData.includes('validations')) {
      exportData.Validations = filterDataByDate(validations).map(validation => ({
        'Timestamp': new Date(validation.timestamp).toISOString(),
        'Field': validation.field,
        'Value': JSON.stringify(validation.value),
        'Rule': validation.rule,
        'Valid': validation.valid ? 'Yes' : 'No',
        'Error': validation.error || 'None',
        'Context': validation.context || 'N/A'
      }));
    }

    return exportData;
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const data = prepareDataForExport();
      const workbook = XLSX.utils.book_new();

      Object.entries(data).forEach(([sheetName, sheetData]) => {
        if (sheetData.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(sheetData);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      });

      const fileName = `monitoring_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      onExport('excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const data = prepareDataForExport();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      console.log('🔍 CSV Export - Data prepared:', data);

      let hasData = false;
      Object.entries(data).forEach(([dataType, items]) => {
        console.log(`🔍 CSV Export - Processing ${dataType}:`, items.length, 'items');
        
        if (items.length > 0) {
          hasData = true;
          const headers = Object.keys(items[0]);
          console.log('🔍 CSV Export - Headers:', headers);
          
          const csvContent = [
            headers.join(','),
            ...items.map(item => 
              headers.map(header => {
                const value = item[header];
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                // Escape commas and quotes in CSV
                return `"${stringValue.replace(/"/g, '""')}"`;
              }).join(',')
            )
          ].join('\n');

          console.log('🔍 CSV Export - Content length:', csvContent.length);

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `${dataType.toLowerCase()}_${timestamp}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          console.log(`✅ CSV Export - ${dataType} exported successfully`);
        }
      });

      if (!hasData) {
        console.warn('⚠️ CSV Export - No data to export');
        alert('No hay datos para exportar. Asegúrate de que el monitoreo esté capturando información.');
      }

      onExport('csv');
    } catch (error) {
      console.error('❌ Error exporting to CSV:', error);
      alert(`Error al exportar CSV: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToTXT = () => {
    setIsExporting(true);
    try {
      const data = prepareDataForExport();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      console.log('🔍 TXT Export - Data prepared:', data);

      let fullContent = `MONITORING DATA EXPORT\n`;
      fullContent += `Generated: ${new Date().toLocaleString()}\n`;
      fullContent += `Date Range: ${dateRange}\n`;
      fullContent += `Selected Data: ${selectedData.join(', ')}\n`;
      fullContent += `\n${'='.repeat(80)}\n\n`;

      let hasData = false;
      Object.entries(data).forEach(([dataType, items]) => {
        console.log(`🔍 TXT Export - Processing ${dataType}:`, items.length, 'items');
        
        if (items.length === 0) return;
        
        hasData = true;
        fullContent += `${dataType.toUpperCase()}\n`;
        fullContent += `${'='.repeat(dataType.length)}\n`;
        fullContent += `Total items: ${items.length}\n\n`;

        items.forEach((item, index) => {
          fullContent += `--- Item ${index + 1} ---\n`;
          Object.entries(item).forEach(([key, value]) => {
            fullContent += `${key}: ${value}\n`;
          });
          fullContent += '\n';
        });

        fullContent += `\n${'='.repeat(80)}\n\n`;
      });

      if (!hasData) {
        fullContent += `NO DATA AVAILABLE\n`;
        fullContent += `The monitoring system may not be capturing data yet.\n`;
        fullContent += `Try interacting with the application to generate some data.\n`;
      }

      console.log('🔍 TXT Export - Content length:', fullContent.length);

      const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `monitoring_data_${timestamp}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ TXT Export - File exported successfully');
      
      if (!hasData) {
        alert('Se exportó un archivo vacío. El monitoreo puede no estar capturando datos aún. Intenta interactuar con la aplicación.');
      }

      onExport('txt');
    } catch (error) {
      console.error('❌ Error exporting to TXT:', error);
      alert(`Error al exportar TXT: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-modal-overlay">
      <div className="export-modal">
        <div className="export-modal-header">
          <h2>Exportar Datos de Monitoreo</h2>
          <button onClick={onClose} className="close-button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="export-modal-body">
          {/* Data Selection */}
          <div className="export-section">
            <h3>Seleccionar Datos</h3>
            <div className="data-options">
              {dataOptions.map(option => (
                <label key={option.id} className="data-option">
                  <input
                    type="checkbox"
                    checked={selectedData.includes(option.id)}
                    onChange={() => toggleDataSelection(option.id)}
                  />
                  <div className="option-content">
                    <option.icon className="w-4 h-4" />
                    <span className="option-label">{option.label}</span>
                    <span className="option-count">({option.count})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="export-section">
            <h3>Rango de Fechas</h3>
            <div className="date-range-options">
              <label className="date-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="all"
                  checked={dateRange === 'all'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                />
                <span>Todos los datos</span>
              </label>
              <label className="date-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="today"
                  checked={dateRange === 'today'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                />
                <span>Últimas 24 horas</span>
              </label>
              <label className="date-option">
                <input
                  type="radio"
                  name="dateRange"
                  value="hour"
                  checked={dateRange === 'hour'}
                  onChange={(e) => setDateRange(e.target.value as any)}
                />
                <span>Última hora</span>
              </label>
            </div>
          </div>

          {/* Export Format */}
          <div className="export-section">
            <h3>Formato de Exportación</h3>
            <div className="export-buttons">
              <button
                onClick={exportToExcel}
                disabled={isExporting || selectedData.length === 0}
                className="export-button excel"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <div className="button-content">
                  <span className="button-title">Excel (.xlsx)</span>
                  <span className="button-description">Múltiples hojas, ideal para análisis</span>
                </div>
              </button>

              <button
                onClick={exportToCSV}
                disabled={isExporting || selectedData.length === 0}
                className="export-button csv"
              >
                <Database className="w-5 h-5" />
                <div className="button-content">
                  <span className="button-title">CSV (.csv)</span>
                  <span className="button-description">Archivos separados por tipo de dato</span>
                </div>
              </button>

              <button
                onClick={exportToTXT}
                disabled={isExporting || selectedData.length === 0}
                className="export-button txt"
              >
                <FileText className="w-5 h-5" />
                <div className="button-content">
                  <span className="button-title">Texto (.txt)</span>
                  <span className="button-description">Formato legible para humanos</span>
                </div>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="export-summary">
            <h4>Resumen de Exportación</h4>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Tipos de datos seleccionados:</span>
                <span className="summary-value">{selectedData.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Rango de fechas:</span>
                <span className="summary-value">
                  {dateRange === 'all' && 'Todos los datos'}
                  {dateRange === 'today' && 'Últimas 24 horas'}
                  {dateRange === 'hour' && 'Última hora'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total aproximado de registros:</span>
                <span className="summary-value">
                  {selectedData.reduce((total, dataType) => {
                    const option = dataOptions.find(opt => opt.id === dataType);
                    return total + (option?.count || 0);
                  }, 0)}
                </span>
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="debug-info">
              <h5>🔍 Información de Debug</h5>
              <div className="debug-stats">
                {dataOptions.map(option => (
                  <div key={option.id} className="debug-item">
                    <span className="debug-label">{option.label}:</span>
                    <span className="debug-value">{option.count} registros</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  console.log('🔍 Debug - Current monitoring data:', {
                    apis: apis.length,
                    websockets: websockets.length,
                    logs: logs.length,
                    errors: errors.length,
                    performance: performance.length,
                    states: states.length,
                    validations: validations.length
                  });
                  console.log('🔍 Debug - Sample data:', {
                    apis: apis.slice(0, 2),
                    websockets: websockets.slice(0, 2),
                    logs: logs.slice(0, 2),
                    errors: errors.slice(0, 2)
                  });
                }}
                className="debug-button"
              >
                📊 Ver datos en consola
              </button>
            </div>
          </div>
        </div>

        <div className="export-modal-footer">
          <button onClick={onClose} className="cancel-button">
            Cancelar
          </button>
        </div>
      </div>

      <style jsx>{`
        .export-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          padding: 20px;
        }

        .export-modal {
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .export-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .export-modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .close-button {
          padding: 8px;
          border: none;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .export-modal-body {
          padding: 24px;
        }

        .export-section {
          margin-bottom: 32px;
        }

        .export-section h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .data-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .data-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .data-option:hover {
          border-color: #667eea;
          background: #f8fafc;
        }

        .data-option input[type="checkbox"] {
          margin: 0;
        }

        .option-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .option-label {
          font-weight: 500;
          color: #1f2937;
        }

        .option-count {
          color: #6b7280;
          font-size: 14px;
        }

        .date-range-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .date-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .date-option input[type="radio"] {
          margin: 0;
        }

        .export-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .export-button {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .export-button:hover:not(:disabled) {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }

        .export-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .export-button.excel:hover:not(:disabled) {
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .export-button.csv:hover:not(:disabled) {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .export-button.txt:hover:not(:disabled) {
          border-color: #f59e0b;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }

        .button-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .button-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }

        .button-description {
          color: #6b7280;
          font-size: 14px;
        }

        .export-summary {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .export-summary h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .summary-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .summary-label {
          color: #6b7280;
          font-size: 14px;
        }

        .summary-value {
          font-weight: 500;
          color: #1f2937;
          font-size: 14px;
        }

        .export-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }

        .cancel-button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cancel-button:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .debug-info {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .debug-info h5 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .debug-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .debug-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          background: #f3f4f6;
          border-radius: 4px;
          font-size: 12px;
        }

        .debug-label {
          color: #6b7280;
        }

        .debug-value {
          font-weight: 500;
          color: #1f2937;
        }

        .debug-button {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #f9fafb;
          color: #374151;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .debug-button:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        @media (max-width: 640px) {
          .export-modal {
            margin: 10px;
            max-width: none;
          }
          
          .data-options {
            grid-template-columns: 1fr;
          }
          
          .export-buttons {
            gap: 8px;
          }
          
          .export-button {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};
