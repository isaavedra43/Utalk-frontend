import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, Layers, FileText, Truck, User, Search, Check, Building2, Ticket } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import type { Provider, MaterialOption } from '../types';

interface CreateCargaModalProps {
  onClose: () => void;
  onCreate: (data: {
    platformType: 'provider' | 'client';
    materialTypes: string[];
    provider: string;
    providerId?: string;
    ticketNumber?: string;
    driver: string;
    notes?: string;
  }) => void;
}

export const CreateCargaModal: React.FC<CreateCargaModalProps> = ({ onClose, onCreate }) => {
  const { providers, activeMaterials } = useConfiguration();
  
  const [formData, setFormData] = useState({
    platformType: 'client' as 'provider' | 'client',
    materialTypes: [] as string[],
    provider: '',
    providerId: '',
    ticketNumber: '',
    driver: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providerSearch, setProviderSearch] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialOption[]>([]);
  const [materialSearch, setMaterialSearch] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  const [providerMaterials, setProviderMaterials] = useState<MaterialOption[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  
  const materialCategories = activeMaterials.reduce((acc, material) => {
    const category = material.category || 'Otros';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<string, MaterialOption[]>);

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(providerSearch.toLowerCase())
  );
  // ✅ Cargar materiales del proveedor cuando se selecciona
  useEffect(() => {
    const loadProviderMaterials = async () => {
      if (!formData.providerId) {
        setProviderMaterials([]);
        return;
      }
      
      try {
        setLoadingMaterials(true);
        console.log('📤 Cargando materiales del proveedor:', formData.providerId);
        
        // ✅ Obtener materiales del backend
        const { ProviderApiService } = await import('../services/inventoryApiService');
        const materials = await ProviderApiService.getProviderMaterials(formData.providerId);
        
        console.log('✅ Materiales del proveedor obtenidos:', materials);
        setProviderMaterials(materials);
      } catch (error) {
        console.error('❌ Error cargando materiales del proveedor:', error);
        setProviderMaterials([]);
      } finally {
        setLoadingMaterials(false);
      }
    };
    
    loadProviderMaterials();
  }, [formData.providerId]);
  
  // ✅ Usar materiales del proveedor si están disponibles, sino usar todos
  const materialsToShow = providerMaterials.length > 0 ? providerMaterials : activeMaterials;
  
  // Filtrar materiales por búsqueda
  const filteredMaterials = materialsToShow.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(materialSearch.toLowerCase());
    return matchesSearch;
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar tipos de materiales solo para proveedores
    if (formData.platformType === 'provider' && formData.materialTypes.length === 0) {
      newErrors.materialTypes = 'Debe seleccionar al menos un material';
    }

    // Validar proveedor solo si es tipo proveedor
    if (formData.platformType === 'provider' && !formData.provider.trim()) {
      newErrors.provider = 'El proveedor es requerido';
    }

    // Validar número de ticket solo si es tipo cliente
    if (formData.platformType === 'client' && !formData.ticketNumber.trim()) {
      newErrors.ticketNumber = 'El número de ticket es requerido';
    }

    if (!formData.driver.trim()) {
      newErrors.driver = 'El nombre del chofer es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onCreate(formData);
    }
  };

  // Funciones para manejar materiales
  const handleMaterialSelect = (material: MaterialOption) => {
    if (!selectedMaterials.find(m => m.id === material.id)) {
      const newSelectedMaterials = [...selectedMaterials, material];
      setSelectedMaterials(newSelectedMaterials);
      setFormData({
        ...formData,
        materialTypes: newSelectedMaterials.map(m => m.name)
      });
    }
    setMaterialSearch('');
    setShowMaterialDropdown(false);
  };

  const handleMaterialRemove = (materialId: string) => {
    const newSelectedMaterials = selectedMaterials.filter(m => m.id !== materialId);
    setSelectedMaterials(newSelectedMaterials);
    setFormData({
      ...formData,
      materialTypes: newSelectedMaterials.map(m => m.name)
    });
  };

  // Funciones para manejar proveedor
  const handleProviderSelect = (provider: Provider) => {
    // Limpiar materiales seleccionados cuando se cambia el proveedor
    setSelectedMaterials([]);
    setFormData({ 
      ...formData, 
      provider: provider.name,
      providerId: provider.id,
      materialTypes: [] // Limpiar tipos de materiales
    });
    setProviderSearch(provider.name);
    setShowProviderDropdown(false);
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProviderDropdown(false);
      setShowMaterialDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-lg sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="truncate">Nueva Carga</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Platform Number - Auto-generated */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-500" />
              Número de Carga
            </label>
            <div className="relative">
              <input
                type="text"
                value="Se generará automáticamente"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                readOnly
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Package className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              El folio será único y secuencial (ej: PLT-001, PLT-002...)
            </p>
          </div>

          {/* Platform Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Carga
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, platformType: 'provider' })}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  formData.platformType === 'provider'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <Truck className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium text-sm">Proveedor</div>
                <div className="text-xs text-gray-500">Materiales de proveedor</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, platformType: 'client' })}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  formData.platformType === 'client'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <Building2 className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium text-sm">Cliente</div>
                <div className="text-xs text-gray-500">Materiales de cliente</div>
              </button>
            </div>
          </div>

          {/* Provider - Solo para tipo proveedor */}
          {formData.platformType === 'provider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-500" />
              Proveedor *
            </label>
            <div className="relative">
              <input
                type="text"
                value={providerSearch}
                onChange={(e) => {
                  setProviderSearch(e.target.value);
                  setShowProviderDropdown(true);
                }}
                onFocus={() => setShowProviderDropdown(true)}
                placeholder="Buscar proveedor..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.provider ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {/* Dropdown de proveedores */}
              {showProviderDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredProviders.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleProviderSelect(provider)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <div className="font-medium text-sm">{provider.name}</div>
                      <div className="text-xs text-gray-500">{provider.contact}</div>
                    </button>
                  ))}
                  {filteredProviders.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No se encontraron proveedores</div>
                  )}
                </div>
              )}
            </div>
            {errors.provider && (
              <p className="text-xs text-red-600 mt-1">{errors.provider}</p>
            )}
          </div>
          )}

          {/* Ticket Number - Solo para tipo cliente */}
          {formData.platformType === 'client' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-gray-500" />
                Número de Ticket *
              </label>
              <input
                type="text"
                value={formData.ticketNumber}
                onChange={(e) => setFormData({ ...formData, ticketNumber: e.target.value })}
                placeholder="Ej: TK-001, TK-2024-001"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.ticketNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.ticketNumber && (
                <p className="text-xs text-red-600 mt-1">{errors.ticketNumber}</p>
              )}
            </div>
          )}

          {/* Material Types - Multi Select - Solo para tipo proveedor */}
          {formData.platformType === 'provider' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-500" />
              Tipos de Material *
            </label>
            
            {/* Mensaje informativo según proveedor */}
            {formData.provider && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                <p className="text-xs text-blue-800">
                  💡 Mostrando solo materiales de <strong>{formData.provider}</strong>
                </p>
              </div>
            )}
            
            {/* Loading materiales */}
            {loadingMaterials && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-gray-600">⏳ Cargando materiales del proveedor...</p>
              </div>
            )}
            
            {/* Sin materiales */}
            {formData.provider && !loadingMaterials && providerMaterials.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-yellow-800">
                  ⚠️ Este proveedor no tiene materiales asociados.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Debes editar el proveedor y asignarle materiales.
                </p>
              </div>
            )}
            
            {/* Materiales seleccionados */}
            {selectedMaterials.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedMaterials.map((material) => (
                  <span
                    key={material.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {material.name}
                    <button
                      type="button"
                      onClick={() => handleMaterialRemove(material.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            {/* Input de búsqueda de materiales */}
            <div className="relative">
              {/* Mensaje informativo sobre filtrado por proveedor */}
              {formData.provider && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 Mostrando solo materiales de <strong>{formData.provider}</strong>
                  </p>
                </div>
              )}
              
              <input
                type="text"
                value={materialSearch}
                onChange={(e) => {
                  setMaterialSearch(e.target.value);
                  setShowMaterialDropdown(true);
                }}
                onFocus={() => setShowMaterialDropdown(true)}
                placeholder={formData.provider ? "Buscar materiales del proveedor..." : "Buscar materiales..."}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.materialTypes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {/* Dropdown de materiales */}
              {showMaterialDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredMaterials.map((material) => (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => handleMaterialSelect(material)}
                      disabled={selectedMaterials.find(m => m.id === material.id)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-sm">{material.name}</div>
                        <div className="text-xs text-gray-500">{material.category}</div>
                      </div>
                      {selectedMaterials.find(m => m.id === material.id) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                  {filteredMaterials.length === 0 && (
                    <div className="px-3 py-2 text-sm text-gray-500">No se encontraron materiales</div>
                  )}
                </div>
              )}
            </div>
            {errors.materialTypes && (
              <p className="text-xs text-red-600 mt-1">{errors.materialTypes}</p>
            )}
          </div>
          )}

          {/* Driver */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Nombre del Chofer *
            </label>
            <input
              type="text"
              value={formData.driver}
              onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
              placeholder="Ej: Juan Pérez, María González"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.driver ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.driver && (
              <p className="text-xs text-red-600 mt-1">{errors.driver}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Observaciones (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionales sobre esta carga..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El número de carga se genera automáticamente de forma secuencial y única (CRG-001, CRG-002, etc.). 
              {formData.platformType === 'provider' 
                ? ' Una vez creada, podrás comenzar a registrar las longitudes de las piezas de manera rápida e intuitiva.'
                : ' Para cargas de cliente, solo necesitas el número de ticket y los datos del chofer.'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg text-sm sm:text-base active:scale-95"
            >
              Crear Carga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

