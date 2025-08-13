import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, BarChart3, Users } from 'lucide-react';

const benefits = [
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description: "Manage all your communications from one place with our integrated messaging platform."
  },
  {
    icon: BarChart3,
    title: "Real-time Insights",
    description: "Track performance metrics and user engagement in real-time with detailed analytics dashboards."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work seamlessly with your team using advanced collaboration tools and shared workspaces."
  }
];

export const BenefitsCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % benefits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentBenefit = benefits[currentSlide];
  const IconComponent = currentBenefit.icon;

  return (
    <div className="space-y-8">
      {/* Contenido principal con animaciones específicas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="space-y-6"
        >
          {/* Icono mejorado con hover */}
          <motion.div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto"
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            <IconComponent className="w-8 h-8 text-cyan-300" />
          </motion.div>
          
          {/* Texto con animaciones escalonadas */}
          <div className="space-y-3">
            <motion.h3 
              className="text-2xl font-bold text-white leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentBenefit.title}
            </motion.h3>
            <motion.p 
              className="text-blue-100 leading-relaxed text-lg font-light"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {currentBenefit.description}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicadores mejorados */}
      <div className="flex space-x-3 justify-center">
        {benefits.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`rounded-full transition-all duration-500 backdrop-blur-sm border border-white/20 ${
              index === currentSlide 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 w-10 h-3 shadow-lg shadow-blue-500/30' 
                : 'bg-white/20 hover:bg-white/40 w-3 h-3'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}; 