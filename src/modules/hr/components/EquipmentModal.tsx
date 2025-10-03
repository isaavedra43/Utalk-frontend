import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Laptop,
  Wrench,
  Car,
  Phone,
  ShirtIcon,
  Armchair,
  HardHat,
  Package
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Equipment, CreateEquipmentRequest } from '../../../services/equipmentService';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipmentData: CreateEquipmentRequest, files: { invoices: File[]; photos: File[]; document?: File }) => Promise<void>;
  employeeId: string;
  employeeName: string;
  equipment?: Equipment | null;
  mode?: 'create' | 'edit';
}

const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  employeeName,
  equipment,
  mode = 'create'
}) => {
  const { showSuccess, showError } = useNotifications();
  const invoiceInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateEquipmentRequest>({
    name: '',
    category: 'computer',
    brand: '',
    model: '',
    serialNumber: '',
    description: '',
    condition: 'excellent',
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    currency: 'MXN',
    assignedDate: new Date().toISOString().split('T')[0],
    location: '',
    invoice: {
      number: '',
      date: '',
      supplier: '',
      amount: 0,
      attachments: []
    },
    photos: [],
    responsibilityDocument: undefined,
    warranty: {
      hasWarranty: false
    },
    insurance: {
      hasInsurance: false
    },
    notes: '',
    tags: []
  });

  const [files, setFiles] = useState<{
    invoices: File[];
    photos: File[];
    document?: File;
  }>({
    invoices: [],
    photos: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (equipment && mode === 'edit') {
      setFormData({
        name: equipment.name,
        category: equipment.category,
        brand: equipment.brand,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        description: equipment.description,
        condition: equipment.condition,
        purchaseDate: equipment.purchaseDate,
        purchasePrice: equipment.purchasePrice,
        currentValue: equipment.currentValue,
        currency: equipment.currency,
        assignedDate: equipment.assignedDate,
        location: equipment.location,
        invoice: equipment.invoice,
        photos: equipment.photos,
        responsibilityDocument: equipment.responsibilityDocument,
        warranty: equipment.warranty,
        insurance: equipment.insurance,
        notes: equipment.notes,
        tags: equipment.tags
      });
    }
  }, [equipment, mode]);

  const categories = [
    { value: 'uniform', label: 'Uniforme', icon: ShirtIcon },
    { value: 'tools', label: 'Herramientas', icon: Wrench },
    { value: 'computer', label: 'Computadora', icon: Laptop },
    { value: 'vehicle', label: 'Vehículo', icon: Car },
    { value: 'phone', label: 'Teléfono', icon: Phone },
    { value: 'furniture', label: 'Mobiliario', icon: Armchair },
    { value: 'safety', label: 'Seguridad', icon: HardHat },
    { value: 'other', label: 'Otro', icon: Package }
  ];

  const conditions = [
    { value: 'excellent', label: 'Excelente', color: 'green' },
    { value: 'good', label: 'Bueno', color: 'blue' },
    { value: 'fair', label: 'Regular', color: 'yellow' },
    { value: 'poor', label: 'Malo', color: 'orange' },
    { value: 'damaged', label: 'Dañado', color: 'red' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'La fecha de compra es requerida';
    if (formData.purchasePrice <= 0) newErrors.purchasePrice = 'El precio debe ser mayor a 0';
    if (formData.currentValue < 0) newErrors.currentValue = 'El valor actual debe ser mayor o igual a 0';
    if (!formData.assignedDate) newErrors.assignedDate = 'La fecha de asignación es requerida';
    if (!formData.invoice.number.trim()) newErrors.invoiceNumber = 'El número de factura es requerido';
    if (!formData.invoice.supplier.trim()) newErrors.supplier = 'El proveedor es requerido';

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
      setIsLoading(true);
      await onSubmit(formData, files);
      showSuccess(`Equipo ${mode === 'edit' ? 'actualizado' : 'asignado'} exitosamente`);
      handleClose();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      showError(error instanceof Error ? error.message : 'Error procesando equipo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        category: 'computer',
        brand: '',
        model: '',
        serialNumber: '',
        description: '',
        condition: 'excellent',
        purchaseDate: '',
        purchasePrice: 0,
        currentValue: 0,
        currency: 'MXN',
        assignedDate: new Date().toISOString().split('T')[0],
        location: '',
        invoice: {
          number: '',
          date: '',
          supplier: '',
          amount: 0,
          attachments: []
        },
        photos: [],
        warranty: { hasWarranty: false },
        insurance: { hasInsurance: false },
        notes: '',
        tags: []
      });
      setFiles({ invoices: [], photos: [] });
      setErrors({});
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'photo' | 'document') => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (type === 'document') {
        setFiles(prev => ({ ...prev, document: newFiles[0] }));
      } else {
        setFiles(prev => ({
          ...prev,
          [type === 'invoice' ? 'invoices' : 'photos']: [...prev[type === 'invoice' ? 'invoices' : 'photos'], ...newFiles]
        }));
      }
    }
  };

  const removeFile = (index: number, type: 'invoice' | 'photo') => {
    setFiles(prev => ({
      ...prev,
      [type === 'invoice' ? 'invoices' : 'photos']: prev[type === 'invoice' ? 'invoices' : 'photos'].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  if (!isOpen) return null;

  const getCategoryIcon = () => {
    const category = categories.find(c => c.value === formData.category);
    const Icon = category?.icon || Package;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {getCategoryIcon()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {mode === 'edit' ? 'Editar Equipo' : 'Asignar Nuevo Equipo'}
                  </h3>
                  <p className="text-sm text-blue-100">{employeeName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white">
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Información Básica */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Información Básica</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Equipo *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Ej: Laptop Dell Latitude 5520"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, category: value as any }))}
                            className={`p-2 border-2 rounded-lg transition-all text-sm ${
                              formData.category === value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <Icon className={`h-4 w-4 mx-auto mb-1 ${formData.category === value ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className={`block text-xs ${formData.category === value ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>
                              {label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condición *</label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {conditions.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Dell"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Latitude 5520"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Serie</label>
                      <input
                        type="text"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: SN123456789"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                        rows={3}
                        placeholder="Descripción detallada del equipo..."
                      />
                      {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Información Financiera</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Compra *
                      </label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.purchaseDate ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio de Compra *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) || 0 }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.purchasePrice ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Actual *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.currentValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentValue: parseFloat(e.target.value) || 0 }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.currentValue ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Factura *
                      </label>
                      <input
                        type="text"
                        value={formData.invoice.number}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          invoice: { ...prev.invoice, number: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="FAC-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proveedor *
                      </label>
                      <input
                        type="text"
                        value={formData.invoice.supplier}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          invoice: { ...prev.invoice, supplier: e.target.value }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.supplier ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nombre del proveedor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Asignación *
                      </label>
                      <input
                        type="date"
                        value={formData.assignedDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignedDate: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.assignedDate ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Garantía y Seguro */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.warranty?.hasWarranty}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          warranty: { ...prev.warranty, hasWarranty: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Garantía</span>
                    </div>
                    {formData.warranty?.hasWarranty && (
                      <div className="space-y-2">
                        <input
                          type="date"
                          placeholder="Fecha de expiración"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            warranty: { ...prev.warranty!, expirationDate: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Proveedor de garantía"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            warranty: { ...prev.warranty!, provider: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.insurance?.hasInsurance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          insurance: { ...prev.insurance, hasInsurance: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Seguro</span>
                    </div>
                    {formData.insurance?.hasInsurance && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Número de póliza"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            insurance: { ...prev.insurance!, policyNumber: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Proveedor de seguro"
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            insurance: { ...prev.insurance!, provider: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Archivos */}
                <div className="space-y-4">
                  {/* Facturas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facturas (PDF, imágenes)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        ref={invoiceInputRef}
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(e, 'invoice')}
                        className="hidden"
                        accept=".pdf,image/*"
                      />
                      <button
                        type="button"
                        onClick={() => invoiceInputRef.current?.click()}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Seleccionar Facturas</span>
                      </button>
                      {files.invoices.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {files.invoices.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'invoice')}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fotos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fotos del Equipo
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        ref={photoInputRef}
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(e, 'photo')}
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <ImageIcon className="h-4 w-4" />
                        <span>Agregar Fotos</span>
                      </button>
                      {files.photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {files.photos.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-24 object-cover rounded"
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'photo')}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documento de Responsabilidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documento de Responsabilidad (PDF)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        ref={documentInputRef}
                        type="file"
                        onChange={(e) => handleFileChange(e, 'document')}
                        className="hidden"
                        accept=".pdf"
                      />
                      <button
                        type="button"
                        onClick={() => documentInputRef.current?.click()}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Seleccionar Documento</span>
                      </button>
                      {files.document && (
                        <div className="mt-3 flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                          <span className="text-sm text-gray-700">{files.document.name}</span>
                          <button
                            type="button"
                            onClick={() => setFiles(prev => ({ ...prev, document: undefined }))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Agregar etiqueta..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Agregar
                    </button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Información adicional..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>{mode === 'edit' ? 'Actualizar Equipo' : 'Asignar Equipo'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentModal;

