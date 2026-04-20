/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'eco-bg':      '#0f1117',
        'eco-panel':   '#1a1d27',
        'eco-green':   '#22c55e',
        'eco-red':     '#ef4444',
        'eco-text':    '#f1f5f9',
        'eco-muted':   '#94a3b8',
        'eco-border':  '#2d3748',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
