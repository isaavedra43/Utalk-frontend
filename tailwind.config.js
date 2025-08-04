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
