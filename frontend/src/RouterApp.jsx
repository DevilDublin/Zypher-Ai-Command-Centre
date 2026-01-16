import { Routes, Route, Navigate } from "react-router-dom";
import ZypherOS from "./pages/ZypherOS";
import App from "./App";

export default function RouterApp() {
  return (
    <Routes>
      <Route path="/" element={<ZypherOS />} />
      <Route path="/developer" element={<ZypherOS />} />
      <Route path="/dev" element={<App />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
