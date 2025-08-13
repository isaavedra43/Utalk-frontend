import React from 'react';
import { motion } from 'framer-motion';

export const Brand: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex items-center justify-center gap-3"
    >
      {/* Logo */}
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">U</span>
      </div>
      
      {/* Marca */}
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white">UTalk</h2>
        <p className="text-blue-200 text-sm font-light">Connect. Communicate. Collaborate.</p>
      </div>
    </motion.div>
  );
}; 