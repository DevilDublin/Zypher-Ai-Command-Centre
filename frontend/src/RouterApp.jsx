import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import ZypherOS from "./pages/ZypherOS";
import DeveloperLogin from "./pages/DeveloperLogin";
import ClientLogin from "./pages/ClientLogin";
import ClientShell from "./client/ClientShell";
import ClientDashboardShell from "./clientDashboard/ClientDashboardShell";
import App from "./App";


export default function RouterApp() {
  const location = useLocation();
  const [veil, setVeil] = useState(false);

  useEffect(() => {
    setVeil(true);
    const t = setTimeout(() => setVeil(false), 550);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>

      <Routes>
        <Route path="/" element={<Navigate to="/developer" replace />} />} />
        <Route path="/client" element={<ClientLogin />} />
          <Route path="/dashboard" element={<ClientShell />} />
          <Route path="/client-dashboard" element={<ClientDashboardShell />} />
        <Route path="/dev" element={<App />} />
        <Route path="/developer" element={<DeveloperLogin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
