import { Routes, Route, Navigate } from "react-router-dom";
import ZypherOS from "./pages/ZypherOS";
import App from "./App";
import ClientDashboardShell from "./clientDashboard/ClientDashboardShell";

export default function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<ZypherOS />} />
      <Route path="/developer" element={<App />} />
      <Route path="/dev" element={<App />} />
      <Route path="/dashboard/*" element={<ClientDashboardShell />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
