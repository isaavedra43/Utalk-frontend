import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// ✅ MIGRACIÓN: Exportar también el hook estable para uso futuro
export { useStableAuth as useAuth } from '../hooks/useStableAuth'; 