/**
 * Script automático de migración de permisos para admins
 * Se ejecuta en el navegador para detectar y corregir problemas de permisos
 */

interface MigrationResult {
  success: boolean;
  message: string;
  needsReload?: boolean;
}

class AdminMigrationScript {
  private backendUrl: string;
  private isRunning: boolean = false;

  constructor(backendUrl: string = '') {
    this.backendUrl = backendUrl || window.location.origin;
  }

  /**
   * Verifica si el usuario actual es admin
   */
  private isAdmin(): boolean {
    // Verificar en localStorage/sessionStorage
    const userEmail = localStorage.getItem('userEmail') || 
                     sessionStorage.getItem('userEmail') ||
                     document.cookie.match(/userEmail=([^;]+)/)?.[1];
    
    const userRole = localStorage.getItem('userRole') || 
                    sessionStorage.getItem('userRole') ||
                    document.cookie.match(/userRole=([^;]+)/)?.[1];

    return userRole?.toLowerCase().includes('admin') || 
           userEmail?.includes('admin') ||
           userEmail?.includes('@admin');
  }

  /**
   * Verifica si necesita migración basándose en la navegación visible
   */
  private needsMigration(): boolean {
    // Contar módulos visibles en la navegación
    const navItems = document.querySelectorAll('[data-module-id]');
    const totalExpectedModules = 16;
    
    // Si hay menos de 10 módulos visibles, probablemente necesita migración
    return navItems.length < 10;
  }

  /**
   * Ejecuta la migración llamando al endpoint
   */
  private async executeMigration(): Promise<MigrationResult> {
    try {
      const response = await fetch(`${this.backendUrl}/api/admin-fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Verificar que la respuesta sea JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('El servidor devolvió HTML en lugar de JSON');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: `Migración completada exitosamente. Módulos: ${data.data?.migration?.modulesCount || 'N/A'}`,
          needsReload: true
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error en la migración'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Muestra notificación en la interfaz
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `
      fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm
      ${type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        'bg-blue-100 text-blue-800 border border-blue-200'}
    `;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span class="font-medium">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remover después de 5 segundos
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  /**
   * Ejecuta la verificación y migración automática
   */
  async runAutoMigration(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;

    try {
      // Solo ejecutar si es admin
      if (!this.isAdmin()) {
        console.log('🔍 Usuario no es admin, saltando migración automática');
        return;
      }

      // Verificar si necesita migración
      if (!this.needsMigration()) {
        console.log('✅ Admin ya tiene permisos completos, no necesita migración');
        return;
      }

      console.log('🚀 Ejecutando migración automática de permisos...');
      this.showNotification('Iniciando migración automática de permisos...', 'info');

      const result = await this.executeMigration();

      if (result.success) {
        console.log('✅ Migración completada exitosamente');
        this.showNotification('¡Migración completada! Recargando página...', 'success');
        
        if (result.needsReload) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        console.error('❌ Error en migración:', result.message);
        this.showNotification(`Error: ${result.message}`, 'error');
      }

    } catch (error) {
      console.error('❌ Error crítico en migración automática:', error);
      this.showNotification('Error crítico en migración automática', 'error');
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Crea botón manual de migración en la interfaz
   */
  createManualButton(): void {
    // Evitar duplicados
    if (document.getElementById('admin-migration-manual-btn')) return;

    const button = document.createElement('button');
    button.id = 'admin-migration-manual-btn';
    button.innerHTML = '🔧 Migrar Permisos Admin';
    button.className = `
      fixed bottom-4 left-4 z-50 px-4 py-2 bg-red-500 text-white rounded-lg
      hover:bg-red-600 transition-colors shadow-lg font-medium text-sm
    `;
    
    button.onclick = () => this.runAutoMigration();
    
    document.body.appendChild(button);
  }

  /**
   * Inicializa el script automático
   */
  init(): void {
    console.log('🔧 Inicializando script de migración de admin...');

    // Ejecutar migración automática después de 3 segundos
    setTimeout(() => {
      this.runAutoMigration();
    }, 3000);

    // Crear botón manual para admins
    if (this.isAdmin()) {
      setTimeout(() => {
        this.createManualButton();
      }, 5000);
    }
  }
}

// Función global para inicializar el script
(window as any).initAdminMigration = (backendUrl?: string) => {
  const script = new AdminMigrationScript(backendUrl);
  script.init();
};

// Auto-inicializar si estamos en desarrollo
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    (window as any).initAdminMigration();
  }, 2000);
}

export { AdminMigrationScript };
