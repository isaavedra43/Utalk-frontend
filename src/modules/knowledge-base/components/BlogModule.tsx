'use client';

import React from 'react';

interface BlogModuleProps {
  onPostSelect: (post: any) => void;
}

export function BlogModule({ onPostSelect }: BlogModuleProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Módulo de Blogs
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema completo de blogs y artículos en desarrollo...
        </p>
      </div>
    </div>
  );
}
