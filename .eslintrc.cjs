/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jsx-a11y'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      },
      rules: {
        // Reglas específicas para archivos Svelte
        'svelte/no-at-html-tags': 'error',
        'svelte/no-target-blank': 'error',
        'svelte/no-unused-svelte-ignore': 'error',
        'svelte/prefer-destructuring': 'warn',
        'svelte/require-event-dispatcher-types': 'error',
        'svelte/button-has-type': 'error',
        'svelte/no-reactive-reassign': 'error'
      }
    },
    {
      files: ['*.ts'],
      rules: {
        // Reglas específicas para TypeScript
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/prefer-const': 'error',
        '@typescript-eslint/no-non-null-assertion': 'warn'
      }
    }
  ],
  rules: {
    // Reglas generales de calidad
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Deshabilitado para usar la versión de TypeScript
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],

    // Reglas de accesibilidad
    'jsx-a11y/click-events-have-key-events': 'error',
    'jsx-a11y/no-static-element-interactions': 'error',
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',

    // Reglas de importación
    'no-duplicate-imports': 'error'
  },
  ignorePatterns: ['*.cjs', 'dist/', 'build/', '.svelte-kit/', 'node_modules/', 'coverage/']
};
