/**
 * Servicio de Web Push para notificaciones PWA
 * Soporta notificaciones push en Android y iOS 16.4+
 */

// VAPID keys - Estas deben ser generadas y almacenadas en el backend
// Para generar: npx web-push generate-vapid-keys
const PUBLIC_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Convertir clave VAPID a formato Uint8Array
 */
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

/**
 * Verificar si las notificaciones push están soportadas
 */
export const isPushSupported = (): boolean => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

/**
 * Solicitar suscripción a notificaciones push
 */
export const subscribeToPush = async (): Promise<PushSubscriptionData | null> => {
  try {
    if (!isPushSupported()) {
      console.warn('⚠️ Push: Notificaciones push no soportadas en este navegador');
      return null;
    }

    // Verificar permiso de notificaciones
    if (Notification.permission === 'denied') {
      console.warn('⚠️ Push: Permiso de notificaciones denegado');
      return null;
    }

    // Solicitar permiso si no se ha otorgado
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Push: Usuario denegó el permiso de notificaciones');
        return null;
      }
    }

    // Obtener service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Verificar suscripción existente
    let subscription = await registration.pushManager.getSubscription();

    // Si no hay suscripción, crear una nueva
    if (!subscription) {
      if (!PUBLIC_VAPID_KEY) {
        console.error('❌ Push: VAPID public key no configurada');
        return null;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });

      console.log('✅ Push: Suscripción creada exitosamente');
    } else {
      console.log('✅ Push: Suscripción existente encontrada');
    }

    // Convertir la suscripción a formato JSON
    const subscriptionJSON = subscription.toJSON();
    
    if (!subscriptionJSON.keys) {
      throw new Error('Suscripción inválida: no contiene claves');
    }

    return {
      endpoint: subscriptionJSON.endpoint || '',
      keys: {
        p256dh: subscriptionJSON.keys.p256dh || '',
        auth: subscriptionJSON.keys.auth || ''
      }
    };
  } catch (error) {
    console.error('❌ Push: Error al suscribirse a notificaciones', error);
    return null;
  }
};

/**
 * Cancelar suscripción a notificaciones push
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    if (!isPushSupported()) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const successful = await subscription.unsubscribe();
      if (successful) {
        console.log('✅ Push: Suscripción cancelada exitosamente');
      }
      return successful;
    }

    return false;
  } catch (error) {
    console.error('❌ Push: Error al cancelar suscripción', error);
    return false;
  }
};

/**
 * Obtener suscripción actual
 */
export const getCurrentPushSubscription = async (): Promise<PushSubscriptionData | null> => {
  try {
    if (!isPushSupported()) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return null;
    }

    const subscriptionJSON = subscription.toJSON();
    
    if (!subscriptionJSON.keys) {
      return null;
    }

    return {
      endpoint: subscriptionJSON.endpoint || '',
      keys: {
        p256dh: subscriptionJSON.keys.p256dh || '',
        auth: subscriptionJSON.keys.auth || ''
      }
    };
  } catch (error) {
    console.error('❌ Push: Error al obtener suscripción', error);
    return null;
  }
};

/**
 * Registrar suscripción en el backend
 */
export const registerPushSubscription = async (
  subscription: PushSubscriptionData,
  userId: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        subscription,
        userId
      })
    });

    if (!response.ok) {
      throw new Error('Error al registrar suscripción en el backend');
    }

    console.log('✅ Push: Suscripción registrada en el backend');
    return true;
  } catch (error) {
    console.error('❌ Push: Error al registrar suscripción en el backend', error);
    return false;
  }
};

/**
 * Desregistrar suscripción del backend
 */
export const unregisterPushSubscription = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error('Error al desregistrar suscripción del backend');
    }

    console.log('✅ Push: Suscripción desregistrada del backend');
    return true;
  } catch (error) {
    console.error('❌ Push: Error al desregistrar suscripción', error);
    return false;
  }
};

/**
 * Verificar y configurar notificaciones push completo
 */
export const setupPushNotifications = async (userId: string): Promise<boolean> => {
  try {
    // Verificar soporte
    if (!isPushSupported()) {
      console.warn('⚠️ Push: Navegador no soporta notificaciones push');
      return false;
    }

    // Suscribirse
    const subscription = await subscribeToPush();
    if (!subscription) {
      console.warn('⚠️ Push: No se pudo crear suscripción');
      return false;
    }

    // Registrar en backend
    const registered = await registerPushSubscription(subscription, userId);
    if (!registered) {
      console.warn('⚠️ Push: No se pudo registrar suscripción en backend');
      return false;
    }

    console.log('✅ Push: Notificaciones push configuradas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Push: Error al configurar notificaciones push', error);
    return false;
  }
};

/**
 * Manejar notificación recibida (en service worker)
 * Esta función debe ser llamada desde el service worker
 */
export const handlePushNotification = (event: any): void => {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'UTalk';
  const options: NotificationOptions = {
    body: data.body || 'Tienes un nuevo mensaje',
    icon: '/pwa-icons/icon-192x192.png',
    badge: '/pwa-icons/icon-72x72.png',
    tag: data.tag || 'utalk-notification',
    data: data.data || {},
    vibrate: data.vibrate || [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };

  // Mostrar la notificación
  // Nota: Esta función debe ejecutarse en el contexto del service worker
  if (typeof self !== 'undefined' && 'registration' in self) {
    (self as any).registration.showNotification(title, options);
  }
};

/**
 * Manejar click en notificación (en service worker)
 * Esta función debe ser llamada desde el service worker
 */
export const handleNotificationClick = (event: any): void => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  // Nota: Esta función debe ejecutarse en el contexto del service worker
  if (typeof self !== 'undefined' && 'clients' in self) {
    event.waitUntil(
      (self as any).clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList: any[]) => {
        // Si hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if ((self as any).clients.openWindow) {
          return (self as any).clients.openWindow(urlToOpen);
        }
      })
    );
  }
};

/**
 * UTILIDADES
 */

/**
 * Verificar si el usuario ya tiene suscripción activa
 */
export const hasActivePushSubscription = async (): Promise<boolean> => {
  const subscription = await getCurrentPushSubscription();
  return subscription !== null;
};

/**
 * Obtener estado de notificaciones
 */
export const getPushNotificationStatus = (): {
  supported: boolean;
  permission: NotificationPermission;
} => {
  return {
    supported: isPushSupported(),
    permission: 'Notification' in window ? Notification.permission : 'denied'
  };
};

