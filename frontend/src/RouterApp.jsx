import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import ZypherOS from "./pages/ZypherOS";
import ClientDashboardShell from "./clientDashboard/ClientDashboardShell";

export default function RouterApp() {
  return (
    <Routes>
      {/* Main landing */}
      <Route path="/" element={<ZypherOS />} />

      {/* Dev command centre */}
      <Route path="/developer" element={<App />} />
      <Route path="/dev" element={<App />} />

      {/* Client dashboard */}
      <Route path="/dashboard/*" element={<ClientDashboardShell />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
