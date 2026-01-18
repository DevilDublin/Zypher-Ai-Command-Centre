import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import ZypherOS from "./pages/ZypherOS";
import ClientDashboardShell from "./clientDashboard/ClientDashboardShell";

export default function RouterApp() {
  return (
    <Routes>
      {/* PUBLIC LANDING */}
      <Route path="/" element={<ZypherOS />} />

      {/* DEV */}
      <Route path="/developer" element={<App />} />
      <Route path="/dev" element={<App />} />

      {/* CLIENT */}
      <Route path="/dashboard/*" element={<ClientDashboardShell />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
