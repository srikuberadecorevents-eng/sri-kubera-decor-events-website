import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#e8eef7",
          100: "#c5d3e8",
          200: "#9fb5d6",
          300: "#7897c4",
          400: "#5980b7",
          500: "#3a69aa",
          600: "#2d5a9b",
          700: "#244c85",
          800: "#1a3d6d",
          900: "#1F3A5F",
          950: "#0f1e32",
        },
        gold: {
          50: "#fdf8e8",
          100: "#f9edc0",
          200: "#f4df95",
          300: "#efd069",
          400: "#eac445",
          500: "#C9A227",
          600: "#b58c1f",
          700: "#9a7519",
          800: "#7e5f13",
          900: "#614a0e",
        },
        cream: {
          50: "#fdfcf8",
          100: "#f9f5ec",
          200: "#f4eddb",
          300: "#ede2c8",
          400: "#e4d4b0",
          500: "#d9c49a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A227, #e8c84a, #C9A227)",
        "navy-gradient": "linear-gradient(135deg, #1F3A5F, #2d5a9b)",
      },
      boxShadow: {
        gold: "0 4px 24px rgba(201, 162, 39, 0.25)",
        navy: "0 4px 24px rgba(31, 58, 95, 0.25)",
        card: "0 2px 16px rgba(31, 58, 95, 0.08)",
        "card-hover": "0 8px 40px rgba(31, 58, 95, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 162, 39, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(201, 162, 39, 0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
