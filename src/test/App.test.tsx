import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import App from '../App'

// Wrapper para tests con providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Verificar que la aplicación se renderiza
    expect(document.body).toBeTruthy()
  })

  it('has proper HTML structure', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Verificar elementos básicos
    expect(document.querySelector('html')).toBeTruthy()
    expect(document.querySelector('body')).toBeTruthy()
  })
})