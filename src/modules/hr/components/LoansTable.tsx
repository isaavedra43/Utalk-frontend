import React, { useState } from 'react';
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
  Calendar,
  DollarSign,
  FileText,
  TrendingDown,
  Clock,
  User,
  Receipt
} from 'lucide-react';

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
  employee: any;
  onAddLoan: () => void;
}

const LoansTable: React.FC<LoansTableProps> = ({
  employeeId,
  employee,
  onAddLoan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<LoanRecord | null>(null);

  // Datos de ejemplo con préstamos reales
  const loanRecords: LoanRecord[] = [
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

  const filteredLoans = loanRecords.filter(loan => {
    const matchesSearch = loan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.date.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalActiveLoans = loanRecords.filter(l => l.status === 'active').length;
  const totalActiveAmount = loanRecords.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalMonthlyPayments = loanRecords.filter(l => l.status === 'active').reduce((sum, l) => sum + l.monthlyPayment, 0);

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
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Préstamo</h3>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Información General */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha del préstamo</label>
                    <p className="text-gray-900 mt-1">{formatDate(selectedLoan.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Estado</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(selectedLoan.status)}
                      <span className="text-gray-900">{getStatusLabel(selectedLoan.status)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600">Descripción</label>
                  <p className="text-gray-900 mt-1">{selectedLoan.description}</p>
                </div>
                
                {/* Resumen Financiero */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3">Resumen Financiero</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-purple-700">Monto Total</p>
                      <p className="font-semibold text-purple-900">{formatCurrency(selectedLoan.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-purple-700">Pago Mensual</p>
                      <p className="font-semibold text-purple-900">{formatCurrency(selectedLoan.monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-purple-700">Cuotas Pagadas</p>
                      <p className="font-semibold text-purple-900">{selectedLoan.paidInstallments}/{selectedLoan.totalInstallments}</p>
                    </div>
                    <div>
                      <p className="text-purple-700">Saldo Pendiente</p>
                      <p className={`font-semibold ${
                        selectedLoan.remainingAmount === 0 ? 'text-green-600' : 'text-purple-900'
                      }`}>
                        {formatCurrency(selectedLoan.remainingAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Historial de Pagos */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Historial de Pagos</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Pago</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nómina</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedLoan.payments.map((payment) => (
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
                {selectedLoan.attachments && selectedLoan.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Archivos adjuntos</label>
                    <div className="mt-1 space-y-1">
                      {selectedLoan.attachments.map((file, index) => (
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
                  onClick={() => setSelectedLoan(null)}
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

export default LoansTable;
