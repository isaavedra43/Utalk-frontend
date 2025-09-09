import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined);

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export const DropdownMenuTrigger = ({ asChild, children }: DropdownMenuTriggerProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  
  const { setIsOpen } = context;
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setIsOpen(true)
    });
  }
  
  return (
    <button onClick={() => setIsOpen(true)}>
      {children}
    </button>
  );
};

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export const DropdownMenuContent = ({ children, align = 'end', className = '' }: DropdownMenuContentProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');
  
  const { isOpen, setIsOpen } = context;
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);
  
  if (!isOpen) return null;
  
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };
  
  return (
    <div
      ref={dropdownRef}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DropdownMenuItem = ({ children, onClick, className = '' }: DropdownMenuItemProps) => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');
  
  const { setIsOpen } = context;
  
  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };
  
  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator = ({ className = '' }: DropdownMenuSeparatorProps) => {
  return <div className={`-mx-1 my-1 h-px bg-gray-200 ${className}`} />;
};
