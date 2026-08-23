import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { loginWithToken } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [status, setStatus] = useState("Verifying handshake...");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setStatus("No session found. Returning to sign in...");
        setTimeout(() => !cancelled && navigate("/login", { replace: true }), 1200);
        return;
      }

      try {
        const login = await loginWithToken(accessToken);
        if (cancelled) return;

        await refresh(); // sync AuthContext so the next page's auth guard sees the logged-in user
        if (cancelled) return;

        if (login.redirectUrl) {
          navigate(login.redirectUrl, { replace: true });
        } else if (login.is_approved_admin) {
          navigate("/admin", { replace: true });
        } else if (login.user?.team_id) {
          navigate("/terminal", { replace: true });
        } else {
          navigate("/team-setup", { replace: true });
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
  }, [navigate, refresh]);

  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-black px-6 text-starlight">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src="/assets/891208.jpg"
          alt=""
          className="h-full w-full object-cover object-[58%_62%] opacity-50"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 px-8 py-10 text-center">
        <div className="mx-auto mb-6 h-2 w-2 animate-pulse rounded-full bg-accretion" />
        <p className="font-orbitron text-sm tracking-[0.32em] text-accretion">
          SIGNING IN
        </p>
        <p className="mt-4 text-sm leading-7 text-copper">{status}</p>
      </div>
    </div>
  );
}
