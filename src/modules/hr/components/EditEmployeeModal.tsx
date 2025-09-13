import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  employee: any;
  loading?: boolean;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employee,
  loading = false
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('personal');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Inicializar datos del formulario
  useEffect(() => {
    if (employee) {
      setFormData({
        personalInfo: {
          firstName: employee.personalInfo?.firstName || '',
          lastName: employee.personalInfo?.lastName || '',
          email: employee.personalInfo?.email || '',
          phone: employee.personalInfo?.phone || '',
          avatar: employee.personalInfo?.avatar || '',
          dateOfBirth: employee.personalInfo?.dateOfBirth || '',
          gender: employee.personalInfo?.gender || 'M',
          maritalStatus: employee.personalInfo?.maritalStatus || '',
          nationality: employee.personalInfo?.nationality || '',
          rfc: employee.personalInfo?.rfc || '',
          curp: employee.personalInfo?.curp || '',
          nss: employee.personalInfo?.nss || '',
          address: {
            street: employee.personalInfo?.address?.street || '',
            city: employee.personalInfo?.address?.city || '',
            state: employee.personalInfo?.address?.state || '',
            country: employee.personalInfo?.address?.country || '',
            postalCode: employee.personalInfo?.address?.postalCode || '',
            number: employee.personalInfo?.address?.number || '',
            neighborhood: employee.personalInfo?.address?.neighborhood || '',
            zipCode: employee.personalInfo?.address?.zipCode || ''
          },
          emergencyContact: {
            name: employee.personalInfo?.emergencyContact?.name || '',
            phone: employee.personalInfo?.emergencyContact?.phone || '',
            relationship: employee.personalInfo?.emergencyContact?.relationship || ''
          },
          bankInfo: {
            bankName: employee.personalInfo?.bankInfo?.bankName || '',
            accountNumber: employee.personalInfo?.bankInfo?.accountNumber || '',
            clabe: employee.personalInfo?.bankInfo?.clabe || ''
          }
        },
        position: {
          title: employee.position?.title || '',
          department: employee.position?.department || '',
          level: employee.position?.level || 'Junior',
          startDate: employee.position?.startDate || '',
          endDate: employee.position?.endDate || '',
          reportsTo: employee.position?.reportsTo || '',
          jobDescription: employee.position?.jobDescription || '',
          workSchedule: employee.position?.workSchedule || ''
        },
        location: {
          office: employee.location?.office || '',
          address: {
            street: employee.location?.address?.street || '',
            city: employee.location?.address?.city || '',
            state: employee.location?.address?.state || '',
            country: employee.location?.address?.country || '',
            postalCode: employee.location?.address?.postalCode || ''
          },
          isRemote: employee.location?.isRemote || false
        },
        contract: {
          type: employee.contract?.type || 'permanent',
          startDate: employee.contract?.startDate || '',
          endDate: employee.contract?.endDate || '',
          salary: employee.contract?.salary || 0,
          currency: employee.contract?.currency || 'MXN',
          workingDays: employee.contract?.workingDays || '',
          workingHoursRange: employee.contract?.workingHoursRange || '',
          customSchedule: employee.contract?.customSchedule || {
            enabled: false,
            days: {
              lunes: { enabled: true, startTime: '09:00', endTime: '18:00' },
              martes: { enabled: true, startTime: '09:00', endTime: '18:00' },
              miercoles: { enabled: true, startTime: '09:00', endTime: '18:00' },
              jueves: { enabled: true, startTime: '09:00', endTime: '18:00' },
              viernes: { enabled: true, startTime: '09:00', endTime: '18:00' },
              sabado: { enabled: false, startTime: '09:00', endTime: '18:00' },
              domingo: { enabled: false, startTime: '09:00', endTime: '18:00' }
            }
          },
          benefits: employee.contract?.benefits || '',
          clauses: employee.contract?.clauses || '',
          notes: employee.contract?.notes || ''
        },
        status: employee.status || 'active',
        salary: {
          baseSalary: employee.salary?.baseSalary || 0,
          currency: employee.salary?.currency || 'MXN',
          frequency: employee.salary?.frequency || 'monthly',
          paymentMethod: employee.salary?.paymentMethod || 'bank_transfer',
          allowances: employee.salary?.allowances || [],
          deductions: employee.salary?.deductions || []
        },
        sbc: employee.sbc || 0,
        vacationBalance: employee.vacationBalance || 0,
        sickLeaveBalance: employee.sickLeaveBalance || 0,
        metrics: {
          performanceScore: employee.metrics?.performanceScore || 0,
          attendanceScore: employee.metrics?.attendanceScore || 0,
          lastEvaluation: employee.metrics?.lastEvaluation || ''
        }
      });
    }
  }, [employee]);

  const handleInputChange = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Limpiar error del campo
    if (errors[path]) {
      setErrors(prev => ({ ...prev, [path]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones de información personal
    if (!formData.personalInfo?.firstName?.trim()) {
      newErrors['personalInfo.firstName'] = 'El nombre es requerido';
    }
    if (!formData.personalInfo?.lastName?.trim()) {
      newErrors['personalInfo.lastName'] = 'El apellido es requerido';
    }
    if (!formData.personalInfo?.email?.trim()) {
      newErrors['personalInfo.email'] = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalInfo.email)) {
      newErrors['personalInfo.email'] = 'El formato del email no es válido';
    }
    if (!formData.personalInfo?.phone?.trim()) {
      newErrors['personalInfo.phone'] = 'El teléfono es requerido';
    }

    // Validaciones de posición
    if (!formData.position?.title?.trim()) {
      newErrors['position.title'] = 'El puesto es requerido';
    }
    if (!formData.position?.department?.trim()) {
      newErrors['position.department'] = 'El departamento es requerido';
    }

    // Validaciones de contrato
    if (!formData.contract?.salary || formData.contract.salary < 5000) {
      newErrors['contract.salary'] = 'El salario debe ser mayor a $5,000';
    }
    if (formData.contract?.salary > 500000) {
      newErrors['contract.salary'] = 'El salario no puede exceder $500,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para preparar datos según la pestaña activa
  const prepareDataForSubmission = () => {
    switch (activeTab) {
      case 'personal':
        return {
          personalInfo: {
            firstName: formData.personalInfo?.firstName,
            lastName: formData.personalInfo?.lastName,
            email: formData.personalInfo?.email,
            phone: formData.personalInfo?.phone,
            dateOfBirth: formData.personalInfo?.dateOfBirth,
            gender: formData.personalInfo?.gender,
            maritalStatus: formData.personalInfo?.maritalStatus,
            nationality: formData.personalInfo?.nationality,
            rfc: formData.personalInfo?.rfc,
            curp: formData.personalInfo?.curp,
            nss: formData.personalInfo?.nss,
            address: formData.personalInfo?.address
          }
        };
      
      case 'position':
        return {
          position: {
            title: formData.position?.title,
            department: formData.position?.department,
            level: formData.position?.level,
            reportsTo: formData.position?.reportsTo,
            jobDescription: formData.position?.jobDescription,
            startDate: formData.position?.startDate,
            endDate: formData.position?.endDate
          }
        };
      
      case 'contract':
        return {
          contract: {
            type: formData.contract?.type,
            startDate: formData.contract?.startDate,
            endDate: formData.contract?.endDate,
            salary: formData.contract?.salary,
            currency: formData.contract?.currency,
            workingDays: formData.contract?.workingDays,
            workingHoursRange: formData.contract?.workingHoursRange,
            benefits: formData.contract?.benefits
          }
        };
      
      case 'location':
        return {
          location: {
            office: formData.location?.office,
            isRemote: formData.location?.isRemote,
            address: formData.location?.address
          }
        };
      
      case 'salary':
        return {
          salary: {
            baseSalary: formData.salary?.baseSalary,
            currency: formData.salary?.currency,
            frequency: formData.salary?.frequency,
            paymentMethod: formData.salary?.paymentMethod,
            sbc: formData.sbc
          },
          vacationBalance: formData.vacationBalance,
          sickLeaveBalance: formData.sickLeaveBalance
        };
      
      default:
        return formData;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = prepareDataForSubmission();
      console.log('📋 Datos a enviar para la pestaña:', activeTab, dataToSubmit);
      onSubmit(dataToSubmit);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'position', label: 'Posición', icon: Building },
    { id: 'contract', label: 'Contrato', icon: FileText },
    { id: 'location', label: 'Ubicación', icon: MapPin },
    { id: 'salary', label: 'Salario', icon: DollarSign }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Empleado</h2>
              <p className="text-sm text-gray-600">
                {formData.personalInfo?.firstName} {formData.personalInfo?.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={showSensitiveData ? 'Ocultar datos sensibles' : 'Mostrar datos sensibles'}
            >
              {showSensitiveData ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            
            {/* Tab: Información Personal */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo?.firstName || ''}
                      onChange={(e) => handleInputChange('personalInfo.firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['personalInfo.firstName'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['personalInfo.firstName'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['personalInfo.firstName']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo?.lastName || ''}
                      onChange={(e) => handleInputChange('personalInfo.lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['personalInfo.lastName'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['personalInfo.lastName'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['personalInfo.lastName']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.personalInfo?.email || ''}
                      onChange={(e) => handleInputChange('personalInfo.email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['personalInfo.email'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['personalInfo.email'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['personalInfo.email']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={formData.personalInfo?.phone || ''}
                      onChange={(e) => handleInputChange('personalInfo.phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['personalInfo.phone'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['personalInfo.phone'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['personalInfo.phone']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={formData.personalInfo?.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('personalInfo.dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Género
                    </label>
                    <select
                      value={formData.personalInfo?.gender || 'M'}
                      onChange={(e) => handleInputChange('personalInfo.gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado Civil
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo?.maritalStatus || ''}
                      onChange={(e) => handleInputChange('personalInfo.maritalStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nacionalidad
                    </label>
                    <input
                      type="text"
                      value={formData.personalInfo?.nationality || ''}
                      onChange={(e) => handleInputChange('personalInfo.nationality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Datos sensibles */}
                {showSensitiveData && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Sensibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          RFC
                        </label>
                        <input
                          type="text"
                          value={formData.personalInfo?.rfc || ''}
                          onChange={(e) => handleInputChange('personalInfo.rfc', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CURP
                        </label>
                        <input
                          type="text"
                          value={formData.personalInfo?.curp || ''}
                          onChange={(e) => handleInputChange('personalInfo.curp', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NSS
                        </label>
                        <input
                          type="text"
                          value={formData.personalInfo?.nss || ''}
                          onChange={(e) => handleInputChange('personalInfo.nss', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Posición */}
            {activeTab === 'position' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puesto *
                    </label>
                    <input
                      type="text"
                      value={formData.position?.title || ''}
                      onChange={(e) => handleInputChange('position.title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['position.title'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['position.title'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['position.title']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento *
                    </label>
                    <input
                      type="text"
                      value={formData.position?.department || ''}
                      onChange={(e) => handleInputChange('position.department', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['position.department'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['position.department'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['position.department']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel
                    </label>
                    <select
                      value={formData.position?.level || 'Junior'}
                      onChange={(e) => handleInputChange('position.level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Manager">Manager</option>
                      <option value="Director">Director</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.position?.startDate || ''}
                      onChange={(e) => handleInputChange('position.startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={formData.position?.endDate || ''}
                      onChange={(e) => handleInputChange('position.endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reporta a
                    </label>
                    <input
                      type="text"
                      value={formData.position?.reportsTo || ''}
                      onChange={(e) => handleInputChange('position.reportsTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Puesto
                  </label>
                  <textarea
                    value={formData.position?.jobDescription || ''}
                    onChange={(e) => handleInputChange('position.jobDescription', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Tab: Contrato */}
            {activeTab === 'contract' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contrato
                    </label>
                    <select
                      value={formData.contract?.type || 'permanent'}
                      onChange={(e) => handleInputChange('contract.type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="permanent">Permanente</option>
                      <option value="temporary">Temporal</option>
                      <option value="intern">Interno</option>
                      <option value="contractor">Contratista</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.contract?.startDate || ''}
                      onChange={(e) => handleInputChange('contract.startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      value={formData.contract?.endDate || ''}
                      onChange={(e) => handleInputChange('contract.endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salario *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.contract?.salary || 0}
                      onChange={(e) => handleInputChange('contract.salary', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['contract.salary'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors['contract.salary'] && (
                      <p className="mt-1 text-sm text-red-600">{errors['contract.salary']}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda
                    </label>
                    <select
                      value={formData.contract?.currency || 'MXN'}
                      onChange={(e) => handleInputChange('contract.currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="MXN">MXN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Trabajo
                    </label>
                    <input
                      type="text"
                      value={formData.contract?.workingDays || ''}
                      onChange={(e) => handleInputChange('contract.workingDays', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horario de Trabajo
                    </label>
                    <input
                      type="text"
                      value={formData.contract?.workingHoursRange || ''}
                      onChange={(e) => handleInputChange('contract.workingHoursRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="terminated">Terminado</option>
                      <option value="on_leave">En licencia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficios
                  </label>
                  <textarea
                    value={formData.contract?.benefits || ''}
                    onChange={(e) => handleInputChange('contract.benefits', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Tab: Ubicación */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Oficina
                    </label>
                    <input
                      type="text"
                      value={formData.location?.office || ''}
                      onChange={(e) => handleInputChange('location.office', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRemote"
                      checked={formData.location?.isRemote || false}
                      onChange={(e) => handleInputChange('location.isRemote', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-900">
                      Trabajo Remoto
                    </label>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección de Oficina</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calle
                      </label>
                      <input
                        type="text"
                        value={formData.location?.address?.street || ''}
                        onChange={(e) => handleInputChange('location.address.street', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={formData.location?.address?.city || ''}
                        onChange={(e) => handleInputChange('location.address.city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={formData.location?.address?.state || ''}
                        onChange={(e) => handleInputChange('location.address.state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={formData.location?.address?.postalCode || ''}
                        onChange={(e) => handleInputChange('location.address.postalCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Salario */}
            {activeTab === 'salary' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salario Base
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.salary?.baseSalary || 0}
                      onChange={(e) => handleInputChange('salary.baseSalary', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frecuencia de Pago
                    </label>
                    <select
                      value={formData.salary?.frequency || 'monthly'}
                      onChange={(e) => handleInputChange('salary.frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago
                    </label>
                    <select
                      value={formData.salary?.paymentMethod || 'bank_transfer'}
                      onChange={(e) => handleInputChange('salary.paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="bank_transfer">Transferencia Bancaria</option>
                      <option value="cash">Efectivo</option>
                      <option value="check">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SBC (Salario Base de Cotización)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sbc || 0}
                      onChange={(e) => handleInputChange('sbc', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Vacaciones
                    </label>
                    <input
                      type="number"
                      value={formData.vacationBalance || 0}
                      onChange={(e) => handleInputChange('vacationBalance', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Días de Enfermedad
                    </label>
                    <input
                      type="number"
                      value={formData.sickLeaveBalance || 0}
                      onChange={(e) => handleInputChange('sickLeaveBalance', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? 'Guardando...' : `Guardar ${tabs.find(tab => tab.id === activeTab)?.label}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;