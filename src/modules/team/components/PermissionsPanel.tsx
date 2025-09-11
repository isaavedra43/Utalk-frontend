import React from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import type { TeamMember } from '../../../types/team';

interface PermissionsPanelProps {
  member: TeamMember;
}

const PermissionsPanel: React.FC<PermissionsPanelProps> = ({ member }) => {
  // Mapear los permisos del objeto a un array con información adicional
  const permissionsArray = member.permissions ? Object.entries(member.permissions).map(([key, isActive]) => ({
    id: key,
    name: key,
    displayName: key === 'read' ? 'Leer' : 
                 key === 'write' ? 'Escribir' : 
                 key === 'approve' ? 'Aprobar' : 'Configurar',
    description: key === 'read' ? 'Acceso de lectura a conversaciones y datos' :
                 key === 'write' ? 'Enviar mensajes y responder conversaciones' :
                 key === 'approve' ? 'Aprobar campañas y operaciones importantes' :
                 'Acceso a configuración del sistema',
    level: key === 'read' || key === 'write' ? 'advanced' :
           key === 'approve' ? 'intermediate' : 'basic',
    isActive,
    icon: key === 'read' ? '👁️' :
          key === 'write' ? '✏️' :
          key === 'approve' ? '✅' : '⚙️'
  })) : [];

  const activePermissions = permissionsArray.filter(p => p.isActive).length;
  const totalPermissions = permissionsArray.length;

  return (
    <div className="p-4 lg:p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Shield className="w-5 h-5 mr-2 text-gray-500" />
        Permisos y Accesos
      </h3>
      
      <div className="space-y-3">
        {permissionsArray.map((permission) => (
          <div key={permission.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{permission.icon}</span>
                <span className="text-sm font-medium text-gray-900">{permission.displayName}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  permission.level === 'advanced' ? 'bg-blue-100 text-blue-700' :
                  permission.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {permission.level}
                </span>
              </div>
              {permission.isActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-300" />
              )}
            </div>
            <p className="text-xs text-gray-600">{permission.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {activePermissions} de {totalPermissions} permisos activos
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Última modificación: {member.updatedAt ? new Date(member.updatedAt).toLocaleDateString() : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default PermissionsPanel; 