import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { useAppStore } from './stores/useAppStore';
import { mockConversations } from './services/conversations';
import { mockMessages } from './services/messages';
import './index.css';

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente para inicializar datos
const AppInitializer: React.FC = () => {
  const { setConversations, setMessages } = useAppStore();

  useEffect(() => {
    // Inicializar conversaciones en el store
    setConversations(mockConversations);
    
    // Inicializar mensajes en el store
    const messagesByConversation: Record<string, typeof mockMessages> = {};
    mockMessages.forEach(message => {
      if (!messagesByConversation[message.conversationId]) {
        messagesByConversation[message.conversationId] = [];
      }
      messagesByConversation[message.conversationId].push(message);
    });
    
    Object.entries(messagesByConversation).forEach(([conversationId, messages]) => {
      setMessages(conversationId, messages);
    });
  }, [setConversations, setMessages]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer />
      <MainLayout />
    </QueryClientProvider>
  );
}

export default App;
