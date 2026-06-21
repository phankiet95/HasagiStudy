import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        leaf: {
          50:  '#EAF9E7',
          100: '#C0E6BA',
          200: '#9dd4a5',
          300: '#7ac290',
          400: '#5db57e',
          500: '#4CA771',
          600: '#3d9060',
          700: '#2e7a50',
          800: '#1a5538',
          900: '#013237',
          950: '#011f22',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config
