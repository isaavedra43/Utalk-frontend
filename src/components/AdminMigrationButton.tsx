import React, { useState } from 'react';
import { RefreshCw, Wrench, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AdminMigrationButtonProps {
  className?: string;
  onMigrationComplete?: () => void;
}

export const AdminMigrationButton: React.FC<AdminMigrationButtonProps> = ({ 
  className = '',
  onMigrationComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleMigration = async () => {
    setIsLoading(true);
    setStatus('idle');
    setMessage('🔄 Migrando permisos de admin...');

    try {
      const response = await fetch('/api/admin-migration/force-migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('✅ ¡Migración exitosa! Recargando página...');
        
        // Llamar callback si existe
        if (onMigrationComplete) {
          onMigrationComplete();
        }
        
        // Recargar página después de 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data.message || 'Error del servidor');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      console.error('Error en migración de admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <button
        onClick={handleMigration}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white
          transition-all duration-200 transform hover:scale-105
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          }
          shadow-lg hover:shadow-xl
        `}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Migrando...
          </>
        ) : (
          <>
            <Wrench className="w-5 h-5" />
            🔧 Corregir Permisos de Admin
          </>
        )}
      </button>

      {message && (
        <div className={`
          flex items-center gap-3 p-4 rounded-lg border-2
          ${getStatusColor()}
        `}>
          {getStatusIcon()}
          <span className="font-medium">{message}</span>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Este botón migra automáticamente los permisos del admin</p>
        <p>al nuevo sistema de permisos de módulos.</p>
      </div>
    </div>
  );
};
