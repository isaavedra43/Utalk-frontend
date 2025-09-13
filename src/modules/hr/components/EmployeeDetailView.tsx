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

// Importar todos los componentes que ya tienes desarrollados
import EmployeePayrollView from './EmployeePayrollView';
import EmployeeAttendanceView from './EmployeeAttendanceView';
import EmployeeVacationsView from './EmployeeVacationsView';
import EmployeeDocumentsView from './EmployeeDocumentsView';
import EmployeeIncidentsView from './EmployeeIncidentsView';
import EmployeeEvaluationsView from './EmployeeEvaluationsView';
import EmployeeSkillsView from './EmployeeSkillsView';
import EmployeeHistoryView from './EmployeeHistoryView';

interface Employee {
  id: string;
  employeeNumber: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    nationality?: string;
    rfc?: string;
    curp?: string;
    nss?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      number?: string;
      neighborhood?: string;
    };
    emergencyContact?: {
      name?: string;
      phone?: string;
      relationship?: string;
    };
    bankInfo?: {
      bankName?: string;
      accountNumber?: string;
      clabe?: string;
    };
  };
  position: {
    title: string;
    department: string;
    level: string;
    reportsTo?: string;
    jobDescription?: string;
    startDate?: string;
    endDate?: string;
    requirements?: string[];
    skills?: string[];
    salaryRange?: {
      min: number;
      max: number;
    };
  };
  location: {
    office: string;
    address?: string;
    timezone?: string;
    isRemote?: boolean;
    name?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contract: {
    startDate: string | Date;
    type: string;
    endDate?: string;
    salary?: number;
    currency?: string;
    workingDays?: string;
    workingHoursRange?: string;
    customSchedule?: {
      enabled?: boolean;
      days?: Record<string, {
        enabled: boolean;
        startTime: string;
        endTime: string;
      }>;
    };
    benefits?: string;
    clauses?: string[];
    schedule?: string;
    notes?: string;
  };
  status?: string;
  salary?: {
    baseSalary?: number;
    currency?: string;
    frequency?: string;
    paymentMethod?: string;
    allowances?: {
      name: string;
      amount: number;
      type: string;
    }[];
    deductions?: {
      name: string;
      amount: number;
      type: string;
    }[];
  };
  sbc?: number;
  vacationBalance?: number;
  sickLeaveBalance?: number;
  metrics?: {
    totalEarnings?: number;
    totalDeductions?: number;
    netPay?: number;
    attendanceRate?: number;
    lateArrivals?: number;
    absences?: number;
    vacationDaysUsed?: number;
    vacationDaysRemaining?: number;
    overtimeHours?: number;
    overtimeAmount?: number;
    incidentsCount?: number;
    incidentsLast30Days?: number;
    documentCompliance?: number;
    trainingCompletion?: number;
    performanceScore?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

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

  const renderTabContent = () => {
    console.log('🎯 Renderizando contenido de tab:', activeTab);
    console.log('👤 Datos del empleado:', employee);
    
    try {
      switch (activeTab) {
        case 'payroll':
          try {
            return <EmployeePayrollView employeeId={employee.id} onBack={onBack} />;
          } catch (error) {
            console.error('Error en EmployeePayrollView:', error);
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
          return (
            <div className="space-y-6">
              {/* Información Personal Completa */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                      <p className="text-gray-900">{employee.personalInfo?.firstName || 'N/A'} {employee.personalInfo?.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Número de Empleado</label>
                      <p className="text-gray-900">{employee.employeeNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <p className="text-gray-900">{employee.personalInfo?.email || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                      <p className="text-gray-900">{employee.personalInfo?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Nacimiento</label>
                      <p className="text-gray-900">{safeFormatDate(employee.personalInfo?.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Género</label>
                      <p className="text-gray-900">{employee.personalInfo?.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Estado Civil</label>
                      <p className="text-gray-900">{employee.personalInfo?.maritalStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nacionalidad</label>
                      <p className="text-gray-900">{employee.personalInfo?.nationality || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">RFC</label>
                      <p className="text-gray-900">{employee.personalInfo?.rfc || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">CURP</label>
                      <p className="text-gray-900">{employee.personalInfo?.curp || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">NSS</label>
                      <p className="text-gray-900">{employee.personalInfo?.nss || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status === 'active' ? 'Activo' : employee.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Dirección Personal */}
                  {employee.personalInfo?.address && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Dirección Personal</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Calle</label>
                          <p className="text-gray-900">{employee.personalInfo.address.street || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Número</label>
                          <p className="text-gray-900">{employee.personalInfo.address.number || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Colonia</label>
                          <p className="text-gray-900">{employee.personalInfo.address.neighborhood || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Ciudad</label>
                          <p className="text-gray-900">{employee.personalInfo.address.city || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                          <p className="text-gray-900">{employee.personalInfo.address.state || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Código Postal</label>
                          <p className="text-gray-900">{employee.personalInfo.address.postalCode || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Laboral Completa */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Puesto</label>
                      <p className="text-gray-900">{employee.position?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Departamento</label>
                      <p className="text-gray-900">{employee.position?.department || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Nivel</label>
                      <p className="text-gray-900">{employee.position?.level || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Reporta a</label>
                      <p className="text-gray-900">{employee.position?.reportsTo || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Inicio en Puesto</label>
                      <p className="text-gray-900">{safeFormatDate(employee.position?.startDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Fin en Puesto</label>
                      <p className="text-gray-900">{employee.position?.endDate ? safeFormatDate(employee.position.endDate) : 'Actualmente en el puesto'}</p>
                    </div>
                  </div>
                  
                  {/* Descripción del Puesto */}
                  {employee.position?.jobDescription && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Descripción del Puesto</h4>
                      <p className="text-gray-700">{employee.position.jobDescription}</p>
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
                      <p className="text-gray-900">{employee.location?.office || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Zona Horaria</label>
                      <p className="text-gray-900">{employee.location?.timezone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Modalidad</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.location?.isRemote 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {employee.location?.isRemote ? 'Remoto' : 'Presencial'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Días de Trabajo</label>
                      <p className="text-gray-900">{employee.contract?.workingDays || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Horario de Trabajo</label>
                      <p className="text-gray-900">{employee.contract?.workingHoursRange || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Dirección de Oficina</label>
                      <p className="text-gray-900">{employee.location?.address || 'N/A'}</p>
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
                      <p className="text-gray-900">{safeFormatDate(employee.contract?.startDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Fin de Contrato</label>
                      <p className="text-gray-900">{employee.contract?.endDate ? safeFormatDate(employee.contract.endDate) : 'Indefinido'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Contrato</label>
                      <p className="text-gray-900">{employee.contract?.type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Salario</label>
                      <p className="text-gray-900">
                        {employee.contract?.salary 
                          ? `$${employee.contract.salary.toLocaleString()} ${employee.contract.currency || 'MXN'}` 
                          : employee.salary?.baseSalary 
                            ? `$${employee.salary.baseSalary.toLocaleString()} ${employee.salary.currency || 'MXN'}`
                            : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Frecuencia de Pago</label>
                      <p className="text-gray-900">{employee.salary?.frequency || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Método de Pago</label>
                      <p className="text-gray-900">{employee.salary?.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">SBC</label>
                      <p className="text-gray-900">{employee.sbc ? `$${employee.sbc.toLocaleString()}` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Días de Vacaciones</label>
                      <p className="text-gray-900">{employee.vacationBalance || 0} días</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Días de Enfermedad</label>
                      <p className="text-gray-900">{employee.sickLeaveBalance || 0} días</p>
                    </div>
                  </div>
                  
                  {/* Beneficios */}
                  {employee.contract?.benefits && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Beneficios</h4>
                      <p className="text-gray-700">{employee.contract.benefits}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Métricas y Rendimiento */}
              {employee.metrics && (
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas y Rendimiento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Asistencia</label>
                        <p className="text-gray-900">{employee.metrics.attendanceRate || 0}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Retardos</label>
                        <p className="text-gray-900">{employee.metrics.lateArrivals || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Faltas</label>
                        <p className="text-gray-900">{employee.metrics.absences || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Horas Extra</label>
                        <p className="text-gray-900">{employee.metrics.overtimeHours || 0} hrs</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Incidentes</label>
                        <p className="text-gray-900">{employee.metrics.incidentsCount || 0}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cumplimiento Documental</label>
                        <p className="text-gray-900">{employee.metrics.documentCompliance || 0}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Capacitación</label>
                        <p className="text-gray-900">{employee.metrics.trainingCompletion || 0}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Puntuación de Rendimiento</label>
                        <p className="text-gray-900">{employee.metrics.performanceScore || 0}/100</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
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
                <button className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
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
    </div>
  );
};

export { EmployeeDetailView };
export default EmployeeDetailView;