/**
 * Utilidades para manejo de tokens JWT
 */

import { WORKSPACE_CONFIG } from '../config/workspace';
import { infoLog } from '../config/logger';

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
        infoLog('⚠️ Error obteniendo userId de localStorage:', error);
      }
    }
    
    // Log de información extraída (solo en modo debug explícito y desarrollo)
    if (import.meta.env.VITE_DEBUG === 'true' && import.meta.env.DEV) {
      // Reducido: no imprimir payload completo por defecto
      console.debug('[DEBUG][JWT] Info extraída del token', {
        workspaceId,
        tenantId,
        userId,
        email: payload.email,
        role: payload.role
      });
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
          infoLog('⚠️ Error decodificando JWT:', error);
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
        if (import.meta.env.VITE_DEBUG === 'true' && import.meta.env.DEV) {
          console.debug('[DEBUG][JWT] Info token válida', {
            workspaceId: tokenInfo.workspaceId,
            tenantId: tokenInfo.tenantId,
            userId: tokenInfo.userId
          });
        }
        return tokenInfo;
      } else {
        infoLog('⚠️ JWT - Token con userId null, usando información parcial:', {
          workspaceId: tokenInfo.workspaceId,
          tenantId: tokenInfo.tenantId,
          userId: tokenInfo.userId
        });
      }
    } catch (error) {
      infoLog('⚠️ JWT - Error extrayendo información del token:', error);
    }
  }
  
  // 2. Intentar obtener del usuario en localStorage (fallback)
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.workspaceId && user.workspaceId !== 'default' && 
        user.tenantId && user.tenantId !== 'na') {
      if (import.meta.env.VITE_DEBUG === 'true' && import.meta.env.DEV) {
        console.debug('[DEBUG][JWT] Info desde localStorage', {
          workspaceId: user.workspaceId,
          tenantId: user.tenantId
        });
      }
      return {
        workspaceId: user.workspaceId,
        tenantId: user.tenantId,
        userId: user.id || null,
        email: user.email || null,
        role: user.role || null
      };
    }
  } catch (error) {
          infoLog('⚠️ Error leyendo usuario de localStorage:', error);
  }
  
  // 3. Intentar extraer del token JWT incluso si no tiene workspaceId/tenantId válidos
  if (token && isTokenValid(token)) {
    const tokenInfo = extractUserInfoFromToken(token);
    if (tokenInfo.userId || tokenInfo.email) {
      if (import.meta.env.VITE_DEBUG === 'true' && import.meta.env.DEV) {
        console.debug('[DEBUG][JWT] Usando info parcial del token', {
          workspaceId: tokenInfo.workspaceId,
          tenantId: tokenInfo.tenantId,
          userId: tokenInfo.userId,
          email: tokenInfo.email
        });
      }
      return tokenInfo;
    }
  }
  
  // 4. CORREGIDO: Usar configuración de workspace como último recurso
        infoLog('⚠️ Usando configuración de workspace como fallback');
  
  const fallbackInfo = {
    workspaceId: WORKSPACE_CONFIG.workspaceId,
    tenantId: WORKSPACE_CONFIG.tenantId,
    userId: null,
    email: null,
    role: null
  };
  
  if (import.meta.env.VITE_DEBUG === 'true' && import.meta.env.DEV) {
    console.debug('[DEBUG][JWT] Fallback usando configuración de workspace', {
      workspaceId: fallbackInfo.workspaceId,
      tenantId: fallbackInfo.tenantId
    });
  }
  
  return fallbackInfo;
};

/**
 * Genera un roomId con el formato correcto del backend
 * CORREGIDO: Agregar validación de autenticación para evitar ejecución prematura
 * @param conversationId - ID de la conversación
 * @returns RoomId en formato conversation:${conversationId} o null si no hay autenticación
 */
export const generateRoomId = (conversationId: string): string | null => {
  // CORREGIDO: Verificar autenticación antes de generar roomId
  const token = localStorage.getItem('access_token');
  if (!token || !isTokenValid(token)) {
    infoLog('🔗 Room ID - No se puede generar (sin autenticación válida)');
    return null;
  }

  // Verificar que el usuario esté autenticado
  const userInfo = getUserInfo();
  if (!userInfo.userId) {
    infoLog('🔗 Room ID - No se puede generar (userId null)');
    return null;
  }

  // CORREGIDO: Usar formato simple para coincidir con el backend
  const roomId = `conversation:${conversationId}`;
  
  infoLog('🔗 Room ID generado (formato simplificado):', {
    conversationId,
    roomId,
    userId: userInfo.userId
  });
  
  return roomId;
};

/**
 * Valida la configuración de rooms
 * CORREGIDO: Agregar verificación de autenticación para evitar ejecución prematura
 * @returns true si la configuración es válida, false si userId es null o no hay autenticación
 */
export const validateRoomConfiguration = (): boolean => {
  // CORREGIDO: Verificar autenticación antes de validar
  const token = localStorage.getItem('access_token');
  if (!token || !isTokenValid(token)) {
    infoLog('🔗 Room Config - No se puede validar (sin autenticación válida)');
    return false;
  }

  const userInfo = getUserInfo();
  const isValid = isValidUserInfo(userInfo);
  
  if (!isValid) {
          infoLog('⚠️ Configuración de rooms con userId null:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
  } else {
    infoLog('✅ Configuración de rooms válida:', {
      workspaceId: userInfo.workspaceId,
      tenantId: userInfo.tenantId,
      userId: userInfo.userId
    });
  }
  
  return isValid;
};
