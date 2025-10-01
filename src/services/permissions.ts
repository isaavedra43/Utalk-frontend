/**
 * Servicio de permisos para PWA
 * Maneja permisos de: Cámara, Micrófono, Ubicación, Notificaciones
 */

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'not-supported';

export interface PermissionResult {
  status: PermissionStatus;
  error?: string;
}

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

/**
 * PERMISOS DE CÁMARA
 */
export const requestCameraPermission = async (): Promise<PermissionResult> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        status: 'not-supported',
        error: 'La cámara no está soportada en este dispositivo/navegador'
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment' // Cámara trasera por defecto
      } 
    });
    
    // Detener el stream inmediatamente, solo queríamos el permiso
    stream.getTracks().forEach(track => track.stop());

    return { status: 'granted' };
  } catch (error) {
    const err = error as Error;
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return { 
        status: 'denied',
        error: 'Permiso de cámara denegado por el usuario'
      };
    }
    
    if (err.name === 'NotFoundError') {
      return { 
        status: 'not-supported',
        error: 'No se encontró ninguna cámara en el dispositivo'
      };
    }

    return { 
      status: 'denied',
      error: `Error al acceder a la cámara: ${err.message}`
    };
  }
};

/**
 * Capturar foto desde la cámara
 */
export const capturePhoto = async (facingMode: 'user' | 'environment' = 'environment'): Promise<Blob | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    // Crear elemento de video temporal
    const video = document.createElement('video');
    video.srcObject = stream;
    video.setAttribute('playsinline', 'true'); // Importante para iOS
    await video.play();

    // Esperar a que el video esté listo
    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });

    // Crear canvas para capturar la foto
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detener el stream
    stream.getTracks().forEach(track => track.stop());

    // Convertir a Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  } catch (error) {
    console.error('Error al capturar foto:', error);
    return null;
  }
};

/**
 * PERMISOS DE MICRÓFONO
 */
export const requestMicrophonePermission = async (): Promise<PermissionResult> => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        status: 'not-supported',
        error: 'El micrófono no está soportado en este dispositivo/navegador'
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Detener el stream inmediatamente
    stream.getTracks().forEach(track => track.stop());

    return { status: 'granted' };
  } catch (error) {
    const err = error as Error;
    
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return { 
        status: 'denied',
        error: 'Permiso de micrófono denegado por el usuario'
      };
    }
    
    if (err.name === 'NotFoundError') {
      return { 
        status: 'not-supported',
        error: 'No se encontró ningún micrófono en el dispositivo'
      };
    }

    return { 
      status: 'denied',
      error: `Error al acceder al micrófono: ${err.message}`
    };
  }
};

/**
 * PERMISOS DE UBICACIÓN
 */
export const requestLocationPermission = async (): Promise<PermissionResult> => {
  try {
    if (!navigator.geolocation) {
      return {
        status: 'not-supported',
        error: 'La geolocalización no está soportada en este dispositivo/navegador'
      };
    }

    // Intentar obtener la ubicación (esto solicita el permiso)
    await getCurrentLocation();

    return { status: 'granted' };
  } catch (error) {
    const err = error as GeolocationPositionError;
    
    if (err.code === 1) { // PERMISSION_DENIED
      return { 
        status: 'denied',
        error: 'Permiso de ubicación denegado por el usuario'
      };
    }
    
    if (err.code === 2) { // POSITION_UNAVAILABLE
      return { 
        status: 'denied',
        error: 'Ubicación no disponible'
      };
    }
    
    if (err.code === 3) { // TIMEOUT
      return { 
        status: 'denied',
        error: 'Tiempo de espera agotado al obtener ubicación'
      };
    }

    return { 
      status: 'denied',
      error: `Error al acceder a la ubicación: ${err.message}`
    };
  }
};

/**
 * Obtener ubicación actual
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Vigilar cambios de ubicación en tiempo real
 */
export const watchLocation = (
  onSuccess: (position: GeolocationPosition) => void,
  onError?: (error: GeolocationPositionError) => void
): number => {
  if (!navigator.geolocation) {
    throw new Error('Geolocalización no soportada');
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp
      });
    },
    onError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

/**
 * Detener vigilancia de ubicación
 */
export const clearWatchLocation = (watchId: number): void => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * PERMISOS DE NOTIFICACIONES
 */
export const requestNotificationPermission = async (): Promise<PermissionResult> => {
  try {
    if (!('Notification' in window)) {
      return {
        status: 'not-supported',
        error: 'Las notificaciones no están soportadas en este navegador'
      };
    }

    if (Notification.permission === 'granted') {
      return { status: 'granted' };
    }

    if (Notification.permission === 'denied') {
      return { 
        status: 'denied',
        error: 'Permiso de notificaciones denegado previamente'
      };
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      return { status: 'granted' };
    } else if (permission === 'denied') {
      return { 
        status: 'denied',
        error: 'Permiso de notificaciones denegado por el usuario'
      };
    } else {
      return { status: 'prompt' };
    }
  } catch (error) {
    const err = error as Error;
    return { 
      status: 'denied',
      error: `Error al solicitar permisos de notificaciones: ${err.message}`
    };
  }
};

/**
 * Mostrar notificación local
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (!('Notification' in window)) {
    throw new Error('Las notificaciones no están soportadas');
  }

  if (Notification.permission !== 'granted') {
    const result = await requestNotificationPermission();
    if (result.status !== 'granted') {
      throw new Error('Permiso de notificaciones no otorgado');
    }
  }

  // Si hay un service worker, usar su API de notificaciones
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/pwa-icons/icon-192x192.png',
      badge: '/pwa-icons/icon-72x72.png',
      ...options
    });
  } else {
    // Fallback a notificación normal
    new Notification(title, {
      icon: '/pwa-icons/icon-192x192.png',
      ...options
    });
  }
};

/**
 * UTILIDADES
 */

/**
 * Verificar si todos los permisos críticos están otorgados
 */
export const checkAllPermissions = async (): Promise<{
  camera: PermissionStatus;
  microphone: PermissionStatus;
  location: PermissionStatus;
  notifications: PermissionStatus;
}> => {
  const results = {
    camera: 'prompt' as PermissionStatus,
    microphone: 'prompt' as PermissionStatus,
    location: 'prompt' as PermissionStatus,
    notifications: 'prompt' as PermissionStatus
  };

  // Verificar mediante Permissions API si está disponible
  if ('permissions' in navigator) {
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      results.camera = cameraPermission.state as PermissionStatus;
    } catch {
      // No disponible en este navegador
    }

    try {
      const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      results.microphone = micPermission.state as PermissionStatus;
    } catch {
      // No disponible en este navegador
    }

    try {
      const locationPermission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      results.location = locationPermission.state as PermissionStatus;
    } catch {
      // No disponible en este navegador
    }
  }

  // Verificar notificaciones (siempre disponible)
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      results.notifications = 'granted';
    } else if (Notification.permission === 'denied') {
      results.notifications = 'denied';
    } else {
      results.notifications = 'prompt';
    }
  } else {
    results.notifications = 'not-supported';
  }

  return results;
};

/**
 * Solicitar todos los permisos críticos
 */
export const requestAllPermissions = async (): Promise<{
  camera: PermissionResult;
  microphone: PermissionResult;
  location: PermissionResult;
  notifications: PermissionResult;
}> => {
  const [camera, microphone, location, notifications] = await Promise.all([
    requestCameraPermission(),
    requestMicrophonePermission(),
    requestLocationPermission(),
    requestNotificationPermission()
  ]);

  return { camera, microphone, location, notifications };
};

