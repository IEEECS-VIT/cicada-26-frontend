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

  const setAuthData = useCallback((data) => {
    if (!data) {
      setUser(null);
      setTeamName(null);
      setInviteCode(null);
      setLoading(false);
      return;
    }
    if (data.user) setUser(data.user);
    if (data.team_name !== undefined) setTeamName(data.team_name);
    else if (data.user?.team_name !== undefined) setTeamName(data.user.team_name);
    if (data.invite_code !== undefined) setInviteCode(data.invite_code);
    else if (data.user?.invite_code !== undefined) setInviteCode(data.user.invite_code);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setTeamName(null);
    setInviteCode(null);
  }, []);

  const value = { user, teamName, setTeamName, inviteCode, setInviteCode, loading, refresh, setAuthData, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
