import Navbar from "../landing/Navbar";
import HeroSection from "../landing/HeroSection";
import TimelineSection from "../landing/TimelineSection";
import FaqSection from "../landing/FaqSection";
import SiteFooter from "../landing/SiteFooter";

export default function Landing() {
  return (
    <>
      <div className="blackhole-bg" aria-hidden="true">
        <img src="/landing/891208.jpg" alt="" />
      </div>

      <Navbar />

      <main>
        <HeroSection />
        <TimelineSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </>
  );
}