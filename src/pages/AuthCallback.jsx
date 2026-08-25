import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { loginWithToken } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refresh, setAuthData } = useAuth();
  const [status, setStatus] = useState("Verifying handshake...");

  useEffect(() => {
    let cancelled = false;

    const processSession = async (session) => {
      const accessToken = session?.access_token;
      if (!accessToken) {
        setStatus("No session found. Returning to sign in...");
        setTimeout(() => !cancelled && navigate("/login", { replace: true }), 1500);
        return;
      }

      try {
        setStatus("Verifying credentials with server...");
        const login = await loginWithToken(accessToken);
        if (cancelled) return;

        setAuthData(login);
        const effectiveUser = login.user;
        const isAdmin = login.is_approved_admin || effectiveUser?.role === "admin" || effectiveUser?.role === "GOD";
        const hasTeam = Boolean(login.team_name || effectiveUser?.team_id);

        if (login.redirectUrl) {
          navigate(login.redirectUrl, { replace: true });
        } else if (isAdmin) {
          navigate("/admin", { replace: true });
        } else if (hasTeam) {
          navigate("/terminal", { replace: true });
        } else {
          navigate("/team-setup", { replace: true });
        }
        refresh(); // Background sync without blocking navigation
      } catch (err) {
        if (cancelled) return;
        console.error("Authentication handshake error:", err);
        setStatus(err.message || "Authentication failed. Returning to sign in...");
        setTimeout(() => !cancelled && navigate("/login", { replace: true }), 2500);
      }
    };

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        await processSession(data.session);
      } else {
        // Listen for auth state change if session is still processing from URL hash/code
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session) {
            authListener.subscription.unsubscribe();
            await processSession(session);
          }
        });

        // Fallback timeout in case no session event fires
        setTimeout(() => {
          if (!cancelled) {
            authListener.subscription.unsubscribe();
            supabase.auth.getSession().then(({ data: fallbackData }) => {
              if (fallbackData?.session) {
                processSession(fallbackData.session);
              } else if (!cancelled) {
                setStatus("No session found. Returning to sign in...");
                setTimeout(() => !cancelled && navigate("/login", { replace: true }), 1500);
              }
            });
          }
        }, 1500);
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
