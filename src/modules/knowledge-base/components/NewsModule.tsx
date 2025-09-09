'use client';

import React from 'react';

interface NewsModuleProps {
  onNewsSelect: (news: any) => void;
}

export function NewsModule({ onNewsSelect }: NewsModuleProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Módulo de Noticias
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema completo de noticias y anuncios en desarrollo...
        </p>
      </div>
    </div>
  );
}
