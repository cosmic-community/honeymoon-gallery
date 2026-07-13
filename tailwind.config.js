/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f3',
          100: '#fbe8e5',
          200: '#f7d0cc',
          300: '#f0aca4',
          400: '#e67d6f',
          500: '#d85443',
          600: '#c43d2b',
          700: '#a43022',
          800: '#882b20',
          900: '#722922',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}