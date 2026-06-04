import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          50:  "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc4c4",
          300: "#ff9b9b",
          400: "#fb5d5d",
          500: "#ef2b2b",
          600: "#d4111c",
          700: "#b00a18",
          800: "#8f0d18",
          900: "#76101a",
          950: "#41060b",
        },
        gold: {
          50:  "#fffaeb",
          100: "#fff1c2",
          200: "#ffe188",
          300: "#ffce44",
          400: "#fbb915",
          500: "#ee9d06",
          600: "#cc7702",
          700: "#a25408",
          800: "#85420e",
          900: "#71370f",
          950: "#421b03",
        },
        sage: {
          50:  "#fbf2f3",
          100: "#f7e3e5",
          200: "#efc9cd",
          300: "#e1a1a8",
          400: "#cd6c78",
          500: "#b0434f",
          600: "#962f3c",
          700: "#7a1f2c",
          800: "#661a26",
          900: "#571922",
          950: "#2f0a10",
        },
        cream: {
          50:  "#fdfcf8",
          100: "#faf7ee",
          200: "#f4edda",
          300: "#ebdfc0",
          400: "#dfcb9e",
          500: "#d3b67c",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "slide-in": "slideIn 0.3s ease forwards",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%":            { transform: "scale(1)",   opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

export default config
