/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom design system colors
      colors: {
        // Atmospheric palette for depth and mood
        background: 'hsl(220, 40%, 8%)', // Deep atmospheric background
        surface: 'hsl(210, 25%, 95%)', // Glass surface
        accent: 'hsl(180, 60%, 50%)', // Vibrant accent
        'accent-glow': 'hsl(180, 70%, 60%)', // Accent glow effect
        text: {
          primary: 'hsl(0, 0%, 98%)', // Near-white text
          secondary: 'hsl(210, 15%, 85%)', // Muted text
          muted: 'hsl(210, 10%, 70%)' // Placeholder text
        }
      },
      backgroundImage: {
        // Noise textures for atmosphere
        'noise-subtle': 'radial-gradient(circle, rgba(120, 119, 255, 0.1), transparent), radial-gradient(circle, rgba(120, 119, 255, 0.1), transparent)',
        'noise-medium': 'radial-gradient(circle, rgba(120, 119, 255, 0.15), transparent), radial-gradient(circle, rgba(120, 119, 255, 0.15), transparent)',
      },
      boxShadow: {
        // Multi-layered depth shadows
        'depth-1': '0 4px 6px rgba(0, 0, 0, 0.05)', // Subtle ambient shadow
        'depth-2': '0 8px 16px rgba(0, 0, 0, 0.1)', // Medium elevation shadow
        'depth-3': '0 16px 32px rgba(0, 0, 0, 0.2)', // High elevation shadow
        'depth-4': '0 24px 48px rgba(0, 0, 0, 0.3)', // Maximum elevation shadow
      },
      backdropBlur: {
        // Glassmorphism blur effects
        sm: '8px', // Small components
        md: '12px', // Medium components
        lg: '16px', // Large components
        xl: '24px', // Full screen effects
      },
      animation: {
        // Fluid motion for interactions
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-gentle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-up': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'cubic-bezier(0, 0, 0, 1)',
      }
    },
    // Design tokens for consistency
    fontFamily: {
      sans: ['Inter Variable', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono Variable', 'Fira Code', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', '0.875rem'],
      sm: ['0.875rem', '1rem'],
      base: ['1rem', '1.125rem'],
      lg: ['1.125rem', '1.25rem'],
      xl: ['1.25rem', '1.5rem'],
      '2xl': ['1.5rem', '1.875rem'],
      '3xl': ['1.875rem', '2.25rem'],
    },
    spacing: {
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
    },
    // Custom component styles for atmospheric design
    components: {
      button: {
        // Glassmorphic buttons with glow effects
        'background-color': 'rgb(210, 25%, 95% / 0.8)', // Semi-transparent glass surface
        'border-width': '1px',
        'border-color': 'rgba(255, 255, 255, 0.2)', // Subtle glass border
        'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.15)', // Medium depth shadow
        'transition-duration': '200ms',
        '&:hover': {
          'background-color': 'rgb(210, 35%, 85% / 0.9)', // Brighter on hover
          'box-shadow': '0 12px 48px rgba(180, 70%, 50%)', // Accent glow on hover
          'transform': 'scale(1.05)', // Subtle scale effect
        }
      },
      card: {
        // Elevated cards with glassmorphism
        'background': 'rgb(210, 25%, 95% / 0.6)', // More transparent card surface
        'backdrop-blur': '12px', // Enhanced blur for cards
        'border': '1px solid rgba(255, 255, 255, 0.1)',
        'box-shadow': '0 16px 64px rgba(0, 0, 0, 0.2)', // High elevation shadow
      }
    }
  },
  plugins: [
    // Enhanced design system utilities
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ]
}