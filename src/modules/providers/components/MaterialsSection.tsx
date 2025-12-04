import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Package, DollarSign, Tag, AlertCircle, X, Save, Image as ImageIcon } from 'lucide-react';
import type { ProviderMaterial } from '../types';

interface MaterialsSectionProps {
  providerId: string;
  materials: ProviderMaterial[];
  onAddMaterial: (material: Omit<ProviderMaterial, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateMaterial: (id: string, updates: Partial<ProviderMaterial>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
}

export const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  providerId,
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ProviderMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unitPrice: '',
    unit: 'm²',
    sku: '',
    imageUrl: '',
    stock: '',
    minStock: '',
    isActive: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unitPrice: '',
      unit: 'm²',
      sku: '',
      imageUrl: '',
      stock: '',
      minStock: '',
      isActive: true,
    });
    setSelectedImage(null);
    setImagePreview(null);
    setErrors({});
    setEditingMaterial(null);
  };

  // Convertir imagen a base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error al convertir la imagen'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'El archivo debe ser una imagen' });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'La imagen no puede ser mayor a 5MB' });
      return;
    }

    setSelectedImage(file);
    setErrors({ ...errors, image: '' });

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Eliminar imagen seleccionada
  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
    if (errors.image) {
      const newErrors = { ...errors };
      delete newErrors.image;
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'El precio debe ser mayor a 0';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'La unidad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Convertir imagen a base64 si hay una seleccionada
      let imageUrl = formData.imageUrl.trim() || undefined;
      
      if (selectedImage) {
        try {
          imageUrl = await convertImageToBase64(selectedImage);
        } catch (error) {
          console.error('Error convirtiendo imagen:', error);
          setErrors({ ...errors, submit: 'Error al procesar la imagen' });
          setSaving(false);
          return;
        }
      }

      const materialData = {
        providerId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category.trim() || undefined,
        unitPrice: parseFloat(formData.unitPrice),
        unit: formData.unit,
        sku: formData.sku.trim() || undefined,
        imageUrl: imageUrl,
        stock: formData.stock ? parseFloat(formData.stock) : undefined,
        minStock: formData.minStock ? parseFloat(formData.minStock) : undefined,
        isActive: formData.isActive,
      };

      if (editingMaterial) {
        await onUpdateMaterial(editingMaterial.id, materialData);
      } else {
        await onAddMaterial(materialData);
      }

      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error guardando material:', error);
      setErrors({ submit: 'Error al guardar el material' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material: ProviderMaterial) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      category: material.category || '',
      unitPrice: material.unitPrice.toString(),
      unit: material.unit,
      sku: material.sku || '',
      imageUrl: material.imageUrl || '',
      stock: material.stock?.toString() || '',
      minStock: material.minStock?.toString() || '',
      isActive: material.isActive,
    });
    
    // Si tiene imagen guardada (puede ser base64 o URL), mostrar preview
    if (material.imageUrl) {
      setImagePreview(material.imageUrl);
      setSelectedImage(null); // No es un archivo nuevo, es una imagen existente
    } else {
      setImagePreview(null);
      setSelectedImage(null);
    }
    
    setShowAddModal(true);
  };

  const handleDelete = async (material: ProviderMaterial) => {
    if (window.confirm(`¿Eliminar el material "${material.name}"?`)) {
      try {
        await onDeleteMaterial(material.id);
      } catch (error) {
        console.error('Error eliminando material:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Materiales</h3>
          <p className="text-sm text-gray-500 mt-1">
            {materials.length} {materials.length === 1 ? 'material' : 'materiales'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Agregar Material</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No hay materiales registrados</p>
          <p className="text-sm text-gray-400 mt-1">Agrega el primer material para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {material.imageUrl ? (
                  <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 line-clamp-1">{material.name}</h4>
                    {material.sku && (
                      <p className="text-xs text-gray-500">SKU: {material.sku}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(material)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(material)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {material.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                )}

                {material.category && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Tag className="w-3 h-3" />
                    <span>{material.category}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(material.unitPrice)}</span>
                    </div>
                    <span className="text-sm text-gray-500">/ {material.unit}</span>
                  </div>
                </div>

                {material.stock !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-medium ${
                      material.minStock && material.stock <= material.minStock
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {material.stock} {material.unit}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Estado:</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    material.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {material.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMaterial ? 'Editar Material' : 'Agregar Material'}
              </h3>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Material *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Granito Negro San Gabriel"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción del material..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Granito, Mármol, Cuarzo"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU / Código
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: GRN-001"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.unitPrice ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.unitPrice && (
                    <p className="text-sm text-red-600 mt-1">{errors.unitPrice}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidad *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.unit ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="m²">m²</option>
                    <option value="m">m (metro lineal)</option>
                    <option value="kg">kg</option>
                    <option value="ton">tonelada</option>
                    <option value="pieza">pieza</option>
                    <option value="paquete">paquete</option>
                    <option value="caja">caja</option>
                    <option value="lote">lote</option>
                  </select>
                  {errors.unit && (
                    <p className="text-sm text-red-600 mt-1">{errors.unit}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* Min Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen del Material
                  </label>
                  
                  {/* Preview de imagen */}
                  {imagePreview && (
                    <div className="mb-3 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Eliminar imagen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Input de archivo */}
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedImage ? selectedImage.name : imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                        </span>
                      </div>
                    </label>
                  </div>
                  
                  {errors.image && (
                    <p className="text-sm text-red-600 mt-1">{errors.image}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </p>
                </div>

                {/* Is Active */}
                <div className="md:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Material activo
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Guardando...' : editingMaterial ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

