import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import ClientDashboardShell from "./clientDashboard/ClientDashboardShell";

export default function RouterApp() {
  return (
    <Routes>
      {/* Public root */}
      <Route path="/" element={<div />} />

      {/* Dev command centre (auth handled INSIDE App) */}
      <Route path="/developer" element={<App />} />
      <Route path="/dev" element={<App />} />

      {/* Client dashboard */}
      <Route path="/dashboard/*" element={<ClientDashboardShell />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
