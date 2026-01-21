import { useNavigate, useLocation } from "react-router-dom";
import DeveloperLogin from "./DeveloperLogin";
import "./ZypherOS.css";
import NeonNav from "../components/NeonNav";

export default function ZypherOS() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const showLogin = pathname === "/developer";

  
return (
  <>


    <div className="zypher-os">
        <NeonNav />
      <div className="os-noise" />
      <div className="os-vignette" />

      <div className="os-core">
        <div className="os-logo zypher-title">ZYPHER</div>

        <div className="os-actions">
          <button className="os-btn client" onClick={() => nav("/client-login")}>
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
  </>
);

}