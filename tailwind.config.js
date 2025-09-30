/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'], 
      },
      colors: {
        primary: '#2D8CBB',   
        secondary: '#35A3FD', 
        button: '#FF9421',
      },
    },
  },
  plugins: [],
}
