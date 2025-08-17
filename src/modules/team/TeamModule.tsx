import React, { useEffect, lazy, Suspense, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { useTeam } from './hooks/useTeam';
import { logger } from '../../utils/logger';

// Lazy loading de componentes
const TeamHeader = lazy(() => import('./components/TeamHeader'));
const TeamList = lazy(() => import('./components/TeamList'));
const TeamMemberDetails = lazy(() => import('./components/TeamMemberDetails'));
const PermissionsPanel = lazy(() => import('./components/PermissionsPanel'));
const CoachingPanel = lazy(() => import('./components/CoachingPanel'));
const SuggestedPlan = lazy(() => import('./components/SuggestedPlan'));
const CreateAgentModal = lazy(() => import('./components/CreateAgentModal'));

const TeamModule: React.FC = () => {
  const { setCurrentModule } = useAppStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    members, 
    selectedMember, 
    filters,
    loading, 
    error,
    totalMembers,
    activeMembers,
    inactiveMembers,
    selectMember,
    refreshTeam,
    applyFilters
  } = useTeam();

  useEffect(() => {
    setCurrentModule('team');
    logger.systemInfo('Team module loaded', { 
      timestamp: new Date().toISOString(),
      totalMembers,
      activeMembers,
      inactiveMembers
    });
  }, [setCurrentModule, totalMembers, activeMembers, inactiveMembers]);

  const handleCreateAgent = (agentData: {
    name: string;
    email: string;
    password: string;
    permissions: { read: boolean; write: boolean; approve: boolean; configure: boolean };
  }) => {
    // TODO: Implementar creación de agente
    console.log('Creando agente:', agentData);
    logger.systemInfo('Creating new agent', { agentData });
    setIsCreateModalOpen(false);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Componente de loading para lazy components
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando equipo...
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar el equipo
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshTeam}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Layout principal con header integrado */}
      <div className="flex w-full h-full">
        {/* Panel izquierdo - Lista de vendedores */}
        <div className="w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Header del módulo con búsqueda y filtros */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <Suspense fallback={<LoadingSpinner />}>
              <TeamHeader 
                filters={filters}
                onFiltersChange={applyFilters}
                onRefresh={refreshTeam}
                totalMembers={totalMembers}
                activeMembers={activeMembers}
                inactiveMembers={inactiveMembers}
                onCreateAgent={() => setIsCreateModalOpen(true)}
                onSearchChange={handleSearchChange}
                isRefreshing={loading}
              />
            </Suspense>
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <TeamList 
              members={members}
              selectedMember={selectedMember}
              onSelectMember={selectMember}
              totalMembers={totalMembers}
              activeMembers={activeMembers}
              inactiveMembers={inactiveMembers}
              searchTerm={searchTerm}
            />
          </Suspense>
        </div>

        {/* Panel central - Detalles del miembro seleccionado */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          
          {selectedMember ? (
            <Suspense fallback={<LoadingSpinner />}>
              <TeamMemberDetails 
                member={selectedMember}
                onRefresh={refreshTeam}
              />
            </Suspense>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un miembro del equipo
                </h3>
                <p className="text-gray-600">
                  Haz clic en un miembro de la lista para ver sus detalles
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Panel derecho - Permisos y Coaching */}
        <div className="w-96 xl:w-[420px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {selectedMember ? (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <Suspense fallback={<LoadingSpinner />}>
                <PermissionsPanel member={selectedMember} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <CoachingPanel member={selectedMember} />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <SuggestedPlan member={selectedMember} />
              </Suspense>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm">
                  Permisos y coaching aparecerán aquí
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear nuevo agente */}
      <Suspense fallback={<LoadingSpinner />}>
        <CreateAgentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAgent}
        />
      </Suspense>
    </div>
  );
};

export default TeamModule; 