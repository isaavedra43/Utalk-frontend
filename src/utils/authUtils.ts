/**
 * Utilidades para manejo de autenticación
 */

// Variable para evitar limpieza repetitiva
let hasCleanedTokens = false;

export const cleanCorruptedTokens = (): void => {
  // Evitar limpieza repetitiva
  if (hasCleanedTokens) {
    return;
  }

  try {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const user = localStorage.getItem('user');
    
    // Verificar si los tokens son válidos
    const isAccessTokenValid = accessToken && 
      accessToken !== 'undefined' && 
      accessToken !== 'null' && 
      accessToken.length >= 10;
    
    const isRefreshTokenValid = refreshToken && 
      refreshToken !== 'undefined' && 
      refreshToken !== 'null' && 
      refreshToken.length >= 10;
    
    // Si algún token es inválido, limpiar todo
    if (!isAccessTokenValid || !isRefreshTokenValid) {
      console.log('🔐 authUtils - Tokens corruptos detectados, limpiando localStorage...');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      hasCleanedTokens = true;
      return;
    }
    
    // Verificar que el usuario sea un JSON válido
    if (user) {
      try {
        JSON.parse(user);
      } catch {
        console.log('🔐 authUtils - Usuario corrupto detectado, limpiando localStorage...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        hasCleanedTokens = true;
      }
    }
  } catch (error) {
    console.error('🔐 authUtils - Error limpiando tokens:', error);
    // En caso de error, limpiar todo para estar seguros
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    hasCleanedTokens = true;
  }
};

export const isTokenValid = (token: string | null): boolean => {
  return !!(token && 
    token !== 'undefined' && 
    token !== 'null' && 
    token.length >= 10);
};

export const getStoredTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  return {
    accessToken: isTokenValid(accessToken) ? accessToken : null,
    refreshToken: isTokenValid(refreshToken) ? refreshToken : null
  };
};

// NUEVO: Función para limpiar completamente el estado y forzar nueva autenticación
export const forceCleanAuth = (): void => {
  try {
    console.log('🔐 authUtils - Limpiando completamente el estado de autenticación...');
    
    // Limpiar localStorage
    localStorage.clear();
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    // Limpiar cookies relacionadas con autenticación
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('auth:force-clean', {
      detail: { timestamp: Date.now() }
    }));
    
    console.log('🔐 authUtils - Estado de autenticación limpiado completamente');
  } catch (error) {
    console.error('🔐 authUtils - Error en forceCleanAuth:', error);
  }
};

// NUEVO: Función para verificar si el estado está corrupto
export const isAuthStateCorrupted = (): boolean => {
  try {
    const { accessToken, refreshToken } = getStoredTokens();
    const user = localStorage.getItem('user');
    
    // Verificar si hay tokens pero no usuario
    if ((accessToken || refreshToken) && !user) {
      return true;
    }
    
    // Verificar si hay usuario pero no tokens
    if (user && (!accessToken && !refreshToken)) {
      return true;
    }
    
    // Verificar si el usuario es JSON inválido
    if (user) {
      try {
        JSON.parse(user);
      } catch {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('🔐 authUtils - Error verificando estado corrupto:', error);
    return true;
  }
};
