/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#DC161F',
          'red-hover': '#B90F18',
          sidebar: '#17191D',
          bg: '#F5F6F8',
          card: '#FFFFFF',
          text: '#202329',
          muted: '#667085',
          border: '#E5E7EB',
          success: '#16805D',
          warning: '#D97706',
          error: '#C62828',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        dropdown: '0 4px 12px rgba(0, 0, 0, 0.08)',
        modal: '0 12px 32px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
