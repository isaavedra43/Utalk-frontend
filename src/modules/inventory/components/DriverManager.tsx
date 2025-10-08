import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Phone, User, Car, AlertCircle, Check, X } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import type { Driver } from '../types';

export const DriverManager: React.FC = () => {
  const { drivers, addDriver, updateDriver, deleteDriver } = useConfiguration();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    vehicleType: '',
    vehiclePlate: '',
    vehicleModel: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vehicleTypes = [
    'Camión',
    'Camioneta',
    'Pickup',
    'Van',
    'Trailer',
    'Otro'
  ];

  const resetForm = () => {
    setFormData({ 
      name: '', 
      phone: '', 
      licenseNumber: '', 
      vehicleType: '', 
      vehiclePlate: '', 
      vehicleModel: '',
      isActive: true 
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del chofer es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (!formData.vehicleType.trim()) {
      newErrors.vehicleType = 'El tipo de vehículo es requerido';
    }

    if (!formData.vehiclePlate.trim()) {
      newErrors.vehiclePlate = 'La placa del vehículo es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
      } else {
        await addDriver(formData);
      }
      
      resetForm();
      setShowAddModal(false);
      setEditingDriver(null);
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const handleEdit = (driver: Driver) => {
    setFormData({
      name: driver.name,
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      vehicleType: driver.vehicleType,
      vehiclePlate: driver.vehiclePlate || '',
      vehicleModel: driver.vehicleModel || '',
      isActive: driver.isActive ?? true
    });
    setEditingDriver(driver);
    setShowAddModal(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al chofer "${driver.name}"?`)) {
      try {
        await deleteDriver(driver.id);
      } catch (error) {
        console.error('Error deleting driver:', error);
      }
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowAddModal(false);
    setEditingDriver(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Choferes</h2>
          <p className="text-gray-600 mt-1">Administra los choferes y sus vehículos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Chofer
        </button>
      </div>

      {/* Drivers List */}
      {drivers.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin choferes</h3>
          <p className="text-gray-500 mb-6">Comienza agregando tu primer chofer</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Agregar Chofer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                    <div className="flex items-center gap-1">
                      {driver.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <X className="w-3 h-3 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar chofer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(driver)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar chofer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {driver.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{driver.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Car className="w-4 h-4" />
                  <span>{driver.vehicleType}</span>
                </div>

                {driver.vehiclePlate && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Placa:</span> {driver.vehiclePlate}
                  </div>
                )}

                {driver.vehicleModel && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Modelo:</span> {driver.vehicleModel}
                  </div>
                )}

                {driver.licenseNumber && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Licencia:</span> {driver.licenseNumber}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDriver ? 'Editar Chofer' : 'Agregar Chofer'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Chofer *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Juan Pérez"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: +52 477 123 4567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Número de Licencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Licencia
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: A123456789"
                />
              </div>

              {/* Tipo de Vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Vehículo *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.vehicleType && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.vehicleType}
                  </p>
                )}
              </div>

              {/* Placa del Vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa del Vehículo *
                </label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.vehiclePlate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: ABC-123"
                />
                {errors.vehiclePlate && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.vehiclePlate}
                  </p>
                )}
              </div>

              {/* Modelo del Vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo del Vehículo
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Ford F-150 2020"
                />
              </div>

              {/* Estado Activo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Chofer activo
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingDriver ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
