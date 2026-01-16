import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import DeveloperLogin from "./pages/DeveloperLogin";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Developer auth */}
        <Route path="/developer" element={<DeveloperLogin />} />

        {/* Protected dev console */}
        <Route path="/dev" element={<App />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/developer" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
