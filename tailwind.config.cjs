/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "#16161A",
        paragraph: "#94A1B2",
        headline: "#FFFFFE",
        button: "#7F5AF0",
        ["button-text"]: "#FFFFFE",
        ["background-secondary"]: "#242629",
        light: {
          background: "#FFFFFE",
          paragraph: "#2B2C34",
          headline: "#2B2C34",
          button: "#6246EA",
          ["background-secondary"]: "#D1D1E9",
        },
      },
      fontFamily: {
        roboto: [
          "Roboto",
          "Segoe UI",
          "Tahoma",
          "Geneva",
          "Verdana",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
