const customGray = {
  50:  '#FFFEF7',
  100: '#FBF5DD',
  200: '#F5ECC8',
  300: '#EDE3AA',
  400: '#E7E1B1',
  500: '#D4CB87',
  600: '#BFB45E',
  700: '#9A9240',
  800: '#6b5d00',
  900: '#3d3500',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Forest Greens
        primary: {
          50:  '#f0f7ee',
          100: '#d6ebd2',
          200: '#aed4a6',
          300: '#7db874',
          400: '#4a8c42',
          500: '#306D29', // Forest green — main brand
          600: '#265a21',
          700: '#1a4418',
          800: '#0D530E', // Dark forest green — headings/hover
          900: '#083008', // Deepest green
        },
        // Accent — same green family for CTAs
        accent: {
          50:  '#f0f7ee',
          400: '#4a8c42',
          500: '#306D29',
          600: '#0D530E',
          700: '#083008',
        },
        // Warm neutrals
        cream: {
          50:  '#FFFEF7',
          100: '#FBF5DD', // Page background
          200: '#F5ECC8',
          300: '#EDE3AA',
          400: '#E7E1B1', // Card surface / sand
          500: '#D4CB87',
          600: '#BFB45E',
          700: '#9A9240',
        },
        // Semantic aliases
        background: '#FBF5DD',   // Cream — page bg
        surface:    '#E7E1B1',   // Sand — card bg
        muted:      '#7a8c6e',   // Muted green-grey
        
        // Override default Tailwind teal to map to Forest Green globally
        teal: {
          50:  '#f0f7ee',
          100: '#d6ebd2',
          200: '#aed4a6',
          300: '#7db874',
          400: '#4a8c42',
          500: '#306D29', // Forest green
          600: '#0D530E', // Dark forest green
          700: '#083008',
          800: '#052005',
          900: '#021002',
        },
        
        // Map common grays to warm neutrals
        gray: customGray,
        // Alias other grays to ensure full coverage
        slate:   customGray,
        zinc:    customGray,
        neutral: customGray,
        stone:   customGray,
        
        // Override white and black
        white: '#FBF5DD', // Map pure white to cream
        black: '#0D530E', // Map pure black to dark forest green
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: '#D4CB87',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'fade-in':  'fadeIn 0.25s ease-out forwards',
        'ring':     'ring 1.5s ease-in-out infinite',
        'pulse-dot':'pulse 2s ease-in-out infinite',
        'shimmer':  'skeleton-shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        ring: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '10%':      { transform: 'rotate(-15deg)' },
          '20%':      { transform: 'rotate(15deg)' },
          '30%':      { transform: 'rotate(-10deg)' },
          '40%':      { transform: 'rotate(10deg)' },
          '50%':      { transform: 'rotate(0deg)' },
        },
      },
      boxShadow: {
        'card':      '0 4px 16px rgba(13,83,14,0.08)',
        'card-hover':'0 12px 28px rgba(13,83,14,0.14)',
        'dropdown':  '0 8px 32px rgba(13,83,14,0.15)',
        'btn':       '0 4px 12px rgba(48,109,41,0.30)',
      },
    },
  },
  plugins: [],
}
