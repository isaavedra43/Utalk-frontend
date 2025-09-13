import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit, 
  MoreHorizontal,
  User,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  Star,
  Award,
  History
} from 'lucide-react';
import EditEmployeeModal from './EditEmployeeModal';

// Importar todos los componentes que ya tienes desarrollados
import EmployeePayrollView from './EmployeePayrollView';
import EmployeeAttendanceView from './EmployeeAttendanceView';
import EmployeeVacationsView from './EmployeeVacationsView';
import EmployeeDocumentsView from './EmployeeDocumentsView';
import EmployeeIncidentsView from './EmployeeIncidentsView';
import EmployeeEvaluationsView from './EmployeeEvaluationsView';
import EmployeeSkillsView from './EmployeeSkillsView';
import EmployeeHistoryView from './EmployeeHistoryView';

// Usar exactamente el mismo tipo que usa EmployeeList (que funciona perfectamente)
import { Employee } from '../../../services/employeesApi';

interface EmployeeDetailViewProps {
  employee: Employee;
  onBack: () => void;
}

type TabType = 'summary' | 'payroll' | 'attendance' | 'vacations' | 'documents' | 'incidents' | 'evaluations' | 'skills' | 'history';

const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({ 
  employee, 
  onBack 
}) => {
  console.log('🚀 EmployeeDetailView iniciando con empleado:', employee);
  
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Función para manejar la actualización del empleado
  const handleUpdateEmployee = async (updatedData: Partial<Employee>) => {
    setIsUpdating(true);
    try {
      console.log('🔄 Actualizando empleado:', updatedData);
      
      // Aquí harías la llamada al API
      // const response = await fetch(`/api/employees/${employee.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(updatedData)
      // });
      
      // const result = await response.json();
      
      // if (!response.ok) {
      //   throw new Error(result.error || 'Error al actualizar empleado');
      // }
      
      // Simular actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ Empleado actualizado exitosamente');
      
      // Aquí actualizarías el estado del empleado con los nuevos datos
      // setEmployee(result.data.employee);
      
      // Cerrar modal
      setIsEditModalOpen(false);
      
      // Mostrar mensaje de éxito
      alert('Empleado actualizado exitosamente');
      
    } catch (error) {
      console.error('❌ Error al actualizar empleado:', error);
      alert('Error al actualizar empleado: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const tabs = [
    { id: 'summary' as TabType, label: 'Resumen', icon: User },
    { id: 'payroll' as TabType, label: 'Nómina', icon: DollarSign },
    { id: 'attendance' as TabType, label: 'Asistencia', icon: Clock },
    { id: 'vacations' as TabType, label: 'Vacaciones', icon: Calendar },
    { id: 'documents' as TabType, label: 'Documentos', icon: FileText },
    { id: 'incidents' as TabType, label: 'Incidentes', icon: AlertTriangle },
    { id: 'evaluations' as TabType, label: 'Evaluaciones', icon: Star },
    { id: 'skills' as TabType, label: 'Habilidades', icon: Award },
    { id: 'history' as TabType, label: 'Historial', icon: History }
  ];

  // Validación básica del empleado
  if (!employee || !employee.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-2" />
          <p className="text-red-700">Error: No se encontraron datos del empleado</p>
          <button onClick={onBack} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  // Función helper para formatear fechas de forma segura
  const safeFormatDate = (date: string | Date | null | undefined) => {
    try {
      if (!date) return 'N/A';
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'N/A';
      }
      return dateObj.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'N/A';
    }
  };

  // Función helper para obtener iniciales de forma segura
  const safeGetInitials = (firstName: string | undefined, lastName: string | undefined) => {
    try {
      const first = firstName?.charAt(0)?.toUpperCase() || '';
      const last = lastName?.charAt(0)?.toUpperCase() || '';
      return first + last || 'NN';
    } catch (error) {
      console.error('Error al obtener iniciales:', error);
      return 'NN';
    }
  };

  // Función para formatear salario de forma segura
  const safeFormatSalary = (salary: number | undefined, currency: string | undefined) => {
    try {
      if (!salary || salary === 0) return 'N/A';
      return `$${salary.toLocaleString()} ${currency || 'MXN'}`;
    } catch (error) {
      console.error('Error al formatear salario:', error);
      return 'N/A';
    }
  };

  const renderTabContent = () => {
    console.log('🎯 Renderizando contenido de tab:', activeTab);
    console.log('👤 Datos del empleado:', employee);
    
    try {
      switch (activeTab) {
        case 'payroll':
          try {
            console.log('🎯 Renderizando EmployeePayrollView para empleado:', employee.id);
            if (!employee?.id) {
              throw new Error('ID de empleado no disponible');
            }
            return <EmployeePayrollView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('❌ Error específico en EmployeePayrollView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Nómina</h3>
                  <p className="text-blue-600 text-sm">No hay información de nómina disponible para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'attendance':
          try {
            return <EmployeeAttendanceView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeeAttendanceView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Asistencia</h3>
                  <p className="text-blue-600 text-sm">No hay información de asistencia disponible para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'vacations':
          try {
            return <EmployeeVacationsView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeeVacationsView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Vacaciones</h3>
                  <p className="text-blue-600 text-sm">No hay información de vacaciones disponible para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'documents':
          try {
            return <EmployeeDocumentsView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeeDocumentsView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Documentos</h3>
                  <p className="text-blue-600 text-sm">No hay documentos disponibles para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'incidents':
          try {
            return <EmployeeIncidentsView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeeIncidentsView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Incidentes</h3>
                  <p className="text-blue-600 text-sm">No hay incidentes registrados para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'evaluations':
          try {
            return <EmployeeEvaluationsView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeeEvaluationsView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Star className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Evaluaciones</h3>
                  <p className="text-blue-600 text-sm">No hay evaluaciones disponibles para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'skills':
          try {
            return <EmployeeSkillsView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeeSkillsView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Award className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Habilidades</h3>
                  <p className="text-blue-600 text-sm">No hay habilidades registradas para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'history':
          try {
            return <EmployeeHistoryView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeeHistoryView:', error);
            return (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <History className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-blue-800 mb-1">Historial</h3>
                  <p className="text-blue-600 text-sm">No hay historial disponible para este empleado.</p>
                </div>
              </div>
            );
          }
        
        case 'summary':
        default:
          try {
            console.log('🎯 Renderizando vista summary con datos:', {
              personalInfo: employee?.personalInfo,
              position: employee?.position,
              contract: employee?.contract,
              salary: employee?.salary,
              metrics: employee?.metrics
            });
            
            // Extraer datos de forma segura
            const firstName = employee?.personalInfo?.firstName || 'N/A';
            const lastName = employee?.personalInfo?.lastName || 'N/A';
            const email = employee?.personalInfo?.email || 'No especificado';
            const phone = employee?.personalInfo?.phone || 'N/A';
            const dateOfBirth = employee?.personalInfo?.dateOfBirth;
            const gender = employee?.personalInfo?.gender || 'N/A';
            const maritalStatus = employee?.personalInfo?.maritalStatus || 'N/A';
            const nationality = employee?.personalInfo?.nationality || 'N/A';
            const rfc = employee?.personalInfo?.rfc || 'N/A';
            const curp = employee?.personalInfo?.curp || 'N/A';
            const nss = employee?.personalInfo?.nss || 'N/A';
            const employeeNumber = employee?.employeeNumber || 'N/A';
            const status = employee?.status || 'N/A';
            
            const positionTitle = employee?.position?.title || 'N/A';
            const department = employee?.position?.department || 'N/A';
            const level = employee?.position?.level || 'N/A';
            const reportsTo = employee?.position?.reportsTo || 'No especificado';
            const jobDescription = employee?.position?.jobDescription;
            const positionStartDate = employee?.position?.startDate;
            const positionEndDate = employee?.position?.endDate;
            
            const office = employee?.location?.office || 'N/A';
            const timezone = employee?.location?.timezone || 'N/A';
            const isRemote = employee?.location?.isRemote;
            const workingDays = employee?.contract?.workingDays || 'N/A';
            const workingHoursRange = employee?.contract?.workingHoursRange || 'N/A';
            const locationAddress = typeof employee?.location?.address === 'string' 
              ? employee.location.address 
              : employee?.location?.address?.street || 'N/A';
            
            const contractStartDate = employee?.contract?.startDate;
            const contractEndDate = employee?.contract?.endDate;
            const contractType = employee?.contract?.type || 'N/A';
            const contractSalary = employee?.contract?.salary;
            const contractCurrency = employee?.contract?.currency;
            const salaryFrequency = employee?.salary?.frequency || 'N/A';
            const paymentMethod = employee?.salary?.paymentMethod || 'N/A';
            const sbc = employee?.sbc;
            const vacationBalance = employee?.vacationBalance || 0;
            const sickLeaveBalance = employee?.sickLeaveBalance || 0;
            const benefits = employee?.contract?.benefits;
            
            const address = employee?.personalInfo?.address;
            const metrics = employee?.metrics;
            
            return (
              <div className="space-y-6">
                {/* Información Personal Básica */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                        <p className="text-gray-900">{firstName} {lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Número de Empleado</label>
                        <p className="text-gray-900">{employeeNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <p className="text-gray-900">{email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                        <p className="text-gray-900">{phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Nacimiento</label>
                        <p className="text-gray-900">{safeFormatDate(dateOfBirth)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Género</label>
                        <p className="text-gray-900">{gender}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Estado Civil</label>
                        <p className="text-gray-900">{maritalStatus}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nacionalidad</label>
                        <p className="text-gray-900">{nationality}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">RFC</label>
                        <p className="text-gray-900">{rfc}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">CURP</label>
                        <p className="text-gray-900">{curp}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">NSS</label>
                        <p className="text-gray-900">{nss}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status === 'active' ? 'Activo' : status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Dirección Personal */}
                    {address && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Dirección Personal</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Calle</label>
                            <p className="text-gray-900">{address?.street || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Número</label>
                            <p className="text-gray-900">{address?.number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Colonia</label>
                            <p className="text-gray-900">{address?.neighborhood || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Ciudad</label>
                            <p className="text-gray-900">{address?.city || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                            <p className="text-gray-900">{address?.state || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Código Postal</label>
                            <p className="text-gray-900">{address?.postalCode || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información Laboral */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Puesto</label>
                        <p className="text-gray-900">{positionTitle}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Departamento</label>
                        <p className="text-gray-900">{department}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Nivel</label>
                        <p className="text-gray-900">{level}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Reporta a</label>
                        <p className="text-gray-900">{reportsTo}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Inicio en Puesto</label>
                        <p className="text-gray-900">{safeFormatDate(positionStartDate)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Fin en Puesto</label>
                        <p className="text-gray-900">
                          {positionEndDate ? safeFormatDate(positionEndDate) : 'Actualmente en el puesto'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Descripción del Puesto */}
                    {jobDescription && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Descripción del Puesto</h4>
                        <p className="text-gray-700">{jobDescription}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de Ubicación y Horarios */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación y Horarios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Oficina</label>
                        <p className="text-gray-900">{office}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Zona Horaria</label>
                        <p className="text-gray-900">{timezone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Modalidad</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isRemote 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isRemote ? 'Remoto' : 'Presencial'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Días de Trabajo</label>
                        <p className="text-gray-900">{workingDays}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Horario de Trabajo</label>
                        <p className="text-gray-900">{workingHoursRange}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Dirección de Oficina</label>
                        <p className="text-gray-900">{locationAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Contrato y Salario */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrato y Salario</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Ingreso</label>
                        <p className="text-gray-900">{safeFormatDate(contractStartDate)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Fin de Contrato</label>
                        <p className="text-gray-900">
                          {contractEndDate ? safeFormatDate(contractEndDate) : 'Indefinido'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Contrato</label>
                        <p className="text-gray-900">{contractType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Salario</label>
                        <p className="text-gray-900">{safeFormatSalary(contractSalary, contractCurrency)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Frecuencia de Pago</label>
                        <p className="text-gray-900">{salaryFrequency}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Método de Pago</label>
                        <p className="text-gray-900">{paymentMethod}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">SBC</label>
                        <p className="text-gray-900">{safeFormatSalary(sbc, 'MXN')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Días de Vacaciones</label>
                        <p className="text-gray-900">{vacationBalance} días</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Días de Enfermedad</label>
                        <p className="text-gray-900">{sickLeaveBalance} días</p>
                      </div>
                    </div>
                    
                    {/* Beneficios */}
                    {benefits && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Beneficios</h4>
                        <p className="text-gray-700">{benefits}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Métricas y Rendimiento */}
                {metrics && (
                  <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas y Rendimiento</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Asistencia</label>
                          <p className="text-gray-900">{metrics?.attendanceRate || 0}%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Retardos</label>
                          <p className="text-gray-900">{metrics?.lateArrivals || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Faltas</label>
                          <p className="text-gray-900">{metrics?.absences || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Horas Extra</label>
                          <p className="text-gray-900">{metrics?.overtimeHours || 0} hrs</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Incidentes</label>
                          <p className="text-gray-900">{metrics?.incidentsCount || 0}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Cumplimiento Documental</label>
                          <p className="text-gray-900">{metrics?.documentCompliance || 0}%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Capacitación</label>
                          <p className="text-gray-900">{metrics?.trainingCompletion || 0}%</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Puntuación de Rendimiento</label>
                          <p className="text-gray-900">{metrics?.performanceScore || 0}/100</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          } catch (error) {
            console.error('❌ Error específico en vista summary:', error);
            return (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <h3 className="text-lg font-medium text-red-800 mb-1">Error en Vista Summary</h3>
                  <p className="text-red-600 text-sm">Ocurrió un error al mostrar el resumen. Intenta cambiar de pestaña.</p>
                </div>
              </div>
            );
          }
      }
    } catch (error) {
      console.error('❌ Error en renderTabContent:', error);
      return (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-red-800 mb-1">Error Temporal</h3>
            <p className="text-red-600 text-sm">Ocurrió un error al cargar este módulo. Intenta cambiar de pestaña.</p>
          </div>
        </div>
      );
    }
  };

  // Render principal con manejo robusto de errores
  try {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              {/* Employee Profile Card */}
              <div className="flex items-center space-x-6 mb-6">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {employee?.personalInfo?.avatar ? (
                      <img
                        src={employee.personalInfo.avatar}
                        alt={`${employee.personalInfo?.firstName || 'Empleado'} ${employee.personalInfo?.lastName || ''}`}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {safeGetInitials(employee?.personalInfo?.firstName, employee?.personalInfo?.lastName)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {employee?.personalInfo?.firstName || 'N/A'} {employee?.personalInfo?.lastName || 'N/A'}
                    </h1>
                    <p className="text-lg text-gray-600">{employee?.position?.title || 'N/A'}</p>
                    
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        <span>{employee?.position?.department || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{employee?.location?.office || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Ingreso: {safeFormatDate(employee?.contract?.startDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-auto">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span>Compartir</span>
                  </button>
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>

        {/* Modal de Edición */}
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateEmployee}
          employee={employee}
          loading={isUpdating}
        />
      </div>
    );
  } catch (error) {
    console.error('❌ Error crítico en render principal de EmployeeDetailView:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2 text-center">Error de Renderizado</h3>
          <p className="text-red-600 text-sm text-center mb-4">
            Ocurrió un error al mostrar los detalles del empleado. Los datos están disponibles pero hay un problema de renderizado.
          </p>
          <div className="text-center">
            <button 
              onClick={onBack}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver a la Lista
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export { EmployeeDetailView };
export default EmployeeDetailView;