/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        panini: {
          blue: '#0052A5',
          red: '#CE1126',
          gold: '#F4B942',
          green: '#009B4D',
        },
      },
    },
  },
  plugins: [],
};
