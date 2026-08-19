import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" || user.role === "GOD" ? "/admin" : "/terminal", { replace: true });
    }
  }, [loading, user, navigate]);

  const startGoogleOAuth = async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) console.error("OAuth error", error.message);
  };

  return (
    <div className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-black px-4 py-12 text-starlight sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src="/assets/891208.jpg"
          alt=""
          className="h-full w-full object-cover object-[58%_62%] opacity-70 saturate-[1.15] contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/55 to-black" />
      </div>

      <div className="pointer-events-none absolute left-5 top-5 h-8 w-8 border-l border-t border-copper/40" />
      <div className="pointer-events-none absolute right-5 top-5 h-8 w-8 border-r border-t border-copper/40" />
      <div className="pointer-events-none absolute bottom-5 left-5 h-8 w-8 border-b border-l border-copper/40" />
      <div className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 border-b border-r border-copper/40" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-2 py-8 text-center sm:px-8 sm:py-12">
        <img
          src="/assets/cicada_logo.jpg"
          alt="Cicada 2067"
          className="mb-8 h-16 w-16 object-contain"
        />

        <p className="mb-4 font-rajdhani text-[11px] tracking-[0.42em] text-accretion">
          CICADA 2067
        </p>
        <h1 className="font-orbitron text-[clamp(2rem,12vw,3rem)] font-black leading-none tracking-[0.14em] sm:text-5xl sm:tracking-[0.18em]">
          <span className="bg-gradient-to-r from-starlight via-accretion-bright to-accretion bg-clip-text text-transparent">
            SIGN IN
          </span>
        </h1>

        <button
          type="button"
          onClick={startGoogleOAuth}
          className="mt-10 inline-flex min-h-14 w-full items-center justify-center gap-3 border border-accretion px-4 py-4 font-orbitron text-[11px] leading-none tracking-[0.14em] text-accretion transition hover:bg-accretion/10 sm:mt-12 sm:px-6 sm:tracking-[0.22em]"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.3 44 34.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        <Link
          to="/"
          className="mt-10 font-rajdhani text-sm tracking-[0.28em] text-copper transition hover:text-accretion"
        >
          ← HOME
        </Link>
      </div>
    </div>
  );
}
