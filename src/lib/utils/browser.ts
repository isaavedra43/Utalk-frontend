/**
 * Helper para detectar si estamos en el navegador
 * Reemplaza import { browser } from '$app/environment'
 */
export const browser = typeof window !== 'undefined';
