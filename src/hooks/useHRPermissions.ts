import { useState, useEffect, useMemo } from 'react';
import { HRRole, HRPermissions } from '../types/employee';
import { useAuthContext } from '../contexts/useAuthContext';

// Hook para manejar permisos específicos del módulo HR
export const useHRPermissions = () => {
  const { user, backendUser } = useAuthContext();
  const [hrRole, setHRRole] = useState<HRRole | null>(null);
  const [permissions, setPermissions] = useState<HRPermissions>({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false,
    canViewPayroll: false,
    canViewAttendance: false,
    canViewDocuments: false,
    canApproveVacations: false,
    scope: 'self'
  });

  // Extraer rol HR del token del usuario
  useEffect(() => {
    const extractHRRole = () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        // Decodificar JWT para obtener roles HR
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        const tokenData = JSON.parse(decodedPayload);

        const role: HRRole = {
          role: tokenData.role || 'EMPLOYEE',
          hrRole: tokenData.hrRole || 'HR_USER',
          employeeId: tokenData.employeeId
        };

        setHRRole(role);
        return role;
      } catch (error) {
        console.error('Error al extraer rol HR:', error);
        return null;
      }
    };

    const role = extractHRRole();
    if (role) {
      calculatePermissions(role);
    }
  }, [user, backendUser]);

  // Calcular permisos basados en el rol HR
  const calculatePermissions = (role: HRRole) => {
    let newPermissions: HRPermissions = {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canViewPayroll: false,
      canViewAttendance: false,
      canViewDocuments: false,
      canApproveVacations: false,
      scope: 'self'
    };

    switch (role.hrRole) {
      case 'HR_ADMIN':
        // HR_ADMIN tiene acceso completo
        newPermissions = {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          canViewPayroll: true,
          canViewAttendance: true,
          canViewDocuments: true,
          canApproveVacations: true,
          scope: 'all'
        };
        break;

      case 'HR_MANAGER':
        // HR_MANAGER tiene acceso limitado
        newPermissions = {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: false, // No puede eliminar empleados
          canViewPayroll: true,
          canViewAttendance: true,
          canViewDocuments: true,
          canApproveVacations: true,
          scope: 'department' // Solo su departamento
        };
        break;

      case 'HR_USER':
        // HR_USER tiene acceso básico
        newPermissions = {
          canCreate: false,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          canViewPayroll: false, // No puede ver nómina
          canViewAttendance: true,
          canViewDocuments: false, // No puede ver documentos confidenciales
          canApproveVacations: false,
          scope: 'department'
        };
        break;

      default:
        // EMPLOYEE solo puede ver sus propios datos
        if (role.role === 'EMPLOYEE') {
          newPermissions = {
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
            canViewPayroll: false,
            canViewAttendance: true,
            canViewDocuments: true, // Sus propios documentos
            canApproveVacations: false,
            scope: 'self'
          };
        }
        break;
    }

    setPermissions(newPermissions);
  };

  // Validar permiso específico
  const hasPermission = useMemo(() => {
    return (action: keyof Omit<HRPermissions, 'scope'>, targetEmployeeId?: string) => {
      if (!hrRole || !permissions[action]) {
        return false;
      }

      // Si el scope es 'self', solo puede acceder a sus propios datos
      if (permissions.scope === 'self') {
        return targetEmployeeId === hrRole.employeeId;
      }

      // Si el scope es 'department', necesitaríamos verificar el departamento
      // Por ahora, permitimos el acceso si no es 'self'
      if (permissions.scope === 'department') {
        return true; // TODO: Implementar verificación de departamento
      }

      // Si el scope es 'all', tiene acceso completo
      if (permissions.scope === 'all') {
        return true;
      }

      return false;
    };
  }, [hrRole, permissions]);

  // Verificar si puede acceder a un empleado específico
  const canAccessEmployee = useMemo(() => {
    return (employeeId: string) => {
      if (!hrRole) return false;

      switch (permissions.scope) {
        case 'all':
          return true;
        case 'department':
          // TODO: Implementar verificación de departamento
          return true;
        case 'self':
          return employeeId === hrRole.employeeId;
        default:
          return false;
      }
    };
  }, [hrRole, permissions]);

  // Obtener acciones permitidas para un empleado
  const getAllowedActions = useMemo(() => {
    return (employeeId?: string) => {
      const actions: string[] = [];

      if (hasPermission('canRead', employeeId)) actions.push('read');
      if (hasPermission('canUpdate', employeeId)) actions.push('update');
      if (hasPermission('canDelete', employeeId)) actions.push('delete');
      if (hasPermission('canViewPayroll', employeeId)) actions.push('viewPayroll');
      if (hasPermission('canViewAttendance', employeeId)) actions.push('viewAttendance');
      if (hasPermission('canViewDocuments', employeeId)) actions.push('viewDocuments');
      if (hasPermission('canApproveVacations', employeeId)) actions.push('approveVacations');

      return actions;
    };
  }, [hasPermission]);

  // Verificar si es administrador HR
  const isHRAdmin = useMemo(() => {
    return hrRole?.hrRole === 'HR_ADMIN';
  }, [hrRole]);

  // Verificar si es manager HR
  const isHRManager = useMemo(() => {
    return hrRole?.hrRole === 'HR_MANAGER';
  }, [hrRole]);

  // Verificar si es usuario HR básico
  const isHRUser = useMemo(() => {
    return hrRole?.hrRole === 'HR_USER';
  }, [hrRole]);

  // Verificar si es solo empleado
  const isEmployee = useMemo(() => {
    return hrRole?.role === 'EMPLOYEE';
  }, [hrRole]);

  // Obtener mensaje de error para acción no permitida
  const getPermissionErrorMessage = useMemo(() => {
    return (action: string) => {
      if (!hrRole) {
        return 'No tienes permisos para acceder al módulo de HR';
      }

      switch (action) {
        case 'create':
          return 'No tienes permisos para crear empleados';
        case 'update':
          return 'No tienes permisos para actualizar empleados';
        case 'delete':
          return 'No tienes permisos para eliminar empleados';
        case 'viewPayroll':
          return 'No tienes permisos para ver información de nómina';
        case 'viewDocuments':
          return 'No tienes permisos para ver documentos confidenciales';
        case 'approveVacations':
          return 'No tienes permisos para aprobar solicitudes de vacaciones';
        default:
          return 'No tienes permisos para realizar esta acción';
      }
    };
  }, [hrRole]);

  return {
    // Estado
    hrRole,
    permissions,
    
    // Verificaciones
    hasPermission,
    canAccessEmployee,
    getAllowedActions,
    
    // Roles específicos
    isHRAdmin,
    isHRManager,
    isHRUser,
    isEmployee,
    
    // Utilidades
    getPermissionErrorMessage,
    
    // Información del usuario actual
    currentEmployeeId: hrRole?.employeeId,
    currentRole: hrRole?.role,
    currentHRRole: hrRole?.hrRole
  };
};
