import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MobileBarrier from "./components/MobileBarrier";
import Landing from "./pages/Landing";
import Team from "./pages/Team";
import ComingSoonPage from "./pages/ComingSoonPage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import TeamSetup from "./pages/TeamSetup";
import TerminalPage from "./pages/TerminalPage";
import AdminPage from "./pages/AdminPage";

function DesktopOnly() {
  return (
    <MobileBarrier>
      <Outlet />
    </MobileBarrier>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<DesktopOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team-setup" element={<TeamSetup />} />
            <Route path="/terminal" element={<TerminalPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/puzzles" element={<ComingSoonPage pageName="PUZZLES" />} />
            <Route path="/insights" element={<ComingSoonPage pageName="INSIGHTS" />} />
            <Route path="/discord" element={<ComingSoonPage pageName="DISCORD" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
