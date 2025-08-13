import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface SocialButtonProps {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  icon: Icon,
  text,
  onClick,
  loading = false,
  disabled = false
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      <span className="font-medium text-gray-700">{text}</span>
    </motion.button>
  );
}; 