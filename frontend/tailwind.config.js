/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7C3AED', light: '#8B5CF6', dark: '#6D28D9', soft: '#EDE9FE' },
        accent:  { DEFAULT: '#F59E0B', light: '#FCD34D' },
        sage:    { DEFAULT: '#6EE7B7', dark: '#059669' },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
