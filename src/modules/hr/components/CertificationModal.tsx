import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  Award,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '../../../contexts/NotificationContext';
import type { Certification, CreateCertificationRequest } from '../../../services/skillsService';

interface CertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (certificationData: CreateCertificationRequest, files: File[]) => Promise<void>;
  employeeId: string;
  employeeName: string;
  certification?: Certification | null;
  mode?: 'create' | 'edit';
}

const CertificationModal: React.FC<CertificationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  employeeName,
  certification,
  mode = 'create'
}) => {
  const { showSuccess, showError } = useNotifications();

  const [formData, setFormData] = useState<CreateCertificationRequest>({
    name: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: '',
    description: '',
    category: 'technical',
    level: 'beginner',
    documents: []
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (certification && mode === 'edit') {
      setFormData({
        name: certification.name,
        issuer: certification.issuer,
        issueDate: certification.issueDate,
        expirationDate: certification.expirationDate || '',
        credentialId: certification.credentialId,
        credentialUrl: certification.credentialUrl || '',
        description: certification.description || '',
        category: certification.category,
        level: certification.level,
        documents: certification.documents || []
      });
    } else {
      setFormData({
        name: '',
        issuer: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
        description: '',
        category: 'technical',
        level: 'beginner',
        documents: []
      });
      setFiles([]);
    }
  }, [certification, mode]);

  const categories = [
    { value: 'technical', label: 'Técnicas' },
    { value: 'soft', label: 'Blandas' },
    { value: 'leadership', label: 'Liderazgo' },
    { value: 'language', label: 'Idiomas' },
    { value: 'other', label: 'Otras' }
  ];

  const levels = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' },
    { value: 'expert', label: 'Experto' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.issuer.trim()) newErrors.issuer = 'El emisor es requerido';
    if (!formData.issueDate) newErrors.issueDate = 'La fecha de emisión es requerida';
    if (!formData.credentialId.trim()) newErrors.credentialId = 'El ID de credencial es requerido';
    if (formData.expirationDate && new Date(formData.expirationDate) <= new Date(formData.issueDate)) {
      newErrors.expirationDate = 'La fecha de expiración debe ser posterior a la fecha de emisión';
    }

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
      handleClose();
    } catch (error) {
      console.error('Error en handleSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        issuer: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        credentialUrl: '',
        description: '',
        category: 'technical',
        level: 'beginner',
        documents: []
      });
      setFiles([]);
      setErrors({});
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {mode === 'edit' ? 'Editar Certificación' : 'Nueva Certificación'}
                </h3>
                <p className="text-sm text-purple-100">{employeeName}</p>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna 1 */}
                <div className="space-y-6">
                  {/* Información Básica */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Certificación *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Google Ads Certified"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emisor *
                        </label>
                        <input
                          type="text"
                          value={formData.issuer}
                          onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                            errors.issuer ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Google"
                        />
                        {errors.issuer && <p className="text-red-600 text-sm mt-1">{errors.issuer}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Emisión *
                          </label>
                          <input
                            type="date"
                            value={formData.issueDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                              errors.issueDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.issueDate && <p className="text-red-600 text-sm mt-1">{errors.issueDate}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha de Expiración
                          </label>
                          <input
                            type="date"
                            value={formData.expirationDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                              errors.expirationDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.expirationDate && <p className="text-red-600 text-sm mt-1">{errors.expirationDate}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID de Credencial *
                        </label>
                        <input
                          type="text"
                          value={formData.credentialId}
                          onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                            errors.credentialId ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ej: GADS-2024-001"
                        />
                        {errors.credentialId && <p className="text-red-600 text-sm mt-1">{errors.credentialId}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL de Verificación
                        </label>
                        <input
                          type="url"
                          value={formData.credentialUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="https://verify.certification.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="space-y-6">
                  {/* Categoría y Nivel */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Categorización</h4>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            {categories.map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nivel
                          </label>
                          <select
                            value={formData.level}
                            onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          >
                            {levels.map(level => (
                              <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Describe la certificación..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Documentos</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Archivos de Certificación
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <div className="text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Arrastra archivos aquí o haz clic para seleccionar
                            </p>
                            <input
                              type="file"
                              multiple
                              onChange={handleFileChange}
                              className="hidden"
                              id="cert-file-upload"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <label
                              htmlFor="cert-file-upload"
                              className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              Seleccionar Archivos
                            </label>
                          </div>
                        </div>

                        {files.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <Award className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">{file.name}</span>
                                  <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
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
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
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
                className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{mode === 'edit' ? 'Actualizar' : 'Crear'} Certificación</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CertificationModal;
