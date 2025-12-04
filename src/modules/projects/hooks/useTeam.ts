// Hook de gestión de equipo

import { useState, useCallback, useMemo } from 'react';
import { teamService } from '../services/teamService';
import type { 
  TeamMember, 
  EmployeeAvailability,
  EmployeeWorkload,
  TimeEntry 
} from '../types';

export const useTeam = (projectId: string) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [availability, setAvailability] = useState<EmployeeAvailability[]>([]);
  const [workload, setWorkload] = useState<EmployeeWorkload[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar miembros del equipo
  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedMembers = await teamService.getTeamMembers(projectId);
      setMembers(fetchedMembers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar equipo';
      setError(errorMessage);
      console.error('Error loading team:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Agregar miembro
  const addMember = useCallback(async (memberData: {
    employeeId: string;
    role: string;
    allocation?: number;
    hourlyRate?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const newMember = await teamService.addTeamMember(projectId, memberData);
      setMembers(prev => [...prev, newMember]);
      
      return newMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar miembro';
      setError(errorMessage);
      console.error('Error adding member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Actualizar miembro
  const updateMember = useCallback(async (
    memberId: string,
    updates: Partial<TeamMember>
  ) => {
    try {
      const updated = await teamService.updateTeamMember(projectId, memberId, updates);
      
      setMembers(prev => prev.map(m => m.id === memberId ? updated : m));
      
      return updated;
    } catch (err) {
      console.error('Error updating member:', err);
      throw err;
    }
  }, [projectId]);

  // Remover miembro
  const removeMember = useCallback(async (memberId: string) => {
    try {
      await teamService.removeTeamMember(projectId, memberId);
      
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  }, [projectId]);

  // Cargar disponibilidad
  const loadAvailability = useCallback(async (options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    try {
      const fetchedAvailability = await teamService.getTeamAvailability(projectId, options);
      setAvailability(fetchedAvailability);
    } catch (err) {
      console.error('Error loading availability:', err);
      throw err;
    }
  }, [projectId]);

  // Cargar carga de trabajo
  const loadWorkload = useCallback(async () => {
    try {
      const fetchedWorkload = await teamService.getTeamWorkload(projectId);
      setWorkload(fetchedWorkload);
    } catch (err) {
      console.error('Error loading workload:', err);
      throw err;
    }
  }, [projectId]);

  // Registrar tiempo
  const createTimeEntry = useCallback(async (entryData: Partial<TimeEntry>) => {
    try {
      const newEntry = await teamService.createTimeEntry(projectId, entryData);
      setTimeEntries(prev => [newEntry, ...prev]);
      
      return newEntry;
    } catch (err) {
      console.error('Error creating time entry:', err);
      throw err;
    }
  }, [projectId]);

  // Estadísticas del equipo
  const teamStats = useMemo(() => {
    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      totalHoursWorked: members.reduce((sum, m) => sum + m.hoursWorked, 0),
      avgUtilization: members.length > 0
        ? members.reduce((sum, m) => sum + m.allocation, 0) / members.length
        : 0,
      tasksInProgress: members.reduce((sum, m) => sum + m.tasksInProgress, 0),
      tasksCompleted: members.reduce((sum, m) => sum + m.tasksCompleted, 0),
    };
  }, [members]);

  return {
    // Estado
    members,
    availability,
    workload,
    timeEntries,
    loading,
    error,
    teamStats,
    
    // Acciones
    loadTeam,
    addMember,
    updateMember,
    removeMember,
    loadAvailability,
    loadWorkload,
    createTimeEntry,
  };
};

