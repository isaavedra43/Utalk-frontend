import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarDays, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Receipt,
  Search,
  Share2,
  Plus,
  Settings,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  FileText,
  Image,
  Paperclip,
  Mail,
  MessageSquare,
  Copy,
  ExternalLink
} from 'lucide-react';
import { payrollApi, type PayrollPeriod, type PayrollConfig, type PayrollDetail } from '../../../services/payrollApi';
import { Employee } from '../../../services/employeesApi';

interface EmployeePayrollData {
  config: PayrollConfig | null;
  periods: PayrollPeriod[];
  summary: {
    totalPeriods: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    averageNet: number;
    byStatus: {
      calculated: number;
      approved: number;
      paid: number;
      cancelled?: number;
    };
  };
  hasData: boolean;
}

interface EmployeePayrollViewProps {
  employeeId: string;
  employee: Employee;
  onBack: () => void;
}

const EmployeePayrollView: React.FC<EmployeePayrollViewProps> = ({ 
  employeeId, 
  employee,
  onBack 
}) => {
  const [payrollData, setPayrollData] = useState<EmployeePayrollData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [periodDetails, setPeriodDetails] = useState<PayrollDetail[]>([]);
  const [pendingExtras, setPendingExtras] = useState<{ 
    extras: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
    }>;
    summary: { 
      totalExtras: number; 
      totalToAdd: number; 
      totalToSubtract: number; 
      netImpact: number 
    } 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Función para cargar datos de nómina
  const loadPayrollData = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Cargando datos de nómina para empleado:', employeeId);
        
        // 1. Obtener configuración de nómina
        let config = null;
        try {
          config = await payrollApi.getPayrollConfig(employeeId);
          console.log('📋 Configuración obtenida:', config);
        } catch (error: any) {
          if (error.status === 404 || error.message?.includes('No se encontró configuración')) {
            console.log('ℹ️ No hay configuración de nómina para este empleado');
            config = null;
          } else {
            console.error('❌ Error obteniendo configuración de nómina:', error);
            throw error;
          }
        }
        
        // 2. Obtener períodos de nómina
        const periodsResponse = await payrollApi.getEmployeePayrollPeriods(employeeId, {
          limit: 50,
          year: new Date().getFullYear()
        });
        
        console.log('📊 Períodos obtenidos:', periodsResponse);
        
        // 3. Construir datos de nómina
        const payrollData: EmployeePayrollData = {
          config: config,
          periods: periodsResponse.periods || [],
          summary: {
            totalPeriods: periodsResponse.summary?.totalPeriods || 0,
            totalGross: periodsResponse.summary?.totalGross || 0,
            totalDeductions: periodsResponse.summary?.totalDeductions || 0,
            totalNet: periodsResponse.summary?.totalNet || 0,
            averageNet: periodsResponse.summary?.averageNet || 0,
            byStatus: {
              calculated: periodsResponse.periods?.filter(p => p.status === 'calculated').length || 0,
              approved: periodsResponse.periods?.filter(p => p.status === 'approved').length || 0,
              paid: periodsResponse.periods?.filter(p => p.status === 'paid').length || 0,
              cancelled: periodsResponse.periods?.filter(p => p.status === 'cancelled').length || 0
            }
          },
          hasData: config !== null || (periodsResponse.periods && periodsResponse.periods.length > 0)
        };
        
        console.log('✅ Datos de nómina procesados:', payrollData);
        
        setPayrollData(payrollData);
        
        // Configurar el período más reciente por defecto
        if (payrollData.periods.length > 0) {
          const latestPeriod = payrollData.periods[0];
          setSelectedPeriod(latestPeriod);
          await loadPeriodDetails(latestPeriod.id);
        }
        
        // 4. Cargar extras pendientes si hay configuración
        if (config) {
          try {
            const extras = await payrollApi.getPendingExtras(employeeId);
            console.log('📋 Extras pendientes obtenidos:', extras);
            
            // Calcular totales correctos
            const summary = {
              totalExtras: extras.extras?.length || 0,
              totalToAdd: extras.extras?.filter((e: { type: string; amount: number }) => e.type === 'overtime' || e.type === 'bonus').reduce((sum: number, e: { amount: number }) => sum + (e.amount || 0), 0) || 0,
              totalToSubtract: extras.extras?.filter((e: { type: string; amount: number }) => e.type === 'absence' || e.type === 'loan').reduce((sum: number, e: { amount: number }) => sum + (e.amount || 0), 0) || 0,
              netImpact: 0
            };
            
            summary.netImpact = summary.totalToAdd - summary.totalToSubtract;
            
            setPendingExtras({
              extras: extras.extras || [],
              summary
            });
          } catch (error) {
            console.error('❌ Error cargando extras pendientes:', error);
            // Mostrar extras de ejemplo si hay error
            setPendingExtras({
              extras: [],
              summary: {
                totalExtras: 2,
                totalToAdd: 0,
                totalToSubtract: 0,
                netImpact: 0
              }
            });
          }
        }
        
      } catch (error: unknown) {
        console.error('❌ Error cargando datos de nómina:', error);
        
        // Manejar diferentes tipos de errores
        let errorMessage = 'Error cargando datos de nómina';
        if (error instanceof Error) {
          if (error.message.includes('No se encontró configuración')) {
            errorMessage = 'Este empleado no tiene configuración de nómina activa';
          } else {
            errorMessage = error.message;
          }
        }
        
        setError(errorMessage);
        
        // Si no hay configuración, mostrar datos vacíos pero permitir configurar
        setPayrollData({
          config: null,
          periods: [],
          summary: {
            totalPeriods: 0,
            totalGross: 0,
            totalDeductions: 0,
            totalNet: 0,
            averageNet: 0,
            byStatus: {
              calculated: 0,
              approved: 0,
              paid: 0,
              cancelled: 0
            }
          },
          hasData: false
        });
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  // Función para cargar archivos adjuntos
  const loadAttachments = useCallback(async (payrollId: string) => {
    try {
      console.log('📎 Cargando archivos adjuntos para nómina:', payrollId);
      
      const attachmentsData = await payrollApi.getAttachments(payrollId);
      console.log('📎 Archivos adjuntos obtenidos:', attachmentsData);
      
      // Verificar si la respuesta es un array directamente o tiene propiedad attachments
      let attachmentsArray = [];
      if (Array.isArray(attachmentsData)) {
        attachmentsArray = attachmentsData;
      } else if (attachmentsData && attachmentsData.attachments && Array.isArray(attachmentsData.attachments)) {
        attachmentsArray = attachmentsData.attachments;
      } else {
        console.log('📎 No hay archivos adjuntos disponibles');
        setAttachments([]);
        return;
      }
      
      // Convertir a formato local
      const localAttachments = attachmentsArray.map(attachment => ({
        id: attachment.id,
        name: attachment.originalName,
        type: attachment.mimeType,
        size: attachment.fileSize,
        url: attachment.fileUrl,
        uploadedAt: attachment.uploadedAt
      }));
      
      setAttachments(localAttachments);
      console.log('✅ Archivos adjuntos cargados exitosamente:', localAttachments.length);
      
    } catch (error: unknown) {
      console.error('❌ Error cargando archivos adjuntos:', error);
      // No mostrar error si no hay archivos, solo log
      if (error instanceof Error && !error.message.includes('404')) {
        const errorMessage = error.message;
        setError(errorMessage);
      }
      // En caso de error, establecer array vacío
      setAttachments([]);
    }
  }, []);

  // Cargar datos cuando cambie el employeeId
  useEffect(() => {
    if (employeeId) {
      loadPayrollData();
    }
  }, [employeeId, loadPayrollData]);

  // Cargar archivos adjuntos cuando se selecciona un período
  useEffect(() => {
    if (selectedPeriod) {
      loadAttachments(selectedPeriod.id);
    }
  }, [selectedPeriod, loadAttachments]);

  // Recargar detalles del período cuando cambien los extras pendientes
  useEffect(() => {
    if (selectedPeriod) {
      loadPeriodDetails(selectedPeriod.id);
    }
  }, [selectedPeriod, pendingExtras]);

  // Función para cargar detalles de un período específico
  const loadPeriodDetails = async (payrollId: string) => {
    try {
      console.log('🔍 Cargando detalles del período:', payrollId);
      
      const details = await payrollApi.getPayrollDetails(payrollId);
      console.log('📋 Detalles obtenidos:', details);
      
      // Convertir los detalles al formato esperado por el componente
      let formattedDetails: PayrollDetail[] = [
        ...details.perceptions.map(p => ({ ...p, type: 'perception' as const })),
        ...details.deductions.map(d => ({ ...d, type: 'deduction' as const }))
      ];
      
      // Agregar extras pendientes como percepciones/deducciones
      if (pendingExtras && pendingExtras.extras.length > 0) {
        console.log('📋 Agregando extras pendientes a los detalles:', pendingExtras.extras);
        
        const extrasAsDetails: PayrollDetail[] = pendingExtras.extras.map(extra => ({
          id: extra.id,
          payrollId: payrollId,
          employeeId: employeeId,
          type: extra.impactType === 'add' ? 'perception' as const : 'deduction' as const,
          concept: extra.type === 'overtime' ? 'Horas Extra' : 
                  extra.type === 'bonus' ? 'Bonificación' :
                  extra.type === 'absence' ? 'Ausencia' :
                  extra.type === 'loan' ? 'Préstamo' : 'Extra',
          amount: extra.calculatedAmount || extra.amount,
          description: extra.description || `Extra ${extra.type} - ${extra.date}`,
          category: extra.type as any,
          isFixed: false,
          isTaxable: true,
          extraId: extra.id
        }));
        
        formattedDetails = [...formattedDetails, ...extrasAsDetails];
        console.log('✅ Extras agregados a los detalles del período');
      }
      
      setPeriodDetails(formattedDetails);
      
    } catch (error: unknown) {
      console.error('❌ Error cargando detalles del período:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error cargando detalles';
      setError(errorMessage);
    }
  };


  // Función para generar nueva nómina
  const handleGeneratePayroll = async () => {
    try {
      setGeneratingPayroll(true);
      setError(null);
      
      console.log('🔄 Generando nueva nómina...');
      
      const result = await payrollApi.generatePayroll(employeeId, {
        forceRegenerate: false
      });
      
      console.log('✅ Nómina generada:', result);
      
      // Recargar datos después de generar nómina
      await loadPayrollData();
      
    } catch (error: unknown) {
      console.error('❌ Error generando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error generando nómina';
      setError(errorMessage);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  // Función para configurar período de nómina
  const handleConfigurePayroll = async (configData: Partial<PayrollConfig>) => {
    try {
      setConfigLoading(true);
      setError(null);
      
      console.log('🔧 Configurando nómina:', configData);
      
      const result = await payrollApi.configurePayroll(employeeId, configData);
      console.log('✅ Configuración guardada:', result);
      
      // Recargar datos después de configurar
      await loadPayrollData();
      
    } catch (error: unknown) {
      console.error('❌ Error configurando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error configurando nómina';
      setError(errorMessage);
    } finally {
      setConfigLoading(false);
    }
  };

  // Función para editar nómina existente
  const handleEditPayroll = async (configData: Partial<PayrollConfig>) => {
    if (!selectedPeriod) return;

    try {
      setConfigLoading(true);
      setError(null);
      
      console.log('✏️ Editando nómina:', configData);
      
      // Usar el nuevo endpoint de editar nómina
      const result = await payrollApi.editPayroll(selectedPeriod.id, configData);
      console.log('✅ Nómina editada:', result);
      
      // Recargar datos después de editar
      await loadPayrollData();
      
    } catch (error: unknown) {
      console.error('❌ Error editando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error editando nómina';
      setError(errorMessage);
    } finally {
      setConfigLoading(false);
    }
  };

  // Función para aprobar nómina
  const handleApprovePayroll = async (payrollId: string) => {
    try {
      console.log('✅ Aprobando nómina:', payrollId);
      
      await payrollApi.approvePayroll(payrollId);
      
      // Recargar datos
      await loadPayrollData();
      
    } catch (error: unknown) {
      console.error('❌ Error aprobando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error aprobando nómina';
      setError(errorMessage);
    }
  };

  // Función para marcar como pagado
  const handleMarkAsPaid = async (payrollId: string) => {
    try {
      console.log('💰 Marcando como pagado:', payrollId);
      
      await payrollApi.markAsPaid(payrollId, new Date().toISOString().split('T')[0]);
      
      // Recargar datos
      await loadPayrollData();
      
    } catch (error: unknown) {
      console.error('❌ Error marcando como pagado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error marcando como pagado';
      setError(errorMessage);
    }
  };

  // Función para generar primer período
  const generateFirstPayroll = async () => {
    try {
      setGeneratingPayroll(true);
      setError(null);
      
      console.log('🚀 Generando primer período de nómina para:', employeeId);
      
      // Llamar a la API para generar el primer período
      const response = await payrollApi.generatePayroll(employeeId, {
        forceRegenerate: true
      });
      
      console.log('✅ Primer período generado:', response);
      
      // Recargar datos después de generar
      await loadPayrollData();
      
      // Mostrar notificación de éxito
      console.log('🎉 Primer período de nómina generado exitosamente');
      
    } catch (error: unknown) {
      console.error('❌ Error generando primer período:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error generando primer período';
      setError(errorMessage);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  // Función para regenerar nómina existente
  const regeneratePayroll = async (payrollId: string) => {
    try {
      setGeneratingPayroll(true);
      setError(null);
      
      console.log('🔄 Regenerando nómina:', payrollId);
      
      // Usar el nuevo endpoint de regenerar nómina
      const response = await payrollApi.regeneratePayroll(payrollId, true);
      
      console.log('✅ Nómina regenerada:', response);
      
      // Recargar datos después de regenerar
      await loadPayrollData();
      
      // Mostrar notificación de éxito
      console.log('🎉 Nómina regenerada exitosamente');
      
    } catch (error: unknown) {
      console.error('❌ Error regenerando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error regenerando nómina';
      setError(errorMessage);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  // Función para actualizar nómina con extras pendientes
  const handleRegeneratePayroll = async (payrollId: string) => {
    try {
      setGeneratingPayroll(true);
      setError(null);
      
      console.log('🔄 Actualizando nómina con extras pendientes:', payrollId);
      
      // 1. Regenerar la nómina
      const response = await payrollApi.regeneratePayroll(payrollId, true);
      console.log('✅ Nómina actualizada:', response);
      
      // 2. Recargar extras pendientes
      if (payrollData?.config) {
        const extras = await payrollApi.getPendingExtras(employeeId);
        console.log('📋 Extras pendientes actualizados:', extras);
        
        // Calcular totales correctos
        const summary = {
          totalExtras: extras.extras?.length || 0,
          totalToAdd: extras.extras?.filter((e: { type: string; amount: number }) => e.type === 'overtime' || e.type === 'bonus').reduce((sum: number, e: { amount: number }) => sum + (e.amount || 0), 0) || 0,
          totalToSubtract: extras.extras?.filter((e: { type: string; amount: number }) => e.type === 'absence' || e.type === 'loan').reduce((sum: number, e: { amount: number }) => sum + (e.amount || 0), 0) || 0,
          netImpact: 0
        };
        
        summary.netImpact = summary.totalToAdd - summary.totalToSubtract;
        
        setPendingExtras({
          extras: extras.extras || [],
          summary
        });
      }
      
      // 3. Recargar todos los datos
      await loadPayrollData();
      
      console.log('🎉 Nómina y extras actualizados exitosamente');
      
    } catch (error: unknown) {
      console.error('❌ Error actualizando nómina:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando nómina';
      setError(errorMessage);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  // Función para calcular salario semanal
  const calculateWeeklySalary = (config: PayrollConfig | null) => {
    if (!config) return 0;
    
    const { baseSalary, frequency } = config;
    
    switch (frequency) {
      case 'daily':
        return baseSalary * 7; // 7 días por semana
      case 'weekly':
        return baseSalary; // Ya es semanal
      case 'biweekly':
        return baseSalary / 2; // Quincenal dividido entre 2
      case 'monthly':
        return baseSalary / 4; // Mensual dividido entre 4 semanas
      default:
        return baseSalary / 4; // Default mensual
    }
  };

  // Función para descargar PDF
  const handleDownloadPDF = async (payrollId: string) => {
    try {
      setDownloadingPDF(payrollId);
      setError(null);
      
      console.log('📄 Generando PDF para período:', payrollId);
      
      const result = await payrollApi.generatePayrollPDF(payrollId);
      console.log('✅ PDF generado exitosamente:', result);
      
      // Abrir PDF en nueva ventana para visualización
      window.open(result.pdfUrl, '_blank');
      
      // También crear enlace de descarga automática
      const link = document.createElement('a');
      link.href = result.pdfUrl;
      link.download = result.fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error: unknown) {
      console.error('❌ Error generando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error generando PDF';
      setError(errorMessage);
    } finally {
      setDownloadingPDF(null);
    }
  };

  // Función para subir archivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPeriod) return;

    try {
      setUploadingFile(true);
      setError(null);

      console.log('📎 Subiendo archivo:', file.name);

      // Subir archivo usando el API real
      const uploadedAttachment = await payrollApi.uploadAttachment(
        selectedPeriod.id,
        file,
        employeeId,
        'comprobante', // Categoría por defecto
        `Archivo adjunto para nómina del período ${formatDate(selectedPeriod.periodStart)} - ${formatDate(selectedPeriod.periodEnd)}`
      );

      // Actualizar la lista de archivos adjuntos
      const newAttachment = {
        id: uploadedAttachment.id,
        name: uploadedAttachment.originalName,
        type: uploadedAttachment.mimeType,
        size: uploadedAttachment.fileSize,
        url: uploadedAttachment.fileUrl,
        uploadedAt: uploadedAttachment.uploadedAt
      };

      setAttachments(prev => [...prev, newAttachment]);
      console.log('✅ Archivo subido exitosamente:', uploadedAttachment);

    } catch (error: unknown) {
      console.error('❌ Error subiendo archivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error subiendo archivo';
      setError(errorMessage);
    } finally {
      setUploadingFile(false);
      // Limpiar el input
      event.target.value = '';
    }
  };

  // Función para eliminar archivo adjunto
  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!selectedPeriod) return;

    try {
      setError(null);
      console.log('🗑️ Eliminando archivo:', attachmentId);

      // Eliminar archivo usando el API real
      await payrollApi.deleteAttachment(selectedPeriod.id, attachmentId);

      // Actualizar la lista local
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      console.log('✅ Archivo eliminado exitosamente');

    } catch (error: unknown) {
      console.error('❌ Error eliminando archivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error eliminando archivo';
      setError(errorMessage);
    }
  };

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Función para obtener icono según tipo de archivo
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (type.includes('pdf')) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <Paperclip className="w-4 h-4" />;
    }
  };

  // Funciones para compartir
  const generateShareContent = () => {
    if (!selectedPeriod || !employee) return '';
    
    const periodInfo = `${formatDate(selectedPeriod.periodStart)} - ${formatDate(selectedPeriod.periodEnd)}`;
    const content = `📊 Nómina de ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}
    
📅 Período: ${periodInfo}
💰 Salario Bruto: ${formatCurrency(selectedPeriod.grossSalary)}
💸 Deducciones: ${formatCurrency(selectedPeriod.totalDeductions)}
💵 Salario Neto: ${formatCurrency(selectedPeriod.netSalary)}
📋 Estado: ${payrollApi.getStatusLabel(selectedPeriod.status)}

Generado desde Utalk HR`;
    
    return content;
  };

  const handleShareWhatsApp = () => {
    const content = generateShareContent();
    const url = `https://wa.me/?text=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    const content = generateShareContent();
    const subject = `Nómina - ${employee?.personalInfo.firstName} ${employee?.personalInfo.lastName} - ${formatDate(selectedPeriod?.periodStart || '')}`;
    const body = content;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };

  const handleShareTelegram = () => {
    const content = generateShareContent();
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
  };

  const handleShareTwitter = () => {
    const content = generateShareContent();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
  };

  const handleShareLinkedIn = () => {
    const content = generateShareContent();
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=&summary=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
  };

  const handleCopyToClipboard = async () => {
    try {
      const content = generateShareContent();
      await navigator.clipboard.writeText(content);
      console.log('✅ Contenido copiado al portapapeles');
      // Aquí podrías agregar una notificación de éxito
    } catch (error) {
      console.error('❌ Error copiando al portapapeles:', error);
    }
  };

  const handleShareFacebook = () => {
    const content = generateShareContent();
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approved':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'calculated':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'calculated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de nómina...</p>
        </div>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Error cargando nómina</h3>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="payroll-view">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nómina</h2>
          <p className="text-gray-600">
            {employee.personalInfo?.firstName || ''} {employee.personalInfo?.lastName || ''} - {employee.position?.title || 'Empleado'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ← Regresar
          </button>
          
          <button
            onClick={() => setIsShareModalOpen(true)}
            disabled={!selectedPeriod}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
          
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurar Período
          </button>
          
          <button
            onClick={handleGeneratePayroll}
            disabled={generatingPayroll || !payrollData.config}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPayroll ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Agregar Nómina
          </button>
          
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* No Configuration Warning */}
      {!payrollData.config && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>No hay configuración de nómina. Configura un período para comenzar a generar nóminas.</span>
          </div>
        </div>
      )}

      {/* Pending Extras Summary */}
      {pendingExtras && pendingExtras.summary.totalExtras > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">Extras Pendientes de Aplicar</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{pendingExtras.summary.totalExtras}</div>
              <div className="text-sm text-blue-700">Total Extras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{formatCurrency(pendingExtras.summary.totalToAdd)}</div>
              <div className="text-sm text-green-600">A Sumar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">-{formatCurrency(pendingExtras.summary.totalToSubtract)}</div>
              <div className="text-sm text-red-600">A Restar</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${pendingExtras.summary.netImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pendingExtras.summary.netImpact >= 0 ? '+' : ''}{formatCurrency(pendingExtras.summary.netImpact)}
              </div>
              <div className="text-sm text-gray-600">Impacto Neto</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {payrollData.hasData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Salario {payrollData.config ? payrollApi.getFrequencyLabel(payrollData.config.frequency) : 'Base'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {payrollData.config ? formatCurrency(calculateWeeklySalary(payrollData.config)) : '--'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Neto Pagado</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(payrollData.summary.totalNet)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deducciones</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(payrollData.summary.totalDeductions)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Períodos Totales</p>
                <p className="text-2xl font-bold text-gray-900">{payrollData.summary.totalPeriods}</p>
                <p className="text-xs text-gray-500">{payrollData.config ? payrollApi.getFrequencyLabel(payrollData.config.frequency) : ''}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Períodos de Pago */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Períodos de Pago</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="all">Todos</option>
                    <option value="calculated">Calculado</option>
                    <option value="approved">Aprobado</option>
                    <option value="paid">Pagado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar período..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {payrollData.periods.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No hay períodos de nómina</p>
                    {payrollData.config ? (
                      <div>
                        <p className="text-sm text-gray-400 mb-4">Genera tu primer período usando el botón "Generar Período"</p>
                        <button 
                          onClick={generateFirstPayroll}
                          disabled={generatingPayroll}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingPayroll ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          🚀 Generar Primer Período
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Primero configura la nómina del empleado</p>
                    )}
                  </div>
                ) : (
                  payrollData.periods.map((period) => (
                    <div
                      key={period.id}
                      onClick={() => {
                        setSelectedPeriod(period);
                        loadPeriodDetails(period.id);
                      }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPeriod?.id === period.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(period.periodStart)} - {formatDate(period.periodEnd)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Bruto: {formatCurrency(period.grossSalary)} | Neto: {formatCurrency(period.netSalary)}
                          </p>
                          <p className="text-sm text-red-600 mt-1">
                            Deducciones: {formatCurrency(period.totalDeductions)}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                          {payrollApi.getStatusLabel(period.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del Período Seleccionado */}
        <div className="lg:col-span-2">
          {selectedPeriod ? (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Período {payrollApi.getFrequencyLabel(selectedPeriod.frequency)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedPeriod.periodStart)} - {formatDate(selectedPeriod.periodEnd)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPeriod.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPeriod.status)}`}>
                      {payrollApi.getStatusLabel(selectedPeriod.status)}
                    </span>
                    
                    {/* Botones de acción minimalistas */}
                    <div className="flex items-center gap-1 ml-2">
                      {/* Botón Actualizar Nómina */}
                      <button
                        onClick={() => handleRegeneratePayroll(selectedPeriod.id)}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                        title="Actualizar nómina con extras pendientes"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      
                      {/* Botón Editar */}
                      <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="text-gray-600 hover:text-gray-800 p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Editar nómina"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      
                      {/* Botón Regenerar */}
                      <button
                        onClick={() => regeneratePayroll(selectedPeriod.id)}
                        disabled={generatingPayroll}
                        className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Regenerar nómina"
                      >
                        {generatingPayroll ? (
                          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                      
                      {/* Botón Subir Archivo */}
                      <div className="relative">
                        <input
                          type="file"
                          id="file-upload-minimal"
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        />
                        <label
                          htmlFor="file-upload-minimal"
                          className={`text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors cursor-pointer ${
                            uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Subir archivo"
                        >
                          {uploadingFile ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </label>
                      </div>
                      
                      {/* Botón Descargar PDF */}
                      <button 
                        onClick={() => handleDownloadPDF(selectedPeriod.id)}
                        disabled={downloadingPDF === selectedPeriod.id}
                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Descargar PDF"
                      >
                        {downloadingPDF === selectedPeriod.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen del Período */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Salario Bruto</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedPeriod.grossSalary)}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Deducciones</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedPeriod.totalDeductions)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Salario Neto</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedPeriod.netSalary)}</p>
                  </div>
                </div>

                {/* Botón Marcar como Pagado */}
                {selectedPeriod.status === 'approved' && (
                  <div className="text-center mb-6">
                    <button
                      onClick={() => handleMarkAsPaid(selectedPeriod.id)}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <DollarSign className="w-5 h-5" />
                      Marcar como Pagado
                    </button>
                  </div>
                )}

                {/* Desglose de Nómina */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Percepciones
                    </h4>
                    <div className="space-y-3">
                      {periodDetails.filter(detail => detail.type === 'perception').length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay percepciones registradas</p>
                      ) : (
                        periodDetails.filter(detail => detail.type === 'perception').map(detail => (
                          <div key={detail.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium text-green-800">{detail.concept}</p>
                              <p className="text-sm text-green-600">{detail.description}</p>
                            </div>
                            <p className="font-bold text-green-700">+{formatCurrency(detail.amount)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Deducciones
                    </h4>
                    <div className="space-y-3">
                      {periodDetails.filter(detail => detail.type === 'deduction').length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay deducciones registradas</p>
                      ) : (
                        periodDetails.filter(detail => detail.type === 'deduction').map(detail => (
                          <div key={detail.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium text-red-800">{detail.concept}</p>
                              <p className="text-sm text-red-600">{detail.description}</p>
                            </div>
                            <p className="font-bold text-red-700">-{formatCurrency(detail.amount)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Archivos Adjuntos */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <Paperclip className="w-5 h-5" />
                        Archivos Adjuntos
                      </h4>
                      <div className="flex items-center gap-2">
                        {/* Botones de Acción de Nómina */}
                        {selectedPeriod.status === 'calculated' && (
                          <button
                            onClick={() => handleApprovePayroll(selectedPeriod.id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                          </button>
                        )}
                        
                        {selectedPeriod.status === 'approved' && (
                          <button
                            onClick={() => handleMarkAsPaid(selectedPeriod.id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                            Marcar como Pagado
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {attachments.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No hay archivos adjuntos</p>
                          <p className="text-gray-400 text-xs">Sube documentos, imágenes o archivos relacionados con esta nómina</p>
                        </div>
                      ) : (
                        attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {getFileIcon(attachment.type)}
                              </div>
                              <div>
                                <p className="font-medium text-blue-800">{attachment.name}</p>
                                <p className="text-sm text-blue-600">
                                  {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString('es-MX')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                                title="Ver archivo"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveAttachment(attachment.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                                title="Eliminar archivo"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="text-center py-16">
                <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecciona un Período
                </h3>
                <p className="text-gray-600">
                  Elige un período de la lista para ver su desglose detallado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Compartir */}
      {isShareModalOpen && selectedPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Compartir Nómina
                </h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Información a compartir:</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  <p><strong>Empleado:</strong> {employee?.personalInfo.firstName} {employee?.personalInfo.lastName}</p>
                  <p><strong>Período:</strong> {formatDate(selectedPeriod.periodStart)} - {formatDate(selectedPeriod.periodEnd)}</p>
                  <p><strong>Salario Bruto:</strong> {formatCurrency(selectedPeriod.grossSalary)}</p>
                  <p><strong>Deducciones:</strong> {formatCurrency(selectedPeriod.totalDeductions)}</p>
                  <p><strong>Salario Neto:</strong> {formatCurrency(selectedPeriod.netSalary)}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Compartir en:</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-700">WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={handleShareEmail}
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Email</span>
                  </button>
                  
                  <button
                    onClick={handleShareTelegram}
                    className="flex items-center gap-3 p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-sky-700">Telegram</span>
                  </button>
                  
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Twitter</span>
                  </button>
                  
                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">LinkedIn</span>
                  </button>
                  
                  <button
                    onClick={handleShareFacebook}
                    className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Facebook</span>
                  </button>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Copiar al Portapapeles</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración */}
      {isConfigModalOpen && (
        <PayrollConfigModal
          currentConfig={payrollData.config}
          employee={employee}
          onClose={() => setIsConfigModalOpen(false)}
          onSave={selectedPeriod ? handleEditPayroll : handleConfigurePayroll}
          loading={configLoading}
        />
      )}
    </div>
  );
};

// Modal de Configuración de Nómina
interface PayrollConfigModalProps {
  currentConfig: PayrollConfig | null;
  employee: Employee;
  onClose: () => void;
  onSave: (config: Partial<PayrollConfig>) => void;
  loading: boolean;
}

const PayrollConfigModal: React.FC<PayrollConfigModalProps> = ({
  currentConfig,
  employee,
  onClose,
  onSave,
  loading
}) => {
  // Función para obtener información del empleado
  const getEmployeeInfo = () => {
    // Extraer información del empleado
    const salary = employee.salary?.baseSalary || employee.contract.salary || 0;
    const frequency = employee.salary?.frequency || 'monthly';
    const workingDays = employee.contract.workingDays || 'Lunes a Viernes';
    const workSchedule = employee.contract.workingHoursRange || employee.contract.schedule || '09:00-18:00';
    const paymentMethod = employee.salary?.paymentMethod || 'bank_transfer';
    
    // Calcular días laborales por semana
    const workingDaysPerWeek = workingDays.includes('Lunes a Viernes') ? 5 : 
                              workingDays.includes('Lunes a Sábado') ? 6 : 5;
    
    // Calcular horas laborales por día
    const scheduleMatch = workSchedule.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
    const workingHoursPerDay = scheduleMatch ? 
      (parseInt(scheduleMatch[3]) - parseInt(scheduleMatch[1])) + 
      (parseInt(scheduleMatch[4]) - parseInt(scheduleMatch[2])) / 60 : 8;
    
    // Convertir método de pago
    const paymentMethodMap: Record<string, 'transfer' | 'cash' | 'check'> = {
      'bank_transfer': 'transfer',
      'cash': 'cash',
      'check': 'check'
    };
    
    return {
      salary,
      frequency,
      workingDaysPerWeek,
      workingHoursPerDay,
      paymentMethod: paymentMethodMap[paymentMethod] || 'transfer'
    };
  };

  const employeeInfo = getEmployeeInfo();

  // Función para calcular el salario según la frecuencia
  const calculateSalaryForFrequency = (monthlySalary: number, frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly') => {
    switch (frequency) {
      case 'daily':
        return Math.round(monthlySalary / 30); // Salario diario
      case 'weekly':
        return Math.round(monthlySalary / 4); // Salario semanal
      case 'biweekly':
        return Math.round(monthlySalary / 2); // Salario quincenal
      case 'monthly':
      default:
        return monthlySalary; // Salario mensual
    }
  };

  // Función para obtener la configuración inicial
  const getInitialConfig = useCallback(() => {
    const frequency = (currentConfig?.frequency || 'weekly') as 'daily' | 'weekly' | 'biweekly' | 'monthly';
    const baseSalary = currentConfig?.baseSalary || calculateSalaryForFrequency(employeeInfo.salary, frequency);
    
    return {
      frequency,
      baseSalary,
      sbc: currentConfig?.sbc || employeeInfo.salary,
      workingDaysPerWeek: currentConfig?.workingDaysPerWeek || employeeInfo.workingDaysPerWeek,
      workingHoursPerDay: currentConfig?.workingHoursPerDay || employeeInfo.workingHoursPerDay,
      overtimeRate: currentConfig?.overtimeRate || 1,
      paymentMethod: (currentConfig?.paymentMethod || employeeInfo.paymentMethod) as 'transfer' | 'cash' | 'check',
      notes: currentConfig?.notes || ''
    };
  }, [currentConfig, employeeInfo]);

  const [config, setConfig] = useState(getInitialConfig());

  // Actualizar configuración cuando cambie la información del empleado
  useEffect(() => {
    if (!currentConfig) {
      setConfig(getInitialConfig());
    }
  }, [employee, currentConfig, getInitialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentConfig ? 'Actualizar Configuración de Nómina' : 'Configurar Período de Nómina'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Información del Empleado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Información del Empleado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Salario:</span>
                <span className="text-blue-600 ml-2">${employeeInfo.salary.toLocaleString('es-MX')} MXN</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Frecuencia:</span>
                <span className="text-blue-600 ml-2 capitalize">{employeeInfo.frequency}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Días de trabajo:</span>
                <span className="text-blue-600 ml-2">{employee.contract.workingDays || 'Lunes a Viernes'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Horario:</span>
                <span className="text-blue-600 ml-2">{employee.contract.workingHoursRange || employee.contract.schedule || '09:00-18:00'}</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 Los campos se han pre-llenado automáticamente con la información del empleado
            </p>
          </div>

          {/* Frecuencia de Pago */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Frecuencia de Pago
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { value: 'daily', label: 'Diario' },
                { value: 'weekly', label: 'Semanal' },
                { value: 'biweekly', label: 'Quincenal' },
                { value: 'monthly', label: 'Mensual' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    const newFrequency = value as 'daily' | 'weekly' | 'biweekly' | 'monthly';
                    const newBaseSalary = calculateSalaryForFrequency(employeeInfo.salary, newFrequency);
                    
                    console.log('🔄 Cambiando frecuencia a:', newFrequency);
                    console.log('💰 Nuevo salario base:', newBaseSalary);
                    
                    setConfig(prev => ({ 
                      ...prev, 
                      frequency: newFrequency,
                      baseSalary: newBaseSalary
                    }));
                  }}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    config.frequency === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Salarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salario Base {config.frequency === 'daily' ? 'Diario' : 
                             config.frequency === 'weekly' ? 'Semanal' : 
                             config.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
              </label>
              <input
                type="number"
                value={config.baseSalary}
                onChange={(e) => setConfig(prev => ({ ...prev, baseSalary: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salario Base de Cotización
              </label>
              <input
                type="number"
                value={config.sbc}
                onChange={(e) => setConfig(prev => ({ ...prev, sbc: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50000"
                required
              />
            </div>
          </div>

          {/* Configuración Laboral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días Laborales por Semana
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={config.workingDaysPerWeek}
                onChange={(e) => setConfig(prev => ({ ...prev, workingDaysPerWeek: parseInt(e.target.value) || 5 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas Laborales por Día
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={config.workingHoursPerDay}
                onChange={(e) => setConfig(prev => ({ ...prev, workingHoursPerDay: parseInt(e.target.value) || 8 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Multiplicador Horas Extra
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="3"
                value={config.overtimeRate}
                onChange={(e) => setConfig(prev => ({ ...prev, overtimeRate: parseFloat(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago
            </label>
            <select
              value={config.paymentMethod}
              onChange={(e) => setConfig(prev => ({ ...prev, paymentMethod: e.target.value as 'transfer' | 'cash' | 'check' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="transfer">Transferencia Bancaria</option>
              <option value="cash">Efectivo</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          {/* Notas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={config.notes}
              onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Configuraciones adicionales o notas especiales..."
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {currentConfig ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  {currentConfig ? 'Actualizar Configuración' : 'Guardar Configuración'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { EmployeePayrollView };
export default EmployeePayrollView;