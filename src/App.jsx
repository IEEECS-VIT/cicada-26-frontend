import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MobileBarrier from "./components/MobileBarrier";
import Landing from "./pages/Landing";
import Team from "./pages/Team";
import ComingSoonPage from "./pages/ComingSoonPage";
import Login from "./pages/Login";
import About from "./pages/About";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import TeamSetup from "./pages/TeamSetup";
import TerminalPage from "./pages/TerminalPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

function AdminDesktopOnly() {
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
          <Route path="/about" element={<About />} />
          <Route path="/puzzles" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/team-setup" element={<TeamSetup />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/team" element={<Team />} />
          <Route path="/insights" element={<ComingSoonPage pageName="INSIGHTS" />} />
          <Route path="/discord" element={<ComingSoonPage pageName="DISCORD" />} />
          <Route element={<AdminDesktopOnly />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin-portal" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
