/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-green': '#22C55E',
        'brand-green-dark': '#16A34A',
        'brand-green-light': '#4ADE80',

        'dark-primary': '#0F172A',
        'dark-secondary': '#1E293B',
        'dark-tertiary': '#334155',

        'notice-bg-dark': 'rgba(120, 53, 15, 0.5)',
        'notice-border-dark': '#78350f',
        'notice-text-dark': '#fcd34d',
      }
    },
  },
  plugins: [],
}