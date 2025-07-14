import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// SAFE BROWSER HELPERS - Protección contra crashes en SSR/producción
// =============================================================================

/**
 * Safe localStorage access - Previene crashes en SSR y producción
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return null;
      }
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn(`[safeLocalStorage] Error getting ${key}:`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`[safeLocalStorage] Error setting ${key}:`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[safeLocalStorage] Error removing ${key}:`, error);
      return false;
    }
  }
};

/**
 * Safe window access - Previene crashes cuando window no existe
 */
export const safeWindow = {
  isAvailable: (): boolean => {
    return typeof window !== "undefined";
  },

  getInnerWidth: (): number => {
    if (typeof window === "undefined") return 1024; // Default desktop width
    return window.innerWidth;
  },

  addEventListener: (event: string, handler: EventListener): (() => void) => {
    if (typeof window === "undefined") {
      return () => {}; // No-op cleanup
    }
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  },

  redirect: (url: string): void => {
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  }
};

/**
 * Safe document access - Previene crashes cuando document no existe
 */
export const safeDocument = {
  isAvailable: (): boolean => {
    return typeof document !== "undefined";
  },

  getElementById: (id: string): HTMLElement | null => {
    if (typeof document === "undefined") return null;
    return document.getElementById(id);
  },

  addEventListener: (event: string, handler: EventListener): (() => void) => {
    if (typeof document === "undefined") {
      return () => {}; // No-op cleanup
    }
    document.addEventListener(event, handler);
    return () => document.removeEventListener(event, handler);
  },

  getVisibilityState: (): DocumentVisibilityState | "visible" => {
    if (typeof document === "undefined") return "visible";
    return document.visibilityState;
  }
};
