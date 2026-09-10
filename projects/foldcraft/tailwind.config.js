/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
      },
      // 98 is not on Tailwind's default opacity scale, so `bg-black/98`
      // would compile to nothing without this.
      opacity: {
        98: '0.98',
      },
    },
  },
  plugins: [],
}
