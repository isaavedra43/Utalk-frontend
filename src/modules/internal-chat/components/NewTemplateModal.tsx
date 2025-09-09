import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  Check,
  Clock,
  User,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  DollarSign,
  Hash,
  Type,
  Upload,
  List,
  Play,
  Save,
  Eye
} from 'lucide-react';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
}

interface Field {
  id: string;
  type: 'text' | 'number' | 'date' | 'file' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface ApprovalStep {
  id: string;
  name: string;
  approver: string;
  sla: number; // en horas
  escalation?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition?: string;
  actions: string[];
}

const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('fields');
  const [templateName, setTemplateName] = useState('Factura');
  const [templateDescription, setTemplateDescription] = useState('Crea una plantilla para facturas.');
  const [selectedIcon, setSelectedIcon] = useState('Pago');
  const [isDefault, setIsDefault] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedStep, setSelectedStep] = useState<ApprovalStep | null>(null);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  const icons = [
    { name: 'Pago', icon: '💳' },
    { name: 'Factura', icon: '📄' },
    { name: 'Orden', icon: '📋' },
    { name: 'Proveedor', icon: '🏢' },
    { name: 'Usuario', icon: '👤' },
    { name: 'Documento', icon: '📑' },
    { name: 'Dinero', icon: '💰' },
    { name: 'Calendario', icon: '📅' }
  ];

  const fieldTypes = [
    { type: 'text', label: 'Texto', icon: Type },
    { type: 'number', label: 'Número', icon: Hash },
    { type: 'date', label: 'Fecha', icon: Calendar },
    { type: 'file', label: 'Archivo', icon: Upload },
    { type: 'select', label: 'Selección', icon: List },
    { type: 'textarea', label: 'Texto Largo', icon: FileText }
  ];

  const triggers = [
    'Solicitud creada',
    'Solicitud aprobada',
    'Solicitud rechazada',
    'SLA vencido',
    'Campo específico modificado'
  ];

  const actions = [
    'Enviar notificación por email',
    'Enviar mensaje al canal',
    'Crear tarea en sistema externo',
    'Actualizar base de datos',
    'Reenviar a otro canal',
    'Escalar a supervisor'
  ];

  const flowModes = [
    'Aprobación simple',
    'Aprobación secuencial',
    'Aprobación paralela',
    'Aprobación condicional'
  ];

  const slaActions = [
    'Escalar automáticamente',
    'Enviar recordatorio',
    'Notificar al supervisor',
    'Marcar como urgente'
  ];

  if (!isOpen) return null;

  const addField = (type: Field['type']) => {
    const newField: Field = {
      id: Date.now().toString(),
      type,
      label: `Campo ${type}`,
      required: false,
      placeholder: `Ingresa ${type}...`
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const addApprovalStep = () => {
    const newStep: ApprovalStep = {
      id: Date.now().toString(),
      name: `Paso ${approvalSteps.length + 1}`,
      approver: '',
      sla: 24
    };
    setApprovalSteps([...approvalSteps, newStep]);
    setSelectedStep(newStep);
  };

  const updateApprovalStep = (stepId: string, updates: Partial<ApprovalStep>) => {
    setApprovalSteps(approvalSteps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
    if (selectedStep?.id === stepId) {
      setSelectedStep({ ...selectedStep, ...updates });
    }
  };

  const deleteApprovalStep = (stepId: string) => {
    setApprovalSteps(approvalSteps.filter(step => step.id !== stepId));
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
    }
  };

  const addAutomationRule = () => {
    const newRule: AutomationRule = {
      id: Date.now().toString(),
      name: `Regla ${automationRules.length + 1}`,
      trigger: triggers[0],
      actions: [actions[0]]
    };
    setAutomationRules([...automationRules, newRule]);
    setSelectedRule(newRule);
  };

  const updateAutomationRule = (ruleId: string, updates: Partial<AutomationRule>) => {
    setAutomationRules(automationRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
    if (selectedRule?.id === ruleId) {
      setSelectedRule({ ...selectedRule, ...updates });
    }
  };

  const deleteAutomationRule = (ruleId: string) => {
    setAutomationRules(automationRules.filter(rule => rule.id !== ruleId));
    if (selectedRule?.id === ruleId) {
      setSelectedRule(null);
    }
  };

  const renderFieldsTab = () => (
    <div className="flex h-full">
      {/* Lista de campos */}
      <div className="w-1/2 p-4 border-r border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Campos del Formulario</h3>
          <div className="flex flex-wrap gap-2">
            {fieldTypes.map((fieldType) => {
              const IconComponent = fieldType.icon;
              return (
                <button
                  key={fieldType.type}
                  onClick={() => addField(fieldType.type as Field['type'])}
                  className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <IconComponent className="h-3 w-3" />
                  <span>{fieldType.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Plus className="h-12 w-12 mb-4" />
            <p className="text-sm">No hay campos agregados</p>
            <p className="text-xs">Usa los botones de arriba para agregar campos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                onClick={() => setSelectedField(field)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedField?.id === field.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {fieldTypes.find(ft => ft.type === field.type)?.icon && 
                      React.createElement(fieldTypes.find(ft => ft.type === field.type)!.icon, { className: "h-4 w-4 text-gray-500" })
                    }
                    <span className="text-sm font-medium">{field.label}</span>
                    {field.required && (
                      <span className="text-xs text-red-500">*</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteField(field.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {fieldTypes.find(ft => ft.type === field.type)?.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor de campo */}
      <div className="w-1/2 p-4">
        {selectedField ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Propiedades del Campo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiqueta
                </label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={selectedField.placeholder || ''}
                  onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedField.required}
                  onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="required" className="text-sm text-gray-700">
                  Campo obligatorio
                </label>
              </div>

              {selectedField.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opciones (una por línea)
                  </label>
                  <textarea
                    value={selectedField.options?.join('\n') || ''}
                    onChange={(e) => updateField(selectedField.id, { 
                      options: e.target.value.split('\n').filter(opt => opt.trim()) 
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {selectedField.type === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor mínimo
                    </label>
                    <input
                      type="number"
                      value={selectedField.validation?.min || ''}
                      onChange={(e) => updateField(selectedField.id, { 
                        validation: { ...selectedField.validation, min: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor máximo
                    </label>
                    <input
                      type="number"
                      value={selectedField.validation?.max || ''}
                      onChange={(e) => updateField(selectedField.id, { 
                        validation: { ...selectedField.validation, max: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Edit className="h-12 w-12 mb-4" />
            <p className="text-sm">Selecciona un campo para editar sus propiedades</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderApprovalFlowTab = () => (
    <div className="flex h-full">
      {/* Lista de pasos */}
      <div className="w-1/2 p-4 border-r border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pasos del Flujo</h3>
          <button
            onClick={addApprovalStep}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir Paso</span>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modo de flujo
          </label>
          <div className="relative">
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
              <option>Seleccionar modo...</option>
              {flowModes.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Al vencer SLA
          </label>
          <div className="relative">
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
              <option>Seleccionar acción...</option>
              {slaActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {approvalSteps.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Clock className="h-8 w-8 mb-2" />
            <p className="text-sm">No hay pasos configurados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {approvalSteps.map((step, index) => (
              <div
                key={step.id}
                onClick={() => setSelectedStep(step)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedStep?.id === step.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteApprovalStep(step.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  SLA: {step.sla} horas
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor de paso */}
      <div className="w-1/2 p-4">
        {selectedStep ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Propiedades del Paso
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del paso
                </label>
                <input
                  type="text"
                  value={selectedStep.name}
                  onChange={(e) => updateApprovalStep(selectedStep.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aprobador
                </label>
                <div className="relative">
                  <select
                    value={selectedStep.approver}
                    onChange={(e) => updateApprovalStep(selectedStep.id, { approver: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Seleccionar aprobador...</option>
                    <option value="Carlos D.">Carlos D.</option>
                    <option value="Ana C.">Ana C.</option>
                    <option value="Beatriz E.">Beatriz E.</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SLA (horas)
                </label>
                <input
                  type="number"
                  value={selectedStep.sla}
                  onChange={(e) => updateApprovalStep(selectedStep.id, { sla: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Escalación (opcional)
                </label>
                <div className="relative">
                  <select
                    value={selectedStep.escalation || ''}
                    onChange={(e) => updateApprovalStep(selectedStep.id, { escalation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Sin escalación</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Director">Director</option>
                    <option value="Gerencia">Gerencia</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <User className="h-12 w-12 mb-4" />
            <p className="text-sm">Selecciona un paso para editar sus propiedades</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAutomationsTab = () => (
    <div className="flex h-full">
      {/* Lista de reglas */}
      <div className="w-1/2 p-4 border-r border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reglas de Automatización</h3>
          <button
            onClick={addAutomationRule}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir Regla</span>
          </button>
        </div>

        {automationRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-sm">No hay reglas configuradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {automationRules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRule?.id === rule.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{rule.name}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {rule.trigger} → {rule.actions.length} acción(es)
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAutomationRule(rule.id);
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor de regla */}
      <div className="w-1/2 p-4">
        {selectedRule ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editor de Regla
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la regla
                </label>
                <input
                  type="text"
                  value={selectedRule.name}
                  onChange={(e) => updateAutomationRule(selectedRule.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disparador
                </label>
                <div className="relative">
                  <select
                    value={selectedRule.trigger}
                    onChange={(e) => updateAutomationRule(selectedRule.id, { trigger: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {triggers.map(trigger => (
                      <option key={trigger} value={trigger}>{trigger}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condición (opcional)
                </label>
                <input
                  type="text"
                  value={selectedRule.condition || ''}
                  onChange={(e) => updateAutomationRule(selectedRule.id, { condition: e.target.value })}
                  placeholder="Ej: monto > 10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acciones
                </label>
                <div className="space-y-2">
                  {selectedRule.actions.map((action, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <select
                          value={action}
                          onChange={(e) => {
                            const newActions = [...selectedRule.actions];
                            newActions[index] = e.target.value;
                            updateAutomationRule(selectedRule.id, { actions: newActions });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        >
                          {actions.map(actionOption => (
                            <option key={actionOption} value={actionOption}>{actionOption}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      <button
                        onClick={() => {
                          const newActions = selectedRule.actions.filter((_, i) => i !== index);
                          updateAutomationRule(selectedRule.id, { actions: newActions });
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newActions = [...selectedRule.actions, actions[0]];
                      updateAutomationRule(selectedRule.id, { actions: newActions });
                    }}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar acción</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4" />
            <p className="text-sm">Selecciona una regla para editarla</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Vista Previa del Formulario</h3>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">
                {icons.find(icon => icon.name === selectedIcon)?.icon || '📄'}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{templateName}</h4>
              <p className="text-sm text-gray-500">{templateDescription}</p>
            </div>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No hay campos configurados</p>
              <p className="text-sm">Agrega campos en la pestaña "Campos" para ver la vista previa</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <input
                      type="number"
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                  )}
                  
                  {field.type === 'date' && (
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                  )}
                  
                  {field.type === 'file' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Arrastra archivos aquí o haz clic para seleccionar</p>
                    </div>
                  )}
                  
                  {field.type === 'select' && (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    >
                      <option>{field.placeholder}</option>
                      {field.options?.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {field.type === 'textarea' && (
                    <textarea
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'fields':
        return renderFieldsTab();
      case 'approval':
        return renderApprovalFlowTab();
      case 'automations':
        return renderAutomationsTab();
      case 'preview':
        return renderPreviewTab();
      default:
        return renderFieldsTab();
    }
  };

  const handleSave = () => {
    const template = {
      name: templateName,
      description: templateDescription,
      icon: selectedIcon,
      isDefault,
      fields,
      approvalSteps,
      automationRules
    };
    onSave(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nueva Plantilla</h2>
              <p className="text-sm text-gray-500 mt-1">
                Define los campos, reglas y automatizaciones para este tipo de solicitud.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-140px)]">
          {/* Panel izquierdo - Información básica */}
          <div className="w-80 p-6 border-r border-gray-200 bg-gray-50">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Plantilla
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono
                </label>
                <div className="relative">
                  <select
                    value={selectedIcon}
                    onChange={(e) => setSelectedIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {icons.map(icon => (
                      <option key={icon.name} value={icon.name}>
                        {icon.icon} {icon.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  ¿Es la plantilla por defecto?
                </label>
                <button
                  onClick={() => setIsDefault(!isDefault)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDefault ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDefault ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Panel derecho - Configuración */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex space-x-1">
                {[
                  { id: 'fields', name: 'Campos', icon: FileText },
                  { id: 'approval', name: 'Flujo de Aprobación', icon: Check },
                  { id: 'automations', name: 'Automatizaciones', icon: MessageSquare },
                  { id: 'preview', name: 'Vista Previa', icon: Eye }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <Play className="h-4 w-4" />
            <span>Probar Plantilla</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Plantilla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTemplateModal;
