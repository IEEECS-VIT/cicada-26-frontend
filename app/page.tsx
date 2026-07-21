import Image from "next/image";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

export default function HomePage() {
  return (
    <>
      {/* Fixed black hole background */}
      <div className="blackhole-bg" aria-hidden="true">
        <Image
          src="/blackhole.jpg"
          alt="Gargantua black hole — interstellar cinematic background"
          fill
          priority
          quality={90}
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      </div>

      <Navbar />
      <HeroSection />
    </>
  );
}
