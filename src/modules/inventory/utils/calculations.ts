// Utilidades para cálculos de inventario

import type { Piece, Platform } from '../types';

/**
 * Calcula los metros lineales de una pieza
 */
export const calculateLinearMeters = (length: number, standardWidth: number): number => {
  return parseFloat((length * standardWidth).toFixed(3));
};

/**
 * Calcula los totales de una plataforma
 */
export const calculatePlatformTotals = (pieces: Piece[]): { totalLinearMeters: number; totalLength: number } => {
  const totalLinearMeters = pieces.reduce((sum, piece) => sum + piece.linearMeters, 0);
  const totalLength = pieces.reduce((sum, piece) => sum + piece.length, 0);
  
  return {
    totalLinearMeters: parseFloat(totalLinearMeters.toFixed(3)),
    totalLength: parseFloat(totalLength.toFixed(3))
  };
};

/**
 * Valida una longitud de entrada
 */
export const validateLength = (length: number): { valid: boolean; error?: string } => {
  if (isNaN(length)) {
    return { valid: false, error: 'Debe ser un número válido' };
  }
  
  if (length <= 0) {
    return { valid: false, error: 'La longitud debe ser mayor a 0' };
  }
  
  if (length > 10) {
    return { valid: false, error: 'La longitud no puede exceder 10 metros' };
  }
  
  return { valid: true };
};

/**
 * Valida un ancho estándar
 */
export const validateStandardWidth = (width: number): { valid: boolean; error?: string } => {
  if (isNaN(width)) {
    return { valid: false, error: 'Debe ser un número válido' };
  }
  
  if (width <= 0) {
    return { valid: false, error: 'El ancho debe ser mayor a 0' };
  }
  
  if (width > 5) {
    return { valid: false, error: 'El ancho no puede exceder 5 metros' };
  }
  
  return { valid: true };
};

/**
 * Formatea un número a string con decimales
 */
export const formatNumber = (num: number, decimals: number = 3): string => {
  return num.toFixed(decimals);
};

/**
 * Genera un ID único
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Genera el número de la siguiente pieza
 */
export const getNextPieceNumber = (pieces: Piece[]): number => {
  if (pieces.length === 0) return 1;
  return Math.max(...pieces.map(p => p.number)) + 1;
};

