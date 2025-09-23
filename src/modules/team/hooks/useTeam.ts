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

  // Crear nuevo empleado/agente (usando el nuevo sistema)
  const createAgent = useCallback(async (agentData: CreateAgentRequest): Promise<TeamMember | null> => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      logger.systemInfo('Creando nuevo agente', { 
        name: agentData.name, 
        email: agentData.email, 
        role: agentData.role 
      });
      
      // Convertir datos de agente a formato de empleado del backend
      const employeeData = {
        personalInfo: {
          firstName: agentData.name.split(' ')[0] || agentData.name,
          lastName: agentData.name.split(' ').slice(1).join(' ') || '',
          email: agentData.email,
          phone: agentData.phone || '',
          dateOfBirth: '1990-01-01',
          gender: 'M' as const,
          maritalStatus: 'soltero',
          nationality: 'Mexicana',
          rfc: '',
          curp: '',
          address: {
            street: '',
            city: 'Ciudad de México',
            state: 'CDMX',
            country: 'México',
            postalCode: '01000'
          }
        },
        position: {
          title: agentData.role || 'Agente',
          department: 'Atención al Cliente',
          level: 'Junior' as const,
          jobDescription: 'Atención al cliente y soporte',
          startDate: new Date().toISOString().split('T')[0]
        },
        location: {
          office: 'Oficina Central',
          address: 'Av. Reforma 123',
          city: 'Ciudad de México',
          state: 'CDMX',
          country: 'México',
          postalCode: '06600',
          timezone: 'America/Mexico_City'
        },
        contract: {
          type: 'permanent' as const,
          startDate: new Date().toISOString().split('T')[0],
          salary: 25000,
          currency: 'MXN',
          workingDays: 'Lunes a Viernes',
          workingHoursRange: '09:00-18:00',
          benefits: ['seguro médico']
        }
      };
      
      // Crear empleado usando el nuevo servicio
      const newEmployee = await createEmployee(employeeData);
      
      if (newEmployee) {
        logger.systemInfo('Agente creado exitosamente', { 
          id: newEmployee.id,
          name: `${newEmployee.personalInfo.firstName} ${newEmployee.personalInfo.lastName}`,
          email: newEmployee.personalInfo.email 
        });
        
        // Convertir a TeamMember para compatibilidad
        const newTeamMember: TeamMember = {
          ...newEmployee,
          name: `${newEmployee.personalInfo.firstName} ${newEmployee.personalInfo.lastName}`,
          role: newEmployee.position.title,
          permissions: [],
          skills: [],
          experience: 0,
          hireDate: newEmployee.position.startDate,
          lastLogin: '',
          performance: {
            rating: 0,
            completedTasks: 0,
            averageResponseTime: 0,
            customerSatisfaction: 0,
            totalConversations: 0,
            resolvedIssues: 0,
            escalations: 0,
            responseTime: { average: 0, median: 0, percentile95: 0 },
            availability: { online: 0, busy: 0, away: 0, offline: 0 },
            trends: []
          },
          workload: {
            activeChats: 0,
            dailyLimit: 0,
            utilization: 0
          },
          schedule: {
            timezone: newEmployee.location.timezone,
            workingHours: {
              start: newEmployee.contract.workingHoursRange.split('-')[0].trim(),
              end: newEmployee.contract.workingHoursRange.split('-')[1].trim()
            },
            workingDays: newEmployee.contract.workingDays.split(',').map(d => d.trim())
          }
        };
        
        return newTeamMember;
      }
      
      return null;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear agente';
      setTeamError(errorMessage);
      logger.systemInfo('Error creando agente', { error: errorMessage });
      throw error;
    }
  }, [createEmployee, setTeamLoading, setTeamError]);

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
    getFilteredMembers,
    
    // Hooks especializados
    teamMembers,
    performance,
    permissions,
    coaching
  };
}; 