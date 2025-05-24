/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a',
          dark: '#15803d'
        }
      },
      animation: {
        'float-label': 'floatLabel 0.2s ease-in-out forwards',
      },
      keyframes: {
        floatLabel: {
          '0%': { transform: 'translateY(0)', fontSize: '1rem' },
          '100%': { transform: 'translateY(-1.5rem)', fontSize: '0.875rem' }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}