import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { InventoryMainView } from './components/InventoryMainView';

// Componente principal del módulo de inventario
const InventoryModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<InventoryMainView />} />
      <Route path="*" element={<InventoryMainView />} />
    </Routes>
  );
};

export default InventoryModule;
