import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/chat.css'
import App from './App.tsx'
import { healthCheckBackend } from './services/health';

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(<App />)
} else {
  console.error('Root element not found')
}

// Ejecutar health check sin bloquear el render
setTimeout(() => {
	healthCheckBackend();
}, 0);
