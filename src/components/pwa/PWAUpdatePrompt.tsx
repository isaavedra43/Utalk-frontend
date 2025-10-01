import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

export const PWAUpdatePrompt: React.FC = () => {
  const { needRefresh, offlineReady, updateServiceWorker } = usePWA();

  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  const handleDismiss = async () => {
    await updateServiceWorker(false);
  };

  return (
    <>
      {/* Notificación de actualización disponible */}
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Nueva versión disponible
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Hay una actualización de UTalk lista para instalar
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 shadow-lg shadow-green-500/30"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Actualizar ahora
                    </button>
                    
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
                    >
                      Más tarde
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación de listo para usar offline */}
      <AnimatePresence>
        {offlineReady && !needRefresh && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg 
                      className="w-6 h-6 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Listo para usar sin conexión
                  </h3>
                  <p className="text-sm text-gray-600">
                    UTalk está disponible sin conexión a internet
                  </p>
                </div>

                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

