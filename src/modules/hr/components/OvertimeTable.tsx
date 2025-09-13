import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  DollarSign
} from 'lucide-react';
import { extrasService } from '../../../services/extrasService';

interface OvertimeRecord {
  id: string;
  date: string;
  description: string;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  type: 'regular' | 'weekend' | 'holiday';
  location: 'office' | 'remote' | 'field';
  attachments?: string[];
}

interface OvertimeTableProps {
  employeeId: string;
  employee: {
    contract?: { salary?: number };
    salary?: { baseSalary?: number };
  };
  onAddOvertime: () => void;
}

const OvertimeTable: React.FC<OvertimeTableProps> = ({
  employeeId,
  employee,
  onAddOvertime
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<OvertimeRecord | null>(null);
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Calcular tarifa por hora basada en el salario real con manejo de errores
  const baseSalary = (() => {
    try {
      return employee?.contract?.salary || employee?.salary?.baseSalary || 25000;
    } catch (error) {
      console.error('Error obteniendo salario base:', error);
      return 25000;
    }
  })();
  
  const hourlyRate = (() => {
    try {
      return (baseSalary / 30) / 8; // Salario por hora
    } catch (error) {
      console.error('Error calculando tarifa por hora:', error);
      return 104.17; // Tarifa por defecto
    }
  })();

  // Cargar datos de horas extra
  useEffect(() => {
    const loadOvertimeData = async () => {
      try {
        setLoading(true);
        const records = await extrasService.getOvertimeRecords(employeeId);
        
        // Convertir MovementRecord a OvertimeRecord
        const overtimeData: OvertimeRecord[] = records.map(record => ({
          id: record.id,
          date: record.date,
          description: record.description,
          hours: record.hours || 0,
          hourlyRate: hourlyRate,
          totalAmount: record.calculatedAmount || record.amount,
          status: record.status as 'pending' | 'approved' | 'rejected',
          approvedBy: record.approvedBy,
          approvedAt: record.approvedAt,
          type: 'regular', // Se puede mapear desde metadata
          location: record.location || 'office',
          attachments: record.attachments
        }));
        
        setOvertimeRecords(overtimeData);
      } catch (err) {
        let errorMessage = 'Error cargando horas extra';
        
        if (err instanceof Error) {
          if (err.message.includes('400')) {
            errorMessage = 'Datos inválidos para cargar horas extra';
          } else if (err.message.includes('404')) {
            errorMessage = 'No se encontraron datos de horas extra para este empleado';
          } else if (err.message.includes('500')) {
            errorMessage = 'Error del servidor. Inténtalo de nuevo más tarde';
          } else if (err.message.includes('Network Error') || err.message.includes('timeout')) {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet';
          } else {
            errorMessage = err.message;
          }
        }
        
        console.error('Error cargando horas extra:', err);
        setError(errorMessage);
        setOvertimeRecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      loadOvertimeData();
    }
  }, [employeeId, hourlyRate, retryCount]);

  // Función para reintentar la carga de datos
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  // Datos de ejemplo (fallback)
  const fallbackOvertimeRecords: OvertimeRecord[] = [
    {
      id: 'OT001',
      date: '2024-01-14',
      description: 'Reunión con cliente - Proyecto urgente',
      hours: 2.5,
      hourlyRate: hourlyRate,
      totalAmount: 2.5 * hourlyRate * 1.5, // 1.5x para horas extra regulares
      status: 'approved',
      approvedBy: 'Juan Pérez',
      approvedAt: '2024-01-14T20:00:00Z',
      type: 'regular',
      location: 'office',
      attachments: ['meeting_notes.pdf']
    },
    {
      id: 'OT002',
      date: '2024-01-16',
      description: 'Finalización de proyecto - Entrega urgente',
      hours: 4.0,
      hourlyRate: hourlyRate,
      totalAmount: 4.0 * hourlyRate * 1.5,
      status: 'approved',
      approvedBy: 'María López',
      approvedAt: '2024-01-16T22:00:00Z',
      type: 'regular',
      location: 'office',
      attachments: ['project_report.pdf']
    },
    {
      id: 'OT003',
      date: '2024-01-20',
      description: 'Trabajo en fin de semana - Implementación',
      hours: 6.0,
      hourlyRate: hourlyRate,
      totalAmount: 6.0 * hourlyRate * 2.0, // 2x para fines de semana
      status: 'pending',
      type: 'weekend',
      location: 'remote',
      attachments: []
    },
    {
      id: 'OT004',
      date: '2024-01-22',
      description: 'Soporte técnico - Emergencia',
      hours: 1.5,
      hourlyRate: hourlyRate,
      totalAmount: 1.5 * hourlyRate * 1.5,
      status: 'rejected',
      approvedBy: 'Carlos Ruiz',
      approvedAt: '2024-01-22T19:30:00Z',
      type: 'regular',
      location: 'office',
      attachments: ['incident_report.pdf']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'regular': return 'Regular';
      case 'weekend': return 'Fin de Semana';
      case 'holiday': return 'Festivo';
      default: return 'Regular';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'office': return '🏢';
      case 'remote': return '🏠';
      case 'field': return '🌍';
      default: return '🏢';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredRecords = (overtimeRecords.length > 0 ? overtimeRecords : fallbackOvertimeRecords).filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.date.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalHours = overtimeRecords
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.hours, 0);

  const totalAmount = overtimeRecords
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando horas extra...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <AlertTriangle className="w-full h-full" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar horas extra</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reintentar</span>
            </button>
            <button
              onClick={clearError}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Registro de Horas Extra</h3>
            <p className="text-sm text-gray-600">
              Tarifa por hora: {formatCurrency(hourlyRate)} | 
              Total aprobado: {totalHours}h ({formatCurrency(totalAmount)})
            </p>
          </div>
          <button
            onClick={onAddOvertime}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Horas Extra</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por fecha o descripción..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                FECHA
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DESCRIPCIÓN
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                HORAS
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TIPO
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MONTO
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UBICACIÓN
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ESTADO
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                APROBADO POR
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <p className="truncate">{record.description}</p>
                    {record.attachments && record.attachments.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        📎 {record.attachments.length} archivo(s)
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{record.hours}h</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTypeLabel(record.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-600">
                        {formatCurrency(record.totalAmount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span>{getLocationIcon(record.location)}</span>
                      <span className="capitalize">{record.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.approvedBy || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron registros de horas extra.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles de Horas Extra</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedRecord.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Estado</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedRecord.status)}
                      <span className="text-gray-900">{getStatusLabel(selectedRecord.status)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-900 mt-1">{selectedRecord.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Horas</label>
                    <p className="text-gray-900 mt-1 font-medium">{selectedRecord.hours}h</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Tipo</label>
                    <p className="text-gray-900 mt-1">{getTypeLabel(selectedRecord.type)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Ubicación</label>
                    <p className="text-gray-900 mt-1 capitalize">{selectedRecord.location}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Cálculo de Pago</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>Tarifa base: {formatCurrency(selectedRecord.hourlyRate)}/h</p>
                    <p>Multiplicador: {selectedRecord.type === 'weekend' ? '2.0x' : '1.5x'}</p>
                    <p>Horas: {selectedRecord.hours}h</p>
                    <p className="font-semibold">Total: {formatCurrency(selectedRecord.totalAmount)}</p>
                  </div>
                </div>
                
                {selectedRecord.approvedBy && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Aprobado por</label>
                      <p className="text-gray-900 mt-1">{selectedRecord.approvedBy}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Fecha de aprobación</label>
                      <p className="text-gray-900 mt-1">
                        {selectedRecord.approvedAt ? new Date(selectedRecord.approvedAt).toLocaleString('es-MX') : '-'}
                      </p>
                    </div>
                  </div>
                )}
                
                {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Archivos adjuntos</label>
                    <div className="mt-1 space-y-1">
                      {selectedRecord.attachments.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>📎</span>
                          <span>{file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OvertimeTable;
