/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f7ef',
          100: '#e8ebd4',
          200: '#d2d9a8',
          300: '#bbc77c',
          400: '#a4b550',
          500: '#8f9f35',
          600: '#6f7c2a',
          700: '#50591e',
          800: '#323812',
          900: '#161b07'
        }
      }
    }
  },
  plugins: []
};
