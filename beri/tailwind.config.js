/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        habs: {
          navy: '#1e3a5f',
          'navy-light': '#2a4a73',
          'navy-dark': '#152a47',
          gold: '#c9a227',
          'gold-light': '#d4b23d',
          'gold-dark': '#b8921f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'nudge': 'nudge 0.6s ease-in-out 2',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        nudge: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '25%': { transform: 'translateY(-3px)', opacity: '0.8' },
          '50%': { transform: 'translateY(0)', opacity: '1' },
          '75%': { transform: 'translateY(-2px)', opacity: '0.9' },
        },
      },
    },
  },
  plugins: [],
}
