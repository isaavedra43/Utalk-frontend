import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, MapPin, Bell, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import type { PermissionStatus } from '../../services/permissions';

interface PermissionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: PermissionStatus;
  onRequest: () => Promise<void>;
  loading: boolean;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  icon,
  title,
  description,
  status,
  onRequest,
  loading
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'not-supported':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'granted':
        return 'Permitido';
      case 'denied':
        return 'Denegado';
      case 'not-supported':
        return 'No soportado';
      default:
        return 'Sin configurar';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'granted':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      case 'not-supported':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const canRequest = status === 'prompt';

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
        {icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {canRequest && (
          <button
            onClick={onRequest}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-sm"
          >
            {loading ? 'Solicitando...' : 'Permitir'}
          </button>
        )}
      </div>
    </div>
  );
};

interface PermissionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsManager: React.FC<PermissionsManagerProps> = ({ isOpen, onClose }) => {
  const {
    permissions,
    requestCamera,
    requestMicrophone,
    requestLocation,
    requestNotifications,
    requestAll
  } = usePermissions();

  const [loadingPermission, setLoadingPermission] = useState<string | null>(null);

  const handleRequest = async (permission: string, requestFn: () => Promise<any>) => {
    setLoadingPermission(permission);
    try {
      await requestFn();
    } finally {
      setLoadingPermission(null);
    }
  };

  const handleRequestAll = async () => {
    setLoadingPermission('all');
    try {
      await requestAll();
    } finally {
      setLoadingPermission(null);
    }
  };

  const permissionsConfig = [
    {
      key: 'camera',
      icon: <Camera className="w-6 h-6 text-blue-600" />,
      title: 'Cámara',
      description: 'Para capturar fotos y compartir imágenes',
      status: permissions.camera,
      request: requestCamera
    },
    {
      key: 'microphone',
      icon: <Mic className="w-6 h-6 text-green-600" />,
      title: 'Micrófono',
      description: 'Para grabar notas de voz y audio',
      status: permissions.microphone,
      request: requestMicrophone
    },
    {
      key: 'location',
      icon: <MapPin className="w-6 h-6 text-red-600" />,
      title: 'Ubicación',
      description: 'Para compartir tu ubicación con clientes',
      status: permissions.location,
      request: requestLocation
    },
    {
      key: 'notifications',
      icon: <Bell className="w-6 h-6 text-yellow-600" />,
      title: 'Notificaciones',
      description: 'Para recibir alertas de nuevos mensajes',
      status: permissions.notifications,
      request: requestNotifications
    }
  ];

  const allGranted = Object.values(permissions).every(
    status => status === 'granted' || status === 'not-supported'
  );

  const somePrompt = Object.values(permissions).some(
    status => status === 'prompt'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Permisos de la Aplicación
                </h2>
                <p className="text-gray-600">
                  Gestiona los permisos para usar todas las funciones de UTalk
                </p>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {permissions.loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {allGranted && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      <p className="text-green-800 font-medium">
                        Todos los permisos están configurados correctamente
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {permissionsConfig.map((perm) => (
                      <PermissionItem
                        key={perm.key}
                        icon={perm.icon}
                        title={perm.title}
                        description={perm.description}
                        status={perm.status}
                        onRequest={() => handleRequest(perm.key, perm.request)}
                        loading={loadingPermission === perm.key}
                      />
                    ))}
                  </div>

                  {somePrompt && (
                    <div className="mt-6">
                      <button
                        onClick={handleRequestAll}
                        disabled={loadingPermission === 'all'}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        {loadingPermission === 'all' ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Solicitando permisos...
                          </>
                        ) : (
                          'Permitir todos los permisos'
                        )}
                      </button>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Los permisos denegados pueden ser habilitados nuevamente desde la configuración de tu navegador o dispositivo.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

