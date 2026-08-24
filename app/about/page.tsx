import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import AboutDossier from "./AboutDossier";
/* timeline.css owns the :root tokens both AboutDossier and SiteFooter read
   (--bg, --ink, --amber, --line, --font-display, --font-mono, --ease-out);
   it is otherwise scoped to .timeline-section. Same reason app/team/page.tsx
   imports it. Must come first so about.css can override anything it needs to. */
import "@/app/timeline.css";
import "./about.css";

export const metadata: Metadata = {
  title: "About — Cicada 2067",
  description:
    "What Cicada 2067 is, who can enter, how the six rounds run, and what to bring. The cryptic hunt from the IEEE Computer Society at VIT.",
  openGraph: {
    title: "About — Cicada 2067",
    description: "Six rounds, one trajectory. Everything a participant needs before the hunt begins.",
    type: "article",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      {/* AboutDossier renders its own <main>. */}
      <AboutDossier />
      <SiteFooter />
    </>
  );
}
