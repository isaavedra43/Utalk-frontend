/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0faff',
          100: '#e0f2ff',
          200: '#b9e6ff',
          300: '#7ccfff',
          400: '#36b8ff',
          500: '#099cff',
          600: '#007fff',
          700: '#006aff',
          800: '#0058ff',
          900: '#004fff',
          950: '#002b91'
        },
        secondary: {
          50: '#f0f3f8',
          100: '#e1e7f0',
          200: '#c4d0e2',
          300: '#a0b1ce',
          400: '#7c8fb5',
          500: '#60739c',
          600: '#4e5b7f',
          700: '#414b67',
          800: '#384055',
          900: '#32394a',
          950: '#202531'
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03'
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a'
        },
        chart: {
          1: '#2563eb',
          2: '#10b981',
          3: '#f59e0b',
          4: '#ef4444',
          5: '#8b5cf6',
          6: '#06b6d4',
          7: '#84cc16',
          8: '#f97316',
          9: '#ec4899',
          10: '#6366f1',
          11: '#14b8a6',
          12: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
};
