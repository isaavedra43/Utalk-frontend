import { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';

// Asegúrate de que Firebase se inicialice solo una vez
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

export interface Conversation {
  id: string;
  phoneNumber: string;
  lastText: string;
  lastTimestamp: Timestamp;
  channel: string;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Timestamp;
  channel: string;
}

export const useRealtimeConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState({ conversations: true, messages: false });
  const [error, setError] = useState<Error | null>(null);

  // Efecto para escuchar las conversaciones en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('lastMessageTimestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const conversationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];
        setConversations(conversationsData);
        setLoading((prev) => ({ ...prev, conversations: false }));
      },
      (err) => {
        console.error('Error escuchando conversaciones:', err);
        setError(err);
        setLoading((prev) => ({ ...prev, conversations: false }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Efecto para escuchar los mensajes de la conversación seleccionada
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    setLoading((prev) => ({ ...prev, messages: true }));
    const messagesQuery = query(
      collection(db, 'conversations', selectedConversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (querySnapshot) => {
        const messagesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];
        setMessages(messagesData);
        setLoading((prev) => ({ ...prev, messages: false }));
      },
      (err) => {
        console.error('Error escuchando mensajes:', err);
        setError(err);
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    );

    return () => unsubscribe();
  }, [selectedConversationId]);

  return {
    conversations,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    loading,
    error,
  };
}; 