import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Wrench, CheckCircle } from 'lucide-react';
import { useAuthContext } from '../contexts/useAuthContext';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { AdminMigrationButton } from './AdminMigrationButton';

export const AdminMigrationAlert: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { backendUser } = useAuthContext();
  const { permissions, loading, error } = useModulePermissions();

  useEffect(() => {
    const checkAdminMigration = async () => {
      // Solo verificar si es admin
      const isAdmin = backendUser?.role?.toLowerCase().includes('admin') || 
                     backendUser?.email?.includes('admin') ||
                     backendUser?.email?.includes('@admin');
      
      if (!isAdmin) {
        setIsChecking(false);
        return;
      }

      // Esperar a que se carguen los permisos
      if (loading) return;

      // Verificar si el admin tiene permisos limitados (necesita migración)
      if (permissions && permissions.accessibleModules) {
        const totalModules = 16; // Total de módulos del sistema
        const accessibleModules = permissions.accessibleModules.length;
        
        // Si el admin no tiene acceso a todos los módulos, necesita migración
        const needsMigration = accessibleModules < totalModules || 
                              !permissions.permissions?.modules ||
                              Object.keys(permissions.permissions.modules).length < totalModules;

        if (needsMigration) {
          infoLog('🚨 Admin necesita migración de permisos', {
            email: backendUser?.email,
            accessibleModules,
            totalModules,
            hasPermissions: !!permissions.permissions?.modules
          });
          setShowAlert(true);
        }
      }

      setIsChecking(false);
    };

    checkAdminMigration();
  }, [backendUser, permissions, loading, error]);

  // No mostrar nada si no es admin o si aún está verificando
  if (!backendUser || isChecking || !showAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-orange-800">
              🔧 Migración de Permisos Requerida
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                Como administrador, necesitas migrar tus permisos al nuevo sistema 
                para tener acceso completo a todos los módulos.
              </p>
            </div>
            <div className="mt-4">
              <AdminMigrationButton 
                className="max-w-xs"
                onMigrationComplete={() => {
                  setShowAlert(false);
                  infoLog('✅ Migración de admin completada desde alerta');
                }}
              />
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setShowAlert(false)}
              className="inline-flex text-orange-400 hover:text-orange-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
