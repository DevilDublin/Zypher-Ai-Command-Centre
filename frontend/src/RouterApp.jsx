import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./PublicLayout";

import ZypherOS from "./pages/ZypherOS";
import DeveloperLogin from "./pages/DeveloperLogin";
import App from "./App";
import ClientDashboardShell from "./clientDashboard/ClientDashboardShell";
import ClientLogin from "./pages/ClientLogin";
import About from "./pages/About";
import Architecture from "./pages/Architecture";
import Agents from "./pages/Agents";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";

function RequireClientAuth({ children }) {
  const ok = localStorage.getItem("zy_client_authed") === "1";
  return ok ? children : <Navigate to="/client-login" replace />;
}

export default function RouterApp() {
  return (
    <Routes>

      {/* 🌐 PUBLIC LAYOUT (NeonNav lives here) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ZypherOS />} />
        <Route path="/about" element={<About />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* 🔐 AUTH */}
      <Route path="/developer" element={<DeveloperLogin />} />
      <Route path="/client-login" element={<ClientLogin />} />

      {/* 🔒 PROTECTED */}
      <Route path="/dev" element={<App />} />
      <Route
        path="/dashboard/*"
        element={
          <RequireClientAuth>
            <ClientDashboardShell />
          </RequireClientAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
