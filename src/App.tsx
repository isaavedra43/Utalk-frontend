import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { validateConfig } from './config/firebase';
import { MainLayout } from './components/layout/MainLayout';

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // Validar configuración al cargar la app
  React.useEffect(() => {
    if (!validateConfig()) {
      console.error('Configuración de entorno inválida');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout />
      
      {/* Toaster para notificaciones */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
