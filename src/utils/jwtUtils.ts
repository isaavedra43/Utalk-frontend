/**
 * Utilidades para manejo de tokens JWT
 */

export interface JWTUserInfo {
  workspaceId: string;
  tenantId: string;
  userId: string | null;
  email: string | null;
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * Extrae información del usuario desde un token JWT
 * @param token - Token JWT a decodificar
 * @returns Información del usuario extraída del token
 */
export const extractUserInfoFromToken = (token: string): JWTUserInfo => {
  try {
    // Decodificar el payload del JWT (segunda parte del token)
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    return {
      workspaceId: payload.workspaceId || payload.ws || 'default',
      tenantId: payload.tenantId || payload.tenant || 'na',
      userId: payload.sub || payload.userId || payload.id || null,
      email: payload.email || null,
      role: payload.role || null,
      exp: payload.exp || null,
      iat: payload.iat || null
    };
  } catch (error) {
    console.warn('⚠️ Error decodificando JWT:', error);
    return { 
      workspaceId: 'default', 
      tenantId: 'na',
      userId: null,
      email: null
    };
  }
};

/**
 * Verifica si un token JWT es válido (no expirado)
 * @param token - Token JWT a verificar
 * @returns true si el token es válido, false si está expirado
 */
export const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Verificar si el token no ha expirado (con margen de 5 minutos)
    return payload.exp > currentTime + 300;
  } catch {
    return false;
  }
};

/**
 * Obtiene información del usuario desde múltiples fuentes
 * Prioridad: JWT > localStorage > valores por defecto
 * @returns Información del usuario
 */
export const getUserInfo = (): JWTUserInfo => {
  // 1. Intentar obtener del token JWT (prioridad alta)
  const token = localStorage.getItem('access_token');
  if (token && isTokenValid(token)) {
    const tokenInfo = extractUserInfoFromToken(token);
    
    // Si el token tiene información válida, usarla
    if (tokenInfo.workspaceId !== 'default' || tokenInfo.tenantId !== 'na') {
      console.log('🔐 JWT - Información extraída del token:', {
        workspaceId: tokenInfo.workspaceId,
        tenantId: tokenInfo.tenantId,
        userId: tokenInfo.userId
      });
      return tokenInfo;
    }
  }
  
  // 2. Intentar obtener del usuario en localStorage (fallback)
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.workspaceId || user.tenantId) {
      console.log('🔐 localStorage - Información extraída del usuario:', {
        workspaceId: user.workspaceId,
        tenantId: user.tenantId
      });
      return {
        workspaceId: user.workspaceId || 'default',
        tenantId: user.tenantId || 'na',
        userId: user.id || null,
        email: user.email || null,
        role: user.role || null
      };
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo usuario de localStorage:', error);
  }
  
  // 3. Valores por defecto
  console.warn('⚠️ Usando valores por defecto para workspaceId/tenantId');
  return {
    workspaceId: 'default',
    tenantId: 'na',
    userId: null,
    email: null
  };
};

/**
 * Genera un roomId con el formato correcto del backend
 * @param conversationId - ID de la conversación
 * @returns RoomId en formato ws:${workspaceId}:ten:${tenantId}:conv:${conversationId}
 */
export const generateRoomId = (conversationId: string): string => {
  const userInfo = getUserInfo();
  const roomId = `ws:${userInfo.workspaceId}:ten:${userInfo.tenantId}:conv:${conversationId}`;
  
  console.log('🔗 Room ID generado:', {
    conversationId,
    workspaceId: userInfo.workspaceId,
    tenantId: userInfo.tenantId,
    roomId
  });
  
  return roomId;
};

/**
 * Valida la configuración de rooms
 * @returns true si la configuración es válida, false si usa valores por defecto
 */
export const validateRoomConfiguration = (): boolean => {
  const userInfo = getUserInfo();
  const isValid = userInfo.workspaceId !== 'default' && userInfo.tenantId !== 'na';
  
  if (!isValid) {
    console.warn('⚠️ Configuración de rooms usando valores por defecto:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId
    });
  } else {
    console.log('✅ Configuración de rooms válida:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId
    });
  }
  
  return isValid;
};
