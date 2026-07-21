import type { Metadata } from "next";
import { Orbitron, Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import "./endurance.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
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
        className={`${orbitron.variable} ${inter.variable} ${rajdhani.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
