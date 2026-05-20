/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        senai: {
          blue: '#005DA5',
          red: '#E30613',
          gray: '#F8F9FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
