/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#f97316',
          blue: '#3b82f6',
        }
      }
    },
  },
  plugins: [],
}
