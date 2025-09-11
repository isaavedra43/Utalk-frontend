import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

interface ImportEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export const ImportEmployeesModal: React.FC<ImportEmployeesModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;
    
    try {
      // Simular lectura del archivo Excel
      // En una implementación real, usarías una librería como xlsx
      const mockData = [
        {
          'Número Empleado': 'EMP001',
          'Nombre': 'Ana',
          'Apellido': 'García',
          'Email': 'ana.garcia@empresa.com',
          'Teléfono': '+52 55 1234 5678',
          'RFC': 'GARA920315MDF',
          'CURP': 'GARA920315MDFNNS01',
          'NSS': '12345678901',
          'Puesto': 'Gerente de Marketing',
          'Departamento': 'Marketing',
          'Sueldo Base': '30000',
          'SBC': '32000',
          'Fecha Ingreso': '2022-03-15'
        },
        {
          'Número Empleado': 'EMP002',
          'Nombre': 'Carlos',
          'Apellido': 'López',
          'Email': 'carlos.lopez@empresa.com',
          'Teléfono': '+52 55 2345 6789',
          'RFC': 'LOPC850820HDF',
          'CURP': 'LOPC850820HDFNNS02',
          'NSS': '23456789012',
          'Puesto': 'Desarrollador Senior',
          'Departamento': 'Tecnología',
          'Sueldo Base': '40000',
          'SBC': '42000',
          'Fecha Ingreso': '2021-08-20'
        }
      ];
      
      setPreviewData(mockData);
      setShowPreview(true);
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      alert('Error al leer el archivo. Por favor verifica que sea un archivo Excel válido.');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    try {
      await onImport(selectedFile);
      
      // Simular resultado de importación
      const mockResult: ImportResult = {
        total: 2,
        successful: 2,
        failed: 0,
        errors: []
      };
      
      setImportResult(mockResult);
    } catch (error) {
      console.error('Error al importar empleados:', error);
      const mockResult: ImportResult = {
        total: 2,
        successful: 1,
        failed: 1,
        errors: [
          {
            row: 2,
            field: 'Email',
            message: 'El email ya existe en el sistema'
          }
        ]
      };
      setImportResult(mockResult);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Crear un archivo Excel de plantilla
    const templateData = [
      {
        'Número Empleado': 'EMP001',
        'Nombre': 'Ana',
        'Apellido': 'García',
        'Email': 'ana.garcia@empresa.com',
        'Teléfono': '+52 55 1234 5678',
        'RFC': 'GARA920315MDF',
        'CURP': 'GARA920315MDFNNS01',
        'NSS': '12345678901',
        'Fecha Nacimiento': '1992-03-15',
        'Género': 'Femenino',
        'Estado Civil': 'Soltero',
        'Puesto': 'Gerente de Marketing',
        'Departamento': 'Marketing',
        'Nivel': 'Senior',
        'Reporta a': 'CEO',
        'Sueldo Base': '30000',
        'SBC': '32000',
        'Fecha Ingreso': '2022-03-15',
        'Tipo Contrato': 'Permanente',
        'Horas Trabajo': '40',
        'Saldo Vacaciones': '15',
        'Saldo Enfermedad': '5',
        'Calle': 'Av. Reforma',
        'Número': '123',
        'Colonia': 'Centro',
        'Ciudad': 'Ciudad de México',
        'Estado': 'CDMX',
        'Código Postal': '06000',
        'Contacto Emergencia': 'María García',
        'Relación': 'Madre',
        'Teléfono Emergencia': '+52 55 9876 5432',
        'Banco': 'BBVA',
        'Número Cuenta': '0123456789',
        'CLABE': '012345678901234567'
      }
    ];
    
    // En una implementación real, generarías un archivo Excel real
    console.log('Descargando plantilla...', templateData);
    alert('Plantilla descargada (simulado)');
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportResult(null);
    setShowPreview(false);
    setPreviewData([]);
    setDragActive(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Importar Empleados</h2>
            <p className="text-sm text-gray-600 mt-1">
              Importa múltiples empleados desde un archivo Excel
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {!importResult ? (
            <div className="space-y-6">
              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Instrucciones de Importación</h3>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Descarga la plantilla Excel para asegurar el formato correcto</li>
                      <li>• Completa todos los campos obligatorios marcados con *</li>
                      <li>• Verifica que los emails sean únicos y válidos</li>
                      <li>• Las fechas deben estar en formato YYYY-MM-DD</li>
                      <li>• Los números deben ser valores numéricos sin símbolos de moneda</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Descargar plantilla */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Plantilla Excel</h3>
                    <p className="text-sm text-gray-600">Descarga la plantilla con el formato correcto</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Descargar Plantilla</span>
                </button>
              </div>

              {/* Zona de carga */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-400 bg-blue-50'
                    : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <FileSpreadsheet className="h-12 w-12 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedFile.name}</h3>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cambiar Archivo
                      </button>
                      <button
                        onClick={handlePreview}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Vista Previa</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Upload className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Arrastra tu archivo Excel aquí
                      </h3>
                      <p className="text-sm text-gray-600">
                        o haz clic para seleccionar un archivo
                      </p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Vista previa */}
              {showPreview && previewData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Vista Previa de Datos</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <EyeOff className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(previewData[0]).map((key) => (
                              <th
                                key={key}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {previewData.slice(0, 5).map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                                >
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {previewData.length > 5 && (
                      <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600">
                        Mostrando 5 de {previewData.length} registros
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Resultado de importación */
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {importResult.failed === 0 ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-16 w-16 text-yellow-500" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {importResult.failed === 0 ? 'Importación Exitosa' : 'Importación Completada con Errores'}
                </h3>
                <p className="text-gray-600">
                  {importResult.failed === 0
                    ? `Se importaron ${importResult.successful} empleados correctamente`
                    : `Se importaron ${importResult.successful} empleados, ${importResult.failed} fallaron`}
                </p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-gray-900">{importResult.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-green-900">{importResult.successful}</div>
                  <div className="text-sm text-green-600">Exitosos</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-red-900">{importResult.failed}</div>
                  <div className="text-sm text-red-600">Fallidos</div>
                </div>
              </div>

              {/* Errores */}
              {importResult.errors.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Errores Encontrados</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium">Fila {error.row}:</span>
                            <span className="text-gray-700 ml-1">
                              {error.field} - {error.message}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {importResult ? 'Cerrar' : 'Cancelar'}
          </button>

          {!importResult && selectedFile && (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isImporting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Importando...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Importar Empleados</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
