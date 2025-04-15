/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1DB954', // Spotify-inspired green
          dark: '#1AA34A',
          light: '#3DCB70',
        },
        secondary: {
          DEFAULT: '#191414', // Dark background
          light: '#282828',
          lighter: '#333333',
          dark: '#121212', // Darker shade for contrast
        },
        accent: {
          DEFAULT: '#FFFFFF',
          muted: '#B3B3B3',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}; 