import React from 'react';
import { X, Edit3, Building2, Phone, Mail, MapPin, User, FileText, Calendar } from 'lucide-react';
import type { Provider } from '../types';

interface ProviderDetailModalProps {
  provider: Provider;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const ProviderDetailModal: React.FC<ProviderDetailModalProps> = ({
  provider,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{provider.name}</h2>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                provider.isActive !== false 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {provider.isActive !== false ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit3 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contacto</p>
                  <p className="text-base font-medium text-gray-900">{provider.contact || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="text-base font-medium text-gray-900">{provider.phone || '-'}</p>
                </div>
              </div>

              {provider.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-base font-medium text-gray-900">{provider.email}</p>
                  </div>
                </div>
              )}

              {provider.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="text-base font-medium text-gray-900">{provider.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Materiales asociados */}
          {provider.materialIds && provider.materialIds.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Materiales que Maneja</h3>
              <div className="flex flex-wrap gap-2">
                {provider.materialIds.map((materialId, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    Material {index + 1}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notas */}
          {provider.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{provider.notes}</p>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">ID:</span>
                <span className="font-mono text-gray-700">{provider.id}</span>
              </div>
              {provider.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Creado:</span>
                  <span className="text-gray-700">{new Date(provider.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {provider.updatedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Actualizado:</span>
                  <span className="text-gray-700">{new Date(provider.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
