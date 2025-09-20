import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  CheckCircle, 
  FileText, 
  Download, 
  Send,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  Award,
  Shield,
  Archive,
  Eye,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertCircle,
  Check,
  X,
  Mail,
  Bell,
  Settings,
  Database,
  Cloud,
  HardDrive
} from 'lucide-react';

// Interfaces para tipos de datos
interface PayrollClosure {
  id: string;
  periodId: string;
  periodName: string;
  startDate: string;
  endDate: string;
  totalEmployees: number;
  totalGrossPayroll: number;
  totalNetPayroll: number;
  totalAdjustments: number;
  status: 'ready_to_close' | 'closing' | 'closed' | 'archived';
  closedBy?: string;
  closedAt?: string;
  archivedAt?: string;
  documents: Array<{
    type: string;
    name: string;
    url: string;
    generatedAt: string;
  }>;
  notifications: Array<{
    type: 'email' | 'system' | 'sms';
    recipient: string;
    sentAt: string;
    status: 'sent' | 'delivered' | 'failed';
  }>;
}

interface ClosureSummary {
  totalEmployees: number;
  totalGrossPayroll: number;
  totalNetPayroll: number;
  totalAdjustments: number;
  averageSalary: number;
  processingTime: number;
  documentsGenerated: number;
  notificationsSent: number;
  errors: number;
  warnings: number;
}

interface PayrollClosureViewProps {
  approvedData: any[];
  onComplete: () => void;
  onBack: () => void;
}

const PayrollClosureView: React.FC<PayrollClosureViewProps> = ({ 
  approvedData, 
  onComplete, 
  onBack 
}) => {
  // Estados principales
  const [closure, setClosure] = useState<PayrollClosure | null>(null);
  const [summary, setSummary] = useState<ClosureSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [closureComments, setClosureComments] = useState('');

  // Datos mock para cierre
  const mockClosure: PayrollClosure = {
    id: 'closure_001',
    periodId: 'period_2024_01',
    periodName: 'Enero 2024',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    totalEmployees: 3,
    totalGrossPayroll: 135000,
    totalNetPayroll: 141534.37,
    totalAdjustments: 1000,
    status: 'ready_to_close',
    documents: [
      {
        type: 'payroll_summary',
        name: 'Resumen de Nómina - Enero 2024.pdf',
        url: '/documents/payroll_summary_2024_01.pdf',
        generatedAt: '2024-01-31T14:30:00Z'
      },
      {
        type: 'employee_details',
        name: 'Detalle por Empleado - Enero 2024.xlsx',
        url: '/documents/employee_details_2024_01.xlsx',
        generatedAt: '2024-01-31T14:30:00Z'
      },
      {
        type: 'tax_report',
        name: 'Reporte de Impuestos - Enero 2024.pdf',
        url: '/documents/tax_report_2024_01.pdf',
        generatedAt: '2024-01-31T14:30:00Z'
      },
      {
        type: 'bank_file',
        name: 'Archivo Bancario - Enero 2024.txt',
        url: '/documents/bank_file_2024_01.txt',
        generatedAt: '2024-01-31T14:30:00Z'
      }
    ],
    notifications: [
      {
        type: 'email',
        recipient: 'ana.garcia@empresa.com',
        sentAt: '2024-01-31T14:35:00Z',
        status: 'delivered'
      },
      {
        type: 'email',
        recipient: 'carlos.mendoza@empresa.com',
        sentAt: '2024-01-31T14:35:00Z',
        status: 'delivered'
      },
      {
        type: 'email',
        recipient: 'maria.torres@empresa.com',
        sentAt: '2024-01-31T14:35:00Z',
        status: 'delivered'
      }
    ]
  };

  // Cargar datos mock
  useEffect(() => {
    const loadClosureData = async () => {
      setLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setClosure(mockClosure);
        
        // Calcular resumen
        const summaryData: ClosureSummary = {
          totalEmployees: mockClosure.totalEmployees,
          totalGrossPayroll: mockClosure.totalGrossPayroll,
          totalNetPayroll: mockClosure.totalNetPayroll,
          totalAdjustments: mockClosure.totalAdjustments,
          averageSalary: mockClosure.totalGrossPayroll / mockClosure.totalEmployees,
          processingTime: 4.2,
          documentsGenerated: mockClosure.documents.length,
          notificationsSent: mockClosure.notifications.length,
          errors: 0,
          warnings: 0
        };
        
        setSummary(summaryData);
      } catch (error) {
        console.error('Error al cargar datos de cierre:', error);
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
      case 'ready_to_close': return 'bg-blue-100 text-blue-800';
      case 'closing': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_to_close': return 'Listo para Cerrar';
      case 'closing': return 'Cerrando';
      case 'closed': return 'Cerrado';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'payroll_summary': return 'Resumen de Nómina';
      case 'employee_details': return 'Detalle por Empleado';
      case 'tax_report': return 'Reporte de Impuestos';
      case 'bank_file': return 'Archivo Bancario';
      default: return type;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'email': return 'Correo Electrónico';
      case 'system': return 'Notificación del Sistema';
      case 'sms': return 'SMS';
      default: return type;
    }
  };

  const getNotificationStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Funciones de acción
  const handleClosePayroll = async () => {
    setClosing(true);
    try {
      // Simular proceso de cierre
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setClosure(prev => prev ? {
        ...prev,
        status: 'closed',
        closedBy: 'Usuario Actual',
        closedAt: new Date().toISOString()
      } : null);
      
      console.log('✅ Nómina cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar nómina:', error);
    } finally {
      setClosing(false);
    }
  };

  const handleArchivePayroll = async () => {
    try {
      // Simular proceso de archivado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setClosure(prev => prev ? {
        ...prev,
        status: 'archived',
        archivedAt: new Date().toISOString()
      } : null);
      
      console.log('✅ Nómina archivada exitosamente');
    } catch (error) {
      console.error('Error al archivar nómina:', error);
    }
  };

  const handleDownloadDocument = (document: any) => {
    console.log('Descargando documento:', document.name);
    // Aquí iría la lógica de descarga
  };

  const handleSendNotifications = async () => {
    try {
      // Simular envío de notificaciones
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Notificaciones enviadas');
    } catch (error) {
      console.error('Error al enviar notificaciones:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de cierre...</p>
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
            {closure && `Período: ${closure.periodName} (${formatDate(closure.startDate)} - ${formatDate(closure.endDate)})`}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {closure?.status === 'ready_to_close' && (
            <button
              onClick={handleClosePayroll}
              disabled={closing}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
            >
              {closing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Cerrar Nómina
                </>
              )}
            </button>
          )}
          
          {closure?.status === 'closed' && (
            <button
              onClick={handleArchivePayroll}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </button>
          )}
        </div>
      </div>

      {/* Estado del cierre */}
      {closure && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                closure.status === 'ready_to_close' ? 'bg-blue-100' :
                closure.status === 'closing' ? 'bg-yellow-100' :
                closure.status === 'closed' ? 'bg-green-100' :
                'bg-gray-100'
              }`}>
                {closure.status === 'ready_to_close' && <Lock className="h-6 w-6 text-blue-600" />}
                {closure.status === 'closing' && <Clock className="h-6 w-6 text-yellow-600" />}
                {closure.status === 'closed' && <CheckCircle className="h-6 w-6 text-green-600" />}
                {closure.status === 'archived' && <Archive className="h-6 w-6 text-gray-600" />}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Estado: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(closure.status)}`}>
                    {getStatusText(closure.status)}
                  </span>
                </h3>
                {closure.closedBy && (
                  <p className="text-sm text-gray-600">
                    Cerrado por: {closure.closedBy} el {closure.closedAt && formatDate(closure.closedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen final */}
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
                <p className="text-sm font-medium text-gray-600">Nómina Bruta</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalGrossPayroll)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nómina Neta</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalNetPayroll)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documentos</p>
                <p className="text-2xl font-bold text-gray-900">{summary.documentsGenerated}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documentos generados */}
      {closure && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Documentos Generados ({closure.documents.length})
            </h3>
            <button
              onClick={() => setShowDocuments(!showDocuments)}
              className="text-blue-600 hover:text-blue-800"
            >
              {showDocuments ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          
          {showDocuments && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {closure.documents.map((document, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{getDocumentTypeText(document.type)}</p>
                        <p className="text-xs text-gray-500">{document.name}</p>
                        <p className="text-xs text-gray-400">Generado: {formatDate(document.generatedAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadDocument(document)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notificaciones enviadas */}
      {closure && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Notificaciones Enviadas ({closure.notifications.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSendNotifications}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Send className="h-3 w-3 mr-1" />
                Reenviar
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-blue-600 hover:text-blue-800"
              >
                {showNotifications ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          
          {showNotifications && (
            <div className="p-6">
              <div className="space-y-3">
                {closure.notifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        {notification.type === 'email' && <Mail className="h-4 w-4 text-green-600" />}
                        {notification.type === 'system' && <Bell className="h-4 w-4 text-green-600" />}
                        {notification.type === 'sms' && <Bell className="h-4 w-4 text-green-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.recipient}</p>
                        <p className="text-xs text-gray-500">{getNotificationTypeText(notification.type)}</p>
                        <p className="text-xs text-gray-400">Enviado: {formatDate(notification.sentAt)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNotificationStatusColor(notification.status)}`}>
                      {notification.status === 'sent' ? 'Enviado' : 
                       notification.status === 'delivered' ? 'Entregado' : 'Fallido'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comentarios de cierre */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comentarios de Cierre</h3>
        <textarea
          value={closureComments}
          onChange={(e) => setClosureComments(e.target.value)}
          placeholder="Agrega comentarios sobre el proceso de cierre de nómina..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Información de finalización */}
      {closure?.status === 'closed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">Nómina Cerrada Exitosamente</h3>
              <p className="text-green-700 mt-1">
                La nómina ha sido cerrada y todos los documentos han sido generados. 
                Las notificaciones han sido enviadas a los empleados.
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
          Volver a Aprobación
        </button>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Database className="h-4 w-4 mr-2" />
            Respaldar Datos
          </button>
          
          {closure?.status === 'closed' && (
            <button
              onClick={onComplete}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Proceso
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollClosureView;
