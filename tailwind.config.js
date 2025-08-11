/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Legacy brutalist colors
        primary: '#FF8C00',
        secondary: '#3A3A3A',
        accent: '#FFD700',
        success: '#2A9D8F',
        danger: '#E76F51',
        dark: '#1A1A1A',
        light: '#F5F5F5',
        'title-brown': '#2D1B0F',
        'body-text': '#1A1A1A',
        'accent-brown': '#8B4513',
        'alt-accent-brown': '#654321',
        'primary-light': '#FFB366',
        'primary-dark': '#E67E00',
        'secondary-light': '#5A5A5A',
        'secondary-dark': '#2A2A2A',
        'success-light': '#3CB3A3',
        'success-dark': '#248277',
        'danger-light': '#EA8570',
        'danger-dark': '#D65A3F',
        'accent-light': '#FFDC1A',
        'accent-dark': '#E6C200',
        
        // New brand system - gym-inspired orange/amber
        brand: {
          50: '#FFF8ED',
          100: '#FFEBC7',
          200: '#FFD788',
          300: '#FFC34A',
          400: '#FFAE1A',
          500: '#FF9900',
          600: '#E08100',
          700: '#B36300',
          800: '#7A4300',
          900: '#402300',
          950: '#0F0A03',
        },
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        // Brutalist animations
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        // New modern animations
        'gradient-x': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-120%)' },
          '60%': { transform: 'translateX(120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(12px, -10px) scale(1.05)' },
          '66%': { transform: 'translate(-8px, 6px) scale(0.98)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
        'gradient-x': 'gradient-x 9s ease-in-out infinite',
        shimmer: 'shimmer 2.2s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
      },
      boxShadow: {
        // Brutalist shadows
        'brutalist-sm': '2px 2px 0px rgba(0,0,0,0.2)',
        'brutalist': '4px 4px 0px rgba(0,0,0,0.2)',
        'brutalist-lg': '6px 6px 0px rgba(0,0,0,0.3)',
        // Modern brand shadows
        'brand': '0 10px 30px -10px rgba(255,153,0,0.55)',
      },
    },
  },
  plugins: [],
}