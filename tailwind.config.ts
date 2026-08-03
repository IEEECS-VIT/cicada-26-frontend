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
      /* No `animation`/`keyframes` here: the five that used to be defined were
         never referenced by any `animate-*` class in JSX, and duplicated the
         real @keyframes in globals.css. Add them back only alongside a caller. */
    },
  },
  plugins: [],
};
export default config;
