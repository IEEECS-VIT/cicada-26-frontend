import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "monospace"],
        inter: ["var(--font-inter)", "sans-serif"],
        rajdhani: ["var(--font-rajdhani)", "sans-serif"],
        chakra: ["var(--font-chakra)", "sans-serif"],
        martian: ["var(--font-martian)", "monospace"],
      },
      colors: {
        "space-black": "#000000",
        "space-void": "#020209",
        "accretion": "#F4A233",
        "accretion-bright": "#FFD97D",
        "starlight": "#F5F5F0",
        "deep-amber": "#FF8C00",
        "cosmic-gray": "#1a1a2e",
      },
      animation: {
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "float-up": "floatUp 6s ease-in-out infinite",
        "star-twinkle": "starTwinkle 4s ease-in-out infinite",
        "scroll-bounce": "scrollBounce 2s ease-in-out infinite",
        "text-shimmer": "textShimmer 4s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { textShadow: "0 0 10px #F4A233, 0 0 20px #F4A233, 0 0 40px #F4A233" },
          "50%": { textShadow: "0 0 20px #FFD97D, 0 0 40px #FFD97D, 0 0 80px #F4A233, 0 0 100px #FF8C00" },
        },
        floatUp: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        starTwinkle: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        scrollBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        textShimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
