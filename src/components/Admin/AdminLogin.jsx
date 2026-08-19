import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useAdmin } from "./AdminContext";

export default function AdminLogin() {
  const {
    handleLogin,
    loginError,
    usernameInput,
    setUsernameInput,
    passwordInput,
    setPasswordInput,
  } = useAdmin();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-4 text-starlight">
      <div className="w-full max-w-md border border-accretion/30 bg-black p-10">
        <p className="mb-4 font-rajdhani text-[11px] tracking-[0.42em] text-accretion">
          COMMAND CLEARANCE
        </p>
        <h1 className="font-orbitron text-4xl tracking-[0.14em]">CICADA</h1>
        <p className="mt-1 font-rajdhani text-sm tracking-[0.32em] text-copper">
          2067 · COMMAND
        </p>

        <form onSubmit={handleLogin} className="mt-10 space-y-5">
          {loginError && (
            <div className="flex items-center gap-2 border border-red-400/40 px-3 py-2 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}
          <div>
            <label className="mb-2 block font-rajdhani text-[11px] tracking-[0.28em] text-copper">
              IDENTIFICATION
            </label>
            <input
              type="text"
              className="w-full border border-copper/25 bg-black px-4 py-3 text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
              placeholder="admin"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-2 block font-rajdhani text-[11px] tracking-[0.28em] text-copper">
              PASSPHRASE
            </label>
            <input
              type="password"
              className="w-full border border-copper/25 bg-black px-4 py-3 text-starlight outline-none placeholder:text-copper/40 focus:border-accretion"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full border border-accretion bg-accretion py-3.5 font-orbitron text-[11px] tracking-[0.28em] text-black hover:bg-accretion-bright"
          >
            ENTER COMMAND
          </button>
        </form>

        <Link
          to="/"
          className="mt-8 block text-center font-rajdhani text-xs tracking-[0.22em] text-copper hover:text-accretion"
        >
          ← RETURN HOME
        </Link>
      </div>
    </div>
  );
}
