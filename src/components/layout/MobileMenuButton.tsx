import React from 'react';
import { Menu } from 'lucide-react';
import { useMobileMenuContext } from '../../contexts/MobileMenuContext';

interface MobileMenuButtonProps {
  className?: string;
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ 
  className = "" 
}) => {
  const { toggleMenu } = useMobileMenuContext();

  return (
    <button
      onClick={toggleMenu}
      className={`lg:hidden p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors ${className}`}
      aria-label="Abrir menú"
    >
      <Menu className="h-5 w-5 text-blue-600" />
    </button>
  );
};
