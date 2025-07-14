import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './global.css'

import App from './client/pages/Index.tsx'
import { AuthProvider } from "@/lib/auth.tsx"
