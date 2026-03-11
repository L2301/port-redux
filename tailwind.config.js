const theme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
const backup = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', backup, 'sans-serif']
      },
      colors: {
        gray: colors.gray
      },
      minWidth: {
        ...theme.spacing,
        '22': '5.5rem'
      },
      height: {
        '8.5': '2.125rem'
      }
    },
  },
  plugins: [],
}
