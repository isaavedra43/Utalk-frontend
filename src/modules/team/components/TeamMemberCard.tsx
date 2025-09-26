import React from 'react';
import type { TeamMember } from '../../../types/team';

interface TeamMemberCardProps {
  member: TeamMember;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (member: TeamMember) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  isSelected,
  onSelect,
  onDelete
}) => {
  const getPermissionIcon = (permissionName: string) => {
    switch (permissionName) {
      case 'read':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'write':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'approve':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'configure':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-3 lg:p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Miembro del equipo: ${member.name}, ${member.role}`}
      aria-selected={isSelected}
    >
      {/* Header con avatar, nombre y menú */}
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 lg:w-10 lg:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {member.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm lg:text-sm truncate">{member.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{member.role}</p>
            {member.email && (
              <p className="text-xs text-gray-400 truncate">{member.email}</p>
            )}
          </div>
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
          aria-label={`Opciones para ${member.name}`}
          aria-haspopup="true"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Permisos - Solo en desktop */}
      <div className="hidden lg:block mb-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">PERMISOS</h4>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(member.permissions).map(([permissionName, isActive]) => (
            <button
              key={permissionName}
              className={`flex items-center justify-center space-x-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
              aria-label={`Permiso ${permissionName} ${isActive ? 'activo' : 'inactivo'}`}
              aria-pressed={isActive}
            >
              {getPermissionIcon(permissionName)}
              <span className="capitalize">{permissionName === 'read' ? 'Leer' : permissionName === 'write' ? 'Escribir' : permissionName === 'approve' ? 'Aprobar' : 'Configurar'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-base lg:text-lg font-bold text-gray-900">
            {member.performance.totalChats}
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chats
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-base lg:text-lg font-bold text-gray-900">
            {member.performance.csat}
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-center mt-1">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            CSAT
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-base lg:text-lg font-bold text-gray-900">
            {member.performance.conversionRate}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Conv.</div>
        </div>
      </div>

      {/* Estado móvil */}
      <div className="lg:hidden mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            member.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {member.isActive ? 'Activo' : 'Inactivo'}
          </span>
          <div className="flex items-center space-x-1">
            {Object.entries(member.permissions).filter(([_, isActive]) => isActive).map(([permissionName]) => (
              <div key={permissionName} className="w-2 h-2 bg-blue-500 rounded-full" title={permissionName} />
            ))}
          </div>
        </div>
      </div>

      {/* Botón de eliminar - Solo para usuarios no inmunes */}
      {onDelete && member.email !== 'admin@company.com' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(member);
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar Agente</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard; 