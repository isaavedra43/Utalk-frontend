import { useState, useEffect, useCallback } from 'react';
import { useTeamStore } from '../../../stores/useTeamStore';
import type { TeamMember, TeamState, TeamFilters } from '../../../types/team';
import { teamService } from '../services/teamService';
import { performanceService } from '../services/teamPerformanceService';
import { logger } from '../../../utils/logger';

// Importar hooks especializados
import { useTeamMembers } from './useTeamMembers';
import { usePerformance } from './usePerformance';
import { usePermissions } from './usePermissions';
import { useCoaching } from './useCoaching';

export const useTeam = () => {
  const { teamData, loading: teamLoading, error: teamError, setTeamData, setLoading: setTeamLoading, setError: setTeamError } = useTeamStore();
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filters, setFilters] = useState<TeamFilters>({
    search: '',
    status: 'all'
  });

  // Hooks especializados
  const teamMembers = useTeamMembers();
  const performance = usePerformance();
  const permissions = usePermissions();
  const coaching = useCoaching();

  // Cargar miembros del equipo
  const loadMembers = useCallback(async () => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      const response = await teamService.getMembers(filters);
      setMembers(response.members);
      
      // Actualizar estado global
      const teamState: TeamState = {
        members: response.members,
        selectedMember: selectedMember,
        filters,
        loading: false,
        error: null,
        totalMembers: response.members.length,
        activeMembers: response.members.filter(m => m.status === 'active').length,
        inactiveMembers: response.members.filter(m => m.status === 'inactive').length
      };
      
      setTeamData(teamState);
      
      logger.systemInfo('Team members loaded', {
        total: response.members.length,
        active: teamState.activeMembers,
        inactive: teamState.inactiveMembers
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el equipo';
      setTeamError(errorMessage);
      logger.systemInfo('Error loading team members', { error: errorMessage });
    } finally {
      setTeamLoading(false);
    }
  }, [filters, selectedMember, setTeamData, setTeamLoading, setTeamError]);

  // Seleccionar miembro
  const selectMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    
    // Actualizar estado global
    if (teamData) {
      setTeamData({
        ...teamData,
        selectedMember: member
      });
    }
    
    logger.systemInfo('Team member selected', {
      memberId: member.id,
      memberName: member.fullName
    });
  }, [teamData, setTeamData]);

  // Refrescar equipo
  const refreshTeam = useCallback(() => {
    loadMembers();
  }, [loadMembers]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: Partial<TeamFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    logger.systemInfo('Team filters applied', { filters: updatedFilters });
  }, [filters]);

  // Cargar datos iniciales
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Calcular estadísticas
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;

  return {
    // Estado
    members,
    selectedMember,
    filters,
    loading: teamLoading,
    error: teamError,
    totalMembers,
    activeMembers,
    inactiveMembers,
    
    // Acciones básicas
    selectMember,
    refreshTeam,
    applyFilters,
    loadMembers,
    
    // Hooks especializados
    teamMembers,
    performance,
    permissions,
    coaching,
    
    // Servicios
    teamService,
    performanceService
  };
}; 