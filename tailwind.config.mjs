/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Rational Grid Design System
      // 8px spacing grid system
      spacing: {
        '8': '2rem',   // 32px
        '12': '3rem',  // 48px
        '16': '4rem',  // 64px
        '24': '6rem',  // 96px
        '32': '8rem',  // 128px
      },
      // Color scheme: High-contrast with Action Blue accents
      colors: {
        // Action Blue - Primary accent
        primary: {
          DEFAULT: '#0066FF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',  // Action Blue
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
        },
        // Neutral scale for backgrounds and text
        neutral: {
          50: '#FAFAFA',   // Light background
          100: '#F5F5F5',
          200: '#E5E7EB',  // Borders
          300: '#D1D5DB',  // Secondary borders
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#171717',  // Primary text
          950: '#0A0A0A',  // Dark background
        },
        // Legacy colors preserved for existing code
        background: '#0f0f0f',
        surface: {
          100: '#121212',
          200: '#1a1a1a',
          300: '#252525',
          400: '#2a2a2a',
        },
        brand: {
          blue: '#0066FF',
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
      // Zero border-radius for all components
      borderRadius: {
        DEFAULT: '0',
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        '4xl': '0',
        '5xl': '0',
        '6xl': '0',
        full: '9999px', // Only for pills/circles when explicitly needed
      },
      // Typography: Inter for body, JetBrains Mono for metadata
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'], // Simplified to Inter
      },
      // Typography scale with proper line heights
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],    // 1.333 ratio
        sm: ['14px', { lineHeight: '20px' }],    // 1.428 ratio
        base: ['16px', { lineHeight: '24px' }],  // 1.500 ratio
        lg: ['18px', { lineHeight: '28px' }],    // 1.555 ratio
        xl: ['24px', { lineHeight: '32px' }],    // 1.333 ratio
        '2xl': ['32px', { lineHeight: '40px' }],
        '3xl': ['48px', { lineHeight: '56px' }],
      },
      // Preserve useful utilities
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.25)',
        'none': 'none',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #0066FF, #3385FF)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // Accessibility: Focus ring utilities (WCAG AAA)
      ringWidth: {
        '2': '2px',
      },
      ringColor: {
        'focus-blue': '#0066FF', // Action Blue focus ring
        'focus-pure': '#0000FF', // Pure blue for high contrast
      },
      ringOffsetWidth: {
        '4': '4px',
      },
      ringOffsetColor: {
        'focus-bg': '#FAFAFA', // Offset background color
        'focus-bg-pure': '#FFFFFF', // Pure white for high contrast
      },
    },
  },
  plugins: [
    // Remove tailwindcss-animate - not needed for Rational Grid
  ],
  // Accessibility: Custom variants for reduced motion
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover on devices that support it
  },
}