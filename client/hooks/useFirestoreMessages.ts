import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  where,
  startAfter,
  getDocs,
  updateDoc,
  addDoc,
  serverTimestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/utils';
import { normalizeMessage, toISOStringFromFirestore } from '@/lib/apiUtils';
import type { Message } from '@/types/api';

interface UseFirestoreMessagesOptions {
  limit?: number;
  realTime?: boolean;
}

interface FirestoreMessage {
  id: string;
  conversationId: string;
  content: string;
  text?: string;
  sender: 'agent' | 'client';
  timestamp?: any; // Firestore timestamp
  createdAt?: any; // Firestore timestamp
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  type: 'text' | 'image' | 'file' | 'audio';
  attachments?: any[];
  [key: string]: any;
}

export function useFirestoreMessages(
  conversationId: string, 
  options: UseFirestoreMessagesOptions = {}
) {
  const { limit: messageLimit = 50, realTime = true } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const queryClient = useQueryClient();

  // Normalizar mensaje de Firestore a nuestro tipo
  const normalizeFirestoreMessage = useCallback((doc: any): Message => {
    const data = doc.data();
    
    return normalizeMessage({
      id: doc.id,
      conversationId: data.conversationId || conversationId,
      content: data.content || data.text || data.body || '',
      sender: data.sender || 'client',
      // 🔥 SOLUCION: Intentar tanto timestamp como createdAt
      timestamp: data.timestamp || data.createdAt,
      status: data.status || 'sent',
      type: data.type || 'text',
      attachments: data.attachments || []
    });
  }, [conversationId]);

  // Cargar mensajes iniciales
  const loadMessages = useCallback(async (loadMore = false) => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);

      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const constraints: QueryConstraint[] = [];

      // 🔥 SOLUCION: Crear query que funcione con ambos campos
      // Primero intentar con timestamp, luego con createdAt
      try {
        constraints.push(orderBy('timestamp', 'desc'));
      } catch (timestampError) {
        logger.api('Campo timestamp no existe, usando createdAt', { conversationId });
        constraints.push(orderBy('createdAt', 'desc'));
      }

      constraints.push(limit(messageLimit));

      if (loadMore && lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      // 📊 Monitoreo de performance
      const startTime = Date.now();
      const q = query(messagesRef, ...constraints);
      const snapshot = await getDocs(q);
      const queryTime = Date.now() - startTime;
      
      // Log de performance
      logger.api('📊 Firestore query performance', {
        collection: 'messages',
        conversationId,
        queryTime: `${queryTime}ms`,
        resultCount: snapshot.size,
        hasIndex: queryTime < 100,
        isLoadMore: loadMore
      });

      // Alerta si query es lenta
      const SLOW_QUERY_THRESHOLD = 200;
      if (queryTime > SLOW_QUERY_THRESHOLD) {
        logger.api('⚠️ Query lenta detectada', {
          queryTime,
          collection: 'messages', 
          conversationId,
          suggestion: 'Verificar índices de Firestore'
        }, true);
      }

      if (snapshot.empty) {
        logger.api('No hay mensajes en esta conversación', { conversationId });
        setMessages(loadMore ? messages : []);
        setHasMore(false);
        return;
      }

      const newMessages = snapshot.docs.map(normalizeFirestoreMessage);
      
      // Ordenar por fecha (más recientes al final)
      newMessages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      if (loadMore) {
        setMessages(prev => [...prev, ...newMessages]);
      } else {
        setMessages(newMessages);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === messageLimit);

      logger.api('Mensajes cargados exitosamente', { 
        conversationId, 
        count: newMessages.length,
        hasMore: snapshot.docs.length === messageLimit
      });

    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // 🚨 Manejo específico para índices faltantes
      if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        logger.api('🚨 Índice de Firestore faltante detectado', {
          error: error.message,
          conversationId,
          action: 'Crear índice en Firebase Console',
          helpUrl: 'Revisar firestore-indexes-guide.md'
        }, true);
        
        const { toast } = await import('@/hooks/use-toast');
        toast({
          variant: "destructive",
          title: "Índice de base de datos faltante",
          description: "La consulta requiere un índice. Contacta al administrador para optimizar la base de datos.",
        });
      } else {
        logger.api('Error cargando mensajes', { conversationId, error: errorMessage }, true);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [conversationId, messageLimit, lastDoc, messages, normalizeFirestoreMessage]);

  // Setup real-time listener
  useEffect(() => {
    if (!conversationId || !realTime) return;

    logger.socket('Configurando listener de Firestore en tiempo real', { conversationId });

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    // Configurar query para tiempo real (solo mensajes nuevos)
    let q;
    try {
      q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
    } catch (timestampError) {
      q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newMessage = normalizeFirestoreMessage(change.doc);
            
            logger.socket('Nuevo mensaje recibido en tiempo real', { 
              messageId: newMessage.id,
              conversationId,
              sender: newMessage.sender
            });

            setMessages(prev => {
              // Evitar duplicados
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;

              return [...prev, newMessage].sort((a, b) => 
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
            });

            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          }
        });
      },
      (error) => {
        logger.socket('Error en listener de tiempo real', { 
          conversationId, 
          error: error.message 
        }, true);
        setError(error.message);
      }
    );

    return () => {
      logger.socket('Desconectando listener de tiempo real', { conversationId });
      unsubscribe();
    };
  }, [conversationId, realTime, queryClient, normalizeFirestoreMessage]);

  // Cargar mensajes iniciales cuando cambie la conversación
  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setLastDoc(null);
      setHasMore(true);
      loadMessages(false);
    }
  }, [conversationId]);

  // Enviar mensaje
  const sendMessage = useCallback(async (content: string, type: 'text' | 'image' | 'file' | 'audio' = 'text') => {
    if (!conversationId || !content.trim()) return null;

    try {
      logger.api('Enviando mensaje a Firestore', { conversationId, content, type });

      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      
      const messageData: Partial<FirestoreMessage> = {
        conversationId,
        content: content.trim(),
        sender: 'agent', // Asumiendo que el frontend es usado por agentes
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(), // 🔥 SOLUCION: Agregar ambos campos
        status: 'sending',
        type,
        attachments: []
      };

      const docRef = await addDoc(messagesRef, messageData);

      // Actualizar estado local inmediatamente
      const newMessage: Message = normalizeMessage({
        id: docRef.id,
        ...messageData,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'sent'
      });

      setMessages(prev => [...prev, newMessage]);

      logger.api('Mensaje enviado exitosamente', { messageId: docRef.id, conversationId });

      return newMessage;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error enviando mensaje';
      logger.api('Error enviando mensaje', { conversationId, error: errorMessage }, true);
      setError(errorMessage);
      return null;
    }
  }, [conversationId]);

  // Marcar mensaje como leído
  const markAsRead = useCallback(async (messageId: string) => {
    if (!conversationId) return;

    try {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(messageRef, { status: 'read' });

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        )
      );

      logger.api('Mensaje marcado como leído', { messageId, conversationId });

    } catch (error) {
      logger.api('Error marcando mensaje como leído', { 
        messageId, 
        conversationId, 
        error: error instanceof Error ? error.message : 'Error desconocido'
      }, true);
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore: () => loadMessages(true),
    sendMessage,
    markAsRead,
    refresh: () => loadMessages(false)
  };
} 