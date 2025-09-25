/**
 * Script para forzar el acceso de admin@company.com
 * Se ejecuta automáticamente en el navegador
 */

// Función para forzar el acceso del admin
export const forceAdminAccess = () => {
  // Verificar si es admin@company.com
  const checkIfAdmin = () => {
    const token = localStorage.getItem('access_token');
    let isAdmin = false;
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        isAdmin = payload.email === 'admin@company.com';
      } catch (error) {
        console.log('Error parsing token:', error);
      }
    }
    
    return isAdmin;
  };

  // Si es admin, forzar el acceso
  if (checkIfAdmin()) {
    console.log('👑 ADMIN DETECTADO - Forzando acceso completo');
    
    // Forzar almacenamiento del email
    localStorage.setItem('userEmail', 'admin@company.com');
    localStorage.setItem('userRole', 'admin');
    sessionStorage.setItem('userEmail', 'admin@company.com');
    sessionStorage.setItem('userRole', 'admin');
    
    // Forzar recarga de permisos
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

// Ejecutar automáticamente
if (typeof window !== 'undefined') {
  // Ejecutar inmediatamente
  forceAdminAccess();
  
  // Ejecutar después de 2 segundos
  setTimeout(forceAdminAccess, 2000);
  
  // Ejecutar cuando se carga el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceAdminAccess);
  }
}
