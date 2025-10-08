import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, RefreshCw, Check, X } from 'lucide-react';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSignature: (signatureData: { name: string; signatureImage: string; date: string }) => void;
  title?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  isOpen,
  onClose,
  onSignature,
  title = 'Firma Electrónica'
}: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [name, setName] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  // const [savedSignature, setSavedSignature] = useState<string | null>(null); // Para uso futuro

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.strokeStyle = '#000000';
        context.lineJoin = 'round';
        setCtx(context);

        // Configurar tamaño del canvas
        const resizeCanvas = () => {
          const rect = canvas.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          canvas.style.width = rect.width + 'px';
          canvas.style.height = rect.height + 'px';
          
          context.scale(dpr, dpr);

          // Fondo blanco
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, rect.width, rect.height);

          // Agregar texto de placeholder
          context.fillStyle = '#9ca3af';
          context.font = '14px Arial';
          context.textAlign = 'center';
          context.fillText('Firma aquí...', rect.width / 2, rect.height / 2);
        };

        resizeCanvas();
        
        // Reajustar si cambia el tamaño de la ventana
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, [isOpen]);

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX;
      clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;

    e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);

    const { x, y } = getEventPos(e);
    
    // Limpiar placeholder si es la primera vez que se dibuja
    if (!hasSignature) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;

    e.preventDefault();
    const { x, y } = getEventPos(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();
  };

  const clearSignature = () => {
    if (!ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = ctx;
    const rect = canvas.getBoundingClientRect();

    // Limpiar canvas
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, rect.width, rect.height);

    // Agregar texto de placeholder
    context.fillStyle = '#9ca3af';
    context.font = '14px Arial';
    context.textAlign = 'center';
    context.fillText('Firma aquí...', rect.width / 2, rect.height / 2);

    setHasSignature(false);
    // setSavedSignature(null); // Para uso futuro
    setName('');
    
    console.log('Firma limpiada completamente');
  };

  const saveSignature = () => {
    if (!canvasRef.current || !name.trim()) return;

    // Crear imagen de la firma
    const signatureImage = canvasRef.current.toDataURL('image/png');

    const signatureData = {
      name: name.trim(),
      signatureImage,
      date: new Date().toISOString(),
    };

    // Guardar la firma en el estado local
    // setSavedSignature(signatureImage); // Para uso futuro
    
    console.log('Firma guardada exitosamente:', {
      name: signatureData.name,
      hasImage: !!signatureData.signatureImage,
      date: signatureData.date
    });

    onSignature(signatureData);
    onClose();
  };

  const handleClose = () => {
    // Solo limpiar si no hay firma guardada
    // No limpiar automáticamente para permitir al usuario volver a abrir el modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Campo de nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Ingrese su nombre completo"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Área de firma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Firma digital
              </label>
              <div className="border-2 border-gray-300 rounded-lg p-2 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 border border-gray-200 rounded bg-white cursor-crosshair"
                  style={{ 
                    maxWidth: '100%',
                    touchAction: 'none',
                    userSelect: 'none'
                  }}
                  onMouseDown={(e: React.MouseEvent<HTMLCanvasElement>) => startDrawing(e)}
                  onMouseMove={(e: React.MouseEvent<HTMLCanvasElement>) => draw(e)}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e: React.TouchEvent<HTMLCanvasElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startDrawing(e);
                  }}
                  onTouchMove={(e: React.TouchEvent<HTMLCanvasElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    draw(e);
                  }}
                  onTouchEnd={(e: React.TouchEvent<HTMLCanvasElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    stopDrawing();
                  }}
                  onTouchCancel={(e: React.TouchEvent<HTMLCanvasElement>) => {
                    e.preventDefault();
                    stopDrawing();
                  }}
                />
              </div>

              {/* Indicaciones */}
              <p className="text-xs text-gray-500 mt-2">
                Firma aquí con el mouse o toque en dispositivos táctiles
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={clearSignature}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Limpiar</span>
              </button>

              <div className="flex-1" />

              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="text-sm">Cancelar</span>
              </button>

              <button
                onClick={saveSignature}
                disabled={!name.trim() || !hasSignature}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="h-4 w-4" />
                <span className="text-sm">Firmar</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
