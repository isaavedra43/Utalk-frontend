// Entry point de la aplicación React
// Configuración del root de React 18 con StrictMode
// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // ✅ TEMPORAL: StrictMode desactivado para evitar doble renderizado durante debugging
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
) 