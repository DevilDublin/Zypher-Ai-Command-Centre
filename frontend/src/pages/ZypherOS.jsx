import { useNavigate, useLocation } from "react-router-dom";
import DeveloperLogin from "./DeveloperLogin";
import "./zypherOS.css";

export default function ZypherOS() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const showLogin = pathname === "/developer";

  return (
    <div className="zypher-os">
      <div className="os-noise" />
      <div className="os-vignette" />

      <div className="os-core">
        <div className="os-logo">ZYPHER</div>

        <div className="os-actions">
          <button className="os-btn client" disabled>
            CLIENT ACCESS
          </button>

          <button
            className="os-btn dev"
            onClick={() => nav("/developer")}
          >
            DEVELOPER TERMINAL
          </button>
        </div>
      </div>

      {showLogin && (
        <div className="os-overlay">
          <DeveloperLogin />
        </div>
      )}
    </div>
  );
}
