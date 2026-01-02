/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		spacing: {
  			'8': '2rem',
  			'12': '3rem',
  			'16': '4rem',
  			'24': '6rem',
  			'32': '8rem'
  		},
  		colors: {
  			primary: {
  				'50': '#E6F0FF',
  				'100': '#CCE0FF',
  				'200': '#99C2FF',
  				'300': '#66A3FF',
  				'400': '#3385FF',
  				'500': '#0066FF',
  				'600': '#0052CC',
  				'700': '#003D99',
  				'800': '#002966',
  				'900': '#001433',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			neutral: {
  				'50': '#FAFAFA',
  				'100': '#F5F5F5',
  				'200': '#E5E7EB',
  				'300': '#D1D5DB',
  				'400': '#9CA3AF',
  				'500': '#6B7280',
  				'600': '#4B5563',
  				'700': '#374151',
  				'800': '#1F2937',
  				'900': '#171717',
  				'950': '#0A0A0A'
  			},
  			background: 'hsl(var(--background))',
  			surface: {
  				'100': '#121212',
  				'200': '#1a1a1a',
  				'300': '#252525',
  				'400': '#2a2a2a'
  			},
  			brand: {
  				blue: '#0066FF',
  				light: '#3291ff',
  				dark: '#0025d2'
  			},
  			status: {
  				success: '#10b981',
  				warning: '#f59e0b',
  				error: '#ef4444',
  				info: '#0070f3'
  			},
  			text: {
  				primary: '#ffffff',
  				secondary: '#a1a1aa',
  				muted: '#71717a',
  				dim: '#52525b'
  			},
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			DEFAULT: '0',
  			none: '0',
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '0',
  			'2xl': '0',
  			'3xl': '0',
  			'4xl': '0',
  			'5xl': '0',
  			'6xl': '0',
  			full: '9999px'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'monospace'
  			],
  			display: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		fontSize: {
  			xs: [
  				'12px',
  				{
  					lineHeight: '16px'
  				}
  			],
  			sm: [
  				'14px',
  				{
  					lineHeight: '20px'
  				}
  			],
  			base: [
  				'16px',
  				{
  					lineHeight: '24px'
  				}
  			],
  			lg: [
  				'18px',
  				{
  					lineHeight: '28px'
  				}
  			],
  			xl: [
  				'24px',
  				{
  					lineHeight: '32px'
  				}
  			],
  			'2xl': [
  				'32px',
  				{
  					lineHeight: '40px'
  				}
  			],
  			'3xl': [
  				'48px',
  				{
  					lineHeight: '56px'
  				}
  			]
  		},
  		boxShadow: {
  			'glow-blue': '0 0 20px rgba(0, 102, 255, 0.25)',
  			none: 'none'
  		},
  		backgroundImage: {
  			'gradient-brand': 'linear-gradient(to right, #0066FF, #3385FF)'
  		},
  		animation: {
  			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		},
  		ringWidth: {
  			'2': '2px'
  		},
  		ringColor: {
  			'focus-blue': '#0066FF',
  			'focus-pure': '#0000FF'
  		},
  		ringOffsetWidth: {
  			'4': '4px'
  		},
  		ringOffsetColor: {
  			'focus-bg': '#FAFAFA',
  			'focus-bg-pure': '#FFFFFF'
  		}
  	}
  },
  plugins: [
      require("tailwindcss-animate")
],
  // Accessibility: Custom variants for reduced motion
  future: {
    hoverOnlyWhenSupported: true, // Only apply hover on devices that support it
  },
}