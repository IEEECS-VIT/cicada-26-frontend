import Navbar from "../landing/Navbar";
import HeroSection from "../landing/HeroSection";
import TimelineSection from "../landing/TimelineSection";
import FaqSection from "../landing/FaqSection";
import SiteFooter from "../landing/SiteFooter";

export default function Landing() {
  return (
    <>
      <div className="blackhole-bg pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <img
          src="/assets/891208.jpg"
          alt=""
          className="absolute inset-0 h-full w-full max-h-none max-w-none object-cover object-[58%_50%] opacity-[0.92] contrast-105 saturate-125 brightness-[0.88]"
        />
      </div>

      <Navbar />

      <main className="relative z-[1]">
        <HeroSection />
        <TimelineSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </>
  );
}
