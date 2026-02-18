/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          500: '#0066FF',
          700: '#0052CC',
          900: '#003D99',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};

