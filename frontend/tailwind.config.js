/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      colors: {
        exam: {
          ink: "#12263A",
          bg: "#F5F8FA",
          panel: "#FFFFFF",
          accent: "#1D4ED8",
          warn: "#B91C1C",
        },
      },
      boxShadow: {
        panel: "0 10px 35px rgba(18, 38, 58, 0.12)",
      },
    },
  },
  plugins: [],
};
