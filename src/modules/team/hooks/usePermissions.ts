import { useState, useCallback } from 'react';
import type { TeamMember } from '../../../types/team';
import { teamService } from '../services/teamService';
import { logger } from '../../../utils/logger';

export const usePermissions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener permisos de un miembro
  const getMemberPermissions = useCallback((member: TeamMember) => {
    return member.permissions;
  }, []);

  // Verificar si un miembro tiene un permiso específico
  const hasPermission = useCallback((member: TeamMember, permissionName: string): boolean => {
    return member.permissions[permissionName as keyof typeof member.permissions] || false;
  }, []);

  // Verificar si un miembro tiene todos los permisos requeridos
  const hasAllPermissions = useCallback((member: TeamMember, permissionNames: string[]): boolean => {
    return permissionNames.every(name => hasPermission(member, name));
  }, [hasPermission]);

  // Verificar si un miembro tiene al menos uno de los permisos requeridos
  const hasAnyPermission = useCallback((member: TeamMember, permissionNames: string[]): boolean => {
    return permissionNames.some(name => hasPermission(member, name));
  }, [hasPermission]);

  // Obtener nivel de permiso más alto
  const getHighestPermissionLevel = useCallback((member: TeamMember): 'basic' | 'intermediate' | 'advanced' => {
    const permissions = member.permissions;
    
    if (permissions.configure) return 'advanced';
    if (permissions.approve) return 'intermediate';
    if (permissions.write) return 'basic';
    return 'basic';
  }, []);

  // Actualizar permisos de un miembro
  const updateMemberPermissions = useCallback(async (
    memberId: string, 
    permissions: any // Assuming permissions is an array of Permission objects
  ): Promise<TeamMember | null> => {
    try {
      setLoading(true);
      setError(null);

      const updatedMember = await teamService.updateMember(memberId, { permissions });
      
      logger.systemInfo('Member permissions updated', { 
        memberId, 
        permissions: permissions.map((p: any) => ({ name: p.name, isActive: p.isActive }))
      });
      
      return updatedMember;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar permisos';
      setError(errorMessage);
      logger.systemInfo('Error updating member permissions', { error: errorMessage, memberId });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Activar/desactivar un permiso específico
  const togglePermission = useCallback(async (
    memberId: string, 
    permissionName: string, 
    isActive: boolean
  ): Promise<TeamMember | null> => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el miembro actual
      const currentMember = await teamService.getMember(memberId);
      const updatedPermissions = { ...currentMember.permissions, [permissionName]: isActive };

      const updatedMember = await teamService.updateMember(memberId, { 
        permissions: updatedPermissions 
      });
      
      logger.systemInfo('Permission toggled', { 
        memberId, 
        permissionName, 
        isActive 
      });
      
      return updatedMember;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar permiso';
      setError(errorMessage);
      logger.systemInfo('Error toggling permission', { error: errorMessage, memberId, permissionName });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Asignar rol con permisos predefinidos
  const assignRoleWithPermissions = useCallback(async (
    memberId: string, 
    role: 'admin' | 'supervisor' | 'agent' | 'viewer'
  ): Promise<TeamMember | null> => {
    try {
      setLoading(true);
      setError(null);

      // Definir permisos por rol
      const rolePermissions: Record<string, any> = { // Assuming permissions is an array of Permission objects
        'executive': [
          { id: '1', name: 'read', displayName: 'Leer', description: 'Ver conversaciones y datos de clientes', level: 'advanced', isActive: true, icon: 'book' },
          { id: '2', name: 'write', displayName: 'Escribir', description: 'Enviar mensajes y responder a clientes', level: 'advanced', isActive: true, icon: 'pencil' }
        ],
        'supervisor': [
          { id: '1', name: 'read', displayName: 'Leer', description: 'Ver conversaciones y datos de clientes', level: 'advanced', isActive: true, icon: 'book' },
          { id: '2', name: 'write', displayName: 'Escribir', description: 'Enviar mensajes y responder a clientes', level: 'advanced', isActive: true, icon: 'pencil' },
          { id: '3', name: 'approve', displayName: 'Aprobar', description: 'Aprobar campañas y decisiones importantes', level: 'intermediate', isActive: true, icon: 'check' }
        ],
        'manager': [
          { id: '1', name: 'read', displayName: 'Leer', description: 'Ver conversaciones y datos de clientes', level: 'advanced', isActive: true, icon: 'book' },
          { id: '2', name: 'write', displayName: 'Escribir', description: 'Enviar mensajes y responder a clientes', level: 'advanced', isActive: true, icon: 'pencil' },
          { id: '3', name: 'approve', displayName: 'Aprobar', description: 'Aprobar campañas y decisiones importantes', level: 'intermediate', isActive: true, icon: 'check' },
          { id: '4', name: 'configure', displayName: 'Configurar', description: 'Acceso a configuración del sistema', level: 'basic', isActive: true, icon: 'gear' }
        ]
      };

      const permissions = rolePermissions[role] || rolePermissions['executive'];
      
      const updatedMember = await teamService.updateMember(memberId, { 
        role,
        permissions 
      });
      
      logger.systemInfo('Role assigned with permissions', { 
        memberId, 
        role, 
        permissionsCount: permissions.length 
      });
      
      return updatedMember;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al asignar rol';
      setError(errorMessage);
      logger.systemInfo('Error assigning role with permissions', { error: errorMessage, memberId, role });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estadísticas de permisos
  const getPermissionStats = useCallback((members: TeamMember[]) => {
    const stats = {
      totalMembers: members.length,
      membersWithReadPermission: 0,
      membersWithWritePermission: 0,
      membersWithApprovePermission: 0,
      membersWithConfigurePermission: 0,
      averagePermissionsPerMember: 0
    };

    let totalPermissions = 0;

    members.forEach(member => {
      const permissions = member.permissions;
      totalPermissions += Object.keys(permissions).length;

      if (hasPermission(member, 'read')) stats.membersWithReadPermission++;
      if (hasPermission(member, 'write')) stats.membersWithWritePermission++;
      if (hasPermission(member, 'approve')) stats.membersWithApprovePermission++;
      if (hasPermission(member, 'configure')) stats.membersWithConfigurePermission++;
    });

    stats.averagePermissionsPerMember = totalPermissions / members.length;

    return stats;
  }, [hasPermission]);

  return {
    // Estado
    loading,
    error,
    
    // Permisos
    getMemberPermissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    getHighestPermissionLevel,
    updateMemberPermissions,
    togglePermission,
    assignRoleWithPermissions,
    getPermissionStats
  };
}; 