import React, { useMemo } from 'react';
import type { TeamMember } from '../../../types/team';
import TeamMemberCard from './TeamMemberCard';

interface TeamListProps {
  members: TeamMember[];
  selectedMember: TeamMember | null;
  onSelectMember: (member: TeamMember) => void;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  searchTerm?: string;
}

const TeamList: React.FC<TeamListProps> = ({
  members,
  selectedMember,
  onSelectMember,
  totalMembers,
  activeMembers,
  inactiveMembers,
  searchTerm = ''
}) => {
  // Filtrar miembros por término de búsqueda - ACTUALIZADO
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    
    const searchLower = searchTerm.toLowerCase();
    return members.filter(member => 
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower) ||
      (member.phone && member.phone.toLowerCase().includes(searchLower))
    );
  }, [members, searchTerm]);
  if (filteredMembers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron resultados' : 'No se encontraron agentes'}
          </h3>
          <p className="text-gray-600 text-sm">
            {searchTerm 
              ? `No hay miembros que coincidan con "${searchTerm}"`
              : 'No hay miembros del equipo con los filtros aplicados'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header de la lista - Desktop */}
      <div className="hidden lg:block p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Lista de Agentes
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {totalMembers} miembros
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {activeMembers} activos
            </span>
            <span className="text-xs text-gray-500">
              {inactiveMembers} inactivos
            </span>
          </div>
        </div>
      </div>

      {/* Header de la lista - Mobile */}
      <div className="lg:hidden px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {totalMembers} miembros del equipo
          </h2>
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <span>{activeMembers} activos</span>
            <span>{inactiveMembers} inactivos</span>
          </div>
        </div>
      </div>
      
      {/* Lista de miembros */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto scrollbar-medium min-h-0">
          <div className="p-4 lg:p-4 space-y-3">
            {filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember?.id === member.id}
                onSelect={() => onSelectMember(member)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamList; 