import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  DollarSign, 
  Calendar, 
  Clock, 
  UserX, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Wrench, 
  Eye, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Search,
  Filter,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { extrasService, MovementRecord } from '../../../services/extrasService';
import { ExportService } from '../../../services/exportService';
import { useNotifications } from '../../../contexts/NotificationContext';

interface LocalMovementRecord {
  id: string;
  type: 'attendance' | 'absence' | 'overtime' | 'loan' | 'discount' | 'bonus' | 'deduction' | 'damage';
  date: string;
  description: string;
  amount: number; // Positivo = suma, Negativo = resta
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
  attachments?: string[];
  // Estado de pago
  paymentStatus?: 'unpaid' | 'paid';
  payrollId?: string; // ID de la nómina donde se pagó
  payrollPeriod?: string; // Período de la nómina (ej: "2025-09-14 - 2025-09-20")
  paidAt?: string; // Fecha cuando se pagó
  paidBy?: string; // Quién procesó el pago
  metadata?: {
    hours?: number;
    hourlyRate?: number;
    overtimeMultiplier?: number;
    loanTerms?: {
      installments: number;
      monthlyPayment: number;
    };
  };
}

interface EmployeeMovementsTableProps {
  employeeId: string;
  employee: any;
  onAddMovement: () => void;
}

const EmployeeMovementsTable: React.FC<EmployeeMovementsTableProps> = ({
  employeeId,
  employee,
  onAddMovement
}) => {
  const { showSuccess, showError } = useNotifications();
  const [movements, setMovements] = useState<LocalMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMovement, setSelectedMovement] = useState<LocalMovementRecord | null>(null);
  const [realMovements, setRealMovements] = useState<MovementRecord[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Calcular salario por día y por hora
  // Calcular salarios basados en el empleado real con manejo de errores
  const baseSalary = (() => {
    try {
      return employee?.contract?.salary || employee?.salary?.baseSalary || 25000;
    } catch (error) {
      console.error('Error obteniendo salario base:', error);
      return 25000;
    }
  })();
  
  const dailySalary = (() => {
    try {
      return baseSalary / 30; // Salario diario aproximado
    } catch (error) {
      console.error('Error calculando salario diario:', error);
      return 833.33; // Salario diario por defecto
    }
  })();
  
  const hourlyRate = (() => {
    try {
      return dailySalary / 8; // Salario por hora (8 horas/día)
    } catch (error) {
      console.error('Error calculando tarifa por hora:', error);
      return 104.17; // Tarifa por defecto
    }
  })();

  // Cargar datos reales de movimientos
  useEffect(() => {
    const loadMovementsData = async () => {
      try {
        setLoading(true);
        const records = await extrasService.getMovements(employeeId);
        setRealMovements(records);
        
        // Convertir MovementRecord a LocalMovementRecord
        const localMovements: LocalMovementRecord[] = records.map(record => ({
          id: record.id,
          type: record.type === 'deduction' ? 'deduction' : record.type as any,
          date: record.date,
          description: record.description,
          amount: record.impactType === 'add' ? record.calculatedAmount : -record.calculatedAmount,
          status: record.status as 'pending' | 'approved' | 'rejected',
          createdBy: record.registeredBy,
          createdAt: record.createdAt,
          attachments: record.attachments,
          // Estado de pago
          paymentStatus: record.paymentStatus || 'unpaid',
          payrollId: record.payrollId,
          payrollPeriod: record.payrollPeriod,
          paidAt: record.paidAt,
          paidBy: record.paidBy,
          metadata: {
            hours: record.hours,
            hourlyRate: hourlyRate,
            overtimeMultiplier: record.type === 'overtime' ? 1.5 : undefined,
            loanTerms: record.type === 'loan' ? {
              installments: record.totalAmount ? Math.ceil(record.totalAmount / (record.monthlyPayment || 1)) : 12,
              monthlyPayment: record.monthlyPayment || 0
            } : undefined
          }
        }));
        
        setMovements(localMovements);
      } catch (error) {
        console.error('Error cargando movimientos:', error);
        // Generar datos de ejemplo como fallback
        generateMockMovements();
      } finally {
        setLoading(false);
      }
    };

    const generateMockMovements = () => {
      const mockMovements: LocalMovementRecord[] = [
        // Asistencias (positivas)
        {
          id: 'MOV001',
          type: 'attendance',
          date: '2024-01-15',
          description: 'Jornada completa - 8 horas',
          amount: dailySalary, // Se suma el salario diario
          status: 'approved',
          createdBy: 'Sistema',
          createdAt: '2024-01-15T09:00:00Z',
          metadata: { hours: 8, hourlyRate }
        },
        {
          id: 'MOV002',
          type: 'attendance',
          date: '2024-01-16',
          description: 'Jornada completa - 8 horas',
          amount: dailySalary,
          status: 'approved',
          createdBy: 'Sistema',
          createdAt: '2024-01-16T09:00:00Z',
          metadata: { hours: 8, hourlyRate }
        },
        // Horas extra (positivas)
        {
          id: 'MOV003',
          type: 'overtime',
          date: '2024-01-15',
          description: 'Horas extra - Proyecto urgente',
          amount: 2 * hourlyRate * 1.5, // 2 horas × salario/hora × 1.5
          status: 'approved',
          createdBy: 'Juan Pérez',
          createdAt: '2024-01-15T18:30:00Z',
          paymentStatus: 'paid',
          payrollId: 'PAY001',
          payrollPeriod: '2024-01-15 - 2024-01-21',
          paidAt: '2024-01-22T10:00:00Z',
          paidBy: 'admin@company.com',
          metadata: { hours: 2, hourlyRate, overtimeMultiplier: 1.5 }
        },
        // Faltas (negativas)
        {
          id: 'MOV004',
          type: 'absence',
          date: '2024-01-17',
          description: 'Falta - Enfermedad',
          amount: -dailySalary, // Se resta el salario diario
          status: 'approved',
          createdBy: 'Ana García',
          createdAt: '2024-01-17T08:00:00Z'
        },
        // Bono (positivo)
        {
          id: 'MOV005',
          type: 'bonus',
          date: '2024-01-20',
          description: 'Bono por rendimiento - Q1 2024',
          amount: 3000, // Se suma el bono
          status: 'approved',
          createdBy: 'María López',
          createdAt: '2024-01-20T14:00:00Z',
          paymentStatus: 'paid',
          payrollId: 'PAY002',
          payrollPeriod: '2024-01-22 - 2024-01-28',
          paidAt: '2024-01-29T09:30:00Z',
          paidBy: 'admin@company.com'
        },
        // Préstamo (negativo)
        {
          id: 'MOV006',
          type: 'loan',
          date: '2024-01-10',
          description: 'Préstamo personal - $5,000',
          amount: -5000, // Se resta el monto del préstamo
          status: 'approved',
          createdBy: 'María López',
          createdAt: '2024-01-10T10:00:00Z',
          metadata: {
            loanTerms: {
              installments: 10,
              monthlyPayment: 500
            }
          }
        },
        // Bono (positivo)
        {
          id: 'MOV006',
          type: 'bonus',
          date: '2024-01-20',
          description: 'Bono por desempeño excepcional',
          amount: 2000, // Se suma el bono
          status: 'approved',
          createdBy: 'Carlos Ruiz',
          createdAt: '2024-01-20T14:00:00Z'
        },
        // Descuento (negativo)
        {
          id: 'MOV007',
          type: 'discount',
          date: '2024-01-18',
          description: 'Descuento por retraso - 30 min',
          amount: -hourlyRate * 0.5, // Se resta media hora de salario
          status: 'approved',
          createdBy: 'Sistema',
          createdAt: '2024-01-18T09:30:00Z',
          metadata: { hours: 0.5, hourlyRate }
        },
        // Daño (negativo)
        {
          id: 'MOV008',
          type: 'damage',
          date: '2024-01-19',
          description: 'Daño a equipo de oficina',
          amount: -1500, // Se resta el costo del daño
          status: 'pending',
          createdBy: 'Roberto Silva',
          createdAt: '2024-01-19T16:00:00Z'
        }
      ];

      setMovements(mockMovements);
    };

    if (employeeId) {
      loadMovementsData();
    }
  }, [employeeId, baseSalary, dailySalary, hourlyRate]);

  // Efecto para cerrar el menú de exportación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attendance': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absence': return <UserX className="h-4 w-4 text-red-500" />;
      case 'overtime': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'loan': return <CreditCard className="h-4 w-4 text-purple-500" />;
      case 'bonus': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'discount': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'deduction': return <Minus className="h-4 w-4 text-orange-500" />;
      case 'damage': return <Wrench className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'attendance': return 'Asistencia';
      case 'absence': return 'Falta';
      case 'overtime': return 'Horas Extra';
      case 'loan': return 'Préstamo';
      case 'bonus': return 'Bono';
      case 'discount': return 'Descuento';
      case 'deduction': return 'Deducción';
      case 'damage': return 'Daño';
      default: return 'Otro';
    }
  };

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

  const getPaymentStatusIcon = (movement: LocalMovementRecord) => {
    // Simular estado de pago basado en si tiene payrollId
    const paymentStatus = movement.payrollId ? 'paid' : 'unpaid';
    switch (paymentStatus) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unpaid': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentStatusLabel = (movement: LocalMovementRecord) => {
    // Simular estado de pago basado en si tiene payrollId
    const paymentStatus = movement.payrollId ? 'paid' : 'unpaid';
    switch (paymentStatus) {
      case 'paid': return movement.payrollPeriod || 'Pagado';
      case 'unpaid': return 'No Pagado';
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
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para exportar datos
  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      // Preparar datos para exportación
      const exportData = filteredMovements.map(movement => [
        getTypeLabel(movement.type),
        ExportService.formatDate(movement.date),
        ExportService.cleanText(movement.description),
        ExportService.formatCurrency(Math.abs(movement.amount)),
        getStatusLabel(movement.status),
        getPaymentStatusLabel(movement),
        movement.createdBy || '-'
      ]);

      const exportOptions = {
        filename: `movimientos-${new Date().toISOString().split('T')[0]}`,
        title: 'Registro de Movimientos',
        headers: [
          'Tipo',
          'Fecha',
          'Descripción',
          'Monto',
          'Estado',
          'Estado de Pago',
          'Registrado Por'
        ],
        data: exportData,
        format: format
      };

      await ExportService.export(exportOptions);
      
      showSuccess(
        'Exportación exitosa',
        `Registro de movimientos exportado en formato ${format.toUpperCase()}`
      );

    } catch (error) {
      console.error('Error exportando movimientos:', error);
      showError(
        'Error en exportación',
        'No se pudo exportar el registro de movimientos. Inténtalo de nuevo.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getTypeLabel(movement.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || movement.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPositive = movements
    .filter(m => m.amount > 0)
    .reduce((sum, m) => sum + m.amount, 0);

  const totalNegative = movements
    .filter(m => m.amount < 0)
    .reduce((sum, m) => sum + m.amount, 0);

  const netAmount = totalPositive + totalNegative;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
            <h3 className="text-lg font-semibold text-gray-900">Registro de Movimientos</h3>
            <p className="text-sm text-gray-600">
              Salario base: {formatCurrency(baseSalary)} | 
              Por día: {formatCurrency(dailySalary)} | 
              Por hora: {formatCurrency(hourlyRate)}
            </p>
          </div>
          <button
            onClick={onAddMovement}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Movimiento</span>
          </button>
        </div>

        {/* Resumen de Totales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total a Sumar</span>
            </div>
            <p className="text-lg font-bold text-green-900">{formatCurrency(totalPositive)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Total a Restar</span>
            </div>
            <p className="text-lg font-bold text-red-900">{formatCurrency(totalNegative)}</p>
          </div>
          <div className={`border rounded-lg p-3 ${netAmount >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center space-x-2">
              <DollarSign className={`h-4 w-4 ${netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <span className={`text-sm font-medium ${netAmount >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                Salario Neto
              </span>
            </div>
            <p className={`text-lg font-bold ${netAmount >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              {formatCurrency(netAmount)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar movimientos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="attendance">Asistencia</option>
              <option value="absence">Falta</option>
              <option value="overtime">Horas Extra</option>
              <option value="loan">Préstamo</option>
              <option value="bonus">Bono</option>
              <option value="discount">Descuento</option>
              <option value="deduction">Deducción</option>
              <option value="damage">Daño</option>
            </select>
          </div>
          <div className="relative" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting || filteredMovements.length === 0}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
            </button>
            
            {/* Menú desplegable de exportación */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span>Exportar Excel</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4 text-red-600" />
                  <span>Exportar PDF</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <File className="h-4 w-4 text-blue-600" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado de Pago
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registrado por
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMovements.length > 0 ? (
              filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(movement.type)}
                      <span className="text-sm font-medium text-gray-900">
                        {getTypeLabel(movement.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(movement.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <p className="truncate">{movement.description}</p>
                      {movement.metadata?.hours && (
                        <p className="text-xs text-gray-500">
                          {movement.metadata.hours}h @ {formatCurrency(movement.metadata.hourlyRate || 0)}/h
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {movement.amount > 0 ? (
                        <Plus className="h-3 w-3 text-green-500" />
                      ) : (
                        <Minus className="h-3 w-3 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        movement.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(movement.amount))}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(movement.status)}
                      <span className={`text-sm font-medium ${
                        movement.status === 'approved' ? 'text-green-600' :
                        movement.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {getStatusLabel(movement.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getPaymentStatusIcon(movement)}
                      <span className={`text-sm font-medium ${
                        movement.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {getPaymentStatusLabel(movement)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {movement.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedMovement(movement)}
                      className="text-orange-600 hover:text-orange-900 flex items-center space-x-1"
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
                  No se encontraron movimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      {selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Movimiento</h3>
                <button
                  onClick={() => setSelectedMovement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Tipo</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTypeIcon(selectedMovement.type)}
                      <span className="text-gray-900">{getTypeLabel(selectedMovement.type)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedMovement.date)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-900 mt-1">{selectedMovement.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Monto</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedMovement.amount > 0 ? (
                        <Plus className="h-4 w-4 text-green-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-lg font-bold ${
                        selectedMovement.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(Math.abs(selectedMovement.amount))}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Estado</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedMovement.status)}
                      <span className="text-gray-900">{getStatusLabel(selectedMovement.status)}</span>
                    </div>
                  </div>
                </div>
                
                {selectedMovement.metadata && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Detalles Adicionales</label>
                    <div className="mt-1 bg-gray-50 rounded-lg p-3">
                      {selectedMovement.metadata.hours && (
                        <p className="text-sm text-gray-700">
                          <strong>Horas:</strong> {selectedMovement.metadata.hours}h
                        </p>
                      )}
                      {selectedMovement.metadata.hourlyRate && (
                        <p className="text-sm text-gray-700">
                          <strong>Tarifa por hora:</strong> {formatCurrency(selectedMovement.metadata.hourlyRate)}
                        </p>
                      )}
                      {selectedMovement.metadata.overtimeMultiplier && (
                        <p className="text-sm text-gray-700">
                          <strong>Multiplicador:</strong> {selectedMovement.metadata.overtimeMultiplier}x
                        </p>
                      )}
                      {selectedMovement.metadata.loanTerms && (
                        <div className="text-sm text-gray-700">
                          <p><strong>Cuotas:</strong> {selectedMovement.metadata.loanTerms.installments}</p>
                          <p><strong>Pago mensual:</strong> {formatCurrency(selectedMovement.metadata.loanTerms.monthlyPayment)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Registrado por</label>
                    <p className="text-gray-900 mt-1">{selectedMovement.createdBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha de registro</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedMovement.createdAt).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedMovement(null)}
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

export default EmployeeMovementsTable;
