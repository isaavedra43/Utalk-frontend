import React from 'react';
import { motion } from 'framer-motion';

export const Brand: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center gap-2 sm:gap-3"
    >
      {/* Logo */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-sm sm:text-lg">U</span>
      </div>
      
      {/* Marca */}
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-white">UTalk</h2>
        <p className="text-blue-200 text-xs sm:text-sm font-light">Connect. Communicate. Collaborate.</p>
      </div>
    </motion.div>
  );
}; 