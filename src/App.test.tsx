// Test básico para verificar que la configuración funciona
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Verificar que la aplicación se renderiza
    expect(document.body).toBeTruthy()
  })
}) 