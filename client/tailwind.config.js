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
        primary: { /* Professional Slate Blue */
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
          950: '#0A1929'
        },
        mint: { /* Muted Sage / Quiet Green */
          50: '#F0F5F3',
          100: '#D9E8E3',
          200: '#B5D1C6',
          300: '#8BB5A5',
          400: '#6B9C89',
          500: '#518270',
          600: '#3F6A5A',
          700: '#335649',
          800: '#2B463D',
          900: '#243A33',
          950: '#12201C'
        },
        coral: { /* Quiet Rose / Muted Pink */
          50: '#FDF5F5',
          100: '#FBEAEA',
          200: '#F5D0D0',
          300: '#EDABAC',
          400: '#E07F81',
          500: '#CF5C5E',
          600: '#B44345',
          700: '#973639',
          800: '#7E3033',
          900: '#6B2D30',
          950: '#3A1416'
        },
        amber: { /* Muted Gold / Sand */
          50: '#FAF8F1',
          100: '#F0EBDB',
          200: '#E2D5B8',
          300: '#D1BB8E',
          400: '#C2A06C',
          500: '#B58D57',
          600: '#A47649',
          700: '#885C3E',
          800: '#704C37',
          900: '#5D4031',
        },
        dark: { /* Cool Neutral Gray */
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#ADB5BD',
          500: '#868E96',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#16191D',
          950: '#0D1117',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'blob': 'blobMorph 8s ease-in-out infinite',
        'blob-slow': 'blobMorph 12s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'float-slow': 'floatSlow 10s ease-in-out infinite',
        'float-fast': 'floatSlow 6s ease-in-out infinite',
        'ripple': 'ripple 0.6s linear',
        'count-up': 'countUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blobMorph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', transform: 'translate(0, 0) scale(1)' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%', transform: 'translate(10px, -15px) scale(1.02)' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 50% 70% 50%', transform: 'translate(-5px, 10px) scale(0.98)' },
          '75%': { borderRadius: '40% 60% 50% 40% / 60% 40% 50% 60%', transform: 'translate(8px, 5px) scale(1.01)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(15px, -20px) rotate(2deg)' },
          '66%': { transform: 'translate(-10px, 10px) rotate(-1deg)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
