import React from 'react';
import type { TeamMember } from '../../../types/team';
import TeamMemberCard from './TeamMemberCard';

interface TeamListProps {
  members: TeamMember[];
  selectedMember: TeamMember | null;
  onSelectMember: (member: TeamMember) => void;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
}

const TeamList: React.FC<TeamListProps> = ({
  members,
  selectedMember,
  onSelectMember,
  totalMembers,
  activeMembers,
  inactiveMembers
}) => {
  if (members.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron agentes
          </h3>
          <p className="text-gray-600 text-sm">
            No hay miembros del equipo con los filtros aplicados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header de la lista */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Lista de Vendedores
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
      
      {/* Lista de miembros */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {members.map((member) => (
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
  );
};

export default TeamList; 