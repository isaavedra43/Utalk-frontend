import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Download, 
  Send, 
  FileText,
  ArrowLeft, 
  ArrowRight,
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
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
  Check,
  X,
  Archive,
  BookOpen,
  Clipboard,
  Database,
  HardDrive,
  Save,
  Upload,
  Printer,
  Share2,
  Bell,
  Mail as MailIcon,
  MessageSquare,
  AlertCircle,
  Info,
  ExternalLink,
  Link,
  Key,
  Settings,
  Wrench,
  Tool,
  Hammer,
  Cog,
  Gear
} from 'lucide-react';

// Interfaces para tipos de datos
interface PayrollClosureData {
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
  finalPayroll: {
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
    paymentMethod: 'bank_transfer' | 'check' | 'cash';
    bankAccount?: string;
    routingNumber?: string;
  };
  period: {
    startDate: string;
    endDate: string;
    payDate: string;
    type: 'monthly' | 'biweekly' | 'weekly';
  };
  status: 'ready_to_pay' | 'paid' | 'failed' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  documents: Array<{
    id: string;
    name: string;
    type: 'payslip' | 'tax_document' | 'receipt' | 'report';
    url: string;
    generatedAt: string;
  }>;
  notifications: Array<{
    id: string;
    type: 'email' | 'sms' | 'push';
    status: 'sent' | 'delivered' | 'failed';
    sentAt: string;
  }>;
  lastUpdated: string;
}

interface PayrollClosureSummary {
  totalEmployees: number;
  readyToPay: number;
  paid: number;
  failed: number;
  totalAmount: number;
  totalPaid: number;
  totalFailed: number;
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
  closureDate: string;
  closedBy: string;
}

interface PayrollClosureViewProps {
  approvedData: PayrollClosureData[];
  onComplete: () => void;
  onBack: () => void;
}

const PayrollClosureView: React.FC<PayrollClosureViewProps> = ({ 
  approvedData, 
  onComplete, 
  onBack 
}) => {
  // Estados principales
  const [employees, setEmployees] = useState<PayrollClosureData[]>([]);
  const [summary, setSummary] = useState<PayrollClosureSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [showDocuments, setShowDocuments] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState<string | null>(null);
  const [closureNotes, setClosureNotes] = useState('');
  const [sendNotifications, setSendNotifications] = useState(true);
  const [generateReports, setGenerateReports] = useState(true);

  // Datos mock para cierre
  const mockEmployees: PayrollClosureData[] = [
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
      finalPayroll: {
        totalEarnings: 57500,
        totalDeductions: 12800,
        netPay: 44700,
        paymentMethod: 'bank_transfer',
        bankAccount: '****1234',
        routingNumber: '0123456789'
      },
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        type: 'monthly'
      },
      status: 'ready_to_pay',
      paymentStatus: 'pending',
      documents: [
        {
          id: 'doc1',
          name: 'Recibo de Nómina - Enero 2024',
          type: 'payslip',
          url: '/documents/payslip-EMP001-2024-01.pdf',
          generatedAt: '2024-01-31T10:00:00Z'
        },
        {
          id: 'doc2',
          name: 'Comprobante de Retenciones',
          type: 'tax_document',
          url: '/documents/tax-EMP001-2024-01.pdf',
          generatedAt: '2024-01-31T10:05:00Z'
        }
      ],
      notifications: [
        {
          id: 'notif1',
          type: 'email',
          status: 'sent',
          sentAt: '2024-01-31T10:10:00Z'
        }
      ],
      lastUpdated: '2024-01-31T10:10:00Z'
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
      finalPayroll: {
        totalEarnings: 76600,
        totalDeductions: 14900,
        netPay: 61700,
        paymentMethod: 'bank_transfer',
        bankAccount: '****5678',
        routingNumber: '0123456789'
      },
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        type: 'monthly'
      },
      status: 'ready_to_pay',
      paymentStatus: 'pending',
      documents: [
        {
          id: 'doc3',
          name: 'Recibo de Nómina - Enero 2024',
          type: 'payslip',
          url: '/documents/payslip-EMP002-2024-01.pdf',
          generatedAt: '2024-01-31T10:00:00Z'
        }
      ],
      notifications: [
        {
          id: 'notif2',
          type: 'email',
          status: 'sent',
          sentAt: '2024-01-31T10:10:00Z'
        }
      ],
      lastUpdated: '2024-01-31T10:10:00Z'
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
      finalPayroll: {
        totalEarnings: 40000,
        totalDeductions: 7700,
        netPay: 32300,
        paymentMethod: 'bank_transfer',
        bankAccount: '****9012',
        routingNumber: '0123456789'
      },
      period: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        payDate: '2024-02-05',
        type: 'monthly'
      },
      status: 'ready_to_pay',
      paymentStatus: 'pending',
      documents: [
        {
          id: 'doc4',
          name: 'Recibo de Nómina - Enero 2024',
          type: 'payslip',
          url: '/documents/payslip-EMP003-2024-01.pdf',
          generatedAt: '2024-01-31T10:00:00Z'
        }
      ],
      notifications: [
        {
          id: 'notif3',
          type: 'email',
          status: 'sent',
          sentAt: '2024-01-31T10:10:00Z'
        }
      ],
      lastUpdated: '2024-01-31T10:10:00Z'
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
        
        // Calcular resumen
        const summaryData: PayrollClosureSummary = {
          totalEmployees: mockEmployees.length,
          readyToPay: mockEmployees.filter(emp => emp.status === 'ready_to_pay').length,
          paid: mockEmployees.filter(emp => emp.status === 'paid').length,
          failed: mockEmployees.filter(emp => emp.status === 'failed').length,
          totalAmount: mockEmployees.reduce((sum, emp) => sum + emp.finalPayroll.netPay, 0),
          totalPaid: mockEmployees.filter(emp => emp.status === 'paid').reduce((sum, emp) => sum + emp.finalPayroll.netPay, 0),
          totalFailed: mockEmployees.filter(emp => emp.status === 'failed').reduce((sum, emp) => sum + emp.finalPayroll.netPay, 0),
          period: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            type: 'Mensual'
          },
          closureDate: new Date().toISOString(),
          closedBy: 'Current User'
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
      case 'ready_to_pay': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_to_pay': return 'Listo para Pagar';
      case 'paid': return 'Pagado';
      case 'failed': return 'Falló';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'completed': return 'Completado';
      case 'failed': return 'Falló';
      default: return status;
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
  const handleProcessPayments = async () => {
    setIsProcessing(true);
    try {
      console.log('💳 Procesando pagos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setEmployees(prev => prev.map(emp => ({
        ...emp,
        status: 'paid' as const,
        paymentStatus: 'completed' as const,
        lastUpdated: new Date().toISOString()
      })));
      
      console.log('✅ Pagos procesados exitosamente');
    } catch (error) {
      console.error('❌ Error procesando pagos:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePayroll = async () => {
    setIsClosing(true);
    try {
      console.log('🔒 Cerrando nómina...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular cierre
      console.log('✅ Nómina cerrada exitosamente');
      
      // Llamar callback de completado
      onComplete();
      
    } catch (error) {
      console.error('❌ Error cerrando nómina:', error);
    } finally {
      setIsClosing(false);
    }
  };

  const handleDownloadDocument = async (documentId: string, documentName: string) => {
    try {
      console.log('📥 Descargando documento:', documentName);
      // Simular descarga
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Documento descargado');
    } catch (error) {
      console.error('❌ Error descargando documento:', error);
    }
  };

  const handleSendNotification = async (employeeId: string, type: 'email' | 'sms') => {
    try {
      console.log(`📧 Enviando notificación ${type} a empleado:`, employeeId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? {
              ...emp,
              notifications: [...emp.notifications, {
                id: `notif_${Date.now()}`,
                type,
                status: 'sent',
                sentAt: new Date().toISOString()
              }]
            }
          : emp
      ));
      
      console.log('✅ Notificación enviada');
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
    }
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
            <p className="text-gray-600">Cargando datos de cierre...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Cierre de Nómina</h1>
          <p className="text-gray-600 mt-1">
            Finaliza el proceso de nómina y procesa los pagos
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
            onClick={handleProcessPayments}
            disabled={isProcessing || employees.filter(emp => emp.status === 'ready_to_pay').length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isProcessing ? 'Procesando...' : 'Procesar Pagos'}
          </button>
          
          <button
            onClick={handleClosePayroll}
            disabled={isClosing || employees.filter(emp => emp.status === 'paid').length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Lock className="h-4 w-4 mr-2" />
            {isClosing ? 'Cerrando...' : 'Cerrar Nómina'}
          </button>
        </div>
      </div>

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
                <p className="text-sm font-medium text-gray-600">Listos para Pagar</p>
                <p className="text-2xl font-bold text-blue-600">{summary.readyToPay}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
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
                <CheckCircle className="h-6 w-6 text-green-600" />
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
              <option value="ready_to_pay">Listo para Pagar</option>
              <option value="paid">Pagado</option>
              <option value="failed">Falló</option>
              <option value="cancelled">Cancelado</option>
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
                  Monto a Pagar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
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
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(employee.finalPayroll.netPay)}</div>
                    <div className="text-xs text-gray-500">
                      Bruto: {formatCurrency(employee.finalPayroll.totalEarnings)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.finalPayroll.paymentMethod === 'bank_transfer' ? 'Transferencia Bancaria' : 
                       employee.finalPayroll.paymentMethod === 'check' ? 'Cheque' : 'Efectivo'}
                    </div>
                    {employee.finalPayroll.bankAccount && (
                      <div className="text-xs text-gray-500">{employee.finalPayroll.bankAccount}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                        {getStatusText(employee.status)}
                      </span>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(employee.paymentStatus)}`}>
                          {getPaymentStatusText(employee.paymentStatus)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.documents.length}</div>
                    <button
                      onClick={() => setShowDocuments(showDocuments === employee.id ? null : employee.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Ver documentos
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleSendNotification(employee.id, 'email')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Enviar email"
                      >
                        <MailIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDocuments(showDocuments === employee.id ? null : employee.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Ver documentos"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalles de documentos expandibles */}
      {showDocuments && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h4>
          {(() => {
            const employee = employees.find(emp => emp.id === showDocuments);
            if (!employee) return null;
            
            return (
              <div className="space-y-4">
                {employee.documents.map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="text-md font-medium text-gray-900">{document.name}</h5>
                          <p className="text-sm text-gray-500">
                            Generado: {formatDate(document.generatedAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(document.id, document.name)}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
                
                {employee.documents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay documentos disponibles</p>
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
          {employees.filter(emp => emp.status === 'paid').length} de {employees.length} empleados pagados
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            onClick={handleProcessPayments}
            disabled={isProcessing || employees.filter(emp => emp.status === 'ready_to_pay').length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Procesando...' : 'Procesar Pagos'}
          </button>
          <button
            onClick={handleClosePayroll}
            disabled={isClosing || employees.filter(emp => emp.status === 'paid').length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isClosing ? 'Cerrando...' : 'Cerrar Nómina'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollClosureView;
