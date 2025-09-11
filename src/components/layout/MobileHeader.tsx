import React from 'react';
import { MobileMenuButton } from './MobileMenuButton';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`bg-white border-b border-gray-200 px-4 py-3 lg:hidden ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MobileMenuButton />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center space-x-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
