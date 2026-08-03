import type { Metadata } from "next";
import { Orbitron, Inter, Rajdhani, Chakra_Petch, Martian_Mono } from "next/font/google";
import "./globals.css";

/* Every weight here is loaded unconditionally on every route, so the lists are
   pinned to what the CSS actually asks for. Across app/*.css only 300, 400, 500,
   600 and 900 are ever declared — 700 and 800 were four static font files being
   downloaded for nothing. Re-check with `rg 'font-weight' app/*.css` before
   adding a heavier weight to a rule. */
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600"],
});

/* Timeline section type. Chakra Petch ships static weights so `weight` is
   required; Martian Mono is a variable font — one file for the whole axis. */
const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-chakra",
  weight: ["300", "500", "600"],
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
});

export const metadata: Metadata = {
  title: "Cicada 2067 — A Cryptic Hunt Beyond the Stars",
  description:
    "Solve. Decipher. Escape. An interstellar cryptic hunt that blends logic and curiosity. Decode the unknown.",
  keywords: ["cryptic hunt", "puzzle", "interstellar", "cicada", "2067", "ARG"],
  openGraph: {
    title: "Cicada 2067",
    description: "An interstellar cryptic hunt beyond the stars.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${inter.variable} ${rajdhani.variable} ${chakraPetch.variable} ${martianMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
