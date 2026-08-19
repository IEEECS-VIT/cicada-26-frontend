import Navbar from "../landing/Navbar";
import ComingSoon from "../landing/ComingSoon";
import SiteFooter from "../landing/SiteFooter";

export default function ComingSoonPage({ pageName }) {
  return (
    <>
      <Navbar />
      <main>
        <ComingSoon pageName={pageName} />
      </main>
      <SiteFooter />
    </>
  );
}