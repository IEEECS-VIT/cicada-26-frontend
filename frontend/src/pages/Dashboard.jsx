import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, teamName, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.role === "admin" || user.role === "GOD") {
      navigate("/admin", { replace: true });
    } else if (teamName) {
      navigate("/terminal", { replace: true });
    } else {
      navigate("/team-setup", { replace: true });
    }
  }, [loading, user, teamName, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono">
      <div className="animate-pulse text-primary">Rerouting mission control...</div>
    </div>
  );
}