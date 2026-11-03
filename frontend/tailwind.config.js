/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#0B0F17',
          card: '#131A26',
          border: '#1E293B',
          gold: '#C5A059',
          goldHover: '#B38F4D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'], // Optional for high-end headers
      },
    },
  },
  plugins: [],
}