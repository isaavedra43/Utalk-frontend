import { useMemo, useCallback } from 'react';
import type { TeamMember, TeamFilters } from '../../../types/team';

export const useTeamFilters = (members: TeamMember[], filters: TeamFilters) => {
  // Memoizar miembros filtrados
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          member.fullName.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.role.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por estado
      if (filters.status && filters.status !== 'all') {
        if (member.status !== filters.status) return false;
      }

      // Filtro por rol
      if (filters.role && filters.role !== 'all') {
        if (member.role !== filters.role) return false;
      }

      return true;
    });
  }, [members, filters]);

  // Memoizar estadísticas del equipo
  const teamStats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const inactiveMembers = members.filter(m => m.status === 'inactive').length;
    
    // Calcular métricas de rendimiento promedio
    const avgCSAT = members.reduce((sum, m) => sum + m.performanceMetrics.csatScore, 0) / totalMembers;
    const avgConversion = members.reduce((sum, m) => sum + m.performanceMetrics.conversionRate, 0) / totalMembers;
    const totalChats = members.reduce((sum, m) => sum + m.performanceMetrics.chatsAttended, 0);

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      avgCSAT: Math.round(avgCSAT * 10) / 10,
      avgConversion: Math.round(avgConversion * 10) / 10,
      totalChats
    };
  }, [members]);

  // Memoizar top performers
  const topPerformers = useMemo(() => {
    return [...members]
      .sort((a, b) => b.performanceMetrics.csatScore - a.performanceMetrics.csatScore)
      .slice(0, 5);
  }, [members]);

  // Memoizar miembros que necesitan atención
  const membersNeedingAttention = useMemo(() => {
    return members.filter(member => 
      member.performanceMetrics.csatScore < 4.0 ||
      member.status === 'inactive' ||
      (member.coachingPlan && member.coachingPlan.tasks.some(task => task.status === 'pending'))
    );
  }, [members]);

  // Callback memoizado para seleccionar miembro
  const selectMember = useCallback((member: TeamMember) => {
    // Esta función será pasada desde el componente padre
    return member;
  }, []);

  return {
    filteredMembers,
    teamStats,
    topPerformers,
    membersNeedingAttention,
    selectMember
  };
}; 