
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <WebSocketProvider>
          <Routes>
            {/* Ruta de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Ruta principal del chat */}
            <Route path="/chat" element={<MainLayout />} />
            
            {/* Ruta por defecto - redirigir a login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Ruta catch-all - redirigir a login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </WebSocketProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
