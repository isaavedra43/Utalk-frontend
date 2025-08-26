/**
 * Utilidades para manejo de autenticación
 */

export const cleanCorruptedTokens = (): void => {
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
      }
    }
  } catch (error) {
    console.error('🔐 authUtils - Error limpiando tokens:', error);
    // En caso de error, limpiar todo para estar seguros
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
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
