import React from 'react';
import type { TeamMember } from '../../../types/team';

interface PermissionsPanelProps {
  member: TeamMember;
}

const PermissionsPanel: React.FC<PermissionsPanelProps> = ({ member }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Permisos y Accesos
      </h3>
      
      <div className="space-y-3">
        {member.permissions.map((permission) => (
          <div key={permission.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{permission.displayName}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  permission.level === 'advanced' ? 'bg-blue-100 text-blue-700' :
                  permission.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {permission.level}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full transition-colors ${
                permission.isActive ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            </div>
            <p className="text-xs text-gray-600">{permission.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {member.permissions.filter(p => p.isActive).length} de {member.permissions.length} permisos activos
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Última modificación: {member.updatedAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PermissionsPanel; 