/**
 * Configuración de Jest para tests
 */

module.exports = {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Archivos de setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Patrones de archivos de test
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configuración de cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  
  // Archivos para calcular cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  // Umbrales de cobertura mínimos para demo
  coverageThreshold: {
    global: {
      branches: 0.5,
      functions: 0,
      lines: 0.5,
      statements: 0.5
    }
  },
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Variables de entorno para tests
  setupFiles: ['<rootDir>/tests/env.js'],
  
  // Transformaciones
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Modules a transformar
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)'
  ],
  
  // Reporteros
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './coverage',
      outputName: 'junit.xml'
    }]
  ],
  
  // Configuración adicional
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  
  // Configuración para mocks
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Configuración de globals
  globals: {
    'NODE_ENV': 'test'
  }
}; 