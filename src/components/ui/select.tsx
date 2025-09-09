import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectTrigger = ({ children, className = '' }: SelectTriggerProps) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');
  
  const { isOpen, setIsOpen } = context;
  
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue = ({ placeholder }: SelectValueProps) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');
  
  const { value } = context;
  
  return <span>{value || placeholder}</span>;
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent = ({ children, className = '' }: SelectContentProps) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');
  
  const { isOpen, setIsOpen } = context;
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
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
  
  return (
    <div
      ref={contentRef}
      className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-gray-950 shadow-md ${className}`}
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem = ({ value, children, className = '' }: SelectItemProps) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');
  
  const { value: selectedValue, onValueChange, setIsOpen } = context;
  const isSelected = selectedValue === value;
  
  const handleClick = () => {
    onValueChange(value);
    setIsOpen(false);
  };
  
  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
        isSelected ? 'bg-gray-100' : ''
      } ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
