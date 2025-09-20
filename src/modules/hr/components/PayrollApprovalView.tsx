import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Send,
  Eye,
  Edit,
  Lock,
  Unlock,
  Shield,
  Award,
  TrendingUp,
  Users,
  BarChart3,
  PieChart,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  X,
  Mail,
  Bell,
  Settings
} from 'lucide-react';

// Interfaces para tipos de datos
interface ApprovalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  originalAmount: number;
  adjustedAmount: number;
  difference: number;
  adjustments: Array<{
    id: string;
    type: string;
    amount: number;
    reason: string;
    appliedBy: string;
    appliedAt: string;
    status: 'pending' | 'applied' | 'rejected';
  }>;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  paymentStatus: 'pending_payment' | 'paid' | 'receipt_uploaded' | 'completed';
  receiptFile?: {
    name: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  };
  requestedBy: string;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
  hasChanges: boolean;
  lastModified: string;
}

interface ApprovalSummary {
  totalRequests: number;
  pendingApprovals: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalAmount: number;
  totalDifference: number;
  averageProcessingTime: number;
  requiresAttention: number;
}

interface PayrollApprovalViewProps {
  adjustedData: any[];
  onNext: (approvedData: any[]) => void;
  onBack: () => void;
}

const PayrollApprovalView: React.FC<PayrollApprovalViewProps> = ({ 
  adjustedData, 
  onNext, 
  onBack 
}) => {
  // Estados principales
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [summary, setSummary] = useState<ApprovalSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [approvalComments, setApprovalComments] = useState<{[key: string]: string}>({});
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRequestForReceipt, setSelectedRequestForReceipt] = useState<string | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedRequestForAdjustment, setSelectedRequestForAdjustment] = useState<string | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<string>('bonus');

  // Datos mock para aprobaciones con ajustes
  const mockApprovalRequests: ApprovalRequest[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'Ana García López',
      department: 'Tecnología',
      originalAmount: 45837.5,
      adjustedAmount: 46837.5,
      difference: 1000,
      adjustments: [
        {
          id: 'adj1',
          type: 'bonus',
          amount: 1000,
          reason: 'Desempeño excepcional en el proyecto Beta',
          appliedBy: 'Juan Pérez',
          appliedAt: '2024-01-31T11:00:00Z',
          status: 'applied'
        }
      ],
      status: 'pending',
      paymentStatus: 'pending_payment',
      requestedBy: 'Juan Pérez',
      requestedAt: '2024-01-31T11:00:00Z',
      hasChanges: true,
      lastModified: '2024-01-31T11:00:00Z'
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Carlos Mendoza Ruiz',
      department: 'Ventas',
      originalAmount: 61256.25,
      adjustedAmount: 61256.25,
      difference: 0,
      adjustments: [],
      status: 'approved',
      paymentStatus: 'paid',
      requestedBy: 'María González',
      requestedAt: '2024-01-31T10:30:00Z',
      reviewedBy: 'Ana López',
      reviewedAt: '2024-01-31T12:00:00Z',
      comments: 'Sin cambios requeridos',
      hasChanges: false,
      lastModified: '2024-01-31T10:30:00Z'
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: 'María Elena Torres',
      department: 'Recursos Humanos',
      originalAmount: 33440.62,
      adjustedAmount: 33440.62,
      difference: 0,
      adjustments: [],
      status: 'approved',
      paymentStatus: 'receipt_uploaded',
      receiptFile: {
        name: 'recibo-nomina-EMP003-enero2024.pdf',
        url: '/receipts/recibo-nomina-EMP003-enero2024.pdf',
        uploadedAt: '2024-01-31T14:30:00Z',
        uploadedBy: 'María Elena Torres'
      },
      requestedBy: 'Carlos Ruiz',
      requestedAt: '2024-01-31T10:30:00Z',
      reviewedBy: 'Ana López',
      reviewedAt: '2024-01-31T12:00:00Z',
      comments: 'Aprobado sin modificaciones',
      hasChanges: false,
      lastModified: '2024-01-31T10:30:00Z'
    }
  ];

  // Cargar datos mock
  useEffect(() => {
    const loadApprovalData = async () => {
      setLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setApprovalRequests(mockApprovalRequests);
        
        // Calcular resumen
        const summaryData: ApprovalSummary = {
          totalRequests: mockApprovalRequests.length,
          pendingApprovals: mockApprovalRequests.filter(req => req.status === 'pending').length,
          approvedRequests: mockApprovalRequests.filter(req => req.status === 'approved').length,
          rejectedRequests: mockApprovalRequests.filter(req => req.status === 'rejected').length,
          totalAmount: mockApprovalRequests.reduce((sum, req) => sum + req.adjustedAmount, 0),
          totalDifference: mockApprovalRequests.reduce((sum, req) => sum + req.difference, 0),
          averageProcessingTime: 2.5,
          requiresAttention: mockApprovalRequests.filter(req => req.status === 'needs_review').length
        };
        
        setSummary(summaryData);
      } catch (error) {
        console.error('Error al cargar datos de aprobación:', error);
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_review': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'needs_review': return 'Requiere Revisión';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'needs_review': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'receipt_uploaded': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Pendiente Pago';
      case 'paid': return 'Pagado';
      case 'receipt_uploaded': return 'Recibo Subido';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_payment': return <Clock className="h-4 w-4" />;
      case 'paid': return <DollarSign className="h-4 w-4" />;
      case 'receipt_uploaded': return <FileText className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Filtros
  const filteredRequests = approvalRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Funciones de acción
  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id));
    }
  };

  const handleApproveRequest = (requestId: string) => {
    setApprovalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'approved' as const,
              reviewedBy: 'Usuario Actual',
              reviewedAt: new Date().toISOString(),
              comments: approvalComments[requestId] || 'Aprobado'
            }
          : req
      )
    );
  };

  const handleRejectRequest = (requestId: string) => {
    setApprovalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'rejected' as const,
              reviewedBy: 'Usuario Actual',
              reviewedAt: new Date().toISOString(),
              comments: approvalComments[requestId] || 'Rechazado'
            }
          : req
      )
    );
  };

  const handleBulkApprove = () => {
    setApprovalRequests(prev => 
      prev.map(req => 
        selectedRequests.includes(req.id) && req.status === 'pending'
          ? { 
              ...req, 
              status: 'approved' as const,
              reviewedBy: 'Usuario Actual',
              reviewedAt: new Date().toISOString(),
              comments: 'Aprobado en lote'
            }
          : req
      )
    );
    setSelectedRequests([]);
  };

  const handleBulkReject = () => {
    setApprovalRequests(prev => 
      prev.map(req => 
        selectedRequests.includes(req.id) && req.status === 'pending'
          ? { 
              ...req, 
              status: 'rejected' as const,
              reviewedBy: 'Usuario Actual',
              reviewedAt: new Date().toISOString(),
              comments: 'Rechazado en lote'
            }
          : req
      )
    );
    setSelectedRequests([]);
  };

  const handleNext = () => {
    const approvedData = approvalRequests.filter(req => req.status === 'approved');
    onNext(approvedData);
  };

  const handleMarkAsPaid = (requestId: string) => {
    setApprovalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, paymentStatus: 'paid' as const }
          : req
      )
    );
  };

  const handleUploadReceipt = (requestId: string) => {
    setSelectedRequestForReceipt(requestId);
    setShowReceiptModal(true);
  };

  const handleReceiptUpload = (file: File) => {
    if (!selectedRequestForReceipt) return;

    const receiptData = {
      name: file.name,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Usuario Actual'
    };

    setApprovalRequests(prev => 
      prev.map(req => 
        req.id === selectedRequestForReceipt 
          ? { 
              ...req, 
              paymentStatus: 'receipt_uploaded' as const,
              receiptFile: receiptData
            }
          : req
      )
    );

    setShowReceiptModal(false);
    setSelectedRequestForReceipt(null);
  };

  const handleAddAdjustment = (requestId: string) => {
    setSelectedRequestForAdjustment(requestId);
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = (adjustment: Omit<ApprovalRequest['adjustments'][0], 'id' | 'appliedBy' | 'appliedAt' | 'status'>) => {
    if (!selectedRequestForAdjustment) return;

    const newAdjustment = {
      id: `adj_${Date.now()}`,
      ...adjustment,
      appliedBy: 'Usuario Actual',
      appliedAt: new Date().toISOString(),
      status: 'applied' as const
    };

    setApprovalRequests(prev => 
      prev.map(req => 
        req.id === selectedRequestForAdjustment 
          ? { 
              ...req, 
              adjustments: [...req.adjustments, newAdjustment],
              adjustedAmount: req.adjustedAmount + adjustment.amount,
              difference: req.difference + adjustment.amount,
              hasChanges: true,
              lastModified: new Date().toISOString()
            }
          : req
      )
    );

    setShowAdjustmentModal(false);
    setSelectedRequestForAdjustment(null);
  };

  const canProceed = approvalRequests.every(req => req.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de aprobación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ajustes y Aprobación de Nómina</h1>
          <p className="text-gray-600 mt-1">Realiza ajustes finales y aprueba la nómina</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </button>
          
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Send className="h-4 w-4 mr-2" />
            Enviar Notificaciones
          </button>
        </div>
      </div>

      {/* Resumen de aprobaciones */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalRequests}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-2xl font-bold text-green-600">{summary.approvedRequests}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Nombre o ID de empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="needs_review">Requieren Revisión</option>
            </select>
          </div>
          
          <div className="flex items-end">
            {selectedRequests.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkApprove}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aprobar ({selectedRequests.length})
                </button>
                <button
                  onClick={handleBulkReject}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rechazar ({selectedRequests.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes de aprobación */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Solicitudes de Aprobación ({filteredRequests.length})
          </h3>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Seleccionar todos</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Ajustado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diferencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitado Por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recibo Firmado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectRequest(request.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.employeeName}</div>
                        <div className="text-sm text-gray-500">{request.employeeId}</div>
                        <div className="text-xs text-gray-400">{request.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(request.originalAmount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(request.adjustedAmount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      request.difference >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {request.difference >= 0 ? '+' : ''}{formatCurrency(request.difference)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{getStatusText(request.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{request.requestedBy}</div>
                    <div className="text-xs text-gray-500">{formatDate(request.requestedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(request.paymentStatus)}`}>
                      {getPaymentStatusIcon(request.paymentStatus)}
                      <span className="ml-1">{getPaymentStatusText(request.paymentStatus)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.receiptFile ? (
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-900">{request.receiptFile.name}</span>
                        <button
                          onClick={() => window.open(request.receiptFile!.url, '_blank')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver recibo"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUploadReceipt(request.id)}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Subir Recibo
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Aprobar"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Rechazar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleAddAdjustment(request.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Agregar ajuste"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      {request.status === 'approved' && request.paymentStatus === 'pending_payment' && (
                        <button
                          onClick={() => handleMarkAsPaid(request.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Marcar como pagado"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900" title="Ver detalles">
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

      {/* Información de estado */}
      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Aprobaciones Pendientes</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Hay solicitudes pendientes de aprobación. Debes revisar y aprobar todas las solicitudes antes de continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Ajustes
        </button>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Mail className="h-4 w-4 mr-2" />
            Enviar Recordatorios
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Shield className="h-4 w-4 mr-2" />
            Finalizar Aprobación
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Modal para subir recibo */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Subir Recibo Firmado</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleReceiptUpload(file);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos permitidos: PDF, JPG, PNG (máx. 10MB)
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Información importante</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        El recibo debe estar firmado por el empleado y contener todos los detalles de la nómina.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    type: adjustmentType as any,
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

export default PayrollApprovalView;
