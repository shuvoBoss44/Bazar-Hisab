/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1f2937'
      },
      boxShadow: {
        '3xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }
    }
  },
  plugins: []
};