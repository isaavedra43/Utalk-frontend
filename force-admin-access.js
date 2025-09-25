// SCRIPT PARA FORZAR ACCESO DE ADMIN@COMPANY.COM
// Ejecutar en la consola del navegador

(function() {
    console.log('🚀 FORZANDO ACCESO DE ADMIN@COMPANY.COM');
    
    // Función para verificar si es admin
    function isAdmin() {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.email === 'admin@company.com';
            } catch (error) {
                console.log('Error parsing token:', error);
            }
        }
        return false;
    }
    
    // Si es admin, forzar el acceso
    if (isAdmin()) {
        console.log('👑 ADMIN DETECTADO - Forzando acceso completo');
        
        // Forzar almacenamiento
        localStorage.setItem('userEmail', 'admin@company.com');
        localStorage.setItem('userRole', 'admin');
        sessionStorage.setItem('userEmail', 'admin@company.com');
        sessionStorage.setItem('userRole', 'admin');
        
        // Override de funciones de permisos
        window.forceAdminAccess = true;
        
        console.log('✅ Acceso de admin forzado - Recargando página...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        console.log('❌ No es admin@company.com');
    }
})();
