// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // importante para usar classe 'dark' no <html>
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
