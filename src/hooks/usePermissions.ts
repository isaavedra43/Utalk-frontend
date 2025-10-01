import { useState, useEffect, useCallback } from 'react';
import {
  requestCameraPermission,
  requestMicrophonePermission,
  requestLocationPermission,
  requestNotificationPermission,
  checkAllPermissions,
  type PermissionStatus,
  type PermissionResult
} from '../services/permissions';

export interface PermissionsState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
  location: PermissionStatus;
  notifications: PermissionStatus;
  loading: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionsState>({
    camera: 'prompt',
    microphone: 'prompt',
    location: 'prompt',
    notifications: 'prompt',
    loading: true
  });

  // Verificar permisos al montar
  useEffect(() => {
    const checkPerms = async () => {
      const perms = await checkAllPermissions();
      setPermissions({
        ...perms,
        loading: false
      });
    };

    checkPerms();
  }, []);

  // Solicitar permiso de cámara
  const requestCamera = useCallback(async (): Promise<PermissionResult> => {
    const result = await requestCameraPermission();
    if (result.status !== 'not-supported') {
      setPermissions(prev => ({ ...prev, camera: result.status }));
    }
    return result;
  }, []);

  // Solicitar permiso de micrófono
  const requestMicrophone = useCallback(async (): Promise<PermissionResult> => {
    const result = await requestMicrophonePermission();
    if (result.status !== 'not-supported') {
      setPermissions(prev => ({ ...prev, microphone: result.status }));
    }
    return result;
  }, []);

  // Solicitar permiso de ubicación
  const requestLocation = useCallback(async (): Promise<PermissionResult> => {
    const result = await requestLocationPermission();
    if (result.status !== 'not-supported') {
      setPermissions(prev => ({ ...prev, location: result.status }));
    }
    return result;
  }, []);

  // Solicitar permiso de notificaciones
  const requestNotifications = useCallback(async (): Promise<PermissionResult> => {
    const result = await requestNotificationPermission();
    if (result.status !== 'not-supported') {
      setPermissions(prev => ({ ...prev, notifications: result.status }));
    }
    return result;
  }, []);

  // Solicitar todos los permisos
  const requestAll = useCallback(async () => {
    const results = await Promise.all([
      requestCamera(),
      requestMicrophone(),
      requestLocation(),
      requestNotifications()
    ]);

    return {
      camera: results[0],
      microphone: results[1],
      location: results[2],
      notifications: results[3]
    };
  }, [requestCamera, requestMicrophone, requestLocation, requestNotifications]);

  // Refrescar estado de permisos
  const refresh = useCallback(async () => {
    setPermissions(prev => ({ ...prev, loading: true }));
    const perms = await checkAllPermissions();
    setPermissions({
      ...perms,
      loading: false
    });
  }, []);

  return {
    permissions,
    requestCamera,
    requestMicrophone,
    requestLocation,
    requestNotifications,
    requestAll,
    refresh
  };
};

