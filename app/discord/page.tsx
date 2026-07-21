import Navbar from "@/components/Navbar";
import ComingSoon from "@/components/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Discord — Cicada 2067" };

export default function DiscordPage() {
  return (
    <>
      <Navbar />
      <ComingSoon pageName="DISCORD" />
    </>
  );
}
