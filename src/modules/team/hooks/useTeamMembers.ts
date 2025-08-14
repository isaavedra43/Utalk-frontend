import { useState, useCallback } from 'react';
import { useAppStore } from '../../../stores/useAppStore';
import type { TeamMember, TeamFilters, TeamListResponse } from '../../../types/team';
import { teamService } from '../services/teamService';
import { logger } from '../../../utils/logger';

export const useTeamMembers = () => {
  const { teamData, setTeamData, setTeamLoading, setTeamError } = useAppStore();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [filters, setFilters] = useState<TeamFilters>({
    search: '',
    status: 'all',
    role: undefined,
    permissions: undefined
  });

  // Obtener miembros con filtros
  const getMembers = useCallback(async (filters?: TeamFilters) => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      const response: TeamListResponse = await teamService.getMembers(filters || {});
      const members = response.members;
      
      setTeamData({
        ...teamData,
        members,
        totalMembers: response.pagination.total,
        activeMembers: members.filter((m: TeamMember) => m.status === 'active').length,
        inactiveMembers: members.filter((m: TeamMember) => m.status === 'inactive').length,
        selectedMember: teamData?.selectedMember || null,
        filters: teamData?.filters || { search: '', status: 'all' },
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTeamError(errorMessage);
      logger.systemInfo('Error en getMembers:', { error: errorMessage });
    } finally {
      setTeamLoading(false);
    }
  }, [teamData, setTeamData, setTeamLoading, setTeamError]);

  // Obtener un miembro específico
  const getMember = useCallback(async (id: string) => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      const member = await teamService.getMember(id);
      setSelectedMember(member);
      return member;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTeamError(errorMessage);
      logger.systemInfo('Error en getMember:', { error: errorMessage });
      return null;
    } finally {
      setTeamLoading(false);
    }
  }, [setTeamLoading, setTeamError]);

  // Actualizar miembro
  const updateMember = useCallback(async (id: string, updates: Partial<TeamMember>) => {
    try {
      setTeamLoading(true);
      setTeamError(null);
      
      const updatedMember = await teamService.updateMember(id, updates);
      
      // Actualizar el miembro seleccionado si es el mismo
      if (selectedMember?.id === id) {
        setSelectedMember(updatedMember);
      }
      
      // Actualizar la lista de miembros
      await getMembers(filters);
      return updatedMember;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setTeamError(errorMessage);
      logger.systemInfo('Error en updateMember:', { error: errorMessage });
      return null;
    } finally {
      setTeamLoading(false);
    }
  }, [selectedMember, filters, getMembers, setTeamLoading, setTeamError]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: Partial<TeamFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    getMembers(updatedFilters);
  }, [filters, getMembers]);

  // Seleccionar miembro
  const selectMember = useCallback((member: TeamMember | null) => {
    setSelectedMember(member);
  }, []);

  return {
    // Estado
    members: teamData?.members || [],
    selectedMember,
    filters,
    totalMembers: teamData?.totalMembers || 0,
    activeMembers: teamData?.activeMembers || 0,
    inactiveMembers: teamData?.inactiveMembers || 0,
    
    // Acciones
    getMembers,
    getMember,
    updateMember,
    applyFilters,
    selectMember,
    setFilters
  };
}; 