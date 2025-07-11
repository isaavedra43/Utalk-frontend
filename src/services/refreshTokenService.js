/**
 * Servicio de Refresh Tokens
 * Implementa rotación segura de JWT con blacklist y token families
 * Nivel de seguridad empresarial con protección contra replay attacks
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
const { db } = require('../config');

class RefreshTokenService {
  constructor() {
    this.refreshTokens = new Map(); // Cache en memoria
    this.blacklistedTokens = new Set(); // Blacklist en memoria
    this.tokenFamilies = new Map(); // Familias de tokens
    
    // Limpiar tokens expirados cada 15 minutos
    setInterval(() => this.cleanupExpiredTokens(), 15 * 60 * 1000);
  }

  /**
   * Generar par de tokens (access + refresh)
   * @param {Object} user - Usuario
   * @returns {Object} - { accessToken, refreshToken, expiresIn }
   */
  async generateTokenPair(user) {
    try {
      // Generar access token (corta duración)
      const accessToken = this.generateAccessToken(user);
      
      // Generar refresh token (larga duración)
      const refreshToken = this.generateRefreshToken(user);
      
      // Crear familia de tokens
      const familyId = this.generateTokenFamily();
      
      // Guardar refresh token en BD y cache
      await this.storeRefreshToken(refreshToken, user.id, familyId);
      
      // Configurar caducidad
      const expiresIn = this.parseExpirationTime(config.jwt.accessTokenExpiresIn);
      
      logger.info('Token pair generated successfully', {
        userId: user.id,
        username: user.username,
        familyId,
        accessTokenExpiry: expiresIn
      });

      return {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };
    } catch (error) {
      logger.error('Error generating token pair', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Refrescar tokens usando refresh token
   * @param {string} refreshToken - Token de refresh
   * @returns {Object} - Nuevos tokens
   */
  async refreshTokens(refreshToken) {
    try {
      // Verificar que el refresh token no esté en blacklist
      if (this.isTokenBlacklisted(refreshToken)) {
        logger.warn('Attempted to use blacklisted refresh token', {
          tokenHash: this.hashToken(refreshToken)
        });
        throw new Error('Refresh token has been revoked');
      }

      // Verificar y decodificar refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret, {
          issuer: config.jwt.issuer
        });
      } catch (error) {
        logger.warn('Invalid refresh token used', {
          error: error.message,
          tokenHash: this.hashToken(refreshToken)
        });
        
        if (error.name === 'TokenExpiredError') {
          throw new Error('Refresh token has expired');
        }
        throw new Error('Invalid refresh token');
      }

      // Verificar que el token existe en la BD
      const storedToken = await this.getStoredRefreshToken(refreshToken);
      if (!storedToken) {
        logger.warn('Refresh token not found in database', {
          userId: decoded.userId,
          tokenHash: this.hashToken(refreshToken)
        });
        throw new Error('Refresh token not found');
      }

      // Verificar que el token no haya sido usado (protección contra replay)
      if (storedToken.used) {
        logger.error('SECURITY ALERT: Refresh token reuse detected', {
          userId: decoded.userId,
          familyId: storedToken.familyId,
          tokenHash: this.hashToken(refreshToken)
        });
        
        // Comprometer toda la familia de tokens
        await this.compromiseTokenFamily(storedToken.familyId);
        throw new Error('Token family compromised due to reuse');
      }

      // Marcar token como usado
      await this.markTokenAsUsed(refreshToken);

      // Obtener usuario actualizado
      const userModel = require('../models/userModel');
      const user = await userModel.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        logger.warn('User not found or inactive during token refresh', {
          userId: decoded.userId
        });
        throw new Error('User not found or inactive');
      }

      // Generar nuevos tokens
      const newTokenPair = await this.generateTokenPair(user);
      
      // Invalidar el refresh token anterior
      await this.revokeRefreshToken(refreshToken);

      logger.info('Tokens refreshed successfully', {
        userId: user.id,
        username: user.username,
        oldTokenHash: this.hashToken(refreshToken)
      });

      return newTokenPair;
    } catch (error) {
      logger.error('Error refreshing tokens', error);
      throw error;
    }
  }

  /**
   * Revocar refresh token
   * @param {string} refreshToken - Token a revocar
   */
  async revokeRefreshToken(refreshToken) {
    try {
      // Agregar a blacklist
      this.blacklistedTokens.add(this.hashToken(refreshToken));
      
      // Remover del cache
      this.refreshTokens.delete(refreshToken);
      
      // Marcar como revocado en BD
      await this.markTokenAsRevoked(refreshToken);
      
      logger.info('Refresh token revoked', {
        tokenHash: this.hashToken(refreshToken)
      });
    } catch (error) {
      logger.error('Error revoking refresh token', error);
      throw error;
    }
  }

  /**
   * Revocar todos los tokens de un usuario
   * @param {string} userId - ID del usuario
   */
  async revokeAllUserTokens(userId) {
    try {
      // Obtener todos los tokens del usuario
      const userTokens = await this.getUserRefreshTokens(userId);
      
      // Revocar cada token
      for (const token of userTokens) {
        await this.revokeRefreshToken(token.token);
      }
      
      logger.info('All user tokens revoked', {
        userId,
        tokenCount: userTokens.length
      });
    } catch (error) {
      logger.error('Error revoking all user tokens', error);
      throw error;
    }
  }

  /**
   * Comprometer familia de tokens
   * @param {string} familyId - ID de la familia
   */
  async compromiseTokenFamily(familyId) {
    try {
      // Obtener todos los tokens de la familia
      const familyTokens = await this.getTokenFamily(familyId);
      
      // Revocar todos los tokens
      for (const token of familyTokens) {
        await this.revokeRefreshToken(token.token);
      }
      
      // Marcar familia como comprometida
      await this.markFamilyAsCompromised(familyId);
      
      logger.error('Token family compromised', {
        familyId,
        tokenCount: familyTokens.length
      });
    } catch (error) {
      logger.error('Error compromising token family', error);
      throw error;
    }
  }

  /**
   * Generar access token
   * @param {Object} user - Usuario
   * @returns {string} - JWT access token
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.accessTokenExpiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });
  }

  /**
   * Generar refresh token
   * @param {Object} user - Usuario
   * @returns {string} - JWT refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      type: 'refresh',
      jti: crypto.randomUUID(), // Identificador único
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, config.jwt.refreshTokenSecret, {
      expiresIn: config.jwt.refreshTokenExpiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience
    });
  }

  /**
   * Generar ID de familia de tokens
   * @returns {string} - ID único de familia
   */
  generateTokenFamily() {
    return crypto.randomUUID();
  }

  /**
   * Almacenar refresh token en BD
   * @param {string} refreshToken - Token
   * @param {string} userId - ID del usuario
   * @param {string} familyId - ID de la familia
   */
  async storeRefreshToken(refreshToken, userId, familyId) {
    try {
      const tokenData = {
        token: refreshToken,
        tokenHash: this.hashToken(refreshToken),
        userId,
        familyId,
        used: false,
        revoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.parseExpirationTime(config.jwt.refreshTokenExpiresIn) * 1000),
        lastUsed: null
      };

      // Guardar en Firestore
      await db.collection('refreshTokens').add(tokenData);
      
      // Guardar en cache
      this.refreshTokens.set(refreshToken, tokenData);
      
      // Agregar a familia
      if (!this.tokenFamilies.has(familyId)) {
        this.tokenFamilies.set(familyId, new Set());
      }
      this.tokenFamilies.get(familyId).add(refreshToken);
      
    } catch (error) {
      logger.error('Error storing refresh token', error);
      throw error;
    }
  }

  /**
   * Obtener refresh token almacenado
   * @param {string} refreshToken - Token
   * @returns {Object} - Datos del token
   */
  async getStoredRefreshToken(refreshToken) {
    try {
      // Buscar en cache primero
      if (this.refreshTokens.has(refreshToken)) {
        return this.refreshTokens.get(refreshToken);
      }

      // Buscar en BD
      const tokenHash = this.hashToken(refreshToken);
      const snapshot = await db.collection('refreshTokens')
        .where('tokenHash', '==', tokenHash)
        .where('revoked', '==', false)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const tokenData = snapshot.docs[0].data();
      tokenData.firestoreId = snapshot.docs[0].id;
      
      // Agregar a cache
      this.refreshTokens.set(refreshToken, tokenData);
      
      return tokenData;
    } catch (error) {
      logger.error('Error getting stored refresh token', error);
      throw error;
    }
  }

  /**
   * Marcar token como usado
   * @param {string} refreshToken - Token
   */
  async markTokenAsUsed(refreshToken) {
    try {
      const tokenHash = this.hashToken(refreshToken);
      
      // Actualizar en BD
      const snapshot = await db.collection('refreshTokens')
        .where('tokenHash', '==', tokenHash)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          used: true,
          lastUsed: new Date()
        });
      }

      // Actualizar cache
      if (this.refreshTokens.has(refreshToken)) {
        const tokenData = this.refreshTokens.get(refreshToken);
        tokenData.used = true;
        tokenData.lastUsed = new Date();
      }
    } catch (error) {
      logger.error('Error marking token as used', error);
      throw error;
    }
  }

  /**
   * Marcar token como revocado
   * @param {string} refreshToken - Token
   */
  async markTokenAsRevoked(refreshToken) {
    try {
      const tokenHash = this.hashToken(refreshToken);
      
      // Actualizar en BD
      const snapshot = await db.collection('refreshTokens')
        .where('tokenHash', '==', tokenHash)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({
          revoked: true,
          revokedAt: new Date()
        });
      }

      // Actualizar cache
      if (this.refreshTokens.has(refreshToken)) {
        const tokenData = this.refreshTokens.get(refreshToken);
        tokenData.revoked = true;
        tokenData.revokedAt = new Date();
      }
    } catch (error) {
      logger.error('Error marking token as revoked', error);
      throw error;
    }
  }

  /**
   * Obtener todos los tokens de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Array} - Lista de tokens
   */
  async getUserRefreshTokens(userId) {
    try {
      const snapshot = await db.collection('refreshTokens')
        .where('userId', '==', userId)
        .where('revoked', '==', false)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error getting user refresh tokens', error);
      throw error;
    }
  }

  /**
   * Obtener tokens de una familia
   * @param {string} familyId - ID de la familia
   * @returns {Array} - Lista de tokens
   */
  async getTokenFamily(familyId) {
    try {
      const snapshot = await db.collection('refreshTokens')
        .where('familyId', '==', familyId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Error getting token family', error);
      throw error;
    }
  }

  /**
   * Marcar familia como comprometida
   * @param {string} familyId - ID de la familia
   */
  async markFamilyAsCompromised(familyId) {
    try {
      // Crear registro de familia comprometida
      await db.collection('compromisedTokenFamilies').add({
        familyId,
        compromisedAt: new Date(),
        reason: 'Token reuse detected'
      });

      // Remover de cache
      this.tokenFamilies.delete(familyId);
    } catch (error) {
      logger.error('Error marking family as compromised', error);
      throw error;
    }
  }

  /**
   * Verificar si token está en blacklist
   * @param {string} token - Token
   * @returns {boolean} - True si está en blacklist
   */
  isTokenBlacklisted(token) {
    return this.blacklistedTokens.has(this.hashToken(token));
  }

  /**
   * Hash de token para seguridad
   * @param {string} token - Token
   * @returns {string} - Hash SHA256
   */
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Parsear tiempo de expiración
   * @param {string} expiresIn - Tiempo (ej: '15m', '7d')
   * @returns {number} - Segundos
   */
  parseExpirationTime(expiresIn) {
    const units = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    };
    
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiration format: ${expiresIn}`);
    }
    
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Limpiar tokens expirados
   */
  async cleanupExpiredTokens() {
    try {
      const now = new Date();
      
      // Limpiar de BD
      const snapshot = await db.collection('refreshTokens')
        .where('expiresAt', '<', now)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (!snapshot.empty) {
        await batch.commit();
        logger.info('Expired refresh tokens cleaned up', {
          count: snapshot.docs.length
        });
      }

      // Limpiar cache
      for (const [token, data] of this.refreshTokens.entries()) {
        if (data.expiresAt < now) {
          this.refreshTokens.delete(token);
        }
      }

      // Limpiar blacklist (tokens que ya expiraron)
      const expiredHashes = new Set();
      for (const tokenHash of this.blacklistedTokens) {
        // Verificar si el token ya expiró (simplificado)
        // En una implementación real, necesitarías más lógica aquí
        expiredHashes.add(tokenHash);
      }
      
      // Remover algunos tokens antiguos (rotación de blacklist)
      if (this.blacklistedTokens.size > 10000) {
        const toRemove = Array.from(this.blacklistedTokens).slice(0, 1000);
        toRemove.forEach(hash => this.blacklistedTokens.delete(hash));
      }

    } catch (error) {
      logger.error('Error cleaning up expired tokens', error);
    }
  }

  /**
   * Obtener estadísticas de tokens
   * @returns {Object} - Estadísticas
   */
  async getTokenStats() {
    try {
      const activeTokens = await db.collection('refreshTokens')
        .where('revoked', '==', false)
        .where('used', '==', false)
        .count()
        .get();

      const revokedTokens = await db.collection('refreshTokens')
        .where('revoked', '==', true)
        .count()
        .get();

      const compromisedFamilies = await db.collection('compromisedTokenFamilies')
        .count()
        .get();

      return {
        activeTokens: activeTokens.data().count,
        revokedTokens: revokedTokens.data().count,
        compromisedFamilies: compromisedFamilies.data().count,
        cacheSize: this.refreshTokens.size,
        blacklistSize: this.blacklistedTokens.size,
        familiesTracked: this.tokenFamilies.size
      };
    } catch (error) {
      logger.error('Error getting token stats', error);
      return {
        activeTokens: 0,
        revokedTokens: 0,
        compromisedFamilies: 0,
        cacheSize: this.refreshTokens.size,
        blacklistSize: this.blacklistedTokens.size,
        familiesTracked: this.tokenFamilies.size
      };
    }
  }
}

// Singleton instance
const refreshTokenService = new RefreshTokenService();

module.exports = refreshTokenService; 