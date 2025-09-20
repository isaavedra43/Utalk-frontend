import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Save, 
  Undo, 
  Redo,
  Plus,
  Minus,
  DollarSign,
  Calculator,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Filter,
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Download,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  Award,
  Star,
  Info,
  X,
  Check
} from 'lucide-react';

// Interfaces para tipos de datos
interface PayrollAdjustment {
  id: string;
  employeeId: string;
  type: 'salary' | 'overtime' | 'bonus' | 'deduction' | 'benefit';
  category: string;
  amount: number;
  reason: string;
  appliedBy: string;
  appliedAt: string;
  status: 'pending' | 'applied' | 'rejected';
  originalValue?: number;
  newValue?: number;
}

interface EmployeeAdjustment {
  id: string;
  personalInfo: {
    name: string;
    position: string;
    department: string;
    employeeId: string;
  };
  originalPayroll: {
    baseSalary: number;
    overtimePay: number;
    totalBonuses: number;
    totalDeductions: number;
    totalBenefits: number;
    netSalary: number;
  };
  adjustedPayroll: {
    baseSalary: number;
    overtimePay: number;
    totalBonuses: number;
    totalDeductions: number;
    totalBenefits: number;
    netSalary: number;
  };
  adjustments: PayrollAdjustment[];
  hasChanges: boolean;
  lastModified: string;
}

interface AdjustmentSummary {
  totalEmployees: number;
  employeesWithChanges: number;
  totalAdjustments: number;
  totalAmountChanged: number;
  originalTotal: number;
  adjustedTotal: number;
  pendingApprovals: number;
}

interface PayrollAdjustmentsViewProps {
  simulationData: any[];
  onNext: (adjustedData: EmployeeAdjustment[]) => void;
  onBack: () => void;
}

const PayrollAdjustmentsView: React.FC<PayrollAdjustmentsViewProps> = ({ 
  simulationData, 
  onNext, 
  onBack 
}) => {
  // Estados principales
  const [employees, setEmployees] = useState<EmployeeAdjustment[]>([]);
  const [summary, setSummary] = useState<AdjustmentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<string>('bonus');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);

  // Datos mock para ajustes
  const mockEmployees: EmployeeAdjustment[] = [
    {
      id: '1',
      personalInfo: {
        name: 'Ana García López',
        position: 'Desarrolladora Senior',
        department: 'Tecnología',
        employeeId: 'EMP001'
      },
      originalPayroll: {
        baseSalary: 45000,
        overtimePay: 3375,
        totalBonuses: 5000,
        totalDeductions: 7500,
        totalBenefits: 3500,
        netSalary: 45837.5
      },
      adjustedPayroll: {
        baseSalary: 45000,
        overtimePay: 3375,
        totalBonuses: 6000,
        totalDeductions: 7500,
        totalBenefits: 3500,
        netSalary: 46837.5
      },
      adjustments: [
        {
          id: 'adj1',
          employeeId: '1',
          type: 'bonus',
          category: 'Rendimiento Extra',
          amount: 1000,
          reason: 'Desempeño excepcional en el proyecto Beta',
          appliedBy: 'Juan Pérez',
          appliedAt: '2024-01-31T11:00:00Z',
          status: 'applied',
          originalValue: 5000,
          newValue: 6000
        }
      ],
      hasChanges: true,
      lastModified: '2024-01-31T11:00:00Z'
    },
    {
      id: '2',
      personalInfo: {
        name: 'Carlos Mendoza Ruiz',
        position: 'Gerente de Ventas',
        department: 'Ventas',
        employeeId: 'EMP002'
      },
      originalPayroll: {
        baseSalary: 55000,
        overtimePay: 2062.5,
        totalBonuses: 11000,
        totalDeductions: 7700,
        totalBenefits: 5000,
        netSalary: 61256.25
      },
      adjustedPayroll: {
        baseSalary: 55000,
        overtimePay: 2062.5,
        totalBonuses: 11000,
        totalDeductions: 7700,
        totalBenefits: 5000,
        netSalary: 61256.25
      },
      adjustments: [],
      hasChanges: false,
      lastModified: '2024-01-31T10:30:00Z'
    },
    {
      id: '3',
      personalInfo: {
        name: 'María Elena Torres',
        position: 'Analista de Recursos Humanos',
        department: 'Recursos Humanos',
        employeeId: 'EMP003'
      },
      originalPayroll: {
        baseSalary: 35000,
        overtimePay: 656.25,
        totalBonuses: 1500,
        totalDeductions: 4900,
        totalBenefits: 2000,
        netSalary: 33440.62
      },
      adjustedPayroll: {
        baseSalary: 35000,
        overtimePay: 656.25,
        totalBonuses: 1500,
        totalDeductions: 4900,
        totalBenefits: 2000,
        netSalary: 33440.62
      },
      adjustments: [],
      hasChanges: false,
      lastModified: '2024-01-31T10:30:00Z'
    }
  ];

  // Cargar datos mock
  useEffect(() => {
    const loadAdjustmentData = async () => {
      setLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setEmployees(mockEmployees);
        
        // Calcular resumen
        const summaryData: AdjustmentSummary = {
          totalEmployees: mockEmployees.length,
          employeesWithChanges: mockEmployees.filter(emp => emp.hasChanges).length,
          totalAdjustments: mockEmployees.reduce((sum, emp) => sum + emp.adjustments.length, 0),
          totalAmountChanged: mockEmployees.reduce((sum, emp) => 
            sum + (emp.adjustedPayroll.netSalary - emp.originalPayroll.netSalary), 0),
          originalTotal: mockEmployees.reduce((sum, emp) => sum + emp.originalPayroll.netSalary, 0),
          adjustedTotal: mockEmployees.reduce((sum, emp) => sum + emp.adjustedPayroll.netSalary, 0),
          pendingApprovals: mockEmployees.reduce((sum, emp) => 
            sum + emp.adjustments.filter(adj => adj.status === 'pending').length, 0)
        };
        
        setSummary(summaryData);
      } catch (error) {
        console.error('Error al cargar datos de ajustes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdjustmentData();
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

  const getAdjustmentTypeColor = (type: string) => {
    switch (type) {
      case 'bonus': return 'bg-green-100 text-green-800';
      case 'deduction': return 'bg-red-100 text-red-800';
      case 'salary': return 'bg-blue-100 text-blue-800';
      case 'overtime': return 'bg-yellow-100 text-yellow-800';
      case 'benefit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdjustmentTypeText = (type: string) => {
    switch (type) {
      case 'bonus': return 'Bono';
      case 'deduction': return 'Deducción';
      case 'salary': return 'Salario';
      case 'overtime': return 'Horas Extra';
      case 'benefit': return 'Beneficio';
      default: return type;
    }
  };

  // Filtros
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.personalInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalInfo.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || employee.personalInfo.department === filterDepartment;
    const matchesChanged = !showOnlyChanged || employee.hasChanges;
    
    return matchesSearch && matchesDepartment && matchesChanged;
  });

  const handleAddAdjustment = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = (adjustment: Omit<PayrollAdjustment, 'id' | 'appliedBy' | 'appliedAt' | 'status'>) => {
    // Aquí iría la lógica para guardar el ajuste
    console.log('Guardando ajuste:', adjustment);
    setShowAdjustmentModal(false);
  };

  const handleNext = () => {
    onNext(employees);
  };

  const handleDownloadReport = async () => {
    try {
      console.log('📥 Descargando reporte de ajustes...');
      
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear datos del reporte
      const reportData = {
        type: 'adjustments',
        date: new Date().toLocaleDateString('es-MX'),
        summary: summary,
        employees: employees,
        generatedAt: new Date().toISOString()
      };
      
      // Crear archivo JSON (simulando PDF/Excel)
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ajustes-nomina-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Reporte de ajustes descargado exitosamente');
    } catch (error) {
      console.error('❌ Error descargando reporte:', error);
    }
  };

  const handleShareReport = () => {
    // Crear modal para compartir (mismo que en simulación)
    const shareModal = document.createElement('div');
    shareModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    shareModal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900">Compartir Reporte de Ajustes</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Formato</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Método de Compartir</label>
              <div class="space-y-2">
                <button class="w-full flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg class="h-5 w-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </button>
                
                <button class="w-full flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg class="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Correo Electrónico
                </button>
                
                <button class="w-full flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg class="h-5 w-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                  Copiar Enlace
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Compartir
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(shareModal);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de ajustes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ajustes de Nómina</h1>
          <p className="text-gray-600 mt-1">Realiza ajustes finales antes de la aprobación</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Reporte
          </button>
          
          <button 
            onClick={handleShareReport}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Compartir
          </button>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Resumen de ajustes */}
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
                <p className="text-sm font-medium text-gray-600">Con Cambios</p>
                <p className="text-2xl font-bold text-gray-900">{summary.employeesWithChanges}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Edit3 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ajustes</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalAdjustments}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diferencia Total</p>
                <p className={`text-2xl font-bold ${summary.totalAmountChanged >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.totalAmountChanged >= 0 ? '+' : ''}{formatCurrency(summary.totalAmountChanged)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre o ID de empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los departamentos</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Ventas">Ventas</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showOnlyChanged"
              checked={showOnlyChanged}
              onChange={(e) => setShowOnlyChanged(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showOnlyChanged" className="text-sm text-gray-700">
              Solo con cambios
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de empleados con ajustes */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
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
                  Salario Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salario Ajustado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diferencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ajustes
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
                    <div>
                      <div className="text-sm font-medium text-gray-900">{employee.personalInfo.name}</div>
                      <div className="text-sm text-gray-500">{employee.personalInfo.position}</div>
                      <div className="text-xs text-gray-400">{employee.personalInfo.employeeId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(employee.originalPayroll.netSalary)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(employee.adjustedPayroll.netSalary)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      employee.adjustedPayroll.netSalary >= employee.originalPayroll.netSalary 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {employee.adjustedPayroll.netSalary >= employee.originalPayroll.netSalary ? '+' : ''}
                      {formatCurrency(employee.adjustedPayroll.netSalary - employee.originalPayroll.netSalary)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.adjustments.length}</div>
                    {employee.adjustments.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {employee.adjustments.filter(adj => adj.status === 'applied').length} aplicados
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {employee.hasChanges ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Modificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sin cambios
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleAddAdjustment(employee.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Agregar ajuste"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" title="Ver detalles">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Más opciones">
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

      {/* Botones de navegación */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Simulación
        </button>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Undo className="h-4 w-4 mr-2" />
            Deshacer Cambios
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continuar a Aprobación
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Modal para agregar ajuste */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Agregar Ajuste</h3>
              <button
                onClick={() => setShowAdjustmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ajuste</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bonus">Bono</option>
                    <option value="deduction">Deducción</option>
                    <option value="salary">Ajuste de Salario</option>
                    <option value="overtime">Horas Extra</option>
                    <option value="benefit">Beneficio</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej: Rendimiento, Proyecto, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Razón</label>
                  <textarea
                    placeholder="Describe la razón del ajuste..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveAdjustment({
                    employeeId: selectedEmployee!,
                    type: adjustmentType as any,
                    category: '',
                    amount: 0,
                    reason: ''
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2 inline" />
                  Agregar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollAdjustmentsView;
