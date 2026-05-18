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
        "slate-border": "var(--border)",
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
        logo: ["Space Grotesk", "system-ui", ...fontFamily.sans],
      },
      animation: {
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "pulse-slow": "pulse-slow 6s ease-in-out infinite",
        "pulse-slower": "pulse-slower 10s ease-in-out infinite",
        "count-up": "count-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        marquee: "marquee 40s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        glow: "glow 3s ease-in-out infinite",
        "drift-slow": "drift 20s ease-in-out infinite",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: 0.4, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.4)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: 0.3, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(1.05)" },
        },
        "pulse-slower": {
          "0%, 100%": { opacity: 0.2, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(1.08)" },
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
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139,92,246,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(139,92,246,0.3)" },
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
