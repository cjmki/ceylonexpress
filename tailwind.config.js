/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Ceylon Express Typography System
      // Based on Perfect Fourth scale (1.333) for harmonious hierarchy
      fontSize: {
        // Display sizes (Hero, Major headings)
        'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],  // 72px
        'display-md': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }], // 60px
        'display-sm': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],     // 48px
        
        // Heading sizes
        'heading-xl': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }], // 36px
        'heading-lg': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],                          // 30px
        'heading-md': ['1.5rem', { lineHeight: '1.4', fontWeight: '700' }],                            // 24px
        'heading-sm': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],                           // 20px
        
        // Body sizes
        'body-xl': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],  // 20px - Large intro text
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // 18px - Emphasized body
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],     // 16px - Standard body
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }], // 14px - Small body
        'body-xs': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],  // 12px - Fine print
        
        // Special purpose
        'label': ['0.875rem', { lineHeight: '1.5', fontWeight: '600', letterSpacing: '0.025em' }],     // 14px - Form labels
        'button-sm': ['0.8125rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.05em' }], // 13px - Small buttons
        'button': ['0.875rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.05em' }],     // 14px - Standard buttons
        'button-lg': ['1rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.05em' }],      // 16px - Large buttons
        'price': ['1.375rem', { lineHeight: '1.3', fontWeight: '700' }],                               // 22px - Prices
      },
      // Ceylon Express Button System
      // Standardized button classes for consistent UI
      spacing: {
        // Keep existing Tailwind spacing
        ...require('tailwindcss/defaultTheme').spacing,
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
        // Ceylon Express colors based on color palette
        ceylon: {
          bg: "#F5EDA0", // Light cream/pale yellow background
          text: "#1A1A1A", // Black text for readability
          accent: "#D9873B", // Burnt orange for accents
          light: "#F5EDA0", // Light cream for subtle elements
          dark: "#A7C7D7", // Light blue for contrast elements
          orange: "#D9873B", // Burnt orange
          yellow: "#F0D871", // Golden yellow
          cream: "#F5EDA0", // Light cream/pale yellow
          blue: "#A7C7D7", // Light blue/sky blue
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Ceylon Express Button Component Plugin
    function({ addComponents, theme }) {
      const buttons = {
        // Base button styles
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'all 0.3s',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          textDecoration: 'none',
          border: 'none',
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        // Size variants
        '.btn-sm': {
          padding: '0.5rem 1rem',
          fontSize: '0.8125rem',
          lineHeight: '1.2',
        },
        '.btn-md': {
          padding: '0.75rem 2rem',
          fontSize: '0.875rem',
          lineHeight: '1.2',
        },
        '.btn-lg': {
          padding: '1rem 2.5rem',
          fontSize: '1rem',
          lineHeight: '1.2',
        },
        // Style variants
        '.btn-primary': {
          backgroundColor: theme('colors.ceylon.orange'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.ceylon.text'),
            boxShadow: theme('boxShadow.xl'),
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.ceylon.text'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.ceylon.orange'),
          },
        },
        '.btn-outline': {
          backgroundColor: 'transparent',
          color: theme('colors.ceylon.orange'),
          border: `2px solid ${theme('colors.ceylon.orange')}`,
          '&:hover': {
            backgroundColor: theme('colors.ceylon.orange'),
            color: theme('colors.white'),
          },
        },
        '.btn-outline-white': {
          backgroundColor: 'transparent',
          color: theme('colors.white'),
          border: `2px solid ${theme('colors.white')}`,
          '&:hover': {
            backgroundColor: theme('colors.white'),
            color: theme('colors.ceylon.text'),
          },
        },
        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.ceylon.orange'),
          '&:hover': {
            backgroundColor: theme('colors.ceylon.orange') + '10',
          },
        },
        // Special effect buttons
        '.btn-slide-up': {
          position: 'relative',
          overflow: 'hidden',
          '& > span': {
            position: 'relative',
            zIndex: '10',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: '0',
            backgroundColor: theme('colors.ceylon.text'),
            transform: 'translateY(100%)',
            transition: 'transform 0.3s',
          },
          '&:hover::after': {
            transform: 'translateY(0)',
          },
        },
      };
      addComponents(buttons);
    },
  ],
};
