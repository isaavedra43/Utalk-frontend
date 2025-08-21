import React from 'react';

interface PWASettingsProps {
  // Props básicas para el componente
  className?: string;
}

const PWASettings: React.FC<PWASettingsProps> = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Configuración PWA</h2>
      <p className="text-gray-600">
        Configuración de Progressive Web App
      </p>
    </div>
  );
};

export default PWASettings; 