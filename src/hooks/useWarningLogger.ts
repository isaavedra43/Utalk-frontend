import { useRef } from 'react';

// Hook para evitar warnings repetitivos
export const useWarningLogger = () => {
  const loggedWarnings = useRef<Set<string>>(new Set());

  const logWarningOnce = (warningKey: string, message: string, data?: unknown) => {
    if (!loggedWarnings.current.has(warningKey)) {
      console.warn(message, data);
      loggedWarnings.current.add(warningKey);
    }
  };

  const clearWarnings = () => {
    loggedWarnings.current.clear();
  };

  return { logWarningOnce, clearWarnings };
}; 