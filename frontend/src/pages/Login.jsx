import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === "admin" || user.role === "GOD" ? "/admin" : "/dashboard", { replace: true });
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" style={{ backgroundImage: "url(/landing/891208.jpg)" }} />
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md panel p-8 sm:p-10">
        <div className="text-center mb-8">
          <img src="/landing/cicada_logo.jpg" alt="Cicada 2067" className="h-20 w-20 object-contain rounded-full mx-auto mix-blend-screen mb-4" />
          <p className="label-mono text-primary/70">SECURE IDENTITY VERIFICATION</p>
          <h1 className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-primary mt-2">SIGN IN</h1>
        </div>

        <button
          onClick={startGoogleOAuth}
          className="w-full flex items-center justify-center gap-3 rounded-md border border-[#D19B83] px-4 py-3 font-display text-sm tracking-[0.18em] uppercase text-primary transition-all hover:bg-primary hover:text-primary-foreground shadow-[0_0_12px_rgba(209,155,131,0.3)]"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.3 44 34.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Continue with Google
        </button>

        <p className="label-mono text-[10px] text-primary/50 mt-6 text-center">
          ACCESS RESTRICTED · AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
}