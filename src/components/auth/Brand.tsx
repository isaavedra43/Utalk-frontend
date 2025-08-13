import React from 'react';
import { motion } from 'framer-motion';

export const Brand: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="flex items-center justify-center gap-3"
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
      >
        <span className="text-white font-bold text-lg">U</span>
      </motion.div>
      
      {/* Nombre de la marca */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">UTalk</h1>
        <p className="text-blue-200 text-sm font-light">Connect. Communicate. Collaborate.</p>
      </div>
    </motion.div>
  );
}; 