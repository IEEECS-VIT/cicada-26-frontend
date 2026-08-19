import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../landing/Navbar";
import SiteFooter from "../landing/SiteFooter";
import CrewPortal from "../landing/CrewPortal";
import { useAuth } from "../context/AuthContext";

export default function Team() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "participant") {
      navigate(user.role === "admin" || user.role === "GOD" ? "/admin" : "/", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user || user.role !== "participant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-orbitron text-accretion">
        <p className="animate-pulse tracking-[0.3em]">ALIGNING CREW VECTOR...</p>
      </div>
    );
  }

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
