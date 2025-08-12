import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLFormElement: 'readonly',
        FileList: 'readonly',
        File: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        EventListener: 'readonly',
        CustomEvent: 'readonly',
        AddEventListenerOptions: 'readonly',
        EventListenerOptions: 'readonly',
        Blob: 'readonly',
        BlobPart: 'readonly',
        FilePropertyBag: 'readonly',
        TextDecoderOptions: 'readonly',
        // Browser APIs para logger
        performance: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        RequestInfo: 'readonly',
        RequestInit: 'readonly',
        crypto: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        PerformanceNavigationTiming: 'readonly',
        Sentry: 'readonly',
        // NodeJS types
        NodeJS: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': ts
    },
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
      'no-constant-binary-expression': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte']
      },
      globals: {
        console: 'readonly',
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLFormElement: 'readonly',
        FileList: 'readonly',
        File: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        EventListener: 'readonly',
        CustomEvent: 'readonly',
        AddEventListenerOptions: 'readonly',
        EventListenerOptions: 'readonly',
        Blob: 'readonly',
        BlobPart: 'readonly',
        FilePropertyBag: 'readonly',
        TextDecoderOptions: 'readonly',
        // Browser APIs para logger
        performance: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        RequestInfo: 'readonly',
        RequestInit: 'readonly',
        crypto: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        PerformanceNavigationTiming: 'readonly',
        Sentry: 'readonly',
        // NodeJS types
        NodeJS: 'readonly'
      }
    },
    plugins: {
      svelte
    },
    rules: {
      ...svelte.configs.recommended.rules,
      'svelte/no-target-blank': 'error',
      'svelte/button-has-type': 'error',
      'no-console': 'error'
    }
  },
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}'],
    rules: {
      'no-constant-binary-expression': 'off'
    }
  },
  {
    ignores: [
      '*.cjs',
      'dist/',
      'build/',
      '.svelte-kit/',
      'node_modules/',
      'coverage/',
      '**/.DS_Store',
      'src/tests/setup.ts'
    ]
  },
  prettier
];
