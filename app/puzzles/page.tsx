import Navbar from "@/components/Navbar";
import ComingSoon from "@/components/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Puzzles — Cicada 2067" };

export default function PuzzlesPage() {
  return (
    <>
      <Navbar />
      <ComingSoon pageName="PUZZLES" />
    </>
  );
}
