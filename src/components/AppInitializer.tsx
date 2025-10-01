/**
 * Componente inicializador de la aplicación
 * Maneja la carga inicial y evita pantallas en blanco
 */
import React, { useEffect, useState } from 'react';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Timeout de seguridad para evitar pantallas en blanco indefinidas
    const initTimeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('⚠️ AppInitializer - Timeout de inicialización alcanzado');
        setInitializationError('Tiempo de inicialización excedido');
        setIsInitialized(true);
      }
    }, 8000); // 8 segundos máximo

    // ✅ Verificar si hay contenido en el DOM
    const checkContent = () => {
      const root = document.getElementById('root');
      const hasContent = root && root.children.length > 0;
      
      if (hasContent || isInitialized) {
        clearTimeout(initTimeout);
        setIsInitialized(true);
      }
    };

    // ✅ Verificar inmediatamente y cada 500ms
    checkContent();
    const interval = setInterval(checkContent, 500);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
    };
  }, [isInitialized]);

  // ✅ Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inicializando UTalk...
          </h3>
          <p className="text-sm text-gray-600">
            Preparando la aplicación
          </p>
        </div>
      </div>
    );
  }

  // ✅ Mostrar error si hay problema de inicialización
  if (initializationError) {
    return (
      <div className="flex h-screen w-full bg-gray-100 items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error de Inicialización
          </h3>
          <p className="text-gray-600 mb-4">
            {initializationError}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔄 Recargar Aplicación
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              🧹 Limpiar y Reiniciar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Aplicación lista
  return <>{children}</>;
};
