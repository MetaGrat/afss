/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'bg': '#0b1020',
        'card': '#12172a',
        'muted': '#8ea0b5',
        'ring': 'rgba(255,255,255,.06)',
      }
    },
  },
  plugins: [],
}
