/**
 * Utilidades para manejo de tokens JWT
 */

export interface JWTUserInfo {
  workspaceId: string;
  tenantId: string;
  userId: string | null;
  email: string | null;
  role?: string | null;
  exp?: number | null;
  iat?: number | null;
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
    
    // Extraer campos con valores por defecto según especificación del backend
    const workspaceId = payload.workspaceId || payload.ws || 'default';
    const tenantId = payload.tenantId || payload.tenant || 'na';
    
    // INTENTAR OBTENER userId DE MÚLTIPLES FUENTES
    let userId = payload.sub || payload.userId || payload.id || null;
    
    // Si no hay userId en el JWT, intentar obtenerlo del localStorage
    if (!userId) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userId = userData.id || userData.userId || null;
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo userId de localStorage:', error);
      }
    }
    
    // Log de información extraída (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log('🔐 JWT - Información extraída del token:', {
        workspaceId,
        tenantId,
        userId,
        email: payload.email,
        role: payload.role
      });
      console.log('🔐 JWT - Payload completo del token:', payload);
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
    // Retornar valores por defecto según especificación del backend
    return {
      workspaceId: 'default',
      tenantId: 'na',
      userId: null,
      email: null,
      role: null,
      exp: null,
      iat: null
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
 * Verifica si la información del usuario es válida (acepta valores por defecto del backend)
 * @param userInfo - Información del usuario a verificar
 * @returns true si la información es válida según especificación del backend
 */
export const isValidUserInfo = (userInfo: JWTUserInfo): boolean => {
  // Según la especificación del backend, 'default' y 'na' son valores válidos por defecto
  // Solo userId null es problemático
  return userInfo.userId !== null;
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
    try {
      const tokenInfo = extractUserInfoFromToken(token);
      
      // Verificar si el token tiene información válida (acepta valores por defecto del backend)
      if (isValidUserInfo(tokenInfo)) {
        console.log('🔐 JWT - Información extraída del token:', {
          workspaceId: tokenInfo.workspaceId,
          tenantId: tokenInfo.tenantId,
          userId: tokenInfo.userId
        });
        return tokenInfo;
      } else {
        console.warn('⚠️ JWT - Token con userId null, usando información parcial:', {
          workspaceId: tokenInfo.workspaceId,
          tenantId: tokenInfo.tenantId,
          userId: tokenInfo.userId
        });
      }
    } catch (error) {
      console.warn('⚠️ JWT - Error extrayendo información del token:', error);
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
 * CORREGIDO: Usar formato simple para coincidir con el backend
 * @param conversationId - ID de la conversación
 * @returns RoomId en formato conversation:${conversationId}
 */
export const generateRoomId = (conversationId: string): string => {
  // CORREGIDO: Usar formato simple para coincidir con el backend
  const roomId = `conversation:${conversationId}`;
  
  console.log('🔗 Room ID generado (formato simplificado):', {
    conversationId,
    roomId
  });
  
  return roomId;
};

/**
 * Valida la configuración de rooms
 * ALINEADO: Acepta valores por defecto según especificación del backend
 * @returns true si la configuración es válida, false si userId es null
 */
export const validateRoomConfiguration = (): boolean => {
  const userInfo = getUserInfo();
  const isValid = isValidUserInfo(userInfo);
  
  if (!isValid) {
    console.warn('⚠️ Configuración de rooms con userId null:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
  } else {
    console.log('✅ Configuración de rooms válida:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
  }
  
  return isValid;
};
