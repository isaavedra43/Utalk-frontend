import { useState, useEffect, useCallback } from 'react';
import { useTeamStore } from '../../../stores/useTeamStore';
import type { TeamMember, TeamState, TeamFilters, CreateAgentRequest } from '../../../types/team';
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

  // Cargar agentes del equipo - ACTUALIZADO
  const loadMembers = useCallback(async () => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      // Usar el nuevo método getAgents
      const response = await teamService.getAgents(filters);
      setMembers(response.agents);
      
      // Actualizar estado global con la nueva estructura
      const teamState: TeamState = {
        members: response.agents,
        selectedMember: selectedMember,
        filters,
        loading: false,
        error: null,
        totalMembers: response.summary.total,
        activeMembers: response.summary.active,
        inactiveMembers: response.summary.inactive
      };
      
      setTeamData(teamState);
      
      logger.systemInfo('Agentes cargados exitosamente', {
        total: response.summary.total,
        active: response.summary.active,
        inactive: response.summary.inactive,
        pagination: response.pagination
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar agentes';
      setTeamError(errorMessage);
      logger.systemInfo('Error cargando agentes', { error: errorMessage });
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
    
    logger.systemInfo('Miembro del equipo seleccionado', {
      memberId: member.id,
      memberName: member.name
    });
  }, [teamData, setTeamData]);

  // Refrescar equipo
  const refreshTeam = useCallback(async () => {
    try {
      logger.systemInfo('Iniciando refresh del equipo...');
      await loadMembers();
      logger.systemInfo('Refresh del equipo completado exitosamente');
    } catch (error) {
      logger.systemInfo('Error durante refresh del equipo', { error });
    }
  }, [loadMembers]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: Partial<TeamFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    logger.systemInfo('Filtros de equipo aplicados', { filters: updatedFilters });
  }, [filters]);

  // Crear nuevo agente - NUEVO
  const createAgent = useCallback(async (agentData: CreateAgentRequest): Promise<TeamMember> => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      logger.systemInfo('Creando nuevo agente', { 
        name: agentData.name, 
        email: agentData.email, 
        role: agentData.role 
      });
      
      // Crear agente usando el servicio
      const newAgent = await teamService.createAgent(agentData);
      
      // Agregar a la lista local
      setMembers(prevMembers => [newAgent, ...prevMembers]);
      
      // Actualizar estado global
      if (teamData) {
        const updatedMembers = [newAgent, ...teamData.members];
        const newTeamState: TeamState = {
          ...teamData,
          members: updatedMembers,
          totalMembers: updatedMembers.length,
          activeMembers: updatedMembers.filter(m => m.isActive).length,
          inactiveMembers: updatedMembers.filter(m => !m.isActive).length
        };
        setTeamData(newTeamState);
      }
      
      logger.systemInfo('Agente creado exitosamente', { 
        id: newAgent.id,
        name: newAgent.name,
        email: newAgent.email 
      });
      
      return newAgent;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear agente';
      setTeamError(errorMessage);
      logger.systemInfo('Error creando agente', { error: errorMessage });
      throw error;
    } finally {
      setTeamLoading(false);
    }
  }, [teamData, setTeamData, setTeamLoading, setTeamError]);

  // Cargar datos iniciales
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Calcular estadísticas - ACTUALIZADO
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.isActive).length;
  const inactiveMembers = members.filter(m => !m.isActive).length;

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
    createAgent, // NUEVO
    
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