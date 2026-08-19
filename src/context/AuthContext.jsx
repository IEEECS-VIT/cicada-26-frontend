import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMe, logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMe();
      setUser(data.user);
      setTeamName(data.team_name || null);
    } catch {
      setUser(null);
      setTeamName(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setTeamName(null);
  }, []);

  const value = { user, teamName, setTeamName, loading, refresh, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
