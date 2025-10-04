import React, { useState, useMemo } from 'react';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Building,
  Target,
  AlertTriangle,
  Shield,
  FileText,
  Save,
  X,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { useVacationsManagement } from '../../../../hooks/useVacationsManagement';
import { useNotifications } from '../../../../contexts/NotificationContext';
import {
  VacationPolicy,
  VacationPolicyForm,
  VacationFilters
} from '../../../../services/vacationsManagementService';

// ============================================================================
// TYPES
// ============================================================================

interface VacationsPoliciesTabProps {}

// ============================================================================
// POLICY CARD COMPONENT
// ============================================================================

interface PolicyCardProps {
  policy: VacationPolicy;
  onEdit: (policy: VacationPolicy) => void;
  onDelete: (policy: VacationPolicy) => void;
  onDuplicate: (policy: VacationPolicy) => void;
  onToggle: (policy: VacationPolicy) => void;
}

const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getAppliesToText = () => {
    if (policy.appliesTo.allEmployees) return 'Todos los empleados';

    const appliesTo = [];
    if (policy.appliesTo.departments?.length) {
      appliesTo.push(`${policy.appliesTo.departments.length} departamentos`);
    }
    if (policy.appliesTo.positions?.length) {
      appliesTo.push(`${policy.appliesTo.positions.length} posiciones`);
    }
    if (policy.appliesTo.employeeTypes?.length) {
      appliesTo.push(`${policy.appliesTo.employeeTypes.length} tipos`);
    }

    return appliesTo.join(', ') || 'Sin restricciones';
  };

  return (
    <div className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
      policy.isActive ? 'border-green-200' : 'border-gray-200 opacity-75'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{policy.name}</h3>
            {policy.isActive ? (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Activa
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                Inactiva
              </span>
            )}
          </div>

          {policy.description && (
            <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
          )}

          <div className="text-sm text-gray-500">
            <span>Aplica a: {getAppliesToText()}</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  setShowActions(false);
                  onEdit(policy);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Editar política
              </button>
              <button
                onClick={() => {
                  setShowActions(false);
                  onDuplicate(policy);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Duplicar política
              </button>
              <button
                onClick={() => {
                  setShowActions(false);
                  onToggle(policy);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {policy.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={() => {
                  setShowActions(false);
                  onDelete(policy);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Eliminar política
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Policy Rules */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Días Anuales</p>
          <p className="text-lg font-bold text-gray-900">{policy.rules.annualDays}</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Acumulación</p>
          <p className="text-lg font-bold text-gray-900">{policy.rules.accrualRate}</p>
          <p className="text-xs text-gray-500">días/mes</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Máximo Arrastrar</p>
          <p className="text-lg font-bold text-gray-900">{policy.rules.maxCarryover}</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Anticipación</p>
          <p className="text-lg font-bold text-gray-900">{policy.rules.advanceRequest}</p>
          <p className="text-xs text-gray-500">días</p>
        </div>
      </div>

      {/* Blackout Periods */}
      {policy.blackoutPeriods.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Períodos Restringidos:</p>
          <div className="space-y-1">
            {policy.blackoutPeriods.slice(0, 3).map((period, index) => (
              <div key={index} className="text-xs text-gray-600 bg-red-50 px-2 py-1 rounded">
                {formatDate(period.startDate)} - {formatDate(period.endDate)}: {period.reason}
              </div>
            ))}
            {policy.blackoutPeriods.length > 3 && (
              <div className="text-xs text-gray-500">
                +{policy.blackoutPeriods.length - 3} períodos más
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span>Creada: {formatDate(policy.createdAt)}</span>
        <span>Versión: {policy.version}</span>
      </div>
    </div>
  );
};

// ============================================================================
// POLICY FORM MODAL COMPONENT
// ============================================================================

interface PolicyFormModalProps {
  isOpen: boolean;
  policy?: VacationPolicy | null;
  onClose: () => void;
  onSubmit: (policyData: VacationPolicyForm) => Promise<void>;
}

const PolicyFormModal: React.FC<PolicyFormModalProps> = ({
  isOpen,
  policy,
  onClose,
  onSubmit
}) => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<VacationPolicyForm>({
    name: policy?.name || '',
    description: policy?.description || '',
    appliesTo: policy?.appliesTo || {
      allEmployees: true,
      departments: [],
      positions: [],
      employeeTypes: []
    },
    rules: policy?.rules || {
      annualDays: 15,
      accrualRate: 1.25,
      maxCarryover: 5,
      probationPeriod: 3,
      advanceRequest: 30,
      maxConsecutiveDays: 15,
      minDaysBetweenRequests: 1,
      requiresApproval: true,
      autoApprovalLimit: 3
    },
    blackoutPeriods: policy?.blackoutPeriods || [],
    restrictions: policy?.restrictions || {
      maxEmployeesOnVacation: 20,
      criticalPositions: [],
      seasonalRestrictions: []
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'rules' | 'blackout' | 'restrictions'>('basic');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.rules.annualDays <= 0) {
      newErrors.annualDays = 'Los días anuales deben ser mayores a cero';
    }

    if (formData.rules.accrualRate <= 0) {
      newErrors.accrualRate = 'La tasa de acumulación debe ser mayor a cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      showSuccess(`Política ${policy ? 'actualizada' : 'creada'} exitosamente`);
      onClose();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error guardando política');
    } finally {
      setLoading(false);
    }
  };

  const addBlackoutPeriod = () => {
    setFormData(prev => ({
      ...prev,
      blackoutPeriods: [
        ...prev.blackoutPeriods,
        {
          id: `temp_${Date.now()}`,
          name: '',
          startDate: '',
          endDate: '',
          reason: '',
          isRecurring: false,
          recurrenceRule: ''
        }
      ]
    }));
  };

  const updateBlackoutPeriod = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      blackoutPeriods: prev.blackoutPeriods.map((period, i) =>
        i === index ? { ...period, [field]: value } : period
      )
    }));
  };

  const removeBlackoutPeriod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blackoutPeriods: prev.blackoutPeriods.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {policy ? 'Editar Política' : 'Nueva Política de Vacaciones'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Información Básica' },
              { id: 'rules', label: 'Reglas' },
              { id: 'blackout', label: 'Períodos Restringidos' },
              { id: 'restrictions', label: 'Restricciones' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Política *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Política Estándar, Política Ejecutiva"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descripción de la política de vacaciones"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Aplicar a:
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.appliesTo.allEmployees}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        appliesTo: { ...prev.appliesTo, allEmployees: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">Todos los empleados</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamentos
                      </label>
                      <select
                        multiple
                        value={formData.appliesTo.departments || []}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData(prev => ({
                            ...prev,
                            appliesTo: { ...prev.appliesTo, departments: values }
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading || formData.appliesTo.allEmployees}
                      >
                        <option value="IT">Tecnología</option>
                        <option value="HR">Recursos Humanos</option>
                        <option value="Finance">Finanzas</option>
                        <option value="Operations">Operaciones</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posiciones
                      </label>
                      <select
                        multiple
                        value={formData.appliesTo.positions || []}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData(prev => ({
                            ...prev,
                            appliesTo: { ...prev.appliesTo, positions: values }
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading || formData.appliesTo.allEmployees}
                      >
                        <option value="manager">Gerente</option>
                        <option value="senior">Senior</option>
                        <option value="junior">Junior</option>
                        <option value="intern">Practicante</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipos de Empleado
                      </label>
                      <select
                        multiple
                        value={formData.appliesTo.employeeTypes || []}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData(prev => ({
                            ...prev,
                            appliesTo: { ...prev.appliesTo, employeeTypes: values }
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading || formData.appliesTo.allEmployees}
                      >
                        <option value="full_time">Tiempo completo</option>
                        <option value="part_time">Medio tiempo</option>
                        <option value="contract">Contrato</option>
                        <option value="temporary">Temporal</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Días Anuales *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rules.annualDays}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, annualDays: Number(e.target.value) }
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.annualDays ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.annualDays && (
                    <p className="mt-1 text-sm text-red-600">{errors.annualDays}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasa de Acumulación (días/mes) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rules.accrualRate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, accrualRate: Number(e.target.value) }
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.accrualRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.accrualRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.accrualRate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo a Arrastrar
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rules.maxCarryover}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, maxCarryover: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período de Prueba (meses)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rules.probationPeriod}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, probationPeriod: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anticipación Requerida (días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rules.advanceRequest}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, advanceRequest: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo Días Consecutivos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rules.maxConsecutiveDays}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, maxConsecutiveDays: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Límite Auto-aprobación (días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.rules.autoApprovalLimit || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, autoApprovalLimit: e.target.value ? Number(e.target.value) : undefined }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sin límite"
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    checked={formData.rules.requiresApproval}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rules: { ...prev.rules, requiresApproval: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="requiresApproval" className="text-sm text-gray-700">
                    Requiere aprobación
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Blackout Periods Tab */}
          {activeTab === 'blackout' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Períodos Restringidos</h4>
                <button
                  type="button"
                  onClick={addBlackoutPeriod}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Período</span>
                </button>
              </div>

              {formData.blackoutPeriods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay períodos restringidos configurados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.blackoutPeriods.map((period, index) => (
                    <div key={period.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={period.name}
                            onChange={(e) => updateBlackoutPeriod(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Navidad"
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Inicio
                          </label>
                          <input
                            type="date"
                            value={period.startDate}
                            onChange={(e) => updateBlackoutPeriod(index, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Fin
                          </label>
                          <input
                            type="date"
                            value={period.endDate}
                            onChange={(e) => updateBlackoutPeriod(index, 'endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeBlackoutPeriod(index)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors"
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Motivo
                        </label>
                        <input
                          type="text"
                          value={period.reason}
                          onChange={(e) => updateBlackoutPeriod(index, 'reason', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Motivo del período restringido"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Restrictions Tab */}
          {activeTab === 'restrictions' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Máximo Empleados en Vacaciones (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.restrictions.maxEmployeesOnVacation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    restrictions: { ...prev.restrictions, maxEmployeesOnVacation: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posiciones Críticas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={formData.restrictions.criticalPositions.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    restrictions: {
                      ...prev.restrictions,
                      criticalPositions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Gerente, Director, Coordinador"
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{policy ? 'Actualizar Política' : 'Crear Política'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const VacationsPoliciesTab: React.FC<VacationsPoliciesTabProps> = () => {
  const { showSuccess, showError } = useNotifications();

  const {
    policies,
    loading,
    createPolicy,
    updatePolicy,
    deletePolicy,
    loadPolicies
  } = useVacationsManagement();

  // Local state
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<VacationPolicy | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter policies
  const filteredPolicies = useMemo(() => {
    if (filter === 'all') return policies;
    return policies.filter(policy => policy.isActive === (filter === 'active'));
  }, [policies, filter]);

  // Handlers
  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setShowPolicyModal(true);
  };

  const handleEditPolicy = (policy: VacationPolicy) => {
    setSelectedPolicy(policy);
    setShowPolicyModal(true);
  };

  const handleDeletePolicy = async (policy: VacationPolicy) => {
    if (!confirm(`¿Estás seguro de eliminar la política "${policy.name}"?`)) return;

    try {
      await deletePolicy(policy.id);
      showSuccess('Política eliminada correctamente');
    } catch (error) {
      showError('Error al eliminar la política');
    }
  };

  const handleDuplicatePolicy = (policy: VacationPolicy) => {
    setSelectedPolicy({
      ...policy,
      id: '',
      name: `${policy.name} (Copia)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setShowPolicyModal(true);
  };

  const handleTogglePolicy = async (policy: VacationPolicy) => {
    try {
      await updatePolicy(policy.id, { isActive: !policy.isActive });
      showSuccess(`Política ${!policy.isActive ? 'activada' : 'desactivada'} correctamente`);
    } catch (error) {
      showError('Error al cambiar el estado de la política');
    }
  };

  const handleSubmitPolicy = async (policyData: VacationPolicyForm) => {
    if (selectedPolicy?.id) {
      await updatePolicy(selectedPolicy.id, policyData);
    } else {
      await createPolicy(policyData);
    }
  };

  // Calculate stats
  const stats = {
    total: policies.length,
    active: policies.filter(p => p.isActive).length,
    inactive: policies.filter(p => !p.isActive).length,
    withBlackout: policies.filter(p => p.blackoutPeriods.length > 0).length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Políticas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivas</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Restricciones</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withBlackout}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filtrar:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadPolicies()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-5 w-5 ${loading.policies ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreatePolicy}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Política</span>
          </button>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid gap-6">
        {loading.policies ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredPolicies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No hay políticas configuradas' : `No hay políticas ${filter === 'active' ? 'activas' : 'inactivas'}`}
            </h3>
            <p className="text-gray-600 mb-4">
              Crea la primera política haciendo clic en "Nueva Política"
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPolicies.map((policy) => (
              <PolicyCard
                key={policy.id}
                policy={policy}
                onEdit={handleEditPolicy}
                onDelete={handleDeletePolicy}
                onDuplicate={handleDuplicatePolicy}
                onToggle={handleTogglePolicy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Policy Form Modal */}
      <PolicyFormModal
        isOpen={showPolicyModal}
        policy={selectedPolicy}
        onClose={() => setShowPolicyModal(false)}
        onSubmit={handleSubmitPolicy}
      />
    </div>
  );
};

export default VacationsPoliciesTab;
