import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/Admin/AdminDashboard";
import { ShieldAlert, LogOut, Home } from "lucide-react";

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
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono">
        <div className="animate-pulse text-primary">Verifying admin clearance...</div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="relative z-10 max-w-md text-center panel p-10">
          <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl tracking-[0.14em] text-primary mb-3">ACCESS DENIED</h1>
          <p className="text-sm text-foreground/70 mb-6">
            Your account does not have administrator clearance for this sector.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/dashboard")} className="w-full rounded-md border border-[#D19B83] px-4 py-2.5 font-display text-sm tracking-widest uppercase text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              Return to Mission Control
            </button>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 rounded-md border border-[#D19B83]/50 px-4 py-2.5 font-display text-sm tracking-widest uppercase text-primary/70 hover:bg-[#D19B83]/20 transition-colors">
              <LogOut className="h-4 w-4" /> Signout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <div className="flex items-center justify-between border-b border-[#D19B83]/30 bg-black/60 px-4 py-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
            <Home className="h-3.5 w-3.5" /> Home
          </button>
          <span className="text-primary/20">|</span>
          <span className="label-mono text-[10px] text-primary/60">ADMIN: <span className="text-primary">{user.display_name || user.email}</span></span>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
          <LogOut className="h-3.5 w-3.5" /> Signout
        </button>
      </div>
      <AdminDashboard />
    </div>
  );
}