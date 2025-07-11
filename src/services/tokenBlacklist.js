/**
 * Servicio de Blacklist de Tokens JWT
 * Gestiona tokens invalidados para logout real y seguridad
 */

const { db } = require('../../firebase');
const logger = require('../utils/logger');

class TokenBlacklistService {
  constructor() {
    this.collection = 'token_blacklist';
    this.memoryCache = new Map(); // Cache en memoria para mejor performance
    this.maxCacheSize = 10000; // Máximo tokens en cache
    this.cleanupInterval = 60 * 60 * 1000; // Limpiar cada hora
    
    // Iniciar limpieza automática
    this.startCleanupInterval();
  }

  /**
   * Agregar token a la blacklist
   * @param {string} token - Token JWT a invalidar
   * @param {string} userId - ID del usuario
   * @param {Date} expiresAt - Fecha de expiración del token
   * @param {string} reason - Razón de invalidación
   */
  async addToken(token, userId, expiresAt, reason = 'logout') {
    try {
      const tokenHash = this.hashToken(token);
      const blacklistEntry = {
        tokenHash,
        userId,
        expiresAt: expiresAt instanceof Date ? expiresAt : new Date(expiresAt * 1000),
        reason,
        blacklistedAt: new Date(),
        ip: null, // Se puede agregar si se necesita
        userAgent: null
      };

      // Agregar a Firestore
      await db.collection(this.collection).add(blacklistEntry);
      
      // Agregar a cache en memoria
      this.memoryCache.set(tokenHash, blacklistEntry);
      
      // Limpiar cache si está muy grande
      if (this.memoryCache.size > this.maxCacheSize) {
        this.cleanupMemoryCache();
      }

      logger.info('Token added to blacklist', {
        userId,
        reason,
        tokenHash: tokenHash.substring(0, 10) + '...',
        expiresAt: blacklistEntry.expiresAt
      });

    } catch (error) {
      logger.error('Failed to add token to blacklist', error, {
        userId,
        reason,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verificar si un token está en la blacklist
   * @param {string} token - Token JWT a verificar
   * @returns {Promise<boolean>} - True si está en blacklist
   */
  async isTokenBlacklisted(token) {
    try {
      const tokenHash = this.hashToken(token);
      
      // Verificar primero en cache de memoria
      if (this.memoryCache.has(tokenHash)) {
        const entry = this.memoryCache.get(tokenHash);
        
        // Verificar si ya expiró naturalmente
        if (new Date() > entry.expiresAt) {
          this.memoryCache.delete(tokenHash);
          return false;
        }
        
        return true;
      }

      // Verificar en Firestore
      const query = db.collection(this.collection)
        .where('tokenHash', '==', tokenHash)
        .where('expiresAt', '>', new Date())
        .limit(1);

      const snapshot = await query.get();
      
      if (!snapshot.empty) {
        const entry = snapshot.docs[0].data();
        
        // Agregar a cache para futuras consultas
        this.memoryCache.set(tokenHash, entry);
        
        logger.debug('Token found in blacklist', {
          tokenHash: tokenHash.substring(0, 10) + '...',
          reason: entry.reason,
          blacklistedAt: entry.blacklistedAt
        });
        
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Failed to check token blacklist', error, {
        error: error.message
      });
      
      // En caso de error, permitir el token (fail open)
      // En producción, podrías querer fail closed
      return false;
    }
  }

  /**
   * Invalidar todos los tokens de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} reason - Razón de invalidación
   */
  async invalidateAllUserTokens(userId, reason = 'security_breach') {
    try {
      // Crear entrada especial para invalidar todos los tokens del usuario
      const blacklistEntry = {
        tokenHash: `USER_ALL_${userId}`,
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        reason,
        blacklistedAt: new Date(),
        invalidateAll: true
      };

      await db.collection(this.collection).add(blacklistEntry);
      
      // Limpiar cache de memoria para este usuario
      for (const [hash, entry] of this.memoryCache.entries()) {
        if (entry.userId === userId) {
          this.memoryCache.delete(hash);
        }
      }

      logger.warn('All user tokens invalidated', {
        userId,
        reason
      });

    } catch (error) {
      logger.error('Failed to invalidate all user tokens', error, {
        userId,
        reason,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verificar si todos los tokens de un usuario están invalidados
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>} - True si todos están invalidados
   */
  async areAllUserTokensInvalidated(userId) {
    try {
      const query = db.collection(this.collection)
        .where('userId', '==', userId)
        .where('invalidateAll', '==', true)
        .where('expiresAt', '>', new Date())
        .limit(1);

      const snapshot = await query.get();
      return !snapshot.empty;

    } catch (error) {
      logger.error('Failed to check user token invalidation', error, {
        userId,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Limpiar tokens expirados de la blacklist
   */
  async cleanupExpiredTokens() {
    try {
      const now = new Date();
      
      // Limpiar de Firestore
      const expiredQuery = db.collection(this.collection)
        .where('expiresAt', '<=', now);

      const expiredSnapshot = await expiredQuery.get();
      const batch = db.batch();
      let deletedCount = 0;

      expiredSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      if (deletedCount > 0) {
        await batch.commit();
      }

      // Limpiar cache de memoria
      for (const [hash, entry] of this.memoryCache.entries()) {
        if (now > entry.expiresAt) {
          this.memoryCache.delete(hash);
        }
      }

      if (deletedCount > 0) {
        logger.info('Cleaned up expired tokens', {
          deletedCount,
          cacheSize: this.memoryCache.size
        });
      }

    } catch (error) {
      logger.error('Failed to cleanup expired tokens', error);
    }
  }

  /**
   * Limpiar cache de memoria cuando está muy grande
   */
  cleanupMemoryCache() {
    const now = new Date();
    let removedCount = 0;

    // Remover tokens expirados primero
    for (const [hash, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(hash);
        removedCount++;
      }
    }

    // Si aún está muy grande, remover los más antiguos
    if (this.memoryCache.size > this.maxCacheSize * 0.8) {
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].blacklistedAt - b[1].blacklistedAt);

      const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2));
      toRemove.forEach(([hash]) => {
        this.memoryCache.delete(hash);
        removedCount++;
      });
    }

    logger.debug('Memory cache cleanup completed', {
      removedCount,
      currentSize: this.memoryCache.size
    });
  }

  /**
   * Iniciar intervalo de limpieza automática
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, this.cleanupInterval);

    logger.info('Token blacklist cleanup interval started', {
      intervalMs: this.cleanupInterval
    });
  }

  /**
   * Hash del token para almacenamiento seguro
   * @param {string} token - Token JWT
   * @returns {string} - Hash del token
   */
  hashToken(token) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Obtener estadísticas de la blacklist
   * @returns {Promise<Object>} - Estadísticas
   */
  async getStats() {
    try {
      const snapshot = await db.collection(this.collection).get();
      const now = new Date();
      
      let active = 0;
      let expired = 0;
      let byReason = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const expiresAt = data.expiresAt.toDate();
        
        if (expiresAt > now) {
          active++;
        } else {
          expired++;
        }
        
        byReason[data.reason] = (byReason[data.reason] || 0) + 1;
      });

      return {
        total: snapshot.size,
        active,
        expired,
        memoryCache: this.memoryCache.size,
        byReason
      };

    } catch (error) {
      logger.error('Failed to get blacklist stats', error);
      return {
        total: 0,
        active: 0,
        expired: 0,
        memoryCache: this.memoryCache.size,
        byReason: {}
      };
    }
  }
}

module.exports = new TokenBlacklistService(); 