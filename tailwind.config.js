/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#054239',
          hover: '#002623',
          50: '#E6EFED',
          100: '#C9DFDB',
          200: '#93BEB6',
          500: '#054239',
          600: '#04352E',
          700: '#002623',
        },
        surface: {
          DEFAULT: '#EDEBE0',
          dark: '#E2DFD0',
        },
        gold: {
          DEFAULT: '#B9A779',
          dark: '#988561',
          light: '#D6C9A8',
        },
        warning: {
          DEFAULT: '#6B1F2A',
          dark: '#4A151E',
        },
        success: {
          DEFAULT: '#1E7A4C',
          light: '#E4F3EB',
        },
        ink: {
          DEFAULT: '#161616',
          secondary: '#3D3A3B',
          muted: '#6B6A6C',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        hover: '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      maxWidth: {
        page: '72rem',
      },
    },
  },
  plugins: [],
}
