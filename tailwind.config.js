const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Dark palette: "Onyx" ──
        onyx: {
          DEFAULT: "#0a0a0f",
          950: "#050508",
          900: "#0a0a0f",
          800: "#12121a",
          700: "#1a1a26",
          600: "#24243a",
        },
        obsidian: {
          DEFAULT: "#0f0f18",
          light: "#1a1a28",
        },
        "slate-sharp": "rgba(255,255,255,0.08)",
        "slate-muted": "#8a8a96",
        "slate-subtle": "#6b6b7b",

        // ── Light palette: "Alabaster" ──
        alabaster: {
          DEFAULT: "#fafafa",
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#efefef",
          300: "#e0e0e0",
        },
        platinum: {
          DEFAULT: "#d4d4d4",
          light: "#e5e5e5",
        },
        charcoal: {
          DEFAULT: "#171717",
          900: "#171717",
          700: "#404040",
          500: "#737373",
        },

        // ── Accents ──
        emerald: {
          DEFAULT: "#34d399",
          light: "#6ee7b7",
          dark: "#059669",
          muted: "rgba(52,211,153,0.15)",
        },
        violet: {
          DEFAULT: "#6366f1",
          light: "#a5b4fc",
          dark: "#4338ca",
          muted: "rgba(99,102,241,0.12)",
        },
        ruby: {
          DEFAULT: "#f43f5e",
          light: "#fb7185",
          dark: "#be123c",
          muted: "rgba(244,63,94,0.12)",
        },

        // ── Legacy compatibility (gradually deprecate) ──
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

      // ── Spring physics transitions ──
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-slow": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
        800: "800ms",
      },

      // ── Animations ──
      animation: {
        "pulse-dot": "pulse-dot 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "pulse-slower": "pulse-slower 14s ease-in-out infinite",
        "count-up": "count-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        marquee: "marquee 60s linear infinite",
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "shimmer-fast": "shimmer 1.5s linear infinite",
        "drift-slow": "drift 30s ease-in-out infinite",
        "sidebar-in": "slide-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "panel-in": "slide-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        glow: "glow 3s ease-in-out infinite alternate",
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
        "slide-in": {
          from: { opacity: "0", transform: "translateX(-12px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.05)" },
          "100%": { boxShadow: "0 0 30px rgba(99,102,241,0.2), 0 0 60px rgba(99,102,241,0.08)" },
        },
      },

      // ── Widths for sidebar/panels ──
      width: {
        sidebar: "240px",
        "sidebar-collapsed": "64px",
        "right-panel": "320px",
      },

      spacing: {
        sidebar: "240px",
        "sidebar-collapsed": "64px",
        "right-panel": "320px",
      },
    },
  },
  plugins: [],
};
