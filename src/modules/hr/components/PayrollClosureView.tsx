import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Unlock,
  ArrowLeft, 
  ArrowRight,
  Users, 
  DollarSign, 
  Clock,
  Eye,
  Search,
  Filter,
  User,
  Mail,
  FileText,
  AlertCircle,
  Info,
  Shield,
  Calendar,
  Building,
  CreditCard,
  Receipt,
  Check,
  X,
  Save,
  AlertTriangle as WarningIcon,
  Download
} from 'lucide-react';

// Interfaces actualizadas para coincidir con PayrollApprovalView
interface EmployeePayrollApproval {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    location: string;
    employeeId: string;
  };
  originalPayroll: {
    baseSalary: number;
    overtime: number;
    bonuses: number;
    allowances: number;
    totalEarnings: number;
    taxes: number;
    benefits: number;
    otherDeductions: number;
    totalDeductions: number;
    netPay: number;
  };
  adjustments: Array<{
    id: string;
    employeeId: string;
    type: 'bonus' | 'deduction' | 'overtime' | 'allowance' | 'tax' | 'other';
    name: string;
    amount: number;
    description: string;
    reason: string;
    approved: boolean;
    createdBy: string;
    createdAt: string;
    approvedBy?: string;
    approvedAt?: string;
  }>;
  finalPayroll: {
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cash' | 'deposit' | 'check' | 'transfer' | 'other';
  receiptStatus: 'pending' | 'uploaded';
  receiptUrl?: string;
  receiptUploadedAt?: string;
  notes?: string;
  faltas: number;
  lastUpdated: string;
}

interface PayrollClosureSummary {
  totalEmployees: number;
  pendingApprovals: number;
  approved: number;
  pendingPayments: number;
  paid: number;
  totalAmount: number;
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  canClose: boolean;
  blockingIssues: string[];
  payrollFolio: string;
}

interface PayrollClosureViewProps {
  approvedData: EmployeePayrollApproval[];
  onComplete: () => void;
  onBack: () => void;
}

const PayrollClosureView: React.FC<PayrollClosureViewProps> = ({ 
  approvedData, 
  onComplete, 
  onBack 
}) => {
  // Estados principales
  const [employees, setEmployees] = useState<EmployeePayrollApproval[]>([]);
  const [summary, setSummary] = useState<PayrollClosureSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [closureNotes, setClosureNotes] = useState('');
  const [sendNotifications, setSendNotifications] = useState(true);
  const [generateReports, setGenerateReports] = useState(true);

  // Datos mock actualizados para coincidir con la ventana de aprobación
  const mockEmployees: EmployeePayrollApproval[] = [
    {
      id: '1',
      personalInfo: {
        name: 'Ana García López',
        email: 'ana.garcia@empresa.com',
        phone: '+52 55 1234 5678',
        position: 'Desarrolladora Senior',
        department: 'Tecnología',
        location: 'Ciudad de México',
        employeeId: 'EMP001'
      },
      originalPayroll: {
        baseSalary: 45000,
        overtime: 4500,
        bonuses: 4000,
        allowances: 3500,
        totalEarnings: 55500,
        taxes: 9700,
        benefits: 1600,
        otherDeductions: 0,
        totalDeductions: 11300,
        netPay: 44200
      },
      adjustments: [
        {
          id: 'adj1',
          employeeId: '1',
          type: 'bonus',
          name: 'Bono de Proyecto Especial',
          amount: 2000,
          description: 'Bono por completar proyecto crítico',
          reason: 'Proyecto completado antes del plazo',
          approved: true,
          createdBy: 'Gerente de Proyecto',
          createdAt: '2024-01-30T10:00:00Z',
          approvedBy: 'RH Manager',
          approvedAt: '2024-01-30T14:00:00Z'
        },
        {
          id: 'adj2',
          employeeId: '1',
          type: 'deduction',
          name: 'Préstamo Personal',
          amount: 1500,
          description: 'Deducción por préstamo personal',
          reason: 'Préstamo autorizado por RH',
          approved: true,
          createdBy: 'RH Manager',
          createdAt: '2024-01-29T09:00:00Z',
          approvedBy: 'RH Manager',
          approvedAt: '2024-01-29T09:00:00Z'
        }
      ],
      finalPayroll: {
        totalEarnings: 57500,
        totalDeductions: 12800,
        netPay: 44700
      },
      status: 'approved',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      receiptStatus: 'uploaded',
      receiptUrl: '/receipts/ana-garcia-2024-01.pdf',
      receiptUploadedAt: '2024-01-30T15:00:00Z',
      notes: 'Todos los ajustes aprobados correctamente',
      faltas: 0,
      lastUpdated: '2024-01-30T14:00:00Z'
    },
    {
      id: '2',
      personalInfo: {
        name: 'Carlos Mendoza Ruiz',
        email: 'carlos.mendoza@empresa.com',
        phone: '+52 55 2345 6789',
        position: 'Gerente de Ventas',
        department: 'Ventas',
        location: 'Guadalajara',
        employeeId: 'EMP002'
      },
      originalPayroll: {
        baseSalary: 55000,
        overtime: 3600,
        bonuses: 8000,
        allowances: 5000,
        totalEarnings: 71600,
        taxes: 13500,
        benefits: 1400,
        otherDeductions: 0,
        totalDeductions: 14900,
        netPay: 56700
      },
      adjustments: [
        {
          id: 'adj3',
          employeeId: '2',
          type: 'bonus',
          name: 'Bono de Ventas Excepcionales',
          amount: 5000,
          description: 'Bono por superar metas de ventas en 150%',
          reason: 'Excelente desempeño en ventas del mes',
          approved: false,
          createdBy: 'Director de Ventas',
          createdAt: '2024-01-30T11:00:00Z'
        }
      ],
      finalPayroll: {
        totalEarnings: 76600,
        totalDeductions: 14900,
        netPay: 61700
      },
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      receiptStatus: 'pending',
      notes: 'Pendiente aprobación de bono de ventas',
      faltas: 2,
      lastUpdated: '2024-01-30T11:00:00Z'
    },
    {
      id: '3',
      personalInfo: {
        name: 'María Elena Torres',
        email: 'maria.torres@empresa.com',
        phone: '+52 55 3456 7890',
        position: 'Analista de Recursos Humanos',
        department: 'Recursos Humanos',
        location: 'Monterrey',
        employeeId: 'EMP003'
      },
      originalPayroll: {
        baseSalary: 35000,
        overtime: 1500,
        bonuses: 2000,
        allowances: 1500,
        totalEarnings: 40000,
        taxes: 6900,
        benefits: 800,
        otherDeductions: 0,
        totalDeductions: 7700,
        netPay: 32300
      },
      adjustments: [],
      finalPayroll: {
        totalEarnings: 40000,
        totalDeductions: 7700,
        netPay: 32300
      },
      status: 'approved',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      receiptStatus: 'pending',
      notes: 'Sin ajustes requeridos',
      faltas: 1,
      lastUpdated: '2024-01-30T12:00:00Z'
    }
  ];

  // Cargar datos de cierre
  useEffect(() => {
    const loadClosureData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Cargando datos de cierre de nómina...');
        
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEmployees(mockEmployees);
        
        // Calcular resumen y validaciones
        const pendingApprovals = mockEmployees.filter(emp => emp.status === 'pending').length;
        const approved = mockEmployees.filter(emp => emp.status === 'approved').length;
        const pendingPayments = mockEmployees.filter(emp => emp.paymentStatus === 'pending').length;
        const paid = mockEmployees.filter(emp => emp.paymentStatus === 'paid').length;
        
        // Verificar si se puede cerrar la nómina
        const blockingIssues: string[] = [];
        if (pendingApprovals > 0) {
          blockingIssues.push(`${pendingApprovals} empleado(s) pendiente(s) de aprobación`);
        }
        if (pendingPayments > 0) {
          blockingIssues.push(`${pendingPayments} empleado(s) pendiente(s) de pago`);
        }
        
        const canClose = blockingIssues.length === 0;
        
        // Generar folio único de la nómina
        const generatePayrollFolio = () => {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          return `NOM-${year}${month}${day}-${random}`;
        };

        const summaryData: PayrollClosureSummary = {
          totalEmployees: mockEmployees.length,
          pendingApprovals,
          approved,
          pendingPayments,
          paid,
          totalAmount: mockEmployees.reduce((sum, emp) => sum + emp.finalPayroll.netPay, 0),
          period: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            type: 'Mensual'
          },
          createdBy: 'Juan Pérez - Gerente de RH',
          createdAt: '2024-01-30T08:00:00Z',
          lastUpdated: new Date().toISOString(),
          canClose,
          blockingIssues,
          payrollFolio: generatePayrollFolio()
        };
        
        setSummary(summaryData);
        console.log('✅ Datos de cierre cargados');
        
      } catch (error) {
        console.error('❌ Error cargando datos de cierre:', error);
        setError('Error al cargar los datos de cierre');
      } finally {
        setLoading(false);
      }
    };

    loadClosureData();
  }, []);

  // Funciones de utilidad
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      case 'needs_review': return 'Requiere Revisión';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Falló';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'deposit': return 'Depósito';
      case 'check': return 'Cheque';
      case 'transfer': return 'Transferencia';
      case 'other': return 'Otro';
      default: return 'Efectivo';
    }
  };

  const getReceiptStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const getReceiptStatusText = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Subido';
      case 'pending': return 'Pendiente';
      default: return 'Pendiente';
    }
  };

  // Filtros
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.personalInfo.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Función para cerrar nómina
  const handleClosePayroll = async () => {
    if (!summary?.canClose) {
      alert('No se puede cerrar la nómina. Hay empleados pendientes de aprobación o pago.');
      return;
    }

    setIsClosing(true);
    try {
      console.log('🔒 Cerrando nómina...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular cierre exitoso
      console.log('✅ Nómina cerrada exitosamente');
      alert('Nómina cerrada exitosamente');
      
      // Llamar callback de completado
      onComplete();
      
    } catch (error) {
      console.error('❌ Error cerrando nómina:', error);
      alert('Error al cerrar la nómina');
    } finally {
      setIsClosing(false);
    }
  };

  // Función para ver el recibo del empleado
  const handleViewReceipt = (employee: EmployeePayrollApproval) => {
    if (employee.receiptStatus === 'uploaded' && employee.receiptUrl) {
      try {
        console.log('Ver recibo de:', employee.personalInfo.name);
        // Abrir el recibo en una nueva pestaña
        window.open(employee.receiptUrl, '_blank');
      } catch (error) {
        console.error('Error al abrir recibo:', error);
        alert('No se pudo abrir el recibo del empleado');
      }
    } else {
      alert('No hay recibo disponible para este empleado');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando resumen de cierre...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resumen de Cierre de Nómina</h1>
          <p className="text-gray-600 mt-1">
            Revisa el estado final antes de cerrar la nómina
          </p>
          {summary?.payrollFolio && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Folio:</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {summary.payrollFolio}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Aprobación
          </button>
          
          <button
            onClick={handleClosePayroll}
            disabled={isClosing || !summary?.canClose}
            className={`flex items-center px-4 py-2 rounded-lg ${
              summary?.canClose 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Lock className="h-4 w-4 mr-2" />
            {isClosing ? 'Cerrando...' : 'Cerrar Nómina'}
          </button>
        </div>
      </div>

      {/* Información del agente */}
      {summary && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Información del Agente</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div>
              <strong>Agente:</strong> {summary.createdBy}
            </div>
            <div>
              <strong>Creado:</strong> {formatDate(summary.createdAt)}
            </div>
            <div>
              <strong>Última actualización:</strong> {formatDate(summary.lastUpdated)}
            </div>
          </div>
        </div>
      )}

      {/* Alertas de validación */}
      {summary && !summary.canClose && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">No se puede cerrar la nómina</span>
          </div>
          <div className="text-sm text-red-700">
            <p className="mb-2">Los siguientes problemas deben resolverse antes de cerrar:</p>
            <ul className="list-disc list-inside space-y-1">
              {summary.blockingIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Resumen de cierre */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprobados</p>
                <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagados</p>
                <p className="text-2xl font-bold text-green-600">{summary.paid}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Pagar</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuración de cierre */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Cierre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas de Cierre</label>
            <textarea
              value={closureNotes}
              onChange={(e) => setClosureNotes(e.target.value)}
              placeholder="Agrega notas sobre el cierre de nómina..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendNotifications"
                checked={sendNotifications}
                onChange={(e) => setSendNotifications(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="sendNotifications" className="ml-2 text-sm text-gray-700">
                Enviar notificaciones a empleados
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="generateReports"
                checked={generateReports}
                onChange={(e) => setGenerateReports(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="generateReports" className="ml-2 text-sm text-gray-700">
                Generar reportes finales
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre, puesto, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
              <option value="needs_review">Requiere Revisión</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los departamentos</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Ventas">Ventas</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Empleados ({filteredEmployees.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nómina Final
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Estado
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Estado de Pago
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Método de Pago
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Comprobante
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Faltas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.personalInfo.name}</div>
                        <div className="text-sm text-gray-500">{employee.personalInfo.position}</div>
                        <div className="text-xs text-gray-400">{employee.personalInfo.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(employee.finalPayroll.netPay)}</div>
                    <div className="text-xs text-gray-500">
                      Bruto: {formatCurrency(employee.finalPayroll.totalEarnings)}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(employee.paymentStatus)}`}>
                      {getPaymentStatusText(employee.paymentStatus)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-900">
                      {getPaymentMethodText(employee.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getReceiptStatusColor(employee.receiptStatus)}`}>
                      {getReceiptStatusText(employee.receiptStatus)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                        employee.faltas === 0 
                          ? 'bg-green-100 text-green-800' 
                          : employee.faltas <= 2 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.faltas}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {employee.faltas === 0 ? 'Sin faltas' : employee.faltas === 1 ? '1 falta' : `${employee.faltas} faltas`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewReceipt(employee)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver recibo de nómina"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones finales */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-600">
          {summary && (
            <>
              {summary.approved} de {summary.totalEmployees} empleados aprobados • 
              {summary.paid} de {summary.totalEmployees} empleados pagados
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Volver a Aprobación
          </button>
          <button
            onClick={handleClosePayroll}
            disabled={isClosing || !summary?.canClose}
            className={`px-6 py-2 rounded-lg ${
              summary?.canClose 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isClosing ? 'Cerrando...' : 'Cerrar Nómina'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollClosureView;