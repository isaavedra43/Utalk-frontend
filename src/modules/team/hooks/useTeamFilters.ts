import { useMemo, useCallback } from 'react';
import type { TeamMember, TeamFilters } from '../../../types/team';

export const useTeamFilters = (members: TeamMember[], filters: TeamFilters) => {
  // Filtrar miembros por búsqueda
  const filterBySearch = useCallback((members: TeamMember[], searchTerm: string): TeamMember[] => {
    if (!searchTerm.trim()) return members;
    
    const term = searchTerm.toLowerCase();
    return members.filter(member => 
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      (member.fullName && member.fullName.toLowerCase().includes(term)) ||
      member.role.toLowerCase().includes(term)
    );
  }, []);

  // Memoizar miembros filtrados
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Filtro por búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          (member.fullName && member.fullName.toLowerCase().includes(searchLower)) ||
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
    const membersWithMetrics = members.filter(m => m.performanceMetrics);
    const avgCSAT = membersWithMetrics.length > 0 
      ? membersWithMetrics.reduce((sum, m) => sum + m.performanceMetrics!.csatScore, 0) / membersWithMetrics.length 
      : 0;
    const avgConversion = membersWithMetrics.length > 0 
      ? membersWithMetrics.reduce((sum, m) => sum + m.performanceMetrics!.conversionRate, 0) / membersWithMetrics.length 
      : 0;
    const totalChats = membersWithMetrics.reduce((sum, m) => sum + m.performanceMetrics!.chatsAttended, 0);

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
    const membersWithMetrics = members.filter(m => m.performanceMetrics);
    return [...membersWithMetrics]
      .sort((a, b) => b.performanceMetrics!.csatScore - a.performanceMetrics!.csatScore)
      .slice(0, 5);
  }, [members]);

  // Memoizar miembros que necesitan atención
  const membersNeedingAttention = useMemo(() => {
    return members.filter(member => 
      (member.performanceMetrics && member.performanceMetrics.csatScore < 4.0) ||
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