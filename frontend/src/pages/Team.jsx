import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import CrewPortal from "../landing/CrewPortal";
import "../styles/timeline.css";
import "../styles/team.css";

export default function Team() {
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