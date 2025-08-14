import React, { useState, useMemo } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar miembros por término de búsqueda
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    
    const searchLower = searchTerm.toLowerCase();
    return members.filter(member => 
      member.name.toLowerCase().includes(searchLower) ||
      member.fullName.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.role.toLowerCase().includes(searchLower)
    );
  }, [members, searchTerm]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
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
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {currentMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                isSelected={selectedMember?.id === member.id}
                onSelect={() => onSelectMember(member)}
              />
            ))}
          </div>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredMembers.length)} de {filteredMembers.length} agentes
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamList; 