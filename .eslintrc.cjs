module.exports = {
  root: true,
  env: { 
    browser: true, 
    es2022: true, 
    node: true 
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  ignorePatterns: [
    'dist', 
    '.eslintrc.cjs', 
    'vite.config.ts',
    'postcss.config.js',
    'tailwind.config.js'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  plugins: [
    'react-refresh', 
    '@typescript-eslint', 
    'react',
    'react-hooks'
  ],
  settings: {
    react: {
      version: 'detect',
    }
  },
  rules: {
    /* ===== REGLAS ENTERPRISE DE TYPESCRIPT ===== */
    
    // Variables y parámetros no utilizados
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
      destructuredArrayIgnorePattern: '^_'
    }],
    
    // Tipos estrictos
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    
    // Convenciones de naming
    '@typescript-eslint/naming-convention': 'off',
    
    // Funciones y métodos
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
    
    /* ===== REGLAS DE REACT ENTERPRISE ===== */
    
    // Componentes y JSX
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true, allowExportNames: ['metadata'] }
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-key': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-is-mounted': 'error',
    'react/no-unknown-property': 'error',
    'react/self-closing-comp': 'error',
    
    // Hooks de React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    
    /* ===== REGLAS GENERALES DE CALIDAD ===== */
    
    // Código limpio
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'off',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Mejores prácticas
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'comma-dangle': ['error', 'never'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'never']
  },
  
  overrides: [
    {
      // Configuración específica para archivos de configuración
      files: ['*.config.js', '*.config.ts', 'vite.config.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-default-export': 'off'
      }
    },
    {
      // Configuración específica para archivos de tipos
      files: ['*.d.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-duplicates': 'off'
      }
    },
    {
      // Configuración específica para tests
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },
    {
      // Configuración específica para archivos mock
      files: ['**/mock*.ts', '**/mock*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-default-export': 'off'
      }
    }
  ]
} 