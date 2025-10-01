/**
 * Monitor de salud de la aplicación
 * Detecta y previene pantallas en blanco y bloqueos
 */

export class AppHealthMonitor {
  private static instance: AppHealthMonitor;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private isBlankScreen: boolean = false;
  private recoveryAttempts: number = 0;
  private maxRecoveryAttempts: number = 3;
  private firstPaintGuardTimer: NodeJS.Timeout | null = null;
  private overlayShown: boolean = false;

  private constructor() {
    this.startMonitoring();
    this.setupActivityListeners();
  }

  public static getInstance(): AppHealthMonitor {
    if (!AppHealthMonitor.instance) {
      AppHealthMonitor.instance = new AppHealthMonitor();
    }
    return AppHealthMonitor.instance;
  }

  /**
   * Iniciar monitoreo de salud
   */
  private startMonitoring(): void {
    console.log('🏥 AppHealthMonitor iniciado');

    // Check cada 2 segundos
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 2000);

    // Guard de primer render: si en 4s el #root sigue vacío, activar recuperación sin recargar
    this.firstPaintGuardTimer = setTimeout(() => {
      const root = document.getElementById('root');
      if (root && root.children.length === 0 && window.location.pathname !== '/login') {
        console.error('🚨 First paint no ocurrió. Aplicando redirección segura.');
        this.showOverlay('Inicializando…');
        this.safeRedirect();
      }
    }, 4000);
  }

  /**
   * Configurar listeners de actividad
   */
  private setupActivityListeners(): void {
    // Detectar actividad del usuario
    ['click', 'touchstart', 'keydown', 'scroll', 'mousemove'].forEach(event => {
      window.addEventListener(event, () => {
        this.lastActivityTime = Date.now();
      }, { passive: true });
    });

    // Detectar cuando la app se vuelve visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('👁️ App visible, verificando salud...');
        this.performHealthCheck();
      }
    });
  }

  /**
   * Realizar verificación de salud
   */
  private performHealthCheck(): void {
    // 1. Detectar pantalla en blanco
    this.checkBlankScreen();

    // 2. Detectar si la app está congelada
    this.checkAppFrozen();

    // 3. Verificar autenticación
    this.checkAuthStatus();
  }

  /**
   * Detectar pantalla en blanco
   */
  private checkBlankScreen(): void {
    const body = document.body;
    const root = document.getElementById('root');

    // Si el body o root están vacíos
    if (!body || !root || !root.children || root.children.length === 0) {
      if (!this.isBlankScreen) {
        console.error('🚨 PANTALLA EN BLANCO DETECTADA');
        this.isBlankScreen = true;
        this.showOverlay('Recuperando vista…');
        this.safeRedirect();
      }
    } else {
      this.isBlankScreen = false;
    }
  }

  /**
   * Detectar si la app está congelada
   */
  private checkAppFrozen(): void {
    const timeSinceActivity = Date.now() - this.lastActivityTime;
    const MAX_INACTIVITY = 30000; // 30 segundos

    // Si no ha habido actividad en 30 segundos y estamos en una pantalla de carga
    if (timeSinceActivity > MAX_INACTIVITY) {
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
      
      if (loadingElements.length > 0) {
        console.warn('⚠️ Posible app congelada detectada');
        // Solo advertir, no recuperar automáticamente
      }
    }
  }

  /**
   * Verificar estado de autenticación
   */
  private checkAuthStatus(): void {
    const currentPath = window.location.pathname;
    
    // Si estamos en una ruta protegida
    const protectedRoutes = ['/dashboard', '/chat', '/inventory', '/hr', '/team', '/clients'];
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));

    if (isProtectedRoute) {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      // Si no hay tokens en una ruta protegida
      if (!accessToken && !refreshToken) {
        console.warn('⚠️ No hay tokens en ruta protegida, redirigiendo a login...');
        window.location.href = '/login';
      }
    }
  }

  /**
   * Intentar recuperación automática
   */
  private attemptRecovery(reason: string): void {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.error('🚨 Máximo de intentos de recuperación alcanzado');
      this.showManualRecoveryUI();
      return;
    }

    this.recoveryAttempts++;
    console.log(`🔄 Intentando recuperación automática (${this.recoveryAttempts}/${this.maxRecoveryAttempts})...`);
    console.log(`Razón: ${reason}`);

    // Estrategias de recuperación
    switch (reason) {
      case 'blank_screen':
        // Preferir redirección segura para evitar loops de recarga
        this.showOverlay('Restaurando sesión…');
        this.safeRedirect();
        break;

      case 'auth_error':
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
        break;

      default:
        setTimeout(() => {
          window.location.reload();
        }, 1000);
    }
  }

  /**
   * Mostrar UI de recuperación manual
   */
  private showManualRecoveryUI(): void {
    const body = document.body;
    
    // Limpiar body
    body.innerHTML = '';
    
    // Crear UI de recuperación
    const recoveryDiv = document.createElement('div');
    recoveryDiv.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f3f4f6;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    recoveryDiv.innerHTML = `
      <div style="text-align: center; max-width: 400px;">
        <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
        <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">
          Error Crítico
        </h1>
        <p style="color: #6b7280; margin-bottom: 30px;">
          La aplicación encontró un error y no pudo recuperarse automáticamente.
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button 
            id="reload-btn"
            style="
              width: 100%;
              padding: 12px 24px;
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            🔄 Recargar Aplicación
          </button>
          
          <button 
            id="clear-btn"
            style="
              width: 100%;
              padding: 12px 24px;
              background-color: #ef4444;
              color: white;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            🧹 Limpiar y Reiniciar
          </button>
        </div>
      </div>
    `;

    body.appendChild(recoveryDiv);

    // Agregar event listeners
    document.getElementById('reload-btn')?.addEventListener('click', () => {
      window.location.reload();
    });

    document.getElementById('clear-btn')?.addEventListener('click', () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    });
  }

  /**
   * Resetear contador de recuperación
   */
  public resetRecoveryAttempts(): void {
    this.recoveryAttempts = 0;
    console.log('✅ Contador de recuperación reseteado');
  }

  /**
   * Detener monitoreo
   */
  public stop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🛑 AppHealthMonitor detenido');
    }
    if (this.firstPaintGuardTimer) {
      clearTimeout(this.firstPaintGuardTimer);
      this.firstPaintGuardTimer = null;
    }
  }

  /**
   * Forzar recuperación manual
   */
  public forceRecovery(): void {
    console.log('🔧 Recuperación forzada iniciada');
    this.showManualRecoveryUI();
  }

  /** Overlay ligero para feedback durante recuperación */
  private showOverlay(message: string): void {
    if (this.overlayShown) return;
    this.overlayShown = true;
    const overlay = document.createElement('div');
    overlay.id = 'app-health-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.96);z-index:9999;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial';
    overlay.innerHTML = `
      <div style="text-align:center;max-width:360px;padding:16px;">
        <div style="width:48px;height:48px;margin:0 auto 10px;border:4px solid #2563eb;border-top-color:transparent;border-radius:50%;animation:spin 1s linear infinite"></div>
        <div style="font-weight:700;color:#111827;margin-bottom:4px">Recuperando aplicación…</div>
        <div style="font-size:13px;color:#4b5563;margin-bottom:10px">${message}</div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button id="ov-refresh" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;background:#fff;color:#111827;font-weight:600">Recargar</button>
          <button id="ov-login" style="padding:6px 10px;border-radius:8px;background:#2563eb;color:#fff;border:none;font-weight:600">Ir a Login</button>
        </div>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(overlay);
    document.getElementById('ov-refresh')?.addEventListener('click', () => window.location.reload());
    document.getElementById('ov-login')?.addEventListener('click', () => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/login'; });
  }

  /** Redirección segura a una ruta estable para evitar pantalla en blanco */
  private safeRedirect(): void {
    const current = window.location.pathname;
    const candidates = ['/inventory', '/dashboard'];
    const target = candidates.find(p => p !== current) || '/dashboard';
    try {
      window.history.replaceState({}, '', target);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = target;
    }
  }
}

// Inicializar monitor automáticamente
if (typeof window !== 'undefined') {
  AppHealthMonitor.getInstance();
}

