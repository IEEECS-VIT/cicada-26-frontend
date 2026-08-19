import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/Admin/AdminDashboard";
import { ShieldAlert, LogOut } from "lucide-react";

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  const isAdmin = user && (user.role === "admin" || user.role === "GOD");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-orbitron text-accretion">
        <p className="animate-pulse tracking-[0.32em]">VERIFYING CLEARANCE</p>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 text-starlight">
        <div className="relative z-10 max-w-md border border-accretion/30 bg-black p-10 text-center">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-accretion" />
          <h1 className="font-orbitron text-2xl tracking-[0.18em]">NO CLEARANCE</h1>
          <p className="mt-4 text-sm leading-7 text-copper">This sector is reserved for command staff.</p>
          <div className="mt-8 flex flex-col gap-3">
            <button type="button" onClick={() => navigate("/dashboard")} className="border border-accretion px-4 py-3 font-orbitron text-[11px] tracking-[0.22em] text-accretion">
              RETURN
            </button>
            <button type="button" onClick={logout} className="flex items-center justify-center gap-2 border border-copper/30 px-4 py-3 font-rajdhani text-sm tracking-[0.2em] text-copper">
              <LogOut className="h-4 w-4" /> SIGNOUT
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}
