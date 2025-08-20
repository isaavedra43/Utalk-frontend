import React, { useState } from 'react';
import { infoLog } from '../../config/logger';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'red';
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (disabled) return;
    
    // NUEVO: Logging para debug
    if (import.meta.env.DEV) {
      infoLog('🔄 [DEBUG] ToggleSwitch clicked:', { current: checked, new: !checked });
    }
    
    setIsAnimating(true);
    onChange(!checked);
    
    // Resetear animación después de un breve delay
    setTimeout(() => setIsAnimating(false), 150);
  };

  // NUEVO: Logging para debug del estado
  if (import.meta.env.DEV) {
    infoLog('🔄 [DEBUG] ToggleSwitch render:', { checked, isAnimating });
  }

  // Configuraciones de tamaño
  const sizeConfig = {
    sm: {
      container: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: 'translate-x-3'
    },
    md: {
      container: 'h-6 w-11',
      thumb: 'h-4 w-4',
      translate: 'translate-x-6'
    },
    lg: {
      container: 'h-8 w-14',
      thumb: 'h-6 w-6',
      translate: 'translate-x-7'
    }
  };

  // Configuraciones de color
  const colorConfig = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600'
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[color];

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {label && (
        <span className="text-xs text-gray-600 mr-3 flex-1">
          {label}
        </span>
      )}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-all duration-200 ease-in-out
          ${currentSize.container}
          ${checked ? currentColor : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
          ${isAnimating ? 'scale-105' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        title={label}
      >
        <span
          className={`
            inline-block rounded-full bg-white shadow-md transition-all duration-200 ease-in-out
            ${currentSize.thumb}
            ${checked ? currentSize.translate : 'translate-x-1'}
            ${isAnimating ? 'scale-110' : ''}
          `}
        />
      </button>
    </div>
  );
};

// Componente de Switch con etiqueta integrada
export const LabeledToggleSwitch: React.FC<Omit<ToggleSwitchProps, 'label'> & {
  label: string;
  description?: string;
}> = ({ label, description, ...props }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
      <ToggleSwitch {...props} />
    </div>
  );
};

// Componente de Switch para configuraciones
export const SettingsToggleSwitch: React.FC<Omit<ToggleSwitchProps, 'label'> & {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}> = ({ label, description, icon, ...props }) => {
  return (
    <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center flex-1">
        {icon && (
          <div className="mr-3 text-gray-400">
            {icon}
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          {description && (
            <div className="text-xs text-gray-500 mt-1">{description}</div>
          )}
        </div>
      </div>
      <ToggleSwitch {...props} />
    </div>
  );
}; 