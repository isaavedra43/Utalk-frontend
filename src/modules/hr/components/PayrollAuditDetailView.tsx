import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Building,
  CreditCard,
  Receipt,
  StickyNote,
  Archive,
  Printer,
  Share2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  TrendingDown,
  Info,
  X
} from 'lucide-react';

// Interfaces para datos de auditoría
interface PayrollAuditData {
  id: string;
  period: {
    startDate: string;
    endDate: string;
    type: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
  createdAt: string;
  closedAt: string;
  status: 'closed' | 'archived';
  totalEmployees: number;
  totalAmount: number;
  notes: string;
  employees: EmployeeAuditData[];
}

interface EmployeeAuditData {
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
  paymentInfo: {
    method: 'cash' | 'deposit' | 'check' | 'transfer' | 'other';
    status: 'paid' | 'pending' | 'failed';
    paidAt?: string;
    paidBy?: string;
  };
  receiptInfo: {
    status: 'uploaded' | 'pending' | 'missing';
    uploadedAt?: string;
    uploadedBy?: string;
    url?: string;
    fileName?: string;
  };
  notes?: string;
  lastUpdated: string;
}

interface PayrollAuditDetailViewProps {
  payrollId: string;
  onBack: () => void;
}

const PayrollAuditDetailView: React.FC<PayrollAuditDetailViewProps> = ({ 
  payrollId, 
  onBack 
}) => {
  // Estados principales
  const [payrollData, setPayrollData] = useState<PayrollAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [receiptFilter, setReceiptFilter] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAuditData | null>(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Datos mock para auditoría
  const mockPayrollData: PayrollAuditData = {
    id: 'payroll_2024_01',
    period: {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      type: 'Mensual',
      name: 'Enero 2024'
    },
    createdBy: {
      id: 'user_001',
      name: 'Juan Pérez',
      role: 'Gerente de Recursos Humanos',
      department: 'Recursos Humanos'
    },
    createdAt: '2024-01-30T08:00:00Z',
    closedAt: '2024-02-01T17:30:00Z',
    status: 'closed',
    totalEmployees: 3,
    totalAmount: 138700,
    notes: 'Nómina procesada exitosamente. Todos los empleados pagados correctamente.',
    employees: [
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
        paymentInfo: {
          method: 'cash',
          status: 'paid',
          paidAt: '2024-02-01T10:00:00Z',
          paidBy: 'Juan Pérez'
        },
        receiptInfo: {
          status: 'uploaded',
          uploadedAt: '2024-02-01T10:30:00Z',
          uploadedBy: 'Ana García López',
          url: '/receipts/ana-garcia-2024-01.pdf',
          fileName: 'recibo_ana_garcia_enero_2024.pdf'
        },
        notes: 'Todos los ajustes aprobados correctamente',
        lastUpdated: '2024-02-01T10:30:00Z'
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
            type: 'bonus',
            name: 'Bono de Ventas Excepcionales',
            amount: 5000,
            description: 'Bono por superar metas de ventas en 150%',
            reason: 'Excelente desempeño en ventas del mes',
            approved: true,
            createdBy: 'Director de Ventas',
            createdAt: '2024-01-30T11:00:00Z',
            approvedBy: 'RH Manager',
            approvedAt: '2024-01-30T15:00:00Z'
          }
        ],
        finalPayroll: {
          totalEarnings: 76600,
          totalDeductions: 14900,
          netPay: 61700
        },
        paymentInfo: {
          method: 'transfer',
          status: 'paid',
          paidAt: '2024-02-01T11:00:00Z',
          paidBy: 'Juan Pérez'
        },
        receiptInfo: {
          status: 'uploaded',
          uploadedAt: '2024-02-01T11:15:00Z',
          uploadedBy: 'Carlos Mendoza Ruiz',
          url: '/receipts/carlos-mendoza-2024-01.pdf',
          fileName: 'recibo_carlos_mendoza_enero_2024.pdf'
        },
        notes: 'Bono de ventas aprobado y pagado',
        lastUpdated: '2024-02-01T11:15:00Z'
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
        paymentInfo: {
          method: 'deposit',
          status: 'paid',
          paidAt: '2024-02-01T12:00:00Z',
          paidBy: 'Juan Pérez'
        },
        receiptInfo: {
          status: 'missing',
          uploadedAt: undefined,
          uploadedBy: undefined,
          url: undefined,
          fileName: undefined
        },
        notes: 'Sin ajustes requeridos. Comprobante pendiente de subir.',
        lastUpdated: '2024-02-01T12:00:00Z'
      }
    ]
  };

  // Cargar datos de auditoría
  useEffect(() => {
    const loadAuditData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Cargando datos de auditoría de nómina...');
        
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPayrollData(mockPayrollData);
        console.log('✅ Datos de auditoría cargados');
        
      } catch (error) {
        console.error('❌ Error cargando datos de auditoría:', error);
        setError('Error al cargar los datos de auditoría');
      } finally {
        setLoading(false);
      }
    };

    loadAuditData();
  }, [payrollId]);

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
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReceiptStatusText = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Subido';
      case 'pending': return 'Pendiente';
      case 'missing': return 'Falta';
      default: return 'Desconocido';
    }
  };

  // Filtros
  const filteredEmployees = payrollData?.employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.paymentInfo.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.personalInfo.department === departmentFilter;
    const matchesReceipt = receiptFilter === 'all' || employee.receiptInfo.status === receiptFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesReceipt;
  }) || [];

  // Funciones de acción
  const handleViewEmployeeDetail = (employee: EmployeeAuditData) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  const handleCloseEmployeeDetail = () => {
    setShowEmployeeDetail(false);
    setSelectedEmployee(null);
  };

  const handleViewReceipt = (employee: EmployeeAuditData) => {
    if (employee.receiptInfo.status === 'uploaded' && employee.receiptInfo.url) {
      window.open(employee.receiptInfo.url, '_blank');
    } else {
      alert('No hay comprobante disponible para este empleado');
    }
  };

  const handleDownloadReceipt = async (employee: EmployeeAuditData) => {
    if (employee.receiptInfo.status === 'uploaded' && employee.receiptInfo.url) {
      try {
        // Simular descarga
        const link = document.createElement('a');
        link.href = employee.receiptInfo.url;
        link.download = employee.receiptInfo.fileName || `recibo_${employee.personalInfo.employeeId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ Comprobante descargado');
      } catch (error) {
        console.error('❌ Error descargando comprobante:', error);
        alert('Error al descargar el comprobante');
      }
    } else {
      alert('No hay comprobante disponible para descargar');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de auditoría...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !payrollData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'No se encontraron datos de auditoría'}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Vista General
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Detalle de Nómina - Auditoría</h1>
          <p className="text-gray-600 mt-1">
            {payrollData.period.name} - {payrollData.period.type}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Información de auditoría */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Creado por</span>
            </div>
            <p className="text-sm text-blue-700">{payrollData.createdBy.name}</p>
            <p className="text-xs text-blue-600">{payrollData.createdBy.role}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Período</span>
            </div>
            <p className="text-sm text-blue-700">
              {formatDate(payrollData.period.startDate)} - {formatDate(payrollData.period.endDate)}
            </p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Creado</span>
            </div>
            <p className="text-sm text-blue-700">{formatDate(payrollData.createdAt)}</p>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Cerrado</span>
            </div>
            <p className="text-sm text-green-700">{formatDate(payrollData.closedAt)}</p>
          </div>
        </div>
        
        {payrollData.notes && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <StickyNote className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Notas de la Nómina</span>
            </div>
            <p className="text-sm text-blue-700">{payrollData.notes}</p>
          </div>
        )}
      </div>

      {/* Resumen de nómina */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{payrollData.totalEmployees}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pagado</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(payrollData.totalAmount)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comprobantes</p>
              <p className="text-2xl font-bold text-blue-600">
                {payrollData.employees.filter(emp => emp.receiptInfo.status === 'uploaded').length} / {payrollData.totalEmployees}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Pago</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagado</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Falló</option>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante</label>
            <select
              value={receiptFilter}
              onChange={(e) => setReceiptFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="uploaded">Subido</option>
              <option value="pending">Pendiente</option>
              <option value="missing">Falta</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprobante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
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
                    {employee.adjustments.length > 0 && (
                      <div className="text-xs text-blue-600">
                        {employee.adjustments.length} ajuste(s)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPaymentMethodText(employee.paymentInfo.method)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Pagado: {employee.paymentInfo.paidAt ? formatDate(employee.paymentInfo.paidAt) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getReceiptStatusColor(employee.receiptInfo.status)}`}>
                        {getReceiptStatusText(employee.receiptInfo.status)}
                      </span>
                      {employee.receiptInfo.status === 'uploaded' && (
                        <button
                          onClick={() => handleViewReceipt(employee)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver comprobante"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {employee.receiptInfo.uploadedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(employee.receiptInfo.uploadedAt)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {employee.notes || 'Sin notas'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewEmployeeDetail(employee)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles completos"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {employee.receiptInfo.status === 'uploaded' && (
                        <button
                          onClick={() => handleDownloadReceipt(employee)}
                          className="text-green-600 hover:text-green-900"
                          title="Descargar comprobante"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle de empleado */}
      {showEmployeeDetail && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Detalle Completo del Empleado</h3>
              <button
                onClick={handleCloseEmployeeDetail}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Información personal */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Información Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Nombre:</strong> {selectedEmployee.personalInfo.name}</p>
                    <p><strong>Puesto:</strong> {selectedEmployee.personalInfo.position}</p>
                    <p><strong>ID:</strong> {selectedEmployee.personalInfo.employeeId}</p>
                  </div>
                  <div>
                    <p><strong>Departamento:</strong> {selectedEmployee.personalInfo.department}</p>
                    <p><strong>Ubicación:</strong> {selectedEmployee.personalInfo.location}</p>
                    <p><strong>Email:</strong> {selectedEmployee.personalInfo.email}</p>
                  </div>
                </div>
              </div>

              {/* Desglose de nómina */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Desglose de Nómina</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Salario Base:</span>
                    <span>{formatCurrency(selectedEmployee.originalPayroll.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horas Extra:</span>
                    <span>{formatCurrency(selectedEmployee.originalPayroll.overtime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonos:</span>
                    <span>{formatCurrency(selectedEmployee.originalPayroll.bonuses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prestaciones:</span>
                    <span>{formatCurrency(selectedEmployee.originalPayroll.allowances)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span><strong>Total Bruto:</strong></span>
                    <span><strong>{formatCurrency(selectedEmployee.originalPayroll.totalEarnings)}</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos:</span>
                    <span>-{formatCurrency(selectedEmployee.originalPayroll.taxes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beneficios:</span>
                    <span>-{formatCurrency(selectedEmployee.originalPayroll.benefits)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span><strong>Total Neto:</strong></span>
                    <span><strong>{formatCurrency(selectedEmployee.finalPayroll.netPay)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Ajustes */}
              {selectedEmployee.adjustments.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-3">Ajustes Aplicados</h4>
                  <div className="space-y-3">
                    {selectedEmployee.adjustments.map((adjustment) => (
                      <div key={adjustment.id} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{adjustment.name}</p>
                            <p className="text-sm text-gray-600">{adjustment.description}</p>
                          </div>
                          <span className={`text-lg font-bold ${adjustment.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {adjustment.amount > 0 ? '+' : ''}{formatCurrency(adjustment.amount)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>Razón: {adjustment.reason}</p>
                          <p>Aprobado por: {adjustment.approvedBy} el {adjustment.approvedAt ? formatDate(adjustment.approvedAt) : 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de pago */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Información de Pago</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Método:</strong> {getPaymentMethodText(selectedEmployee.paymentInfo.method)}</p>
                    <p><strong>Estado:</strong> {selectedEmployee.paymentInfo.status}</p>
                  </div>
                  <div>
                    <p><strong>Pagado por:</strong> {selectedEmployee.paymentInfo.paidBy || 'N/A'}</p>
                    <p><strong>Fecha de pago:</strong> {selectedEmployee.paymentInfo.paidAt ? formatDate(selectedEmployee.paymentInfo.paidAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Información de comprobante */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Comprobante de Pago</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Estado:</strong> {getReceiptStatusText(selectedEmployee.receiptInfo.status)}</p>
                    <p><strong>Archivo:</strong> {selectedEmployee.receiptInfo.fileName || 'N/A'}</p>
                  </div>
                  <div>
                    <p><strong>Subido por:</strong> {selectedEmployee.receiptInfo.uploadedBy || 'N/A'}</p>
                    <p><strong>Fecha de subida:</strong> {selectedEmployee.receiptInfo.uploadedAt ? formatDate(selectedEmployee.receiptInfo.uploadedAt) : 'N/A'}</p>
                  </div>
                </div>
                {selectedEmployee.receiptInfo.status === 'uploaded' && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleViewReceipt(selectedEmployee)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDownloadReceipt(selectedEmployee)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </button>
                  </div>
                )}
              </div>

              {/* Notas */}
              {selectedEmployee.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Notas</h4>
                  <p className="text-sm text-gray-700">{selectedEmployee.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollAuditDetailView;
