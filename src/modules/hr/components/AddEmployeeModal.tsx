import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  User,
  Building2,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Camera
} from 'lucide-react';
import { employeesApi } from '../../../services/employeesApi';
import { useValidationErrors } from '../../../hooks/useValidationErrors';
import { useToast } from '../../../hooks/useToast';
import type { Employee, PersonalInfo, Position, Location, Contract, SalaryInfo } from '../../../types/hr';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks para manejo de errores
  const { 
    fieldErrors, 
    processValidationError, 
    clearFieldError, 
    clearAllErrors, 
    getFieldError, 
    highlightAllErrorFields 
  } = useValidationErrors();
  const { showSuccess, showError } = useToast();

  // Función para generar número de empleado automático en secuencia
  const generateEmployeeNumber = async (): Promise<string> => {
    try {
      // En una implementación real, esto haría una llamada al backend
      // para obtener el siguiente número de empleado disponible
      // Ejemplo: GET /api/employees/next-number
      
      // Simular llamada al backend
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simular secuencia real basada en el año actual y un contador
      const currentYear = new Date().getFullYear();
      const yearSuffix = currentYear.toString().slice(-2); // Últimos 2 dígitos del año
      
      // Simular que ya existen algunos empleados (para demostrar la secuencia)
      const baseNumber = 1000; // Número base para el año actual
      const randomIncrement = Math.floor(Math.random() * 50) + 1; // Incremento aleatorio para simular
      const employeeNumber = baseNumber + randomIncrement;
      
      return `EMP${yearSuffix}${employeeNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generando número de empleado:', error);
      // Fallback: usar timestamp
      const timestamp = Date.now().toString().slice(-6);
      return `EMP${timestamp}`;
    }
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Información básica
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active' as const,
    hireDate: new Date().toISOString().split('T')[0],
    
    // Información personal
    personalInfo: {
      rfc: '',
      curp: '',
      nss: '',
      birthDate: '',
      gender: 'male' as const,
      maritalStatus: 'single' as const,
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'México'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      bankInfo: {
        bankName: '',
        accountNumber: '',
        clabe: '',
        accountType: 'checking' as const
      }
    },
    
    // Información laboral
    position: {
      id: '',
      title: '',
      department: '',
      level: '',
      reportsTo: '',
      jobDescription: '',
      requirements: [] as string[],
      skills: [] as string[],
      salaryRange: { min: 0, max: 0 }
    },
    
    location: {
      id: '',
      name: '',
      address: {
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'México'
      },
      timezone: 'America/Mexico_City',
      isRemote: false
    },
    
    contract: {
      id: '',
      type: 'permanent' as const,
      startDate: new Date().toISOString().split('T')[0],
      workingHours: 40,
      workingDays: 'Lunes a Viernes',
      workingHoursRange: '9:00-18:00',
      customSchedule: {
        enabled: false,
        days: {
          lunes: { enabled: true, startTime: '09:00', endTime: '18:00' },
          martes: { enabled: true, startTime: '09:00', endTime: '18:00' },
          miercoles: { enabled: true, startTime: '09:00', endTime: '18:00' },
          jueves: { enabled: true, startTime: '09:00', endTime: '18:00' },
          viernes: { enabled: true, startTime: '09:00', endTime: '18:00' },
          sabado: { enabled: false, startTime: '09:00', endTime: '14:00' },
          domingo: { enabled: false, startTime: '09:00', endTime: '18:00' }
        }
      },
      benefits: [] as string[],
      clauses: [] as string[]
    },
    
    salary: {
      baseSalary: 0,
      currency: 'MXN',
      frequency: 'monthly' as const,
      paymentMethod: 'bank_transfer' as const,
      allowances: [] as any[],
      deductions: [] as any[]
    },
    
    sbc: 0,
    vacationBalance: 0,
    sickLeaveBalance: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Funciones para manejo de moneda
  const formatCurrency = (value: number, currency: string = 'MXN'): string => {
    if (isNaN(value) || value === 0) return '';
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseCurrencyInput = (value: string): number => {
    // Remover símbolos de moneda y espacios
    const cleanValue = value.replace(/[$,\s]/g, '').replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleCurrencyInputChange = (field: string, value: string) => {
    const numericValue = parseCurrencyInput(value);
    handleInputChange(field, numericValue);
  };

  // Componente de input de moneda
  const CurrencyInput: React.FC<{
    value: number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    currency?: string;
    error?: string;
  }> = ({ value, onChange, placeholder = "0", className = "", currency = "MXN", error }) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatCurrency(value, currency));
      }
    }, [value, currency, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      onChange(inputValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
      // Mostrar solo números cuando se enfoca
      setDisplayValue(value > 0 ? value.toString() : '');
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Formatear cuando pierde el foco
      setDisplayValue(formatCurrency(value, currency));
    };

    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm">
            {currency === 'MXN' ? '$' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency}
          </span>
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        />
      </div>
    );
  };

  // Función para validar horario personalizado
  const validateCustomSchedule = (days: any) => {
    const enabledDays = Object.entries(days).filter(([_, day]: [string, any]) => day && day.enabled);
    
    if (enabledDays.length === 0) {
      return 'Debe seleccionar al menos un día de trabajo';
    }
    
    // Validar que las horas sean válidas
    for (const [dayName, day] of enabledDays) {
      const dayData = day as any;
      if (!dayData.startTime || !dayData.endTime) {
        return `Debe configurar horario completo para ${dayName}`;
      }
      
      // Validar que la hora de inicio sea anterior a la de fin
      const startTime = new Date(`2000-01-01T${dayData.startTime}:00`);
      const endTime = new Date(`2000-01-01T${dayData.endTime}:00`);
      
      if (startTime >= endTime) {
        return `La hora de inicio debe ser anterior a la de fin en ${dayName}`;
      }
    }
    
    return null; // Sin errores
  };

  // Función para generar horario personalizado
  const generateCustomSchedule = (days: any) => {
    if (!days) return '';
    
    const enabledDays = Object.entries(days)
      .filter(([_, day]: [string, any]) => day && day.enabled && day.startTime && day.endTime)
      .map(([dayName, day]: [string, any]) => {
        const dayNames: Record<string, string> = {
          lunes: 'Lunes',
          martes: 'Martes',
          miercoles: 'Miércoles',
          jueves: 'Jueves',
          viernes: 'Viernes',
          sabado: 'Sábado',
          domingo: 'Domingo'
        };
        
        // Validar que las horas sean válidas
        const startTime = day.startTime || '09:00';
        const endTime = day.endTime || '18:00';
        
        return `${dayNames[dayName]} ${startTime}-${endTime}`;
      });
    
    return enabledDays.length > 0 ? enabledDays.join(', ') : 'Sin días configurados';
  };

  // Generar número de empleado automáticamente cuando se abre el modal
  useEffect(() => {
    if (isOpen && !formData.employeeNumber) {
      setIsGeneratingNumber(true);
      generateEmployeeNumber().then((number) => {
        setFormData(prev => ({ ...prev, employeeNumber: number }));
        setIsGeneratingNumber(false);
      }).catch(() => {
        setIsGeneratingNumber(false);
      });
    }
  }, [isOpen]);

  const steps = [
    { number: 1, title: 'Información Básica', icon: User },
    { number: 2, title: 'Información Personal', icon: FileText },
    { number: 3, title: 'Información Laboral', icon: Building2 },
    { number: 4, title: 'Nómina y Contrato', icon: DollarSign }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof typeof prev],
            [keys[1]]: value
          }
        };
      } else if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof typeof prev],
            [keys[1]]: {
              ...(prev[keys[0] as keyof typeof prev] as any)[keys[1]],
              [keys[2]]: value
            }
          }
        };
      } else if (keys.length === 4) {
        // Para campos como contract.customSchedule.days.lunes.enabled
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof typeof prev],
            [keys[1]]: {
              ...(prev[keys[0] as keyof typeof prev] as any)[keys[1]],
              [keys[2]]: {
                ...(prev[keys[0] as keyof typeof prev] as any)[keys[1]][keys[2]],
                [keys[3]]: value
              }
            }
          }
        };
      } else if (keys.length === 5) {
        // Para campos como contract.customSchedule.days.lunes.startTime
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof typeof prev],
            [keys[1]]: {
              ...(prev[keys[0] as keyof typeof prev] as any)[keys[1]],
              [keys[2]]: {
                ...(prev[keys[0] as keyof typeof prev] as any)[keys[1]][keys[2]],
                [keys[3]]: {
                  ...(prev[keys[0] as keyof typeof prev] as any)[keys[1]][keys[2]][keys[3]],
                  [keys[4]]: value
                }
              }
            }
          }
        };
      }
      return prev;
    });
    
    // Limpiar error del campo local
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Limpiar error de validación del backend
    clearFieldError(field);
    
    // Limpiar error de horario personalizado si se está modificando
    if (field.includes('customSchedule') && errors.customSchedule) {
      setErrors(prev => ({ ...prev, customSchedule: '' }));
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
        // El email es opcional, no necesita validación
        // El número de empleado se genera automáticamente, no necesita validación
        break;
      case 2:
        if (!formData.personalInfo.rfc.trim()) newErrors.rfc = 'El RFC es requerido';
        if (!formData.personalInfo.curp.trim()) newErrors.curp = 'La CURP es requerida';
        if (!formData.personalInfo.nss.trim()) newErrors.nss = 'El NSS es requerido';
        break;
      case 3:
        if (!formData.position.title.trim()) newErrors.title = 'El puesto es requerido';
        if (!formData.position.department.trim()) newErrors.department = 'El departamento es requerido';
        break;
      case 4:
        if (formData.salary.baseSalary <= 0) newErrors.baseSalary = 'El sueldo base debe ser mayor a 0';
        if (formData.sbc <= 0) newErrors.sbc = 'El SBC debe ser mayor a 0';
        
        // Validar horario personalizado si está habilitado
        if (formData.contract.customSchedule.enabled) {
          const scheduleError = validateCustomSchedule(formData.contract.customSchedule.days);
          if (scheduleError) {
            newErrors.customSchedule = scheduleError;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    clearAllErrors(); // Limpiar errores previos
    
    try {
      // Crear el objeto empleado
      const newEmployee = {
        employeeNumber: formData.employeeNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        avatar: avatar || undefined,
        status: formData.status,
        hireDate: new Date(formData.hireDate),
        personalInfo: {
          ...formData.personalInfo,
          birthDate: new Date(formData.personalInfo.birthDate)
        },
        position: formData.position,
        location: formData.location,
        contract: {
          ...formData.contract,
          startDate: new Date(formData.contract.startDate),
          schedule: formData.contract.customSchedule.enabled 
            ? generateCustomSchedule(formData.contract.customSchedule.days)
            : `${formData.contract.workingDays} ${formData.contract.workingHoursRange}`
        },
        salary: formData.salary,
        sbc: formData.sbc,
        vacationBalance: formData.vacationBalance,
        sickLeaveBalance: formData.sickLeaveBalance,
        metrics: {
          totalEarnings: formData.salary.baseSalary,
          totalDeductions: 0,
          netPay: formData.salary.baseSalary,
          attendanceRate: 100,
          lateArrivals: 0,
          absences: 0,
          vacationDaysUsed: 0,
          vacationDaysRemaining: formData.vacationBalance,
          overtimeHours: 0,
          overtimeAmount: 0,
          incidentsCount: 0,
          incidentsLast30Days: 0,
          documentCompliance: 0,
          trainingCompletion: 0,
          performanceScore: 0
        }
      };

      await onSave(newEmployee);
      
      // Solo cerrar el modal si no hay errores
      showSuccess('Éxito', 'Empleado creado correctamente', 3000);
      onClose();
      await resetForm();
    } catch (error: any) {
      console.error('Error al guardar empleado:', error);
      
      // Verificar si es un error de validación del backend
      if (error?.response?.data?.error === 'validation_error') {
        const validationErrors = processValidationError(error.response.data);
        if (validationErrors) {
          // Resaltar campos con errores
          highlightAllErrorFields();
          // NO cerrar el modal, permitir corrección
          return;
        }
      }
      
      // Para otros errores, mostrar mensaje genérico
      showError('Error', 'Error al crear empleado. Por favor, intenta de nuevo.', 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = async () => {
    setCurrentStep(1);
    setAvatar(null);
    clearAllErrors(); // Limpiar errores de validación
    
    // Generar nuevo número de empleado
    setIsGeneratingNumber(true);
    const newEmployeeNumber = await generateEmployeeNumber();
    setIsGeneratingNumber(false);
    
    setFormData({
      employeeNumber: newEmployeeNumber,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      personalInfo: {
        rfc: '',
        curp: '',
        nss: '',
        birthDate: '',
        gender: 'male',
        maritalStatus: 'single',
        address: {
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'México'
        },
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
          email: ''
        },
        bankInfo: {
          bankName: '',
          accountNumber: '',
          clabe: '',
          accountType: 'checking'
        }
      },
      position: {
        id: '',
        title: '',
        department: '',
        level: '',
        reportsTo: '',
        jobDescription: '',
        requirements: [],
        skills: [],
        salaryRange: { min: 0, max: 0 }
      },
      location: {
        id: '',
        name: '',
        address: {
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'México'
        },
        timezone: 'America/Mexico_City',
        isRemote: false
      },
      contract: {
        id: '',
        type: 'permanent',
        startDate: new Date().toISOString().split('T')[0],
        workingHours: 40,
        workingDays: 'Lunes a Viernes',
        workingHoursRange: '9:00-18:00',
        customSchedule: {
          enabled: false,
          days: {
            lunes: { enabled: true, startTime: '09:00', endTime: '18:00' },
            martes: { enabled: true, startTime: '09:00', endTime: '18:00' },
            miercoles: { enabled: true, startTime: '09:00', endTime: '18:00' },
            jueves: { enabled: true, startTime: '09:00', endTime: '18:00' },
            viernes: { enabled: true, startTime: '09:00', endTime: '18:00' },
            sabado: { enabled: false, startTime: '09:00', endTime: '14:00' },
            domingo: { enabled: false, startTime: '09:00', endTime: '18:00' }
          }
        },
        benefits: [],
        clauses: []
      },
      salary: {
        baseSalary: 0,
        currency: 'MXN',
        frequency: 'monthly',
        paymentMethod: 'bank_transfer',
        allowances: [],
        deductions: []
      },
      sbc: 0,
      vacationBalance: 0,
      sickLeaveBalance: 0
    });
    setErrors({});
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">Foto del empleado</p>
            </div>

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Empleado
                  <span className="text-xs text-gray-500 ml-1">(Generado automáticamente)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={isGeneratingNumber ? 'Generando...' : formData.employeeNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    placeholder="Generando..."
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isGeneratingNumber ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" title="Generando número..."></div>
                    ) : (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Generado automáticamente"></div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  El número se asigna automáticamente en secuencia
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="on_leave">En licencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName || getFieldError('firstName') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ana"
                />
                {(errors.firstName || getFieldError('firstName')) && (
                  <p className="error-message">
                    {errors.firstName || getFieldError('firstName')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName || getFieldError('lastName') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="García"
                />
                {(errors.lastName || getFieldError('lastName')) && (
                  <p className="error-message">
                    {errors.lastName || getFieldError('lastName')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getFieldError('email') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ana.garcia@empresa.com"
                />
                {getFieldError('email') ? (
                  <p className="error-message">
                    {getFieldError('email')}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Campo opcional
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone || getFieldError('phone') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+52 55 1234 5678"
                />
                {(errors.phone || getFieldError('phone')) && (
                  <p className="error-message">
                    {errors.phone || getFieldError('phone')}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Ingreso *
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleInputChange('hireDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFC *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.rfc}
                  onChange={(e) => handleInputChange('personalInfo.rfc', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.rfc ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="GARA920315MDF"
                />
                {errors.rfc && (
                  <p className="text-red-500 text-xs mt-1">{errors.rfc}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CURP *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.curp}
                  onChange={(e) => handleInputChange('personalInfo.curp', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.curp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="GARA920315MDFNNS01"
                />
                {errors.curp && (
                  <p className="text-red-500 text-xs mt-1">{errors.curp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NSS *
                </label>
                <input
                  type="text"
                  value={formData.personalInfo.nss}
                  onChange={(e) => handleInputChange('personalInfo.nss', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nss ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12345678901"
                />
                {errors.nss && (
                  <p className="text-red-500 text-xs mt-1">{errors.nss}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formData.personalInfo.birthDate}
                  onChange={(e) => handleInputChange('personalInfo.birthDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  value={formData.personalInfo.gender}
                  onChange={(e) => handleInputChange('personalInfo.gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Civil
                </label>
                <select
                  value={formData.personalInfo.maritalStatus}
                  onChange={(e) => handleInputChange('personalInfo.maritalStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="single">Soltero</option>
                  <option value="married">Casado</option>
                  <option value="divorced">Divorciado</option>
                  <option value="widowed">Viudo</option>
                </select>
              </div>
            </div>

            {/* Dirección */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Dirección</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calle
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.address.street}
                    onChange={(e) => handleInputChange('personalInfo.address.street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Av. Reforma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.address.number}
                    onChange={(e) => handleInputChange('personalInfo.address.number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colonia
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.address.neighborhood}
                    onChange={(e) => handleInputChange('personalInfo.address.neighborhood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.address.city}
                    onChange={(e) => handleInputChange('personalInfo.address.city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ciudad de México"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.address.state}
                    onChange={(e) => handleInputChange('personalInfo.address.state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CDMX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.address.zipCode}
                    onChange={(e) => handleInputChange('personalInfo.address.zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="06000"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Laboral</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puesto *
                </label>
                <input
                  type="text"
                  value={formData.position.title}
                  onChange={(e) => handleInputChange('position.title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Gerente de Marketing"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento *
                </label>
                <select
                  value={formData.position.department}
                  onChange={(e) => handleInputChange('position.department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar departamento</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Finanzas">Finanzas</option>
                  <option value="Operaciones">Operaciones</option>
                </select>
                {errors.department && (
                  <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel
                </label>
                <select
                  value={formData.position.level}
                  onChange={(e) => handleInputChange('position.level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reporta a
                </label>
                <input
                  type="text"
                  value={formData.position.reportsTo}
                  onChange={(e) => handleInputChange('position.reportsTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="CEO"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Puesto
                </label>
                <textarea
                  value={formData.position.jobDescription}
                  onChange={(e) => handleInputChange('position.jobDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción de las responsabilidades del puesto..."
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nómina y Contrato</h3>
            
            {/* Selector de Divisa */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Divisa de Pago
              </label>
              <div className="flex items-center space-x-4">
                <select
                  value={formData.salary.currency}
                  onChange={(e) => handleInputChange('salary.currency', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MXN">🇲🇽 Peso Mexicano (MXN)</option>
                  <option value="USD">🇺🇸 Dólar Americano (USD)</option>
                  <option value="EUR">🇪🇺 Euro (EUR)</option>
                  <option value="CAD">🇨🇦 Dólar Canadiense (CAD)</option>
                </select>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Formato:</span> {formatCurrency(12345, formData.salary.currency)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sueldo Base *
                </label>
                <CurrencyInput
                  value={formData.salary.baseSalary}
                  onChange={(value) => handleCurrencyInputChange('salary.baseSalary', value)}
                  placeholder="30000"
                  currency={formData.salary.currency}
                  error={errors.baseSalary}
                />
                
                {/* Botones de sugerencias rápidas */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 mr-2">Sugerencias:</span>
                  {formData.salary.currency === 'MXN' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleInputChange('salary.baseSalary', 15000)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      >
                        $15,000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('salary.baseSalary', 25000)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      >
                        $25,000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('salary.baseSalary', 35000)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      >
                        $35,000
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleInputChange('salary.baseSalary', 1000)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      >
                        $1,000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('salary.baseSalary', 2000)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      >
                        $2,000
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('salary.baseSalary', 3000)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      >
                        $3,000
                      </button>
                    </>
                  )}
                </div>
                
                {errors.baseSalary && (
                  <p className="text-red-500 text-xs mt-1">{errors.baseSalary}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SBC *
                </label>
                <CurrencyInput
                  value={formData.sbc}
                  onChange={(value) => handleCurrencyInputChange('sbc', value)}
                  placeholder="32000"
                  currency={formData.salary.currency}
                  error={errors.sbc}
                />
                
                {/* Botón para copiar sueldo base a SBC */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('sbc', formData.salary.baseSalary)}
                    className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700"
                  >
                    Copiar Sueldo Base
                  </button>
                </div>
                
                {errors.sbc && (
                  <p className="text-red-500 text-xs mt-1">{errors.sbc}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saldo de Vacaciones (días)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.vacationBalance}
                    onChange={(e) => handleInputChange('vacationBalance', Number(e.target.value))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15"
                    min="0"
                    max="30"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">días</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saldo de Enfermedad (días)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.sickLeaveBalance}
                    onChange={(e) => handleInputChange('sickLeaveBalance', Number(e.target.value))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                    min="0"
                    max="15"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">días</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Contrato
                </label>
                <select
                  value={formData.contract.type}
                  onChange={(e) => handleInputChange('contract.type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="permanent">Permanente</option>
                  <option value="temporary">Temporal</option>
                  <option value="intern">Interno</option>
                  <option value="contractor">Contratista</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horas de Trabajo
                </label>
                <input
                  type="number"
                  value={formData.contract.workingHours}
                  onChange={(e) => handleInputChange('contract.workingHours', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="40"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="customSchedule"
                    checked={formData.contract.customSchedule.enabled}
                    onChange={(e) => handleInputChange('contract.customSchedule.enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="customSchedule" className="text-sm font-medium text-gray-700">
                    Configurar horario personalizado por día
                  </label>
                </div>
              </div>

              {!formData.contract.customSchedule.enabled ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Días de Trabajo
                    </label>
                    <select
                      value={formData.contract.workingDays}
                      onChange={(e) => handleInputChange('contract.workingDays', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Lunes a Viernes">Lunes a Viernes</option>
                      <option value="Lunes a Sábado">Lunes a Sábado</option>
                      <option value="Martes a Sábado">Martes a Sábado</option>
                      <option value="Miércoles a Domingo">Miércoles a Domingo</option>
                      <option value="Jueves a Lunes">Jueves a Lunes</option>
                      <option value="Viernes a Martes">Viernes a Martes</option>
                      <option value="Sábado a Miércoles">Sábado a Miércoles</option>
                      <option value="Domingo a Jueves">Domingo a Jueves</option>
                      <option value="Lunes, Miércoles, Viernes">Lunes, Miércoles, Viernes</option>
                      <option value="Martes, Jueves, Sábado">Martes, Jueves, Sábado</option>
                      <option value="Lunes a Domingo">Lunes a Domingo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horario de Trabajo
                    </label>
                    <select
                      value={formData.contract.workingHoursRange}
                      onChange={(e) => handleInputChange('contract.workingHoursRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="6:00-14:00">6:00-14:00 (Turno Matutino)</option>
                      <option value="7:00-15:00">7:00-15:00</option>
                      <option value="8:00-16:00">8:00-16:00</option>
                      <option value="9:00-18:00">9:00-18:00 (Turno Regular)</option>
                      <option value="10:00-19:00">10:00-19:00</option>
                      <option value="14:00-22:00">14:00-22:00 (Turno Vespertino)</option>
                      <option value="15:00-23:00">15:00-23:00</option>
                      <option value="22:00-6:00">22:00-6:00 (Turno Nocturno)</option>
                      <option value="23:00-7:00">23:00-7:00</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Horario por Día</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Habilitar todos los días de lunes a viernes
                          const updatedDays = { ...formData.contract.customSchedule.days };
                          ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(day => {
                            updatedDays[day] = { ...updatedDays[day], enabled: true };
                          });
                          handleInputChange('contract.customSchedule.days', updatedDays);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        L-V
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Habilitar todos los días
                          const updatedDays = { ...formData.contract.customSchedule.days };
                          Object.keys(updatedDays).forEach(day => {
                            updatedDays[day] = { ...updatedDays[day], enabled: true };
                          });
                          handleInputChange('contract.customSchedule.days', updatedDays);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Deshabilitar todos los días
                          const updatedDays = { ...formData.contract.customSchedule.days };
                          Object.keys(updatedDays).forEach(day => {
                            updatedDays[day] = { ...updatedDays[day], enabled: false };
                          });
                          handleInputChange('contract.customSchedule.days', updatedDays);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 underline"
                      >
                        Ninguno
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(formData.contract.customSchedule.days).map(([dayKey, day]: [string, any]) => {
                      const dayNames: Record<string, string> = {
                        lunes: 'Lunes',
                        martes: 'Martes',
                        miercoles: 'Miércoles',
                        jueves: 'Jueves',
                        viernes: 'Viernes',
                        sabado: 'Sábado',
                        domingo: 'Domingo'
                      };
                      
                      return (
                        <div key={dayKey} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={day.enabled}
                              onChange={(e) => handleInputChange(`contract.customSchedule.days.${dayKey}.enabled`, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="text-sm font-medium text-gray-700 min-w-[80px]">
                              {dayNames[dayKey]}
                            </label>
                          </div>
                          
                          {day.enabled && (
                            <>
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-gray-500">Desde:</label>
                                <input
                                  type="time"
                                  value={day.startTime}
                                  onChange={(e) => handleInputChange(`contract.customSchedule.days.${dayKey}.startTime`, e.target.value)}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="text-xs text-gray-500">Hasta:</label>
                                <input
                                  type="time"
                                  value={day.endTime}
                                  onChange={(e) => handleInputChange(`contract.customSchedule.days.${dayKey}.endTime`, e.target.value)}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  // Copiar horario a todos los días habilitados
                                  const updatedDays = { ...formData.contract.customSchedule.days };
                                  Object.keys(updatedDays).forEach(otherDayKey => {
                                    if (updatedDays[otherDayKey].enabled && otherDayKey !== dayKey) {
                                      updatedDays[otherDayKey] = {
                                        ...updatedDays[otherDayKey],
                                        startTime: day.startTime,
                                        endTime: day.endTime
                                      };
                                    }
                                  });
                                  handleInputChange('contract.customSchedule.days', updatedDays);
                                }}
                                className="text-xs text-green-600 hover:text-green-800 underline ml-2"
                                title="Copiar horario a todos los días"
                              >
                                Copiar
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Vista previa del horario:</strong> {generateCustomSchedule(formData.contract.customSchedule.days)}
                    </p>
                  </div>
                  
                  {errors.customSchedule && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Error en horario:</strong> {errors.customSchedule}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agregar Nuevo Empleado</h2>
            <p className="text-sm text-gray-600 mt-1">
              Paso {currentStep} de {steps.length}: {steps[currentStep - 1].title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Anterior
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? 'Guardando...' : 'Guardar Empleado'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
