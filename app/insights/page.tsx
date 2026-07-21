import Navbar from "@/components/Navbar";
import ComingSoon from "@/components/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Insights — Cicada 2067" };

export default function InsightsPage() {
  return (
    <>
      <Navbar />
      <ComingSoon pageName="INSIGHTS" />
    </>
  );
}
