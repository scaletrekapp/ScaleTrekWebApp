const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#050505",
        midnight2: "#0A0A0A",
        midnight3: "#111111",
        "slate-base": "#1A1A1A",
        "slate-light": "#2A2A2A",
        "slate-border": "#2E2E2E",
        "slate-muted": "#6B7280",
        "slate-subtle": "#404040",
        violet: { DEFAULT: "#8B5CF6", light: "#A78BFA", dark: "#7C3AED" },
        cyan: { DEFAULT: "#06B6D4", light: "#22D3EE", dark: "#0891B2" },
        glass: {
          bg: "rgba(26,26,26,0.6)",
          border: "rgba(255,255,255,0.08)",
          light: "rgba(255,255,255,0.04)",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
          border: "#E5E7EB",
          muted: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", ...fontFamily.sans],
        mono: ["JetBrains Mono", "Fira Code", ...fontFamily.mono],
        arabic: ["IBM Plex Sans Arabic", "system-ui", ...fontFamily.sans],
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "count-up": "count-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.4)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
