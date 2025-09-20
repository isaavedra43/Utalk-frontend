import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Edit, 
  Save, 
  ArrowLeft, 
  ArrowRight,
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Award,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Zap,
  Shield,
  Heart,
  Car,
  Home,
  GraduationCap,
  Briefcase,
  CreditCard,
  Receipt,
  Plus,
  Minus,
  Trash2,
  Copy,
  Send,
  Lock,
  Unlock,
  Check,
  X
} from 'lucide-react';

// Interfaces para tipos de datos
interface PayrollAdjustment {
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
}

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
  adjustments: PayrollAdjustment[];
  finalPayroll: {
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
  };
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  notes?: string;
  lastUpdated: string;
}

interface PayrollApprovalSummary {
  totalEmployees: number;
  pendingApprovals: number;
  approved: number;
  rejected: number;
  totalOriginalPayroll: number;
  totalAdjustedPayroll: number;
  totalAdjustments: number;
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
}

interface PayrollApprovalViewProps {
  adjustedData: EmployeePayrollApproval[];
  onNext: (data: EmployeePayrollApproval[]) => void;
  onBack: () => void;
}

const PayrollApprovalView: React.FC<PayrollApprovalViewProps> = ({ 
  adjustedData, 
  onNext, 
  onBack 
}) => {
  // Estados principales
  const [employees, setEmployees] = useState<EmployeePayrollApproval[]>([]);
  const [summary, setSummary] = useState<PayrollApprovalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showAdjustments, setShowAdjustments] = useState<string | null>(null);
  const [editingAdjustment, setEditingAdjustment] = useState<string | null>(null);
  const [newAdjustment, setNewAdjustment] = useState<Partial<PayrollAdjustment>>({});
  const [bulkAction, setBulkAction] = useState<string>('');

  // Datos mock para ajustes y aprobación
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
      notes: 'Todos los ajustes aprobados correctamente',
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
      notes: 'Pendiente aprobación de bono de ventas',
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
      notes: 'Sin ajustes requeridos',
      lastUpdated: '2024-01-30T12:00:00Z'
    }
  ];

  // Cargar datos de ajustes y aprobación
  useEffect(() => {
    const loadApprovalData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Cargando datos de ajustes y aprobación...');
        
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEmployees(mockEmployees);
        
        // Calcular resumen
        const summaryData: PayrollApprovalSummary = {
          totalEmployees: mockEmployees.length,
          pendingApprovals: mockEmployees.filter(emp => emp.status === 'pending').length,
          approved: mockEmployees.filter(emp => emp.status === 'approved').length,
          rejected: mockEmployees.filter(emp => emp.status === 'rejected').length,
          totalOriginalPayroll: mockEmployees.reduce((sum, emp) => sum + emp.originalPayroll.netPay, 0),
          totalAdjustedPayroll: mockEmployees.reduce((sum, emp) => sum + emp.finalPayroll.netPay, 0),
          totalAdjustments: mockEmployees.reduce((sum, emp) => sum + emp.adjustments.length, 0),
          period: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            type: 'Mensual'
          }
        };
        
        setSummary(summaryData);
        console.log('✅ Datos de ajustes y aprobación cargados');
        
      } catch (error) {
        console.error('❌ Error cargando datos de aprobación:', error);
        setError('Error al cargar los datos de aprobación');
      } finally {
        setLoading(false);
      }
    };

    loadApprovalData();
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

  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'deduction': return 'bg-red-100 text-red-800';
      case 'overtime': return 'bg-blue-100 text-blue-800';
      case 'allowance': return 'bg-purple-100 text-purple-800';
      case 'tax': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdjustmentTypeText = (type: string) => {
    switch (type) {
      case 'bonus': return 'Bono';
      case 'deduction': return 'Deducción';
      case 'overtime': return 'Horas Extra';
      case 'allowance': return 'Prestación';
      case 'tax': return 'Impuesto';
      default: return type;
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

  // Funciones de acción
  const handleApproveEmployee = async (employeeId: string) => {
    setIsProcessing(true);
    try {
      console.log('✅ Aprobando empleado:', employeeId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, status: 'approved' as const, lastUpdated: new Date().toISOString() }
          : emp
      ));
      
      console.log('✅ Empleado aprobado exitosamente');
    } catch (error) {
      console.error('❌ Error aprobando empleado:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectEmployee = async (employeeId: string) => {
    setIsProcessing(true);
    try {
      console.log('❌ Rechazando empleado:', employeeId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, status: 'rejected' as const, lastUpdated: new Date().toISOString() }
          : emp
      ));
      
      console.log('✅ Empleado rechazado');
    } catch (error) {
      console.error('❌ Error rechazando empleado:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAdjustment = async (adjustmentId: string) => {
    setIsProcessing(true);
    try {
      console.log('✅ Aprobando ajuste:', adjustmentId);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        adjustments: emp.adjustments.map(adj => 
          adj.id === adjustmentId 
            ? { ...adj, approved: true, approvedBy: 'Current User', approvedAt: new Date().toISOString() }
            : adj
        )
      })));
      
      console.log('✅ Ajuste aprobado exitosamente');
    } catch (error) {
      console.error('❌ Error aprobando ajuste:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectAdjustment = async (adjustmentId: string) => {
    setIsProcessing(true);
    try {
      console.log('❌ Rechazando ajuste:', adjustmentId);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        adjustments: emp.adjustments.map(adj => 
          adj.id === adjustmentId 
            ? { ...adj, approved: false, approvedBy: 'Current User', approvedAt: new Date().toISOString() }
            : adj
        )
      })));
      
      console.log('✅ Ajuste rechazado');
    } catch (error) {
      console.error('❌ Error rechazando ajuste:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedEmployees.length === 0) return;
    
    setIsProcessing(true);
    try {
      console.log(`🔄 Ejecutando acción masiva: ${bulkAction} para ${selectedEmployees.length} empleados`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmployees(prev => prev.map(emp => 
        selectedEmployees.includes(emp.id) 
          ? { ...emp, status: bulkAction as any, lastUpdated: new Date().toISOString() }
          : emp
      ));
      
      setSelectedEmployees([]);
      setBulkAction('');
      console.log('✅ Acción masiva completada');
    } catch (error) {
      console.error('❌ Error en acción masiva:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    const approvedEmployees = employees.filter(emp => emp.status === 'approved');
    console.log('➡️ Continuando a cierre con empleados aprobados:', approvedEmployees.length);
    onNext(approvedEmployees);
  };

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de ajustes y aprobación...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Ajustes y Aprobación</h1>
          <p className="text-gray-600 mt-1">
            Revisa y aprueba los ajustes de nómina para el período
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
          
          <button
            onClick={handleNext}
            disabled={employees.filter(emp => emp.status === 'approved').length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continuar a Cierre
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Resumen de aprobación */}
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
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pendingApprovals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
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
                <p className="text-sm font-medium text-gray-600">Total Ajustes</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalAdjustments}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Edit className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y acciones masivas */}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Acción Masiva</label>
            <div className="flex space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar acción</option>
                <option value="approved">Aprobar</option>
                <option value="rejected">Rechazar</option>
                <option value="needs_review">Requiere Revisión</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedEmployees.length === 0 || isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Procesando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Empleados ({filteredEmployees.length})
          </h3>
          
          {selectedEmployees.length > 0 && (
            <div className="text-sm text-gray-600">
              {selectedEmployees.length} empleados seleccionados
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nómina Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ajustes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nómina Final
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
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
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleSelectEmployee(employee.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
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
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.originalPayroll.netPay)}</div>
                    <div className="text-xs text-gray-500">
                      Bruto: {formatCurrency(employee.originalPayroll.totalEarnings)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.adjustments.length}</div>
                    <div className="text-xs text-gray-500">
                      {employee.adjustments.filter(adj => adj.approved).length} aprobados
                    </div>
                    {employee.adjustments.length > 0 && (
                      <button
                        onClick={() => setShowAdjustments(showAdjustments === employee.id ? null : employee.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Ver detalles
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(employee.finalPayroll.netPay)}</div>
                    <div className="text-xs text-gray-500">
                      Diferencia: {formatCurrency(employee.finalPayroll.netPay - employee.originalPayroll.netPay)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {getStatusText(employee.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {employee.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveEmployee(employee.id)}
                            disabled={isProcessing}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Aprobar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectEmployee(employee.id)}
                            disabled={isProcessing}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Rechazar"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowAdjustments(showAdjustments === employee.id ? null : employee.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver ajustes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalles de ajustes expandibles */}
      {showAdjustments && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Ajustes</h4>
          {(() => {
            const employee = employees.find(emp => emp.id === showAdjustments);
            if (!employee) return null;
            
            return (
              <div className="space-y-4">
                {employee.adjustments.map((adjustment) => (
                  <div key={adjustment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAdjustmentTypeColor(adjustment.type)}`}>
                            {getAdjustmentTypeText(adjustment.type)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            adjustment.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {adjustment.approved ? 'Aprobado' : 'Pendiente'}
                          </span>
                        </div>
                        <h5 className="text-md font-medium text-gray-900">{adjustment.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{adjustment.description}</p>
                        <p className="text-sm text-gray-500">Razón: {adjustment.reason}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Creado por: {adjustment.createdBy}</span>
                          <span>Fecha: {formatDate(adjustment.createdAt)}</span>
                          {adjustment.approvedBy && (
                            <>
                              <span>Aprobado por: {adjustment.approvedBy}</span>
                              <span>Fecha: {formatDate(adjustment.approvedAt!)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-lg font-bold text-gray-900">
                          {adjustment.amount > 0 ? '+' : ''}{formatCurrency(adjustment.amount)}
                        </span>
                        {!adjustment.approved && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleApproveAdjustment(adjustment.id)}
                              disabled={isProcessing}
                              className="p-1 text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Aprobar ajuste"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectAdjustment(adjustment.id)}
                              disabled={isProcessing}
                              className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Rechazar ajuste"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {employee.adjustments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Edit className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay ajustes para este empleado</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Acciones finales */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-600">
          {employees.filter(emp => emp.status === 'approved').length} de {employees.length} empleados aprobados
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            onClick={handleNext}
            disabled={employees.filter(emp => emp.status === 'approved').length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Continuar a Cierre
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollApprovalView;
