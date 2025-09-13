import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  DollarSign,
  TrendingDown,
  Clock,
  Receipt,
  Edit,
  Save,
  X,
  Upload,
  Trash2
} from 'lucide-react';
import { extrasService } from '../../../services/extrasService';

interface LoanPayment {
  id: string;
  payrollPeriod: string;
  paymentDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  payrollId?: string;
}

interface LoanRecord {
  id: string;
  date: string;
  description: string;
  totalAmount: number;
  monthlyPayment: number;
  totalInstallments: number;
  paidInstallments: number;
  remainingAmount: number;
  status: 'active' | 'completed' | 'overdue' | 'cancelled';
  approvedBy: string;
  approvedAt: string;
  attachments: string[];
  payments: LoanPayment[];
  interestRate?: number;
  startDate: string;
  endDate: string;
}

interface LoansTableProps {
  employeeId: string;
  employee: {
    contract?: { salary?: number };
    salary?: { baseSalary?: number };
  };
  onAddLoan: () => void;
}

const LoansTable: React.FC<LoansTableProps> = ({
  employeeId,
  onAddLoan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanRecord | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<LoanPayment>>({});
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Cargar datos de préstamos
  useEffect(() => {
    const loadLoansData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!employeeId) {
          throw new Error('ID de empleado es requerido');
        }
        
        const records = await extrasService.getLoanRecords(employeeId);
        
        // Convertir MovementRecord a LoanRecord
        const loansData: LoanRecord[] = records.map(record => ({
          id: record.id,
          date: record.date,
          startDate: record.date,
          endDate: new Date(new Date(record.date).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: record.description,
          totalAmount: record.totalAmount || record.amount,
          monthlyPayment: record.monthlyPayment || 0,
          totalInstallments: Math.ceil((record.totalAmount || record.amount) / (record.monthlyPayment || 1)),
          paidInstallments: 0, // Se calculará desde payments
          remainingAmount: record.totalAmount || record.amount,
          status: record.status as 'active' | 'completed' | 'overdue' | 'cancelled',
          approvedBy: record.approvedBy || 'Sistema',
          approvedAt: record.approvedAt || record.createdAt,
          attachments: record.attachments,
          payments: [], // Se cargarán por separado
          interestRate: 0
        }));
        
        setLoanRecords(loansData);
      } catch (err) {
        let errorMessage = 'Error cargando préstamos';
        
        if (err instanceof Error) {
          if (err.message.includes('400')) {
            errorMessage = 'Datos inválidos para cargar préstamos';
          } else if (err.message.includes('404')) {
            errorMessage = 'No se encontraron datos de préstamos para este empleado';
          } else if (err.message.includes('500')) {
            errorMessage = 'Error del servidor. Inténtalo de nuevo más tarde';
          } else if (err.message.includes('Network Error') || err.message.includes('timeout')) {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet';
          } else {
            errorMessage = err.message;
          }
        }
        
        console.error('Error cargando préstamos:', err);
        setError(errorMessage);
        setLoanRecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      loadLoansData();
    }
  }, [employeeId, retryCount]);

  // Función para reintentar la carga de datos
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

// Datos de ejemplo (fallback) - Definidos como constante
const FALLBACK_LOAN_RECORDS: LoanRecord[] = [
    {
      id: 'LOAN001',
      date: '2024-01-10',
      description: 'Préstamo personal - Emergencia médica',
      totalAmount: 5000,
      monthlyPayment: 500,
      totalInstallments: 10,
      paidInstallments: 3,
      remainingAmount: 3500,
      status: 'active',
      approvedBy: 'María López',
      approvedAt: '2024-01-10T10:00:00Z',
      attachments: ['loan_agreement.pdf', 'medical_bills.pdf'],
      interestRate: 0,
      startDate: '2024-02-01',
      endDate: '2024-11-01',
      payments: [
        {
          id: 'PAY001',
          payrollPeriod: 'Febrero 2024',
          paymentDate: '2024-02-05',
          amount: 500,
          status: 'paid',
          payrollId: 'PAYROLL_FEB_2024'
        },
        {
          id: 'PAY002',
          payrollPeriod: 'Marzo 2024',
          paymentDate: '2024-03-05',
          amount: 500,
          status: 'paid',
          payrollId: 'PAYROLL_MAR_2024'
        },
        {
          id: 'PAY003',
          payrollPeriod: 'Abril 2024',
          paymentDate: '2024-04-05',
          amount: 500,
          status: 'paid',
          payrollId: 'PAYROLL_APR_2024'
        },
        {
          id: 'PAY004',
          payrollPeriod: 'Mayo 2024',
          paymentDate: '2024-05-05',
          amount: 500,
          status: 'pending',
          payrollId: 'PAYROLL_MAY_2024'
        }
      ]
    },
    {
      id: 'LOAN002',
      date: '2024-02-15',
      description: 'Préstamo para gastos familiares',
      totalAmount: 8000,
      monthlyPayment: 800,
      totalInstallments: 10,
      paidInstallments: 1,
      remainingAmount: 7200,
      status: 'active',
      approvedBy: 'Carlos Ruiz',
      approvedAt: '2024-02-15T14:30:00Z',
      attachments: ['loan_agreement_v2.pdf'],
      interestRate: 0,
      startDate: '2024-03-01',
      endDate: '2024-12-01',
      payments: [
        {
          id: 'PAY005',
          payrollPeriod: 'Marzo 2024',
          paymentDate: '2024-03-05',
          amount: 800,
          status: 'paid',
          payrollId: 'PAYROLL_MAR_2024'
        },
        {
          id: 'PAY006',
          payrollPeriod: 'Abril 2024',
          paymentDate: '2024-04-05',
          amount: 800,
          status: 'pending',
          payrollId: 'PAYROLL_APR_2024'
        }
      ]
    },
    {
      id: 'LOAN003',
      date: '2023-11-20',
      description: 'Préstamo para compra de equipo de trabajo',
      totalAmount: 3000,
      monthlyPayment: 300,
      totalInstallments: 10,
      paidInstallments: 10,
      remainingAmount: 0,
      status: 'completed',
      approvedBy: 'Ana García',
      approvedAt: '2023-11-20T16:00:00Z',
      attachments: ['loan_agreement_v3.pdf', 'equipment_receipt.pdf'],
      interestRate: 0,
      startDate: '2023-12-01',
      endDate: '2024-09-01',
      payments: [
        {
          id: 'PAY007',
          payrollPeriod: 'Diciembre 2023',
          paymentDate: '2023-12-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_DEC_2023'
        },
        {
          id: 'PAY008',
          payrollPeriod: 'Enero 2024',
          paymentDate: '2024-01-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_JAN_2024'
        },
        {
          id: 'PAY009',
          payrollPeriod: 'Febrero 2024',
          paymentDate: '2024-02-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_FEB_2024'
        },
        {
          id: 'PAY010',
          payrollPeriod: 'Marzo 2024',
          paymentDate: '2024-03-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_MAR_2024'
        },
        {
          id: 'PAY011',
          payrollPeriod: 'Abril 2024',
          paymentDate: '2024-04-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_APR_2024'
        },
        {
          id: 'PAY012',
          payrollPeriod: 'Mayo 2024',
          paymentDate: '2024-05-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_MAY_2024'
        },
        {
          id: 'PAY013',
          payrollPeriod: 'Junio 2024',
          paymentDate: '2024-06-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_JUN_2024'
        },
        {
          id: 'PAY014',
          payrollPeriod: 'Julio 2024',
          paymentDate: '2024-07-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_JUL_2024'
        },
        {
          id: 'PAY015',
          payrollPeriod: 'Agosto 2024',
          paymentDate: '2024-08-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_AUG_2024'
        },
        {
          id: 'PAY016',
          payrollPeriod: 'Septiembre 2024',
          paymentDate: '2024-09-05',
          amount: 300,
          status: 'paid',
          payrollId: 'PAYROLL_SEP_2024'
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'pending': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'overdue': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default: return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredLoans = (loanRecords.length > 0 ? loanRecords : FALLBACK_LOAN_RECORDS).filter(loan => {
    const matchesSearch = loan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.date.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalActiveLoans = loanRecords.filter(l => l.status === 'active').length;
  const totalActiveAmount = loanRecords.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalMonthlyPayments = loanRecords.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyPayment, 0);

  // Funciones para manejar edición
  const handleEditLoan = (loan: LoanRecord) => {
    setEditingLoan({ ...loan });
    setIsEditing(true);
  };

  const handleSaveLoan = async () => {
    if (editingLoan) {
      try {
        console.log('💾 Guardando préstamo:', editingLoan);
        
        // Llamar al API para actualizar el préstamo
        await extrasService.updateLoan(editingLoan.id, {
          description: editingLoan.description,
          totalAmount: editingLoan.totalAmount,
          totalInstallments: editingLoan.totalInstallments
        });

        setSelectedLoan(editingLoan);
        setIsEditing(false);
        setEditingLoan(null);
      } catch (error) {
        console.error('Error guardando préstamo:', error);
        alert('Error al guardar el préstamo. Por favor intenta de nuevo.');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLoan(null);
  };

  const handleAddPayment = async () => {
    if (newPayment.payrollPeriod && newPayment.amount && editingLoan) {
      try {
        const paymentData = {
          payrollPeriod: newPayment.payrollPeriod,
          paymentDate: newPayment.paymentDate || new Date().toISOString().split('T')[0],
          amount: newPayment.amount,
          status: newPayment.status || 'pending',
          payrollId: newPayment.payrollId
        };

        // Llamar al API para agregar el pago
        await extrasService.addLoanPayment(editingLoan.id, paymentData);

        // Actualizar localmente para UI inmediata
        const payment: LoanPayment = {
          id: `PAY_${Date.now()}`,
          ...paymentData
        };

        const updatedLoan = {
          ...editingLoan,
          payments: [...editingLoan.payments, payment],
          paidInstallments: editingLoan.paidInstallments + 1,
          remainingAmount: Math.max(0, editingLoan.remainingAmount - payment.amount)
        };
        setEditingLoan(updatedLoan);
        setNewPayment({});
        setShowAddPayment(false);
      } catch (error) {
        console.error('Error agregando pago:', error);
        alert('Error al agregar el pago. Por favor intenta de nuevo.');
      }
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (editingLoan) {
      try {
        // Llamar al API para eliminar el pago
        await extrasService.deleteLoanPayment(editingLoan.id, paymentId);

        // Actualizar localmente para UI inmediata
        const payment = editingLoan.payments.find(p => p.id === paymentId);
        if (payment) {
          const updatedLoan = {
            ...editingLoan,
            payments: editingLoan.payments.filter(p => p.id !== paymentId),
            paidInstallments: Math.max(0, editingLoan.paidInstallments - 1),
            remainingAmount: editingLoan.remainingAmount + payment.amount
          };
          setEditingLoan(updatedLoan);
        }
      } catch (error) {
        console.error('Error eliminando pago:', error);
        alert('Error al eliminar el pago. Por favor intenta de nuevo.');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (editingLoan && files.length > 0) {
      const newAttachments = files.map(file => file.name);
      setEditingLoan({
        ...editingLoan,
        attachments: [...editingLoan.attachments, ...newAttachments]
      });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    if (editingLoan) {
      const updatedAttachments = editingLoan.attachments.filter((_, i) => i !== index);
      setEditingLoan({
        ...editingLoan,
        attachments: updatedAttachments
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando préstamos...</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar préstamos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
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
            <h3 className="text-lg font-semibold text-gray-900">Registro de Préstamos</h3>
            <p className="text-sm text-gray-600">
              Préstamos activos: {totalActiveLoans} | 
              Saldo pendiente: {formatCurrency(totalActiveAmount)} | 
              Pago mensual total: {formatCurrency(totalMonthlyPayments)}
            </p>
          </div>
          <button
            onClick={onAddLoan}
            className="flex items-center space-x-2 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Préstamo</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por descripción o fecha..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
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
                MONTO TOTAL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PAGO MENSUAL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PROGRESO
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SALDO PENDIENTE
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
            {filteredLoans.length > 0 ? (
              filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(loan.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <p className="truncate">{loan.description}</p>
                    {loan.attachments && loan.attachments.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        📎 {loan.attachments.length} archivo(s)
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">{formatCurrency(loan.totalAmount)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600">{formatCurrency(loan.monthlyPayment)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(loan.paidInstallments / loan.totalInstallments) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {loan.paidInstallments}/{loan.totalInstallments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <CreditCard className="h-4 w-4 text-orange-500" />
                      <span className={`font-medium ${
                        loan.remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {formatCurrency(loan.remainingAmount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(loan.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                        {getStatusLabel(loan.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.approvedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="text-purple-600 hover:text-purple-900 flex items-center space-x-1"
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
                  No se encontraron préstamos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar Préstamo' : 'Detalles del Préstamo'}
                </h3>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <button
                      onClick={() => handleEditLoan(selectedLoan)}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedLoan(null);
                      setIsEditing(false);
                      setEditingLoan(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Información General */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha del préstamo</label>
                    {isEditing && editingLoan ? (
                      <input
                        type="date"
                        value={editingLoan.date}
                        onChange={(e) => setEditingLoan({ ...editingLoan, date: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{formatDate(selectedLoan.date)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Estado</label>
                    {isEditing && editingLoan ? (
                      <select
                        value={editingLoan.status}
                        onChange={(e) => setEditingLoan({ ...editingLoan, status: e.target.value as 'active' | 'completed' | 'overdue' | 'cancelled' })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="active">Activo</option>
                        <option value="completed">Completado</option>
                        <option value="overdue">Vencido</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(selectedLoan.status)}
                        <span className="text-gray-900">{getStatusLabel(selectedLoan.status)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Descripción</label>
                  {isEditing && editingLoan ? (
                    <textarea
                      value={editingLoan.description}
                      onChange={(e) => setEditingLoan({ ...editingLoan, description: e.target.value })}
                      rows={3}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900 mt-1">{selectedLoan.description}</p>
                  )}
                </div>
                
                {/* Resumen Financiero */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3">Resumen Financiero</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-purple-700">Monto Total</p>
                      {isEditing && editingLoan ? (
                        <input
                          type="number"
                          value={editingLoan.totalAmount}
                          onChange={(e) => setEditingLoan({ ...editingLoan, totalAmount: parseFloat(e.target.value) || 0 })}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="font-semibold text-purple-900">{formatCurrency(selectedLoan.totalAmount)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-purple-700">Pago Mensual</p>
                      {isEditing && editingLoan ? (
                        <input
                          type="number"
                          value={editingLoan.monthlyPayment}
                          onChange={(e) => setEditingLoan({ ...editingLoan, monthlyPayment: parseFloat(e.target.value) || 0 })}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="font-semibold text-purple-900">{formatCurrency(selectedLoan.monthlyPayment)}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-purple-700">Cuotas Totales</p>
                      {isEditing && editingLoan ? (
                        <input
                          type="number"
                          value={editingLoan.totalInstallments}
                          onChange={(e) => setEditingLoan({ ...editingLoan, totalInstallments: parseInt(e.target.value) || 0 })}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      ) : (
                        <p className="font-semibold text-purple-900">{selectedLoan.paidInstallments}/{selectedLoan.totalInstallments}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-purple-700">Saldo Pendiente</p>
                      <p className={`font-semibold ${
                        (isEditing ? editingLoan?.remainingAmount : selectedLoan.remainingAmount) === 0 ? 'text-green-600' : 'text-purple-900'
                      }`}>
                        {formatCurrency(isEditing && editingLoan ? editingLoan.remainingAmount : selectedLoan.remainingAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Historial de Pagos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Historial de Pagos</h4>
                    {isEditing && editingLoan && (
                      <button
                        onClick={() => setShowAddPayment(true)}
                        className="flex items-center space-x-1 px-3 py-1 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Agregar Pago</span>
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Pago</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nómina</th>
                          {isEditing && editingLoan && (
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(isEditing && editingLoan ? editingLoan.payments : selectedLoan.payments).map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{payment.payrollPeriod}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{formatDate(payment.paymentDate)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">{formatCurrency(payment.amount)}</td>
                            <td className="px-4 py-2 text-sm">
                              <div className="flex items-center space-x-1">
                                {getPaymentStatusIcon(payment.status)}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(payment.status)}`}>
                                  {payment.status === 'paid' ? 'Pagado' : 
                                   payment.status === 'pending' ? 'Pendiente' : 'Vencido'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {payment.payrollId ? (
                                <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                                  <Receipt className="h-3 w-3" />
                                  <span>Ver</span>
                                </button>
                              ) : '-'}
                            </td>
                            {isEditing && editingLoan && (
                              <td className="px-4 py-2 text-sm">
                                <button
                                  onClick={() => handleDeletePayment(payment.id)}
                                  className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Eliminar</span>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Información de Aprobación */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Aprobado por</label>
                    <p className="text-gray-900 mt-1">{selectedLoan.approvedBy}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha de aprobación</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedLoan.approvedAt).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
                
                {/* Archivos adjuntos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-600">Archivos adjuntos</label>
                    {isEditing && editingLoan && (
                      <label className="flex items-center space-x-1 px-3 py-1 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Subir Archivos</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="mt-1 space-y-1">
                    {(isEditing && editingLoan ? editingLoan.attachments : selectedLoan.attachments).map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <span>📎</span>
                          <span>{file}</span>
                        </div>
                        {isEditing && editingLoan && (
                          <button
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {(!selectedLoan.attachments || selectedLoan.attachments.length === 0) && (
                      <p className="text-sm text-gray-500 italic">No hay archivos adjuntos</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveLoan}
                      className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedLoan(null);
                      setIsEditing(false);
                      setEditingLoan(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Pago */}
      {showAddPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Agregar Pago</h3>
                <button
                  onClick={() => {
                    setShowAddPayment(false);
                    setNewPayment({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Período de Nómina</label>
                  <input
                    type="text"
                    placeholder="Ej: Mayo 2024"
                    value={newPayment.payrollPeriod || ''}
                    onChange={(e) => setNewPayment({ ...newPayment, payrollPeriod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Pago</label>
                  <input
                    type="date"
                    value={newPayment.paymentDate || ''}
                    onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Monto</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newPayment.amount || ''}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                  <select
                    value={newPayment.status || 'pending'}
                    onChange={(e) => setNewPayment({ ...newPayment, status: e.target.value as 'paid' | 'pending' | 'overdue' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="overdue">Vencido</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">ID de Nómina (opcional)</label>
                  <input
                    type="text"
                    placeholder="PAYROLL_MAY_2024"
                    value={newPayment.payrollId || ''}
                    onChange={(e) => setNewPayment({ ...newPayment, payrollId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAddPayment(false);
                    setNewPayment({});
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPayment}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Pago</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoansTable;
