import React, { useState } from 'react';
import { 
  UserX, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Heart,
  Car,
  Home
} from 'lucide-react';

interface AbsenceRecord {
  id: string;
  date: string;
  reason: string;
  type: 'sick_leave' | 'personal_leave' | 'vacation' | 'emergency' | 'medical_appointment' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  duration: number; // en días
  approvedBy?: string;
  approvedAt?: string;
  justification?: string;
  attachments?: string[];
  salaryDeduction: number;
}

interface AbsencesTableProps {
  employeeId: string;
  employee: any;
  onAddAbsence: () => void;
}

const AbsencesTable: React.FC<AbsencesTableProps> = ({
  employeeId,
  employee,
  onAddAbsence
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<AbsenceRecord | null>(null);

  // Calcular salario diario basado en el salario real
  const baseSalary = employee?.contract?.salary || employee?.salary?.baseSalary || 0;
  const dailySalary = baseSalary / 30; // Salario diario

  // Datos de ejemplo
  const absenceRecords: AbsenceRecord[] = [
    {
      id: 'ABS001',
      date: '2024-01-19',
      reason: 'Gripe - Fiebre alta',
      type: 'sick_leave',
      status: 'approved',
      duration: 1,
      approvedBy: 'Juan Pérez',
      approvedAt: '2024-01-19T08:30:00Z',
      justification: 'Certificado médico presentado',
      attachments: ['medical_certificate.pdf'],
      salaryDeduction: -dailySalary
    },
    {
      id: 'ABS002',
      date: '2024-01-25',
      reason: 'Cita médica - Dentista',
      type: 'medical_appointment',
      status: 'approved',
      duration: 0.5,
      approvedBy: 'María López',
      approvedAt: '2024-01-24T16:00:00Z',
      justification: 'Cita programada con anticipación',
      attachments: ['appointment_confirmation.pdf'],
      salaryDeduction: -dailySalary * 0.5
    },
    {
      id: 'ABS003',
      date: '2024-02-02',
      reason: 'Emergencia familiar',
      type: 'emergency',
      status: 'pending',
      duration: 2,
      justification: 'Fallecimiento de familiar cercano',
      attachments: [],
      salaryDeduction: -dailySalary * 2
    },
    {
      id: 'ABS004',
      date: '2024-02-10',
      reason: 'Vacaciones personales',
      type: 'vacation',
      status: 'approved',
      duration: 3,
      approvedBy: 'Carlos Ruiz',
      approvedAt: '2024-02-08T14:00:00Z',
      justification: 'Vacaciones aprobadas con 2 semanas de anticipación',
      attachments: ['vacation_request.pdf'],
      salaryDeduction: 0 // Las vacaciones no descuentan salario
    },
    {
      id: 'ABS005',
      date: '2024-02-15',
      reason: 'Asunto personal',
      type: 'personal_leave',
      status: 'rejected',
      duration: 1,
      approvedBy: 'Ana García',
      approvedAt: '2024-02-14T17:00:00Z',
      justification: 'No se proporcionó justificación suficiente',
      attachments: [],
      salaryDeduction: -dailySalary
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sick_leave': return <Heart className="h-4 w-4 text-red-500" />;
      case 'medical_appointment': return <Heart className="h-4 w-4 text-blue-500" />;
      case 'vacation': return <Car className="h-4 w-4 text-green-500" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'personal_leave': return <Home className="h-4 w-4 text-purple-500" />;
      default: return <UserX className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sick_leave': return 'Enfermedad';
      case 'medical_appointment': return 'Cita Médica';
      case 'vacation': return 'Vacaciones';
      case 'emergency': return 'Emergencia';
      case 'personal_leave': return 'Asunto Personal';
      case 'other': return 'Otro';
      default: return 'Desconocido';
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

  const filteredRecords = absenceRecords.filter(record => {
    const matchesSearch = record.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.date.includes(searchTerm) ||
                         getTypeLabel(record.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter = filterStatus === 'all' || record.status === filterStatus;
    const matchesTypeFilter = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesStatusFilter && matchesTypeFilter;
  });

  const totalDays = absenceRecords
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.duration, 0);

  const totalDeduction = absenceRecords
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.salaryDeduction, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Registro de Ausencias</h3>
            <p className="text-sm text-gray-600">
              Salario diario: {formatCurrency(dailySalary)} | 
              Total días: {totalDays} | 
              Descuento total: {formatCurrency(totalDeduction)}
            </p>
          </div>
          <button
            onClick={onAddAbsence}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Ausencia</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por fecha, razón o tipo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
          <div className="relative">
            <select
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="sick_leave">Enfermedad</option>
              <option value="medical_appointment">Cita Médica</option>
              <option value="vacation">Vacaciones</option>
              <option value="emergency">Emergencia</option>
              <option value="personal_leave">Asunto Personal</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
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
                RAZÓN
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TIPO
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DURACIÓN
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DESCUENTO
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
                    <p className="truncate">{record.reason}</p>
                    {record.attachments && record.attachments.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        📎 {record.attachments.length} archivo(s)
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(record.type)}
                      <span>{getTypeLabel(record.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">
                        {record.duration} {record.duration === 1 ? 'día' : 'días'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <span className={`font-medium ${
                        record.salaryDeduction === 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {record.salaryDeduction === 0 ? 'Sin descuento' : formatCurrency(Math.abs(record.salaryDeduction))}
                      </span>
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
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron registros de ausencias.
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
                <h3 className="text-lg font-semibold text-gray-900">Detalles de Ausencia</h3>
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
                  <label className="block text-sm font-medium text-gray-600">Razón</label>
                  <p className="text-gray-900 mt-1">{selectedRecord.reason}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Tipo</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTypeIcon(selectedRecord.type)}
                      <span className="text-gray-900">{getTypeLabel(selectedRecord.type)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Duración</label>
                    <p className="text-gray-900 mt-1 font-medium">
                      {selectedRecord.duration} {selectedRecord.duration === 1 ? 'día' : 'días'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Descuento</label>
                    <p className={`mt-1 font-medium ${
                      selectedRecord.salaryDeduction === 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedRecord.salaryDeduction === 0 ? 'Sin descuento' : formatCurrency(Math.abs(selectedRecord.salaryDeduction))}
                    </p>
                  </div>
                </div>
                
                {selectedRecord.justification && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Justificación</label>
                    <p className="text-gray-900 mt-1">{selectedRecord.justification}</p>
                  </div>
                )}
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Cálculo de Descuento</h4>
                  <div className="space-y-1 text-sm text-red-800">
                    <p>Salario diario: {formatCurrency(dailySalary)}</p>
                    <p>Duración: {selectedRecord.duration} {selectedRecord.duration === 1 ? 'día' : 'días'}</p>
                    <p>Tipo: {getTypeLabel(selectedRecord.type)}</p>
                    {selectedRecord.type === 'vacation' ? (
                      <p className="font-semibold text-green-600">Sin descuento (Vacaciones)</p>
                    ) : (
                      <p className="font-semibold">Descuento: {formatCurrency(Math.abs(selectedRecord.salaryDeduction))}</p>
                    )}
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

export default AbsencesTable;
