
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Componente de debug simple
const DebugComponent: React.FC = () => {
  console.log('🔍 DebugComponent - Renderizado');
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 ¡Aplicación Funcionando!
        </h1>
        <p className="text-gray-600 mb-4">
          React está funcionando correctamente. El problema no está en el renderizado básico.
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Debug exitoso - React funcionando
        </div>
      </div>
    </div>
  );
};

function App() {
  console.log('🔍 App - Componente App renderizado');

  return (
    <Router>
      <div className="app">
        {/* Componente de debug temporal */}
        <div className="fixed top-0 left-0 z-50 bg-red-500 text-white p-2 text-xs">
          🔍 App Debug - React funcionando
        </div>
        
        <Routes>
          <Route path="/" element={<DebugComponent />} />
          <Route path="/debug" element={<DebugComponent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
