import React, { useState, useRef } from 'react';
import { X, Upload, Send, User, Phone, Mail, MessageSquare, FileText } from 'lucide-react';

interface CreateConversationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message: string;
  attachment?: File;
}

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConversationFormData) => void;
  isLoading?: boolean;
}

export const CreateConversationModal: React.FC<CreateConversationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateConversationFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<CreateConversationFormData>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof CreateConversationFormData, value: string) => {
    let processedValue = value;
    
    // Formatear automáticamente el teléfono
    if (field === 'customerPhone') {
      // Remover todo excepto números y +
      const cleanValue = value.replace(/[^\d+]/g, '');
      
      // Si empieza con 52, agregar +
      if (cleanValue.startsWith('52') && !cleanValue.startsWith('+52')) {
        processedValue = '+' + cleanValue;
      } else if (cleanValue.startsWith('1') && !cleanValue.startsWith('+52')) {
        processedValue = '+52' + cleanValue;
      } else if (!cleanValue.startsWith('+')) {
        processedValue = '+' + cleanValue;
      } else {
        processedValue = cleanValue;
      }
      
      // Formatear con espacios: +52 1 XXX XXX XXXX
      if (processedValue.length >= 4) {
        const formatted = processedValue
          .replace(/^(\+52)(\d{1})(\d{3})(\d{3})(\d{4}).*/, '$1 $2 $3 $4 $5')
          .replace(/^(\+52)(\d{1})(\d{3})(\d{3}).*/, '$1 $2 $3 $4')
          .replace(/^(\+52)(\d{1})(\d{3}).*/, '$1 $2 $3')
          .replace(/^(\+52)(\d{1}).*/, '$1 $2')
          .replace(/^(\+52).*/, '$1');
        processedValue = formatted;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, attachment: file }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateConversationFormData> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'El teléfono es requerido';
    } else {
      // Validación específica para números mexicanos de WhatsApp
      const phoneRegex = /^\+52\s?1\s?\d{3}\s?\d{3}\s?\d{4}$/;
      const cleanPhone = formData.customerPhone.replace(/\s/g, '');
      
      if (!formData.customerPhone.startsWith('+52')) {
        newErrors.customerPhone = 'Debe empezar con +52 (código de México)';
      } else if (!phoneRegex.test(formData.customerPhone)) {
        newErrors.customerPhone = 'Formato: +52 1 XXX XXX XXXX (ej: +52 1 477 123 4567)';
      } else if (cleanPhone.length !== 13) {
        newErrors.customerPhone = 'El número debe tener 10 dígitos después del +52 1';
      }
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Formato de email inválido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    // Resetear formulario al cerrar
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      message: ''
    });
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Nueva Conversación</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre del cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nombre del cliente *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.customerName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ingresa el nombre completo"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.customerPhone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+52 1 477 123 4567"
            />
            <p className="mt-1 text-xs text-gray-500">
              Formato: +52 1 XXX XXX XXXX (se formatea automáticamente)
            </p>
            {errors.customerPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
            )}
          </div>

          {/* Email (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email (opcional)
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.customerEmail ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="cliente@ejemplo.com"
            />
            {errors.customerEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Mensaje inicial *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.message ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Escribe el mensaje inicial para el cliente..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          {/* Archivo adjunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Archivo adjunto (opcional)
            </label>
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Seleccionar archivo</span>
              </button>
              {formData.attachment && (
                <span className="text-sm text-gray-600">
                  {formData.attachment.name}
                </span>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Crear Conversación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 