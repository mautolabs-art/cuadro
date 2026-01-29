/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669'
        },
        background: {
          DEFAULT: '#1a1a2e',
          card: '#16213e',
          light: '#0f3460'
        },
        semaforo: {
          verde: '#10B981',
          amarillo: '#F59E0B',
          rojo: '#EF4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
