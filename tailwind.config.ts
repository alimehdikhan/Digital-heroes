import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        navy: {
          DEFAULT: '#0a0e27',
          50:  '#eef0ff',
          100: '#d8ddf7',
          200: '#b6bef0',
          300: '#8c97e6',
          400: '#6470d9',
          500: '#4a55ca',
          600: '#3b43b3',
          700: '#313793',
          800: '#2b2f75',
          900: '#272b60',
          950: '#0a0e27',
        },
        gold: {
          DEFAULT: '#f5c518',
          50:  '#fffde7',
          100: '#fffac0',
          200: '#fff285',
          300: '#ffe340',
          400: '#f5c518',
          500: '#d4a10b',
          600: '#aa7a06',
          700: '#875a09',
          800: '#714710',
          900: '#603a13',
          950: '#381e06',
        },
        emerald: {
          DEFAULT: '#00d68f',
          50:  '#edfff8',
          100: '#d5ffef',
          200: '#aeffdf',
          300: '#70ffca',
          400: '#2bfbae',
          500: '#00d68f',
          600: '#00c07d',
          700: '#009867',
          800: '#007853',
          900: '#006245',
          950: '#003827',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1428 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f5c518 0%, #d4a10b 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #00d68f 0%, #009867 100%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(245, 197, 24, 0.3)',
        'emerald-glow': '0 0 30px rgba(0, 214, 143, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'inner-gold': 'inset 0 1px 0 rgba(245, 197, 24, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'count-up 1s ease-out forwards',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
