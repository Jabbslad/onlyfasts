import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        space: "#000000",
        spectral: "#f0f0fa",
      },
      fontFamily: {
        sans: ["Barlow", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
