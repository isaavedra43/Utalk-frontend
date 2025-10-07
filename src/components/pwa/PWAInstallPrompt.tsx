import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Plus } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { useLocation } from 'react-router-dom';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isIOS, isAndroid, isInstalled, promptInstall, dismissInstallPrompt } = usePWA();
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissedUntilNavigation, setDismissedUntilNavigation] = useState(false);
  const location = useLocation();

  // Al cambiar de ruta, volver a mostrar el banner si se había cerrado temporalmente
  useEffect(() => {
    setDismissedUntilNavigation(false);
  }, [location.pathname]);

  // No mostrar si ya está instalada
  if (isInstalled) {
    return null;
  }

  // Android: Usar el prompt nativo
  const handleAndroidInstall = async () => {
    await promptInstall();
  };

  // iOS: Mostrar instrucciones
  const handleIOSInstall = () => {
    setShowInstructions(true);
  };

  // Cerrar instrucciones
  const closeInstructions = () => {
    setShowInstructions(false);
    dismissInstallPrompt();
  };

  return (
    <>
      {/* Banner de instalación Android */}
      <AnimatePresence>
        {isInstallable && isAndroid && !showInstructions && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <img 
                    src="/pwa-icons/icon-192x192.png" 
                    alt="UTalk" 
                    className="w-10 h-10 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-white text-2xl font-bold">U</span>';
                    }}
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Instalar UTalk
                </h3>
                <p className="text-sm text-gray-600">
                  Accede más rápido sin usar el navegador
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={dismissInstallPrompt}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleAndroidInstall}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  <Download className="w-4 h-4" />
                  Instalar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de instalación iOS */}
      <AnimatePresence>
        {isIOS && !isInstalled && !showInstructions && !dismissedUntilNavigation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <img 
                    src="/pwa-icons/icon-192x192.png" 
                    alt="UTalk" 
                    className="w-10 h-10 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-white text-2xl font-bold">U</span>';
                    }}
                  />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Agregar a pantalla de inicio
                </h3>
                <p className="text-sm text-gray-600">
                  Instala UTalk en tu iPhone
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDismissedUntilNavigation(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>

                <button
                  onClick={handleIOSInstall}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30"
                >
                  Ver cómo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de instrucciones iOS */}
      <AnimatePresence>
        {showInstructions && isIOS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeInstructions}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeInstructions}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <img 
                    src="/pwa-icons/icon-192x192.png" 
                    alt="UTalk" 
                    className="w-12 h-12 rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-white text-3xl font-bold">U</span>';
                    }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Instalar UTalk
                </h2>
                <p className="text-gray-600">
                  Sigue estos pasos para agregar UTalk a tu pantalla de inicio
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1">
                      Toca el botón de compartir
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Share className="w-5 h-5 text-blue-600" />
                      <span>En la barra inferior de Safari</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1">
                      Selecciona "Agregar a pantalla de inicio"
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span>Busca esta opción en el menú</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1">
                      Confirma la instalación
                    </p>
                    <p className="text-sm text-gray-600">
                      Toca "Agregar" y listo
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={closeInstructions}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

