/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: {
          100: '#121212',
          200: '#1a1a1a',
          300: '#252525',
          400: '#2a2a2a',
        },
        brand: {
          blue: '#0070f3',
          light: '#3291ff',
          dark: '#0025d2',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#0070f3',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#71717a',
          dim: '#52525b',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 112, 243, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'inner-glass': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #0070f3, #3291ff)',
        'gradient-surface': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}