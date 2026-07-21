import Navbar from "@/components/Navbar";
import ComingSoon from "@/components/ComingSoon";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Login — Cicada 2067" };

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <ComingSoon pageName="LOGIN" />
    </>
  );
}
