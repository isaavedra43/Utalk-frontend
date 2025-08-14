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
    
    // Verificar que el token tenga la información mínima requerida
    const workspaceId = payload.workspaceId || payload.ws;
    const tenantId = payload.tenantId || payload.tenant;
    const userId = payload.sub || payload.userId || payload.id;
    
    // Si faltan datos críticos, no usar valores por defecto problemáticos
    if (!workspaceId || !tenantId || !userId) {
      console.warn('⚠️ JWT - Token incompleto, faltan datos críticos:', {
        workspaceId: !!workspaceId,
        tenantId: !!tenantId,
        userId: !!userId
      });
      throw new Error('Token incompleto');
    }
    
    return {
      workspaceId,
      tenantId,
      userId,
      email: payload.email || null,
      role: payload.role || null,
      exp: payload.exp || null,
      iat: payload.iat || null
    };
  } catch (error) {
    console.warn('⚠️ Error decodificando JWT:', error);
    // No retornar valores por defecto problemáticos
    throw new Error('Token inválido o incompleto');
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
 * Verifica si la información del usuario es válida (no usa valores por defecto problemáticos)
 * @param userInfo - Información del usuario a verificar
 * @returns true si la información es válida
 */
export const isValidUserInfo = (userInfo: JWTUserInfo): boolean => {
  return !(
    userInfo.workspaceId === 'default' || 
    userInfo.tenantId === 'na' || 
    userInfo.userId === null
  );
};

/**
 * Obtiene información del usuario desde múltiples fuentes
 * Prioridad: JWT > localStorage > valores por defecto
 * CORREGIDO: Mejorar manejo de valores por defecto problemáticos
 * @returns Información del usuario
 */
export const getUserInfo = (): JWTUserInfo => {
  // 1. Intentar obtener del token JWT (prioridad alta)
  const token = localStorage.getItem('access_token');
  if (token && isTokenValid(token)) {
    const tokenInfo = extractUserInfoFromToken(token);
    
    // Verificar si el token tiene información válida (no valores por defecto problemáticos)
    if (isValidUserInfo(tokenInfo)) {
      console.log('🔐 JWT - Información extraída del token:', {
        workspaceId: tokenInfo.workspaceId,
        tenantId: tokenInfo.tenantId,
        userId: tokenInfo.userId
      });
      return tokenInfo;
    } else {
      console.warn('⚠️ JWT - Token contiene valores por defecto problemáticos:', {
        workspaceId: tokenInfo.workspaceId,
        tenantId: tokenInfo.tenantId,
        userId: tokenInfo.userId
      });
    }
  }
  
  // 2. Intentar obtener del usuario en localStorage (fallback)
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.workspaceId && user.workspaceId !== 'default' && 
        user.tenantId && user.tenantId !== 'na') {
      console.log('🔐 localStorage - Información extraída del usuario:', {
        workspaceId: user.workspaceId,
        tenantId: user.tenantId
      });
      return {
        workspaceId: user.workspaceId,
        tenantId: user.tenantId,
        userId: user.id || null,
        email: user.email || null,
        role: user.role || null
      };
    }
  } catch (error) {
    console.warn('⚠️ Error leyendo usuario de localStorage:', error);
  }
  
  // 3. Intentar extraer del token JWT incluso si no tiene workspaceId/tenantId válidos
  if (token && isTokenValid(token)) {
    const tokenInfo = extractUserInfoFromToken(token);
    if (tokenInfo.userId || tokenInfo.email) {
      console.log('🔐 JWT - Usando información parcial del token:', {
        workspaceId: tokenInfo.workspaceId,
        tenantId: tokenInfo.tenantId,
        userId: tokenInfo.userId,
        email: tokenInfo.email
      });
      return tokenInfo;
    }
  }
  
  // 4. CORREGIDO: Usar valores por defecto más robustos como último recurso
  console.warn('⚠️ Usando valores por defecto para workspaceId/tenantId - verificar configuración del backend');
  
  // Intentar obtener valores del entorno si están disponibles
  const envWorkspaceId = import.meta.env.VITE_WORKSPACE_ID || 'default';
  const envTenantId = import.meta.env.VITE_TENANT_ID || 'na';
  
  const fallbackInfo = {
    workspaceId: envWorkspaceId,
    tenantId: envTenantId,
    userId: null,
    email: null
  };
  
  console.log('🔐 Fallback - Usando valores de entorno:', {
    workspaceId: fallbackInfo.workspaceId,
    tenantId: fallbackInfo.tenantId
  });
  
  return fallbackInfo;
};

/**
 * Genera un roomId con el formato correcto del backend
 * CORREGIDO: Mejorar manejo de valores por defecto
 * @param conversationId - ID de la conversación
 * @returns RoomId en formato ws:${workspaceId}:ten:${tenantId}:conv:${conversationId}
 */
export const generateRoomId = (conversationId: string): string => {
  const userInfo = getUserInfo();
  
  // CORREGIDO: Validar que no estemos usando valores por defecto problemáticos
  if (!isValidUserInfo(userInfo)) {
    console.warn('⚠️ Generando roomId con valores por defecto problemáticos:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      conversationId
    });
  }
  
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
 * CORREGIDO: Mejorar validación para detectar valores problemáticos
 * @returns true si la configuración es válida, false si usa valores por defecto
 */
export const validateRoomConfiguration = (): boolean => {
  const userInfo = getUserInfo();
  const isValid = isValidUserInfo(userInfo);
  
  if (!isValid) {
    console.warn('⚠️ Configuración de rooms usando valores por defecto problemáticos:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
    
    // CORREGIDO: Intentar obtener valores del entorno como fallback
    const envWorkspaceId = import.meta.env.VITE_WORKSPACE_ID;
    const envTenantId = import.meta.env.VITE_TENANT_ID;
    
    if (envWorkspaceId && envTenantId) {
      console.log('🔧 Sugerencia: Configurar variables de entorno VITE_WORKSPACE_ID y VITE_TENANT_ID');
    }
  } else {
    console.log('✅ Configuración de rooms válida:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
  }
  
  return isValid;
};
