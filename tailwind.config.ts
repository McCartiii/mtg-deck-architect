import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#060810",
        surface: "#0d1220",
        "surface-2": "#141b2d",
        "surface-3": "#1a2236",
        neon: "#00d4ff",
        pink: "#ff0080",
        violet: "#7c3aed",
        muted: "#3d5068",
        border: "#1e2d45",
        gold: "#f59e0b",
        white: "#e8f4ff",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      keyframes: {
        "holo-shift": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "neon-pulse": {
          "0%,100%": { boxShadow: "0 0 8px #00d4ff55" },
          "50%": { boxShadow: "0 0 24px #00d4ffaa, 0 0 48px #00d4ff44" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "holo-shift": "holo-shift 4s ease infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 1.4s ease infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
