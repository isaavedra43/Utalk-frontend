import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Phone, User, Building2, AlertCircle, Check, X } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import type { Provider } from '../types';

export const ProviderManager: React.FC = () => {
  const { providers, materials, addProvider, updateProvider, deleteProvider } = useConfiguration();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    materialIds: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({ name: '', contact: '', phone: '', materialIds: [] });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proveedor es requerido';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'El contacto es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (formData.materialIds.length === 0) {
      newErrors.materialIds = 'Debe seleccionar al menos un material';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingProvider) {
        updateProvider(editingProvider.id, formData);
      } else {
        addProvider(formData);
      }
      
      resetForm();
      setShowAddModal(false);
      setEditingProvider(null);
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
    }
  };

  const handleEdit = (provider: Provider) => {
    setFormData({
      name: provider.name,
      contact: provider.contact || '',
      phone: provider.phone || '',
      materialIds: provider.materialIds || []
    });
    setEditingProvider(provider);
    setShowAddModal(true);
  };

  const handleDelete = (providerId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      try {
        deleteProvider(providerId);
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
      }
    }
  };

  const handleMaterialToggle = (materialId: string) => {
    setFormData(prev => ({
      ...prev,
      materialIds: prev.materialIds.includes(materialId)
        ? prev.materialIds.filter(id => id !== materialId)
        : [...prev.materialIds, materialId]
    }));
  };

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Material desconocido';
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProvider(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Proveedores</h3>
          <p className="text-sm text-gray-600">Administra los proveedores de materiales</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Agregar Proveedor
        </button>
      </div>

      {/* Providers List */}
      {providers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Sin proveedores</h4>
          <p className="text-gray-600 mb-4">Comienza agregando tu primer proveedor de materiales</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Agregar Proveedor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900 truncate">{provider.name}</h4>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(provider)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors active:scale-95"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors active:scale-95"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {provider.contact && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{provider.contact}</span>
                  </div>
                )}
                {provider.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{provider.phone}</span>
                  </div>
                )}
                
                {/* Materials */}
                {provider.materialIds && provider.materialIds.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Materiales que maneja:</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.materialIds.slice(0, 3).map(materialId => (
                        <span key={materialId} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {getMaterialName(materialId)}
                        </span>
                      ))}
                      {provider.materialIds.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{provider.materialIds.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProvider ? 'Editar Proveedor' : 'Agregar Proveedor'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Provider Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mármoles del Norte"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto *
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Ej: Juan Pérez"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contact ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.contact && (
                  <p className="text-xs text-red-600 mt-1">{errors.contact}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: +52 81 1234-5678"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Materials Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materiales que maneja *
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                  {materials.filter(m => m.isActive).map((material) => (
                    <label key={material.id} className="flex items-center gap-2 py-2 hover:bg-white hover:shadow-sm rounded px-2 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.materialIds.includes(material.id)}
                        onChange={() => handleMaterialToggle(material.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">{material.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({material.category})</span>
                      </div>
                    </label>
                  ))}
                  {materials.filter(m => m.isActive).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No hay materiales disponibles</p>
                  )}
                </div>
                {formData.materialIds.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Materiales seleccionados:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.materialIds.map(materialId => (
                        <span key={materialId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {getMaterialName(materialId)}
                          <button
                            type="button"
                            onClick={() => handleMaterialToggle(materialId)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {errors.materialIds && (
                  <p className="text-xs text-red-600 mt-1">{errors.materialIds}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
                >
                  {editingProvider ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
