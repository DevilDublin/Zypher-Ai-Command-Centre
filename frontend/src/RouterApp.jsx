import { Routes, Route, Navigate } from "react-router-dom";
import ZypherOS from "./pages/ZypherOS";
import DeveloperLogin from "./pages/DeveloperLogin";
import App from "./App";
import ClientDashboardShell from "./clientDashboard/ClientDashboardShell";
import ClientLogin from "./pages/ClientLogin";


function RequireClientAuth({ children }) {
  const ok = localStorage.getItem("zy_client_authed") === "1";
  return ok ? children : <Navigate to="/client-login" replace />;
}

export default function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<ZypherOS />} />

      {/* Auth pages */}
      <Route path="/developer" element={<DeveloperLogin />} />
      <Route path="/client-login" element={<ClientLogin />} />

      {/* Protected areas */}
      <Route path="/dev" element={<App />} />
      <Route path="/dashboard/*" element={<RequireClientAuth><ClientDashboardShell /></RequireClientAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
