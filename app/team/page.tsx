import Navbar from "@/components/Navbar";
import ComingSoon from "@/components/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Team — Cicada 2067" };

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <ComingSoon pageName="TEAM" />
    </>
  );
}
