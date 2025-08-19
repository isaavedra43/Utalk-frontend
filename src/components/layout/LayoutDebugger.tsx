import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Laptop, Monitor as Desktop } from 'lucide-react';

interface LayoutDebuggerProps {
  isVisible?: boolean;
}

export const LayoutDebugger: React.FC<LayoutDebuggerProps> = ({ isVisible = false }) => {
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    layoutType: '',
    columnsVisible: 0,
    isFourColumnLayout: false
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determinar tipo de layout basado en breakpoints
      let layoutType = '';
      let columnsVisible = 0;
      let isFourColumnLayout = false;

      if (width >= 1920) {
        layoutType = 'Pantalla Muy Grande (4 columnas completas)';
        columnsVisible = 4;
        isFourColumnLayout = true;
      } else if (width >= 1536) {
        layoutType = 'Pantalla Grande (4 columnas)';
        columnsVisible = 4;
        isFourColumnLayout = true;
      } else if (width >= 1280) {
        layoutType = 'Pantalla Mediana-Grande (4 columnas)';
        columnsVisible = 4;
        isFourColumnLayout = true;
      } else if (width >= 1024) {
        layoutType = 'Pantalla Mediana (3 columnas)';
        columnsVisible = 3;
        isFourColumnLayout = false;
      } else {
        layoutType = 'Pantalla Pequeña (Layout móvil)';
        columnsVisible = 1;
        isFourColumnLayout = false;
      }

      setScreenInfo({
        width,
        height,
        layoutType,
        columnsVisible,
        isFourColumnLayout
      });
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, []);

  const getDeviceIcon = () => {
    const { width } = screenInfo;
    if (width >= 1920) return <Desktop className="w-4 h-4" />;
    if (width >= 1536) return <Laptop className="w-4 h-4" />;
    if (width >= 1024) return <Tablet className="w-4 h-4" />;
    return <Smartphone className="w-4 h-4" />;
  };

  const getLayoutStatus = () => {
    const layoutElement = document.querySelector('.four-column-layout');
    const columns = document.querySelectorAll('.four-column-layout > div');
    
    return {
      layoutExists: layoutElement !== null,
      columnsCount: columns.length,
      columnClasses: Array.from(columns).map(col => col.className.split(' ').find(cls => cls.includes('column')))
    };
  };

  const [layoutStatus, setLayoutStatus] = useState(getLayoutStatus());

  useEffect(() => {
    const checkLayout = () => {
      setLayoutStatus(getLayoutStatus());
    };

    // Verificar después de que el DOM se actualice
    const timer = setTimeout(checkLayout, 100);
    return () => clearTimeout(timer);
  }, [screenInfo]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Debug Layout
        </h3>
        <div className="flex items-center gap-1">
          {getDeviceIcon()}
          <span className="text-xs text-gray-500">
            {screenInfo.width}x{screenInfo.height}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Tipo de Layout:</span>
          <span className="font-medium">{screenInfo.layoutType}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Columnas Visibles:</span>
          <span className={`font-medium ${screenInfo.isFourColumnLayout ? 'text-green-600' : 'text-orange-600'}`}>
            {screenInfo.columnsVisible}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Layout 4 Columnas:</span>
          <span className={`font-medium ${screenInfo.isFourColumnLayout ? 'text-green-600' : 'text-red-600'}`}>
            {screenInfo.isFourColumnLayout ? 'SÍ' : 'NO'}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Elemento Layout:</span>
            <span className={`font-medium ${layoutStatus.layoutExists ? 'text-green-600' : 'text-red-600'}`}>
              {layoutStatus.layoutExists ? 'Encontrado' : 'No encontrado'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Columnas DOM:</span>
            <span className="font-medium">{layoutStatus.columnsCount}</span>
          </div>
        </div>

        {layoutStatus.columnsCount > 0 && (
          <div className="border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-600 block mb-1">Columnas detectadas:</span>
            <div className="space-y-1">
              {layoutStatus.columnClasses?.map((className, index) => (
                <div key={index} className="text-xs bg-gray-50 px-2 py-1 rounded">
                  {className || `Columna ${index + 1}`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="text-xs text-gray-500">
            <p><strong>Para ver 4 columnas:</strong></p>
            <p>• Pantalla ≥ 1280px de ancho</p>
            <p>• Zoom ≤ 100%</p>
            <p>• CSS cargado correctamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 