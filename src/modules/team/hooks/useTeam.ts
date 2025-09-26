import { useState, useEffect, useCallback } from 'react';
import { useTeamStore } from '../../../stores/useTeamStore';
import type { TeamMember, TeamState, TeamFilters } from '../../../types/employee';
import type { CreateAgentRequest } from '../../../types/team';
import { logger } from '../../../utils/logger';

// Importar hooks especializados
import { useTeamMembers } from './useTeamMembers';
import { usePerformance } from './usePerformance';
import { usePermissions } from './usePermissions';
import { useCoaching } from './useCoaching';

export const useTeam = () => {
  const { 
    // Estado principal (alineado con backend)
    employees,
    selectedEmployee,
    loadEmployees,
    searchEmployees,
    getEmployeeDetails,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    loadStats,
    
    // Estado legacy (compatibilidad)
    teamData, 
    members,
    selectedMember,
    filters,
    loading: teamLoading, 
    error: teamError, 
    stats,
    pagination,
    setTeamData, 
    setMembers,
    setSelectedMember,
    setFilters,
    setLoading: setTeamLoading, 
    setError: setTeamError,
    refreshTeam,
    getFilteredMembers,
    calculateStats
  } = useTeamStore();

  // Hooks especializados
  const teamMembers = useTeamMembers();
  const performance = usePerformance();
  const permissions = usePermissions();
  const coaching = useCoaching();

  // Cargar miembros del equipo (usando el nuevo sistema) - OPTIMIZADO
  const loadMembers = useCallback(async () => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      // Convertir filtros legacy a filtros del backend
      const employeeFilters = {
        search: filters.search,
        department: filters.department,
        status: filters.status === 'all' ? undefined : filters.status as any,
        page: 1,
        limit: 50
      };
      
      await loadEmployees(employeeFilters);
      
      logger.systemInfo('Miembros del equipo cargados exitosamente', {
        total: stats.total,
        active: stats.active,
        inactive: stats.inactive
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar miembros del equipo';
      setTeamError(errorMessage);
      logger.systemInfo('Error cargando miembros del equipo', { error: errorMessage });
    }
  }, [filters.search, filters.department, filters.status, loadEmployees, setTeamLoading, setTeamError, stats, logger]);

  // Seleccionar miembro (compatible con ambos sistemas)
  const selectMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    
    // Si tenemos el empleado correspondiente, seleccionarlo también
    const correspondingEmployee = employees.find(emp => emp.id === member.id);
    if (correspondingEmployee) {
      // Actualizar selectedEmployee en el store
    }
    
    // Actualizar estado global legacy
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
  }, [teamData, setTeamData, employees]);

  // Refrescar equipo (usando el nuevo sistema)
  const refreshTeamData = useCallback(async () => {
    try {
      logger.systemInfo('Iniciando refresh del equipo...');
      await loadMembers();
      await loadStats();
      logger.systemInfo('Refresh del equipo completado exitosamente');
    } catch (error) {
      logger.systemInfo('Error durante refresh del equipo', { error });
    }
  }, [loadMembers, loadStats]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: Partial<TeamFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    logger.systemInfo('Filtros de equipo aplicados', { filters: updatedFilters });
  }, [filters, setFilters]);

  // ✅ CREAR AGENTE - Usando teamService (NO employeeService)
  const createAgent = useCallback(async (agentData: CreateAgentRequest): Promise<TeamMember | null> => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      logger.systemInfo('Creando nuevo agente', { 
        name: agentData.name, 
        email: agentData.email, 
        role: agentData.role 
      });
      
      // ✅ CORRECTO: Usar teamService para agentes (NO employeeService)
      const { teamService } = await import('../../team/services/teamService');
      const newAgent = await teamService.createAgent(agentData);
      
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
  }, [setTeamLoading, setTeamError]);

  // Eliminar agente
  const deleteAgent = useCallback(async (agentId: string): Promise<void> => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      logger.systemInfo('Eliminando agente', { agentId });
      
      // ✅ CORRECTO: Usar teamService para eliminar agente
      const { teamService } = await import('../../team/services/teamService');
      await teamService.deleteAgent(agentId);
      
      logger.systemInfo('Agente eliminado exitosamente', { agentId });
      
      // Recargar la lista de agentes
      await loadMembers();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar agente';
      setTeamError(errorMessage);
      logger.systemInfo('Error eliminando agente', { error: errorMessage });
      throw error;
    } finally {
      setTeamLoading(false);
    }
  }, [setTeamLoading, setTeamError, loadMembers]);

  // Cargar datos iniciales con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadMembers();
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [filters.search, filters.department, filters.status]);

  return {
    // Estado principal (nuevo)
    employees,
    selectedEmployee,
    pagination,
    
    // Estado legacy (compatibilidad)
    members,
    selectedMember,
    filters,
    loading: teamLoading,
    error: teamError,
    totalMembers: stats.total,
    activeMembers: stats.active,
    inactiveMembers: stats.inactive,
    stats,
    
    // Acciones principales (nuevas)
    loadEmployees,
    searchEmployees,
    getEmployeeDetails,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    loadStats,
    
    // Acciones legacy (compatibilidad)
    selectMember,
    refreshTeam: refreshTeamData,
    applyFilters,
    loadMembers,
    createAgent,
    deleteAgent,
    getFilteredMembers,
    
    // Hooks especializados
    teamMembers,
    performance,
    permissions,
    coaching
  };
}; 