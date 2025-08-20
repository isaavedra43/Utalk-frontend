import { useState, useEffect } from 'react';

// Hook para usar animaciones de manera lazy
export const useLazyAnimation = () => {
  const [animation, setAnimation] = useState<ReturnType<typeof import('framer-motion').useAnimation> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('framer-motion').then(module => {
      setAnimation(module.useAnimation);
      setLoading(false);
    });
  }, []);

  return { animation, loading };
}; 