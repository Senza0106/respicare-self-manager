/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFFFFF',
          primary: '#3B82F6',
          dark: '#0B1120',
          danger: '#EF4444',
          sky: '#38BDF8',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      fontSize: {
        base: ['1rem', { lineHeight: '1.5rem' }],
      },
    },
  },
  plugins: [],
};
