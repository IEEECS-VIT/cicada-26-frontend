import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import CrewPortal from "./CrewPortal";
/* timeline.css owns the :root tokens SiteFooter reads (--bg, --amber,
   --font-mono …); it is otherwise scoped to .timeline-section. */
import "@/app/timeline.css";
import "./team.css";

export const metadata: Metadata = { title: "Team — Cicada 2067" };

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main>
        <CrewPortal />
      </main>
      <SiteFooter />
    </>
  );
}
