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
    updateWithAgentData,
    
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
      
      // ✅ CORRECTO: Usar teamService para cargar agentes, NO empleados
      const { teamService } = await import('../../team/services/teamService');
      
      // Convertir filtros legacy a filtros del backend de agentes
      const agentFilters = {
        search: filters.search,
        status: filters.status === 'all' ? undefined : filters.status as any,
        role: filters.department, // Mapear department a role para agentes
        page: 1,
        limit: 50
      };
      
      const response = await teamService.getAgents(agentFilters);
      
      // ✅ CORRECTO: Convertir agentes a formato compatible con el store
      // Los agentes NO tienen salarios, son usuarios del sistema
      const employeesData = response.agents.map(agent => ({
        id: agent.id,
        personalInfo: {
          firstName: agent.name.split(' ')[0] || agent.name,
          lastName: agent.name.split(' ').slice(1).join(' ') || '',
          email: agent.email,
          phone: agent.phone || '',
          avatar: agent.avatar
        },
        position: {
          title: agent.role,
          department: 'Equipo'
        },
        status: agent.isActive ? 'active' : 'inactive',
        performance: agent.performance,
        permissions: agent.permissions,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        // ✅ CAMPOS REQUERIDOS PARA EVITAR ERRORES
        contract: {
          type: 'agent', // Los agentes no son empleados con contrato
          startDate: agent.createdAt || new Date().toISOString(),
          endDate: null,
          salary: 0, // Los agentes no tienen salario
          currency: 'MXN',
          workingDays: 'Lunes a Viernes',
          workingHoursRange: '09:00-18:00'
        },
        salary: {
          baseSalary: 0, // Los agentes no tienen salario
          currency: 'MXN',
          frequency: 'monthly',
          paymentMethod: 'none'
        },
        sbc: 0, // Los agentes no tienen SBC
        vacationBalance: 0,
        sickLeaveBalance: 0,
        metrics: {
          punctuality: 100,
          performance: agent.performance?.csat || 0,
          productivity: 0
        },
        // ✅ CAMPOS DE CONFIGURACIÓN REQUERIDOS
        settings: {
          notifications: true,
          language: 'es',
          timezone: 'America/Mexico_City' // ← Campo que faltaba
        },
        configuration: {
          language: 'es',
          timezone: 'America/Mexico_City',
          theme: 'light',
          autoLogout: true,
          twoFactor: false
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          desktop: true
        }
      }));
      
      // ✅ CORRECTO: Usar la función específica para actualizar con datos de agentes
      updateWithAgentData({
        employees: employeesData,
        pagination: response.pagination,
        summary: response.summary
      });
      
      logger.systemInfo('Agentes del equipo cargados exitosamente', {
        total: response.summary.total,
        active: response.summary.active,
        inactive: response.summary.inactive,
        agentsCount: response.agents.length
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar agentes del equipo';
      setTeamError(errorMessage);
      logger.systemInfo('Error cargando agentes del equipo', { error: errorMessage });
    }
  }, [filters.search, filters.department, filters.status, setTeamLoading, setTeamError]);

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
      
      // ✅ ACTUALIZAR LA LISTA DE AGENTES DESPUÉS DE CREAR
      await loadMembers();
      
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