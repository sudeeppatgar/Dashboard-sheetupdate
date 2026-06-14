/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px -24px rgba(15, 23, 42, 0.35)',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at top left, rgba(14,165,233,0.15), transparent 30%), radial-gradient(circle at bottom right, rgba(15,23,42,0.08), transparent 28%)',
      },
    },
  },
  plugins: [],
}
