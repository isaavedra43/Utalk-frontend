import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Info,
  CheckCircle,
  Edit3,
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  Globe,
  User
} from 'lucide-react';
import { TaxConfig, TaxSettingsConfig } from '../../../types/hr';
import { taxConfigService } from '../../../services/taxConfigService';

interface TaxConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  onSave: (settings: TaxSettingsConfig) => void;
  loading?: boolean;
}

interface TaxConfigFormData {
  name: string;
  displayName: string;
  description: string;
  type: 'percentage' | 'fixed' | 'progressive';
  value: number;
  category: 'federal' | 'state' | 'municipal' | 'custom';
  isOptional: boolean;
  baseOn: 'gross' | 'net' | 'sbc';
  minAmount?: number;
  maxAmount?: number;
  priority: number;
  brackets?: Array<{
    lower: number;
    upper: number;
    rate: number;
  }>;
}

const TaxConfigurationModal: React.FC<TaxConfigurationModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onSave,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'employee' | 'create'>('global');
  const [globalTaxes, setGlobalTaxes] = useState<TaxConfig[]>([]);
  const [employeeTaxes, setEmployeeTaxes] = useState<TaxConfig[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettingsConfig>({
    useGlobalDefaults: true,
    enabledTaxes: [],
    customTaxes: [],
    taxOverrides: {}
  });
  
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Formulario para crear nuevo impuesto
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<TaxConfigFormData>({
    name: '',
    displayName: '',
    description: '',
    type: 'percentage',
    value: 0,
    category: 'custom',
    isOptional: true,
    baseOn: 'gross',
    priority: 1,
    brackets: []
  });

  useEffect(() => {
    if (isOpen) {
      loadTaxData();
    }
  }, [isOpen, employeeId]);

  const loadTaxData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Cargar configuraciones globales
      const globalConfigs = await taxConfigService.getGlobalTaxConfigs();
      setGlobalTaxes(globalConfigs);

      // Cargar configuraciones del empleado
      const employeeConfigs = await taxConfigService.getEmployeeTaxConfigs(employeeId);
      setEmployeeTaxes(employeeConfigs);

      // Configurar settings iniciales
      const initialSettings: TaxSettingsConfig = {
        useGlobalDefaults: employeeConfigs.length === 0,
        enabledTaxes: globalConfigs.filter(tax => tax.isEnabled && !tax.isOptional).map(tax => tax.name),
        customTaxes: employeeConfigs.filter(tax => tax.isCustom),
        taxOverrides: {}
      };

      setTaxSettings(initialSettings);

    } catch (error) {
      console.error('Error cargando datos de impuestos:', error);
      setError('Error cargando configuración de impuestos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Actualizar configuraciones del empleado
      await taxConfigService.updateEmployeeTaxSettings(employeeId, {
        taxSettings
      });

      setSuccess('Configuración guardada exitosamente');
      onSave(taxSettings);
      
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error guardando configuración:', error);
      setError('Error guardando configuración de impuestos');
    } finally {
      setSaving(false);
    }
  };

  const handleTaxToggle = (taxName: string, enabled: boolean) => {
    setTaxSettings(prev => ({
      ...prev,
      enabledTaxes: enabled 
        ? [...prev.enabledTaxes, taxName]
        : prev.enabledTaxes.filter(name => name !== taxName)
    }));
  };

  const handleTaxOverride = (taxName: string, field: 'value' | 'isEnabled', value: any) => {
    setTaxSettings(prev => ({
      ...prev,
      taxOverrides: {
        ...prev.taxOverrides,
        [taxName]: {
          ...prev.taxOverrides[taxName],
          [field]: value
        }
      }
    }));
  };

  const handleCreateTax = async () => {
    try {
      const validation = taxConfigService.validateTaxConfig(createFormData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      setSaving(true);
      setError(null);

      const newTax = await taxConfigService.createEmployeeTaxConfig(employeeId, createFormData);
      
      setEmployeeTaxes(prev => [...prev, newTax]);
      setTaxSettings(prev => ({
        ...prev,
        customTaxes: [...prev.customTaxes, newTax]
      }));

      setShowCreateForm(false);
      setCreateFormData({
        name: '',
        displayName: '',
        description: '',
        type: 'percentage',
        value: 0,
        category: 'custom',
        isOptional: true,
        baseOn: 'gross',
        priority: 1,
        brackets: []
      });

      setSuccess('Impuesto personalizado creado exitosamente');

    } catch (error) {
      console.error('Error creando impuesto personalizado:', error);
      setError('Error creando impuesto personalizado');
    } finally {
      setSaving(false);
    }
  };

  const addBracket = () => {
    setCreateFormData(prev => ({
      ...prev,
      brackets: [
        ...(prev.brackets || []),
        { lower: 0, upper: 0, rate: 0 }
      ]
    }));
  };

  const removeBracket = (index: number) => {
    setCreateFormData(prev => ({
      ...prev,
      brackets: prev.brackets?.filter((_, i) => i !== index) || []
    }));
  };

  const updateBracket = (index: number, field: 'lower' | 'upper' | 'rate', value: number) => {
    setCreateFormData(prev => ({
      ...prev,
      brackets: prev.brackets?.map((bracket, i) => 
        i === index ? { ...bracket, [field]: value } : bracket
      ) || []
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getTaxTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'fixed': return <DollarSign className="h-4 w-4" />;
      case 'progressive': return <TrendingUp className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'federal': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'state': return <Globe className="h-4 w-4 text-green-500" />;
      case 'municipal': return <Globe className="h-4 w-4 text-purple-500" />;
      case 'custom': return <User className="h-4 w-4 text-orange-500" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Configuración de Impuestos
              </h3>
              <p className="text-sm text-gray-600">
                {employeeName} - Configurar impuestos y deducciones
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'global', label: 'Impuestos Globales', icon: Globe },
              { id: 'employee', label: 'Configuración Personal', icon: User },
              { id: 'create', label: 'Crear Impuesto', icon: Plus }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando configuración...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab: Impuestos Globales */}
              {activeTab === 'global' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-900">Impuestos Globales</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Estos son los impuestos configurados a nivel empresa. Puedes habilitarlos o deshabilitarlos para este empleado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {globalTaxes.map((tax) => (
                      <div key={tax.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getCategoryIcon(tax.category)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">{tax.displayName}</h4>
                                {getTaxTypeIcon(tax.type)}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{tax.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Tipo: {tax.type}</span>
                                <span>Valor: {taxConfigService.formatTaxConfig(tax)}</span>
                                <span>Base: {tax.baseOn.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {tax.isOptional && (
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={taxSettings.enabledTaxes.includes(tax.name)}
                                  onChange={(e) => handleTaxToggle(tax.name, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Aplicar</span>
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Override controls */}
                        {taxSettings.enabledTaxes.includes(tax.name) && tax.type !== 'progressive' && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Valor Personalizado
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step={tax.type === 'percentage' ? '0.01' : '1'}
                                  max={tax.type === 'percentage' ? '100' : undefined}
                                  placeholder={tax.value.toString()}
                                  onChange={(e) => handleTaxOverride(tax.name, 'value', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div className="text-xs text-gray-500">
                                {tax.type === 'percentage' ? '%' : 'MXN'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {globalTaxes.length === 0 && (
                    <div className="text-center py-12">
                      <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay impuestos globales configurados</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Contacta al administrador para configurar impuestos por defecto
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Configuración Personal */}
              {activeTab === 'employee' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Configuración Personal</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Impuestos específicos para este empleado. Estos tienen prioridad sobre los globales.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {employeeTaxes.map((tax) => (
                      <div key={tax.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getCategoryIcon(tax.category)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">{tax.displayName}</h4>
                                {getTaxTypeIcon(tax.type)}
                                {tax.isCustom && (
                                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                                    Personalizado
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{tax.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Tipo: {tax.type}</span>
                                <span>Valor: {taxConfigService.formatTaxConfig(tax)}</span>
                                <span>Base: {tax.baseOn.toUpperCase()}</span>
                                <span>Prioridad: {tax.priority}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            {tax.isCustom && (
                              <button
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progressive brackets */}
                        {tax.type === 'progressive' && tax.brackets && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Tramos Progresivos</h5>
                            <div className="space-y-2">
                              {tax.brackets.map((bracket, index) => (
                                <div key={index} className="flex items-center space-x-4 text-sm">
                                  <span className="text-gray-600">
                                    {formatCurrency(bracket.lower)} - {formatCurrency(bracket.upper)}
                                  </span>
                                  <span className="text-gray-900 font-medium">{bracket.rate}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {employeeTaxes.length === 0 && (
                    <div className="text-center py-12">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay impuestos personalizados</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Usa la pestaña "Crear Impuesto" para agregar configuraciones específicas
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Crear Impuesto */}
              {activeTab === 'create' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Plus className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="font-medium text-green-900">Crear Impuesto Personalizado</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Crea un impuesto o deducción específica para este empleado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información básica */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre Interno *
                        </label>
                        <input
                          type="text"
                          value={createFormData.name}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="ej: BONO_PRODUCTIVIDAD"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre para Mostrar *
                        </label>
                        <input
                          type="text"
                          value={createFormData.displayName}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="ej: Bono por Productividad"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={createFormData.description}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción del impuesto o deducción"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo *
                          </label>
                          <select
                            value={createFormData.type}
                            onChange={(e) => setCreateFormData(prev => ({ ...prev, type: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {taxConfigService.getTaxTypes().map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría *
                          </label>
                          <select
                            value={createFormData.category}
                            onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {taxConfigService.getTaxCategories().map(category => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Configuración avanzada */}
                    <div className="space-y-4">
                      {createFormData.type !== 'progressive' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor *
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step={createFormData.type === 'percentage' ? '0.01' : '1'}
                              max={createFormData.type === 'percentage' ? '100' : undefined}
                              value={createFormData.value}
                              onChange={(e) => setCreateFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-sm text-gray-500">
                              {createFormData.type === 'percentage' ? '%' : 'MXN'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Base de Cálculo
                        </label>
                        <select
                          value={createFormData.baseOn}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, baseOn: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {taxConfigService.getCalculationBases().map(base => (
                            <option key={base.value} value={base.value}>
                              {base.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto Mínimo
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={createFormData.minAmount || ''}
                            onChange={(e) => setCreateFormData(prev => ({ ...prev, minAmount: parseFloat(e.target.value) || undefined }))}
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monto Máximo
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={createFormData.maxAmount || ''}
                            onChange={(e) => setCreateFormData(prev => ({ ...prev, maxAmount: parseFloat(e.target.value) || undefined }))}
                            placeholder="Opcional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prioridad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={createFormData.priority}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Orden de aplicación (menor número = mayor prioridad)
                        </p>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isOptional"
                          checked={createFormData.isOptional}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, isOptional: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isOptional" className="ml-2 text-sm text-gray-700">
                          Es opcional (puede activarse/desactivarse)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tramos progresivos */}
                  {createFormData.type === 'progressive' && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900">Tramos Progresivos</h4>
                        <button
                          type="button"
                          onClick={addBracket}
                          className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Agregar Tramo</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {createFormData.brackets?.map((bracket, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Desde</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={bracket.lower}
                                  onChange={(e) => updateBracket(index, 'lower', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={bracket.upper}
                                  onChange={(e) => updateBracket(index, 'upper', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Tasa (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={bracket.rate}
                                  onChange={(e) => updateBracket(index, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeBracket(index)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {(!createFormData.brackets || createFormData.brackets.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No hay tramos configurados</p>
                          <p className="text-xs text-gray-400">Agrega al menos un tramo para impuestos progresivos</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botón crear */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCreateTax}
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Creando...' : 'Crear Impuesto'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {taxSettings.enabledTaxes.length} impuestos habilitados
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loadingData}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxConfigurationModal;
