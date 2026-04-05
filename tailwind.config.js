/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFB38E",
        surface: "#faf9f7",
        outline: "#8f7067",
        "on-surface": "#1a1c1b",
        "on-surface-variant": "#5b4039",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
