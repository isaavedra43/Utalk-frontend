import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, Layers, FileText, Truck, User, Search, Check } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import type { Provider, MaterialOption } from '../types';

interface CreatePlatformModalProps {
  onClose: () => void;
  onCreate: (data: {
    materialTypes: string[];
    provider: string;
    providerId?: string;
    driver: string;
    notes?: string;
  }) => void;
}

export const CreatePlatformModal: React.FC<CreatePlatformModalProps> = ({ onClose, onCreate }) => {
  const { providers, activeMaterials } = useConfiguration();
  
  const [formData, setFormData] = useState({
    materialTypes: [] as string[],
    provider: '',
    providerId: '',
    driver: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providerSearch, setProviderSearch] = useState('');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialOption[]>([]);
  const [materialSearch, setMaterialSearch] = useState('');
  const [showMaterialDropdown, setShowMaterialDropdown] = useState(false);
  
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
  // Filtrar materiales por proveedor seleccionado y búsqueda
  const filteredMaterials = activeMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(materialSearch.toLowerCase());
    
    // Si no hay proveedor seleccionado, mostrar todos los materiales
    if (!formData.provider) {
      return matchesSearch;
    }
    
    // Filtrar por materiales que maneja el proveedor seleccionado
    const selectedProvider = providers.find(p => p.name === formData.provider);
    const matchesProvider = selectedProvider ? 
      (material.providerIds && material.providerIds.includes(selectedProvider.id)) : true;
    
    return matchesSearch && matchesProvider;
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.materialTypes.length === 0) {
      newErrors.materialTypes = 'Debe seleccionar al menos un material';
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'El proveedor es requerido';
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
            <span className="truncate">Nueva Plataforma</span>
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
              Número de Plataforma
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

          {/* Material Types - Multi Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-500" />
              Tipos de Material *
            </label>
            
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

          {/* Provider */}
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
              placeholder="Notas adicionales sobre esta plataforma..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El número de plataforma se genera automáticamente de forma secuencial y única (PLT-001, PLT-002, etc.). Una vez creada, podrás comenzar a registrar las longitudes de las piezas de manera rápida e intuitiva.
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
              Crear Plataforma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

