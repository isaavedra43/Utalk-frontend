import { useCallback, useRef } from 'react';

export const useTyping = (conversationId: string | null, startTyping: (conversationId: string) => void, stopTyping: (conversationId: string) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(conversationId);
    }

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Auto-stop typing después de 3 segundos
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping(conversationId);
    }, 3000);
  }, [conversationId, startTyping, stopTyping]);

  const handleStopTyping = useCallback(() => {
    if (!conversationId) return;

    isTypingRef.current = false;
    stopTyping(conversationId);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [conversationId, stopTyping]);

  return { handleTyping, handleStopTyping };
}; 