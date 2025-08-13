
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout/MainLayout';
import { AuthModule } from './modules/auth/AuthModule';
import { AuthProvider } from './contexts/AuthContext';
import { useAuthContext } from './contexts/useAuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './index.css';

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 1,
    },
  },
});

function AppContent() {
  const { isAuthenticated, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <MainLayout /> : <AuthModule />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
