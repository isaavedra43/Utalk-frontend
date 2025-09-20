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
  X,
  Calculator,
  StickyNote,
  Settings,
  Share2,
  FileSpreadsheet,
  Image,
  MessageCircle,
  ExternalLink,
  CreditCard as PaymentIcon,
  Upload,
  FileCheck,
  AlertCircle,
  Archive,
  Printer,
  FolderOpen
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
  paymentStatus: 'pending' | 'paid' | 'failed';
  receiptStatus: 'not_required' | 'pending' | 'uploaded' | 'verified';
  receiptUrl?: string;
  receiptUploadedAt?: string;
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
  
  // Estados para modales de acciones
  const [showEditPayrollModal, setShowEditPayrollModal] = useState<string | null>(null);
  const [showExtrasModal, setShowExtrasModal] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeePayrollApproval | null>(null);
  const [newNote, setNewNote] = useState('');
  
  // Estados para modales de compartir y descargar
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  
  // Estados para modal de comprobante de pago
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedEmployeeForReceipt, setSelectedEmployeeForReceipt] = useState<EmployeePayrollApproval | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  
  // Estados para gestión masiva de comprobantes
  const [showReceiptManagementModal, setShowReceiptManagementModal] = useState(false);
  const [isProcessingReceipts, setIsProcessingReceipts] = useState(false);

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
      paymentStatus: 'paid',
      receiptStatus: 'uploaded',
      receiptUrl: '/receipts/ana-garcia-2024-01.pdf',
      receiptUploadedAt: '2024-01-30T15:00:00Z',
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
      paymentStatus: 'pending',
      receiptStatus: 'not_required',
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
      paymentStatus: 'paid',
      receiptStatus: 'pending',
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

  // Funciones para acciones de empleados individuales
  const handleEditPayroll = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setEditingEmployee(employee);
      setShowEditPayrollModal(employeeId);
      console.log('📝 Abriendo editor de nómina para:', employee.personalInfo.name);
    }
  };

  const handleManageExtras = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setEditingEmployee(employee);
      setShowExtrasModal(employeeId);
      console.log('💰 Abriendo gestión de extras para:', employee.personalInfo.name);
    }
  };

  const handleAddNote = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setEditingEmployee(employee);
      setNewNote(employee.notes || '');
      setShowNotesModal(employeeId);
      console.log('📝 Abriendo editor de notas para:', employee.personalInfo.name);
    }
  };

  const handleSaveNote = async (employeeId: string) => {
    setIsProcessing(true);
    try {
      console.log('💾 Guardando nota para empleado:', employeeId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, notes: newNote, lastUpdated: new Date().toISOString() }
          : emp
      ));
      
      setShowNotesModal(null);
      setNewNote('');
      console.log('✅ Nota guardada exitosamente');
    } catch (error) {
      console.error('❌ Error guardando nota:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModals = () => {
    setShowEditPayrollModal(null);
    setShowExtrasModal(null);
    setShowNotesModal(null);
    setEditingEmployee(null);
    setNewNote('');
  };

  // Funciones para compartir y descargar
  const handleSharePayroll = () => {
    setShowShareModal(true);
    console.log('📤 Abriendo opciones de compartir nómina');
  };

  const handleDownloadPayroll = () => {
    setShowDownloadModal(true);
    console.log('📥 Abriendo opciones de descarga de nómina');
  };

  const handleShareViaChannel = async (channel: string, format: string) => {
    setIsGeneratingFile(true);
    try {
      console.log(`📤 Compartiendo nómina vía ${channel} en formato ${format}`);
      
      // Simular generación de archivo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular envío según el canal
      switch (channel) {
        case 'whatsapp':
          const whatsappMessage = `📊 Nómina del período - ${new Date().toLocaleDateString('es-MX')}\n\n` +
            `Total empleados: ${employees.length}\n` +
            `Empleados aprobados: ${employees.filter(emp => emp.status === 'approved').length}\n` +
            `Total ajustes: ${employees.reduce((sum, emp) => sum + emp.adjustments.length, 0)}`;
          
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
          window.open(whatsappUrl, '_blank');
          break;
          
        case 'email':
          const emailSubject = `Nómina del período - ${new Date().toLocaleDateString('es-MX')}`;
          const emailBody = `Adjunto encontrarás el reporte de nómina del período actual.\n\n` +
            `Resumen:\n` +
            `- Total empleados: ${employees.length}\n` +
            `- Empleados aprobados: ${employees.filter(emp => emp.status === 'approved').length}\n` +
            `- Total ajustes: ${employees.reduce((sum, emp) => sum + emp.adjustments.length, 0)}`;
          
          const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          window.open(emailUrl, '_blank');
          break;
          
        case 'link':
          // Simular generación de enlace compartible
          const shareableLink = `${window.location.origin}/payroll/share/${Date.now()}`;
          navigator.clipboard.writeText(shareableLink);
          alert('Enlace copiado al portapapeles');
          break;
      }
      
      setShowShareModal(false);
      console.log(`✅ Nómina compartida exitosamente vía ${channel}`);
    } catch (error) {
      console.error('❌ Error compartiendo nómina:', error);
    } finally {
      setIsGeneratingFile(false);
    }
  };

  const handleDownloadFile = async (format: string) => {
    setIsGeneratingFile(true);
    try {
      console.log(`📥 Descargando nómina en formato ${format}`);
      
      // Simular generación de archivo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular descarga según el formato
      switch (format) {
        case 'pdf':
          // Simular descarga de PDF
          const pdfBlob = new Blob(['PDF content simulation'], { type: 'application/pdf' });
          const pdfUrl = window.URL.createObjectURL(pdfBlob);
          const pdfLink = document.createElement('a');
          pdfLink.href = pdfUrl;
          pdfLink.download = `nomina-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(pdfLink);
          pdfLink.click();
          document.body.removeChild(pdfLink);
          window.URL.revokeObjectURL(pdfUrl);
          break;
          
        case 'excel':
          // Simular descarga de Excel
          const excelBlob = new Blob(['Excel content simulation'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const excelUrl = window.URL.createObjectURL(excelBlob);
          const excelLink = document.createElement('a');
          excelLink.href = excelUrl;
          excelLink.download = `nomina-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(excelLink);
          excelLink.click();
          document.body.removeChild(excelLink);
          window.URL.revokeObjectURL(excelUrl);
          break;
          
        case 'image':
          // Simular descarga de imagen
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 800;
          canvas.height = 600;
          
          if (ctx) {
            // Dibujar contenido de la nómina como imagen
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial';
            ctx.fillText('Reporte de Nómina', 50, 50);
            ctx.font = '14px Arial';
            ctx.fillText(`Período: ${new Date().toLocaleDateString('es-MX')}`, 50, 80);
            ctx.fillText(`Total empleados: ${employees.length}`, 50, 110);
            ctx.fillText(`Empleados aprobados: ${employees.filter(emp => emp.status === 'approved').length}`, 50, 140);
          }
          
          canvas.toBlob((blob) => {
            if (blob) {
              const imageUrl = window.URL.createObjectURL(blob);
              const imageLink = document.createElement('a');
              imageLink.href = imageUrl;
              imageLink.download = `nomina-${new Date().toISOString().split('T')[0]}.png`;
              document.body.appendChild(imageLink);
              imageLink.click();
              document.body.removeChild(imageLink);
              window.URL.revokeObjectURL(imageUrl);
            }
          }, 'image/png');
          break;
      }
      
      setShowDownloadModal(false);
      console.log(`✅ Nómina descargada exitosamente en formato ${format}`);
    } catch (error) {
      console.error('❌ Error descargando nómina:', error);
    } finally {
      setIsGeneratingFile(false);
    }
  };

  const handleCloseShareDownloadModals = () => {
    setShowShareModal(false);
    setShowDownloadModal(false);
    setSelectedFormat('');
    setSelectedChannel('');
  };

  // Funciones para manejar estado de pago y comprobantes
  const handleChangePaymentStatus = async (employeeId: string, newStatus: 'pending' | 'paid' | 'failed') => {
    setIsProcessing(true);
    try {
      console.log(`💰 Cambiando estado de pago para empleado ${employeeId} a: ${newStatus}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { 
              ...emp, 
              paymentStatus: newStatus,
              receiptStatus: newStatus === 'paid' ? 'pending' : 'not_required',
              lastUpdated: new Date().toISOString() 
            }
          : emp
      ));
      
      console.log(`✅ Estado de pago actualizado a: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error cambiando estado de pago:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadReceipt = (employee: EmployeePayrollApproval) => {
    setSelectedEmployeeForReceipt(employee);
    setShowReceiptModal(true);
    console.log('📄 Abriendo modal para subir comprobante de pago para:', employee.personalInfo.name);
  };

  const handleReceiptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      console.log('📁 Archivo seleccionado:', file.name);
    }
  };

  const handleSaveReceipt = async () => {
    if (!receiptFile || !selectedEmployeeForReceipt) return;
    
    setIsUploadingReceipt(true);
    try {
      console.log('📤 Subiendo comprobante de pago...');
      
      // Simular subida de archivo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular URL del archivo subido
      const receiptUrl = `/receipts/${selectedEmployeeForReceipt.personalInfo.employeeId}-${Date.now()}.pdf`;
      
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployeeForReceipt.id 
          ? { 
              ...emp, 
              receiptStatus: 'uploaded',
              receiptUrl: receiptUrl,
              receiptUploadedAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString() 
            }
          : emp
      ));
      
      setShowReceiptModal(false);
      setReceiptFile(null);
      setSelectedEmployeeForReceipt(null);
      
      console.log('✅ Comprobante de pago subido exitosamente');
    } catch (error) {
      console.error('❌ Error subiendo comprobante:', error);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    setReceiptFile(null);
    setSelectedEmployeeForReceipt(null);
  };

  // Funciones de utilidad para estados
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
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  const getReceiptStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'not_required': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReceiptStatusText = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Subido';
      case 'verified': return 'Verificado';
      case 'pending': return 'Pendiente';
      case 'not_required': return 'No requerido';
      default: return status;
    }
  };

  // Funciones para gestión masiva de comprobantes
  const handleManageReceipts = () => {
    setShowReceiptManagementModal(true);
    console.log('📁 Abriendo gestión de comprobantes');
  };

  const handleDownloadAllReceipts = async () => {
    setIsProcessingReceipts(true);
    try {
      console.log('📥 Descargando todos los comprobantes de pago...');
      
      // Filtrar empleados que tienen comprobantes subidos
      const employeesWithReceipts = employees.filter(emp => 
        emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded'
      );
      
      if (employeesWithReceipts.length === 0) {
        alert('No hay comprobantes de pago para descargar');
        return;
      }
      
      // Simular descarga de archivos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear un ZIP con todos los comprobantes (simulación)
      const zipBlob = new Blob(['ZIP content simulation'], { type: 'application/zip' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const zipLink = document.createElement('a');
      zipLink.href = zipUrl;
      zipLink.download = `comprobantes-nomina-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(zipLink);
      zipLink.click();
      document.body.removeChild(zipLink);
      window.URL.revokeObjectURL(zipUrl);
      
      console.log(`✅ Descargados ${employeesWithReceipts.length} comprobantes de pago`);
    } catch (error) {
      console.error('❌ Error descargando comprobantes:', error);
    } finally {
      setIsProcessingReceipts(false);
    }
  };

  const handlePrintAllReceipts = async () => {
    setIsProcessingReceipts(true);
    try {
      console.log('🖨️ Preparando comprobantes para impresión...');
      
      // Filtrar empleados que tienen comprobantes subidos
      const employeesWithReceipts = employees.filter(emp => 
        emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded'
      );
      
      if (employeesWithReceipts.length === 0) {
        alert('No hay comprobantes de pago para imprimir');
        return;
      }
      
      // Simular preparación para impresión
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear una ventana de impresión con todos los comprobantes
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Comprobantes de Pago - Nómina</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .receipt { page-break-after: always; margin-bottom: 30px; border: 1px solid #ccc; padding: 20px; }
              .receipt:last-child { page-break-after: avoid; }
              .header { text-align: center; margin-bottom: 20px; }
              .employee-info { margin-bottom: 15px; }
              .amount { font-size: 18px; font-weight: bold; color: #059669; }
              .footer { margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Comprobantes de Pago - Nómina</h1>
              <p>Período: ${new Date().toLocaleDateString('es-MX')}</p>
            </div>
            ${employeesWithReceipts.map(emp => `
              <div class="receipt">
                <h2>Comprobante de Pago</h2>
                <div class="employee-info">
                  <p><strong>Empleado:</strong> ${emp.personalInfo.name}</p>
                  <p><strong>Puesto:</strong> ${emp.personalInfo.position}</p>
                  <p><strong>ID:</strong> ${emp.personalInfo.employeeId}</p>
                  <p><strong>Departamento:</strong> ${emp.personalInfo.department}</p>
                </div>
                <div class="amount">
                  <p>Monto pagado: ${formatCurrency(emp.finalPayroll.netPay)}</p>
                </div>
                <div class="footer">
                  <p>Fecha de pago: ${new Date().toLocaleDateString('es-MX')}</p>
                  <p>Comprobante generado automáticamente</p>
                </div>
              </div>
            `).join('')}
          </body>
          </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
      
      console.log(`✅ Preparados ${employeesWithReceipts.length} comprobantes para impresión`);
    } catch (error) {
      console.error('❌ Error preparando comprobantes para impresión:', error);
    } finally {
      setIsProcessingReceipts(false);
    }
  };

  const handleDownloadIndividualReceipts = async () => {
    setIsProcessingReceipts(true);
    try {
      console.log('📁 Descargando comprobantes individuales...');
      
      // Filtrar empleados que tienen comprobantes subidos
      const employeesWithReceipts = employees.filter(emp => 
        emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded'
      );
      
      if (employeesWithReceipts.length === 0) {
        alert('No hay comprobantes de pago para descargar');
        return;
      }
      
      // Descargar cada comprobante individualmente
      for (const employee of employeesWithReceipts) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular descarga
        
        // Simular descarga de archivo individual
        const receiptBlob = new Blob([`Comprobante de pago para ${employee.personalInfo.name}`], { type: 'application/pdf' });
        const receiptUrl = window.URL.createObjectURL(receiptBlob);
        const receiptLink = document.createElement('a');
        receiptLink.href = receiptUrl;
        receiptLink.download = `comprobante-${employee.personalInfo.employeeId}-${employee.personalInfo.name.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(receiptLink);
        receiptLink.click();
        document.body.removeChild(receiptLink);
        window.URL.revokeObjectURL(receiptUrl);
      }
      
      console.log(`✅ Descargados ${employeesWithReceipts.length} comprobantes individuales`);
    } catch (error) {
      console.error('❌ Error descargando comprobantes individuales:', error);
    } finally {
      setIsProcessingReceipts(false);
    }
  };

  const handleCloseReceiptManagementModal = () => {
    setShowReceiptManagementModal(false);
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
          
          {/* Botón para compartir nómina */}
          <button
            onClick={handleSharePayroll}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </button>
          
          {/* Botón para descargar nómina */}
          <button
            onClick={handleDownloadPayroll}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </button>
          
          {/* Botón para gestionar comprobantes */}
          <button
            onClick={handleManageReceipts}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Archive className="h-4 w-4 mr-2" />
            Comprobantes
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprobante
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(employee.paymentStatus)}`}>
                        {getPaymentStatusText(employee.paymentStatus)}
                      </span>
                      {employee.paymentStatus === 'pending' && employee.status === 'approved' && (
                        <button
                          onClick={() => handleChangePaymentStatus(employee.id, 'paid')}
                          disabled={isProcessing}
                          className="text-xs text-green-600 hover:text-green-800 disabled:opacity-50"
                          title="Marcar como pagado"
                        >
                          Marcar como pagado
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReceiptStatusColor(employee.receiptStatus)}`}>
                        {getReceiptStatusText(employee.receiptStatus)}
                      </span>
                      {employee.paymentStatus === 'paid' && employee.receiptStatus === 'pending' && (
                        <button
                          onClick={() => handleUploadReceipt(employee)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                          title="Subir comprobante de pago"
                        >
                          Subir comprobante
                        </button>
                      )}
                      {employee.receiptStatus === 'uploaded' && (
                        <div className="flex items-center space-x-1">
                          <FileCheck className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">Comprobante subido</span>
                        </div>
                      )}
                    </div>
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
                      
                      {/* Botón para editar nómina individual */}
                      <button
                        onClick={() => handleEditPayroll(employee.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Editar nómina individual"
                      >
                        <Calculator className="h-4 w-4" />
                      </button>
                      
                      {/* Botón para gestionar extras (incrementos/decrementos) */}
                      <button
                        onClick={() => handleManageExtras(employee.id)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Gestionar extras e incrementos"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      
                      {/* Botón para agregar notas */}
                      <button
                        onClick={() => handleAddNote(employee.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Agregar nota de nómina"
                      >
                        <StickyNote className="h-4 w-4" />
                      </button>
                      
                      {/* Botón para ver ajustes */}
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

      {/* Modal para editar nómina individual */}
      {showEditPayrollModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Nómina - {editingEmployee.personalInfo.name}
              </h3>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Funcionalidad en desarrollo:</strong> Este modal permitirá editar la nómina final del empleado,
                  ajustar salarios base, horas extra, bonos y deducciones directamente.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salario Base</label>
                  <input
                    type="number"
                    value={editingEmployee.originalPayroll.baseSalary}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nómina Final</label>
                  <input
                    type="number"
                    value={editingEmployee.finalPayroll.netPay}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para gestionar extras */}
      {showExtrasModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gestionar Extras - {editingEmployee.personalInfo.name}
              </h3>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Integración con módulo de empleados:</strong> Este modal se conectará con la funcionalidad 
                  existente del módulo de empleados individual en la pestaña "+ Extras" para agregar incrementos y decrementos.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Incrementos Disponibles</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Bono por Desempeño</span>
                        <span className="text-xs text-gray-500">+$2,000</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Horas Extra</span>
                        <span className="text-xs text-gray-500">+$1,500</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Decrementos Disponibles</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Préstamo Personal</span>
                        <span className="text-xs text-gray-500">-$1,200</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Faltas</span>
                        <span className="text-xs text-gray-500">-$800</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  disabled
                >
                  Aplicar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar notas */}
      {showNotesModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nota de Nómina - {editingEmployee.personalInfo.name}
              </h3>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota para este período de nómina
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Agrega una nota sobre este empleado para el período de nómina actual..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta nota quedará registrada en el historial de nómina del empleado.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveNote(editingEmployee.id)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Guardando...' : 'Guardar Nota'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para compartir nómina */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Compartir Nómina</h3>
              <button
                onClick={handleCloseShareDownloadModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selecciona el canal y formato:</strong> Elige cómo y en qué formato quieres compartir la nómina.
                </p>
              </div>
              
              {/* Opciones de canal */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Canal de Compartir</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleShareViaChannel('whatsapp', 'pdf')}
                    disabled={isGeneratingFile}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <MessageCircle className="h-8 w-8 text-green-600" />
                      <span className="font-medium text-gray-900">WhatsApp</span>
                      <span className="text-xs text-gray-600">Compartir por mensaje</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleShareViaChannel('email', 'pdf')}
                    disabled={isGeneratingFile}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Mail className="h-8 w-8 text-blue-600" />
                      <span className="font-medium text-gray-900">Correo</span>
                      <span className="text-xs text-gray-600">Enviar por email</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleShareViaChannel('link', 'pdf')}
                    disabled={isGeneratingFile}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <ExternalLink className="h-8 w-8 text-purple-600" />
                      <span className="font-medium text-gray-900">Enlace</span>
                      <span className="text-xs text-gray-600">Copiar enlace</span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Opciones de formato */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Formato de Archivo</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleShareViaChannel('email', 'pdf')}
                    disabled={isGeneratingFile}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-8 w-8 text-red-600" />
                      <span className="font-medium text-gray-900">PDF</span>
                      <span className="text-xs text-gray-600">Documento PDF</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleShareViaChannel('email', 'excel')}
                    disabled={isGeneratingFile}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <span className="font-medium text-gray-900">Excel</span>
                      <span className="text-xs text-gray-600">Hoja de cálculo</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleShareViaChannel('whatsapp', 'image')}
                    disabled={isGeneratingFile}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Image className="h-8 w-8 text-blue-600" />
                      <span className="font-medium text-gray-900">Imagen</span>
                      <span className="text-xs text-gray-600">Captura de pantalla</span>
                    </div>
                  </button>
                </div>
              </div>
              
              {isGeneratingFile && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-600">Generando archivo...</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseShareDownloadModals}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para descargar nómina */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Descargar Nómina</h3>
              <button
                onClick={handleCloseShareDownloadModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Selecciona el formato:</strong> Elige en qué formato quieres descargar la nómina completa.
                </p>
              </div>
              
              {/* Opciones de formato de descarga */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => handleDownloadFile('pdf')}
                  disabled={isGeneratingFile}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <FileText className="h-12 w-12 text-red-600" />
                    <span className="font-semibold text-gray-900">PDF</span>
                    <span className="text-sm text-gray-600 text-center">Documento PDF completo con todos los detalles de la nómina</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDownloadFile('excel')}
                  disabled={isGeneratingFile}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <FileSpreadsheet className="h-12 w-12 text-green-600" />
                    <span className="font-semibold text-gray-900">Excel</span>
                    <span className="text-sm text-gray-600 text-center">Hoja de cálculo con datos editables y fórmulas</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleDownloadFile('image')}
                  disabled={isGeneratingFile}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Image className="h-12 w-12 text-blue-600" />
                    <span className="font-semibold text-gray-900">Imagen</span>
                    <span className="text-sm text-gray-600 text-center">Captura de pantalla en formato PNG</span>
                  </div>
                </button>
              </div>
              
              {isGeneratingFile && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-600">Generando archivo...</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseShareDownloadModals}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para subir comprobante de pago */}
      {showReceiptModal && selectedEmployeeForReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Subir Comprobante de Pago
              </h3>
              <button
                onClick={handleCloseReceiptModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Información del empleado */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Empleado</h4>
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedEmployeeForReceipt.personalInfo.name}</p>
                    <p className="text-sm text-gray-600">{selectedEmployeeForReceipt.personalInfo.position}</p>
                    <p className="text-xs text-gray-500">ID: {selectedEmployeeForReceipt.personalInfo.employeeId}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    <strong>Nómina a pagar:</strong> {formatCurrency(selectedEmployeeForReceipt.finalPayroll.netPay)}
                  </p>
                </div>
              </div>

              {/* Área de subida de archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de Pago
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleReceiptFileChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {receiptFile ? receiptFile.name : 'Haz clic para seleccionar archivo'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG hasta 10MB
                      </p>
                    </div>
                  </label>
                </div>
                
                {receiptFile && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Archivo seleccionado: {receiptFile.name}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Tamaño: {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Importante:</strong> Asegúrate de que el comprobante sea legible y contenga:
                    </p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1">
                      <li>• Fecha del pago</li>
                      <li>• Monto pagado</li>
                      <li>• Referencia o número de transacción</li>
                      <li>• Nombre del empleado o número de empleado</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseReceiptModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveReceipt}
                  disabled={!receiptFile || isUploadingReceipt}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isUploadingReceipt ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Subiendo...</span>
                    </div>
                  ) : (
                    'Subir Comprobante'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para gestión de comprobantes */}
      {showReceiptManagementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Gestión de Comprobantes de Pago</h3>
              <button
                onClick={handleCloseReceiptManagementModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Resumen de comprobantes */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Archive className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">Resumen de Comprobantes</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {employees.filter(emp => emp.paymentStatus === 'paid').length}
                    </p>
                    <p className="text-sm text-orange-700">Empleados Pagados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded').length}
                    </p>
                    <p className="text-sm text-green-700">Comprobantes Subidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'pending').length}
                    </p>
                    <p className="text-sm text-yellow-700">Pendientes de Subir</p>
                  </div>
                </div>
              </div>

              {/* Lista de empleados con comprobantes */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900">Empleados con Comprobantes</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {employees.filter(emp => emp.paymentStatus === 'paid').map((employee) => (
                    <div key={employee.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{employee.personalInfo.name}</p>
                            <p className="text-sm text-gray-600">{employee.personalInfo.position}</p>
                            <p className="text-xs text-gray-500">ID: {employee.personalInfo.employeeId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(employee.finalPayroll.netPay)}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReceiptStatusColor(employee.receiptStatus)}`}>
                              {getReceiptStatusText(employee.receiptStatus)}
                            </span>
                          </div>
                          {employee.receiptStatus === 'uploaded' && (
                            <div className="flex items-center space-x-1">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <span className="text-xs text-green-600">Disponible</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opciones de descarga e impresión */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Descargar todos como ZIP */}
                <button
                  onClick={handleDownloadAllReceipts}
                  disabled={isProcessingReceipts || employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded').length === 0}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Archive className="h-12 w-12 text-blue-600" />
                    <span className="font-semibold text-gray-900">Descargar ZIP</span>
                    <span className="text-sm text-gray-600 text-center">Todos los comprobantes en un archivo ZIP</span>
                    <span className="text-xs text-gray-500">
                      {employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded').length} archivos
                    </span>
                  </div>
                </button>

                {/* Descargar individuales */}
                <button
                  onClick={handleDownloadIndividualReceipts}
                  disabled={isProcessingReceipts || employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded').length === 0}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <FolderOpen className="h-12 w-12 text-green-600" />
                    <span className="font-semibold text-gray-900">Descargar Individuales</span>
                    <span className="text-sm text-gray-600 text-center">Cada comprobante por separado</span>
                    <span className="text-xs text-gray-500">
                      {employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded').length} archivos
                    </span>
                  </div>
                </button>

                {/* Imprimir todos */}
                <button
                  onClick={handlePrintAllReceipts}
                  disabled={isProcessingReceipts || employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded').length === 0}
                  className="p-6 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Printer className="h-12 w-12 text-purple-600" />
                    <span className="font-semibold text-gray-900">Imprimir Todos</span>
                    <span className="text-sm text-gray-600 text-center">Vista previa de impresión</span>
                    <span className="text-xs text-gray-500">
                      {employees.filter(emp => emp.paymentStatus === 'paid' && emp.receiptStatus === 'uploaded').length} comprobantes
                    </span>
                  </div>
                </button>
              </div>

              {isProcessingReceipts && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-600">Procesando comprobantes...</span>
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-800">
                      <strong>Nota:</strong> Solo se incluyen los comprobantes de empleados que han sido marcados como pagados y tienen su comprobante subido.
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Los archivos se descargan con nombres descriptivos que incluyen el ID del empleado y su nombre.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseReceiptManagementModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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

export default PayrollApprovalView;
