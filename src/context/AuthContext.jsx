import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMe, logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [teamName, setTeamName] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMe();
      setUser(data.user);
      setTeamName(data.team_name || null);
      setInviteCode(data.invite_code || null);
      return data;
    } catch {
      setUser(null);
      setTeamName(null);
      setInviteCode(null);
      return null;
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
    setInviteCode(null);
  }, []);

  const value = { user, teamName, setTeamName, inviteCode, loading, refresh, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
