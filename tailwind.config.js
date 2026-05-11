/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1B4F72", light: "#2E86C1", dark: "#154360" },
        accent: { DEFAULT: "#F39C12", light: "#F8C471" },
        sidebar: "#0F2D44",
      },
      fontFamily: {
        arabic: ["Tajawal", "Cairo", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};
