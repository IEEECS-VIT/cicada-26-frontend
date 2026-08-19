import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { loginWithToken } from "../api/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying secure handshake...");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setStatus("No session found. Redirecting to sign in...");
        setTimeout(() => !cancelled && navigate("/login", { replace: true }), 1200);
        return;
      }

      try {
        const login = await loginWithToken(accessToken);
        if (cancelled) return;

        if (login.redirectUrl) {
          navigate(login.redirectUrl, { replace: true });
        } else if (login.is_approved_admin) {
          navigate("/admin", { replace: true });
        } else if (login.user?.team_id) {
          navigate("/terminal", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        if (cancelled) return;
        setStatus(err.message || "Authentication failed.");
        setTimeout(() => !cancelled && navigate("/login", { replace: true }), 2000);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground font-mono px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      <div className="relative z-10 text-center panel p-8">
        <div className="mx-auto mb-4 h-3 w-3 animate-pulse rounded-full bg-primary shadow-[0_0_16px_rgba(209,155,131,0.9)]" />
        <p className="label-mono text-primary/80">ESTABLISHING SECURE CHANNEL</p>
        <p className="font-mono text-sm text-foreground/70 mt-3">{status}</p>
      </div>
    </div>
  );
}