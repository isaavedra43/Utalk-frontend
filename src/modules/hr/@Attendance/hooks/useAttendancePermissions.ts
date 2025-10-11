// ============================================================================
// HOOK PARA PERMISOS DE ASISTENCIA
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { AttendancePermissions } from '../types';
import { attendanceService } from '../attendanceService';

export const useAttendancePermissions = () => {
  const [permissions, setPermissions] = useState<AttendancePermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userPermissions = await attendanceService.getUserPermissions();
      setPermissions(userPermissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando permisos');
      console.error('Error loading attendance permissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Funciones de conveniencia para verificar permisos específicos
  const canCreate = permissions?.canCreate ?? false;
  const canEdit = permissions?.canEdit ?? false;
  const canApprove = permissions?.canApprove ?? false;
  const canReject = permissions?.canReject ?? false;
  const canDelete = permissions?.canDelete ?? false;
  const canView = permissions?.canView ?? true; // Por defecto true
  const isAdmin = permissions?.isAdmin ?? false;

  return {
    permissions,
    loading,
    error,
    loadPermissions,
    // Permisos específicos
    canCreate,
    canEdit,
    canApprove,
    canReject,
    canDelete,
    canView,
    isAdmin
  };
};
