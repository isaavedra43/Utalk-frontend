import { useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  needRefresh: boolean;
  updateAvailable: boolean;
}

interface PWAActions {
  promptInstall: () => Promise<void>;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  dismissInstallPrompt: () => void;
}

export const usePWA = (): PWAState & PWAActions => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // Hook de vite-plugin-pwa para actualización
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ PWA: Service Worker registrado');
      
      // Verificar actualizaciones cada 1 hora
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('❌ PWA: Error al registrar Service Worker', error);
    },
  });

  // Detectar plataforma
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // Verificar si ya está instalada
    const checkIfInstalled = () => {
      // En iOS, verificar si está en modo standalone
      if (isIOSDevice && ('standalone' in window.navigator)) {
        setIsInstalled((window.navigator as any).standalone === true);
      }
      // En Android y otros, verificar display mode
      else if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
      // También verificar matchMedia
      else if (window.matchMedia('(display-mode: fullscreen)').matches) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();
  }, []);

  // Manejar evento beforeinstallprompt (Android)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('📱 PWA: Evento beforeinstallprompt detectado');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Manejar instalación exitosa
  useEffect(() => {
    const handler = () => {
      console.log('✅ PWA: Aplicación instalada exitosamente');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handler);

    return () => {
      window.removeEventListener('appinstalled', handler);
    };
  }, []);

  // Función para mostrar prompt de instalación (Android)
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ PWA: No hay prompt de instalación disponible');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`📱 PWA: Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ PWA: Error al mostrar prompt de instalación', error);
    }
  }, [deferredPrompt]);

  // Función para descartar el prompt
  const dismissInstallPrompt = useCallback(() => {
    setIsInstallable(false);
    setDeferredPrompt(null);
  }, []);

  return {
    // Estado
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    needRefresh,
    updateAvailable: needRefresh,
    
    // Acciones
    promptInstall,
    updateServiceWorker,
    dismissInstallPrompt,
  };
};

