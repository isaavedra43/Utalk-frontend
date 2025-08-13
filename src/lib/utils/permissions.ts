/**
 * Sistema de Validación de Permisos para UTalk
 * Basado en los roles y permisos del backend
 */

import { authStore } from '$lib/stores/auth.store';
import { logStore } from '$lib/utils/logger';
import { get } from 'svelte/store';

// Tipos de permisos según el backend
export type Permission =
  | 'read_conversations'
  | 'write_messages'
  | 'assign_conversations'
  | 'manage_users'
  | 'view_stats'
  | 'edit_contacts'
  | 'delete_messages'
  | 'manage_files';

// Roles según el backend
export type UserRole = 'admin' | 'agent' | 'viewer';

// Mapeo de roles a permisos por defecto
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'read_conversations',
    'write_messages',
    'assign_conversations',
    'manage_users',
    'view_stats',
    'edit_contacts',
    'delete_messages',
    'manage_files'
  ],
  agent: [
    'read_conversations',
    'write_messages',
    'assign_conversations',
    'view_stats',
    'edit_contacts'
  ],
  viewer: ['read_conversations', 'view_stats']
};

class PermissionManager {
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission(permission: Permission): boolean {
    const auth = get(authStore);

    if (!auth.isAuthenticated || !auth.user) {
      logStore('permissions: usuario no autenticado', { permission });
      return false;
    }

    const userPermissions = auth.user.permissions || [];
    const rolePermissions = ROLE_PERMISSIONS[auth.user.role] || [];

    const hasPermission =
      userPermissions.includes(permission) || rolePermissions.includes(permission);

    logStore('permissions: verificación', {
      permission,
      userId: auth.user.id,
      userRole: auth.user.role,
      userPermissions,
      rolePermissions,
      hasPermission
    });

    return hasPermission;
  }

  /**
   * Verifica si el usuario puede enviar mensajes
   */
  canSendMessages(conversationId?: string, assignedTo?: string | null): boolean {
    const auth = get(authStore);

    if (!auth.isAuthenticated || !auth.user) {
      logStore('permissions: no puede enviar mensajes - no autenticado');
      return false;
    }

    // Verificar permiso de escritura
    if (!this.hasPermission('write_messages')) {
      logStore('permissions: no puede enviar mensajes - sin permiso write_messages');
      return false;
    }

    // Si se especifica una conversación, verificar que tenga agente asignado
    if (conversationId && assignedTo === null) {
      logStore('permissions: no puede enviar mensajes - conversación sin agente asignado', {
        conversationId,
        assignedTo
      });
      return false;
    }

    logStore('permissions: puede enviar mensajes', {
      userId: auth.user.id,
      userRole: auth.user.role,
      conversationId,
      assignedTo
    });

    return true;
  }

  /**
   * Verifica si el usuario puede asignar conversaciones
   */
  canAssignConversations(): boolean {
    const hasPermission = this.hasPermission('assign_conversations');

    logStore('permissions: asignar conversaciones', {
      hasPermission,
      userId: get(authStore).user?.id
    });

    return hasPermission;
  }

  /**
   * Verifica si el usuario puede editar contactos
   */
  canEditContacts(): boolean {
    const hasPermission = this.hasPermission('edit_contacts');

    logStore('permissions: editar contactos', {
      hasPermission,
      userId: get(authStore).user?.id
    });

    return hasPermission;
  }

  /**
   * Verifica si el usuario puede eliminar mensajes
   */
  canDeleteMessages(): boolean {
    const hasPermission = this.hasPermission('delete_messages');

    logStore('permissions: eliminar mensajes', {
      hasPermission,
      userId: get(authStore).user?.id
    });

    return hasPermission;
  }

  /**
   * Verifica si el usuario puede gestionar archivos
   */
  canManageFiles(): boolean {
    const hasPermission = this.hasPermission('manage_files');

    logStore('permissions: gestionar archivos', {
      hasPermission,
      userId: get(authStore).user?.id
    });

    return hasPermission;
  }

  /**
   * Verifica si el usuario puede ver estadísticas
   */
  canViewStats(): boolean {
    const hasPermission = this.hasPermission('view_stats');

    logStore('permissions: ver estadísticas', {
      hasPermission,
      userId: get(authStore).user?.id
    });

    return hasPermission;
  }

  /**
   * Verifica si el usuario puede gestionar usuarios
   */
  canManageUsers(): boolean {
    const hasPermission = this.hasPermission('manage_users');

    logStore('permissions: gestionar usuarios', {
      hasPermission,
      userId: get(authStore).user?.id
    });

    return hasPermission;
  }

  /**
   * Obtiene todos los permisos del usuario actual
   */
  getUserPermissions(): Permission[] {
    const auth = get(authStore);

    if (!auth.isAuthenticated || !auth.user) {
      return [];
    }

    const userPermissions = (auth.user.permissions || []) as Permission[];
    const rolePermissions = ROLE_PERMISSIONS[auth.user.role] || [];

    // Combinar permisos únicos
    const allPermissions = [...new Set([...userPermissions, ...rolePermissions])] as Permission[];

    logStore('permissions: permisos del usuario', {
      userId: auth.user.id,
      userRole: auth.user.role,
      userPermissions,
      rolePermissions,
      allPermissions
    });

    return allPermissions;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    const auth = get(authStore);
    return auth.isAuthenticated && auth.user?.role === 'admin';
  }

  /**
   * Verifica si el usuario es agente
   */
  isAgent(): boolean {
    const auth = get(authStore);
    return auth.isAuthenticated && auth.user?.role === 'agent';
  }

  /**
   * Verifica si el usuario es viewer
   */
  isViewer(): boolean {
    const auth = get(authStore);
    return auth.isAuthenticated && auth.user?.role === 'viewer';
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getUserRole(): UserRole | null {
    const auth = get(authStore);
    return auth.isAuthenticated ? auth.user?.role || null : null;
  }

  /**
   * Valida si una acción está permitida y registra el intento
   */
  validateAction(
    action: string,
    requiredPermission: Permission,
    context?: Record<string, unknown>
  ): boolean {
    const hasPermission = this.hasPermission(requiredPermission);

    logStore('permissions: validación de acción', {
      action,
      requiredPermission,
      hasPermission,
      context,
      userId: get(authStore).user?.id
    });

    return hasPermission;
  }
}

// Instancia global del gestor de permisos
export const permissionManager = new PermissionManager();

// Funciones de conveniencia para uso directo en componentes
export const hasPermission = (permission: Permission): boolean =>
  permissionManager.hasPermission(permission);

export const canSendMessages = (conversationId?: string, assignedTo?: string | null): boolean =>
  permissionManager.canSendMessages(conversationId, assignedTo);

export const canAssignConversations = (): boolean => permissionManager.canAssignConversations();

export const canEditContacts = (): boolean => permissionManager.canEditContacts();

export const canDeleteMessages = (): boolean => permissionManager.canDeleteMessages();

export const canManageFiles = (): boolean => permissionManager.canManageFiles();

export const canViewStats = (): boolean => permissionManager.canViewStats();

export const canManageUsers = (): boolean => permissionManager.canManageUsers();

export const isAdmin = (): boolean => permissionManager.isAdmin();

export const isAgent = (): boolean => permissionManager.isAgent();

export const isViewer = (): boolean => permissionManager.isViewer();

export const getUserRole = (): UserRole | null => permissionManager.getUserRole();

export const getUserPermissions = (): Permission[] => permissionManager.getUserPermissions();

export const validateAction = (
  action: string,
  requiredPermission: Permission,
  context?: Record<string, unknown>
): boolean => permissionManager.validateAction(action, requiredPermission, context);
