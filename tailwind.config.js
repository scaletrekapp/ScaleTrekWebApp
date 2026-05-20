const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // ── Text scale ──
      fontSize: {
        display: ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        heading: ["18px", { lineHeight: "1.3", fontWeight: "700" }],
        subhead: ["14px", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["11px", { lineHeight: "1.4", fontWeight: "500" }],
        micro: ["10px", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "0.12em" }],
      },

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

        // ── Light palette: "Alabaster" ──
        alabaster: {
          DEFAULT: "#fafafa",
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#efefef",
          300: "#e0e0e0",
        },
        platinum: { DEFAULT: "#d4d4d4", light: "#e5e5e5" },
        charcoal: { DEFAULT: "#171717", 900: "#171717", 700: "#404040", 500: "#737373" },

        // ── Accents ──
        emerald: {
          DEFAULT: "#34d399",
          light: "#6ee7b7",
          dark: "#059669",
          muted: "rgba(52,211,153,0.15)",
          glow: "rgba(52,211,153,0.3)",
        },
        violet: {
          DEFAULT: "#6366f1",
          light: "#a5b4fc",
          dark: "#4338ca",
          muted: "rgba(99,102,241,0.12)",
          glow: "rgba(99,102,241,0.25)",
        },
        ruby: {
          DEFAULT: "#f43f5e",
          light: "#fb7185",
          dark: "#be123c",
          muted: "rgba(244,63,94,0.12)",
          glow: "rgba(244,63,94,0.25)",
        },

        // ── Text opacity helpers (applied via text color classes) ──
        muted: "rgba(255,255,255,0.55)",
        subdued: "rgba(255,255,255,0.38)",
        faint: "rgba(255,255,255,0.20)",

        // ── Legacy (keep for compat, migrate gradually) ──
        midnight: "#0a0a0f",
        midnight2: "#12121a",
        midnight3: "#1a1a24",
        graphite: { DEFAULT: "#0a0a0f", 50: "#f5f5f7", 100: "#e4e4e9", 200: "#c9c9d2", 300: "#a3a3b0", 400: "#7c7c8a", 500: "#5c5c6a", 600: "#4a4a56", 700: "#3a3a44", 800: "#2a2a34", 900: "#1a1a24", 950: "#0a0a0f" },
        "slate-border": "rgba(255,255,255,0.06)",
        "slate-muted": "#8a8a96",
        "slate-subtle": "#6b6b7b",
        "slate-sharp": "rgba(255,255,255,0.08)",
        glass: { bg: "rgba(18,18,26,0.6)", border: "rgba(255,255,255,0.06)", light: "rgba(255,255,255,0.03)" },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", ...fontFamily.sans],
        mono: ["JetBrains Mono", "Fira Code", ...fontFamily.mono],
        arabic: ["IBM Plex Sans Arabic", "system-ui", ...fontFamily.sans],
        logo: ["Space Grotesk", "system-ui", ...fontFamily.sans],
      },

      // ── Spring physics ──
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-slow": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: { 400: "400ms", 600: "600ms", 800: "800ms" },

      // ── Custom shadows ──
      boxShadow: {
        "glow-sm": "0 0 12px rgba(99,102,241,0.2)",
        glow: "0 0 20px rgba(99,102,241,0.15), 0 0 40px rgba(99,102,241,0.05)",
        "glow-lg": "0 0 30px rgba(99,102,241,0.2), 0 0 60px rgba(99,102,241,0.08)",
        "glow-emerald": "0 0 20px rgba(52,211,153,0.15), 0 0 40px rgba(52,211,153,0.05)",
        "glow-ruby": "0 0 20px rgba(244,63,94,0.15), 0 0 40px rgba(244,63,94,0.05)",
        "surface-edge": "inset 0 1px 0 0 rgba(255,255,255,0.04)",
        "surface-edge-light": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },

      // ── Backdrop blurs ──
      backdropBlur: {
        glow: "12px",
        panel: "8px",
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
        glow: "glow 3s ease-in-out infinite alternate",
        "ticker-up": "ticker-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
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
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(99,102,241,0.1), 0 0 40px rgba(99,102,241,0.05)" },
          "100%": { boxShadow: "0 0 30px rgba(99,102,241,0.2), 0 0 60px rgba(99,102,241,0.08)" },
        },
        "ticker-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },

      // ── Layout widths ──
      width: { sidebar: "240px", "sidebar-collapsed": "64px", "right-panel": "320px" },
      spacing: { sidebar: "240px", "sidebar-collapsed": "64px", "right-panel": "320px" },
      maxWidth: { page: "1280px" },
    },
  },
  plugins: [],
};
