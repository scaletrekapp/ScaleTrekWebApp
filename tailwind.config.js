const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0a0a0f",
        midnight2: "#12121a",
        midnight3: "#1a1a24",
        graphite: {
          DEFAULT: "#0a0a0f",
          50: "#f5f5f7",
          100: "#e4e4e9",
          200: "#c9c9d2",
          300: "#a3a3b0",
          400: "#7c7c8a",
          500: "#5c5c6a",
          600: "#4a4a56",
          700: "#3a3a44",
          800: "#2a2a34",
          900: "#1a1a24",
          950: "#0a0a0f",
        },
        "slate-border": "rgba(255,255,255,0.06)",
        "slate-muted": "#8a8a96",
        violet: { DEFAULT: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
        cyan: { DEFAULT: "#14b8a6", light: "#2dd4bf", dark: "#0d9488" },
        glass: {
          bg: "rgba(18,18,26,0.6)",
          border: "rgba(255,255,255,0.06)",
          light: "rgba(255,255,255,0.03)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", ...fontFamily.sans],
        mono: ["JetBrains Mono", "Fira Code", ...fontFamily.mono],
        arabic: ["IBM Plex Sans Arabic", "system-ui", ...fontFamily.sans],
        logo: ["Space Grotesk", "system-ui", ...fontFamily.sans],
      },
      animation: {
        "pulse-dot": "pulse-dot 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "pulse-slower": "pulse-slower 14s ease-in-out infinite",
        "count-up": "count-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        marquee: "marquee 60s linear infinite",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "drift-slow": "drift 30s ease-in-out infinite",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.4)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 0.2 },
          "50%": { opacity: 0.4 },
        },
        "pulse-slower": {
          "0%, 100%": { opacity: 0.15 },
          "50%": { opacity: 0.3 },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(10px, -10px)" },
          "50%": { transform: "translate(-5px, -15px)" },
          "75%": { transform: "translate(-10px, 5px)" },
        },
      },
    },
  },
  plugins: [],
};
